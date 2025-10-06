#!/usr/bin/env python3

"""
Advanced Mermaid to D2 Converter
Handles complex Mermaid syntax and converts to D2 with better accuracy
"""

import re
import os
import sys
import subprocess
from pathlib import Path
from typing import List, Tuple, Optional

class MermaidToD2Converter:
    def __init__(self):
        self.subgraph_stack = []
        self.node_labels = {}

    def convert_mermaid_to_d2(self, mermaid_code: str) -> str:
        """Convert Mermaid diagram code to D2 syntax"""
        lines = mermaid_code.strip().split('\n')
        d2_lines = []
        in_subgraph = False
        subgraph_indent = 0

        for line in lines:
            line = line.strip()
            if not line or line.startswith('%%'):
                continue

            # Handle flowchart/graph declaration
            if line.startswith(('flowchart', 'graph')):
                direction = self._get_direction(line)
                if direction:
                    d2_lines.append(f'direction: {direction}')
                continue

            # Handle sequence diagrams
            if line.startswith('sequenceDiagram'):
                d2_lines.append('shape: sequence_diagram')
                continue

            # Handle subgraph start
            if line.startswith('subgraph'):
                subgraph_name, subgraph_label = self._parse_subgraph(line)
                indent = '  ' * subgraph_indent
                d2_lines.append(f'{indent}{subgraph_name}: {{')
                if subgraph_label:
                    d2_lines.append(f'{indent}  label: "{subgraph_label}"')
                subgraph_indent += 1
                in_subgraph = True
                continue

            # Handle subgraph end
            if line == 'end' and in_subgraph:
                subgraph_indent -= 1
                indent = '  ' * subgraph_indent
                d2_lines.append(f'{indent}}}')
                if subgraph_indent == 0:
                    in_subgraph = False
                d2_lines.append('')
                continue

            # Handle node definitions
            if '[' in line and ']' in line and '--' not in line and '->' not in line:
                node_def = self._parse_node_definition(line)
                if node_def:
                    indent = '  ' * subgraph_indent
                    d2_lines.append(f'{indent}{node_def}')
                continue

            # Handle connections
            if '-->' in line or '<-->' in line or '---' in line or '-.->' in line:
                connection = self._parse_connection(line, subgraph_indent)
                if connection:
                    indent = '  ' * subgraph_indent
                    d2_lines.append(f'{indent}{connection}')
                continue

            # Handle style definitions
            if line.startswith('style '):
                style_def = self._parse_style(line)
                if style_def:
                    d2_lines.append(style_def)
                continue

            # Handle class definitions
            if line.startswith('class '):
                # D2 doesn't have direct class support, skip for now
                continue

        return '\n'.join(d2_lines)

    def _get_direction(self, line: str) -> Optional[str]:
        """Extract direction from flowchart/graph line"""
        if 'TB' in line or 'TD' in line:
            return 'down'
        elif 'LR' in line:
            return 'right'
        elif 'RL' in line:
            return 'left'
        elif 'BT' in line:
            return 'up'
        return None

    def _parse_subgraph(self, line: str) -> Tuple[str, Optional[str]]:
        """Parse subgraph definition"""
        # subgraph Name["Label"] or subgraph Name
        match = re.match(r'subgraph\s+(\w+)(?:\["([^"]+)"\])?', line)
        if match:
            name = match.group(1).lower()
            label = match.group(2) if match.group(2) else match.group(1)
            return name, label
        return 'group', None

    def _parse_node_definition(self, line: str) -> Optional[str]:
        """Parse node definition with label"""
        # A[Label] or A["Label"] or A(Label) or A{Label}
        match = re.match(r'(\w+)[\[\(\{]"?([^"\]\)\}]+)"?[\]\)\}]', line)
        if match:
            node_id = match.group(1)
            label = match.group(2).strip()
            self.node_labels[node_id] = label

            # Handle special characters in labels
            label = label.replace('"', '\\"')

            return f'{node_id}: "{label}"'
        return None

    def _parse_connection(self, line: str, indent_level: int = 0) -> Optional[str]:
        """Parse connection between nodes"""
        # Handle different arrow types
        arrow_patterns = [
            (r'(\w+)\s*<-->\s*(\w+)', '<->'),  # Bidirectional
            (r'(\w+)\s*-->\|([^|]+)\|\s*(\w+)', '->'),  # Arrow with label
            (r'(\w+)\s*-->>\s*(\w+)', '->'),  # Double arrow
            (r'(\w+)\s*-->\s*(\w+)', '->'),  # Simple arrow
            (r'(\w+)\s*---\s*(\w+)', '--'),  # Line
            (r'(\w+)\s*-\.->\s*(\w+)', '->'),  # Dotted arrow
        ]

        for pattern, arrow in arrow_patterns:
            match = re.match(pattern, line)
            if match:
                if '|' in pattern:  # Has label
                    source = match.group(1)
                    label = match.group(2).strip()
                    target = match.group(3)
                    return f'{source} {arrow} {target}: "{label}"'
                else:
                    source = match.group(1)
                    target = match.group(2)

                    # Check if nodes are in subgraph notation
                    # Format: source -> target or subgraph.source -> subgraph.target
                    return f'{source} {arrow} {target}'

        return None

    def _parse_style(self, line: str) -> Optional[str]:
        """Parse style definition"""
        # style A fill:#color
        match = re.match(r'style\s+(\w+)\s+fill:([#\w]+)', line)
        if match:
            node_id = match.group(1)
            color = match.group(2)
            return f'{node_id}: {{\n  style.fill: "{color}"\n}}'
        return None


def process_markdown_file(file_path: Path, converter: MermaidToD2Converter) -> int:
    """Process a single markdown file and convert Mermaid diagrams"""
    print(f"\n📄 Processing: {file_path}")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all mermaid code blocks
    mermaid_pattern = r'```mermaid\n(.*?)```'
    matches = list(re.finditer(mermaid_pattern, content, re.DOTALL))

    if not matches:
        print("  ⏭️  No Mermaid diagrams found")
        return 0

    print(f"  📊 Found {len(matches)} Mermaid diagram(s)")

    # Create backup
    backup_dir = Path('.temp/mermaid-backup')
    backup_dir.mkdir(parents=True, exist_ok=True)
    backup_path = backup_dir / f"{file_path.name}.backup"
    with open(backup_path, 'w', encoding='utf-8') as f:
        f.write(content)

    # Process each diagram
    file_base = file_path.stem
    new_content = content
    svg_count = 0

    for i, match in enumerate(reversed(matches), 1):  # Reverse to maintain positions
        diagram_index = len(matches) - i + 1
        mermaid_code = match.group(1)
        diagram_name = f"{file_base}-diagram-{diagram_index}"

        print(f"    🔄 Converting diagram {diagram_index}: {diagram_name}")

        # Save original mermaid
        mermaid_dir = Path('examples/d2-source')
        mermaid_dir.mkdir(parents=True, exist_ok=True)
        mermaid_file = mermaid_dir / f"{diagram_name}.mermaid"
        with open(mermaid_file, 'w', encoding='utf-8') as f:
            f.write(mermaid_code)

        # Convert to D2
        try:
            d2_code = converter.convert_mermaid_to_d2(mermaid_code)
            d2_file = mermaid_dir / f"{diagram_name}.d2"
            with open(d2_file, 'w', encoding='utf-8') as f:
                f.write(d2_code)

            # Generate SVG
            svg_dir = Path('public/diagrams')
            svg_dir.mkdir(parents=True, exist_ok=True)
            svg_file = svg_dir / f"{diagram_name}.svg"

            result = subprocess.run(
                ['d2', str(d2_file), str(svg_file)],
                capture_output=True,
                text=True
            )

            if result.returncode == 0:
                print(f"    ✅ Generated SVG: {svg_file}")

                # Extract description from first comment line or use default
                description_match = re.search(r'^#\s*(.+)$', mermaid_code, re.MULTILINE)
                description = description_match.group(1) if description_match else f"Diagram {diagram_index}"

                # Replace mermaid block with image reference
                replacement = f"![{description}](/diagrams/{diagram_name}.svg)"
                new_content = new_content[:match.start()] + replacement + new_content[match.end():]
                svg_count += 1
            else:
                print(f"    ⚠️  D2 conversion failed (manual adjustment needed)")
                print(f"       Error: {result.stderr}")
                # Keep original mermaid block
        except Exception as e:
            print(f"    ❌ Error converting diagram: {e}")
            # Keep original mermaid block

    # Write updated content
    if svg_count > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"  ✅ Updated markdown file ({svg_count}/{len(matches)} diagrams converted)")
    else:
        print(f"  ⚠️  No diagrams converted (keeping original)")

    return svg_count


def main():
    print("╔════════════════════════════════════════════════╗")
    print("║  Advanced Mermaid to D2 Converter             ║")
    print("╔════════════════════════════════════════════════╗\n")

    # Check if D2 is installed
    try:
        result = subprocess.run(['d2', '--version'], capture_output=True, text=True)
        print(f"✅ D2 is installed: {result.stdout.strip()}\n")
    except FileNotFoundError:
        print("❌ D2 is not installed")
        print("Install it with: curl -fsSL https://d2lang.com/install.sh | sh")
        sys.exit(1)

    # Find all markdown files with mermaid diagrams
    content_dir = Path('src/content')
    markdown_files = []

    for md_file in content_dir.rglob('*.md'):
        with open(md_file, 'r', encoding='utf-8') as f:
            if '```mermaid' in f.read():
                markdown_files.append(md_file)

    if not markdown_files:
        print("No files with Mermaid diagrams found")
        return

    print(f"📚 Found {len(markdown_files)} files with Mermaid diagrams\n")

    # Process each file
    converter = MermaidToD2Converter()
    total_converted = 0

    for i, md_file in enumerate(markdown_files, 1):
        print(f"[{i}/{len(markdown_files)}]")
        converted = process_markdown_file(md_file, converter)
        total_converted += converted

    # Summary
    print("\n╔════════════════════════════════════════════════╗")
    print("║           Migration Complete! 🎉               ║")
    print("╔════════════════════════════════════════════════╗\n")

    print(f"📊 Summary:")
    print(f"  • Files processed: {len(markdown_files)}")
    print(f"  • Diagrams converted: {total_converted}")
    print(f"  • D2 source files: examples/d2-source/")
    print(f"  • Generated SVGs: public/diagrams/")
    print(f"  • Backups: .temp/mermaid-backup/")

    print("\n📝 Next Steps:")
    print("  1. Review generated SVGs: ls -la public/diagrams/")
    print("  2. Check D2 conversions: ls -la examples/d2-source/*.d2")
    print("  3. Manually adjust D2 files that need refinement")
    print("  4. Test locally: npm run dev")
    print("  5. Build for production: npm run build")

    print("\n✨ All done!")


if __name__ == '__main__':
    main()

#!/usr/bin/env python3

"""
Automatic Mermaid to SVG Converter
Automatically detects all Mermaid diagrams and generates SVGs using Mermaid CLI
No manual conversion needed!
"""

import re
import os
import sys
import subprocess
from pathlib import Path
from typing import List, Tuple, Optional

class AutoMermaidConverter:
    def __init__(self):
        self.total_diagrams = 0
        self.successful_conversions = 0
        self.failed_conversions = 0

    def check_mermaid_cli(self) -> bool:
        """Check if Mermaid CLI (mmdc) is installed"""
        try:
            result = subprocess.run(['mmdc', '--version'], capture_output=True, text=True)
            return result.returncode == 0
        except FileNotFoundError:
            return False

    def install_mermaid_cli(self) -> bool:
        """Install Mermaid CLI globally"""
        print("📦 Installing @mermaid-js/mermaid-cli...")
        try:
            result = subprocess.run(
                ['npm', 'install', '-g', '@mermaid-js/mermaid-cli'],
                capture_output=True,
                text=True
            )
            return result.returncode == 0
        except Exception as e:
            print(f"❌ Installation failed: {e}")
            return False

    def generate_diagram_name(self, file_path: Path, diagram_index: int) -> str:
        """Generate a unique diagram name from file path and index"""
        base_name = file_path.stem
        return f"{base_name}-diagram-{diagram_index}"

    def extract_description(self, mermaid_code: str, diagram_index: int) -> str:
        """Extract description from Mermaid code or generate default"""
        # Look for comments at the start
        lines = mermaid_code.strip().split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith('#') and not line.startswith('##'):
                description = line.lstrip('#').strip()
                # Skip if it's a diagram type keyword
                if not description.split()[0] in ['flowchart', 'graph', 'sequenceDiagram',
                                                    'classDiagram', 'stateDiagram', 'erDiagram',
                                                    'gantt', 'pie', 'journey', 'gitGraph']:
                    return description

        return f"Diagram {diagram_index}"

    def generate_svg(self, mermaid_code: str, output_path: Path) -> bool:
        """Generate SVG from Mermaid code using Mermaid CLI"""
        # Create temp file for mermaid code
        temp_dir = Path('.temp/mermaid-source')
        temp_dir.mkdir(parents=True, exist_ok=True)

        temp_file = temp_dir / f"{output_path.stem}.mmd"
        with open(temp_file, 'w', encoding='utf-8') as f:
            f.write(mermaid_code)

        # Generate SVG using mmdc
        try:
            result = subprocess.run(
                [
                    'mmdc',
                    '-i', str(temp_file),
                    '-o', str(output_path),
                    '-t', 'default',
                    '-b', 'transparent'
                ],
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode == 0 and output_path.exists():
                return True
            else:
                print(f"       ⚠️  mmdc error: {result.stderr}")
                return False

        except subprocess.TimeoutExpired:
            print(f"       ⚠️  Timeout generating SVG")
            return False
        except Exception as e:
            print(f"       ⚠️  Error: {e}")
            return False

    def process_markdown_file(self, file_path: Path) -> Tuple[int, int]:
        """Process a single markdown file and convert Mermaid diagrams"""
        print(f"\n📄 Processing: {file_path}")

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find all mermaid code blocks
        mermaid_pattern = r'```mermaid\n(.*?)```'
        matches = list(re.finditer(mermaid_pattern, content, re.DOTALL))

        if not matches:
            print("  ⏭️  No Mermaid diagrams found")
            return 0, 0

        print(f"  📊 Found {len(matches)} Mermaid diagram(s)")

        # Create backup
        backup_dir = Path('.temp/mermaid-backup')
        backup_dir.mkdir(parents=True, exist_ok=True)
        backup_path = backup_dir / f"{file_path.name}.backup"
        with open(backup_path, 'w', encoding='utf-8') as f:
            f.write(content)

        # Process each diagram (in reverse to maintain string positions)
        new_content = content
        diagrams_converted = 0
        diagrams_failed = 0

        for i, match in enumerate(reversed(matches), 1):
            diagram_index = len(matches) - i + 1
            mermaid_code = match.group(1).strip()
            diagram_name = self.generate_diagram_name(file_path, diagram_index)

            print(f"    🔄 Diagram {diagram_index}: {diagram_name}")

            # Generate SVG
            svg_dir = Path('public/diagrams')
            svg_dir.mkdir(parents=True, exist_ok=True)
            svg_file = svg_dir / f"{diagram_name}.svg"

            if self.generate_svg(mermaid_code, svg_file):
                file_size = svg_file.stat().st_size
                print(f"       ✅ Generated SVG ({file_size:,} bytes)")

                # Extract description
                description = self.extract_description(mermaid_code, diagram_index)

                # Replace mermaid block with image reference
                replacement = f"![{description}](/diagrams/{diagram_name}.svg)"
                new_content = new_content[:match.start()] + replacement + new_content[match.end():]

                diagrams_converted += 1
                self.successful_conversions += 1
            else:
                print(f"       ❌ Failed to generate SVG")
                print(f"       Keeping original Mermaid diagram")
                diagrams_failed += 1
                self.failed_conversions += 1

        # Write updated content if any diagrams were converted
        if diagrams_converted > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"  ✅ Updated markdown file ({diagrams_converted}/{len(matches)} converted)")
        else:
            print(f"  ⚠️  No diagrams converted")

        return diagrams_converted, diagrams_failed


def main():
    print("╔════════════════════════════════════════════════╗")
    print("║  Automatic Mermaid to SVG Converter           ║")
    print("╔════════════════════════════════════════════════╗\n")

    converter = AutoMermaidConverter()

    # Check Mermaid CLI
    print("🔍 Checking for Mermaid CLI...")
    if not converter.check_mermaid_cli():
        print("⚠️  Mermaid CLI (mmdc) is not installed")
        print("\nInstalling @mermaid-js/mermaid-cli...\n")

        if converter.install_mermaid_cli():
            print("✅ Mermaid CLI installed successfully\n")
        else:
            print("❌ Failed to install Mermaid CLI")
            print("Try manually: npm install -g @mermaid-js/mermaid-cli")
            sys.exit(1)
    else:
        print("✅ Mermaid CLI is available\n")

    # Find all markdown files with mermaid diagrams
    content_dir = Path('src/content')
    markdown_files = []

    print("🔍 Searching for Mermaid diagrams...\n")

    for md_file in content_dir.rglob('*.md'):
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                if '```mermaid' in f.read():
                    markdown_files.append(md_file)
                    # Count diagrams
                    with open(md_file, 'r', encoding='utf-8') as f2:
                        count = f2.read().count('```mermaid')
                        converter.total_diagrams += count
        except Exception as e:
            print(f"⚠️  Error reading {md_file}: {e}")

    if not markdown_files:
        print("No files with Mermaid diagrams found")
        return

    print(f"📚 Found {len(markdown_files)} files with {converter.total_diagrams} Mermaid diagrams\n")

    # Process each file
    for i, md_file in enumerate(markdown_files, 1):
        print(f"[{i}/{len(markdown_files)}]")
        converter.process_markdown_file(md_file)

    # Count generated SVGs
    svg_dir = Path('public/diagrams')
    if svg_dir.exists():
        svg_count = len(list(svg_dir.glob('*.svg')))
    else:
        svg_count = 0

    # Summary
    print("\n╔════════════════════════════════════════════════╗")
    print("║           Conversion Complete! 🎉              ║")
    print("╔════════════════════════════════════════════════╗\n")

    print(f"📊 Summary:")
    print(f"  • Files processed: {len(markdown_files)}")
    print(f"  • Total diagrams found: {converter.total_diagrams}")
    print(f"  • SVGs generated: {converter.successful_conversions}")
    if converter.failed_conversions > 0:
        print(f"  • Failed conversions: {converter.failed_conversions}")
    print(f"  • Total SVG files: {svg_count}")

    print(f"\n📁 Generated files:")
    print(f"  • SVG files: public/diagrams/")
    print(f"  • Mermaid source: .temp/mermaid-source/")
    print(f"  • Markdown backups: .temp/mermaid-backup/")

    print(f"\n📝 Next Steps:")
    print(f"  1. Review generated SVGs: ls -la public/diagrams/")
    print(f"  2. Test locally: npm run dev")
    print(f"  3. Build for production: npm run build")
    print(f"  4. Deploy: git add . && git commit -m 'chore: convert to SVG' && git push")

    if converter.failed_conversions > 0:
        print(f"\n⚠️  {converter.failed_conversions} diagram(s) failed to convert")
        print(f"Check .temp/mermaid-source/ for the original Mermaid code")

    print(f"\n✨ All done!")


if __name__ == '__main__':
    main()

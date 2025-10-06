#!/bin/bash

# Automated Mermaid to D2 SVG Migration Script
# This script extracts Mermaid diagrams, converts to D2, generates SVGs, and updates markdown

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Mermaid to D2 SVG Automated Migration Tool   ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}\n"

# Check if D2 is installed
if ! command -v d2 &> /dev/null; then
    echo -e "${RED}❌ D2 is not installed${NC}"
    echo -e "${YELLOW}Install it with:${NC} curl -fsSL https://d2lang.com/install.sh | sh"
    exit 1
fi

echo -e "${GREEN}✅ D2 is installed: $(d2 --version)${NC}\n"

# Create necessary directories
mkdir -p public/diagrams
mkdir -p examples/d2-source
mkdir -p .temp/mermaid-backup

echo -e "${GREEN}✅ Created directories${NC}\n"

# Function to convert Mermaid syntax to D2 syntax
convert_mermaid_to_d2() {
    local input_file="$1"
    local output_file="$2"

    # Basic conversion rules (this is a simple conversion - may need manual adjustment)
    sed -e 's/flowchart TB/direction: down/g' \
        -e 's/flowchart TD/direction: down/g' \
        -e 's/flowchart LR/direction: right/g' \
        -e 's/graph TB/direction: down/g' \
        -e 's/graph TD/direction: down/g' \
        -e 's/graph LR/direction: right/g' \
        -e 's/-->/-> /g' \
        -e 's/<-->/\<-\>/g' \
        -e 's/---/--/g' \
        "$input_file" > "$output_file"
}

# Function to generate a safe filename from context
generate_diagram_name() {
    local file_path="$1"
    local diagram_index="$2"

    # Extract tutorial/article name from path
    local base_name=$(basename "$file_path" .md)

    # Create diagram name: topic-part-diagram-N
    echo "${base_name}-diagram-${diagram_index}"
}

# Function to process a single markdown file
process_markdown_file() {
    local md_file="$1"
    local file_base=$(basename "$md_file" .md)
    local file_dir=$(dirname "$md_file")

    echo -e "${BLUE}Processing: ${md_file}${NC}"

    # Check if file has mermaid diagrams
    if ! grep -q '```mermaid' "$md_file"; then
        echo -e "${YELLOW}  No Mermaid diagrams found${NC}"
        return
    fi

    # Count diagrams
    local diagram_count=$(grep -c '```mermaid' "$md_file")
    echo -e "${GREEN}  Found ${diagram_count} Mermaid diagram(s)${NC}"

    # Create backup
    cp "$md_file" ".temp/mermaid-backup/$(basename "$md_file").backup"

    # Process each diagram
    local current_diagram=0
    local temp_file="${md_file}.temp"
    local in_mermaid=0
    local mermaid_content=""
    local diagram_name=""

    # Read file line by line
    while IFS= read -r line; do
        if [[ "$line" =~ ^\`\`\`mermaid ]]; then
            # Start of mermaid block
            in_mermaid=1
            current_diagram=$((current_diagram + 1))
            diagram_name=$(generate_diagram_name "$md_file" "$current_diagram")
            mermaid_content=""
            echo -e "${YELLOW}    Extracting diagram ${current_diagram}: ${diagram_name}${NC}"

        elif [[ "$in_mermaid" -eq 1 ]] && [[ "$line" =~ ^\`\`\`$ ]]; then
            # End of mermaid block
            in_mermaid=0

            # Save mermaid content
            local mermaid_file="examples/d2-source/${diagram_name}.mermaid"
            echo "$mermaid_content" > "$mermaid_file"

            # Convert to D2 (basic conversion - may need manual refinement)
            local d2_file="examples/d2-source/${diagram_name}.d2"
            convert_mermaid_to_d2 "$mermaid_file" "$d2_file"

            # Generate SVG
            local svg_file="public/diagrams/${diagram_name}.svg"

            if d2 "$d2_file" "$svg_file" 2>/dev/null; then
                echo -e "${GREEN}    ✅ Generated SVG: ${svg_file}${NC}"

                # Replace mermaid block with image reference
                # Extract description from first line of mermaid or use generic
                local description=$(echo "$mermaid_content" | head -1 | sed 's/^# *//' | sed 's/^[[:space:]]*//')
                if [[ -z "$description" ]] || [[ "$description" =~ ^(flowchart|graph|sequenceDiagram) ]]; then
                    description="Diagram ${current_diagram}"
                fi

                echo "![${description}](/diagrams/${diagram_name}.svg)" >> "$temp_file"
            else
                echo -e "${RED}    ❌ Failed to generate SVG (D2 conversion needs manual adjustment)${NC}"
                echo -e "${YELLOW}    Keeping original Mermaid diagram${NC}"
                # Keep original mermaid block
                echo '```mermaid' >> "$temp_file"
                echo "$mermaid_content" >> "$temp_file"
                echo '```' >> "$temp_file"
            fi

        elif [[ "$in_mermaid" -eq 1 ]]; then
            # Inside mermaid block - accumulate content
            mermaid_content="${mermaid_content}${line}"$'\n'
        else
            # Outside mermaid block - copy line as-is
            echo "$line" >> "$temp_file"
        fi
    done < "$md_file"

    # Replace original file with updated version
    if [[ -f "$temp_file" ]]; then
        mv "$temp_file" "$md_file"
        echo -e "${GREEN}  ✅ Updated markdown file${NC}\n"
    fi
}

# Main execution
echo -e "${BLUE}Starting migration...${NC}\n"

# Find all markdown files with mermaid diagrams
files_with_mermaid=$(grep -r '```mermaid' src/content/ -l 2>/dev/null || true)

if [[ -z "$files_with_mermaid" ]]; then
    echo -e "${YELLOW}No files with Mermaid diagrams found${NC}"
    exit 0
fi

# Count total files
total_files=$(echo "$files_with_mermaid" | wc -l)
echo -e "${BLUE}Found ${total_files} files with Mermaid diagrams${NC}\n"

# Process each file
current_file=0
while IFS= read -r file; do
    current_file=$((current_file + 1))
    echo -e "${BLUE}[${current_file}/${total_files}]${NC}"
    process_markdown_file "$file"
done <<< "$files_with_mermaid"

# Summary
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Migration Complete! 🎉                ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}\n"

echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  • D2 source files: ${GREEN}examples/d2-source/${NC}"
echo -e "  • Generated SVGs: ${GREEN}public/diagrams/${NC}"
echo -e "  • Backups: ${GREEN}.temp/mermaid-backup/${NC}"

echo -e "\n${BLUE}📝 Next Steps:${NC}"
echo -e "  1. Review generated SVGs: ${YELLOW}ls -la public/diagrams/${NC}"
echo -e "  2. Check D2 conversions: ${YELLOW}ls -la examples/d2-source/*.d2${NC}"
echo -e "  3. Manually adjust D2 files that failed conversion"
echo -e "  4. Test locally: ${YELLOW}npm run dev${NC}"
echo -e "  5. Build for production: ${YELLOW}npm run build${NC}"

echo -e "\n${BLUE}🔍 To manually fix failed conversions:${NC}"
echo -e "  1. Edit the .d2 file in examples/d2-source/"
echo -e "  2. Regenerate SVG: ${YELLOW}d2 examples/d2-source/FILE.d2 public/diagrams/FILE.svg${NC}"
echo -e "  3. The markdown file already references the correct SVG path"

echo -e "\n${GREEN}✨ All done!${NC}"

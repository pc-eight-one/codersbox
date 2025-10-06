#!/bin/bash

# Automatic Mermaid to SVG Converter
# Detects all Mermaid diagrams and generates SVGs using Mermaid CLI
# No manual D2 conversion needed!

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Automatic Mermaid to SVG Converter           ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}\n"

# Check if Mermaid CLI is installed
if ! command -v mmdc &> /dev/null; then
    echo -e "${YELLOW}⚠️  Mermaid CLI (mmdc) is not installed${NC}"
    echo -e "${BLUE}Installing @mermaid-js/mermaid-cli...${NC}\n"

    if npm install -g @mermaid-js/mermaid-cli; then
        echo -e "${GREEN}✅ Mermaid CLI installed successfully${NC}\n"
    else
        echo -e "${RED}❌ Failed to install Mermaid CLI${NC}"
        echo -e "${YELLOW}Try manually: npm install -g @mermaid-js/mermaid-cli${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Mermaid CLI is available${NC}\n"

# Create necessary directories
mkdir -p public/diagrams
mkdir -p .temp/mermaid-source
mkdir -p .temp/mermaid-backup

echo -e "${GREEN}✅ Created directories${NC}\n"

# Function to generate a safe filename
generate_diagram_name() {
    local file_path="$1"
    local diagram_index="$2"

    # Extract base name from path
    local base_name=$(basename "$file_path" .md)
    echo "${base_name}-diagram-${diagram_index}"
}

# Function to process a single markdown file
process_markdown_file() {
    local md_file="$1"
    local file_base=$(basename "$md_file" .md)

    echo -e "${BLUE}📄 Processing: ${md_file}${NC}"

    # Check if file has mermaid diagrams
    if ! grep -q '```mermaid' "$md_file"; then
        echo -e "${YELLOW}  ⏭️  No Mermaid diagrams found${NC}"
        return 0
    fi

    # Count diagrams
    local diagram_count=$(grep -c '```mermaid' "$md_file")
    echo -e "${GREEN}  📊 Found ${diagram_count} Mermaid diagram(s)${NC}"

    # Create backup
    cp "$md_file" ".temp/mermaid-backup/$(basename "$md_file").backup"

    # Extract all mermaid diagrams
    local current_diagram=0
    local in_mermaid=0
    local mermaid_content=""
    local temp_file="${md_file}.temp"
    local line_num=0

    # Clear temp file
    > "$temp_file"

    while IFS= read -r line; do
        line_num=$((line_num + 1))

        if [[ "$line" =~ ^\`\`\`mermaid ]]; then
            # Start of mermaid block
            in_mermaid=1
            current_diagram=$((current_diagram + 1))
            mermaid_content=""
            diagram_name=$(generate_diagram_name "$md_file" "$current_diagram")
            echo -e "${YELLOW}    🔄 Diagram ${current_diagram}: ${diagram_name}${NC}"

        elif [[ "$in_mermaid" -eq 1 ]] && [[ "$line" =~ ^\`\`\`$ ]]; then
            # End of mermaid block
            in_mermaid=0

            # Save mermaid content to temp file
            local mermaid_file=".temp/mermaid-source/${diagram_name}.mmd"
            echo "$mermaid_content" > "$mermaid_file"

            # Generate SVG using Mermaid CLI
            local svg_file="public/diagrams/${diagram_name}.svg"

            if mmdc -i "$mermaid_file" -o "$svg_file" -t default -b transparent 2>/dev/null; then
                local file_size=$(wc -c < "$svg_file" 2>/dev/null || echo "0")
                echo -e "${GREEN}       ✅ Generated SVG (${file_size} bytes)${NC}"

                # Extract description from first line or use default
                local description=$(echo "$mermaid_content" | grep -m1 "^#" | sed 's/^# *//' | sed 's/^[[:space:]]*//' || echo "Diagram ${current_diagram}")

                # If description is empty or starts with diagram syntax, use default
                if [[ -z "$description" ]] || [[ "$description" =~ ^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey) ]]; then
                    description="Diagram ${current_diagram}"
                fi

                # Add image reference to temp file
                echo "![${description}](/diagrams/${diagram_name}.svg)" >> "$temp_file"
                echo "" >> "$temp_file"

            else
                echo -e "${RED}       ❌ Failed to generate SVG${NC}"
                echo -e "${YELLOW}       Keeping original Mermaid diagram${NC}"
                # Keep original mermaid block
                echo '```mermaid' >> "$temp_file"
                echo -n "$mermaid_content" >> "$temp_file"
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
echo -e "${BLUE}🔍 Searching for Mermaid diagrams...${NC}\n"

# Find all markdown files with mermaid diagrams
mapfile -t files_with_mermaid < <(grep -r '```mermaid' src/content/ -l 2>/dev/null || true)

if [[ ${#files_with_mermaid[@]} -eq 0 ]]; then
    echo -e "${YELLOW}No files with Mermaid diagrams found${NC}"
    exit 0
fi

total_files=${#files_with_mermaid[@]}
echo -e "${BLUE}📚 Found ${total_files} files with Mermaid diagrams${NC}\n"

# Process each file
current_file=0
total_diagrams=0
successful_diagrams=0

for file in "${files_with_mermaid[@]}"; do
    current_file=$((current_file + 1))
    echo -e "${BLUE}[${current_file}/${total_files}]${NC}"

    # Count diagrams before processing
    file_diagram_count=$(grep -c '```mermaid' "$file")
    total_diagrams=$((total_diagrams + file_diagram_count))

    process_markdown_file "$file"
done

# Count generated SVGs
successful_diagrams=$(ls public/diagrams/*.svg 2>/dev/null | wc -l)

# Summary
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Conversion Complete! 🎉              ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}\n"

echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  • Files processed: ${GREEN}${total_files}${NC}"
echo -e "  • Total diagrams found: ${GREEN}${total_diagrams}${NC}"
echo -e "  • SVGs generated: ${GREEN}${successful_diagrams}${NC}"
echo -e "  • SVG location: ${GREEN}public/diagrams/${NC}"
echo -e "  • Backups: ${GREEN}.temp/mermaid-backup/${NC}"

echo -e "\n${BLUE}📁 Generated files:${NC}"
echo -e "  • SVG files: public/diagrams/*.svg"
echo -e "  • Mermaid source: .temp/mermaid-source/*.mmd"
echo -e "  • Markdown backups: .temp/mermaid-backup/*.backup"

echo -e "\n${BLUE}📝 Next Steps:${NC}"
echo -e "  1. Review generated SVGs: ${YELLOW}ls -la public/diagrams/${NC}"
echo -e "  2. Test locally: ${YELLOW}npm run dev${NC}"
echo -e "  3. Build for production: ${YELLOW}npm run build${NC}"
echo -e "  4. Deploy: ${YELLOW}git add . && git commit -m 'chore: convert to SVG' && git push${NC}"

if [[ $successful_diagrams -lt $total_diagrams ]]; then
    failed=$((total_diagrams - successful_diagrams))
    echo -e "\n${YELLOW}⚠️  ${failed} diagram(s) failed to convert${NC}"
    echo -e "Check .temp/mermaid-source/ for the original Mermaid code"
fi

echo -e "\n${GREEN}✨ All done!${NC}"

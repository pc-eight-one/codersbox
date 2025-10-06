#!/bin/bash

# Regenerate all SVG files from D2 source files
# Useful after manually editing D2 files

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         SVG Regeneration Script               ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}\n"

# Check if D2 is installed
if ! command -v d2 &> /dev/null; then
    echo -e "${RED}❌ D2 is not installed${NC}"
    echo "Install it with: curl -fsSL https://d2lang.com/install.sh | sh"
    exit 1
fi

# Check if there are D2 files
if [ ! -d "examples/d2-source" ] || [ -z "$(ls -A examples/d2-source/*.d2 2>/dev/null)" ]; then
    echo -e "${YELLOW}No D2 files found in examples/d2-source/${NC}"
    echo "Run the conversion script first."
    exit 0
fi

# Create output directory
mkdir -p public/diagrams

# Count D2 files
total_files=$(ls examples/d2-source/*.d2 2>/dev/null | wc -l)
echo -e "${BLUE}Found ${total_files} D2 files to regenerate${NC}\n"

# Regenerate all SVGs
success_count=0
fail_count=0

for d2_file in examples/d2-source/*.d2; do
    if [ -f "$d2_file" ]; then
        filename=$(basename "$d2_file" .d2)
        svg_file="public/diagrams/${filename}.svg"

        echo -e "${BLUE}Generating: ${filename}.svg${NC}"

        if d2 "$d2_file" "$svg_file" 2>/dev/null; then
            file_size=$(wc -c < "$svg_file")
            echo -e "${GREEN}  ✅ Success (${file_size} bytes)${NC}"
            success_count=$((success_count + 1))
        else
            echo -e "${RED}  ❌ Failed - check D2 syntax${NC}"
            fail_count=$((fail_count + 1))
        fi
    fi
done

# Summary
echo -e "\n${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Regeneration Complete! 🎉              ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}\n"

echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  • Total files: ${total_files}"
echo -e "  • ${GREEN}Success: ${success_count}${NC}"
if [ $fail_count -gt 0 ]; then
    echo -e "  • ${RED}Failed: ${fail_count}${NC}"
fi

if [ $fail_count -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️  Some files failed to generate${NC}"
    echo -e "Check the D2 syntax in failed files and run again."
fi

echo -e "\n${BLUE}Generated SVGs are in:${NC} public/diagrams/"
echo -e "\n${GREEN}✨ Done!${NC}"

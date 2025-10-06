#!/bin/bash

# Test script to verify D2 installation and conversion process
# Tests with a single file before running full migration

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Mermaid to SVG Test Script             ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}\n"

# Check D2 installation
echo -e "${BLUE}1. Checking D2 installation...${NC}"
if ! command -v d2 &> /dev/null; then
    echo -e "${RED}❌ D2 is not installed${NC}"
    echo -e "${YELLOW}Install it with:${NC}"
    echo -e "  curl -fsSL https://d2lang.com/install.sh | sh"
    exit 1
fi

echo -e "${GREEN}✅ D2 is installed: $(d2 --version)${NC}\n"

# Check Python3
echo -e "${BLUE}2. Checking Python3...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Python3 not found (optional, bash script will work)${NC}\n"
else
    echo -e "${GREEN}✅ Python3 is installed: $(python3 --version)${NC}\n"
fi

# Create test directories
echo -e "${BLUE}3. Creating test directories...${NC}"
mkdir -p public/diagrams
mkdir -p examples/d2-source
mkdir -p .temp/test
echo -e "${GREEN}✅ Directories created${NC}\n"

# Create a simple test diagram
echo -e "${BLUE}4. Creating test D2 diagram...${NC}"
cat > examples/d2-source/test-diagram.d2 << 'EOF'
# Test Diagram
direction: down

producer: Producer {
  style.fill: "#e3f2fd"
}

kafka: Kafka Cluster {
  style.fill: "#e8f5e8"
}

consumer: Consumer {
  style.fill: "#fff3e0"
}

producer -> kafka: Send Message
kafka -> consumer: Deliver Message
EOF

echo -e "${GREEN}✅ Test D2 file created: examples/d2-source/test-diagram.d2${NC}\n"

# Generate test SVG
echo -e "${BLUE}5. Generating test SVG...${NC}"
if d2 examples/d2-source/test-diagram.d2 public/diagrams/test-diagram.svg 2>/dev/null; then
    echo -e "${GREEN}✅ SVG generated successfully: public/diagrams/test-diagram.svg${NC}\n"
else
    echo -e "${RED}❌ Failed to generate SVG${NC}"
    exit 1
fi

# Check SVG file
if [ -f "public/diagrams/test-diagram.svg" ]; then
    file_size=$(wc -c < public/diagrams/test-diagram.svg)
    echo -e "${GREEN}✅ SVG file exists (${file_size} bytes)${NC}\n"
else
    echo -e "${RED}❌ SVG file not found${NC}"
    exit 1
fi

# Count Mermaid diagrams
echo -e "${BLUE}6. Counting Mermaid diagrams in your content...${NC}"
total_files=$(grep -r '```mermaid' src/content/ -l 2>/dev/null | wc -l)
total_diagrams=$(grep -r '```mermaid' src/content/ 2>/dev/null | wc -l)

echo -e "${YELLOW}📊 Found:${NC}"
echo -e "  • Files with Mermaid: ${GREEN}${total_files}${NC}"
echo -e "  • Total diagrams: ${GREEN}${total_diagrams}${NC}\n"

# Show sample files
if [ "$total_files" -gt 0 ]; then
    echo -e "${BLUE}Sample files with Mermaid diagrams:${NC}"
    grep -r '```mermaid' src/content/ -l 2>/dev/null | head -5 | while read file; do
        diagram_count=$(grep -c '```mermaid' "$file")
        echo -e "  ${GREEN}•${NC} $file (${diagram_count} diagrams)"
    done
    echo ""
fi

# Test summary
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            Test Complete! ✅                   ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}\n"

echo -e "${BLUE}✨ Everything is ready!${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "  ${GREEN}1.${NC} Run full conversion:"
echo -e "     ${BLUE}bash:${NC} ./scripts/convert-mermaid-to-svg.sh"
echo -e "     ${BLUE}python:${NC} python3 scripts/advanced-mermaid-converter.py"
echo -e ""
echo -e "  ${GREEN}2.${NC} Test locally:"
echo -e "     npm run dev"
echo -e ""
echo -e "  ${GREEN}3.${NC} Build for production:"
echo -e "     npm run build"
echo -e ""

echo -e "${YELLOW}Test files created:${NC}"
echo -e "  • examples/d2-source/test-diagram.d2"
echo -e "  • public/diagrams/test-diagram.svg"
echo -e ""

echo -e "${BLUE}View test SVG:${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "  open public/diagrams/test-diagram.svg"
else
    echo -e "  xdg-open public/diagrams/test-diagram.svg"
fi

echo -e "\n${GREEN}🎉 Ready to migrate ${total_diagrams} diagrams!${NC}"

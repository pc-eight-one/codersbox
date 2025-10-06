#!/bin/bash

# Mermaid to D2 Migration Script
# This script helps migrate Mermaid diagrams to D2 diagrams with SVG output

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Mermaid to D2 Migration Tool${NC}\n"

# Check if D2 is installed
if ! command -v d2 &> /dev/null; then
    echo -e "${RED}❌ D2 is not installed${NC}"
    echo "Install it with: curl -fsSL https://d2lang.com/install.sh | sh"
    exit 1
fi

# Create diagrams directory
mkdir -p public/diagrams
echo -e "${GREEN}✅ Created public/diagrams/ directory${NC}\n"

# Find all files with Mermaid diagrams
echo -e "${BLUE}📊 Found Mermaid diagrams in these files:${NC}"
grep -r "^\`\`\`mermaid" src/content/ -l 2>/dev/null || grep -r "\`\`\`mermaid" src/content/ -l || true

echo -e "\n${BLUE}📝 Migration Steps:${NC}"
echo "1. Extract Mermaid diagrams from markdown files"
echo "2. Convert to D2 syntax (manual step - see conversion guide below)"
echo "3. Generate SVG files using D2"
echo "4. Replace Mermaid code blocks with image references"

echo -e "\n${BLUE}🔧 Quick Conversion Reference:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Mermaid                    →  D2"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "graph TD                   →  direction: down"
echo "A --> B                    →  A -> B"
echo "A[Label]                   →  A: Label"
echo "A-->|text| B               →  A -> B: text"
echo "flowchart TB               →  direction: down"
echo "sequenceDiagram            →  shape: sequence_diagram"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "\n${BLUE}📦 Example: Extract and convert a diagram${NC}"
cat << 'EOF'

# Step 1: Extract Mermaid diagram
awk '/```mermaid/,/```/ {if (!/```/) print}' file.md > diagram.mermaid

# Step 2: Convert to D2 (manual - see conversion guide)
# Edit diagram.d2 with D2 syntax

# Step 3: Generate SVG
d2 diagram.d2 public/diagrams/diagram-name.svg

# Step 4: Replace in markdown
# Old:
# ```mermaid
# graph TD
#   A --> B
# ```
#
# New:
# ![Diagram Description](/diagrams/diagram-name.svg)

EOF

echo -e "${GREEN}💡 For detailed conversion examples, see:${NC}"
echo "   - D2 docs: https://d2lang.com/tour/intro"
echo "   - DIAGRAM_ALTERNATIVES.md in your repo"

echo -e "\n${BLUE}🚀 Alternative: Use Excalidraw for complex diagrams${NC}"
echo "   1. Open https://excalidraw.com"
echo "   2. Recreate diagram visually"
echo "   3. Export as SVG to public/diagrams/"
echo "   4. Reference: ![Description](/diagrams/name.svg)"

echo -e "\n${GREEN}✨ Recommended approach for your 122 diagrams:${NC}"
echo "   1. Start with the most critical tutorials (Kafka, Java)"
echo "   2. Use D2 for flowcharts and sequence diagrams"
echo "   3. Use Excalidraw for complex architecture diagrams"
echo "   4. Migrate incrementally, test each one"

# Diagram Alternatives to Mermaid

Since Mermaid diagrams have deployment issues, here are reliable alternatives:

## Option 1: Excalidraw (Recommended) ⭐

**Why Excalidraw:**
- ✅ Beautiful hand-drawn style diagrams
- ✅ Web-based editor (https://excalidraw.com)
- ✅ Export to SVG (works perfectly in Astro)
- ✅ No build-time dependencies
- ✅ Looks professional and modern

**How to use:**
1. Create diagram at https://excalidraw.com
2. Export as SVG
3. Save to `/public/diagrams/your-diagram.svg`
4. Reference in markdown: `![Kafka Architecture](/diagrams/kafka-architecture.svg)`

**Example:**
```markdown
![Kafka Cluster Architecture](/diagrams/kafka-cluster.svg)
```

## Option 2: D2 (Declarative Diagramming)

**Why D2:**
- ✅ Text-to-diagram like Mermaid
- ✅ Better syntax and more features
- ✅ CLI tool generates SVG files
- ✅ Can be pre-rendered locally before deployment

**How to use:**
```bash
# Install D2
curl -fsSL https://d2lang.com/install.sh | sh

# Create diagram
echo "kafka -> zookeeper: metadata
kafka -> disk: write data" > diagram.d2

# Generate SVG
d2 diagram.d2 diagram.svg

# Save to /public/diagrams/
```

**In markdown:**
```markdown
![System Architecture](/diagrams/system-arch.svg)
```

## Option 3: Draw.io / diagrams.net

**Why Draw.io:**
- ✅ Full-featured diagram editor
- ✅ Desktop app or web-based
- ✅ Export to SVG
- ✅ Professional-looking diagrams

**How to use:**
1. Open https://app.diagrams.net
2. Create diagram
3. File → Export as → SVG
4. Save to `/public/diagrams/`
5. Reference in markdown

## Option 4: PlantUML (Pre-rendered)

**Why PlantUML:**
- ✅ Text-based like Mermaid
- ✅ Powerful and mature
- ✅ Can pre-render SVGs locally

**How to use:**
```bash
# Install PlantUML
brew install plantuml  # or download from plantuml.com

# Create diagram
cat > diagram.puml <<EOF
@startuml
actor Producer
database Kafka
actor Consumer

Producer -> Kafka: Send Message
Kafka -> Consumer: Consume Message
@enduml
EOF

# Generate SVG
plantuml -tsvg diagram.puml

# Save to /public/diagrams/
```

## Option 5: Simple SVG Files (Manual)

**Why Manual SVG:**
- ✅ Complete control
- ✅ No dependencies
- ✅ Perfect rendering
- ✅ Can use tools like Figma, Sketch, Inkscape

**Tools:**
- Figma (https://figma.com) - Export to SVG
- Inkscape (free, open-source)
- Adobe Illustrator
- Sketch

## Option 6: ASCII Diagrams

**Why ASCII:**
- ✅ No rendering issues
- ✅ Works everywhere
- ✅ Fast to create
- ✅ Version control friendly

**Example:**
```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Producer   │─────▶│    Kafka    │─────▶│  Consumer   │
│  (Client)   │      │  (Cluster)  │      │  (Client)   │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  ZooKeeper  │
                     │(Coordination)│
                     └─────────────┘
```

## Recommended Workflow

### For Quick Diagrams:
**Use Excalidraw** → Export SVG → Commit to `/public/diagrams/`

### For Complex Technical Diagrams:
**Use Draw.io** → Export SVG → Commit to `/public/diagrams/`

### For Text-Based Diagrams:
**Use D2** → Generate SVG locally → Commit to `/public/diagrams/`

## Implementation

All options follow the same pattern:

1. **Create diagram** (using tool of choice)
2. **Export as SVG**
3. **Save to** `/public/diagrams/your-diagram-name.svg`
4. **Reference in markdown:**
   ```markdown
   ![Description](/diagrams/your-diagram-name.svg)
   ```

## Migration Plan

To migrate your existing Mermaid diagrams:

1. Identify all Mermaid diagrams in your content
2. Choose a tool (recommend: Excalidraw or D2)
3. Recreate diagrams and export as SVG
4. Replace Mermaid code blocks with image references
5. Remove mermaid-init.js script

**Find all Mermaid diagrams:**
```bash
grep -r "```mermaid" src/content/
```

**Replace with SVG:**
```markdown
# Before:
\`\`\`mermaid
flowchart TB
  A --> B
\`\`\`

# After:
![Flowchart](/diagrams/my-flowchart.svg)
```

## Pros & Cons

### Excalidraw
**Pros:** Beautiful, easy, no dependencies
**Cons:** Manual creation, not text-based

### D2
**Pros:** Text-based, powerful, local rendering
**Cons:** Requires CLI tool installation

### Draw.io
**Pros:** Professional, feature-rich
**Cons:** Manual creation, larger files

### PlantUML
**Pros:** Text-based, mature, powerful
**Cons:** Java dependency, complex syntax

### ASCII
**Pros:** Simple, no tools needed
**Cons:** Limited, not visually appealing

## My Recommendation

**For your Kafka tutorials:**

1. **Use Excalidraw** for architecture diagrams
   - Quick to create
   - Looks modern and professional
   - Easy to maintain

2. **Use D2** for sequence/flow diagrams
   - Text-based (easy to version control)
   - Clean syntax
   - Pre-render locally

This gives you the best of both worlds: visual editing for complex diagrams, text-based for simple flows.

## Next Steps

1. Choose your preferred tool
2. Create `/public/diagrams/` directory
3. Migrate one diagram as a test
4. Once satisfied, migrate remaining diagrams
5. Remove Mermaid dependencies and scripts

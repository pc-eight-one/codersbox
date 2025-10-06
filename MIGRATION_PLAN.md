# Mermaid to Static Diagrams Migration Plan

## Current Situation

- **122 Mermaid diagrams** across 36 files
- Mermaid causes deployment issues on Vercel (Playwright dependencies)
- Client-side rendering is unreliable on production

## Recommended Solution: D2

**Why D2:**
✅ Text-based (similar to Mermaid)
✅ Generates static SVG files locally
✅ No runtime dependencies
✅ No deployment issues
✅ Works on all platforms

## Migration Strategy

### Phase 1: Setup (Do Once)
```bash
# 1. Install D2
curl -fsSL https://d2lang.com/install.sh | sh

# 2. Verify installation
d2 --version

# 3. Create diagrams directory (already exists)
mkdir -p public/diagrams
```

### Phase 2: Pilot Migration (1-2 diagrams)

**Test with kafka-concepts-part-1.md (10 diagrams)**

1. Extract first Mermaid diagram:
```bash
awk '/```mermaid/,/```/ {if (!/```/) print}' \
  src/content/tutorials/kafka-concepts/kafka-concepts-part-1.md | \
  head -25 > examples/test-diagram.mermaid
```

2. Convert to D2 (manual - see MERMAID_TO_D2_GUIDE.md)
   - Create `examples/kafka-test.d2`
   - Follow conversion reference

3. Generate SVG:
```bash
d2 examples/kafka-test.d2 public/diagrams/kafka-test.svg
```

4. Test in markdown:
```markdown
![Kafka Architecture](/diagrams/kafka-test.svg)
```

5. Build and verify:
```bash
npm run build
npm run preview
```

### Phase 3: Batch Migration

#### Priority Order:

**1. Kafka Concepts (8 parts, 56 diagrams)**
- Most complex
- Highest value
- Test all patterns

**2. Kafka Java (6 parts, 27 diagrams)**
- Reuse patterns from Kafka Concepts
- Easier with established workflow

**3. Java Complete (17 parts, 24 diagrams)**
- Simpler diagrams
- Quick wins

**4. ANTLR Kotlin (4 parts, 5 diagrams)**
- Smallest set
- Final cleanup

**5. Articles (1 article, 4 diagrams)**
- Single article cleanup

#### Batch Script Template:

```bash
#!/bin/bash
# migrate-kafka-concepts.sh

for part in {1..8}; do
  echo "Processing Kafka Concepts Part $part..."

  # Extract diagrams
  file="src/content/tutorials/kafka-concepts/kafka-concepts-part-${part}.md"

  # Count diagrams in file
  count=$(grep -c "^\`\`\`mermaid" "$file")
  echo "  Found $count diagrams"

  # TODO: Manual conversion to D2
  # TODO: Generate SVGs
  # TODO: Update markdown
done
```

### Phase 4: Automation

Create helper script for conversion:

```bash
#!/bin/bash
# generate-diagrams.sh

# Generate all D2 diagrams to SVG
for d2_file in examples/*.d2; do
  if [ -f "$d2_file" ]; then
    filename=$(basename "$d2_file" .d2)
    echo "Generating $filename.svg..."
    d2 "$d2_file" "public/diagrams/${filename}.svg"
  fi
done

echo "✅ All diagrams generated"
```

## File Organization

```
/home/pc/workshop/sites/
├── examples/                    # D2 source files
│   ├── kafka-architecture.d2
│   ├── broker-responsibilities.d2
│   ├── kafka-replication.d2
│   └── ...
├── public/diagrams/            # Generated SVGs (committed)
│   ├── kafka-architecture.svg
│   ├── broker-responsibilities.svg
│   └── ...
└── scripts/
    ├── migrate-mermaid-to-d2.sh
    └── generate-diagrams.sh    # Batch SVG generation
```

## Diagram Naming Convention

```
{topic}-{concept}-{variant}.d2 → {topic}-{concept}-{variant}.svg

Examples:
kafka-architecture.d2          → kafka-architecture.svg
kafka-broker-internals.d2      → kafka-broker-internals.svg
kafka-replication-flow.d2      → kafka-replication-flow.svg
java-memory-model.d2           → java-memory-model.svg
java-gc-types.d2               → java-gc-types.svg
```

## Conversion Reference Quick Guide

| Mermaid | D2 |
|---------|-----|
| `flowchart TB` | `direction: down` |
| `A --> B` | `A -> B` |
| `A[Label]` | `A: Label` |
| `A-->\|text\| B` | `A -> B: text` |
| `subgraph Name` | `name: { label: "Name" }` |
| `style A fill:#color` | `A: { style.fill: "#color" }` |

See **MERMAID_TO_D2_GUIDE.md** for comprehensive examples.

## Testing Workflow

### Local Testing
```bash
# 1. Generate SVG
d2 examples/test.d2 public/diagrams/test.svg

# 2. Start dev server
npm run dev

# 3. Visit test page with diagram
# http://localhost:4321/tutorials/kafka-concepts/kafka-concepts-part-1
```

### Production Testing
```bash
# 1. Build
npm run build

# 2. Preview
npm run preview

# 3. Verify diagrams render
# http://localhost:4321/tutorials/kafka-concepts/kafka-concepts-part-1
```

### Deploy
```bash
# Commit SVGs and updated markdown
git add examples/*.d2 public/diagrams/*.svg src/content/
git commit -m "chore: migrate Mermaid diagrams to D2 static SVGs"
git push

# Vercel will deploy automatically
# No Playwright dependency issues!
```

## Migration Checklist

### Initial Setup
- [ ] Install D2 CLI (`curl -fsSL https://d2lang.com/install.sh | sh`)
- [ ] Create `public/diagrams/` directory (already exists)
- [ ] Review MERMAID_TO_D2_GUIDE.md

### Pilot Phase
- [ ] Extract 1 Mermaid diagram
- [ ] Convert to D2 syntax
- [ ] Generate SVG
- [ ] Update markdown
- [ ] Test locally
- [ ] Test production build
- [ ] Deploy and verify

### Batch Migration
- [ ] Kafka Concepts (8 parts, 56 diagrams)
- [ ] Kafka Java (6 parts, 27 diagrams)
- [ ] Java Complete (17 parts, 24 diagrams)
- [ ] ANTLR Kotlin (4 parts, 5 diagrams)
- [ ] Articles (1 article, 4 diagrams)

### Cleanup
- [ ] Remove all Mermaid code blocks
- [ ] Verify all SVGs render correctly
- [ ] Update DIAGRAM_ALTERNATIVES.md with chosen solution
- [ ] Document lessons learned

## Estimated Time

- **Setup:** 10 minutes
- **Pilot (2 diagrams):** 30 minutes
- **Pattern development:** 1 hour
- **Kafka Concepts:** 4-6 hours (56 diagrams)
- **Kafka Java:** 2-3 hours (27 diagrams)
- **Java Complete:** 2 hours (24 diagrams)
- **ANTLR + Articles:** 1 hour (9 diagrams)
- **Testing & deployment:** 1 hour

**Total:** ~12-15 hours of focused work

## Alternative: Excalidraw for Complex Diagrams

For diagrams that are too complex or need visual precision:

1. Open https://excalidraw.com
2. Recreate diagram visually (drag & drop)
3. Export as SVG
4. Save to `public/diagrams/`
5. Reference in markdown

**Pros:**
- Beautiful hand-drawn style
- Intuitive visual editor
- No syntax to learn

**Cons:**
- Not text-based
- Manual creation

**Best for:**
- Complex architecture diagrams
- Diagrams needing precise layout
- Visual/non-technical diagrams

## Success Criteria

✅ All 122 diagrams converted to static SVGs
✅ No Mermaid code blocks in content
✅ All diagrams render on production
✅ No Playwright/build dependencies
✅ Fast page loads (SVGs are static)
✅ SEO-friendly (diagrams in HTML)

## Next Steps

1. **Install D2:** `curl -fsSL https://d2lang.com/install.sh | sh`
2. **Run pilot:** Convert 1-2 Kafka diagrams
3. **Validate approach:** Build, deploy, verify
4. **Scale:** Batch process remaining diagrams
5. **Deploy:** Push to production with confidence

---

**No more Mermaid rendering issues on production!** 🎉

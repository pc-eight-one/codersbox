# Mermaid to SVG Conversion Scripts

This directory contains automated scripts to convert Mermaid diagrams to static SVG files.

## Quick Start

See **[QUICK_START_CONVERSION.md](../QUICK_START_CONVERSION.md)** for step-by-step instructions.

## Prerequisites

Install D2 CLI tool:

```bash
curl -fsSL https://d2lang.com/install.sh | sh
```

Verify installation:

```bash
d2 --version
```

## ⚡ Automatic Conversion (RECOMMENDED)

### Auto Mermaid to SVG Converter ⭐ **NEW!**

**Fully automated** - Just run and go!

```bash
# Python (recommended)
python3 scripts/auto-mermaid-to-svg.py

# OR Bash
./scripts/auto-mermaid-to-svg.sh
```

**Features:**
- ✅ **Automatically installs Mermaid CLI** if needed
- ✅ **Detects all Mermaid diagrams** automatically (122 diagrams!)
- ✅ **Generates perfect SVGs** using official Mermaid renderer
- ✅ **Updates markdown files** with image references
- ✅ **Creates backups** for safety
- ✅ **No manual conversion** needed!

**See [AUTO_CONVERT_README.md](../AUTO_CONVERT_README.md) for details**

---

## Manual Conversion Scripts

### 1. Test Script

```bash
./scripts/test-conversion.sh
```

**Purpose:** Verify D2 installation and test the conversion process

**What it does:**
- ✅ Checks D2 installation
- ✅ Creates a test diagram
- ✅ Generates a test SVG
- ✅ Counts your Mermaid diagrams
- ✅ Verifies system is ready

### 2. D2 Conversion Scripts (Manual)

#### Option A: Bash Script (Simpler)

```bash
./scripts/convert-mermaid-to-svg.sh
```

**Features:**
- ✅ Extracts Mermaid diagrams from markdown files
- ✅ Basic Mermaid to D2 conversion
- ✅ Generates SVG files in `public/diagrams/`
- ✅ Updates markdown files with image references
- ✅ Creates backups in `.temp/mermaid-backup/`

**Best for:** Quick conversion of simple diagrams

#### Option B: Python Script (Advanced) - RECOMMENDED

```bash
python3 scripts/advanced-mermaid-converter.py
```

**Features:**
- ✅ Advanced Mermaid to D2 syntax conversion
- ✅ Handles subgraphs, styles, and complex diagrams
- ✅ Better node label parsing
- ✅ Connection label support
- ✅ Bidirectional arrows
- ✅ Detailed error reporting

**Best for:** Complex diagrams with subgraphs and styling

### 3. Regenerate Script

```bash
./scripts/regenerate-svgs.sh
```

**Purpose:** Regenerate all SVG files after manually editing D2 files

**Use when:**
- You've manually edited D2 files in `examples/d2-source/`
- You want to update SVGs with a different D2 theme
- You need to rebuild all diagrams

## What These Scripts Do

1. **Find** all markdown files in `src/content/` with Mermaid diagrams
2. **Extract** each Mermaid diagram and save to `examples/d2-source/`
3. **Convert** Mermaid syntax to D2 syntax
4. **Generate** SVG files using D2 CLI
5. **Update** markdown files to reference the new SVG images
6. **Backup** original markdown files to `.temp/mermaid-backup/`

## Directory Structure After Running

```
/home/pc/workshop/sites/
├── public/diagrams/              # ✨ Generated SVG files (deployed)
│   ├── kafka-concepts-part-1-diagram-1.svg
│   ├── kafka-concepts-part-1-diagram-2.svg
│   └── ...
├── examples/d2-source/           # 📝 D2 source files (editable)
│   ├── kafka-concepts-part-1-diagram-1.d2
│   ├── kafka-concepts-part-1-diagram-1.mermaid (original)
│   └── ...
└── .temp/mermaid-backup/         # 💾 Backup of original markdown
    ├── kafka-concepts-part-1.md.backup
    └── ...
```

## After Running the Script

### 1. Review Generated SVGs

```bash
# List all generated SVGs
ls -la public/diagrams/

# View an SVG in browser
open public/diagrams/kafka-concepts-part-1-diagram-1.svg
```

### 2. Check D2 Source Files

```bash
# List D2 source files
ls -la examples/d2-source/*.d2

# Review a D2 file
cat examples/d2-source/kafka-concepts-part-1-diagram-1.d2
```

### 3. Manually Adjust Failed Conversions

Some complex Mermaid diagrams may need manual adjustment:

```bash
# Edit the D2 file
nano examples/d2-source/kafka-concepts-part-1-diagram-1.d2

# Regenerate SVG
d2 examples/d2-source/kafka-concepts-part-1-diagram-1.d2 \
   public/diagrams/kafka-concepts-part-1-diagram-1.svg

# The markdown file already references the correct SVG path!
```

### 4. Test Locally

```bash
# Start dev server
npm run dev

# Visit http://localhost:4321/tutorials/kafka-concepts/kafka-concepts-part-1
# Check if diagrams render correctly
```

### 5. Build for Production

```bash
# Build
npm run build

# Preview
npm run preview

# Visit http://localhost:4321 and verify all diagrams
```

### 6. Deploy

```bash
# Commit changes
git add public/diagrams/ examples/d2-source/ src/content/
git commit -m "chore: convert Mermaid diagrams to static SVGs"

# Push to deploy
git push
```

## Manual D2 Regeneration

If you need to manually edit and regenerate a specific diagram:

```bash
# Edit D2 file
nano examples/d2-source/DIAGRAM_NAME.d2

# Regenerate specific SVG
d2 examples/d2-source/DIAGRAM_NAME.d2 public/diagrams/DIAGRAM_NAME.svg

# Or regenerate all diagrams
for d2file in examples/d2-source/*.d2; do
  filename=$(basename "$d2file" .d2)
  d2 "$d2file" "public/diagrams/${filename}.svg"
  echo "✅ Generated ${filename}.svg"
done
```

## D2 Themes

Generate SVGs with different themes:

```bash
# Default theme
d2 diagram.d2 output.svg

# Cool classics
d2 --theme=200 diagram.d2 output.svg

# Terminal
d2 --theme=300 diagram.d2 output.svg

# List all themes
d2 themes
```

## Troubleshooting

### Script shows "D2 is not installed"

```bash
curl -fsSL https://d2lang.com/install.sh | sh
```

### SVG not rendering in browser

Check the image path in markdown:

```markdown
# ✅ Correct (starts with /)
![Diagram](/diagrams/kafka-architecture.svg)

# ❌ Wrong (missing /)
![Diagram](diagrams/kafka-architecture.svg)
```

### D2 conversion failed

Edit the D2 file manually and regenerate:

```bash
# Check error
d2 --debug examples/d2-source/FILE.d2 public/diagrams/FILE.svg

# Edit file
nano examples/d2-source/FILE.d2

# Try again
d2 examples/d2-source/FILE.d2 public/diagrams/FILE.svg
```

## Restoring from Backup

If you need to restore original markdown files:

```bash
# Restore a specific file
cp .temp/mermaid-backup/kafka-concepts-part-1.md.backup \
   src/content/tutorials/kafka-concepts/kafka-concepts-part-1.md

# Restore all files
for backup in .temp/mermaid-backup/*.backup; do
  original="${backup%.backup}"
  filename=$(basename "$original")
  # Find and restore to correct location
  find src/content -name "$filename" -exec cp "$backup" {} \;
done
```

## Summary

**Quick Start:**

```bash
# 1. Install D2
curl -fsSL https://d2lang.com/install.sh | sh

# 2. Run converter (choose one)
./scripts/convert-mermaid-to-svg.sh           # Simple
python3 scripts/advanced-mermaid-converter.py # Advanced

# 3. Test
npm run dev

# 4. Build
npm run build

# 5. Deploy
git add . && git commit -m "chore: migrate to static SVGs" && git push
```

## Benefits of Static SVGs

✅ No runtime JavaScript dependencies
✅ No Playwright build dependencies
✅ Works on all deployment platforms (Vercel, Netlify, etc.)
✅ Faster page loads (no client-side rendering)
✅ Better SEO (diagrams in HTML)
✅ Reliable rendering across all browsers
✅ No CDN dependencies

🎉 **No more Mermaid rendering issues!**

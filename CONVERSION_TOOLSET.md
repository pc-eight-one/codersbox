# Mermaid to SVG Conversion Toolset

Complete automated solution for converting your 122 Mermaid diagrams to static SVG files.

## 📦 What's Included

### 🚀 Quick Start Guide
- **QUICK_START_CONVERSION.md** - Step-by-step guide (25-30 minutes total)

### 🔧 Conversion Scripts

1. **scripts/test-conversion.sh** ⭐ **Run this first!**
   - Tests D2 installation
   - Creates sample diagram
   - Verifies everything works
   - Counts your diagrams

2. **scripts/convert-mermaid-to-svg.sh**
   - Bash script for simple conversion
   - Automated extraction and conversion
   - Updates markdown files
   - Creates backups

3. **scripts/advanced-mermaid-converter.py** ⭐ **Recommended**
   - Advanced Python converter
   - Better syntax handling
   - Handles complex diagrams
   - Subgraph support

4. **scripts/regenerate-svgs.sh**
   - Regenerates all SVGs from D2 source
   - Use after editing D2 files
   - Batch processing

### 📚 Documentation

1. **MERMAID_TO_D2_GUIDE.md**
   - Complete conversion reference
   - Syntax mapping
   - Examples for all diagram types
   - Common patterns
   - Troubleshooting

2. **MIGRATION_PLAN.md**
   - Detailed migration strategy
   - Phase-by-phase approach
   - File organization
   - Testing workflow
   - Time estimates

3. **DIAGRAM_ALTERNATIVES.md**
   - Comparison of diagram tools
   - Excalidraw guide
   - D2 overview
   - PlantUML, Draw.io, etc.

4. **scripts/README.md**
   - Script documentation
   - Usage instructions
   - Examples

### 🎨 Example Files

1. **examples/kafka-architecture.d2**
   - Converted Kafka architecture diagram
   - Shows subgraphs and styling

2. **examples/broker-responsibilities.d2**
   - Broker internals diagram
   - Shows complex connections

## 🎯 Quick Start (3 Commands)

```bash
# 1. Install D2
curl -fsSL https://d2lang.com/install.sh | sh

# 2. Test (verify setup)
./scripts/test-conversion.sh

# 3. Convert all diagrams
python3 scripts/advanced-mermaid-converter.py
```

## 📊 Your Statistics

- **Total Mermaid diagrams:** 122
- **Files affected:** 36
- **Diagram breakdown:**
  - Kafka Concepts: 56 diagrams (8 parts)
  - Kafka Java: 27 diagrams (6 parts)
  - Java Complete: 24 diagrams (17 parts)
  - ANTLR Kotlin: 5 diagrams (4 parts)
  - Articles: 4 diagrams (1 file)

## 🗂️ Directory Structure After Conversion

```
/home/pc/workshop/sites/
├── public/diagrams/                    # ✨ Generated SVGs (deployed)
│   ├── kafka-concepts-part-1-diagram-1.svg
│   ├── kafka-concepts-part-1-diagram-2.svg
│   ├── kafka-java-part-1-diagram-1.svg
│   └── ... (122 total)
│
├── examples/d2-source/                 # 📝 D2 source files (editable)
│   ├── kafka-concepts-part-1-diagram-1.d2
│   ├── kafka-concepts-part-1-diagram-1.mermaid (backup)
│   ├── kafka-architecture.d2 (example)
│   └── broker-responsibilities.d2 (example)
│
├── .temp/mermaid-backup/               # 💾 Original markdown backups
│   ├── kafka-concepts-part-1.md.backup
│   └── ...
│
├── scripts/                            # 🔧 Conversion scripts
│   ├── test-conversion.sh ⭐
│   ├── convert-mermaid-to-svg.sh
│   ├── advanced-mermaid-converter.py ⭐
│   ├── regenerate-svgs.sh
│   ├── migrate-mermaid-to-d2.sh
│   └── README.md
│
└── Documentation
    ├── QUICK_START_CONVERSION.md ⭐
    ├── MERMAID_TO_D2_GUIDE.md
    ├── MIGRATION_PLAN.md
    ├── DIAGRAM_ALTERNATIVES.md
    └── CONVERSION_TOOLSET.md (this file)
```

## 🔄 Workflow

### Initial Conversion

```bash
# 1. Install D2
curl -fsSL https://d2lang.com/install.sh | sh

# 2. Test
./scripts/test-conversion.sh

# 3. Convert (choose one)
./scripts/convert-mermaid-to-svg.sh              # Simple
python3 scripts/advanced-mermaid-converter.py    # Advanced ⭐

# 4. Review
ls -la public/diagrams/

# 5. Test locally
npm run dev

# 6. Build
npm run build

# 7. Deploy
git add . && git commit -m "chore: migrate to SVG diagrams" && git push
```

### Editing Diagrams Later

```bash
# 1. Edit D2 file
nano examples/d2-source/kafka-concepts-part-1-diagram-1.d2

# 2. Regenerate specific SVG
d2 examples/d2-source/kafka-concepts-part-1-diagram-1.d2 \
   public/diagrams/kafka-concepts-part-1-diagram-1.svg

# OR regenerate all SVGs
./scripts/regenerate-svgs.sh

# 3. Test
npm run dev

# 4. Deploy
git add . && git commit -m "update: improve diagram" && git push
```

## ✅ Checklist

### Setup Phase
- [ ] Read QUICK_START_CONVERSION.md
- [ ] Install D2 CLI
- [ ] Run test-conversion.sh
- [ ] Verify test passes

### Conversion Phase
- [ ] Run advanced-mermaid-converter.py
- [ ] Review generated SVGs (public/diagrams/)
- [ ] Check D2 source files (examples/d2-source/)
- [ ] Note any failed conversions

### Manual Fix Phase (if needed)
- [ ] Edit failed D2 files
- [ ] Regenerate SVGs
- [ ] Verify results

### Testing Phase
- [ ] Test locally (npm run dev)
- [ ] Check all tutorial pages
- [ ] Verify diagrams render correctly
- [ ] Build for production (npm run build)
- [ ] Preview build (npm run preview)

### Deployment Phase
- [ ] Commit changes (SVGs + markdown)
- [ ] Push to GitHub
- [ ] Verify Vercel deployment
- [ ] Check production site
- [ ] Verify no 404 errors

### Cleanup Phase
- [ ] Remove old backups (optional)
- [ ] Update documentation (optional)
- [ ] Celebrate! 🎉

## 🆘 Getting Help

### Quick Reference
1. **Conversion syntax:** See MERMAID_TO_D2_GUIDE.md
2. **Script usage:** See scripts/README.md
3. **Migration strategy:** See MIGRATION_PLAN.md
4. **Quick start:** See QUICK_START_CONVERSION.md

### Common Issues

**"D2 is not installed"**
```bash
curl -fsSL https://d2lang.com/install.sh | sh
source ~/.bashrc  # Reload shell
```

**"Permission denied"**
```bash
chmod +x scripts/*.sh
```

**"SVG not rendering"**
- Check image path starts with `/` → `![Diagram](/diagrams/name.svg)`
- Verify SVG exists → `ls public/diagrams/name.svg`

**"D2 conversion failed"**
- Edit D2 file → See MERMAID_TO_D2_GUIDE.md
- Regenerate → `d2 file.d2 output.svg`

## 📈 Benefits After Migration

### Before (Mermaid)
❌ Client-side rendering issues
❌ Playwright build dependencies
❌ Deployment failures on Vercel
❌ CDN loading failures
❌ Inconsistent rendering

### After (Static SVGs)
✅ Reliable rendering everywhere
✅ No build dependencies
✅ Works on all platforms
✅ Faster page loads
✅ Better SEO
✅ No JavaScript required
✅ Version controlled diagrams

## 🎓 Learning Resources

- **D2 Documentation:** https://d2lang.com/tour/intro
- **D2 Playground:** https://play.d2lang.com
- **D2 Examples:** https://d2lang.com/tour/examples
- **Excalidraw (alternative):** https://excalidraw.com

## 📊 Time Estimates

| Task | Time |
|------|------|
| Install D2 | 2 min |
| Run test | 2 min |
| Run conversion | 5-10 min |
| Review results | 5 min |
| Fix failed conversions | 10-30 min |
| Test locally | 5 min |
| Build & deploy | 5 min |
| **Total** | **35-60 min** |

## 🎉 Success Criteria

- ✅ All 122 diagrams converted to SVG
- ✅ No Mermaid code blocks in markdown
- ✅ All diagrams render on production
- ✅ No 404 errors in browser console
- ✅ Fast page loads
- ✅ Vercel builds successfully

## 🚀 Ready to Start?

```bash
# Open the quick start guide
cat QUICK_START_CONVERSION.md

# Or just run:
./scripts/test-conversion.sh
```

**Good luck!** 🎉

---

*Created with Claude Code - Your AI-powered development assistant*

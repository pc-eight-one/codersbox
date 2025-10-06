# Quick Start: Convert Mermaid Diagrams to SVG

This guide will help you convert all 122 Mermaid diagrams to static SVG files in minutes.

## Prerequisites (5 minutes)

### 1. Install D2

```bash
curl -fsSL https://d2lang.com/install.sh | sh
```

### 2. Verify Installation

```bash
d2 --version
```

You should see output like: `v0.6.x`

## Test First (2 minutes)

Run the test script to verify everything works:

```bash
./scripts/test-conversion.sh
```

This will:
- ✅ Check D2 installation
- ✅ Create a test diagram
- ✅ Generate a test SVG
- ✅ Count your Mermaid diagrams
- ✅ Verify everything is ready

## Run Conversion (5-10 minutes)

Choose one of these methods:

### Option A: Bash Script (Simple)

```bash
./scripts/convert-mermaid-to-svg.sh
```

**Best for:** Quick conversion with basic syntax handling

### Option B: Python Script (Advanced) - RECOMMENDED

```bash
python3 scripts/advanced-mermaid-converter.py
```

**Best for:** Better conversion accuracy with complex diagrams

## What Happens?

The script will:

1. **Find** all 36 markdown files with Mermaid diagrams
2. **Extract** each of the 122 diagrams
3. **Convert** Mermaid syntax to D2 syntax
4. **Generate** SVG files in `public/diagrams/`
5. **Update** markdown files to use `![Description](/diagrams/name.svg)`
6. **Backup** original files to `.temp/mermaid-backup/`

## Review Results (5 minutes)

### 1. Check Generated SVGs

```bash
# List all SVGs
ls -la public/diagrams/

# Count generated files
ls public/diagrams/*.svg | wc -l
```

You should see 122 SVG files (or close to it).

### 2. View a Diagram

```bash
# macOS
open public/diagrams/kafka-concepts-part-1-diagram-1.svg

# Linux
xdg-open public/diagrams/kafka-concepts-part-1-diagram-1.svg
```

### 3. Check D2 Source Files

```bash
# List D2 files
ls -la examples/d2-source/*.d2

# View a D2 file
cat examples/d2-source/kafka-concepts-part-1-diagram-1.d2
```

## Test Locally (5 minutes)

### 1. Start Dev Server

```bash
npm run dev
```

### 2. Visit Your Tutorials

Open in browser:
- http://localhost:4321/tutorials/kafka-concepts/kafka-concepts-part-1
- http://localhost:4321/tutorials/java-complete/java-complete-part-1

### 3. Verify Diagrams Render

Check that diagrams display correctly.

## Fix Any Failed Conversions (Optional)

Some complex diagrams may need manual adjustment:

### 1. Identify Failed Conversions

The script will report which diagrams failed. Look for output like:

```
⚠️  D2 conversion failed (manual adjustment needed)
```

### 2. Edit D2 File

```bash
nano examples/d2-source/DIAGRAM_NAME.d2
```

See `MERMAID_TO_D2_GUIDE.md` for conversion reference.

### 3. Regenerate SVG

```bash
d2 examples/d2-source/DIAGRAM_NAME.d2 public/diagrams/DIAGRAM_NAME.svg
```

### 4. Verify

```bash
npm run dev
# Check the page with that diagram
```

## Build for Production (2 minutes)

```bash
# Build
npm run build

# Preview
npm run preview
```

Visit http://localhost:4321 and verify everything works.

## Deploy (2 minutes)

```bash
# Add files
git add public/diagrams/ examples/d2-source/ src/content/

# Commit
git commit -m "chore: migrate all Mermaid diagrams to static SVGs

- Convert 122 Mermaid diagrams to D2 and generate static SVGs
- Update markdown files to reference SVG images
- Remove dependency on client-side Mermaid rendering
- Fixes production rendering issues on Vercel

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push
git push
```

Vercel will automatically deploy!

## Verify Production (2 minutes)

Once deployed:

1. Visit https://www.codersbox.dev/tutorials/kafka-concepts/kafka-concepts-part-1
2. Check diagrams render correctly
3. Open browser DevTools → Network tab
4. Verify no 404 errors
5. Verify diagrams load as SVG files

## Cleanup (Optional)

### Remove Old Mermaid Script

The client-side Mermaid script is still in your layout. You can remove it:

```bash
# Already removed in BaseLayout.astro line 166
# If it's still there:
# Remove: <script is:inline src="/scripts/mermaid-init.js"></script>
```

### Remove Backup Files

After confirming everything works:

```bash
rm -rf .temp/mermaid-backup/
```

## Summary Checklist

- [ ] Install D2 CLI
- [ ] Run test script
- [ ] Run conversion script (bash or python)
- [ ] Review generated SVGs
- [ ] Test locally (`npm run dev`)
- [ ] Fix any failed conversions (if needed)
- [ ] Build for production (`npm run build`)
- [ ] Deploy to production
- [ ] Verify on production site
- [ ] Remove backups (optional)

## Estimated Total Time

- **Setup:** 5 minutes
- **Conversion:** 5-10 minutes (automated)
- **Review & Test:** 10 minutes
- **Deploy:** 5 minutes

**Total:** ~25-30 minutes

## Troubleshooting

### "D2 is not installed"

```bash
curl -fsSL https://d2lang.com/install.sh | sh
source ~/.bashrc  # or ~/.zshrc
```

### "Permission denied" when running scripts

```bash
chmod +x scripts/*.sh
```

### SVG not rendering

Check markdown image path:

```markdown
# ✅ Correct
![Diagram](/diagrams/name.svg)

# ❌ Wrong
![Diagram](diagrams/name.svg)
```

### D2 conversion failed

Edit the D2 file manually:

```bash
nano examples/d2-source/FILE.d2
d2 examples/d2-source/FILE.d2 public/diagrams/FILE.svg
```

See `MERMAID_TO_D2_GUIDE.md` for syntax reference.

## Help

For detailed information:
- **Conversion reference:** `MERMAID_TO_D2_GUIDE.md`
- **Migration plan:** `MIGRATION_PLAN.md`
- **Script documentation:** `scripts/README.md`
- **D2 documentation:** https://d2lang.com/tour/intro

## Benefits After Migration

✅ **No more rendering issues** - Static SVGs work everywhere
✅ **Faster page loads** - No client-side JavaScript needed
✅ **Better SEO** - Diagrams in HTML from the start
✅ **Works on Vercel** - No Playwright dependencies
✅ **Reliable** - No CDN failures or version issues
✅ **Maintainable** - Edit D2 files and regenerate SVGs

🎉 **Enjoy your reliable diagram rendering!**

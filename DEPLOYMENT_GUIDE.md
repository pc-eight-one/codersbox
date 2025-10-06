# Vercel Deployment Guide for rehype-mermaid

## Issue Summary

Tutorial content was not displaying on production (codersbox.dev) because Vercel was building without Playwright, which is required by rehype-mermaid to render Mermaid diagrams at build time.

## Root Cause

The `rehype-mermaid` plugin uses Playwright's headless browser to render Mermaid diagrams as SVG during the build process. Vercel's default build environment doesn't include Playwright browsers, causing the build to fail silently and produce empty content.

## Solution

Created `vercel.json` configuration to:
1. Install Playwright browsers before building
2. Use `--legacy-peer-deps` to handle dependency conflicts
3. Specify Node.js version requirements

## Files Changed

### 1. `vercel.json` (new file)
```json
{
  "buildCommand": "npx playwright install --with-deps chromium && npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "astro",
  "outputDirectory": "dist"
}
```

### 2. `package.json` (modified)
Added Node.js engine specification:
```json
"engines": {
  "node": ">=18.0.0"
}
```

## Deployment Steps

### Push to Deploy

```bash
git push origin main
```

This will trigger Vercel to:
1. Install dependencies with `--legacy-peer-deps`
2. Install Playwright Chromium browser
3. Build the site with rehype-mermaid rendering Mermaid diagrams as SVG
4. Deploy the new build

### Monitor Deployment

1. Go to [Vercel Dashboard](https://vercel.com)
2. Find your `codersbox` project
3. Click on the latest deployment
4. Check the "Building" tab for logs
5. Look for:
   - ✅ `playwright install chromium` success
   - ✅ `npm run build` completing with ~66 pages built
   - ✅ No errors about missing Playwright

### Expected Build Time

- Normal build: ~30 seconds
- First build with Playwright: ~2-3 minutes (downloads browser ~100MB)
- Subsequent builds: ~30-60 seconds (Playwright cached)

## Verifying the Fix

After deployment completes:

1. Visit: https://www.codersbox.dev/tutorials/java-complete/java-complete-part-2
2. Check that tutorial content is visible
3. Check that Mermaid diagrams render as SVG (not code blocks)
4. Verify no console errors (no more 404 for mermaid-init.js)

## Troubleshooting

### If content is still empty:

1. **Check Build Logs**
   - Look for "rehype-mermaid" errors
   - Check if Playwright installation succeeded

2. **Clear Vercel Cache**
   ```bash
   # In Vercel Dashboard:
   # Settings → General → Clear Build Cache
   ```

3. **Trigger Fresh Deploy**
   ```bash
   git commit --allow-empty -m "chore: trigger fresh Vercel build"
   git push origin main
   ```

### If build times out:

Increase build timeout in Vercel project settings:
- Go to Settings → General
- Scroll to "Build & Development Settings"
- Increase timeout to 10 minutes

### If Playwright fails to install:

Check Vercel build logs for:
- Memory issues (upgrade Vercel plan if needed)
- Network timeout (retry deployment)
- Missing system dependencies (should be handled by `--with-deps`)

## Alternative: Client-Side Rendering

If server-side rendering continues to cause issues, you can revert to client-side rendering:

1. Remove rehype-mermaid from `astro.config.mjs`
2. Re-enable Shiki syntax highlighting
3. Add back client-side mermaid-init.js script
4. Diagrams will render in the browser instead of at build time

However, server-side rendering is preferred for:
- Better SEO (diagrams in HTML)
- Faster page loads (no client-side rendering delay)
- Works with JavaScript disabled

## Commit History

1. `2f780d3` - Updated package-lock.json for rehype-mermaid dependencies
2. `8e462b0` - Removed client-side mermaid-init.js script
3. `c038137` - Added Vercel build configuration for Playwright

## Next Steps

After successful deployment:

1. ✅ Verify all tutorial pages display content
2. ✅ Check Mermaid diagrams render correctly
3. ✅ Test on mobile devices
4. ✅ Monitor Vercel build times
5. 🔄 Consider re-enabling syntax highlighting with a client-side library if needed

## Support

If issues persist, check:
- [Vercel Build Logs](https://vercel.com)
- [rehype-mermaid GitHub Issues](https://github.com/remcohaszing/rehype-mermaid/issues)
- [Playwright Vercel Integration](https://playwright.dev/docs/ci#vercel)

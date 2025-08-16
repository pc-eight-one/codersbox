import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_B0E3fp2P.mjs';
import { manifest } from './manifest_Cx04jhZN.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/api/contact.astro.mjs');
const _page3 = () => import('./pages/api/init-db.astro.mjs');
const _page4 = () => import('./pages/api/newsletter.astro.mjs');
const _page5 = () => import('./pages/api/newsletter-send.astro.mjs');
const _page6 = () => import('./pages/api/subscribers.astro.mjs');
const _page7 = () => import('./pages/api/test-resend.astro.mjs');
const _page8 = () => import('./pages/articles/page/_page_.astro.mjs');
const _page9 = () => import('./pages/articles/_slug_.astro.mjs');
const _page10 = () => import('./pages/articles.astro.mjs');
const _page11 = () => import('./pages/projects/page/_page_.astro.mjs');
const _page12 = () => import('./pages/projects/_slug_.astro.mjs');
const _page13 = () => import('./pages/projects.astro.mjs');
const _page14 = () => import('./pages/sitemap.xml.astro.mjs');
const _page15 = () => import('./pages/tutorials/page/_page_.astro.mjs');
const _page16 = () => import('./pages/tutorials/series/_series_.astro.mjs');
const _page17 = () => import('./pages/tutorials.astro.mjs');
const _page18 = () => import('./pages/tutorials/_---slug_.astro.mjs');
const _page19 = () => import('./pages/unsubscribe.astro.mjs');
const _page20 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/api/contact.ts", _page2],
    ["src/pages/api/init-db.ts", _page3],
    ["src/pages/api/newsletter.ts", _page4],
    ["src/pages/api/newsletter-send.ts", _page5],
    ["src/pages/api/subscribers.ts", _page6],
    ["src/pages/api/test-resend.ts", _page7],
    ["src/pages/articles/page/[page].astro", _page8],
    ["src/pages/articles/[slug].astro", _page9],
    ["src/pages/articles/index.astro", _page10],
    ["src/pages/projects/page/[page].astro", _page11],
    ["src/pages/projects/[slug].astro", _page12],
    ["src/pages/projects/index.astro", _page13],
    ["src/pages/sitemap.xml.ts", _page14],
    ["src/pages/tutorials/page/[page].astro", _page15],
    ["src/pages/tutorials/series/[series].astro", _page16],
    ["src/pages/tutorials/index.astro", _page17],
    ["src/pages/tutorials/[...slug].astro", _page18],
    ["src/pages/unsubscribe.astro", _page19],
    ["src/pages/index.astro", _page20]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "78da5d6a-4835-41aa-99bd-623088f85f44",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };

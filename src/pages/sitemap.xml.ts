import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const siteUrl = 'https://codersbox.dev';

export const GET: APIRoute = async () => {
  // Get all content collections
  const [articles, tutorials, projects] = await Promise.all([
    getCollection('articles', ({ data }) => data.draft !== true),
    getCollection('tutorials', ({ data }) => data.draft !== true),
    getCollection('projects', ({ data }) => data.draft !== true),
  ]);

  // Static pages
  const staticPages = [
    {
      url: `${siteUrl}/`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/articles/`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/tutorials/`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/projects/`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about/`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.7,
    },
  ];

  // Dynamic pages from content collections
  const articlePages = articles.map((article) => ({
    url: `${siteUrl}/articles/${article.slug}/`,
    lastmod: article.data.publishDate.toISOString(),
    changefreq: 'monthly',
    priority: 0.8,
  }));

  const tutorialPages = tutorials.map((tutorial) => ({
    url: `${siteUrl}/tutorials/${tutorial.slug}/`,
    lastmod: tutorial.data.publishDate.toISOString(),
    changefreq: 'monthly',
    priority: 0.8,
  }));

  const projectPages = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}/`,
    lastmod: project.data.publishDate.toISOString(),
    changefreq: 'monthly',
    priority: 0.7,
  }));

  // Tutorial series pages
  const seriesMap = new Map();
  tutorials.forEach(tutorial => {
    const seriesName = tutorial.data.series;
    if (seriesName && !seriesMap.has(seriesName)) {
      seriesMap.set(seriesName, tutorial.data.publishDate);
    }
  });

  const seriesPages = Array.from(seriesMap.entries()).map(([seriesName, publishDate]) => ({
    url: `${siteUrl}/tutorials/series/${seriesName.toLowerCase().replace(/\s+/g, '-')}/`,
    lastmod: publishDate.toISOString(),
    changefreq: 'monthly',
    priority: 0.7,
  }));

  // Combine all pages
  const allPages = [
    ...staticPages,
    ...articlePages,
    ...tutorialPages,
    ...projectPages,
    ...seriesPages,
  ];

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
};
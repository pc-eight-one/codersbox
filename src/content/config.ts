import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    author: z.string().default('Prashant Chaturvedi'),
    tags: z.array(z.string()),
    readTime: z.string(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    published: z.boolean().default(true),
  }),
});

const tutorials = defineCollection({
  type: 'content',
  // Ensure slugs remain single-segment even when files are nested in subdirectories
  slug: ({ defaultSlug }) => defaultSlug.split('/').pop() || defaultSlug,
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    author: z.string().default('Prashant Chaturvedi'),
    tags: z.array(z.string()),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    series: z.string().optional(),
    part: z.number().optional(),
    totalParts: z.number().optional(),
    estimatedTime: z.string(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    published: z.boolean().default(true),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    tech: z.array(z.string()),
    github: z.string().url().optional(),
    demo: z.string().url().optional(),
    image: z.string().optional(),
    featured: z.boolean().default(false),
    status: z.enum(['completed', 'in-progress', 'archived']).default('completed'),
    published: z.boolean().default(true),
  }),
});

const cheatsheets = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    author: z.string().default('Prashant Chaturvedi'),
    tags: z.array(z.string()),
    category: z.string().optional(),
    readTime: z.string(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    published: z.boolean().default(true),
    downloads: z.array(z.object({
      title: z.string(),
      format: z.string(),
      size: z.string().optional(),
      url: z.string(),
    })).optional(),
  }),
});

export const collections = {
  articles,
  tutorials,
  projects,
  cheatsheets,
};
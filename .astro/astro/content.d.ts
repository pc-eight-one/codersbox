declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
			components: import('astro').MDXInstance<{}>['components'];
		}>;
	}
}

declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"articles": {
"css-animations-cheatsheet.md": {
	id: "css-animations-cheatsheet.md";
  slug: "css-animations-cheatsheet";
  body: string;
  collection: "articles";
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] };
"css-grid-complete-guide.md": {
	id: "css-grid-complete-guide.md";
  slug: "css-grid-complete-guide";
  body: string;
  collection: "articles";
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] };
"database-indexing-basics.md": {
	id: "database-indexing-basics.md";
  slug: "database-indexing-basics";
  body: string;
  collection: "articles";
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] };
"docker-basics-for-developers.md": {
	id: "docker-basics-for-developers.md";
  slug: "docker-basics-for-developers";
  body: string;
  collection: "articles";
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] };
"git-workflows-guide.md": {
	id: "git-workflows-guide.md";
  slug: "git-workflows-guide";
  body: string;
  collection: "articles";
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] };
"http-status-codes-explained.md": {
	id: "http-status-codes-explained.md";
  slug: "http-status-codes-explained";
  body: string;
  collection: "articles";
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] };
"javascript-promises-async-await.md": {
	id: "javascript-promises-async-await.md";
  slug: "javascript-promises-async-await";
  body: string;
  collection: "articles";
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] };
"nextjs-routing-2025-guide.md": {
	id: "nextjs-routing-2025-guide.md";
  slug: "nextjs-routing-2025-guide";
  body: string;
  collection: "articles";
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] };
"nodejs-performance-tips-2025.md": {
	id: "nodejs-performance-tips-2025.md";
  slug: "nodejs-performance-tips-2025";
  body: string;
  collection: "articles";
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] };
"react-hooks-comprehensive-guide.md": {
	id: "react-hooks-comprehensive-guide.md";
  slug: "react-hooks-comprehensive-guide";
  body: string;
  collection: "articles";
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] };
"testing-strategies-frontend-2025.md": {
	id: "testing-strategies-frontend-2025.md";
  slug: "testing-strategies-frontend-2025";
  body: string;
  collection: "articles";
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] };
"typescript-best-practices.md": {
	id: "typescript-best-practices.md";
  slug: "typescript-best-practices";
  body: string;
  collection: "articles";
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] };
"vscode-shortcuts-productivity.md": {
	id: "vscode-shortcuts-productivity.md";
  slug: "vscode-shortcuts-productivity";
  body: string;
  collection: "articles";
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] };
"web-accessibility-checklist-2025.md": {
	id: "web-accessibility-checklist-2025.md";
  slug: "web-accessibility-checklist-2025";
  body: string;
  collection: "articles";
  data: InferEntrySchema<"articles">
} & { render(): Render[".md"] };
};
"projects": {
"ecommerce-platform.md": {
	id: "ecommerce-platform.md";
  slug: "ecommerce-platform";
  body: string;
  collection: "projects";
  data: InferEntrySchema<"projects">
} & { render(): Render[".md"] };
"express-api-starter.md": {
	id: "express-api-starter.md";
  slug: "express-api-starter";
  body: string;
  collection: "projects";
  data: InferEntrySchema<"projects">
} & { render(): Render[".md"] };
"nextjs-blog-starter.md": {
	id: "nextjs-blog-starter.md";
  slug: "nextjs-blog-starter";
  body: string;
  collection: "projects";
  data: InferEntrySchema<"projects">
} & { render(): Render[".md"] };
"portfolio-website.md": {
	id: "portfolio-website.md";
  slug: "portfolio-website";
  body: string;
  collection: "projects";
  data: InferEntrySchema<"projects">
} & { render(): Render[".md"] };
"react-todo-app.md": {
	id: "react-todo-app.md";
  slug: "react-todo-app";
  body: string;
  collection: "projects";
  data: InferEntrySchema<"projects">
} & { render(): Render[".md"] };
"task-management-app.md": {
	id: "task-management-app.md";
  slug: "task-management-app";
  body: string;
  collection: "projects";
  data: InferEntrySchema<"projects">
} & { render(): Render[".md"] };
"weather-dashboard.md": {
	id: "weather-dashboard.md";
  slug: "weather-dashboard";
  body: string;
  collection: "projects";
  data: InferEntrySchema<"projects">
} & { render(): Render[".md"] };
};
"tutorials": {
"astro-portfolio/astro-portfolio-part-1.md": {
	id: "astro-portfolio/astro-portfolio-part-1.md";
  slug: "astro-portfolio/astro-portfolio-part-1";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"astro-portfolio/astro-portfolio-part-2.md": {
	id: "astro-portfolio/astro-portfolio-part-2.md";
  slug: "astro-portfolio/astro-portfolio-part-2";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"css-animations/css-animations-part-1.md": {
	id: "css-animations/css-animations-part-1.md";
  slug: "css-animations/css-animations-part-1";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"css-animations/css-animations-part-2.md": {
	id: "css-animations/css-animations-part-2.md";
  slug: "css-animations/css-animations-part-2";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"docker-for-devs/docker-for-devs-part-1.md": {
	id: "docker-for-devs/docker-for-devs-part-1.md";
  slug: "docker-for-devs/docker-for-devs-part-1";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"docker-for-devs/docker-for-devs-part-2.md": {
	id: "docker-for-devs/docker-for-devs-part-2.md";
  slug: "docker-for-devs/docker-for-devs-part-2";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"nextjs-blog/nextjs-blog-part-1.md": {
	id: "nextjs-blog/nextjs-blog-part-1.md";
  slug: "nextjs-blog/nextjs-blog-part-1";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"nextjs-blog/nextjs-blog-part-2.md": {
	id: "nextjs-blog/nextjs-blog-part-2.md";
  slug: "nextjs-blog/nextjs-blog-part-2";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"node-rest-api/node-rest-api-part-1.md": {
	id: "node-rest-api/node-rest-api-part-1.md";
  slug: "node-rest-api/node-rest-api-part-1";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"node-rest-api/node-rest-api-part-2.md": {
	id: "node-rest-api/node-rest-api-part-2.md";
  slug: "node-rest-api/node-rest-api-part-2";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"portfolio-website/portfolio-website-part-1.md": {
	id: "portfolio-website/portfolio-website-part-1.md";
  slug: "portfolio-website/portfolio-website-part-1";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"portfolio-website/portfolio-website-part-2.md": {
	id: "portfolio-website/portfolio-website-part-2.md";
  slug: "portfolio-website/portfolio-website-part-2";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"python-data-analysis/python-data-analysis-part-1.md": {
	id: "python-data-analysis/python-data-analysis-part-1.md";
  slug: "python-data-analysis/python-data-analysis-part-1";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"python-data-analysis/python-data-analysis-part-2.md": {
	id: "python-data-analysis/python-data-analysis-part-2.md";
  slug: "python-data-analysis/python-data-analysis-part-2";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"react-todo-app-part-1.md": {
	id: "react-todo-app-part-1.md";
  slug: "react-todo-app-part-1";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"sql-react-crud/sql-react-crud-part-1.md": {
	id: "sql-react-crud/sql-react-crud-part-1.md";
  slug: "sql-react-crud/sql-react-crud-part-1";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"sql-react-crud/sql-react-crud-part-2.md": {
	id: "sql-react-crud/sql-react-crud-part-2.md";
  slug: "sql-react-crud/sql-react-crud-part-2";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"sqlite-crud/sqlite-crud-part-1.md": {
	id: "sqlite-crud/sqlite-crud-part-1.md";
  slug: "sqlite-crud/sqlite-crud-part-1";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"sqlite-crud/sqlite-crud-part-2.md": {
	id: "sqlite-crud/sqlite-crud-part-2.md";
  slug: "sqlite-crud/sqlite-crud-part-2";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"tailwind-design-system/tailwind-design-system-part-1.md": {
	id: "tailwind-design-system/tailwind-design-system-part-1.md";
  slug: "tailwind-design-system/tailwind-design-system-part-1";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"tailwind-design-system/tailwind-design-system-part-2.md": {
	id: "tailwind-design-system/tailwind-design-system-part-2.md";
  slug: "tailwind-design-system/tailwind-design-system-part-2";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"testing-with-jest/testing-with-jest-part-1.md": {
	id: "testing-with-jest/testing-with-jest-part-1.md";
  slug: "testing-with-jest/testing-with-jest-part-1";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"testing-with-jest/testing-with-jest-part-2.md": {
	id: "testing-with-jest/testing-with-jest-part-2.md";
  slug: "testing-with-jest/testing-with-jest-part-2";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"typescript-basics/typescript-basics-part-1.md": {
	id: "typescript-basics/typescript-basics-part-1.md";
  slug: "typescript-basics/typescript-basics-part-1";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
"typescript-basics/typescript-basics-part-2.md": {
	id: "typescript-basics/typescript-basics-part-2.md";
  slug: "typescript-basics/typescript-basics-part-2";
  body: string;
  collection: "tutorials";
  data: InferEntrySchema<"tutorials">
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../../src/content/config.js");
}

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
  data: any
} & { render(): Render[".md"] };
"css-grid-complete-guide.md": {
	id: "css-grid-complete-guide.md";
  slug: "css-grid-complete-guide";
  body: string;
  collection: "articles";
  data: any
} & { render(): Render[".md"] };
"database-indexing-basics.md": {
	id: "database-indexing-basics.md";
  slug: "database-indexing-basics";
  body: string;
  collection: "articles";
  data: any
} & { render(): Render[".md"] };
"docker-basics-for-developers.md": {
	id: "docker-basics-for-developers.md";
  slug: "docker-basics-for-developers";
  body: string;
  collection: "articles";
  data: any
} & { render(): Render[".md"] };
"git-workflows-guide.md": {
	id: "git-workflows-guide.md";
  slug: "git-workflows-guide";
  body: string;
  collection: "articles";
  data: any
} & { render(): Render[".md"] };
"http-status-codes-explained.md": {
	id: "http-status-codes-explained.md";
  slug: "http-status-codes-explained";
  body: string;
  collection: "articles";
  data: any
} & { render(): Render[".md"] };
"javascript-promises-async-await.md": {
	id: "javascript-promises-async-await.md";
  slug: "javascript-promises-async-await";
  body: string;
  collection: "articles";
  data: any
} & { render(): Render[".md"] };
"nextjs-routing-2025-guide.md": {
	id: "nextjs-routing-2025-guide.md";
  slug: "nextjs-routing-2025-guide";
  body: string;
  collection: "articles";
  data: any
} & { render(): Render[".md"] };
"nodejs-performance-tips-2025.md": {
	id: "nodejs-performance-tips-2025.md";
  slug: "nodejs-performance-tips-2025";
  body: string;
  collection: "articles";
  data: any
} & { render(): Render[".md"] };
"react-hooks-comprehensive-guide.md": {
	id: "react-hooks-comprehensive-guide.md";
  slug: "react-hooks-comprehensive-guide";
  body: string;
  collection: "articles";
  data: any
} & { render(): Render[".md"] };
"testing-strategies-frontend-2025.md": {
	id: "testing-strategies-frontend-2025.md";
  slug: "testing-strategies-frontend-2025";
  body: string;
  collection: "articles";
  data: any
} & { render(): Render[".md"] };
"typescript-best-practices.md": {
	id: "typescript-best-practices.md";
  slug: "typescript-best-practices";
  body: string;
  collection: "articles";
  data: any
} & { render(): Render[".md"] };
"vscode-shortcuts-productivity.md": {
	id: "vscode-shortcuts-productivity.md";
  slug: "vscode-shortcuts-productivity";
  body: string;
  collection: "articles";
  data: any
} & { render(): Render[".md"] };
"web-accessibility-checklist-2025.md": {
	id: "web-accessibility-checklist-2025.md";
  slug: "web-accessibility-checklist-2025";
  body: string;
  collection: "articles";
  data: any
} & { render(): Render[".md"] };
};
"projects": {
"ecommerce-platform.md": {
	id: "ecommerce-platform.md";
  slug: "ecommerce-platform";
  body: string;
  collection: "projects";
  data: any
} & { render(): Render[".md"] };
"express-api-starter.md": {
	id: "express-api-starter.md";
  slug: "express-api-starter";
  body: string;
  collection: "projects";
  data: any
} & { render(): Render[".md"] };
"nextjs-blog-starter.md": {
	id: "nextjs-blog-starter.md";
  slug: "nextjs-blog-starter";
  body: string;
  collection: "projects";
  data: any
} & { render(): Render[".md"] };
"portfolio-website.md": {
	id: "portfolio-website.md";
  slug: "portfolio-website";
  body: string;
  collection: "projects";
  data: any
} & { render(): Render[".md"] };
"react-todo-app.md": {
	id: "react-todo-app.md";
  slug: "react-todo-app";
  body: string;
  collection: "projects";
  data: any
} & { render(): Render[".md"] };
"task-management-app.md": {
	id: "task-management-app.md";
  slug: "task-management-app";
  body: string;
  collection: "projects";
  data: any
} & { render(): Render[".md"] };
"weather-dashboard.md": {
	id: "weather-dashboard.md";
  slug: "weather-dashboard";
  body: string;
  collection: "projects";
  data: any
} & { render(): Render[".md"] };
};
"tutorials": {
"java-complete/java-complete-part-1.md": {
	id: "java-complete/java-complete-part-1.md";
  slug: "java-complete/java-complete-part-1";
  body: string;
  collection: "tutorials";
  data: any
} & { render(): Render[".md"] };
"java-complete/java-complete-part-10.md": {
	id: "java-complete/java-complete-part-10.md";
  slug: "java-complete-part-10";
  body: string;
  collection: "tutorials";
  data: any
} & { render(): Render[".md"] };
"java-complete/java-complete-part-11.md": {
	id: "java-complete/java-complete-part-11.md";
  slug: "java-complete-part-11";
  body: string;
  collection: "tutorials";
  data: any
} & { render(): Render[".md"] };
"java-complete/java-complete-part-12.md": {
	id: "java-complete/java-complete-part-12.md";
  slug: "java-complete-part-12";
  body: string;
  collection: "tutorials";
  data: any
} & { render(): Render[".md"] };
"java-complete/java-complete-part-13.md": {
	id: "java-complete/java-complete-part-13.md";
  slug: "java-complete-part-13";
  body: string;
  collection: "tutorials";
  data: any
} & { render(): Render[".md"] };
"java-complete/java-complete-part-14.md": {
	id: "java-complete/java-complete-part-14.md";
  slug: "java-complete-part-14";
  body: string;
  collection: "tutorials";
  data: any
} & { render(): Render[".md"] };
"java-complete/java-complete-part-15.md": {
	id: "java-complete/java-complete-part-15.md";
  slug: "java-complete-part-15";
  body: string;
  collection: "tutorials";
  data: any
} & { render(): Render[".md"] };
"java-complete/java-complete-part-16.md": {
	id: "java-complete/java-complete-part-16.md";
  slug: "java-complete-part-16";
  body: string;
  collection: "tutorials";
  data: any
} & { render(): Render[".md"] };
"java-complete/java-complete-part-17.md": {
	id: "java-complete/java-complete-part-17.md";
  slug: "java-complete-part-17";
  body: string;
  collection: "tutorials";
  data: any
} & { render(): Render[".md"] };
"java-complete/java-complete-part-2.md": {
	id: "java-complete/java-complete-part-2.md";
  slug: "java-complete/java-complete-part-2";
  body: string;
  collection: "tutorials";
  data: any
} & { render(): Render[".md"] };
"java-complete/java-complete-part-3.md": {
	id: "java-complete/java-complete-part-3.md";
  slug: "java-complete/java-complete-part-3";
  body: string;
  collection: "tutorials";
  data: any
} & { render(): Render[".md"] };
"java-complete/java-complete-part-4.md": {
	id: "java-complete/java-complete-part-4.md";
  slug: "java-complete/java-complete-part-4";
  body: string;
  collection: "tutorials";
  data: any
} & { render(): Render[".md"] };
"java-complete/java-complete-part-5.md": {
	id: "java-complete/java-complete-part-5.md";
  slug: "java-complete/java-complete-part-5";
  body: string;
  collection: "tutorials";
  data: any
} & { render(): Render[".md"] };
"java-complete/java-complete-part-6.md": {
	id: "java-complete/java-complete-part-6.md";
  slug: "java-complete/java-complete-part-6";
  body: string;
  collection: "tutorials";
  data: any
} & { render(): Render[".md"] };
"java-complete/java-complete-part-7.md": {
	id: "java-complete/java-complete-part-7.md";
  slug: "java-complete/java-complete-part-7";
  body: string;
  collection: "tutorials";
  data: any
} & { render(): Render[".md"] };
"java-complete/java-complete-part-8.md": {
	id: "java-complete/java-complete-part-8.md";
  slug: "java-complete/java-complete-part-8";
  body: string;
  collection: "tutorials";
  data: any
} & { render(): Render[".md"] };
"java-complete/java-complete-part-9.md": {
	id: "java-complete/java-complete-part-9.md";
  slug: "java-complete-part-9";
  body: string;
  collection: "tutorials";
  data: any
} & { render(): Render[".md"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = never;
}

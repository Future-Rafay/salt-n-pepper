import sanitizeHtml from "sanitize-html";
import { z } from "zod";

const WP_API_BASE = "https://mydaytogo.com/wp-json/wp/v2";
const WP_CATEGORY_SLUG = "sweetnsavour";
const REVALIDATE_SECONDS = 600;

const categorySchema = z.object({ id: z.number(), name: z.string(), slug: z.string(), taxonomy: z.string().optional() });
const postSchema = z.object({
  id: z.number(),
  date: z.string(),
  slug: z.string(),
  link: z.string().url().optional(),
  title: z.object({ rendered: z.string().optional() }),
  excerpt: z.object({ rendered: z.string().optional() }),
  content: z.object({ rendered: z.string().optional() }),
  _embedded: z.object({
    author: z.array(z.object({ name: z.string() })).optional(),
    "wp:featuredmedia": z.array(z.object({ alt_text: z.string().optional(), source_url: z.string().url().optional() })).optional(),
    "wp:term": z.array(z.array(categorySchema)).optional(),
  }).optional(),
});

export type BlogPostSummary = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  publishedAt: string;
  authorName?: string;
  categories: Array<{ id: number; name: string; slug: string }>;
};

export type BlogPostDetail = BlogPostSummary & { contentHtml: string; sourceUrl?: string };
export type BlogListResult = { posts: BlogPostSummary[]; page: number; total: number; totalPages: number };

export async function listBlogPosts(page = 1, perPage = 12): Promise<BlogListResult> {
  const safePage = Math.max(1, page);
  const safePerPage = Math.min(24, Math.max(1, perPage));
  const category = await getMainCategory();
  if (!category) return { posts: [], page: safePage, total: 0, totalPages: 1 };

  const params = new URLSearchParams({
    _embed: "1",
    categories: String(category.id),
    order: "desc",
    orderby: "date",
    page: String(safePage),
    per_page: String(safePerPage),
  });
  const response = await wpFetch(`/posts?${params}`);
  const posts = z.array(postSchema).parse(await response.json());
  const total = headerNumber(response.headers, "x-wp-total");
  const totalPages = Math.max(1, headerNumber(response.headers, "x-wp-totalpages"));

  return { posts: posts.map(normalizeSummary), page: safePage, total, totalPages };
}

export async function listLatestBlogPosts(limit = 4) {
  try {
    return (await listBlogPosts(1, limit)).posts;
  } catch {
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPostDetail | null> {
  const params = new URLSearchParams({ slug, _embed: "1" });
  const response = await wpFetch(`/posts?${params}`);
  const post = z.array(postSchema).parse(await response.json())[0];
  if (!post) return null;

  return {
    ...normalizeSummary(post),
    contentHtml: buildPostContent(post.content.rendered ?? "", post.excerpt.rendered ?? ""),
    sourceUrl: post.link,
  };
}

export function sanitizeBlogHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ["a", "blockquote", "br", "caption", "code", "em", "figcaption", "figure", "h2", "h3", "h4", "hr", "img", "li", "ol", "p", "pre", "strong", "table", "tbody", "td", "th", "thead", "tr", "ul"],
    allowedAttributes: {
      a: ["href", "rel", "target", "title"],
      img: ["alt", "height", "loading", "src", "title", "width"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan", "scope"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (_tagName, attributes) => ({ tagName: "a", attribs: { ...attributes, rel: "nofollow noopener noreferrer", target: "_blank" } }),
      img: (_tagName, attributes) => ({ tagName: "img", attribs: { ...attributes, loading: "lazy" } }),
    },
  });
}

async function getMainCategory() {
  const response = await wpFetch(`/categories?${new URLSearchParams({ slug: WP_CATEGORY_SLUG })}`);
  return z.array(categorySchema).parse(await response.json())[0] ?? null;
}

async function wpFetch(path: string) {
  const response = await fetch(`${WP_API_BASE}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`WordPress request failed: ${response.status}`);
  return response;
}

function normalizeSummary(post: z.infer<typeof postSchema>): BlogPostSummary {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  const categories = (post._embedded?.["wp:term"] ?? [])
    .flat()
    .filter((category) => category.taxonomy !== "post_tag")
    .map(({ id, name, slug }) => ({ id, name: text(name), slug }));

  return {
    id: post.id,
    title: text(post.title.rendered ?? "Untitled article"),
    slug: post.slug,
    excerpt: text(post.excerpt.rendered ?? ""),
    coverImageUrl: media?.source_url,
    coverImageAlt: media?.alt_text ? text(media.alt_text) : undefined,
    publishedAt: post.date,
    authorName: post._embedded?.author?.[0]?.name,
    categories,
  };
}

function text(html: string) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}

export function buildPostContent(content: string, excerpt: string) {
  const safeContent = sanitizeBlogHtml(content);
  const safeExcerpt = sanitizeBlogHtml(excerpt);
  return text(safeContent).length >= 120 || !text(safeExcerpt) ? safeContent : `${safeContent}${safeExcerpt}`;
}

function headerNumber(headers: Headers, key: string) {
  const value = Number.parseInt(headers.get(key) ?? "0", 10);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

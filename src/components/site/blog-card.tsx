import { ArrowUpRight, CalendarDays, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { BlogPostSummary } from "@/lib/wordpress";

export function BlogCard({ post, locale }: { post: BlogPostSummary; locale: "de" | "en" }) {
  return (
    <Link href={`/${locale}/blog/${post.slug}`} className="group block h-full rounded-card focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-4">
      <article className="flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface transition duration-300 group-hover:-translate-y-1 group-hover:border-secondary group-hover:shadow-xl">
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-warm">
          {post.coverImageUrl ? (
            <Image src={post.coverImageUrl} alt={post.coverImageAlt || post.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-3xl text-primary/40">SNP</div>
          )}
          {post.categories[0] && <span className="absolute left-4 top-4 rounded-full bg-surface/95 px-3 py-1.5 text-xs font-bold text-secondary shadow-sm">{post.categories[0].name}</span>}
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-secondary" aria-hidden="true" />{formatDate(post.publishedAt, locale)}</span>
            {post.authorName && <span className="inline-flex items-center gap-1.5"><UserRound className="h-4 w-4 text-secondary" aria-hidden="true" />{post.authorName}</span>}
          </div>
          <h3 className="mt-4 line-clamp-2 font-display text-2xl leading-tight tracking-[-0.03em] text-primary">{post.title}</h3>
          {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{post.excerpt}</p>}
          <span className="mt-auto inline-flex min-h-11 items-end gap-2 pt-5 text-sm font-bold text-primary group-hover:text-secondary">{locale === "de" ? "Artikel lesen" : "Read article"}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span>
        </div>
      </article>
    </Link>
  );
}

export function formatDate(value: string, locale: "de" | "en", long = false) {
  return new Intl.DateTimeFormat(locale === "de" ? "de-CH" : "en-CH", {
    day: "numeric",
    month: long ? "long" : "short",
    year: "numeric",
  }).format(new Date(value));
}

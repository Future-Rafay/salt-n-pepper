import { ArrowLeft, ArrowUpRight, CalendarDays, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatDate } from "@/components/site/blog-card";
import { getBlogPost } from "@/lib/wordpress";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug).catch(() => null);
  return post ? { title: post.title, description: post.excerpt, openGraph: { title: post.title, description: post.excerpt, images: post.coverImageUrl ? [post.coverImageUrl] : undefined } } : {};
}

export default async function BlogDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: requestedLocale, slug } = await params;
  const locale = requestedLocale === "en" ? "en" : "de";
  const de = locale === "de";
  const post = await getBlogPost(slug).catch(() => null);
  if (!post) notFound();

  return (
    <div className="pb-20 sm:pb-28">
      <article className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-20">
        <Link href={`/${locale}/blog`} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted hover:text-secondary"><ArrowLeft className="h-4 w-4" aria-hidden="true" />{de ? "Alle Artikel" : "All articles"}</Link>

        <header className="mt-8">
          {post.categories.length > 0 && <div className="flex flex-wrap gap-2">{post.categories.map((category) => <span key={category.id} className="rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary">{category.name}</span>)}</div>}
          <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[0.92] tracking-[-0.05em] text-primary sm:text-7xl">{post.title}</h1>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted">
            <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4 text-secondary" aria-hidden="true" />{formatDate(post.publishedAt, locale, true)}</span>
            {post.authorName && <span className="inline-flex items-center gap-2"><UserRound className="h-4 w-4 text-secondary" aria-hidden="true" />{post.authorName}</span>}
          </div>
        </header>

        {post.coverImageUrl && <div className="relative mt-10 aspect-[16/8] overflow-hidden rounded-card bg-surface-warm"><Image src={post.coverImageUrl} alt={post.coverImageAlt || post.title} fill priority sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" /></div>}
        <div className="blog-prose mx-auto mt-10 max-w-3xl" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

        {post.sourceUrl && <aside className="mx-auto mt-12 flex max-w-3xl flex-col gap-5 rounded-card bg-primary p-7 text-white sm:flex-row sm:items-center sm:justify-between sm:p-9"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary-contrast">SweetNSavour</p><h2 className="mt-2 font-display text-2xl">{de ? "Originalbeitrag und Diskussion" : "Original article and discussion"}</h2></div><a href={post.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-secondary px-5 font-bold text-white hover:bg-secondary-light">{de ? "Original öffnen" : "Open original"}<ArrowUpRight className="h-5 w-5" aria-hidden="true" /></a></aside>}
      </article>
    </div>
  );
}

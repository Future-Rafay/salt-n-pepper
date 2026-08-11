import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

import { BlogCard } from "@/components/site/blog-card";
import { localizedMetadata } from "@/lib/metadata";
import { listBlogPosts } from "@/lib/wordpress";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return localizedMetadata((await params).locale, "/blog", { de: "Blog & Ratgeber", en: "Blog & guides" }, { de: "Food-Guides und Inspiration für die SaltNPepper Community.", en: "Food guides and inspiration for the SaltNPepper community." });
}

export default async function BlogPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string }> }) {
  const locale = (await params).locale === "en" ? "en" : "de";
  const de = locale === "de";
  const parsedPage = Number.parseInt((await searchParams).page ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  let result = null;

  try {
    result = await listBlogPosts(page, 12);
  } catch (error) {
    console.error("Failed to load SaltNPepper blog:", error);
  }

  return (
    <div className="pb-20 sm:pb-28">
      <section className="border-b border-border bg-primary py-16 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-secondary-contrast"><BookOpen className="h-5 w-5" aria-hidden="true" />SweetNSavour · SaltNPepper</div>
          <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[0.9] tracking-[-0.055em] sm:text-7xl">{de ? "Gute Ideen für guten Genuss." : "Good ideas for good food."}</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">{de ? "Praktische Guides, Ernährungstipps und Inspiration aus unserem gemeinsamen SweetNSavour Blog." : "Practical guides, food tips, and inspiration from our shared SweetNSavour blog."}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        {!result ? (
          <BlogMessage locale={locale} failed />
        ) : result.posts.length === 0 ? (
          <BlogMessage locale={locale} />
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-5 text-sm text-muted">
              <p>{de ? `${result.total} Artikel` : `${result.total} articles`}</p>
              <p>{de ? `Seite ${result.page} von ${result.totalPages}` : `Page ${result.page} of ${result.totalPages}`}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{result.posts.map((post) => <BlogCard key={post.id} post={post} locale={locale} />)}</div>
            {result.totalPages > 1 && (
              <nav aria-label={de ? "Blog Seitennavigation" : "Blog pagination"} className="mt-12 flex items-center justify-center gap-3">
                {page > 1 && <Link href={`/${locale}/blog${page === 2 ? "" : `?page=${page - 1}`}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-5 font-bold text-primary hover:border-secondary"><ArrowLeft className="h-4 w-4" aria-hidden="true" />{de ? "Zurück" : "Previous"}</Link>}
                {page < result.totalPages && <Link href={`/${locale}/blog?page=${page + 1}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 font-bold text-white hover:bg-primary-light">{de ? "Weiter" : "Next"}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function BlogMessage({ locale, failed = false }: { locale: "de" | "en"; failed?: boolean }) {
  const de = locale === "de";
  return <div className="mx-auto max-w-xl rounded-card border border-border bg-surface p-8 text-center"><h2 className="font-display text-3xl text-primary">{failed ? (de ? "Artikel gerade nicht verfügbar" : "Articles are temporarily unavailable") : (de ? "Noch keine Artikel" : "No articles yet")}</h2><p className="mt-3 leading-7 text-muted">{failed ? (de ? "Bitte laden Sie die Seite in Kürze erneut." : "Please refresh the page again shortly.") : (de ? "Neue Beiträge erscheinen hier automatisch." : "New posts will appear here automatically.")}</p></div>;
}

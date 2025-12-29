import Link from "next/link"
import { getArticle, getHeadlines } from "@/lib/news"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export const revalidate = 3600 // Revalidate every hour

export async function generateStaticParams() {
  const { headlines } = await getHeadlines()
  return headlines.map((headline) => ({
    id: headline.id,
  }))
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const article = await getArticle(id)

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to headlines
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <article>
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-primary uppercase tracking-wide px-2 py-1 bg-primary/10 rounded">
                {article.category}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-balance mb-4 leading-tight">{article.title}</h1>
          </div>

          <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
            {article.content.split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-6 leading-relaxed text-foreground/90">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </main>

      <footer className="border-t border-border mt-20 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-3xl text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to all headlines
          </Link>
        </div>
      </footer>
    </div>
  )
}

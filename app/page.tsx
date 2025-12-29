import Link from "next/link"
import { getHeadlines } from "@/lib/news"

export const revalidate = 3600 // Revalidate every hour

export default async function HomePage() {
  const { headlines, lastUpdated } = await getHeadlines()
  const featuredHeadlines = headlines.slice(0, 3)
  const regularHeadlines = headlines.slice(3)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-3 tracking-tight">
            GIST<span className="text-primary">.AI</span>
          </h1>
          <p className="text-center text-sm text-muted-foreground mb-2 max-w-2xl mx-auto">
            AI news to get the gist. All articles are &lt; 800 words (2 min reads). Created by John Kuhn.
          </p>
          <p className="text-center text-xs text-muted-foreground/70">
            Updated{" "}
            {new Date(lastUpdated).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-primary rounded-full"></div>
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Featured Stories</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredHeadlines.map((headline, index) => (
              <Link key={headline.id} href={`/article/${headline.id}`} className="group">
                <article className="border border-border rounded-xl p-6 bg-card hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-primary uppercase tracking-wide px-2 py-1 bg-primary/10 rounded">
                      {headline.category}
                    </span>
                    {index === 0 && (
                      <span className="text-xs font-bold text-foreground/60 uppercase tracking-wide">★ Top</span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug flex-grow text-balance">
                    {headline.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {new Date(headline.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </article>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-muted-foreground/30 rounded-full"></div>
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Latest Headlines</h2>
          </div>
          <div className="space-y-1">
            {regularHeadlines.map((headline) => (
              <article key={headline.id} className="group">
                <Link
                  href={`/article/${headline.id}`}
                  className="block hover:bg-accent/70 -mx-3 px-3 py-4 rounded-lg transition-all duration-200 border-l-2 border-transparent hover:border-primary"
                >
                  <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug text-balance mb-1.5">
                    {headline.title}
                  </h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="font-medium">{headline.category}</span>
                    <span className="text-muted-foreground/50">•</span>
                    <span>
                      {new Date(headline.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </p>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-20 bg-muted/30">
        <div className="container mx-auto px-4 py-8 max-w-5xl text-center text-sm text-muted-foreground">
          <p>Powered by AI • Content automatically generated and updated hourly</p>
        </div>
      </footer>
    </div>
  )
}

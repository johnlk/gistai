export interface Headline {
  id: string
  title: string
  category: string
  publishedAt: string
}

export interface Article extends Headline {
  content: string
}

interface CachedNews {
  headlines: Headline[]
  articles: Map<string, Article>
  lastUpdated: string
}

// In-memory cache (resets on server restart, but ISR will handle persistence)
let newsCache: CachedNews | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 3600 * 1000 // 1 hour in milliseconds

async function generateNewsContent(): Promise<CachedNews> {
  console.log("[v0] Generating new news content...")

  // TODO: Replace with actual Grok API call when XAI_API_KEY is added
  // For now, using placeholder content
  const useGrok = !!process.env.XAI_API_KEY

  if (useGrok) {
    // When Grok is connected, this will generate real content
    const { generateText } = await import("ai")
    const xai = await import("@ai-sdk/xai")

    const { text } = await generateText({
      model: xai.xai("grok-2-latest"),
      prompt: `Generate 15 realistic news headlines with categories for today's breaking news. 
      Include a mix of politics, technology, world events, business, and culture.
      Format as JSON array with: id, title, category, publishedAt (ISO date).
      Make them compelling and newsworthy.`,
    })

    const headlines = JSON.parse(text)

    // Generate full articles for each headline
    const articles = new Map<string, Article>()
    for (const headline of headlines) {
      const { text: articleContent } = await generateText({
        model: xai.xai("grok-2-latest"),
        prompt: `Write a realistic 800-word news article about: "${headline.title}". 
        Write in a professional journalistic style. Include key facts, quotes, and context.
        Return only the article text, no title.`,
      })

      articles.set(headline.id, {
        ...headline,
        content: articleContent,
      })
    }

    return {
      headlines,
      articles,
      lastUpdated: new Date().toISOString(),
    }
  } else {
    // Placeholder content when Grok is not connected
    const headlines: Headline[] = Array.from({ length: 15 }, (_, i) => ({
      id: `article-${i + 1}`,
      title: getPlaceholderHeadline(i),
      category: getPlaceholderCategory(i),
      publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
    }))

    const articles = new Map<string, Article>()
    headlines.forEach((headline) => {
      articles.set(headline.id, {
        ...headline,
        content: getPlaceholderArticle(headline.title),
      })
    })

    return {
      headlines,
      articles,
      lastUpdated: new Date().toISOString(),
    }
  }
}

function getPlaceholderHeadline(index: number): string {
  const headlines = [
    "Breaking: Major Policy Changes Announced in Washington",
    "Tech Giants Face New Regulatory Challenges",
    "Global Markets React to Economic Indicators",
    "Scientists Make Breakthrough in Climate Research",
    "International Summit Addresses Critical Issues",
    "New Study Reveals Surprising Health Findings",
    "Sports World Buzzes with Championship News",
    "Cultural Event Draws Record Attendance",
    "Transportation Infrastructure Updates Approved",
    "Education System Undergoes Significant Reform",
    "Space Exploration Reaches New Milestone",
    "Entertainment Industry Announces Major Productions",
    "Local Community Rallies for Important Cause",
    "Business Leaders Discuss Future Strategies",
    "Environmental Initiative Gains Momentum",
  ]
  return headlines[index % headlines.length]
}

function getPlaceholderCategory(index: number): string {
  const categories = ["Politics", "Technology", "Business", "Science", "World", "Health", "Sports", "Culture"]
  return categories[index % categories.length]
}

function getPlaceholderArticle(title: string): string {
  return `This is a placeholder article about "${title}". 

In a significant development that has captured national attention, sources close to the matter have confirmed new details emerging from this breaking story. The situation continues to evolve as stakeholders from various sectors weigh in on the implications.

According to officials familiar with the matter, the circumstances leading to this moment have been building for some time. Industry experts suggest that the convergence of multiple factors has created a unique situation that demands careful consideration and thoughtful response.

"This represents a pivotal moment," said one analyst who requested anonymity due to the sensitive nature of the discussions. "We're seeing a shift that could have far-reaching implications across multiple sectors."

The response from key players has been swift and varied. While some have welcomed the developments as a positive step forward, others have expressed concerns about potential challenges that may arise. The debate has sparked intense discussion among policy makers, industry leaders, and community stakeholders.

Historical context provides important perspective on the current situation. Similar circumstances in the past have demonstrated both the opportunities and risks associated with such developments. Experts point to several precedents that may offer guidance as the situation continues to unfold.

From an economic standpoint, analysts are carefully monitoring potential impacts on markets and business operations. Early indicators suggest a complex picture with both positive and negative elements that will require time to fully assess. Industry observers note that the full effects may not be apparent for several months.

The international dimension adds another layer of complexity to the situation. Foreign governments and international organizations are closely watching developments, with some indicating they may need to adjust their own policies in response.

Looking ahead, stakeholders from various perspectives are calling for measured approaches that balance competing interests and priorities. The coming weeks will likely prove critical as key decisions are made and implementation plans take shape.

To add your XAI_API_KEY and enable Grok-generated content, add it to your environment variables in the Vars section.`
}

async function getCachedNews(): Promise<CachedNews> {
  const now = Date.now()

  // Check if cache exists and is still valid
  if (newsCache && now - cacheTimestamp < CACHE_DURATION) {
    console.log("[v0] Using cached news content")
    return newsCache
  }

  // Generate new content
  newsCache = await generateNewsContent()
  cacheTimestamp = now

  return newsCache
}

export async function getHeadlines(): Promise<{ headlines: Headline[]; lastUpdated: string }> {
  const cache = await getCachedNews()
  return {
    headlines: cache.headlines,
    lastUpdated: cache.lastUpdated,
  }
}

export async function getArticle(id: string): Promise<Article | null> {
  const cache = await getCachedNews()
  return cache.articles.get(id) || null
}

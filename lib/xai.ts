import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

const MODEL_NAME = "grok-4-1-fast-reasoning"

export interface Headline {
  id: string
  title: string
  category: string
  publishedAt: string
}

export interface Article extends Headline {
  content: string
}

interface GeneratedNews {
  headlines: Headline[]
  articles: Record<string, Article>
  lastUpdated: string
}

/**
 * Generate news headlines and articles using XAI
 */
export async function generateNewsWithXAI(): Promise<GeneratedNews> {
  const apiKey = process.env.XAI_API_KEY

  if (!apiKey) {
    throw new Error("XAI_API_KEY environment variable is not set")
  }

  console.log("[xai] Generating 10 news headlines...")

  // Generate 10 headlines
  const { text: headlinesText } = await generateText({
    model: xai(MODEL_NAME),
    prompt: `Using the internet, find 10 news headlines with categories from today's breaking news.
    Include a mix of politics, technology, world events, business, and culture.
    Format as a JSON array with this exact structure:
    [
      {
        "id": "article-1",
        "title": "Headline text here",
        "category": "Category"
      }
    ]
    Make them compelling and newsworthy. Return ONLY the JSON array, no other text.`,
    providerOptions: {
      xai: {
        searchParameters: {
          mode: "on",
          returnCitations: true,
        },
      },
    },
  })

  const headlines: Headline[] = JSON.parse(headlinesText)
  console.log(`[xai] Generated ${headlines.length} headlines`)

  // Generate articles for each headline
  const articles: Record<string, Article> = {}

  for (const headline of headlines) {
    console.log(`[xai] Generating article for: ${headline.title}`)

    const { text: articleContent } = await generateText({
      model: xai(MODEL_NAME),
      prompt: `Using the internet for information, write a concise news article about: "${headline.title}"

      Write in a professional journalistic style. Include key facts and context.
      Each paragraph should be 3-4 sentences. Return only the article text, no title or extra formatting.
      Max 800 words.`,
      providerOptions: {
        xai: {
          searchParameters: {
            mode: "on",
            returnCitations: true,
          },
        },
      },
    })

    headline.publishedAt = new Date().toISOString()

    articles[headline.id] = {
      ...headline,
      content: articleContent.trim(),
    }
  }

  console.log(`[xai] Successfully generated ${Object.keys(articles).length} articles`)

  return {
    headlines,
    articles,
    lastUpdated: new Date().toISOString(),
  }
}

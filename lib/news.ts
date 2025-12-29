import { list } from "@vercel/blob"
import { generateNewsWithXAI } from "./xai"

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
  articles: Record<string, Article>
  lastUpdated: string
}

// In-memory cache for fast reads (resets on server restart)
let newsCache: CachedNews | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 3600 * 1000 // 1 hour in milliseconds

async function generateNewsContent(): Promise<CachedNews> {
  const useXAI = process.env.XAI_API_KEY

  if (!useXAI) {
    throw new Error('No XAI_API_KEY set')
  }

  console.log("[news] Generating news content with XAI...")
  return await generateNewsWithXAI()
}

async function loadNewsFromBlob(): Promise<CachedNews | null> {
  // Skip blob storage if token is not available (e.g., during build in CI/CD)
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.log("[blob] Skipping blob storage (no token available)")
    return null
  }

  try {
    const { blobs } = await list({ prefix: "articles/news-data.json" })

    if (blobs.length === 0) {
      console.log("[blob] No news data found in blob storage")
      return null
    }

    const blobUrl = blobs[0].url
    const response = await fetch(blobUrl)

    if (!response.ok) {
      console.error("[blob] Failed to fetch news data from blob storage")
      return null
    }

    const data = await response.json()
    console.log("[blob] Successfully loaded news data from blob storage")

    return data
  } catch (error) {
    console.error("[blob] Error loading news from blob storage:", error)
    return null
  }
}

async function getCachedNews(): Promise<CachedNews> {
  const now = Date.now()

  // Check if in-memory cache exists and is still valid
  if (newsCache && now - cacheTimestamp < CACHE_DURATION) {
    console.log("[cache] Using in-memory cached news content")

    return newsCache
  }

  // Try to load from blob storage first
  const blobData = await loadNewsFromBlob()
  if (blobData) {
    // Check if blob data is still fresh (within cache duration)
    const blobAge = now - new Date(blobData.lastUpdated).getTime()
    if (blobAge < CACHE_DURATION) {
      console.log("[cache] Using blob storage news content")
      newsCache = blobData
      cacheTimestamp = now

      return newsCache
    }
  }

  // If we don't have XAI_API_KEY (e.g., during build), return empty placeholder
  if (!process.env.XAI_API_KEY) {
    console.log("[cache] No API keys available, returning placeholder data")
    newsCache = {
      headlines: [],
      articles: {},
      lastUpdated: new Date().toISOString(),
    }
    cacheTimestamp = now

    return newsCache
  }

  // Generate new content if no valid data found
  console.log("[cache] Generating new news content (no valid cache found)")
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

  return cache.articles[id] || null
}

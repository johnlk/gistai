import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { generateNewsWithXAI } from "@/lib/xai"

export async function GET(request: Request) {
  // Verify CRON_SECRET from authorization header
  const authHeader = request.headers.get("authorization")
  const cronSecret = authHeader?.replace("Bearer ", "")

  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    console.error("[cron] Unauthorized attempt to access cron endpoint")
    return NextResponse.json(
      { error: "Unauthorized - Invalid or missing CRON_SECRET" },
      { status: 401 }
    )
  }

  try {
    console.log("[cron] Starting automated article refresh...")

    // Generate news using XAI
    const newsData = await generateNewsWithXAI()

    // Upload to Vercel Blob Storage
    const { url } = await put("articles/news-data.json", JSON.stringify(newsData, null, 2), {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
    })

    console.log("[cron] Successfully updated news data in blob storage:", url)

    return NextResponse.json({
      success: true,
      message: "Cron job executed successfully - articles refreshed",
      url,
      count: {
        headlines: newsData.headlines.length,
        articles: Object.keys(newsData.articles).length,
      },
      lastUpdated: newsData.lastUpdated,
    })
  } catch (error) {
    console.error("[cron] Error refreshing articles:", error)

    return NextResponse.json(
      {
        error: "Failed to refresh articles",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

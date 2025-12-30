import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { generateNewsWithXAI } from "@/lib/xai"

export async function POST(request: Request) {
  // Validate API key
  const authHeader = request.headers.get("authorization")
  const apiKey = authHeader?.replace("Bearer ", "")

  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid or missing API key" },
      { status: 401 }
    )
  }

  try {
    console.log("[api] Generating news content with XAI...")

    // Generate news using XAI
    const newsData = await generateNewsWithXAI()

    // Upload to Vercel Blob Storage
    const { url } = await put("articles/news-data.json", JSON.stringify(newsData, null, 2), {
      access: "public",
      contentType: "application/json",
      allowOverwrite: true,
    })

    console.log("[api] Successfully updated news data in blob storage:", url)

    return NextResponse.json({
      success: true,
      message: "Articles generated and updated successfully",
      url,
      count: {
        headlines: newsData.headlines.length,
        articles: Object.keys(newsData.articles).length,
      },
      lastUpdated: newsData.lastUpdated,
    })
  } catch (error) {
    console.error("[api] Error updating articles:", error)

    return NextResponse.json(
      { error: "Failed to update articles", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST method to generate and update articles",
    description: "This endpoint will generate 10 news headlines using XAI and create 2-paragraph articles for each.",
  })
}

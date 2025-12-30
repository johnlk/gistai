# GistAI

An AI-powered news aggregation site that delivers curated news articles with intelligent summaries and insights.

## About

GistAI is a modern news platform built with Next.js that leverages artificial intelligence to provide users with comprehensive news coverage. The site curates and presents news articles in an accessible, user-friendly format.

## Features

- AI-curated news articles
- Clean, modern interface
- Article detail pages with full content
- Responsive design for all devices
- Fast, optimized performance with Next.js

## Getting Started

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
XAI_API_KEY=your-xai-api-key
API_SECRET_KEY=your-secret-key-for-api-endpoints
```

**Required Variables:**
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob Storage token for storing news data
- `XAI_API_KEY` - XAI/Grok API key for generating news content
- `API_SECRET_KEY` - Secret key for authenticating API requests (generate a secure random string)

### Running the Application

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### API Endpoints

**POST /api/articles/update** - Generate and update news articles

Requires authentication via Bearer token:

```bash
curl -X POST http://localhost:3000/api/articles/update \
  -H "Authorization: Bearer your-api-secret-key"
```

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [shadcn/ui](https://ui.shadcn.com) - UI components


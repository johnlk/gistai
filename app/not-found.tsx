import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Article Not Found</h2>
        <p className="text-muted-foreground mb-6">The article you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/" className="text-primary hover:underline">
          Return to headlines
        </Link>
      </div>
    </div>
  )
}

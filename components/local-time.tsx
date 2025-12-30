"use client"

export function LocalTime({ isoString }: { isoString: string }) {
  return (
    <>
      {new Date(isoString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })}
    </>
  )
}

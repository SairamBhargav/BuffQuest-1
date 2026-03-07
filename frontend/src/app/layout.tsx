import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BuffQuest',
  description: 'AI Moderated Quests',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

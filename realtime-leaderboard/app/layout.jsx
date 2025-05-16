import { Inter } from "next/font/google"
import "./globals.css"
import { Button } from "@/components/ui/button"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Gaming Leaderboard",
  description: "A modern gaming-inspired leaderboard",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

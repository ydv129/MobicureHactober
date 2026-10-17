import "./globals.css"
export const metadata = { title: "MobiCure Forensics", description: "Lightweight image authenticity analysis" }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}

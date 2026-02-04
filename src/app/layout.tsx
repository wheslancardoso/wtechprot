import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    description: "Gerenciamento inteligente de Ordens de Serviço",
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
          {/* Speculation Rules API para navegação instantânea */}
          <script
            type="speculationrules"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                prerender: [
                  {
                    where: {
                      href_matches: ["/login", "/signup/*"]
                    },
                    eagerness: "moderate"
                  }
                ],
                prefetch: [
                  {
                    where: {
                      href_matches: "/os/*"
                    },
                    eagerness: "moderate"
                  }
                ]
              })
            }}
          />
        </body>
      </html>
    );
}

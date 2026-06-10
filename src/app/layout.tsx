import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { SplashScreen } from "../components/SplashScreen";

export const metadata: Metadata = {
  title: "Hub Events Agent",
  description: "AI-агент для поиска событий Astana Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SplashScreen>{children}</SplashScreen>
        </ThemeProvider>
      </body>
    </html>
  );
}

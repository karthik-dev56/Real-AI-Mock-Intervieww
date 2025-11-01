import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Toaster } from "sonner";

const outfit = Outfit({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Mock Interview",
  description: "Practice and improve your interview skills with AI-powered mock interviews tailored to your dream job.",
  icons: {
    icon: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={outfit.className}
        >
          <ConvexClientProvider>
            <Toaster position="top-center" />
            {children}
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

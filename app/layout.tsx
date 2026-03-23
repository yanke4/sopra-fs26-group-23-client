import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Bruno_Ace_SC,
  Audiowide,
  Inter,
} from "next/font/google";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@/styles/globals.css";
import Navbar from "@/components/navbar";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const audiowide = Audiowide({
  variable: "--font-audiowide",
  weight: "400",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const brunoAceSC = Bruno_Ace_SC({
  variable: "--font-bruno",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Conquest of Europe",
  description:
    "A competitive multiplayer game where players build and manage their own empires, engaging in strategic battles to conquer territories and dominate the map.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "bg-[#0e0c06] overscroll-none",
        "font-sans",
        inter.variable,
      )}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${brunoAceSC.variable} ${audiowide.variable} overscroll-none`}
      >
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              // general theme options are set in token, meaning all primary elements (button, menu, ...) will have this color
              colorPrimary: "#22426b", // selected input field boarder will have this color as well
              borderRadius: 8,
              colorText: "#fff",
              fontSize: 16,

              // Alias Token
              colorBgContainer: "#16181D",
            },
            // if a component type needs special styling, setting here will override default options set in token
            components: {
              Button: {
                colorPrimary: "#75bd9d", // this will color all buttons in #75bd9d, overriding the default primaryColor #22426b set in token line 35
                algorithm: true, // enable algorithm (redundant with line 33 but here for demo purposes)
                controlHeight: 38,
              },
              Input: {
                colorBorder: "gray", // color boarder selected is not overridden but instead is set by primary color in line 35
                colorTextPlaceholder: "#888888",
                algorithm: false, // disable algorithm (line 32)
              },
              Form: {
                labelColor: "#fff",
                algorithm: theme.defaultAlgorithm, // specify a specifc algorithm instead of true/false
              },
              Card: {},
            },
          }}
        >
          <AntdRegistry>
            <AntdApp>
              <div className="relative min-h-screen bg-linear-to-b from-[#0e0c06] via-[#23200f] to-[#3a3118]">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCB_QY1bE9pEqSG54YVxNGRHsysiKiEzydl30HkImz6sfDlbbO-aegmnUY9oF3mYuVDEW1XaalPYPHRjWDD7BjG41BaSwBzxE2mtWWPAfQCX3u1dIZw1igHzKAEhATPiGxR3oNswUwPAEOhLy7JWebMVbleyELyxQh0PxJzXY3jxzsAN_nETp7b-pkKlx4IK84tDL6rQER7F7QtAt5YBsodV9Ypk6K5HVmgwsB2sYsUvdakCkaqu5RvJEC6UkBvkm0T-JsRqaMcEOjE"
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-5 pointer-events-none select-none"
                />
                <Navbar />
                {children}
              </div>
            </AntdApp>
          </AntdRegistry>
        </ConfigProvider>
      </body>
    </html>
  );
}

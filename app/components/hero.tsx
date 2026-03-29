import React, { useState } from "react";
import { Swords, Shield, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: Swords,
    title: "Command Your Army",
    description:
      "Deploy battalions across the continent. Every move counts in the theatre of war.",
  },
  {
    icon: Shield,
    title: "Seal Alliances",
    description:
      "Negotiate with rival powers. Betray or be betrayed: trust is your sharpest weapon.",
  },
  {
    icon: Crown,
    title: "Claim the Throne",
    description:
      "Outlast your enemies and plant your flag across the capitals of Europe.",
  },
];

export default function Hero() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center gap-10 px-6 py-5 -mt-14">
      <div className="flex flex-col items-center gap-5 px-16 py-14 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.65)_0%,transparent_70%)]">
        <span className="font-audiowide text-xs tracking-[0.4em] text-[#FFD900]/60 uppercase border border-[#FFD900]/20 px-4 py-1.5 rounded-full">
          Multiplayer Strategy
        </span>

        <h1 className="text-7xl font-audiowide font-bold leading-tight tracking-wider text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
          CONQUEST OF{" "}
          <span className="text-[#FFD900] [text-shadow:0_0_30px_rgba(255,217,0,0.5),0_0_60px_rgba(255,217,0,0.2)]">
            EUROPE
          </span>
        </h1>

        <div className="flex items-center gap-3 w-full max-w-sm">
          <div className="flex-1 h-px bg-linear-to-r from-transparent to-[#FFD900]/40" />
          <Swords size={14} className="text-[#FFD900]/50" />
          <div className="flex-1 h-px bg-linear-to-l from-transparent to-[#FFD900]/40" />
        </div>

        <p className="text-sm text-white/55 max-w-md leading-relaxed tracking-wide">
          Master the Continent. Rule the Age. Forge alliances, deploy your grand
          army, and claim your place in history.
        </p>
      </div>

      <div className="flex gap-4 -mt-12">
        <Button
          onClick={() => {
            setDropdownOpen(false);
            router.push("/lobby");
          }}
          className="px-9 py-3 font-audiowide text-sm tracking-widest uppercase rounded-md bg-[#FFD900] text-[#0e0c06] font-bold border-none shadow-[0_0_24px_rgba(255,217,0,0.3)] hover:bg-[#ffe44d] hover:shadow-[0_0_36px_rgba(255,217,0,0.55)] active:scale-95 cursor-pointer"
        >
          Create Lobby
        </Button>
        <Button onClick={() => {
            setDropdownOpen(false);
            router.push("/joinLobby");
        }}
          className="px-9 py-3 font-audiowide text-sm tracking-widest uppercase rounded-md bg-transparent border border-[#FFD900]/40 text-[#FFD900] hover:bg-[#FFD900]/8 hover:border-[#FFD900] hover:text-[#FFD900] hover:shadow-[0_0_20px_rgba(255,217,0,0.15)] active:scale-95 cursor-pointer">
          Join Lobby
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 mt-2">
        {features.map(({ icon: Icon, title, description }) => (
          <Card
            key={title}
            className="group w-90 lg:w-72 rounded-md border border-[#FFD900]/12 bg-[rgba(14,12,6,0.55)] backdrop-blur-sm gap-3 transition-all duration-300 hover:border-[#FFD900]/35 hover:bg-[rgba(28,24,8,0.7)] hover:shadow-[0_0_24px_rgba(255,217,0,0.07)]"
          >
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 border border-[#FFD900]/20 text-[#FFD900]/60 transition-all duration-300 group-hover:border-[#FFD900]/50 group-hover:text-[#FFD900]">
                  <Icon size={16} />
                </div>
                <span className="font-audiowide text-xs tracking-widest text-white/80 uppercase">
                  {title}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/45 leading-relaxed transition-colors duration-300 group-hover:text-white/65">
                {description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

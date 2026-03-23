"use client";
import { useRouter } from "next/navigation";
import Hero from "./components/hero";

export default function Home() {
  const router = useRouter();
  return (
    <div>
      <Hero />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { ApplicationError } from "@/types/error";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Swords, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const { set: setToken } = useLocalStorage<string>("token", "");
  const { set: setUser } = useLocalStorage<User | null>("user", null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.post<User>("/auth/login", {
        username,
        password,
      });

      if (response.token) {
        setToken(response.token);
      }

      setUser(response);
      router.push("/profile");
    } catch (error: unknown) {
      if (error instanceof Error && "status" in error) {
        const appError = error as ApplicationError;
        if (appError.status === 401) {
          setError("Invalid username or password.");
        } else if (appError.status === 404) {
          setError("User not found.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center gap-8 px-6 py-5 -mt-14">
      <div className="flex flex-col items-center gap-5 px-16 py-14 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.65)_0%,transparent_70%)]">
        <h1 className="text-5xl font-audiowide font-bold leading-tight tracking-wider text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
          SIGN{" "}
          <span className="text-[#FFD900] [text-shadow:0_0_30px_rgba(255,217,0,0.5),0_0_60px_rgba(255,217,0,0.2)]">
            IN
          </span>
        </h1>

        <div className="flex items-center gap-3 w-full max-w-sm">
          <div className="flex-1 h-px bg-linear-to-r from-transparent to-[#FFD900]/40" />
          <Swords size={14} className="text-[#FFD900]/50" />
          <div className="flex-1 h-px bg-linear-to-l from-transparent to-[#FFD900]/40" />
        </div>

        <p className="text-sm text-white/55 max-w-md leading-relaxed tracking-wide">
          Your empire awaits, Commander. Identify yourself to continue.
        </p>
      </div>

      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-5 w-full max-w-sm -mt-6"
      >
        <div className="flex flex-col gap-2 text-left">
          <label className="font-audiowide text-xs tracking-widest text-[#FFD900]/60 uppercase">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError(null);
            }}
            placeholder="Enter your username"
            className="w-full px-4 py-3 rounded-md bg-[rgba(14,12,6,0.55)] border border-[#FFD900]/20 text-white placeholder-white/30 font-sans text-sm tracking-wide outline-none backdrop-blur-sm transition-all duration-300 focus:border-[#FFD900]/60 focus:shadow-[0_0_16px_rgba(255,217,0,0.1)]"
          />
        </div>

        <div className="flex flex-col gap-2 text-left">
          <label className="font-audiowide text-xs tracking-widest text-[#FFD900]/60 uppercase">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Enter your password"
              className="w-full px-4 py-3 pr-11 rounded-md bg-[rgba(14,12,6,0.55)] border border-[#FFD900]/20 text-white placeholder-white/30 font-sans text-sm tracking-wide outline-none backdrop-blur-sm transition-all duration-300 focus:border-[#FFD900]/60 focus:shadow-[0_0_16px_rgba(255,217,0,0.1)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#FFD900] transition-colors duration-200 bg-transparent border-none outline-none cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 tracking-wide animate-pulse">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="mt-2 px-9 py-3 font-audiowide text-sm tracking-widest uppercase rounded-md bg-[#FFD900] text-[#0e0c06] font-bold border-none shadow-[0_0_24px_rgba(255,217,0,0.3)] hover:bg-[#ffe44d] hover:shadow-[0_0_36px_rgba(255,217,0,0.55)] active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogIn size={16} />
          {loading ? "Entering..." : "Enter the War"}
        </Button>

        <div className="flex items-center gap-3 w-full mt-2">
          <div className="flex-1 h-px bg-linear-to-r from-transparent to-white/10" />
          <span className="text-xs text-white/30 tracking-widest uppercase">
            or
          </span>
          <div className="flex-1 h-px bg-linear-to-l from-transparent to-white/10" />
        </div>

        <Button
          type="button"
          onClick={() => router.push("/register")}
          className="px-9 py-3 font-audiowide text-sm tracking-widest uppercase rounded-md bg-transparent border border-[#FFD900]/40 text-[#FFD900] hover:bg-[#FFD900]/8 hover:border-[#FFD900] hover:text-[#FFD900] hover:shadow-[0_0_20px_rgba(255,217,0,0.15)] active:scale-95 cursor-pointer"
        >
          <UserPlus size={16} />
          Register Now
        </Button>
      </form>
    </div>
  );
};

export default Login;

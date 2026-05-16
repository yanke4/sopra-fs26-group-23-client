"use client";

import { useState, useEffect, useRef } from "react";
import { Swords, Send, Smile } from "lucide-react";

interface CurrentUser {
  id: string;
  name: string;
  color: string;
}

interface ChatMessage {
  playerId: string;
  username: string;
  color: string;
  message: string;
  gameId: string;
  timestamp: number;
  isSystem?: boolean;
}

interface OnlinePlayer {
  id: string;
  name: string;
  color: string;
}

interface PusherMemberInfo {
  name: string;
  color: string;
}

interface PusherMember {
  id: string;
  info: PusherMemberInfo;
}

interface PusherMembers {
  each: (fn: (member: PusherMember) => void) => void;
}

interface PusherChannel {
  bind: (event: string, callback: (data: unknown) => void) => void;
  unbind_all: () => void;
}

interface PusherInstance {
  subscribe: (channel: string) => PusherChannel;
  unsubscribe: (channel: string) => void;
  disconnect: () => void;
}

interface GameChatProps {
  gameId: string;
  currentUser: CurrentUser;
  apiUrl: string;
}

const COLOR_MAP: Record<string, { bg: string; light: string }> = {
  red:    { bg: "#b91c1c", light: "#fee2e2" },
  blue:   { bg: "#4361EE", light: "#dbeafe" },
  green:  { bg: "#15803d", light: "#dcfce7" },
  yellow: { bg: "#FFD60A", light: "#fef9c3" },
  purple: { bg: "#bc12df", light: "#f3e8ff" },
  gray:   { bg: "#374151", light: "#f3f4f6" },
  orange: { bg: "#f37005", light: "#fff4e1" },
};

function getColor(color: string) {
  return COLOR_MAP[color.toLowerCase()] ?? COLOR_MAP.blue;
}

function Avatar({ name, color, size = 26 }: { name: string; color: string; size?: number }) {
  const { bg } = getColor(color);
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0 ring-1 ring-white/10"
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: size * 0.42,
      }}
    >
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

function Message({ msg, isOwn }: { msg: ChatMessage; isOwn: boolean }) {
  const { bg, light } = getColor(msg.color);
  const time = new Date(msg.timestamp).toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      className={`flex items-end gap-1.5 max-w-[85%] ${
        isOwn ? "flex-row-reverse self-end" : "flex-row self-start"
      }`}
    >
      {!isOwn && <Avatar name={msg.username} color={msg.color} />}
      <div className={`flex flex-col gap-0.5 ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && (
          <span
            className="text-[9px] font-audiowide tracking-[0.15em] uppercase px-1"
            style={{ color: bg }}
          >
            {msg.username}
          </span>
        )}
        <div
          className="px-3 py-1.5 text-[12px] leading-snug break-words shadow-sm"
          style={{
            background: isOwn ? bg : light,
            color: isOwn ? "#fff" : "#1c1917",
            borderRadius: isOwn ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
          }}
        >
          {msg.message}
        </div>
        <span
          className={`text-[9px] font-mono text-white/25 px-1 ${
            isOwn ? "text-right" : "text-left"
          }`}
        >
          {time}
        </span>
      </div>
    </div>
  );
}

function SystemMessage({ text }: { text: string }) {
  return (
    <div className="text-center text-[10px] italic text-white/30 py-1 tracking-wider font-audiowide uppercase">
      {text}
    </div>
  );
}

const EMOTES = ["😂", "😎", "😢", "😡", "👍", "👎", "🤝", "💀", "🔥"];

function EmotePicker({ onSelect }: { onSelect: (emote: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 p-2 border border-[#FFD900]/15 rounded-md bg-[rgba(14,12,6,0.97)] shadow-[0_8px_24px_rgba(0,0,0,0.7)] max-w-[200px]">
      {EMOTES.map((emote) => (
        <button
          key={emote}
          onClick={() => onSelect(emote)}
          className="text-base leading-none w-7 h-7 flex items-center justify-center rounded border border-transparent hover:border-[#FFD900]/40 hover:bg-[#FFD900]/10 transition-colors cursor-pointer"
        >
          {emote}
        </button>
      ))}
    </div>
  );
}

export default function GameChat({ gameId, currentUser, apiUrl }: GameChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [connected, setConnected] = useState(false);
  const [showEmotes, setShowEmotes] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const channelRef = useRef<PusherChannel | null>(null);
  const pusherRef = useRef<PusherInstance | boolean | null>(null);
  const currentUserRef = useRef<CurrentUser>(currentUser);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
  let cancelled = false;

  const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY ?? "d10223ce93fd20bcd040";
  const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "eu";

  const initPusher = async () => {
    const PusherClient = (await import("pusher-js")).default;

    if (cancelled) return;

    const pusherClient = new PusherClient(pusherKey, {
      cluster: pusherCluster,
      channelAuthorization: {
        endpoint: `${apiUrl}/chat/auth`,
        transport: "ajax",
        headers: {
          "x-user-id":    currentUser.id,
          "x-user-name":  currentUser.name,
          "x-user-color": currentUser.color,
        },
      },
    });

    pusherRef.current = pusherClient;

    const channel = pusherClient.subscribe(`presence-game-${gameId}`) as unknown as PusherChannel;
    channelRef.current = channel;

    channel.bind("pusher:subscription_succeeded", (members: unknown) => {
      setConnected(true);
      const players: OnlinePlayer[] = [];
      (members as PusherMembers).each((m) => players.push({ id: m.id, ...m.info }));
      setOnlinePlayers(players);
    });

    channel.bind("new-message", (data: unknown) => {
      const msg = data as ChatMessage;
      if (String(msg.playerId) === String(currentUserRef.current.id)) return;
      setMessages((prev) => [...prev, msg]);
    });
  };

  initPusher();

  return () => {
    cancelled = true;
    if (channelRef.current) {
      channelRef.current.unbind_all();
      channelRef.current = null;
    }
    const p = pusherRef.current;
    if (p && typeof p !== "boolean") {
      p.unsubscribe(`presence-game-${gameId}`);
      p.disconnect();
      pusherRef.current = null;
    }
  };
}, [gameId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || !connected) return;

    const msg: ChatMessage = {
      gameId:     gameId,
      playerId:   currentUser.id,
      username:   currentUser.name,
      color:      currentUser.color.toUpperCase(),
      message:    text,
      timestamp:  Date.now(),
    };

    setMessages((prev) => [...prev, msg]);
    setInputText("");
    setShowEmotes(false);
    inputRef.current?.focus();

    try {
      await fetch(`${apiUrl}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...msg,
          gameId: Number(msg.gameId),
          playerId: Number(msg.playerId),
        }),
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const sendEmote = (emote: string) => {
    setInputText((prev) => prev + emote);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const canSend = inputText.trim().length > 0 && connected;

  return (
    <div className="flex flex-col h-full min-h-0 bg-[rgba(14,12,6,0.85)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#FFD900]/10">
        <div className="flex items-center gap-2">
          <Swords size={12} className="text-[#FFD900]/70" />
          <span className="font-audiowide text-[10px] tracking-[0.2em] text-white/60 uppercase">
            War Council
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              connected
                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                : "bg-amber-400 animate-pulse"
            }`}
          />
          <span
            className={`font-audiowide text-[9px] tracking-[0.15em] uppercase ${
              connected ? "text-emerald-300/80" : "text-amber-300/80"
            }`}
          >
            {connected ? "Live" : "Connecting"}
          </span>
        </div>
      </div>

      {/* Online players */}
      {onlinePlayers.length > 0 && (
        <div className="flex flex-wrap gap-1 px-3 py-1.5 border-b border-[#FFD900]/8 bg-[rgba(255,217,0,0.025)]">
          {onlinePlayers.map((p) => {
            const { bg } = getColor(p.color);
            const isYou = p.id === currentUser.id;
            return (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-audiowide"
                style={{
                  borderColor: `${bg}55`,
                  borderWidth: 1,
                  borderStyle: "solid",
                  color: bg,
                  background: `${bg}11`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: bg }}
                />
                {p.name}
                {isYou && <span className="text-white/40 normal-case">· you</span>}
              </span>
            );
          })}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="m-auto flex flex-col items-center gap-2 text-center">
            <Swords size={20} className="text-[#FFD900]/20" />
            <span className="font-audiowide text-[10px] tracking-[0.2em] text-white/25 uppercase">
              The war council awaits
            </span>
          </div>
        )}
        {messages.map((msg, i) =>
          msg.isSystem
            ? <SystemMessage key={i} text={msg.message} />
            : <Message key={i} msg={msg} isOwn={msg.playerId === currentUser.id} />
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="relative border-t border-[#FFD900]/10 bg-[rgba(14,12,6,0.95)]">
        {showEmotes && (
          <div className="absolute bottom-full left-3 mb-2 z-10">
            <EmotePicker
              onSelect={(e) => {
                sendEmote(e);
                setShowEmotes(false);
              }}
            />
          </div>
        )}
        <div className="flex items-end gap-1.5 px-2 py-2 min-w-0">
          <button
            type="button"
            onClick={() => setShowEmotes((v) => !v)}
            className={`w-8 h-8 rounded-md flex items-center justify-center border transition-colors shrink-0 cursor-pointer ${
              showEmotes
                ? "bg-[#FFD900]/15 border-[#FFD900]/40 text-[#FFD900]"
                : "bg-white/5 border-[#FFD900]/15 text-white/50 hover:text-[#FFD900] hover:border-[#FFD900]/30"
            }`}
            aria-label="Toggle emotes"
          >
            <Smile size={14} />
          </button>
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={connected ? "Message…" : "Connecting…"}
            disabled={!connected}
            rows={1}
            className="flex-1 min-w-0 resize-none rounded-md border border-[#FFD900]/15 bg-white/5 px-2.5 py-1.5 text-[12px] text-white/85 placeholder:text-white/25 outline-none focus:border-[#FFD900]/40 focus:bg-white/8 transition-colors disabled:opacity-50 leading-snug"
            style={{ minHeight: 32, maxHeight: 90 }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 90) + "px";
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!canSend}
            className={`w-8 h-8 rounded-md flex items-center justify-center transition-all shrink-0 ${
              canSend
                ? "bg-[#FFD900] text-[#0e0c06] hover:bg-[#ffe44d] shadow-[0_0_12px_rgba(255,217,0,0.3)] cursor-pointer active:scale-95"
                : "bg-white/5 text-white/20 border border-white/10 cursor-not-allowed"
            }`}
            aria-label="Send message"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";

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
  blue:   { bg: "#1d4ed8", light: "#dbeafe" },
  green:  { bg: "#15803d", light: "#dcfce7" },
  yellow: { bg: "#a16207", light: "#fef9c3" },
  black:  { bg: "#1c1917", light: "#e7e5e4" },
  purple: { bg: "#7e22ce", light: "#f3e8ff" },
};

function getColor(color: string) {
  return COLOR_MAP[color.toLowerCase()] ?? COLOR_MAP.blue;
}

function Avatar({ name, color, size = 28 }: { name: string; color: string; size?: number }) {
  const { bg } = getColor(color);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.43, fontWeight: 600, flexShrink: 0,
    }}>
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
    <div style={{
      display: "flex",
      flexDirection: isOwn ? "row-reverse" : "row",
      alignItems: "flex-end",
      gap: 2,
      maxWidth: "78%",
      alignSelf: isOwn ? "flex-end" : "flex-start",
    }}>
      {!isOwn && <Avatar name={msg.username} color={msg.color} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {!isOwn && (
          <span style={{
            fontSize: 11, fontWeight: 600, color: bg,
            paddingLeft: 4, letterSpacing: "0.04em",
          }}>
            {msg.username}
          </span>
        )}
        <div style={{
          padding: "8px 12px",
          borderRadius: isOwn ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
          background: isOwn ? bg : light,
          color: isOwn ? "#fff" : "#1c1917",
          fontSize: 14, lineHeight: 1.5, wordBreak: "break-word",
        }}>
          {msg.message}
        </div>
        <span style={{
          fontSize: 10, color: "#a8a29e",
          textAlign: isOwn ? "right" : "left",
          paddingLeft: isOwn ? 0 : 4,
          paddingRight: isOwn ? 4 : 0,
        }}>
          {time}
        </span>
      </div>
    </div>
  );
}

function SystemMessage({ text }: { text: string }) {
  return (
    <div style={{
      textAlign: "center", fontSize: 11,
      color: "#a8a29e", padding: "2px 0",
      letterSpacing: "0.04em", fontStyle: "italic",
    }}>
      {text}
    </div>
  );
}

const EMOTES = ["😂", "😎", "😢", "😡", "👍", "👎", "🤝", "💀", "🔥", "🖕"];

function EmotePicker({onSelect}: {onSelect: (emote: string) => void}) {
  return (
    <div style={{ display: "flex", 
      gap: 4, 
      padding: "4px 10px", 
      flexWrap: "wrap",
      borderTop: "1px solid rgba(180,120,40,0.2)" }}>
      {EMOTES.map((emote) => (
        <button key={emote} onClick={() => onSelect(emote)} style={{
          fontSize: 18, 
          padding: "2px 5px", 
          borderRadius: 6,
          border: "1px solid rgba(180,120,40,0.3)",
          background: "rgba(255,255,255,0.05)", 
          cursor: "pointer",
        }}>
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

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", minHeight: 0, flex:1,  background: "#0d0c0b",
      borderTop: "1px solid rgba(180,120,40,0.2)",
      overflow: "hidden", fontFamily: "var(--font-bruno)",
    }}>
      {/* Header */}
      <div style={{
        padding: "6px 12px",
        borderBottom: "1px solid rgba(16, 16, 15, 0.2)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(251,191,36,0.7)", letterSpacing: "0.1em",}}>
          War council
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: connected ? "#15803d" : "#a16207",
          }} />
          <span style={{ fontSize: 10, color: connected ? "#4ade80" : "#fbbf24", fontFamily: "var(--font-audiowide)" }}>
            {connected ? "Live" : "Connecting…"}
          </span>
        </div>
      </div>

      {/* Online players */}
      {onlinePlayers.length > 0 && (
        <div style={{
          padding: "4px 10px",
          borderBottom: "1px solid rgba(180,120,40,0.1)",
          display: "flex", gap: 4, flexWrap: "wrap",
        }}>
          {onlinePlayers.map((p) => {
            const { bg } = getColor(p.color);
            return (
              <span key={p.id} style={{
                fontSize: 10, padding: "1px 6px", borderRadius: 99,
                background: "rgba(255,255,255,0.05)",
                color: bg, fontWeight: 600,
                border: `1px solid ${bg}40`,
              }}>
                {p.name}{p.id === currentUser.id ? " (you)" : ""}
              </span>
            );
          })}
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "10px 10px 6px",
        display: "flex", flexDirection: "column", gap: 2,
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: "center", color: "rgba(255,255,255,0.2)",
            fontSize: 11, margin: "auto", fontFamily: "var(--font-audiowide)",
          }}>
            The war council awaits…
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
      <div style={{
        padding: "8px 10px",
        borderTop: "1px solid rgba(180,120,40,0.2)",
        display: "flex", gap: 6, alignItems: "flex-end",
      }}>
        <textarea
          ref={inputRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={connected ? "Message… (Enter)" : "Enter your demands!"}
          disabled={!connected}
          rows={1}
          style={{
            flex: 1, resize: "none",
            border: "1px solid rgba(180,120,40,0.3)", borderRadius: 6,
            padding: "6px 6px", fontSize: 10,
            fontFamily: "var(--font-audiowide)",
            color: "rgba(255,255,255,0.8)",
            background: "rgba(255,255,255,0.05)",
            outline: "none", minHeight: 25, maxHeight: 80, lineHeight: 1.5,
          }}
          onInput={(e) => {
            const t = e.target as HTMLTextAreaElement;
            t.style.height = "auto";
            t.style.height = Math.min(t.scrollHeight, 80) + "px";
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!inputText.trim() || !connected}
          style={{
            width: 30, height: 30, borderRadius: "50%", border: "none",
            background: inputText.trim() && connected ? "#b91c1c" : "rgba(255,255,255,0.1)",
            color: "#fff",
            cursor: inputText.trim() && connected ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "background 0.15s",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>   
      <EmotePicker onSelect={sendEmote} />     
    </div>
  );
}
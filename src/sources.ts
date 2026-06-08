import type { StreamSource } from "./types";

export const STREAM_SOURCES: StreamSource[] = [
  // ── Streaming ─────────────────────────────────────────────────────────────
  {
    id: "youtube",
    name: "YouTube",
    url: "https://www.youtube.com/tv",
    icon: "▶",
    color: "#FF0000",
    category: "streaming",
    featured: true,
  },
  {
    id: "disney",
    name: "Disney+",
    url: "https://www.disneyplus.com",
    icon: "✦",
    color: "#1133AA",
    category: "streaming",
    featured: true,
  },
  {
    id: "prime",
    name: "Prime Video",
    url: "https://www.primevideo.com",
    icon: "⬡",
    color: "#00A8E0",
    category: "streaming",
    featured: true,
  },
  {
    id: "netflix",
    name: "Netflix",
    url: "https://www.netflix.com/browse",
    icon: "N",
    color: "#E50914",
    category: "streaming",
    featured: true,
  },
  {
    id: "hbo",
    name: "Max",
    url: "https://www.max.com",
    icon: "◈",
    color: "#5822B4",
    category: "streaming",
  },
  {
    id: "apple",
    name: "Apple TV+",
    url: "https://tv.apple.com",
    icon: "",
    color: "#555555",
    category: "streaming",
  },
  {
    id: "mubi",
    name: "MUBI",
    url: "https://mubi.com",
    icon: "◉",
    color: "#E85D3A",
    category: "streaming",
  },
  {
    id: "twitch",
    name: "Twitch",
    url: "https://www.twitch.tv",
    icon: "◈",
    color: "#9146FF",
    category: "streaming",
  },
  // ── Sports ────────────────────────────────────────────────────────────────
  {
    id: "eleven",
    name: "Eleven Sports",
    url: "https://elevensports.com",
    icon: "⚽",
    color: "#FF6B00",
    category: "sports",
    featured: true,
  },
  {
    id: "dazn",
    name: "DAZN",
    url: "https://www.dazn.com",
    icon: "⬟",
    color: "#F8EC00",
    category: "sports",
  },
  {
    id: "canal",
    name: "Canal+ Sport",
    url: "https://sport.canalplus.com",
    icon: "C",
    color: "#00A0DC",
    category: "sports",
  },
  {
    id: "meczyki",
    name: "Meczyki",
    url: "https://meczyki.pl",
    icon: "⚽",
    color: "#009900",
    category: "sports",
  },
  // ── Social / Live ─────────────────────────────────────────────────────────
  {
    id: "vimeo",
    name: "Vimeo",
    url: "https://vimeo.com",
    icon: "◎",
    color: "#1AB7EA",
    category: "social",
  },
  {
    id: "dailymotion",
    name: "Dailymotion",
    url: "https://www.dailymotion.com",
    icon: "◑",
    color: "#003C8F",
    category: "social",
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  streaming: "Streaming",
  sports: "Sport",
  social: "Live & Social",
  custom: "Własne",
};

export const FEATURED = STREAM_SOURCES.filter((s) => s.featured);

/* ------------------------------------------------------------------
 * 25 · SOCIAL & CLANS — feed, clan chat mock, leaderboards, gifts
 * ------------------------------------------------------------------ */
import { AnimatePresence, motion } from "framer-motion";
import { Gift, Heart, MessageCircle, Share2, Trophy, Users, Zap } from "lucide-react";
import { useState } from "react";
import { Tag } from "../components/ui";
import { GameSection } from "../fx/gamekit";
import { Reveal } from "../fx/effects";
import { sfx } from "../fx/sfx";
import { cn } from "../utils/cn";

type Props = { onXp: (n: number) => void; toast: (t: string, s: string, tone?: string) => void };

const feed = [
  { u: "CryptoQueen", a: "CQ", c: "#ff5470", t: "Just beat RSI Dragon on first try 🐉", likes: 128, comments: 14 },
  { u: "HodlMaster", a: "HM", c: "#ffc531", t: "Season pass tier 30 — prestige unlocked.", likes: 86, comments: 9 },
  { u: "Satoshi_Fan", a: "SF", c: "#5b8cff", t: "3★ on Risk School. Who's next?", likes: 64, comments: 22 },
  { u: "DegenHunter", a: "DH", c: "#a78bff", t: "Liquidation Survivor 30s with ×40 💀", likes: 201, comments: 41 },
  { u: "ChartWizard", a: "CW", c: "#2ede8a", t: "New guide: pin-bars that actually work.", likes: 155, comments: 33 },
];

const clan = [
  { u: "You", m: "Anyone for raid at 21:00?" },
  { u: "CQ", m: "I'm in. Bring ults." },
  { u: "HM", m: "Need 1 more for full party." },
  { u: "SF", m: "On my way 🚀" },
];

const board = [
  { n: "Bulls United", xp: 128400, m: 48 },
  { n: "Diamond Hands", xp: 119200, m: 52 },
  { n: "YOUR CLAN", xp: 108800, m: 37 },
  { n: "RSI Rejects", xp: 99200, m: 41 },
  { n: "Funding Farmers", xp: 87400, m: 29 },
];

export default function SocialClans({ onXp, toast }: Props) {
  const [likes, setLikes] = useState(feed.map(f => f.likes));
  const [liked, setLiked] = useState<number[]>([]);
  const [chat, setChat] = useState(clan);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState<"feed" | "clan" | "board">("feed");

  const like = (i: number) => {
    if (liked.includes(i)) return;
    setLiked(l => [...l, i]);
    setLikes(ls => ls.map((v, k) => k === i ? v + 1 : v));
    sfx.pop();
  };

  const send = () => {
    if (!msg.trim()) return;
    setChat(c => [...c, { u: "You", m: msg.trim() }]);
    setMsg(""); sfx.soft();
  };

  return (
    <GameSection id="social" index="25" kicker="Social" title="Лента, клан и таблицы"
      desc="Социальный слой award-winning игры: лента с лайками, чат клана, клановый лидерборд и подарки за активность."
      right={<div className="flex gap-2"><Tag tone="blue"><Users size={11} /> 2.4k online</Tag></div>}>

      <div className="mb-4 flex gap-2">
        {(["feed", "clan", "board"] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); sfx.tick(); }}
            className={cn("rounded-xl px-4 py-2 text-xs font-extrabold capitalize", tab === t ? "bg-[#8ef23c] text-[#0a2210]" : "bg-white/5 text-[#8ea6d8]")}>{t}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "feed" && (
          <motion.div key="feed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {feed.map((f, i) => (
              <Reveal key={f.u} delay={i * 0.04}>
                <div className="panel-3d p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-black" style={{ background: `${f.c}25`, color: f.c }}>{f.a}</span>
                    <div><p className="text-sm font-extrabold text-white">{f.u}</p><p className="text-[10px] text-[#7d92c4]">2h ago · Diamond League</p></div>
                  </div>
                  <p className="mt-3 text-sm text-[#dbe6ff]">{f.t}</p>
                  <div className="mt-3 flex gap-4">
                    <button onClick={() => like(i)} className="flex items-center gap-1.5 text-xs font-bold text-[#8ea6d8] hover:text-[#ff5470]">
                      <Heart size={14} className={liked.includes(i) ? "fill-[#ff5470] text-[#ff5470]" : ""} /> {likes[i]}
                    </button>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#8ea6d8]"><MessageCircle size={14} /> {f.comments}</span>
                    <button onClick={() => { sfx.soft(); toast("Shared", f.u, "blue"); }} className="flex items-center gap-1.5 text-xs font-bold text-[#8ea6d8]"><Share2 size={14} /> Share</button>
                    <button onClick={() => { onXp(5); sfx.coin(); toast("Gift sent", "+5 XP", "gold"); }} className="ml-auto flex items-center gap-1.5 text-xs font-bold text-[#ffc531]"><Gift size={14} /> Gift</button>
                  </div>
                </div>
              </Reveal>
            ))}
          </motion.div>
        )}
        {tab === "clan" && (
          <motion.div key="clan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="panel-3d flex h-[420px] flex-col p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="display text-sm font-extrabold text-white">Bulls United · 37 members</p>
              <Tag tone="green">Online 12</Tag>
            </div>
            <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto">
              {chat.map((c, i) => (
                <div key={i} className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-xs", c.u === "You" ? "ml-auto bg-[#8ef23c]/20 text-[#a4ff5e]" : "bg-white/5 text-[#dbe6ff]")}>
                  <p className="text-[10px] font-extrabold opacity-70">{c.u}</p>
                  {c.m}
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
                placeholder="Message clan…" className="field-3d flex-1 px-3 py-2.5 text-sm text-white" />
              <button onClick={send} className="btn3d btn3d-green px-4 py-2.5 text-xs">Send</button>
            </div>
          </motion.div>
        )}
        {tab === "board" && (
          <motion.div key="board" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
            {board.map((b, i) => (
              <div key={b.n} className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3", b.n.includes("YOUR") ? "border-[#8ef23c]/50 bg-[#8ef23c]/10" : "border-white/10 bg-black/25")}>
                <span className={cn("num-mono w-6 text-sm font-black", i < 3 ? "text-[#ffc531]" : "text-[#54678f]")}>{i + 1}</span>
                <Trophy size={18} className={i < 3 ? "text-[#ffc531]" : "text-[#54678f]"} />
                <div className="flex-1">
                  <p className="text-sm font-extrabold text-white">{b.n}</p>
                  <p className="text-[10px] text-[#7d92c4]">{b.m} members</p>
                </div>
                <span className="num-mono text-xs font-bold text-[#8ea6d8]">{b.xp.toLocaleString()} XP</span>
              </div>
            ))}
            <button onClick={() => { onXp(20); sfx.success(); toast("Clan quest", "+20 XP", "green"); }} className="btn3d btn3d-blue mt-3 w-full py-3 text-xs">
              <Zap size={14} /> Contribute weekly quest
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </GameSection>
  );
}

import { useState, useRef, useEffect } from "react";

// ── Supabase config ─────────────────────────────────────────
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "https://cktwtfavcpadtfupynmq.supabase.co";
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrdHd0ZmF2Y3BhZHRmdXB5bm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMDU5NDcsImV4cCI6MjA5Njc4MTk0N30.NhruoRIl9fa0bqfnzLOu4tU6u2-4WLvhO_6-Zr_x-Vs";

async function sbFetch(path, method = "GET", body = null) {
  const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, options);
  const text = await res.text();
  if (!res.ok) throw new Error(text);
  return text ? JSON.parse(text) : null;
}

const db = {
  from: (table) => ({
    select: (cols = "*") => ({
      eq: (col, val) => sbFetch(`${table}?${col}=eq.${encodeURIComponent(val)}&select=${cols}`),
      order: (col, { ascending } = {}) => sbFetch(`${table}?order=${col}.${ascending ? "asc" : "desc"}&select=${cols}`),
      then: (resolve, reject) => sbFetch(`${table}?select=${cols}`).then(resolve).catch(reject),
    }),
    insert: (data) => ({
      select: () => sbFetch(`${table}`, "POST", data),
    }),
    update: (data) => ({
      eq: (col, val) => sbFetch(`${table}?${col}=eq.${encodeURIComponent(val)}`, "PATCH", data),
    }),
    delete: () => ({
      eq: (col, val) => sbFetch(`${table}?${col}=eq.${encodeURIComponent(val)}`, "DELETE"),
    }),
  }),
};

// ── Colours & constants ─────────────────────────────────────
const COLORS = {
  cream: "#FAF7F2",
  creamDark: "#F0EBE3",
  ink: "#1C1917",
  inkSoft: "#44403C",
  inkMute: "#78716C",
  green: "#3D6B4F",
  greenLight: "#EBF2ED",
  amber: "#B45309",
  amberLight: "#FEF3C7",
  red: "#9B2335",
  redLight: "#FDE8EB",
  white: "#FFFFFF",
};

const INTENSITY = {
  green: { label: "Gentle", color: COLORS.green, bg: COLORS.greenLight, dot: "#3D6B4F" },
  amber: { label: "Deeper", color: COLORS.amber, bg: COLORS.amberLight, dot: "#B45309" },
  red: { label: "Vulnerable", color: COLORS.red, bg: COLORS.redLight, dot: "#9B2335" },
  spicy: { label: "🌶️", color: "#C2410C", bg: "#FFF0E6", dot: "#C2410C", emojiOnly: true },
};

// ── Session persistence ──────────────────────────────────────
const SESSION_KEY = "wonder_session";
function saveSession(session) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (e) {}
}
function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function clearSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
}

// ── Onboarding screens ───────────────────────────────────────
function WelcomeScreen({ onNext }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between", background: COLORS.cream }}>
      {/* Concept B — the path alone */}
      <svg width="100%" viewBox="0 0 390 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", flexShrink: 0 }}>
        <rect width="390" height="200" fill="#F0EBE3"/>
        <defs>
          <linearGradient id="skyB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EBF2ED" stopOpacity="0.6"/>
            <stop offset="60%" stopColor="#F5F0E8" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#F0EBE3" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <rect width="390" height="200" fill="url(#skyB)"/>
        <path d="M0 140 Q100 100 200 120 Q300 140 390 110 L390 200 L0 200 Z" fill="#E8E2D9" opacity="0.7"/>
        <path d="M0 155 Q70 135 150 148 Q230 161 310 142 Q350 133 390 140 L390 200 L0 200 Z" fill="#DDD6CB" opacity="0.5"/>
        <path d="M0 170 Q50 160 120 168 Q200 176 280 162 Q335 152 390 158 L390 200 L0 200 Z" fill="#C8BFB0" opacity="0.3"/>
        <path d="M 80 200 C 100 185 125 175 140 160 C 158 143 148 130 165 118 C 182 106 205 108 218 96 C 232 83 228 68 245 58" stroke="#C8BFB0" strokeWidth="22" strokeLinecap="round" fill="none"/>
        <path d="M 80 200 C 100 185 125 175 140 160 C 158 143 148 130 165 118 C 182 106 205 108 218 96 C 232 83 228 68 245 58" stroke="#B8B0A4" strokeWidth="22" strokeLinecap="round" fill="none" opacity="0.3"/>
        <path d="M 80 200 C 100 185 125 175 140 160 C 158 143 148 130 165 118 C 182 106 205 108 218 96 C 232 83 228 68 245 58" stroke="#FAF7F2" strokeWidth="3" strokeLinecap="round" strokeDasharray="10 16" fill="none" opacity="0.7"/>
        <circle cx="50" cy="148" r="22" fill="#3D6B4F" opacity="0.15"/>
        <circle cx="36" cy="155" r="16" fill="#3D6B4F" opacity="0.12"/>
        <circle cx="62" cy="142" r="18" fill="#3D6B4F" opacity="0.13"/>
        <line x1="50" y1="168" x2="50" y2="200" stroke="#3D6B4F" strokeWidth="2" opacity="0.2"/>
        <circle cx="310" cy="138" r="20" fill="#3D6B4F" opacity="0.13"/>
        <circle cx="328" cy="144" r="15" fill="#3D6B4F" opacity="0.11"/>
        <circle cx="295" cy="145" r="16" fill="#3D6B4F" opacity="0.12"/>
        <path d="M 0 118 Q 40 108 80 112 Q 120 116 160 108 Q 200 100 240 105 Q 280 110 320 102 Q 355 95 390 98 L390 118 L0 118 Z" fill="#3D6B4F" opacity="0.08"/>
        <ellipse cx="245" cy="58" rx="60" ry="30" fill="#FEF3C7" opacity="0.35"/>
        <ellipse cx="245" cy="58" rx="30" ry="16" fill="#FDE68A" opacity="0.2"/>
      </svg>
      <div style={{ padding: "28px 32px 0" }}>
        <div style={{ width: 52, height: 52, borderRadius: "22.4%", background: COLORS.white, border: `1.5px solid ${COLORS.creamDark}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontFamily: "Lora, serif", fontSize: 24, fontWeight: 500, color: COLORS.ink, lineHeight: 1 }}>W</span>
            <div style={{ display: "flex", gap: 7 }}>
              <div style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: COLORS.ink, opacity: 0.4 }} />
              <div style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: COLORS.ink, opacity: 0.4 }} />
            </div>
          </div>
        </div>
        <h1 style={{ fontFamily: "Lora, serif", fontSize: 34, fontWeight: 400, color: COLORS.ink, lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.5px" }}>Wonder</h1>
        <p style={{ fontFamily: "Lora, serif", fontSize: 17, fontWeight: 400, color: COLORS.inkSoft, lineHeight: 1.6, fontStyle: "italic", marginBottom: 12 }}>For the things you've been meaning to ask.</p>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 300, color: COLORS.inkMute, lineHeight: 1.7, marginBottom: 8 }}>For two people who want to know each other better.</p>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 400, color: COLORS.inkSoft, lineHeight: 1.7, fontStyle: "italic" }}>One phone. Present together. Real conversations.</p>
      </div>
      <div style={{ padding: "24px 32px 56px" }}>
        <div style={{ marginBottom: 32 }}>
          {[
            { dot: "#3D6B4F", text: "Questions that matter to you, not to anyone else" },
            { dot: "#B45309", text: "Drawn randomly when you're ready" },
            { dot: "#9B2335", text: "A quiet record of everything you've talked about" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.dot, flexShrink: 0 }} />
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 300, color: COLORS.inkSoft, lineHeight: 1.5 }}>{item.text}</p>
            </div>
          ))}
        </div>
        <button onClick={onNext} style={{ width: "100%", padding: "18px", background: COLORS.ink, color: COLORS.cream, border: "none", borderRadius: 16, fontFamily: "Lora, serif", fontSize: 17, fontWeight: 400, cursor: "pointer", boxShadow: "0 4px 20px rgba(28,25,23,0.18)" }}>
          Get started
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: COLORS.inkMute, fontWeight: 300, marginTop: 14, fontFamily: "Inter, sans-serif" }}>No account needed to try it</p>
      </div>
    </div>
  );
}

function NameScreen({ onNext, onBack }) {
  const [name, setName] = useState("");
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 32px 56px", background: COLORS.cream }}>
      <div>
        <button onClick={onBack} style={{ background: "none", border: "none", fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.inkMute, cursor: "pointer", padding: 0, marginBottom: 32, display: "flex", alignItems: "center", gap: 6 }}>← back</button>
        <div style={{ width: 40, height: 40, borderRadius: "22.4%", background: COLORS.white, border: `1.5px solid ${COLORS.creamDark}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontFamily: "Lora, serif", fontSize: 18, fontWeight: 500, color: COLORS.ink, lineHeight: 1 }}>W</span>
            <div style={{ display: "flex", gap: 5 }}>
              <div style={{ width: 2.5, height: 2.5, borderRadius: "50%", background: COLORS.ink, opacity: 0.4 }} />
              <div style={{ width: 2.5, height: 2.5, borderRadius: "50%", background: COLORS.ink, opacity: 0.4 }} />
            </div>
          </div>
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "1.2px", textTransform: "uppercase", color: COLORS.inkMute, marginBottom: 32 }}>Step 1 of 2</p>
        <h2 style={{ fontFamily: "Lora, serif", fontSize: 28, fontWeight: 400, color: COLORS.ink, lineHeight: 1.3, marginBottom: 12 }}>What's your name?</h2>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 300, color: COLORS.inkMute, lineHeight: 1.6, marginBottom: 40 }}>Just your first name. Your partner will see this when you add a question.</p>
        <input type="text" placeholder="Your first name" value={name} onChange={e => setName(e.target.value)} autoFocus
          style={{ width: "100%", padding: "16px", border: `1.5px solid ${name ? COLORS.inkSoft : COLORS.creamDark}`, borderRadius: 14, background: COLORS.white, fontFamily: "Lora, serif", fontSize: 18, color: COLORS.ink, outline: "none", transition: "border-color 0.2s ease" }} />
      </div>
      <button onClick={() => name.trim() && onNext(name.trim())} disabled={!name.trim()}
        style={{ width: "100%", padding: "18px", background: name.trim() ? COLORS.ink : COLORS.creamDark, color: name.trim() ? COLORS.cream : COLORS.inkMute, border: "none", borderRadius: 16, fontFamily: "Lora, serif", fontSize: 17, fontWeight: 400, cursor: name.trim() ? "pointer" : "default", transition: "all 0.2s ease", boxShadow: name.trim() ? "0 4px 20px rgba(28,25,23,0.18)" : "none" }}>
        Continue
      </button>
    </div>
  );
}

function ConnectScreen({ name, onConnect, onSkip, onBack }) {
  const [mode, setMode] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const myCode = useRef(name.toUpperCase().slice(0, 3) + Math.floor(1000 + Math.random() * 9000));

  const [registeredId, setRegisteredId] = useState(null);
  const [registering, setRegistering] = useState(false);

  // Register the code the moment the invite screen is shown
  useEffect(() => {
    if (mode === "invite" && !registeredId && !registering) {
      (async () => {
        setRegistering(true);
        setError(null);
        try {
          const data = await db.from("users").insert({ name, couple_code: myCode.current }).select();
          setRegisteredId(data[0].id);
        } catch (e) {
          setError(`Couldn't create your code: ${e.message.slice(0, 120)}`);
        }
        setRegistering(false);
      })();
    }
  }, [mode]);

  function handleInvite() {
    if (!registeredId) return;
    onConnect({ name, coupleCode: myCode.current, userId: registeredId, isNew: true });
  }

  async function handleJoin() {
    setLoading(true);
    setError(null);
    try {
      const users = await db.from("users").select().eq("couple_code", code.trim());
      if (!users || users.length === 0) {
        setError("Code not found. Check with your person.");
        setLoading(false);
        return;
      }
      const partner = users[0];
      const me = await db.from("users").insert({ name, couple_code: name.toUpperCase().slice(0, 3) + Date.now(), partner_id: partner.id }).select();
      await db.from("users").update({ partner_id: me[0].id }).eq("id", partner.id);
      onConnect({ name, coupleCode: code.trim(), userId: me[0].id, partnerId: partner.id });
    } catch (e) {
      setError(`Error: ${e.message.slice(0, 100)}`);
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "72px 32px 56px", background: COLORS.cream }}>
      <div>
        <button onClick={onBack} style={{ background: "none", border: "none", fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.inkMute, cursor: "pointer", padding: 0, marginBottom: 32, display: "flex", alignItems: "center", gap: 6 }}>← back</button>
        <div style={{ width: 40, height: 40, borderRadius: "22.4%", background: COLORS.white, border: `1.5px solid ${COLORS.creamDark}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <span style={{ fontFamily: "Lora, serif", fontSize: 18, fontWeight: 500, color: COLORS.ink, lineHeight: 1 }}>W</span>
            <div style={{ display: "flex", gap: 5 }}>
              <div style={{ width: 2.5, height: 2.5, borderRadius: "50%", background: COLORS.ink, opacity: 0.4 }} />
              <div style={{ width: 2.5, height: 2.5, borderRadius: "50%", background: COLORS.ink, opacity: 0.4 }} />
            </div>
          </div>
        </div>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "1.2px", textTransform: "uppercase", color: COLORS.inkMute, marginBottom: 32 }}>Step 2 of 2</p>
        <h2 style={{ fontFamily: "Lora, serif", fontSize: 28, fontWeight: 400, color: COLORS.ink, lineHeight: 1.3, marginBottom: 12 }}>Connect with your person</h2>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 300, color: COLORS.inkMute, lineHeight: 1.6, marginBottom: 40 }}>Wonder works best with two. Invite your person or enter their code.</p>

        {!mode && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={() => setMode("invite")} style={{ width: "100%", padding: "20px", background: COLORS.white, border: `1.5px solid ${COLORS.creamDark}`, borderRadius: 16, textAlign: "left", cursor: "pointer" }}>
              <p style={{ fontFamily: "Lora, serif", fontSize: 16, color: COLORS.ink, marginBottom: 4 }}>Invite my person</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.inkMute, fontWeight: 300 }}>Share a code for them to enter</p>
            </button>
            <button onClick={() => setMode("join")} style={{ width: "100%", padding: "20px", background: COLORS.white, border: `1.5px solid ${COLORS.creamDark}`, borderRadius: 16, textAlign: "left", cursor: "pointer" }}>
              <p style={{ fontFamily: "Lora, serif", fontSize: 16, color: COLORS.ink, marginBottom: 4 }}>I have a code</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.inkMute, fontWeight: 300 }}>Enter the code your person shared</p>
            </button>
          </div>
        )}

        {mode === "invite" && (
          <div>
            <button onClick={() => setMode(null)} style={{ background: "none", border: "none", fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.inkMute, cursor: "pointer", marginBottom: 24, padding: 0 }}>← back</button>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "0.8px", textTransform: "uppercase", color: COLORS.inkMute, marginBottom: 12 }}>Your code</p>
            <div style={{ background: COLORS.white, border: `1.5px solid ${COLORS.creamDark}`, borderRadius: 16, padding: "28px", textAlign: "center", marginBottom: 20 }}>
              <p style={{ fontFamily: "Lora, serif", fontSize: 32, fontWeight: 500, color: COLORS.ink, letterSpacing: 4 }}>{myCode.current}</p>
            </div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 300, color: registering ? COLORS.inkMute : COLORS.green, lineHeight: 1.6, textAlign: "center", marginBottom: 24 }}>
              {registering ? "Setting up your code…" : registeredId ? "✓ Your code is live. Share it with your person — once they enter it, you'll be connected." : ""}
            </p>
            {error && <p style={{ color: COLORS.red, fontSize: 12, marginBottom: 16, textAlign: "center" }}>{error}</p>}
            <button onClick={handleInvite} disabled={!registeredId} style={{ width: "100%", padding: "18px", background: registeredId ? COLORS.ink : COLORS.creamDark, color: registeredId ? COLORS.cream : COLORS.inkMute, border: "none", borderRadius: 16, fontFamily: "Lora, serif", fontSize: 17, cursor: registeredId ? "pointer" : "default", boxShadow: registeredId ? "0 4px 20px rgba(28,25,23,0.18)" : "none" }}>
              Continue
            </button>
          </div>
        )}

        {mode === "join" && (
          <div>
            <button onClick={() => setMode(null)} style={{ background: "none", border: "none", fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.inkMute, cursor: "pointer", marginBottom: 24, padding: 0 }}>← back</button>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "0.8px", textTransform: "uppercase", color: COLORS.inkMute, marginBottom: 12 }}>Enter code</p>
            <input type="text" placeholder="ABC1234" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              style={{ width: "100%", padding: "16px", border: `1.5px solid ${code ? COLORS.inkSoft : COLORS.creamDark}`, borderRadius: 14, background: COLORS.white, fontFamily: "Lora, serif", fontSize: 22, color: COLORS.ink, outline: "none", textAlign: "center", letterSpacing: 3, marginBottom: 20 }} />
            {error && <p style={{ color: COLORS.red, fontSize: 12, marginBottom: 16, textAlign: "center" }}>{error}</p>}
            {code.length >= 6 && (
              <button onClick={handleJoin} disabled={loading} style={{ width: "100%", padding: "18px", background: COLORS.ink, color: COLORS.cream, border: "none", borderRadius: 16, fontFamily: "Lora, serif", fontSize: 17, cursor: "pointer", boxShadow: "0 4px 20px rgba(28,25,23,0.18)" }}>
                {loading ? "Connecting…" : "Connect"}
              </button>
            )}
          </div>
        )}
      </div>
      <button onClick={onSkip} style={{ width: "100%", padding: "14px", background: "none", border: "none", fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.inkMute, cursor: "pointer", fontWeight: 300 }}>
        Skip for now — explore on my own
      </button>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=Inter:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  body { background: #FAF7F2; font-family: 'Inter', sans-serif; color: #1C1917; min-height: 100vh; max-width: 430px; margin: 0 auto; }

  .screen { min-height: 100vh; display: flex; flex-direction: column; background: #FAF7F2; }
  .header { padding: 56px 28px 20px; background: #FAF7F2; }
  .logo { font-family: 'Lora', serif; font-size: 26px; font-weight: 400; color: #1C1917; letter-spacing: -0.3px; }
  .tagline { font-size: 12px; color: #78716C; margin-top: 3px; font-weight: 300; letter-spacing: 0.2px; }
  .divider { height: 1px; background: #F0EBE3; margin: 0 28px; }
  .scroll-area { flex: 1; overflow-y: auto; padding: 24px 28px; }
  .section-label { font-size: 10px; font-weight: 500; letter-spacing: 1.2px; text-transform: uppercase; color: #78716C; margin-bottom: 16px; }

  .question-card { background: #FFFFFF; border-radius: 16px; padding: 18px 20px; margin-bottom: 12px; border: 1px solid transparent; }
  .question-card-top { display: flex; align-items: flex-start; gap: 12px; }
  .intensity-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
  .question-text { font-family: 'Lora', serif; font-size: 15px; line-height: 1.55; color: #1C1917; flex: 1; }
  .question-meta { display: flex; align-items: center; gap: 8px; margin-top: 10px; padding-left: 22px; }
  .intensity-badge { font-size: 10px; font-weight: 500; padding: 3px 8px; border-radius: 20px; letter-spacing: 0.3px; }
  .author-tag { font-size: 10px; color: #78716C; font-weight: 300; }

  .nav-tabs { display: flex; gap: 4px; background: #F0EBE3; border-radius: 12px; padding: 4px; }
  .nav-tab { flex: 1; padding: 10px 0; border: none; background: transparent; border-radius: 9px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 400; color: #78716C; cursor: pointer; transition: all 0.2s ease; }
  .nav-tab.active { background: #FFFFFF; color: #1C1917; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }

  @keyframes revealQuestion { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes revealCard { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
  @keyframes revealActions { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }

  .draw-screen { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 56px 28px 64px; text-align: center; background: #FAF7F2; }
  .draw-card { width: 100%; border-radius: 24px; padding: 36px 28px; margin-bottom: 28px; box-shadow: 0 4px 32px rgba(28,25,23,0.1); text-align: left; }
  .draw-card-intensity { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
  .draw-question { font-family: 'Lora', serif; font-size: 20px; font-weight: 400; line-height: 1.65; color: #1C1917; font-style: italic; word-wrap: break-word; overflow-wrap: break-word; width: 100%; }
  .draw-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

  .draw-btn { width: 100%; padding: 20px; background: #1C1917; color: #FAF7F2; border: none; border-radius: 20px; font-family: 'Lora', serif; font-size: 18px; font-weight: 400; cursor: pointer; transition: opacity 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease; letter-spacing: -0.2px; margin-bottom: 12px; box-shadow: 0 4px 20px rgba(28,25,23,0.18); position: relative; overflow: hidden; }
  .draw-btn:active { opacity: 0.85; transform: scale(0.98); }
  .draw-btn:disabled { opacity: 0.35; cursor: default; box-shadow: none; }

  .pill-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 24px; border: 1.5px solid #F0EBE3; background: transparent; font-family: 'Inter', sans-serif; font-size: 13px; color: #44403C; cursor: pointer; transition: all 0.15s ease; }
  .pill-btn:active { opacity: 0.7; }
  .pill-btn:disabled { opacity: 0.4; cursor: default; }
  .pill-btn.primary { background: #1C1917; border-color: #1C1917; color: #FAF7F2; }

  .empty-state { text-align: center; padding: 48px 24px; }
  .empty-title { font-family: 'Lora', serif; font-size: 20px; font-weight: 400; color: #1C1917; margin-bottom: 10px; }
  .empty-body { font-size: 14px; color: #78716C; line-height: 1.6; font-weight: 300; }

  .sheet-overlay { position: fixed; inset: 0; background: rgba(28,25,23,0.4); z-index: 100; display: flex; align-items: flex-end; animation: fadeIn 0.2s ease; }
  .sheet { width: 100%; background: #FAF7F2; border-radius: 24px 24px 0 0; padding: 28px 28px 48px; animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1); max-height: 90vh; overflow-y: auto; }
  .sheet-handle { width: 36px; height: 4px; background: #F0EBE3; border-radius: 2px; margin: 0 auto 24px; }
  .sheet-title { font-family: 'Lora', serif; font-size: 22px; font-weight: 400; margin-bottom: 6px; }
  .sheet-subtitle { font-size: 13px; color: #78716C; margin-bottom: 28px; font-weight: 300; line-height: 1.5; }
  .field-label { font-size: 11px; font-weight: 500; letter-spacing: 0.8px; text-transform: uppercase; color: #78716C; margin-bottom: 10px; }

  textarea { width: 100%; padding: 16px; border: 1.5px solid #F0EBE3; border-radius: 14px; background: #FFFFFF; font-family: 'Lora', serif; font-size: 15px; line-height: 1.55; color: #1C1917; resize: none; outline: none; transition: border-color 0.2s ease; margin-bottom: 12px; }
  textarea:focus { border-color: #44403C; }

  .ai-box { border-radius: 14px; padding: 14px 16px; margin-bottom: 20px; border: 1.5px solid #F0EBE3; background: #FFFFFF; }
  .ai-box-label { font-size: 10px; font-weight: 500; letter-spacing: 0.8px; text-transform: uppercase; color: #78716C; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
  .ai-suggestion-text { font-family: 'Lora', serif; font-size: 14px; line-height: 1.55; color: #1C1917; font-style: italic; margin-bottom: 12px; }
  .ai-actions { display: flex; gap: 8px; }
  .ai-action-btn { padding: 7px 14px; border-radius: 20px; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; cursor: pointer; border: 1.5px solid #F0EBE3; background: transparent; color: #44403C; transition: all 0.15s ease; }
  .ai-action-btn.accept { background: #1C1917; border-color: #1C1917; color: #FAF7F2; }

  .intensity-picker { display: flex; gap: 8px; margin-bottom: 28px; }
  .intensity-option { flex: 1; padding: 12px 8px; border-radius: 14px; border: 2px solid transparent; cursor: pointer; transition: all 0.15s ease; text-align: center; }
  .intensity-option.selected { border-color: currentColor; }
  .intensity-option-dot { width: 12px; height: 12px; border-radius: 50%; margin: 0 auto 6px; }
  .intensity-option-label { font-size: 11px; font-weight: 500; display: block; }

  .stats-strip { display: flex; background: #FFFFFF; border-radius: 16px; overflow: hidden; margin-bottom: 16px; }
  .stat-item { flex: 1; padding: 16px 12px; text-align: center; border-right: 1px solid #F0EBE3; }
  .stat-item:last-child { border-right: none; }
  .stat-number { font-family: 'Lora', serif; font-size: 24px; font-weight: 400; display: block; }
  .stat-label { font-size: 10px; color: #78716C; font-weight: 300; display: block; margin-top: 2px; letter-spacing: 0.3px; }

  .back-btn { display: flex; align-items: center; gap: 6px; background: none; border: none; font-family: 'Inter', sans-serif; font-size: 13px; color: #78716C; cursor: pointer; padding: 0; margin-bottom: 24px; }
  .notification-dot { width: 7px; height: 7px; background: #9B2335; border-radius: 50%; display: inline-block; margin-left: 4px; vertical-align: middle; }

  .ai-intensity-suggestion { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #FFFFFF; border-radius: 12px; border: 1.5px solid #F0EBE3; margin-top: -16px; margin-bottom: 20px; font-size: 12px; color: #44403C; }
`;

// ── Main app ─────────────────────────────────────────────────
export default function WonderApp() {
  const [onboarding, setOnboarding] = useState("welcome");
  const [userName, setUserName] = useState("");
  const [userSession, setUserSession] = useState(null);
  const [tab, setTab] = useState("pool");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newQ, setNewQ] = useState("");
  const [newIntensity, setNewIntensity] = useState(null);
  const [drawnQuestion, setDrawnQuestion] = useState(null);
  const [showDraw, setShowDraw] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showVulnerablePause, setShowVulnerablePause] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const pollTimer = useRef(null);

  const pool = questions.filter(q => !q.discussed && !q.skipped);
  const archive = questions.filter(q => q.discussed);
  const skipped = questions.filter(q => q.skipped && !q.discussed);

  // Restore session on load — keeps you signed in on this device
  useEffect(() => {
    const saved = loadSession();
    if (saved && saved.name) {
      setUserName(saved.name);
      setUserSession(saved);
      setOnboarding("done");
    }
  }, []);

  // Load questions from Supabase
  async function loadQuestions(coupleCode) {
    if (!coupleCode) return;
    try {
      const data = await db.from("questions").select().eq("couple_code", coupleCode);
      if (data) setQuestions(data.map(q => ({
        id: q.id,
        text: q.text,
        intensity: q.intensity,
        author: q.author_id === userSession?.userId ? "you" : "partner",
        discussed: q.discussed,
        skipped: q.skipped,
      })));
    } catch (e) {
      console.error("Load error:", e);
    }
  }

  // Poll for new questions every 10 seconds
  useEffect(() => {
    if (userSession?.coupleCode) {
      loadQuestions(userSession.coupleCode);
      pollTimer.current = setInterval(() => loadQuestions(userSession.coupleCode), 10000);
    }
    return () => clearInterval(pollTimer.current);
  }, [userSession]);

  function handleConnect(session) {
    setUserSession(session);
    saveSession(session);
    setOnboarding("done");
  }

  function handleSkip() {
    const session = { name: userName, coupleCode: null, userId: null };
    setUserSession(session);
    saveSession(session);
    setOnboarding("done");
  }

  function resetSheet() {
    setNewQ("");
    setNewIntensity(null);
    setEditingId(null);
    setSaveError(null);
  }

  function openEdit(q) {
    setEditingId(q.id);
    setNewQ(q.text);
    setNewIntensity(q.intensity);
    setSaveError(null);
    setShowAddSheet(true);
  }

  async function saveQuestion() {
    if (!newQ.trim() || !newIntensity) return;
    setSaveError(null);
    try {
      if (editingId) {
        if (userSession?.coupleCode) {
          await db.from("questions").update({ text: newQ.trim(), intensity: newIntensity }).eq("id", editingId);
          await loadQuestions(userSession.coupleCode);
        } else {
          setQuestions(prev => prev.map(q => q.id === editingId ? { ...q, text: newQ.trim(), intensity: newIntensity } : q));
        }
      } else {
        if (userSession?.coupleCode && userSession?.userId) {
          await db.from("questions").insert({ text: newQ.trim(), intensity: newIntensity, author_id: userSession.userId, couple_code: userSession.coupleCode, discussed: false, skipped: false });
          await loadQuestions(userSession.coupleCode);
        } else if (userSession?.coupleCode && !userSession?.userId) {
          setSaveError("Your session is out of date — please sign out and reconnect with your person.");
          return;
        } else {
          setQuestions(prev => [{ id: Date.now(), text: newQ.trim(), intensity: newIntensity, author: "you", discussed: false, skipped: false }, ...prev]);
        }
      }
    } catch (e) {
      setSaveError(`Couldn't save: ${String(e.message || e).slice(0, 120)}`);
      return;
    }
    resetSheet();
    setShowAddSheet(false);
  }

  async function deleteQuestion(id) {
    try {
      
      if (userSession?.coupleCode) {
        await db.from("questions").delete().eq("id", id);
        await loadQuestions(userSession.coupleCode);
      } else {
        setQuestions(prev => prev.filter(q => q.id !== id));
      }
    } catch (e) {}
    resetSheet();
    setShowAddSheet(false);
  }

  function drawQuestion() {
    if (pool.length === 0) return;
    const idx = Math.floor(Math.random() * pool.length);
    const q = pool[idx];
    setDrawnQuestion(q);
    setRevealed(false);
    if (navigator.vibrate) navigator.vibrate([10, 50, 20]);
    if (q.intensity === "red") {
      setShowVulnerablePause(true);
    } else {
      setShowDraw(true);
      setTimeout(() => setRevealed(true), 1200);
    }
  }

  function confirmVulnerable() {
    setShowVulnerablePause(false);
    setShowDraw(true);
    setTimeout(() => setRevealed(true), 1200);
  }

  async function markDiscussed() {
    try {
      
      if (userSession?.coupleCode) {
        await db.from("questions").update({ discussed: true, skipped: false }).eq("id", drawnQuestion.id);
        await loadQuestions(userSession.coupleCode);
      } else {
        setQuestions(prev => prev.map(q => q.id === drawnQuestion.id ? { ...q, discussed: true, skipped: false } : q));
      }
    } catch (e) {}
    setShowDraw(false);
    setDrawnQuestion(null);
  }

  async function skipQuestion() {
    try {
      
      if (userSession?.coupleCode) {
        await db.from("questions").update({ skipped: true }).eq("id", drawnQuestion.id);
        await loadQuestions(userSession.coupleCode);
      } else {
        setQuestions(prev => prev.map(q => q.id === drawnQuestion.id ? { ...q, skipped: true } : q));
      }
    } catch (e) {}
    setShowDraw(false);
    setDrawnQuestion(null);
  }

  const intensityStyle = (key) => ({ backgroundColor: INTENSITY[key].bg, color: INTENSITY[key].color });

  const IntensityIndicator = ({ intensityKey, size = 10 }) => {
    const i = INTENSITY[intensityKey];
    if (!i) return null;
    if (i.emojiOnly) return <span style={{ fontSize: size + 4 }}>🌶️</span>;
    return <span className="intensity-dot" style={{ backgroundColor: i.dot, width: size, height: size, borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />;
  };

  return (
    <>
      <style>{styles}</style>

      {onboarding === "welcome" && <WelcomeScreen onNext={() => setOnboarding("name")} />}
      {onboarding === "name" && <NameScreen onBack={() => setOnboarding("welcome")} onNext={(name) => { setUserName(name); setOnboarding("connect"); }} />}
      {onboarding === "connect" && <ConnectScreen name={userName} onBack={() => setOnboarding("name")} onConnect={handleConnect} onSkip={handleSkip} />}

      {onboarding === "done" && (<>

        {/* VULNERABLE PAUSE */}
        {showVulnerablePause && (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 32px", background: COLORS.cream, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: COLORS.redLight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.red, display: "inline-block" }} />
            </div>
            <h2 style={{ fontFamily: "Lora, serif", fontSize: 26, fontWeight: 400, color: COLORS.ink, marginBottom: 16, lineHeight: 1.3 }}>This one goes somewhere real.</h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 300, color: COLORS.inkMute, lineHeight: 1.7, marginBottom: 48, maxWidth: 280 }}>Make sure you're both in a place where you can really listen to each other.</p>
            <button onClick={confirmVulnerable} style={{ width: "100%", padding: "18px", background: COLORS.ink, color: COLORS.cream, border: "none", borderRadius: 16, fontFamily: "Lora, serif", fontSize: 17, cursor: "pointer", marginBottom: 14, boxShadow: "0 4px 20px rgba(28,25,23,0.18)" }}>We're ready</button>
            <button onClick={() => { setShowVulnerablePause(false); setDrawnQuestion(null); }} style={{ background: "none", border: "none", fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.inkMute, cursor: "pointer", fontWeight: 300 }}>Not right now</button>
          </div>
        )}

        {/* DRAW SCREEN */}
        {showDraw && drawnQuestion && !showVulnerablePause && (
          <div className="draw-screen">
            <button className="back-btn" onClick={() => { setShowDraw(false); setRevealed(false); }}>← back</button>
            <div style={{ width: "100%" }}>
              {!revealed && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: COLORS.ink, margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 1.2s ease infinite" }}>
                    <span style={{ fontFamily: "Lora, serif", fontSize: 32, color: COLORS.cream }}>?</span>
                  </div>
                  <p style={{ fontFamily: "Lora, serif", fontSize: 15, color: COLORS.inkMute, fontStyle: "italic" }}>drawing your question…</p>
                </div>
              )}
              {revealed && (
                <>
                  <p style={{ fontFamily: "Lora, serif", fontSize: 13, color: COLORS.inkMute, marginBottom: 28, fontStyle: "italic", textAlign: "center", animation: "revealQuestion 0.5s ease forwards" }}>your question</p>
                  <div className="draw-card" style={{ animation: "revealCard 1s cubic-bezier(0.16,1,0.3,1) forwards", background: INTENSITY[drawnQuestion.intensity]?.bg || COLORS.white, borderLeft: `4px solid ${INTENSITY[drawnQuestion.intensity]?.dot || COLORS.ink}` }}>
                    <div className="draw-card-intensity">
                      <IntensityIndicator intensityKey={drawnQuestion.intensity} />
                      {!INTENSITY[drawnQuestion.intensity]?.emojiOnly && (
                        <span style={{ fontSize: 11, fontWeight: 500, color: INTENSITY[drawnQuestion.intensity]?.color, letterSpacing: "0.5px", textTransform: "uppercase" }}>{INTENSITY[drawnQuestion.intensity]?.label}</span>
                      )}
                    </div>
                    <p className="draw-question" style={{ animation: "revealQuestion 1.2s 0.3s ease both" }}>"{drawnQuestion.text}"</p>
                  </div>
                  <div className="draw-actions" style={{ animation: "revealActions 0.8s 0.8s ease both" }}>
                    <button className="pill-btn" onClick={skipQuestion}>Save for later</button>
                    <button className="pill-btn primary" onClick={markDiscussed}>We talked about it ✓</button>
                  </div>
                  {pool.length > 1 && (
                    <button onClick={drawQuestion} style={{ marginTop: 20, background: "none", border: "none", fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.inkMute, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3, animation: "revealActions 0.8s 1.1s ease both" }}>
                      draw a different one
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* MAIN APP */}
        {!showDraw && !showVulnerablePause && (
          <div className="screen">
            <div className="header">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "22.4%", background: COLORS.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1.5px solid ${COLORS.creamDark}` }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <span style={{ fontFamily: "Lora, serif", fontSize: 22, fontWeight: 500, color: COLORS.ink, lineHeight: 1 }}>W</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <div style={{ width: 3, height: 3, borderRadius: "50%", background: COLORS.ink, opacity: 0.4 }} />
                        <div style={{ width: 3, height: 3, borderRadius: "50%", background: COLORS.ink, opacity: 0.4 }} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="logo">Wonder</div>
                    <div className="tagline">For the things you've been meaning to ask</div>
                    <button onClick={() => { clearSession(); window.location.reload(); }} style={{ background: "none", border: "none", padding: 0, marginTop: 4, fontSize: 10, color: COLORS.inkMute, fontFamily: "Inter, sans-serif", fontWeight: 300, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>sign out</button>
                  </div>
                </div>
                <button onClick={() => { resetSheet(); setShowAddSheet(true); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 24, background: COLORS.ink, border: "none", color: COLORS.cream, fontSize: 13, fontWeight: 500, fontFamily: "Inter, sans-serif", cursor: "pointer", flexShrink: 0 }}>
                  <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add
                </button>
              </div>
            </div>

            <div className="divider" />

            <div style={{ padding: "20px 28px 0" }}>
              <div className="stats-strip">
                <div className="stat-item"><span className="stat-number" style={{ color: COLORS.green }}>{pool.length}</span><span className="stat-label">waiting</span></div>
                <div className="stat-item"><span className="stat-number" style={{ color: COLORS.inkMute }}>{archive.length}</span><span className="stat-label">discussed</span></div>
                <div className="stat-item"><span className="stat-number" style={{ color: COLORS.amber }}>{skipped.length}</span><span className="stat-label">saved</span></div>
              </div>
              <button className="draw-btn" onClick={drawQuestion} disabled={pool.length === 0}>
                {pool.length === 0 ? "No questions yet" : "Draw a question"}
              </button>
            </div>

            <div className="scroll-area">
              <div className="nav-tabs" style={{ marginBottom: 24 }}>
                <button className={`nav-tab ${tab === "pool" ? "active" : ""}`} onClick={() => setTab("pool")}>
                  Pool {pool.length > 0 && <span className="notification-dot" />}
                </button>
                <button className={`nav-tab ${tab === "archive" ? "active" : ""}`} onClick={() => setTab("archive")}>Archive</button>
                <button className={`nav-tab ${tab === "packs" ? "active" : ""}`} onClick={() => setTab("packs")}>Packs ✦</button>
              </div>

              {/* POOL TAB */}
              {tab === "pool" && (
                <>
                  {pool.length === 0 ? (
                    <div className="empty-state">
                      <div style={{ fontSize: 36, marginBottom: 20 }}>
                        <svg width="48" height="48" viewBox="0 0 80 80" fill="none">
                          <path d="M12 18 L24 56 L40 34 L56 56 L68 18" stroke={COLORS.creamDark} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="24" cy="64" r="3.5" fill={COLORS.creamDark}/>
                          <circle cx="56" cy="64" r="3.5" fill={COLORS.creamDark}/>
                        </svg>
                      </div>
                      <p className="empty-title">Your pool is empty</p>
                      <p className="empty-body" style={{ marginBottom: 28 }}>Whenever a question comes to mind — on a commute, in the shower, at 2am — add it here. It'll be waiting when you're ready.</p>
                      <button onClick={() => { resetSheet(); setShowAddSheet(true); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 24, background: COLORS.ink, border: "none", color: COLORS.cream, fontSize: 15, fontFamily: "Lora, serif", cursor: "pointer", boxShadow: "0 4px 20px rgba(28,25,23,0.15)" }}>
                        + Add your first question
                      </button>
                    </div>
                  ) : (
                    <>
                      {pool.filter(q => q.author === "you").length > 0 && (
                        <>
                          <p className="section-label">your questions · tap to edit</p>
                          {pool.filter(q => q.author === "you").map(q => (
                            <div key={q.id} className="question-card" style={{ cursor: "pointer", borderLeft: `4px solid ${INTENSITY[q.intensity]?.dot}` }} onClick={() => openEdit(q)}>
                              <div className="question-card-top">
                                <IntensityIndicator intensityKey={q.intensity} />
                                <p className="question-text">{q.text}</p>
                                <span style={{ fontSize: 13, color: COLORS.inkMute, flexShrink: 0, marginTop: 2 }}>✎</span>
                              </div>
                              <div className="question-meta">
                                {INTENSITY[q.intensity]?.emojiOnly
                                  ? <span className="intensity-badge" style={{ backgroundColor: "#FFF0E6", color: "#C2410C" }}>🌶️</span>
                                  : <span className="intensity-badge" style={intensityStyle(q.intensity)}>{INTENSITY[q.intensity]?.label}</span>
                                }
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      {pool.filter(q => q.author === "partner").length > 0 && (
                        <>
                          <p className="section-label" style={{ marginTop: pool.filter(q => q.author === "you").length > 0 ? 24 : 0 }}>from your person</p>
                          {pool.filter(q => q.author === "partner").map(q => (
                            <div key={q.id} className="question-card" style={{ cursor: "default", borderLeft: `4px solid ${INTENSITY[q.intensity]?.dot}` }}>
                              <div className="question-card-top">
                                <IntensityIndicator intensityKey={q.intensity} />
                                <p className="question-text" style={{ color: COLORS.inkMute, fontStyle: "italic" }}>Question waiting to be drawn…</p>
                              </div>
                              <div className="question-meta">
                                {INTENSITY[q.intensity]?.emojiOnly
                                  ? <span className="intensity-badge" style={{ backgroundColor: "#FFF0E6", color: "#C2410C" }}>🌶️</span>
                                  : <span className="intensity-badge" style={intensityStyle(q.intensity)}>{INTENSITY[q.intensity]?.label}</span>
                                }
                                <span className="author-tag">added by your person</span>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </>
                  )}
                  {skipped.length > 0 && (
                    <>
                      <p className="section-label" style={{ marginTop: 28 }}>saved for later</p>
                      {skipped.map(q => (
                        <div key={q.id} className="question-card" style={{ opacity: 0.6, borderLeft: `4px solid ${INTENSITY[q.intensity]?.dot}` }}>
                          <div className="question-card-top">
                            <IntensityIndicator intensityKey={q.intensity} />
                            <p className="question-text">{q.text}</p>
                          </div>
                          <div className="question-meta">
                            {INTENSITY[q.intensity]?.emojiOnly
                              ? <span className="intensity-badge" style={{ backgroundColor: "#FFF0E6", color: "#C2410C" }}>🌶️</span>
                              : <span className="intensity-badge" style={intensityStyle(q.intensity)}>{INTENSITY[q.intensity]?.label}</span>
                            }
                            <button onClick={async () => {
                              
                              if (userSession?.coupleCode) {
                                await db.from("questions").update({ skipped: false }).eq("id", q.id);
                                await loadQuestions(userSession.coupleCode);
                              } else {
                                setQuestions(prev => prev.map(qq => qq.id === q.id ? { ...qq, skipped: false } : qq));
                              }
                            }} style={{ fontSize: 10, color: COLORS.green, background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                              put back →
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}

              {/* ARCHIVE TAB */}
              {tab === "archive" && (
                <>
                  {archive.length === 0 ? (
                    <div className="empty-state">
                      <p className="empty-title">Nothing here yet</p>
                      <p className="empty-body">Questions you've talked about together will live here — a quiet record of your conversations.</p>
                    </div>
                  ) : (
                    <>
                      <p className="section-label">discussed</p>
                      {archive.map(q => (
                        <div key={q.id} style={{ background: COLORS.white, borderRadius: 16, padding: "16px 18px", marginBottom: 10, borderLeft: `4px solid ${INTENSITY[q.intensity]?.dot}` }}>
                          <p style={{ fontFamily: "Lora, serif", fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.55, marginBottom: 8, fontStyle: "italic" }}>"{q.text}"</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {INTENSITY[q.intensity]?.emojiOnly
                              ? <span style={{ fontSize: 11 }}>🌶️</span>
                              : <span style={{ fontSize: 10, fontWeight: 500, color: INTENSITY[q.intensity]?.color, backgroundColor: INTENSITY[q.intensity]?.bg, padding: "2px 8px", borderRadius: 20 }}>{INTENSITY[q.intensity]?.label}</span>
                            }
                            <span style={{ fontSize: 10, color: COLORS.inkMute, fontWeight: 300 }}>added by {q.author}</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}

              {/* PACKS TAB */}
              {tab === "packs" && (
                <>
                  <p className="section-label">question packs</p>
                  <p style={{ fontSize: 13, color: COLORS.inkMute, fontWeight: 300, lineHeight: 1.6, marginBottom: 24 }}>Curated questions for when you want a starting point. One-off purchase, yours to keep.</p>
                  {[
                    { name: "Light", desc: "For any moment together. Easy to answer, always interesting.", intensity: "green", price: "£0.99", count: 30 },
                    { name: "Deep", desc: "For when you want to go somewhere more personal.", intensity: "amber", price: "£1.99", count: 30 },
                    { name: "Vulnerable", desc: "For when you're ready to really open up. Take your time with these.", intensity: "red", price: "£1.99", count: 25 },
                    { name: "Us", desc: "The private world of two people. Questions only you two can answer.", intensity: "green", price: "£0.99", count: 24 },
                  ].map((pack, i) => (
                    <div key={i} style={{ background: COLORS.white, borderRadius: 20, padding: "20px", marginBottom: 14, borderLeft: `4px solid ${INTENSITY[pack.intensity]?.dot}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                        <IntensityIndicator intensityKey={pack.intensity} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontFamily: "Lora, serif", fontSize: 16, fontWeight: 400, marginBottom: 2 }}>{pack.name}</p>
                          <p style={{ fontSize: 11, color: COLORS.inkMute, fontWeight: 300 }}>{pack.count} questions</p>
                        </div>
                        <button style={{ padding: "8px 16px", borderRadius: 24, border: `1.5px solid ${COLORS.creamDark}`, background: "transparent", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 500, color: COLORS.inkSoft, cursor: "pointer", whiteSpace: "nowrap" }}>
                          {pack.price}
                        </button>
                      </div>
                      <p style={{ fontSize: 12, color: COLORS.inkSoft, fontWeight: 300, lineHeight: 1.55, fontStyle: "italic", fontFamily: "Lora, serif" }}>{pack.desc}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* ADD / EDIT SHEET */}
        {showAddSheet && (
          <div className="sheet-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddSheet(false)}>
            <div className="sheet">
              <div className="sheet-handle" />
              <h2 className="sheet-title">{editingId ? "Edit question" : "Add a question"}</h2>
              <p className="sheet-subtitle">{editingId ? "Change the wording or how it feels — your call." : "Something you've been meaning to ask."}</p>

              <p className="field-label">Your question</p>
              <textarea rows={3} placeholder="What have you always wanted to know?" value={newQ} onChange={e => setNewQ(e.target.value)} />

              <p className="field-label" style={{ marginBottom: 10, marginTop: 8 }}>How it feels</p>
              <div className="intensity-picker">
                {Object.entries(INTENSITY).map(([key, val]) => (
                  <div key={key} className={`intensity-option ${newIntensity === key ? "selected" : ""}`}
                    style={{ backgroundColor: newIntensity === key ? val.bg : COLORS.white, color: val.color, borderColor: newIntensity === key ? val.dot : "transparent" }}
                    onClick={() => setNewIntensity(key)}>
                    {val.emojiOnly ? <div style={{ fontSize: 18, marginBottom: 6, lineHeight: 1 }}>🌶️</div> : <div className="intensity-option-dot" style={{ backgroundColor: val.dot }} />}
                    {!val.emojiOnly && <span className="intensity-option-label">{val.label}</span>}
                  </div>
                ))}
              </div>

              {saveError && <div style={{ background: COLORS.redLight, color: COLORS.red, borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 12, lineHeight: 1.5 }}>{saveError}</div>}

              <button className="pill-btn primary" style={{ width: "100%", justifyContent: "center", padding: "16px", borderRadius: 14, fontSize: 15 }} onClick={saveQuestion} disabled={!newQ.trim() || !newIntensity}>
                {editingId ? "Save changes" : "Add to pool"}
              </button>

              {editingId && (
                <button onClick={() => deleteQuestion(editingId)} style={{ width: "100%", marginTop: 12, padding: "12px", background: "none", border: "none", color: COLORS.red, fontSize: 13, fontFamily: "Inter, sans-serif", cursor: "pointer" }}>
                  Delete this question
                </button>
              )}
            </div>
          </div>
        )}

      </>)}
    </>
  );
}

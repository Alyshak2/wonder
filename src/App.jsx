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
    insert: (data) => {
      const run = () => sbFetch(`${table}`, "POST", data);
      return {
        select: run,
        then: (resolve, reject) => run().then(resolve).catch(reject),
      };
    },
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
  spicy: { label: "Playful", color: "#C2410C", bg: "#FFF0E6", dot: "#C2410C" },
};


// ── Question packs ───────────────────────────────────────────
const PACKS = {
  light: {
    name: "Light", intensity: "green", price: "Free",
    desc: "For any moment together. Easy to answer, always interesting.",
    questions: [
      "What's a small thing that happened this week that stayed with you?",
      "What did you love doing when you were younger that you don't do anymore?",
      "What's a place you've visited that you find yourself thinking about more than you'd expect?",
      "What do you remember most vividly from when we first met?",
      "What's something you're better at than most people think?",
      "What's a film or show you could watch over and over and never get tired of?",
      "What does your perfect Sunday morning look like?",
      "What's a gift someone gave you that showed they really knew you?",
      "What was it like telling people about us?",
      "What song takes you straight back to a specific memory?",
      "What's something you've changed your mind about recently?",
      "What's your favourite time of day and why?",
      "What's something I do that always makes you smile?",
      "What's something you own that you'd be sad to lose?",
      "What's a compliment you've received that you still think about?",
      "What's something you've recommended to almost everyone you know?",
      "What's something small that instantly improves your mood?",
      "What's the best piece of advice you've ever been given?",
      "What's something about your daily life right now that you genuinely enjoy?",
      "What's a tradition from your childhood you'd want to carry forward?",
      "What's something we do together that you always look forward to?",
      "What's something you've always wanted to get better at?",
      "What's something I've introduced you to that you're glad about?",
      "What's something you do alone that you find genuinely restorative?",
      "What's a smell that takes you straight back somewhere?",
      "What's the nicest thing a stranger has ever done for you?",
      "What's something you splurge on that you'd never apologise for?",
      "What's something you find genuinely exciting that most people wouldn't understand?",
      "What's a small pleasure you'd be embarrassed to admit how much you enjoy?",
      "When you have a completely free afternoon with no plans, what does your ideal version of it look like?",
    ],
  },
  deep: {
    name: "Deep", intensity: "amber", price: "£1.99",
    desc: "For when you want to go somewhere more personal.",
    questions: [
      "What's a period of your life that made you who you are more than any other?",
      "What's something you were nervous to tell me early on?",
      "What's something about me that you didn't expect when we first got together?",
      "What's a memory of us that you find yourself thinking about often?",
      "What's a moment early on with me where you thought - yes, this person?",
      "What's something you believe that you'd find hard to defend out loud?",
      "What's a choice you made that you're still thinking about?",
      "What's something you've never told your family about yourself?",
      "What does home mean to you - and does it feel like a place or something else?",
      "What's something you compromised on that I might not have realised?",
      "What do you think your younger self would make of your life now?",
      "What's something I do that you find quietly endearing?",
      "What's something you'd rather work through together than on your own?",
      "What's something you did for the first time with me that you'd never done with anyone else?",
      "What's a moment with me that you didn't realise was significant until later?",
      "What's something you'd want us to do or experience before we're old?",
      "What's a risk you took that you're glad you did?",
      "What's something about me that makes you feel safe?",
      "What's something you've never quite put into words about how you feel about us?",
      "What's a quality in me that you see in yourself too?",
      "What would you want to tell your teenage self about relationships?",
      "What's something you thought you knew about yourself that turned out not to be true?",
      "What do you want to be known for?",
      "What does it mean to you to truly take care of someone?",
      "What's something you've outgrown that used to feel central to who you were?",
      "What kind of person do you want to be for the people you love most?",
      "What's something about how we are together that you're proud of?",
      "What's something about the way we communicate that you value?",
      "What do you value most in a relationship?",
      "What's something you wish I knew about how you handle difficult conversations?",
    ],
  },
  vulnerable: {
    name: "Vulnerable", intensity: "red", price: "£2.99",
    desc: "For when you're ready to really open up. Take your time with these.",
    questions: [
      "What's something about yourself you're still learning to accept?",
      "What's something you're more sensitive about than you let on?",
      "What does feeling truly close to someone mean to you?",
      "What's something you find hard to ask for even when you really need it?",
      "When do you feel most truly yourself with me?",
      "When you're going through something difficult, what do you need most?",
      "What's something about yourself that a past relationship helped you understand?",
      "What's something you needed from a past relationship that you didn't know how to ask for?",
      "What's something you've never fully let yourself want because it felt too risky?",
      "What's something you've always wanted someone to do for you that you've never asked for?",
      "What's something about growing older that you find difficult to sit with?",
      "When do you feel most cared for?",
      "Is there something about our future that both excites and scares you?",
      "What's something you're genuinely afraid of losing?",
      "What's something about us that you hope we never lose?",
      "What's something you've been meaning to say but keep putting off?",
      "Is there something you wish we talked about more?",
      "What's something about yourself that you like more since being with me?",
      "What makes you feel most desired?",
      "What's something about intimacy that you'd love to explore together?",
      "What do you love about our intimate life?",
      "What's something about intimacy that you find hard to talk about even with me?",
      "What's something about our intimate life that you feel genuinely lucky to have?",
      "What's something about being with you that I probably take for granted?",
      "What's something you've had to accept about yourself that you wish was different?",
    ],
  },
  us: {
    name: "Us", intensity: "green", price: "£1.99",
    desc: "The private world of two people. Questions only you two can answer.",
    questions: [
      "What's a word or phrase that only means something because of us?",
      "What's something I do that you've quietly started doing too?",
      "What's something about our dynamic that would surprise people who know us separately?",
      "What's a small ritual we have that you'd never want to lose?",
      "What's something you've learned about yourself by being around me?",
      "What's a place that means something to us that wouldn't mean anything to anyone else?",
      "What's something you've changed your mind about because of me?",
      "What's something you notice I do when I'm happy?",
      "What's something ordinary we do together that you find quietly wonderful?",
      "What's something you'd want to tell the version of us from a year ago?",
      "What's something about us that feels like it was always going to happen?",
      "What's a decision I made that you were quietly rooting for?",
      "What's something about being with me that feels easy in a way you didn't expect?",
      "What's a moment you felt genuinely proud of me?",
      "What's something about us that makes you feel lucky?",
      "What's your favourite memory of us?",
      "What's a small thing I did that told you a lot about me?",
      "What's a time you felt most like a team?",
      "What's an ordinary moment with me that you've found yourself thinking about often?",
      "What's something we haven't done yet that you're quietly excited about?",
      "What's a place you'd love to take me that you haven't yet?",
      "What's something about us that you think gets better with time?",
      "What's something about me that you hope never changes?",
      "What's something about us that you think would make a good story one day?",
      "What's something you'd want to remember about this exact time in our lives?",
    ],
  },
};

const LOCAL_PACKS_KEY = "wonder_local_packs";

// ── Evening Together: selection + ordering ───────────────────
const EVENING_ORDER = ["green", "amber", "red", "spicy"];
const EVENING_SIZE = 6;
const EVENING_MIN = 4;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Soft-balanced: spread across present levels (round-robin draft), cap at 6,
// then order gentle -> deeper -> vulnerable -> playful. Returns null if under the floor.
function selectEvening(eligible) {
  if (eligible.length < EVENING_MIN) return null;
  const buckets = {};
  for (const lvl of EVENING_ORDER) buckets[lvl] = shuffleArray(eligible.filter(q => q.intensity === lvl));
  const present = EVENING_ORDER.filter(lvl => buckets[lvl].length > 0);
  const chosen = [];
  let progressed = true;
  while (chosen.length < EVENING_SIZE && progressed) {
    progressed = false;
    for (const lvl of present) {
      if (chosen.length >= EVENING_SIZE) break;
      if (buckets[lvl].length > 0) { chosen.push(buckets[lvl].shift()); progressed = true; }
    }
  }
  chosen.sort((a, b) => EVENING_ORDER.indexOf(a.intensity) - EVENING_ORDER.indexOf(b.intensity));
  return chosen;
}

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
      {/* Concept B - the path alone */}
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
        <path d="M 96 200 C 128 188 96 172 132 160 C 170 148 200 150 188 130 C 180 116 232 116 245 106" stroke="#B8B0A4" strokeWidth="2.4" strokeLinecap="round" fill="none" opacity="0.85"/>
        <circle cx="50" cy="148" r="22" fill="#3D6B4F" opacity="0.15"/>
        <circle cx="36" cy="155" r="16" fill="#3D6B4F" opacity="0.12"/>
        <circle cx="62" cy="142" r="18" fill="#3D6B4F" opacity="0.13"/>
        <line x1="50" y1="168" x2="50" y2="200" stroke="#3D6B4F" strokeWidth="2" opacity="0.2"/>
        <circle cx="310" cy="138" r="20" fill="#3D6B4F" opacity="0.13"/>
        <circle cx="328" cy="144" r="15" fill="#3D6B4F" opacity="0.11"/>
        <circle cx="295" cy="145" r="16" fill="#3D6B4F" opacity="0.12"/>
        <path d="M 0 118 Q 40 108 80 112 Q 120 116 160 108 Q 200 100 245 104 Q 290 108 320 102 Q 355 95 390 98 L390 118 L0 118 Z" fill="#3D6B4F" opacity="0.18"/>
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
      const owner = users[0];
      const myName = name.trim().toLowerCase();

      // Signing back in as the person who created this code
      if (owner.name.trim().toLowerCase() === myName) {
        onConnect({ name: owner.name, coupleCode: code.trim(), userId: owner.id, partnerId: owner.partner_id });
        return;
      }

      // Code already has a partner - sign back in if the name matches, otherwise reject
      if (owner.partner_id) {
        const partnerRows = await db.from("users").select().eq("id", owner.partner_id);
        const existing = partnerRows && partnerRows[0];
        if (existing && existing.name.trim().toLowerCase() === myName) {
          onConnect({ name: existing.name, coupleCode: code.trim(), userId: existing.id, partnerId: owner.id });
          return;
        }
        setError("This code is already connected to two people. To sign back in, use the same name as before.");
        setLoading(false);
        return;
      }

      // Fresh join
      const me = await db.from("users").insert({ name, couple_code: name.toUpperCase().slice(0, 3) + Date.now(), partner_id: owner.id }).select();
      await db.from("users").update({ partner_id: me[0].id }).eq("id", owner.id);
      onConnect({ name, coupleCode: code.trim(), userId: me[0].id, partnerId: owner.id });
    } catch (e) {
      setError(`Error: ${String(e.message || e).slice(0, 100)}`);
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
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.inkMute, fontWeight: 300 }}>Enter the code your person shared - or your couple code to sign back in</p>
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
              {registering ? "Setting up your code…" : registeredId ? "✓ Your code is live. Share it with your person - once they enter it, you'll be connected. You can both use this code to sign back in anytime." : ""}
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
      <button onClick={onSkip} style={{ width: "100%", padding: "16px", background: COLORS.white, border: `1.5px solid ${COLORS.creamDark}`, borderRadius: 16, fontFamily: "Lora, serif", fontSize: 15, color: COLORS.inkSoft, cursor: "pointer" }}>
        Explore on my own first
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
  .stat-item { flex: 1; padding: 14px 6px; text-align: center; border-right: 1px solid #F0EBE3; }
  .stat-item:last-child { border-right: none; }
  .stat-number { font-family: 'Lora', serif; font-size: 22px; font-weight: 400; display: block; }
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
  const [vulnerableConsented, setVulnerableConsented] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeFilters, setActiveFilters] = useState(["green", "amber", "red", "spicy"]);
  const [showFilter, setShowFilter] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [partnerName, setPartnerName] = useState(null);
  const [ownedPacks, setOwnedPacks] = useState([]);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [pickerNote, setPickerNote] = useState(null);
  const [expandedPack, setExpandedPack] = useState(null);
  // Evening Together state
  const [evening, setEvening] = useState(null); // { questions:[], position:int, active:bool }
  const [eveningStage, setEveningStage] = useState(null); // "opening" | "questions" | "closing" | null
  const [eveningNote, setEveningNote] = useState(null);
  const pollTimer = useRef(null);

  const pool = questions.filter(q => !q.discussed && !q.skipped);
  const archive = questions.filter(q => q.discussed);
  const skipped = questions.filter(q => q.skipped && !q.discussed);

  // Restore session on load - keeps you signed in on this device
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

  // Packs owned by this couple (or this device if browsing solo)
  async function loadPacks() {
    if (userSession?.coupleCode) {
      try {
        const rows = await db.from("couple_packs").select().eq("couple_code", userSession.coupleCode);
        if (rows) setOwnedPacks(rows.map(r => r.pack));
      } catch (e) {}
    } else {
      try {
        const raw = localStorage.getItem(LOCAL_PACKS_KEY);
        setOwnedPacks(raw ? JSON.parse(raw) : []);
      } catch (e) {}
    }
  }

  async function unlockPack(key) {
    if (ownedPacks.includes(key)) return;
    if (userSession?.coupleCode) {
      try {
        await db.from("couple_packs").insert({ couple_code: userSession.coupleCode, pack: key });
        await loadPacks();
      } catch (e) {}
    } else {
      const next = [...ownedPacks, key];
      setOwnedPacks(next);
      try { localStorage.setItem(LOCAL_PACKS_KEY, JSON.stringify(next)); } catch (e) {}
    }
  }

  // Find your person's name (their record points back at you)
  async function checkPartner() {
    if (!userSession?.userId || partnerName) return;
    try {
      const rows = await db.from("users").select().eq("partner_id", userSession.userId);
      if (rows && rows.length > 0) setPartnerName(rows[0].name);
    } catch (e) {}
  }

  // Poll for new questions every 10 seconds
  useEffect(() => {
    if (userSession) loadPacks();
    if (userSession?.coupleCode) {
      loadQuestions(userSession.coupleCode);
      checkPartner();
      pollTimer.current = setInterval(() => { loadQuestions(userSession.coupleCode); checkPartner(); loadPacks(); }, 10000);
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
          setSaveError("Your session is out of date - please sign out and reconnect with your person.");
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

  function beginReveal(q) {
    setDrawnQuestion(q);
    setRevealed(false);
    if (navigator.vibrate) navigator.vibrate([10, 50, 20]);
    if (q.intensity === "red" && !vulnerableConsented) {
      setShowVulnerablePause(true);
    } else {
      setShowDraw(true);
      setTimeout(() => setRevealed(true), 1200);
    }
  }

  function drawQuestion() {
    setPickerNote(null);
    if (ownedPacks.length > 0) {
      setShowSourcePicker(true);
    } else {
      drawFromPool();
    }
  }

  function drawFromPool() {
    setShowSourcePicker(false);
    const eligible = pool.filter(q => activeFilters.includes(q.intensity));
    if (pool.length === 0) { setPickerNote("Your pool is empty - add a question first."); return; }
    if (eligible.length === 0) { setPickerNote("No questions match your current filter. Tap the filter to widen it."); return; }
    const q = eligible[Math.floor(Math.random() * eligible.length)];
    beginReveal(q);
  }

  function packRemaining(key) {
    const used = new Set(questions.map(q => q.text));
    return PACKS[key].questions.filter(t => !used.has(t));
  }

  function drawFromPack(key) {
    const remaining = packRemaining(key);
    if (remaining.length === 0) { setPickerNote(`You've been through every ${PACKS[key].name} question - lovely work.`); return; }
    setShowSourcePicker(false);
    const text = remaining[Math.floor(Math.random() * remaining.length)];
    beginReveal({ id: null, text, intensity: PACKS[key].intensity, author: "pack" });
  }

  // ── Evening Together ──
  function eveningEligible() {
    // Combined pool: own + partner questions, plus owned-pack questions not yet used.
    const used = new Set(questions.map(q => q.text));
    const ownEligible = pool.filter(q => activeFilters.includes(q.intensity));
    const packEligible = [];
    for (const key of ownedPacks) {
      for (const text of PACKS[key].questions) {
        if (!used.has(text) && activeFilters.includes(PACKS[key].intensity)) {
          packEligible.push({ id: null, text, intensity: PACKS[key].intensity, author: "pack" });
        }
      }
    }
    return [...ownEligible, ...packEligible];
  }

  function startEvening() {
    setPickerNote(null);
    const chosen = selectEvening(eveningEligible());
    if (!chosen) {
      setEveningNote("There isn't quite enough yet to make an evening of it. Add a few more questions, or open a pack, and it'll be ready.");
      return;
    }
    setEvening({ questions: chosen, position: 0, active: true });
    setEveningNote(null);
    setEveningStage("opening");
  }

  function resumeEvening() {
    if (evening) setEveningStage("questions");
  }

  function restartEvening() {
    if (!evening) return;
    setEvening({ ...evening, position: 0 });
    setEveningStage("opening");
  }

  async function eveningArchive(q, asDiscussed) {
    // Pack questions (id null) get inserted; own questions get updated.
    try {
      if (q.id === null) {
        if (userSession?.coupleCode && userSession?.userId) {
          await db.from("questions").insert({ text: q.text, intensity: q.intensity, author_id: userSession.userId, couple_code: userSession.coupleCode, discussed: asDiscussed, skipped: !asDiscussed });
          await loadQuestions(userSession.coupleCode);
        } else {
          setQuestions(prev => [{ id: Date.now() + Math.random(), text: q.text, intensity: q.intensity, author: "you", discussed: asDiscussed, skipped: !asDiscussed }, ...prev]);
        }
      } else if (asDiscussed) {
        if (userSession?.coupleCode) {
          await db.from("questions").update({ discussed: true, skipped: false }).eq("id", q.id);
          await loadQuestions(userSession.coupleCode);
        } else {
          setQuestions(prev => prev.map(x => x.id === q.id ? { ...x, discussed: true, skipped: false } : x));
        }
      }
      // if a real question is "saved for later", we simply leave it in the pool (no change)
    } catch (e) {}
  }

  async function eveningNext(saveForLater) {
    const q = evening.questions[evening.position];
    await eveningArchive(q, !saveForLater);
    const nextPos = evening.position + 1;
    if (nextPos >= evening.questions.length) {
      setEvening({ ...evening, active: false });
      setEveningStage("closing");
    } else {
      setEvening({ ...evening, position: nextPos });
    }
  }

  function endEvening() {
    setEvening(null);
    setEveningStage(null);
  }

  function confirmVulnerable() {
    setVulnerableConsented(true);
    setShowVulnerablePause(false);
    setShowDraw(true);
    setTimeout(() => setRevealed(true), 1200);
  }

  async function recordPackQuestion(flags) {
    if (userSession?.coupleCode && userSession?.userId) {
      await db.from("questions").insert({ text: drawnQuestion.text, intensity: drawnQuestion.intensity, author_id: userSession.userId, couple_code: userSession.coupleCode, ...flags });
      await loadQuestions(userSession.coupleCode);
    } else {
      setQuestions(prev => [{ id: Date.now(), text: drawnQuestion.text, intensity: drawnQuestion.intensity, author: "you", discussed: !!flags.discussed, skipped: !!flags.skipped }, ...prev]);
    }
  }

  async function markDiscussed() {
    try {
      if (drawnQuestion.id === null) {
        await recordPackQuestion({ discussed: true, skipped: false });
      } else if (userSession?.coupleCode) {
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
      if (drawnQuestion.id === null) {
        await recordPackQuestion({ discussed: false, skipped: true });
      } else if (userSession?.coupleCode) {
        await db.from("questions").update({ skipped: true }).eq("id", drawnQuestion.id);
        await loadQuestions(userSession.coupleCode);
      } else {
        setQuestions(prev => prev.map(q => q.id === drawnQuestion.id ? { ...q, skipped: true } : q));
      }
    } catch (e) {}
    setShowDraw(false);
    setDrawnQuestion(null);
  }

  const PACK_TEXT_TO_NAME = (() => {
    const map = {};
    Object.values(PACKS).forEach(p => p.questions.forEach(q => { map[q] = p.name; }));
    return map;
  })();

  const intensityStyle = (key) => ({ backgroundColor: INTENSITY[key].bg, color: INTENSITY[key].color });

  const IntensityIndicator = ({ intensityKey, size = 10 }) => {
    const i = INTENSITY[intensityKey];
    if (!i) return null;
    return <span className="intensity-dot" style={{ backgroundColor: i.dot, width: size, height: size, borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />;
  };

  return (
    <>
      <style>{styles}</style>

      {onboarding === "welcome" && <WelcomeScreen onNext={() => setOnboarding("name")} />}
      {onboarding === "name" && <NameScreen onBack={() => setOnboarding("welcome")} onNext={(name) => { setUserName(name); setOnboarding("connect"); }} />}
      {onboarding === "connect" && <ConnectScreen name={userName} onBack={() => setOnboarding("name")} onConnect={handleConnect} onSkip={handleSkip} />}

      {onboarding === "done" && (<>

        {/* INTENSITY FILTER SHEET */}
        {showFilter && (() => {
          const present = ["green", "amber", "red", "spicy"].filter(k => pool.some(q => q.intensity === k));
          const toggle = (k) => {
            setActiveFilters(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
          };
          return (
            <div className="sheet-overlay" onClick={(e) => e.target === e.currentTarget && setShowFilter(false)}>
              <div className="sheet">
                <div className="sheet-handle" />
                <h2 className="sheet-title">What kind of questions?</h2>
                <p className="sheet-subtitle">Choose which feel right just now. This stays set until you change it.</p>
                {present.length === 0 && (
                  <p style={{ fontSize: 13, color: COLORS.inkMute, fontWeight: 300, textAlign: "center", padding: "20px 0" }}>Your pool is empty for now - add some questions first.</p>
                )}
                {present.map(k => {
                  const on = activeFilters.includes(k);
                  const count = pool.filter(q => q.intensity === k).length;
                  return (
                    <button key={k} onClick={() => toggle(k)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", background: on ? INTENSITY[k].bg : COLORS.white, border: `1.5px solid ${on ? INTENSITY[k].dot : COLORS.creamDark}`, borderRadius: 14, marginBottom: 10, cursor: "pointer", textAlign: "left" }}>
                      <span style={{ width: 12, height: 12, borderRadius: "50%", background: INTENSITY[k].dot, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <span style={{ fontFamily: "Lora, serif", fontSize: 15, color: COLORS.ink }}>{INTENSITY[k].label}</span>
                        <span style={{ fontSize: 11, color: COLORS.inkMute, fontWeight: 300, marginLeft: 8 }}>{count} waiting</span>
                      </div>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${on ? INTENSITY[k].dot : COLORS.creamDark}`, background: on ? INTENSITY[k].dot : "transparent", color: COLORS.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{on ? "✓" : ""}</span>
                    </button>
                  );
                })}
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button onClick={() => setActiveFilters(["green", "amber", "red", "spicy"])} style={{ flex: 1, padding: "12px", background: "none", border: `1.5px solid ${COLORS.creamDark}`, borderRadius: 12, fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.inkSoft, cursor: "pointer" }}>Select all</button>
                  <button onClick={() => setShowFilter(false)} style={{ flex: 1, padding: "12px", background: COLORS.ink, border: "none", borderRadius: 12, fontFamily: "Lora, serif", fontSize: 14, color: COLORS.cream, cursor: "pointer" }}>Done</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* PROFILE SHEET */}
        {showProfile && (
          <div className="sheet-overlay" onClick={(e) => e.target === e.currentTarget && setShowProfile(false)}>
            <div className="sheet">
              <div className="sheet-handle" />
              <h2 className="sheet-title">{partnerName ? `You & ${partnerName}` : "Your profile"}</h2>
              <div style={{ marginTop: 8, marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "13px 0", borderBottom: `1px solid ${COLORS.creamDark}` }}>
                  <span style={{ fontSize: 13, color: COLORS.inkMute, fontWeight: 300 }}>You</span>
                  <span style={{ fontSize: 13, color: COLORS.ink }}>{userSession?.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "13px 0", borderBottom: `1px solid ${COLORS.creamDark}` }}>
                  <span style={{ fontSize: 13, color: COLORS.inkMute, fontWeight: 300 }}>Connected with</span>
                  <span style={{ fontSize: 13, color: partnerName ? COLORS.green : COLORS.inkMute }}>{partnerName || (userSession?.coupleCode ? "Waiting for your person" : "Not connected")}</span>
                </div>
                {userSession?.coupleCode && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "13px 0", borderBottom: `1px solid ${COLORS.creamDark}` }}>
                    <span style={{ fontSize: 13, color: COLORS.inkMute, fontWeight: 300 }}>Your couple code</span>
                    <span style={{ fontSize: 13, color: COLORS.ink, fontFamily: "Lora, serif", letterSpacing: 2 }}>{userSession.coupleCode}</span>
                  </div>
                )}
              </div>
              {userSession?.coupleCode && (
                <p style={{ fontSize: 11, color: COLORS.inkMute, fontWeight: 300, lineHeight: 1.6, marginBottom: 20, textAlign: "center" }}>
                  Keep your couple code somewhere safe - you'll both need it to sign back in if you ever log out.
                </p>
              )}
              <button onClick={() => { setShowProfile(false); setShowSignOut(true); }} style={{ width: "100%", padding: "14px", background: "none", border: `1.5px solid ${COLORS.creamDark}`, borderRadius: 14, fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.red, cursor: "pointer" }}>
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* SIGN OUT CONFIRM */}
        {showSignOut && (
          <div className="sheet-overlay" onClick={(e) => e.target === e.currentTarget && setShowSignOut(false)}>
            <div className="sheet">
              <div className="sheet-handle" />
              <h2 className="sheet-title">Sign out?</h2>
              <p className="sheet-subtitle">You'll need your couple code to sign back in and reconnect with {partnerName || "your person"}.</p>
              {userSession?.coupleCode && (
                <div style={{ background: COLORS.white, border: `1.5px solid ${COLORS.creamDark}`, borderRadius: 16, padding: "20px", textAlign: "center", marginBottom: 20 }}>
                  <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: 1, textTransform: "uppercase", color: COLORS.inkMute, marginBottom: 8 }}>Your couple code</p>
                  <p style={{ fontFamily: "Lora, serif", fontSize: 28, fontWeight: 500, color: COLORS.ink, letterSpacing: 3 }}>{userSession.coupleCode}</p>
                  <p style={{ fontSize: 11, color: COLORS.inkMute, fontWeight: 300, marginTop: 8 }}>Write this down before you sign out</p>
                </div>
              )}
              <button onClick={() => { clearSession(); window.location.reload(); }} style={{ width: "100%", padding: "16px", background: COLORS.ink, color: COLORS.cream, border: "none", borderRadius: 14, fontFamily: "Lora, serif", fontSize: 15, cursor: "pointer", marginBottom: 10 }}>
                Sign out
              </button>
              <button onClick={() => setShowSignOut(false)} style={{ width: "100%", padding: "14px", background: "none", border: "none", fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.inkMute, cursor: "pointer", fontWeight: 300 }}>
                Stay signed in
              </button>
            </div>
          </div>
        )}

        {/* DRAW SOURCE PICKER */}
        {showSourcePicker && (
          <div className="sheet-overlay" onClick={(e) => e.target === e.currentTarget && setShowSourcePicker(false)}>
            <div className="sheet">
              <div className="sheet-handle" />
              <h2 className="sheet-title">Draw from…</h2>
              <p className="sheet-subtitle">Choose where tonight's question comes from.</p>
              <button onClick={drawFromPool} disabled={pool.length === 0}
                style={{ width: "100%", padding: "18px 20px", background: COLORS.white, border: `1.5px solid ${COLORS.creamDark}`, borderRadius: 16, textAlign: "left", cursor: pool.length > 0 ? "pointer" : "default", marginBottom: 10, opacity: pool.length > 0 ? 1 : 0.45 }}>
                <p style={{ fontFamily: "Lora, serif", fontSize: 16, color: COLORS.ink, marginBottom: 3 }}>Our questions</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.inkMute, fontWeight: 300 }}>{pool.filter(q => activeFilters.includes(q.intensity)).length} waiting{activeFilters.length < 4 ? " in your filter" : " in your pool"}</p>
              </button>
              {ownedPacks.map(key => {
                const remaining = packRemaining(key).length;
                return (
                  <button key={key} onClick={() => drawFromPack(key)} disabled={remaining === 0}
                    style={{ width: "100%", padding: "18px 20px", background: COLORS.white, border: `1.5px solid ${COLORS.creamDark}`, borderLeft: `4px solid ${INTENSITY[PACKS[key].intensity].dot}`, borderRadius: 16, textAlign: "left", cursor: remaining > 0 ? "pointer" : "default", marginBottom: 10, opacity: remaining > 0 ? 1 : 0.45 }}>
                    <p style={{ fontFamily: "Lora, serif", fontSize: 16, color: COLORS.ink, marginBottom: 3 }}>{PACKS[key].name}</p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: COLORS.inkMute, fontWeight: 300 }}>{remaining} you haven't drawn yet</p>
                  </button>
                );
              })}
              {pickerNote && <p style={{ fontSize: 12, color: COLORS.inkMute, textAlign: "center", marginTop: 8, fontWeight: 300 }}>{pickerNote}</p>}
            </div>
          </div>
        )}

        {/* EVENING: OPENING */}
        {eveningStage === "opening" && evening && (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 32px", background: COLORS.cream, textAlign: "center" }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "1.5px", textTransform: "uppercase", color: COLORS.inkMute, marginBottom: 28 }}>Evening Together</p>
            <h2 style={{ fontFamily: "Lora, serif", fontSize: 27, fontWeight: 400, color: COLORS.ink, marginBottom: 20, lineHeight: 1.35 }}>Settle in.</h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 300, color: COLORS.inkMute, lineHeight: 1.7, marginBottom: 16, maxWidth: 300 }}>
              A handful of questions, one at a time. Take as long as you need with each one. Some may go somewhere real.
            </p>
            {activeFilters.length < 4 && (
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 300, color: COLORS.inkSoft, lineHeight: 1.6, marginBottom: 16, maxWidth: 300, fontStyle: "italic" }}>
                Tonight's evening will stay within the levels you've chosen ({activeFilters.map(f => INTENSITY[f].label).join(", ")}).{" "}
                <button onClick={() => { setEveningStage(null); setShowFilter(true); }} style={{ background: "none", border: "none", padding: 0, color: COLORS.green, fontSize: 12, cursor: "pointer", textDecoration: "underline", fontFamily: "Inter, sans-serif" }}>adjust</button>
              </p>
            )}
            <div style={{ marginBottom: 40 }} />
            <button onClick={() => setEveningStage("questions")} style={{ width: "100%", padding: "18px", background: COLORS.ink, color: COLORS.cream, border: "none", borderRadius: 16, fontFamily: "Lora, serif", fontSize: 17, cursor: "pointer", marginBottom: 14, boxShadow: "0 4px 20px rgba(28,25,23,0.18)" }}>Begin</button>
            <button onClick={endEvening} style={{ background: "none", border: "none", fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.inkMute, cursor: "pointer", fontWeight: 300 }}>Not now</button>
          </div>
        )}

        {/* EVENING: QUESTIONS */}
        {eveningStage === "questions" && evening && evening.questions[evening.position] && (() => {
          const q = evening.questions[evening.position];
          const n = evening.questions.length;
          const pos = evening.position;
          return (
            <div className="draw-screen">
              <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
                <button className="back-btn" style={{ marginBottom: 0 }} onClick={() => setEveningStage(null)}>‹ pause</button>
                <div style={{ display: "flex", gap: 5 }}>
                  {evening.questions.map((_, i) => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i < pos ? COLORS.inkMute : i === pos ? INTENSITY[q.intensity].dot : COLORS.creamDark, transition: "background 0.3s ease" }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: COLORS.inkMute, fontFamily: "Inter, sans-serif", fontWeight: 300 }}>{pos + 1} of {n}</span>
              </div>
              <div style={{ width: "100%" }}>
                <div className="draw-card" style={{ background: INTENSITY[q.intensity]?.bg || COLORS.white, borderLeft: `4px solid ${INTENSITY[q.intensity]?.dot}`, animation: "revealCard 0.6s cubic-bezier(0.16,1,0.3,1) forwards" }}>
                  <div className="draw-card-intensity">
                    <IntensityIndicator intensityKey={q.intensity} />
                    <span style={{ fontSize: 11, fontWeight: 500, color: INTENSITY[q.intensity]?.color, letterSpacing: "0.5px", textTransform: "uppercase" }}>{INTENSITY[q.intensity]?.label}</span>
                  </div>
                  <p className="draw-question">"{q.text}"</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 28 }}>
                  <button onClick={() => eveningNext(false)} style={{ width: "100%", padding: "18px", background: COLORS.ink, color: COLORS.cream, border: "none", borderRadius: 16, fontFamily: "Lora, serif", fontSize: 17, cursor: "pointer", boxShadow: "0 4px 20px rgba(28,25,23,0.18)" }}>
                    {pos + 1 === n ? "Finish" : "Next"}
                  </button>
                  <button onClick={() => eveningNext(true)} style={{ background: "none", border: "none", fontFamily: "Inter, sans-serif", fontSize: 13, color: COLORS.inkMute, cursor: "pointer", fontWeight: 300 }}>Save this one for later</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* EVENING: CLOSING */}
        {eveningStage === "closing" && (() => {
          const missingDeep = !ownedPacks.includes("deep") || !ownedPacks.includes("vulnerable");
          return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 32px", background: COLORS.cream, textAlign: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: COLORS.greenLight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: COLORS.green, display: "inline-block" }} />
              </div>
              <h2 style={{ fontFamily: "Lora, serif", fontSize: 28, fontWeight: 400, color: COLORS.ink, marginBottom: 12, lineHeight: 1.3 }}>That's your evening.</h2>
              <p style={{ fontFamily: "Lora, serif", fontSize: 16, fontWeight: 400, color: COLORS.inkSoft, fontStyle: "italic", marginBottom: 40 }}>Thanks for making the time.</p>
              {missingDeep && (
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 300, color: COLORS.inkMute, lineHeight: 1.6, marginBottom: 32, maxWidth: 290 }}>
                  When you want to go further, the Deep and Vulnerable packs hold more questions of that kind.{" "}
                  <button onClick={() => { endEvening(); setTab("packs"); }} style={{ background: "none", border: "none", padding: 0, color: COLORS.green, fontSize: 12, cursor: "pointer", textDecoration: "underline", fontFamily: "Inter, sans-serif" }}>see packs</button>
                </p>
              )}
              <button onClick={endEvening} style={{ width: "100%", padding: "18px", background: COLORS.ink, color: COLORS.cream, border: "none", borderRadius: 16, fontFamily: "Lora, serif", fontSize: 17, cursor: "pointer", boxShadow: "0 4px 20px rgba(28,25,23,0.18)" }}>Done</button>
            </div>
          );
        })()}

        {/* VULNERABLE PAUSE */}
        {showVulnerablePause && (
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 32px", background: COLORS.cream, textAlign: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: COLORS.redLight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.red, display: "inline-block" }} />
            </div>
            <h2 style={{ fontFamily: "Lora, serif", fontSize: 26, fontWeight: 400, color: COLORS.ink, marginBottom: 48, lineHeight: 1.3 }}>This one goes somewhere real.</h2>
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
                      <span style={{ fontSize: 11, fontWeight: 500, color: INTENSITY[drawnQuestion.intensity]?.color, letterSpacing: "0.5px", textTransform: "uppercase" }}>{INTENSITY[drawnQuestion.intensity]?.label}</span>
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
        {!showDraw && !showVulnerablePause && !eveningStage && (
          <div className="screen">
            <div className="header">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                  </div>
                </div>
                <button onClick={() => setShowProfile(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: COLORS.white, border: `1.5px solid ${COLORS.creamDark}`, borderRadius: 24, padding: "5px 5px 5px 12px", cursor: "pointer", flexShrink: 0 }}>
                  <span style={{ fontSize: 12, color: COLORS.inkSoft, fontWeight: 500, fontFamily: "Inter, sans-serif" }}>{userSession?.name}</span>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", background: COLORS.green, color: COLORS.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontFamily: "Lora, serif" }}>
                    {(userSession?.name || "?").charAt(0).toUpperCase()}
                  </span>
                </button>
              </div>
            </div>

            <div className="divider" />

            <div style={{ padding: "20px 28px 0" }}>
              <div className="stats-strip">
                <div className="stat-item"><span className="stat-number" style={{ color: COLORS.green }}>{pool.length}</span><span className="stat-label">waiting</span></div>
                <div className="stat-item"><span className="stat-number" style={{ color: COLORS.inkMute }}>{archive.length}</span><span className="stat-label">discussed</span></div>
                <div className="stat-item"><span className="stat-number" style={{ color: COLORS.amber }}>{skipped.length}</span><span className="stat-label">saved</span></div>
                <div className="stat-item"><span className="stat-number" style={{ color: COLORS.red }}>{ownedPacks.length}</span><span className="stat-label">packs</span></div>
              </div>
              <button className="draw-btn" onClick={drawQuestion} disabled={pool.length === 0 && ownedPacks.length === 0}>
                {pool.length === 0 && ownedPacks.length === 0 ? "No questions yet" : "Draw a question"}
              </button>
              <button onClick={() => setShowFilter(true)} style={{ width: "100%", padding: "2px", background: "none", border: "none", cursor: "pointer", textAlign: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 11, color: COLORS.inkMute, fontFamily: "Inter, sans-serif", fontWeight: 300 }}>
                  Drawing from: <span style={{ color: COLORS.inkSoft }}>{activeFilters.length === 4 ? "all questions" : activeFilters.length === 0 ? "nothing selected" : activeFilters.map(f => INTENSITY[f].label).join(", ")}</span>
                </span>
              </button>
              <button onClick={() => { resetSheet(); setShowAddSheet(true); }} style={{ width: "100%", padding: "16px", background: "transparent", color: COLORS.inkSoft, border: `1.5px solid ${COLORS.creamDark}`, borderRadius: 20, fontFamily: "Lora, serif", fontSize: 16, cursor: "pointer", marginBottom: 10 }}>
                + Add a question
              </button>
              <button onClick={evening ? resumeEvening : startEvening} style={{ width: "100%", padding: "14px", background: COLORS.creamDark, border: "none", borderRadius: 16, cursor: "pointer", textAlign: "center", marginBottom: 6 }}>
                <span style={{ display: "block", fontSize: 15, color: COLORS.ink, fontFamily: "Lora, serif" }}>
                  {evening ? "Resume your evening →" : "Evening Together"}
                </span>
                {!evening && <span style={{ display: "block", fontSize: 10, color: COLORS.inkMute, fontWeight: 300, fontFamily: "Inter, sans-serif", marginTop: 3 }}>a dedicated way to spend an evening</span>}
              </button>
              {eveningNote && <p style={{ fontSize: 12, color: COLORS.inkMute, fontWeight: 300, textAlign: "center", lineHeight: 1.5, marginBottom: 8, marginTop: 6 }}>{eveningNote}</p>}
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
                      <p className="empty-body" style={{ marginBottom: 28 }}>Whenever a question comes to mind - on a commute, in the shower, at 2am - add it here. It'll be waiting when you're ready.</p>
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
                                <span className="intensity-badge" style={intensityStyle(q.intensity)}>{INTENSITY[q.intensity]?.label}</span>
                                <span className="author-tag">added by you</span>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      {pool.filter(q => q.author === "partner").length > 0 && (
                        <>
                          <p className="section-label" style={{ marginTop: pool.filter(q => q.author === "you").length > 0 ? 24 : 0 }}>{partnerName ? `from ${partnerName.toLowerCase()}` : "from your person"}</p>
                          {pool.filter(q => q.author === "partner").map(q => (
                            <div key={q.id} className="question-card" style={{ cursor: "default", borderLeft: `4px solid ${INTENSITY[q.intensity]?.dot}` }}>
                              <div className="question-card-top">
                                <IntensityIndicator intensityKey={q.intensity} />
                                <p className="question-text" style={{ color: COLORS.inkMute, fontStyle: "italic" }}>Question waiting to be drawn…</p>
                              </div>
                              <div className="question-meta">
                                <span className="intensity-badge" style={intensityStyle(q.intensity)}>{INTENSITY[q.intensity]?.label}</span>
                                <span className="author-tag">added by {partnerName || "your person"}</span>
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
                            <span className="intensity-badge" style={intensityStyle(q.intensity)}>{INTENSITY[q.intensity]?.label}</span>
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
                      <p className="empty-body">Questions you've talked about together will live here - a quiet record of your conversations.</p>
                    </div>
                  ) : (
                    <>
                      <p className="section-label">discussed</p>
                      {archive.map(q => (
                        <div key={q.id} style={{ background: COLORS.white, borderRadius: 16, padding: "16px 18px", marginBottom: 10, borderLeft: `4px solid ${INTENSITY[q.intensity]?.dot}` }}>
                          <p style={{ fontFamily: "Lora, serif", fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.55, marginBottom: 8, fontStyle: "italic" }}>"{q.text}"</p>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 10, fontWeight: 500, color: INTENSITY[q.intensity]?.color, backgroundColor: INTENSITY[q.intensity]?.bg, padding: "2px 8px", borderRadius: 20 }}>{INTENSITY[q.intensity]?.label}</span>
                            <span style={{ fontSize: 10, color: COLORS.inkMute, fontWeight: 300 }}>{PACK_TEXT_TO_NAME[q.text] ? `from the ${PACK_TEXT_TO_NAME[q.text]} pack` : (q.author === "you" ? "added by you" : `added by ${partnerName || "your person"}`)}</span>
                            <button onClick={async () => {
                              if (userSession?.coupleCode) {
                                await db.from("questions").update({ discussed: false, skipped: false }).eq("id", q.id);
                                await loadQuestions(userSession.coupleCode);
                              } else {
                                setQuestions(prev => prev.map(qq => qq.id === q.id ? { ...qq, discussed: false, skipped: false } : qq));
                              }
                            }} style={{ marginLeft: "auto", fontSize: 10, color: COLORS.green, background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                              put back →
                            </button>
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
                  <p style={{ fontSize: 13, color: COLORS.inkMute, fontWeight: 300, lineHeight: 1.6, marginBottom: 24 }}>Curated questions for when you want a starting point. Free to unlock while Wonder is in beta - yours to keep.</p>
                  {Object.entries(PACKS).map(([key, pack]) => {
                    const owned = ownedPacks.includes(key);
                    const isOpen = expandedPack === key;
                    return (
                      <div key={key} style={{ background: COLORS.white, borderRadius: 20, padding: "20px", marginBottom: 14, borderLeft: `4px solid ${INTENSITY[pack.intensity]?.dot}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                          <IntensityIndicator intensityKey={pack.intensity} />
                          <div style={{ flex: 1, cursor: owned ? "pointer" : "default" }} onClick={() => owned && setExpandedPack(isOpen ? null : key)}>
                            <p style={{ fontFamily: "Lora, serif", fontSize: 16, fontWeight: 400, marginBottom: 2 }}>{pack.name}{owned && <span style={{ fontSize: 11, color: COLORS.green, marginLeft: 8 }}>✓ unlocked</span>}</p>
                            <p style={{ fontSize: 11, color: COLORS.inkMute, fontWeight: 300 }}>{pack.questions.length} questions{owned ? (isOpen ? " · tap to close" : " · tap to browse") : ""}</p>
                          </div>
                          {!owned && (
                            <button onClick={() => unlockPack(key)} style={{ padding: "8px 16px", borderRadius: 24, border: "none", background: COLORS.ink, fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 500, color: COLORS.cream, cursor: "pointer", whiteSpace: "nowrap" }}>
                              Unlock free
                            </button>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: COLORS.inkSoft, fontWeight: 300, lineHeight: 1.55, fontStyle: "italic", fontFamily: "Lora, serif" }}>{pack.desc}</p>
                        {!owned && pack.price !== "Free" && <p style={{ fontSize: 10, color: COLORS.inkMute, fontWeight: 300, marginTop: 8 }}>Will be {pack.price} after beta</p>}
                        {owned && isOpen && (
                          <div style={{ marginTop: 14, borderTop: `1px solid ${COLORS.creamDark}`, paddingTop: 14 }}>
                            {pack.questions.map((q, qi) => (
                              <p key={qi} style={{ fontFamily: "Lora, serif", fontSize: 13, color: COLORS.inkSoft, lineHeight: 1.5, marginBottom: 10, fontStyle: "italic" }}>"{q}"</p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
              <p className="sheet-subtitle">{editingId ? "Change the wording or how it feels - your call." : "Something you've been meaning to ask."}</p>

              <p className="field-label">Your question</p>
              <textarea rows={3} placeholder="What have you always wanted to know?" value={newQ} onChange={e => setNewQ(e.target.value)} />

              <p className="field-label" style={{ marginBottom: 10, marginTop: 8 }}>How it feels</p>
              <div className="intensity-picker">
                {Object.entries(INTENSITY).map(([key, val]) => (
                  <div key={key} className={`intensity-option ${newIntensity === key ? "selected" : ""}`}
                    style={{ backgroundColor: newIntensity === key ? val.bg : COLORS.white, color: val.color, borderColor: newIntensity === key ? val.dot : "transparent" }}
                    onClick={() => setNewIntensity(key)}>
                    <div className="intensity-option-dot" style={{ backgroundColor: val.dot }} />
                    <span className="intensity-option-label">{val.label}</span>
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

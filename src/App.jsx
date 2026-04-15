import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useParams, Link as RouterLink } from "react-router-dom";

/* ═══════════ CONFIG — UPDATE THESE ═══════════ */

// Cal.com: Replace with your Cal.com scheduling link
const CAL_URL = "https://cal.com/cole-whetstone-oppwb1/30min";

// Stripe: Create a Payment Link in Stripe Dashboard for each session, paste URLs here.
// Key = session id, Value = Stripe Payment Link URL
// Example: https://buy.stripe.com/test_abc123
const STRIPE_LINKS = {
  // Greek
  g101a: "", g101b: "", g102a: "", g201a: "", g301a: "",
  // Latin
  l101a: "", l101b: "", l101c: "", l102a: "", l201a: "", l301a: "",
  // Hebrew
  h101a: "", h101b: "", h102a: "", h201a: "",
};

const getStripeLink = (sessionId) => STRIPE_LINKS[sessionId] || "";


const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Karla:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
:root {
  --bg: #faf7f2; --bg-alt: #f3efe7; --ink: #1e1e1e; --ink-light: #3a3a3a;
  --ink-muted: #8a8580; --ink-faint: #b8b3ab; --accent: #8b3a2f; --accent-hover: #a04535;
  --border: #e6e0d6; --card: #ffffff; --serif: 'Playfair Display', Georgia, serif;
  --sans: 'Karla', system-ui, sans-serif; --mono: 'JetBrains Mono', monospace;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { font-family: var(--sans); background: var(--bg); color: var(--ink); -webkit-font-smoothing: antialiased; }
::selection { background: var(--accent); color: #fff; }
@keyframes rise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
input:focus, textarea:focus, select:focus { border-color: var(--ink) !important; outline: none; }

/* ═══════════ RESPONSIVE ═══════════ */
@media (max-width: 768px) {
  .desktop-nav-links { display: none !important; }
  .mobile-menu-btn { display: flex !important; }
  section { padding-left: 20px !important; padding-right: 20px !important; }
}
@media (min-width: 769px) {
  .mobile-menu-btn { display: none !important; }
  .mobile-menu-overlay { display: none !important; }
}
.mobile-menu-btn {
  display: none; cursor: pointer; background: none; border: none;
  flex-direction: column; gap: 5px; padding: 4px;
}
.mobile-menu-btn span {
  display: block; width: 22px; height: 2px; background: var(--ink); border-radius: 1px; transition: all 0.3s;
}
.mobile-menu-overlay {
  position: fixed; inset: 0; z-index: 99; background: rgba(250,247,242,0.98);
  backdrop-filter: blur(20px); display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 28px; animation: fadeIn 0.25s ease;
}
/* Responsive grids */
@media (max-width: 900px) {
  .grid-3 { grid-template-columns: 1fr !important; }
  .grid-2 { grid-template-columns: 1fr !important; }
  .grid-2-1 { grid-template-columns: 1fr !important; }
  .hero-content { padding-bottom: 60px !important; }
}
`;

/* ═══════════ DATA ═══════════ */
const languages = [
  {
    id: "greek", label: "Ancient Greek", tag: "Ἑλληνική",
    hero: "Read Homer, Plato, and the New Testament in the original.",
    intro: "Our Greek curriculum follows the active method, moving from comprehensible input in adapted Attic prose through to unadapted texts by the great authors. Classes are conducted primarily in Greek from day one. By the end of the beginner sequence, students read simple Attic prose without a dictionary.",
    texts: "Athenaze, Thrasymachus, Xenophon, Plato's Apology, Homer's Iliad, Gospel of John",
    courses: [
      { code: "G101", name: "Beginner Greek I", detail: "Active introduction to Attic Greek. Learn the alphabet, core grammar, and read 80+ pages of adapted prose. No prerequisites.",
        longDesc: "This course introduces Ancient Greek using the active, immersive method. You will learn the alphabet, basic morphology and syntax, and begin reading adapted Attic Greek prose from the first week. By term's end, you will have internalized the present tense system, all three declensions, and a working vocabulary of 400+ words — acquired through reading, listening, and speaking. Uses Athenaze and custom Oxford materials.",
        sessions: [
          { id: "g101a", dates: "Mar 10 – May 26", schedule: "Mon & Wed · 7–8:30 PM ET", spots: 3 },
          { id: "g101b", dates: "Jun 2 – Aug 18", schedule: "Tue & Thu · 6–7:30 PM ET", spots: 8 },
        ], price: 895, duration: "14 weeks" },
      { code: "G102", name: "Beginner Greek II", detail: "Complete the grammar and begin reading adapted Xenophon and the New Testament.",
        longDesc: "Building on Greek I, complete your grammar survey — aorist, perfect, subjunctive, optative, participle systems. Increasingly complex adapted texts and lightly edited Xenophon. Conducted primarily in Greek.",
        sessions: [{ id: "g102a", dates: "Mar 12 – May 28", schedule: "Tue & Thu · 7–8:30 PM ET", spots: 5 }], price: 895, duration: "14 weeks" },
      { code: "G201", name: "Intermediate Greek", detail: "Plato, Euripides & Xenophon with increasing independence.",
        longDesc: "Transition from adapted to authentic texts. Plato's Apology, Euripides' Medea, Xenophon's Memorabilia. Grammar integrated into reading. Discussion in Greek.",
        sessions: [{ id: "g201a", dates: "Mar 10 – May 26", schedule: "Mon & Wed · 8–9:30 PM ET", spots: 6 }], price: 995, duration: "14 weeks" },
      { code: "G301", name: "Advanced Seminar", detail: "Homer, Aristotle, prose composition, and oral fluency.",
        longDesc: "The capstone. Homer's Iliad, Aristotle's Nicomachean Ethics, original prose composition. Conducted entirely in Greek.",
        sessions: [{ id: "g301a", dates: "Mar 14 – May 30", schedule: "Fri · 12–1:30 PM ET", spots: 4 }], price: 895, duration: "14 weeks" },
    ],
  },
  {
    id: "latin", label: "Latin", tag: "Lingua Latīna",
    hero: "From Lingua Latina to Virgil, Cicero, and Seneca.",
    intro: "Our Latin curriculum uses Ørberg's Lingua Latina Per Se Illustrata — widely regarded as the finest Latin textbook ever written. Supplemented with oral exercises from Oxford and the Accademia Vivarium Novum.",
    texts: "Lingua Latina (Familia Romana & Roma Aeterna), Fabulae Faciles, Cicero, Virgil, Seneca",
    courses: [
      { code: "L101", name: "Beginner Latin I", detail: "Via Lingua Latina Per Se Illustrata. The most natural way to begin Latin.",
        longDesc: "Using Ørberg's masterpiece, read 100+ pages of Latin in context — learning grammar through comprehensible narrative. Supplemented with oral exercises and our custom digital workbook. No prerequisites.",
        sessions: [
          { id: "l101a", dates: "Mar 11 – May 27", schedule: "Tue & Thu · 7–8:30 PM ET", spots: 2 },
          { id: "l101b", dates: "Jun 3 – Aug 19", schedule: "Mon & Wed · 6–7:30 PM ET", spots: 8 },
          { id: "l101c", dates: "Jun 7 – Aug 23", schedule: "Sat · 10–11:30 AM ET", spots: 8 },
        ], price: 895, duration: "14 weeks" },
      { code: "L102", name: "Beginner Latin II", detail: "Complete Familia Romana and transition to authentic prose.",
        longDesc: "Complete the Familia Romana. Full range of Latin grammar: perfect/pluperfect, subjunctive, indirect discourse, ablative absolutes. Ready for real authors.",
        sessions: [{ id: "l102a", dates: "Mar 10 – May 26", schedule: "Mon & Wed · 7–8:30 PM ET", spots: 4 }], price: 895, duration: "14 weeks" },
      { code: "L201", name: "Intermediate Latin", detail: "Cicero, Virgil, and Horace — your first semester with the masters.",
        longDesc: "Cicero's orations, Virgil's Aeneid, Horace's Odes. Prose composition and Latin prose rhythm.",
        sessions: [{ id: "l201a", dates: "Mar 12 – May 28", schedule: "Tue & Thu · 8–9:30 PM ET", spots: 7 }], price: 995, duration: "14 weeks" },
      { code: "L301", name: "Advanced Seminar", detail: "Prose composition, Tacitus, and Seneca's letters.",
        longDesc: "Tacitus' Agricola, Seneca's Epistulae Morales, Latin prose composition. Conducted entirely in Latin.",
        sessions: [{ id: "l301a", dates: "Mar 13 – May 29", schedule: "Thu · 12–1:30 PM ET", spots: 5 }], price: 895, duration: "14 weeks" },
    ],
  },
  {
    id: "hebrew", label: "Biblical Hebrew", tag: "עִבְרִית",
    hero: "Read Genesis, the Psalms, and the Prophets in the original Hebrew.",
    intro: "Our Hebrew curriculum teaches the language of the Bible through direct engagement with the text. Using the active method adapted for Semitic languages, students read Biblical Hebrew as a living language.",
    texts: "Genesis, Ruth, Jonah, Psalms, Isaiah, custom graded readers",
    courses: [
      { code: "H101", name: "Beginner Hebrew I", detail: "From the Aleph-bet through the narrative of Genesis.",
        longDesc: "Learn the alphabet, vowel system, and fundamental grammar through adapted biblical texts. Internalize the Qal perfect and imperfect. Custom graded readers alongside Genesis.",
        sessions: [
          { id: "h101a", dates: "Mar 12 – May 28", schedule: "Tue & Thu · 6–7:30 PM ET", spots: 6 },
          { id: "h101b", dates: "Jun 4 – Aug 20", schedule: "Mon & Wed · 7–8:30 PM ET", spots: 8 },
        ], price: 895, duration: "14 weeks" },
      { code: "H102", name: "Beginner Hebrew II", detail: "Expanding into narrative and poetic biblical texts.",
        longDesc: "Derived stems (Niphal, Piel, Hiphil, Hithpael), weak verbs, complex syntax. Ruth, Jonah, poetic Hebrew in the Psalms.",
        sessions: [{ id: "h102a", dates: "Mar 10 – May 26", schedule: "Mon & Wed · 6–7:30 PM ET", spots: 7 }], price: 895, duration: "14 weeks" },
      { code: "H201", name: "Intermediate Hebrew", detail: "Prophets, Psalms, and Wisdom literature.",
        longDesc: "Isaiah, Psalms, Proverbs. Hebrew poetry, prophecy, wisdom genres. Rare forms and text-critical awareness.",
        sessions: [{ id: "h201a", dates: "Mar 14 – May 30", schedule: "Fri · 11 AM–12:30 PM ET", spots: 8 }], price: 995, duration: "14 weeks" },
    ],
  },
];

/* ═══════════ GROUP PACKAGES DATA ═══════════ */
const groupTracks = [
  {
    id: "koine",
    language: "Koine Greek",
    tag: "Κοινή",
    tagline: "Read the New Testament in the original Greek",
    desc: "Your congregation will read the Gospels, Epistles, and Septuagint as they were written. Starting from the alphabet, students progress through adapted New Testament passages to reading unadapted Scripture by term's end.",
    texts: "Gospel of John, Romans, 1 Corinthians, Septuagint selections, custom graded readers",
    icon: "α",
    color: "#1a3a4a",
  },
  {
    id: "biblical-hebrew",
    language: "Biblical Hebrew",
    tag: "עִבְרִית",
    tagline: "Read the Old Testament in the original Hebrew",
    desc: "From the opening words of Genesis through the Psalms and Prophets. Students learn the alphabet, vowel system, and grammar through direct engagement with Scripture — reading the Hebrew Bible as a living text.",
    texts: "Genesis, Ruth, Jonah, Psalms, Isaiah, custom graded readers",
    icon: "א",
    color: "#2a2040",
  },
  {
    id: "church-latin",
    language: "Church Latin",
    tag: "Lingua Sacra",
    tagline: "Understand the Mass, the Vulgate, and the Church Fathers",
    desc: "Designed for Catholic parishes, traditional liturgical communities, and anyone who wants to understand the Latin of the Church. From the Ordinary of the Mass through Jerome's Vulgate to Augustine and Aquinas.",
    texts: "Ordinary of the Mass, Vulgate (Genesis, Psalms, Gospels), hymns, Augustine's Confessions selections",
    icon: "✠",
    color: "#4a2a1a",
  },
];

const groupPackages = [
  {
    name: "Single Cohort",
    size: "6–12 students",
    perStudent: 595,
    duration: "10 weeks",
    sessions: "1× per week · 1.5 hrs",
    features: [
      "One language track",
      "Beginner level (no prerequisites)",
      "All materials & digital workbook included",
      "Free demo session for group leaders",
      "Schedule set by your group",
      "Weekly homework with feedback",
    ],
    note: "Minimum 6 students to form a cohort",
    popular: false,
  },
  {
    name: "Full Group",
    size: "13–20 students",
    perStudent: 495,
    duration: "10 weeks",
    sessions: "1× per week · 1.5 hrs",
    features: [
      "Split into two parallel sections",
      "Same instructor, same curriculum",
      "All materials & digital workbook included",
      "Free demo session for whole group",
      "Flexible scheduling (2 time slots)",
      "Dedicated group coordinator",
    ],
    note: "Best value — ideal for Bible study groups & parishes",
    popular: true,
  },
  {
    name: "Ongoing Partnership",
    size: "Any size",
    perStudent: null,
    duration: "Term by term",
    sessions: "Custom",
    features: [
      "Multiple languages or levels",
      "Semester-by-semester continuity",
      "Group rate locked for 2 years",
      "Priority scheduling",
      "Progress reports for group leaders",
      "Custom curriculum available",
    ],
    note: "For churches & organizations committed to a multi-term program",
    popular: false,
  },
];

const COLE_IMG = "data:image/jpeg;base64,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";
const TOPHER_IMG = "data:image/jpeg;base64,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";

const faculty = [
  {
    name: "Cole Whetstone",
    role: "Founder & Lead Instructor",
    img: COLE_IMG,
    credentials: "BA Harvard University · MSt University of Oxford",
    bio: "After completing his undergraduate years at Harvard, Cole received a full scholarship to study Ancient Philosophy at Oxford, where he taught Ancient Greek after graduation. Drawing on his own system for learning languages — through which he mastered seven languages after the age of 20 — Cole brings a rare combination of scholarly depth and practical fluency to every class.",
  },
  {
    name: "Christopher Colby",
    role: "Instructor",
    img: TOPHER_IMG,
    credentials: "BA Harvard University · MSt University of Oxford · DPhil University of Oxford",
    bio: "Topher is a DPhil candidate at Oxford studying Classical Languages and Literature. In addition to his studies in Ancient Greek and Music, he teaches at Jesus College as a tutor and has hands-on experience assisting the Oxford admissions process. He graduated from Harvard cum laude in Classics and Music.",
  },
];

/* ═══════════ VISUAL COMPONENTS ═══════════ */

function HeroVisual() {
  const s = (c) => ({ position: "absolute", background: `rgba(180,165,140,${c})` });
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(175deg, #0c0e18 0%, #141828 25%, #1a2238 45%, #1e2a3e 60%, #263248 75%, #2a3548 100%)" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40%", background: "linear-gradient(to top, rgba(160,120,70,0.06) 0%, transparent 100%)" }} />
      {[[8,5],[18,12],[32,3],[45,15],[58,8],[72,4],[85,16],[94,9],[25,20],[65,2],[50,18],[78,11],[12,22],[40,7],[88,20],[55,5],[35,14],[70,8]].map(([l,t],i) => (
        <div key={i} style={{ position: "absolute", left: `${l}%`, top: `${t}%`, width: i%5===0?2.5:1.5, height: i%5===0?2.5:1.5, borderRadius: "50%", background: "#fff", opacity: 0.1 + (i%7)*0.05 }} />
      ))}
      <div style={{...s(0.055), bottom: 0, left: "2%", width: "28%", height: "32%" }} />
      <div style={{...s(0.04), bottom: "32%", left: "5%", width: "4%", height: "8%", borderRadius: "2px 2px 0 0" }} />
      <div style={{...s(0.04), bottom: "32%", left: "12%", width: "4%", height: "6%", borderRadius: "2px 2px 0 0" }} />
      <div style={{...s(0.04), bottom: "32%", left: "19%", width: "4%", height: "7%", borderRadius: "2px 2px 0 0" }} />
      <div style={{...s(0.065), bottom: 0, left: "26%", width: "8%", height: "52%" }} />
      <div style={{...s(0.07), bottom: "52%", left: "27%", width: "6%", height: "12%", borderRadius: "2px 2px 0 0" }} />
      <div style={{ position: "absolute", bottom: "64%", left: "29%", width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderBottom: "50px solid rgba(180,165,140,0.06)" }} />
      <div style={{...s(0.06), bottom: 0, left: "34%", width: "32%", height: "38%" }} />
      <div style={{ position: "absolute", bottom: 0, left: "47%", width: "6%", height: "18%", borderRadius: "40% 40% 0 0", background: "rgba(120,100,70,0.04)" }} />
      {[37,41,45,53,57,61].map((l,i) => (
        <div key={`w${i}`} style={{ position: "absolute", bottom: "22%", left: `${l}%`, width: "2.5%", height: "8%", borderRadius: "30% 30% 0 0", background: "rgba(200,180,130,0.025)" }} />
      ))}
      <div style={{...s(0.055), bottom: "38%", left: "43%", width: "14%", height: "10%" }} />
      <div style={{...s(0.05), bottom: "48%", left: "45%", width: "10%", height: "6%", borderRadius: "2px 2px 0 0" }} />
      <div style={{ position: "absolute", bottom: "54%", left: "48.5%", width: 0, height: 0, borderLeft: "16px solid transparent", borderRight: "16px solid transparent", borderBottom: "35px solid rgba(180,165,140,0.045)" }} />
      <div style={{...s(0.065), bottom: 0, right: "26%", width: "8%", height: "48%" }} />
      <div style={{...s(0.06), bottom: "48%", right: "26.5%", width: "7%", height: "6%", borderRadius: "2px 2px 0 0" }} />
      {[0,1,2,3].map(i => (
        <div key={`p${i}`} style={{ position: "absolute", bottom: "54%", right: `${27 + i * 2}%`, width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderBottom: `${14 + (i%2)*6}px solid rgba(180,165,140,0.04)` }} />
      ))}
      <div style={{...s(0.05), bottom: 0, right: "2%", width: "26%", height: "30%" }} />
      <div style={{...s(0.04), bottom: "30%", right: "8%", width: "4%", height: "7%", borderRadius: "2px 2px 0 0" }} />
      <div style={{...s(0.04), bottom: "30%", right: "16%", width: "4%", height: "6%", borderRadius: "2px 2px 0 0" }} />
      {[[1,28],[8,25],[92,26],[98,30]].map(([l,h],i) => (
        <div key={`t${i}`} style={{ position: "absolute", bottom: 0, left: `${l}%`, width: `${3+i%2}%`, height: `${h}%`, borderRadius: "40% 40% 0 0", background: `rgba(30,40,30,${0.3+i*0.05})` }} />
      ))}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3%", background: "rgba(30,40,35,0.4)" }} />
      {[[39,26],[43,26],[57,26],[61,26],[48,10]].map(([l,b],i) => (
        <div key={`g${i}`} style={{ position: "absolute", bottom: `${b}%`, left: `${l}%`, width: "1.5%", height: "4%", background: "rgba(255,210,120,0.04)", borderRadius: "20% 20% 0 0" }} />
      ))}
      <div style={{ position: "absolute", bottom: "28%", right: "3%", fontFamily: "var(--serif)", fontSize: "clamp(60px,10vw,130px)", fontWeight: 700, color: "rgba(255,255,255,0.01)", letterSpacing: "0.1em", userSelect: "none", pointerEvents: "none" }}>VERITAS</div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,12,18,0.88) 0%, rgba(10,12,18,0.3) 35%, rgba(10,12,18,0.05) 60%, transparent 100%)" }} />
    </div>
  );
}

function IllustrationCard({ type = "library" }) {
  const themes = {
    library: { bg: "linear-gradient(145deg, #3a3028 0%, #5c4a3a 50%, #7a6550 100%)", glyph: "ΣΟΦΙΑ", sub: "wisdom" },
    greek: { bg: "linear-gradient(145deg, #1a3a4a 0%, #2a5a6a 50%, #4a8a9a 100%)", glyph: "ΛΟΓΟΣ", sub: "word · reason" },
    latin: { bg: "linear-gradient(145deg, #4a2a1a 0%, #6a4a30 50%, #8a6a48 100%)", glyph: "VERITAS", sub: "truth" },
    hebrew: { bg: "linear-gradient(145deg, #2a2040 0%, #3a3060 50%, #5a4a80 100%)", glyph: "אֱמֶת", sub: "truth" },
  };
  const t = themes[type] || themes.library;
  const books = type === "library" ? [
    [10,20,8,24,"#8b3a2f"],[19,22,6,22,"#3a5a6a"],[26,18,9,26,"#6a5a3a"],[36,21,7,23,"#4a6a4a"],
    [44,19,8,25,"#5a3a5a"],[53,23,6,21,"#2a4a5a"],[60,17,10,27,"#7a5a2a"],[71,20,7,24,"#3a3a5a"],[79,22,8,22,"#8a6a3a"],
    [12,50,9,25,"#4a2a2a"],[22,52,7,23,"#2a5a4a"],[30,48,8,27,"#6a3a4a"],[39,51,6,24,"#5a6a3a"],
    [46,49,10,26,"#3a4a6a"],[57,53,7,22,"#7a3a3a"],[65,47,9,28,"#2a6a5a"],[75,50,8,25,"#8b3a2f"],
  ] : [];
  return (
    <div style={{ width: "100%", aspectRatio: "4/5", borderRadius: 6, overflow: "hidden", position: "relative", background: t.bg }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.5) 30px, rgba(255,255,255,0.5) 31px), repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.5) 30px, rgba(255,255,255,0.5) 31px)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.25) 100%)" }} />
      {type === "library" && [28,45,62,79].map(p => (
        <div key={p} style={{ position: "absolute", left: "8%", right: "8%", top: `${p}%`, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }} />
      ))}
      {books.map(([l,tp,w,h,c], i) => (
        <div key={i} style={{ position: "absolute", left: `${l}%`, top: `${tp}%`, width: `${w}%`, height: `${h}%`, background: c, opacity: 0.35, borderRadius: 2 }} />
      ))}
      {type === "greek" && [20,40,60,80].map((l,i) => (
        <div key={i} style={{ position: "absolute", left: `${l-2}%`, bottom: "15%", width: "4%", height: `${40+i*5}%`, background: "rgba(255,255,255,0.06)", borderRadius: "3px 3px 0 0" }} />
      ))}
      {type === "hebrew" && (
        <div style={{ position: "absolute", left: "20%", top: "25%", width: "60%", height: "50%", border: "2px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
          {[0,1,2,3,4,5].map(i => <div key={i} style={{ position: "absolute", left: "10%", right: "10%", top: `${15+i*14}%`, height: 2, background: "rgba(255,255,255,0.04)" }} />)}
        </div>
      )}
      {type === "latin" && (
        <div style={{ position: "absolute", left: "25%", top: "20%", width: "50%", height: "60%", background: "rgba(255,255,255,0.03)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.04)" }}>
          {[0,1,2,3,4,5,6,7].map(i => <div key={i} style={{ position: "absolute", left: "12%", right: "12%", top: `${12+i*10}%`, height: 2, background: "rgba(255,255,255,0.03)" }} />)}
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px,5vw,48px)", fontWeight: 600, color: "rgba(255,255,255,0.08)", letterSpacing: "0.12em" }}>{t.glyph}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "rgba(255,255,255,0.06)", letterSpacing: "0.25em", textTransform: "uppercase", marginTop: 6 }}>{t.sub}</span>
      </div>
    </div>
  );
}

function ManuscriptBanner({ lang = "greek" }) {
  const lines = {
    greek: ["μῆνιν ἄειδε θεὰ Πηληϊάδεω Ἀχιλῆος", "οὐλομένην, ἣ μυρί᾿ Ἀχαιοῖς ἄλγε᾿ ἔθηκε"],
    latin: ["Arma virumque canō, Trōiae quī prīmus ab ōrīs", "Ītaliam, fātō profugus, Lāvīniaque vēnit"],
    hebrew: ["בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם", "וְאֵת הָאָרֶץ · וְהָאָרֶץ הָיְתָה תֹהוּ וָבֹהוּ"],
  };
  return (
    <div style={{ width: "100%", height: "100%", minHeight: 140, borderRadius: 6, overflow: "hidden", position: "relative", background: "linear-gradient(135deg, #f0e8d8 0%, #e8dcc8 50%, #ddd0b8 100%)" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 24px, rgba(120,100,60,1) 24px, rgba(120,100,60,1) 25px)" }} />
      <div style={{ position: "absolute", left: "6%", top: 0, bottom: 0, width: 1, background: "rgba(139,58,47,0.15)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 12%" }}>
        {(lines[lang] || lines.greek).map((line, i) => (
          <p key={i} style={{ fontFamily: "serif", fontSize: "clamp(11px,1.6vw,16px)", color: `rgba(40,30,20,${0.35-i*0.1})`, lineHeight: 2.4, letterSpacing: "0.02em" }}>{line}</p>
        ))}
      </div>
      <div style={{ position: "absolute", top: 0, right: 0, width: 40, height: 40, background: "linear-gradient(225deg, rgba(250,247,242,0.4) 0%, transparent 60%)" }} />
    </div>
  );
}

/* ═══════════ UI COMPONENTS ═══════════ */

function Nav({ page, navigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [["Courses","courses"],["Method","method"],["Groups","groups"],["Tutorials","tutorials"],["Contact","contact"]];
  return (
    <>
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(250,247,242,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <span onClick={() => { navigate("home"); setMobileOpen(false); }} style={{ cursor: "pointer", fontFamily: "var(--serif)", fontSize: 20, fontWeight: 600, letterSpacing: "0.04em" }}>Whetstone</span>
        <div className="desktop-nav-links" style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {navLinks.map(([l,t]) => (
            <span key={t} onClick={() => navigate(t)} style={{ cursor: "pointer", fontSize: 13, fontWeight: page === t ? 600 : 500, color: page === t ? "var(--ink)" : "var(--ink-muted)", letterSpacing: "0.04em", borderBottom: page === t ? "2px solid var(--accent)" : "2px solid transparent", paddingBottom: 2 }}>{l}</span>
          ))}
          <span onClick={() => navigate("schedule")} style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff", background: "var(--ink)", padding: "9px 22px", borderRadius: 3 }}>Enroll</span>
        </div>
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
    </nav>
    {mobileOpen && (
      <div className="mobile-menu-overlay" onClick={() => setMobileOpen(false)}>
        {navLinks.map(([l,t]) => (
          <span key={t} onClick={() => { navigate(t); setMobileOpen(false); }} style={{ cursor: "pointer", fontSize: 20, fontFamily: "var(--serif)", fontWeight: page === t ? 600 : 400, color: page === t ? "var(--accent)" : "var(--ink)" }}>{l}</span>
        ))}
        <span onClick={() => { navigate("schedule"); setMobileOpen(false); }} style={{ cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#fff", background: "var(--ink)", padding: "12px 32px", borderRadius: 3, marginTop: 8 }}>Enroll</span>
      </div>
    )}
    </>
  );
}

function PageHead({ overline, title, subtitle }) {
  return (
    <section style={{ paddingTop: 140, paddingBottom: 80, textAlign: "center", borderBottom: "1px solid var(--border)" }}>
      {overline && <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>{overline}</p>}
      <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(32px,4vw,48px)", fontWeight: 400, lineHeight: 1.2, maxWidth: 600, margin: "0 auto" }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 16, color: "var(--ink-muted)", lineHeight: 1.7, maxWidth: 480, margin: "20px auto 0" }}>{subtitle}</p>}
    </section>
  );
}

function Btn({ children, onClick, variant = "primary", style: s }) {
  const base = { cursor: "pointer", fontSize: 14, fontWeight: 600, borderRadius: 3, padding: "12px 28px", border: "none", fontFamily: "var(--sans)", transition: "all 0.2s", display: "inline-block", textAlign: "center" };
  if (variant === "primary") Object.assign(base, { background: "var(--ink)", color: "#fff" });
  if (variant === "outline") Object.assign(base, { background: "transparent", color: "var(--ink)", border: "1px solid var(--border)" });
  if (variant === "accent") Object.assign(base, { background: "var(--accent)", color: "#fff" });
  Object.assign(base, s);
  return <button style={base} onClick={onClick}>{children}</button>;
}

function SessionRow({ s, onEnroll }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: "14px 32px", borderTop: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-light)", minWidth: 148 }}>{s.dates}</span>
        <span style={{ fontSize: 13, color: "var(--ink-muted)" }}>{s.schedule}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: s.spots <= 3 ? "var(--accent)" : "var(--ink-faint)" }}>{s.spots <= 3 ? `${s.spots} spots left` : `${s.spots} spots`}</span>
        <Btn variant="outline" onClick={onEnroll} style={{ padding: "8px 20px", fontSize: 13 }}>Enroll</Btn>
      </div>
    </div>
  );
}

function Footer({ navigate }) {
  return (
    <footer style={{ padding: "48px 40px", borderTop: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div><span style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 600 }}>Whetstone</span><span style={{ fontSize: 12, color: "var(--ink-faint)", marginLeft: 12 }}>Classical Languages</span></div>
        <div style={{ display: "flex", gap: 24 }}>
          {[["Schedule","schedule"],["Method","method"],["Groups","groups"],["Tutorials","tutorials"],["Contact","contact"]].map(([l,t]) => (
            <span key={t} onClick={() => navigate(t)} style={{ cursor: "pointer", fontSize: 12, color: "var(--ink-muted)" }}>{l}</span>
          ))}
        </div>
        <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>© 2026 Whetstone Admissions & Advisory</span>
      </div>
    </footer>
  );
}

const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 4, border: "1px solid var(--border)", fontFamily: "var(--sans)", fontSize: 15, background: "var(--card)" };
const selectStyle = { ...inputStyle, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238a8580' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center", paddingRight: 40 };

/* ═══════════ PAGE: HOME ═══════════ */
function HomePage({ navigate }) {
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", position: "relative", overflow: "hidden" }}>
        <HeroVisual />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1120, margin: "0 auto", width: "100%", padding: "0 40px 100px", animation: "rise 0.9s ease-out" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 24 }}>Harvard & Oxford Faculty · Active Method · Live Online</p>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(40px,5.5vw,66px)", fontWeight: 400, color: "#fff", lineHeight: 1.12, maxWidth: 620 }}>Read the ancients<br /><em style={{ fontWeight: 500 }}>in their own words</em></h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 440, marginTop: 24, fontWeight: 300 }}>Small-group immersion in Ancient Greek, Latin, and Biblical Hebrew. Harvard & Oxford-trained faculty. You'll be reading — and thinking — in the language from week one.</p>
          <div style={{ display: "flex", gap: 16, marginTop: 40, flexWrap: "wrap" }}>
            <Btn onClick={() => navigate("schedule")} style={{ background: "#fff", color: "var(--ink)", padding: "14px 32px" }}>View Schedule & Enroll</Btn>
            <Btn variant="outline" onClick={() => navigate("method")} style={{ color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.2)", padding: "14px 32px" }}>Our Approach</Btn>
          </div>
        </div>
      </section>

      {/* CREDENTIAL BAR */}
      <section style={{ padding: "40px 40px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center", gap: 64, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "var(--mono)" }}>Faculty from</span>
          {["HARVARD UNIVERSITY", "UNIVERSITY OF OXFORD", "ACCADEMIA VIVARIUM NOVUM"].map(n => (
            <span key={n} style={{ fontFamily: "var(--serif)", fontSize: 14, fontWeight: 600, letterSpacing: "0.12em", color: "var(--ink)", opacity: 0.25 }}>{n}</span>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section style={{ padding: "120px 40px", maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ maxWidth: 720, marginBottom: 56 }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>About</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 34, fontWeight: 400, lineHeight: 1.28, marginBottom: 24 }}>The fastest, most natural way to learn ancient languages</h2>
          <p style={{ fontSize: 16, color: "var(--ink-light)", lineHeight: 1.8, marginBottom: 16 }}>We don't teach <em>about</em> Greek, Latin, or Hebrew — we teach <em>in</em> them. Using the active method, the same immersive approach used at Oxford and the Accademia Vivarium Novum, our students acquire real reading fluency.</p>
          <p style={{ fontSize: 16, color: "var(--ink-light)", lineHeight: 1.8, marginBottom: 28 }}>This is not a traditional class. It's a space for students who want to actually <em>acquire</em> these languages — to think in them, hear them, speak them — rather than study them in a purely academic sense.</p>
          <Btn onClick={() => navigate("method")}>Learn About Our Method →</Btn>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 56 }}>
          {faculty.map(f => (
            <div key={f.name} style={{ textAlign: "center", maxWidth: 200 }}>
              <img src={f.img} alt={f.name} style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", objectPosition: "center top", marginBottom: 16 }} />
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 17, fontWeight: 500, marginBottom: 3 }}>{f.name}</h3>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>{f.role}</p>
              <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--ink-faint)", lineHeight: 1.5 }}>{f.credentials}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section style={{ padding: "100px 40px", background: "var(--bg-alt)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>What's Included</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 34, fontWeight: 400, textAlign: "center", marginBottom: 16 }}>Far more than a language course</h2>
          <p style={{ fontSize: 16, color: "var(--ink-muted)", textAlign: "center", maxWidth: 560, margin: "0 auto 56px", lineHeight: 1.7 }}>Every enrollment includes a full ecosystem of support designed to accelerate your fluency.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { num: "I", title: "30 Hours of Live Immersion", desc: "Twice-weekly small-group sessions maximizing conversation, reading, and fluency — not dry lectures." },
              { num: "II", title: "Free Language Assessment", desc: "Before you start, we map your strengths, weaknesses, and learning potential with a complimentary evaluation." },
              { num: "III", title: "Personalized Study Plan", desc: "A custom roadmap tailored to your goals, with regular diagnostic tests and fluency estimates." },
              { num: "IV", title: "Weekly Office Hours", desc: "Drop-in Q&A, extra practice, and individual guidance beyond your scheduled class sessions." },
              { num: "V", title: "Full Resource Library", desc: "Private access to audio materials, video tutorials, grammar guides, vocabulary lists, and reading companions." },
              { num: "VI", title: "Practice Tests with Feedback", desc: "Full-length assessments with graded, detailed feedback to track your progress throughout the term." },
            ].map((item, i) => (
              <div key={i} style={{ background: "var(--card)", borderRadius: 6, padding: "32px 28px", border: "1px solid var(--border)" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, color: "var(--accent)", marginBottom: 16, opacity: 0.7 }}>{item.num}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LANGUAGES */}
      <section style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>Curriculum</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 34, fontWeight: 400, textAlign: "center", marginBottom: 64 }}>Three languages, one method</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {languages.map(lang => (
              <div key={lang.id} onClick={() => navigate("lang", lang.id)} style={{ background: "var(--card)", borderRadius: 6, overflow: "hidden", border: "1px solid var(--border)", cursor: "pointer", transition: "all 0.3s ease" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ height: 140, overflow: "hidden" }}><ManuscriptBanner lang={lang.id} /></div>
                <div style={{ padding: "24px 28px 32px" }}>
                  <p style={{ fontFamily: "var(--serif)", fontSize: 14, fontStyle: "italic", color: "var(--ink-faint)", marginBottom: 10 }}>{lang.tag}</p>
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, marginBottom: 10 }}>{lang.label}</h3>
                  <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.7, marginBottom: 16 }}>{lang.courses.length} courses from beginner to advanced. {lang.hero}</p>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>Explore courses →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GROUP CALLOUT — NEW */}
      <section style={{ padding: "80px 40px", background: "var(--bg-alt)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>Churches & Groups</p>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 400, lineHeight: 1.3, marginBottom: 16 }}>Bring Scripture alive for your congregation</h2>
            <p style={{ fontSize: 15, color: "var(--ink-light)", lineHeight: 1.8, marginBottom: 24 }}>We partner with churches, synagogues, Bible study groups, and meetups to offer group language courses at reduced rates. One sign-up from a group leader — we handle the rest.</p>
            <Btn onClick={() => navigate("groups")}>Group Packages →</Btn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {groupTracks.map(track => (
              <div key={track.id} style={{ background: track.color, borderRadius: 6, padding: "24px 16px", textAlign: "center" }}>
                <span style={{ fontFamily: "var(--serif)", fontSize: 28, color: "rgba(255,255,255,0.15)" }}>{track.icon}</span>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 12, fontWeight: 500, lineHeight: 1.4 }}>{track.language}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BONUSES */}
      <section style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>Bonuses</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 34, fontWeight: 400, textAlign: "center", marginBottom: 56 }}>Extra resources to help you succeed</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {[
              { title: "Outings to The Met", desc: "For those in NYC, we visit the Metropolitan Museum of Art to engage with ancient history firsthand." },
              { title: "Multilingual Learning Framework", desc: "The exact techniques behind learning 9 languages in 8 years — plus curated resources for Latin, Italian, French, Sanskrit, German, and more." },
              { title: "Latin & Greek Intensives", desc: "In-person immersion weekends designed to push your skills forward in a concentrated, focused period." },
              { title: "Private Learning Community", desc: "A WhatsApp/Slack group for discussion, practice, and ongoing support between sessions." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 20, padding: 28, background: "var(--card)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bg-alt)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 600, color: "var(--accent)", opacity: 0.8 }}>+</span>
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GUARANTEE + REFERRAL */}
      <section style={{ padding: "100px 40px", background: "var(--bg-alt)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div style={{ background: "var(--ink)", borderRadius: 8, padding: "48px 40px", color: "#fff" }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>Guarantee</p>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 400, lineHeight: 1.3, marginBottom: 20, color: "rgba(255,255,255,0.9)" }}>Risk-free for four weeks</h3>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8 }}>If after four weeks you don't feel a real improvement in your ability to read Greek, Latin, or Hebrew, we'll work with you for free for the next four weeks. No questions asked.</p>
          </div>
          <div style={{ background: "var(--accent)", borderRadius: 8, padding: "48px 40px", color: "#fff" }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>Refer a Friend</p>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 400, lineHeight: 1.3, marginBottom: 20 }}>$100 for you. $100 off for them.</h3>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>For every friend who signs up, you receive $100 in credit or cash, and they get $100 off tuition.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 660, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 400, fontStyle: "italic", lineHeight: 1.55, color: "var(--ink-light)", marginBottom: 28 }}>"After years studying Latin with the grammar-translation method, I could parse sentences but never truly read. Three months of immersive classes changed everything — I think in the language now."</p>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-faint)", letterSpacing: "0.1em" }}>— INTERMEDIATE LATIN STUDENT, 2025</p>
        </div>
      </section>

      {/* COMMUNITY */}
      <section style={{ padding: "100px 40px", background: "var(--bg-alt)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>Community</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 34, fontWeight: 400, marginBottom: 24 }}>More than a classroom</h2>
          <p style={{ fontSize: 16, color: "var(--ink-light)", lineHeight: 1.8, marginBottom: 16 }}>Whetstone Classical Languages is an extension of the New York Philosophical Society and its Philosophy Club — a community of 600 weekly participants with a waitlist exceeding 3,000.</p>
          <p style={{ fontSize: 16, color: "var(--ink-light)", lineHeight: 1.8, marginBottom: 16 }}>By enrolling, you're joining a community of deep thinkers and lifelong learners, and helping sustain the spaces where we gather, read, and think together.</p>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", fontStyle: "italic", marginBottom: 36 }}>75% of all proceeds go directly toward Philosophy Club venues and operations.</p>
          <Btn variant="outline" onClick={() => navigate("contact")}>Learn More About the Community →</Btn>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "120px 40px", textAlign: "center", background: "var(--ink)", color: "#fff" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 400, marginBottom: 16, color: "rgba(255,255,255,0.9)" }}>Ready to begin?</h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", maxWidth: 500, margin: "0 auto 12px" }}>No prerequisites for any 101 course. Not sure where to start?</p>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", maxWidth: 500, margin: "0 auto 36px" }}>Book a free placement call and sample session to experience the approach firsthand.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn onClick={() => navigate("schedule")} style={{ background: "#fff", color: "var(--ink)", padding: "14px 32px" }}>View Schedule</Btn>
          <Btn variant="outline" onClick={() => navigate("groups")} style={{ color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.25)", padding: "14px 32px" }}>Group Packages</Btn>
        </div>
      </section>
    </div>
  );
}

/* ═══════════ PAGE: COURSES ═══════════ */
function CoursesPage({ navigate }) {
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <PageHead overline="Curriculum" title="Our Courses" subtitle="Ancient Greek, Latin, and Biblical Hebrew from beginner to advanced." />
      <section style={{ padding: "80px 40px", maxWidth: 1120, margin: "0 auto" }}>
        {languages.map(lang => (
          <div key={lang.id} style={{ marginBottom: 80 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32 }}>
              <div>
                <p style={{ fontFamily: "var(--serif)", fontSize: 14, fontStyle: "italic", color: "var(--ink-faint)", marginBottom: 6 }}>{lang.tag}</p>
                <h2 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 500, cursor: "pointer" }} onClick={() => navigate("lang", lang.id)}>{lang.label}</h2>
              </div>
              <span onClick={() => navigate("lang", lang.id)} style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>View all →</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {lang.courses.map(c => (
                <div key={c.code} onClick={() => navigate("course", lang.id, c.code)} style={{ background: "var(--card)", borderRadius: 6, padding: "28px 24px", border: "1px solid var(--border)", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)" }}>{c.code}</span>
                    <span style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 500 }}>${c.price}</span>
                  </div>
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 500, marginBottom: 6 }}>{c.name}</h3>
                  <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6 }}>{c.detail.slice(0, 80)}…</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ textAlign: "center", marginTop: 20, padding: 32, background: "var(--bg-alt)", borderRadius: 6, border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 15, color: "var(--ink-light)", marginBottom: 12 }}>Looking for group rates for your church, synagogue, or study group?</p>
          <Btn variant="outline" onClick={() => navigate("groups")}>View Group Packages →</Btn>
        </div>
      </section>
    </div>
  );
}

/* ═══════════ PAGE: LANGUAGE ═══════════ */
function LangPage({ langId, navigate }) {
  const lang = languages.find(l => l.id === langId);
  if (!lang) return <div style={{ padding: "160px 40px", textAlign: "center" }}>Not found.</div>;
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <PageHead overline={lang.tag} title={lang.label} subtitle={lang.hero} />
      <section style={{ padding: "80px 40px", maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start", marginBottom: 80 }}>
          <div>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, marginBottom: 16 }}>Overview</h3>
            <p style={{ fontSize: 15, color: "var(--ink-light)", lineHeight: 1.8, marginBottom: 20 }}>{lang.intro}</p>
            <p style={{ fontSize: 13, color: "var(--ink-muted)" }}><strong>Core texts:</strong> {lang.texts}</p>
          </div>
          <div style={{ maxWidth: 400 }}><IllustrationCard type={langId} /></div>
        </div>
        <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, marginBottom: 32 }}>Courses</h3>
        {lang.courses.map(course => (
          <div key={course.code} style={{ background: "var(--card)", borderRadius: 6, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 16 }}>
            <div onClick={() => navigate("course", lang.id, course.code)} style={{ padding: "28px 32px", cursor: "pointer", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)" }}>{course.code}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>{course.duration}</span>
                </div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 500, marginBottom: 4 }}>{course.name}</h3>
                <p style={{ fontSize: 14, color: "var(--ink-muted)" }}>{course.detail}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 500 }}>${course.price}</span>
                <span style={{ fontSize: 12, color: "var(--ink-faint)", display: "block" }}>per term</span>
              </div>
            </div>
            {course.sessions.map((s, j) => <SessionRow key={j} s={s} onEnroll={() => navigate("enroll", lang.id, course.code, s.id)} />)}
          </div>
        ))}
      </section>
    </div>
  );
}

/* ═══════════ PAGE: COURSE DETAIL ═══════════ */
function CourseDetail({ langId, courseCode, navigate }) {
  const lang = languages.find(l => l.id === langId);
  const course = lang?.courses.find(c => c.code === courseCode);
  if (!lang || !course) return <div style={{ padding: "160px 40px", textAlign: "center" }}>Not found.</div>;
  const idx = lang.courses.indexOf(course);
  const prev = lang.courses[idx-1], next = lang.courses[idx+1];
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "120px 40px 0" }}>
        <span onClick={() => navigate("lang", lang.id)} style={{ cursor: "pointer", fontSize: 13, color: "var(--ink-muted)", display: "inline-block", marginBottom: 24 }}>← {lang.label}</span>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 40 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent)" }}>{course.code}</span>
              <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>{course.duration} · 1×/week · 1.5 hrs</span>
            </div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px,3.5vw,40px)", fontWeight: 400 }}>{course.name}</h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 500 }}>${course.price}</span>
            <span style={{ fontSize: 13, color: "var(--ink-faint)", display: "block" }}>per term · max 8 students</span>
          </div>
        </div>
      </section>
      <section style={{ padding: "40px 40px 80px", maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 64, alignItems: "start" }}>
          <div>
            <p style={{ fontSize: 16, color: "var(--ink-light)", lineHeight: 1.85, marginBottom: 32 }}>{course.longDesc}</p>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 500, marginBottom: 20 }}>Available Sessions</h3>
            {course.sessions.map((s, j) => (
              <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, padding: "20px 24px", borderRadius: 6, background: "var(--card)", border: "1px solid var(--border)", marginBottom: 12 }}>
                <div>
                  <p style={{ fontFamily: "var(--mono)", fontSize: 14, marginBottom: 4 }}>{s.dates}</p>
                  <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>{s.schedule}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: s.spots <= 3 ? "var(--accent)" : "var(--ink-faint)" }}>{s.spots <= 3 ? `Only ${s.spots} left` : `${s.spots} spots`}</span>
                  <Btn variant="accent" onClick={() => navigate("enroll", lang.id, course.code, s.id)} style={{ padding: "10px 24px" }}>Enroll Now</Btn>
                </div>
              </div>
            ))}
          </div>
          <div style={{ position: "sticky", top: 88 }}>
            <div style={{ background: "var(--bg-alt)", borderRadius: 6, padding: "28px 24px", border: "1px solid var(--border)" }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>COURSE DETAILS</h4>
              {[["Duration",course.duration],["Sessions/week","1"],["Session length","1.5 hours"],["Max class size","8 students"],["Format","Live online (Zoom)"],["Language",lang.label],["Prerequisites",idx===0?"None":`${lang.courses[idx-1].code} or equiv.`]].map(([k,v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 13, color: "var(--ink-muted)" }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
            {(prev||next) && <div style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: 12, color: "var(--ink-faint)", letterSpacing: "0.1em", marginBottom: 12 }}>PATHWAY</h4>
              {prev && <span onClick={() => navigate("course",lang.id,prev.code)} style={{ cursor: "pointer", display: "block", fontSize: 13, color: "var(--ink-muted)", marginBottom: 8 }}>← {prev.name}</span>}
              <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 8 }}>{course.name}</span>
              {next && <span onClick={() => navigate("course",lang.id,next.code)} style={{ cursor: "pointer", display: "block", fontSize: 13, color: "var(--ink-muted)" }}>{next.name} →</span>}
            </div>}
            <div style={{ marginTop: 20, padding: 20, background: "var(--ink)", borderRadius: 6, color: "#fff" }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>4-Week Guarantee</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>No improvement after 4 weeks? We'll work with you free for the next 4.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══════════ PAGE: SCHEDULE ═══════════ */
function SchedulePage({ navigate }) {
  const [active, setActive] = useState("greek");
  const lang = languages.find(l => l.id === active);
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <PageHead overline="Spring & Summer 2026" title="Class Schedule" subtitle="All courses meet once per week for 14 weeks via Zoom." />
      <section style={{ padding: "60px 40px 120px", maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
          <div style={{ display: "flex", background: "var(--card)", borderRadius: 6, padding: 4, border: "1px solid var(--border)" }}>
            {languages.map(l => (
              <button key={l.id} onClick={() => setActive(l.id)} style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: active === l.id ? 600 : 400, padding: "10px 24px", borderRadius: 4, border: "none", cursor: "pointer", background: active === l.id ? "var(--ink)" : "transparent", color: active === l.id ? "#fff" : "var(--ink-muted)" }}>{l.label}</button>
            ))}
          </div>
        </div>
        {lang.courses.map(course => (
          <div key={course.code} style={{ background: "var(--card)", borderRadius: 6, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 16 }}>
            <div onClick={() => navigate("course", lang.id, course.code)} style={{ padding: "28px 32px", cursor: "pointer", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)" }}>{course.code}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>{course.duration}</span>
                </div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 500, marginBottom: 4 }}>{course.name}</h3>
                <p style={{ fontSize: 14, color: "var(--ink-muted)" }}>{course.detail.slice(0,70)}…</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 500 }}>${course.price}</span>
                <span style={{ fontSize: 12, color: "var(--ink-faint)", display: "block" }}>per term</span>
              </div>
            </div>
            {course.sessions.map((s,j) => <SessionRow key={j} s={s} onEnroll={() => navigate("enroll",lang.id,course.code,s.id)} />)}
          </div>
        ))}
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <p style={{ fontSize: 14, color: "var(--ink-muted)", marginBottom: 8 }}>
            Tutorials: $150/hr individual. <span onClick={() => navigate("tutorials")} style={{ color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}>Learn more →</span>
          </p>
          <p style={{ fontSize: 14, color: "var(--ink-muted)" }}>
            Group rates from $495/student. <span onClick={() => navigate("groups")} style={{ color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}>Church & group packages →</span>
          </p>
        </div>
      </section>
    </div>
  );
}

/* ═══════════ PAGE: METHOD ═══════════ */
function MethodPage({ navigate }) {
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <PageHead overline="Pedagogy" title="The Active Method" subtitle="How we teach ancient languages — and why it works." />
      <section style={{ padding: "80px 40px", maxWidth: 800, margin: "0 auto" }}>
        <p style={{ fontSize: 17, color: "var(--ink-light)", lineHeight: 1.9, marginBottom: 32 }}>For centuries, ancient languages were taught through grammar-translation: memorize paradigm tables, parse sentences, render text into English word by word. The result? Students who can decode but never truly <em>read</em>.</p>
        <p style={{ fontSize: 17, color: "var(--ink-light)", lineHeight: 1.9, marginBottom: 32 }}>The active method reverses this. Refined at the Accademia Vivarium Novum and Oxford, it treats ancient languages as <em>languages</em>, not codes.</p>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 500, margin: "48px 0 24px" }}>Four principles</h2>
        {[
          { t: "Comprehensible input", b: "Every sentence understood in context. Grammar acquired through encounter — reading, hearing, speaking — not abstract rules." },
          { t: "Immersive instruction", b: "Classes conducted primarily in the target language from session one. Uncomfortable the first hour. Transformative by the third week." },
          { t: "Small-group interaction", b: "Maximum eight students. Everyone speaks, reads aloud, and receives individual feedback every session." },
          { t: "Proven curriculum", b: "Ørberg's Lingua Latina, Athenaze, Thrasymachus, and custom Oxford graded readers. The gold standard." },
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: 36 }}>
            <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{i+1}. {item.t}</h3>
            <p style={{ fontSize: 16, color: "var(--ink-light)", lineHeight: 1.85 }}>{item.b}</p>
          </div>
        ))}
        <div style={{ margin: "64px 0", padding: 40, background: "var(--ink)", borderRadius: 6, color: "#fff" }}>
          <p style={{ fontFamily: "var(--serif)", fontSize: 20, fontStyle: "italic", lineHeight: 1.6, color: "rgba(255,255,255,0.85)", marginBottom: 16 }}>"The active method doesn't just teach you a language. It gives you a way of encountering the ancient world that grammar-translation simply cannot."</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>— Cole Whetstone, Instructor</p>
        </div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 500, margin: "48px 0 24px" }}>Our faculty</h2>
        <p style={{ fontSize: 16, color: "var(--ink-light)", lineHeight: 1.85, marginBottom: 32 }}>Instructors from Jesus College, Oxford; Harvard; and the Accademia Vivarium Novum. All trained in the active method with advanced Ivy/Oxbridge degrees.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, margin: "48px 0" }}>
          {faculty.map(f => (
            <div key={f.name} style={{ background: "var(--card)", borderRadius: 6, border: "1px solid var(--border)", overflow: "hidden" }}>
              <div style={{ display: "flex", gap: 24, padding: "28px" }}>
                <img src={f.img} alt={f.name} style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", objectPosition: "center top", flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 500, marginBottom: 4 }}>{f.name}</h3>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>{f.role}</p>
                  <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)", lineHeight: 1.5 }}>{f.credentials}</p>
                </div>
              </div>
              <div style={{ padding: "0 28px 28px" }}>
                <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.75 }}>{f.bio}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", display: "flex", justifyContent: "center", gap: 12 }}>
          <Btn onClick={() => navigate("schedule")}>View Schedule</Btn>
          <Btn variant="outline" onClick={() => navigate("contact")}>Placement Call</Btn>
        </div>
      </section>
    </div>
  );
}

/* ═══════════ PAGE: TUTORIALS ═══════════ */
function TutorialsPage({ navigate }) {
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <PageHead overline="One-on-One" title="Private Tutorials" subtitle="Personalized instruction at your pace." />
      <section style={{ padding: "80px 40px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 48 }}>
          {[{ l: "Individual", p: "$150", u: "/hour", d: "One-on-one. Fully customizable." },{ l: "Paired", p: "$175", u: "/hour (total)", d: "Bring a friend. Same attention." }].map(t => (
            <div key={t.l} style={{ background: "var(--card)", borderRadius: 6, padding: "36px 28px", border: "1px solid var(--border)" }}>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 500, marginBottom: 12 }}>{t.l}</h3>
              <div style={{ marginBottom: 16 }}><span style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 500 }}>{t.p}</span><span style={{ fontSize: 13, color: "var(--ink-faint)" }}>{t.u}</span></div>
              <p style={{ fontSize: 14, color: "var(--ink-muted)", lineHeight: 1.7 }}>{t.d}</p>
            </div>
          ))}
        </div>
        {["Choose your language: Ancient Greek, Latin, or Biblical Hebrew.","We match you with an instructor based on your goals.","Set your schedule — weekly, biweekly, or intensive blocks.","Curriculum tailored: exam prep, specific texts, composition, or group syllabus at your pace.","Sessions are 1 hour via Zoom. Most book 10- or 14-session packages."].map((t,i) => (
          <p key={i} style={{ fontSize: 15, color: "var(--ink-light)", lineHeight: 1.8, marginBottom: 12, paddingLeft: 20, borderLeft: "2px solid var(--border)" }}>{t}</p>
        ))}
        <div style={{ textAlign: "center", marginTop: 48 }}><Btn onClick={() => navigate("contact")}>Inquire About Tutorials</Btn></div>
      </section>
    </div>
  );
}

/* ═══════════ PAGE: GROUPS (NEW) ═══════════ */
function GroupsPage({ navigate }) {
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", org: "", role: "", language: "", size: "", message: "" });

  if (sent) {
    return (
      <div style={{ animation: "fadeIn 0.4s ease" }}>
        <section style={{ maxWidth: 600, margin: "0 auto", padding: "180px 40px 120px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><span style={{ color: '#fff', fontSize: 24, fontFamily: 'var(--serif)' }}>✓</span></div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 500, marginBottom: 12 }}>Inquiry Received</h2>
          <p style={{ fontSize: 15, color: "var(--ink-muted)", marginBottom: 8 }}>Thank you{form.name ? `, ${form.name.split(" ")[0]}` : ""}! We'll be in touch within one business day.</p>
          <p style={{ fontSize: 14, color: "var(--ink-faint)", marginBottom: 36 }}>We'll schedule a call to discuss your group's needs and arrange a free demo session.</p>
          <Btn onClick={() => navigate("home")}>Return Home</Btn>
        </section>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <PageHead
        overline="Churches · Synagogues · Study Groups · Meetups"
        title="Group Partnerships"
        subtitle="Bring your community together around the original languages of Scripture. One sign-up — we handle the rest."
      />

      {/* VALUE PROP */}
      <section style={{ padding: "80px 40px 0", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "start" }}>
          <div>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 500, lineHeight: 1.3, marginBottom: 20 }}>Why groups choose Whetstone</h2>
            <p style={{ fontSize: 15, color: "var(--ink-light)", lineHeight: 1.85, marginBottom: 16 }}>Most people in your congregation would love to read the Bible in the original — they just don't know how to start, and they don't want to do it alone. That's where we come in.</p>
            <p style={{ fontSize: 15, color: "var(--ink-light)", lineHeight: 1.85, marginBottom: 16 }}>You gather the group. We provide the instructor, curriculum, materials, and a proven immersive method that gets people actually reading — not just memorizing paradigm tables.</p>
            <p style={{ fontSize: 15, color: "var(--ink-light)", lineHeight: 1.85 }}>Every group gets a <strong>free demo session</strong> before committing — so your members can experience the approach firsthand.</p>
          </div>
          <div style={{ background: "var(--bg-alt)", borderRadius: 6, padding: "32px 28px", border: "1px solid var(--border)" }}>
            <h4 style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", color: "var(--ink-faint)", marginBottom: 20 }}>HOW IT WORKS</h4>
            {[
              { n: "1", t: "You reach out", d: "Tell us about your group — size, language interest, and preferred schedule." },
              { n: "2", t: "Free demo session", d: "We run a 45-minute sample class so your group can experience the method." },
              { n: "3", t: "We build your cohort", d: "Choose a language track. We assign an instructor and set the schedule." },
              { n: "4", t: "Your group reads Scripture", d: "10 weeks of live immersive classes. Materials and support included." },
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: i < 3 ? 20 : 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--ink)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600 }}>{step.n}</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{step.t}</p>
                  <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6 }}>{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LANGUAGE TRACKS */}
      <section style={{ padding: "80px 40px", maxWidth: 1120, margin: "0 auto" }}>
        <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>Language Tracks</p>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 400, textAlign: "center", marginBottom: 48 }}>Three tracks designed for faith communities</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {groupTracks.map(track => (
            <div key={track.id} style={{ background: "var(--card)", borderRadius: 6, overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{ background: track.color, padding: "32px 24px", textAlign: "center" }}>
                <span style={{ fontFamily: "var(--serif)", fontSize: 36, color: "rgba(255,255,255,0.15)", display: "block", marginBottom: 8 }}>{track.icon}</span>
                <p style={{ fontFamily: "var(--serif)", fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{track.tag}</p>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>{track.language}</h3>
              </div>
              <div style={{ padding: "24px 24px 28px" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>{track.tagline}</p>
                <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.7, marginBottom: 16 }}>{track.desc}</p>
                <p style={{ fontSize: 12, color: "var(--ink-faint)", lineHeight: 1.6 }}><strong>Texts:</strong> {track.texts}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "80px 40px", background: "var(--bg-alt)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>Pricing</p>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 400, textAlign: "center", marginBottom: 12 }}>Simple group rates</h2>
          <p style={{ fontSize: 15, color: "var(--ink-muted)", textAlign: "center", maxWidth: 500, margin: "0 auto 48px", lineHeight: 1.7 }}>One sign-up from the group leader. We invoice the organization or collect individually — whichever you prefer.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {groupPackages.map((pkg, i) => (
              <div key={i} style={{
                background: "var(--card)", borderRadius: 6, overflow: "hidden",
                border: pkg.popular ? "2px solid var(--accent)" : "1px solid var(--border)",
                position: "relative",
              }}>
                {pkg.popular && (
                  <div style={{ background: "var(--accent)", color: "#fff", fontSize: 11, fontWeight: 600, textAlign: "center", padding: "6px 0", letterSpacing: "0.1em" }}>MOST POPULAR</div>
                )}
                <div style={{ padding: "32px 28px" }}>
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, marginBottom: 4 }}>{pkg.name}</h3>
                  <p style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 20 }}>{pkg.size}</p>
                  <div style={{ marginBottom: 24 }}>
                    {pkg.perStudent ? (
                      <>
                        <span style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 500 }}>${pkg.perStudent}</span>
                        <span style={{ fontSize: 14, color: "var(--ink-faint)" }}> /student</span>
                        <p style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 4 }}>{pkg.duration} · {pkg.sessions}</p>
                      </>
                    ) : (
                      <>
                        <span style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 500 }}>Custom</span>
                        <p style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 4 }}>{pkg.duration} · {pkg.sessions}</p>
                      </>
                    )}
                  </div>
                  {pkg.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                      <span style={{ color: "var(--accent)", fontSize: 14, lineHeight: "20px", flexShrink: 0 }}>✓</span>
                      <span style={{ fontSize: 13, color: "var(--ink-light)", lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                  <p style={{ fontSize: 12, color: "var(--ink-faint)", fontStyle: "italic", marginTop: 16, lineHeight: 1.5 }}>{pkg.note}</p>
                  <button
                    onClick={() => setShowForm(true)}
                    style={{
                      width: "100%", marginTop: 20, padding: "12px 0", borderRadius: 3, border: "none", cursor: "pointer",
                      fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600,
                      background: pkg.popular ? "var(--accent)" : "var(--ink)", color: "#fff",
                    }}
                  >Inquire</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <p style={{ fontSize: 14, color: "var(--ink-muted)" }}>
              Compare: individual enrollment is $895/student for 14 weeks. Group rates save 33–45%.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED FOR GROUPS */}
      <section style={{ padding: "80px 40px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 500, textAlign: "center", marginBottom: 48 }}>Every group package includes</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[
            { t: "Free Demo Session", d: "A 45-minute sample class for your whole group before anyone commits. Experience the method firsthand." },
            { t: "All Materials Included", d: "Digital workbooks, graded readers, vocabulary lists, and audio materials — no additional textbook costs." },
            { t: "Flexible Scheduling", d: "You pick the day and time that works for your group. Evenings, weekends, or weekday mornings." },
            { t: "Flexible Billing", d: "We can invoice your organization directly, or collect from individual students — whichever is easier." },
            { t: "Progress Reports", d: "Group leaders receive end-of-term reports on attendance, engagement, and reading progress." },
            { t: "Continuation Path", d: "After 10 weeks, groups can continue to the next level at the same group rate. Multi-term discounts available." },
            { t: "4-Week Guarantee", d: "If the group isn't making real progress after 4 weeks, we'll teach the next 4 weeks free." },
            { t: "Dedicated Support", d: "A single point of contact for the group leader — scheduling, enrollment, questions, all handled." },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 16, padding: "16px 0" }}>
              <span style={{ color: "var(--accent)", fontSize: 14, flexShrink: 0, marginTop: 2 }}>✓</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{item.t}</p>
                <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.6 }}>{item.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* IDEAL FOR */}
      <section style={{ padding: "80px 40px", background: "var(--bg-alt)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 500, textAlign: "center", marginBottom: 48 }}>Who this is for</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { t: "Churches & Parishes", d: "Adult education, Bible study enrichment, clergy formation. Catholic, Orthodox, mainline Protestant, and evangelical communities." },
              { t: "Synagogues & Jewish Orgs", d: "Biblical Hebrew for adult learners. Supplement existing Hebrew programs or start fresh with the Tanakh." },
              { t: "Study Groups & Meetups", d: "Great Books clubs, seminary students, homeschool co-ops, philosophy groups, or any community of curious learners." },
            ].map((item, i) => (
              <div key={i} style={{ background: "var(--card)", borderRadius: 6, padding: "28px 24px", border: "1px solid var(--border)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{item.t}</h3>
                <p style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.7 }}>{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INQUIRY FORM */}
      <section id="group-inquiry" style={{ padding: "80px 40px 120px", maxWidth: 640, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 500, textAlign: "center", marginBottom: 8 }}>Start a group</h2>
        <p style={{ fontSize: 15, color: "var(--ink-muted)", textAlign: "center", marginBottom: 40, lineHeight: 1.7 }}>Tell us about your community and we'll schedule a call and a free demo session.</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink-muted)", marginBottom: 6 }}>Your Name</label>
            <input type="text" placeholder="Jane Smith" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink-muted)", marginBottom: 6 }}>Email</label>
            <input type="email" placeholder="jane@stmarys.org" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink-muted)", marginBottom: 6 }}>Organization</label>
            <input type="text" placeholder="St. Mary's Parish" value={form.org} onChange={e => setForm({...form, org: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink-muted)", marginBottom: 6 }}>Your Role</label>
            <input type="text" placeholder="Pastor, Director, Organizer…" value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink-muted)", marginBottom: 6 }}>Language Interest</label>
            <select value={form.language} onChange={e => setForm({...form, language: e.target.value})} style={selectStyle}>
              <option value="">Select…</option>
              <option value="koine">Koine Greek (New Testament)</option>
              <option value="hebrew">Biblical Hebrew (Old Testament)</option>
              <option value="latin">Church Latin (Mass & Vulgate)</option>
              <option value="unsure">Not sure yet</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink-muted)", marginBottom: 6 }}>Estimated Group Size</label>
            <select value={form.size} onChange={e => setForm({...form, size: e.target.value})} style={selectStyle}>
              <option value="">Select…</option>
              <option value="6-8">6–8 people</option>
              <option value="9-12">9–12 people</option>
              <option value="13-20">13–20 people</option>
              <option value="20+">20+ people</option>
              <option value="unsure">Not sure yet</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink-muted)", marginBottom: 6 }}>Anything else? (optional)</label>
          <textarea rows={4} placeholder="Tell us about your group, goals, preferred schedule, etc." value={form.message} onChange={e => setForm({...form, message: e.target.value})} style={{...inputStyle, resize: "vertical"}} />
        </div>
        <Btn onClick={async () => {
            try {
              const r = await fetch("/api/contact", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({...form, type: "group_inquiry"}) });
              if (!r.ok) console.warn("Form endpoint not configured yet");
            } catch(e) { console.warn("Form endpoint not configured:", e); }
            setSent(true);
          }} style={{ width: "100%", padding: "14px" }}>Submit Inquiry</Btn>
        <p style={{ fontSize: 12, color: "var(--ink-faint)", textAlign: "center", marginTop: 12 }}>We'll respond within one business day. No commitment required.</p>
      </section>

      {/* BOTTOM CTA */}
      <section style={{ padding: "80px 40px", textAlign: "center", background: "var(--ink)", color: "#fff" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: "clamp(24px,3vw,34px)", fontWeight: 400, marginBottom: 16, color: "rgba(255,255,255,0.9)" }}>Not organizing a group?</h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", maxWidth: 440, margin: "0 auto 28px" }}>You can also enroll individually in any of our regular courses.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn onClick={() => navigate("schedule")} style={{ background: "#fff", color: "var(--ink)", padding: "14px 28px" }}>View Schedule</Btn>
          <Btn variant="outline" onClick={() => navigate("contact")} style={{ color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.25)", padding: "14px 28px" }}>Contact Us</Btn>
        </div>
      </section>
    </div>
  );
}

/* ═══════════ PAGE: ENROLL ═══════════ */
function EnrollPage({ langId, courseCode, sessionId, navigate }) {
  const lang = languages.find(l => l.id === langId);
  const course = lang?.courses.find(c => c.code === courseCode);
  const session = course?.sessions.find(s => s.id === sessionId);
  const stripeLink = session ? getStripeLink(session.id) : "";
  if (!lang||!course||!session) return <div style={{ padding: "160px 40px", textAlign: "center", animation: "fadeIn 0.4s ease" }}><h2 style={{ fontFamily: "var(--serif)", fontSize: 28, marginBottom: 16 }}>Session not found</h2><Btn onClick={() => navigate("schedule")}>Schedule</Btn></div>;
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <section style={{ maxWidth: 640, margin: "0 auto", padding: "120px 40px 80px" }}>
        <span onClick={() => navigate("course",lang.id,course.code)} style={{ cursor: "pointer", fontSize: 13, color: "var(--ink-muted)", display: "inline-block", marginBottom: 24 }}>← {course.name}</span>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 400, marginBottom: 8 }}>Enroll</h1>
        <p style={{ fontSize: 15, color: "var(--ink-muted)", marginBottom: 40 }}>{course.code}: {course.name} · {session.dates}</p>
        <div style={{ background: "var(--bg-alt)", borderRadius: 6, padding: 24, border: "1px solid var(--border)", marginBottom: 40 }}>
          {[["Course",`${course.code}: ${course.name}`],["Session",session.dates],["Schedule",session.schedule],["Spots",`${session.spots} remaining`]].map(([k,v],i) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><span style={{ fontSize: 14, color: "var(--ink-muted)" }}>{k}</span><span style={{ fontSize: 14, fontWeight: 500 }}>{v}</span></div>
          ))}
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 14, fontWeight: 600 }}>Tuition</span><span style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500 }}>${course.price}</span></div>
        </div>
        {stripeLink ? (
          <div>
            <Btn variant="accent" onClick={() => window.open(stripeLink, "_blank")} style={{ width: "100%", padding: "16px", fontSize: 16 }}>Pay & Enroll →</Btn>
            <p style={{ fontSize: 12, color: "var(--ink-faint)", textAlign: "center", marginTop: 12 }}>Secure payment via Stripe. You'll receive a confirmation email after checkout.</p>
            <div style={{ marginTop: 32, padding: 20, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>4-Week Guarantee</p>
              <p style={{ fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.6 }}>No improvement after 4 weeks? We'll work with you free for the next 4. No questions asked.</p>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 6, padding: 32, textAlign: "center", marginBottom: 20 }}>
              <p style={{ fontSize: 15, color: "var(--ink-light)", marginBottom: 8 }}>To enroll, contact us directly:</p>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>cole@whetstoneadvisory.com</p>
              <p style={{ fontSize: 13, color: "var(--ink-faint)" }}>Mention <strong>{course.code}</strong> · {session.dates}</p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Btn variant="outline" onClick={() => navigate("contact")} style={{ flex: 1, padding: "14px" }}>Contact Us</Btn>
              <Btn onClick={() => navigate("schedule")} style={{ flex: 1, padding: "14px" }}>View Schedule</Btn>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

/* ═══════════ PAGE: CONTACT ═══════════ */
function ContactPage({ navigate }) {
  const [sent, setSent] = useState(false);
  const calRef = useRef(null);
  useEffect(() => {
    // Load Cal.com embed script
    if (CAL_URL && CAL_URL !== "https://cal.com/YOUR_USERNAME/placement-call") {
      const script = document.createElement("script");
      script.src = "https://app.cal.com/embed/embed.js";
      script.async = true;
      document.head.appendChild(script);
      return () => { try { document.head.removeChild(script); } catch(e) {} };
    }
  }, []);
  const calSlug = CAL_URL.replace("https://cal.com/", "");
  const calConfigured = CAL_URL && CAL_URL !== "https://cal.com/YOUR_USERNAME/placement-call";
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <PageHead overline="Get in Touch" title="Contact Us" subtitle="Questions about courses, placement, or tutorials?" />
      <section style={{ padding: "60px 40px 120px", maxWidth: 700, margin: "0 auto" }}>
        {/* Placement Call Section */}
        <div style={{ background: "var(--ink)", borderRadius: 8, padding: "40px 36px", marginBottom: 48, color: "#fff" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>Free Placement Call</p>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 400, marginBottom: 12, color: "rgba(255,255,255,0.9)" }}>Not sure where to start?</h3>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 24 }}>Book a free 15-minute placement call. We'll assess your level, recommend the right course, and give you a sample session so you can experience the method firsthand.</p>
          {calConfigured ? (
            <Btn onClick={() => window.open(CAL_URL, "_blank")} style={{ background: "#fff", color: "var(--ink)", padding: "14px 28px" }}>Book a Free Call →</Btn>
          ) : (
            <div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>Email us to schedule:</p>
              <p style={{ fontSize: 16, fontWeight: 600 }}>cole@whetstoneadvisory.com</p>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 48 }}>
          <div style={{ background: "var(--card)", borderRadius: 6, padding: "28px 24px", border: "1px solid var(--border)", textAlign: "center" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Email</h3>
            <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>cole@whetstoneadvisory.com</p>
          </div>
          <div style={{ background: "var(--card)", borderRadius: 6, padding: "28px 24px", border: "1px solid var(--border)", textAlign: "center" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Phone</h3>
            <p style={{ fontSize: 13, color: "var(--ink-muted)" }}>917-562-5668</p>
          </div>
        </div>

        {/* Message Form */}
        {!sent ? <>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Send a message</h3>
          <div id="contact-form">{[{l:"Name",t:"text",n:"name"},{l:"Email",t:"email",n:"email"}].map(f => <div key={f.l} style={{ marginBottom: 16 }}><label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink-muted)", marginBottom: 6 }}>{f.l}</label><input type={f.t} name={f.n} style={inputStyle} /></div>)}
          <div style={{ marginBottom: 20 }}><label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--ink-muted)", marginBottom: 6 }}>Message</label><textarea name="message" rows={5} style={{...inputStyle,resize:"vertical"}} /></div></div>
          <Btn onClick={async () => {
            const formEl = document.querySelectorAll("#contact-form input, #contact-form textarea");
            const data = {};
            formEl.forEach(el => { if (el.name) data[el.name] = el.value; });
            try {
              const r = await fetch("/api/contact", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data) });
              if (!r.ok) console.warn("Form endpoint not configured yet");
            } catch(e) { console.warn("Form endpoint not configured:", e); }
            setSent(true);
          }} style={{ width: "100%", padding: "14px" }}>Send</Btn>
        </> : <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><span style={{ color: '#fff', fontSize: 24, fontFamily: 'var(--serif)' }}>✓</span></div>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, marginBottom: 12 }}>Sent</h3>
          <p style={{ fontSize: 15, color: "var(--ink-muted)", marginBottom: 32 }}>We'll reply within one business day.</p>
          <Btn onClick={() => navigate("home")}>Home</Btn>
        </div>}
      </section>
    </div>
  );
}

/* ═══════════ ROUTE WRAPPERS ═══════════ */
function LangPageRoute({ navigate }) {
  const { langId } = useParams();
  return <LangPage langId={langId} navigate={navigate} />;
}
function CourseDetailRoute({ navigate }) {
  const { langId, courseCode } = useParams();
  return <CourseDetail langId={langId} courseCode={courseCode} navigate={navigate} />;
}
function EnrollPageRoute({ navigate }) {
  const { langId, courseCode, sessionId } = useParams();
  return <EnrollPage langId={langId} courseCode={courseCode} sessionId={sessionId} navigate={navigate} />;
}

function AppInner() {
  const nav = useNavigate();
  const navigate = (page, ...args) => {
    let path = "/";
    if (page === "home") path = "/";
    else if (page === "lang") path = `/lang/${args[0]}`;
    else if (page === "course") path = `/course/${args[0]}/${args[1]}`;
    else if (page === "enroll") path = `/enroll/${args[0]}/${args[1]}/${args[2]}`;
    else path = `/${page}`;
    nav(path);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const loc = window.location.pathname;
  const page = loc === "/" ? "home" : loc.split("/")[1];
  return (
    <>
      <style>{CSS}</style>
      <Nav page={page} navigate={navigate} />
      <Routes>
        <Route path="/" element={<HomePage navigate={navigate} />} />
        <Route path="/courses" element={<CoursesPage navigate={navigate} />} />
        <Route path="/lang/:langId" element={<LangPageRoute navigate={navigate} />} />
        <Route path="/course/:langId/:courseCode" element={<CourseDetailRoute navigate={navigate} />} />
        <Route path="/schedule" element={<SchedulePage navigate={navigate} />} />
        <Route path="/method" element={<MethodPage navigate={navigate} />} />
        <Route path="/tutorials" element={<TutorialsPage navigate={navigate} />} />
        <Route path="/groups" element={<GroupsPage navigate={navigate} />} />
        <Route path="/enroll/:langId/:courseCode/:sessionId" element={<EnrollPageRoute navigate={navigate} />} />
        <Route path="/contact" element={<ContactPage navigate={navigate} />} />
        <Route path="*" element={<HomePage navigate={navigate} />} />
      </Routes>
      <Footer navigate={navigate} />
    </>
  );
}

/* ═══════════ ROUTER ═══════════ */
export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
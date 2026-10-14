import React, { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard, TrendingUp, Headphones, Gem, Vote, Settings, Bell, Search, User,
  Eye, EyeOff, Sparkles, ShieldCheck, Coins, Play, Pause, Check, X, Satellite,
  FileText, Megaphone, Zap, Target, Link2, RotateCcw, Send, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Watch, Car, CreditCard, Building2, Wallet, ChevronRight,
} from "lucide-react";
import {
  ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea,
  ReferenceLine, CartesianGrid, LineChart, Legend,
} from "recharts";


/* ----------------------------- THEME + HELPERS ----------------------------- */
const GOLD = "#D4AF37";
const GOLD_LIGHT = "#E5C158";
const goldGradient = "bg-gradient-to-r from-[#D4AF37] to-[#E5C158]";
const goldText = "bg-gradient-to-r from-[#D4AF37] to-[#E5C158] bg-clip-text text-transparent";
const card = "bg-[#1A1A1D] border border-[#2A2A30] rounded-xl";

const fmt = (n, d = 2) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const usd = (n, d = 0) => "$" + fmt(n, d);

const TICKERS = {
  AMD: { name: "Advanced Micro Devices", price: 160.0, base: 245.5, band: [170.1, 189.9], implied: 8, historic: 4 },
  NVDA: { name: "NVIDIA Corp.", price: 128.4, base: 171.0, band: [136.2, 152.9], implied: 9, historic: 7 },
  MSFT: { name: "Microsoft Corp.", price: 430.0, base: 520.0, band: [441.0, 462.0], implied: 5, historic: 4 },
};
const DEFAULTS = { cagr: 14.5, margin: 26.0, hurdle: 12.0 };

// Semi-AI projection math: 3-year price target scaled by growth, margin, and required-return multiple
function calcModel(t, g, m, h) {
  const growth = Math.pow((1 + g / 100) / 1.145, 5);
  const margin = m / 26;
  const mult = Math.pow(12 / h, 0.8);
  const pt = t.base * growth * margin * mult;
  const intrinsic = pt / Math.pow(1 + h / 100, 3);
  const xirr = (Math.pow(pt / t.price, 1 / 3) - 1) * 100;
  return { pt, intrinsic, xirr, growth, margin, mult };
}

const ALT_ASSETS = [
  { id: 1, name: "Rolex Submariner 126610LN", cat: "Watch", icon: Watch, value: 14200, change: 1.8, src: "Chrono24 scrape" },
  { id: 2, name: "PSA 10 1999 Charizard Holo", cat: "Card", icon: CreditCard, value: 38500, change: 4.2, src: "eBay sold comps" },
  { id: 3, name: "1967 Porsche 911 S", cat: "Vintage Car", icon: Car, value: 142000, change: -0.9, src: "Bring a Trailer" },
  { id: 4, name: "Patek Philippe Nautilus 5711", cat: "Watch", icon: Watch, value: 118000, change: 2.4, src: "WatchCharts index" },
];

const NOTIFS = [
  { id: 1, type: "patent", icon: FileText, title: "Patent Filing Detected", body: "AMD filed 3 new chiplet interconnect patents (USPTO).", time: "4m ago" },
  { id: 2, type: "deinfluence", icon: Megaphone, title: "De-Influencing Flag", body: "Spike in negative creator sentiment on a held consumer brand.", time: "27m ago" },
  { id: 3, type: "sat", icon: Satellite, title: "Satellite Data Update", body: "TSMC Arizona parking-lot traffic +12% WoW.", time: "1h ago" },
  { id: 4, type: "vol", icon: Zap, title: "Volatility Edge Detected", body: "$AMD implied move 8% vs 4% historical average.", time: "2h ago" },
];

const SEGMENTS = [
  { id: 1, who: "CEO · Prepared Remarks", text: "Data center revenue grew strongly again, and we see a multi-year runway for our accelerator roadmap.", conf: 86, anx: 14, flag: "Confident, high certainty language" },
  { id: 2, who: "CFO · Guidance", text: "We expect gross margin to be roughly flat sequentially, though mix creates some uncertainty.", conf: 64, anx: 36, flag: "Hedging words up 2.1x vs last quarter" },
  { id: 3, who: "Analyst Q&A · Margins", text: "Can you walk us through the sustainability of margins as MI-series ramps?", conf: 58, anx: 42, flag: "Pause length +1.4s before answering" },
  { id: 4, who: "CEO · Q&A Answer", text: "We are being very disciplined, and we will, you know, continue to invest where returns are clear.", conf: 52, anx: 48, flag: "Filler words spike; anxiety shift detected" },
  { id: 5, who: "CEO · Closing", text: "We are extremely excited about the second half and the demand we are seeing from hyperscalers.", conf: 79, anx: 21, flag: "Tone recovery in closing" },
];

const PROXIES = [
  { id: 1, company: "Advanced Micro Devices", title: "Proposal 4: Annual Climate Transition Report", type: "Shareholder Proposal", rec: "AI aligned: matches your 'Climate-aware' value profile.", detail: "Requests a yearly disclosure of Scope 1-3 emissions and a transition plan.", due: "Oct 28" },
  { id: 2, company: "Apple Inc.", title: "Proposal 2: Executive Pay Package Ratification", type: "Management Proposal", rec: "Caution: CEO pay ratio is 1,447:1, above peer median.", detail: "Say-on-pay advisory vote on named executive compensation.", due: "Nov 02" },
  { id: 3, company: "Tesla Inc.", title: "Proposal 7: Independent Board Chair", type: "Shareholder Proposal", rec: "AI aligned: you favor stronger board independence.", detail: "Separates the Chair and CEO roles to improve oversight.", due: "Nov 09" },
];

/* --------------------------------- LOGO ---------------------------------- */
/* --------------------------------- LOGO ---------------------------------- */
function Logo({ size = 40 }) {
  return (
    <img 
      src="/zenit_capital_1_logo.jpeg" 
      alt="Zenit Capital Logo" 
      style={{ width: size, height: size }}
      className="object-contain rounded-sm" 
    />
  );
}

/* ------------------------------ SMALL WIDGETS ----------------------------- */
function SectionTitle({ icon: Icon, title, right }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} color={GOLD} />}
        <h3 className="text-white font-semibold tracking-wide">{title}</h3>
      </div>
      {right}
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, suffix = "%", def }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="flex items-center gap-2">
          <span className={`text-sm font-bold ${goldText}`}>{value.toFixed(1)}{suffix}</span>
          {value !== def && <span className="text-[10px] text-gray-500">(base {def.toFixed(1)}{suffix})</span>}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
        style={{ background: `linear-gradient(to right, ${GOLD} ${pct}%, #2A2A30 ${pct}%)` }}
      />
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} className={`w-11 h-6 rounded-full relative transition ${on ? goldGradient : "bg-[#2A2A30]"}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

/* ------------------------------ NET WORTH HERO ---------------------------- */
function NetWorthHero({ showAlt, setShowAlt }) {
  const accounts = [
    { name: "Robinhood", icon: Wallet, value: 184320, change: 1.2 },
    { name: "Fidelity", icon: Building2, value: 412880, change: 0.6 },
    { name: "Real Estate Equity", icon: Building2, value: 285000, change: 0.3 },
  ];
  const altTotal = ALT_ASSETS.reduce((s, a) => s + a.value, 0);
  const trad = accounts.reduce((s, a) => s + a.value, 0);
  const total = trad + (showAlt ? altTotal : 0);

  return (
    <div className={`${card} p-6 relative overflow-hidden`}>
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-10" style={{ background: GOLD, filter: "blur(80px)" }} />
      <div className="flex flex-col lg:flex-row gap-6 relative">
        <div className="lg:w-1/3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-gray-400">True Net Worth</p>
            <button onClick={() => setShowAlt(!showAlt)} className="flex items-center gap-1.5 text-xs text-gray-300 border border-[#2A2A30] rounded-full px-3 py-1 hover:border-[#D4AF37] transition">
              {showAlt ? <Eye size={13} color={GOLD} /> : <EyeOff size={13} />}
              Alt assets {showAlt ? "ON" : "OFF"}
            </button>
          </div>
          <p className={`text-4xl lg:text-5xl font-bold mt-3 ${goldText}`}>{usd(total)}</p>
          <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
            <ArrowUpRight size={14} className="text-emerald-400" />
            <span className="text-emerald-400">+{usd(showAlt ? 6420 : 4310)}</span> today
          </p>
          <div className="mt-4 text-xs text-gray-400 space-y-1">
            <div className="flex justify-between"><span>Traditional</span><span className="text-white">{usd(trad)}</span></div>
            <div className="flex justify-between"><span>Alternative</span><span className={showAlt ? "text-white" : "text-gray-600 line-through"}>{usd(altTotal)}</span></div>
          </div>
          <div className="flex flex-wrap gap-2 mt-5">
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#E5C158]">
              <ShieldCheck size={13} /> Automatic Tax-Loss Harvester Active
            </span>
            <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <Coins size={13} /> Dividend Snowballing +$340/yr
            </span>
          </div>
        </div>

        <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {accounts.map((a) => (
            <div key={a.name} className="bg-[#121212] border border-[#2A2A30] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-300 text-sm"><a.icon size={16} color={GOLD} />{a.name}</div>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400"><Link2 size={11} />Linked</span>
              </div>
              <p className="text-xl font-semibold text-white mt-2">{usd(a.value)}</p>
              <p className="text-xs text-emerald-400">+{a.change}% today</p>
            </div>
          ))}
          <div className={`bg-[#121212] border rounded-lg p-4 transition ${showAlt ? "border-[#D4AF37]/50" : "border-[#2A2A30] opacity-50"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-300 text-sm"><Gem size={16} color={GOLD} />Watches · Cards · Cars</div>
              <span className="text-[10px] text-[#E5C158]">Auto-scraped</span>
            </div>
            <p className="text-xl font-semibold text-white mt-2">{usd(altTotal)}</p>
            <p className="text-xs text-gray-400">{ALT_ASSETS.length} assets tracked</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- PRICE WORKBENCH ---------------------------- */
function Workbench({ ticker, setTicker, vals, setVals }) {
  const t = TICKERS[ticker];
  const [prompt, setPrompt] = useState("");
  const [aiMsg, setAiMsg] = useState("Tip: try a preset scenario or describe your own assumptions.");
  const model = useMemo(() => calcModel(t, vals.cagr, vals.margin, vals.hurdle), [t, vals]);
  const upside = ((model.pt / t.price - 1) * 100);

  const presets = [
    { label: "Assume data center revenue doubles, but margin drops 3%", v: { cagr: 22, margin: 23, hurdle: 12 } },
    { label: "Bear case: MI-series share loss, 8% CAGR", v: { cagr: 8, margin: 21, hurdle: 13 } },
    { label: "AI capex cycle extends, margin hits 30%", v: { cagr: 17, margin: 30, hurdle: 12 } },
    { label: "Rates stay high: hurdle rate 14%", v: { cagr: 14.5, margin: 26, hurdle: 14 } },
  ];

  const applyPreset = (p) => {
    setVals(p.v);
    setPrompt(p.label);
    setAiMsg(`Applied: CAGR ${p.v.cagr}%, Margin ${p.v.margin}%, Hurdle ${p.v.hurdle}%.`);
  };

  const submitPrompt = () => {
    const txt = prompt.toLowerCase();
    let next = { ...vals };
    const notes = [];
    if (/doubl/.test(txt)) { next.cagr = Math.min(40, next.cagr + 7); notes.push("growth +7pts"); }
    const down = txt.match(/margin[^\d]*(?:drop|fall|down|declin|compress)[^\d]*(\d+(?:\.\d+)?)/);
    if (down) { next.margin = Math.max(5, next.margin - parseFloat(down[1])); notes.push(`margin -${down[1]}pts`); }
    const up = txt.match(/margin[^\d]*(?:up|rise|expand|improv)[^\d]*(\d+(?:\.\d+)?)/);
    if (up) { next.margin = Math.min(45, next.margin + parseFloat(up[1])); notes.push(`margin +${up[1]}pts`); }
    const cg = txt.match(/(?:cagr|growth)[^\d]*(\d+(?:\.\d+)?)/);
    if (cg) { next.cagr = Math.min(40, parseFloat(cg[1])); notes.push(`CAGR ${cg[1]}%`); }
    const hr = txt.match(/(?:hurdle|xirr|return)[^\d]*(\d+(?:\.\d+)?)/);
    if (hr) { next.hurdle = Math.min(25, Math.max(6, parseFloat(hr[1]))); notes.push(`hurdle ${hr[1]}%`); }
    if (notes.length) { setVals(next); setAiMsg("Interpreted: " + notes.join(", ") + "."); }
    else setAiMsg("Couldn't map that to a driver. Try mentioning growth, margin, or hurdle rate.");
  };

  return (
    <div className={`${card} p-6`}>
      <SectionTitle
        icon={Target}
        title="Semi-AI Price Target Projection Engine"
        right={
          <select value={ticker} onChange={(e) => { setTicker(e.target.value); setVals(DEFAULTS); }}
            className="bg-[#121212] border border-[#2A2A30] text-[#E5C158] text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#D4AF37]">
            {Object.keys(TICKERS).map((k) => <option key={k} value={k}>${k}</option>)}
          </select>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Metric label="Current Price" value={usd(t.price, 2)} />
        <Metric label="Base Case Target (PT)" value={usd(model.pt, 2)} gold />
        <Metric label="Intrinsic Value" value={usd(model.intrinsic, 2)} />
        <Metric label="Implied Upside" value={`${upside >= 0 ? "+" : ""}${upside.toFixed(1)}%`} positive={upside >= 0} negative={upside < 0} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Slider label="Revenue Growth Curve (CAGR)" value={vals.cagr} min={0} max={40} step={0.5} def={DEFAULTS.cagr} onChange={(v) => setVals({ ...vals, cagr: v })} />
          <Slider label="Terminal Operating Margin" value={vals.margin} min={5} max={45} step={0.5} def={DEFAULTS.margin} onChange={(v) => setVals({ ...vals, margin: v })} />
          <Slider label="Hurdle Rate (Required XIRR)" value={vals.hurdle} min={6} max={25} step={0.5} def={DEFAULTS.hurdle} onChange={(v) => setVals({ ...vals, hurdle: v })} />
          <button onClick={() => { setVals(DEFAULTS); setAiMsg("Reset to base case."); setPrompt(""); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#E5C158] transition">
            <RotateCcw size={12} /> Reset to base case
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-2"><Sparkles size={15} color={GOLD} />Conversational AI Assumptions</div>
          <div className="flex gap-2">
            <input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitPrompt()}
              placeholder="Describe a scenario..."
              className="flex-1 bg-[#121212] border border-[#2A2A30] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]" />
            <button onClick={submitPrompt} className={`${goldGradient} text-black rounded-lg px-3 flex items-center`}><Send size={16} /></button>
          </div>
          <p className="text-xs text-[#E5C158] mt-2 min-h-[16px]">{aiMsg}</p>
          <div className="flex flex-col gap-2 mt-3">
            {presets.map((p) => (
              <button key={p.label} onClick={() => applyPreset(p)}
                className="text-left text-xs text-gray-300 bg-[#121212] border border-[#2A2A30] hover:border-[#D4AF37]/60 hover:text-white rounded-lg px-3 py-2 transition flex items-center justify-between gap-2">
                <span>“{p.label}”</span><ChevronRight size={14} color={GOLD} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, gold, positive, negative }) {
  return (
    <div className="bg-[#121212] border border-[#2A2A30] rounded-lg p-3">
      <p className="text-[11px] uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`text-xl font-bold mt-1 ${gold ? goldText : positive ? "text-emerald-400" : negative ? "text-red-400" : "text-white"}`}>{value}</p>
    </div>
  );
}

/* ------------------------------ XIRR SOLVER ------------------------------- */
function XirrSolver({ ticker, vals }) {
  const t = TICKERS[ticker];
  const model = calcModel(t, vals.cagr, vals.margin, vals.hurdle);
  const goal = 15;
  const targetPT = t.price * Math.pow(1 + goal / 100, 3);
  const r = targetPT / t.base;
  const reqCagr = (1.145 * Math.pow(r / (model.margin * model.mult), 1 / 5) - 1) * 100;
  const reqMargin = (26 * r) / (model.growth * model.mult);
  const rows = [
    { label: "Required PT (3-yr)", value: usd(targetPT, 2), cur: usd(model.pt, 2) },
    { label: "Required Revenue CAGR", value: `${reqCagr.toFixed(1)}%`, cur: `${vals.cagr.toFixed(1)}%` },
    { label: "Or Required Terminal Margin", value: `${reqMargin.toFixed(1)}%`, cur: `${vals.margin.toFixed(1)}%` },
  ];
  const hit = model.xirr >= goal;

  return (
    <div className={`${card} p-6 h-full`}>
      <SectionTitle icon={Target} title="Inverse Return Goal Engineer" />
      <p className="text-xs text-gray-400 mb-4">Reverse-solves the fundamentals needed to hit a <span className="text-[#E5C158] font-semibold">{goal}% XIRR</span> on ${ticker} over 3 years.</p>
      <div className="bg-[#121212] border border-[#2A2A30] rounded-lg p-4 text-center mb-4">
        <p className="text-[11px] uppercase tracking-wider text-gray-500">Your Model's Implied XIRR</p>
        <p className={`text-3xl font-bold ${hit ? "text-emerald-400" : goldText}`}>{model.xirr.toFixed(1)}%</p>
        <p className={`text-xs mt-1 ${hit ? "text-emerald-400" : "text-gray-400"}`}>{hit ? "Goal achieved ✔" : `${(goal - model.xirr).toFixed(1)} pts short of goal`}</p>
      </div>
      <div className="space-y-2">
        {rows.map((x) => (
          <div key={x.label} className="flex items-center justify-between bg-[#121212] border border-[#2A2A30] rounded-lg px-3 py-2">
            <div>
              <p className="text-xs text-gray-400">{x.label}</p>
              <p className="text-[10px] text-gray-600">Current model: {x.cur}</p>
            </div>
            <p className={`font-semibold ${goldText}`}>{x.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- PRICE CHART ----------------------------- */
function PriceChart({ ticker }) {
  const t = TICKERS[ticker];
  const data = useMemo(() => {
    const hist = [];
    const n = 30;
    for (let i = 0; i < n; i++) {
      hist.push(t.price * (1 + Math.sin(i / 3.2) * 0.04 + Math.cos(i / 1.7) * 0.012 - (n - 1 - i) * 0.0009));
    }
    const shift = t.price - hist[n - 1];
    const rows = hist.map((p, i) => ({ d: `D-${n - 1 - i}`, price: +(p + shift).toFixed(2) }));
    rows[rows.length - 1].proj = t.price;
    const mid = (t.band[0] + t.band[1]) / 2;
    ["ER", "ER+1", "ER+2", "ER+3"].forEach((d, i) => {
      rows.push({ d, proj: +(t.price + ((mid - t.price) * (i + 1)) / 4).toFixed(2) });
    });
    return rows;
  }, [t]);
  const lo = Math.floor(Math.min(t.price * 0.85, t.band[0] * 0.93));
  const hi = Math.ceil(t.band[1] * 1.04);

  return (
    <div className={`${card} p-6`}>
      <SectionTitle
        icon={TrendingUp}
        title={`$${ticker} Price & Implied Move Visualizer`}
        right={
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#E5C158]">
            <Zap size={13} /> Expected Range: {usd(t.band[0], 2)} – {usd(t.band[1], 2)}
          </span>
        }
      />
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#2A2A30" strokeDasharray="3 3" />
            <XAxis dataKey="d" stroke="#6B7280" tick={{ fontSize: 10 }} interval={4} />
            <YAxis domain={[lo, hi]} stroke="#6B7280" tick={{ fontSize: 10 }} tickFormatter={(v) => "$" + v} />
            <Tooltip contentStyle={{ background: "#1A1A1D", border: "1px solid #2A2A30", borderRadius: 8, color: "#fff" }} formatter={(v) => usd(v, 2)} />
            <ReferenceArea y1={t.band[0]} y2={t.band[1]} fill={GOLD} fillOpacity={0.14} stroke={GOLD} strokeOpacity={0.5} strokeDasharray="4 4"
              label={{ value: "ATM Straddle Expected Range", fill: GOLD_LIGHT, fontSize: 11, position: "insideTopLeft" }} />
            <ReferenceLine y={t.price} stroke="#6B7280" strokeDasharray="2 4" />
            <Line type="monotone" dataKey="price" stroke="#FFFFFF" strokeWidth={2} dot={false} name="Price" />
            <Line type="monotone" dataKey="proj" stroke={GOLD} strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: GOLD }} name="Implied path" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-start gap-3 bg-[#121212] border border-[#D4AF37]/30 rounded-lg p-3">
        <AlertTriangle size={18} color={GOLD} className="mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-[#E5C158]">Volatility Edge Detected</p>
          <p className="text-xs text-gray-400">Options overpricing historical move ({t.implied}% Implied vs {t.historic}% Historic). Consider premium-selling structures such as iron condors or covered calls.</p>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- EARNINGS CONDENSOR ------------------------- */
function EarningsCondensor({ full }) {
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [sel, setSel] = useState(SEGMENTS[1]);
  const bars = useMemo(() => Array.from({ length: 56 }, (_, i) => 18 + Math.abs(Math.sin(i * 0.7) * 30 + Math.cos(i * 1.9) * 16)), []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setPos((p) => (p >= bars.length - 1 ? 0 : p + 1)), 120);
    return () => clearInterval(id);
  }, [playing, bars.length]);

  const toneData = SEGMENTS.map((s, i) => ({ name: `S${i + 1}`, Confidence: s.conf, Anxiety: s.anx }));

  return (
    <div className={`${card} p-6`}>
      <SectionTitle icon={Headphones} title="Earnings Condensor · $AMD Q3 Call" right={<span className="text-xs text-gray-500">58 min → 3 min</span>} />

      <div className="bg-[#121212] border border-[#2A2A30] rounded-lg p-3 flex items-center gap-3">
        <button onClick={() => setPlaying(!playing)} className={`${goldGradient} text-black w-9 h-9 rounded-full flex items-center justify-center shrink-0`}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <div className="flex items-end gap-[3px] h-12 flex-1 overflow-hidden">
          {bars.map((h, i) => (
            <div key={i} className="w-[4px] rounded-full transition-colors" style={{ height: h, background: i <= pos ? GOLD : "#3A3A42" }} />
          ))}
        </div>
      </div>

      <div className={`grid ${full ? "lg:grid-cols-2" : ""} gap-4 mt-4`}>
        <div>
          <p className="text-xs text-gray-400 mb-2">Executive tone / anxiety shift analysis</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={toneData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#2A2A30" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#6B7280" tick={{ fontSize: 10 }} />
                <YAxis stroke="#6B7280" tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "#1A1A1D", border: "1px solid #2A2A30", borderRadius: 8, color: "#fff" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Confidence" stroke={GOLD} strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Anxiety" stroke="#F87171" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 mb-2">Interactive transcript · click a quote</p>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {SEGMENTS.map((s) => (
              <button key={s.id} onClick={() => { setSel(s); setPos(Math.floor((s.id / SEGMENTS.length) * (bars.length - 1))); }}
                className={`w-full text-left text-xs rounded-lg px-3 py-2 border transition ${sel.id === s.id ? "border-[#D4AF37] bg-[#D4AF37]/10 text-white" : "border-[#2A2A30] bg-[#121212] text-gray-400 hover:border-[#D4AF37]/50"}`}>
                <span className="text-[#E5C158] font-semibold">{s.who}</span>
                <span className="block mt-0.5">“{s.text}”</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 bg-[#121212] border border-[#2A2A30] rounded-lg p-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">AI Read · Segment {sel.id}</p>
          <p className="text-sm text-white">{sel.flag}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-400">Anxiety</p>
          <p className={`text-xl font-bold ${sel.anx > 40 ? "text-red-400" : "text-emerald-400"}`}>{sel.anx}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ ALT DATA FEED ----------------------------- */
function AltDataFeed() {
  const items = [
    { icon: FileText, tag: "Patent & IP Predictor", title: "3 new chiplet interconnect filings", body: "Pattern matches the 2021 filing cluster that preceded the 3D V-Cache launch. Estimated product lead time: 9–14 months.", score: "Signal 82/100", color: "text-[#E5C158]" },
    { icon: Satellite, tag: "Supply-Chain Satellite Tracker", title: "TSMC AZ lot traffic +12% WoW", body: "Truck and vehicle counts imply wafer-start acceleration, a read-through for next-quarter supply.", score: "Signal 74/100", color: "text-emerald-400" },
    { icon: Megaphone, tag: "De-Influencer Scraper", title: "Negative creator sentiment spike", body: "Short-form de-influencing videos on a held consumer name rose 3.4x in 72h. Watch for a demand miss.", score: "Risk 61/100", color: "text-red-400" },
  ];
  return (
    <div className={`${card} p-6`}>
      <SectionTitle icon={Satellite} title="Alternative Data Feed" right={<span className="text-xs text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Live</span>} />
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.tag} className="bg-[#121212] border border-[#2A2A30] hover:border-[#D4AF37]/50 transition rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="flex items-center gap-2 text-xs text-[#E5C158]"><it.icon size={14} />{it.tag}</span>
              <span className={`text-[11px] font-semibold ${it.color}`}>{it.score}</span>
            </div>
            <p className="text-sm text-white font-medium">{it.title}</p>
            <p className="text-xs text-gray-400 mt-1">{it.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------- PROXY SWIPER ----------------------------- */
function ProxySwiper({ log, setLog }) {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(null);
  const current = PROXIES[idx];

  const vote = (d) => {
    if (dir || !current) return;
    setDir(d);
    setTimeout(() => {
      setLog((l) => [{ ...current, vote: d === "right" ? "Approved" : "Rejected" }, ...l]);
      setIdx((i) => i + 1);
      setDir(null);
    }, 350);
  };

  return (
    <div className={`${card} p-6`}>
      <SectionTitle icon={Vote} title="Corporate Conscience · Proxy Swiper" right={<span className="text-xs text-gray-500">{Math.min(idx + 1, PROXIES.length)}/{PROXIES.length}</span>} />
      {current ? (
        <>
          <div className="transition-all duration-300 bg-[#121212] border border-[#2A2A30] rounded-xl p-5"
            style={{ transform: dir === "left" ? "translateX(-80px) rotate(-6deg)" : dir === "right" ? "translateX(80px) rotate(6deg)" : "none", opacity: dir ? 0 : 1 }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#E5C158]">{current.company}</span>
              <span className="text-[10px] text-gray-500">Vote by {current.due}</span>
            </div>
            <p className="text-white font-semibold">{current.title}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{current.type}</p>
            <p className="text-xs text-gray-400 mt-3">{current.detail}</p>
            <div className="mt-3 text-xs bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#E5C158] rounded-lg px-3 py-2 flex gap-2">
              <Sparkles size={14} className="shrink-0 mt-0.5" />{current.rec}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => vote("left")} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition text-sm font-medium"><X size={16} />Reject ←</button>
            <button onClick={() => vote("right")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg ${goldGradient} text-black text-sm font-semibold hover:opacity-90 transition`}>→ Approve<Check size={16} /></button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <Check size={32} color={GOLD} className="mx-auto mb-2" />
          <p className="text-white font-medium">All proxies voted</p>
          <button onClick={() => { setIdx(0); setLog([]); }} className="text-xs text-[#E5C158] mt-2 hover:underline">Reset demo</button>
        </div>
      )}
      {log.length > 0 && (
        <div className="mt-4 border-t border-[#2A2A30] pt-3 space-y-1.5">
          {log.map((l, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-gray-400 truncate pr-2">{l.company}: {l.title.split(":")[0]}</span>
              <span className={l.vote === "Approved" ? "text-emerald-400" : "text-red-400"}>{l.vote}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- ALT ASSET LIST ----------------------------- */
function AltAssetList({ expanded }) {
  const total = ALT_ASSETS.reduce((s, a) => s + a.value, 0);
  return (
    <div className={`${card} p-6`}>
      <SectionTitle icon={Gem} title="Alternative Asset Real-Time Valuations" right={<span className={`text-sm font-bold ${goldText}`}>{usd(total)}</span>} />
      <div className="space-y-2">
        {ALT_ASSETS.slice(0, expanded ? ALT_ASSETS.length : 3).map((a) => (
          <div key={a.id} className="flex items-center justify-between bg-[#121212] border border-[#2A2A30] rounded-lg px-3 py-2.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center"><a.icon size={17} color={GOLD} /></div>
              <div>
                <p className="text-sm text-white">{a.name}</p>
                <p className="text-[11px] text-gray-500">{a.cat} · {a.src}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white font-semibold">{usd(a.value)}</p>
              <p className={`text-[11px] flex items-center justify-end gap-0.5 ${a.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {a.change >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{Math.abs(a.change)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- SETTINGS -------------------------------- */
function SettingsPanel() {
  const [s, setS] = useState({ tlh: true, div: true, patent: true, sat: true, deinf: true, vol: false, email: false });
  const rows = [
    ["tlh", "Automatic Tax-Loss Harvester", "Sells losers to offset gains, avoiding wash sales."],
    ["div", "Dividend Snowballing", "Auto-reinvests dividends into highest-yield-growth holdings."],
    ["patent", "Patent & IP Tracker", "Monitors USPTO filings for your holdings."],
    ["sat", "Supply-Chain Satellite Tracker", "Tracks factory, port and parking-lot activity."],
    ["deinf", "De-Influencer Scraper", "Scans social platforms for consumer-sentiment shifts."],
    ["vol", "Volatility Edge Scanner", "Flags options overpricing versus historical moves."],
    ["email", "Email Digest", "Daily AI summary of triggered alerts."],
  ];
  return (
    <div className={`${card} p-6`}>
      <SectionTitle icon={Settings} title="Settings / Background Trackers" />
      <div className="divide-y divide-[#2A2A30]">
        {rows.map(([k, t, d]) => (
          <div key={k} className="flex items-center justify-between py-3">
            <div><p className="text-sm text-white">{t}</p><p className="text-xs text-gray-500">{d}</p></div>
            <Toggle on={s[k]} onChange={(v) => setS({ ...s, [k]: v })} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------- APP ----------------------------------- */
export default function ZenitCapital() {
  const [tab, setTab] = useState("dashboard");
  const [showAlt, setShowAlt] = useState(true);
  const [ticker, setTicker] = useState("AMD");
  const [vals, setVals] = useState(DEFAULTS);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread, setUnread] = useState(NOTIFS.length);
  const [query, setQuery] = useState("");
  const [log, setLog] = useState([]);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "workstation", label: "Price Target Workstation", icon: TrendingUp },
    { id: "earnings", label: "Earnings Condensor", icon: Headphones },
    { id: "alt", label: "Alternative Assets", icon: Gem },
    { id: "conscience", label: "Corporate Conscience", icon: Vote },
    { id: "settings", label: "Settings / Trackers", icon: Settings },
  ];

  const searchPool = [
    ...Object.entries(TICKERS).map(([k, v]) => ({ kind: "Ticker", label: `$${k} · ${v.name}`, action: () => { setTicker(k); setVals(DEFAULTS); setTab("workstation"); } })),
    { kind: "Patent", label: "AMD chiplet interconnect filings", action: () => setTab("alt") },
    { kind: "Transcript", label: "AMD Q3 earnings call", action: () => setTab("earnings") },
    { kind: "Proxy", label: "Climate transition report vote", action: () => setTab("conscience") },
  ];
  const results = query.trim() ? searchPool.filter((r) => r.label.toLowerCase().includes(query.toLowerCase())) : [];

  const closeMenus = () => { setBellOpen(false); setProfileOpen(false); };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex" style={{ fontFamily: "Inter, system-ui, sans-serif" }} onClick={closeMenus}>
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-[#121212] border-r border-[#2A2A30] p-4">
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <Logo size={38} />
          <div>
            <p className={`text-lg font-bold tracking-[0.2em] leading-none ${goldText}`}>ZENIT</p>
            <p className="text-[10px] tracking-[0.35em] text-gray-400 mt-1">CAPITAL</p>
          </div>
        </div>
        <nav className="space-y-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={(e) => { e.stopPropagation(); setTab(t.id); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${tab === t.id ? `${goldGradient} text-black font-semibold` : "text-gray-400 hover:text-white hover:bg-[#1E1E24]"}`}>
              <t.icon size={17} />{t.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto bg-[#1A1A1D] border border-[#2A2A30] rounded-lg p-3 text-xs text-gray-400">
          <p className="text-[#E5C158] font-semibold mb-1">Institutional-grade access</p>
          6 background trackers running.
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* TOP BAR */}
        <header className="h-16 shrink-0 border-b border-[#2A2A30] bg-[#0D0D0D]/90 backdrop-blur flex items-center gap-4 px-4 lg:px-8 relative z-20">
          <div className="md:hidden"><Logo size={30} /></div>
          <div className="relative flex-1 max-w-xl" onClick={(e) => e.stopPropagation()}>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tickers, patents, earnings transcripts..."
              className="w-full bg-[#1A1A1D] border border-[#2A2A30] rounded-lg pl-9 pr-3 py-2 text-sm placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]" />
            {results.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-[#1A1A1D] border border-[#2A2A30] rounded-lg shadow-2xl overflow-hidden">
                {results.map((r, i) => (
                  <button key={i} onClick={() => { r.action(); setQuery(""); }} className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-[#1E1E24] text-left">
                    <span className="text-gray-200">{r.label}</span><span className="text-[10px] text-[#E5C158]">{r.kind}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <button onClick={() => { setBellOpen(!bellOpen); setProfileOpen(false); setUnread(0); }} className="relative w-9 h-9 rounded-lg bg-[#1A1A1D] border border-[#2A2A30] flex items-center justify-center hover:border-[#D4AF37] transition">
                <Bell size={17} color={bellOpen ? GOLD : "#9CA3AF"} />
                {unread > 0 && <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${goldGradient} text-black text-[10px] font-bold flex items-center justify-center`}>{unread}</span>}
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1A1A1D] border border-[#2A2A30] rounded-xl shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#2A2A30] flex items-center justify-between">
                    <p className="text-sm font-semibold">AI Alerts</p>
                    <span className="text-[10px] text-[#E5C158]">{NOTIFS.length} active</span>
                  </div>
                  {NOTIFS.map((n) => (
                    <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-[#1E1E24] border-b border-[#2A2A30] last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center shrink-0"><n.icon size={15} color={GOLD} /></div>
                      <div>
                        <p className="text-sm text-white">{n.title}</p>
                        <p className="text-xs text-gray-400">{n.body}</p>
                        <p className="text-[10px] text-gray-600 mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={() => { setProfileOpen(!profileOpen); setBellOpen(false); }} className={`w-9 h-9 rounded-full ${goldGradient} flex items-center justify-center text-black`}><User size={17} /></button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#1A1A1D] border border-[#2A2A30] rounded-xl shadow-2xl overflow-hidden text-sm">
                  <div className="px-4 py-3 border-b border-[#2A2A30]"><p className="text-white">Alex Morgan</p><p className="text-xs text-gray-500">Founding Member</p></div>
                  <button onClick={() => { setTab("settings"); setProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-[#1E1E24]">Settings</button>
                  <button className="w-full text-left px-4 py-2.5 text-gray-300 hover:bg-[#1E1E24]">Linked Accounts</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MOBILE TABS */}
        <div className="md:hidden flex gap-2 overflow-x-auto px-4 py-2 border-b border-[#2A2A30]">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs ${tab === t.id ? `${goldGradient} text-black font-semibold` : "bg-[#1A1A1D] text-gray-400"}`}>{t.label}</button>
          ))}
        </div>

        {/* CONTENT */}
        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-y-auto">
          <div>
            <h1 className="text-2xl font-bold">{tabs.find((t) => t.id === tab).label}</h1>
            <p className="text-sm text-gray-500">Zenit Capital · AI-powered central investment terminal</p>
          </div>

          {tab === "dashboard" && (
            <>
              <NetWorthHero showAlt={showAlt} setShowAlt={setShowAlt} />
              <div className="grid xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2"><Workbench ticker={ticker} setTicker={setTicker} vals={vals} setVals={setVals} /></div>
                <XirrSolver ticker={ticker} vals={vals} />
              </div>
              <PriceChart ticker={ticker} />
              <div className="grid xl:grid-cols-2 gap-6">
                <EarningsCondensor />
                <AltDataFeed />
              </div>
              <div className="grid xl:grid-cols-2 gap-6">
                <ProxySwiper log={log} setLog={setLog} />
                <AltAssetList />
              </div>
            </>
          )}

          {tab === "workstation" && (
            <>
              <div className="grid xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2"><Workbench ticker={ticker} setTicker={setTicker} vals={vals} setVals={setVals} /></div>
                <XirrSolver ticker={ticker} vals={vals} />
              </div>
              <PriceChart ticker={ticker} />
            </>
          )}

          {tab === "earnings" && (
            <div className="grid xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2"><EarningsCondensor full /></div>
              <AltDataFeed />
            </div>
          )}

          {tab === "alt" && (
            <div className="grid xl:grid-cols-2 gap-6">
              <AltAssetList expanded />
              <AltDataFeed />
            </div>
          )}

          {tab === "conscience" && (
            <div className="max-w-2xl"><ProxySwiper log={log} setLog={setLog} /></div>
          )}

          {tab === "settings" && (
            <div className="max-w-2xl"><SettingsPanel /></div>
          )}

          <footer className="text-center text-[11px] text-gray-600 pt-6 pb-2">
            Zenit Capital · Demo data for illustration only. Not investment advice.
          </footer>
        </main>
      </div>
    </div>
  );
}
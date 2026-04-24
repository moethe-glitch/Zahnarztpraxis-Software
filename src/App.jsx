import React, { useState, useEffect, useRef, useCallback, Component, createContext, useContext } from "react";

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════
const T = {
  // Brand
  brandDk:"#2D1F1F", brandMd:"#4A2E2E",
  // Sage (primary action)
  sage:"#7A9E8E", sageDk:"#5C8070", sageLt:"#E6F0ED", sageXlt:"#F2F8F5",
  // Neutral
  ch:"#2C2825", chLt:"#4A4440", gray:"#8C8580",
  ivory:"#FAF8F4", sand:"#EDE8E0", sandDk:"#D8D2C8",
  // Semantic
  ok:"#1A9E5C", okLt:"#EAFAF1",
  err:"#D4756A", errLt:"#FAEAE8",
  warn:"#C9956A", warnLt:"#F5EDE4",
  blue:"#2272C3", blueLt:"#EEF5FF",
  pur:"#7B3FBE", purLt:"#F4EEFF",
  teal:"#0A7B7B", tealLt:"#E6F8F8",
  // Dark mode
  dbg:"#0F0F1A", dcard:"#1A1A2E", dbrd:"#2A2A4A", dtxt:"#E0E0E0",
};

// Easing
const EO  = "cubic-bezier(0.16,1,0.3,1)";
const ESP = "cubic-bezier(0.34,1.56,0.64,1)";
const EIO = "cubic-bezier(0.87,0,0.13,1)";

// ═══════════════════════════════════════════════════════════════
// GLOBAL CSS
// ═══════════════════════════════════════════════════════════════
const CSS = `
@keyframes fadeIn    { from{opacity:0}                          to{opacity:1} }
@keyframes slideUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
@keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:none} }
@keyframes slideR    { from{opacity:0;transform:translateX(32px)}  to{opacity:1;transform:none} }
@keyframes scaleIn   { from{opacity:0;transform:scale(0.94)}    to{opacity:1;transform:scale(1)} }
@keyframes spin      { to{transform:rotate(360deg)} }
@keyframes shake     { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
@keyframes ringPop   { 0%{transform:scale(0.6);opacity:0} 65%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
@keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.5} }
@keyframes shimmer   { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
@keyframes msgIn     { from{opacity:0;transform:translateY(8px) scale(0.97)} to{opacity:1;transform:none} }
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
input,textarea,select,button{font-family:inherit;}
::-webkit-scrollbar{width:5px;height:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#C8BFB5;border-radius:10px;}
::-webkit-scrollbar-thumb:hover{background:#8C8580;}
.skel{background:linear-gradient(90deg,#f0ece8 25%,#e8e4e0 50%,#f0ece8 75%);background-size:600px;animation:shimmer 1.4s ease-in-out infinite;}
button:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:2.5px solid #7A9E8E;outline-offset:2px;}
.hover-row:hover{background:${T.sageXlt} !important;}
`;

// ═══════════════════════════════════════════════════════════════
// STATIC DATA
// ═══════════════════════════════════════════════════════════════
const ARBEITSTYPEN = [
  "Zahnkrone","Brücke","Inlay/Onlay","Veneer",
  "Vollprothese","Teilprothese","Implantat-Krone","Implantat-Brücke",
  "Teleskopprothese","Haken-Klammer-Prothese","Zahnspange","Retainer",
  "Kieferschiene","Mundschutz","Bleaching-Schiene","Aufbissschiene",
  "Knirscherschiene","Schnarcherschiene","Zahnfleischmaske","Reparatur",
  "Unterfütterung","Sonstiges",
];

const STATUS_FLOW = ["Eingang","In Arbeit","Qualitätskontrolle","Bereit","Zurückgeschickt","Eingesetzt","Archiviert"];

const SM = {
  "Eingang":            {color:T.warn,  bg:T.warnLt, icon:"📥", label:"Eingang"},
  "In Arbeit":          {color:T.blue,  bg:T.blueLt, icon:"⚙️",  label:"In Arbeit"},
  "Qualitätskontrolle": {color:T.pur,   bg:T.purLt,  icon:"🔍", label:"Kontrolle"},
  "Bereit":             {color:T.ok,    bg:T.okLt,   icon:"✅", label:"Bereit"},
  "Zurückgeschickt":    {color:T.err,   bg:T.errLt,  icon:"↩️",  label:"Zurück"},
  "Eingesetzt":         {color:T.teal,  bg:T.tealLt, icon:"🦷", label:"Eingesetzt"},
  "Archiviert":         {color:T.gray,  bg:T.sand,   icon:"📦", label:"Archiviert"},
};

const PS = {
  offen:       {color:T.warn,  bg:T.warnLt, icon:"⏳", label:"Offen"},
  teilbezahlt: {color:T.blue,  bg:T.blueLt, icon:"◑",  label:"Teilbezahlt"},
  bezahlt:     {color:T.ok,    bg:T.okLt,   icon:"✅", label:"Bezahlt"},
  ueberfaellig:{color:T.err,   bg:T.errLt,  icon:"⚠",  label:"Überfällig"},
  storniert:   {color:T.gray,  bg:T.sand,   icon:"✕",  label:"Storniert"},
};

const DOC_TYPES = [
  {key:"invoice",             icon:"🧾", label:"Rechnung"},
  {key:"delivery_note",       icon:"📦", label:"Lieferschein"},
  {key:"treatment_cost_plan", icon:"📋", label:"Heil- & Kostenplan"},
  {key:"extra_cost_agreement",icon:"📝", label:"Mehrkostenvereinbarung"},
];

// ═══════════════════════════════════════════════════════════════
// SUPABASE CONFIG + API SERVICES
// ═══════════════════════════════════════════════════════════════
const SB_URL = "https://rfoiokhambyjewpauytn.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmb2lva2hhbWJ5amV3cGF1eXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMzgwMTEsImV4cCI6MjA5MTgxNDAxMX0.Lokl1HrFSx2HSJJFQjd5oM31NfeB3cbyso3nDvdB8bc";
const isConf  = () => SB_URL !== "IHRE_SUPABASE_URL";

// ── Signed URL helper ──────────────────────────────────────────
const getPhotoUrl = async (pathOrUrl, bucket = "fotos", expires = 3600) => {
  if (pathOrUrl && (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://"))) return pathOrUrl;
  if (!pathOrUrl) return null;
  try {
    const cleanPath = pathOrUrl.replace(`${bucket}/`, "");
    const session = (() => { try { return JSON.parse(localStorage.getItem("sb_session") || "null"); } catch { return null; } })();
    const token = session?.access_token || SB_KEY;
    const res = await fetch(`${SB_URL}/storage/v1/object/sign/${bucket}/${cleanPath}`, {
      method: "POST",
      headers: { "apikey": SB_KEY, "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ expiresIn: expires }),
    });
    if (!res.ok) return pathOrUrl;
    const data = await res.json();
    return `${SB_URL}/storage/v1${data.signedURL}`;
  } catch { return pathOrUrl; }
};

// ── Supabase Auth helpers ──────────────────────────────────────
const sbAuth = {
  signIn: async (email, password) => {
    const res = await fetch(`${SB_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: SB_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.msg || "Login fehlgeschlagen");
    return data;
  },
  signOut: async (accessToken) => {
    await fetch(`${SB_URL}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: SB_KEY, Authorization: `Bearer ${accessToken}` },
    }).catch(() => {});
  },
  getSession: () => {
    try { return JSON.parse(localStorage.getItem("sb_session") || "null"); } catch { return null; }
  },
  setSession: (s) => {
    try { localStorage.setItem("sb_session", s ? JSON.stringify(s) : "null"); } catch {}
  },
};

async function sbReq(path, opts = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, {
    headers: {
      "apikey": SB_KEY,
      "Authorization": `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      "Prefer": opts.prefer || "return=representation",
    },
    method: opts.method || "GET",
    body: opts.body,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt.slice(0, 200));
  }
  const txt = await res.text();
  return txt ? JSON.parse(txt) : [];
}

// ─── Orders Service ────────────────────────────────────────────
const ordersService = {
  getAll:     ()       => sbReq("auftraege?order=eingang.desc"),
  insert:     (r)      => sbReq("auftraege", {method:"POST", body:JSON.stringify(r)}),
  update:     (id, p)  => sbReq(`auftraege?id=eq.${id}`, {method:"PATCH", body:JSON.stringify(p)}),
  getById:    (id)     => sbReq(`auftraege?id=eq.${id}&limit=1`).then(r => r[0] || null),
};

// ─── Chat Service ──────────────────────────────────────────────
const chatService = {
  getByOrder: (aid)    => sbReq(`nachrichten?auftrag_id=eq.${aid}&order=erstellt_am.asc`),
  getRecent:  ()       => sbReq("nachrichten?order=erstellt_am.desc&limit=200"),
  insert:     (r)      => sbReq("nachrichten", {method:"POST", body:JSON.stringify(r)}),
  markRead:   (id, p)  => sbReq(`nachrichten?id=eq.${id}`, {method:"PATCH", body:JSON.stringify(p)}),
};

// ─── Patients Service ──────────────────────────────────────────
const patientsService = {
  getAll:  ()      => sbReq("patienten?order=name.asc"),
  insert:  (r)     => sbReq("patienten", {method:"POST", body:JSON.stringify(r)}),
  delete:  (id)    => sbReq(`patienten?id=eq.${id}`, {method:"DELETE", prefer:""}),
};

// ─── Dentists Service ──────────────────────────────────────────
const dentistsService = {
  getAll:  ()      => sbReq("zahn%C3%A4rzte?order=name.asc"),
  insert:  (r)     => sbReq("zahnärzte", {method:"POST", body:JSON.stringify(r)}),
  update:  (id, p) => sbReq(`zahn%C3%A4rzte?id=eq.${encodeURIComponent(id)}`, {method:"PATCH", body:JSON.stringify(p)}),
  delete:  (id)    => sbReq(`zahn%C3%A4rzte?id=eq.${encodeURIComponent(id)}`, {method:"DELETE", prefer:""}),
};

// ─── Documents Service ─────────────────────────────────────────
const documentsService = {
  getAll:        (qs)     => sbReq(`documents?${qs || "order=created_at.desc&limit=100"}`),
  insert:        (r)      => sbReq("documents", {method:"POST", body:JSON.stringify(r)}),
  insertItem:    (r)      => sbReq("document_items", {method:"POST", body:JSON.stringify(r)}),
  updatePayment: (id, p)  => sbReq(`documents?id=eq.${id}`, {method:"PATCH", body:JSON.stringify(p)}),
  getItems:      (docId)  => sbReq(`document_items?document_id=eq.${docId}`),
};

// ─── Netlify Functions ─────────────────────────────────────────
async function sendSMS(to, message) {
  const res = await fetch("/.netlify/functions/send-sms", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({to, message}),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "SMS fehlgeschlagen");
  return data;
}

async function sendEmail(to, subject, html) {
  const res = await fetch("/.netlify/functions/send-email", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({to, subject, html}),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "E-Mail fehlgeschlagen");
  return data;
}

async function analyseDoc(imageBase64, mimeType, docTypeHint) {
  const res = await fetch("/.netlify/functions/ai-analyze", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({mode:"analyze", imageBase64, mimeType, docTypeHint}),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Analyse fehlgeschlagen");
  return data.result;
}

async function getAiTips(arbeitstyp, zahn) {
  try {
    const res = await fetch("/.netlify/functions/ai-analyze", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({mode:"tips", arbeitstyp, zahn}),
    });
    const data = await res.json();
    return Array.isArray(data.tips) ? data.tips : [];
  } catch { return []; }
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════
const ss       = v => v == null ? "" : String(v);
const today    = () => new Date().toISOString().split("T")[0];
const genId    = () => { if (typeof crypto !== "undefined" && crypto.randomUUID) { return crypto.randomUUID(); } return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) { const r = Math.random() * 16 | 0; const v = c === "x" ? r : (r & 0x3 | 0x8); return v.toString(16); }); };
const addDays  = n => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().split("T")[0]; };
const fmtDate  = d => { if(!d) return "–"; try{return new Date(d+"T12:00:00").toLocaleDateString("de-DE");}catch{return d;} };
const fmtTime  = d => { if(!d) return ""; try{return new Date(d).toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});}catch{return "";} };
const isLate   = a => { try{ if(!a?.faelligkeit) return false; const s=ss(a.status); if(s==="Eingesetzt"||s==="Archiviert") return false; return new Date(a.faelligkeit)<new Date(); }catch{return false;} };
const getSM    = s => SM[s] || SM["Eingang"];
const getPS    = s => PS[s] || PS["offen"];
const getV     = a => { try{if(!a)return[];if(Array.isArray(a.verlauf))return a.verlauf;return JSON.parse(ss(a.verlauf)||"[]");}catch{return[];} };
const getFotos = a => { try{if(!a)return[];if(Array.isArray(a.fotos))return a.fotos;return JSON.parse(ss(a.fotos)||"[]");}catch{return[];} };

// LocalStorage helpers
const ls = {
  get:    (k,d) => { try{const v=localStorage.getItem(k);return v==null?d:v;}catch{return d;} },
  set:    (k,v) => { try{localStorage.setItem(k,v);}catch{} },
  obj:    (k)   => { try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch{return null;} },
  setObj: (k,v) => { try{localStorage.setItem(k,JSON.stringify(v));}catch{} },
};

const getPIN    = ()  => { const p=ls.get("p_pin","1234"); return p&&p.length>=4?p:"1234"; };
const getPINOn  = ()  => { const v=ls.get("p_pin_on",null); return v===null?false:v==="1"; }; // PIN off by default
const setPIN    = p   => ls.set("p_pin", p);
const setPINOn  = v   => ls.set("p_pin_on", v?"1":"0");
const getDark   = ()  => ls.get("p_dark","0")==="1";
const setDark   = v   => ls.set("p_dark", v?"1":"0");

const getEmailCfg  = () => ls.obj("p_email_cfg") || {
  praxisName:"Die 3 Zahnärzte by Mahal", telefon:"",
  betreff:"Ihre Zahnersatzarbeit ist fertig — {patient}",
  text:"Sehr geehrte/r {patient},\n\nIhre Zahnersatzarbeit ({arbeitstyp}) ist fertig.\n\nBitte vereinbaren Sie einen Termin.\n\nMit freundlichen Grüßen\n{zahnarzt}\n{praxis}",
};
const saveEmailCfg = v => ls.setObj("p_email_cfg", v);

const getSmsVorlagen = () => ls.obj("p_sms_vl") || [
  {id:"v1", name:"Arbeit fertig",     text:"Guten Tag {patient}, Ihre Zahnarbeit ({behandlung}) ist fertig. Mit freundlichen Grüßen, {zahnarzt}"},
  {id:"v2", name:"Termin Erinnerung", text:"Guten Tag {patient}, wir möchten Sie an Ihren Termin am {datum} erinnern. {praxis}"},
  {id:"v3", name:"Kontrolle nötig",   text:"Guten Tag {patient}, bitte vereinbaren Sie einen Kontrolltermin ({behandlung}). {praxis}"},
];
const saveSmsVorlagen = v => ls.setObj("p_sms_vl", v);
const fillVorlage = (text, vars) => {
  let t = text;
  Object.entries(vars).forEach(([k,v]) => { t = t.split(`{${k}}`).join(v||""); });
  return t;
};

// Image helpers
async function compressImage(file, maxPx=2400, q=0.88) {
  try {
    const bmp=await createImageBitmap(file);
    const scale=Math.min(1,maxPx/Math.max(bmp.width,bmp.height));
    const w=Math.round(bmp.width*scale), h=Math.round(bmp.height*scale);
    const c=document.createElement("canvas"); c.width=w; c.height=h;
    c.getContext("2d").drawImage(bmp,0,0,w,h);
    return await new Promise(r=>c.toBlob(b=>r(b||file),"image/jpeg",q));
  } catch { return file; }
}
async function fileToB64(file) {
  return new Promise((res,rej)=>{
    const r=new FileReader();
    r.onload=()=>res(r.result.split(",")[1]);
    r.onerror=()=>rej(new Error("read fail"));
    r.readAsDataURL(file);
  });
}
async function sha256(file) {
  try {
    const buf=await file.arrayBuffer();
    const hash=await crypto.subtle.digest("SHA-256",buf);
    return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("");
  } catch { return null; }
}
async function uploadFoto(aid, file, onProgress) {
  const compressed=await compressImage(file);
  const ext=(file.name||"foto.jpg").split(".").pop().toLowerCase()||"jpg";
  const path=`${aid}/${Date.now()}.${ext}`;
  const url=`${SB_URL}/storage/v1/object/fotos/${path}`;
  for (let attempt=1; attempt<=3; attempt++) {
    try {
      if(onProgress) onProgress({attempt,total:3,status:"uploading"});
      const res=await fetch(url,{method:"POST",headers:{"apikey":SB_KEY,"Authorization":`Bearer ${SB_KEY}`,"Content-Type":compressed.type||"image/jpeg"},body:compressed});
      if(!res.ok) throw new Error("HTTP "+res.status);
      if(onProgress) onProgress({attempt,total:3,status:"done"});
      return `fotos/${path}`; // store path, not public URL
    } catch(err) {
      if(attempt===3){if(onProgress)onProgress({attempt,total:3,status:"failed",error:err.message});throw err;}
      await new Promise(r=>setTimeout(r,1000*Math.pow(2,attempt-1)));
    }
  }
}

// Push + Sound
function playSound(type="chat") {
  try {
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(); const g=ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    if(type==="bereit"){
      o.frequency.setValueAtTime(660,ctx.currentTime);
      o.frequency.setValueAtTime(880,ctx.currentTime+0.12);
      o.frequency.setValueAtTime(1100,ctx.currentTime+0.24);
      g.gain.setValueAtTime(0.2,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.6);
      o.start(); o.stop(ctx.currentTime+0.6);
    } else {
      o.frequency.setValueAtTime(880,ctx.currentTime);
      o.frequency.setValueAtTime(660,ctx.currentTime+0.1);
      g.gain.setValueAtTime(0.25,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);
      o.start(); o.stop(ctx.currentTime+0.4);
    }
  } catch {}
}
function pushNotif(title, body, sound="chat") {
  try { playSound(sound); } catch {}
  try {
    if(Notification?.permission==="granted") new Notification(title,{body:ss(body).slice(0,100),icon:"/icon-192.png"});
  } catch {}
}
function reqNotifPermission() {
  if(Notification?.permission==="default") Notification.requestPermission().catch(()=>{});
}

// QR
function buildQRData(auftrag) {
  return JSON.stringify({id:auftrag.id, patient:auftrag.patient, zahnarzt:auftrag.zahnarzt, arbeitstyp:auftrag.arbeitstyp});
}

// Monitor
const Monitor = {
  init: () => {},
  error: (e, ctx={}) => { console.error("[Monitor]", String(e).slice(0,200), ctx); },
  warn:  (n, d={})   => { console.warn("[Monitor]", n, d); },
};

// ═══════════════════════════════════════════════════════════════
// ERROR BOUNDARY
// ═══════════════════════════════════════════════════════════════
class ErrorBoundary extends Component {
  constructor(p) { super(p); this.state={err:null}; }
  static getDerivedStateFromError(e) { return {err:e}; }
  componentDidCatch(e,i) { Monitor.error(e,{stack:i?.componentStack?.slice(0,300)}); }
  render() {
    if (!this.state.err) return this.props.children;
    const {dark} = this.props;
    const bg = dark ? T.dbg : T.ivory;
    return (
      <div style={{minHeight:"100vh",background:bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center",fontFamily:"-apple-system,sans-serif"}}>
        <div style={{fontSize:52,marginBottom:20}}>⚠️</div>
        <div style={{fontWeight:700,fontSize:22,color:T.ch,marginBottom:8,fontFamily:"Georgia,serif"}}>Unerwarteter Fehler</div>
        <div style={{color:T.gray,fontSize:14,marginBottom:28,maxWidth:380,lineHeight:1.6}}>Die App ist auf ein Problem gestoßen. Bitte lade die Seite neu.</div>
        <button onClick={()=>window.location.reload()}
          style={{background:`linear-gradient(135deg,${T.sage},${T.sageDk})`,color:"#fff",border:"none",borderRadius:12,padding:"13px 28px",fontSize:15,fontWeight:700,cursor:"pointer"}}>
          🔄 Neu laden
        </button>
      </div>
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// BASE UI COMPONENTS
// ═══════════════════════════════════════════════════════════════

// ─── Spinner ──────────────────────────────────────────────────
function Spinner({size=18,color=T.sage,style:st={}}) {
  return <div style={{width:size,height:size,border:`2px solid rgba(0,0,0,0.08)`,borderTopColor:color,borderRadius:"50%",animation:"spin .7s linear infinite",flexShrink:0,...st}}/>;
}

// ─── Toast ────────────────────────────────────────────────────
function Toast({msg,type}) {
  if (!msg) return null;
  const col = type==="err"?T.err : type==="warn"?T.warn : T.sage;
  return (
    <div style={{position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",background:T.ch,color:col,borderRadius:28,padding:"11px 24px",zIndex:9000,fontSize:13,fontWeight:700,whiteSpace:"nowrap",animation:`slideDown .25s ${EO} both`,boxShadow:"0 8px 32px rgba(44,40,37,0.35)",maxWidth:"90vw",textAlign:"center",pointerEvents:"none"}}>
      {msg}
    </div>
  );
}

// ─── OfflineBanner ────────────────────────────────────────────
function OfflineBanner({connErr,onlineMsg}) {
  if (!connErr && !onlineMsg) return null;
  return (
    <div style={{position:"fixed",top:0,left:0,right:0,zIndex:8000,background:connErr?"#FEF9EC":T.okLt,padding:"9px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:8,borderBottom:`2px solid ${connErr?T.warn:T.ok}`,transition:"background .4s",fontSize:12,fontWeight:700,color:connErr?"#92400E":T.ok}}>
      <span>{connErr?"📡":"✅"}</span>
      {connErr?"Keine Verbindung — wird automatisch verbunden…":"Wieder online"}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────
function Btn({children,onClick,variant="primary",size="md",disabled,loading,icon,style:st={},title}) {
  const base = {border:"none",borderRadius:10,cursor:disabled||loading?"not-allowed":"pointer",fontFamily:"inherit",fontWeight:700,display:"inline-flex",alignItems:"center",gap:7,transition:`all .15s ${EO}`,flexShrink:0,...st};
  const sizes = {sm:{padding:"6px 12px",fontSize:12},md:{padding:"9px 18px",fontSize:13},lg:{padding:"12px 24px",fontSize:15}};
  const variants = {
    primary:  {background:`linear-gradient(135deg,${T.sage},${T.sageDk})`,color:"#fff",boxShadow:`0 2px 8px ${T.sage}50`},
    secondary:{background:T.ivory,color:T.ch,border:`1.5px solid ${T.sand}`},
    danger:   {background:T.errLt,color:T.err,border:`1.5px solid ${T.err}50`},
    ghost:    {background:"transparent",color:T.gray,border:`1.5px solid ${T.sand}`},
    nav:      {background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.75)",border:"1px solid rgba(255,255,255,0.12)"},
  };
  const styles = {...base,...sizes[size],...variants[variant],opacity:disabled&&!loading?.5:1};
  return (
    <button onClick={!disabled&&!loading?onClick:undefined} title={title} style={styles}
      onMouseEnter={e=>{if(!disabled&&!loading)e.currentTarget.style.filter="brightness(1.06)";}}
      onMouseLeave={e=>{e.currentTarget.style.filter="";}}
      onMouseDown={e=>{if(!disabled&&!loading)e.currentTarget.style.transform="scale(0.97)";}}
      onMouseUp={e=>{e.currentTarget.style.transform="";}}
    >
      {loading ? <Spinner size={14} color={variant==="primary"?"#fff":T.sage}/> : icon&&<span style={{fontSize:15}}>{icon}</span>}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────
function Input({value,onChange,placeholder,type="text",dark,style:st={},onKeyDown,autoFocus,disabled,inputMode}) {
  const bg=dark?T.dcard:"#fff"; const tc=dark?T.dtxt:T.ch; const brd=dark?T.dbrd:T.sandDk;
  return (
    <input type={type} value={value} onChange={onChange} onKeyDown={onKeyDown} autoFocus={autoFocus}
      placeholder={placeholder} disabled={disabled} inputMode={inputMode}
      style={{width:"100%",padding:"10px 13px",border:`1.5px solid ${brd}`,borderRadius:10,fontSize:14,fontFamily:"inherit",outline:"none",background:bg,color:tc,boxSizing:"border-box",...st}}
      onFocus={e=>{e.target.style.borderColor=T.sage;}}
      onBlur={e=>{e.target.style.borderColor=brd;}}
    />
  );
}

// ─── Textarea ─────────────────────────────────────────────────
function Textarea({value,onChange,placeholder,rows=4,dark,style:st={}}) {
  const bg=dark?T.dcard:"#fff"; const tc=dark?T.dtxt:T.ch; const brd=dark?T.dbrd:T.sandDk;
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      style={{width:"100%",padding:"10px 13px",border:`1.5px solid ${brd}`,borderRadius:10,fontSize:14,fontFamily:"inherit",outline:"none",resize:"vertical",background:bg,color:tc,lineHeight:1.6,boxSizing:"border-box",...st}}
      onFocus={e=>{e.target.style.borderColor=T.sage;}}
      onBlur={e=>{e.target.style.borderColor=brd;}}
    />
  );
}

// ─── Select ───────────────────────────────────────────────────
function Select({value,onChange,children,dark,style:st={}}) {
  const bg=dark?T.dcard:"#fff"; const tc=dark?T.dtxt:T.ch; const brd=dark?T.dbrd:T.sandDk;
  return (
    <select value={value} onChange={onChange}
      style={{width:"100%",padding:"10px 13px",border:`1.5px solid ${brd}`,borderRadius:10,fontSize:14,fontFamily:"inherit",outline:"none",background:bg,color:tc,boxSizing:"border-box",appearance:"none",...st}}>
      {children}
    </select>
  );
}

// ─── Toggle ───────────────────────────────────────────────────
function Toggle({on,onToggle}) {
  return (
    <button onClick={onToggle} style={{width:46,height:26,borderRadius:13,background:on?T.sage:T.sand,border:"none",cursor:"pointer",position:"relative",transition:`background .2s`,flexShrink:0}}>
      <div style={{position:"absolute",top:3,left:on?23:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:`left .2s`,boxShadow:"0 1px 4px rgba(0,0,0,0.18)"}}/>
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────
function Badge({children,color=T.sage,bg=T.sageLt,size="md"}) {
  const sizes = {sm:{fontSize:10,padding:"2px 7px"},md:{fontSize:12,padding:"4px 10px"},lg:{fontSize:13,padding:"6px 13px"}};
  return <span style={{display:"inline-flex",alignItems:"center",gap:4,background:bg,color,borderRadius:20,fontWeight:700,...sizes[size]}}>{children}</span>;
}

// ─── StatusBadge ──────────────────────────────────────────────
function StatusBadge({status,compact,onChange}) {
  const sm = getSM(status);
  if (onChange) {
    const [open,setOpen] = useState(false);
    return (
      <div style={{position:"relative"}}>
        <button onClick={e=>{e.stopPropagation();setOpen(o=>!o);}}
          style={{display:"inline-flex",alignItems:"center",gap:4,background:sm.bg,color:sm.color,borderRadius:20,padding:compact?"3px 9px":"5px 12px",fontSize:compact?10:12,fontWeight:700,border:`1.5px solid ${sm.color}30`,cursor:"pointer",fontFamily:"inherit"}}>
          <span>{sm.icon}</span>{sm.label}
          <span style={{marginLeft:2,opacity:0.6,fontSize:9}}>▾</span>
        </button>
        {open&&(
          <>
            <div style={{position:"fixed",inset:0,zIndex:300}} onClick={()=>setOpen(false)}/>
            <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,background:"#fff",border:`1px solid ${T.sand}`,borderRadius:12,boxShadow:"0 8px 28px rgba(44,40,37,0.15)",zIndex:400,minWidth:180,padding:4,animation:`scaleIn .15s ${EO} both`}}>
              {STATUS_FLOW.map(s=>{const m=getSM(s);return(
                <button key={s} onClick={e=>{e.stopPropagation();onChange(s);setOpen(false);}}
                  style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"9px 12px",background:s===status?m.bg:"transparent",border:"none",cursor:"pointer",borderRadius:8,fontFamily:"inherit",textAlign:"left",color:s===status?m.color:T.ch,fontWeight:s===status?700:400}}>
                  <span style={{fontSize:16}}>{m.icon}</span>{m.label}
                </button>
              );})}
            </div>
          </>
        )}
      </div>
    );
  }
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:4,background:sm.bg,color:sm.color,borderRadius:20,padding:compact?"3px 9px":"5px 12px",fontSize:compact?10:12,fontWeight:700}}>
      <span>{sm.icon}</span>{sm.label}
    </span>
  );
}

// ─── Modal (base overlay) ─────────────────────────────────────
function Modal({children,onClose,width="min(600px,100vw)",maxH="92vh",noPad,dark}) {
  useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};document.addEventListener("keydown",h);return()=>document.removeEventListener("keydown",h);},[onClose]);
  const bg=dark?T.dcard:"#fff";
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(44,40,37,0.6)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(2px)"}} onClick={onClose}>
      <div style={{background:bg,borderRadius:20,width,maxHeight:maxH,display:"flex",flexDirection:"column",boxShadow:"0 24px 72px rgba(44,40,37,0.28)",overflow:"hidden",animation:`scaleIn .22s ${EO}`}} onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ─── Modal Header ─────────────────────────────────────────────
function ModalHeader({title,onClose,subtitle,dark}) {
  const tc=dark?T.dtxt:T.ch; const brd=dark?T.dbrd:T.sand;
  return (
    <div style={{background:`linear-gradient(135deg,${T.brandDk},${T.brandMd})`,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
      <div>
        <div style={{color:T.sage,fontWeight:700,fontSize:16,fontFamily:"Georgia,serif"}}>{title}</div>
        {subtitle&&<div style={{color:"rgba(255,255,255,0.45)",fontSize:12,marginTop:2}}>{subtitle}</div>}
      </div>
      <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(255,255,255,0.7)",borderRadius:8,width:30,height:30,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
    </div>
  );
}

// ─── SidePanel (Slide-in from right) ─────────────────────────
function SidePanel({children,onClose,width="min(560px,100vw)",dark}) {
  useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose();};document.addEventListener("keydown",h);return()=>document.removeEventListener("keydown",h);},[onClose]);
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(44,40,37,0.55)",zIndex:1000,display:"flex",alignItems:"stretch",justifyContent:"flex-end",backdropFilter:"blur(1px)"}} onClick={onClose}>
      <div style={{width,background:dark?T.dcard:"#fff",height:"100%",display:"flex",flexDirection:"column",boxShadow:"-12px 0 48px rgba(44,40,37,0.22)",animation:`slideR .28s ${EO}`}} onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────
function EmptyState({icon="📋",title,sub,action,dark}) {
  const tc=dark?T.dtxt:T.ch;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 24px",textAlign:"center"}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:dark?T.dbrd:T.sand,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,marginBottom:16,animation:`ringPop .4s ${ESP}`}}>{icon}</div>
      <div style={{fontWeight:700,fontSize:17,color:tc,marginBottom:6,fontFamily:"Georgia,serif"}}>{title}</div>
      {sub&&<div style={{color:T.gray,fontSize:13,marginBottom:20,maxWidth:300,lineHeight:1.6}}>{sub}</div>}
      {action}
    </div>
  );
}

// ─── KPIBox ───────────────────────────────────────────────────
function KPIBox({label,value,icon,color,bgColor,alarm,dark,onClick}) {
  const bg=dark?T.dcard:"#fff"; const tc=dark?T.dtxt:T.ch; const brd=dark?T.dbrd:T.sand;
  return (
    <div onClick={onClick} style={{background:alarm?(dark?"#2A1000":T.errLt):bg,borderRadius:16,padding:"18px 16px",borderLeft:`4px solid ${color||T.sage}`,boxShadow:"0 2px 8px rgba(44,40,37,0.07)",border:`1px solid ${brd}`,cursor:onClick?"pointer":"default",transition:`transform .15s ${EO}`,...(onClick?{":hover":{transform:"translateY(-1px)"}}:{})}}>
      {icon&&<div style={{fontSize:24,marginBottom:8}}>{icon}</div>}
      <div style={{fontWeight:800,fontSize:32,color:color||T.sage,fontFamily:"Georgia,serif",lineHeight:1,marginBottom:4}}>{value}</div>
      <div style={{fontSize:11,color:T.gray,textTransform:"uppercase",letterSpacing:"0.8px"}}>{label}</div>
    </div>
  );
}

// ─── StatBar ──────────────────────────────────────────────────
function StatBar({label,count,total,color,icon}) {
  const pct = Math.round(count/Math.max(total,1)*100);
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
        <span style={{fontSize:12,color:T.ch}}>{icon} {label}</span>
        <span style={{fontSize:12,fontWeight:700,color}}>{count} ({pct}%)</span>
      </div>
      <div style={{height:5,background:T.sand,borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:3,transition:`width .6s ${EO}`}}/>
      </div>
    </div>
  );
}

// ─── Section Label ────────────────────────────────────────────
function SectionLabel({children}) {
  return <div style={{fontSize:10,fontWeight:700,color:T.gray,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:8}}>{children}</div>;
}

// ─── Card ─────────────────────────────────────────────────────
function Card({children,dark,style:st={},onClick}) {
  const bg=dark?T.dcard:"#fff"; const brd=dark?T.dbrd:T.sand;
  return (
    <div onClick={onClick} style={{background:bg,border:`1px solid ${brd}`,borderRadius:16,padding:"16px",boxShadow:"0 2px 8px rgba(44,40,37,0.06)",cursor:onClick?"pointer":"default",...st}}>
      {children}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────
function Skeleton({height=18,width="100%",radius=8,style:st={}}) {
  return <div className="skel" style={{height,width,borderRadius:radius,...st}}/>;
}

// ─── ProgressBar ─────────────────────────────────────────────
function ProgressDots({status}) {
  const idx = STATUS_FLOW.indexOf(status);
  const pct = idx>=0 ? Math.round(idx/(STATUS_FLOW.length-1)*100) : 0;
  const sm = getSM(status);
  return (
    <div>
      <div style={{height:5,background:T.sand,borderRadius:3,overflow:"hidden",marginBottom:5}}>
        <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${sm.color},${T.sageDk})`,borderRadius:3,transition:`width .5s ${EO}`}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        {STATUS_FLOW.map((s,i)=><div key={s} title={s} style={{width:9,height:9,borderRadius:"50%",background:i<=idx?sm.color:T.sand,transition:"background .3s"}}/>)}
      </div>
    </div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────
function Logo({compact}) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:9,flexShrink:0}}>
      <div style={{width:compact?30:36,height:compact?30:36,borderRadius:10,background:`linear-gradient(135deg,${T.brandDk},${T.brandMd})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:compact?15:18,flexShrink:0}}>🦷</div>
      {!compact&&<div>
        <div style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:14,color:T.sage,lineHeight:1}}>Die 3 Zahnärzte</div>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",letterSpacing:"1.5px",textTransform:"uppercase",marginTop:1}}>by Mahal</div>
      </div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PIN PAD (reusable)
// ═══════════════════════════════════════════════════════════════
function PinPad({onSubmit,error,dark,length=4}) {
  const [val,setVal] = useState("");
  const tap = d => { if(val.length>=length) return; setVal(v=>v+d); };
  const del = () => setVal(v=>v.slice(0,-1));
  const sub = () => { if(val.length===length){onSubmit(val);setVal("");} };
  const full = val.length===length;
  return (
    <div style={{width:"100%",maxWidth:300,margin:"0 auto"}}>
      {/* Dots */}
      <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:28}}>
        {Array.from({length}).map((_,i)=>(
          <div key={i} style={{width:16,height:16,borderRadius:"50%",background:i<val.length?T.sage:"rgba(255,255,255,0.2)",transform:i<val.length?"scale(1.15)":"scale(1)",boxShadow:i<val.length?`0 0 0 4px ${T.sage}30`:"none",transition:"all .12s"}}/>
        ))}
      </div>
      {/* Error */}
      {error&&<div style={{textAlign:"center",color:T.err,fontSize:13,fontWeight:700,marginBottom:14,animation:`shake .36s ${EIO}`}}>{error}</div>}
      {/* Grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((d,i)=>(
          <button key={i} onClick={()=>d===""?null:d==="⌫"?del():tap(String(d))}
            style={{height:58,background:d===""?"transparent":"rgba(255,255,255,0.08)",border:d===""?"none":"1.5px solid rgba(255,255,255,0.15)",borderRadius:13,fontSize:d==="⌫"?18:22,fontWeight:600,color:"#fff",cursor:d===""?"default":"pointer",opacity:d===""?0:1,transition:"background .1s",display:"flex",alignItems:"center",justifyContent:"center"}}
            onMouseDown={e=>{if(d!=="")e.currentTarget.style.background="rgba(255,255,255,0.18)";}}
            onMouseUp={e=>{e.currentTarget.style.background=d===""?"transparent":"rgba(255,255,255,0.08)";}}>
            {d}
          </button>
        ))}
      </div>
      {/* Submit */}
      <button onClick={sub} style={{width:"100%",height:52,background:full?`linear-gradient(135deg,${T.sage},${T.sageDk})`:"rgba(255,255,255,0.07)",color:full?"#fff":"rgba(255,255,255,0.3)",border:"none",borderRadius:13,fontSize:16,fontWeight:700,cursor:"pointer",transition:`all .2s ${EO}`,boxShadow:full?`0 4px 16px ${T.sage}50`:"none"}}>
        {full?"→ Weiter":"PIN eingeben…"}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════
function AuthLoginScreen({onAuthSuccess}) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setErr("E-Mail und Passwort eingeben"); return; }
    setLoading(true); setErr(null);
    try {
      const session = await sbAuth.signIn(email.trim(), password.trim());
      sbAuth.setSession(session);
      onAuthSuccess(session);
    } catch(e) { setErr(e.message || "Login fehlgeschlagen"); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${T.brandDk} 0%,#1a0f0f 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"48px 28px"}}>
      <style>{CSS}</style>
      <div style={{marginBottom:32}}><Logo/></div>
      <div style={{color:T.sage,fontWeight:700,fontSize:22,fontFamily:"Georgia,serif",marginBottom:6,textAlign:"center"}}>Praxis-Software</div>
      <div style={{color:"rgba(255,255,255,0.4)",fontSize:14,marginBottom:40,textAlign:"center"}}>Bitte anmelden</div>
      <div style={{width:"100%",maxWidth:360,display:"flex",flexDirection:"column",gap:14}}>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="E-Mail" autoCapitalize="none"
          style={{background:"rgba(255,255,255,0.1)",border:"1.5px solid rgba(255,255,255,0.18)",borderRadius:14,padding:"15px 18px",fontSize:16,color:"#fff",fontFamily:"inherit",outline:"none",boxSizing:"border-box",width:"100%"}} />
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Passwort"
          onKeyDown={e=>{if(e.key==="Enter")handleLogin();}}
          style={{background:"rgba(255,255,255,0.1)",border:"1.5px solid rgba(255,255,255,0.18)",borderRadius:14,padding:"15px 18px",fontSize:16,color:"#fff",fontFamily:"inherit",outline:"none",boxSizing:"border-box",width:"100%"}} />
        {err&&<div style={{background:"rgba(220,38,38,0.2)",border:"1px solid rgba(220,38,38,0.4)",borderRadius:12,padding:"12px 16px",color:"#FCA5A5",fontSize:14,fontWeight:600}}>{err}</div>}
        <button onClick={handleLogin} disabled={loading}
          style={{background:loading?"rgba(122,158,142,0.5)":`linear-gradient(135deg,${T.sage},#5C7A6E)`,color:"#fff",border:"none",borderRadius:14,padding:"16px",fontSize:16,fontWeight:700,cursor:loading?"default":"pointer",width:"100%"}}>
          {loading?"Anmelden…":"Anmelden"}
        </button>
      </div>
    </div>
  );
}

function LoginScreen({onUnlock}) {
  const [err,setErr] = useState("");
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(160deg,${T.brandDk} 0%,#1a0f0f 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"48px 28px",fontFamily:"-apple-system,sans-serif"}}>
      <style>{CSS}</style>
      <div style={{marginBottom:40,animation:`scaleIn .5s ${EO}`}}><Logo/></div>
      <div style={{color:T.sage,fontWeight:700,fontSize:22,fontFamily:"Georgia,serif",marginBottom:6,textAlign:"center",animation:`slideDown .5s ${EO} .1s both`}}>Willkommen</div>
      <div style={{color:"rgba(255,255,255,0.4)",fontSize:14,marginBottom:44,textAlign:"center",animation:`slideDown .5s ${EO} .15s both`}}>Bitte PIN eingeben um fortzufahren</div>
      <div style={{width:"100%",animation:`slideUp .5s ${EO} .2s both`}}>
        <PinPad error={err} onSubmit={pin=>{
          if(pin===getPIN()){setErr("");onUnlock();}
          else{setErr("Falscher PIN");setTimeout(()=>setErr(""),2000);}
        }}/>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TOP NAVBAR
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// FIX PART 1: VERPASSTE NACHRICHTEN SYSTEM
// Vollständige Logik: Erkennung, Tracking, erzwungene Aufmerksamkeit
// ═══════════════════════════════════════════════════════════════

// ─── Verpasst-Logik ───────────────────────────────────────────
// Eine Nachricht gilt als "verpasst" wenn:
// - Sie nicht gelesen wurde (absender ≠ ich, mein Name ≠ gelesen_von)
// - Sie älter als MISSED_THRESHOLD_MS ist
const MISSED_THRESHOLD_MS = 3 * 60 * 1000; // 3 Minuten

function buildMissedState(msgs, myName) {
  const now = Date.now();
  const missed = [];
  const unread = [];
  msgs.forEach(m => {
    const absender = ss(m.absender);
    if (absender === myName) return; // eigene Nachrichten nie verpasst
    const seen = Array.isArray(m.gelesen_von) ? m.gelesen_von : [];
    if (seen.includes(myName)) return; // bereits gelesen
    const age = now - new Date(m.erstellt_am).getTime();
    if (age > MISSED_THRESHOLD_MS) {
      missed.push(m);
    } else {
      unread.push(m);
    }
  });
  return { missed, unread };
}

// ─── Sound-System (wiederholend bis gelesen) ───────────────────
let _alertSoundInterval = null;
let _alertSoundActive   = false;

function startAlertSound() {
  if (_alertSoundActive) return;
  _alertSoundActive = true;
  const doBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      // Doppel-Beep: eindringlich aber nicht nervig
      [0, 0.22].forEach(offset => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.setValueAtTime(880, ctx.currentTime + offset);
        g.gain.setValueAtTime(0.18, ctx.currentTime + offset);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.18);
        o.start(ctx.currentTime + offset);
        o.stop(ctx.currentTime + offset + 0.18);
      });
    } catch {}
  };
  doBeep();
  _alertSoundInterval = setInterval(doBeep, 8000); // alle 8 Sekunden
}

function stopAlertSound() {
  if (_alertSoundInterval) { clearInterval(_alertSoundInterval); _alertSoundInterval = null; }
  _alertSoundActive = false;
}

// ─── MissedBanner (STICKY, UNÜBERSEHBAR) ─────────────────────
function MissedBanner({ missedMsgs, auftraege, onOpenChat, onDismiss }) {
  const [blink, setBlink] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    // Pulsieren: alle 800ms umschalten
    const t = setInterval(() => setBlink(b => !b), 800);
    return () => clearInterval(t);
  }, []);

  if (!missedMsgs || missedMsgs.length === 0) return null;

  // Aggregiere nach Auftrag
  const byOrder = {};
  missedMsgs.forEach(m => {
    const aid = ss(m.auftrag_id);
    if (!byOrder[aid]) byOrder[aid] = { msgs: [], absender: new Set(), auftrag: auftraege?.find(a => a.id === aid) };
    byOrder[aid].msgs.push(m);
    if (m.absender) byOrder[aid].absender.add(ss(m.absender));
  });

  return (
    <div style={{
      position: "sticky", top: 58, zIndex: 900,
      background: blink ? T.err : "#C0392B",
      borderBottom: "3px solid #922B21",
      transition: "background 0.4s",
      boxShadow: "0 4px 20px rgba(212,117,106,0.5)",
    }}>
      {/* Header-Zeile */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
          cursor: "pointer",
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
          animation: `pulse 1s infinite`,
        }}>⚠</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>
            {missedMsgs.length} verpasste Nachricht{missedMsgs.length !== 1 ? "en" : ""} — Bitte sofort lesen!
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 }}>
            {Object.keys(byOrder).length} Auftrag{Object.keys(byOrder).length !== 1 ? "aufträge" : ""} betroffen
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700, background: "rgba(0,0,0,0.2)", borderRadius: 20, padding: "4px 10px" }}>
          {expanded ? "▲ Einklappen" : "▼ Anzeigen"}
        </div>
      </div>
      {/* Auftrags-Liste */}
      {expanded && (
        <div style={{ padding: "0 20px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.entries(byOrder).map(([aid, info]) => {
            const auftrag = info.auftrag;
            const lastMsg = info.msgs[info.msgs.length - 1];
            const absenderList = [...info.absender].join(", ");
            return (
              <div
                key={aid}
                onClick={() => { stopAlertSound(); onOpenChat(aid, auftrag); }}
                style={{
                  background: "rgba(255,255,255,0.15)", borderRadius: 12,
                  padding: "11px 14px", cursor: "pointer",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  display: "flex", alignItems: "center", gap: 12,
                  transition: `background 0.15s`,
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
              >
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {info.msgs.length}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {auftrag ? `${auftrag.patient} — ${auftrag.arbeitstyp}` : `Auftrag ${aid}`}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    Von: {absenderList} · {ss(lastMsg?.text).slice(0, 50)}{ss(lastMsg?.text).length > 50 ? "…" : ""}
                  </div>
                </div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 13, background: "rgba(0,0,0,0.25)", borderRadius: 9, padding: "5px 12px", flexShrink: 0, whiteSpace: "nowrap" }}>
                  Jetzt lesen →
                </div>
              </div>
            );
          })}
          {onDismiss && (
            <button
              onClick={e => { e.stopPropagation(); stopAlertSound(); onDismiss(); }}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.6)", borderRadius: 9, padding: "6px 14px", cursor: "pointer", fontSize: 11, alignSelf: "flex-end", fontFamily: "inherit" }}
            >
              Alle als gesehen markieren
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Verpasst-Overlay (blockierender Modal-Hinweis) ───────────
function MissedOverlay({ count, onGo, onLater }) {
  if (count === 0) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9500,
      background: "rgba(212,117,106,0.92)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, backdropFilter: "blur(4px)",
      animation: `fadeIn .3s ${EO}`,
    }}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: "40px 36px", maxWidth: 420,
        textAlign: "center", boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        animation: `scaleIn .3s ${ESP}`,
      }}>
        <div style={{ fontSize: 64, marginBottom: 16, animation: `pulse 1s infinite` }}>⚠️</div>
        <div style={{ fontWeight: 800, fontSize: 22, color: T.err, fontFamily: "Georgia,serif", marginBottom: 8 }}>
          Verpasste Nachrichten!
        </div>
        <div style={{ fontWeight: 600, fontSize: 36, color: T.err, fontFamily: "Georgia,serif", marginBottom: 10 }}>
          {count}
        </div>
        <div style={{ fontSize: 14, color: T.ch, marginBottom: 28, lineHeight: 1.6 }}>
          Es gibt ungelesene Nachrichten die warten. Bitte jetzt lesen — die Mitarbeiter warten auf Rückmeldung.
        </div>
        <button
          onClick={() => { stopAlertSound(); onGo(); }}
          style={{
            background: `linear-gradient(135deg,${T.err},#C0392B)`, color: "#fff",
            border: "none", borderRadius: 14, padding: "16px 36px",
            fontSize: 16, fontWeight: 800, cursor: "pointer", width: "100%",
            marginBottom: 10, boxShadow: `0 4px 20px ${T.err}60`,
          }}
        >
          Jetzt alle lesen →
        </button>
        <button
          onClick={onLater}
          style={{ background: "transparent", border: "none", color: T.gray, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
        >
          In 5 Minuten erinnern
        </button>
      </div>
    </div>
  );
}

// ─── Chat Übersicht (zentraler Chat-Tab) ──────────────────────
function ChatUebersicht({ auftraege, ungeleseneChats, chatPreview, missedMsgs, allRecentMsgs, userName, onOpenChat, dark }) {
  const bg    = dark ? T.dbg   : T.ivory;
  const card  = dark ? T.dcard : "#fff";
  const tc    = dark ? T.dtxt  : T.ch;
  const brd   = dark ? T.dbrd  : T.sand;

  // Aufträge mit Chat-Aktivität, sortiert: missed > unread > gelesen > aktivität
  const now = Date.now();

  const enriched = auftraege
    .filter(a => {
      const ug = (ungeleseneChats[a.id] || 0);
      const hasPrev = chatPreview[a.id];
      return ug > 0 || hasPrev;
    })
    .map(a => {
      const ug    = ungeleseneChats[a.id] || 0;
      const missed = (missedMsgs || []).filter(m => ss(m.auftrag_id) === a.id).length;
      const prev  = chatPreview[a.id] || "";
      const ts    = allRecentMsgs?.find(m => ss(m.auftrag_id) === a.id)?.erstellt_am || a.eingang || "";
      return { ...a, _ug: ug, _missed: missed, _prev: prev, _ts: ts };
    })
    .sort((a, b) => {
      // Missed first
      if (b._missed !== a._missed) return b._missed - a._missed;
      // Then unread
      if (b._ug    !== a._ug)    return b._ug    - a._ug;
      // Then by timestamp
      return new Date(b._ts) - new Date(a._ts);
    });

  const totalMissed = (missedMsgs || []).length;
  const totalUnread = Object.values(ungeleseneChats).reduce((s, n) => s + (n || 0), 0);

  return (
    <div style={{ background: bg, minHeight: "100%" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px 12px" }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: tc, fontFamily: "Georgia,serif", marginBottom: 8 }}>
          💬 Chat-Übersicht
        </div>
        {/* Badges */}
        <div style={{ display: "flex", gap: 8 }}>
          {totalMissed > 0 && (
            <div style={{ background: T.errLt, border: `1.5px solid ${T.err}`, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 800, color: T.err, display: "flex", alignItems: "center", gap: 6, animation: `pulse 1s infinite` }}>
              ⚠ {totalMissed} verpasst
            </div>
          )}
          {totalUnread > 0 && (
            <div style={{ background: T.warnLt, border: `1.5px solid ${T.warn}`, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, color: T.warn }}>
              💬 {totalUnread} ungelesen
            </div>
          )}
          {totalUnread === 0 && totalMissed === 0 && (
            <div style={{ background: T.okLt, border: `1.5px solid ${T.ok}`, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 700, color: T.ok }}>
              ✅ Alles gelesen
            </div>
          )}
        </div>
      </div>

      {/* Chat-Zeilen */}
      {enriched.length === 0 && (
        <EmptyState icon="💬" title="Noch keine Chats" sub="Öffne einen Auftrag und starte eine Konversation" dark={dark} />
      )}

      {enriched.map((a, i) => {
        const isMissed  = a._missed > 0;
        const isUnread  = a._ug > 0;
        const rowBg     = isMissed
          ? (dark ? "#2A0800" : T.errLt)
          : isUnread
            ? (dark ? "#1A1200" : "#FFFBEE")
            : card;
        const borderCol = isMissed ? T.err : isUnread ? T.warn : brd;

        return (
          <div
            key={a.id}
            onClick={() => onOpenChat(a.id, a)}
            style={{
              background: rowBg, borderBottom: `1px solid ${borderCol}`,
              borderLeft: `4px solid ${borderCol}`,
              padding: "14px 18px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12,
              transition: `background 0.1s`,
              animation: isMissed ? `pulse 2s infinite` : undefined,
            }}
            onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.97)"}
            onMouseLeave={e => e.currentTarget.style.filter = ""}
          >
            {/* Status-Kreis */}
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: isMissed ? T.err : isUnread ? T.warn : T.sand,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0, color: "#fff",
            }}>
              {isMissed ? "⚠" : isUnread ? "💬" : "✓"}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: isMissed ? T.err : tc, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {a.patient}
                </div>
                {isMissed && (
                  <div style={{ background: T.err, color: "#fff", borderRadius: 8, fontSize: 10, padding: "2px 7px", fontWeight: 800, flexShrink: 0 }}>
                    ⚠ {a._missed} verpasst
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11, color: T.gray, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {a.zahnarzt} · {a.arbeitstyp}
              </div>
              {a._prev && (
                <div style={{ fontSize: 12, color: isMissed ? T.err : isUnread ? T.warn : T.gray, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: isMissed || isUnread ? 600 : 400 }}>
                  {a._prev}
                </div>
              )}
            </div>

            {/* Badge */}
            {(isMissed || isUnread) && (
              <div style={{
                background: isMissed ? T.err : T.warn, color: "#fff",
                borderRadius: 12, fontSize: 12, padding: "4px 10px",
                fontWeight: 800, flexShrink: 0,
              }}>
                {isMissed ? a._missed : a._ug}
              </div>
            )}
            <div style={{ color: T.gray, fontSize: 16, flexShrink: 0 }}>›</div>
          </div>
        );
      })}
    </div>
  );
}


function GlobalSearch({aufträge,patienten,onSelect,onClose,dark}) {
  const [q,setQ] = useState("");
  const bg=dark?T.dcard:"#fff"; const tc=dark?T.dtxt:T.ch; const brd=dark?T.dbrd:T.sand;
  const results = q.length>1 ? aufträge.filter(a=>{
    const s=q.toLowerCase();
    return ss(a.patient).toLowerCase().includes(s)||ss(a.id).toLowerCase().includes(s)||ss(a.zahnarzt).toLowerCase().includes(s)||ss(a.arbeitstyp).toLowerCase().includes(s);
  }).slice(0,8) : [];
  return (
    <Modal onClose={onClose} width="min(600px,100vw)" dark={dark}>
      <div style={{padding:"16px 18px 8px",borderBottom:`1px solid ${brd}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:18,color:T.gray}}>🔍</span>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Patient, Zahnarzt, Auftrag-ID…"
            style={{flex:1,border:"none",outline:"none",fontSize:16,fontFamily:"inherit",background:"transparent",color:tc}}/>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:T.gray,cursor:"pointer",fontSize:18}}>✕</button>
        </div>
      </div>
      <div style={{overflowY:"auto",maxHeight:400,padding:"8px 0"}}>
        {results.length===0&&q.length>1&&<EmptyState icon="🔍" title="Keine Ergebnisse" sub={`Keine Aufträge für „${q}"`} dark={dark}/>}
        {results.length===0&&q.length<=1&&<div style={{padding:"24px 18px",color:T.gray,fontSize:13,textAlign:"center"}}>Suchbegriff eingeben…</div>}
        {results.map(a=>{const sm=getSM(a.status);const late=isLate(a);return(
          <div key={a.id} onClick={()=>{onSelect(a);onClose();}} style={{padding:"11px 18px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",borderBottom:`1px solid ${brd}`}}
            onMouseEnter={e=>e.currentTarget.style.background=dark?"rgba(255,255,255,0.04)":T.sageXlt}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{width:8,height:8,borderRadius:"50%",background:sm.color,flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,fontSize:14,color:late?T.err:tc,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.patient}</div>
              <div style={{fontSize:11,color:T.gray}}>{a.zahnarzt} · {a.arbeitstyp}</div>
            </div>
            <Badge color={sm.color} bg={sm.bg} size="sm">{sm.icon} {sm.label}</Badge>
            <span style={{fontSize:10,color:T.gray,fontFamily:"monospace"}}>{a.id}</span>
          </div>
        );})}
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// ORDERS MODULE — List, Kanban, Intake, Detail, Chat
// ═══════════════════════════════════════════════════════════════

// ─── Order Row (Tabellenzeile) ─────────────────────────────────
function OrderRow({a,onClick,zahnärzte,unread,chatPreview,dark}) {
  const sm=getSM(a.status); const late=isLate(a);
  const arztFarbe=zahnärzte.find(z=>z.name===a.zahnarzt)?.farbe||T.sage;
  const ug=(unread&&unread[a.id])||0;
  const bg=ug>0?(dark?"#1A1200":"#FFFBEE"):(late?(dark?"#2A1000":T.errLt):(dark?undefined:undefined));
  const tc=dark?T.dtxt:T.ch;
  return (
    <tr className="hover-row" onClick={onClick} style={{borderBottom:`1px solid ${dark?T.dbrd:T.sand}`,cursor:"pointer",borderLeft:`3px solid ${ug>0?T.warn:arztFarbe}`,background:bg,transition:"background .1s"}}>
      <td style={{padding:"10px 14px",fontFamily:"monospace",color:T.sage,fontSize:10}}>{a.id}</td>
      <td style={{padding:"10px 14px"}}>
        <div style={{fontWeight:700,color:late?T.err:tc,marginBottom:ug>0?2:0}}>{a.patient}</div>
        {ug>0&&chatPreview?.[a.id]&&<div style={{fontSize:10,color:T.warn,fontWeight:600,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>💬 {chatPreview[a.id]}</div>}
      </td>
      <td style={{padding:"10px 14px",color:arztFarbe,fontWeight:600,fontSize:13}}>{a.zahnarzt}</td>
      <td style={{padding:"10px 14px",color:tc,fontSize:13}}>{a.arbeitstyp}{a.zahn?` · ${a.zahn}`:""}</td>
      <td style={{padding:"10px 14px",color:T.gray,fontSize:12}}>{fmtDate(a.eingang)}</td>
      <td style={{padding:"10px 14px",color:late?T.err:T.gray,fontWeight:late?700:400,fontSize:12}}>{fmtDate(a.faelligkeit)}{late?" ⚠":""}</td>
      <td style={{padding:"10px 14px"}}>
        <StatusBadge status={a.status} compact onChange={s=>null /* handled by detail */}/>
      </td>
      <td style={{padding:"10px 14px",color:a.prioritaet==="Dringend"?T.err:T.gray,fontWeight:a.prioritaet==="Dringend"?700:400,fontSize:12}}>
        {a.prioritaet==="Dringend"?"⚡ Dringend":"Normal"}
      </td>
      <td style={{padding:"10px 12px"}}>
        {ug>0&&<span style={{background:T.warn,color:"#fff",borderRadius:10,fontSize:10,padding:"2px 7px",fontWeight:800,animation:`ringPop .3s ${ESP}`}}>💬 {ug}</span>}
      </td>
    </tr>
  );
}

// ─── Kanban Column ────────────────────────────────────────────
function KanbanCol({status,orders,onClick,dark}) {
  const sm=getSM(status);
  const bg=dark?T.dcard:"#fff"; const tc=dark?T.dtxt:T.ch; const brd=dark?T.dbrd:T.sand;
  return (
    <div style={{flex:"0 0 220px",display:"flex",flexDirection:"column",gap:8}}>
      <div style={{background:sm.bg,borderRadius:10,padding:"7px 12px",display:"flex",alignItems:"center",gap:7,flexShrink:0,border:`1.5px solid ${sm.color}30`}}>
        <span style={{fontSize:16}}>{sm.icon}</span>
        <span style={{fontWeight:700,fontSize:12,color:sm.color}}>{sm.label}</span>
        <span style={{marginLeft:"auto",background:sm.color,color:"#fff",borderRadius:10,fontSize:10,padding:"1px 7px",fontWeight:700}}>{orders.length}</span>
      </div>
      {orders.map(a=>{
        const late=isLate(a);
        return(
          <div key={a.id} onClick={()=>onClick(a)} style={{background:bg,borderRadius:12,padding:"11px 13px",border:`1px solid ${late?T.err:brd}`,cursor:"pointer",boxShadow:"0 1px 4px rgba(44,40,37,0.06)",transition:`transform .12s ${EO}`,animation:`slideUp .2s ${EO} both`}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 14px rgba(44,40,37,0.12)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 1px 4px rgba(44,40,37,0.06)";}}>
            <div style={{fontWeight:700,fontSize:13,color:late?T.err:tc,marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.patient}</div>
            <div style={{fontSize:11,color:T.gray,marginBottom:6,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.zahnarzt} · {a.arbeitstyp}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              {a.prioritaet==="Dringend"&&<span style={{fontSize:10,color:T.err,fontWeight:700}}>⚡ Dringend</span>}
              {a.faelligkeit&&<span style={{fontSize:10,color:late?T.err:T.gray,marginLeft:"auto"}}>{fmtDate(a.faelligkeit)}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Fälligkeitskalender ──────────────────────────────────────
function FaelligkeitModal({aufträge,onSelect,onClose,dark}) {
  const bg=dark?T.dcard:"#fff"; const tc=dark?T.dtxt:T.ch;
  const sorted=aufträge.filter(a=>a.faelligkeit&&!["Eingesetzt","Archiviert"].includes(a.status)).sort((a,b)=>new Date(a.faelligkeit)-new Date(b.faelligkeit));
  const td=today();
  return (
    <Modal onClose={onClose} dark={dark}>
      <ModalHeader title="📅 Fälligkeitskalender" onClose={onClose} dark={dark}/>
      <div style={{overflowY:"auto",flex:1,maxHeight:500,padding:"12px 16px"}}>
        {sorted.length===0&&<EmptyState icon="📅" title="Keine Fälligkeiten" sub="Alle aktiven Aufträge haben kein Fälligkeitsdatum." dark={dark}/>}
        {sorted.map(a=>{
          const late=a.faelligkeit<td; const sm=getSM(a.status);
          return(
            <div key={a.id} onClick={()=>{onSelect(a);onClose();}} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:`1px solid ${dark?T.dbrd:T.sand}`,cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.background=dark?"rgba(255,255,255,0.03)":T.sageXlt}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{width:46,height:46,borderRadius:12,background:late?T.errLt:T.sageLt,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,border:`1px solid ${late?T.err:T.sage}30`}}>
                <div style={{fontSize:16,fontWeight:800,color:late?T.err:T.sage,fontFamily:"Georgia,serif",lineHeight:1}}>{new Date(a.faelligkeit+"T12:00:00").getDate()}</div>
                <div style={{fontSize:9,color:T.gray}}>{new Date(a.faelligkeit+"T12:00:00").toLocaleDateString("de-DE",{month:"short"})}</div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,color:late?T.err:tc,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.patient}</div>
                <div style={{fontSize:11,color:T.gray}}>{a.zahnarzt} · {a.arbeitstyp}</div>
              </div>
              <Badge color={sm.color} bg={sm.bg} size="sm">{sm.icon} {sm.label}</Badge>
              {late&&<span style={{fontSize:10,color:T.err,fontWeight:700}}>⚠ Überfällig</span>}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

// ─── New Order Intake (3-Step Wizard) ─────────────────────────
function IntakeModal({patienten,zahnärzte,onSave,onClose,prefill,dark}) {
  const [step,setStep] = useState(prefill?"details":"choose");
  const [form,setForm] = useState({patient:prefill?.patient||"",zahnarzt:prefill?.zahnarzt||zahnärzte[0]?.name||"",arbeitstyp:ARBEITSTYPEN[0],zahn:"",labor:"Eigenlabor",laborName:"",faelligkeit:addDays(14),prioritaet:"Normal",anweisungen:"",geburtsdatum:"",farbe:""});
  const [saving,setSaving] = useState(false); const [saved,setSaved] = useState(null);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const bg=dark?T.dcard:"#fff"; const tc=dark?T.dtxt:T.ch; const brd=dark?T.dbrd:T.sand;
  const handleSave=async()=>{
    if(saving) return; setSaving(true);
    try {
      const a={id:genId(),eingang:today(),status:"Eingang",fotos:"[]",verlauf:JSON.stringify([{datum:today(),status:"Eingang",notiz:""}]),...form,created_at:new Date().toISOString()};
      if(isConf()) await ordersService.insert(a);
      onSave(a); setSaved(a); setStep("qr");
    } catch(e){Monitor.error(e);} finally{setSaving(false);}
  };
  const STEPS=[{n:1,l:"Patient"},{n:2,l:"Details"},{n:3,l:"QR"}];
  const stepNum=step==="details"?2:step==="qr"?3:1;

  return(
    <Modal onClose={onClose} dark={dark} width="min(580px,100vw)" maxH="94vh">
      {/* Header with steps */}
      <div style={{background:`linear-gradient(135deg,${T.brandDk},${T.brandMd})`,padding:"16px 20px",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:stepNum>1?12:0}}>
          <div style={{color:T.sage,fontWeight:700,fontSize:16,fontFamily:"Georgia,serif"}}>＋ Neuer Auftrag</div>
          {step!=="qr"&&<button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(255,255,255,0.7)",borderRadius:8,width:28,height:28,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>}
        </div>
        {stepNum>1&&(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {STEPS.map((s,i)=>(
              <div key={s.n} style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:stepNum>=s.n?T.sage:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:stepNum>=s.n?"#fff":"rgba(255,255,255,0.4)"}}>
                  {stepNum>s.n?"✓":s.n}
                </div>
                <span style={{color:stepNum>=s.n?T.sageLt:"rgba(255,255,255,0.35)",fontSize:11,fontWeight:stepNum===s.n?700:400}}>{s.l}</span>
                {i<2&&<div style={{width:20,height:2,background:stepNum>s.n?T.sage:"rgba(255,255,255,0.15)",borderRadius:1}}/>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{overflowY:"auto",flex:1,padding:"20px"}}>
        {/* STEP: choose */}
        {step==="choose"&&(
          <>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontWeight:700,fontSize:17,color:tc,fontFamily:"Georgia,serif",marginBottom:4}}>Wie soll der Patient eingegeben werden?</div>
            </div>
            {[
              {icon:"👥",title:"Aus Stammdatei wählen",sub:"Bestehenden Patienten auswählen",action:()=>setStep("patient-select")},
              {icon:"⌨️",title:"Manuell eingeben",sub:"Patient direkt eintippen",action:()=>setStep("patient-manual")},
            ].map(o=>(
              <div key={o.title} onClick={o.action} style={{display:"flex",alignItems:"center",gap:14,padding:"16px",background:dark?T.dbg:T.ivory,border:`1.5px solid ${dark?T.dbrd:T.sand}`,borderRadius:14,cursor:"pointer",marginBottom:10,transition:"border-color .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.sage;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=dark?T.dbrd:T.sand;}}>
                <div style={{width:48,height:48,background:`linear-gradient(135deg,${T.sage},${T.sageDk})`,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{o.icon}</div>
                <div><div style={{color:tc,fontWeight:700,fontSize:15,marginBottom:2}}>{o.title}</div><div style={{color:T.gray,fontSize:12}}>{o.sub}</div></div>
              </div>
            ))}
          </>
        )}

        {/* STEP: patient-select */}
        {step==="patient-select"&&(
          <>
            <div style={{fontWeight:700,fontSize:16,color:tc,marginBottom:14,fontFamily:"Georgia,serif"}}>Patient auswählen</div>
            {patienten.length===0&&<div style={{color:T.gray,fontSize:13,padding:"20px 0"}}>Noch keine Patienten in der Datenbank.</div>}
            <div style={{maxHeight:300,overflowY:"auto"}}>
              {patienten.map(p=>(
                <div key={p.id} onClick={()=>{set("patient",p.name);if(p.zahnarzt)set("zahnarzt",p.zahnarzt);setStep("details");}}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",border:`1px solid ${brd}`,borderRadius:12,cursor:"pointer",marginBottom:7,background:dark?T.dbg:"#fff"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=T.sage}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=brd}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:T.sageLt,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>👤</div>
                  <div style={{flex:1}}><div style={{fontWeight:700,color:tc,fontSize:14}}>{p.name}</div>{p.telefon&&<div style={{color:T.gray,fontSize:11}}>{p.telefon}</div>}</div>
                  <span style={{color:T.sage}}>›</span>
                </div>
              ))}
            </div>
            <div style={{marginTop:8}}><button onClick={()=>setStep("choose")} style={{background:"transparent",border:"none",color:T.gray,cursor:"pointer",fontSize:12}}>← Zurück</button></div>
          </>
        )}

        {/* STEP: patient-manual */}
        {step==="patient-manual"&&(
          <>
            <div style={{fontWeight:700,fontSize:16,color:tc,marginBottom:14,fontFamily:"Georgia,serif"}}>Patient eingeben</div>
            <div style={{marginBottom:12}}>
              <SectionLabel>Name des Patienten</SectionLabel>
              <Input value={form.patient} onChange={e=>set("patient",e.target.value)} placeholder="Vorname Nachname" dark={dark} autoFocus/>
            </div>
            <div style={{marginBottom:16}}>
              <SectionLabel>Zahnarzt/Ärztin</SectionLabel>
              <Select value={form.zahnarzt} onChange={e=>set("zahnarzt",e.target.value)} dark={dark}>
                <option value="">— Zahnarzt wählen —</option>
                {zahnärzte.map(z=><option key={z.id} value={z.name}>{z.name}</option>)}
              </Select>
            </div>
            <div style={{display:"flex",gap:10}}>
              <Btn variant="ghost" onClick={()=>setStep("choose")}>← Zurück</Btn>
              <Btn variant="primary" disabled={!form.patient.trim()||!form.zahnarzt} onClick={()=>setStep("details")} style={{flex:1}}>Weiter →</Btn>
            </div>
          </>
        )}

        {/* STEP: details */}
        {step==="details"&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div>
                <SectionLabel>Patient</SectionLabel>
                <div style={{fontWeight:700,color:tc,fontSize:14,padding:"9px 0"}}>{form.patient}</div>
              </div>
              <div>
                <SectionLabel>Zahnarzt/Ärztin</SectionLabel>
                <Select value={form.zahnarzt} onChange={e=>set("zahnarzt",e.target.value)} dark={dark}>
                  {zahnärzte.map(z=><option key={z.id} value={z.name}>{z.name}</option>)}
                </Select>
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <SectionLabel>Arbeitstyp *</SectionLabel>
              <Select value={form.arbeitstyp} onChange={e=>set("arbeitstyp",e.target.value)} dark={dark}>
                {ARBEITSTYPEN.map(t=><option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div>
                <SectionLabel>Zahn-Nummer</SectionLabel>
                <Input value={form.zahn} onChange={e=>set("zahn",e.target.value)} placeholder="z. B. 36" dark={dark}/>
              </div>
              <div>
                <SectionLabel>Fälligkeit *</SectionLabel>
                <Input type="date" value={form.faelligkeit} onChange={e=>set("faelligkeit",e.target.value)} dark={dark}/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div>
                <SectionLabel>Geburtsdatum</SectionLabel>
                <Input type="date" value={form.geburtsdatum} onChange={e=>set("geburtsdatum",e.target.value)} dark={dark}/>
              </div>
              <div>
                <SectionLabel>Farbe / Shade</SectionLabel>
                <Input value={form.farbe} onChange={e=>set("farbe",e.target.value)} placeholder="z. B. A2, BL2" dark={dark}/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div>
                <SectionLabel>Labor</SectionLabel>
                <Select value={form.labor} onChange={e=>set("labor",e.target.value)} dark={dark}>
                  <option>Eigenlabor</option><option>Extern</option>
                </Select>
              </div>
              <div>
                <SectionLabel>Priorität</SectionLabel>
                <Select value={form.prioritaet} onChange={e=>set("prioritaet",e.target.value)} dark={dark}>
                  <option>Normal</option><option>Dringend</option>
                </Select>
              </div>
            </div>
            {form.labor==="Extern"&&<div style={{marginBottom:12}}>
              <SectionLabel>Labor Name</SectionLabel>
              <Input value={form.laborName} onChange={e=>set("laborName",e.target.value)} placeholder="Externes Labor GmbH" dark={dark}/>
            </div>}
            <div style={{marginBottom:16}}>
              <SectionLabel>Anweisungen</SectionLabel>
              <Textarea value={form.anweisungen} onChange={e=>set("anweisungen",e.target.value)} placeholder="Anweisungen für den Techniker…" rows={3} dark={dark}/>
            </div>
            <Btn variant="primary" loading={saving} disabled={!form.arbeitstyp||!form.faelligkeit} onClick={handleSave} style={{width:"100%",justifyContent:"center",padding:"14px"}}>
              Auftrag speichern
            </Btn>
          </>
        )}

        {/* STEP: qr */}
        {step==="qr"&&saved&&(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:52,marginBottom:12,animation:`ringPop .5s ${ESP}`}}>✅</div>
            <div style={{fontWeight:700,fontSize:20,color:tc,fontFamily:"Georgia,serif",marginBottom:6}}>Auftrag angelegt!</div>
            <div style={{color:T.gray,fontSize:13,marginBottom:20}}>ID: {saved.id} · Patient: {saved.patient}</div>
            <div style={{background:dark?T.dbg:T.ivory,borderRadius:14,padding:"20px",border:`1px solid ${dark?T.dbrd:T.sand}`,marginBottom:20,display:"inline-block"}}>
              <div style={{fontSize:11,color:T.gray,marginBottom:8,textTransform:"uppercase",letterSpacing:"1px"}}>QR-Code</div>
              <div style={{width:120,height:120,background:T.sand,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:T.gray,margin:"0 auto"}}>QR: {saved.id}</div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <Btn variant="primary" onClick={onClose}>Fertig</Btn>
              <Btn variant="secondary" onClick={()=>{setStep("choose");setSaved(null);setForm({patient:"",zahnarzt:zahnärzte[0]?.name||"",arbeitstyp:ARBEITSTYPEN[0],zahn:"",labor:"Eigenlabor",laborName:"",faelligkeit:addDays(14),prioritaet:"Normal",anweisungen:""});}}>Weiterer Auftrag</Btn>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Chat Panel ───────────────────────────────────────────────
function ChatPanel({auftrag,userName,onClose,dark}) {
  const [msgs,setMsgs] = useState([]); const [text,setText] = useState(""); const [sending,setSending] = useState(false);
  const [firstUnreadIdx,setFirstUnreadIdx] = useState(-1);
  const bottomRef=useRef(null); const unreadRef=useRef(null); const scrolled=useRef(false);
  const bg=dark?T.dbg:T.ivory; const card=dark?T.dcard:"#fff"; const tc=dark?T.dtxt:T.ch; const brd=dark?T.dbrd:T.sand;

  const load = useCallback(async()=>{
    if(!isConf()) return;
    try {
      const d = await chatService.getByOrder(auftrag.id);
      const arr = Array.isArray(d)?d:[];
      const fu = arr.findIndex(m=>ss(m.absender)!==userName&&!(Array.isArray(m.gelesen_von)?m.gelesen_von:[]).includes(userName));
      if(fu>=0&&!scrolled.current) setFirstUnreadIdx(fu);
      setMsgs(arr);
      for(const m of arr){
        const seen=Array.isArray(m.gelesen_von)?m.gelesen_von:[];
        if(ss(m.absender)!==userName&&!seen.includes(userName)){
          try{await chatService.markRead(ss(m.id),{gelesen_von:[...seen,userName]});}catch{}
        }
      }
    } catch {}
  },[auftrag.id,userName]);

  useEffect(()=>{load();},[load]);
  useEffect(()=>{const i=setInterval(load,8000);return()=>clearInterval(i);},[load]);
  useEffect(()=>{
    if(!scrolled.current&&firstUnreadIdx>=0&&unreadRef.current){
      unreadRef.current.scrollIntoView({behavior:"smooth",block:"start"});
      scrolled.current=true;
    } else { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }
  },[msgs,firstUnreadIdx]);

  const send=async()=>{
    if(!text.trim()||sending) return; setSending(true);
    const msg={id:"MSG-"+Date.now().toString(36).toUpperCase(),auftrag_id:auftrag.id,absender:userName||"Praxis",text:text.trim(),foto_url:null,erstellt_am:new Date().toISOString(),gelesen_von:[userName||"Praxis"]};
    if(isConf()){try{await chatService.insert(msg);await load();}catch{}}else setMsgs(p=>[...p,msg]);
    setText(""); setSending(false);
  };

  return(
    <SidePanel onClose={onClose} dark={dark}>
      <div style={{background:`linear-gradient(135deg,${T.brandDk},${T.brandMd})`,padding:"14px 18px",display:"flex",gap:12,alignItems:"center",flexShrink:0}}>
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(255,255,255,0.7)",borderRadius:8,padding:"6px 11px",cursor:"pointer",fontSize:13}}>‹</button>
        <div style={{flex:1}}><div style={{color:T.sage,fontWeight:700,fontSize:14}}>💬 Chat</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:11,marginTop:1}}>{auftrag.patient} · {auftrag.arbeitstyp}</div></div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{msgs.length} Nachrichten</div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:8,background:bg}}>
        {msgs.length===0&&<div style={{textAlign:"center",padding:"48px 20px",color:T.gray}}><div style={{fontSize:36,marginBottom:10}}>💬</div>Noch keine Nachrichten</div>}
        {msgs.map((m,i)=>{
          const ich=ss(m.absender)===userName;
          const seen=Array.isArray(m.gelesen_von)?m.gelesen_von:[];
          const isUnread=!ich&&!seen.includes(userName);
          const showSep=i===firstUnreadIdx&&firstUnreadIdx>=0;
          return(
            <React.Fragment key={ss(m.id)||i}>
              {showSep&&<div ref={unreadRef} style={{display:"flex",alignItems:"center",gap:8,margin:"4px 0"}}>
                <div style={{flex:1,height:1,background:`linear-gradient(90deg,transparent,${T.sage})`}}/>
                <div style={{fontSize:10,color:T.sage,fontWeight:700,padding:"2px 10px",background:T.sageLt,borderRadius:10,whiteSpace:"nowrap"}}>↑ Neue Nachrichten</div>
                <div style={{flex:1,height:1,background:`linear-gradient(90deg,${T.sage},transparent)`}}/>
              </div>}
              <div style={{display:"flex",justifyContent:ich?"flex-end":"flex-start",animation:isUnread?`msgIn .3s ${EO} both`:"none"}}>
                <div style={{maxWidth:"80%"}}>
                  <div style={{fontSize:10,color:T.gray,marginBottom:3,textAlign:ich?"right":"left"}}>{ss(m.absender)} · {fmtTime(m.erstellt_am)}</div>
                  <div style={{background:ich?`linear-gradient(135deg,${T.brandDk},${T.brandMd})`:card,color:ich?T.sage:tc,borderRadius:ich?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"10px 13px",fontSize:13,lineHeight:1.6,boxShadow:isUnread?`0 0 0 2px ${T.sage}40`:"0 1px 3px rgba(44,40,37,0.08)",border:isUnread&&!ich?`1.5px solid ${T.sage}50`:"none"}}>
                    {m.foto_url&&<img src={ss(m.foto_url)} alt="" style={{width:"100%",maxWidth:220,borderRadius:10,display:"block",marginBottom:m.text?6:0}} loading="lazy"/>}
                    {m.text&&<div>{m.text}</div>}
                  </div>
                  {ich&&<div style={{textAlign:"right",fontSize:9,marginTop:2,color:seen.length>1?T.blue:T.gray}}>{seen.length>1?"✓✓ Gelesen":"✓ Gesendet"}</div>}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"10px 12px",background:card,borderTop:`1px solid ${brd}`,display:"flex",gap:8,flexShrink:0}}>
        <textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Nachricht eingeben… (Enter sendet)" rows={2}
          style={{flex:1,padding:"10px 13px",border:`1.5px solid ${brd}`,borderRadius:12,fontSize:14,fontFamily:"inherit",outline:"none",resize:"none",background:bg,color:tc,lineHeight:1.5,maxHeight:100,overflowY:"auto"}}
          onFocus={e=>{e.target.style.borderColor=T.sage;}} onBlur={e=>{e.target.style.borderColor=brd;}}/>
        <button onClick={send} disabled={sending||!text.trim()} style={{background:(sending||!text.trim())?T.sand:`linear-gradient(135deg,${T.sage},${T.sageDk})`,color:(sending||!text.trim())?T.gray:"#fff",border:"none",borderRadius:12,width:42,height:42,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",alignSelf:"flex-end",flexShrink:0,fontSize:18}}>
          {sending?<Spinner size={14} color="#fff"/>:"➤"}
        </button>
      </div>
    </SidePanel>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────
function DetailPanel({auftrag,userName,zahnärzte,unread,onStatusChange,onDuplicate,onClose,onSmsSend,onEmailSend,onShowBelege,dark}) {
  const a=auftrag; const [showChat,setShowChat]=useState(false); const [showAnw,setShowAnw]=useState(false);
  const [showFoto,setShowFoto]=useState(false); const [tips,setTips]=useState([]); const [loadTips,setLoadTips]=useState(false);
  const [anw,setAnw]=useState(a.anweisungen||""); const [anwSaving,setAnwSaving]=useState(false);
  const [dpLbIdx,setDpLbIdx]=useState(null); const [dpLbZoom,setDpLbZoom]=useState(1);
  const sm=getSM(a.status); const late=isLate(a); const verlauf=getV(a); const fotos=getFotos(a);
  const ug=(unread&&unread[a.id])||0;
  const bg=dark?T.dbg:T.ivory; const card=dark?T.dcard:"#fff"; const tc=dark?T.dtxt:T.ch; const brd=dark?T.dbrd:T.sand;

  const fetchTips=async()=>{setLoadTips(true);const t=await getAiTips(a.arbeitstyp,a.zahn);setTips(t);setLoadTips(false);};
  const saveAnw=async()=>{
    setAnwSaving(true);
    if(isConf()) try{await ordersService.update(a.id,{anweisungen:anw});}catch{}
    setAnwSaving(false); setShowAnw(false);
  };
  const uploadFile=async(file,onProg)=>{if(!file)return;const url=await uploadFoto(a.id,file,onProg);const nf=JSON.stringify([...fotos,url]);if(isConf())await ordersService.update(a.id,{fotos:nf});return nf;};

  const ACTIONS=[
    {icon:"💬",label:ug>0?`Chat (${ug})`:"Chat",  fn:()=>setShowChat(true),badge:ug>0},
    {icon:"📋",label:"Anweisungen",                 fn:()=>setShowAnw(true)},
    {icon:"📷",label:fotos.length>0?`Fotos (${fotos.length})`:"Fotos", fn:()=>setShowFoto(true)},
    {icon:"📱",label:"SMS",                          fn:()=>onSmsSend(a)},
    {icon:"📧",label:"E-Mail",                       fn:()=>onEmailSend(a)},
    {icon:"📄",label:"Beleg",                        fn:()=>onShowBelege(a)},
    {icon:"⎘",label:"Duplizieren",                  fn:()=>onDuplicate(a)},
    {icon:"🖨",label:"Drucken",                      fn:()=>{const w=window.open("","_blank");w.document.write(`<html><body style="font-family:Georgia,serif;padding:32px"><h2>${a.patient}</h2><p>ID: ${a.id}</p><p>Zahnarzt: ${a.zahnarzt}</p><p>Arbeitstyp: ${a.arbeitstyp}</p><p>Status: ${a.status}</p><p>Fälligkeit: ${fmtDate(a.faelligkeit)}</p>${a.anweisungen?`<p>Anweisungen: ${a.anweisungen}</p>`:""}</body></html>`);w.print();}},
  ];

  return(
    <>
      <SidePanel onClose={onClose} width="min(620px,100vw)" dark={dark}>
        <div style={{background:`linear-gradient(135deg,${T.brandDk},${T.brandMd})`,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(255,255,255,0.7)",borderRadius:8,padding:"6px 11px",cursor:"pointer",fontSize:13}}>‹</button>
          <div style={{flex:1,minWidth:0}}>
            <div style={{color:T.sage,fontWeight:700,fontSize:17,fontFamily:"Georgia,serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.patient}</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:11,marginTop:1}}>{a.zahnarzt} · {a.arbeitstyp}{a.zahn?` · Zahn ${a.zahn}`:""}</div>
          </div>
          <span style={{color:"rgba(255,255,255,0.3)",fontSize:10,fontFamily:"monospace"}}>{a.id}</span>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 16px 32px",background:bg}}>
          {/* Status */}
          <Card dark={dark} style={{marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <StatusBadge status={a.status} onChange={s=>onStatusChange(a.id,s)}/>
              <div style={{display:"flex",gap:6}}>
                {a.prioritaet==="Dringend"&&<Badge color={T.err} bg={T.errLt} size="sm">⚡ Dringend</Badge>}
                {late&&<Badge color={T.err} bg={T.errLt} size="sm">⚠ Überfällig</Badge>}
              </div>
            </div>
            <ProgressDots status={a.status}/>
          </Card>
          {/* Action buttons */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
            {ACTIONS.map(btn=>(
              <button key={btn.icon} onClick={btn.fn} style={{background:btn.badge?T.warn:(dark?T.dcard:"#fff"),border:`1.5px solid ${btn.badge?T.warn:(dark?T.dbrd:T.sand)}`,borderRadius:12,padding:"11px 6px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:5,transition:`all .12s ${EO}`}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=T.sage;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=btn.badge?T.warn:(dark?T.dbrd:T.sand);}}>
                <span style={{fontSize:20}}>{btn.icon}</span>
                <span style={{fontSize:10,fontWeight:700,color:btn.badge?"#fff":tc,textAlign:"center",lineHeight:1.2}}>{btn.label}</span>
              </button>
            ))}
          </div>
          {/* Info grid */}
          <Card dark={dark} style={{marginBottom:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["Eingang",fmtDate(a.eingang)],["Fälligkeit",fmtDate(a.faelligkeit)],["Labor",a.labor+(a.laborName?` (${a.laborName})`:"")||"—"],["Zahnarzt",a.zahnarzt||"—"],...(a.geburtsdatum?[["Geburtsdatum",fmtDate(a.geburtsdatum)]]:[]),...(a.farbe?[["Farbe",a.farbe]]:[]) ].map(([l,v])=>(
                <div key={l}>
                  <div style={{fontSize:9,color:T.gray,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:3}}>{l}</div>
                  <div style={{fontSize:13,fontWeight:600,color:tc}}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
          {/* Anweisungen */}
          {a.anweisungen&&<Card dark={dark} style={{marginBottom:12}}>
            <SectionLabel>Anweisungen</SectionLabel>
            <div style={{fontSize:13,color:tc,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{a.anweisungen}</div>
          </Card>}
          {/* Fotos */}
          {fotos.length>0&&<Card dark={dark} style={{marginBottom:12}}>
            <SectionLabel>Fotos ({fotos.length})</SectionLabel>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {fotos.map((path,i)=>{
                const [s,ss_]=useState(null);
                useEffect(()=>{let c=false;getPhotoUrl(path).then(u=>{if(!c)ss_(u);});return()=>{c=true;};},[ path]);
                return s?<img key={i} src={s} alt="" onClick={()=>{setDpLbIdx(i);setDpLbZoom(1);}} style={{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:10,border:`1px solid ${brd}`,cursor:"zoom-in"}} />:<div key={i} style={{width:"100%",aspectRatio:"1",background:brd,borderRadius:10}} />;
              })}
            </div>
          </Card>}
          {dpLbIdx!==null&&(
            <div onClick={()=>{setDpLbIdx(null);setDpLbZoom(1);}} style={{position:"fixed",inset:0,zIndex:9000,background:"rgba(0,0,0,0.92)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{position:"absolute",top:16,right:20,display:"flex",gap:10,zIndex:9001}}>
                <button onClick={e=>{e.stopPropagation();setDpLbZoom(z=>Math.min(z+0.25,4));}} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",borderRadius:8,width:38,height:38,fontSize:20,cursor:"pointer"}}>＋</button>
                <button onClick={e=>{e.stopPropagation();setDpLbZoom(z=>Math.max(z-0.25,1));}} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",borderRadius:8,width:38,height:38,fontSize:20,cursor:"pointer"}}>－</button>
                <button onClick={e=>{e.stopPropagation();setDpLbZoom(1);}} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",borderRadius:8,width:38,height:38,fontSize:16,cursor:"pointer"}}>1:1</button>
                <button onClick={e=>{e.stopPropagation();setDpLbIdx(i=>i>0?i-1:fotos.length-1);setDpLbZoom(1);}} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",borderRadius:8,width:38,height:38,fontSize:20,cursor:"pointer"}}>‹</button>
                <button onClick={e=>{e.stopPropagation();setDpLbIdx(i=>i<fotos.length-1?i+1:0);setDpLbZoom(1);}} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",borderRadius:8,width:38,height:38,fontSize:20,cursor:"pointer"}}>›</button>
                <button onClick={e=>{e.stopPropagation();setDpLbIdx(null);setDpLbZoom(1);}} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",borderRadius:8,width:38,height:38,fontSize:18,cursor:"pointer"}}>✕</button>
              </div>
              <div onClick={e=>e.stopPropagation()} style={{overflow:"auto",maxWidth:"90vw",maxHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <img src={fotos[dpLbIdx]} alt="" style={{transform:`scale(${dpLbZoom})`,transformOrigin:"center",transition:"transform .15s",maxWidth:"90vw",maxHeight:"80vh",objectFit:"contain",borderRadius:8}} onClick={e=>e.stopPropagation()}/>
              </div>
              <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginTop:14}}>{dpLbIdx+1} / {fotos.length} · Zoom {Math.round(dpLbZoom*100)}%</div>
            </div>
          )}
          {/* Timeline */}
          {verlauf.length>0&&<Card dark={dark}>
            <SectionLabel>Verlauf</SectionLabel>
            {verlauf.slice().reverse().map((v,i)=>{const vsm=getSM(v.status);return(
              <div key={i} style={{display:"flex",gap:12,marginBottom:i<verlauf.length-1?10:0,alignItems:"flex-start"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:vsm.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{vsm.icon}</div>
                  {i<verlauf.length-1&&<div style={{width:2,flex:1,background:brd,margin:"4px auto",minHeight:12}}/>}
                </div>
                <div style={{paddingTop:4}}>
                  <div style={{fontWeight:600,fontSize:13,color:tc}}>{vsm.label}</div>
                  <div style={{fontSize:11,color:T.gray,marginTop:2}}>{fmtDate(v.datum)}{v.notiz?` — ${v.notiz}`:""}</div>
                </div>
              </div>
            );})}
          </Card>}
        </div>
      </SidePanel>
      {showChat&&<ChatPanel auftrag={a} userName={userName} onClose={()=>setShowChat(false)} dark={dark}/>}
      {showAnw&&(
        <Modal onClose={()=>setShowAnw(false)} dark={dark}>
          <ModalHeader title="📋 Anweisungen" onClose={()=>setShowAnw(false)} subtitle={a.patient} dark={dark}/>
          <div style={{padding:"16px",flex:1,overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <SectionLabel>Text</SectionLabel>
              <Btn variant="ghost" size="sm" loading={loadTips} icon="✨" onClick={fetchTips}>KI-Vorschläge</Btn>
            </div>
            {tips.length>0&&<div style={{marginBottom:10}}>
              {tips.map((t,i)=>(
                <div key={i} onClick={()=>setAnw(a=>(a?a+"\n":"")+t)} style={{padding:"8px 12px",background:dark?T.dbg:T.ivory,border:`1px solid ${dark?T.dbrd:T.sand}`,borderRadius:9,cursor:"pointer",fontSize:12,color:dark?T.dtxt:T.ch,marginBottom:6}}>
                  ＋ {t}
                </div>
              ))}
            </div>}
            <Textarea value={anw} onChange={e=>setAnw(e.target.value)} placeholder="Anweisungen für den Techniker…" rows={6} dark={dark}/>
          </div>
          <div style={{padding:"12px 16px",borderTop:`1px solid ${dark?T.dbrd:T.sand}`}}>
            <Btn variant="primary" style={{width:"100%",justifyContent:"center"}} loading={anwSaving} onClick={saveAnw}>Speichern</Btn>
          </div>
        </Modal>
      )}
      {showFoto&&<FotoUploadModal aid={a.id} fotos={fotos} onSave={async(f)=>{const nf=await uploadFile(f);}} onClose={()=>setShowFoto(false)} dark={dark}/>}
    </>
  );
}

// ─── Foto Upload Modal ────────────────────────────────────────
function FotoUploadModal({aid,fotos,onSave,onClose,dark}) {
  const [uploading,setUploading]=useState(false); const [err,setErr]=useState(""); const [pct,setPct]=useState(0);
  const [fuLbIdx,setFuLbIdx]=useState(null); const [fuLbZoom,setFuLbZoom]=useState(1);
  const brd=dark?T.dbrd:T.sand; const bg=dark?T.dbg:T.ivory;
  const upload=async file=>{
    if(!file) return; setUploading(true); setErr(""); setPct(0);
    try{
      const url=await uploadFoto(aid,file,p=>{if(p.status==="uploading")setPct(Math.round(p.attempt/p.total*80));if(p.status==="failed")setErr(p.error||"Upload fehlgeschlagen");});
      setPct(100); if(onSave)onSave(url);
    }catch(e){setErr(e.message||"Upload fehlgeschlagen");}
    setUploading(false); setTimeout(()=>setPct(0),800);
  };
  return(
    <Modal onClose={onClose} dark={dark} width="min(480px,100vw)">
      <ModalHeader title="📷 Fotos" onClose={onClose} dark={dark}/>
      <div style={{padding:"16px",flex:1,overflowY:"auto"}}>
        {uploading&&<div style={{marginBottom:12}}>
          <div style={{height:5,background:brd,borderRadius:3,overflow:"hidden",marginBottom:5}}>
            <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${T.sage},${T.sageDk})`,borderRadius:3,transition:"width .3s"}}/>
          </div>
          <div style={{fontSize:11,color:T.sage,fontWeight:600}}>{pct<100?"Wird hochgeladen…":"✅ Hochgeladen"}</div>
        </div>}
        {err&&<div style={{background:T.errLt,border:`1px solid ${T.err}`,borderRadius:10,padding:"10px 13px",marginBottom:12,fontSize:12,color:T.err,display:"flex",justifyContent:"space-between"}}>
          <span>⚠ {err}</span><button onClick={()=>setErr("")} style={{background:"transparent",border:"none",color:T.err,cursor:"pointer"}}>✕</button>
        </div>}
        {fotos.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
          {fotos.map((path,i)=>{
            const [s2,ss2]=useState(null);
            useEffect(()=>{let c=false;getPhotoUrl(path).then(u=>{if(!c)ss2(u);});return()=>{c=true;};},[ path]);
            return s2?<img key={i} src={s2} alt="" onClick={()=>{setFuLbIdx(i);setFuLbZoom(1);}} style={{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:9,border:`1px solid ${brd}`,cursor:"zoom-in"}} />:<div key={i} style={{width:"100%",aspectRatio:"1",background:brd,borderRadius:9}} />;
          })}
        </div>}
        {fuLbIdx!==null&&(
          <div onClick={()=>{setFuLbIdx(null);setFuLbZoom(1);}} style={{position:"fixed",inset:0,zIndex:9000,background:"rgba(0,0,0,0.92)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{position:"absolute",top:16,right:20,display:"flex",gap:10,zIndex:9001}}>
              <button onClick={e=>{e.stopPropagation();setFuLbZoom(z=>Math.min(z+0.25,4));}} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",borderRadius:8,width:38,height:38,fontSize:20,cursor:"pointer"}}>＋</button>
              <button onClick={e=>{e.stopPropagation();setFuLbZoom(z=>Math.max(z-0.25,1));}} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",borderRadius:8,width:38,height:38,fontSize:20,cursor:"pointer"}}>－</button>
              <button onClick={e=>{e.stopPropagation();setFuLbZoom(1);}} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",borderRadius:8,width:38,height:38,fontSize:16,cursor:"pointer"}}>1:1</button>
              <button onClick={e=>{e.stopPropagation();setFuLbIdx(i=>i>0?i-1:fotos.length-1);setFuLbZoom(1);}} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",borderRadius:8,width:38,height:38,fontSize:20,cursor:"pointer"}}>‹</button>
              <button onClick={e=>{e.stopPropagation();setFuLbIdx(i=>i<fotos.length-1?i+1:0);setFuLbZoom(1);}} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",borderRadius:8,width:38,height:38,fontSize:20,cursor:"pointer"}}>›</button>
              <button onClick={e=>{e.stopPropagation();setFuLbIdx(null);setFuLbZoom(1);}} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",borderRadius:8,width:38,height:38,fontSize:18,cursor:"pointer"}}>✕</button>
            </div>
            <div onClick={e=>e.stopPropagation()} style={{overflow:"auto",maxWidth:"90vw",maxHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <img src={fotos[fuLbIdx]} alt="" style={{transform:`scale(${fuLbZoom})`,transformOrigin:"center",transition:"transform .15s",maxWidth:"90vw",maxHeight:"80vh",objectFit:"contain",borderRadius:8}} onClick={e=>e.stopPropagation()}/>
            </div>
            <div style={{color:"rgba(255,255,255,0.5)",fontSize:12,marginTop:14}}>{fuLbIdx+1} / {fotos.length} · Zoom {Math.round(fuLbZoom*100)}%</div>
          </div>
        )}
        {fotos.length===0&&!uploading&&<EmptyState icon="📷" title="Noch keine Fotos" dark={dark}/>}
      </div>
      <div style={{padding:"12px 16px",display:"flex",gap:10,borderTop:`1px solid ${brd}`}}>
        <label style={{flex:1,display:"block",background:`linear-gradient(135deg,${T.sage},${T.sageDk})`,color:"#fff",borderRadius:10,padding:"12px",fontSize:14,fontWeight:700,textAlign:"center",cursor:"pointer"}}>
          📷 Kamera<input type="file" accept="image/*" capture="environment" onChange={e=>upload(e.target.files?.[0])} style={{display:"none"}} disabled={uploading}/>
        </label>
        <label style={{flex:1,display:"block",background:bg,color:dark?T.dtxt:T.ch,border:`1.5px solid ${brd}`,borderRadius:10,padding:"12px",fontSize:14,fontWeight:700,textAlign:"center",cursor:"pointer"}}>
          🖼 Galerie<input type="file" accept="image/*" onChange={e=>upload(e.target.files?.[0])} style={{display:"none"}} disabled={uploading}/>
        </label>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// SMS + EMAIL MODALS
// ═══════════════════════════════════════════════════════════════
function SmsModal({auftrag,onClose,dark}) {
  const vorlagen=getSmsVorlagen();
  const first=vorlagen[0]||{text:"Guten Tag {patient},"};
  const [tel,setTel]=useState(auftrag?.telefon||"");
  const [text,setText]=useState(fillVorlage(first.text,{patient:auftrag?.patient||"",zahnarzt:auftrag?.zahnarzt||"",behandlung:auftrag?.arbeitstyp||"",datum:new Date().toLocaleDateString("de-DE"),praxis:"Die 3 Zahnärzte by Mahal"}));
  const [sending,setSending]=useState(false); const [sent,setSent]=useState(false); const [err,setErr]=useState(""); const [showVl,setShowVl]=useState(false);
  const brd=dark?T.dbrd:T.sandDk;
  const send=async()=>{
    if(!tel.trim()||!text.trim()) return; setSending(true); setErr("");
    try{await sendSMS(tel.trim(),text.trim());setSent(true);setTimeout(onClose,1800);}
    catch(e){setErr(e.message||"SMS fehlgeschlagen");}
    setSending(false);
  };
  return(
    <Modal onClose={onClose} dark={dark} width="min(520px,100vw)">
      <ModalHeader title="📱 SMS senden" subtitle={auftrag?.patient} onClose={onClose} dark={dark}
        right={<Btn variant="ghost" size="sm" onClick={()=>setShowVl(true)}>Vorlagen</Btn>}/>
      {sent?<div style={{textAlign:"center",padding:"48px 20px"}}><div style={{fontSize:52,marginBottom:12}}>✅</div><div style={{fontWeight:700,fontSize:18,color:T.ok}}>SMS gesendet!</div></div>
      :<div style={{padding:"16px",flex:1,overflowY:"auto"}}>
        {err&&<div style={{background:T.errLt,border:`1px solid ${T.err}`,borderRadius:10,padding:"10px 13px",marginBottom:12,fontSize:12,color:T.err,display:"flex",justifyContent:"space-between"}}>⚠ {err}<button onClick={()=>setErr("")} style={{background:"transparent",border:"none",color:T.err,cursor:"pointer"}}>✕</button></div>}
        <div style={{marginBottom:12}}><SectionLabel>Telefon</SectionLabel><Input type="tel" value={tel} onChange={e=>setTel(e.target.value)} placeholder="+49 170 …" dark={dark}/></div>
        <div style={{marginBottom:14}}><SectionLabel>Nachricht</SectionLabel><Textarea value={text} onChange={e=>setText(e.target.value)} rows={5} dark={dark}/><div style={{fontSize:10,color:T.gray,marginTop:3,textAlign:"right"}}>{text.length} Zeichen</div></div>
        <div style={{display:"flex",gap:10}}>
          <Btn variant="primary" loading={sending} disabled={!tel.trim()||!text.trim()} onClick={send} style={{flex:2,justifyContent:"center"}}>📤 SMS senden</Btn>
          <Btn variant="ghost" onClick={()=>{window.location.href=`sms:${tel.trim()}?body=${encodeURIComponent(text)}`;}} style={{flex:1,justifyContent:"center"}}>iOS ›</Btn>
        </div>
      </div>}
      {showVl&&(
        <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"flex-end",borderRadius:20,overflow:"hidden"}} onClick={()=>setShowVl(false)}>
          <div style={{background:"#fff",padding:16,width:"100%",maxHeight:"60%",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:700,fontSize:15,color:T.ch,marginBottom:12}}>Vorlagen wählen</div>
            {getSmsVorlagen().map(v=><div key={v.id} onClick={()=>{setText(fillVorlage(v.text,{patient:auftrag?.patient||"",zahnarzt:auftrag?.zahnarzt||"",behandlung:auftrag?.arbeitstyp||""}));setShowVl(false);}} style={{padding:"11px 13px",border:`1px solid ${T.sand}`,borderRadius:11,cursor:"pointer",marginBottom:7}}>
              <div style={{fontWeight:700,fontSize:13,color:T.ch,marginBottom:2}}>{v.name}</div>
              <div style={{fontSize:11,color:T.gray}}>{v.text.slice(0,70)}…</div>
            </div>)}
          </div>
        </div>
      )}
    </Modal>
  );
}

function EmailModal({auftrag,onClose,dark}) {
  const cfg=getEmailCfg();
  const [to,setTo]=useState(""); const [sub,setSub]=useState(fillVorlage(cfg.betreff,{patient:auftrag?.patient||"",arbeitstyp:auftrag?.arbeitstyp||""}));
  const [body,setBody]=useState(fillVorlage(cfg.text,{patient:auftrag?.patient||"",arbeitstyp:auftrag?.arbeitstyp||"",zahnarzt:auftrag?.zahnarzt||"",praxis:cfg.praxisName,telefon:cfg.telefon}));
  const [sending,setSending]=useState(false); const [sent,setSent]=useState(false); const [err,setErr]=useState("");
  const send=async()=>{
    if(!to.trim()) return; setSending(true); setErr("");
    try{await sendEmail(to.trim(),sub,body.split("\n").map(l=>`<p>${l}</p>`).join(""));setSent(true);setTimeout(onClose,1800);}
    catch(e){setErr(e.message||"E-Mail fehlgeschlagen");}
    setSending(false);
  };
  return(
    <Modal onClose={onClose} dark={dark} width="min(560px,100vw)">
      <ModalHeader title="📧 E-Mail senden" subtitle={auftrag?.patient} onClose={onClose} dark={dark}/>
      {sent?<div style={{textAlign:"center",padding:"48px 20px"}}><div style={{fontSize:52,marginBottom:12}}>✅</div><div style={{fontWeight:700,fontSize:18,color:T.ok}}>E-Mail gesendet!</div></div>
      :<div style={{padding:"16px",flex:1,overflowY:"auto"}}>
        {err&&<div style={{background:T.errLt,border:`1px solid ${T.err}`,borderRadius:10,padding:"10px 13px",marginBottom:12,fontSize:12,color:T.err}}>⚠ {err}</div>}
        <div style={{marginBottom:10}}><SectionLabel>An</SectionLabel><Input type="email" value={to} onChange={e=>setTo(e.target.value)} placeholder="patient@email.de" dark={dark}/></div>
        <div style={{marginBottom:10}}><SectionLabel>Betreff</SectionLabel><Input value={sub} onChange={e=>setSub(e.target.value)} dark={dark}/></div>
        <div style={{marginBottom:14}}><SectionLabel>Nachricht</SectionLabel><Textarea value={body} onChange={e=>setBody(e.target.value)} rows={6} dark={dark}/></div>
        <Btn variant="primary" loading={sending} disabled={!to.trim()} onClick={send} style={{width:"100%",justifyContent:"center"}}>📤 E-Mail senden</Btn>
      </div>}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// BELEGE MODULE — BelegeFlow, BelegList, BelegDetail, Payment
// ═══════════════════════════════════════════════════════════════
function BelegeModal({onClose,dark,auftragId}) {
  const [step,setStep]=useState("typ"); const [typ,setTyp]=useState(""); const [file,setFile]=useState(null);
  const [preview,setPreview]=useState(null); const [anaStep,setAnaStep]=useState(0); const [anaErr,setAnaErr]=useState("");
  const [result,setResult]=useState(null); const [items,setItems]=useState([]); const [saving,setSaving]=useState(false);
  const [docId]=useState("DOC-"+Date.now().toString(36).toUpperCase());
  const bg=dark?T.dbg:T.ivory; const card=dark?T.dcard:"#fff"; const tc=dark?T.dtxt:T.ch; const brd=dark?T.dbrd:T.sand;

  const onFile=async f=>{
    if(!f) return;
    // Duplicate check
    const hash=await sha256(f);
    setFile(f);setPreview(URL.createObjectURL(f));setStep("analyse");setAnaErr("");setAnaStep(0);
    try{
      setAnaStep(1);await new Promise(r=>setTimeout(r,300));
      setAnaStep(2);
      const compressed=await compressImage(f);
      const b64=await fileToB64(compressed);
      const mime=f.type?.startsWith("image/")?f.type:"image/jpeg";
      setAnaStep(3);
      const r=await analyseDoc(b64,mime,typ);
      const normalized={...r,document_type:r?.document_type||typ||"invoice",total_amount:parseFloat(r?.total_amount)||0,currency:r?.currency||"EUR",items:(r?.items||[]).map(i=>({...i,item_name_normalized:ss(i.item_name_normalized)||ss(i.item_name_raw),quantity:parseFloat(i.quantity)||0,unit:ss(i.unit)||"Stück",unit_price:parseFloat(i.unit_price)||0,total_price:parseFloat(i.total_price)||0,confidence_score:parseFloat(i.confidence_score)||0.7}))};
      setResult(normalized);setItems(normalized.items.map((it,i)=>({...it,_idx:i})));setStep("pruefen");
    }catch(e){setAnaErr(e.message||"Analyse fehlgeschlagen");setStep("kamera");}
  };

  const confirm=async()=>{
    if(saving) return; setSaving(true);
    try{
      const doc={id:docId,auftrag_id:auftragId||null,document_type:ss(result?.document_type)||"invoice",supplier_name:ss(result?.supplier_name),document_number:ss(result?.document_number),document_date:ss(result?.document_date),patient_name:ss(result?.patient_name),treatment_name:ss(result?.treatment_name),total_amount:parseFloat(result?.total_amount)||0,currency:ss(result?.currency)||"EUR",status:"bestaetigt",payment_status:"offen",created_at:new Date().toISOString()};
      if(isConf()){
        await documentsService.insert(doc);
        for(const pos of items){
          if(!ss(pos.item_name_normalized)&&!ss(pos.item_name_raw))continue;
          try{await documentsService.insertItem({id:"ITM-"+Date.now().toString(36)+Math.random().toString(36).slice(2,5),document_id:docId,item_name_raw:ss(pos.item_name_raw),item_name_normalized:ss(pos.item_name_normalized)||ss(pos.item_name_raw),quantity:parseFloat(pos.quantity)||0,unit:ss(pos.unit)||"Stück",unit_price:parseFloat(pos.unit_price)||0,total_price:parseFloat(pos.total_price)||0,confidence_score:parseFloat(pos.confidence_score)||0.7,mapping_status:"unmapped"});}catch{}
        }
      }
      setStep("erfolg");
      pushNotif("✅ Beleg gespeichert",ss(result?.supplier_name)||"Neuer Beleg");
      setTimeout(onClose,2000);
    }catch(e){setAnaErr("Speichern fehlgeschlagen: "+e.message);setSaving(false);}
  };

  const ANA_STEPS=["","Bild vorbereiten…","Komprimieren…","KI analysiert…"];
  const STEP_DOTS=["typ","kamera","analyse","pruefen","erfolg"];

  return(
    <Modal onClose={onClose} dark={dark} width="min(640px,100vw)" maxH="94vh">
      <div style={{background:`linear-gradient(135deg,${T.brandDk},${T.brandMd})`,padding:"16px 20px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{color:T.sage,fontWeight:700,fontSize:16,fontFamily:"Georgia,serif"}}>📄 Beleg scannen</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"rgba(255,255,255,0.7)",borderRadius:8,width:28,height:28,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {STEP_DOTS.map((s,i)=><div key={s} title={s} style={{width:8,height:8,borderRadius:"50%",background:STEP_DOTS.indexOf(step)>=i?T.sage:"rgba(255,255,255,0.2)",transition:"background .3s"}}/>)}
          <div style={{marginLeft:8,color:"rgba(255,255,255,0.45)",fontSize:11}}>{step==="typ"?"Typ wählen":step==="kamera"?"Foto aufnehmen":step==="analyse"?"Wird analysiert…":step==="pruefen"?"Daten prüfen":"Gespeichert"}</div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px",background:bg}}>
        {/* STEP: typ */}
        {step==="typ"&&(
          <>
            <div style={{fontWeight:700,fontSize:18,color:tc,marginBottom:4,fontFamily:"Georgia,serif"}}>Dokumenttyp</div>
            <div style={{color:T.gray,fontSize:13,marginBottom:20}}>Wähle den Typ für beste Erkennung</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {DOC_TYPES.map(t=>(
                <div key={t.key} onClick={()=>{setTyp(t.key);setStep("kamera");}} style={{display:"flex",alignItems:"center",gap:12,padding:"16px",background:card,border:`1.5px solid ${typ===t.key?T.sage:brd}`,borderRadius:14,cursor:"pointer",transition:"border-color .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=T.sage}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=typ===t.key?T.sage:brd}>
                  <div style={{width:44,height:44,background:T.sageLt,borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{t.icon}</div>
                  <div style={{fontWeight:700,fontSize:14,color:tc}}>{t.label}</div>
                </div>
              ))}
            </div>
          </>
        )}
        {/* STEP: kamera */}
        {step==="kamera"&&(
          <div style={{textAlign:"center"}}>
            {anaErr&&<div style={{background:T.errLt,border:`1px solid ${T.err}`,borderRadius:13,padding:"14px",marginBottom:20,fontSize:13,color:T.err,textAlign:"left"}}>
              <div style={{fontWeight:700,marginBottom:4}}>⚠ Fehler</div><div style={{marginBottom:10}}>{anaErr}</div>
              <Btn variant="danger" size="sm" onClick={()=>setAnaErr("")}>Erneut versuchen</Btn>
            </div>}
            <div style={{fontSize:72,marginBottom:20}}>📷</div>
            <div style={{fontWeight:700,fontSize:18,color:tc,marginBottom:8}}>Dokument fotografieren</div>
            <div style={{fontSize:13,color:T.gray,marginBottom:8,lineHeight:1.6}}>Halte das Dokument gerade und sorge für gute Beleuchtung</div>
            <div style={{fontSize:11,color:T.gray,marginBottom:28,padding:"8px 12px",background:card,borderRadius:10,border:`1px solid ${brd}`,lineHeight:1.5}}>💡 Kamera-Zugriff: Browser-Einstellungen → Kamera → Erlauben</div>
            <label style={{display:"block",background:`linear-gradient(135deg,${T.sage},${T.sageDk})`,color:"#fff",borderRadius:14,padding:"18px 24px",fontSize:16,fontWeight:700,textAlign:"center",cursor:"pointer",marginBottom:10}}>
              📷 Kamera öffnen<input type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>onFile(e.target.files?.[0])}/>
            </label>
            <label style={{display:"block",background:card,color:tc,border:`1.5px solid ${brd}`,borderRadius:14,padding:"14px 24px",fontSize:14,fontWeight:600,textAlign:"center",cursor:"pointer"}}>
              🖼 Galerie / Drag & Drop<input type="file" accept="image/*" style={{display:"none"}} onChange={e=>onFile(e.target.files?.[0])}/>
            </label>
          </div>
        )}
        {/* STEP: analyse */}
        {step==="analyse"&&(
          <div style={{textAlign:"center",padding:"24px 0"}}>
            {preview&&<img src={preview} alt="" style={{width:"100%",maxWidth:280,borderRadius:16,marginBottom:28,boxShadow:"0 4px 20px rgba(44,40,37,0.12)"}}/>}
            <div style={{width:56,height:56,borderRadius:"50%",border:`3px solid ${T.sage}`,borderTopColor:"transparent",animation:"spin 1s linear infinite",margin:"0 auto 18px"}}/>
            <div style={{fontWeight:700,fontSize:16,color:tc,marginBottom:8}}>{ANA_STEPS[anaStep]||"Analysiert…"}</div>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              {[1,2,3].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:i<=anaStep?T.sage:T.sand,transition:"background .3s"}}/>)}
            </div>
            <div style={{fontSize:12,color:T.gray,marginTop:14}}>KI-Erkennung läuft — das dauert 5–15 Sekunden</div>
          </div>
        )}
        {/* STEP: pruefen */}
        {step==="pruefen"&&result&&(
          <>
            <div style={{fontWeight:700,fontSize:18,color:tc,marginBottom:4,fontFamily:"Georgia,serif"}}>Erkannte Daten prüfen</div>
            <div style={{color:T.gray,fontSize:13,marginBottom:14}}>Bitte kontrollieren und ggf. korrigieren</div>
            {preview&&<img src={preview} alt="" style={{width:"100%",maxHeight:160,objectFit:"contain",borderRadius:12,marginBottom:14,background:card}}/>}
            <Card dark={dark} style={{marginBottom:12}}>
              {[["Lieferant",result.supplier_name],["Nr.",result.document_number],["Datum",result.document_date],["Patient",result.patient_name],["Betrag",result.total_amount>0?`€ ${parseFloat(result.total_amount).toFixed(2)}`:""]].filter(([,v])=>v).map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${brd}`}}>
                  <span style={{fontSize:11,color:T.gray,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.5px"}}>{l}</span>
                  <span style={{fontSize:13,fontWeight:600,color:tc}}>{v}</span>
                </div>
              ))}
            </Card>
            {items.length>0&&<div style={{marginBottom:14}}>
              <SectionLabel>{items.length} Positionen</SectionLabel>
              {items.map((item,idx)=>{
                const lowConf=parseFloat(item.confidence_score||1)<0.70;
                return(
                  <div key={idx} style={{background:lowConf?(dark?"#2A1A00":T.warnLt):card,border:`1px solid ${lowConf?T.warn:brd}`,borderRadius:11,padding:"10px 12px",marginBottom:7}}>
                    <input value={ss(item.item_name_normalized)||ss(item.item_name_raw)} onChange={e=>setItems(p=>p.map((it,i)=>i===idx?{...it,item_name_normalized:e.target.value}:it))}
                      style={{width:"100%",padding:"6px 9px",border:`1.5px solid ${lowConf?T.warn:brd}`,borderRadius:8,fontSize:13,fontFamily:"inherit",outline:"none",background:bg,color:tc,marginBottom:6,boxSizing:"border-box"}}/>
                    <div style={{display:"flex",gap:6}}>
                      {[["quantity","Menge",70],["unit","Einh.",80],["total_price","€",70]].map(([k,ph,w])=>(
                        <input key={k} value={ss(item[k])} onChange={e=>setItems(p=>p.map((it,i)=>i===idx?{...it,[k]:e.target.value}:it))} placeholder={ph} type={k!=="unit"?"number":"text"}
                          style={{width:w,padding:"6px 8px",border:`1.5px solid ${brd}`,borderRadius:8,fontSize:12,fontFamily:"inherit",outline:"none",background:bg,color:tc}}/>
                      ))}
                    </div>
                    {lowConf&&<div style={{fontSize:10,color:T.warn,fontWeight:700,marginTop:5}}>⚠ Niedrige Erkennungsrate — bitte prüfen</div>}
                  </div>
                );
              })}
            </div>}
            {anaErr&&<div style={{color:T.err,fontSize:12,marginBottom:12}}>{anaErr}</div>}
            <Btn variant="primary" loading={saving} onClick={confirm} style={{width:"100%",justifyContent:"center",padding:"14px",fontSize:15}}>✅ Bestätigen & speichern</Btn>
          </>
        )}
        {/* STEP: erfolg */}
        {step==="erfolg"&&(
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:72,marginBottom:16,animation:`ringPop .6s ${ESP}`}}>✅</div>
            <div style={{fontWeight:700,fontSize:22,color:tc,fontFamily:"Georgia,serif",marginBottom:8}}>Beleg gespeichert!</div>
            <div style={{color:T.gray,fontSize:13}}>Analysiert und in der Datenbank gespeichert.</div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Beleg List Screen ─────────────────────────────────────────
function BelegListScreen({dark,user,onScanNew}) {
  const [docs,setDocs]=useState([]); const [loading,setLoading]=useState(false); const [filter,setFilter]=useState("alle");
  const [selDoc,setSelDoc]=useState(null); const [showPayment,setShowPayment]=useState(false);
  const bg=dark?T.dbg:T.ivory; const card=dark?T.dcard:"#fff"; const tc=dark?T.dtxt:T.ch; const brd=dark?T.dbrd:T.sand;
  const isManager=user?.rolle==="geschaeftsleitung"||user?.rolle==="verwaltung";

  const load=useCallback(async()=>{
    setLoading(true);
    try{
      let qs="order=created_at.desc&limit=100";
      if(filter!=="alle") qs+=`&payment_status=eq.${filter}`;
      if(isConf()){const d=await documentsService.getAll(qs);setDocs(Array.isArray(d)?d:[]);}
      else setDocs([{id:"demo-1",supplier_name:"Dental Depot Nord",document_type:"invoice",document_date:"2024-01-15",total_amount:289.50,currency:"EUR",payment_status:"offen",patient_name:"Max Mustermann"},{id:"demo-2",supplier_name:"ZahnTech GmbH",document_type:"delivery_note",document_date:"2024-01-10",total_amount:0,currency:"EUR",payment_status:"bezahlt",patient_name:"Erika Muster"}]);
    }catch(e){Monitor.error(e);}
    setLoading(false);
  },[filter]);

  useEffect(()=>{load();},[load]);

  const FILTERS=[["alle","Alle"],["offen","Offen"],["bezahlt","Bezahlt"],["ueberfaellig","Überfällig"]];

  return(
    <div style={{background:bg,minHeight:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px 10px"}}>
        <div style={{fontWeight:700,fontSize:20,color:tc,fontFamily:"Georgia,serif"}}>📄 Belege & Rechnungen</div>
        <Btn variant="primary" icon="＋" size="sm" onClick={onScanNew}>Beleg scannen</Btn>
      </div>
      <div style={{padding:"0 20px 12px",display:"flex",gap:7,flexWrap:"wrap"}}>
        {FILTERS.map(([k,l])=>{const ps=k!=="alle"?getPS(k):null;return(
          <button key={k} onClick={()=>setFilter(k)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${filter===k?(ps?ps.color:T.sage):brd}`,background:filter===k?(ps?ps.bg:T.sageLt):"transparent",color:filter===k?(ps?ps.color:T.sageDk):T.gray,cursor:"pointer",fontSize:12,fontWeight:filter===k?700:400,fontFamily:"inherit",transition:"all .15s"}}>
            {l}{filter===k&&docs.length>0&&<span style={{marginLeft:5,fontWeight:800}}>{docs.length}</span>}
          </button>
        );})}
      </div>
      {loading&&<div style={{display:"flex",justifyContent:"center",padding:32}}><Spinner size={32} color={T.sage}/></div>}
      {!loading&&docs.length===0&&<EmptyState icon="📄" title="Noch keine Belege" sub={filter==="alle"?"Scanne deinen ersten Beleg":"Keine Belege für diesen Filter"} dark={dark} action={<Btn variant="primary" icon="＋" onClick={onScanNew}>Ersten Beleg scannen</Btn>}/>}
      <div style={{padding:"0 20px 20px"}}>
        {docs.map((doc,i)=>{
          const ps=getPS(doc.payment_status||"offen");
          const docIcon=doc.document_type==="invoice"?"🧾":doc.document_type==="delivery_note"?"📦":"📋";
          return(
            <div key={doc.id} onClick={()=>setSelDoc(doc)} style={{background:card,border:`1px solid ${brd}`,borderRadius:16,padding:"14px 16px",marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 4px rgba(44,40,37,0.06)",transition:`box-shadow .15s ${EO}`,animation:`staggerIn .2s ${EO} ${i*30}ms both`}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(44,40,37,0.1)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 4px rgba(44,40,37,0.06)"}>
              <div style={{width:50,height:50,borderRadius:12,background:T.sageLt,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0,overflow:"hidden"}}>
                {doc.file_url?<img src={doc.file_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";}}/>:docIcon}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:14,color:tc,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.supplier_name||"Unbekannter Lieferant"}</div>
                <div style={{fontSize:11,color:T.gray,marginTop:2}}>{doc.document_date||"–"}{doc.patient_name?` · ${doc.patient_name}`:""}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                {doc.total_amount>0&&<div style={{fontWeight:800,fontSize:15,color:tc,fontFamily:"Georgia,serif",marginBottom:4}}>€ {parseFloat(doc.total_amount).toFixed(2)}</div>}
                <Badge color={ps.color} bg={ps.bg} size="sm">{ps.icon} {ps.label}</Badge>
              </div>
            </div>
          );
        })}
      </div>
      {/* Beleg Detail Sheet */}
      {selDoc&&(
        <div style={{position:"fixed",inset:0,zIndex:1100,background:"rgba(44,40,37,0.7)",display:"flex",alignItems:"flex-end"}} onClick={()=>setSelDoc(null)}>
          <div style={{background:dark?T.dcard:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxHeight:"80vh",overflowY:"auto",padding:20,animation:`slideUp .3s ${EO} both`}} onClick={e=>e.stopPropagation()}>
            <div style={{width:44,height:4,borderRadius:2,background:dark?T.dbrd:T.sand,margin:"0 auto 16px"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
              <div>
                <div style={{fontWeight:700,fontSize:18,color:dark?T.dtxt:T.ch,fontFamily:"Georgia,serif"}}>{ss(selDoc.supplier_name||"Beleg")}</div>
                <div style={{fontSize:12,color:T.gray,marginTop:3}}>{selDoc.document_type==="invoice"?"🧾 Rechnung":selDoc.document_type==="delivery_note"?"📦 Lieferschein":"📋 Dokument"}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                <Badge color={getPS(selDoc.payment_status||"offen").color} bg={getPS(selDoc.payment_status||"offen").bg}>{getPS(selDoc.payment_status||"offen").icon} {getPS(selDoc.payment_status||"offen").label}</Badge>
                {isManager&&<Btn variant="ghost" size="sm" onClick={()=>setShowPayment(true)}>Zahlstatus ↓</Btn>}
              </div>
            </div>
            {selDoc.total_amount>0&&<div style={{background:T.sageLt,borderRadius:12,padding:"14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:13,color:T.sageDk,fontWeight:700}}>Gesamtbetrag</span>
              <span style={{fontSize:22,fontWeight:800,color:T.sageDk,fontFamily:"Georgia,serif"}}>€ {parseFloat(selDoc.total_amount).toFixed(2)}</span>
            </div>}
            {[["Nr.",selDoc.document_number],["Datum",selDoc.document_date],["Patient",selDoc.patient_name]].filter(([,v])=>v).map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${dark?T.dbrd:T.sand}`}}>
                <span style={{fontSize:12,color:T.gray,fontWeight:700}}>{l}</span>
                <span style={{fontSize:13,color:dark?T.dtxt:T.ch,fontWeight:600}}>{v}</span>
              </div>
            ))}
            {selDoc.file_url&&<a href={selDoc.file_url} target="_blank" rel="noreferrer" style={{display:"block",marginTop:16,background:T.sageLt,color:T.sageDk,borderRadius:12,padding:"13px",textAlign:"center",fontWeight:700,fontSize:14,textDecoration:"none"}}>🔗 Original öffnen</a>}
          </div>
          {showPayment&&<PaymentModal doc={selDoc} dark={dark} onClose={()=>setShowPayment(false)} onUpdate={upd=>{setDocs(p=>p.map(d=>d.id===upd.id?{...d,...upd}:d));setSelDoc(s=>({...s,...upd}));}}/>}
        </div>
      )}
    </div>
  );
}

// ─── Payment Modal ─────────────────────────────────────────────
function PaymentModal({doc,onClose,onUpdate,dark}) {
  const [status,setStatus]=useState(doc?.payment_status||"offen"); const [saving,setSaving]=useState(false);
  const save=async ns=>{
    if(ns===status||saving) return; setSaving(true);
    try{
      const patch={payment_status:ns,bezahlt_am:ns==="bezahlt"?new Date().toISOString():null};
      if(isConf()) await documentsService.updatePayment(doc.id,patch);
      setStatus(ns); if(onUpdate)onUpdate({...doc,...patch});
    }catch(e){Monitor.error(e);}
    setSaving(false); onClose();
  };
  const brd=dark?T.dbrd:T.sand; const tc=dark?T.dtxt:T.ch;
  return(
    <div style={{position:"fixed",inset:0,zIndex:1200,background:"rgba(44,40,37,0.6)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:dark?T.dcard:"#fff",borderRadius:18,width:"min(380px,100%)",padding:20,boxShadow:"0 16px 48px rgba(44,40,37,0.25)",animation:`scaleIn .18s ${EO}`}} onClick={e=>e.stopPropagation()}>
        <div style={{fontWeight:700,fontSize:16,color:tc,marginBottom:16}}>💶 Zahlungsstatus</div>
        {saving&&<div style={{display:"flex",justifyContent:"center",padding:16}}><Spinner size={28} color={T.sage}/></div>}
        {!saving&&Object.entries(PS).map(([key,ps])=>(
          <button key={key} onClick={()=>save(key)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"13px 14px",background:key===status?ps.bg:"transparent",border:`1.5px solid ${key===status?ps.color:brd}`,borderRadius:12,cursor:"pointer",textAlign:"left",fontFamily:"inherit",marginBottom:8,transition:"all .15s"}}>
            <span style={{fontSize:22}}>{ps.icon}</span>
            <div style={{flex:1}}><div style={{fontWeight:key===status?700:500,fontSize:14,color:key===status?ps.color:tc}}>{ps.label}</div>{key===status&&<div style={{fontSize:10,color:ps.color,marginTop:1}}>Aktuell</div>}</div>
            {key===status&&<span style={{color:ps.color}}>✓</span>}
          </button>
        ))}
        <Btn variant="ghost" style={{width:"100%",justifyContent:"center",marginTop:4}} onClick={onClose}>Abbrechen</Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PATIENTS MODULE
// ═══════════════════════════════════════════════════════════════
function PatientsModal({patienten,zahnärzte,onAdd,onDelete,onSelect,onClose,dark}) {
  const [search,setSearch]=useState(""); const [view,setView]=useState("liste"); const [form,setForm]=useState({name:"",telefon:"",zahnarzt:""}); const [saving,setSaving]=useState(false); const [err,setErr]=useState("");
  const bg=dark?T.dbg:T.ivory; const card=dark?T.dcard:"#fff"; const tc=dark?T.dtxt:T.ch; const brd=dark?T.dbrd:T.sand;
  const filtered=patienten.filter(p=>!search||(p.name||"").toLowerCase().includes(search.toLowerCase())||(p.telefon||"").includes(search));
  const save=async()=>{
    if(!form.name.trim()){setErr("Name ist Pflicht");return;} setSaving(true); setErr("");
    try{const np={id:"p"+Date.now().toString(36).toUpperCase(),name:form.name.trim(),telefon:form.telefon.trim(),zahnarzt:form.zahnarzt,created_at:new Date().toISOString()};await onAdd(np);setForm({name:"",telefon:"",zahnarzt:""});setView("liste");}
    catch(e){setErr(e.message||"Fehler");}
    setSaving(false);
  };
  return(
    <Modal onClose={onClose} dark={dark} width="min(560px,100vw)">
      <ModalHeader title="👥 Patienten" onClose={onClose} dark={dark}
        right={view==="liste"?<Btn variant="ghost" size="sm" onClick={()=>setView("neu")}>＋ Neu</Btn>:<Btn variant="ghost" size="sm" onClick={()=>setView("liste")}>← Liste</Btn>}/>
      {view==="liste"&&(
        <>
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${brd}`}}>
            <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Patient suchen…" dark={dark}/>
          </div>
          <div style={{overflowY:"auto",flex:1,maxHeight:450}}>
            {filtered.length===0&&<EmptyState icon="👥" title="Keine Patienten" sub="Lege deinen ersten Patienten an" dark={dark}/>}
            {filtered.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:`1px solid ${brd}`,cursor:"pointer"}}
                onMouseEnter={e=>e.currentTarget.style.background=dark?"rgba(255,255,255,0.03)":T.sageXlt}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:38,height:38,borderRadius:"50%",background:T.sageLt,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>👤</div>
                <div style={{flex:1,minWidth:0}} onClick={()=>onSelect&&onSelect(p)}>
                  <div style={{fontWeight:700,fontSize:14,color:tc}}>{p.name}</div>
                  {p.telefon&&<div style={{fontSize:11,color:T.gray,marginTop:1}}>{p.telefon}</div>}
                </div>
                {onSelect&&<span style={{color:T.sage,cursor:"pointer"}} onClick={()=>onSelect(p)}>›</span>}
                <button onClick={()=>onDelete(p.id)} style={{background:"transparent",border:"none",color:T.err,cursor:"pointer",fontSize:14,padding:4}}>🗑</button>
              </div>
            ))}
          </div>
        </>
      )}
      {view==="neu"&&(
        <div style={{padding:"16px"}}>
          <div style={{fontWeight:700,fontSize:16,color:tc,fontFamily:"Georgia,serif",marginBottom:14}}>Neuer Patient</div>
          <div style={{marginBottom:10}}><SectionLabel>Name *</SectionLabel><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Vorname Nachname" dark={dark} autoFocus/></div>
          <div style={{marginBottom:10}}><SectionLabel>Telefon</SectionLabel><Input type="tel" value={form.telefon} onChange={e=>setForm(f=>({...f,telefon:e.target.value}))} placeholder="+49 170 …" dark={dark}/></div>
          <div style={{marginBottom:16}}><SectionLabel>Zahnarzt/Ärztin</SectionLabel>
            <Select value={form.zahnarzt} onChange={e=>setForm(f=>({...f,zahnarzt:e.target.value}))} dark={dark}>
              <option value="">— Zahnarzt wählen —</option>
              {zahnärzte.map(z=><option key={z.id} value={z.name}>{z.name}</option>)}
            </Select>
          </div>
          {err&&<div style={{color:T.err,fontSize:12,marginBottom:10}}>{err}</div>}
          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" onClick={()=>setView("liste")}>Abbrechen</Btn>
            <Btn variant="primary" loading={saving} onClick={save} style={{flex:1,justifyContent:"center"}}>Patient speichern</Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// DENTISTS MODAL
// ═══════════════════════════════════════════════════════════════
function DentistsModal({zahnärzte,onAdd,onDelete,onClose,dark}) {
  const [name,setName]=useState(""); const [farbe,setFarbe]=useState("#7A9E8E"); const [saving,setSaving]=useState(false);
  const brd=dark?T.dbrd:T.sand; const tc=dark?T.dtxt:T.ch; const card=dark?T.dcard:"#fff";
  const COLORS=["#7A9E8E","#2272C3","#D4756A","#C9956A","#7B3FBE","#0A7B7B","#E8849A","#D4874A","#1A9E5C","#8C8580"];
  const save=async()=>{
    if(!name.trim()) return; setSaving(true);
    try{await onAdd({id:"z"+Date.now().toString(36).toUpperCase(),name:name.trim(),farbe});setName("");}
    catch(e){Monitor.error(e);}
    setSaving(false);
  };
  return(
    <Modal onClose={onClose} dark={dark} width="min(480px,100vw)">
      <ModalHeader title="👨‍⚕️ Zahnärzte" onClose={onClose} dark={dark}/>
      <div style={{overflowY:"auto",flex:1,maxHeight:300}}>
        {zahnärzte.length===0&&<EmptyState icon="👨‍⚕️" title="Noch keine Zahnärzte" dark={dark}/>}
        {zahnärzte.map(z=>(
          <div key={z.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",borderBottom:`1px solid ${brd}`}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:z.farbe||T.sage,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff",flexShrink:0}}>{ss(z.name).trim().charAt(0).toUpperCase()}</div>
            <div style={{flex:1,fontWeight:600,color:tc,fontSize:14}}>{z.name}</div>
            <button onClick={()=>onDelete(z.id)} style={{background:"transparent",border:"none",color:T.err,cursor:"pointer",fontSize:14}}>🗑</button>
          </div>
        ))}
      </div>
      <div style={{padding:"14px 16px",borderTop:`1px solid ${brd}`}}>
        <SectionLabel>Neuer Zahnarzt</SectionLabel>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Dr. Müller" dark={dark} style={{flex:1}}/>
          <input type="color" value={farbe} onChange={e=>setFarbe(e.target.value)} title="Farbe wählen" style={{width:40,height:38,padding:2,border:`1.5px solid ${brd}`,borderRadius:9,cursor:"pointer",background:"transparent"}}/>
        </div>
        <div style={{display:"flex",gap:5,marginBottom:10}}>
          {COLORS.map(c=><div key={c} onClick={()=>setFarbe(c)} style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",border:`2.5px solid ${farbe===c?"#fff":"transparent"}`,boxShadow:farbe===c?`0 0 0 2px ${c}`:""}}/>)}
        </div>
        <Btn variant="primary" loading={saving} onClick={save} style={{width:"100%",justifyContent:"center"}}>Zahnarzt hinzufügen</Btn>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS MODALS
// ═══════════════════════════════════════════════════════════════
function PinSettingsModal({onClose,dark}) {
  const [pinOn,setPinOnS]=useState(getPINOn()); const [newPin,setNewPin]=useState(""); const [msg,setMsg]=useState("");
  const brd=dark?T.dbrd:T.sand; const tc=dark?T.dtxt:T.ch;
  const togglePin=()=>{const n=!pinOn;setPinOn(n);setPinOnS(n);};
  const savePin=()=>{if(newPin.length<4){setMsg("Mindestens 4 Ziffern");return;}setPIN(newPin);setNewPin("");setMsg("✅ PIN gespeichert");setTimeout(()=>setMsg(""),2500);};
  return(
    <Modal onClose={onClose} dark={dark} width="min(480px,100vw)">
      <ModalHeader title="🔐 PIN-Einstellungen" onClose={onClose} dark={dark}/>
      <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:12}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",background:dark?T.dbg:T.ivory,borderRadius:13,border:`1px solid ${brd}`}}>
          <div><div style={{fontWeight:600,color:tc,fontSize:14}}>PIN-Schutz</div><div style={{fontSize:11,color:T.gray,marginTop:1}}>Beim Öffnen sperren</div></div>
          <Toggle on={pinOn} onToggle={togglePin}/>
        </div>
        <div style={{padding:"14px 16px",background:dark?T.dbg:T.ivory,borderRadius:13,border:`1px solid ${brd}`}}>
          <SectionLabel>PIN ändern</SectionLabel>
          <div style={{display:"flex",gap:8}}>
            <Input type="password" inputMode="numeric" value={newPin} onChange={e=>setNewPin(e.target.value.replace(/\D/g,"").slice(0,8))} placeholder="Neuer PIN (mind. 4)" dark={dark} style={{flex:1}}/>
            <Btn variant="primary" size="sm" onClick={savePin}>Speichern</Btn>
          </div>
          {msg&&<div style={{fontSize:12,color:T.ok,marginTop:8,fontWeight:600}}>{msg}</div>}
        </div>
      </div>
    </Modal>
  );
}

function EmailSettingsModal({onClose,dark}) {
  const [cfg,setCfg]=useState(getEmailCfg()); const [saved,setSaved]=useState(false);
  const tc=dark?T.dtxt:T.ch;
  const save=()=>{saveEmailCfg(cfg);setSaved(true);setTimeout(()=>setSaved(false),2000);};
  const PLACEHOLDERS="{patient} {arbeitstyp} {zahnarzt} {praxis} {telefon}";
  return(
    <Modal onClose={onClose} dark={dark} width="min(580px,100vw)">
      <ModalHeader title="📧 E-Mail-Einstellungen" onClose={onClose} dark={dark}/>
      <div style={{padding:"16px",flex:1,overflowY:"auto"}}>
        {[["Praxis-Name","praxisName","Die 3 Zahnärzte by Mahal"],["Telefon","telefon","+49 …"],["Betreff-Vorlage","betreff",""],["Nachrichtenvorlage","text",""]].map(([l,k,ph])=>(
          <div key={k} style={{marginBottom:12}}>
            <SectionLabel>{l}</SectionLabel>
            {k==="text"?<Textarea value={cfg[k]||""} onChange={e=>setCfg(c=>({...c,[k]:e.target.value}))} rows={5} dark={dark}/>:<Input value={cfg[k]||""} onChange={e=>setCfg(c=>({...c,[k]:e.target.value}))} placeholder={ph} dark={dark}/>}
          </div>
        ))}
        <div style={{fontSize:11,color:T.gray,marginBottom:16}}>Platzhalter: {PLACEHOLDERS}</div>
        {saved&&<div style={{color:T.ok,fontSize:13,fontWeight:700,marginBottom:10}}>✅ Gespeichert</div>}
        <Btn variant="primary" onClick={save} style={{width:"100%",justifyContent:"center"}}>Speichern</Btn>
      </div>
    </Modal>
  );
}

function SmsVorlagenModal({onClose,dark}) {
  const [vl,setVl]=useState(getSmsVorlagen()); const [editing,setEditing]=useState(null); const [editText,setEditText]=useState(""); const [editName,setEditName]=useState("");
  const brd=dark?T.dbrd:T.sand; const tc=dark?T.dtxt:T.ch; const bg=dark?T.dbg:T.ivory;
  const startEdit=v=>{setEditing(v.id);setEditText(v.text);setEditName(v.name);};
  const saveEdit=()=>{const u=vl.map(v=>v.id===editing?{...v,text:editText,name:editName}:v);setVl(u);saveSmsVorlagen(u);setEditing(null);};
  const addNew=()=>{const v={id:"v"+Date.now(),name:"Neue Vorlage",text:"Guten Tag {patient}, "};const u=[...vl,v];setVl(u);saveSmsVorlagen(u);startEdit(v);};
  const del=id=>{const u=vl.filter(v=>v.id!==id);setVl(u);saveSmsVorlagen(u);};
  return(
    <Modal onClose={onClose} dark={dark} width="min(560px,100vw)">
      <ModalHeader title="💬 SMS-Vorlagen" onClose={onClose} dark={dark} right={<Btn variant="ghost" size="sm" onClick={addNew}>＋ Neu</Btn>}/>
      <div style={{overflowY:"auto",flex:1,maxHeight:500,padding:"12px 16px"}}>
        <div style={{fontSize:11,color:T.gray,marginBottom:12}}>Platzhalter: {"{patient} {zahnarzt} {behandlung} {datum} {praxis}"}</div>
        {vl.map(v=>(
          <div key={v.id} style={{background:dark?T.dbg:T.ivory,border:`1px solid ${brd}`,borderRadius:13,padding:"12px",marginBottom:10}}>
            {editing===v.id
              ?<div>
                  <Input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Name der Vorlage" dark={dark} style={{marginBottom:8}}/>
                  <Textarea value={editText} onChange={e=>setEditText(e.target.value)} rows={3} dark={dark} style={{marginBottom:8}}/>
                  <div style={{display:"flex",gap:8}}>
                    <Btn variant="primary" size="sm" onClick={saveEdit}>Speichern</Btn>
                    <Btn variant="ghost" size="sm" onClick={()=>setEditing(null)}>Abbruch</Btn>
                  </div>
                </div>
              :<div>
                  <div style={{fontWeight:700,fontSize:13,color:tc,marginBottom:4}}>{v.name}</div>
                  <div style={{fontSize:11,color:T.gray,marginBottom:10,lineHeight:1.5}}>{v.text.slice(0,80)}{v.text.length>80?"…":""}</div>
                  <div style={{display:"flex",gap:8}}>
                    <Btn variant="secondary" size="sm" icon="✏️" onClick={()=>startEdit(v)}>Bearbeiten</Btn>
                    <Btn variant="danger" size="sm" onClick={()=>del(v.id)}>🗑</Btn>
                  </div>
                </div>
            }
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ─── Statistik Modal ──────────────────────────────────────────
function StatistikModal({aufträge,onClose,dark}) {
  const bg=dark?T.dcard:"#fff"; const tc=dark?T.dtxt:T.ch;
  const aktive=aufträge.filter(a=>a.status!=="Archiviert");
  const statusCounts={};aufträge.forEach(a=>{statusCounts[a.status]=(statusCounts[a.status]||0)+1;});
  const typCounts={};aufträge.forEach(a=>{if(a.arbeitstyp)typCounts[a.arbeitstyp]=(typCounts[a.arbeitstyp]||0)+1;});
  const topTypen=Object.entries(typCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const überfällig=aufträge.filter(a=>isLate(a));
  return(
    <Modal onClose={onClose} dark={dark} width="min(580px,100vw)">
      <ModalHeader title="📊 Statistik" onClose={onClose} dark={dark}/>
      <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
          <KPIBox label="Gesamt" value={aufträge.length} color={T.sage} dark={dark}/>
          <KPIBox label="Aktiv" value={aktive.length} color={T.blue} dark={dark}/>
          <KPIBox label="Überfällig" value={überfällig.length} color={T.err} alarm={überfällig.length>0} dark={dark}/>
        </div>
        <SectionLabel>Nach Status</SectionLabel>
        <div style={{marginBottom:16}}>
          {Object.entries(statusCounts).map(([s,n])=>{const sm=getSM(s);return<StatBar key={s} label={sm.label} count={n} total={aufträge.length} color={sm.color} icon={sm.icon}/>;} )}
        </div>
        {topTypen.length>0&&<>
          <SectionLabel>Top Arbeitstypen</SectionLabel>
          {topTypen.map(([t,n])=><StatBar key={t} label={t} count={n} total={aufträge.length} color={T.sage} icon="⚙️"/>)}
        </>}
      </div>
    </Modal>
  );
}

// ─── Monatsbericht Modal ──────────────────────────────────────
function MonatsberichtModal({aufträge,onClose,dark}) {
  const now=new Date(); const month=now.toLocaleDateString("de-DE",{month:"long",year:"numeric"});
  const thisMonth=aufträge.filter(a=>{const d=new Date(a.eingang||"");return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();});
  const tc=dark?T.dtxt:T.ch;
  const drucken=()=>{
    const w=window.open("","_blank");
    w.document.write(`<html><head><title>Monatsbericht ${month}</title><style>body{font-family:Georgia,serif;padding:32px;color:#2C2825}h1{color:#2D1F1F}table{width:100%;border-collapse:collapse}th,td{padding:9px;border:1px solid #EDE8E0;text-align:left}th{background:#2D1F1F;color:#7A9E8E;font-size:11px;letter-spacing:1px;text-transform:uppercase}</style></head><body><h1>Monatsbericht ${month}</h1><p>${thisMonth.length} Aufträge</p><table><thead><tr><th>ID</th><th>Patient</th><th>Zahnarzt</th><th>Arbeitstyp</th><th>Status</th><th>Eingang</th></tr></thead><tbody>${thisMonth.map(a=>`<tr><td>${a.id}</td><td>${a.patient}</td><td>${a.zahnarzt}</td><td>${a.arbeitstyp}</td><td>${a.status}</td><td>${fmtDate(a.eingang)}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.print();
  };
  return(
    <Modal onClose={onClose} dark={dark} width="min(580px,100vw)">
      <ModalHeader title="📄 Monatsbericht" subtitle={month} onClose={onClose} dark={dark}/>
      <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
          <KPIBox label="Aufträge" value={thisMonth.length} color={T.sage} dark={dark}/>
          <KPIBox label="Bereit" value={thisMonth.filter(a=>a.status==="Bereit").length} color={T.ok} dark={dark}/>
          <KPIBox label="Überfällig" value={thisMonth.filter(a=>isLate(a)).length} color={T.err} dark={dark}/>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:dark?T.dbrd:T.sand}}>{["ID","Patient","Zahnarzt","Typ","Status","Eingang"].map(h=><th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:10,letterSpacing:"0.8px",fontWeight:700,color:tc}}>{h}</th>)}</tr></thead>
            <tbody>{thisMonth.map((a,i)=><tr key={a.id} style={{background:i%2===0?(dark?undefined:T.ivory):undefined,borderBottom:`1px solid ${dark?T.dbrd:T.sand}`}}>{[a.id,a.patient,a.zahnarzt,a.arbeitstyp,a.status,fmtDate(a.eingang)].map((v,j)=><td key={j} style={{padding:"9px 12px",color:tc,fontSize:12,fontFamily:j===0?"monospace":"inherit"}}>{v}</td>)}</tr>)}</tbody>
          </table>
        </div>
        {thisMonth.length===0&&<EmptyState icon="📋" title="Keine Aufträge" sub="Noch keine Aufträge diesen Monat" dark={dark}/>}
      </div>
      <div style={{padding:"12px 16px",borderTop:`1px solid ${dark?T.dbrd:T.sand}`}}>
        <Btn variant="primary" icon="🖨" onClick={drucken}>Drucken</Btn>
      </div>
    </Modal>
  );
}

// ─── Dashboard Modal ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
// FIX PART 2: DASHBOARD MIT BELEGEN (NUR GESCHÄFTSLEITUNG)
// Dashboard: PIN 9999, alle KPIs + vollständige Belegliste
// ═══════════════════════════════════════════════════════════════

function DashboardModal({ aufträge, zahnärzte, onDetail, onClose, dark }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pinErr,   setPinErr]   = useState("");
  const [dashTab,  setDashTab]  = useState("overview"); // overview | belege | materialien
  const [docs,     setDocs]     = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsFilter,  setDocsFilter]  = useState("alle");
  const [selDoc,   setSelDoc]   = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showScanBeleg, setShowScanBeleg] = useState(false);

  const aktive    = aufträge.filter(a => !["Archiviert"].includes(a.status));
  const bereit    = aufträge.filter(a => a.status === "Bereit");
  const überfällig = aufträge.filter(a => isLate(a));

  // Top-Zahnarzt
  const perArzt = {};
  aufträge.forEach(a => {
    if (!perArzt[a.zahnarzt]) perArzt[a.zahnarzt] = { count: 0, farbe: zahnärzte.find(z => z.name === a.zahnarzt)?.farbe || T.sage };
    perArzt[a.zahnarzt].count++;
  });
  const topArzt = Object.entries(perArzt).sort((a, b) => b[1].count - a[1].count)[0];

  const tc  = dark ? T.dtxt : T.ch;
  const brd = dark ? T.dbrd : T.sand;
  const bg  = dark ? T.dbg  : T.ivory;
  const card = dark ? T.dcard : "#fff";

  const loadDocs = useCallback(async () => {
    if (!unlocked) return;
    setDocsLoading(true);
    try {
      let qs = "order=created_at.desc&limit=200";
      if (docsFilter !== "alle") qs += `&payment_status=eq.${docsFilter}`;
      if (isConf()) {
        const d = await documentsService.getAll(qs);
        setDocs(Array.isArray(d) ? d : []);
      } else {
        setDocs([
          { id: "demo-1", supplier_name: "Dental Depot Nord", document_type: "invoice", document_date: "2024-01-15", total_amount: 289.50, currency: "EUR", payment_status: "offen",        patient_name: "Max Mustermann" },
          { id: "demo-2", supplier_name: "ZahnTech GmbH",     document_type: "delivery_note", document_date: "2024-01-10", total_amount: 142.00, currency: "EUR", payment_status: "bezahlt",      patient_name: "Erika Muster" },
          { id: "demo-3", supplier_name: "MedDental AG",       document_type: "invoice", document_date: "2023-12-20", total_amount: 580.00, currency: "EUR", payment_status: "ueberfaellig", patient_name: "Klaus Fischer" },
          { id: "demo-4", supplier_name: "Praxis-Service GmbH",document_type: "delivery_note", document_date: "2024-01-12", total_amount:  55.00, currency: "EUR", payment_status: "teilbezahlt", patient_name: "Anna Wagner" },
        ]);
      }
    } catch (e) { Monitor.error(e); }
    setDocsLoading(false);
  }, [unlocked, docsFilter]);

  useEffect(() => { if (unlocked && dashTab === "belege") loadDocs(); }, [loadDocs, unlocked, dashTab]);

  const DOC_FILTERS = [["alle","Alle"],["offen","Offen"],["bezahlt","Bezahlt"],["teilbezahlt","Teilbezahlt"],["ueberfaellig","Überfällig"],["storniert","Storniert"]];

  // Belege-Statistiken
  const docsTotal = docs.length;
  const docsOffen = docs.filter(d => d.payment_status === "offen" || d.payment_status === "ueberfaellig").length;
  const docsSumme = docs.reduce((s, d) => s + (parseFloat(d.total_amount) || 0), 0);
  const docsOffenSumme = docs.filter(d => d.payment_status === "offen" || d.payment_status === "ueberfaellig").reduce((s, d) => s + (parseFloat(d.total_amount) || 0), 0);

  return (
    <Modal onClose={onClose} dark={dark} width="min(760px,100vw)" maxH="92vh">
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${T.brandDk},${T.brandMd})`, padding: "16px 20px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: unlocked ? 12 : 0 }}>
          <div style={{ color: T.sage, fontWeight: 700, fontSize: 16, fontFamily: "Georgia,serif" }}>🏥 Dashboard Praxisleitung</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.7)", borderRadius: 8, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        {/* Tabs (nur wenn entsperrt) */}
        {unlocked && (
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { k: "overview",   l: "📊 Übersicht" },
              { k: "belege",     l: "📄 Belege" },
              { k: "materialien",l: "🧪 Material" },
            ].map(t => (
              <button key={t.k} onClick={() => setDashTab(t.k)}
                style={{ padding: "7px 14px", borderRadius: 20, border: "none", background: dashTab === t.k ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)", color: dashTab === t.k ? "#fff" : "rgba(255,255,255,0.55)", cursor: "pointer", fontSize: 12, fontWeight: dashTab === t.k ? 700 : 400, fontFamily: "inherit", transition: "all .15s" }}>
                {t.l}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* PIN-Eingabe */}
      {!unlocked && (
        <div style={{ padding: "40px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: tc, fontFamily: "Georgia,serif" }}>🔐 Dashboard-Zugang</div>
          <div style={{ fontSize: 13, color: T.gray }}>Nur für Geschäftsleitung · Standard-PIN: 9999</div>
          {pinErr && <div style={{ color: T.err, fontSize: 13, fontWeight: 700, animation: `shake .36s ${EIO}` }}>{pinErr}</div>}
          <PinPad
            onSubmit={pin => {
              if (pin === "9999") {
                setPinErr("");
                setUnlocked(true);
              } else {
                setPinErr("Falscher PIN — bitte erneut versuchen");
                setTimeout(() => setPinErr(""), 2000);
              }
            }}
            error={pinErr}
          />
        </div>
      )}

      {/* INHALT: Übersicht */}
      {unlocked && dashTab === "overview" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "18px" }}>
          {/* KPI Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
            <KPIBox label="Aktive Aufträge" value={aktive.length} icon="📋" color={T.ch} dark={dark} />
            <KPIBox label="Bereit" value={bereit.length} icon="✅" color={T.ok} dark={dark} />
            <KPIBox label="Überfällig" value={überfällig.length} icon="⚠" color={T.err} alarm={überfällig.length > 0} dark={dark} />
          </div>

          {/* Aktivster Zahnarzt */}
          {topArzt && (
            <Card dark={dark} style={{ marginBottom: 14 }}>
              <SectionLabel>Aktivster Zahnarzt/Ärztin</SectionLabel>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: topArzt[1].farbe, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                  {topArzt[0].replace(/Dr\.?\s*/i, "").trim().charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: tc }}>{topArzt[0]}</div>
                  <div style={{ fontSize: 12, color: T.gray }}>{topArzt[1].count} Aufträge</div>
                </div>
              </div>
            </Card>
          )}

          {/* Überfällige */}
          {überfällig.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <SectionLabel>Überfällige Aufträge</SectionLabel>
              {überfällig.slice(0, 6).map(a => (
                <div key={a.id} onClick={() => { onDetail(a); onClose(); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", background: dark ? "#2A1000" : T.errLt, borderRadius: 11, marginBottom: 7, cursor: "pointer", border: `1px solid ${T.err}30` }}
                  onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.97)"}
                  onMouseLeave={e => e.currentTarget.style.filter = ""}>
                  <span style={{ fontSize: 16 }}>⚠</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: T.err }}>{a.patient}</div>
                    <div style={{ fontSize: 11, color: T.gray }}>{a.zahnarzt} · Fällig: {fmtDate(a.faelligkeit)}</div>
                  </div>
                  <span style={{ color: T.err }}>›</span>
                </div>
              ))}
            </div>
          )}

          {/* Bereit */}
          {bereit.length > 0 && (
            <div>
              <SectionLabel>Bereit zur Einprobe ({bereit.length})</SectionLabel>
              {bereit.slice(0, 6).map(a => (
                <div key={a.id} onClick={() => { onDetail(a); onClose(); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 13px", background: dark ? "#001A0A" : T.okLt, borderRadius: 11, marginBottom: 7, cursor: "pointer", border: `1px solid ${T.ok}30` }}
                  onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.97)"}
                  onMouseLeave={e => e.currentTarget.style.filter = ""}>
                  <span style={{ fontSize: 16 }}>✅</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: T.ok }}>{a.patient}</div>
                    <div style={{ fontSize: 11, color: T.gray }}>{a.zahnarzt} · {a.arbeitstyp}</div>
                  </div>
                  <span style={{ color: T.ok }}>›</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* INHALT: Belege */}
      {unlocked && dashTab === "belege" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Belege-KPIs */}
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${brd}`, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, flexShrink: 0 }}>
            {[
              { label: "Gesamt", value: docsTotal, color: T.ch },
              { label: "Offen (€)", value: `€ ${docsOffenSumme.toFixed(0)}`, color: T.warn },
              { label: "Unbezahlt", value: docsOffen, color: T.err },
              { label: "Gesamt €", value: `€ ${docsSumme.toFixed(0)}`, color: T.sage },
            ].map(k => (
              <div key={k.label} style={{ textAlign: "center", padding: "8px 4px", background: card, borderRadius: 12, border: `1px solid ${brd}` }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: k.color, fontFamily: "Georgia,serif" }}>{k.value}</div>
                <div style={{ fontSize: 9, color: T.gray, textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 2 }}>{k.label}</div>
              </div>
            ))}
          </div>
          {/* Filter */}
          <div style={{ padding: "10px 18px", borderBottom: `1px solid ${brd}`, display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0 }}>
            <button onClick={loadDocs} title="Aktualisieren" style={{ background: "transparent", border: `1px solid ${brd}`, borderRadius: 9, padding: "5px 10px", cursor: "pointer", color: T.gray, fontSize: 13 }}>↻</button>
            {DOC_FILTERS.map(([k, l]) => {
              const ps = k !== "alle" ? getPS(k) : null;
              return (
                <button key={k} onClick={() => setDocsFilter(k)}
                  style={{ padding: "6px 13px", borderRadius: 20, border: `1.5px solid ${docsFilter === k ? (ps?.color || T.sage) : brd}`, background: docsFilter === k ? (ps ? ps.bg : T.sageLt) : "transparent", color: docsFilter === k ? (ps?.color || T.sageDk) : T.gray, cursor: "pointer", fontSize: 11, fontWeight: docsFilter === k ? 700 : 400, fontFamily: "inherit" }}>
                  {l}
                </button>
              );
            })}
            <button onClick={() => setShowScanBeleg(true)}
              style={{ marginLeft: "auto", background: `linear-gradient(135deg,${T.sage},${T.sageDk})`, color: "#fff", border: "none", borderRadius: 9, padding: "6px 13px", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit" }}>
              ＋ Beleg scannen
            </button>
          </div>
          {/* Belegliste */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {docsLoading && <div style={{ display: "flex", justifyContent: "center", padding: 32 }}><Spinner size={32} color={T.sage} /></div>}
            {!docsLoading && docs.length === 0 && <EmptyState icon="📄" title="Keine Belege" sub="Noch keine Belege für diesen Filter" dark={dark} />}
            {!docsLoading && docs.map((doc, i) => {
              const ps = getPS(doc.payment_status || "offen");
              const docIcon = doc.document_type === "invoice" ? "🧾" : doc.document_type === "delivery_note" ? "📦" : "📋";
              const isUeberfaellig = doc.payment_status === "ueberfaellig";
              return (
                <div key={doc.id} onClick={() => setSelDoc(doc)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "13px 18px",
                    borderBottom: `1px solid ${brd}`,
                    borderLeft: `3px solid ${isUeberfaellig ? T.err : "transparent"}`,
                    background: isUeberfaellig ? (dark ? "#2A0800" : T.errLt) : card,
                    cursor: "pointer",
                    animation: `staggerIn .2s ${EO} ${i * 25}ms both`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.97)"}
                  onMouseLeave={e => e.currentTarget.style.filter = ""}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: T.sageLt, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                    {doc.file_url
                      ? <img src={doc.file_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} onError={e => { e.target.style.display = "none"; e.target.parentNode.textContent = docIcon; }} />
                      : docIcon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: isUeberfaellig ? T.err : tc, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.supplier_name || "Unbekannter Lieferant"}</div>
                    <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>
                      {doc.document_date || "–"}{doc.patient_name ? ` · ${doc.patient_name}` : ""}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {doc.total_amount > 0 && <div style={{ fontWeight: 800, fontSize: 15, color: tc, fontFamily: "Georgia,serif", marginBottom: 4 }}>€ {parseFloat(doc.total_amount).toFixed(2)}</div>}
                    <Badge color={ps.color} bg={ps.bg} size="sm">{ps.icon} {ps.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Beleg-Detail Sheet */}
          {selDoc && (
            <div style={{ position: "absolute", inset: 0, zIndex: 200, background: "rgba(44,40,37,0.7)", display: "flex", alignItems: "flex-end", borderRadius: 20, overflow: "hidden" }} onClick={() => setSelDoc(null)}>
              <div style={{ background: dark ? T.dcard : "#fff", borderRadius: "16px 16px 0 0", width: "100%", maxHeight: "85%", overflowY: "auto", padding: 22, animation: `slideUp .3s ${EO} both` }} onClick={e => e.stopPropagation()}>
                <div style={{ width: 44, height: 4, borderRadius: 2, background: dark ? T.dbrd : T.sand, margin: "0 auto 18px" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 20, color: tc, fontFamily: "Georgia,serif" }}>{selDoc.supplier_name || "Beleg"}</div>
                    <div style={{ fontSize: 12, color: T.gray, marginTop: 3 }}>
                      {selDoc.document_type === "invoice" ? "🧾 Rechnung" : selDoc.document_type === "delivery_note" ? "📦 Lieferschein" : "📋 Dokument"}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                    <Badge color={getPS(selDoc.payment_status || "offen").color} bg={getPS(selDoc.payment_status || "offen").bg}>
                      {getPS(selDoc.payment_status || "offen").icon} {getPS(selDoc.payment_status || "offen").label}
                    </Badge>
                    {/* Geschäftsleitung kann Status ändern */}
                    <Btn variant="ghost" size="sm" onClick={() => setShowPayment(true)}>Zahlstatus ändern ↓</Btn>
                  </div>
                </div>
                {/* Betrag-Box */}
                {selDoc.total_amount > 0 && (
                  <div style={{ background: T.sageLt, borderRadius: 12, padding: "14px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: T.sageDk, fontWeight: 700 }}>Gesamtbetrag</span>
                    <span style={{ fontSize: 24, fontWeight: 800, color: T.sageDk, fontFamily: "Georgia,serif" }}>€ {parseFloat(selDoc.total_amount).toFixed(2)}</span>
                  </div>
                )}
                {/* Details */}
                {[["Rechnungs-Nr.", selDoc.document_number], ["Datum", selDoc.document_date], ["Patient", selDoc.patient_name], ["Behandlung", selDoc.treatment_name]].filter(([, v]) => v).map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${brd}` }}>
                    <span style={{ fontSize: 12, color: T.gray, fontWeight: 700 }}>{l}</span>
                    <span style={{ fontSize: 13, color: tc, fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
                {/* Original-Link */}
                {selDoc.file_url && (
                  <a href={selDoc.file_url} target="_blank" rel="noreferrer"
                    style={{ display: "block", marginTop: 14, background: T.sageLt, color: T.sageDk, borderRadius: 11, padding: "12px", textAlign: "center", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                    🔗 Original öffnen / Herunterladen
                  </a>
                )}
                {selDoc.file_url && (
                  <a href={selDoc.file_url} download
                    style={{ display: "block", marginTop: 8, background: dark ? T.dbg : T.ivory, color: tc, border: `1px solid ${brd}`, borderRadius: 11, padding: "11px", textAlign: "center", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                    ⬇ Herunterladen
                  </a>
                )}
              </div>
            </div>
          )}

          {/* PaymentModal */}
          {showPayment && selDoc && (
            <PaymentModal
              doc={selDoc} dark={dark}
              onClose={() => setShowPayment(false)}
              onUpdate={upd => {
                setDocs(p => p.map(d => d.id === upd.id ? { ...d, ...upd } : d));
                setSelDoc(s => ({ ...s, ...upd }));
              }}
            />
          )}
          {/* Beleg-Scan */}
          {showScanBeleg && <BelegeModal onClose={() => { setShowScanBeleg(false); loadDocs(); }} dark={dark} />}
        </div>
      )}

      {/* INHALT: Materialien */}
      {unlocked && dashTab === "materialien" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "18px" }}>
          <div style={{ color: T.gray, fontSize: 13, marginBottom: 14 }}>Vollständige Materialverwaltung im Materialcontrolling-Modul.</div>
          <Btn variant="primary" onClick={() => { onClose(); /* Trigger materials modal in parent */ }}>
            🧪 Materialcontrolling öffnen
          </Btn>
        </div>
      )}
    </Modal>
  );
}


function MaterialsModal({onClose,dark}) {
  const [mats,setMats]=useState([]); const [loading,setLoading]=useState(false); const [search,setSearch]=useState(""); const [tab,setTab]=useState("alle");
  const brd=dark?T.dbrd:T.sand; const tc=dark?T.dtxt:T.ch; const card=dark?T.dcard:"#fff";
  useEffect(()=>{
    const load=async()=>{setLoading(true);try{if(isConf()){const d=await sbReq("materials?order=name.asc");setMats(Array.isArray(d)?d:[]);}else{setMats([{id:"m1",name:"Zirkonoxid",einheit:"g",lagerbestand:250,min_bestand:100,preis:12.50,mapping_status:"mapped"},{id:"m2",name:"Composit",einheit:"ml",lagerbestand:30,min_bestand:50,preis:8.00,mapping_status:"partial"},{id:"m3",name:"Titan",einheit:"g",lagerbestand:5,min_bestand:20,preis:45.00,mapping_status:"unmapped"}]);}}catch(e){Monitor.error(e);}setLoading(false);};
    load();
  },[]);
  const warnings=mats.filter(m=>(m.lagerbestand||0)<(m.min_bestand||0));
  const unmapped=mats.filter(m=>!m.mapping_status||m.mapping_status==="unmapped");
  const filtered=mats.filter(m=>{
    if(tab==="warnungen") return(m.lagerbestand||0)<(m.min_bestand||0);
    if(tab==="unmapped") return!m.mapping_status||m.mapping_status==="unmapped";
    return !search||(m.name||"").toLowerCase().includes(search.toLowerCase());
  });
  return(
    <Modal onClose={onClose} dark={dark} width="min(680px,100vw)" maxH="88vh">
      <ModalHeader title="🧪 Materialcontrolling" onClose={onClose} dark={dark}/>
      {/* Tab bar + warnings banner */}
      {(warnings.length>0||unmapped.length>0)&&(
        <div style={{padding:"10px 16px",background:T.errLt,borderBottom:`1px solid ${T.err}30`,display:"flex",gap:12,alignItems:"center"}}>
          {warnings.length>0&&<span style={{fontSize:12,color:T.err,fontWeight:700}}>⚠ {warnings.length} Materialien unter Mindestbestand</span>}
          {unmapped.length>0&&<span style={{fontSize:12,color:T.warn,fontWeight:700}}>🔗 {unmapped.length} Materialien nicht gemappt</span>}
        </div>
      )}
      <div style={{display:"flex",gap:0,borderBottom:`1px solid ${brd}`,flexShrink:0}}>
        {[["alle","Alle"],["warnungen",`Warnungen ${warnings.length>0?`(${warnings.length})`:""}`],["unmapped",`Nicht gemappt ${unmapped.length>0?`(${unmapped.length})`:""}` ]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:"10px 6px",background:"transparent",border:"none",borderBottom:`2.5px solid ${tab===k?T.sage:"transparent"}`,color:tab===k?T.sage:T.gray,cursor:"pointer",fontSize:12,fontWeight:tab===k?700:400,fontFamily:"inherit",marginBottom:-1}}>
            {l}
          </button>
        ))}
      </div>
      {tab==="alle"&&<div style={{padding:"10px 16px 0",borderBottom:`1px solid ${brd}`}}><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Material suchen…" dark={dark}/></div>}
      <div style={{flex:1,overflowY:"auto"}}>
        {loading&&<div style={{display:"flex",justifyContent:"center",padding:32}}><Spinner size={32} color={T.sage}/></div>}
        {!loading&&filtered.length===0&&<EmptyState icon="🧪" title="Keine Materialien" dark={dark}/>}
        {!loading&&filtered.length>0&&(
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:dark?T.dbrd:T.sand}}>
                {["Material","Einheit","Bestand","Min.","Status","Preis"].map(h=><th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:10,letterSpacing:"0.8px",fontWeight:700,color:tc}}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m,i)=>{
                const low=(m.lagerbestand||0)<(m.min_bestand||0);
                const ms=m.mapping_status==="mapped"?{color:T.ok,label:"✅ Gemappt"}:m.mapping_status==="partial"?{color:T.warn,label:"◑ Teilweise"}:{color:T.err,label:"❌ Fehlend"};
                return(
                  <tr key={m.id} style={{borderBottom:`1px solid ${brd}`,background:low?(dark?"#2A1000":T.errLt):i%2===0?(dark?undefined:T.ivory):undefined}}>
                    <td style={{padding:"10px 14px",fontWeight:600,color:tc,fontSize:13}}>{m.name}</td>
                    <td style={{padding:"10px 14px",color:T.gray,fontSize:12}}>{m.einheit||"–"}</td>
                    <td style={{padding:"10px 14px",fontWeight:700,color:low?T.err:T.ok,fontSize:13}}>{m.lagerbestand??"–"}</td>
                    <td style={{padding:"10px 14px",color:T.gray,fontSize:12}}>{m.min_bestand||"–"}</td>
                    <td style={{padding:"10px 14px"}}><span style={{fontSize:11,fontWeight:700,color:ms.color}}>{ms.label}</span></td>
                    <td style={{padding:"10px 14px",color:T.gray,fontSize:12}}>{m.preis?`€ ${parseFloat(m.preis).toFixed(2)}`:""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// ORDERS TAB CONTENT (Table + Kanban views)
// ═══════════════════════════════════════════════════════════════
function OrdersTab({aufträge,zahnärzte,unread,chatPreview,filterStatus,setFilterStatus,suche,setSuche,viewMode,setViewMode,onRowClick,dark}) {
  const bg=dark?T.dbg:T.ivory; const card=dark?T.dcard:"#fff"; const tc=dark?T.dtxt:T.ch; const brd=dark?T.dbrd:T.sand;
  const überfälligListe=aufträge.filter(a=>isLate(a));
  const gefiltert=aufträge.filter(a=>{
    const s=suche.toLowerCase();
    const matchSearch=!s||(a.patient||"").toLowerCase().includes(s)||(a.id||"").toLowerCase().includes(s)||(a.zahnarzt||"").toLowerCase().includes(s)||(a.arbeitstyp||"").toLowerCase().includes(s);
    const matchFilter=filterStatus==="Alle"||a.status===filterStatus;
    return matchSearch&&matchFilter;
  });
  return(
    <div>
      {/* Überfällig Banner */}
      {überfälligListe.length>0&&(
        <div style={{background:T.err,borderRadius:13,padding:"13px 18px",marginBottom:14,display:"flex",alignItems:"center",gap:12,animation:`slideDown .3s ${EO} both`}}>
          <span style={{fontSize:22}}>⚠</span>
          <div style={{flex:1}}><div style={{color:"#fff",fontWeight:700,fontSize:15}}>{überfälligListe.length} Auftrag{überfälligListe.length!==1?"aufträge":""} überfällig</div><div style={{color:"rgba(255,255,255,0.7)",fontSize:12,marginTop:2}}>{überfälligListe.slice(0,3).map(a=>`${a.patient} (${fmtDate(a.faelligkeit)})`).join(", ")}{überfälligListe.length>3?"…":""}</div></div>
        </div>
      )}
      {/* Search + Filter + View toggle */}
      <div style={{display:"flex",gap:12,marginBottom:14,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{flex:"1 1 200px",minWidth:180}}>
          <div style={{background:card,border:`1.5px solid ${brd}`,borderRadius:11,display:"flex",alignItems:"center",padding:"0 12px",gap:8}}>
            <span style={{color:T.gray,fontSize:14}}>🔍</span>
            <input value={suche} onChange={e=>setSuche(e.target.value)} placeholder="Patient, Zahnarzt, ID…" style={{flex:1,border:"none",outline:"none",fontSize:14,fontFamily:"inherit",padding:"9px 0",background:"transparent",color:tc}}/>
            {suche&&<button onClick={()=>setSuche("")} style={{background:"transparent",border:"none",color:T.gray,cursor:"pointer",fontSize:14}}>✕</button>}
          </div>
        </div>
        <div style={{display:"flex",gap:4}}>
          <button onClick={()=>setViewMode("table")} title="Tabellenansicht" style={{background:viewMode==="table"?T.sageLt:"transparent",border:`1.5px solid ${viewMode==="table"?T.sage:brd}`,color:viewMode==="table"?T.sageDk:T.gray,borderRadius:9,padding:"7px 11px",cursor:"pointer",fontSize:13}}>☰</button>
          <button onClick={()=>setViewMode("kanban")} title="Kanban" style={{background:viewMode==="kanban"?T.sageLt:"transparent",border:`1.5px solid ${viewMode==="kanban"?T.sage:brd}`,color:viewMode==="kanban"?T.sageDk:T.gray,borderRadius:9,padding:"7px 11px",cursor:"pointer",fontSize:13}}>⠿</button>
        </div>
      </div>
      {/* Filter Chips */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
        {["Alle",...STATUS_FLOW].map(s=>{const m=getSM(s);return(
          <button key={s} onClick={()=>setFilterStatus(s)} style={{background:filterStatus===s?(m?m.color:T.ch):card,color:filterStatus===s?"#fff":tc,border:`1.5px solid ${filterStatus===s?(m?m.color:T.ch):brd}`,borderRadius:20,padding:"6px 13px",cursor:"pointer",fontSize:11,fontWeight:filterStatus===s?700:400,transition:`all .15s ${EO}`,fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}}>
            {m&&s!=="Alle"&&<span>{m.icon}</span>}{s}
          </button>
        );})}
      </div>
      {/* Empty state */}
      {gefiltert.length===0&&(
        <EmptyState icon={suche?"🔍":"📋"} title={suche?"Keine Ergebnisse":"Keine Aufträge"} sub={suche?`Keine Aufträge für „${suche}"`:"Lege deinen ersten Auftrag an"} dark={dark}/>
      )}
      {/* TABLE VIEW */}
      {viewMode==="table"&&gefiltert.length>0&&(
        <div style={{background:card,borderRadius:16,overflow:"hidden",border:`1px solid ${brd}`,boxShadow:"0 2px 8px rgba(44,40,37,0.06)"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:T.brandDk}}>
                {["Nr.","Patient","Zahnarzt/in","Arbeitstyp","Eingang","Fälligkeit","Status","Priorität",""].map(h=>(
                  <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:10,letterSpacing:"0.8px",color:"rgba(255,255,255,0.7)",fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gefiltert.map((a,i)=><OrderRow key={a.id} a={a} zahnärzte={zahnärzte} unread={unread} chatPreview={chatPreview} onClick={()=>onRowClick(a)} dark={dark}/>)}
            </tbody>
          </table>
        </div>
      )}
      {/* KANBAN VIEW */}
      {viewMode==="kanban"&&gefiltert.length>0&&(
        <div style={{display:"flex",gap:14,overflowX:"auto",paddingBottom:16}}>
          {STATUS_FLOW.map(s=>(
            <KanbanCol key={s} status={s} orders={gefiltert.filter(a=>a.status===s)} onClick={onRowClick} dark={dark}/>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Patienten Tab Content ─────────────────────────────────────
function PatientsTab({patienten,zahnärzte,onAdd,onDelete,dark}) {
  const [search,setSearch]=useState(""); const [view,setView]=useState("liste");
  const [form,setForm]=useState({name:"",telefon:"",zahnarzt:""}); const [saving,setSaving]=useState(false); const [err,setErr]=useState("");
  const card=dark?T.dcard:"#fff"; const tc=dark?T.dtxt:T.ch; const brd=dark?T.dbrd:T.sand;
  const filtered=patienten.filter(p=>!search||(p.name||"").toLowerCase().includes(search.toLowerCase())||(p.telefon||"").includes(search));
  const save=async()=>{
    if(!form.name.trim()){setErr("Name ist Pflicht");return;} setSaving(true); setErr("");
    try{const np={id:"p"+Date.now().toString(36).toUpperCase(),name:form.name.trim(),telefon:form.telefon.trim(),zahnarzt:form.zahnarzt,created_at:new Date().toISOString()};await onAdd(np);setForm({name:"",telefon:"",zahnarzt:""});setView("liste");}
    catch(e){setErr(e.message||"Fehler");}
    setSaving(false);
  };
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:20,color:tc,fontFamily:"Georgia,serif"}}>👥 Patienten</div>
        {view==="liste"?<Btn variant="primary" size="sm" icon="＋" onClick={()=>setView("neu")}>Neuer Patient</Btn>:<Btn variant="ghost" size="sm" onClick={()=>setView("liste")}>← Liste</Btn>}
      </div>
      {view==="liste"&&<>
        <div style={{marginBottom:14}}><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Patient suchen…" dark={dark}/></div>
        {filtered.length===0&&<EmptyState icon="👥" title="Keine Patienten" sub="Noch keine Patienten angelegt" dark={dark}/>}
        {filtered.map(p=>(
          <div key={p.id} style={{background:card,border:`1px solid ${brd}`,borderRadius:14,padding:"14px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 3px rgba(44,40,37,0.05)"}}>
            <div style={{width:40,height:40,borderRadius:"50%",background:T.sageLt,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>👤</div>
            <div style={{flex:1}}><div style={{fontWeight:700,fontSize:14,color:tc}}>{p.name}</div>{p.telefon&&<div style={{fontSize:11,color:T.gray,marginTop:1}}>{p.telefon}</div>}{p.zahnarzt&&<div style={{fontSize:11,color:T.gray}}>{p.zahnarzt}</div>}</div>
            <button onClick={()=>onDelete(p.id)} style={{background:"transparent",border:"none",color:T.err,cursor:"pointer",fontSize:16,padding:4}}>🗑</button>
          </div>
        ))}
      </>}
      {view==="neu"&&(
        <div style={{background:card,borderRadius:16,padding:"20px",border:`1px solid ${brd}`}}>
          <div style={{fontWeight:700,fontSize:16,color:tc,fontFamily:"Georgia,serif",marginBottom:14}}>Neuer Patient</div>
          <div style={{marginBottom:10}}><SectionLabel>Name *</SectionLabel><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Vorname Nachname" dark={dark} autoFocus/></div>
          <div style={{marginBottom:10}}><SectionLabel>Telefon</SectionLabel><Input type="tel" value={form.telefon} onChange={e=>setForm(f=>({...f,telefon:e.target.value}))} placeholder="+49 170 …" dark={dark}/></div>
          <div style={{marginBottom:16}}><SectionLabel>Zahnarzt/Ärztin</SectionLabel>
            <Select value={form.zahnarzt} onChange={e=>setForm(f=>({...f,zahnarzt:e.target.value}))} dark={dark}>
              <option value="">— Wählen —</option>
              {zahnärzte.map(z=><option key={z.id} value={z.name}>{z.name}</option>)}
            </Select>
          </div>
          {err&&<div style={{color:T.err,fontSize:12,marginBottom:10}}>{err}</div>}
          <div style={{display:"flex",gap:10}}>
            <Btn variant="ghost" onClick={()=>setView("liste")}>Abbrechen</Btn>
            <Btn variant="primary" loading={saving} onClick={save} style={{flex:1,justifyContent:"center"}}>Patient speichern</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP CONTROLLER
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// FIX PART 3: NEUE NAVBAR + TABS + ÜBERARBEITETER MAIN APP
// - Belege aus Navbar entfernt (nur im Dashboard)
// - Chat als eigener Tab
// - Verpasst-System vollständig integriert
// ═══════════════════════════════════════════════════════════════

// ─── Überarbeitete TopNavbar (Belege entfernt) ────────────────
function TopNavbar({ onAction, unreadCount, missedCount, dark, loading }) {
  const ACTIONS = [
    { id: "search",     icon: "🔍",  title: "Globale Suche (⌘K)" },
    { id: "kalender",   icon: "📅",  title: "Fälligkeitskalender" },
    { id: "statistik",  icon: "📊",  title: "Statistik" },
    { id: "monat",      icon: "📋",  title: "Monatsbericht" },
    { id: "dashboard",  icon: "🏥",  title: "Dashboard Geschäftsleitung (inkl. Belege)" },
    { id: "materialien",icon: "🧪",  title: "Materialcontrolling" },
    { id: "pin",        icon: "🔐",  title: "PIN-Einstellungen" },
    { id: "logout",     icon: "🚪",  title: "Abmelden" },
    { id: "dark",       icon: dark ? "☀️" : "🌙", title: dark ? "Hell-Modus" : "Dunkelmodus" },
    { id: "email",      icon: "📧",  title: "E-Mail-Einstellungen" },
    { id: "smsein",     icon: "📱",  title: "SMS-Einstellungen" },
    { id: "smsvl",      icon: "💬",  title: "SMS-Vorlagen" },
    { id: "zahnärzte",  icon: "👨‍⚕️", title: "Zahnärzte verwalten" },
  ];
  return (
    <div style={{
      background: `linear-gradient(135deg,${T.brandDk},${T.brandMd})`,
      padding: "0 16px", height: 58,
      display: "flex", alignItems: "center", gap: 8,
      position: "sticky", top: 0, zIndex: 500,
      boxShadow: "0 2px 14px rgba(44,40,37,0.25)",
    }}>
      <Logo />
      <div style={{ flex: 1 }} />
      {loading && <Spinner size={16} color={T.sage} />}

      {/* 🔴 Verpasst-Badge (höchste Priorität — pulsierend) */}
      {missedCount > 0 && (
        <div
          onClick={() => onAction("chat")}
          style={{
            background: T.err, color: "#fff",
            borderRadius: 12, fontSize: 11, padding: "4px 10px",
            fontWeight: 800, cursor: "pointer", flexShrink: 0,
            animation: `pulse .8s infinite`,
            boxShadow: `0 0 0 3px ${T.err}40`,
            display: "flex", alignItems: "center", gap: 5,
          }}
        >
          ⚠ {missedCount} verpasst
        </div>
      )}

      {/* 🟠 Ungelesen-Badge */}
      {unreadCount > 0 && missedCount === 0 && (
        <div
          onClick={() => onAction("chat")}
          style={{
            background: T.warn, color: "#fff",
            borderRadius: 12, fontSize: 11, padding: "3px 9px",
            fontWeight: 800, cursor: "pointer", flexShrink: 0,
            animation: `ringPop .3s ${ESP}`,
          }}
        >
          💬 {unreadCount}
        </div>
      )}

      {/* Navbar-Buttons */}
      {ACTIONS.map(a => (
        <button key={a.id} onClick={() => onAction(a.id)} title={a.title}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.75)",
            borderRadius: 9, padding: "6px 9px", cursor: "pointer",
            fontSize: 13, transition: "background .1s", flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        >
          {a.icon}
        </button>
      ))}

      <Btn icon="＋" variant="primary" size="sm" onClick={() => onAction("new-order")} style={{ marginLeft: 4 }}>
        Neuer Auftrag
      </Btn>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HAUPT-APP (vollständig überarbeitet)
// ═══════════════════════════════════════════════════════════════
function PraxisApp() {
  React.useEffect(() => { Monitor.init(); setTimeout(reqNotifPermission, 3000); }, []);

  // ─── Auth ────────────────────────────────────────────────
  const [unlocked,    setUnlocked]    = useState(true); // PIN is optional comfort only — Supabase Auth is the real gate
  const [sbSession,   setSbSession]   = useState(() => sbAuth.getSession());
  const [authChecked, setAuthChecked] = useState(false);
  const [profileErr,  setProfileErr]  = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const loadProfile = useCallback(async (session) => {
    if (!session?.access_token || !isConf()) return;
    try {
      const res = await fetch(`${SB_URL}/rest/v1/profiles?id=eq.${session.user.id}&select=rolle,email`, {
        headers: { "apikey": SB_KEY, "Authorization": `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Profil nicht gefunden");
      const data = await res.json();
      if (!data?.[0]) { setProfileErr("Kein Profil — Administrator kontaktieren"); return; }
      setUserProfile(data[0]); setProfileErr(null);
    } catch(e) { setProfileErr(e.message); }
  }, []);
  const [dark, setDarkS]        = useState(getDark);
  const toggleDark = () => { const n = !dark; setDark(n); setDarkS(n); };

  // ─── Core Data ───────────────────────────────────────────
  const [aufträge,  setAufträge]  = useState([]);
  const [patienten, setPatienten] = useState([]);
  const [zahnärzte, setZahnärzte] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [connErr,   setConnErr]   = useState(false);
  const [onlineMsgP,setOnlineMsgP]= useState(false);
  const isFirstLoad = useRef(true);

  // ─── UI State ────────────────────────────────────────────
  // Tabs: auftraege | chat | patienten
  const [mainTab,      setMainTab]      = useState("auftraege");
  const [suche,        setSuche]        = useState("");
  const [filterStatus, setFilterStatus] = useState("Alle");
  const [viewMode,     setViewMode]     = useState("table");
  const [detail,       setDetail]       = useState(null);
  const [toast,        setToast]        = useState(null);

  // ─── Chat State ──────────────────────────────────────────
  const [ungeleseneChats, setUngeleseneChats] = useState({});
  const [chatPreview,     setChatPreview]     = useState({});
  const [allRecentMsgs,   setAllRecentMsgs]   = useState([]);
  const [missedMsgs,      setMissedMsgs]      = useState([]);
  const [showMissedOverlay, setShowMissedOverlay] = useState(false);
  const [openChatAid,     setOpenChatAid]     = useState(null); // auftrag_id for which chat is open
  const lastMissedNotif   = useRef(0);
  const dismissedMissed   = useRef(new Set()); // IDs die als "gesehen" markiert wurden

  // ─── Modals ──────────────────────────────────────────────
  const [showIntake,    setShowIntake]    = useState(false);
  const [showSearch,    setShowSearch]    = useState(false);
  const [showKalender,  setShowKalender]  = useState(false);
  const [showStatistik, setShowStatistik] = useState(false);
  const [showMonat,     setShowMonat]     = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showPin,       setShowPin]       = useState(false);
  const [showEmail,     setShowEmail]     = useState(false);
  const [showSmsvl,     setShowSmsvl]     = useState(false);
  const [showZahnärzte, setShowZahnärzte] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const [showBelege,    setShowBelege]    = useState(false);
  const [smsAuftrag,    setSmsAuftrag]    = useState(null);
  const [emailAuftrag,  setEmailAuftrag]  = useState(null);
  const [intakePrefill, setIntakePrefill] = useState(null);

  // ─── Toast helper ────────────────────────────────────────
  const showToast = useCallback((msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ─── Data Loading ────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setLoading(true);
      if (isConf()) {
        const [a, p, z] = await Promise.all([
          ordersService.getAll(),
          patientsService.getAll(),
          dentistsService.getAll(),
        ]);
        setAufträge(Array.isArray(a) ? a : []);
        setPatienten(Array.isArray(p) ? p : []);
        setZahnärzte(Array.isArray(z) ? z : []);
      }
      setConnErr(false);
      isFirstLoad.current = false;
    } catch (e) {
      Monitor.error(e);
      setConnErr(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Chat + Verpasst-Laden ────────────────────────────────
  const loadUnread = useCallback(async () => {
    try {
      if (!isConf()) return;
      const d = await chatService.getRecent();
      const msgs = Array.isArray(d) ? d : [];
      setAllRecentMsgs(msgs);

      const counts = {}; const previews = {};
      const MY_NAME = "Praxis";
      const newMissed = [];

      msgs.forEach(m => {
        const aid = ss(m.auftrag_id);
        if (!previews[aid] || new Date(m.erstellt_am) > new Date(previews[aid].ts))
          previews[aid] = { text: ss(m.text).slice(0, 55), ts: m.erstellt_am };

        const seen = Array.isArray(m.gelesen_von) ? m.gelesen_von : [];
        if (ss(m.absender) !== MY_NAME && !seen.includes(MY_NAME)) {
          counts[aid] = (counts[aid] || 0) + 1;
          // Verpasst-Check
          const age = Date.now() - new Date(m.erstellt_am).getTime();
          if (age > MISSED_THRESHOLD_MS && !dismissedMissed.current.has(ss(m.id))) {
            newMissed.push(m);
          }
        }
      });

      setUngeleseneChats(counts);
      const pm = {}; Object.entries(previews).forEach(([id, v]) => { pm[id] = v.text; });
      setChatPreview(pm);

      // Verpasste Nachrichten aktualisieren
      const filtered = newMissed.filter(m => !dismissedMissed.current.has(ss(m.id)));
      setMissedMsgs(filtered);

      if (filtered.length > 0) {
        // Sound starten
        startAlertSound();
        // Push-Notif alle 2 Minuten
        const now = Date.now();
        if (now - lastMissedNotif.current > 120000) {
          lastMissedNotif.current = now;
          pushNotif("⚠ Verpasste Nachrichten!", `${filtered.length} ungelesene Nachricht${filtered.length !== 1 ? "en" : ""} warten auf Sie.`, "chat");
        }
        // Overlay zeigen wenn neue verpasste Nachrichten (noch nicht im Overlay gesehen)
        setShowMissedOverlay(prev => !prev ? true : prev);
      } else {
        stopAlertSound();
        setShowMissedOverlay(false);
      }

      // Normale Chat-Push (nur neue, nicht verpasste)
      const newUnread = msgs.filter(m => {
        const seen = Array.isArray(m.gelesen_von) ? m.gelesen_von : [];
        return ss(m.absender) !== MY_NAME && !seen.includes(MY_NAME) && (Date.now() - new Date(m.erstellt_am).getTime()) < MISSED_THRESHOLD_MS;
      });
      if (newUnread.length > 0) {
        const last = newUnread[newUnread.length - 1];
        pushNotif("💬 " + ss(last.absender || "Neue Nachricht"), ss(last.text).slice(0, 80), "chat");
      }
    } catch {}
  }, []);

  useEffect(() => { if (unlocked) { load(); loadUnread(); } }, [load, loadUnread, unlocked]);
  useEffect(() => { const i = setInterval(load, 15000); return () => clearInterval(i); }, [load]);
  useEffect(() => { const i = setInterval(loadUnread, 8000); return () => clearInterval(i); }, [loadUnread]);

  // ─── Keyboard shortcut ───────────────────────────────────
  useEffect(() => {
    const h = e => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setShowSearch(true); } };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  // ─── WebSocket Realtime ──────────────────────────────────
  useEffect(() => {
    if (!isConf() || !unlocked) return;
    let ws, reconnTimer, pingTimer; let destroyed = false;
    const connect = () => {
      if (destroyed) return;
      try {
        ws = new WebSocket(`${SB_URL.replace("https://", "wss://")}/realtime/v1/websocket?apikey=${SB_KEY}&vsn=1.0.0`);
        ws.onopen = () => {
          if (destroyed) { ws.close(); return; }
          setConnErr(false);
          const sub = t => ws.send(JSON.stringify({ topic: t, event: "phx_join", payload: {}, ref: "r" }));
          sub("realtime:public:auftraege");
          sub("realtime:public:nachrichten");
          if (pingTimer) clearInterval(pingTimer);
          pingTimer = setInterval(() => { try { ws.send(JSON.stringify({ topic: "phoenix", event: "heartbeat", payload: {}, ref: "hb" })); } catch {} }, 25000);
        };
        ws.onmessage = e => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.event === "phx_reply") return;
            const tbl = msg.topic?.split(":")?.[2];
            if (tbl === "nachrichten") loadUnread();
            else load();
          } catch { load(); }
        };
        ws.onclose = () => { if (pingTimer) clearInterval(pingTimer); if (!destroyed) { setConnErr(true); reconnTimer = setTimeout(connect, 3500); } };
        ws.onerror = () => { try { ws.close(); } catch {} };
      } catch (e) { if (!destroyed) reconnTimer = setTimeout(connect, 5000); }
    };
    connect();
    const goOnline  = () => { setConnErr(false); setOnlineMsgP(true); setTimeout(() => setOnlineMsgP(false), 3200); if (!ws || ws.readyState > 1) connect(); load(); };
    const goOffline = () => setConnErr(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      destroyed = true;
      if (pingTimer) clearInterval(pingTimer);
      if (reconnTimer) clearTimeout(reconnTimer);
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      try { if (ws) ws.close(); } catch {}
    };
  }, [unlocked, load, loadUnread]);

  // ─── Chat öffnen ─────────────────────────────────────────
  const openChatForOrder = useCallback((aid, auftrag) => {
    // Verpasste für diesen Auftrag als gesehen markieren
    missedMsgs.filter(m => ss(m.auftrag_id) === aid).forEach(m => dismissedMissed.current.add(ss(m.id)));
    setMissedMsgs(prev => prev.filter(m => ss(m.auftrag_id) !== aid));
    // Auftrag-Detail öffnen mit Chat
    const a = auftrag || aufträge.find(x => x.id === aid);
    if (a) setDetail({ ...a, _openChat: true });
    setMainTab("auftraege");
    setShowMissedOverlay(false);
  }, [missedMsgs, aufträge]);

  const dismissAllMissed = useCallback(() => {
    missedMsgs.forEach(m => dismissedMissed.current.add(ss(m.id)));
    setMissedMsgs([]);
    stopAlertSound();
    setShowMissedOverlay(false);
  }, [missedMsgs]);

  // ─── Status change ───────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    const a = aufträge.find(x => x.id === id); if (!a) return;
    const oldStatus = a.status; const v = getV(a);
    const nv = [...v, { datum: today(), status: newStatus, notiz: "" }];
    const patch = { status: newStatus, verlauf: JSON.stringify(nv) };
    setAufträge(p => p.map(x => x.id !== id ? x : { ...x, ...patch }));
    if (detail?.id === id) setDetail(p => p ? { ...p, ...patch } : p);
    if (isConf()) {
      try {
        const freshArr = await sbReq(`auftraege?id=eq.${id}&select=status`);
        const fresh = freshArr?.[0];
        if (fresh && fresh.status !== oldStatus && fresh.status !== newStatus) {
          setAufträge(p => p.map(x => x.id !== id ? x : { ...x, status: oldStatus, verlauf: a.verlauf }));
          if (detail?.id === id) setDetail(p => p ? { ...p, status: oldStatus } : p);
          showToast("⚠ Konflikt: Auftrag wurde parallel geändert", "warn"); return;
        }
        await ordersService.update(id, { ...patch, updated_at: new Date().toISOString() });
        showToast(`✅ Status: ${newStatus}`);
        if (newStatus === "Bereit") pushNotif("✅ Auftrag fertig", `${a.patient} ist bereit zur Einprobe`, "bereit");
      } catch (e) {
        setAufträge(p => p.map(x => x.id !== id ? x : { ...x, status: oldStatus, verlauf: a.verlauf }));
        showToast("⚠ Status konnte nicht gespeichert werden", "warn");
      }
    } else { showToast(`✅ Status: ${newStatus}`); }
  };

  const handleNewOrder    = (a) => { setAufträge(p => [a, ...p]); showToast("✅ Auftrag angelegt"); setShowIntake(false); };
  const handleDuplicate   = (a) => {
    const dup = { ...a, id: genId(), eingang: today(), verlauf: JSON.stringify([{ datum: today(), status: "Eingang", notiz: `Dupliziert von ${a.id}` }]), fotos: "[]", status: "Eingang", created_at: new Date().toISOString() };
    if (isConf()) ordersService.insert(dup).catch(() => {});
    setAufträge(p => [dup, ...p]);
    showToast("✅ Auftrag dupliziert");
  };
  const handleAddPatient    = async p => { if (isConf()) await patientsService.insert(p); setPatienten(prev => [...prev, p]); showToast("✅ Patient gespeichert"); };
  const handleDeletePatient = async id => { if (isConf()) await patientsService.delete(id); setPatienten(p => p.filter(x => x.id !== id)); showToast("✅ Patient gelöscht"); };
  const handleAddZahnarzt   = async z => { if (isConf()) await dentistsService.insert(z); setZahnärzte(p => [...p, z]); };
  const handleDeleteZahnarzt = async id => { if (isConf()) await dentistsService.delete(id); setZahnärzte(p => p.filter(x => x.id !== id)); };

  const totalUnread  = Object.values(ungeleseneChats).reduce((s, n) => s + (n || 0), 0);
  const totalMissed  = missedMsgs.length;
  const bg    = dark ? T.dbg   : T.ivory;
  const card  = dark ? T.dcard : "#fff";
  const tc    = dark ? T.dtxt  : T.ch;
  const brd   = dark ? T.dbrd  : T.sand;

  const handleNavAction = (id) => {
    const actions = {
      search:      () => setShowSearch(true),
      kalender:    () => setShowKalender(true),
      statistik:   () => setShowStatistik(true),
      monat:       () => setShowMonat(true),
      dashboard:   () => setShowDashboard(true),
      materialien: () => setShowMaterials(true),
      pin:         () => setShowPin(true),
      dark:        () => toggleDark(),
      email:       () => setShowEmail(true),
      smsein:      () => showToast("SMS: Twilio-Keys in Netlify Environment Variables eintragen"),
      smsvl:       () => setShowSmsvl(true),
      "zahnärzte": () => setShowZahnärzte(true),
      "new-order": () => setShowIntake(true),
      "logout":    async () => { const s=sbAuth.getSession(); if(s?.access_token) await sbAuth.signOut(s.access_token); sbAuth.setSession(null); setUserProfile(null); setProfileErr(null); window.location.reload(); },
      "chat":      () => setMainTab("chat"),
      "chat-badge":() => setMainTab("chat"),
    };
    if (actions[id]) actions[id]();
  };

  useEffect(() => {
    const s = sbAuth.getSession();
    if (s?.access_token) { setSbSession(s); loadProfile(s); }
    setAuthChecked(true);
  }, [loadProfile]);

  if (!authChecked) return null;
  if (!sbSession?.access_token) {
    return <AuthLoginScreen onAuthSuccess={s => { sbAuth.setSession(s); setSbSession(s); loadProfile(s); }} />;
  }
  if (profileErr) {
    return (
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40,gap:16,fontFamily:"-apple-system,sans-serif"}}>
        <div style={{fontSize:48}}>⚠️</div>
        <div style={{fontWeight:700,fontSize:20,color:"#DC2626"}}>Kein Zugriff</div>
        <div style={{fontSize:14,color:"#78716C",textAlign:"center",maxWidth:280}}>{profileErr}</div>
        <button onClick={async()=>{ const s=sbAuth.getSession(); if(s?.access_token) await sbAuth.signOut(s.access_token); sbAuth.setSession(null); setSbSession(null); window.location.reload(); }} style={{background:"#DC2626",color:"#fff",border:"none",borderRadius:14,padding:"14px 28px",fontSize:15,fontWeight:700,cursor:"pointer"}}>Abmelden</button>
      </div>
    );
  }
  // Optional PIN (comfort only)
  if (!unlocked && getPINOn()) return <LoginScreen onUnlock={() => setUnlocked(true)} />;

  return (
    <div style={{ minHeight: "100vh", background: bg, fontFamily: "-apple-system,'Helvetica Neue',BlinkMacSystemFont,sans-serif" }}>
      <style>{CSS}</style>

      {/* Toast */}
      <Toast msg={toast?.msg} type={toast?.type} />

      {/* Offline Banner */}
      <OfflineBanner connErr={connErr} onlineMsg={onlineMsgP} />

      {/* Demo Banner */}
      {!isConf() && (
        <div style={{ background: T.brandDk, borderBottom: `2px solid ${T.sage}`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <span>⚠️</span>
          <div style={{ flex: 1, color: T.sage, fontSize: 12, fontWeight: 700 }}>Demo-Modus — Supabase-URL und Key eintragen, um live zu gehen</div>
        </div>
      )}

      {/* Navbar */}
      <TopNavbar onAction={handleNavAction} unreadCount={totalUnread} missedCount={totalMissed} dark={dark} loading={loading} />

      {/* 🔴 Verpasst-Banner (STICKY, direkt unter Navbar) */}
      <MissedBanner
        missedMsgs={missedMsgs}
        auftraege={aufträge}
        onOpenChat={(aid, auftrag) => openChatForOrder(aid, auftrag)}
        onDismiss={dismissAllMissed}
      />

      {/* Tabs (Aufträge | Chat | Patienten) */}
      <div style={{ background: card, borderBottom: `2px solid ${brd}`, display: "flex", position: "sticky", top: 58, zIndex: 400 }}>
        {[
          ["auftraege", "📋 Aufträge"],
          ["chat",      `💬 Chat${totalMissed > 0 ? ` ⚠${totalMissed}` : totalUnread > 0 ? ` · ${totalUnread}` : ""}`],
          ["patienten", "👥 Patienten"],
        ].map(([k, l]) => (
          <button key={k} onClick={() => setMainTab(k)}
            style={{
              flex: 1, padding: "12px 16px", background: "transparent", border: "none",
              borderBottom: `2.5px solid ${mainTab === k ? (k === "chat" && totalMissed > 0 ? T.err : T.sage) : "transparent"}`,
              color: mainTab === k ? (k === "chat" && totalMissed > 0 ? T.err : T.sage) : T.gray,
              cursor: "pointer", fontFamily: "inherit",
              fontWeight: mainTab === k ? 700 : 400,
              fontSize: 13, marginBottom: -2, transition: "color .15s",
              animation: k === "chat" && totalMissed > 0 ? `pulse 1s infinite` : undefined,
            }}>
            {l}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 20px 48px" }}>
        {/* Skeleton loader */}
        {loading && isFirstLoad.current && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} height={80} radius={14} />)}
          </div>
        )}

        {/* Aufträge Tab */}
        {mainTab === "auftraege" && (!loading || !isFirstLoad.current) && (
          <OrdersTab
            aufträge={aufträge} zahnärzte={zahnärzte}
            unread={ungeleseneChats} chatPreview={chatPreview}
            filterStatus={filterStatus} setFilterStatus={setFilterStatus}
            suche={suche} setSuche={setSuche}
            viewMode={viewMode} setViewMode={setViewMode}
            onRowClick={a => setDetail(a)}
            dark={dark}
          />
        )}

        {/* Chat Tab */}
        {mainTab === "chat" && (
          <ChatUebersicht
            auftraege={aufträge}
            ungeleseneChats={ungeleseneChats}
            chatPreview={chatPreview}
            missedMsgs={missedMsgs}
            allRecentMsgs={allRecentMsgs}
            userName="Praxis"
            onOpenChat={(aid, auftrag) => openChatForOrder(aid, auftrag)}
            dark={dark}
          />
        )}

        {/* Patienten Tab */}
        {mainTab === "patienten" && (
          <PatientsTab patienten={patienten} zahnärzte={zahnärzte} onAdd={handleAddPatient} onDelete={handleDeletePatient} dark={dark} />
        )}
      </div>

      {/* ── OVERLAYS ── */}
      {detail && (
        <DetailPanel
          auftrag={detail} userName="Praxis" zahnärzte={zahnärzte} unread={ungeleseneChats}
          onStatusChange={handleStatusChange} onDuplicate={handleDuplicate}
          onClose={() => { setDetail(null); loadUnread(); }}
          onSmsSend={a => setSmsAuftrag(a)} onEmailSend={a => setEmailAuftrag(a)}
          onShowBelege={() => setShowDashboard(true)}
          dark={dark}
          autoOpenChat={detail?._openChat}
        />
      )}

      {showIntake   && <IntakeModal patienten={patienten} zahnärzte={zahnärzte} prefill={intakePrefill} onSave={handleNewOrder} onClose={() => { setShowIntake(false); setIntakePrefill(null); }} dark={dark} />}
      {showSearch   && <GlobalSearch aufträge={aufträge} patienten={patienten} onSelect={a => setDetail(a)} onClose={() => setShowSearch(false)} dark={dark} />}
      {smsAuftrag   && <SmsModal auftrag={smsAuftrag} onClose={() => setSmsAuftrag(null)} dark={dark} />}
      {emailAuftrag && <EmailModal auftrag={emailAuftrag} onClose={() => setEmailAuftrag(null)} dark={dark} />}
      {showBelege   && <BelegeModal onClose={() => setShowBelege(false)} dark={dark} />}
      {showKalender && <FaelligkeitModal aufträge={aufträge} onSelect={a => setDetail(a)} onClose={() => setShowKalender(false)} dark={dark} />}
      {showStatistik && <StatistikModal aufträge={aufträge} onClose={() => setShowStatistik(false)} dark={dark} />}
      {showMonat    && <MonatsberichtModal aufträge={aufträge} onClose={() => setShowMonat(false)} dark={dark} />}
      {showDashboard && (
        <DashboardModal
          aufträge={aufträge} zahnärzte={zahnärzte}
          onDetail={a => setDetail(a)}
          onClose={() => setShowDashboard(false)}
          dark={dark}
        />
      )}
      {showPin      && <PinSettingsModal onClose={() => setShowPin(false)} dark={dark} />}
      {showEmail    && <EmailSettingsModal onClose={() => setShowEmail(false)} dark={dark} />}
      {showSmsvl    && <SmsVorlagenModal onClose={() => setShowSmsvl(false)} dark={dark} />}
      {showZahnärzte && <DentistsModal zahnärzte={zahnärzte} onAdd={handleAddZahnarzt} onDelete={handleDeleteZahnarzt} onClose={() => setShowZahnärzte(false)} dark={dark} />}
      {showMaterials && <MaterialsModal onClose={() => setShowMaterials(false)} dark={dark} />}

      {/* 🔴 Verpasst-Overlay (blockierend bei erstem Auftreten) */}
      {showMissedOverlay && totalMissed > 0 && (
        <MissedOverlay
          count={totalMissed}
          onGo={() => { setShowMissedOverlay(false); setMainTab("chat"); stopAlertSound(); }}
          onLater={() => {
            setShowMissedOverlay(false);
            // In 5 Minuten erneut anzeigen
            setTimeout(() => { if (missedMsgs.length > 0) setShowMissedOverlay(true); }, 5 * 60 * 1000);
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════
export default function ZahnlaborApp() {
  const [dark] = useState(getDark);
  return <ErrorBoundary dark={dark}><PraxisApp /></ErrorBoundary>;
}

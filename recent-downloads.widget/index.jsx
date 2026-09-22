import { React } from "uebersicht";
// --- Inlined design system (self-contained; formerly theme.js) ---
// Shared design system for the widget set: color tokens, fonts, layout, the
// common card shell, drag/resize handles, a last-known-good cache, and the
// standard data-resolution helper. Imported by every widget so they stay
// visually and behaviorally consistent.
const T = {
  // Accent tints
  tintBlue: "#296BE0",
  tintPink: "#E86E87",
  tintGreen: "#59A875",
  tintOrange: "#D9946B",
  tintPurple: "#A861DE",

  // Cards
  cardLight: "rgba(255,255,255,0.74)",
  cardDark: "rgba(33,36,43,0.88)",

  // Ink (text on light)
  ink: "#1F2129",
  inkDim: "#616670",
  inkMute: "#8C919C",

  // Text on dark
  onDark: "#F7F7FA",
  onDarkDim: "#BDBFC7",
  onDarkMute: "#8F949E",

  // Walls (desktop stand-in backgrounds)
  wall1: "#F0F2F7",
  wall2: "#DBE3ED",
  wall3: "#BFC7DB",

  // GitHub ramp
  ghEmpty: "rgba(255,255,255,0.10)",
  ghGreen1: "#9CE8A8",
  ghGreen2: "#40C463",
  ghGreen3: "#30A14F",
  ghGreen4: "#216E38",

  // Scene colors
  nightSky: "#14141A",
  cosmicBase: "#0A051A",
  cosmicViolet: "#8C338C",
  cosmicMagenta: "#D9598C",
  cosmicIndigo: "#331A66",
  shaderPurple: "#402673",
  shaderTeal: "#268C8C",
  duskBase: "#4D408C",
  duskAmber: "#D9A666",
  duskPurple: "#8C4DA6",
  duskGlow: "#F28073",
  cardCream: "#F2F0E6",
  paperGrain: "#9E8052",

  archivePalette: [
    "#D98C4D", "#A64D33", "#733326", "#E0B359",
    "#8C6640", "#B88CCC", "#594D80", "#8C73BF",
    "#8CBF8C", "#4D8059", "#598CD9", "#334D8C",
  ],

  // Layout
  radius: "24px",
  captionTracking: "1.5px",
};

// Fonts. Install Instrument Serif, Geist, and Geist Mono for the intended look;
// each stack falls back to a system font if the family is missing.
const serif = "'Instrument Serif', Georgia, serif";
const sans = "'Geist', -apple-system, BlinkMacSystemFont, sans-serif";
const mono = "'Geist Mono', 'SF Mono', ui-monospace, monospace";

// Default desktop placement [x, y] per widget. Each widget calls
// card(variant, w, h, ...LAYOUT.<key>) so widgets lay out at distinct positions
// rather than stacking at the origin. These are overridden by any saved
// position from the drag handle.
const LAYOUT = {
  nowSpinning:  [380, 40],
  musicArchive: [40, 40],
  spatial:      [380, 200],
  mosaic:       [1120, 40],
  stack:        [1120, 486],
  drop:         [1120, 708],
  swap:         [380, 672],
  aiDailyPull:  [40, 368],
  apod:         [40, 576],
  atlas:        [1280, 224],
  tarot:        [1120, 224],
};

// Shared card shell. variant is "dark" or "light"; x/y set the on-desktop
// position. The common loading/empty/stale state styles are appended so every
// widget can render those states without repeating CSS.
const card = (variant, w, h, x = 0, y = 0) => `
  position: absolute;
  left: ${x}px; top: ${y}px;
  width: ${w}px;
  height: ${h}px;
  border-radius: ${T.radius};
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,0.35);
  background: ${variant === "dark" ? T.cardDark : T.cardLight};
  backdrop-filter: blur(20px);
  color: ${variant === "dark" ? T.onDark : T.ink};
  font-family: ${sans};
  box-sizing: border-box;
  transform-origin: top left;

  /* Promote each card to its own GPU layer so a sibling widget's frequent
     refresh cannot trigger a backdrop-filter recomposite, which otherwise made
     the blur flicker on and off. */
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;

  .ws-stale { position:absolute; top:8px; right:10px; z-index:5;
              font-family:${mono}; font-size:8px; letter-spacing:1px;
              text-transform:uppercase; opacity:0.72;
              color:${variant === "dark" ? T.onDarkMute : T.inkMute}; }
  .ws-empty { position:absolute; inset:0; display:flex; align-items:center;
              justify-content:center; padding:24px; text-align:center;
              font-family:${serif}; font-style:italic; font-size:18px;
              opacity:0.6; color:${variant === "dark" ? T.onDarkDim : T.inkDim}; }
  .ws-skel  { position:absolute; inset:14px; border-radius:14px; opacity:0.18;
              animation: ws-pulse 1.6s ease-in-out infinite; }
  @keyframes ws-pulse { 0%,100% { opacity:0.10; } 50% { opacity:0.24; } }
  @media (prefers-reduced-motion: reduce) {
    .ws-skel { animation:none; opacity:0.16; }
  }

  .ws-drag  { position:absolute; top:6px; left:6px; z-index:30;
              width:18px; height:18px; border-radius:6px;
              display:flex; align-items:center; justify-content:center;
              font-size:11px; line-height:1; cursor:grab; opacity:0.42;
              transition:opacity .15s ease; user-select:none;
              -webkit-user-select:none;
              color:${variant === "dark" ? T.onDarkMute : T.inkMute};
              background:${variant === "dark"
                ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; }
  .ws-drag:hover  { opacity:0.95; }
  .ws-drag:active { cursor:grabbing; }

  .ws-resize { position:absolute; bottom:5px; right:5px; z-index:30;
               width:16px; height:16px; border-radius:5px;
               display:flex; align-items:center; justify-content:center;
               font-size:11px; line-height:1; cursor:nwse-resize; opacity:0.42;
               transition:opacity .15s ease; user-select:none;
               -webkit-user-select:none;
               color:${variant === "dark" ? T.onDarkMute : T.inkMute};
               background:${variant === "dark"
                 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; }
  .ws-resize:hover { opacity:0.95; }
`;

// Small uppercase monospace caption used for metadata labels.
const caption = (color) => `
  font-family: ${mono};
  text-transform: uppercase;
  letter-spacing: ${T.captionTracking};
  color: ${color};
`;

// State helpers, returned as React elements (this is plain JS, not JSX).
const h = React.createElement;

// Loading: an accent-tinted skeleton block.
const Skel = ({ tint = T.tintBlue }) =>
  h("div", { className: "ws-skel", style: { background: tint } });

// Empty: a single quiet line of text.
const Empty = ({ text }) => h("div", { className: "ws-empty" }, text);

// Stale: a small marker showing the time of the last successful refresh.
const Stale = ({ ts }) =>
  h("div", { className: "ws-stale" }, `stale · ${clockStamp(ts)}`);

// Drag and resize support.
//
// Übersicht renders each widget into its own absolutely-positioned `.widget`
// node, all inside a shared `#uebersicht` container. The wrapper to move is the
// nearest `.widget` ancestor of a handle — not the topmost absolute element,
// which is the shared container.
//
// DragHandle updates the wrapper's left/top. ResizeHandle scales it uniformly
// via a top-left-anchored CSS transform, keeping these fixed-layout cards crisp
// instead of clipping. Both persist to localStorage, so position and size
// survive refreshes and reboots.
const posKey = (k) => `ws:pos:${k}`;
const scaleKey = (k) => `ws:scale:${k}`;
const MIN_SCALE = 0.4, MAX_SCALE = 3;

const findWrapper = (node) => node && node.closest(".widget");

// Apply any saved position and scale. Runs on every mount, since the wrapper
// may have been recreated on refresh.
const applySaved = (wrapper, key) => {
  try {
    const pos = JSON.parse(localStorage.getItem(posKey(key)) || "null");
    if (pos && typeof pos.x === "number") {
      wrapper.style.left = pos.x + "px";
      wrapper.style.top = pos.y + "px";
    }
  } catch (e) { /* storage unavailable */ }
  try {
    const scale = parseFloat(localStorage.getItem(scaleKey(key)));
    if (scale > 0) wrapper.style.transform = `scale(${scale})`;
  } catch (e) { /* storage unavailable */ }
};

const initDrag = (node, key) => {
  if (!node) return;
  const wrapper = findWrapper(node);
  if (!wrapper) return;
  applySaved(wrapper, key);

  if (node.__wsDragWired) return; // attach listeners once per node
  node.__wsDragWired = true;

  // Keep grip clicks from reaching the card's own onClick handler.
  node.addEventListener("click", (e) => e.stopPropagation());

  node.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const cs = getComputedStyle(wrapper);
    const origX = parseFloat(wrapper.style.left || cs.left) || 0;
    const origY = parseFloat(wrapper.style.top || cs.top) || 0;
    const onMove = (ev) => {
      wrapper.style.left = origX + (ev.clientX - startX) + "px";
      wrapper.style.top = origY + (ev.clientY - startY) + "px";
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      try {
        localStorage.setItem(posKey(key), JSON.stringify({
          x: parseFloat(wrapper.style.left) || 0,
          y: parseFloat(wrapper.style.top) || 0,
        }));
      } catch (e) { /* storage unavailable */ }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Double-click the grip to snap back to the card's default LAYOUT slot.
  node.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.removeItem(posKey(key)); } catch (e) { /* ignore */ }
    wrapper.style.left = "";
    wrapper.style.top = "";
  });
};

const initResize = (node, key) => {
  if (!node) return;
  const wrapper = findWrapper(node);
  if (!wrapper) return;
  applySaved(wrapper, key);

  if (node.__wsResizeWired) return;
  node.__wsResizeWired = true;

  node.addEventListener("click", (e) => e.stopPropagation());

  node.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const cs = getComputedStyle(wrapper);
    // Layout width/height are unaffected by transform, so they stay constant.
    const baseW = parseFloat(cs.width) || 1;
    const baseH = parseFloat(cs.height) || 1;
    const m = /scale\(([^)]+)\)/.exec(wrapper.style.transform || "");
    const origScale = m ? parseFloat(m[1]) || 1 : 1;
    const onMove = (ev) => {
      const delta = (ev.clientX - startX + (ev.clientY - startY)) / (baseW + baseH);
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, origScale + delta));
      wrapper.style.transform = `scale(${next})`;
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      const m2 = /scale\(([^)]+)\)/.exec(wrapper.style.transform || "");
      try { localStorage.setItem(scaleKey(key), String(m2 ? m2[1] : 1)); }
      catch (e) { /* storage unavailable */ }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Double-click the corner to restore the card's default size.
  node.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.removeItem(scaleKey(key)); } catch (e) { /* ignore */ }
    wrapper.style.transform = "";
  });
};

// Each handle takes the widget's LAYOUT key so position and scale are stored
// per widget. DragHandle renders top-left, ResizeHandle bottom-right.
const DragHandle = ({ k }) =>
  h("div", { className: "ws-drag", title: "Drag to move · double-click to reset",
             ref: (n) => initDrag(n, k) }, "☰");

const ResizeHandle = ({ k }) =>
  h("div", { className: "ws-resize", title: "Drag to resize · double-click to reset",
             ref: (n) => initResize(n, k) }, "⤡");

// Last-known-good cache, persisted in localStorage with a timestamp.
const remember = (key, data) => {
  try { localStorage.setItem(`ws:${key}`, JSON.stringify({ data, ts: Date.now() })); }
  catch (e) { /* storage unavailable; skip */ }
};

const recall = (key) => {
  try { return JSON.parse(localStorage.getItem(`ws:${key}`)); }
  catch (e) { return null; }
};

const clockStamp = (ms) =>
  new Date(ms).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

// True before the command has produced any output (the initial load tick).
const isLoading = ({ output, error }) =>
  output === undefined && !error;

// Standard data flow for command-backed widgets. parse(output) must return a
// falsy value when there is nothing usable.
//   loading -> { loading: true }            render <Skel/>
//   success -> { data }                     cached as last-known-good
//   failure -> { data, staleTs }            last-known-good + time, render <Stale/>
//   cold    -> { data, mock: true }         mock data, nothing cached yet
const resolve = (key, props, parse, mock) => {
  if (isLoading(props)) return { loading: true };
  let data = null;
  try { data = parse(props.output); } catch (e) { data = null; }
  if (data) { remember(key, data); return { data }; }
  const cached = recall(key);
  if (cached && cached.data) return { data: cached.data, staleTs: cached.ts };
  return { data: mock, mock: true };
};
// --- End inlined design system ---
// The three most recent files in Downloads, shown on a frosted-glass card with
// each file's real macOS preview above its name.
//
// Previews are produced by drop-icons.sh: a QuickLook content thumbnail when
// the file type supports one (images, PDFs, video), otherwise the NSWorkspace
// file-type icon, base64-encoded for inline rendering. When no preview is
// available a drawn type glyph is used. In-progress browser downloads are
// filtered out. Clicking a tile opens the file.
//
// The script path is relative: Übersicht runs commands with the widget's own
// Übersicht runs commands from the widgets ROOT, not the widget folder, so the
// script is referenced through the folder. Fall back to a bare name in case a
// given setup uses the widget folder as the working directory.
export const command =
  `if [ -f recent-downloads.widget/drop-icons.sh ]; then bash recent-downloads.widget/drop-icons.sh; ` +
  `else bash drop-icons.sh; fi`;

export const refreshFrequency = 1000 * 30; // every 30s

// File names use the system font to match Finder.
const sysFont = `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif`;
const FONTS = "recent-downloads.widget/fonts";
// A manila folder, front flap closed, with the three newest downloads as
// sheets standing inside it: a QuickLook preview on each, the name typed on
// the sheet, a paperclip on the first, and a red RECEIVED date stamp on the
// flap. Hover lifts a sheet; click opens the file.
export const className = card("dark", 380, 250, ...LAYOUT.drop) + `
  @font-face { font-family: "Special Elite"; src: url("${FONTS}/SpecialElite-400.woff2") format("woff2"); }
  --type: "Special Elite", "American Typewriter", serif; --manila: #E4C47A; --manila2: #D2AE62;
  background: transparent; box-shadow: none; backdrop-filter: none; padding: 0; overflow: visible; user-select:none; -webkit-user-select:none;
  .ws-drag { top: 6px; left: 140px; color: #6b5a3a; background: rgba(0,0,0,0.06); } .ws-resize { bottom: 8px; right: 8px; color: #6b5a3a; background: rgba(0,0,0,0.08); }
  .back { position:absolute; left: 0; right: 0; top: 26px; bottom: 0; border-radius: 4px 4px 6px 6px; background: linear-gradient(180deg, #D9B96D, #CDAB5C); box-shadow: 0 30px 50px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(120,90,30,0.4); }
  .back::before { content:""; position:absolute; inset:0; border-radius: inherit; opacity: 0.35; mix-blend-mode: multiply; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E"); }
  .tab { position:absolute; left: 12px; top: 0; width: 120px; height: 32px; border-radius: 4px 4px 0 0; background: linear-gradient(180deg, #DDBD70, #D9B96D); box-shadow: inset 0 0 0 1px rgba(120,90,30,0.4), inset 0 1px 0 rgba(255,255,255,0.35); }
  .label { position:absolute; left: 9px; right: 9px; top: 7px; height: 17px; background: #FBF7EA; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.12); font: 400 9px/17px var(--type); color: #2B2622; text-align:center; letter-spacing: 1.5px; text-transform: uppercase; }
  .front { position:absolute; left: 0; right: 0; top: 148px; bottom: 0; border-radius: 6px; z-index: 5; background: linear-gradient(180deg, var(--manila) 0%, #DDBB6E 60%, var(--manila2) 100%);
           box-shadow: 0 -6px 14px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 0 0 1px rgba(120,90,30,0.45), inset 0 -2px 0 rgba(0,0,0,0.12); }
  .front::before { content:""; position:absolute; inset:0; border-radius: inherit; opacity: 0.4; mix-blend-mode: multiply; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E"); }
  .papers { position:absolute; left: 0; right: 0; top: 36px; height: 200px; z-index: 2; }
  .paper { position:absolute; top: 0; width: 112px; height: 150px; background: #FCFBF6; border-radius: 1px; cursor:pointer; padding: 8px 8px 0; box-sizing: border-box; transform: rotate(var(--r, 0deg)); transform-origin: 50% 100%;
           box-shadow: 0 2px 6px rgba(0,0,0,0.25), 0 0 0 0.5px rgba(0,0,0,0.12); transition: transform .18s ease, box-shadow .18s ease; }
  .paper:hover { transform: rotate(var(--r, 0deg)) translateY(-10px); box-shadow: 0 10px 18px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(0,0,0,0.12); z-index: 3; }
  .paper::after { content:""; position:absolute; left: 8px; right: 8px; bottom: 8px; height: 30px; background: repeating-linear-gradient(180deg, rgba(0,0,0,0.12) 0 1px, transparent 1px 7px); opacity: 0.6; }
  .thumb { width: 96px; height: 74px; display:flex; align-items:center; justify-content:center; overflow:hidden; background: #F1EEE4; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08); }
  .thumb img { max-width: 100%; max-height: 100%; object-fit: contain; display:block; }
  .chip { width: 40px; height: 40px; border-radius: 8px; display:flex; align-items:center; justify-content:center; color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.25); }
  .chip svg { width: 22px; height: 22px; }
  .fname { margin-top: 6px; font: 400 9px/1.2 var(--type); color: #2B2622; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .fmeta { margin-top: 2px; font: 400 8px/1.2 var(--type); color: #8A8072; white-space:nowrap; overflow:hidden; }
  .clip { position:absolute; left: 10px; top: -7px; width: 12px; height: 30px; border: 2px solid #9AA1A8; border-radius: 6px; box-sizing: border-box; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7), 0 1px 1px rgba(0,0,0,0.25); z-index: 3; }
  .clip::after { content:""; position:absolute; left: 1px; top: 6px; width: 4px; height: 16px; border: 2px solid #9AA1A8; border-top: 0; border-radius: 0 0 4px 4px; }
  .stamp { position:absolute; right: 22px; top: 168px; z-index: 6; padding: 4px 8px; border: 2px double #B8322C; border-radius: 3px; transform: rotate(-7deg); color: #B8322C; font: 400 10px/1.2 var(--type); letter-spacing: 1.5px; text-transform: uppercase; text-align:center; opacity: 0.85; mix-blend-mode: multiply; }
  .empty { position:absolute; left: 0; right: 0; top: 76px; z-index: 2; text-align:center; font: 400 11px/1.2 var(--type); color: #6B5A3A; }
`;
const shq = (s) => `'${String(s).replace(/'/g, "'\\''")}'`;

// Truncate a long name in the middle while keeping the extension visible.
const midTrunc = (name, max = 30) => {
  if (name.length <= max) return name;
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot) : "";
  const base = dot > 0 ? name.slice(0, dot) : name;
  const keep = Math.max(4, max - ext.length - 1);
  const head = Math.ceil(keep * 0.6), tail = Math.floor(keep * 0.4);
  return base.slice(0, head) + "…" + base.slice(base.length - tail) + ext;
};

// Extension-to-category mapping (color + glyph) for the fallback chip shown
// when no preview or icon could be produced.
const CATS = [
  [["png","jpg","jpeg","gif","heic","heif","webp","tiff","bmp","svg"], "#3FA46A", "image"],
  [["zip","rar","7z","tar","gz","tgz","bz2"],                          "#D9946B", "archive"],
  [["dmg","iso","pkg"],                                                 "#A861DE", "disk"],
  [["pdf"],                                                             "#D9594D", "pdf"],
  [["doc","docx","pages","txt","md","rtf","key"],                       "#296BE0", "doc"],
  [["xls","xlsx","csv","numbers"],                                      "#2E9E6B", "sheet"],
  [["mp3","wav","flac","aiff","m4a","aac","ogg"],                       "#E86E87", "audio"],
  [["mp4","mov","mkv","avi","webm"],                                    "#D97A3D", "video"],
  [["js","jsx","ts","tsx","py","sh","json","html","css","c","cpp","java","go","rs","rb"], "#4A5160", "code"],
];
const cat = (ext) => {
  const e = ext.toLowerCase();
  for (const [list, color, icon] of CATS) if (list.includes(e)) return { color, icon };
  return { color: "#5A6070", icon: "file" };
};

const SVG = { fill: "none", stroke: "currentColor", strokeWidth: 1.8,
              strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24" };
const PAGE = <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5" />;
const Glyph = ({ name }) => {
  switch (name) {
    case "image":   return <svg {...SVG}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="M21 15l-5-4-11 9" /></svg>;
    case "archive": return <svg {...SVG}><path d="M3 7h18v13H3z" /><path d="M3 7l2-3h14l2 3" /><path d="M10 11h4" /></svg>;
    case "disk":    return <svg {...SVG}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.5" /></svg>;
    case "pdf":     return <svg {...SVG}>{PAGE}</svg>;
    case "doc":     return <svg {...SVG}>{PAGE}<path d="M9 13h6 M9 17h6" /></svg>;
    case "sheet":   return <svg {...SVG}><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 10h16 M4 15h16 M10 4v16" /></svg>;
    case "audio":   return <svg {...SVG}><path d="M9 18V6l10-2v12" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></svg>;
    case "video":   return <svg {...SVG}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 9l5 3-5 3z" /></svg>;
    case "code":    return <svg {...SVG}><path d="M9 8l-4 4 4 4 M15 8l4 4-4 4" /></svg>;
    default:        return <svg {...SVG}>{PAGE}</svg>;
  }
};

const parse = (output) =>
  (output || "").trim().split("\n").filter(Boolean).map((line) => {
    const parts = line.split("|"); const b64 = parts.pop() || ""; const path = parts.slice(2).join("|");
    const name = path.split("/").pop(); const dot = name.lastIndexOf("."); const ext = dot > 0 ? name.slice(dot + 1) : "";
    return { path, name, ext, b64, mtime: parseInt(parts[0], 10) || 0, size: parseInt(parts[1], 10) || 0 };
  });
const fmtSize = (b) => b >= 1e9 ? `${(b / 1e9).toFixed(1)} GB` : b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : b >= 1e3 ? `${Math.round(b / 1e3)} KB` : b ? `${b} B` : "";
const agoOf = (t) => { if (!t) return ""; const s = Math.max(0, Date.now() / 1000 - t); return s < 3600 ? `${Math.max(1, Math.round(s / 60))}m ago` : s < 86400 ? `${Math.round(s / 3600)}h ago` : `${Math.round(s / 86400)}d ago`; };
const TILT = ["-1.6deg", "0.9deg", "-0.5deg"];
let __dlSig = null, __dlEl = null;
const LEFTS = [22, 134, 246];
export const render = (props) => {
  if (isLoading(props)) return <Skel tint={T.inkMute} />;
  let rows = parse(props.output); let staleTs = null;
  let sample = false;
  if (rows.length) remember("drop", rows); else { const cached = recall("drop"); if (cached && cached.data && cached.data.length) { rows = cached.data; staleTs = cached.ts; } else { sample = true; rows = [
    { path: "", name: "Quarterly_plan_v3.pdf", ext: "pdf", b64: "", mtime: Date.now() / 1000 - 1800, size: 2.4e6 },
    { path: "", name: "IMG_2041.heic", ext: "heic", b64: "", mtime: Date.now() / 1000 - 9000, size: 3.1e6 },
    { path: "", name: "widget-suite.zip", ext: "zip", b64: "", mtime: Date.now() / 1000 - 86400, size: 14.2e6 } ]; } }
  const sig = JSON.stringify({ staleTs, sample, rows: rows.map((f) => [f.path, f.name, f.b64 ? f.b64.length : 0]) });
  if (sig === __dlSig && __dlEl) return __dlEl;
  __dlSig = sig;
  const newest = rows.reduce((a, f) => Math.max(a, f.mtime || 0), 0);
  const stampDate = newest ? new Date(newest * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : "";
  return (__dlEl = (
    <div aria-label={`${rows.length} recent downloads`}>
      <div className="tab"><div className="label">Downloads</div></div>
      <div className="back" />
      {rows.length ? (
        <div className="papers">
          {rows.slice(0, 3).map((f, i) => { const { color, icon } = cat(f.ext); return (
            <div className="paper" key={i} title={f.name} style={{ left: LEFTS[i], "--r": TILT[i % 3] }} onClick={() => f.path && run(`open ${shq(f.path)}`)}>
              {i === 0 ? <span className="clip" /> : null}
              <div className="thumb">{f.b64 ? <img src={`data:image/png;base64,${f.b64}`} alt="" /> : <div className="chip" style={{ background: `linear-gradient(160deg, ${color}, ${color}cc)` }}><Glyph name={icon} /></div>}</div>
              <div className="fname">{midTrunc(f.name, 22)}</div>
              <div className="fmeta">{[fmtSize(f.size), agoOf(f.mtime)].filter(Boolean).join(" · ")}</div>
            </div>); })}
        </div>
      ) : <div className="empty">Nothing in Downloads.</div>}
      <div className="front" />
      {sample ? <div className="stamp">Sample<br />sheets</div> : stampDate ? <div className="stamp">Received<br />{stampDate}</div> : null}
      <DragHandle k="drop" />
      <ResizeHandle k="drop" />
      {staleTs && <Stale ts={staleTs} />}
    </div>
  ));
};

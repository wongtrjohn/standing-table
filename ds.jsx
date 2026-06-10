// ds.jsx — Editorial design tokens, sample data, and rating atoms
// Exports to window: TOKENS, PLACES, CUISINE_META, fmt, atoms (Meter, ScoreGrid,
// StatusTag, PriceLevel, AgainTag, OverallBadge, Stars, Tag, Rule, KLabel)

// ── Inject base CSS (fonts loaded in HTML head) ───────────────────────────
(function injectCSS() {
  if (document.getElementById('fl-base-css')) return;
  const css = `
  :root{
    --paper:#FAF7F0; --paper-2:#F1ECE1; --card:#FFFDF8;
    --ink:#1C1815; --ink-2:#5B544B; --ink-3:#938B7E;
    --line:rgba(28,24,21,0.14); --line-2:rgba(28,24,21,0.07);
    --spot:#C2451E; --spot-2:#9C3416; --spot-soft:#F0DDD1;
    --green:#3E6B4F; --gold:#B7873B;
  }
  .serif{font-family:"Newsreader",Georgia,serif;}
  .sans{font-family:"Hanken Grotesk",system-ui,sans-serif;}
  .mono{font-family:"Spline Sans Mono",ui-monospace,monospace;}
  .fl *{box-sizing:border-box;}
  .kl{font-family:"Spline Sans Mono",monospace;text-transform:uppercase;
      letter-spacing:0.16em;font-size:10px;font-weight:500;color:var(--ink-3);}
  .num{font-family:"Spline Sans Mono",monospace;font-variant-numeric:tabular-nums;}
  .fl ::-webkit-scrollbar{width:8px;height:8px;}
  .fl ::-webkit-scrollbar-thumb{background:rgba(28,24,21,0.18);border-radius:4px;}
  .fl ::-webkit-scrollbar-track{background:transparent;}
  `;
  const el = document.createElement('style');
  el.id = 'fl-base-css';
  el.textContent = css;
  document.head.appendChild(el);
})();

const TOKENS = {
  paper:'#FAF7F0', paper2:'#F1ECE1', card:'#FFFDF8',
  ink:'#1C1815', ink2:'#5B544B', ink3:'#938B7E',
  line:'rgba(28,24,21,0.14)', line2:'rgba(28,24,21,0.07)',
  spot:'#C2451E', spot2:'#9C3416', spotSoft:'#F0DDD1',
  green:'#3E6B4F', gold:'#B7873B',
};

// cuisine → short code + hue dot
const CUISINE_META = {
  'French':       { code:'FR', dot:'#7C5CBF' },
  'Italian':      { code:'IT', dot:'#3E6B4F' },
  'Korean':       { code:'KR', dot:'#C2451E' },
  'Japanese':     { code:'JP', dot:'#B7873B' },
  'Mexican':      { code:'MX', dot:'#C9962B' },
  'Indian':       { code:'IN', dot:'#A0471E' },
  'Bakery':       { code:'BK', dot:'#9C7B4A' },
  'Vegetarian':   { code:'VG', dot:'#4F7A3A' },
  'Cocktail Bar': { code:'CK', dot:'#3D5A80' },
  'Gastropub':    { code:'GP', dot:'#7A4B2E' },
  'Coffee':       { code:'CF', dot:'#6B4A33' },
  'Thai':         { code:'TH', dot:'#2E8B7A' },
};

// status meta
const STATUS_META = {
  want:     { label:'Want to try', short:'Wishlist' },
  visited:  { label:'Visited',     short:'Visited' },
  reviewed: { label:'Reviewed',    short:'Reviewed' },
};

// ── Neighborhood coordinates (relative 0-100 on an SF grid) ──────────────
const HOOD_XY = {
  'Mission':        { x:58, y:62 },
  'Japantown':      { x:40, y:34 },
  'Hayes Valley':   { x:42, y:42 },
  'Inner Richmond': { x:24, y:28 },
  'North Beach':    { x:52, y:18 },
  'Tenderloin':     { x:48, y:36 },
  'Berkeley':       { x:70, y:8 },
  'SoMa':           { x:56, y:44 },
  'Outer Sunset':   { x:10, y:58 },
};

// ── Sample data ───────────────────────────────────────────────────────────
const PLACES = [
  { id:'saint-clair', name:'Saint-Clair', cuisine:'French', hood:'Mission',
    meal:['Dinner'], occasion:['Date'], status:'reviewed', price:3, date:'May 24',
    overall:9.1, s:{food:9.4,value:7.2,vibe:9.0,service:8.8}, again:true,
    dish:'Duck à l\u2019orange', tags:['Natural wine','Counter seats'],
    note:'A hushed seven-table room that treats butter like a love language. The duck is the reason to book three weeks out.',
    xy:{x:56,y:60} },
  { id:'koi-house', name:'Koi House', cuisine:'Japanese', hood:'Japantown',
    meal:['Dinner'], occasion:['Date'], status:'reviewed', price:4, date:'Apr 30',
    overall:9.3, s:{food:9.6,value:6.4,vibe:9.2,service:9.4}, again:true,
    dish:'Omakase, 17 courses', tags:['Omakase','Reservation only'],
    note:'Edomae omakase at a nine-seat hinoki counter. Glacial pacing, faultless rice. You pay for the silence and it is worth it.',
    xy:{x:40,y:32} },
  { id:'mill-crumb', name:'Mill & Crumb', cuisine:'Bakery', hood:'Hayes Valley',
    meal:['Breakfast'], occasion:['Quick bite'], status:'reviewed', price:1, date:'Jun 02',
    overall:8.9, s:{food:9.2,value:9.0,vibe:7.8,service:8.4}, again:true,
    dish:'Buckwheat croissant', tags:['Walk-in','Morning only'],
    note:'Laminated pastry with an audible shatter. Get there before nine or get nothing.',
    xy:{x:44,y:44} },
  { id:'hwaro', name:'Hwaro', cuisine:'Korean', hood:'Inner Richmond',
    meal:['Dinner'], occasion:['Group'], status:'reviewed', price:2, date:'May 11',
    overall:8.8, s:{food:9.0,value:8.6,vibe:8.2,service:8.0}, again:true,
    dish:'Galbi over charcoal', tags:['Charcoal grill','Banchan'],
    note:'Live coals, a forest of banchan, and the kind of smoke that follows you home happily.',
    xy:{x:22,y:30} },
  { id:'lupa', name:'Lupa Trattoria', cuisine:'Italian', hood:'North Beach',
    meal:['Dinner'], occasion:['Group'], status:'reviewed', price:2, date:'Apr 18',
    overall:8.4, s:{food:8.8,value:8.4,vibe:8.0,service:7.6}, again:true,
    dish:'Cacio e pepe', tags:['Loud','Family-style'],
    note:'Red-sauce energy with a serious pasta hand. Loud, generous, gone before you know it.',
    xy:{x:54,y:16} },
  { id:'dust-spice', name:'Dust & Spice', cuisine:'Indian', hood:'Tenderloin',
    meal:['Dinner'], occasion:['Quick bite'], status:'reviewed', price:2, date:'Mar 29',
    overall:8.6, s:{food:9.1,value:8.9,vibe:6.8,service:7.4}, again:true,
    dish:'Lamb nihari', tags:['Spice-forward','Cash only'],
    note:'No frills, all flame. The nihari is a slow Sunday in a bowl.',
    xy:{x:46,y:38} },
  { id:'verde', name:'Verde', cuisine:'Vegetarian', hood:'Berkeley',
    meal:['Lunch'], occasion:['Quick bite'], status:'reviewed', price:2, date:'Mar 12',
    overall:8.1, s:{food:8.4,value:8.0,vibe:8.2,service:7.6}, again:false,
    dish:'Charred broccoli, anchovy-less', tags:['Market menu','Patio'],
    note:'Vegetables treated like the main event. Lovely, if a touch precious about it.',
    xy:{x:72,y:6} },
  { id:'maya', name:'Maya Oaxaca', cuisine:'Mexican', hood:'Mission',
    meal:['Dinner'], occasion:['Group'], status:'visited', price:2, date:'Jun 05',
    overall:null, s:null, again:null, dish:'Mole negro', tags:['Mezcal list'],
    note:'',
    xy:{x:60,y:65} },
  { id:'tap-room', name:'The Tap Room', cuisine:'Gastropub', hood:'SoMa',
    meal:['Dinner'], occasion:['Group'], status:'visited', price:2, date:'Jun 07',
    overall:null, s:null, again:null, dish:'Dry-aged burger', tags:['Big beer list'],
    note:'',
    xy:{x:58,y:46} },
  { id:'blue-hour', name:'Blue Hour', cuisine:'Cocktail Bar', hood:'SoMa',
    meal:['Dinner'], occasion:['Date'], status:'want', price:3, date:null,
    overall:null, s:null, again:null, dish:null, tags:['Small plates','No reservations'], note:'',
    xy:{x:54,y:42} },
  { id:'kettle-stone', name:'Kettle & Stone', cuisine:'Coffee', hood:'Hayes Valley',
    meal:['Breakfast'], occasion:['Quick bite'], status:'want', price:1, date:null,
    overall:null, s:null, again:null, dish:null, tags:['Single origin'], note:'',
    xy:{x:40,y:46} },
  { id:'ban-thai', name:'Ban Thai House', cuisine:'Thai', hood:'Outer Sunset',
    meal:['Dinner'], occasion:['Date'], status:'want', price:2, date:null,
    overall:null, s:null, again:null, dish:null, tags:['BYOB'], note:'',
    xy:{x:12,y:56} },
];

const fmt = {
  score: (n) => (n == null ? '—' : n.toFixed(1)),
  axis: (k) => ({food:'Food',value:'Value',vibe:'Vibe',service:'Service'}[k]),
};

window.TOKENS = TOKENS;
window.PLACES = PLACES;
window.CUISINE_META = CUISINE_META;
window.STATUS_META = STATUS_META;
window.HOOD_XY = HOOD_XY;
window.fmt = fmt;

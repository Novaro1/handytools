
/* ───────────────────────────────────────────────────────────────
   TOOL REGISTRY
─────────────────────────────────────────────────────────────── */
const TOOLS = [
  { id:'json',      icon:'{ }', name:'JSON Formatter',        cat:'Developer' },
  { id:'base64',    icon:'B64', name:'Base64 Encoder',         cat:'Developer' },
  { id:'url',       icon:'URL', name:'URL Encoder',            cat:'Developer' },
  { id:'regex',     icon:'.*',  name:'Regex Tester',           cat:'Developer' },
  { id:'uuid',      icon:'UID', name:'UUID Generator',         cat:'Developer' },
  { id:'markdown',  icon:'MD',  name:'Markdown Preview',       cat:'Developer' },
  { id:'binary',    icon:'01',  name:'Text to Binary',         cat:'Developer' },
  { id:'subnet',    icon:'IP',  name:'IP Subnet Calc',         cat:'Developer' },
  { id:'wordcount', icon:'Wc',  name:'Word Counter',           cat:'Text'      },
  { id:'case',      icon:'Aa',  name:'Case Converter',         cat:'Text'      },
  { id:'lorem',     icon:'Lp',  name:'Lorem Ipsum',            cat:'Text'      },
  { id:'password',  icon:'***', name:'Password Generator',     cat:'Generators'},
  { id:'color',     icon:'RGB', name:'Color Converter',        cat:'Generators'},
  { id:'unit',      icon:'u→v', name:'Unit Converter',         cat:'Math & Dates'},
  { id:'percent',   icon:'%',   name:'Percentage Calc',        cat:'Math & Dates'},
  { id:'age',       icon:'Cal', name:'Age Calculator',         cat:'Math & Dates'},
  { id:'timestamp', icon:'⏱',  name:'Timestamp',              cat:'Math & Dates'},
];

const TOOL_SLUGS = {"json":"json-formatter","base64":"base64-encoder","url":"url-encoder","regex":"regex-tester","uuid":"uuid-generator","markdown":"markdown-preview","binary":"text-to-binary","subnet":"ip-subnet-calculator","wordcount":"word-counter","case":"case-converter","lorem":"lorem-ipsum-generator","password":"password-generator","color":"color-converter","unit":"unit-converter","percent":"percentage-calculator","age":"age-calculator","timestamp":"timestamp-converter"};
const TOOL_ICONS = {
  json:'{ }', base64:'🔤', url:'🔗', regex:'.*', uuid:'🪪', markdown:'📝',
  wordcount:'📊', case:'Aa', lorem:'📄', password:'🔐', color:'🎨',
  unit:'📏', percent:'%', age:'📅', timestamp:'⏱', binary:'01', subnet:'🌐'
};

let openMenu = null;
let currentView = 'icons';
let toolbarVisible = true;
let statusBarVisible = true;

function filterTools(q) {
  const filtered = q.trim() ? TOOLS.filter(t => t.name.toLowerCase().includes(q.toLowerCase())) : TOOLS;
  renderHome(filtered);
}

/* ── Navigation ── */
function showHome() {
  document.getElementById('view-home').style.display = '';
  document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tree-item').forEach(a => a.classList.remove('selected'));
  setStatus('Ready');
  document.getElementById('windowTitle').textContent = 'HandyTools';
}

function openTool(id) {
  document.getElementById('view-home').style.display = 'none';
  document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tree-item').forEach(a => a.classList.remove('selected'));
  const panel = document.getElementById('view-' + id);
  if (panel) panel.classList.add('active');
  const nav = document.getElementById('nav-' + id);
  if (nav) nav.classList.add('selected');
  const tool = TOOLS.find(t => t.id === id);
  const name = tool ? tool.name : id;
  setStatus(name);
  document.getElementById('windowTitle').textContent = 'HandyTools — ' + name;
  if (id === 'timestamp') startClock();
  if (id === 'unit') updateUnitOptions();
  if (id === 'color') colorFromPicker();
  if (id === 'age') {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('ageRef').value = today;
  }
}

function toggleCat(id) {
  const items = document.getElementById(id);
  const arrow = document.getElementById('arr-' + id);
  const collapsed = items.classList.toggle('collapsed');
  arrow.textContent = collapsed ? '▶' : '▼';
}

function setStatus(text) {
  document.getElementById('statusText').textContent = text;
}

/* ── Menu dropdowns ── */

function toggleMenu(id) {
  const el = document.getElementById('menu-' + id);
  const mi = document.getElementById('mi-' + id);
  const isOpen = el.classList.contains('open');
  closeMenus();
  if (!isOpen) {
    el.classList.add('open');
    mi.classList.add('active');
    openMenu = id;
  }
}

function closeMenus() {
  document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
  openMenu = null;
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.menu-container')) closeMenus();
});

/* ── View options ── */

function setView(type) {
  currentView = type;
  document.getElementById('check-icons').textContent = type === 'icons' ? '✓' : '';
  document.getElementById('check-list').textContent  = type === 'list'  ? '✓' : '';
  const q = document.getElementById('globalSearch').value;
  const list = q.trim() ? TOOLS.filter(t => t.name.toLowerCase().includes(q.toLowerCase())) : TOOLS;
  renderHome(list);
  closeMenus();
}

function toggleToolbar() {
  toolbarVisible = !toolbarVisible;
  document.querySelector('.toolbar').style.display = toolbarVisible ? '' : 'none';
  document.getElementById('check-toolbar').textContent = toolbarVisible ? '✓' : '';
  closeMenus();
}

function toggleStatusBar() {
  statusBarVisible = !statusBarVisible;
  document.querySelector('.status-bar').style.display = statusBarVisible ? '' : 'none';
  document.getElementById('check-status').textContent = statusBarVisible ? '✓' : '';
  closeMenus();
}

/* ── About / Shortcuts dialogs ── */
function showAbout()      { document.getElementById('aboutDialog').classList.add('open'); }
function hideAbout()      { document.getElementById('aboutDialog').classList.remove('open'); }
function showShortcuts()  { document.getElementById('shortcutsDialog').classList.add('open'); }
function hideShortcuts()  { document.getElementById('shortcutsDialog').classList.remove('open'); }

/* ── Keyboard shortcuts ── */
document.addEventListener('keydown', function(e) {
  if (e.altKey) {
    const map = { f:'file', v:'view', t:'tools', h:'help' };
    const key = e.key.toLowerCase();
    if (map[key]) { e.preventDefault(); toggleMenu(map[key]); return; }
  }
  if (e.key === 'Escape') {
    closeMenus();
    hideAbout();
    hideShortcuts();
    return;
  }
  if (e.key === 'F5') { e.preventDefault(); location.reload(); return; }
  if (e.key === 'Backspace' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) {
    e.preventDefault(); showHome(); return;
  }
  if (!e.altKey && !e.ctrlKey && !e.metaKey && ['INPUT','TEXTAREA','SELECT'].indexOf(document.activeElement.tagName) === -1) {
    const n = parseInt(e.key);
    if (n >= 1 && n <= 9 && TOOLS[n - 1]) { openTool(TOOLS[n - 1].id); }
  }
});

/* ── Render home (icons or list) ── */
function renderHome(list) {
  if (currentView === 'list') {
    renderListView(list);
  } else {
    renderIconView(list);
  }
}

function renderIconView(list) {
  const cats = {};
  list.forEach(t => { if (!cats[t.cat]) cats[t.cat] = []; cats[t.cat].push(t); });
  let html = '<div style="padding:6px;">';
  for (const [cat, tools] of Object.entries(cats)) {
    html += `<div class="cp-section-label">${cat}</div><div class="cp-grid">`;
    tools.forEach(t => {
      html += `<a class="cp-icon" href="/${TOOL_SLUGS[t.id]}" title="${t.name}">
        <div class="cp-icon-img">${TOOL_ICONS[t.id]||t.icon}</div>
        <div class="cp-icon-label">${t.name}</div>
      </a>`;
    });
    html += '</div>';
  }
  html += '</div>';
  document.getElementById('toolGrid').innerHTML = html;
}

function renderListView(list) {
  let html = '<table style="width:100%;border-collapse:collapse;font-size:11px;">';
  html += '<tr style="background:#000080;color:#fff;">'
        + '<th style="text-align:left;padding:2px 6px;font-weight:bold;">Name</th>'
        + '<th style="text-align:left;padding:2px 6px;font-weight:bold;">Category</th>'
        + '</tr>';
  list.forEach((t, i) => {
    const bg = i % 2 === 0 ? '#FFFFFF' : '#E8E8E8';
    html += `<tr style="cursor:pointer;background:${bg};"
      onclick="location.href='/'+TOOL_SLUGS['${t.id}']"
      onmouseover="this.style.background='#000080';this.style.color='#fff'"
      onmouseout="this.style.background='${bg}';this.style.color='#000'">
      <td style="padding:2px 6px;">${TOOL_ICONS[t.id] || ''} ${t.name}</td>
      <td style="padding:2px 6px;">${t.cat}</td>
    </tr>`;
  });
  html += '</table>';
  document.getElementById('toolGrid').innerHTML = html;
}

/* ── Clock ── */
function updateClock() {
  const now = new Date();
  const t = now.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'});
  document.getElementById('taskbarClock').textContent = t;
  const d = now.toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'});
  document.getElementById('statusDate').textContent = d;
}
updateClock();
setInterval(updateClock, 10000);

/* ── Helpers ── */
function copyEl(id) {
  const el = document.getElementById(id);
  const text = el.innerText.replace(/^Copy(\s?All)?/,'').trim();
  navigator.clipboard.writeText(text).then(() => {
    const btn = el.querySelector('.copy-btn');
    if (btn) { const p = btn.textContent; btn.textContent = 'Copied!'; setTimeout(()=>btn.textContent=p, 1500); }
  });
}

function clearEl(...ids) {
  ids.forEach(id => { if (!id) return; const el = document.getElementById(id); if (el) el.value !== undefined ? el.value = '' : el.textContent = ''; });
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ── JSON ── */
function formatJSON() {
  const err = document.getElementById('jsonError'), out = document.getElementById('jsonOutput');
  try {
    const obj = JSON.parse(document.getElementById('jsonInput').value);
    err.textContent = '';
    out.innerHTML = '<button class="copy-btn" onclick="copyEl(\'jsonOutput\')">Copy</button>' + escHtml(JSON.stringify(obj, null, 2));
  } catch(e) { err.textContent = 'ERROR: ' + e.message; out.textContent = ''; }
}

function minifyJSON() {
  const err = document.getElementById('jsonError'), out = document.getElementById('jsonOutput');
  try {
    const obj = JSON.parse(document.getElementById('jsonInput').value);
    err.textContent = '';
    out.innerHTML = '<button class="copy-btn" onclick="copyEl(\'jsonOutput\')">Copy</button>' + escHtml(JSON.stringify(obj));
  } catch(e) { err.textContent = 'ERROR: ' + e.message; }
}

/* ── Base64 ── */
function doBase64(mode) {
  const inp = document.getElementById('b64Input').value, out = document.getElementById('b64Output');
  try {
    const r = mode === 'encode' ? btoa(unescape(encodeURIComponent(inp))) : decodeURIComponent(escape(atob(inp)));
    out.innerHTML = '<button class="copy-btn" onclick="copyEl(\'b64Output\')">Copy</button>' + escHtml(r);
  } catch(e) { out.textContent = 'ERROR: ' + e.message; }
}

/* ── URL ── */
function doURL(mode) {
  const inp = document.getElementById('urlInput').value, out = document.getElementById('urlOutput');
  try {
    const r = mode === 'encode' ? encodeURIComponent(inp) : decodeURIComponent(inp);
    out.innerHTML = '<button class="copy-btn" onclick="copyEl(\'urlOutput\')">Copy</button>' + escHtml(r);
  } catch(e) { out.textContent = 'ERROR: ' + e.message; }
}

/* ── Regex ── */
function runRegex() {
  const pat = document.getElementById('regexPattern').value;
  const flags = document.getElementById('regexFlags').value;
  const text = document.getElementById('regexText').value;
  const info = document.getElementById('regexInfo');
  const hl = document.getElementById('regexHighlight');
  if (!pat) { info.textContent = ''; hl.textContent = text; return; }
  try {
    const re = new RegExp(pat, flags.includes('g') ? flags : flags + 'g');
    const matches = [...text.matchAll(re)];
    info.textContent = matches.length + ' match' + (matches.length !== 1 ? 'es' : '') + ' found';
    info.style.color = matches.length ? '#000080' : '#800000';
    let result = '', last = 0;
    matches.forEach(m => {
      result += escHtml(text.slice(last, m.index));
      result += '<mark class="rx">' + escHtml(m[0]) + '</mark>';
      last = m.index + m[0].length;
    });
    result += escHtml(text.slice(last));
    hl.innerHTML = result || escHtml(text);
  } catch(e) {
    info.textContent = 'ERROR: ' + e.message;
    info.style.color = '#800000';
    hl.textContent = text;
  }
}

/* ── UUID ── */
function genUUIDs() {
  const n = Math.min(100, Math.max(1, parseInt(document.getElementById('uuidCount').value) || 1));
  const uuids = Array.from({length: n}, () => uuid4());
  const out = document.getElementById('uuidOutput');
  out.innerHTML = '<button class="copy-btn" onclick="copyEl(\'uuidOutput\')">Copy All</button>' + uuids.join('\n');
}
function uuid4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}

/* ── Markdown ── */
function renderMarkdown() {
  const md = document.getElementById('mdInput').value;
  document.getElementById('mdPreview').innerHTML = parseMarkdown(md);
}
function parseMarkdown(md) {
  return md
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^###### (.+)$/gm,'<h6>$1</h6>').replace(/^##### (.+)$/gm,'<h5>$1</h5>')
    .replace(/^#### (.+)$/gm,'<h4>$1</h4>').replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`(.+?)`/g,'<code>$1</code>')
    .replace(/^\> (.+)$/gm,'<blockquote>$1</blockquote>')
    .replace(/^\- (.+)$/gm,'<li>$1</li>').replace(/(<li>.*<\/li>)/gs,'<ul>$1</ul>')
    .replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2">$1</a>')
    .replace(/\n\n/g,'</p><p>').replace(/^(?!<[hupbl])(.+)$/gm,'<p>$1</p>');
}

/* ── Word Counter ── */
function countWords() {
  const text = document.getElementById('wcText').value;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  document.getElementById('wc-words').textContent = words.toLocaleString();
  document.getElementById('wc-chars').textContent = text.length.toLocaleString();
  document.getElementById('wc-chars-ns').textContent = text.replace(/\s/g,'').length.toLocaleString();
  document.getElementById('wc-lines').textContent = (text ? text.split('\n').length : 0).toLocaleString();
  document.getElementById('wc-sentences').textContent = (text.match(/[.!?]+/g)||[]).length.toLocaleString();
  document.getElementById('wc-read').textContent = Math.max(1, Math.ceil(words/200)) + 'm';
}

/* ── Case Converter ── */
function convertCase(type) {
  const text = document.getElementById('caseInput').value;
  let r;
  switch(type) {
    case 'upper': r = text.toUpperCase(); break;
    case 'lower': r = text.toLowerCase(); break;
    case 'title': r = text.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase()); break;
    case 'sentence': r = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, m => m.toUpperCase()); break;
    case 'camel': r = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_,c) => c.toUpperCase()); break;
    case 'snake': r = text.trim().toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,''); break;
    case 'kebab': r = text.trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,''); break;
    case 'pascal': r = text.toLowerCase().replace(/(^\w|[^a-zA-Z0-9]\w)/g, m => m.replace(/[^a-zA-Z0-9]/g,'').toUpperCase()); break;
    default: r = text;
  }
  const out = document.getElementById('caseOutput');
  out.innerHTML = '<button class="copy-btn" onclick="copyEl(\'caseOutput\')">Copy</button>' + escHtml(r);
}

/* ── Lorem Ipsum ── */
const LOREM_WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');
function rWords(n) { return Array.from({length:n}, ()=>LOREM_WORDS[Math.floor(Math.random()*LOREM_WORDS.length)]).join(' '); }
function rSentence() { const w=rWords(Math.floor(Math.random()*12)+5); return w[0].toUpperCase()+w.slice(1)+'.'; }
function rParagraph() { return Array.from({length:Math.floor(Math.random()*4)+4}, rSentence).join(' '); }
function genLorem() {
  const count = parseInt(document.getElementById('loremCount').value)||3;
  const type  = document.getElementById('loremType').value;
  let result;
  if (type==='words') result = rWords(count);
  else if (type==='sentences') result = Array.from({length:count}, rSentence).join(' ');
  else result = Array.from({length:count}, rParagraph).join('\n\n');
  const out = document.getElementById('loremOutput');
  out.innerHTML = '<button class="copy-btn" onclick="copyEl(\'loremOutput\')">Copy</button>' + escHtml(result);
}

/* ── Password ── */
function genPassword(count) {
  const len  = parseInt(document.getElementById('passLen').value);
  const upper = document.getElementById('passUpper').checked;
  const lower = document.getElementById('passLower').checked;
  const nums  = document.getElementById('passNumbers').checked;
  const syms  = document.getElementById('passSymbols').checked;
  let chars = '';
  if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (nums)  chars += '0123456789';
  if (syms)  chars += '!@#$%^&*()-_=+[]{}|;:,.<>?';
  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';
  const n = typeof count === 'number' ? count : 1;
  const passwords = [];
  for (let i=0; i<n; i++) {
    let pw = '';
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    for (let j=0; j<len; j++) pw += chars[arr[j] % chars.length];
    passwords.push(pw);
  }
  const out = document.getElementById('passOutput');
  out.innerHTML = '<button class="copy-btn" onclick="copyEl(\'passOutput\')">Copy</button>' + passwords.join('\n');
  const str = len < 8 ? 'Weak' : len < 12 ? 'Fair' : len < 16 ? 'Strong' : 'Very Strong';
  document.getElementById('passStrength').textContent = 'Strength: ' + str;
}

/* ── Color ── */
function colorFromPicker() {
  const hex = document.getElementById('colorPicker').value;
  document.getElementById('hexInput').value = hex;
  updateColorOutputs(hexToRgb(hex));
}
function colorFromHex() {
  let hex = document.getElementById('hexInput').value.trim();
  if (!hex.startsWith('#')) hex = '#' + hex;
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return;
  document.getElementById('colorPicker').value = hex.length===4 ? '#'+hex.slice(1).split('').map(c=>c+c).join('') : hex;
  updateColorOutputs(hexToRgb(hex));
}
function colorFromRGB() {
  const parts = document.getElementById('rgbInput').value.split(',').map(s=>parseInt(s.trim()));
  if (parts.length < 3 || parts.some(isNaN)) return;
  const [r,g,b] = parts;
  updateColorOutputs({r,g,b});
  const hex = '#' + [r,g,b].map(v=>Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join('');
  document.getElementById('colorPicker').value = hex;
  document.getElementById('hexInput').value = hex;
}
function updateColorOutputs({r,g,b}) {
  const hex = '#' + [r,g,b].map(v=>Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join('');
  const hsl = rgbToHsl(r,g,b);
  document.getElementById('colorPreview').style.background = hex;
  document.getElementById('rgbInput').value = r+', '+g+', '+b;
  document.getElementById('hslInput').value = hsl.h+'°, '+hsl.s+'%, '+hsl.l+'%';
  const css = '--color: '+hex+';\n--color-rgb: '+r+', '+g+', '+b+';\n--color-hsl: '+hsl.h+'deg '+hsl.s+'% '+hsl.l+'%;';
  document.getElementById('colorCSS').innerHTML = '<button class="copy-btn" onclick="copyEl(\'colorCSS\')">Copy</button>' + escHtml(css);
}
function hexToRgb(hex) {
  let h = hex.replace('#','');
  if (h.length===3) h = h.split('').map(c=>c+c).join('');
  const n = parseInt(h,16);
  return {r:(n>>16)&255, g:(n>>8)&255, b:n&255};
}
function rgbToHsl(r,g,b) {
  r/=255;g/=255;b/=255;
  const max=Math.max(r,g,b),min=Math.min(r,g,b);
  let h,s,l=(max+min)/2;
  if(max===min){h=s=0;}else{
    const d=max-min; s=l>.5?d/(2-max-min):d/(max+min);
    switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;} h=Math.round(h/6*360);
  }
  return {h,s:Math.round(s*100),l:Math.round(l*100)};
}

/* ── Unit Converter ── */
const UNITS = {
  length:  {Meters:1,Kilometers:1000,Centimeters:0.01,Millimeters:0.001,Miles:1609.344,Yards:0.9144,Feet:0.3048,Inches:0.0254,'Nautical miles':1852},
  weight:  {Kilograms:1,Grams:0.001,Milligrams:0.000001,'Metric tons':1000,Pounds:0.453592,Ounces:0.0283495,Stone:6.35029},
  temp:    {Celsius:null,Fahrenheit:null,Kelvin:null},
  area:    {'Square meters':1,'Square kilometers':1e6,'Square centimeters':0.0001,Hectares:10000,Acres:4046.86,'Square feet':0.092903,'Square inches':0.000645},
  volume:  {Liters:1,Milliliters:0.001,'Cubic meters':1000,Gallons:3.78541,'Fluid ounces':0.0295735,Cups:0.236588,Pints:0.473176,Quarts:0.946353},
  speed:   {'m/s':1,'km/h':0.277778,mph:0.44704,Knots:0.514444},
  data:    {Bytes:1,Kilobytes:1024,Megabytes:1048576,Gigabytes:1073741824,Terabytes:1099511627776,Bits:0.125,Kilobits:128,Megabits:131072,Gigabits:134217728}
};
function updateUnitOptions() {
  const cat = document.getElementById('unitCat').value;
  const opts = Object.keys(UNITS[cat]);
  ['unitFrom','unitTo'].forEach((id,i) => {
    const sel = document.getElementById(id);
    sel.innerHTML = opts.map((o,j)=>`<option ${i===1&&j===1?'selected':''}>${o}</option>`).join('');
  });
  convertUnit();
}
function convertUnit() {
  const cat = document.getElementById('unitCat').value;
  const val = parseFloat(document.getElementById('unitValue').value);
  const from = document.getElementById('unitFrom').value;
  const to   = document.getElementById('unitTo').value;
  const out  = document.getElementById('unitOutput');
  if (isNaN(val)) { out.textContent = '—'; return; }
  let result;
  if (cat === 'temp') {
    let c; if (from==='Celsius') c=val; else if (from==='Fahrenheit') c=(val-32)*5/9; else c=val-273.15;
    if (to==='Celsius') result=c; else if (to==='Fahrenheit') result=c*9/5+32; else result=c+273.15;
  } else { result = val * UNITS[cat][from] / UNITS[cat][to]; }
  out.textContent = val + ' ' + from + ' = ' + (+result.toPrecision(8)) + ' ' + to;
}

/* ── Percentage ── */
function calcPercent1() {
  const x=parseFloat(document.getElementById('p1x').value), y=parseFloat(document.getElementById('p1y').value);
  document.getElementById('p1out').textContent = (!isNaN(x)&&!isNaN(y)) ? x+'% of '+y+' = '+(x/100*y).toFixed(6).replace(/\.?0+$/,'') : '';
}
function calcPercent2() {
  const x=parseFloat(document.getElementById('p2x').value), y=parseFloat(document.getElementById('p2y').value);
  document.getElementById('p2out').textContent = (!isNaN(x)&&!isNaN(y)&&y!==0) ? x+' is '+(x/y*100).toFixed(4).replace(/\.?0+$/,'')+'% of '+y : '';
}
function calcPercent3() {
  const x=parseFloat(document.getElementById('p3x').value), y=parseFloat(document.getElementById('p3y').value);
  const el=document.getElementById('p3out');
  if (!isNaN(x)&&!isNaN(y)&&x!==0) {
    const pct=((y-x)/Math.abs(x)*100);
    el.textContent = x+' → '+y+': '+(pct>=0?'+':'')+pct.toFixed(2)+'%';
    el.style.color = pct>=0 ? '#006400' : '#800000';
  } else el.textContent = '';
}

/* ── Age ── */
function calcAge() {
  const dob=new Date(document.getElementById('ageDob').value), ref=new Date(document.getElementById('ageRef').value);
  if (isNaN(dob)||isNaN(ref)||dob>ref) return;
  let y=ref.getFullYear()-dob.getFullYear(), mo=ref.getMonth()-dob.getMonth(), d=ref.getDate()-dob.getDate();
  if (d<0){mo--;d+=new Date(ref.getFullYear(),ref.getMonth(),0).getDate();}
  if (mo<0){y--;mo+=12;}
  const total=Math.floor((ref-dob)/(1000*60*60*24));
  document.getElementById('ageYears').textContent=y;
  document.getElementById('ageMonths').textContent=mo;
  document.getElementById('ageDays').textContent=d;
  document.getElementById('ageTotal').textContent=total.toLocaleString();
  document.getElementById('ageResult').style.display='block';
}

/* ── Timestamp ── */
let clockInterval = null;
function startClock() {
  clearInterval(clockInterval);
  clockInterval = setInterval(() => { document.getElementById('nowTs').textContent = Math.floor(Date.now()/1000); }, 1000);
  document.getElementById('nowTs').textContent = Math.floor(Date.now()/1000);
}
function tsToHuman() {
  const ts=parseInt(document.getElementById('tsUnix').value);
  const out=document.getElementById('tsHumanOut');
  if (isNaN(ts)){out.textContent='';return;}
  const d=new Date(ts*1000);
  out.textContent=d.toUTCString()+'\n'+d.toISOString();
}
function humanToTs() {
  const inp=document.getElementById('tsHuman').value;
  const d=new Date(inp);
  document.getElementById('tsUnixOut').textContent = isNaN(d) ? '' : Math.floor(d.getTime()/1000);
}

/* ── Text ↔ Binary ── */
function doBinary(mode) {
  const inp = document.getElementById('binInput').value;
  const out = document.getElementById('binOutput');
  try {
    let r;
    if (mode === 'encode') {
      const bytes = new TextEncoder().encode(inp);
      r = Array.from(bytes).map(b => b.toString(2).padStart(8,'0')).join(' ');
    } else {
      const groups = inp.trim().split(/\s+/).filter(Boolean);
      if (groups.some(g => !/^[01]{1,8}$/.test(g))) throw new Error('Input must be space-separated binary (0s and 1s)');
      r = new TextDecoder().decode(Uint8Array.from(groups.map(g => parseInt(g, 2))));
    }
    out.innerHTML = '<button class="copy-btn" onclick="copyEl(\'binOutput\')">Copy</button>' + escHtml(r);
  } catch(e) { out.textContent = 'ERROR: ' + e.message; }
}

/* ── IP Subnet Calculator ── */
function fillSubnetCidr() {
  const sel = document.getElementById('subnetCidr');
  if (!sel) return;
  sel.innerHTML = Array.from({length:33}, (_,i) => `<option value="${i}" ${i===24?'selected':''}>/${i}</option>`).join('');
}
function ipToInt(ip) {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = parseInt(p, 10);
    if (v > 255) return null;
    n = (n * 256) + v;
  }
  return n >>> 0;
}
function intToIp(n) { return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.'); }
function calcSubnet() {
  const out = document.getElementById('subnetOut');
  const btn = '<button class="copy-btn" onclick="copyEl(\'subnetOut\')">Copy</button>';
  const ip = ipToInt(document.getElementById('subnetIp').value);
  const cidr = parseInt(document.getElementById('subnetCidr').value, 10);
  if (ip === null) { out.innerHTML = btn + 'Enter a valid IPv4 address (e.g. 192.168.1.10)'; return; }
  const mask = cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0;
  const wildcard = (~mask) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | wildcard) >>> 0;
  const total = Math.pow(2, 32 - cidr);
  let firstHost, lastHost, usable;
  if (cidr >= 31) { firstHost = network; lastHost = broadcast; usable = cidr === 32 ? 1 : 2; }
  else { firstHost = (network + 1) >>> 0; lastHost = (broadcast - 1) >>> 0; usable = total - 2; }
  const rows = [
    ['Network address',  intToIp(network) + '/' + cidr],
    ['Subnet mask',      intToIp(mask)],
    ['Wildcard mask',    intToIp(wildcard)],
    ['Broadcast address',intToIp(broadcast)],
    ['Usable host range',intToIp(firstHost) + '  –  ' + intToIp(lastHost)],
    ['Usable hosts',     usable.toLocaleString()],
    ['Total addresses',  total.toLocaleString()],
  ];
  out.innerHTML = btn + escHtml(rows.map(r => r[0].padEnd(18) + r[1]).join('\n'));
}

/* ── Init ── */
renderHome(TOOLS);
genPassword();
colorFromPicker();
updateUnitOptions();
genUUIDs();
genLorem();
fillSubnetCidr();
calcSubnet();

if (window.PAGE_TOOL) { try { openTool(window.PAGE_TOOL); } catch(e){} }

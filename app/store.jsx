// store.jsx — Real persistence for The Standing Table working app.
// localStorage-backed place collection + photo compression + JSON backup.
// Loads after ds.jsx / photos.jsx (uses window.PLACES as optional sample seed).
// Exports: window.useCollection, window.compressPhoto, window.dbExport, window.dbImportFile,
//          window.newId, window.fmtDay, window.todayISO

const DB_KEY = 'standingTable.collection.v1';

// ── low-level read/write ──────────────────────────────────────────────────
function dbRead() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.places) ? parsed : null;
  } catch (e) { return null; }
}

function dbWrite(places) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify({ v: 1, savedAt: new Date().toISOString(), places }));
    return { ok: true };
  } catch (e) {
    // Most likely quota exceeded (too many photos)
    return { ok: false, error: e && e.name === 'QuotaExceededError'
      ? 'Storage is full — try removing some photos from older entries.'
      : 'Could not save. ' + (e && e.message ? e.message : '') };
  }
}

// ── helpers ───────────────────────────────────────────────────────────────
function newId() {
  return 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

// '2026-06-10' → 'Jun 10' (matches the editorial date style)
function fmtDay(iso) {
  if (!iso) return null;
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const parts = String(iso).split('-');
  if (parts.length !== 3) return iso; // already display-formatted (sample data)
  return m[parseInt(parts[1], 10) - 1] + ' ' + String(parseInt(parts[2], 10)).padStart(2, '0');
}

// Compress an uploaded photo to a small JPEG data-URL (fits localStorage budget)
function compressPhoto(file, maxDim = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
    img.src = url;
  });
}

// ── sample seed (from the design's demo data) ─────────────────────────────
function samplePlaces() {
  return (window.PLACES || []).map(p => ({
    ...p,
    photos: p.photo ? [p.photo] : [],
    sample: true,
    createdAt: new Date().toISOString(),
  }));
}

// ── backup / restore ──────────────────────────────────────────────────────
function dbExport(places) {
  const blob = new Blob([JSON.stringify({ app: 'The Standing Table', v: 1, exportedAt: new Date().toISOString(), places }, null, 2)],
    { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'standing-table-backup-' + todayISO() + '.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function dbImportFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        const places = Array.isArray(data) ? data : data.places;
        if (!Array.isArray(places)) throw new Error('No places found in file');
        resolve(places.map(p => ({ photos: [], tags: [], meal: [], occasion: [], ...p })));
      } catch (e) { reject(e); }
    };
    r.onerror = () => reject(new Error('Could not read file'));
    r.readAsText(file);
  });
}

// ── React hook: the whole collection API ──────────────────────────────────
function useCollection() {
  const [db, setDb] = React.useState(() => dbRead()); // null = first run
  const [saveError, setSaveError] = React.useState(null);
  const places = db ? db.places : null;

  const commit = (nextPlaces) => {
    const res = dbWrite(nextPlaces);
    setSaveError(res.ok ? null : res.error);
    setDb({ v: 1, places: nextPlaces });
  };

  return {
    places,            // null until seeded (first run) — show welcome screen
    saveError,
    seedSamples: () => commit(samplePlaces()),
    seedEmpty:   () => commit([]),
    addPlace: (p) => { const full = { id: newId(), createdAt: new Date().toISOString(), ...p }; commit([full, ...(places || [])]); return full.id; },
    updatePlace: (id, patch) => commit(places.map(p => p.id === id ? { ...p, ...patch } : p)),
    deletePlace: (id) => commit(places.filter(p => p.id !== id)),
    replaceAll: (next) => commit(next),
  };
}

Object.assign(window, { useCollection, compressPhoto, dbExport, dbImportFile, newId, fmtDay, todayISO });

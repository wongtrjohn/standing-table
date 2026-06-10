// app-screens.jsx — Working pipeline, detail, welcome + settings screens.
// Depends on ds.jsx, atoms.jsx, store.jsx. Exports: AppPipeline, AppDetail, AppWelcome, AppSettings

// ── card (reads real data: photos[], ISO dates) ───────────────────────────
function AppCard({ p, onTap }) {
  const reviewed = p.status === 'reviewed';
  const photo = (p.photos && p.photos[0]) || null;
  return (
    <button onClick={onTap} style={{
      width: '100%', textAlign: 'left', background: 'var(--card)', border: '1px solid var(--line)',
      borderRadius: 14, padding: 0, cursor: 'pointer', display: 'flex', overflow: 'hidden',
      boxShadow: '0 1px 0 rgba(28,24,21,0.03)',
    }}>
      <div style={{ flex: 1, padding: '12px 0 12px 13px', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="serif" style={{ fontSize: 16.5, fontWeight: 560, color: 'var(--ink)', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
              <window.CuisineDot cuisine={p.cuisine} showLabel />
              {p.hood ? <span style={{ color: 'var(--line)' }}>·</span> : null}
              {p.hood ? <span className="sans" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.hood}</span> : null}
            </div>
          </div>
          {reviewed && p.overall != null
            ? <div className="num" style={{ fontSize: 21, fontWeight: 600, color: 'var(--spot)', letterSpacing: '-0.02em', flexShrink: 0, marginRight: photo ? 0 : 13 }}>{p.overall.toFixed(1)}</div>
            : <span style={{ marginRight: photo ? 0 : 13 }}><window.PriceLevel level={p.price} size={12} color="var(--ink-3)" /></span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {p.date && <span className="kl">{p.status === 'want' ? 'Added' : 'Visited'} · {window.fmtDay(p.date)}</span>}
          {p.again != null && <window.AgainTag again={p.again} compact />}
          {p.status === 'want' && p.tags && p.tags[0] && <window.KLabel>{p.tags[0]}</window.KLabel>}
        </div>
      </div>
      {photo && (
        <div style={{
          width: 72, flexShrink: 0, alignSelf: 'stretch',
          backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center',
          borderLeft: '1px solid var(--line-2)',
        }}>
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to right, var(--card) 0%, transparent 40%)' }}></div>
        </div>
      )}
    </button>
  );
}

// ── pipeline ──────────────────────────────────────────────────────────────
const APP_LANES = [
  { key: 'want', label: 'Want to try', accent: 'var(--ink-3)' },
  { key: 'visited', label: 'Visited · needs review', accent: 'var(--ink-2)' },
  { key: 'reviewed', label: 'Reviewed', accent: 'var(--spot)' },
];

function AppPipeline({ places, onOpenPlace, onLog, onSettings }) {
  const [active, setActive] = React.useState(() => {
    const counts = APP_LANES.map(l => places.filter(p => p.status === l.key).length);
    if (counts[2]) return 'reviewed';
    if (counts[1]) return 'visited';
    return 'want';
  });
  const byStatus = (k) => {
    const arr = places.filter(p => p.status === k);
    if (k === 'reviewed') return arr.slice().sort((a, b) => (b.overall || 0) - (a.overall || 0));
    return arr;
  };
  const lane = APP_LANES.find(l => l.key === active);
  const list = byStatus(active);

  return (
    <div className="fl sans" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--paper)' }}>
      <div style={{ padding: '18px 20px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <window.KLabel style={{ color: 'var(--spot)' }}>The Standing Table</window.KLabel>
            <div className="serif" style={{ fontSize: 26, fontWeight: 560, color: 'var(--ink)', letterSpacing: '-0.01em', marginTop: 3, lineHeight: 1.05 }}>Field Notes</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={onSettings} aria-label="Backup and settings" style={{
              background: 'transparent', border: '1px solid var(--line)', borderRadius: 999,
              width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14">
                <circle cx="7" cy="7" r="2.2" stroke="var(--ink-2)" strokeWidth="1.3" fill="none"></circle>
                <path d="M7 1.2v2M7 10.8v2M1.2 7h2M10.8 7h2M2.9 2.9l1.4 1.4M9.7 9.7l1.4 1.4M11.1 2.9L9.7 4.3M4.3 9.7l-1.4 1.4" stroke="var(--ink-2)" strokeWidth="1.3" strokeLinecap="round"></path>
              </svg>
            </button>
            <button onClick={onLog} style={{
              background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 999,
              padding: '9px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
              <span className="kl" style={{ color: 'var(--paper)' }}>Log</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '0 20px 12px', flexShrink: 0 }}>
        {APP_LANES.map(l => {
          const on = active === l.key;
          return (
            <button key={l.key} onClick={() => setActive(l.key)} style={{
              flex: 1, background: on ? 'var(--ink)' : 'transparent',
              border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`, borderRadius: 999,
              padding: '7px 4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
              <span className="kl" style={{ color: on ? 'var(--paper)' : 'var(--ink-2)', fontSize: 9 }}>{l.key}</span>
              <span className="num" style={{ fontSize: 13, fontWeight: 600, color: on ? 'var(--paper)' : 'var(--ink)' }}>{places.filter(p => p.status === l.key).length}</span>
            </button>
          );
        })}
      </div>

      <div style={{ padding: '0 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <window.KLabel style={{ color: lane.accent }}>{lane.label}</window.KLabel>
        <window.KLabel>{list.length} {list.length === 1 ? 'place' : 'places'}</window.KLabel>
      </div>
      <window.Rule style={{ marginLeft: 20, marginRight: 20, width: 'auto' }} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map(p => <AppCard key={p.id} p={p} onTap={() => onOpenPlace(p.id)} />)}
        {!list.length && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div className="serif" style={{ fontSize: 17, fontStyle: 'italic', color: 'var(--ink-3)' }}>
              {active === 'want' ? 'Nothing on the wishlist yet.' : active === 'visited' ? 'No visits waiting for a review.' : 'No reviews yet.'}
            </div>
            <button onClick={onLog} className="kl" style={{
              marginTop: 14, background: 'none', border: '1px solid var(--line)', borderRadius: 999,
              padding: '9px 16px', cursor: 'pointer', color: 'var(--ink-2)',
            }}>+ Add a place</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── detail ────────────────────────────────────────────────────────────────
function AppDetail({ place: p, onBack, onEdit, onReview, onDelete, avgScores }) {
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const photo = (p.photos && p.photos[0]) || null;
  return (
    <div className="fl sans" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--paper)' }}>
      <div style={{ padding: '14px 18px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={onBack} className="kl" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 5, padding: '6px 0' }}>
          <span style={{ fontSize: 14 }}>‹</span> Pipeline
        </button>
        <window.StatusTag status={p.status} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {photo && (
          <div style={{
            height: 180, margin: '0 16px', borderRadius: 16, overflow: 'hidden', position: 'relative',
            backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(28,24,21,0.45) 0%, transparent 55%)' }}></div>
            <div style={{ position: 'absolute', bottom: 12, left: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <window.CuisineDot cuisine={p.cuisine} size={8} />
              <span className="kl" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>{p.cuisine}{p.hood ? ' · ' + p.hood : ''}</span>
            </div>
          </div>
        )}
        {!photo && (
          <div style={{ padding: '0 20px' }}>
            <window.KLabel style={{ color: 'var(--spot)' }}>{p.cuisine}{p.hood ? ' · ' + p.hood : ''}</window.KLabel>
          </div>
        )}

        <div style={{ padding: '14px 20px 32px' }}>
          <div className="serif" style={{ fontSize: 32, fontWeight: 580, color: 'var(--ink)', letterSpacing: '-0.015em', lineHeight: 1.02 }}>{p.name}</div>
          {p.address ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
              <span className="sans" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.address}</span>
            </div>
          ) : null}

          {p.s ? (
            <div style={{ margin: '18px 0', paddingBottom: 18, borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <window.OverallBadge value={p.overall} size={56} showTier />
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <window.Radar s={p.s} size={118} avgScores={avgScores} />
                </div>
              </div>
              <div style={{ marginTop: 14 }}><window.WeightStrip s={p.s} /></div>
            </div>
          ) : (
            <div style={{ margin: '16px 0', paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
              <span className="serif" style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--ink-3)' }}>
                {p.status === 'want' ? 'Not visited yet.' : 'Visited — review pending.'}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 18, marginBottom: 18, flexWrap: 'wrap' }}>
            <div>
              <window.KLabel>Price</window.KLabel>
              <div style={{ marginTop: 5 }}><window.PriceLevel level={p.price} size={15} /></div>
            </div>
            {p.again != null && (
              <div>
                <window.KLabel>Verdict</window.KLabel>
                <div style={{ marginTop: 6 }}><window.AgainTag again={p.again} /></div>
              </div>
            )}
            {p.date && (
              <div>
                <window.KLabel>{p.status === 'want' ? 'Added' : 'Visited'}</window.KLabel>
                <div className="sans" style={{ fontSize: 13, color: 'var(--ink)', marginTop: 5 }}>{window.fmtDay(p.date)}</div>
              </div>
            )}
          </div>

          {p.dish ? (
            <div style={{ background: 'var(--spot-soft)', borderRadius: 14, padding: '13px 15px', marginBottom: 16 }}>
              <window.KLabel style={{ color: 'var(--spot-2)' }}>Order this</window.KLabel>
              <div className="serif" style={{ fontSize: 18, fontWeight: 560, color: 'var(--spot-2)', marginTop: 4 }}>{p.dish}</div>
            </div>
          ) : null}

          {p.note ? (
            <div style={{ marginBottom: 16 }}>
              <window.KLabel>Field note</window.KLabel>
              <p className="serif" style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--ink)', marginTop: 8, marginBottom: 0, textWrap: 'pretty' }}>{p.note}</p>
            </div>
          ) : null}

          {(p.tags && p.tags.length) || (p.meal && p.meal[0]) || (p.occasion && p.occasion[0]) ? (
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 22 }}>
              {(p.tags || []).map(t => <window.Tag key={t}>{t}</window.Tag>)}
              {(p.meal || []).map(t => <window.Tag key={'m' + t}>{t}</window.Tag>)}
              {(p.occasion || []).map(t => <window.Tag key={'o' + t}>{t}</window.Tag>)}
            </div>
          ) : null}

          {/* extra photos */}
          {p.photos && p.photos.length > 1 && (
            <div style={{ display: 'flex', gap: 9, marginBottom: 22 }}>
              {p.photos.slice(1).map((src, i) => (
                <div key={i} style={{
                  width: 96, height: 96, borderRadius: 12, overflow: 'hidden',
                  backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center',
                  border: '1px solid var(--line)',
                }}></div>
              ))}
            </div>
          )}

          {/* actions */}
          <window.Rule />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            {p.status === 'want' && (
              <button onClick={onReview} className="kl" style={{
                background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 12,
                padding: '13px 0', cursor: 'pointer', width: '100%',
              }}>I went — log the visit</button>
            )}
            {p.status === 'visited' && (
              <button onClick={onReview} className="kl" style={{
                background: 'var(--spot)', color: 'var(--paper)', border: 'none', borderRadius: 12,
                padding: '13px 0', cursor: 'pointer', width: '100%',
              }}>Write the review</button>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onEdit} className="kl" style={{
                flex: 1, background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--line)',
                borderRadius: 12, padding: '12px 0', cursor: 'pointer',
              }}>Edit entry</button>
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)} className="kl" style={{
                  flex: 1, background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--line)',
                  borderRadius: 12, padding: '12px 0', cursor: 'pointer',
                }}>Delete</button>
              ) : (
                <button onClick={onDelete} className="kl" style={{
                  flex: 1, background: 'var(--spot)', color: 'var(--paper)', border: 'none',
                  borderRadius: 12, padding: '12px 0', cursor: 'pointer',
                }}>Tap again to confirm</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── first-run welcome ─────────────────────────────────────────────────────
function AppWelcome({ onSamples, onFresh }) {
  return (
    <div className="fl sans" style={{
      height: '100%', background: 'var(--paper)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center',
    }}>
      <window.KLabel style={{ color: 'var(--spot)' }}>The Standing Table</window.KLabel>
      <div className="serif" style={{ fontSize: 34, fontWeight: 580, color: 'var(--ink)', letterSpacing: '-0.015em', lineHeight: 1.05, marginTop: 8 }}>
        Your table,<br />your verdicts.
      </div>
      <p className="serif" style={{ fontSize: 15.5, fontStyle: 'italic', color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: 300, marginTop: 14, textWrap: 'pretty' }}>
        A field journal for the places you eat. Everything you log is saved on this device — no account needed.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 28, width: '100%', maxWidth: 280 }}>
        <button onClick={onFresh} className="kl" style={{
          background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 12,
          padding: '14px 0', cursor: 'pointer',
        }}>Start fresh</button>
        <button onClick={onSamples} className="kl" style={{
          background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--line)', borderRadius: 12,
          padding: '14px 0', cursor: 'pointer',
        }}>Explore with sample places</button>
      </div>
    </div>
  );
}

// ── settings / backup sheet ───────────────────────────────────────────────
function AppSettings({ places, onClose, onImport, onLoadSamples }) {
  const importRef = React.useRef(null);
  const [msg, setMsg] = React.useState(null);

  const pickImport = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const imported = await window.dbImportFile(f);
      onImport(imported);
      setMsg('Imported ' + imported.length + ' places — your collection was replaced.');
    } catch (err) {
      setMsg('Import failed: ' + err.message);
    }
    e.target.value = '';
  };

  const row = {
    width: '100%', textAlign: 'left', background: 'var(--card)', border: '1px solid var(--line)',
    borderRadius: 12, padding: '13px 15px', cursor: 'pointer', display: 'flex',
    flexDirection: 'column', gap: 3,
  };

  return (
    <div className="fl sans" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--paper)' }}>
      <div style={{ padding: '14px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={onClose} className="kl" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 5, padding: '6px 0' }}>
          <span style={{ fontSize: 14 }}>‹</span> Back
        </button>
        <window.KLabel>Backup & Data</window.KLabel>
        <span style={{ width: 40 }}></span>
      </div>
      <window.Rule style={{ marginLeft: 20, marginRight: 20, width: 'auto' }} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p className="serif" style={{ fontSize: 14.5, fontStyle: 'italic', color: 'var(--ink-2)', lineHeight: 1.55, margin: '0 0 8px', textWrap: 'pretty' }}>
          Your collection lives in this browser, on this device. Export a backup file regularly — and use it to move your collection to a new phone, or share it with a friend.
        </p>

        <button onClick={() => window.dbExport(places)} style={row}>
          <span className="kl" style={{ color: 'var(--ink)' }}>Export backup</span>
          <span className="sans" style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>Downloads a JSON file of all {places.length} places, photos included.</span>
        </button>

        <button onClick={() => importRef.current && importRef.current.click()} style={row}>
          <span className="kl" style={{ color: 'var(--ink)' }}>Import backup</span>
          <span className="sans" style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>Replaces this collection with one from a backup file.</span>
        </button>
        <input ref={importRef} type="file" accept="application/json,.json" onChange={pickImport} style={{ display: 'none' }} />

        <button onClick={() => { onLoadSamples(); setMsg('Sample collection loaded.'); }} style={row}>
          <span className="kl" style={{ color: 'var(--ink)' }}>Load sample collection</span>
          <span className="sans" style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>Replaces everything with the 12 demo places. Export first if you care about your data.</span>
        </button>

        {msg && (
          <div className="sans" style={{ padding: '10px 13px', borderRadius: 10, background: 'var(--spot-soft)', color: 'var(--spot-2)', fontSize: 13 }}>{msg}</div>
        )}

        <window.Rule style={{ marginTop: 8 }} />
        <window.KLabel style={{ marginTop: 6 }}>About</window.KLabel>
        <p className="sans" style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.6, margin: 0, textWrap: 'pretty' }}>
          The Standing Table · working app (local edition). Data is stored in your browser's local storage — clearing site data deletes the collection. Photos are compressed to fit; about 40–60 photos fit comfortably. The Setup Guide covers moving to a synced, multi-device version.
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { AppPipeline, AppDetail, AppWelcome, AppSettings, AppCard });

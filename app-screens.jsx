// app-form.jsx — Working add / edit / review form. Depends on ds.jsx, atoms.jsx, store.jsx.
// Exports: window.AppForm

const AF_MEALS = ['Breakfast', 'Lunch', 'Dinner'];
const AF_OCCASIONS = ['Date', 'Group', 'Quick bite', 'Solo'];

// ── small form atoms ──────────────────────────────────────────────────────
function AFField({ label, children, style }) {
  return (
    <div style={{ marginTop: 16, ...style }}>
      <window.KLabel>{label}</window.KLabel>
      <div style={{ marginTop: 7 }}>{children}</div>
    </div>
  );
}

const afInputStyle = {
  width: '100%', border: '1px solid var(--line)', borderRadius: 12, padding: '11px 13px',
  background: 'var(--card)', color: 'var(--ink)', fontSize: 15, outline: 'none',
  fontFamily: '"Hanken Grotesk",system-ui,sans-serif',
};

function AFInput(props) {
  return <input {...props} style={{ ...afInputStyle, ...props.style }} />;
}

function AFChips({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {options.map(o => {
        const on = value === o;
        return (
          <button key={o} type="button" onClick={() => onChange(on ? null : o)} className="sans" style={{
            fontSize: 12.5, padding: '7px 13px', borderRadius: 999, cursor: 'pointer',
            border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`,
            background: on ? 'var(--ink)' : 'transparent',
            color: on ? 'var(--paper)' : 'var(--ink-2)', fontWeight: on ? 500 : 400,
          }}>{o}</button>
        );
      })}
    </div>
  );
}

function AFAxisSlider({ label, value, onChange, weight }) {
  const tier = window.scoreTier(value);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="sans" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{label}</span>
          <span className="num" style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>{weight}% wt</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="serif" style={{ fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic' }}>{tier}</span>
          <span className="num" style={{ fontSize: 17, fontWeight: 600, color: 'var(--spot)', letterSpacing: '-0.02em' }}>{value.toFixed(1)}</span>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 3 }}>
        {Array.from({ length: 10 }).map((_, i) => {
          const v = i + 1; const on = v <= Math.round(value);
          return (
            <button key={i} type="button" onClick={() => onChange(v)} style={{
              flex: 1, height: on ? 30 : 24, borderRadius: 6, cursor: 'pointer', border: 'none',
              background: on ? 'var(--spot)' : 'var(--line-2)',
              opacity: on ? (0.5 + (v / 10) * 0.5) : 1,
              transition: 'height 0.15s ease, opacity 0.15s ease', alignSelf: 'flex-end',
              minWidth: 0, padding: 0,
            }} />
          );
        })}
      </div>
    </div>
  );
}

// ── photo strip with real upload ──────────────────────────────────────────
function AFPhotos({ photos, onChange }) {
  const fileRef = React.useRef(null);
  const [busy, setBusy] = React.useState(false);

  const pick = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 3 - photos.length);
    if (!files.length) return;
    setBusy(true);
    try {
      const added = [];
      for (const f of files) added.push(await window.compressPhoto(f));
      onChange([...photos, ...added].slice(0, 3));
    } catch (err) { /* unreadable file — ignore */ }
    setBusy(false);
    e.target.value = '';
  };

  return (
    <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
      {photos.map((src, i) => (
        <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 12, overflow: 'hidden',
            backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center',
            border: '1px solid var(--line)',
          }}></div>
          <button type="button" onClick={() => onChange(photos.filter((_, j) => j !== i))} aria-label="Remove photo" style={{
            position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
            background: 'var(--ink)', color: 'var(--paper)', border: 'none', cursor: 'pointer',
            fontSize: 11, lineHeight: '20px', padding: 0,
          }}>×</button>
        </div>
      ))}
      {photos.length < 3 && (
        <button type="button" onClick={() => fileRef.current && fileRef.current.click()} disabled={busy} style={{
          width: 72, height: 72, borderRadius: 12, flexShrink: 0,
          border: '1.5px dashed var(--line)', background: 'transparent',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 3, cursor: 'pointer',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <rect x="2" y="4" width="14" height="10" rx="2" stroke="var(--ink-3)" strokeWidth="1.2" fill="none"></rect>
            <circle cx="7" cy="8.5" r="1.5" stroke="var(--ink-3)" strokeWidth="1" fill="none"></circle>
            <path d="M3 13l4-3.5 3 2 3-3 3 3" stroke="var(--ink-3)" strokeWidth="1" fill="none" strokeLinejoin="round"></path>
          </svg>
          <span className="kl" style={{ fontSize: 8 }}>{busy ? '…' : 'Add'}</span>
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={pick} style={{ display: 'none' }} />
    </div>
  );
}

// ── the form ──────────────────────────────────────────────────────────────
// place: existing place to edit, or null for new. forceStatus: open straight into review mode.
function AppForm({ place, forceStatus, onSave, onCancel }) {
  const cuisines = Object.keys(window.CUISINE_META);
  const [d, setD] = React.useState(() => ({
    name: '', address: '', cuisine: 'Italian', hood: '', price: 2,
    status: 'want', date: null, meal: ['Dinner'], occasion: [],
    tags: [], dish: '', note: '', photos: [],
    s: { food: 8, value: 7, vibe: 8, service: 7 }, again: true, overall: null,
    ...(place || {}),
    ...(forceStatus ? { status: forceStatus } : {}),
  }));
  const [tagText, setTagText] = React.useState((place && place.tags || []).join(', '));
  const [err, setErr] = React.useState(null);
  const set = (patch) => setD(prev => ({ ...prev, ...patch }));

  const reviewed = d.status === 'reviewed';
  const dated = d.status !== 'want';
  const scores = d.s || { food: 8, value: 7, vibe: 8, service: 7 };
  const overall = window.calcWeighted(scores);

  React.useEffect(() => {
    if (dated && !d.date) set({ date: window.todayISO() });
  }, [d.status]);

  const save = () => {
    if (!d.name.trim()) { setErr('Give the place a name.'); return; }
    const tags = tagText.split(',').map(t => t.trim()).filter(Boolean);
    onSave({
      ...d,
      name: d.name.trim(), hood: d.hood.trim(), tags,
      meal: d.meal && d.meal.length ? d.meal : [],
      occasion: d.occasion && d.occasion.length ? d.occasion : [],
      s: reviewed ? scores : null,
      overall: reviewed ? Math.round(overall * 10) / 10 : null,
      again: reviewed ? d.again : null,
      date: dated ? d.date : null,
    });
  };

  return (
    <div className="fl sans" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--paper)' }}>
      {/* top bar */}
      <div style={{ padding: '14px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={onCancel} className="kl" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: '6px 0' }}>Cancel</button>
        <window.KLabel>{place ? (forceStatus === 'reviewed' && place.status !== 'reviewed' ? 'Review Visit' : 'Edit Entry') : 'New Entry'}</window.KLabel>
        <button onClick={save} className="kl" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--spot)', fontWeight: 600, padding: '6px 0' }}>Save</button>
      </div>
      <window.Rule style={{ marginLeft: 20, marginRight: 20, width: 'auto' }} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 40px' }}>
        {err && (
          <div className="sans" style={{ marginTop: 14, padding: '10px 13px', borderRadius: 10, background: 'var(--spot-soft)', color: 'var(--spot-2)', fontSize: 13 }}>{err}</div>
        )}

        <AFField label="Place name">
          <AFInput value={d.name} onChange={e => set({ name: e.target.value })} placeholder="e.g. Maya Oaxaca"
            className="serif" style={{ fontSize: 19, fontFamily: '"Newsreader",Georgia,serif', fontWeight: 500 }} />
        </AFField>

        <div style={{ display: 'flex', gap: 10 }}>
          <AFField label="Cuisine" style={{ flex: 1 }}>
            <select value={d.cuisine} onChange={e => set({ cuisine: e.target.value })} style={{ ...afInputStyle, appearance: 'none', cursor: 'pointer' }}>
              {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </AFField>
          <AFField label="Neighborhood" style={{ flex: 1 }}>
            <AFInput value={d.hood} onChange={e => set({ hood: e.target.value })} placeholder="e.g. Mission" />
          </AFField>
        </div>

        <AFField label="Address (optional)">
          <AFInput value={d.address || ''} onChange={e => set({ address: e.target.value })} placeholder="Street address" />
        </AFField>

        <AFField label="Status">
          <div style={{ display: 'flex', gap: 6 }}>
            {[['want', 'Want to try'], ['visited', 'Visited'], ['reviewed', 'Reviewed']].map(([k, l]) => {
              const on = d.status === k;
              return (
                <button key={k} type="button" onClick={() => set({ status: k })} style={{
                  flex: 1, padding: '9px 4px', borderRadius: 10, cursor: 'pointer',
                  border: `1px solid ${on ? 'var(--ink)' : 'var(--line)'}`,
                  background: on ? 'var(--ink)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <window.StatusDot status={k} size={9} />
                  <span className="kl" style={{ color: on ? 'var(--paper)' : 'var(--ink-2)', fontSize: 9 }}>{l}</span>
                </button>
              );
            })}
          </div>
        </AFField>

        {dated && (
          <AFField label={d.status === 'want' ? 'Added' : 'Visited on'}>
            <AFInput type="date" value={d.date || ''} onChange={e => set({ date: e.target.value })} className="num" />
          </AFField>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <AFField label="Price level" style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4].map(i => (
                <button key={i} type="button" onClick={() => set({ price: i })} className="mono" style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500,
                  border: `1px solid ${i <= d.price ? 'var(--ink)' : 'var(--line)'}`,
                  background: i <= d.price ? 'var(--ink)' : 'transparent', color: i <= d.price ? 'var(--paper)' : 'var(--ink-3)',
                }}>$</button>
              ))}
            </div>
          </AFField>
        </div>

        <AFField label="Meal">
          <AFChips options={AF_MEALS} value={(d.meal || [])[0] || null} onChange={v => set({ meal: v ? [v] : [] })} />
        </AFField>
        <AFField label="Occasion">
          <AFChips options={AF_OCCASIONS} value={(d.occasion || [])[0] || null} onChange={v => set({ occasion: v ? [v] : [] })} />
        </AFField>

        {/* ── review section ── */}
        {reviewed && (
          <div style={{ marginTop: 24 }}>
            <window.Rule />
            <div style={{ margin: '18px 0', padding: '14px 16px', background: 'var(--ink)', borderRadius: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <window.KLabel style={{ color: 'rgba(250,247,240,0.6)' }}>Weighted overall</window.KLabel>
                  <div className="serif" style={{ fontSize: 12, color: 'rgba(250,247,240,0.5)', fontStyle: 'italic', marginTop: 3 }}>{window.scoreTier(overall)}</div>
                </div>
                <div className="num" style={{ fontSize: 38, fontWeight: 600, color: 'var(--paper)', letterSpacing: '-0.02em' }}>{overall.toFixed(1)}</div>
              </div>
            </div>

            <window.KLabel style={{ color: 'var(--spot)' }}>Rate each axis</window.KLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 13 }}>
              {window.AXIS_ORDER.map(k => (
                <AFAxisSlider key={k} label={window.fmt.axis(k)} value={scores[k]}
                  onChange={v => set({ s: { ...scores, [k]: v } })} weight={window.AXIS_WEIGHTS[k]} />
              ))}
            </div>

            <AFField label="Go again?">
              <div style={{ display: 'flex', gap: 6 }}>
                {[['Yes', true], ['No', false]].map(([l, v]) => (
                  <button key={l} type="button" onClick={() => set({ again: v })} className="kl" style={{
                    flex: 1, padding: '9px 0', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${d.again === v ? (v ? 'var(--green)' : 'var(--ink)') : 'var(--line)'}`,
                    background: d.again === v ? (v ? 'var(--green)' : 'var(--ink)') : 'transparent',
                    color: d.again === v ? 'var(--paper)' : 'var(--ink-2)',
                  }}>{l}</button>
                ))}
              </div>
            </AFField>
          </div>
        )}

        <AFField label="Signature dish">
          <AFInput value={d.dish || ''} onChange={e => set({ dish: e.target.value })} placeholder="The thing to order"
            className="serif" style={{ fontFamily: '"Newsreader",Georgia,serif' }} />
        </AFField>

        <AFField label="Field note">
          <textarea value={d.note || ''} onChange={e => set({ note: e.target.value })} rows={3}
            placeholder="What you'd tell a friend…"
            style={{ ...afInputStyle, fontFamily: '"Newsreader",Georgia,serif', fontSize: 15, lineHeight: 1.5, resize: 'vertical' }}></textarea>
        </AFField>

        <AFField label="Tags (comma-separated)">
          <AFInput value={tagText} onChange={e => setTagText(e.target.value)} placeholder="Natural wine, Walk-in" />
        </AFField>

        <AFField label="Photos · up to 3">
          <AFPhotos photos={d.photos || []} onChange={photos => set({ photos })} />
        </AFField>
      </div>
    </div>
  );
}

Object.assign(window, { AppForm });

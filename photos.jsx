// photos.jsx — Inject photo URLs into existing PLACES data
// Must load after ds.jsx. Exports window.PLACE_PHOTOS, window.R (resource resolver)

// Resource resolver: use bundled __resources if available, otherwise direct URL
function R(id, fallback) { return (window.__resources && window.__resources[id]) || fallback; }

const PLACE_PHOTOS = {
  'saint-clair': R('imgSaintClair','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80'),
  'koi-house':   R('imgKoiHouse','https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&h=600&fit=crop&q=80'),
  'mill-crumb':  R('imgMillCrumb','https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop&q=80'),
  'hwaro':       R('imgHwaro','https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&h=600&fit=crop&q=80'),
  'lupa':        R('imgLupa','https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&h=600&fit=crop&q=80'),
  'dust-spice':  R('imgDustSpice','https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop&q=80'),
  'verde':       R('imgVerde','https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop&q=80'),
  'maya':        R('imgMaya','https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&h=600&fit=crop&q=80'),
  'tap-room':    R('imgTapRoom','https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop&q=80'),
  'blue-hour':   R('imgBlueHour','https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&h=600&fit=crop&q=80'),
  'kettle-stone':R('imgKettleStone','https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop&q=80'),
  'ban-thai':    R('imgBanThai','https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&h=600&fit=crop&q=80'),
};

// Inject into PLACES array
window.PLACES.forEach(p => {
  p.photo = PLACE_PHOTOS[p.id] || null;
  p.address = ({
    'saint-clair': '1847 Valencia St',
    'koi-house':   '1815 Post St',
    'mill-crumb':  '478 Hayes St',
    'hwaro':       '344 Clement St',
    'lupa':        '234 Columbus Ave',
    'dust-spice':  '601 Larkin St',
    'verde':       '1012 Shattuck Ave',
    'maya':        '1234 Valencia St',
    'tap-room':    '155 4th St',
    'blue-hour':   '89 Folsom St',
    'kettle-stone':'420 Hayes St',
    'ban-thai':    '4012 Judah St',
  })[p.id] || '';
});

window.PLACE_PHOTOS = PLACE_PHOTOS;
window.R = R;

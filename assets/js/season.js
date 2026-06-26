// season.js — outfit manager (localStorage)
// Each season page passes: SEASON_KEY, SEASON_NAME

const outfitGrid   = document.getElementById('outfit-grid');
const outfitCount  = document.getElementById('outfit-count');
const modalOverlay = document.getElementById('modal-overlay');
const form         = document.getElementById('outfit-form');
const imgUpload    = document.getElementById('img-upload');
const imgPreview   = document.getElementById('img-preview');
const imgInput     = document.getElementById('img-input');

let outfits      = JSON.parse(localStorage.getItem(SEASON_KEY) || '[]');
let pendingImage = null;
let activeFilter = 'all';
let editingId    = null;
let pieces       = [];

const piecesList  = document.getElementById('pieces-list');
const pieceInput  = document.getElementById('piece-input');
const pieceAddBtn = document.getElementById('piece-add-btn');

function renderPieces() {
  piecesList.innerHTML = pieces.map((p, i) => `
    <div class="piece-item">
      <span class="piece-bullet">—</span>
      <span class="piece-text">${p}</span>
      <button type="button" class="piece-remove" data-i="${i}">×</button>
    </div>
  `).join('');
  piecesList.querySelectorAll('.piece-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      pieces.splice(+btn.dataset.i, 1);
      renderPieces();
    });
  });
}

function addPiece() {
  const val = pieceInput.value.trim();
  if (!val) return;
  pieces.push(val);
  pieceInput.value = '';
  renderPieces();
  pieceInput.focus();
}

pieceAddBtn.addEventListener('click', addPiece);
pieceInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); addPiece(); }
});

// ── Storage ───────────────────────────────────────────────
function save() {
  localStorage.setItem(SEASON_KEY, JSON.stringify(outfits));
}

// ── Image upload ──────────────────────────────────────────
imgInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    pendingImage = ev.target.result;
    imgPreview.src = pendingImage;
    imgPreview.style.display = 'block';
  };
  reader.readAsDataURL(file);
});

// ── Filter ────────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    render();
  });
});

// ── Render ────────────────────────────────────────────────
function render() {
  const filtered = activeFilter === 'all'
    ? outfits
    : outfits.filter(o => o.weather === activeFilter);

  outfitCount.textContent = outfits.length;

  if (filtered.length === 0) {
    outfitGrid.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 12h24l4 8H16l4-8z" stroke="currentColor" stroke-width="2"/>
          <rect x="12" y="20" width="40" height="32" rx="4" stroke="currentColor" stroke-width="2"/>
          <path d="M24 20v4a8 8 0 0016 0v-4" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>No outfits yet</h3>
        <p>Click "Add outfit" to get started.</p>
      </div>`;
    return;
  }

  outfitGrid.innerHTML = filtered.map((outfit, i) => `
    <div class="outfit-card" data-id="${outfit.id}">
      ${outfit.image
        ? `<img class="outfit-img" src="${outfit.image}" alt="${outfit.name}" />`
        : `<div class="outfit-img-placeholder">
             <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M20 12h24l4 8H16l4-8z" stroke="currentColor" stroke-width="2.5"/>
               <rect x="12" y="20" width="40" height="32" rx="4" stroke="currentColor" stroke-width="2.5"/>
               <path d="M24 20v4a8 8 0 0016 0v-4" stroke="currentColor" stroke-width="2.5"/>
             </svg>
           </div>`
      }
      <div class="outfit-body">
        <div class="outfit-name">${outfit.name || 'Untitled outfit'}</div>
        <div class="outfit-meta">
          <div class="outfit-weather">
            ${weatherIcon(outfit.weather)}
            <span>${weatherLabel(outfit.weather)}</span>
          </div>
        </div>
        ${outfit.tags ? `<div class="outfit-tags">${outfit.tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('')}</div>` : ''}
        ${outfit.pieces && outfit.pieces.length ? `
          <ul class="piece-list">
            ${outfit.pieces.map(p => `<li>${p}</li>`).join('')}
          </ul>` : ''}
      </div>
      <div class="outfit-actions">
        <button class="action-btn edit" onclick="openEditModal('${outfit.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="action-btn delete" onclick="deleteOutfit('${outfit.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

function weatherIcon(w) {
  const icons = {
    cold:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M4.93 7l14.14 0M4.93 17l14.14 0M2 12h20M7 4.93l10 10.14M17 4.93L7 15.07"/></svg>`,
    cool:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19a4.5 4.5 0 000-9H17A7 7 0 103 15.5"/></svg>`,
    mild:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`,
    warm:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
    hot:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
  };
  return icons[w] || icons['mild'];
}

function weatherLabel(w) {
  const labels = { cold: 'Cold (< 5°C)', cool: 'Cool (5–15°C)', mild: 'Mild (15–20°C)', warm: 'Warm (20–28°C)', hot: 'Hot (> 28°C)' };
  return labels[w] || w;
}

// ── Delete ────────────────────────────────────────────────
window.deleteOutfit = function(id) {
  if (!confirm('Delete this outfit?')) return;
  outfits = outfits.filter(o => o.id !== id);
  save();
  render();
};

// ── Modal ─────────────────────────────────────────────────
window.openModal = function() {
  editingId = null;
  pieces = [];
  form.reset();
  pendingImage = null;
  imgPreview.style.display = 'none';
  renderPieces();
  document.querySelector('.modal-title').textContent = 'New outfit';
  document.querySelector('.btn-save').textContent = 'Save outfit';
  modalOverlay.classList.add('open');
};

window.openEditModal = function(id) {
  const outfit = outfits.find(o => o.id === id);
  if (!outfit) return;
  editingId = id;
  pieces = Array.isArray(outfit.pieces) ? [...outfit.pieces] : [];
  form.reset();
  form.elements['name'].value    = outfit.name    || '';
  form.elements['weather'].value = outfit.weather || '';
  form.elements['tags'].value    = outfit.tags    || '';
  pendingImage = outfit.image || null;
  if (pendingImage) {
    imgPreview.src = pendingImage;
    imgPreview.style.display = 'block';
  } else {
    imgPreview.style.display = 'none';
  }
  renderPieces();
  document.querySelector('.modal-title').textContent = 'Edit outfit';
  document.querySelector('.btn-save').textContent = 'Update outfit';
  modalOverlay.classList.add('open');
};

window.closeModal = function() {
  modalOverlay.classList.remove('open');
};

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ── Save outfit ───────────────────────────────────────────
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (editingId) {
    outfits = outfits.map(o => o.id !== editingId ? o : {
      ...o,
      name:    data.name,
      weather: data.weather,
      tags:    data.tags,
      pieces:  [...pieces],
      image:   pendingImage !== null ? pendingImage : o.image,
    });
  } else {
    outfits.unshift({
      id:      crypto.randomUUID(),
      name:    data.name,
      weather: data.weather,
      tags:    data.tags,
      pieces:  [...pieces],
      image:   pendingImage,
      date:    new Date().toISOString(),
    });
  }
  save();
  render();
  closeModal();
});

// ── Init ──────────────────────────────────────────────────
render();

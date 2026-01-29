// assets/js/main.js
// Main renderer for the static site.
// Imports data from /data/*.js (edit those files to update products/categories/PO/etc).

import { products } from '../../data/products.js';
import { categories } from '../../data/categories.js';
import { po } from '../../data/po.js';
import { shippingPartners } from '../../data/shipping-partners.js';
import { estimateShipping } from '../../data/shipping.js';
import { FORMS } from '../../data/forms.js';

// BNI account (edit to your real account)
const BNI_ACCOUNT = {
  bank: "BNI",
  account: "123-456-7890",
  holder: "lovelyshopping japan"
};

const todayISO = () => new Date().toISOString().slice(0,10);
const isPoOpen = () => (po.status === "OPEN") && (!po.closeDate || po.closeDate >= todayISO());

// DOM refs
const banner = document.getElementById('po-banner');
const categoriesEl = document.getElementById('categories');
const listEl = document.getElementById('product-list');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const closeModalBtn = document.getElementById('close-modal');

// Show PO banner
function renderPoBanner(){
  if (isPoOpen()){
    banner.innerHTML = `<div class="po-open">PO OPEN — closes ${po.closeDate}. Est. delivery: ±30 days after close.</div>`;
  } else {
    banner.innerHTML = `<div class="po-closed">PO CLOSED — next PO soon. Join our WA to be notified.</div>`;
  }
}

// Render categories
function renderCategories(){
  categoriesEl.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat.name;
    btn.dataset.cat = cat.id;
    btn.className = cat.id === 'all' ? 'active' : '';
    btn.onclick = () => {
      document.querySelectorAll('.categories button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts(cat.id);
    };
    categoriesEl.appendChild(btn);
  });
}

// Format currency
function formatRp(n){ return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR'}).format(n); }

// Render products by category
function renderProducts(categoryId = 'all'){
  listEl.innerHTML = '';
  const items = products.filter(p => p.active && (categoryId === 'all' || p.category === categoryId));
  if (items.length === 0){
    listEl.innerHTML = `<div style="padding:24px;color:var(--muted)">No items in this category.</div>`;
    return;
  }
  items.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" />
      <h3>${escapeHtml(p.name)}</h3>
      <p class="price">${formatRp(p.price)}</p>
      <p class="note">${p.description || ''}</p>
      <div class="actions">
        <button class="btn btn-ghost detail" data-id="${p.id}">View</button>
        <button class="btn btn-primary buy" data-id="${p.id}" ${isPoOpen() ? '' : 'disabled'}>Buy (PO)</button>
      </div>
    `;
    listEl.appendChild(card);
  });
}

// Escape helper
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// Modal show/hide
function openModal(){ modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false'); window.scrollTo(0,0); }
function closeModal(){ modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true'); modalContent.innerHTML = ''; }
closeModalBtn.onclick = closeModal;
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

// Handle product actions (delegation)
listEl.addEventListener('click', e => {
  const id = e.target.dataset.id;
  if (!id) return;
  const prod = products.find(x => x.id === id);
  if (!prod) return;
  if (e.target.classList.contains('detail')) showDetail(prod);
  if (e.target.classList.contains('buy')) showCheckout(prod);
});

// Show product detail
function showDetail(p){
  modalContent.innerHTML = `
    <h2>${escapeHtml(p.name)}</h2>
    <img src="${p.image}" alt="${escapeHtml(p.name)}" class="wide-img" />
    <p>${escapeHtml(p.description || '')}</p>
    ${p.video ? `<div class="video"><iframe src="${p.video}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>` : ''}
    <p class="price">Price: ${formatRp(p.price)}</p>
    <div style="margin-top:12px">
      <button class="btn btn-primary buy" data-id="${p.id}" ${isPoOpen() ? '' : 'disabled'}>Buy (PO)</button>
    </div>
  `;
  openModal();
}

// Show checkout modal for a product
function showCheckout(p){
  const shippingEst = estimateShipping(p.weight);
  const total = p.price + shippingEst;
  const partnerOptions = shippingPartners.map(sp=>`<option value="${sp.id}">${escapeHtml(sp.name)}</option>`).join('');
  modalContent.innerHTML = `
    <h2>Checkout — ${escapeHtml(p.name)}</h2>
    <p>Price: <strong>${formatRp(p.price)}</strong></p>
    <p>Est. Shipping (weight ${p.weight}kg): <strong>${formatRp(shippingEst)}</strong></p>
    <p><strong>Total: ${formatRp(total)}</strong></p>

    <h3>Buyer info</h3>
    <label>Name <input id="buyer-name" type="text" placeholder="Nama lengkap" /></label><br/>
    <label>WhatsApp <input id="buyer-wa" type="text" placeholder="08xx..." /></label><br/>
    <label>Address <textarea id="buyer-addr" rows="3" placeholder="Alamat lengkap (Provinsi, Kota, Kecamatan, Jalan...)"></textarea></label><br/>
    <label>Shipping partner <select id="buyer-partner">${partnerOptions}</select></label>

    <h3>Payment</h3>
    <p>Please transfer to:</p>
    <pre>${BNI_ACCOUNT.bank} — ${BNI_ACCOUNT.account}\nAccount name: ${BNI_ACCOUNT.holder}</pre>

    <div style="display:flex;gap:8px;margin-top:12px">
      <button id="confirm-google" class="btn btn-ghost">Confirm (Google Form)</button>
      <button id="confirm-wa" class="btn btn-primary">Confirm via WhatsApp</button>
    </div>
    <p class="note" style="margin-top:8px">After payment, please send proof via WhatsApp. Orders are recorded into our sheet for batch recap.</p>
  `;
  openModal();

  document.getElementById('confirm-google').onclick = () => {
    if (!FORMS.order || !FORMS.order.urlTemplate){
      alert('Order form not configured. Please contact admin.');
      return;
    }
    const name = document.getElementById('buyer-name').value || '—';
    const wa = document.getElementById('buyer-wa').value || '—';
    const addr = document.getElementById('buyer-addr').value || '—';
    const partner = document.getElementById('buyer-partner').value || '—';
    const poBatch = po.closeDate || '';
    const url = fillTemplate(FORMS.order.urlTemplate, {
      product: `${p.id} | ${p.name}`,
      price: p.price,
      shipping: shippingEst,
      total,
      buyer_name: name,
      buyer_wa: wa,
      buyer_addr: addr,
      partner,
      po_batch: poBatch
    });
    window.open(url, '_blank');
  };

  document.getElementById('confirm-wa').onclick = () => {
    const name = encodeURIComponent(document.getElementById('buyer-name').value || '—');
    const wa = encodeURIComponent(document.getElementById('buyer-wa').value || '');
    const addr = encodeURIComponent(document.getElementById('buyer-addr').value || '—');
    const partner = encodeURIComponent(document.getElementById('buyer-partner').value || '—');
    const message = encodeURIComponent(
      `Order from lovelyshopping japan\nProduct: ${p.name}\nPrice: ${formatRp(p.price)}\nShipping: ${formatRp(shippingEst)}\nTotal: ${formatRp(total)}\nName: ${decodeURIComponent(name)}\nWA: ${decodeURIComponent(wa)}\nAddress: ${decodeURIComponent(addr)}\nPartner: ${decodeURIComponent(partner)}\nPO Batch: ${po.closeDate || ''}`
    );
    const waNumber = FORMS.whatsappNumber || '';
    if (!waNumber) { alert('Merchant WhatsApp not configured in data/forms.js'); return; }
    window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
  };
}

// small templating helper for form URLs
function fillTemplate(urlTemplate, map){
  let u = urlTemplate || '';
  Object.keys(map).forEach(k => {
    const v = map[k] == null ? '' : encodeURIComponent(map[k]);
    u = u.split(`{${k}}`).join(v);
  });
  return u;
}

// Init
renderPoBanner();
renderCategories();
renderProducts('all');

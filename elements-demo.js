/* Static stand-in for LiquidCommerce Elements on the Breckenridge Buy Online page.
 * Copies the Elements product list, address element, Delivery Options drawer,
 * product drawer, cart drawer and checkout drawer as they render on
 * lawswhiskeyhouse.com/buy-laws/, and publishes lce:actions.* events with the
 * SDK's {data, metadata} envelope so anything wired to them survives the switch
 * to the live SDK (set ELEMENTS.enabled in elements-config.js, delete this file).
 *
 * Real: products, bottle shots, base prices and copy (Breckenridge Shopify,
 * 11/17/26); which Gopuff locations stock which SKUs and the ZIPs they serve
 * (Gopuff feed, 11/17/26); network retailers that carry Breckenridge by state
 * (11/7/26); the Denver-metro local delivery stores (Mayfair, Heritage).
 * Illustrative: per-retailer price differences, fees, ETAs, tax, the payment step.
 */
(function () {
  'use strict';
  if (window.ELEMENTS && window.ELEMENTS.enabled) return;

  const BD = window.BD, P = BD.products;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = c => '$' + (c / 100).toFixed(2);

  // ---------------------------------------------------------------- events
  function emit(event, data) {
    const detail = { data: data || {}, metadata: { event: event, timestamp: Date.now(), tenantName: 'Breckenridge Distillery (demo)', sdk: 'static-standin' } };
    window.dispatchEvent(new CustomEvent('lce:actions.' + event, { detail: detail }));
    window.dispatchEvent(new CustomEvent('lce:actions', { detail: detail }));
  }

  // ---------------------------------------------------------------- catalog
  // Same order as breckenridgedistillery.com/products/
  const ORDER = ['breckenridge-peach-whiskey', 'breckenridge-patriotic-reserve', 'breckenridge-bourbon', 'breckenridge-distillers-high-proof',
    'breckenridge-single-barrel', 'breckenridge-blended-rye-whiskey', 'breckenridge-whiskey-px-cask-finish', 'breckenridge-whiskey-port-cask-finish',
    'breckenridge-whiskey-cabernet-franc-cask-finish', 'breckenridge-cognac-cask-finish', 'breckenridge-rum-cask-bourbon', 'breckenridge-honey-whiskey',
    'mountain-shot-pouch', 'breckenridge-spiced-whiskey', 'breckenridge-denver-university-whiskey-blend', 'breckenridge-spiced-rum', 'breckenridge-gin',
    'casa-breck-tequila-blanco', 'casa-breck-tequila-reposado', 'breckenridge-vodka', 'breckenridge-pear-flavored-vodka', 'breckenridge-chili-chile-vodka',
    'breckenridge-espresso-flavored-vodka', 'breckenridge-candy-cane-vodka'].filter(h => P[h]);
  const KIND = h => /rum$/.test(h) ? 'rum' : /vodka/.test(h) ? 'vodka' : /gin$/.test(h) ? 'gin' : /tequila/.test(h) ? 'tequila' : 'whiskey';
  const TABS = [['all', 'All'], ['whiskey', 'Whiskeys & Bourbons'], ['rum', 'Rum'], ['vodka', 'Vodka'], ['gin', 'Gin'], ['tequila', 'Tequila']];
  const title = h => P[h].name;
  const sizeLabel = h => (P[h].size || '750ml').replace(/ml$/i, ' ML').replace('10-pack', '10 Pack');

  // ---------------------------------------------------------------- geography
  const ZIP3 = [[5,5,'NY'],[10,27,'MA'],[28,29,'RI'],[30,38,'NH'],[39,49,'ME'],[50,59,'VT'],[60,69,'CT'],[70,89,'NJ'],[100,149,'NY'],[150,196,'PA'],[197,199,'DE'],[200,200,'DC'],[201,201,'VA'],[202,205,'DC'],[206,219,'MD'],[220,246,'VA'],[247,268,'WV'],[270,289,'NC'],[290,299,'SC'],[300,319,'GA'],[320,349,'FL'],[350,369,'AL'],[370,385,'TN'],[386,397,'MS'],[398,399,'GA'],[400,427,'KY'],[430,459,'OH'],[460,479,'IN'],[480,499,'MI'],[500,528,'IA'],[530,549,'WI'],[550,567,'MN'],[569,569,'DC'],[570,577,'SD'],[580,588,'ND'],[590,599,'MT'],[600,629,'IL'],[630,658,'MO'],[660,679,'KS'],[680,693,'NE'],[700,715,'LA'],[716,729,'AR'],[730,749,'OK'],[750,799,'TX'],[800,816,'CO'],[820,831,'WY'],[832,838,'ID'],[840,847,'UT'],[850,865,'AZ'],[870,884,'NM'],[885,885,'TX'],[889,898,'NV'],[900,961,'CA'],[967,968,'HI'],[970,979,'OR'],[980,994,'WA'],[995,999,'AK']];
  function stateForZip(zip) {
    if (!/^\d{5}$/.test(zip || '')) return null;
    const n = parseInt(zip.slice(0, 3), 10);
    for (const [a, b, s] of ZIP3) if (n >= a && n <= b) return s;
    return null;
  }
  const NOSHIP = ['AK', 'HI', 'UT', 'CO'];          // CO: their store does not ship in-state; local delivery only
  const hash = s => { let x = 7; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0; return x; };

  // Denver-metro local delivery (LAWS pilot stores that stock Breckenridge)
  const DEN = ['80202','80203','80204','80205','80206','80207','80209','80210','80211','80212','80214','80216','80218','80219','80220','80222','80223','80224','80230','80231','80237','80238','80246','80247'];
  const SOUTH = []; for (let n = 80110; n <= 80130; n++) SOUTH.push(String(n));
  const CO_LOCAL = [
    { key: 'co-mayfair', name: 'Mayfair Liquors', addr: 'Denver, CO', zips: DEN.concat(['80110', '80111', '80113']), eta: 60, fee: 500 },
    { key: 'co-heritage', name: 'Heritage Wine and More', addr: 'Centennial, CO', zips: SOUTH.concat(['80222', '80224', '80231', '80237', '80246', '80247', '80209', '80210']), eta: 90, fee: 799 }
  ];
  const NATIONAL = { key: 'ship-mission', name: 'Mission Wine & Spirits', addr: 'Pasadena, CA', ship: true };

  function gopuffAt(zip) {
    const ids = BD.gopuff.zips[zip];
    if (!ids) return null;
    const hs = new Set(); let city = '';
    ids.forEach(i => { const l = BD.gopuff.locs[i]; if (!city && l[0] && l[0] !== 'Gopuff') city = l[0] + (l[1] ? ', ' + l[1] : ''); l[2].forEach(h => hs.add(h)); });
    return { city: city, handles: hs };
  }
  // Retailers set the shelf price; Elements shows each retailer's own price.
  const priceAt = (h, rkey) => Math.max(P[h].price - 100, P[h].price + [0, 0, 100, 200, -100, 0, 300][hash(rkey + h) % 7]);

  // All fulfillment options for one product at one address, Elements style.
  function optionsFor(h, A) {
    const out = { shipping: [], sameday: [] };
    if (!A) return out;
    const st = A.st, zip = A.zip;
    if (st === 'CO') {
      CO_LOCAL.filter(s => s.zips.indexOf(zip) >= 0).forEach(s => out.sameday.push({ type: 'local', key: s.key, name: s.name, addr: s.addr, eta: s.eta, fee: s.fee, price: priceAt(h, s.key), sched: true }));
    }
    const gp = gopuffAt(zip);
    if (gp && gp.handles.has(h)) out.sameday.push({ type: 'gopuff', key: 'gopuff-' + zip, name: 'Gopuff', addr: gp.city || 'Nearby Gopuff', eta: 30, fee: 499, price: priceAt(h, 'gopuff') });
    if (NOSHIP.indexOf(st) < 0 && h !== 'mountain-shot-pouch') {
      const list = BD.retailers[st];
      if (list && list.length) {
        const r = list[hash(zip) % list.length];
        out.shipping.push({ type: 'ship', key: 'ship-' + st + '-' + hash(r[0]), name: r[0].replace(/ - Shipping$/, ''), addr: r[1] + ', ' + st, days: '1 to 3', fee: 1299, price: priceAt(h, r[0]) });
      }
      if (!out.shipping.some(o => o.name === NATIONAL.name)) out.shipping.push({ type: 'ship', key: NATIONAL.key, name: NATIONAL.name, addr: NATIONAL.addr, days: '3 to 5', fee: 1499, price: priceAt(h, NATIONAL.key) });
    }
    out.sameday.sort((a, b) => a.eta - b.eta);
    return out;
  }
  const allOpts = o => o.sameday.concat(o.shipping);
  const etaText = o => o.type === 'ship' ? 'Ships in ' + o.days + ' business days' : 'Arrives in ' + o.eta + ' mins';

  // ---------------------------------------------------------------- state
  const LS = 'bd-lce-v1';
  const ADDRS = [
    { one: '6050 E Colfax Ave', city: 'Denver', st: 'CO', zip: '80220', hint: 'Denver: local delivery, schedule a 1-hour window' },
    { one: '6464 S Clinton St', city: 'Centennial', st: 'CO', zip: '80112', hint: 'Denver south metro: local delivery' },
    { one: '1400 Pearl St', city: 'Boulder', st: 'CO', zip: '80302', hint: 'Colorado outside the delivery zone' },
    { one: '3212 Wilshire Blvd', city: 'Santa Monica', st: 'CA', zip: '90403', hint: 'Gopuff in about 30 minutes, or shipping' },
    { one: '1300 Bardstown Rd', city: 'Louisville', st: 'KY', zip: '40204', hint: 'Gopuff, or shipping' },
    { one: '500 Congress Ave', city: 'Austin', st: 'TX', zip: '78701', hint: 'Shipping from a Texas retailer' },
    { one: '350 5th Ave', city: 'New York', st: 'NY', zip: '10118', hint: 'Shipping from a New York retailer' },
    { one: '50 W Broadway', city: 'Salt Lake City', st: 'UT', zip: '84101', hint: 'State that does not allow shipping' }
  ];
  let S = load() || {};
  S.addr = S.addr || ADDRS[0];
  S.items = S.items || [];          // {h, qty, key}
  S.pick = S.pick || {};            // h -> chosen option key on the product list
  S.tab = S.tab || 'all';
  function load() { try { return JSON.parse(localStorage.getItem(LS)); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(LS, JSON.stringify({ addr: S.addr, items: S.items, pick: S.pick, tab: S.tab })); } catch (e) {} }
  const addrLine = a => a.one + ', ' + a.city + ', ' + a.st + ' ' + a.zip;

  function chosen(h) {
    const all = allOpts(optionsFor(h, S.addr));
    return all.find(o => o.key === S.pick[h]) || all[0] || null;
  }
  function lineOpt(it) { return allOpts(optionsFor(it.h, S.addr)).find(o => o.key === it.key) || null; }

  // ---------------------------------------------------------------- shell
  function shell() {
    document.body.insertAdjacentHTML('beforeend',
      '<div class="lce-scrim" id="lce-scrim"></div>' +
      '<aside class="lce lce-drawer" id="lce-drawer" aria-modal="true" role="dialog"><div class="lce-dh" id="lce-dh"></div><div class="lce-db" id="lce-db"></div><div class="lce-df" id="lce-df"></div></aside>');
    $('#lce-scrim').onclick = close;
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    const hc = $('#header-cart');
    hc.innerHTML = '<button class="lce lce-cartbtn" id="lce-cartbtn" aria-label="Cart"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg><span class="n" id="lce-count"></span></button>';
    $('#lce-cartbtn').onclick = openCart;
  }
  let view = null, back = null;
  function open(v, h, b, f, center) {
    view = v;
    $('#lce-dh').className = 'lce-dh' + (center ? ' center' : '');
    $('#lce-dh').innerHTML = h; $('#lce-db').innerHTML = b;
    const df = $('#lce-df'); df.innerHTML = f || ''; df.style.display = f ? '' : 'none';
    $('#lce-drawer').classList.add('on'); $('#lce-scrim').classList.add('on'); document.body.style.overflow = 'hidden';
    const x = $('[data-x]', $('#lce-dh')); if (x) x.onclick = close;
    const bk = $('[data-back]', $('#lce-dh')); if (bk) bk.onclick = () => back && back();
  }
  function close() { $('#lce-drawer').classList.remove('on'); $('#lce-scrim').classList.remove('on'); document.body.style.overflow = ''; view = null; }
  const X = '<button data-x aria-label="Close">&times;</button>';
  const BACK = '<button data-back aria-label="Back">&#8249;</button>';
  const POWERED = '<div class="lce-powered">Powered by <b>Vesper.</b></div><div class="lce-legal">Vesper owns and operates ReserveBar. See our <a href="#" onclick="return false">Privacy Policy</a> and <a href="#" onclick="return false">Terms &amp; Conditions</a>.</div>';

  // ---------------------------------------------------------------- address element
  function renderAddress() {
    $('#lce-address-id').innerHTML = '<div class="lce lce-addr"><b>Delivers to:</b><button id="lce-addr-btn">' + esc(addrLine(S.addr)) + '</button></div>';
    $('#lce-addr-btn').onclick = openAddress;
  }
  function openAddress() {
    const body = '<div class="lce-field" style="margin-top:0"><input id="lce-addr-in" value="' + esc(addrLine(S.addr)) + '" placeholder="Street address, city, state ZIP" autocomplete="off"></div>' +
      '<div class="lce-warn">Updating your delivery address will also clear your cart of items not available at the new address.</div>' +
      '<div class="lce-err" id="lce-addr-err"></div>' +
      '<div class="lce-2" style="margin-top:12px"><button class="lce-btn full ghost" id="lce-addr-cancel">Cancel</button><button class="lce-btn full" id="lce-addr-save">Save</button></div>' +
      '<div class="lce-sugg"><div class="lce-small" style="margin-bottom:4px">Demo addresses</div>' + ADDRS.map((a, i) => '<button data-a="' + i + '">' + esc(addrLine(a)) + '<span>' + esc(a.hint) + '</span></button>').join('') + '</div>' +
      '<div class="lce-note"><b>Demo note</b> Live Elements autocompletes with Google Places. Here any US address works if it ends in a ZIP code.</div>';
    open('address', '<h3>Enter delivery address</h3>' + X, body);
    $('#lce-addr-cancel').onclick = close;
    $$('[data-a]').forEach(b => b.onclick = () => setAddress(ADDRS[+b.dataset.a]));
    $('#lce-addr-save').onclick = () => {
      const v = $('#lce-addr-in').value.trim();
      const m = v.match(/(\d{5})\s*$/);
      const st = m && stateForZip(m[1]);
      if (!st) { $('#lce-addr-err').textContent = 'Enter a full US address ending in a 5-digit ZIP.'; return; }
      const known = ADDRS.find(a => a.zip === m[1]);
      const parts = v.replace(/,?\s*[A-Za-z]{2}\s*\d{5}\s*$/, '').split(',').map(s => s.trim()).filter(Boolean);
      setAddress(known && parts.length < 2 ? known : { one: parts[0] || '', city: parts[1] || '', st: st, zip: m[1] });
    };
    setTimeout(() => { const i = $('#lce-addr-in'); i && i.select(); }, 250);
  }
  function setAddress(a) {
    S.addr = a; S.pick = {};
    const before = S.items.length;
    S.items = S.items.filter(it => { const o = allOpts(optionsFor(it.h, a)); if (!o.length) return false; if (!o.find(x => x.key === it.key)) it.key = o[0].key; return true; });
    save(); close(); renderAddress(); renderGrid(); renderCount();
    emit('address_updated', { address: a, removedFromCart: before - S.items.length });
  }

  // ---------------------------------------------------------------- product list
  function renderTabs() {
    const bar = $('#wp-filter');
    const have = new Set(ORDER.map(KIND));
    bar.innerHTML = TABS.filter(t => t[0] === 'all' || have.has(t[0])).map(t => '<button data-tab="' + t[0] + '"' + (S.tab === t[0] ? ' class="on"' : '') + '>' + t[1] + '</button>').join('');
    $$('[data-tab]', bar).forEach(b => b.onclick = () => { S.tab = b.dataset.tab; save(); renderTabs(); renderGrid(); });
  }
  const qtys = {};
  function renderGrid() {
    const grid = $('#lce-products');
    const list = ORDER.filter(h => S.tab === 'all' || KIND(h) === S.tab);
    grid.classList.add('lce');
    grid.innerHTML = list.map(card).join('') || '<div class="lce-empty">No products in this category.</div>';
    $$('[data-pd]', grid).forEach(el => el.onclick = () => openProduct(el.dataset.pd));
    $$('[data-opts]', grid).forEach(el => el.onclick = () => openOptions(el.dataset.opts));
    $$('[data-q]', grid).forEach(el => el.onclick = () => { const h = el.dataset.h; qtys[h] = Math.max(1, Math.min(12, (qtys[h] || 1) + (+el.dataset.q))); el.parentNode.querySelector('span').textContent = qtys[h]; });
    $$('[data-add]', grid).forEach(el => el.onclick = () => addToCart(el.dataset.add, qtys[el.dataset.add] || 1));
    emit('product_list_loaded', { count: list.length, address: S.addr });
  }
  function card(h) {
    const p = P[h], o = optionsFor(h, S.addr), c = chosen(h), n = allOpts(o).length;
    const price = c ? c.price : p.price;
    return '<div class="lce-card" data-h="' + h + '">' +
      '<div class="pic" data-pd="' + h + '"><img src="' + p.img + '" alt="' + esc(title(h)) + '" loading="lazy"></div>' +
      '<h3 data-pd="' + h + '">' + esc(title(h)) + '</h3>' +
      '<div class="price">' + money(price) + '</div>' +
      '<div class="meta">Size: ' + esc(sizeLabel(h)) + '</div>' +
      (c ? '<div class="from">' + (c.type === 'ship' ? 'Shipped from: ' : 'Delivered from: ') + esc(c.name) + '<span class="eta">' + esc(etaText(c)) + '</span></div><button class="opts" data-opts="' + h + '">Delivery Options (' + n + ')</button>'
         : '<div class="na">' + (S.addr.st === 'CO' ? 'We\'re sorry, this product isn\'t available for delivery to this address yet. Local delivery covers the Denver metro.' : 'We\'re sorry, this product is not at nearby vendors and unavailable to ship to your state.') + ' <a href="#" onclick="return false">Find us near you!</a></div>') +
      '<div class="buy"><div class="lce-qty"><button data-q="-1" data-h="' + h + '" aria-label="Less">-</button><span>' + (qtys[h] || 1) + '</span><button data-q="1" data-h="' + h + '" aria-label="More">+</button></div>' +
      '<button class="lce-btn" data-add="' + h + '"' + (c ? '' : ' disabled') + '>' + (c ? 'Add To Cart' : 'Currently Unavailable') + '</button></div>' +
      '</div>';
  }

  // ---------------------------------------------------------------- delivery options drawer
  function openOptions(h, fromProduct) {
    const o = optionsFor(h, S.addr), c = chosen(h);
    let tab = c && c.type === 'ship' ? 'shipping' : (o.sameday.length ? 'sameday' : 'shipping');
    const draw = () => {
      const list = o[tab];
      const body = '<div class="lce-tabs"><button data-t="shipping"' + (tab === 'shipping' ? ' class="on"' : '') + '>Shipping (' + o.shipping.length + ')</button><button data-t="sameday"' + (tab === 'sameday' ? ' class="on"' : '') + '>Same-Day Delivery (' + o.sameday.length + ')</button></div>' +
        (list.length ? list.map(x => '<button class="lce-opt' + (c && x.key === c.key ? ' on' : '') + '" data-k="' + x.key + '">' +
          '<div class="r"><b>' + esc(x.name) + (x.sched ? '<span class="tag">Schedule</span>' : '') + '</b><b>' + money(x.price) + '</b></div>' +
          '<div class="r"><span>' + esc(etaText(x)) + '</span><span>' + (x.type === 'ship' ? 'Shipping ' : '') + money(x.fee) + '</span></div>' +
          '<div class="r"><span>' + esc(x.addr) + '</span></div></button>').join('')
          : '<div class="lce-none">' + (tab === 'shipping' ? (S.addr.st === 'CO' ? 'Shipping within Colorado isn\'t available. Choose same-day delivery.' : 'No retailer can ship this product to ' + esc(S.addr.st) + '.') : 'No same-day delivery at this address.') + '</div>') +
        (tab === 'sameday' && S.addr.st === 'CO' && o.sameday.length ? '<div class="lce-note"><b>Demo note</b> Denver-metro local delivery from the same stores that run it for LAWS, with a scheduled 1-hour window at checkout.</div>' : '') +
        (o.sameday.some(x => x.type === 'gopuff') && tab === 'sameday' ? '<div class="lce-note"><b>Demo note</b> Real Gopuff stock: this ZIP is served by a Gopuff location that carries this bottle (Gopuff feed, Nov 17).</div>' : '');
      open('options', (fromProduct ? BACK : '') + '<h3>Delivery Options</h3>' + X, body);
      back = () => openProduct(h);
      $$('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; draw(); });
      $$('[data-k]').forEach(b => b.onclick = () => { S.pick[h] = b.dataset.k; save(); renderGrid(); emit('product_fulfillment_changed', { handle: h, option: b.dataset.k }); if (fromProduct) openProduct(h); else close(); });
    };
    draw();
  }

  // ---------------------------------------------------------------- product drawer
  function openProduct(h) {
    const p = P[h], c = chosen(h), n = allOpts(optionsFor(h, S.addr)).length;
    let q = qtys[h] || 1;
    const body = '<div class="lce-pd"><div class="pic"><img src="' + p.img + '" alt=""></div><h2>' + esc(title(h)) + '</h2>' +
      '<div class="price">' + money(c ? c.price : p.price) + '</div><div class="lce-small" style="color:#1c1a19">Size: ' + esc(sizeLabel(h)) + '</div>' +
      '<div style="margin-top:10px;font-size:13px"><b>Delivers to:</b><br>' + esc(addrLine(S.addr)) + '</div><hr>' +
      (c ? '<div style="font-size:13px">' + (c.type === 'ship' ? 'Shipped from: ' : 'Delivered from: ') + esc(c.name) + '<br><span class="lce-small">' + esc(etaText(c)) + '</span></div><button class="lce-link" id="pd-opts" style="margin-top:4px">Delivery Options (' + n + ')</button>' : '<div class="lce-small">Not available at this address.</div>') +
      '<hr><div style="font-size:13px;font-weight:800;margin-bottom:4px">Description:</div><div class="desc clamp" id="pd-desc">' + esc(p.desc || '') + '</div><button class="lce-link" id="pd-more" style="margin-top:6px">See More</button></div>';
    const foot = '<div style="display:flex;gap:8px"><div class="lce-qty" style="height:36px"><button id="pd-m">-</button><span id="pd-q">' + q + '</span><button id="pd-p">+</button></div><button class="lce-btn full" id="pd-add" style="height:36px"' + (c ? '' : ' disabled') + '>' + (c ? 'Add To Cart' : 'Currently Unavailable') + '</button></div>';
    open('product', '<h3>Add to Cart</h3>' + X, body, foot);
    emit('product_loaded', { handle: h, name: title(h), price: c ? c.price : p.price, fulfillment: c ? c.type : null });
    const o = $('#pd-opts'); if (o) o.onclick = () => openOptions(h, true);
    $('#pd-more').onclick = e => { const d = $('#pd-desc'); d.classList.toggle('clamp'); e.target.textContent = d.classList.contains('clamp') ? 'See More' : 'See Less'; };
    $('#pd-m').onclick = () => { q = Math.max(1, q - 1); $('#pd-q').textContent = q; };
    $('#pd-p').onclick = () => { q = Math.min(12, q + 1); $('#pd-q').textContent = q; };
    $('#pd-add').onclick = () => addToCart(h, q);
  }

  // ---------------------------------------------------------------- cart
  function addToCart(h, q) {
    const c = chosen(h); if (!c) return;
    const it = S.items.find(i => i.h === h && i.key === c.key);
    if (it) it.qty = Math.min(24, it.qty + q); else S.items.push({ h: h, qty: q, key: c.key });
    qtys[h] = 1; save(); renderCount(); renderGrid();
    emit('product_add_to_cart', { handle: h, quantity: q, retailer: c.name, fulfillment: c.type, price: c.price });
    openCart();
  }
  const count = () => S.items.reduce((a, i) => a + i.qty, 0);
  function renderCount() { $('#lce-count').textContent = count() || ''; }
  function groups() {
    const g = {};
    S.items.forEach((it, idx) => {
      const o = lineOpt(it); if (!o) return;
      (g[o.key] = g[o.key] || { opt: o, lines: [] }).lines.push({ it: it, idx: idx, price: o.price });
    });
    return Object.values(g);
  }
  const subOf = g => g.lines.reduce((a, l) => a + l.price * l.it.qty, 0);
  const itemsOf = g => g.lines.reduce((a, l) => a + l.it.qty, 0);
  function openCart() {
    const gs = groups();
    if (!gs.length) {
      open('cart', '<h3>Cart</h3>' + X, '<div class="lce-none" style="text-align:center;padding:40px 0">Your cart is empty.</div>', '');
      emit('cart_opened', { items: 0 }); return;
    }
    const body = gs.map(g => '<div class="lce-group"><div class="gh"><div>' + esc(g.opt.name) + '<span>' + esc(g.opt.type === 'ship' ? 'Shipping, ' + etaText(g.opt).toLowerCase() : (g.opt.type === 'gopuff' ? 'Gopuff, about 30 minutes' : 'Local delivery, ASAP or scheduled')) + '</span></div></div>' +
      g.lines.map(l => '<div class="lce-line"><img src="' + P[l.it.h].img + '" alt=""><div><div class="n">' + esc(title(l.it.h)) + '</div><div>' + esc(sizeLabel(l.it.h)) + ', Bottle</div><div>' + esc(etaText(g.opt)) + '</div></div>' +
        '<button class="x" data-rm="' + l.idx + '" aria-label="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button>' +
        '<div class="ctl"><div class="lce-qty"><button data-cq="-1" data-i="' + l.idx + '">-</button><span>' + l.it.qty + '</span><button data-cq="1" data-i="' + l.idx + '">+</button></div></div><div class="amt">' + money(l.price * l.it.qty) + '</div></div>').join('') +
      '<div class="gs lce-row b"><span>Subtotal (' + itemsOf(g) + ' item' + (itemsOf(g) === 1 ? '' : 's') + '):</span><span>' + money(subOf(g)) + '</span></div></div>').join('') +
      (gs.length > 1 ? '<div class="lce-note"><b>Demo note</b> One cart, one payment. Elements splits the order by retailer behind the scenes; each licensed retailer is the seller of record for its bottles.</div>' : '');
    const sub = gs.reduce((a, g) => a + subOf(g), 0);
    const foot = '<div class="lce-row b"><span>Subtotal (' + count() + ' item' + (count() === 1 ? '' : 's') + '):</span><span>' + money(sub) + '</span></div><div class="lce-small" style="color:#1c1a19;font-weight:600">Taxes &amp; fees will be calculated at checkout</div>' +
      '<div class="lce-promo"><input id="cart-promo" placeholder="Enter promo code"><button id="cart-promo-go">Apply</button></div>' +
      '<button class="lce-btn full" id="cart-co">Checkout</button>' + POWERED;
    open('cart', '<h3>Cart</h3>' + X, body, foot);
    emit('cart_opened', { items: count(), subtotal: sub });
    $$('[data-rm]').forEach(b => b.onclick = () => { const it = S.items[+b.dataset.rm]; S.items.splice(+b.dataset.rm, 1); save(); renderCount(); openCart(); emit('cart_item_removed', { handle: it.h }); });
    $$('[data-cq]').forEach(b => b.onclick = () => { const it = S.items[+b.dataset.i]; it.qty = Math.max(0, Math.min(24, it.qty + (+b.dataset.cq))); if (!it.qty) S.items.splice(+b.dataset.i, 1); save(); renderCount(); openCart(); emit('cart_item_quantity_changed', { handle: it.h, quantity: it.qty }); });
    $('#cart-promo-go').onclick = () => applyPromo($('#cart-promo').value);
    $('#cart-co').onclick = () => { co.done = false; openCheckout(); };
  }

  // ---------------------------------------------------------------- checkout
  const co = { gift: false, giftTo: '', giftMsg: '', saved: false, paid: false, tip: 10, promo: '', when: 'asap', day: 0, win: '', done: false, f: {} };
  const PROMOS = { BRECKTHEHALLS: 'Free shipping on this order', CASKCLUB: '10% off spirits' };
  function applyPromo(code) {
    code = String(code || '').trim().toUpperCase();
    co.promo = PROMOS[code] ? code : '';
    emit('promo_code_applied', { code: code, valid: !!co.promo });
    if (view === 'checkout') openCheckout(); else openCart();
  }
  const MT = 'America/Denver';
  function days() {
    const out = [], now = Date.now();
    for (let i = 0; i < 7; i++) out.push({ i: i, label: (i === 0 ? 'Today, ' : i === 1 ? 'Tomorrow, ' : '') + new Intl.DateTimeFormat('en-US', { timeZone: MT, weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(now + i * 864e5)) });
    return out;
  }
  const hr = h => (h % 12 || 12) + (h < 12 ? 'am' : 'pm');
  function windows(dayIdx) {
    const nowH = +new Intl.DateTimeFormat('en-US', { timeZone: MT, hour: 'numeric', hourCycle: 'h23' }).format(new Date());
    const start = dayIdx === 0 ? Math.max(10, nowH + 2) : 10, out = [];
    for (let h = start; h < 21; h++) out.push({ k: String(h), label: hr(h) + ' to ' + hr(h + 1) + ' MT' });
    return out;
  }
  function totals(gs) {
    const sub = gs.reduce((a, g) => a + subOf(g), 0);
    const off = co.promo === 'CASKCLUB' ? Math.round(sub * 0.10) : 0;
    let ship = 0, deliv = 0;
    gs.forEach(g => { if (g.opt.type === 'ship') ship += co.promo === 'BRECKTHEHALLS' ? 0 : g.opt.fee; else deliv += g.opt.fee; });
    const fast = gs.filter(g => g.opt.type !== 'ship');
    const fastSub = fast.reduce((a, g) => a + subOf(g), 0);
    const tip = Math.round(fastSub * co.tip / 100);
    const tax = Math.round((sub - off) * 0.0875) + 99 * gs.length;   // illustrative tax + per-retailer service fee
    return { sub: sub, off: off, ship: ship, deliv: deliv, tip: tip, fast: fast, tax: tax, total: sub - off + ship + deliv + tip + tax };
  }
  function openCheckout() {
    const gs = groups();
    if (!gs.length) return openCart();
    if (co.done) return confirmation(gs);
    const T = totals(gs), f = co.f;
    const local = gs.some(g => g.opt.type === 'local');
    const ds = days();
    let wins = windows(co.day); if (!wins.length) { co.day = 1; wins = windows(1); }
    if (!wins.some(w => w.k === co.win)) co.win = wins[0].k;
    const inp = (id, label, ph, type) => '<div class="lce-field"><label for="f-' + id + '">' + label + '</label><input id="f-' + id + '" ' + (type ? 'type="' + type + '" ' : '') + 'placeholder="' + (ph || '') + '" value="' + esc(f[id] || '') + '" autocomplete="off"></div>';

    const giftSec = '<div class="lce-sec"><div class="lce-toggle"><div><h4>Send as Gift? (Free)</h4><div class="lce-small" style="color:#1c1a19">With personalized note &amp; gift receipt.</div></div><button class="lce-switch' + (co.gift ? ' on' : '') + '" id="co-gift" aria-label="Send as gift"></button></div>' +
      (co.gift ? inp('giftTo', 'Recipient name*', '') + '<div class="lce-field"><label for="f-giftMsg">Gift message</label><textarea id="f-giftMsg" rows="3" placeholder="Printed on the packing slip. Prices are hidden.">' + esc(f.giftMsg || '') + '</textarea></div>' : '') + '</div>';
    const delivSec = co.saved
      ? '<div class="lce-sec"><h4>Deliver to</h4><div class="lce-saved"><b>' + esc((f.first || 'Alex') + ' ' + (f.last || 'Rivera')) + '</b>' + esc(addrLine(S.addr)) + (f.apt ? ', ' + esc(f.apt) : '') + '<br>' + esc(f.email || '') + ' ' + esc(f.phone || '') + '</div><button class="lce-link" id="co-edit" style="margin-top:6px">Edit</button></div>'
      : '<div class="lce-sec"><h4>Deliver to</h4><div class="lce-small" style="color:#1c1a19">Package recipient must be 21+<br>Fields marked * are required.</div>' +
        '<div class="lce-2">' + inp('first', 'First Name*') + inp('last', 'Last Name*') + '</div>' + inp('company', 'Company (optional)') + inp('email', 'Email*', '', 'email') + inp('phone', 'Phone*', '', 'tel') + inp('dob', 'Birthdate*', 'MM/DD/YYYY') +
        '<div class="lce-field"><div class="lce-small">Delivery address</div><div style="font-size:13px">' + esc(addrLine(S.addr)) + '</div></div>' + inp('apt', 'Apt, suite, etc. (optional)') +
        '<div class="lce-field"><label for="f-notes">Delivery Instructions</label><textarea id="f-notes" rows="3">' + esc(f.notes || '') + '</textarea><div class="lce-small" style="color:#1c1a19;margin-top:4px">Include gate codes, apartment numbers, or preferred drop-off locations for your driver.</div></div>' +
        '<div class="lce-err" id="co-err"></div><button class="lce-btn full" id="co-save" style="margin-top:12px;background:#4a4643">Save Delivery Information</button></div>';
    const whenSec = local ? '<div class="lce-sec"><h4>Delivery time</h4><div class="lce-small" style="color:#1c1a19">For ' + esc(gs.filter(g => g.opt.type === 'local').map(g => g.opt.name).join(' and ')) + '</div>' +
      '<div class="lce-pills" style="grid-template-columns:1fr 1fr"><button data-when="asap"' + (co.when === 'asap' ? ' class="on"' : '') + '>As soon as possible</button><button data-when="sched"' + (co.when === 'sched' ? ' class="on"' : '') + '>Schedule</button></div>' +
      (co.when === 'sched' ? '<div class="lce-when"><select id="co-day" class="lce-field" style="margin:0;border:1px solid #8f8a84;padding:8px;font:inherit;font-size:13px">' + ds.map(d => '<option value="' + d.i + '"' + (d.i === co.day ? ' selected' : '') + '>' + esc(d.label) + '</option>').join('') + '</select><select id="co-win" style="border:1px solid #8f8a84;padding:8px;font:inherit;font-size:13px">' + wins.map(w => '<option value="' + w.k + '"' + (w.k === co.win ? ' selected' : '') + '>' + w.label + '</option>').join('') + '</select></div>' : '') +
      '<div class="lce-note"><b>Demo note</b> Scheduled delivery windows are in Elements and the API today, the same flow LAWS uses in Denver. The Shopify app does not have them yet.</div></div>' : '';
    const paySec = '<div class="lce-sec"><h4>Payment</h4><div class="lce-small" style="color:#1c1a19">All transactions are secure and encrypted.</div>' +
      '<div class="lce-field"><label>Card number</label><div class="lce-card-in"><input placeholder="1234 1234 1234 1234" inputmode="numeric" autocomplete="off" id="f-card"><span class="brands"><i style="background:#1a1f71">VISA</i><i style="background:#eb001b">MC</i><i style="background:#2e77bb">AMEX</i><i style="background:#f58220">DISC</i></span></div></div>' +
      '<div class="lce-2"><div class="lce-field"><label>Expiration date</label><input placeholder="MM / YY" autocomplete="off"></div><div class="lce-field"><label>Security code</label><input placeholder="CVC" autocomplete="off"></div></div>' +
      '<div class="lce-field"><label>ZIP code</label><input placeholder="12345" autocomplete="off"></div>' +
      '<label class="lce-check"><input type="checkbox" checked> Billing address same as shipping address</label>' +
      '<div class="lce-note"><b>Demo note</b> Live Elements renders Stripe card fields here. Nothing typed on this demo is stored or charged.</div></div>';
    const sumSec = '<div class="lce-sec"><h4>Order Summary</h4><div class="lce-small" style="color:#1c1a19;margin:4px 0 8px">' + count() + ' item' + (count() === 1 ? '' : 's') + '</div>' +
      gs.map(g => g.lines.map(l => '<div class="lce-summary-item"><img src="' + P[l.it.h].img + '" alt=""><div><b>' + esc(title(l.it.h)) + '</b>' + esc(etaText(g.opt)) + ',<br>From ' + esc(g.opt.name) + '<div style="margin-top:4px">Qty ' + l.it.qty + '</div></div><div style="font-weight:800">' + money(l.price * l.it.qty) + '</div></div>').join('')).join('') +
      '<div class="lce-promo"><input id="co-promo" placeholder="Enter promo code" value="' + esc(co.promo) + '"><button id="co-promo-go">Apply</button></div>' +
      (co.promo ? '<div class="lce-small" style="color:#2f7a3e">' + esc(co.promo) + ': ' + esc(PROMOS[co.promo]) + '</div>' : '') +
      '<div class="lce-promo"><input placeholder="Enter gift card code"><button>Apply</button></div>' +
      (T.fast.length ? '<div style="margin-top:10px;font-weight:800;font-size:13px">Add a tip</div><div class="lce-pills">' + [10, 18, 20].map(t => '<button data-tip="' + t + '"' + (co.tip === t ? ' class="on"' : '') + '>' + t + '%</button>').join('') + '</div><div class="lce-small" style="color:#1c1a19">Tips go to the drivers on same-day orders and are split between retailers.</div>' +
        T.fast.map(g => '<div class="lce-row" style="margin-top:6px"><span>' + esc(g.opt.name) + '</span><span>' + money(Math.round(subOf(g) * co.tip / 100)) + '</span></div>').join('') : '') +
      '</div>' +
      '<div class="lce-sec" style="border:0"><div style="font-size:11px;font-weight:800">100% Secure Payments</div><div style="font-size:11px;margin-bottom:10px">If a person over 21 is not available to receive this order, it will be returned for a $20 restocking fee. Valid government ID required.</div>' +
      '<div class="lce-row"><span>Subtotal (' + count() + ' item' + (count() === 1 ? '' : 's') + ')</span><span>' + money(T.sub) + '</span></div>' +
      (T.off ? '<div class="lce-row"><span>Discount</span><span>-' + money(T.off) + '</span></div>' : '') +
      (T.deliv || T.fast.length ? '<div class="lce-row"><span>Delivery</span><span>' + money(T.deliv) + '</span></div>' : '') +
      (gs.some(g => g.opt.type === 'ship') ? '<div class="lce-row"><span>Shipping</span><span>' + (T.ship ? money(T.ship) : 'Free') + '</span></div>' : '') +
      '<div class="lce-row"><span>Taxes &amp; Fees</span><span>' + money(T.tax) + '</span></div>' +
      (T.fast.length ? '<div class="lce-row"><span>Tips</span><span>' + money(T.tip) + '</span></div>' : '') +
      '<div class="lce-row total"><span>Total</span><span>' + money(T.total) + '</span></div>' +
      '<button class="lce-btn full" id="co-place" style="margin-top:12px;height:42px;background:' + (co.saved ? '#231f20' : '#4a4643') + '">Place Order</button>' +
      '<label class="lce-check"><input type="checkbox" checked> I agree to receive order updates and marketing email communications.</label>' +
      '<div style="text-align:center;font-size:12px;font-weight:600;border-top:1px solid var(--lce-line);border-bottom:1px solid var(--lce-line);padding:10px 0;margin-top:10px">By proceeding, you agree to our terms and conditions.</div>' +
      '<div class="lce-powered">Powered by <b>Vesper.</b></div><div class="lce-legal">All orders are fulfilled by Vesper, the owner and operator of ReserveBar and an independent third party that facilitates transactions between customers and licensed retailers.</div></div>';

    const sc = view === 'checkout' ? $('#lce-db').scrollTop : 0;
    open('checkout', BACK + '<h3>Checkout</h3>' + X, '<div class="lce-co">' + giftSec + delivSec + whenSec + paySec + sumSec + '</div>', '', true);
    $('#lce-db').scrollTop = sc;
    back = openCart;
    emit('checkout_opened', { items: count(), total: T.total });

    const keep = () => $$('.lce-co input[id^="f-"], .lce-co textarea[id^="f-"]').forEach(i => { f[i.id.slice(2)] = i.value; });
    $('#co-gift').onclick = () => { keep(); co.gift = !co.gift; openCheckout(); };
    const sv = $('#co-save'); if (sv) sv.onclick = () => {
      keep();
      const miss = ['first', 'last', 'email', 'phone', 'dob'].filter(k => !String(f[k] || '').trim());
      const m = String(f.dob || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      let err = miss.length ? 'Fill in the required fields.' : (!m ? 'Enter birthdate as MM/DD/YYYY.' : '');
      if (!err && m) { const age = (Date.now() - new Date(+m[3], +m[1] - 1, +m[2]).getTime()) / 31557600000; if (age < 21) err = 'The package recipient must be 21 or older.'; }
      if (err) { $('#co-err').textContent = err; return; }
      co.saved = true; openCheckout(); emit('checkout_delivery_saved', {});
    };
    const ed = $('#co-edit'); if (ed) ed.onclick = () => { co.saved = false; openCheckout(); };
    $$('[data-when]').forEach(b => b.onclick = () => { keep(); co.when = b.dataset.when; openCheckout(); });
    const dd = $('#co-day'); if (dd) dd.onchange = () => { co.day = +dd.value; co.win = ''; openCheckout(); };
    const ww = $('#co-win'); if (ww) ww.onchange = () => { co.win = ww.value; };
    $$('[data-tip]').forEach(b => b.onclick = () => { keep(); co.tip = +b.dataset.tip; openCheckout(); });
    $('#co-promo-go').onclick = () => { keep(); applyPromo($('#co-promo').value); };
    $('#co-place').onclick = () => {
      keep();
      if (!co.saved) { const s = $('#co-save'); if (s) { s.scrollIntoView({ behavior: 'smooth', block: 'center' }); s.click(); } return; }
      emit('checkout_submit_started', { total: T.total });
      co.done = true; co.T = T; co.order = 'BRK-' + String(Date.now()).slice(-6);
      emit('checkout_submit_completed', { order: co.order, total: T.total, retailers: gs.map(g => g.opt.name) });
      confirmation(gs);
    };
  }
  function confirmation(gs) {
    const ds = days(), wins = windows(co.day), w = wins.find(x => x.k === co.win);
    const body = '<div class="lce-done"><div class="ok">&#10003;</div><h4 style="font-size:17px;margin:0 0 4px">Order placed</h4><div class="lce-small">Order ' + esc(co.order) + ' &middot; confirmation sent to ' + esc(co.f.email || 'your email') + '</div></div>' +
      gs.map(g => '<div class="lce-group"><div class="gh"><div>' + esc(g.opt.name) + '<span>' + esc(g.opt.type === 'ship' ? etaText(g.opt) + ' &middot; tracking by email' : g.opt.type === 'local' && co.when === 'sched' && w ? 'Scheduled ' + ds[co.day].label + ', ' + w.label : etaText(g.opt) + ' &middot; driver updates by text') + '</span></div></div>' +
        g.lines.map(l => '<div class="lce-line"><img src="' + P[l.it.h].img + '" alt=""><div><div class="n">' + esc(title(l.it.h)) + '</div><div>Qty ' + l.it.qty + '</div></div><div class="amt" style="grid-column:3">' + money(l.price * l.it.qty) + '</div></div>').join('') + '</div>').join('') +
      '<div class="lce-row total"><span>Total charged</span><span>' + money(co.T.total) + '</span></div>' +
      '<div class="lce-note"><b>Demo note</b> In production each retailer gets its order through Vesper, Breckenridge gets the customer and order data, and the shopper never left breckenridgedistillery.com. No order was placed here.</div>';
    const foot = '<button class="lce-btn full" id="co-again">Continue shopping</button>' + POWERED;
    open('done', '<h3>Thank you</h3>' + X, body, foot, true);
    $('#co-again').onclick = () => { S.items = []; co.done = false; co.saved = false; co.promo = ''; save(); renderCount(); close(); };
  }

  // ---------------------------------------------------------------- page chrome
  function chrome() {
    const b = $('#wp-burger'); if (b) b.onclick = () => $('#wp-nav').classList.toggle('on');
    $$('[data-dead]').forEach(a => a.onclick = e => e.preventDefault());
    let hide = false; try { hide = localStorage.getItem('bd-notes') === 'off'; } catch (e) {}
    const nt = $('#notes-toggle');
    const apply = () => { document.body.classList.toggle('hide-notes', hide); if (nt) nt.textContent = hide ? 'Show demo notes' : 'Hide demo notes'; };
    apply(); if (nt) nt.onclick = () => { hide = !hide; try { localStorage.setItem('bd-notes', hide ? 'off' : 'on'); } catch (e) {} apply(); };
    let ok = false; try { ok = sessionStorage.getItem('bd-age') === '1'; } catch (e) {}
    if (!ok) {
      document.body.insertAdjacentHTML('beforeend', '<div id="agegate" style="position:fixed;inset:0;z-index:500;background:#2b2a28 url(assets/img/wood-tile.webp);display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;color:#fff;font-family:Oswald,sans-serif"><div><img src="assets/img/logo-mtn.webp" alt="Breckenridge Distillery" style="width:220px;margin:0 auto 18px"><h2 style="font-weight:400;text-transform:uppercase;font-size:24px;margin:0 0 18px">Are you 21 or older?</h2><button id="age-yes" style="background:#bc9b6a;color:#fff;border:0;font-family:Oswald;font-size:18px;text-transform:uppercase;padding:8px 30px;margin:0 6px;cursor:pointer">Yes</button><button id="age-no" style="background:none;color:#fff;border:1px solid #bc9b6a;font-family:Oswald;font-size:18px;text-transform:uppercase;padding:8px 30px;margin:0 6px;cursor:pointer">No</button></div></div>');
      $('#age-yes').onclick = () => { try { sessionStorage.setItem('bd-age', '1'); } catch (e) {} $('#agegate').remove(); };
      $('#age-no').onclick = () => { location.href = 'https://www.responsibility.org/'; };
    }
  }

  // ---------------------------------------------------------------- boot
  chrome(); shell(); renderAddress(); renderTabs(); renderGrid(); renderCount();
  window.LiquidCommerce = { elements: { standin: true, openCart: openCart, closeCart: close, openAddress: openAddress } };
  emit('client_ready', { isReady: true });
})();

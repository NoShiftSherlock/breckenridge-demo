/* Breckenridge Distillery storefront demo, AccelPay on Shopify.
 * Static demo: products, prices, images and copy are real (shop.breckenridgedistillery.com),
 * Gopuff coverage is real (gopuff_feed availability), network retailers are real.
 * Shipping/delivery fees, tax, the payment step and order confirmation are illustrative.
 * No payment is taken and no order is placed. */
(function () {
  const BD = window.BD;
  const P = BD.products;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = c => '$' + (c / 100).toFixed(2);
  const GP_ICON = 'assets/img/gopuff-icon.png';

  // Illustrative commercial settings for the demo
  const FREE_SHIP = 9900;      // their live promo: free delivery on $99+ (code BRECKTHEHALLS)
  const SHIP = 1499;           // illustrative standard shipping
  const GP_FEE = 499;          // illustrative Gopuff delivery fee
  const TAX = 0.08;            // illustrative tax
  const CLUB_OFF = 0.10;       // illustrative club discount
  const NOSHIP = ['AK', 'HI', 'UT'];

  const SPIRIT_CATS = ['whiskey', 'flavored', 'clear', 'tequila'];
  const CATS = [
    ['all', 'All'], ['whiskey', 'Whiskey'], ['flavored', 'Flavored'], ['clear', 'Vodka, Gin & Rum'], ['tequila', 'Casa Breck Tequila'],
    ['apparel', 'Clothing'], ['barware', 'Barware & Accessories'], ['mixers', 'Mixers & Edibles'], ['pets', 'Dogs']
  ];

  const ST_NAMES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'Washington, DC', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
  const ZIP3 = [[5,5,'NY'],[10,27,'MA'],[28,29,'RI'],[30,38,'NH'],[39,49,'ME'],[50,59,'VT'],[60,69,'CT'],[70,89,'NJ'],[100,149,'NY'],[150,196,'PA'],[197,199,'DE'],[200,200,'DC'],[201,201,'VA'],[202,205,'DC'],[206,219,'MD'],[220,246,'VA'],[247,268,'WV'],[270,289,'NC'],[290,299,'SC'],[300,319,'GA'],[320,349,'FL'],[350,369,'AL'],[370,385,'TN'],[386,397,'MS'],[398,399,'GA'],[400,427,'KY'],[430,459,'OH'],[460,479,'IN'],[480,499,'MI'],[500,528,'IA'],[530,549,'WI'],[550,567,'MN'],[569,569,'DC'],[570,577,'SD'],[580,588,'ND'],[590,599,'MT'],[600,629,'IL'],[630,658,'MO'],[660,679,'KS'],[680,693,'NE'],[700,715,'LA'],[716,729,'AR'],[730,749,'OK'],[750,799,'TX'],[800,816,'CO'],[820,831,'WY'],[832,838,'ID'],[840,847,'UT'],[850,865,'AZ'],[870,884,'NM'],[885,885,'TX'],[889,898,'NV'],[900,961,'CA'],[967,968,'HI'],[970,979,'OR'],[980,994,'WA'],[995,999,'AK']];
  function stateForZip(zip) {
    if (!/^\d{5}$/.test(zip || '')) return null;
    const n = parseInt(zip.slice(0, 3), 10);
    for (const [a, b, s] of ZIP3) if (n >= a && n <= b) return s;
    return null;
  }
  const stName = s => ST_NAMES[s] || s;

  // ------------------------------------------------------------------ routing
  function gopuffAt(zip) {
    const ids = BD.gopuff.zips[zip];
    if (!ids) return null;
    const hs = new Set(); let city = '';
    ids.forEach(i => { const l = BD.gopuff.locs[i]; if (!city) city = l[0]; l[2].forEach(h => hs.add(h)); });
    return { city: city, handles: hs };
  }
  function retailerIn(st, seed) {
    const list = BD.retailers[st];
    if (!list || !list.length) return null;
    const r = list[(seed || 0) % list.length];
    return { name: r[0], city: r[1], st: st };
  }
  function routeZip(zip) {
    const st = stateForZip(zip);
    if (!st) return null;
    return { zip: zip, st: st, blocked: NOSHIP.indexOf(st) >= 0, retailer: retailerIn(st, parseInt(zip, 10)), gp: gopuffAt(zip) };
  }
  const retailerLabel = r => r.retailer ? r.retailer.name + ', ' + r.retailer.city + ', ' + r.st : 'a licensed retailer in ' + stName(r.st);
  const isGpProduct = h => BD.gopuff.locs.some(l => l[2].indexOf(h) >= 0);

  // ------------------------------------------------------------------ state
  const LS = 'bd-demo-v1';
  let S = load() || { items: [], gift: { on: false, msg: '' }, mode: 'single', recipients: [] };
  function load() { try { return JSON.parse(localStorage.getItem(LS)); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) {} }
  const unit = it => it.plan === 'club' ? Math.round(P[it.h].price * (1 - CLUB_OFF)) : P[it.h].price;
  const subtotal = () => S.items.reduce((a, i) => a + unit(i) * i.qty, 0);
  const count = () => S.items.reduce((a, i) => a + i.qty, 0);
  function add(h, qty, plan, freq) {
    plan = plan || 'once';
    const it = S.items.find(i => i.h === h && i.plan === plan);
    if (it) it.qty = Math.min(24, it.qty + qty); else S.items.push({ h: h, qty: qty, plan: plan, freq: freq || 2 });
    save(); renderAll(); openDrawer();
  }
  function setQty(idx, q) { const it = S.items[idx]; if (!it) return; it.qty = Math.max(0, Math.min(24, q)); if (!it.qty) S.items.splice(idx, 1); save(); renderAll(); }
  window.BDCart = { add: add, state: () => S, save: save, render: () => renderAll() };

  // ------------------------------------------------------------------ chrome (header, footer, drawer)
  const ICON_CART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/></svg>';
  const ICON_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
  const NAV = [['shop.html?c=spirits', 'Spirits', 'spirits'], ['shop.html?c=merch', 'Clothing & Barware', 'merch'], ['product.html?p=breckenridge-whiskey-port-cask-finish#club', 'Cask Club', 'club'], ['gifting.html', 'Gifting', 'gifting'], ['index.html#deliver', '30-Min Delivery', 'deliver']];

  function chrome() {
    const page = document.body.dataset.page;
    const h = $('#site-header');
    if (h) {
      const cur = page === 'shop' ? (new URLSearchParams(location.search).get('c') === 'merch' ? 'merch' : 'spirits') : page;
      h.outerHTML =
        '<div class="announce">FREE Delivery on Orders $99+ thru 1/1/2027. Use Code BRECKTHEHALLS<a href="shop.html?c=spirits">Shop now</a></div>' +
        '<header class="site"><div class="hdr">' +
        '<a class="brand" href="index.html"><img class="logo" src="assets/img/logo.webp" alt="Breckenridge Distillery" width="123" height="58"><img class="broncos" src="assets/img/broncos.png" alt="Hometown whiskey of the Denver Broncos" width="132" height="26"></a>' +
        '<nav class="main">' + NAV.map(n => '<a href="' + n[0] + '"' + (cur === n[2] ? ' class="on"' : '') + '>' + n[1] + '</a>').join('') + '</nav>' +
        '<div class="hdr-icons"><button class="cart-btn" data-cart-open aria-label="Open cart">' + ICON_CART + '<span class="count" data-count hidden>0</span></button>' +
        '<button class="burger" id="burger" aria-label="Menu">' + ICON_MENU + '</button></div>' +
        '</div><nav class="mnav" id="mnav">' + NAV.map(n => '<a href="' + n[0] + '">' + n[1] + '</a>').join('') + '<a href="index.html#team">For the Breckenridge team</a></nav></header>';
    }
    const f = $('#site-footer');
    if (f) {
      f.outerHTML =
        '<footer class="site"><div class="wrap"><div class="fcols">' +
        '<div><h4>Restaurant / Bar</h4><p>1925 Airport Rd,<br>Breckenridge, CO 80424<br>(970) 547-9759</p><p>Mon-Sun: 12-3pm Lunch<br>Mon-Sun: 3-5pm Happy Hour<br>Mon-Sun: 5-Close Dinner</p></div>' +
        '<div><h4>Distillery Retail Shop</h4><p>1925 Airport Rd,<br>Breckenridge, CO 80424<br>(970) 547-9759, Ext 2</p><p>Mon: 11-9pm<br>Tues-Sun: 12pm-Close</p></div>' +
        '<div><h4>Main Street Tasting Room</h4><p>137 S Main St.,<br>Breckenridge, CO 80424</p><p>Mon-Sun: 11-8pm</p></div>' +
        '<div><h4>Shop</h4><p><a href="shop.html?c=spirits">Spirits</a><br><a href="shop.html?c=merch">Clothing & Barware</a><br><a href="gifting.html">Corporate & Event Gifting</a><br><a href="product.html?p=breckenridge-whiskey-port-cask-finish#club">Cask Club</a></p>' +
        '<p class="note">Spirits are sold and shipped by licensed retailers. Merchandise ships from Breckenridge Distillery. Must be 21+ to purchase. Please drink responsibly.</p></div>' +
        '</div><div class="fbottom"><span>&copy; 2026 Breckenridge Distillery, Breckenridge, Colorado, USA.</span><span>Demo by AccelPay. Not a live store; no payment is taken.</span></div></div></footer>' +
        '<div class="demo-tag"><span>Demo by AccelPay</span><button id="notes-toggle">Hide demo notes</button><a href="index.html#team" style="color:var(--gold)">Team notes</a></div>';
    }
    if (!$('#drawer') && page !== 'checkout') {
      document.body.insertAdjacentHTML('beforeend',
        '<div class="scrim" id="scrim"></div><aside class="drawer" id="drawer" aria-label="Cart"><div class="dh"><h3>Your Cart</h3><button class="x" data-cart-close aria-label="Close">&times;</button></div>' +
        '<div class="meter" id="meter"></div><div class="dbody" id="dbody"></div><div class="dfoot" id="dfoot"></div></aside>');
    }
    // age gate (once per session)
    let ok = false; try { ok = sessionStorage.getItem('bd-age') === '1'; } catch (e) {}
    if (!ok && page !== 'checkout') {
      document.body.insertAdjacentHTML('beforeend', '<div class="agegate" id="agegate"><div><img src="assets/img/logo-mtn.webp" alt="Breckenridge Distillery"><h2>To enter this site you must be of legal drinking age</h2><div class="b"><button class="btn" id="age-yes">Enter</button><button class="btn exit" id="age-no">Exit</button></div><p class="small" style="color:#999;margin-top:22px">&copy;2026 Breckenridge Distillery, Breckenridge, Colorado, USA. Please Drink Responsibly.</p></div></div>');
      $('#age-yes').onclick = () => { try { sessionStorage.setItem('bd-age', '1'); } catch (e) {} $('#agegate').remove(); };
      $('#age-no').onclick = () => { location.href = 'https://www.responsibility.org/'; };
    }
    document.addEventListener('click', e => {
      if (e.target.closest('[data-cart-open]')) { e.preventDefault(); openDrawer(); }
      if (e.target.closest('[data-cart-close]') || e.target.id === 'scrim') closeDrawer();
      const a = e.target.closest('[data-add]');
      if (a) { e.preventDefault(); add(a.dataset.add, 1, 'once'); }
    });
    const b = $('#burger'); if (b) b.onclick = () => $('#mnav').classList.toggle('on');
    let hide = false; try { hide = localStorage.getItem('bd-notes') === 'off'; } catch (e) {}
    const nt = $('#notes-toggle');
    const applyNotes = () => { document.body.classList.toggle('hide-notes', hide); if (nt) nt.textContent = hide ? 'Show demo notes' : 'Hide demo notes'; };
    if (nt) nt.onclick = () => { hide = !hide; try { localStorage.setItem('bd-notes', hide ? 'off' : 'on'); } catch (e) {} applyNotes(); };
    applyNotes();
  }
  function openDrawer() { const d = $('#drawer'); if (!d) return; d.classList.add('on'); $('#scrim').classList.add('on'); document.body.style.overflow = 'hidden'; }
  function closeDrawer() { const d = $('#drawer'); if (!d) return; d.classList.remove('on'); $('#scrim').classList.remove('on'); document.body.style.overflow = ''; }

  function thumb(h, cls) { const p = P[h]; return '<div class="' + cls + (p.merch ? ' merch' : '') + '"><img src="' + p.img + '" alt="" loading="lazy"></div>'; }
  function lineSub(it) {
    const p = P[it.h];
    if (it.plan === 'club') return '<div class="sub club">Cask Club, every ' + it.freq + ' months, 10% off</div>';
    return '<div class="sub">' + (p.merch ? 'Ships from Breckenridge Distillery' : (p.size ? p.size + ' · ' : '') + 'Sold by a licensed retailer') + '</div>';
  }
  function renderDrawer() {
    $$('[data-count]').forEach(el => { el.textContent = count(); el.hidden = !count(); });
    if (!$('#drawer')) return;
    const sub = subtotal();
    const left = FREE_SHIP - sub;
    $('#meter').innerHTML = (left > 0 ? 'You are <b>' + fmt(left) + '</b> away from free delivery.' : '<b>You unlocked free delivery.</b> Code BRECKTHEHALLS applied.') + '<div class="bar"><i style="width:' + Math.min(100, sub / FREE_SHIP * 100) + '%"></i></div>';
    if (!S.items.length) {
      $('#dbody').innerHTML = '<div class="empty"><p>Your cart is empty.</p><a class="btn" href="shop.html?c=spirits">Shop spirits</a></div>';
      $('#dfoot').innerHTML = '';
      return;
    }
    const inCart = new Set(S.items.map(i => i.h));
    const ups = ['breckenridge-distillery-filthy-cocktail-cherries', 'breckenridge-distillery-shot-glass', 'breckenridge-distillery-stainless-steel-flask', 'grey-hat', 'breckenridge-distillery-dog-treats', 'breckenridge-distillery-ice-mold-tray'].filter(h => P[h] && !inCart.has(h)).slice(0, 4);
    $('#dbody').innerHTML = S.items.map((it, i) => '<div class="line">' + thumb(it.h, 'th') +
      '<div><div class="nm">' + esc(P[it.h].name) + '</div>' + lineSub(it) +
      '<div class="qty"><button data-q="' + i + '" data-d="-1" aria-label="Less">&minus;</button><span>' + it.qty + '</span><button data-q="' + i + '" data-d="1" aria-label="More">+</button></div></div>' +
      '<div><div class="pr">' + fmt(unit(it) * it.qty) + '</div><button class="rm" data-rm="' + i + '">Remove</button></div></div>').join('') +
      (ups.length ? '<div class="upsell"><h4>Add some gear to the same order</h4><div class="uprow">' + ups.map(h => '<div class="upc"><img src="' + P[h].img + '" alt=""><div class="n">' + esc(P[h].name.replace('Breckenridge Distillery ', '')) + '</div><div>' + fmt(P[h].price) + '</div><button data-add="' + h + '">Add</button></div>').join('') + '</div></div>' : '') +
      '<label class="gift-line chk"><input type="checkbox" id="d-gift"' + (S.gift.on ? ' checked' : '') + '> This order is a gift (add a message at checkout)</label>';
    $('#dfoot').innerHTML = '<div class="tot"><span>Subtotal</span><span>' + fmt(sub) + '</span></div><div class="small">Spirits ship from a licensed retailer in your state, or arrive in about 30 minutes by Gopuff where available. Taxes and delivery calculated at checkout.</div><a class="btn block" href="checkout.html">Check out</a>';
    $$('#dbody [data-q]').forEach(b => b.onclick = () => setQty(+b.dataset.q, S.items[+b.dataset.q].qty + (+b.dataset.d)));
    $$('#dbody [data-rm]').forEach(b => b.onclick = () => setQty(+b.dataset.rm, 0));
    const g = $('#d-gift'); if (g) g.onchange = () => { S.gift.on = g.checked; save(); };
  }

  // ------------------------------------------------------------------ cards / grid
  function card(h) {
    const p = P[h];
    const tags = [];
    if (isGpProduct(h)) tags.push('<span class="tag gp"><img src="' + GP_ICON + '" alt="">30-min delivery</span>');
    if (p.club) tags.push('<span class="tag club">Cask Club</span>');
    if (p.merch) tags.push('<span class="tag ship">Ships with your spirits</span>');
    return '<a class="card' + (p.merch ? ' merch' : '') + '" href="product.html?p=' + h + '"><div class="tags">' + tags.join('') + '</div>' +
      '<div class="pic"><img src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy"></div>' +
      '<div class="info"><div class="nm">' + esc(p.name) + '</div><div class="meta">' + esc(p.size || (p.merch ? 'Merchandise' : '')) + '</div><div class="pr">' + fmt(p.price) + '</div>' +
      '<div class="quick"><span class="btn dark" data-add="' + h + '">Add to cart</span></div></div></a>';
  }
  function renderGrids() {
    $$('[data-grid]').forEach(el => {
      const hs = el.dataset.grid.split(',').map(s => s.trim()).filter(h => P[h]);
      el.innerHTML = hs.map(card).join('');
    });
    const shop = $('#shop-grid');
    if (!shop) return;
    const q = new URLSearchParams(location.search);
    let c = q.get('c') || 'all';
    const bar = $('#filters');
    function draw() {
      const list = BD.order.filter(h => {
        const p = P[h];
        if (c === 'all') return true;
        if (c === 'spirits') return SPIRIT_CATS.indexOf(p.cat) >= 0;
        if (c === 'merch') return p.merch;
        return p.cat === c;
      });
      shop.innerHTML = list.map(card).join('');
      $('#shop-count').textContent = list.length + ' products';
      bar.innerHTML = [['spirits', 'All Spirits'], ['merch', 'All Gear']].concat(CATS.slice(1)).map(x => '<button data-c="' + x[0] + '"' + (x[0] === c ? ' class="on"' : '') + '>' + x[1] + '</button>').join('');
      $$('button', bar).forEach(b => b.onclick = () => { c = b.dataset.c; history.replaceState(null, '', '?c=' + c); draw(); });
      const t = { spirits: ['Spirits', 'Award-winning whiskey, gin, vodka and Casa Breck tequila from the world\'s highest distillery.'], merch: ['Clothing & Barware', 'Hats, flasks, glassware, Filthy mixers and treats for the dog. Add them to the same order as your spirits.'] }[c];
      if (t) { $('#banner-h').textContent = t[0]; $('#banner-p').textContent = t[1]; $('#crumb').textContent = t[0]; }
    }
    draw();
  }

  // ------------------------------------------------------------------ zip check widget (home + PDP)
  function zipMessage(zip, h) {
    const r = routeZip(zip);
    if (!r) return '<span style="color:var(--red)">Enter a 5-digit US ZIP code.</span>';
    const p = P[h];
    if (p && p.merch) return 'Ships from Breckenridge Distillery in Colorado. Add it to the same order as your spirits.';
    if (r.blocked) return '<span style="color:var(--red)">We can\'t ship spirits to ' + stName(r.st) + ' yet. Merchandise still ships.</span>';
    const shipLine = 'Ships from ' + esc(retailerLabel(r)) + ', 2 to 5 business days.';
    if (r.gp && r.gp.handles.has(h)) return '<div class="ok"><img src="' + GP_ICON + '" alt="Gopuff"><div><b>Delivered in about 30 minutes by Gopuff</b> (' + esc(r.gp.city) + '). Or ' + shipLine.charAt(0).toLowerCase() + shipLine.slice(1) + '</div></div>';
    if (r.gp) return '<div class="ok"><img src="' + GP_ICON + '" alt="Gopuff"><div>Gopuff delivers to ' + zip + ', with Breckenridge Bourbon and more in about 30 minutes. This bottle ' + shipLine.replace('Ships', 'ships') + '</div></div>';
    return shipLine;
  }
  function wireZipChecks() {
    $$('[data-zipcheck]').forEach(box => {
      const h = box.dataset.zipcheck || 'breckenridge-bourbon';
      const inp = $('input', box), out = $('.zipres', box);
      const go = () => { out.innerHTML = zipMessage(inp.value.trim(), h); };
      $('button.go', box).onclick = go;
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
      $$('[data-try]', box).forEach(b => b.onclick = () => { inp.value = b.dataset.try; go(); });
    });
  }

  // ------------------------------------------------------------------ PDP
  function renderPDP() {
    const root = $('#pdp'); if (!root) return;
    const h = new URLSearchParams(location.search).get('p');
    const p = P[h];
    if (!p) { location.replace('shop.html'); return; }
    document.title = p.name + ' | Breckenridge Distillery';
    $('#crumb').textContent = p.name;
    let plan = (location.hash === '#club' && p.club) ? 'club' : 'once', qty = 1;
    const clubPrice = Math.round(p.price * (1 - CLUB_OFF));
    const gp = isGpProduct(h);
    root.innerHTML =
      '<div class="gal' + (p.merch ? ' merch' : '') + '"><img src="' + p.img + '" alt="' + esc(p.name) + '"></div>' +
      '<div><h1>' + esc(p.name) + '</h1><div class="size">' + esc(p.size || (p.merch ? 'Merchandise' : '')) + '</div>' +
      '<div class="price" id="pdp-price">' + fmt(p.price) + '</div>' +
      (p.desc ? '<div class="desc">' + esc(p.desc.length > 420 ? p.desc.slice(0, p.desc.lastIndexOf('.', 420) + 1 || 420) : p.desc) + '</div>' : '') +
      (p.club ?
        '<div id="club"><label class="opt' + (plan === 'once' ? ' on' : '') + '" data-plan="once"><input type="radio" name="plan"' + (plan === 'once' ? ' checked' : '') + '><div style="flex:1"><div class="t"><span>One-time purchase</span><span>' + fmt(p.price) + '</span></div></div></label>' +
        '<label class="opt' + (plan === 'club' ? ' on' : '') + '" data-plan="club"><input type="radio" name="plan"' + (plan === 'club' ? ' checked' : '') + '><div style="flex:1"><div class="t"><span>Join the Cask Club</span><span>' + fmt(clubPrice) + '</span></div>' +
        '<div class="save">Save 10% on every bottle</div><div class="d">A cask finish bottle on your schedule. Rotate through Port, PX, Rum and Cognac casks, or keep this one. Skip, swap or cancel any time from your account.</div>' +
        '<select id="freq"><option value="1">Every month</option><option value="2" selected>Every 2 months</option><option value="3">Every 3 months</option></select></div></label>' +
        '<div class="dnote"><b>Demo note</b>Recharge-style subscription running on the brand\'s own Shopify checkout. Each renewal is routed to a licensed retailer in the subscriber\'s state, same as a one-time order. Discount and cadence are settings you choose.</div></div>' : '') +
      '<div class="buyrow"><div class="qty"><button id="qm" aria-label="Less">&minus;</button><span id="qv">1</span><button id="qp" aria-label="More">+</button></div><button class="btn" id="add-btn">Add to cart</button></div>' +
      (p.merch ?
        '<div class="pdp-box"><h4>Ships with your spirits</h4><div class="small" style="color:var(--ink-2)">Merchandise ships from Breckenridge Distillery in Colorado. Put a hat or a flask in the same cart as a bottle and check out once.</div></div>' +
        '<div class="dnote"><b>Demo note</b>This item is marked unavailable on the current Flaviar store. Here it sells in the same cart and checkout as spirits, and the order splits behind the scenes: spirits to a licensed retailer, merch to your own fulfillment.</div>'
        :
        '<div class="pdp-box" data-zipcheck="' + h + '"><h4>' + (gp ? '<img src="' + GP_ICON + '" alt="Gopuff">' : '') + 'Get it today or have it shipped</h4>' +
        '<div class="row"><input type="text" inputmode="numeric" maxlength="5" placeholder="Enter your ZIP code"><button class="btn dark go">Check</button></div>' +
        '<div class="small" style="margin-top:6px">Try ' + (gp ? '<a href="#" data-try="90403">90403</a> (Santa Monica), <a href="#" data-try="40204">40204</a> (Louisville), ' : '') + '<a href="#" data-try="80202">80202</a> (Denver), <a href="#" data-try="78701">78701</a> (Austin)</div>' +
        '<div class="zipres"></div></div>') +
      '<div class="pdp-box"><label class="chk"><input type="checkbox" id="pdp-gift"' + (S.gift.on ? ' checked' : '') + '> This is a gift</label><textarea id="pdp-msg" placeholder="Gift message (printed on the packing slip)" ' + (S.gift.on ? '' : 'hidden') + '>' + esc(S.gift.msg) + '</textarea>' +
      '<div class="small" style="margin-top:6px">Sending to a team or a client list? <a href="gifting.html">Corporate and bulk gifting</a></div></div>' +
      (!p.merch ? '<div class="facts"><div><b>21+</b>ID checked at delivery</div><div><b>Licensed</b>Sold by a retailer in your state</div><div><b>' + (gp ? '30 min' : '2-5 days') + '</b>' + (gp ? 'Gopuff in select cities' : 'Ground shipping') + '</div></div>' : '') +
      '</div>';
    $$('[data-try]', root).forEach(a => a.addEventListener('click', e => e.preventDefault()));
    const setPlan = v => { plan = v; $$('.opt', root).forEach(o => { o.classList.toggle('on', o.dataset.plan === v); $('input', o).checked = o.dataset.plan === v; }); $('#pdp-price').textContent = fmt(v === 'club' ? clubPrice : p.price); };
    $$('.opt', root).forEach(o => o.addEventListener('click', () => setPlan(o.dataset.plan)));
    if (p.club) setPlan(plan);
    $('#qm').onclick = () => { qty = Math.max(1, qty - 1); $('#qv').textContent = qty; };
    $('#qp').onclick = () => { qty = Math.min(24, qty + 1); $('#qv').textContent = qty; };
    $('#add-btn').onclick = () => { add(h, qty, plan, plan === 'club' ? +$('#freq').value : 0); };
    const g = $('#pdp-gift'), m = $('#pdp-msg');
    g.onchange = () => { S.gift.on = g.checked; m.hidden = !g.checked; save(); };
    m.oninput = () => { S.gift.msg = m.value; save(); };
    if (location.hash === '#club' && p.club) setTimeout(() => $('#club').scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
    // related
    const rel = $('#related');
    if (rel) {
      const pool = p.merch ? ['breckenridge-bourbon', 'breckenridge-distillers-high-proof', 'breckenridge-whiskey-port-cask-finish', 'breckenridge-gin'] : ['breckenridge-distillery-stainless-steel-flask', 'breckenridge-distillery-filthy-cocktail-cherries', 'grey-hat', 'breckenridge-distillery-shot-glass'];
      rel.innerHTML = pool.filter(x => x !== h && P[x]).map(card).join('');
    }
  }

  // ------------------------------------------------------------------ checkout
  const co = { rate: null, done: false };
  function legsSingle(r) {
    // returns { options:[{id,title,sub,price,icon}], legs per option }
    const alc = S.items.filter(i => !P[i.h].merch), mer = S.items.filter(i => P[i.h].merch);
    const sub = subtotal();
    const shipFee = sub >= FREE_SHIP ? 0 : SHIP;
    const opts = [];
    const retailLeg = items => ({ who: 'Ships from ' + retailerLabel(r), how: 'Ground, 2 to 5 business days. Adult signature required.', items: items });
    const merchLeg = items => ({ who: 'Ships from Breckenridge Distillery, Breckenridge, CO', how: 'Ground, 3 to 5 business days', items: items });
    if (r.blocked) {
      return { blocked: true, opts: mer.length && !alc.length ? [{ id: 'ship', title: 'Standard shipping', sub: '3 to 5 business days', price: shipFee, legs: [merchLeg(mer)] }] : [] };
    }
    const shipLegs = []; if (alc.length) shipLegs.push(retailLeg(alc)); if (mer.length) shipLegs.push(merchLeg(mer));
    opts.push({ id: 'ship', title: 'Standard shipping', sub: alc.length ? 'Licensed retailer in ' + stName(r.st) + ', 2 to 5 business days' : '3 to 5 business days', price: shipFee, legs: shipLegs, icon: 'truck' });
    if (r.gp && alc.length) {
      const gpItems = alc.filter(i => i.plan !== 'club' && r.gp.handles.has(i.h));
      if (gpItems.length) {
        const rest = alc.filter(i => gpItems.indexOf(i) < 0);
        const legs = [{ who: 'Gopuff, ' + r.gp.city, how: 'Delivered in about 30 minutes. ID checked at the door.', items: gpItems, gp: true }];
        if (rest.length) legs.push(retailLeg(rest));
        if (mer.length) legs.push(merchLeg(mer));
        const split = rest.length || mer.length;
        opts.unshift({ id: 'gopuff', title: 'Delivery in about 30 minutes', sub: 'Gopuff, ' + r.gp.city + (split ? '. Everything else ships' + (shipFee ? ' (' + fmt(shipFee) + ' included).' : ' free.') : ''), price: GP_FEE + (split ? shipFee : 0), legs: legs, icon: 'gp' });
      }
    }
    return { opts: opts };
  }
  function renderCheckout() {
    const root = $('#co'); if (!root) return;
    const multi = S.mode === 'multi';
    $$('.seg button').forEach(b => b.classList.toggle('on', b.dataset.mode === S.mode));
    $('#single-box').hidden = multi; $('#multi-box').hidden = !multi;
    const sum = $('#co-sum');
    if (!S.items.length) {
      $('#co-rates').innerHTML = ''; $('#co-pkgs').innerHTML = '';
      sum.innerHTML = '<p>Your cart is empty.</p><a class="btn" href="shop.html?c=spirits">Shop spirits</a>';
      $('#place').disabled = true; return;
    }
    const sub = subtotal();
    let ship = 0, units = 1, note = '', ready = false, shipLabel = 'Shipping';
    if (!multi) {
      const zip = $('#zip').value.trim();
      const r = routeZip(zip);
      const ratesEl = $('#co-rates'), pk = $('#co-pkgs');
      if (r) { const sel = $('#state'); if (sel.value !== r.st) sel.value = r.st; }
      if (!r) {
        ratesEl.innerHTML = '<div class="msg muted">Enter your shipping address to see delivery options.</div>'; pk.innerHTML = ''; co.rate = null;
      } else {
        const L = legsSingle(r);
        if (L.blocked && !L.opts.length) {
          ratesEl.innerHTML = '<div class="msg warn">We can\'t ship spirits to ' + stName(r.st) + ' yet. Remove the spirits to ship merchandise only, or try another address.</div>'; pk.innerHTML = ''; co.rate = null;
        } else {
          if (!co.rate || !L.opts.some(o => o.id === co.rate)) co.rate = L.opts[0].id;
          ratesEl.innerHTML = '<div class="rates">' + L.opts.map(o => '<label class="rate' + (o.id === co.rate ? ' on' : '') + '" data-rate="' + o.id + '"><input type="radio" name="rate"' + (o.id === co.rate ? ' checked' : '') + '>' +
            '<span class="ic">' + (o.icon === 'gp' ? '<img src="' + GP_ICON + '" alt="Gopuff">' : '<svg viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.6"><path d="M1 6h13v10H1zM14 9h4l3 3v4h-7z"/><circle cx="5.5" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/></svg>') + '</span>' +
            '<span class="tx"><b>' + esc(o.title) + '</b><span>' + esc(o.sub) + '</span></span><span class="p">' + (o.price ? fmt(o.price) : 'FREE') + '</span></label>').join('') + '</div>';
          $$('[data-rate]', ratesEl).forEach(l => l.onclick = () => { co.rate = l.dataset.rate; renderCheckout(); });
          const cur = L.opts.find(o => o.id === co.rate);
          ship = cur.price; shipLabel = co.rate === 'gopuff' ? 'Delivery' : 'Shipping'; ready = true;
          pk.innerHTML = '<div class="small" style="margin:14px 0 8px">How this order is fulfilled' + (cur.legs.length > 1 ? ' (' + cur.legs.length + ' packages, one checkout)' : '') + '</div>' +
            cur.legs.map(l => '<div class="pkg"><div class="ph">' + (l.gp ? '<img src="' + GP_ICON + '" alt="" style="width:18px;height:18px;border-radius:4px;display:inline-block;vertical-align:-3px;margin-right:6px">' : '') + esc(l.who) + '</div><div class="small">' + esc(l.how) + '</div><ul>' + l.items.map(i => '<li>' + i.qty + ' &times; ' + esc(P[i.h].name) + (i.plan === 'club' ? ' (Cask Club)' : '') + '</li>').join('') + '</ul></div>').join('');
          co.legs = cur.legs; co.route = r;
        }
      }
    } else {
      const rs = S.recipients;
      units = 0; ship = 0;
      const perShip = sub >= FREE_SHIP ? 0 : SHIP;
      $$('#recips-body tr').forEach((tr, i) => {
        const rec = rs[i]; const rt = $('.route', tr); const r = routeZip(rec.zip);
        if (!r) { rt.className = 'route'; rt.textContent = 'Enter a ZIP'; return; }
        const hasAlc = S.items.some(it => !P[it.h].merch);
        if (r.blocked && hasAlc) { rt.className = 'route bad'; rt.textContent = 'Spirits cannot ship to ' + stName(r.st) + '. Not charged.'; return; }
        units++; ship += perShip;
        rt.className = 'route'; rt.textContent = hasAlc ? 'Ships from ' + retailerLabel(r) : 'Ships from Breckenridge Distillery';
      });
      ready = units > 0; shipLabel = 'Shipping (' + units + ' recipient' + (units === 1 ? '' : 's') + ')';
      note = units ? '<div class="small" style="margin-top:6px">Each recipient gets the items above. ' + units + ' &times; ' + fmt(sub) + '</div>' : '';
    }
    const goods = sub * (multi ? units : 1);
    const tax = Math.round(goods * TAX);
    const total = goods + ship + tax;
    const hasClub = S.items.some(i => i.plan === 'club');
    sum.innerHTML = '<div class="co-items">' + S.items.map(it => '<div class="it">' + thumb(it.h, 'th').replace('</div>', '<i>' + it.qty + '</i></div>') + '<div><div class="n">' + esc(P[it.h].name) + '</div><div class="s">' + (it.plan === 'club' ? 'Cask Club, every ' + it.freq + ' months' : (P[it.h].merch ? 'Merchandise' : esc(P[it.h].size))) + '</div></div><div class="p">' + fmt(unit(it) * it.qty) + '</div></div>').join('') + '</div>' +
      '<div class="disc"><input placeholder="Discount code or gift card" value="' + (sub >= FREE_SHIP ? 'BRECKTHEHALLS' : '') + '"><button type="button">Apply</button></div>' +
      '<div class="sumrow"><span>Subtotal' + (multi && units ? ' &times; ' + units : '') + '</span><span>' + fmt(goods) + '</span></div>' +
      '<div class="sumrow"><span class="lbl">' + shipLabel + (sub >= FREE_SHIP && !multi && co.rate === 'ship' ? '<small>BRECKTHEHALLS free delivery $99+</small>' : '') + '</span><span>' + (ready ? (ship ? fmt(ship) : 'FREE') : 'Enter address') + '</span></div>' +
      '<div class="sumrow"><span>Estimated taxes</span><span>' + fmt(tax) + '</span></div>' +
      '<div class="sumrow total"><span>Total</span><span><small style="font-size:.72rem;color:var(--muted);font-weight:400;margin-right:6px">USD</small>' + fmt(total) + '</span></div>' + note +
      (hasClub ? '<div class="msg info" style="margin-top:14px">Cask Club renews every ' + S.items.find(i => i.plan === 'club').freq + ' months at the club price. Skip or cancel any time.</div>' : '') +
      '<div class="dnote"><b>Demo note</b>Products and prices are live from your Shopify catalog. Gopuff coverage is real (' + BD.gopuff.locs.length + ' Gopuff locations stock Breckenridge today). Shipping, delivery fee and tax are sample values.</div>';
    $('#place').disabled = !ready;
    co.total = total; co.units = units; co.ship = ship;
  }
  const SAMPLE = [
    { name: 'Jordan Lee', co: 'Summit Partners', zip: '80202', msg: 'Thanks for a great year. Cheers from the team.' },
    { name: 'Priya Shah', co: 'Summit Partners', zip: '78701', msg: '' },
    { name: 'Marcus Reed', co: 'Northline Capital', zip: '11201', msg: '' },
    { name: 'Erin Walsh', co: 'Northline Capital', zip: '60614', msg: '' },
    { name: 'Tom Becker', co: 'Lakeside Group', zip: '84101', msg: '' },
    { name: 'Ana Ruiz', co: 'Lakeside Group', zip: '90403', msg: '' }
  ];
  function renderRecipients() {
    const tb = $('#recips-body'); if (!tb) return;
    tb.innerHTML = S.recipients.map((r, i) => '<tr><td><input data-f="name" data-i="' + i + '" value="' + esc(r.name) + '" placeholder="Full name"><div class="route"></div></td><td><input data-f="co" data-i="' + i + '" value="' + esc(r.co || '') + '" placeholder="Company"></td><td style="width:92px"><input data-f="zip" data-i="' + i + '" value="' + esc(r.zip) + '" placeholder="ZIP" inputmode="numeric" maxlength="5"></td><td style="width:30px"><button class="del" data-del="' + i + '" aria-label="Remove">&times;</button></td></tr>').join('');
    $$('input', tb).forEach(inp => inp.oninput = () => { S.recipients[+inp.dataset.i][inp.dataset.f] = inp.value; save(); if (inp.dataset.f === 'zip') renderCheckout(); });
    $$('[data-del]', tb).forEach(b => b.onclick = () => { S.recipients.splice(+b.dataset.del, 1); save(); renderRecipients(); renderCheckout(); });
    $('#recips-n').textContent = S.recipients.length;
    const gn = $('#recips-note'); if (gn) { gn.hidden = !(S.giftCount > S.recipients.length); gn.textContent = 'Demo: showing ' + S.recipients.length + ' sample rows from a list of ' + S.giftCount + ' recipients. Totals below are for the rows shown.'; }
  }
  function wireCheckout() {
    const root = $('#co'); if (!root) return;
    $$('.seg button').forEach(b => b.onclick = () => { S.mode = b.dataset.mode; if (S.mode === 'multi' && !S.recipients.length) S.recipients = SAMPLE.slice(0, 3).map(x => Object.assign({}, x)); save(); renderRecipients(); renderCheckout(); });
    ['#zip', '#state'].forEach(s => $(s).addEventListener('input', () => renderCheckout()));
    $$('[data-tryzip]').forEach(b => b.onclick = () => {
      const v = b.dataset.tryzip.split('|');
      $('#addr').value = v[1]; $('#city').value = v[2]; $('#zip').value = v[0]; co.rate = null; renderCheckout();
    });
    $$('.express button').forEach(b => b.onclick = () => {
      $('#email').value = 'sam.taylor@example.com'; $('#fname').value = 'Sam'; $('#lname').value = 'Taylor';
      $('#addr').value = '3212 Wilshire Blvd'; $('#city').value = 'Santa Monica'; $('#zip').value = '90403'; co.rate = null; renderCheckout();
      $('#co-rates').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    $('#add-recip').onclick = () => { S.recipients.push({ name: '', co: '', zip: '', msg: '' }); save(); renderRecipients(); renderCheckout(); };
    $('#csv-recip').onclick = () => { S.recipients = SAMPLE.map(x => Object.assign({}, x)); save(); renderRecipients(); renderCheckout(); };
    const g = $('#gift-on'), gm = $('#gift-msg');
    g.checked = !!S.gift.on; gm.value = S.gift.msg || ''; $('#gift-box').hidden = !S.gift.on;
    g.onchange = () => { S.gift.on = g.checked; $('#gift-box').hidden = !g.checked; save(); };
    gm.oninput = () => { S.gift.msg = gm.value; save(); };
    $('#co-form').onsubmit = e => { e.preventDefault(); placeOrder(); };
    renderRecipients();
    renderCheckout();
  }
  function placeOrder() {
    const multi = S.mode === 'multi';
    const num = 'BRK-' + (10480 + Math.floor(Math.random() * 400));
    const tags = ['accelpay'];
    let body = '';
    if (!multi) {
      if (!co.legs) return;
      co.legs.forEach(l => { if (l.gp) tags.push('gopuff-30-min'); else if (/Breckenridge Distillery/.test(l.who)) tags.push('merch-fulfillment'); else tags.push('retailer: ' + l.who.replace('Ships from ', '')); });
      body = '<p>' + co.legs.length + (co.legs.length > 1 ? ' shipments, one order.' : ' shipment.') + '</p>' + co.legs.map(l => '<div class="pkg"><div class="ph">' + esc(l.who) + '</div><div class="small">' + esc(l.how) + '</div><ul>' + l.items.map(i => '<li>' + i.qty + ' &times; ' + esc(P[i.h].name) + '</li>').join('') + '</ul></div>').join('');
    } else {
      tags.push('multi-ship', 'corporate-gift');
      const ok = S.recipients.filter(r => { const rt = routeZip(r.zip); return rt && !(rt.blocked && S.items.some(it => !P[it.h].merch)); });
      body = '<p>' + ok.length + ' recipients, one order. Each gift is routed to a licensed retailer in the recipient\'s state.</p>' + ok.map(r => { const rt = routeZip(r.zip); return '<div class="pkg"><div class="ph">' + esc(r.name || 'Recipient') + (r.co ? ' <span>' + esc(r.co) + '</span>' : '') + '</div><div class="small">' + esc(r.zip) + ' · Ships from ' + esc(retailerLabel(rt)) + '</div></div>'; }).join('');
    }
    if (S.gift.on) tags.push('gift');
    if (S.items.some(i => i.plan === 'club')) tags.push('subscription: cask-club');
    const name = multi ? 'Corporate gift order' : (($('#fname').value || 'Sam') + ' ' + ($('#lname').value || 'Taylor'));
    document.body.insertAdjacentHTML('beforeend', '<div class="modal" id="done"><div class="box"><div class="ok">&#10003;</div><h3>Thank you' + (multi ? '' : ', ' + esc(($('#fname').value || 'Sam'))) + '</h3><p class="small">Order ' + num + ' · ' + fmt(co.total) + '</p>' + body +
      (S.gift.on && S.gift.msg ? '<div class="msg info">Gift message: &ldquo;' + esc(S.gift.msg) + '&rdquo;</div>' : '') +
      '<div class="admin"><div class="ah"><i></i>In your Shopify admin</div>Order ' + num + ' · ' + esc(name) + ' · customer record, email and order history stay with Breckenridge.<div style="margin-top:6px">' + tags.map(t => '<span class="tg">' + esc(t) + '</span>').join('') + '</div></div>' +
      '<p class="small" style="margin-top:14px">Demo only. No payment was taken and no order was placed.</p><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px"><button class="btn" id="done-reset">Start over</button><button class="btn outline" id="done-close">Back to checkout</button></div></div></div>');
    $('#done-close').onclick = () => $('#done').remove();
    $('#done-reset').onclick = () => { S = { items: [], gift: { on: false, msg: '' }, mode: 'single', recipients: [] }; save(); location.href = 'index.html'; };
  }

  // ------------------------------------------------------------------ gifting builder
  function wireGifting() {
    const root = $('#gift-builder'); if (!root) return;
    const bottles = ['breckenridge-bourbon', 'breckenridge-distillers-high-proof', 'breckenridge-whiskey-port-cask-finish', 'breckenridge-single-barrel', 'breckenridge-gin', 'casa-breck-tequila-reposado'];
    const extras = ['breckenridge-distillery-shot-glass', 'breckenridge-distillery-stainless-steel-flask', 'breckenridge-distillery-filthy-cocktail-cherries', 'breckenridge-distillery-mtn-logo-camper-snapback', 'breckenridge-distillery-ice-mold-tray', 'breckenridge-distillery-leather-flask'].filter(h => P[h]);
    let bottle = bottles[0]; const ex = new Set([extras[0]]);
    const pickHTML = (hs, type) => hs.map(h => '<label class="' + (P[h].merch ? 'merch' : '') + '" data-h="' + h + '"><input type="' + type + '"><img src="' + P[h].img + '" alt=""><span class="n">' + esc(P[h].name.replace('Breckenridge Distillery ', '').replace('Breckenridge ', '')) + '</span><span class="p">' + fmt(P[h].price) + '</span></label>').join('');
    $('#pick-bottle').innerHTML = pickHTML(bottles, 'radio');
    $('#pick-extra').innerHTML = pickHTML(extras, 'checkbox');
    function draw() {
      $$('#pick-bottle label').forEach(l => l.classList.toggle('on', l.dataset.h === bottle));
      $$('#pick-extra label').forEach(l => l.classList.toggle('on', ex.has(l.dataset.h)));
      const n = Math.max(1, Math.min(500, parseInt($('#g-n').value, 10) || 1));
      const per = P[bottle].price + Array.from(ex).reduce((a, h) => a + P[h].price, 0);
      $('#g-sum').innerHTML = '<div class="sumrow"><span>' + esc(P[bottle].name) + '</span><span>' + fmt(P[bottle].price) + '</span></div>' + Array.from(ex).map(h => '<div class="sumrow"><span>' + esc(P[h].name.replace('Breckenridge Distillery ', '')) + '</span><span>' + fmt(P[h].price) + '</span></div>').join('') +
        '<div class="sumrow total"><span>Per gift</span><span>' + fmt(per) + '</span></div><div class="sumrow"><span>Recipients</span><span>' + n + '</span></div><div class="sumrow" style="font-weight:700"><span>Products</span><span>' + fmt(per * n) + '</span></div><div class="small">Shipping and tax are calculated per recipient at checkout.</div>';
    }
    $$('#pick-bottle label').forEach(l => l.onclick = e => { e.preventDefault(); bottle = l.dataset.h; draw(); });
    $$('#pick-extra label').forEach(l => l.onclick = e => { e.preventDefault(); ex.has(l.dataset.h) ? ex.delete(l.dataset.h) : ex.add(l.dataset.h); draw(); });
    const n0 = () => Math.max(1, Math.min(500, parseInt($('#g-n').value, 10) || 1));
    $('#g-n').oninput = draw;
    $('#g-go').onclick = () => {
      S.items = [{ h: bottle, qty: 1, plan: 'once' }].concat(Array.from(ex).map(h => ({ h: h, qty: 1, plan: 'once' })));
      S.mode = 'multi'; S.gift = { on: true, msg: $('#g-msg').value || '' };
      S.recipients = SAMPLE.map(x => Object.assign({}, x)); S.giftCount = n0();
      save(); location.href = 'checkout.html';
    };
    draw();
  }

  function renderAll() { renderDrawer(); renderCheckout(); }
  function boot() { chrome(); renderGrids(); renderPDP(); wireZipChecks(); wireCheckout(); wireGifting(); renderDrawer(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

/* LiquidCommerce Elements wiring for the Breckenridge Buy Online page.
 *
 * enabled:false  -> elements-demo.js renders a static stand-in that copies the
 *                   Elements product list, delivery options, cart and checkout
 *                   drawers, and publishes the same lce:actions.* events.
 * enabled:true   -> loads the real SDK. Needs Breckenridge's own partner account:
 *                   the Quick Start data-token (pk_...), the partner code (first
 *                   path segment of the script src) and the UPC for each SKU.
 *
 * Breckenridge is not in the LiquidCommerce catalog yet (checked 11/18/26 against
 * the REST catalog), so there is nothing for the live SDK to render until the
 * brand is onboarded and retailers are linked to its UPCs.
 *
 * What the live WordPress embed is, in full (same as lawswhiskeyhouse.com/buy-laws/):
 *
 *   <div id="lce-address-id"></div>
 *   <div data-liquid-commerce-elements-products-list="buy-online"
 *        data-rows="6" data-columns="4"
 *        data-product-url="/spirits/?p={grouping}"
 *        data-product-order="UPC1,UPC2,..."></div>
 *   <script data-liquid-commerce-elements-custom-theme type="application/json">{...theme below...}</script>
 *   <script defer data-liquid-commerce-elements data-token="pk_..." data-env="production"
 *           data-cart-badge-button="header-cart"
 *           src="https://elements.reservebar-worker.workers.dev/<partner>/all/elements.js"></script>
 *   <script>
 *     window.addEventListener('lce:actions.client_ready', e => {
 *       if (e.detail.data.isReady) window.LiquidCommerce.elements.injectAddressElement('lce-address-id');
 *     }, { once: true });
 *   </script>
 */
window.ELEMENTS = {
  enabled: false,
  token: null,          // Partner App > Quick Start > Main Script (data-token)
  partnerCode: null,    // e.g. 'lawsw' for LAWS
  env: 'production',
  // UPC per product handle, filled once Breckenridge is in the catalog.
  upcs: {},
  customTheme: {
    global: {
      theme: {
        primaryColor: '#231f20',
        accentColor: '#bc9b6a',
        inputBorderColor: '#8f8a84',
        focusRingColor: '#bc9b6a',
        fontFamily: 'Mulish'
      },
      layout: { allowPromoCodes: true, drawerBackgroundColor: '#ffffff' }
    }
  }
};

(function () {
  var E = window.ELEMENTS;
  if (!E.enabled || !E.token || !E.partnerCode) return;
  var t = document.createElement('script');
  t.type = 'application/json';
  t.setAttribute('data-liquid-commerce-elements-custom-theme', '');
  t.textContent = JSON.stringify(E.customTheme);
  document.head.appendChild(t);
  var s = document.createElement('script');
  s.defer = true;
  s.setAttribute('data-liquid-commerce-elements', '');
  s.setAttribute('data-token', E.token);
  s.setAttribute('data-env', E.env);
  s.setAttribute('data-cart-badge-button', 'header-cart');
  s.src = 'https://elements.reservebar-worker.workers.dev/' + E.partnerCode + '/all/elements.js';
  document.head.appendChild(s);
})();

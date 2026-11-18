# Breckenridge Distillery: Buy Online with LiquidCommerce Elements (sales demo)

Private sales demo. Uses Breckenridge Distillery's names, marks, product photos and copy to show
breckenridgedistillery.com (WordPress) selling directly on its own Spirits page through LiquidCommerce
Elements, the same setup LAWS Whiskey House runs at lawswhiskeyhouse.com/buy-laws/, instead of sending
shoppers to shop.breckenridgedistillery.com. Not affiliated with or endorsed by Breckenridge Distillery,
Gopuff, ReserveBar or Minibar; all marks belong to their owners. No payment is taken and no order is placed.
Keep the link unlisted and share it 1:1 only.

Live: https://noshiftsherlock.github.io/breckenridge-demo/
Earlier Shopify-store version: https://noshiftsherlock.github.io/breckenridge-demo/shopify/

## Files
| File | What it is |
| --- | --- |
| `index.html` | WordPress Spirits page clone with the Elements address element and product list |
| `site.css` | WordPress theme chrome (header, hero, filter bar, footer) |
| `elements.css` | Elements components, themed for Breckenridge |
| `elements-demo.js` | Static stand-in for Elements: product list, Delivery Options, product, cart and checkout drawers. Publishes `lce:actions.*` events in the SDK's `{data, metadata}` envelope |
| `elements-config.js` | Real SDK wiring behind `enabled: false`, plus the exact WordPress embed snippet |
| `data.js` | Products, Gopuff stock by location and ZIP, network retailers by state |
| `shopify/` | The earlier Shopify-checkout demo (merch, Cask Club, multi-recipient gifting) |

## Going live
Breckenridge is not in the LiquidCommerce catalog yet (checked 11/18/26), so the real SDK has nothing to
render. Once they are onboarded: put their Quick Start `data-token`, partner code and UPCs in
`elements-config.js`, set `enabled: true`, and delete `elements-demo.js`.

## Real vs illustrative
Real: products, bottle shots, base prices and copy (Shopify products.json, 2026-11-17); Gopuff stock by
location and the ZIPs each serves (gopuff_feed, 2026-11-17); network retailers carrying Breckenridge by
state (2026-11-07); Mayfair and Heritage as the Denver-metro local delivery stores.
Illustrative: per-retailer price differences, delivery and shipping fees, ETAs, tax and service fee,
Heritage/Mayfair delivery ZIPs, the payment step and confirmation.

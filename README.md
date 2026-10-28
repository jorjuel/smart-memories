# Smart Memories V5 — Consolidated Website

One local website combining the storefront, product catalogue, memory creator, working voice playback, My Memories, customer account shell and owner/production dashboard.

## Included routes
- `/` Home
- `/shop` Products
- `/shop/[slug]` Product detail
- `/how-it-works`
- `/create` Photo + voice memory creator
- `/memories` Local saved memories
- `/m/[code]` Recipient memory page with working Play/Pause button
- `/account` Customer area
- `/cart` and `/checkout` commerce shells
- `/about`, `/contact`
- `/admin` Owner dashboard
- `/admin/orders`, `/admin/memories`, `/admin/products`, `/admin/customers`, `/admin/nfc`

## Windows
Run inside this `smart-memories` folder:

    npm.cmd install
    npm.cmd run dev

Keep PowerShell open and visit the Local address shown.

## Prototype boundaries
This is a consolidated local MVP, not yet a production ecommerce service. Photo/audio memories are saved in IndexedDB on the current browser/device. Real payments, permanent cloud storage/database, authentication, emails, order persistence, video storage, QR generation, shipping integrations and secure admin access must be connected before public launch.

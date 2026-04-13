---
name: La Provence MVP
description: Wedding gift list system — static HTML + localStorage, French aesthetic. Key info about tech, structure, and decisions.
type: project
---

## Project Overview
Static HTML MVP for La Provence Decor's wedding gift list system. No backend — all data lives in `localStorage` via `js/app.js`.

**Color palette:** --verde #00300D · --ouro #EBAB0A · --ocre #C4781A (ochre, used for primary buttons) · --ouro-claro #FBDD90 · --bege #FAF6EF

**Pages:** index.html (landing), auth.html, dashboard.html, catalogo.html, lista.html (public gift list), story.html (Instagram story generator), gestor.html (admin panel)

## Catalog Structure (v2 — April 2026)
75 products from CSV, stored in `CATALOGO_SEED` in `js/app.js`. Each item has:
- `imgs: []` array of paths like `assets/img/catalog/IMG_XXXX.jpg`
- `setor`: one of Mesa posta · Prataria · Adornos · Vasos · Complementos
- `marca`, `tamanho`, `preco` (float), `estoque`, `status`

**Catalog version:** `CATALOG_VERSION = 2` — bump this constant to force-reset all users' localStorage catalog.

Images live in `assets/img/catalog/` — photos come from Google Drive, named IMG_XXXX.jpg matching the references in the original CSV.

## Pre-mounted Lists
Three lists in `PREMONTADAS_SEED`: **Clássica**, **Rústica**, **Minimalista**. Each has an `itens` array referencing catalog IDs and a "Ver itens" modal on the landing page.

## Key Features Added (April 2026)
- Photo carousel on item cards (both catalogo.html and lista.html public view)
- CTA section uses `assets/img/TecidoEx1.png` as background texture (opacity 0.18)
- WhatsApp popup shows hours: Seg. a Sáb. 08h às 18h
- Full multi-column footer with contact, hours, site link, and quote
- Story word-wrap for long couple names + more vertical space between photo and text
- Ochre (`#C4781A`) replaces bright yellow on primary action buttons

## Why:
User wants a polished MVP for store launch. Keeping things static/localStorage for now.

## How to apply:
- When adding new catalog items, add to CATALOGO_SEED and bump CATALOG_VERSION
- Images must go in `assets/img/catalog/` following the IMG_XXXX.jpg naming convention
- Keep setor values exactly: Mesa posta · Prataria · Adornos · Vasos · Complementos (or update filters in catalogo.html and lista.html too)

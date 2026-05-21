# Graph Report - .  (2026-05-14)

## Corpus Check
- Corpus is ~30,001 words - fits in a single context window. You may not need a graph.

## Summary
- 173 nodes · 308 edges · 21 communities (19 shown, 2 thin omitted)
- Extraction: 95% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Admin CRUD Pages|Admin CRUD Pages]]
- [[_COMMUNITY_Project Config & Dependencies|Project Config & Dependencies]]
- [[_COMMUNITY_Auth & Customer Context|Auth & Customer Context]]
- [[_COMMUNITY_Dashboard & Analytics|Dashboard & Analytics]]
- [[_COMMUNITY_Product Management & POS|Product Management & POS]]
- [[_COMMUNITY_Layout & Checkout Flow|Layout & Checkout Flow]]
- [[_COMMUNITY_Social Media Icons|Social Media Icons]]
- [[_COMMUNITY_Color Utility Script|Color Utility Script]]
- [[_COMMUNITY_Brand Assets & Imagery|Brand Assets & Imagery]]
- [[_COMMUNITY_Service Worker Cache|Service Worker Cache]]
- [[_COMMUNITY_Build Tool Assets|Build Tool Assets]]
- [[_COMMUNITY_React Framework Icons|React Framework Icons]]

## God Nodes (most connected - your core abstractions)
1. `db` - 20 edges
2. `Faciil / Meu PDV` - 16 edges
3. `React Router DOM 7.14.2` - 15 edges
4. `useAuth()` - 12 edges
5. `useProducts()` - 11 edges
6. `React 19.2.5` - 8 edges
7. `useCart()` - 7 edges
8. `useCustomerAuth()` - 7 edges
9. `Vite 8.0.10` - 7 edges
10. `Social Media Icons Sprite` - 6 edges

## Surprising Connections (you probably didn't know these)
- `React Compiler` --conceptually_related_to--> `React 19.2.5`  [INFERRED]
  README.md → AGENTS.md
- `Hero Banner Image` --conceptually_related_to--> `Faciil`  [AMBIGUOUS]
  src/assets/hero.png → public/og-image.svg
- `Faciil / Meu PDV` --implements--> `Firebase Firestore`  [EXTRACTED]
  AGENTS.md → public/humans.txt
- `Google Site Verification` --references--> `Faciil / Meu PDV`  [EXTRACTED]
  public/googlec9b0a8c9d8b3f3c8.html → AGENTS.md
- `@vitejs/plugin-react` --conceptually_related_to--> `React 19.2.5`  [INFERRED]
  README.md → AGENTS.md

## Hyperedges (group relationships)
- **Meu PDV Tech Stack** — Faciil_MeuPDV, React_19, Vite_8, Tailwind_CSS_4, Firebase_12, React_Router_DOM, React_Hook_Form, Zod, Recharts [EXTRACTED 1.00]
- **Deployment Pipeline** — Faciil_MeuPDV, Vercel, GitHub [EXTRACTED 1.00]
- **Entry Point Chain** — index_html, main_jsx, Faciil_MeuPDV [EXTRACTED 1.00]

## Communities (21 total, 2 thin omitted)

### Community 0 - "Admin CRUD Pages"
Cohesion: 0.11
Nodes (6): DEFAULT_CATEGORIES, ICONS, app, db, firebaseConfig, storage

### Community 1 - "Project Config & Dependencies"
Cohesion: 0.17
Nodes (19): ESLint, Faciil / Meu PDV, Firebase 12.12.1, Firebase Firestore, GitHub, Nunito Sans Font, React 19.2.5, React Compiler (+11 more)

### Community 2 - "Auth & Customer Context"
Cohesion: 0.13
Nodes (9): CustomerAuthModal(), CAROUSEL_COUPONS, CAROUSEL_OFFERS, ICONS_MAP, Storefront(), CustomerAuthContext, useCustomerAuth(), MyOrdersPage() (+1 more)

### Community 3 - "Dashboard & Analytics"
Cohesion: 0.14
Nodes (10): AuthModal(), AuthContext, useAuth(), ProductProvider(), LoginPage(), ProfilePage(), roleLabels, statusStyles (+2 more)

### Community 4 - "Product Management & POS"
Cohesion: 0.21
Nodes (11): React Router DOM 7.14.2, CartContext, useCart(), ProductContext, useProducts(), AdminAddProductPage(), AdminPosPage(), AdminProductsPage() (+3 more)

### Community 5 - "Layout & Checkout Flow"
Cohesion: 0.17
Nodes (5): AdminLayout(), DashboardLayout(), ThemeContext, ThemeProvider(), useTheme()

### Community 7 - "Social Media Icons"
Cohesion: 0.29
Nodes (7): Generic Social Icon, Social Media Icons Sprite, Bluesky Icon, Discord Icon, Documentation Icon, GitHub Icon, X/Twitter Icon

### Community 8 - "Color Utility Script"
Cohesion: 0.33
Nodes (3): fs, path, replacements

### Community 9 - "Brand Assets & Imagery"
Cohesion: 0.4
Nodes (6): Faciil, Uber Flash Delivery, Gemini Generated Favicon Image, Hero Banner Image, Crato-CE, FACIIL Open Graph Image

### Community 12 - "Build Tool Assets"
Cohesion: 1.0
Nodes (3): Vite, Favicon SVG, Vite Logo SVG

## Ambiguous Edges - Review These
- `Hero Banner Image` → `Faciil`  [AMBIGUOUS]
  src/assets/hero.png · relation: conceptually_related_to

## Knowledge Gaps
- **36 isolated node(s):** `fs`, `path`, `replacements`, `ASSETS`, `clone` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Hero Banner Image` and `Faciil`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `React Router DOM 7.14.2` connect `Product Management & POS` to `Admin CRUD Pages`, `Project Config & Dependencies`, `Auth & Customer Context`, `Dashboard & Analytics`, `Layout & Checkout Flow`?**
  _High betweenness centrality (0.193) - this node is a cross-community bridge._
- **Why does `Faciil / Meu PDV` connect `Project Config & Dependencies` to `Product Management & POS`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Why does `db` connect `Admin CRUD Pages` to `Auth & Customer Context`, `Dashboard & Analytics`, `Product Management & POS`, `Layout & Checkout Flow`, `Order Management`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **What connects `fs`, `path`, `replacements` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin CRUD Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Auth & Customer Context` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
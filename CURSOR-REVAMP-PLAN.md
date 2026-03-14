# ANTN.STUDIO — PLAN COMPLET DE REVAMP

> Référence unique pour Cursor. Vision, DA, specs par page, ordre d'exécution, code CSS de référence, état d'avancement.

---

## VISION

Portfolio cinématique dark/terminal/monospace + panel admin = vrai outil de production. DA inspirée Claude.ai (warm white, espace, confort) fusionnée avec l'identité code-core d'antn.

---

## ARCHITECTURE

```
antn.studio/
│
├── PUBLIC
│   ├── /                         Hero vidéo plein écran + slider projets
│   ├── /projects                 Grille draggable masonry
│   └── /about                    Page à propos + grain subtil
│
├── CLIENT (liens partageables, pas d'auth)
│   ├── /review/[token]           Player vidéo + commentaires timecodes
│   └── /invoice/[id]             Visualisation facture + paiement Stripe
│
└── ADMIN (auth mdp simple)
    ├── /admin                    Dashboard
    ├── /admin/projects           Hub central projets
    ├── /admin/finances           Graphiques revenus/dépenses
    ├── /admin/invoices           Création/gestion factures
    └── /admin/settings           Config site + profil + API keys
```

---

## DIRECTION ARTISTIQUE

### ANTI-PATTERNS — Ce qu'on ne veut PAS

- **PAS de glassmorphism** : pas de backdrop-filter blur, pas de surfaces translucides, pas de reflets, pas de box-shadow "glass". Daté.
- **PAS de gradients décoratifs** sur les fonds/surfaces.
- **PAS de glow/neon** : pas de box-shadow colorés type `0 0 20px rgba(color)`.
- **PAS de liquid metal** : annulé, pas dans la DA.
- **PAS de blanc pur** : le texte principal est warm white `#F5F0E8`.

### Tokens visuels

| Élément             | Valeur                                                                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fond public         | `#000` / `#0a0a0a`                                                                                                                                                         |
| Fond admin surfaces | `#0a0a0a` → `#111` → `#161616` (étagé)                                                                                                                                     |
| Texte principal     | `#F5F0E8` (warm white)                                                                                                                                                     |
| Texte secondaire    | `#8a8a8a`                                                                                                                                                                  |
| Texte tertiaire     | `#666`                                                                                                                                                                     |
| Borders             | `1px solid #222`                                                                                                                                                           |
| Radius              | `0` sur cards/surfaces/conteneurs. `8px` sur éléments interactifs (boutons, sidebar items, inputs). `70px→8px` morphing sur boutons pill. Léger arrondi sur player review. |
| Spacing             | Généreux — Claude-style — le contenu respire                                                                                                                               |
| Transitions         | 150-250ms ease. Pas de cubic-bezier complexes.                                                                                                                             |
| Ombres              | Minimales. Uniquement sur éléments élevés (modals, dropdowns).                                                                                                             |

### Typographie

- **Principale** : monospace existante — uppercase, letter-spacing
- **Secondaire** : Geist Sans (Vercel) — géométrique, clean, headings admin. Install via package `geist`.
- **Hiérarchie** : titre 1.5-2rem (Geist Sans), sous-titre 1-1.25rem, body 0.9rem (monospace), caption 0.75rem
- **Line-height** : 1.5+ sur le body
- **Letter-spacing** : négatif (-0.01 à -0.03em) sur les titres

### Principes d'interaction

- Hover sobres, transitions douces, feedback clair
- Tout changement d'état animé en 150-250ms ease
- Aucun changement visuel brusque
- Surfaces opaques solides — différenciation par subtiles variations de luminosité (2-5%)
- Borders `#222` max quand nécessaire — la différence de fond suffit la plupart du temps

### Éléments conservés

- ASCII art : garder, intégrer proprement, réduire en admin
- Grain/noise : subtil en fond (about), pas un overlay lourd
- CRT effect : loading screen ASCII uniquement

### Breakpoints

```
sm : 640px
md : 768px
lg : 1024px    ← sidebar collapse → burger en dessous
xl : 1280px
```

### Grain CSS (pour page about)

```css
.grain-bg::after {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.025;
  background-image: radial-gradient(
    rgba(255, 255, 255, 0.15) 0.5px,
    transparent 0.5px
  );
  background-size: 3px 3px;
  mix-blend-mode: soft-light;
}
```

---

## SIDEBAR ADMIN

- **Mode par défaut** : icônes only (compact, ~68px)
- **Mode expanded** : icônes + labels (~280px)
- **Bouton expand** : cliquable, hover animé sobre
- **Sections** : Dashboard, Projects, Finances, Invoices, Settings
- **Active state** : clair, indicateur visuel warm white
- **ASCII header** : réduit en mode icons, visible en mode expanded (petite taille)
- **Responsive mobile** : sous `lg` (1024px) → burger + sidebar slide-in overlay
- **Style** : fond solide opaque (`#111`), border-right `1px solid #222`, pas de glassmorphism

---

## ADMIN — DÉTAIL PAR PAGE

### Dashboard `/admin`

- Stats site : visites, pages vues (Vercel Analytics)
- Bloc finances rapide : revenu du mois, dépenses du mois, solde net, tendance vs mois précédent
- Activité récente : derniers commentaires clients, derniers uploads, dernières factures
- Design : cartes espacées, graphiques propres, pas surchargé

### Projects `/admin/projects`

C'est le **hub central** — pas de page média séparée.

Vue liste — chaque row affiche :

- Thumbnail, nom du projet, nom du client, tag version (V1, V2, V3...), durée, statut (draft / en review / validé), date
- Menu `⋯` avec options : afficher dans portfolio, feature en homepage, envoyer en review (génère `/review/[token]`), télécharger, supprimer

En haut : bouton `+` pour ajouter un projet/upload.

Logique :

- Un projet = un client + plusieurs versions (V1, V2, V3)
- Chaque version = un fichier vidéo uploadé
- Le portfolio public affiche uniquement les projets toggles "portfolio"
- La homepage affiche uniquement les "featured"

### Finances `/admin/finances`

- Graphique revenus par mois (barres ou courbe, inspi Finary)
- Graphique dépenses par mois
- Solde net : revenus - dépenses
- Section revenus : input manuel + auto Stripe (quand actif)
- Section dépenses : récurrentes (abonnements pro) + ponctuelles (matériel, formation)
- Filtres : par mois, trimestre, année

### Invoices `/admin/invoices`

Vue liste : toutes les factures, statut (envoyée / payée / en retard)

Bouton `+` → modale centrée avec formulaire :

- Infos client (nom, adresse, email)
- Prestations (description, quantité, prix unitaire)
- Mentions légales auto-entrepreneur
- Numéro auto-incrémenté, date, conditions de paiement

Output : PDF téléchargeable + lien `/invoice/[id]`

### Settings `/admin/settings`

- Infos personnelles (nom, email, téléphone, adresse, SIRET)
- Config site (titre, description meta, socials links)
- Gestion accès (changer mdp)
- Clés API (Stripe, Vercel, etc.)
- Préférences (format date, devise)

---

## PAGES CLIENT (liens partageables)

### Review `/review/[token]`

- Player vidéo taille moyenne (bords légèrement arrondis — exception au radius 0)
- Section commentaires en dessous
- Champ commentaire avec possibilité d'indiquer un timecode
- Timecodes cliquables → seek dans le player
- Pas d'auth — accès via token unique
- Inspi Frame.io simplifié
- Commentaires visibles côté admin

### Invoice `/invoice/[id]`

- Visualisation facture propre
- Bouton payer → Stripe Checkout
- Statut mis à jour automatiquement

---

## FIXES SITE PUBLIC

| #   | Fix                                                                                                        |
| --- | ---------------------------------------------------------------------------------------------------------- |
| F1  | Slider bug : le clic sur les slides arrête la barre de progression                                         |
| F2  | Homepage perf : lazy loading vidéos, fluidité transitions                                                  |
| F3  | Grille projects : rendre évident que c'est draggable (cursor grab, indication visuelle, meilleure inertie) |
| F4  | About grain : noise subtil bien intégré en fond                                                            |
| F5  | Mobile : optimiser public + admin                                                                          |
| F6  | Performance : audit global                                                                                 |

---

## ORDRE D'EXÉCUTION

```
PHASE 1 — Fondations DA + Admin shell ✅
  ① Tokens : warm white, surfaces, spacing, typo Geist Sans
  ② Sidebar : icon-only, bouton expand, active states, responsive
  ③ ASCII header : réduit, intégré proprement
  ④ Layout admin : spacing Claude-style, surfaces étagées

PHASE 2 — Admin pages core ← ON EST ICI
  ⑤ Page Projects : liste complète + menu ⋯ + toggles ✅
  ⑥ Upload flow : ajout projet, gestion versions, stockage vidéo
  ⑦ Dashboard : stats Vercel + finances rapides + activité récente ✅
  ⑧ Page Finances : graphiques revenus/dépenses, inputs manuels

PHASE 3 — Factures + Client
  ⑨ Page Invoices : liste + modale création + template AE + PDF
  ⑩ Page Review : /review/[token] player + commentaires timecodes
  ⑪ Paiement Stripe : /invoice/[id] + webhook statut auto

PHASE 4 — Polish + Fixes publics
  ⑫ Fix slider bug homepage
  ⑬ Fix grille projects (draggable + inertie)
  ⑭ Fix grain about
  ⑮ Effet CRT loading screen
  ⑯ Optimisation mobile complète
  ⑰ Audit performance global
```

---

## ÉTAT D'AVANCEMENT (2026-03-12)

### Phase 1 — Fondations DA + Admin shell — ✅ TERMINÉE

- ✅ Next.js 15 App Router, Tailwind v4, Geist Sans intégré
- ✅ Design tokens CSS : surfaces opaques, warm white, borders #222
- ✅ Layout admin (`app/admin/layout.tsx`) avec sidebar + auth
- ✅ Sidebar : collapse/expand, responsive mobile, active states
- ✅ Loader ASCII fonctionnel
- ✅ Shell global (chrome, canvas, footer)
- ✅ Manifest vidéos + `lib/videos.ts` + API `/api/videos`
- ✅ `media.antn.studio` opérationnel

### Phase 2 — Admin pages core — ~50% EN COURS

- ✅ Dashboard `/admin` refait : quick actions en haut ; stats en une ligne (Vercel bientôt) ; finances 2 colonnes, tendance vert/rouge ; activité récente (manifest uniquement, pas de mock) ; section « Projets récents » (3 derniers, thumb + nom + client, lien vers /admin/projects)
- ✅ `/admin/projects` : liste complète + menu ⋯ + toggles (étape ⑤)
- ❌ `/admin/settings` : route existe mais "Coming soon" — pas de sections SEO/réseaux/profil
- ❌ `/admin/finances` : placeholder uniquement

### Phase 3 — Factures + Client — ~10%

- ✅ Routes `/admin/finances` et `/admin/invoices` créées (placeholders)
- ❌ Pas de modèle devis/factures, pas de CRUD
- ❌ Pas d'intégration Stripe
- ❌ Pas de page `/invoice/[id]` ni `/pay/[invoiceId]`
- ❌ Pas d'export PDF

### Phase 4 — Review client — ~15%

- ⚠️ Ancien `MediaReviewOverlay` retiré du dashboard (sera remplacé par page `/review/[token]` étape ⑩)
- ❌ Pas de route `/review/[token]` publique
- ❌ Pas de système de tokens clients
- ❌ Pas de persistance commentaires
- ❌ Pas de notifications

### Phase 5 — Polish + Fixes — ~20%

- ✅ Loader ASCII, quelques animations boutons/overlays
- ✅ Base SEO via `siteConfig` dans admin-config
- ⚠️ Grille `/projects` encore en iframe legacy (`projects-pen.html`)
- ❌ Scrollbars stylisées, audit mobile, transitions pages, CRT effect

---

## RÉFÉRENCES CSS (CodePens nettoyés)

### REF-CRT — Effet CRT Loading Screen

**Source** : CodePen JoRPQOj (wavebeem)
**Usage** : Phase 4, étape ⑮
**Mode** : S'INSPIRER

```css
text-shadow:
  -2px 0px 2px #db7497,
  2px 0px 2px #41bcbc;
color: #5fe4e4;
```

```css
.crt-wrapper {
  position: relative;
}
.crt-wrapper::before {
  content: " ";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(
      to bottom,
      rgba(18, 16, 16, 0) 50%,
      rgba(0, 0, 0, 0.25) 50%
    ),
    linear-gradient(
      90deg,
      rgba(255, 0, 0, 0.06),
      rgba(0, 255, 0, 0.02),
      rgba(0, 0, 255, 0.06)
    );
  background-size:
    100% 4px,
    3px 100%;
  z-index: 2;
  pointer-events: none;
}
@keyframes crt-flicker {
  0% {
    opacity: 0.27;
  }
  30% {
    opacity: 0.66;
  }
  50% {
    opacity: 0.96;
  }
  70% {
    opacity: 0.53;
  }
  100% {
    opacity: 0.24;
  }
}
.crt-wrapper::after {
  content: " ";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(18, 16, 16, 0.1);
  opacity: 0;
  z-index: 2;
  pointer-events: none;
  animation: crt-flicker 0.15s infinite;
}
```

---

### REF-BUTTONS — Boutons + Tooltips

**Source** : CodePen LERpgZR (Giedr-Ju)
**Usage** : Phase 1
**Mode** : S'INSPIRER (flat, pas de glass)

```css
.btn {
  padding: 10px 22px;
  border-radius: 70px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid #222;
  background: #161616;
  color: #f5f0e8;
  cursor: pointer;
  transition:
    border-color 200ms ease,
    background 200ms ease,
    border-radius 200ms ease;
}
.btn:hover {
  border-color: #333;
  background: #1c1c1e;
  border-radius: 8px;
}

.icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 70px;
  border: 1px solid #222;
  background: #161616;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    border-color 200ms ease,
    background 200ms ease,
    border-radius 200ms ease;
}
.icon-btn:hover {
  border-color: #333;
  background: #1c1c1e;
  border-radius: 8px;
}

[data-tip] {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
[data-tip]::before {
  content: attr(data-tip);
  position: absolute;
  background: #1c1c1e;
  color: #f5f0e8;
  font-size: 0.72rem;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #222;
  pointer-events: none;
  opacity: 0;
  transform: translateY(4px);
  transition:
    opacity 200ms ease,
    transform 200ms ease;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}
[data-tip]:hover::before,
[data-tip]:focus::before {
  opacity: 1;
  transform: translateY(0);
}
[data-tip][data-variant="accent"]::before {
  background: #f5f0e8;
  color: #0a0a0a;
}
[data-tip][data-variant="danger"]::before {
  background: #ff4444;
  color: #fff;
}
```

---

### REF-SIDEBAR — Menu Admin

**Source** : CodePen EayVMqZ (oathanrex)
**Usage** : Phase 1
**Mode** : S'INSPIRER (simplifié, style Claude)

```css
.sidebar {
  width: 280px;
  background: #111;
  border-right: 1px solid #222;
  padding: 24px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sidebar.collapsed {
  width: 68px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  color: #8a8a8a;
  font-size: 0.9rem;
  transition:
    background 200ms ease,
    color 200ms ease;
}
.sidebar-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #f5f0e8;
}
.sidebar-item.active {
  background: rgba(255, 255, 255, 0.07);
  color: #f5f0e8;
}
.sidebar-item svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sidebar.collapsed .sidebar-item {
  justify-content: center;
  padding: 10px;
}
.sidebar.collapsed .sidebar-item span {
  display: none;
}

@media (max-width: 1024px) {
  .sidebar {
    display: none;
  }
}
```

---

### REF-DASHBOARD — Dashboard Financier

**Source** : CodePen NPRPBjd + Screenshot Finary
**Usage** : Phase 2, étape ⑧
**Mode** : S'INSPIRER

```css
:root {
  --surface-base: #0a0a0a;
  --surface-raised: #111;
  --surface-overlay: #161616;
  --border-default: #222;
  --text-primary: #f5f0e8;
  --text-muted: #8a8a8a;
  --text-subtle: #666;
  --accent-green: #a8f08a;
  --accent-red: #f87171;
}
.card {
  background: var(--surface-raised);
  border: 1px solid var(--border-default);
  padding: 24px;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  font-size: 0.72rem;
  font-weight: 500;
  text-transform: uppercase;
}
.badge--green {
  background: rgba(168, 240, 138, 0.1);
  color: var(--accent-green);
}
.badge--red {
  background: rgba(248, 113, 113, 0.1);
  color: var(--accent-red);
}
.input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #222;
  background: #161616;
  color: #f5f0e8;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 200ms ease;
}
.input:focus {
  border-color: #444;
}
```

---

### REF-INVOICE — Page Paiement Client

**Source** : CodePen QwyQJxm (RitikaAgrawal08)
**Usage** : Phase 3
**Mode** : S'INSPIRER (dark theme)

```css
.invoice {
  background: #111;
  color: #8a8a8a;
  padding: 24px;
  border: 1px solid #222;
}
.invoice .title {
  font-size: 1.15rem;
  padding: 12px 0;
  text-align: center;
  font-weight: 500;
  color: #f5f0e8;
  border-top: 1px dashed #333;
  border-bottom: 1px dashed #333;
  margin-bottom: 20px;
}
.invoice .amount {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  margin-bottom: 8px;
}
.invoice .amount .value {
  font-weight: 700;
  color: #f5f0e8;
}

.pay-btn {
  font-size: 1.1rem;
  background: #f5f0e8;
  color: #0a0a0a;
  width: 100%;
  padding: 14px 0;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 200ms ease;
}
.pay-btn:hover {
  opacity: 0.9;
}
```

---

## STACK

| Couche         | Choix                                                |
| -------------- | ---------------------------------------------------- |
| Frontend       | Next.js 15 (App Router)                              |
| Styling        | Tailwind v4                                          |
| DB             | Prisma + SQLite (VPS, migration PostgreSQL possible) |
| Auth           | Mdp simple (existant)                                |
| Analytics      | Vercel Analytics                                     |
| Paiement       | Stripe                                               |
| Stockage vidéo | VPS direct (media.antn.studio)                       |
| Déploiement    | Vercel                                               |
| Factures PDF   | react-pdf ou html-to-pdf                             |
| Icônes         | lucide-react uniquement                              |

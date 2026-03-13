# ANTN.STUDIO — PLAN COMPLET DE REVAMP (Cursor Plan Mode)

> Ce document est LA référence pour Cursor. Il contient la vision, la DA, les specs par page, l'ordre d'exécution, et le code CSS de référence.

---

## VISION

Portfolio cinématique dark/terminal/monospace + panel admin = vrai outil de production.
DA inspirée Claude.ai (warm white, espace, confort) fusionnée avec l'identité code-core d'antn.

---

## ARCHITECTURE

### Pages publiques

- `/` — Home (showreel + featured projects)
- `/projects` — Grille projets filtrable (année, type, featured)
- `/about` — Bio + contact
- `/review/[token]` — Review client (vidéo + commentaires timecode)
- `/pay/[invoiceId]` — Page paiement client (Stripe)

### Panel admin (`/admin`)

- `/admin` — Dashboard (stats, projets récents, revenus)
- `/admin/projects` — CRUD projets
- `/admin/finances` — Devis, factures, suivi paiements
- `/admin/invoices/[id]` — Détail facture
- `/admin/settings` — Config générale (SEO, réseaux, profil)

---

## DESIGN SYSTEM — RÈGLES ABSOLUES

### Couleurs

- Background principal : `#0A0A0A`
- Surface cards : `#111111`
- Surface hover : `#161616`
- Borders : `#222222`
- Texte principal : `#F5F0E8` (warm white)
- Texte secondaire : `#999999`
- Accent : `#F5F0E8` (pas de couleur vive)

### Typographie

- Font principale : `Geist Mono`, monospace
- Titres pages : `text-sm uppercase tracking-[0.2em]`
- Body : `text-sm`
- Labels / metadata : `text-xs text-[#999]`

### Composants

- Borders : `border border-[#222]`
- Radius : `0` partout (sauf boutons: `rounded-sm`)
- Pas de glassmorphism (JAMAIS de backdrop-filter, blur, transparence)
- Surfaces toujours opaques et solides
- Transitions : `200ms ease` uniquement
- Icônes : `lucide-react` uniquement
- Scrollbars : stylisées fines (#222 track, #444 thumb)

### Spacing

- Page padding : `p-6` mobile, `p-8` desktop
- Gap cards : `gap-4`
- Section spacing : `space-y-8`

---

## SPECS PAR PAGE

### HOME `/`

- Hero plein écran : showreel vidéo (autoplay, muted, loop)
- Vidéos servies depuis `media.antn.studio`
- Section featured projects en dessous (grille 2-3 cols)
- Loader ASCII au premier chargement
- Canvas `GlCanvas` en background subtil

### PROJECTS `/projects`

- Grille filtrable par année et type
- Source de vérité : `public/videos/manifest.json` via `lib/videos.ts`
- Player vidéo intégré React (pas d'iframe)
- Objectif : remplacer complètement `projects-pen.html` (legacy iframe)
- Filtres via URL search params
- Hover : preview vidéo thumbnail

### ABOUT `/about`

- Bio courte
- "for new projects" au-dessus de l'email
- Liens réseaux depuis config admin (source unique)
- Photo ou visuel optionnel

### REVIEW `/review/[token]`

- Accès client via token unique (pas de login)
- Player vidéo avec timeline
- Commentaires liés au timecode
- Statut : en review / approuvé / corrections demandées
- Notifications (email optionnel)

### PAY `/pay/[invoiceId]`

- Récap facture (lignes, montants, TVA)
- Bouton paiement Stripe Checkout
- Statut temps réel (payé / en attente / overdue)

---

## ADMIN

### Dashboard `/admin`

- Stats : revenus mois, projets actifs, factures en attente
- Liste projets récents
- Graphique revenus simple (bar chart)
- Quick actions (nouveau projet, nouvelle facture)

### Projects `/admin/projects`

- Table liste projets (nom, client, statut, date)
- CRUD complet (create, edit, delete)
- Upload vidéo vers `media.antn.studio`
- Lier un projet à une review client
- Statuts : draft / active / archived

### Finances `/admin/finances`

- Vue globale : revenus, dépenses, marge
- Liste factures avec filtres (statut, client, date)
- Création devis → conversion en facture
- Suivi paiements (paid, pending, overdue)
- Export PDF factures

### Invoice detail `/admin/invoices/[id]`

- Détail complet facture
- Lignes de facturation éditables
- Historique statuts
- Lien de paiement client (`/pay/[id]`)
- Bouton envoi email client

### Settings `/admin/settings`

- SEO (title, description, OG image)
- Réseaux sociaux (liens Instagram, TikTok, etc.)
- Profil (nom, email, photo)
- Config générale du site

---

## PHASES D'EXÉCUTION

### Phase 0 — Fondations (FAIT)

- [x] Setup Next.js 15 App Router
- [x] Geist Mono intégré
- [x] Manifest vidéos + lib/videos.ts
- [x] API /api/videos
- [x] media.antn.studio (Nginx + Traefik)
- [x] Loader ASCII
- [x] Shell global (chrome, canvas, footer)

### Phase 1 — Pages publiques

- [ ] Home : hero showreel + featured grid
- [ ] Projects : grille React (supprimer iframe legacy)
- [ ] About : texte + contact propre

### Phase 2 — Admin core

- [ ] Layout admin (sidebar, header, auth basique)
- [ ] Dashboard stats
- [ ] CRUD projets
- [ ] Settings (config centralisée)

### Phase 3 — Finances

- [ ] Modèle devis/factures
- [ ] CRUD factures
- [ ] Intégration Stripe
- [ ] Page `/pay/[invoiceId]`
- [ ] Export PDF

### Phase 4 — Review client

- [ ] Système tokens
- [ ] Player + commentaires timecode
- [ ] Page `/review/[token]`
- [ ] Notifications

### Phase 5 — Polish

- [ ] Animations page transitions
- [ ] SEO meta dynamiques
- [ ] Performance (lazy load, optimisation vidéos)
- [ ] Tests navigateurs + mobile

---

## ÉTAT D'AVANCEMENT (2026-03-12)

> Synthèse factuelle de l’implémentation actuelle par rapport au plan ci‑dessus.  
> Les pourcentages sont indicatifs et servent à prioriser les phases suivantes.

### Phase 0 — Fondations — ~95–100%

- ✅ Next.js 15 App Router en place (`app` router, pages publiques + `/admin/*` + `/api/*`).
- ✅ Manifest vidéos + `lib/videos.ts` + API `/api/videos` utilisés par la home, `/projects` et l’admin.
- ✅ Loader ASCII fonctionnel et intégré au shell.
- ✅ Shell global (chrome, canvas `GlCanvas`, footer monté proprement).
- ✅ Intégration de `media.antn.studio` côté client (manifest).
- ⚠️ Geist Mono est prévue dans le projet, à re‑checker dans le layout global pour s’assurer qu’elle est bien appliquée partout.

### Phase 1 — Pages publiques — ~40–50%

- ✅ **Home `/`**
  - Hero vidéo branché sur le manifest vidéos.
  - Loader ASCII + canvas de fond opérationnels.
- ✅ **Projects `/projects`**
  - Page serveur qui consomme `fetchVideos` + `getAdminConfig` (source de vérité manifest + admin).
  - Composant client `ProjectsClient` avec:
    - préfetch vidéos (sessionStorage + `/api/videos`),
    - filtres par année via URL search params,
    - player React plein écran (`FullBleedPlayer`).
- ✅ **About `/about`**
  - Page présente avec bio/contact.
- ⚠️ Featured grid de la home à affiner pour coller exactement au spec (grille 2–3 colonnes).
- ⚠️ Les liens réseaux ne viennent pas encore exclusivement de la config admin (dupliqués avec le pen / about).
- ❌ La grille `/projects` est encore rendue via `projects-pen.html` (iframe + `postMessage`) et non une grille full React.

### Phase 2 — Admin core — ~35–40%

- ✅ Layout admin (`app/admin/layout.tsx`)
  - Sidebar + header desktop.
  - Shell mobile (header + sidebar slide‑in).
  - Auth basique via `/api/admin/auth`.
- ✅ Dashboard `/admin`
  - Vue médias avancée: listing vidéos, upload (`/api/admin/upload`), gestion `featuredIds` et `visibility`, mini‑overlay de review vidéo avec commentaires timecodés (en mémoire).
- ⚠️ La page `/admin` est centrée vidéo et ne reflète pas encore les stats “business” (revenus mois, projets actifs, factures en attente, graph revenus).
- ⚠️ La configuration centrale (`siteConfig` dans `admin-config`) est surtout éditée via le dashboard, la page `/admin/settings` est encore vide.
- ❌ `/admin/projects`: route existante mais page `Coming soon.` (pas de table, pas de CRUD).
- ❌ `/admin/settings`: route existante mais page `Coming soon.` (pas de sections SEO / réseaux / profil).

### Phase 3 — Finances — ~10%

- ✅ Routes présentes:
  - `/admin/finances` — placeholder “Finances / Coming soon.”.
  - `/admin/invoices` — placeholder “Invoices / Coming soon.”.
- ❌ Pas encore de modèle devis/factures ni de CRUD factures.
- ❌ Aucune intégration Stripe ni de page publique `/pay/[invoiceId]`.
- ❌ Pas d’export PDF ni de suivi de paiements (paid/pending/overdue).

### Phase 4 — Review client — ~15%

- ✅ Brique UI interne:
  - `MediaReviewOverlay` dans `/admin` avec player vidéo + commentaires timecodés (stockés en mémoire).
- ⚠️ Fonctionne comme un outil interne d’annotation dans l’admin, mais sans persistance ni lien vers une route publique.
- ❌ Pas de route `/review/[token]`.
- ❌ Pas de système de tokens clients, ni de statuts (en review / approuvé / corrections).
- ❌ Pas de notifications (email).

### Phase 5 — Polish — ~20%

- ✅ Quelques animations (loader ASCII, transitions sur certains boutons/overlays).
- ✅ Base SEO/config centrale via `siteConfig` dans `admin-config.ts` (title, description, OG, réseaux).
- ⚠️ SEO meta dynamiques probablement partiels: pas encore une stratégie homogène appliquée à toutes les pages.
- ⚠️ Performance globale (lazy‑load, audit Lighthouse, stratégie vidéo) pas encore passée au peigne fin.
- ❌ Scrollbars stylisées, plan de tests navigateurs/mobile, animations de transitions de pages et passe de polish globale restent à faire.

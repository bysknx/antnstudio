# Spécification grille projets — port pixel-perfect depuis `public/projects-pen.html`

Ce document liste **chaque règle CSS** et **chaque comportement JS** du pen existant pour la grille projets, afin de reproduire le rendu et les interactions en React sans perte visuelle ou fonctionnelle.

---

## 1. Variables CSS (`:root`)

| Variable                        | Valeur                      | Usage                        |
| ------------------------------- | --------------------------- | ---------------------------- |
| `--spacing-base`                | `1rem`                      | Gaps header/footer, colonnes |
| `--color-text`                  | `#fff`                      | Texte principal              |
| `--font-size-base`              | `14px`                      | Base typo                    |
| `--border-radius`               | `10px`                      | Cards (`.item`)              |
| `--hover-scale`                 | `1.05`                      | Scale image au hover         |
| `--page-vignette-size`          | `180px`                     | Vignette externe             |
| `--page-vignette-color`         | `rgba(0, 0, 0, 0.85)`       | Couleur vignette             |
| `--page-vignette-strong-size`   | `90px`                      | Vignette intermédiaire       |
| `--page-vignette-strong-color`  | `rgba(0, 0, 0, 0.92)`       |                              |
| `--page-vignette-extreme-size`  | `36px`                      | Vignette forte               |
| `--page-vignette-extreme-color` | `rgba(0, 0, 0, 1)`          |                              |
| `--m-bg`                        | `#0b0b0b`                   | Fond body (matrice)          |
| `--m-dot-color`                 | `rgba(255, 255, 255, 0.08)` | Points fond                  |
| `--m-dot-size`                  | `1.1px`                     | Taille point                 |
| `--m-dot-space`                 | `22px`                      | Espacement grille de points  |
| `--halo-color`                  | `rgba(255, 255, 255, 0.25)` | Halo overlay image au hover  |

---

## 2. Reset et body

- **`*`** : `margin: 0; padding: 0; box-sizing: border-box; user-select: none;`
- **`body`** :
  - `font-family: "PP Neue Montreal", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;`
  - `color: #fff;`
  - `overflow: hidden;`
  - `position: relative;`
  - `background-color: var(--m-bg);`
  - `background-image: radial-gradient(circle, var(--m-dot-color) var(--m-dot-size), transparent calc(var(--m-dot-size) + 0.01px));`
  - `background-size: var(--m-dot-space) var(--m-dot-space);`
  - `background-position: 0 0;`
  - `background-attachment: fixed;`
- **`body::before`** (grain) :
  - `content: ""; position: fixed; inset: -50%;`
  - `background: url("https://assets.iceable.com/img/noise-transparent.png") repeat 0 0/300px 300px;`
  - `animation: noise 0.3s steps(5) infinite; opacity: 0.22; pointer-events: none; z-index: 100;`
- **@keyframes noise** : `0% { transform: translate(0, 0); }` `50% { transform: translate(-2%, -3%); }` `100% { transform: translate(1%, 0); }`

---

## 3. Container (zone scroll/drag)

- **`.container`** :
  - `position: relative;`
  - `width: 100vw; height: 100vh;`
  - `overflow: hidden;`
  - `cursor: grab;`
  - `z-index: 1;`
  - `-webkit-user-select: none; user-select: none; -webkit-touch-callout: none;`
- **`.canvas`** (conteneur des items, déplacé par transform) :
  - `position: absolute;`
  - `will-change: transform;`
  - `-webkit-user-select: none; user-select: none;`

---

## 4. Items (cards)

- **`.item`** :
  - `position: absolute;`
  - `overflow: hidden;`
  - `background: #000;`
  - `cursor: pointer;`
  - `border-radius: var(--border-radius);` → **10px**
  - `user-select: none` (et webkit)
  - Dimensions et position **en inline style** : `width`, `height`, `left`, `top` en px (voir JS).
- **`.item-image-container`** :
  - `position: relative; width: 100%; height: 100%; overflow: hidden; border-radius: inherit;`
- **`.item-image-container::before`** (halo overlay) :
  - `content: ""; position: absolute; inset: 0;`
  - `background: radial-gradient(circle at center, transparent 55%, var(--halo-color) 130%);`
  - `opacity: 0; transition: opacity 0.35s ease;`
- **`.item img`** :
  - `width: 100%; height: 100%; object-fit: cover; pointer-events: none;`
  - `transition: transform 0.3s ease, filter 0.45s ease;`
  - `filter: grayscale(100%) contrast(1.1) brightness(0.82);`
- **`.item:hover img`** :
  - `transform: scale(var(--hover-scale));` → **scale(1.05)**
  - `filter: none;`
- **`.item:hover .item-image-container::before`** :
  - `opacity: 0.8;`

---

## 5. Caption (label sur la card)

- **`.item-caption`** :
  - `position: absolute; left: 0; bottom: 0; width: 100%; padding: 10px; z-index: 2;`
  - `background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);`
  - `user-select: none;`
- **`.item-name`** :
  - `font-size: 12px; text-transform: uppercase; letter-spacing: -0.03em; margin-bottom: 2px; overflow: hidden; height: 16px;`
- **`.item-number`** :
  - `font: 400 10px/1 "TheGoodMonolith", monospace; color: #888; overflow: hidden; height: 14px;`

---

## 6. Layout grille (JS) — tailles et espacements

- **Settings (JS)** :
  - `baseWidth: 400`
  - `smallHeight: 330`
  - `largeHeight: 500`
  - `itemGap: 65`
  - `hoverScale: 1.05`
  - `dragEase: 0.075`
  - `momentumFactor: 200`
  - `bufferZone: 3`
- **Tailles alternées** : `itemSizes = [{ width: 400, height: 330 }, { width: 400, height: 500 }]` (alternance par index `(row * columns + col) % 2`).
- **Cellule** : `cellWidth = baseWidth + 65 = 465` ; `cellHeight = max(330, 500) + 65 = 565`.
- **Colonnes** : `columns = 4` (fixe).
- Position item : `x = col * cellWidth`, `y = row * cellHeight` (origine en haut à gauche du canvas).

---

## 7. Menu Années (header)

- **`.legacy-year-menu`** : `grid-column: 1 / span 4; position: relative;` (dans un header en grid 12 col).
- **`.legacy-years-toggle`** :
  - `display: inline-flex; align-items: center; gap: 0.55rem;`
  - `font-weight: 800; font-size: 13px; letter-spacing: 0.06em; text-transform: uppercase; color: #e9e9e9;`
  - `cursor: pointer; padding: 0.4rem 0.6rem 0.4rem 0.2rem; border-radius: 999px; user-select: none; position: relative;`
- **`.legacy-years-toggle::before`** (pastille) : `content: ""; width: 6px; height: 6px; border-radius: 50%; background: #e9e9e9; opacity: 0.9; display: inline-block; animation: blink 2.4s ease-in-out infinite;`
- **@keyframes blink** : `0%, 90%, 100% { opacity: 0.9; }` `45% { opacity: 0.3; }`
- **`.chev`** (flèche) : `width: 8px; height: 8px; border-right: 2px solid #e9e9e9; border-bottom: 2px solid #e9e9e9; transform: rotate(45deg); transition: transform 0.2s ease; margin-left: 0.2rem;`
- **`.legacy-year-menu.open .chev`** : `transform: rotate(-135deg);`
- **`.legacy-years-panel`** :
  - `position: absolute; left: 0; top: 2.6rem; z-index: 10001;`
  - `display: flex; flex-direction: column; gap: 0.35rem; overflow: hidden;`
  - `max-height: 0; padding: 0; opacity: 0; transform: translateY(-4px); pointer-events: none;`
  - `transition: max-height 0.35s ease, padding 0.2s ease, opacity 0.2s ease, transform 0.2s ease;`
- **`.legacy-year-menu.open .legacy-years-panel`** : `max-height: 50vh; padding: 0.45rem 0.4rem 0.55rem 0.4rem; opacity: 1; transform: none; pointer-events: auto;`
- **Panel backdrop** : `::before` sur le panel, `border-radius: 8px; backdrop-filter: blur(6px); background: rgba(0, 0, 0, 0.06);` (opacity 0 → 1 quand open).
- **`.year-btn`** :
  - `all: unset; cursor: pointer; color: #bcbcbc; font-weight: 700; letter-spacing: -0.01em; padding: 0.22rem 0.55rem; border-radius: 6px;`
  - `transition: color 0.2s ease, background 0.2s ease; display: block;`
- **`.year-btn:hover`** : `color: #fff; background: rgba(255, 255, 255, 0.05);`
- **`.year-btn[aria-pressed="true"]`** : `color: #fff; background: rgba(255, 255, 255, 0.08);`
- **`.years-close`** : `all: unset; cursor: pointer; align-self: flex-start; margin-top: 0.25rem; color: #ddd; font-weight: 800; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.8; padding: 0.2rem 0.5rem;`
- **`.years-close:hover`** : `opacity: 1;`

---

## 8. Vignettes (overlay page)

- **`.page-vignette-container`** : `position: fixed; inset: 0; pointer-events: none; z-index: 9998;`
- **`.page-vignette`** : `position: absolute; inset: 0; box-shadow: inset 0 0 var(--page-vignette-size) var(--page-vignette-color);`
- **`.page-vignette-strong`** : idem avec `--page-vignette-strong-*`
- **`.page-vignette-extreme`** : idem avec `--page-vignette-extreme-*`

(À reproduire ou simplifier selon accord DA — le plan revamp évite blur/transparence, ces vignettes sont des box-shadow opaques.)

---

## 9. Comportements JavaScript

### 9.1 Données

- **PROJECTS** : tableau d’objets `{ id, title, year, image, poster?, embed?, src?, videoSrc?, link? }`.
- **normalize(list)** : déduit `year` du titre (regex `20xx`/`19xx`) ou de `createdAt`/`created_time`/`year`; `image` = `pickPoster(it)` (poster | thumbnail | picture | thumb).
- **pickPoster(it)** : `it.poster || it.thumbnail || ... || ""`.
- **normalizeEmbed(url)** : ajoute query params `autoplay=1&muted=1&controls=1&playsinline=1&pip=1&title=0&byline=0` pour lecture.

### 9.2 Filtre année

- **uniqueYears** : années distinctes des PROJECTS, triées décroissant.
- **activeYear** : `"All"` ou année sélectionnée (string); initial depuis `?year=` (ou `"all"` → All).
- **currentList()** : si `activeYear === "All"` retourne PROJECTS, sinon `PROJECTS.filter(p => p.year === parseInt(activeYear, 10))`.
- **buildYearsFromProjects()** : recalcule uniqueYears, garde activeYear cohérent avec QP.
- **renderYears()** : boutons "All" + une entrée par année; `aria-pressed="true"` sur le bouton actif.
- **setActiveYear(label)** : met à jour activeYear, `data-year` sur `<html>`, appelle `resetAndRebuild()` puis `updateYearButtons()`; envoie `REQUEST_YEAR_ACK` au parent.
- **openYears() / closeYears()** : toggle classe `open` sur le menu, `aria-expanded` sur le toggle.

### 9.3 Grille virtuelle / rendu

- Grille **infinie** : les items sont rendus par **tuiles** (col, row). Pour chaque (col, row), l’index projet = `(row * columns + col) % itemCount` (répétition du même jeu de projets).
- **getItemSize(row, col)** : alternance 400x330 et 400x500 selon `(row * columns + col) % 2`.
- **getItemPos(col, row)** : `{ x: col * cellWidth, y: row * cellHeight }`.
- **updateVisibleItems()** :
  - Calcul viewport étendu : `buffer = 3`, `vw = innerWidth * (1 + buffer)`, `vh = innerHeight * (1 + buffer)` (ou équivalent pour zone visible + marge).
  - Plage colonnes/lignes visibles : `startCol` à `endCol`, `startRow` à `endRow` à partir de `currentX`, `currentY` (position du canvas).
  - Pour chaque (col, row) dans la plage : si l’item n’existe pas encore en DOM, créer un `.item` avec dimensions inline, position inline, image (proj.image), caption (titre + année), clic → `postMessage OPEN_PLAYER` au parent.
  - Supprimer les items dont (col, row) sort de la plage.
- **requestAnimationFrame(animate)** en boucle :
  - `currentX += (targetX - currentX) * dragEase` (idem Y).
  - `canvas.style.transform = translate(${currentX}px, ${currentY}px)`.
  - Appeler `updateVisibleItems()` si déplacement > 100px ou si dernière mise à jour > 120 ms.

### 9.4 Drag / touch

- **mousedown** sur container : `isDragging = true`, `mouseHasMoved = false`, enregistrer `startX/startY`, `cursor: grabbing`.
- **mousemove** (global) : si `isDragging`, `dx/dy` depuis start; si `|dx| > 5 || |dy| > 5` alors `mouseHasMoved = true`; mettre à jour vélocité `dragVX/dragVY` (dx/dt, dy/dt); `targetX += dx`, `targetY += dy`; puis `startX/startY = clientX/clientY`.
- **mouseup** (global) : `isDragging = false`, `cursor: grab`; appliquer momentum : `targetX += dragVX * momentumFactor`, `targetY += dragVY * momentumFactor` si vélocité > 0.1.
- **touchstart** : même logique avec `e.touches[0]`.
- **touchmove** : idem, pas de momentum dans le snippet (à vérifier si souhaité).
- **touchend** : `isDragging = false`.

### 9.5 Clic vs drag

- Au **click** sur un item : si `mouseHasMoved || isDragging`, ne pas ouvrir le player; sinon envoyer `OPEN_PLAYER` au parent avec `{ id, title, poster, embed, link, year }`.

### 9.6 Messaging parent (iframe)

- **Reçu** :
  - `SET_PROJECTS` : remplacer PROJECTS par `normalize(data.value).filter(p => !!p.image)`, puis buildYears, renderYears, setActiveYear(activeYear).
  - `SET_YEAR` : `setActiveYear(value === "all" ? "All" : value)`, optionnellement ouvrir le panneau years.
- **Envoyé** :
  - `IFRAME_READY` au chargement.
  - `OPEN_PLAYER` au clic sur un item (payload projet).
  - `REQUEST_PROJECTS` / `REQUEST_YEAR` si pas de données et pas encore demandé.
  - `REQUEST_YEAR_ACK` après setActiveYear.

### 9.7 Reset

- **resetAndRebuild()** : supprimer tous les items du canvas, vider `visibleItems`, remettre `currentX/Y`, `targetX/Y`, `lastX/Y` à 0, `canvas.style.transform = "translate(0,0)"`, rappeler `updateVisibleItems()`.

---

## 10. Récap pour le port React

- **Layout** : container full viewport (100vw/100vh), overflow hidden, cursor grab/grabbing.
- **Canvas** : div en position absolute, transform translate(currentX, currentY); enfants = items en position absolute avec left/top/width/height en px.
- **Items** : deux tailles 400x330 et 400x500, gap 65 → cell 465x565; 4 colonnes; grille virtuelle infinie avec buffer ~3 viewports, création/suppression des nœuds selon la zone visible.
- **Hover** : image scale(1.05), filter none; halo overlay opacity 0.8; transitions 0.3s (transform) et 0.35s (opacity halo).
- **Caption** : gradient noir en bas, titre 12px uppercase, année 10px monospace #888.
- **Années** : menu déroulant, boutons avec état actif (aria-pressed), synchro URL `?year=`.
- **Drag** : smooth follow avec ease 0.075, momentum au release (factor 200).
- **Clic** : distinguer clic du drag (mouseHasMoved / isDragging); un seul gestionnaire ouvrant FullBleedPlayer côté parent.

Une fois ce spec validé, le composant React pourra être implémenté (Tailwind + CSS module si besoin) en respectant ces valeurs et comportements.

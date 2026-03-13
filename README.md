## About

antn.studio by anthony

## Vue d’ensemble du projet

- **Nature du projet**: Site vitrine / portfolio pour le studio `antn.studio`, avec une partie publique (home, projets, about) et un backoffice léger pour piloter les contenus.
- **Stack**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, police Geist, quelques composants animés custom et un canvas d’arrière-plan.
- **Données vidéos**: Centralisées dans `public/videos/manifest.json`, normalisées via `lib/videos.ts` et exposées via l’API `/api/videos` pour la home, la page projets et l’admin.
- **Backoffice**: Section `app/admin/*` (dashboard, projets, finances, factures, paramètres) s’appuyant sur une config JSON dans `.data/admin-config.json`.

## Synthèse du revamp

- **Nouveau socle**: Le projet actuel constitue la version revampée du site, migrée sur Next.js App Router avec un shell UI modernisé (loader ASCII, chrome global, canvas `GlCanvas`, footer monté proprement).
- **Données unifiées**: Les vidéos sont désormais toutes pilotées par un manifest unique, consommé côté front et admin via `/api/videos`.
- **Admin / config**: La configuration (SEO, réseaux sociaux, vidéos mises en avant, etc.) est centralisée dans `lib/admin-config.ts` + `.data/admin-config.json`, accessible et éditable via `/admin`.

### Zone encore legacy

- La principale zone non encore refondue est **la grille projets**:
  - La route `/projects` est gérée par Next.js, mais la grille visuelle repose encore sur un fichier HTML autonome `public/projects-pen.html` (le “pen”), intégré en iframe.
  - Certains éléments (footer, menu d’années, textes) restent gérés dans ce pen, avec des classes `legacy-*`.
- À terme, l’objectif est de remplacer cette partie par une implémentation **full React/Next** et de pouvoir supprimer complètement `projects-pen.html`.

Pour des détails plus techniques sur la transition et les prochaines étapes, voir la section **“Revamp et roadmap”** ci‑dessous.

## Revamp et roadmap

### 1. État actuel

- **Déjà en place**

  - Migration vers Next.js App Router (pages publiques + `/admin/*` + `/api/*`).
  - Nouvelle couche de données vidéos (manifest JSON + `lib/videos.ts` + `/api/videos`).
  - Backoffice/config centrale pour SEO, réseaux, vidéos, finances.
  - Shell visuel revampé (loader ASCII, canvas d’arrière-plan, chrome global).

- **Encore en transition**
  - `/projects` dépend encore du pen `public/projects-pen.html` pour la grille.
  - Le footer et certains liens réseaux sont dupliqués entre le pen, la page `about` et la config admin.
  - `lib/admin-config.ts` contient encore de la logique de compatibilité avec d’anciens schémas de config.

### 2. Prochaine étape clé: grille projets full React

Objectif: **remplacer l’iframe du pen par une grille projets React** dans `/projects` en s’appuyant sur les mêmes données que le reste du site.

Pistes de design:

- **Source de vérité**: réutiliser `public/videos/manifest.json` (via `lib/videos.ts`) comme base unique des projets/vidéos.
- **Filtrage / navigation**:
  - Implémenter un composant `ProjectsGrid` en React qui gère les filtres (par année, type, “featured”, etc.).
  - Conserver l’esprit de navigation du pen (menu d’années, focus sur une vidéo) mais avec state React + URL search params au lieu de DOM impératif dans l’iframe.
- **Intégration du player**:
  - S’appuyer sur le player React déjà utilisé pour la home / overlay, au lieu du player du pen.
  - Gérer l’ouverture/fermeture du player et la vidéo courante côté React uniquement.
- **Responsivité / UI**:
  - Recréer la grille en utilisant Tailwind + composants maison, sans classes `legacy-*`.
  - Profiter du revamp pour simplifier le layout mobile (scroll, overscroll, overlays).

Une fois cette grille React en place et stabilisée, le fichier `public/projects-pen.html` pourra être supprimé.

### 3. Nettoyage des restes du template d’origine

Ce projet est initialement basé sur le template `nim`, mais une partie du contenu ne s’applique plus:

- **Documentation**:
  - `INSTALLATION.md` pointe encore vers le dépôt `ibelick/nim` et décrit un blog MDX qui n’existe plus dans ce projet.
  - Action à prévoir: réécrire ce fichier ou le remplacer par une doc d’installation spécifique à `antn.studio` (cloner ce repo, `npm install`, `npm run dev`, configuration minimale).
- **Blog MDX**:
  - Les instructions de création d’articles MDX dans `app/blog` ne sont plus pertinentes tant qu’il n’y a pas de blog ici.
- **Liens / réseaux**:
  - Les liens Instagram/TikTok sont aujourd’hui répartis entre le pen, la page `about` et la config admin.
  - Action à prévoir: faire de la config admin (fichier `.data/admin-config.json`) la source de vérité unique et la propager partout (about, footer, éventuel remplacement du pen).

Ce nettoyage pourra être fait progressivement, mais cette section sert de référence pour savoir ce qui est hérité et ce qui est déjà revampé.

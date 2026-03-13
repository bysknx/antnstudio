# antn.studio – Guide d’installation

## Prérequis

- Node.js 20.x ou plus
- Git

## Installation

1. **Cloner le dépôt**

   ```bash
   git clone <url-de-ce-repo>
   cd antnstudio
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Lancer le serveur de développement**

   ```bash
   npm run dev
   ```

4. **Configuration minimale**

   - Vérifier/ajuster la configuration admin dans le fichier `.data/admin-config.json` (SEO, réseaux sociaux, vidéos mises en avant, etc.).
   - Vérifier le manifest vidéo `public/videos/manifest.json` (URLs vidéos + thumbs).

## Déploiement

Le projet est un app Next.js 15 classique.  
Il peut être déployé sur n’importe quelle plateforme compatible Next.js (par exemple Vercel).  
Adapter les variables d’environnement et la configuration CDN (pour les vidéos) selon l’hébergeur choisi.

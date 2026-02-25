# 🎬 MapMyMovie

Application web interactive de visionnage de film, développée dans le cadre d'un TP en 3ème année à l'ENSSAT (IAI-3).

> Film présenté : **Night of the Living Dead** (1968) — George Romero

---

## 🚀 Lancement

```bash
npm install
npm run dev
```

> Node.js 20+ requis. Vite affiche un avertissement en dessous de 20.19 / 22.12 mais le projet fonctionne.

---

## 🛠️ Stack technique

- **React 18** + **TypeScript**
- **Vite** (bundler)
- **React-Player 3.4.0** (lecteur vidéo)
- **React-Leaflet** + **Leaflet** (carte interactive)
- **React-Bootstrap** (modale de fallback)
- **WebSocket** natif (discussion en temps réel)
- **Web Speech API** (synthèse vocale pour l'audio-description)

---

## 📁 Structure du projet

```
src/
├── components/
│   ├── Header/                  # En-tête avec titre du film
│   ├── FallbackModal/           # Modale si le backend est indisponible
│   ├── Discussion/              # Chat en temps réel (WebSocket)
│   │   ├── MessageList/         # Affichage des messages
│   │   └── MessageInput/        # Saisie et envoi de messages
│   └── Movie/
│       ├── MovieImage/          # Carrousel d'affiches
│       ├── Synopsis/            # Synopsis multilingue (API Wikipedia)
│       ├── MoviePlayer/         # Lecteur vidéo + contrôles
│       │   ├── ChapterList/     # Navigation par chapitres
│       │   └── AudioDescription/ # Audio-description (synthèse vocale + MP3)
│       └── MovieMap/            # Carte Leaflet des lieux de tournage
├── context/
│   └── MovieContext.tsx         # Contexte global (données film + temps de lecture)
├── hooks/
│   ├── useMovieData.ts          # Chargement des données depuis le backend
│   ├── useMovieTime.ts          # Gestion du temps de lecture, seek, mute
│   └── useDiscussionSocket.ts   # Connexion WebSocket au chat
├── mocks/
│   ├── movieDataFallback.ts     # Données film de secours
│   ├── chaptersFallback.ts      # Chapitres de secours
│   └── audioDescriptionFallback.ts # Descriptions de scènes de secours
├── types/
│   ├── Movie.ts                 # Interface MovieData
│   ├── Chapter.ts               # Interface Chapter + utilitaires
│   ├── AudioDescription.ts      # Interface SceneDescription
│   └── Message.ts               # Interface DiscussionMessage
└── pages/
    └── MainPage.tsx             # Page principale
public/
└── mocks/
    ├── subtitles-fr.srt         # Sous-titres français (fallback local)
    ├── subtitles-en.srt         # Sous-titres anglais (fallback local)
    ├── subtitles-es.srt         # Sous-titres espagnols (fallback local)
    └── audio-description-en.mp3 # Piste audio-description anglaise
```

---

## ✨ Fonctionnalités

### 🎥 Lecteur vidéo
- Lecture/pause synchronisée avec tous les composants via le contexte React
- Navigation par chapitres (trilingue : FR / EN / ES)
- Sous-titres en français, anglais et espagnol
- En développement local, les sous-titres sont chargés depuis `/public/mocks/` pour contourner les restrictions CORS du backend

### 🗺️ Carte des lieux de tournage
- Carte interactive OpenStreetMap via React-Leaflet
- Marqueurs des POI (Points d'Intérêt) liés au film
- Synchronisation automatique avec le timecode de lecture
- Encart de description de la scène en cours (trilingue)

### 📖 Synopsis
- Chargé dynamiquement depuis l'API Wikipedia
- Disponible en français, anglais et espagnol

### 🔊 Audio-description
- **Synthèse vocale** (Web Speech API) : lit la description de la scène en cours à voix haute, en FR / EN / ES
- **Piste MP3** : audio-description complète en anglais, synchronisée avec le timecode du film. La piste vidéo est coupée (mute) pendant la lecture du MP3. Curseur de volume dédié.

### 💬 Discussion en temps réel
- Chat connecté via WebSocket (`wss://tp-iai3.cleverapps.io/`)
- Partage de moments : envoie le timecode actuel du film dans le chat
- Identité personnalisable (nom + avatar), sauvegardée en localStorage
- Scroll automatique vers le dernier message

### 🛡️ Fallback
- Si le backend est indisponible, une modale propose d'utiliser les données locales (mocks)
- Chaque composant a ses propres données de secours indépendantes

---

## ♿ Accessibilité (WCAG)

L'accessibilité a été une priorité tout au long du développement :

- Balises sémantiques : `<main>`, `<aside>`, `<article>`, `<section>`, `<nav>`, `<time>`
- Attributs ARIA : `aria-label`, `aria-live`, `aria-expanded`, `aria-pressed`, `aria-current`, `aria-controls`, `aria-modal`
- Navigation au clavier complète sur tous les éléments interactifs
- Focus visible sur tous les boutons et contrôles
- Classe `.sr-only` pour les annonces aux lecteurs d'écran
- Icônes et éléments décoratifs masqués avec `aria-hidden="true"`
- Modale accessible avec focus trap et fermeture à la touche Échap
- Curseur de volume avec `aria-valuetext` (annonce "75%" au lieu de "0.75")

---

## 🌐 Backend

L'application consomme une API REST fournie :

| Ressource | URL |
|-----------|-----|
| Données film | `https://tp-iai3.cleverapps.io/projet/` |
| Chapitres | `https://tp-iai3.cleverapps.io/projet/chapters.json` |
| Audio-description | `https://tp-iai3.cleverapps.io/projet/description.json` |
| POI (carte) | `https://tp-iai3.cleverapps.io/projet/poi.json` |
| Sous-titres | `https://tp-iai3.cleverapps.io/projet/subtitles-{fr,en,es}.srt` |
| WebSocket chat | `wss://tp-iai3.cleverapps.io/` |

> ⚠️ Les sous-titres sont bloqués par CORS en développement local — les fichiers locaux dans `public/mocks/` sont utilisés automatiquement via `import.meta.env.DEV`.

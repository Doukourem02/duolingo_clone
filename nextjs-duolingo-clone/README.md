# Lingo

Application web d'apprentissage de langues (Next.js 14) — Espagnol, Italien, Français, Croate et Dioula, avec contenu et interface en français. Partage son backend et sa base de données avec l'application mobile **Baro**.

Fonctionnalités :
- 🌐 Next.js 14 & server actions
- 🗣 Voix IA (ElevenLabs)
- 🎨 Système de composants avec Shadcn UI
- 🔐 Authentification avec Clerk
- 🔊 Effets sonores
- ❤️ Système de cœurs
- 🌟 Points / XP
- 🚪 Confirmation de sortie de leçon
- 🔄 Leçons de pratique pour regagner des cœurs
- 🏆 Classement
- 🗺 Quêtes
- 🛍 Boutique
- 📊 Dashboard admin (React Admin)
- 🌧 ORM Drizzle
- 💾 PostgreSQL
- 📱 API partagée avec l'app mobile Baro

### Prérequis

**Node 20+**

### Installation

```shell
npm install
```

### Configuration (`.env.local`)

```js
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
DATABASE_URL="postgresql://..."
STRIPE_API_KEY=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
STRIPE_WEBHOOK_SECRET=""
ELEVENLABS_API_KEY=""
BACKEND_URL="http://localhost:4000"
```

### Base de données

```shell
npm run db:push
npm run db:seed
```

### Lancer l'app

```shell
npm run dev
```

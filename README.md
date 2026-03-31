# FightBook

FightBook is an Expo starter turned into a web-first MVP for booking fighters and publishing accepted fights.

What is in this repo right now:

- Booker flow for browsing fighters and sending booking requests
- Fighter flow for accepting or declining incoming requests
- Public feed that only shows accepted public bookings
- Schedule view for confirmed events
- Activity log that simulates email and system notifications
- Hash-based client-side routing with browser history support
- Lazy-loaded page modules so sections mount only when visited
- CSS custom properties, hover states, and keyframe animations on web

Current stack:

- Expo
- React Native Web
- React for web route modules
- Local mocked data with modular state/selectors

Architecture notes:

- `App.web.js` boots the web app with DOM rendering and global CSS.
- `App.js` is a small native fallback while the product architecture is focused on web.
- `src/web/router/useHashRoute.js` handles hash routing.
- `src/web/state/MarketplaceContext.js` owns marketplace state and actions.
- `src/web/pages/` contains lazy-loaded route modules.
- `src/web/styles.css` contains design tokens, animations, and interaction states.

Run it:

1. Install dependencies if needed:

   `npm install`

2. Start the app:

   `npm start`

3. Or launch directly on web:

   `npm run web`

Suggested next backend step:

- Add Supabase for auth, Postgres, storage, row-level security, and edge-function email delivery.

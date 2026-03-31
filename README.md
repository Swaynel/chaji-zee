# FightBook

FightBook is an Expo starter turned into a product-shaped MVP for booking fighters and publishing accepted fights.

What is in this repo right now:

- Booker flow for browsing fighters and sending booking requests
- Fighter flow for accepting or declining incoming requests
- Public feed that only shows accepted public bookings
- Schedule view for confirmed events
- Activity log that simulates email and system notifications

Current stack:

- Expo
- React Native
- React Native Web
- Local mocked data and reducer-driven app state

Run it:

1. Install dependencies if needed:

   `npm install`

2. Start the app:

   `npm start`

3. Or launch directly on web:

   `npm run web`

Suggested next backend step:

- Add Supabase for auth, Postgres, storage, row-level security, and edge-function email delivery.

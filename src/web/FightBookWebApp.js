import React, { Suspense, lazy } from 'react';

import AppShell from './components/AppShell';
import { LoadingState } from './components/ui';
import { useHashRoute } from './router/useHashRoute';
import { MarketplaceProvider, useMarketplace } from './state/MarketplaceContext';

const pageModules = {
  feed: lazy(() => import('./pages/FeedPage')),
  fighters: lazy(() => import('./pages/FightersPage')),
  requests: lazy(() => import('./pages/RequestsPage')),
  schedule: lazy(() => import('./pages/SchedulePage')),
  profile: lazy(() => import('./pages/ProfilePage')),
};

function RoutedPage() {
  const { activePage } = useMarketplace();
  const ActivePage = pageModules[activePage] || pageModules.feed;

  return (
    <AppShell>
      <Suspense
        fallback={
          <LoadingState
            title="Loading page"
            body="FightBook mounts each page section only when you actually visit it."
          />
        }
      >
        <ActivePage />
      </Suspense>
    </AppShell>
  );
}

export default function FightBookWebApp() {
  const routing = useHashRoute();

  return (
    <MarketplaceProvider
      buildHash={routing.buildHash}
      navigate={routing.navigate}
      route={routing.route}
    >
      <RoutedPage />
    </MarketplaceProvider>
  );
}

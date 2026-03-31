import { useEffect, useState } from 'react';

export const routeKeys = ['feed', 'fighters', 'fighter', 'booking', 'requests', 'schedule', 'profile'];

const defaultRoute = {
  page: 'feed',
  params: {},
};

function sanitizeParams(params = {}) {
  const nextParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    nextParams.set(key, String(value));
  });

  return nextParams;
}

export function buildHash(page = defaultRoute.page, params = {}) {
  const safePage = routeKeys.includes(page) ? page : defaultRoute.page;
  const query = sanitizeParams(params).toString();

  return `#/${safePage}${query ? `?${query}` : ''}`;
}

function parseHash(hashValue) {
  const normalizedHash = (hashValue || '').replace(/^#\/?/, '');

  if (!normalizedHash) {
    return defaultRoute;
  }

  const [pageToken = defaultRoute.page, query = ''] = normalizedHash.split('?');
  const safePage = routeKeys.includes(pageToken) ? pageToken : defaultRoute.page;

  return {
    page: safePage,
    params: Object.fromEntries(new URLSearchParams(query).entries()),
  };
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultRoute;
    }

    return parseHash(window.location.hash);
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (!window.location.hash) {
      window.location.hash = buildHash(defaultRoute.page);
    }

    function handleHashChange() {
      setRoute(parseHash(window.location.hash));
    }

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  function navigate(page, params = {}, options = {}) {
    if (typeof window === 'undefined') {
      return;
    }

    const nextHash = buildHash(page, params);

    if (options.replace) {
      const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
      window.history.replaceState(null, '', nextUrl);
      setRoute(parseHash(nextHash));
      return;
    }

    if (window.location.hash === nextHash) {
      setRoute(parseHash(nextHash));
      return;
    }

    window.location.hash = nextHash;
  }

  return {
    route,
    navigate,
    buildHash,
  };
}

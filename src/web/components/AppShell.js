import React from 'react';

import { useMarketplace } from '../state/MarketplaceContext';
import { FlashBanner, cx } from './ui';

const workspaceOptions = [
  { key: 'booker', label: 'BOOK' },
  { key: 'fighter', label: 'FIGHT' },
  { key: 'both', label: 'BOTH' },
  { key: 'public', label: 'PUB' },
];

const pageOptions = [
  { key: 'feed', label: 'FEED', Icon: FeedIcon },
  { key: 'fighters', label: 'ROSTER', Icon: ProfileIcon },
  { key: 'requests', label: 'REQUESTS', Icon: RequestsIcon },
  { key: 'schedule', label: 'SCHEDULE', Icon: CalendarIcon },
  { key: 'profile', label: 'PROFILE', Icon: ProfileIcon },
];

function FeedIcon() {
  return (
    <svg fill="none" height="19" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="19">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function RequestsIcon() {
  return (
    <svg fill="none" height="19" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="19">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg fill="none" height="19" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="19">
      <rect height="18" rx="2" width="18" x="3" y="4" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg fill="none" height="19" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="19">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function AppShell({ children }) {
  const {
    activePage,
    bookingSourcePage,
    currentUser,
    currentUserFighter,
    flash,
    navigateToPage,
    pendingIncomingCount,
    setWorkspace,
    workspace,
  } = useMarketplace();

  const topSeed = currentUserFighter?.imageSeed || initials(currentUser.name);
  const roleLine = `${currentUser.promoterName.toUpperCase()} · BOOKER + FIGHTER`;

  function isNavActive(key) {
    if (activePage === 'booking') {
      return bookingSourcePage === key;
    }

    if (key === 'fighters') {
      return activePage === 'fighters' || activePage === 'fighter';
    }

    return activePage === key;
  }

  return (
    <div id="app">
      <div id="top">
        <div className="t-id">
          <div className="t-av">{topSeed}</div>
          <div>
            <div className="t-name">{currentUser.name}</div>
            <div className="t-role">{roleLine}</div>
          </div>
        </div>

        <div className="ws-group" id="wsg">
          {workspaceOptions.map((option) => (
            <button
              className={cx('ws-btn', workspace === option.key && 'on')}
              data-ws={option.key}
              key={option.key}
              onClick={() => setWorkspace(option.key)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div id="pages">
        <div className="page on" id={`p-${activePage}`} key={activePage}>
          <div className="pi">{children}</div>
        </div>
      </div>

      <div id="nav">
        {pageOptions.map(({ key, label, Icon }) => (
          <button
            className={cx('nb', isNavActive(key) && 'on')}
            data-pg={key}
            key={key}
            onClick={() => navigateToPage(key)}
            type="button"
          >
            <div className="ni">
              <Icon />
            </div>
            {key === 'requests' ? (
              <span className="nb-badge" style={{ display: pendingIncomingCount ? 'flex' : 'none' }}>
                {pendingIncomingCount}
              </span>
            ) : null}
            <span className="nl">{label}</span>
          </button>
        ))}
      </div>

      <FlashBanner flash={flash} />
    </div>
  );
}

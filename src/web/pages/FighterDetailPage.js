import React from 'react';

import BookingComposer from '../components/BookingComposer';
import { FighterDetailCard } from '../components/cards';
import { Button, EmptyState } from '../components/ui';
import { useMarketplace } from '../state/MarketplaceContext';

export default function FighterDetailPage() {
  const {
    composerVisible,
    currentUser,
    navigateToPage,
    openComposer,
    selectedFighter,
  } = useMarketplace();

  if (!selectedFighter) {
    return <EmptyState body="Return to the roster and choose a fighter to inspect." title="Fighter not found" />;
  }

  return (
    <>
      <div className="card">
        <div className="cb detail-page-head">
          <Button onClick={() => navigateToPage('fighters')} tone="outline">
            BACK TO ROSTER
          </Button>
          <div className="detail-page-copy">
            <div className="slbl">FIGHTER PROFILE</div>
            <div className="card-mini-title">{selectedFighter.name}</div>
          </div>
        </div>
      </div>

      <FighterDetailCard
        composerVisible={composerVisible}
        currentUserFighterId={currentUser.fighterProfileId}
        fighter={selectedFighter}
        onToggleComposer={() => {
          if (composerVisible) {
            navigateToPage('fighter', { fighter: selectedFighter.id });
            return;
          }

          openComposer(selectedFighter.id);
        }}
      />

      {composerVisible ? <BookingComposer /> : null}
    </>
  );
}

import React from 'react';

import { ScheduleCard } from '../components/cards';
import { Button, Divider, EmptyState } from '../components/ui';
import { useMarketplace } from '../state/MarketplaceContext';

export default function SchedulePage() {
  const {
    currentUser,
    currentUserFighter,
    fighterMap,
    scheduleItems,
    updateAvailability,
    workspace,
  } = useMarketplace();

  return (
    <>
      {scheduleItems.length ? (
        <div className="ilist">
          {scheduleItems.map((booking) => (
            <ScheduleCard
              booking={booking}
              fighter={fighterMap[booking.fighterId]}
              key={booking.id}
              userFighterId={currentUser.fighterProfileId}
              workspace={workspace}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          body="Accepted bookings land here automatically."
          icon="📅"
          title="No confirmed events"
        />
      )}

      {workspace !== 'public' && currentUserFighter ? (
        <>
          <Divider label="AVAILABILITY" />
          <div className="card">
            <div className="cb avail-stack">
              <div className="mr">
                <span className="mk">CURRENT</span>
                <span className="mv2">{currentUserFighter.availability}</span>
              </div>
              <div className="mr">
                <span className="mk">WINDOW</span>
                <span className="mv2">{currentUserFighter.availabilityWindow}</span>
              </div>
              <div className="avail-actions">
                {['Open in May', 'Selective', 'Booked solid'].map((option) => (
                  <Button
                    key={option}
                    onClick={() => updateAvailability(option)}
                    tone={currentUserFighter.availability === option ? 'fire' : 'outline'}
                  >
                    {option.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

import React from 'react';

import { BookingCard } from '../components/cards';
import { Divider, EmptyState } from '../components/ui';
import { useMarketplace } from '../state/MarketplaceContext';

export default function RequestsPage() {
  const {
    acceptBooking,
    declineBooking,
    fighterMap,
    incomingRequests,
    outgoingRequests,
    workspace,
  } = useMarketplace();

  if (workspace === 'public') {
    return (
      <EmptyState
        body="Switch to Booker, Fighter, or Both to manage requests."
        icon="🔒"
        title="Public mode"
      />
    );
  }

  const showOutgoing = workspace === 'booker' || workspace === 'both';
  const showIncoming = workspace === 'fighter' || workspace === 'both';

  return (
    <>
      {showOutgoing ? (
        <>
          <Divider label={`OUTGOING · ${outgoingRequests.length}`} />
          {outgoingRequests.length ? (
            <div className="ilist">
              {outgoingRequests.map((booking) => (
                <BookingCard
                  booking={booking}
                  fighter={fighterMap[booking.fighterId]}
                  key={booking.id}
                  mode="outgoing"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              body="Go to Roster and send a booking."
              icon="📤"
              title="No outgoing requests"
            />
          )}
        </>
      ) : null}

      {showIncoming ? (
        <>
          <Divider label={`INCOMING · ${incomingRequests.length}`} />
          {incomingRequests.length ? (
            <div className="ilist">
              {incomingRequests.map((booking) => (
                <BookingCard
                  booking={booking}
                  fighter={fighterMap[booking.fighterId]}
                  key={booking.id}
                  mode="incoming"
                  onAccept={() => acceptBooking(booking.id)}
                  onDecline={() => declineBooking(booking.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              body="Offers from promoters appear here."
              icon="📥"
              title="No incoming requests"
            />
          )}
        </>
      ) : null}
    </>
  );
}

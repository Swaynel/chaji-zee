import React from 'react';

import { formatDateLong, formatDateTime } from '../../utils/date';
import { Button, EmptyState, MetaRows, StatusBadge } from '../components/ui';
import { useMarketplace } from '../state/MarketplaceContext';

const sourceLabels = {
  feed: 'PUBLIC FEED',
  requests: 'REQUESTS',
  schedule: 'SCHEDULE',
  profile: 'PROFILE',
};

export default function BookingDetailPage() {
  const {
    acceptBooking,
    bookingSourcePage,
    currentUser,
    declineBooking,
    fighterMap,
    navigateToPage,
    selectedBooking,
    selectFighter,
  } = useMarketplace();

  if (!selectedBooking) {
    return (
      <EmptyState
        body="Return to the previous page and choose a booking to inspect."
        title="Booking not found"
      />
    );
  }

  const fighter = fighterMap[selectedBooking.fighterId] || null;
  const isIncomingPending =
    selectedBooking.fighterId === currentUser.fighterProfileId && selectedBooking.status === 'pending';
  const sourceLabel = sourceLabels[bookingSourcePage] || 'FEED';
  const timestampLabel = selectedBooking.decisionAt
    ? `Updated ${formatDateTime(selectedBooking.decisionAt)}`
    : `Requested ${formatDateTime(selectedBooking.createdAt)}`;

  return (
    <>
      <div className="card">
        <div className="cb detail-page-head">
          <Button onClick={() => navigateToPage(bookingSourcePage || 'feed')} tone="outline">
            BACK TO {sourceLabel}
          </Button>
          <div className="detail-page-copy">
            <div className="slbl">BOOKING DETAIL</div>
            <div className="card-mini-title">{selectedBooking.eventName}</div>
          </div>
        </div>
      </div>

      <div className="card card-al">
        <div className="ch">
          <div>
            <div className="slbl">EVENT</div>
            <div className="stitle">{selectedBooking.eventName}</div>
            <div className="ssub">
              {formatDateLong(selectedBooking.date)} · {selectedBooking.location}
            </div>
          </div>
          <StatusBadge status={selectedBooking.status} />
        </div>
        <div className="cb detail-stack">
          <div className="copy-sm">{selectedBooking.description}</div>

          <MetaRows
            items={[
              { label: 'FIGHTER', value: fighter?.name || 'Unknown' },
              { label: 'BOOKER', value: selectedBooking.clientName },
              { label: 'OFFER', value: selectedBooking.offeredPrice, valueClassName: 'gold' },
              { label: 'VISIBILITY', value: selectedBooking.visibility.toUpperCase() },
              { label: 'TIMELINE', value: timestampLabel },
            ]}
          />

          {fighter ? (
            <Button onClick={() => selectFighter(fighter.id)} tone="outline">
              VIEW FIGHTER PROFILE
            </Button>
          ) : null}

          {isIncomingPending ? (
            <div className="detail-actions">
              <Button onClick={() => acceptBooking(selectedBooking.id)} tone="accept">
                ACCEPT REQUEST
              </Button>
              <Button onClick={() => declineBooking(selectedBooking.id)} tone="decline">
                DECLINE REQUEST
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

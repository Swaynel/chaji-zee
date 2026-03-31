import React, { useState } from 'react';

import { FighterDetailCard, FighterTile } from '../components/cards';
import { Button, EmptyState, SearchInput } from '../components/ui';
import { useMarketplace } from '../state/MarketplaceContext';

function BookingComposer() {
  const { bookingDraft, closeComposer, submitBooking, updateBookingDraft } = useMarketplace();

  return (
    <div className="card card-al">
      <div className="ch">
        <div>
          <div className="slbl">BOOKING REQUEST</div>
          <div className="card-mini-title">Compose and send the offer</div>
        </div>
      </div>
      <div className="cb form-stack">
        <div className="fg2">
          <div className="fgrp">
            <label className="flbl" htmlFor="booking-event">
              EVENT NAME
            </label>
            <input
              className="finp"
              id="booking-event"
              onChange={(event) => updateBookingDraft('eventName', event.target.value)}
              placeholder="Savanna Ring 21"
              value={bookingDraft.eventName}
            />
          </div>

          <div className="fgrp">
            <label className="flbl" htmlFor="booking-date">
              FIGHT DATE
            </label>
            <input
              className="finp"
              id="booking-date"
              onChange={(event) => updateBookingDraft('date', event.target.value)}
              placeholder="2026-05-15"
              value={bookingDraft.date}
            />
          </div>

          <div className="fgrp">
            <label className="flbl" htmlFor="booking-location">
              LOCATION
            </label>
            <input
              className="finp"
              id="booking-location"
              onChange={(event) => updateBookingDraft('location', event.target.value)}
              placeholder="Kigali Convention Centre"
              value={bookingDraft.location}
            />
          </div>

          <div className="fgrp">
            <label className="flbl" htmlFor="booking-price">
              OFFER
            </label>
            <input
              className="finp"
              id="booking-price"
              onChange={(event) => updateBookingDraft('offeredPrice', event.target.value)}
              placeholder="$2,000"
              value={bookingDraft.offeredPrice}
            />
          </div>
        </div>

        <div className="fgrp">
          <label className="flbl" htmlFor="booking-description">
            DESCRIPTION
          </label>
          <textarea
            className="finp"
            id="booking-description"
            onChange={(event) => updateBookingDraft('description', event.target.value)}
            placeholder="Describe the bout, travel support, and anything the fighter should know."
            value={bookingDraft.description}
          />
        </div>

        <div className="fgrp">
          <div className="flbl">VISIBILITY IF ACCEPTED</div>
          <div className="vpill-row">
            {['public', 'private'].map((visibility) => (
              <button
                className={`vpill ${bookingDraft.visibility === visibility ? 'on' : ''}`}
                key={visibility}
                onClick={() => updateBookingDraft('visibility', visibility)}
                type="button"
              >
                {visibility === 'public' ? 'PUBLIC FEED' : 'PRIVATE ONLY'}
              </button>
            ))}
          </div>
        </div>

        <div className="iacts">
          <Button onClick={submitBooking} tone="fire">
            SEND REQUEST
          </Button>
          <Button onClick={closeComposer} tone="outline">
            CANCEL
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function FightersPage() {
  const [query, setQuery] = useState('');
  const {
    composerVisible,
    currentUser,
    fighters,
    openComposer,
    selectedFighter,
    selectFighter,
  } = useMarketplace();

  const normalizedQuery = query.trim().toLowerCase();
  const filteredFighters = fighters.filter((fighter) => {
    if (!normalizedQuery) {
      return true;
    }

    return [fighter.name, fighter.discipline, fighter.city, fighter.style]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery);
  });

  return (
    <>
      <SearchInput
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search fighters, cities, disciplines…"
        value={query}
      />

      <div className="fgrid">
        {filteredFighters.length ? (
          filteredFighters.map((fighter) => (
            <FighterTile
              fighter={fighter}
              key={fighter.id}
              onSelect={() => selectFighter(fighter.id)}
              selected={selectedFighter?.id === fighter.id}
            />
          ))
        ) : (
          <div className="grid-empty">
            <EmptyState body="Try a different search." icon="🔍" title="No fighters found" />
          </div>
        )}
      </div>

      {selectedFighter ? (
        <FighterDetailCard
          composerVisible={composerVisible}
          currentUserFighterId={currentUser.fighterProfileId}
          fighter={selectedFighter}
          onToggleComposer={() =>
            composerVisible ? selectFighter(selectedFighter.id) : openComposer(selectedFighter.id)
          }
        />
      ) : null}

      {composerVisible ? <BookingComposer /> : null}
    </>
  );
}

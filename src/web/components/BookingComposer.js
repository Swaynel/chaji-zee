import React from 'react';

import { Button } from './ui';
import { useMarketplace } from '../state/MarketplaceContext';

export default function BookingComposer() {
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

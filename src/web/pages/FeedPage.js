import React from 'react';

import { formatDateLong } from '../../utils/date';
import { FeedCard } from '../components/cards';
import { Badge, Divider, EmptyState, MetaRows, MetricTile } from '../components/ui';
import { useMarketplace } from '../state/MarketplaceContext';

export default function FeedPage() {
  const { fighterMap, metrics, nextPublicEvent, openBooking, publicFeed } = useMarketplace();

  return (
    <>
      <div className="mgrid">
        {metrics.map((metric) => (
          <MetricTile key={metric.label} label={metric.label} tone={metric.tone} value={metric.value} />
        ))}
      </div>

      {nextPublicEvent ? (
        <button
          className="card card-al card-btn"
          onClick={() => openBooking(nextPublicEvent.id, 'feed')}
          type="button"
        >
          <div className="ch">
            <div>
              <div className="slbl">UP NEXT</div>
              <div className="stitle">{nextPublicEvent.eventName}</div>
              <div className="ssub">
                {formatDateLong(nextPublicEvent.date)} · {nextPublicEvent.location}
              </div>
            </div>
            <Badge className="ba">PUBLIC</Badge>
          </div>
          <div className="cb">
            <div className="copy-sm next-copy">
              {fighterMap[nextPublicEvent.fighterId]?.name || 'Unknown'} confirmed for this card.
            </div>
            <MetaRows
              items={[
                { label: 'BOOKER', value: nextPublicEvent.clientName },
                { label: 'OFFER', value: nextPublicEvent.offeredPrice, valueClassName: 'gold' },
              ]}
            />
          </div>
        </button>
      ) : (
        <div className="card card-al">
          <div className="cb">
            <div className="emp emp-tight">
              <div className="ei icon-tight">📋</div>
              <div className="et">No upcoming public events</div>
              <div className="eb">Accept a public booking to see it here.</div>
            </div>
          </div>
        </div>
      )}

      <Divider label="PUBLIC FEED" />

      {publicFeed.length ? (
        <div className="ilist">
          {publicFeed.map((booking) => (
            <FeedCard
              booking={booking}
              fighter={fighterMap[booking.fighterId]}
              key={booking.id}
              onSelect={() => openBooking(booking.id, 'feed')}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          body="Accepted public bookings appear here."
          icon="📋"
          title="No public bookings yet"
        />
      )}
    </>
  );
}

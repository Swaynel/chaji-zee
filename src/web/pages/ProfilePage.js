import React from 'react';

import { NotificationCard } from '../components/cards';
import { AvailabilityBadge, Button, Divider, MetricTile } from '../components/ui';
import { useMarketplace } from '../state/MarketplaceContext';
import { toDateValue } from '../../utils/date';

export default function ProfilePage() {
  const { bookings, currentUser, currentUserFighter, notifications, updateAvailability } = useMarketplace();

  const publicAppearances = bookings.filter(
    (booking) =>
      booking.fighterId === currentUser.fighterProfileId &&
      booking.status === 'accepted' &&
      booking.visibility === 'public',
  ).length;

  const confirmedFights = bookings.filter(
    (booking) =>
      booking.fighterId === currentUser.fighterProfileId && booking.status === 'accepted',
  ).length;

  const sortedNotifications = notifications
    .slice()
    .sort((left, right) => toDateValue(right.createdAt) - toDateValue(left.createdAt));

  return (
    <>
      <div className="mgrid">
        <MetricTile label="NAME" value={currentUser.name.split(' ')[0]} />
        <MetricTile label="COMPANY" value={currentUser.promoterName.split(' ')[0]} />
        {currentUserFighter ? (
          <>
            <MetricTile label="CONFIRMED" tone="mgr" value={`${confirmedFights}`} />
            <MetricTile label="PUBLIC" tone="mg" value={`${publicAppearances}`} />
          </>
        ) : (
          <>
            <MetricTile label="CITY" value={currentUser.city.split(',')[0]} />
            <MetricTile label="FIGHTER" value="—" />
          </>
        )}
      </div>

      {currentUserFighter ? (
        <div className="card">
          <div className="ch">
            <div>
              <div className="slbl">FIGHTER PROFILE</div>
              <div className="card-mini-title">{currentUserFighter.name}</div>
            </div>
            <AvailabilityBadge availability={currentUserFighter.availability} />
          </div>
          <div className="cb profile-card-body">
            <div className="mr">
              <span className="mk">RECORD</span>
              <span className="mv2 fire">{currentUserFighter.record}</span>
            </div>
            <div className="mr">
              <span className="mk">DISCIPLINE</span>
              <span className="mv2">{currentUserFighter.discipline}</span>
            </div>
            <div className="mr">
              <span className="mk">WINDOW</span>
              <span className="mv2">{currentUserFighter.availabilityWindow}</span>
            </div>
            <div className="profile-actions">
              {['Open in May', 'Selective', 'Booked solid'].map((option) => (
                <Button
                  key={option}
                  onClick={() => updateAvailability(option)}
                  size="sm"
                  tone={currentUserFighter.availability === option ? 'fire' : 'outline'}
                >
                  {option.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <Divider label={`ACTIVITY LOG · ${sortedNotifications.length}`} />

      <div className="ilist">
        {sortedNotifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </div>
    </>
  );
}

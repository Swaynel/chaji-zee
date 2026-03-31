import React from 'react';

import {
  formatDateLong,
  formatDateShort,
  formatDateTime,
  monthName,
} from '../../utils/date';
import {
  AvailabilityBadge,
  Button,
  MetaRows,
  StatusBadge,
  Tag,
  cx,
} from './ui';

export function FeedCard({ booking, fighter }) {
  return (
    <div className="icard">
      <div className="itop">
        <div>
          <div className="isub">
            {formatDateShort(booking.date)} · {booking.location}
          </div>
          <div className="iname">{booking.eventName}</div>
        </div>
        <StatusBadge status="accepted" />
      </div>

      <div className="ibody">{fighter?.name || 'Unknown'} confirmed.</div>

      <MetaRows
        items={[
          { label: 'BOOKER', value: booking.clientName },
          { label: 'OFFER', value: booking.offeredPrice, valueClassName: 'gold' },
        ]}
      />
    </div>
  );
}

export function FighterTile({ fighter, onSelect, selected }) {
  return (
    <button className={cx('ftile', selected && 'on')} onClick={onSelect} type="button">
      <div className="fav">{fighter.imageSeed}</div>
      <div className="fn">{fighter.name}</div>
      <div className="fd2">
        {fighter.discipline} · {fighter.weightClass}
      </div>
      <AvailabilityBadge availability={fighter.availability} />
    </button>
  );
}

export function FighterDetailCard({
  composerVisible,
  currentUserFighterId,
  fighter,
  onToggleComposer,
}) {
  const isCurrentUser = fighter.id === currentUserFighterId;

  return (
    <div className="fdet">
      <div className="fdh">
        <div className="fdav">{fighter.imageSeed}</div>
        <div className="fdh-copy">
          <div className="fdn">{fighter.name}</div>
          <div className="fdhl">{fighter.headline}</div>
          <div className="tags tags--top">
            <Tag>{fighter.discipline}</Tag>
            <Tag>{fighter.weightClass}</Tag>
            <Tag>{fighter.city}</Tag>
            <AvailabilityBadge availability={fighter.availability} />
          </div>
        </div>
      </div>

      <div className="fdb">
        <div className="mgrid">
          <div className="m">
            <div className="mv metric-sm">{fighter.record}</div>
            <div className="ml">RECORD</div>
          </div>
          <div className="m mg">
            <div className="mv metric-xs">{fighter.priceFrom}</div>
            <div className="ml">FROM</div>
          </div>
          <div className="m">
            <div className="mv metric-sm">{fighter.rating}</div>
            <div className="ml">RATING</div>
          </div>
          <div className="m">
            <div className="mv metric-xxs">{fighter.responseTime}</div>
            <div className="ml">REPLY</div>
          </div>
        </div>

        <div className="copy-sm">{fighter.bio}</div>

        <div>
          <div className="slbl">WINDOW</div>
          <div className="copy-xs">{fighter.availabilityWindow}</div>
        </div>

        <div>
          <div className="slbl ach-spacer">ACHIEVEMENTS</div>
          <div className="tags">
            {fighter.achievements.map((achievement) => (
              <Tag key={achievement}>{achievement}</Tag>
            ))}
          </div>
        </div>

        <div className="contact-line">
          <span>Contact</span> {fighter.email}
        </div>

        {isCurrentUser ? (
          <div className="note-bar">
            This is your fighter profile. Update availability in Profile.
          </div>
        ) : (
          <Button fullWidth onClick={onToggleComposer} tone="fire">
            {composerVisible ? '— CLOSE FORM' : '+ CREATE BOOKING REQUEST'}
          </Button>
        )}
      </div>
    </div>
  );
}

export function BookingCard({ booking, fighter, mode, onAccept, onDecline }) {
  const displayName = mode === 'incoming' ? booking.clientName : fighter?.name || 'Unknown';
  const timestamp = booking.decisionAt
    ? `Updated ${formatDateTime(booking.decisionAt)}`
    : `Requested ${formatDateTime(booking.createdAt)}`;

  return (
    <div className="icard">
      <div className="itop">
        <div>
          <div className="isub">{booking.eventName}</div>
          <div className="iname">{displayName}</div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="ibody">{booking.description}</div>

      <MetaRows
        items={[
          { label: 'DATE', value: formatDateLong(booking.date) },
          { label: 'LOCATION', value: booking.location },
          { label: 'OFFER', value: booking.offeredPrice, valueClassName: 'gold' },
          { label: 'VISIBILITY', value: booking.visibility.toUpperCase() },
        ]}
      />

      <div className="itime">{timestamp}</div>

      {mode === 'incoming' && booking.status === 'pending' ? (
        <div className="iacts">
          <Button onClick={onAccept} size="sm" tone="accept">
            ✓ ACCEPT
          </Button>
          <Button onClick={onDecline} size="sm" tone="decline">
            ✗ DECLINE
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function ScheduleCard({ booking, fighter, userFighterId, workspace }) {
  const roleLabel =
    workspace === 'booker'
      ? 'Booked by you'
      : workspace === 'fighter'
        ? 'You are fighting'
        : workspace === 'public'
          ? 'Public listing'
          : booking.fighterId === userFighterId
            ? 'You are fighting'
            : 'Booked by you';

  const eventDate = new Date(`${booking.date}T12:00:00Z`);

  return (
    <div className="schd">
      <div className="dblock">
        <div className="dm">{monthName(eventDate).toUpperCase()}</div>
        <div className="dd">{eventDate.getUTCDate()}</div>
      </div>

      <div className="schd-copy">
        <div className="schd-name">{booking.eventName}</div>
        <div className="isub schedule-sub">{fighter?.name || 'Unknown'}</div>
        <div className="copy-sm">{booking.location}</div>
        <div className="schedule-meta">
          {roleLabel} · {booking.visibility === 'public' ? 'PUBLIC' : 'PRIVATE'}
        </div>
      </div>
    </div>
  );
}

export function NotificationCard({ notification }) {
  return (
    <div className="nitem">
      <div className={cx('ndot', notification.type === 'email' ? 'neml' : 'nsys')} />
      <div>
        <div className="ntitle">{notification.title}</div>
        <div className="nbody">{notification.body}</div>
        <div className="ntime">{formatDateTime(notification.createdAt)}</div>
      </div>
    </div>
  );
}

import { toDateValue } from '../../utils/date';

function sortByUpcomingDate(a, b) {
  return toDateValue(a.date) - toDateValue(b.date);
}

function sortRequests(a, b) {
  const statusOrder = { pending: 0, accepted: 1, rejected: 2 };
  const statusDiff = statusOrder[a.status] - statusOrder[b.status];

  if (statusDiff !== 0) {
    return statusDiff;
  }

  return toDateValue(b.createdAt) - toDateValue(a.createdAt);
}

export function getDefaultFighterId(fighters, fighterProfileId) {
  return fighters.find((fighter) => fighter.id !== fighterProfileId)?.id || fighters[0]?.id || null;
}

export function buildFighterMap(fighters) {
  return fighters.reduce((accumulator, fighter) => {
    accumulator[fighter.id] = fighter;
    return accumulator;
  }, {});
}

export function getPublicFeed(bookings) {
  return bookings
    .filter((booking) => booking.status === 'accepted' && booking.visibility === 'public')
    .slice()
    .sort(sortByUpcomingDate);
}

export function getOutgoingRequests(bookings, userId) {
  return bookings
    .filter((booking) => booking.clientUserId === userId)
    .slice()
    .sort(sortRequests);
}

export function getIncomingRequests(bookings, fighterProfileId) {
  return bookings
    .filter((booking) => booking.fighterId === fighterProfileId)
    .slice()
    .sort(sortRequests);
}

export function getScheduleItems(bookings, workspace, currentUser) {
  const acceptedBookings = bookings.filter((booking) => booking.status === 'accepted');

  const filteredBookings = acceptedBookings.filter((booking) => {
    if (workspace === 'public') {
      return booking.visibility === 'public';
    }

    if (workspace === 'booker') {
      return booking.clientUserId === currentUser.id;
    }

    if (workspace === 'fighter') {
      return booking.fighterId === currentUser.fighterProfileId;
    }

    return booking.clientUserId === currentUser.id || booking.fighterId === currentUser.fighterProfileId;
  });

  return filteredBookings.slice().sort(sortByUpcomingDate);
}

export function getMetricCards({
  workspace,
  fighters,
  publicFeed,
  outgoingRequests,
  incomingRequests,
  scheduleItems,
  fighterProfileId,
}) {
  const openFighters = fighters.filter((fighter) => fighter.availability !== 'Booked solid').length;
  const uniqueCities = new Set(fighters.map((fighter) => fighter.city)).size;
  const pendingOutgoing = outgoingRequests.filter((booking) => booking.status === 'pending').length;
  const pendingIncoming = incomingRequests.filter((booking) => booking.status === 'pending').length;
  const confirmedOutgoing = outgoingRequests.filter((booking) => booking.status === 'accepted').length;
  const confirmedIncoming = incomingRequests.filter((booking) => booking.status === 'accepted').length;

  if (workspace === 'booker') {
    return [
      { label: 'ROSTER', value: `${fighters.length}`, tone: '' },
      { label: 'PENDING', value: `${pendingOutgoing}`, tone: 'mf' },
      { label: 'CONFIRMED', value: `${confirmedOutgoing}`, tone: 'mgr' },
      { label: 'CITIES', value: `${uniqueCities}`, tone: 'mg' },
    ];
  }

  if (workspace === 'fighter') {
    return [
      { label: 'INCOMING', value: `${pendingIncoming}`, tone: 'mf' },
      { label: 'CONFIRMED', value: `${confirmedIncoming}`, tone: 'mgr' },
      {
        label: 'STATUS',
        value:
          fighters.find((fighter) => fighter.id === fighterProfileId)?.availability || 'Open',
        tone: '',
      },
      {
        label: 'PUBLIC',
        value: `${publicFeed.filter((booking) => booking.fighterId === fighterProfileId).length}`,
        tone: 'mg',
      },
    ];
  }

  if (workspace === 'public') {
    return [
      { label: 'PUBLIC', value: `${publicFeed.length}`, tone: 'mg' },
      { label: 'OPEN', value: `${openFighters}`, tone: 'mgr' },
      { label: 'CITIES', value: `${uniqueCities}`, tone: '' },
      { label: 'CARDS', value: `${scheduleItems.length}`, tone: 'mf' },
    ];
  }

  return [
    { label: 'OPEN', value: `${openFighters}`, tone: '' },
    { label: 'OUTGOING', value: `${pendingOutgoing}`, tone: 'mf' },
    { label: 'INCOMING', value: `${pendingIncoming}`, tone: 'mf' },
    { label: 'CONFIRMED', value: `${scheduleItems.length}`, tone: 'mgr' },
  ];
}

export function getWorkspaceCopy(workspace) {
  if (workspace === 'booker') {
    return {
      title: 'Book cards without losing the thread.',
      body: 'Browse the roster, send a clean request, and track every answer from one place.',
    };
  }

  if (workspace === 'fighter') {
    return {
      title: 'Stay booked, but stay selective.',
      body: 'Incoming offers, quick decisions, and a schedule that stays honest once you accept.',
    };
  }

  if (workspace === 'public') {
    return {
      title: 'A live board for booked fights.',
      body: 'Public feed items appear only when the fighter accepts and the booking is set to public.',
    };
  }

  return {
    title: 'Run both sides of the marketplace.',
    body: 'FightBook lets one account book talent, manage a fighter profile, and publish confirmed cards.',
  };
}

export function getAvailabilityWindow(availability) {
  if (availability === 'Booked solid') {
    return 'Next opening in June 2026';
  }

  if (availability === 'Selective') {
    return 'Selective through late April 2026';
  }

  return 'Open May 1-31, 2026';
}

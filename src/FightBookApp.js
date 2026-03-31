import React, { useEffect, useReducer } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import { currentUser, initialBookings, initialFighters, initialNotifications } from './data/mockData';
import { colors, fonts, radii, spacing, surfaceShadow } from './theme';

const workspaceOptions = [
  { key: 'both', label: 'Dual View' },
  { key: 'booker', label: 'Booker' },
  { key: 'fighter', label: 'Fighter' },
  { key: 'public', label: 'Public' },
];

const tabOptions = [
  { key: 'feed', label: 'Feed' },
  { key: 'fighters', label: 'Fighters' },
  { key: 'requests', label: 'Requests' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'profile', label: 'Profile' },
];

function makeBookingComposer(fighterId) {
  return {
    visible: false,
    fighterId,
    eventName: '',
    date: '2026-05-15',
    location: currentUser.city,
    description: '',
    offeredPrice: '',
    visibility: 'public',
  };
}

function createInitialState() {
  const defaultFighter = initialFighters.find(
    (fighter) => fighter.id !== currentUser.fighterProfileId,
  )?.id;

  return {
    activeTab: 'feed',
    workspace: 'both',
    selectedFighterId: defaultFighter || initialFighters[0]?.id,
    searchQuery: '',
    bookingComposer: makeBookingComposer(defaultFighter || initialFighters[0]?.id),
    fighters: initialFighters,
    bookings: initialBookings,
    notifications: initialNotifications,
    flash: null,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_WORKSPACE':
      return {
        ...state,
        workspace: action.payload,
      };
    case 'SET_TAB':
      return {
        ...state,
        activeTab: action.payload,
      };
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };
    case 'SELECT_FIGHTER':
      return {
        ...state,
        selectedFighterId: action.payload,
      };
    case 'OPEN_BOOKING_FORM':
      return {
        ...state,
        selectedFighterId: action.payload,
        bookingComposer: {
          ...makeBookingComposer(action.payload),
          visible: true,
          offeredPrice:
            state.fighters.find((fighter) => fighter.id === action.payload)?.priceFrom || '',
        },
      };
    case 'CLOSE_BOOKING_FORM':
      return {
        ...state,
        bookingComposer: makeBookingComposer(state.selectedFighterId),
      };
    case 'UPDATE_BOOKING_FIELD':
      return {
        ...state,
        bookingComposer: {
          ...state.bookingComposer,
          [action.payload.field]: action.payload.value,
        },
      };
    case 'SHOW_FLASH':
      return {
        ...state,
        flash: action.payload,
      };
    case 'DISMISS_FLASH':
      return {
        ...state,
        flash: null,
      };
    case 'SUBMIT_BOOKING':
      return {
        ...state,
        activeTab: 'requests',
        workspace: 'booker',
        bookings: [action.payload.booking, ...state.bookings],
        notifications: [action.payload.notification, ...state.notifications],
        bookingComposer: makeBookingComposer(state.selectedFighterId),
        flash: action.payload.flash,
      };
    case 'ACCEPT_BOOKING':
      return {
        ...state,
        activeTab: 'schedule',
        workspace: 'fighter',
        bookings: state.bookings.map((booking) =>
          booking.id === action.payload.bookingId
            ? {
                ...booking,
                status: 'accepted',
                decisionAt: action.payload.decisionAt,
              }
            : booking,
        ),
        notifications: [action.payload.notification, ...state.notifications],
        flash: action.payload.flash,
      };
    case 'DECLINE_BOOKING':
      return {
        ...state,
        activeTab: 'requests',
        workspace: 'fighter',
        bookings: state.bookings.map((booking) =>
          booking.id === action.payload.bookingId
            ? {
                ...booking,
                status: 'rejected',
                decisionAt: action.payload.decisionAt,
              }
            : booking,
        ),
        notifications: [action.payload.notification, ...state.notifications],
        flash: action.payload.flash,
      };
    case 'UPDATE_AVAILABILITY':
      return {
        ...state,
        fighters: state.fighters.map((fighter) =>
          fighter.id === currentUser.fighterProfileId
            ? {
                ...fighter,
                availability: action.payload.availability,
                availabilityWindow: action.payload.availabilityWindow,
              }
            : fighter,
        ),
        notifications: [action.payload.notification, ...state.notifications],
        flash: action.payload.flash,
      };
    default:
      return state;
  }
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toDateValue(value) {
  if (!value) {
    return 0;
  }

  const normalized = value.includes('T') ? value : `${value}T12:00:00Z`;
  return new Date(normalized).getTime();
}

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

function monthName(date, variant = 'short') {
  const short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const long = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return variant === 'long' ? long[date.getUTCMonth()] : short[date.getUTCMonth()];
}

function formatDateShort(value) {
  const date = new Date(value.includes('T') ? value : `${value}T12:00:00Z`);
  return `${monthName(date)} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

function formatDateLong(value) {
  const date = new Date(value.includes('T') ? value : `${value}T12:00:00Z`);
  return `${monthName(date, 'long')} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

function formatDateWithTime(value) {
  const date = new Date(value);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const normalizedHour = hours % 12 || 12;

  return `${monthName(date, 'long')} ${date.getUTCDate()}, ${date.getUTCFullYear()} at ${normalizedHour}:${minutes} ${suffix} UTC`;
}

function buildFighterMap(fighters) {
  return fighters.reduce((accumulator, fighter) => {
    accumulator[fighter.id] = fighter;
    return accumulator;
  }, {});
}

function getPublicFeed(bookings) {
  return bookings
    .filter((booking) => booking.status === 'accepted' && booking.visibility === 'public')
    .slice()
    .sort(sortByUpcomingDate);
}

function getOutgoingRequests(bookings) {
  return bookings
    .filter((booking) => booking.clientUserId === currentUser.id)
    .slice()
    .sort(sortRequests);
}

function getIncomingRequests(bookings) {
  return bookings
    .filter((booking) => booking.fighterId === currentUser.fighterProfileId)
    .slice()
    .sort(sortRequests);
}

function getScheduleItems(bookings, workspace) {
  const accepted = bookings.filter((booking) => booking.status === 'accepted');

  const filtered = accepted.filter((booking) => {
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

  return filtered.slice().sort(sortByUpcomingDate);
}

function getMetricCards(workspace, fighters, publicFeed, outgoingRequests, incomingRequests, scheduleItems) {
  const openFighters = fighters.filter((fighter) => fighter.availability !== 'Booked solid').length;
  const uniqueCities = new Set(fighters.map((fighter) => fighter.city)).size;
  const pendingOutgoing = outgoingRequests.filter((booking) => booking.status === 'pending').length;
  const pendingIncoming = incomingRequests.filter((booking) => booking.status === 'pending').length;
  const confirmedOutgoing = outgoingRequests.filter((booking) => booking.status === 'accepted').length;
  const confirmedIncoming = incomingRequests.filter((booking) => booking.status === 'accepted').length;

  if (workspace === 'booker') {
    return [
      { label: 'Roster Reach', value: `${fighters.length} fighters` },
      { label: 'Pending Asks', value: `${pendingOutgoing}` },
      { label: 'Confirmed Cards', value: `${confirmedOutgoing}` },
      { label: 'Cities', value: `${uniqueCities}` },
    ];
  }

  if (workspace === 'fighter') {
    return [
      { label: 'Incoming Requests', value: `${pendingIncoming}` },
      { label: 'Confirmed Fights', value: `${confirmedIncoming}` },
      { label: 'Availability', value: fighters.find((fighter) => fighter.id === currentUser.fighterProfileId)?.availability || 'Open' },
      { label: 'Public Mentions', value: `${publicFeed.filter((booking) => booking.fighterId === currentUser.fighterProfileId).length}` },
    ];
  }

  if (workspace === 'public') {
    return [
      { label: 'Public Bookings', value: `${publicFeed.length}` },
      { label: 'Open Fighters', value: `${openFighters}` },
      { label: 'Cities', value: `${uniqueCities}` },
      { label: 'Next Cards', value: `${scheduleItems.length}` },
    ];
  }

  return [
    { label: 'Open Fighters', value: `${openFighters}` },
    { label: 'Outgoing', value: `${pendingOutgoing} pending` },
    { label: 'Incoming', value: `${pendingIncoming} pending` },
    { label: 'Confirmed', value: `${scheduleItems.length}` },
  ];
}

function getWorkspaceCopy(workspace) {
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

function getAvailabilityWindow(availability) {
  if (availability === 'Booked solid') {
    return 'Next opening in June 2026';
  }

  if (availability === 'Selective') {
    return 'Selective through late April 2026';
  }

  return 'Open May 1-31, 2026';
}

export default function FightBookApp() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const { width } = useWindowDimensions();
  const isWide = width >= 960;

  const fighterMap = buildFighterMap(state.fighters);
  const publicFeed = getPublicFeed(state.bookings);
  const outgoingRequests = getOutgoingRequests(state.bookings);
  const incomingRequests = getIncomingRequests(state.bookings);
  const scheduleItems = getScheduleItems(state.bookings, state.workspace);
  const metricCards = getMetricCards(
    state.workspace,
    state.fighters,
    publicFeed,
    outgoingRequests,
    incomingRequests,
    scheduleItems,
  );
  const selectedFighter =
    fighterMap[state.selectedFighterId] || state.fighters.find(Boolean) || null;
  const currentUserFighter = fighterMap[currentUser.fighterProfileId];
  const nextPublicEvent = publicFeed[0];
  const workspaceCopy = getWorkspaceCopy(state.workspace);
  const filteredFighters = state.fighters.filter((fighter) => {
    const query = state.searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return [fighter.name, fighter.discipline, fighter.city, fighter.style]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });

  useEffect(() => {
    if (!state.flash) {
      return undefined;
    }

    const timer = setTimeout(() => {
      dispatch({ type: 'DISMISS_FLASH' });
    }, 4200);

    return () => clearTimeout(timer);
  }, [state.flash]);

  function handleSubmitBooking() {
    const fighter = fighterMap[state.bookingComposer.fighterId];
    const eventName = state.bookingComposer.eventName.trim();
    const date = state.bookingComposer.date.trim();
    const location = state.bookingComposer.location.trim();
    const description = state.bookingComposer.description.trim();

    if (!fighter || !eventName || !date || !location || !description) {
      dispatch({
        type: 'SHOW_FLASH',
        payload: {
          tone: 'danger',
          title: 'Missing booking details',
          message: 'Event name, date, location, and description are required before a request can go out.',
        },
      });
      return;
    }

    const booking = {
      id: createId('booking'),
      clientUserId: currentUser.id,
      clientName: currentUser.promoterName,
      clientEmail: currentUser.email,
      fighterId: fighter.id,
      eventName,
      date,
      location,
      description,
      offeredPrice: state.bookingComposer.offeredPrice.trim() || fighter.priceFrom,
      status: 'pending',
      visibility: state.bookingComposer.visibility,
      createdAt: new Date().toISOString(),
    };

    dispatch({
      type: 'SUBMIT_BOOKING',
      payload: {
        booking,
        notification: {
          id: createId('note'),
          type: 'email',
          title: `Email queued to ${fighter.name}`,
          body: `${eventName} request for ${formatDateLong(date)} in ${location}.`,
          createdAt: new Date().toISOString(),
        },
        flash: {
          tone: 'success',
          title: 'Booking request sent',
          message: `${fighter.name} has been notified by email and the request is now in your queue.`,
        },
      },
    });
  }

  function handleAcceptBooking(bookingId) {
    const booking = state.bookings.find((item) => item.id === bookingId);
    const fighter = booking ? fighterMap[booking.fighterId] : null;

    if (!booking || !fighter || booking.status !== 'pending') {
      return;
    }

    const decisionAt = new Date().toISOString();

    dispatch({
      type: 'ACCEPT_BOOKING',
      payload: {
        bookingId,
        decisionAt,
        notification: {
          id: createId('note'),
          type: 'email',
          title: `Email delivered to ${booking.clientName}`,
          body: `${fighter.name} accepted ${booking.eventName} for ${formatDateLong(booking.date)}.`,
          createdAt: decisionAt,
        },
        flash: {
          tone: 'success',
          title: 'Request accepted',
          message:
            booking.visibility === 'public'
              ? 'The booking is confirmed, on the schedule, and visible in the public feed.'
              : 'The booking is confirmed and on the schedule, but it stays private.',
        },
      },
    });
  }

  function handleDeclineBooking(bookingId) {
    const booking = state.bookings.find((item) => item.id === bookingId);
    const fighter = booking ? fighterMap[booking.fighterId] : null;

    if (!booking || !fighter || booking.status !== 'pending') {
      return;
    }

    const decisionAt = new Date().toISOString();

    dispatch({
      type: 'DECLINE_BOOKING',
      payload: {
        bookingId,
        decisionAt,
        notification: {
          id: createId('note'),
          type: 'email',
          title: `Decline notice sent to ${booking.clientName}`,
          body: `${fighter.name} declined ${booking.eventName} for ${formatDateLong(booking.date)}.`,
          createdAt: decisionAt,
        },
        flash: {
          tone: 'danger',
          title: 'Request declined',
          message: 'The booker has been notified and the request has been archived as rejected.',
        },
      },
    });
  }

  function handleAvailabilityChange(nextAvailability) {
    const availabilityWindow = getAvailabilityWindow(nextAvailability);

    dispatch({
      type: 'UPDATE_AVAILABILITY',
      payload: {
        availability: nextAvailability,
        availabilityWindow,
        notification: {
          id: createId('note'),
          type: 'system',
          title: `Availability changed to ${nextAvailability}`,
          body: `Profile now reads "${nextAvailability}" with window "${availabilityWindow}".`,
          createdAt: new Date().toISOString(),
        },
        flash: {
          tone: 'success',
          title: 'Availability updated',
          message: `Your fighter profile now shows ${nextAvailability.toLowerCase()}.`,
        },
      },
    });
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <BackgroundGlow />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isWide ? styles.scrollContentWide : null]}
          showsVerticalScrollIndicator={false}
        >
          <SurfaceCard style={styles.heroCard}>
            <View style={[styles.heroLayout, isWide ? styles.heroLayoutWide : null]}>
              <View style={styles.heroContent}>
                <Text style={styles.eyebrow}>FightBook MVP</Text>
                <Text style={styles.heroTitle}>{workspaceCopy.title}</Text>
                <Text style={styles.heroBody}>{workspaceCopy.body}</Text>

                <View style={styles.pillRow}>
                  {workspaceOptions.map((option) => (
                    <Pill
                      key={option.key}
                      label={option.label}
                      active={state.workspace === option.key}
                      onPress={() => dispatch({ type: 'SET_WORKSPACE', payload: option.key })}
                    />
                  ))}
                </View>

                <View style={styles.identityRow}>
                  <IdentityChip label={currentUser.name} />
                  <IdentityChip label={currentUser.promoterName} />
                  <IdentityChip label="Booker + Fighter account" />
                </View>
              </View>

              <View style={styles.heroAside}>
                <Text style={styles.asideLabel}>Core loop</Text>
                <FlowStep
                  number="01"
                  title="Send the booking"
                  body="Clients lock in the fighter, date, offer, and whether the accepted bout should be public."
                />
                <FlowStep
                  number="02"
                  title="Notify by email"
                  body="The fighter gets an email trail immediately, which also lands in the profile activity log."
                />
                <FlowStep
                  number="03"
                  title="Publish accepted fights"
                  body="Once accepted, public bookings flow into the feed and all confirmed bookings hit the schedule."
                />
              </View>
            </View>
          </SurfaceCard>

          <View style={styles.tabRow}>
            {tabOptions.map((tab) => (
              <TabButton
                key={tab.key}
                label={tab.label}
                active={state.activeTab === tab.key}
                onPress={() => dispatch({ type: 'SET_TAB', payload: tab.key })}
              />
            ))}
          </View>

          {state.flash ? <FlashBanner flash={state.flash} /> : null}

          {state.activeTab === 'feed' ? (
            <FeedScreen
              isWide={isWide}
              metrics={metricCards}
              publicFeed={publicFeed}
              nextPublicEvent={nextPublicEvent}
              fighterMap={fighterMap}
            />
          ) : null}

          {state.activeTab === 'fighters' ? (
            <FightersScreen
              isWide={isWide}
              fighters={filteredFighters}
              selectedFighter={selectedFighter}
              bookingComposer={state.bookingComposer}
              searchQuery={state.searchQuery}
              onSearchChange={(value) =>
                dispatch({ type: 'SET_SEARCH_QUERY', payload: value })
              }
              onSelectFighter={(fighterId) => {
                dispatch({ type: 'SELECT_FIGHTER', payload: fighterId });
              }}
              onOpenBooking={(fighterId) =>
                dispatch({ type: 'OPEN_BOOKING_FORM', payload: fighterId })
              }
              onCloseBooking={() => dispatch({ type: 'CLOSE_BOOKING_FORM' })}
              onUpdateBookingField={(field, value) =>
                dispatch({ type: 'UPDATE_BOOKING_FIELD', payload: { field, value } })
              }
              onSubmitBooking={handleSubmitBooking}
            />
          ) : null}

          {state.activeTab === 'requests' ? (
            <RequestsScreen
              isWide={isWide}
              workspace={state.workspace}
              outgoingRequests={outgoingRequests}
              incomingRequests={incomingRequests}
              fighterMap={fighterMap}
              onAcceptBooking={handleAcceptBooking}
              onDeclineBooking={handleDeclineBooking}
            />
          ) : null}

          {state.activeTab === 'schedule' ? (
            <ScheduleScreen
              isWide={isWide}
              workspace={state.workspace}
              scheduleItems={scheduleItems}
              fighterMap={fighterMap}
              currentUserFighter={currentUserFighter}
              onAvailabilityChange={handleAvailabilityChange}
            />
          ) : null}

          {state.activeTab === 'profile' ? (
            <ProfileScreen
              isWide={isWide}
              currentUserFighter={currentUserFighter}
              notifications={state.notifications}
              bookings={state.bookings}
              onAvailabilityChange={handleAvailabilityChange}
            />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function FeedScreen({ fighterMap, isWide, metrics, nextPublicEvent, publicFeed }) {
  return (
    <View style={styles.screenStack}>
      <View style={[styles.splitRow, isWide ? styles.splitRowWide : null]}>
        <SurfaceCard style={[styles.growCard, isWide ? styles.primaryColumn : null]}>
          <SectionHeader
            title="Marketplace pulse"
            subtitle="A quick read on availability, volume, and what is already public."
          />
          <View style={styles.metricGrid}>
            {metrics.map((metric) => (
              <MetricTile key={metric.label} label={metric.label} value={metric.value} />
            ))}
          </View>
        </SurfaceCard>

        <SurfaceCard style={[styles.growCard, isWide ? styles.secondaryColumn : null]}>
          <SectionHeader
            title="Up next"
            subtitle="Earliest public booking currently on the board."
          />
          {nextPublicEvent ? (
            <View style={styles.highlightCard}>
              <Text style={styles.highlightDate}>{formatDateLong(nextPublicEvent.date)}</Text>
              <Text style={styles.highlightTitle}>{nextPublicEvent.eventName}</Text>
              <Text style={styles.highlightBody}>
                {fighterMap[nextPublicEvent.fighterId]?.name || 'Unknown fighter'} is booked for{' '}
                {nextPublicEvent.location}.
              </Text>
              <View style={styles.detailRow}>
                <MetaLine label="Booker" value={nextPublicEvent.clientName} />
                <MetaLine label="Offer" value={nextPublicEvent.offeredPrice} />
              </View>
            </View>
          ) : (
            <EmptyState
              title="No public events yet"
              body="As soon as a fighter accepts a public booking, it will show up here."
            />
          )}
        </SurfaceCard>
      </View>

      <SurfaceCard>
        <SectionHeader
          title="Public feed"
          subtitle="Accepted bookings with public visibility switch on."
        />
        <View style={styles.cardStack}>
          {publicFeed.map((booking) => (
            <FeedCard
              key={booking.id}
              booking={booking}
              fighter={fighterMap[booking.fighterId]}
            />
          ))}
        </View>
      </SurfaceCard>
    </View>
  );
}

function FightersScreen({
  bookingComposer,
  fighters,
  isWide,
  onCloseBooking,
  onOpenBooking,
  onSearchChange,
  onSelectFighter,
  onSubmitBooking,
  onUpdateBookingField,
  searchQuery,
  selectedFighter,
}) {
  return (
    <View style={styles.screenStack}>
      <SurfaceCard>
        <SectionHeader
          title="Discover fighters"
          subtitle="Search the roster by name, city, discipline, or fighting style."
        />

        <TextInput
          autoCapitalize="none"
          placeholder="Search fighters..."
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={searchQuery}
          onChangeText={onSearchChange}
        />

        {fighters.length ? (
          <View style={[styles.tileGrid, isWide ? styles.tileGridWide : null]}>
            {fighters.map((fighter) => (
              <FighterCard
                key={fighter.id}
                fighter={fighter}
                selected={selectedFighter?.id === fighter.id}
                onPress={() => onSelectFighter(fighter.id)}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No fighters matched that search"
            body="Try a city, a discipline, or a fighter style like chain wrestling or volume boxing."
          />
        )}
      </SurfaceCard>

      {selectedFighter ? (
        <SurfaceCard>
          <View style={[styles.splitRow, isWide ? styles.splitRowWide : null]}>
            <View style={[styles.growCard, isWide ? styles.primaryColumn : null]}>
              <SectionHeader
                title={selectedFighter.name}
                subtitle={selectedFighter.headline}
              />

              <View style={styles.identityRow}>
                <IdentityChip label={selectedFighter.discipline} />
                <IdentityChip label={selectedFighter.weightClass} />
                <IdentityChip label={selectedFighter.city} />
              </View>

              <View style={styles.metricGrid}>
                <MetricTile label="Record" value={selectedFighter.record} />
                <MetricTile label="From" value={selectedFighter.priceFrom} />
                <MetricTile label="Rating" value={selectedFighter.rating} />
                <MetricTile label="Reply time" value={selectedFighter.responseTime} />
              </View>

              <Text style={styles.bodyText}>{selectedFighter.bio}</Text>

              <View style={styles.cardStack}>
                {selectedFighter.achievements.map((achievement) => (
                  <InfoStrip key={achievement} label={achievement} />
                ))}
              </View>
            </View>

            <View style={[styles.growCard, isWide ? styles.secondaryColumn : null]}>
              <SectionHeader
                title="Availability"
                subtitle={selectedFighter.availabilityWindow}
              />
              <View style={styles.detailList}>
                <MetaLine label="Current status" value={selectedFighter.availability} />
                <MetaLine label="Style" value={selectedFighter.style} />
                <MetaLine label="Contact" value={selectedFighter.email} />
              </View>

              {selectedFighter.id === currentUser.fighterProfileId ? (
                <Text style={styles.noteText}>
                  This is your fighter profile. Use Schedule or Profile to update availability.
                </Text>
              ) : (
                <AppButton
                  label="Create booking request"
                  onPress={() => onOpenBooking(selectedFighter.id)}
                />
              )}
            </View>
          </View>
        </SurfaceCard>
      ) : null}

      {bookingComposer.visible ? (
        <SurfaceCard>
          <SectionHeader
            title="Booking request"
            subtitle="This is the booker flow: compose the request and send the fighter an email notice."
          />

          <View style={styles.formGrid}>
            <FieldBlock label="Event name">
              <TextInput
                placeholder="Savanna Ring 21"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={bookingComposer.eventName}
                onChangeText={(value) => onUpdateBookingField('eventName', value)}
              />
            </FieldBlock>

            <FieldBlock label="Fight date">
              <TextInput
                placeholder="2026-05-15"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={bookingComposer.date}
                onChangeText={(value) => onUpdateBookingField('date', value)}
              />
            </FieldBlock>

            <FieldBlock label="Location">
              <TextInput
                placeholder="Kigali Convention Centre"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={bookingComposer.location}
                onChangeText={(value) => onUpdateBookingField('location', value)}
              />
            </FieldBlock>

            <FieldBlock label="Offer">
              <TextInput
                placeholder="$2,000"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={bookingComposer.offeredPrice}
                onChangeText={(value) => onUpdateBookingField('offeredPrice', value)}
              />
            </FieldBlock>
          </View>

          <FieldBlock label="Description">
            <TextInput
              multiline
              numberOfLines={4}
              placeholder="Describe the matchup, travel support, and anything the fighter should know."
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.multilineInput]}
              value={bookingComposer.description}
              onChangeText={(value) => onUpdateBookingField('description', value)}
            />
          </FieldBlock>

          <FieldBlock label="Visibility if accepted">
            <View style={styles.pillRow}>
              {['public', 'private'].map((visibility) => (
                <Pill
                  key={visibility}
                  label={visibility === 'public' ? 'Public feed' : 'Private only'}
                  active={bookingComposer.visibility === visibility}
                  onPress={() => onUpdateBookingField('visibility', visibility)}
                />
              ))}
            </View>
          </FieldBlock>

          <View style={styles.actionRow}>
            <AppButton label="Send request" onPress={onSubmitBooking} />
            <AppButton label="Cancel" onPress={onCloseBooking} tone="secondary" />
          </View>
        </SurfaceCard>
      ) : null}
    </View>
  );
}

function RequestsScreen({
  fighterMap,
  incomingRequests,
  isWide,
  onAcceptBooking,
  onDeclineBooking,
  outgoingRequests,
  workspace,
}) {
  if (workspace === 'public') {
    return (
      <SurfaceCard>
        <EmptyState
          title="Public mode hides private request queues"
          body="Switch to Booker or Fighter mode to manage inbound and outbound booking requests."
        />
      </SurfaceCard>
    );
  }

  const showOutgoing = workspace === 'booker' || workspace === 'both';
  const showIncoming = workspace === 'fighter' || workspace === 'both';

  return (
    <View style={[styles.splitRow, isWide ? styles.splitRowWide : null]}>
      {showOutgoing ? (
        <SurfaceCard style={[styles.growCard, isWide ? styles.primaryColumn : null]}>
          <SectionHeader
            title="Outgoing requests"
            subtitle="Everything your booker profile has sent out so far."
          />
          {outgoingRequests.length ? (
            <View style={styles.cardStack}>
              {outgoingRequests.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  fighter={fighterMap[booking.fighterId]}
                  mode="outgoing"
                />
              ))}
            </View>
          ) : (
            <EmptyState
              title="No outgoing requests yet"
              body="Head to Fighters, pick a profile, and send your first booking request."
            />
          )}
        </SurfaceCard>
      ) : null}

      {showIncoming ? (
        <SurfaceCard style={[styles.growCard, isWide ? styles.secondaryColumn : null]}>
          <SectionHeader
            title="Incoming requests"
            subtitle="Fighter-side offers that are waiting on a yes or no."
          />
          {incomingRequests.length ? (
            <View style={styles.cardStack}>
              {incomingRequests.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  fighter={fighterMap[booking.fighterId]}
                  mode="incoming"
                  onAccept={() => onAcceptBooking(booking.id)}
                  onDecline={() => onDeclineBooking(booking.id)}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              title="No incoming requests"
              body="Once promoters send you offers, they will appear here with accept and decline actions."
            />
          )}
        </SurfaceCard>
      ) : null}
    </View>
  );
}

function ScheduleScreen({
  currentUserFighter,
  fighterMap,
  isWide,
  onAvailabilityChange,
  scheduleItems,
  workspace,
}) {
  return (
    <View style={[styles.splitRow, isWide ? styles.splitRowWide : null]}>
      <SurfaceCard style={[styles.growCard, isWide ? styles.primaryColumn : null]}>
        <SectionHeader
          title="Confirmed schedule"
          subtitle={
            workspace === 'public'
              ? 'Publicly visible bookings sorted by event date.'
              : 'Accepted bouts and events that matter to the current workspace.'
          }
        />

        {scheduleItems.length ? (
          <View style={styles.cardStack}>
            {scheduleItems.map((booking) => (
              <ScheduleCard
                key={booking.id}
                booking={booking}
                fighter={fighterMap[booking.fighterId]}
                workspace={workspace}
              />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No confirmed events"
            body="Accepted bookings will land here automatically once the fighter says yes."
          />
        )}
      </SurfaceCard>

      {workspace !== 'public' && currentUserFighter ? (
        <SurfaceCard style={[styles.growCard, isWide ? styles.secondaryColumn : null]}>
          <SectionHeader
            title="Availability control"
            subtitle="Quick profile update for the fighter side of the marketplace."
          />

          <View style={styles.detailList}>
            <MetaLine label="Current status" value={currentUserFighter.availability} />
            <MetaLine label="Window" value={currentUserFighter.availabilityWindow} />
          </View>

          <View style={styles.cardStack}>
            {['Open in May', 'Selective', 'Booked solid'].map((option) => (
              <AppButton
                key={option}
                label={option}
                onPress={() => onAvailabilityChange(option)}
                tone={currentUserFighter.availability === option ? 'success' : 'secondary'}
              />
            ))}
          </View>
        </SurfaceCard>
      ) : null}
    </View>
  );
}

function ProfileScreen({ bookings, currentUserFighter, isWide, notifications, onAvailabilityChange }) {
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
    .sort((a, b) => toDateValue(b.createdAt) - toDateValue(a.createdAt));

  return (
    <View style={styles.screenStack}>
      <View style={[styles.splitRow, isWide ? styles.splitRowWide : null]}>
        <SurfaceCard style={[styles.growCard, isWide ? styles.primaryColumn : null]}>
          <SectionHeader
            title="Account"
            subtitle="One profile can book talent and manage a fighter career."
          />

          <View style={styles.metricGrid}>
            <MetricTile label="Name" value={currentUser.name} />
            <MetricTile label="Company" value={currentUser.promoterName} />
            <MetricTile label="Email" value={currentUser.email} />
            <MetricTile label="City" value={currentUser.city} />
          </View>
        </SurfaceCard>

        {currentUserFighter ? (
          <SurfaceCard style={[styles.growCard, isWide ? styles.secondaryColumn : null]}>
            <SectionHeader
              title="Fighter profile"
              subtitle={currentUserFighter.headline}
            />

            <View style={styles.metricGrid}>
              <MetricTile label="Record" value={currentUserFighter.record} />
              <MetricTile label="Availability" value={currentUserFighter.availability} />
              <MetricTile label="Confirmed" value={`${confirmedFights}`} />
              <MetricTile label="Public feed" value={`${publicAppearances}`} />
            </View>

            <View style={styles.actionRow}>
              <AppButton label="Open in May" onPress={() => onAvailabilityChange('Open in May')} tone="secondary" />
              <AppButton label="Selective" onPress={() => onAvailabilityChange('Selective')} tone="secondary" />
            </View>
          </SurfaceCard>
        ) : null}
      </View>

      <SurfaceCard>
        <SectionHeader
          title="Activity log"
          subtitle="A simple trail of the email notices and system events triggered by booking actions."
        />

        <View style={styles.cardStack}>
          {sortedNotifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </View>
      </SurfaceCard>
    </View>
  );
}

function SurfaceCard({ children, style }) {
  return <View style={[styles.surfaceCard, style]}>{children}</View>;
}

function SectionHeader({ subtitle, title }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

function FlowStep({ body, number, title }) {
  return (
    <View style={styles.flowStep}>
      <Text style={styles.flowNumber}>{number}</Text>
      <View style={styles.flowContent}>
        <Text style={styles.flowTitle}>{title}</Text>
        <Text style={styles.flowBody}>{body}</Text>
      </View>
    </View>
  );
}

function Pill({ active, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active ? styles.pillActive : null,
        pressed ? styles.pillPressed : null,
      ]}
    >
      <Text style={[styles.pillLabel, active ? styles.pillLabelActive : null]}>{label}</Text>
    </Pressable>
  );
}

function TabButton({ active, label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabButton,
        active ? styles.tabButtonActive : null,
        pressed ? styles.pillPressed : null,
      ]}
    >
      <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>{label}</Text>
    </Pressable>
  );
}

function IdentityChip({ label }) {
  return (
    <View style={styles.identityChip}>
      <Text style={styles.identityChipLabel}>{label}</Text>
    </View>
  );
}

function MetricTile({ label, value }) {
  return (
    <View style={styles.metricTile}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function FeedCard({ booking, fighter }) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.itemEyebrow}>{formatDateShort(booking.date)}</Text>
          <Text style={styles.itemTitle}>{booking.eventName}</Text>
        </View>
        <StatusBadge status="accepted" />
      </View>

      <Text style={styles.bodyText}>
        {fighter?.name || 'Unknown fighter'} was confirmed for {booking.location}.
      </Text>

      <View style={styles.detailList}>
        <MetaLine label="Booker" value={booking.clientName} />
        <MetaLine label="Offer" value={booking.offeredPrice} />
        <MetaLine label="Visibility" value={booking.visibility} />
      </View>
    </View>
  );
}

function FighterCard({ fighter, onPress, selected }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.fighterCard,
        selected ? styles.fighterCardSelected : null,
        pressed ? styles.pillPressed : null,
      ]}
    >
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarLabel}>{fighter.imageSeed}</Text>
      </View>

      <Text style={styles.itemTitle}>{fighter.name}</Text>
      <Text style={styles.itemEyebrow}>
        {fighter.discipline} · {fighter.weightClass}
      </Text>
      <Text style={styles.bodyText}>{fighter.city}</Text>

      <View style={styles.detailList}>
        <MetaLine label="Record" value={fighter.record} />
        <MetaLine label="From" value={fighter.priceFrom} />
        <MetaLine label="Status" value={fighter.availability} />
      </View>
    </Pressable>
  );
}

function BookingCard({ booking, fighter, mode, onAccept, onDecline }) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardTitleWrap}>
          <Text style={styles.itemEyebrow}>{booking.eventName}</Text>
          <Text style={styles.itemTitle}>
            {mode === 'incoming' ? booking.clientName : fighter?.name || 'Unknown fighter'}
          </Text>
        </View>
        <StatusBadge status={booking.status} />
      </View>

      <Text style={styles.bodyText}>{booking.description}</Text>

      <View style={styles.detailList}>
        <MetaLine label="Date" value={formatDateLong(booking.date)} />
        <MetaLine label="Location" value={booking.location} />
        <MetaLine label="Offer" value={booking.offeredPrice} />
        <MetaLine label="Visibility" value={booking.visibility} />
      </View>

      <Text style={styles.captionText}>
        {booking.decisionAt
          ? `Updated ${formatDateWithTime(booking.decisionAt)}`
          : `Requested ${formatDateWithTime(booking.createdAt)}`}
      </Text>

      {mode === 'incoming' && booking.status === 'pending' ? (
        <View style={styles.actionRow}>
          <AppButton label="Accept" onPress={onAccept} tone="success" />
          <AppButton label="Decline" onPress={onDecline} tone="danger" />
        </View>
      ) : null}
    </View>
  );
}

function ScheduleCard({ booking, fighter, workspace }) {
  const roleLabel =
    workspace === 'booker'
      ? 'Booked by you'
      : workspace === 'fighter'
        ? 'You are fighting'
        : workspace === 'public'
          ? 'Public listing'
          : booking.fighterId === currentUser.fighterProfileId
            ? 'You are fighting'
            : 'Booked by you';

  return (
    <View style={styles.scheduleCard}>
      <View style={styles.dateBadge}>
        <Text style={styles.dateBadgeMonth}>
          {monthName(new Date(`${booking.date}T12:00:00Z`)).toUpperCase()}
        </Text>
        <Text style={styles.dateBadgeDay}>{new Date(`${booking.date}T12:00:00Z`).getUTCDate()}</Text>
      </View>

      <View style={styles.scheduleContent}>
        <Text style={styles.itemTitle}>{booking.eventName}</Text>
        <Text style={styles.itemEyebrow}>{fighter?.name || 'Unknown fighter'}</Text>
        <Text style={styles.bodyText}>{booking.location}</Text>
        <Text style={styles.captionText}>
          {roleLabel} · {booking.visibility === 'public' ? 'Public feed on' : 'Private'}
        </Text>
      </View>
    </View>
  );
}

function NotificationCard({ notification }) {
  return (
    <View style={styles.notificationCard}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.itemTitle}>{notification.title}</Text>
        <View
          style={[
            styles.notificationDot,
            notification.type === 'email' ? styles.notificationDotEmail : styles.notificationDotSystem,
          ]}
        />
      </View>
      <Text style={styles.bodyText}>{notification.body}</Text>
      <Text style={styles.captionText}>{formatDateWithTime(notification.createdAt)}</Text>
    </View>
  );
}

function AppButton({ label, onPress, tone = 'primary' }) {
  const toneStyle =
    tone === 'secondary'
      ? styles.buttonSecondary
      : tone === 'success'
        ? styles.buttonSuccess
        : tone === 'danger'
          ? styles.buttonDanger
          : styles.buttonPrimary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.buttonBase, toneStyle, pressed ? styles.pillPressed : null]}
    >
      <Text style={styles.buttonLabel}>{label}</Text>
    </Pressable>
  );
}

function StatusBadge({ status }) {
  const badgeStyle =
    status === 'accepted'
      ? styles.statusAccepted
      : status === 'rejected'
        ? styles.statusRejected
        : styles.statusPending;

  return (
    <View style={[styles.statusBadge, badgeStyle]}>
      <Text style={styles.statusLabel}>{status}</Text>
    </View>
  );
}

function EmptyState({ body, title }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

function FieldBlock({ children, label }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function MetaLine({ label, value }) {
  return (
    <View style={styles.metaLine}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function InfoStrip({ label }) {
  return (
    <View style={styles.infoStrip}>
      <Text style={styles.infoStripLabel}>{label}</Text>
    </View>
  );
}

function FlashBanner({ flash }) {
  const toneStyle =
    flash.tone === 'danger'
      ? styles.flashDanger
      : flash.tone === 'success'
        ? styles.flashSuccess
        : styles.flashNeutral;

  return (
    <View style={[styles.flashBanner, toneStyle]}>
      <Text style={styles.flashTitle}>{flash.title}</Text>
      <Text style={styles.flashBody}>{flash.message}</Text>
    </View>
  );
}

function BackgroundGlow() {
  return (
    <View pointerEvents="none" style={styles.glowWrap}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <View style={styles.glowThree} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safeArea: {
    flex: 1,
  },
  glowWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  glowOne: {
    position: 'absolute',
    top: -90,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 280,
    backgroundColor: 'rgba(255, 122, 47, 0.18)',
  },
  glowTwo: {
    position: 'absolute',
    top: 260,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: 'rgba(112, 182, 255, 0.12)',
  },
  glowThree: {
    position: 'absolute',
    bottom: -100,
    left: '28%',
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(242, 195, 107, 0.08)',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  scrollContentWide: {
    paddingHorizontal: spacing.xxl,
  },
  surfaceCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...surfaceShadow,
  },
  heroCard: {
    padding: spacing.xl,
  },
  heroLayout: {
    gap: spacing.lg,
  },
  heroLayoutWide: {
    flexDirection: 'row',
  },
  heroContent: {
    flex: 1.4,
    gap: spacing.md,
  },
  heroAside: {
    flex: 1,
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  eyebrow: {
    color: colors.accentSoft,
    fontFamily: fonts.body,
    fontSize: 14,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 42,
    lineHeight: 48,
  },
  heroBody: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 25,
    maxWidth: 680,
  },
  asideLabel: {
    color: colors.highlight,
    fontFamily: fonts.body,
    fontSize: 13,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  flowStep: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    paddingVertical: spacing.xs,
  },
  flowNumber: {
    color: colors.accent,
    fontFamily: fonts.mono,
    fontSize: 13,
    marginTop: 2,
  },
  flowContent: {
    flex: 1,
    gap: 4,
  },
  flowTitle: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '700',
  },
  flowBody: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
  },
  pillActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pillPressed: {
    opacity: 0.82,
  },
  pillLabel: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
  },
  pillLabelActive: {
    color: colors.bg,
  },
  identityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  identityChip: {
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  identityChipLabel: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tabButton: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255, 122, 47, 0.18)',
    borderColor: 'rgba(255, 122, 47, 0.45)',
  },
  tabLabel: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.text,
  },
  flashBanner: {
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    gap: 4,
  },
  flashNeutral: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  flashSuccess: {
    backgroundColor: 'rgba(108, 197, 138, 0.12)',
    borderColor: 'rgba(108, 197, 138, 0.45)',
  },
  flashDanger: {
    backgroundColor: 'rgba(255, 123, 123, 0.12)',
    borderColor: 'rgba(255, 123, 123, 0.45)',
  },
  flashTitle: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '700',
  },
  flashBody: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  screenStack: {
    gap: spacing.lg,
  },
  splitRow: {
    gap: spacing.lg,
  },
  splitRowWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  growCard: {
    flex: 1,
  },
  primaryColumn: {
    flex: 1.35,
  },
  secondaryColumn: {
    flex: 0.95,
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
  },
  sectionSubtitle: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricTile: {
    minWidth: 150,
    flexGrow: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  metricValue: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 28,
  },
  metricLabel: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  highlightCard: {
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 122, 47, 0.08)',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 47, 0.28)',
    gap: spacing.sm,
  },
  highlightDate: {
    color: colors.highlight,
    fontFamily: fonts.body,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
  },
  highlightTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 26,
  },
  highlightBody: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cardStack: {
    gap: spacing.md,
  },
  itemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  cardTitleWrap: {
    flex: 1,
    gap: 4,
  },
  itemEyebrow: {
    color: colors.accentSoft,
    fontFamily: fonts.body,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  itemTitle: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  bodyText: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  captionText: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
  },
  detailList: {
    gap: spacing.xs,
  },
  metaLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  metaLabel: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 13,
  },
  metaValue: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  tileGrid: {
    gap: spacing.md,
  },
  tileGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fighterCard: {
    minWidth: 240,
    flexGrow: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  fighterCardSelected: {
    borderColor: 'rgba(255, 122, 47, 0.45)',
    backgroundColor: 'rgba(255, 122, 47, 0.08)',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 122, 47, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 47, 0.4)',
  },
  avatarLabel: {
    color: colors.accentSoft,
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: '700',
  },
  noteText: {
    color: colors.highlight,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  formGrid: {
    gap: spacing.md,
  },
  fieldBlock: {
    gap: spacing.xs,
  },
  fieldLabel: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  multilineInput: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  buttonBase: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderWidth: 1,
    minWidth: 132,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  buttonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: colors.border,
  },
  buttonSuccess: {
    backgroundColor: 'rgba(108, 197, 138, 0.18)',
    borderColor: 'rgba(108, 197, 138, 0.45)',
  },
  buttonDanger: {
    backgroundColor: 'rgba(255, 123, 123, 0.18)',
    borderColor: 'rgba(255, 123, 123, 0.45)',
  },
  buttonLabel: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
  },
  statusPending: {
    backgroundColor: 'rgba(242, 195, 107, 0.12)',
    borderColor: 'rgba(242, 195, 107, 0.36)',
  },
  statusAccepted: {
    backgroundColor: 'rgba(108, 197, 138, 0.12)',
    borderColor: 'rgba(108, 197, 138, 0.36)',
  },
  statusRejected: {
    backgroundColor: 'rgba(255, 123, 123, 0.12)',
    borderColor: 'rgba(255, 123, 123, 0.36)',
  },
  statusLabel: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyState: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyBody: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  infoStrip: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoStripLabel: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
  },
  scheduleCard: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  dateBadge: {
    width: 70,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 122, 47, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 47, 0.3)',
  },
  dateBadgeMonth: {
    color: colors.accentSoft,
    fontFamily: fonts.body,
    fontSize: 12,
    letterSpacing: 1.1,
  },
  dateBadgeDay: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 32,
  },
  scheduleContent: {
    flex: 1,
    gap: 4,
  },
  notificationCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    gap: spacing.xs,
  },
  notificationDot: {
    width: 12,
    height: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  notificationDotEmail: {
    backgroundColor: colors.info,
  },
  notificationDotSystem: {
    backgroundColor: colors.highlight,
  },
});

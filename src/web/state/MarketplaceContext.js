import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  currentUser,
  initialBookings,
  initialFighters,
  initialNotifications,
} from '../../data/mockData';
import { formatDateLong } from '../../utils/date';
import {
  buildFighterMap,
  getAvailabilityWindow,
  getDefaultFighterId,
  getIncomingRequests,
  getMetricCards,
  getOutgoingRequests,
  getPublicFeed,
  getScheduleItems,
  getWorkspaceCopy,
} from './selectors';

const MarketplaceContext = createContext(null);

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createBookingDraft(fighter) {
  return {
    fighterId: fighter?.id || null,
    eventName: '',
    date: '2026-05-15',
    location: currentUser.city,
    description: '',
    offeredPrice: fighter?.priceFrom || '',
    visibility: 'public',
  };
}

function normalizeWorkspace(mode) {
  return ['both', 'booker', 'fighter', 'public'].includes(mode) ? mode : 'both';
}

export function MarketplaceProvider({ buildHash, children, navigate, route }) {
  const [fighters, setFighters] = useState(initialFighters);
  const [bookings, setBookings] = useState(initialBookings);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [flash, setFlash] = useState(null);

  const defaultFighterId = getDefaultFighterId(fighters, currentUser.fighterProfileId);
  const fighterMap = buildFighterMap(fighters);
  const workspace = normalizeWorkspace(route.params.mode);
  const selectedFighterId = route.page === 'fighters'
    ? route.params.fighter || defaultFighterId
    : defaultFighterId;
  const selectedFighter = fighterMap[selectedFighterId] || null;
  const currentUserFighter = fighterMap[currentUser.fighterProfileId] || null;
  const composerVisible =
    route.page === 'fighters' && route.params.compose === '1' && workspace === 'booker';

  const [bookingDraft, setBookingDraft] = useState(() =>
    createBookingDraft(fighterMap[defaultFighterId] || fighters[0]),
  );

  useEffect(() => {
    if (!flash) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setFlash(null);
    }, 4200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [flash]);

  useEffect(() => {
    if (!composerVisible || !selectedFighter) {
      return;
    }

    if (bookingDraft.fighterId !== selectedFighter.id) {
      setBookingDraft(createBookingDraft(selectedFighter));
    }
  }, [bookingDraft.fighterId, composerVisible, selectedFighter]);

  const publicFeed = getPublicFeed(bookings);
  const outgoingRequests = getOutgoingRequests(bookings, currentUser.id);
  const incomingRequests = getIncomingRequests(bookings, currentUser.fighterProfileId);
  const pendingIncomingCount = incomingRequests.filter((booking) => booking.status === 'pending').length;
  const scheduleItems = getScheduleItems(bookings, workspace, currentUser);
  const metrics = getMetricCards({
    workspace,
    fighters,
    publicFeed,
    outgoingRequests,
    incomingRequests,
    scheduleItems,
    fighterProfileId: currentUser.fighterProfileId,
  });
  const workspaceCopy = getWorkspaceCopy(workspace);
  const nextPublicEvent = publicFeed[0] || null;

  function getPageParams(page, overrides = {}) {
    const nextParams = {
      mode: overrides.mode || workspace,
      ...overrides,
    };

    if (page === 'fighters') {
      nextParams.fighter = overrides.fighter || selectedFighterId || defaultFighterId;
      if (!(nextParams.mode === 'booker' && overrides.compose === '1')) {
        delete nextParams.compose;
      }
    } else {
      delete nextParams.fighter;
      delete nextParams.compose;
    }

    return nextParams;
  }

  function hrefForPage(page, overrides = {}) {
    return buildHash(page, getPageParams(page, overrides));
  }

  function hrefForWorkspace(nextWorkspace) {
    const overrides = { mode: nextWorkspace };

    if (route.page === 'fighters' && composerVisible && nextWorkspace === 'booker') {
      overrides.compose = '1';
    }

    return buildHash(route.page, getPageParams(route.page, overrides));
  }

  function navigateToPage(page, overrides = {}) {
    navigate(page, getPageParams(page, overrides));
  }

  function setWorkspace(nextWorkspace) {
    navigate(route.page, getPageParams(route.page, { mode: nextWorkspace }));
  }

  function selectFighter(fighterId) {
    navigate('fighters', getPageParams('fighters', { fighter: fighterId }));
  }

  function openComposer(fighterId) {
    const fighter = fighterMap[fighterId];
    setBookingDraft(createBookingDraft(fighter));
    navigate('fighters', getPageParams('fighters', {
      mode: 'booker',
      fighter: fighterId,
      compose: '1',
    }));
  }

  function closeComposer() {
    navigate('fighters', getPageParams('fighters', { fighter: selectedFighterId }));
  }

  function updateBookingDraft(field, value) {
    setBookingDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  }

  function submitBooking() {
    const fighter = fighterMap[bookingDraft.fighterId];
    const eventName = bookingDraft.eventName.trim();
    const date = bookingDraft.date.trim();
    const location = bookingDraft.location.trim();
    const description = bookingDraft.description.trim();

    if (!fighter || !eventName || !date || !location || !description) {
      setFlash({
        tone: 'danger',
        title: 'Missing booking details',
        message:
          'Event name, date, location, and description are required before a request can go out.',
      });
      return;
    }

    const now = new Date().toISOString();
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
      offeredPrice: bookingDraft.offeredPrice.trim() || fighter.priceFrom,
      status: 'pending',
      visibility: bookingDraft.visibility,
      createdAt: now,
    };

    setBookings((currentBookings) => [booking, ...currentBookings]);
    setNotifications((currentNotifications) => [
      {
        id: createId('note'),
        type: 'email',
        title: `Email queued to ${fighter.name}`,
        body: `${eventName} request for ${formatDateLong(date)} in ${location}.`,
        createdAt: now,
      },
      ...currentNotifications,
    ]);
    setFlash({
      tone: 'success',
      title: 'Booking request sent',
      message: `${fighter.name} has been notified by email and the request is now in your queue.`,
    });
    setBookingDraft(createBookingDraft(fighter));
    navigate('requests', { mode: 'booker' });
  }

  function acceptBooking(bookingId) {
    const booking = bookings.find((item) => item.id === bookingId);
    const fighter = booking ? fighterMap[booking.fighterId] : null;

    if (!booking || !fighter || booking.status !== 'pending') {
      return;
    }

    const decisionAt = new Date().toISOString();

    setBookings((currentBookings) =>
      currentBookings.map((item) =>
        item.id === bookingId
          ? {
              ...item,
              status: 'accepted',
              decisionAt,
            }
          : item,
      ),
    );
    setNotifications((currentNotifications) => [
      {
        id: createId('note'),
        type: 'email',
        title: `Email delivered to ${booking.clientName}`,
        body: `${fighter.name} accepted ${booking.eventName} for ${formatDateLong(booking.date)}.`,
        createdAt: decisionAt,
      },
      ...currentNotifications,
    ]);
    setFlash({
      tone: 'success',
      title: 'Request accepted',
      message:
        booking.visibility === 'public'
          ? 'The booking is confirmed, on the schedule, and visible in the public feed.'
          : 'The booking is confirmed and on the schedule, but it stays private.',
    });
    navigate('schedule', { mode: 'fighter' });
  }

  function declineBooking(bookingId) {
    const booking = bookings.find((item) => item.id === bookingId);
    const fighter = booking ? fighterMap[booking.fighterId] : null;

    if (!booking || !fighter || booking.status !== 'pending') {
      return;
    }

    const decisionAt = new Date().toISOString();

    setBookings((currentBookings) =>
      currentBookings.map((item) =>
        item.id === bookingId
          ? {
              ...item,
              status: 'rejected',
              decisionAt,
            }
          : item,
      ),
    );
    setNotifications((currentNotifications) => [
      {
        id: createId('note'),
        type: 'email',
        title: `Decline notice sent to ${booking.clientName}`,
        body: `${fighter.name} declined ${booking.eventName} for ${formatDateLong(booking.date)}.`,
        createdAt: decisionAt,
      },
      ...currentNotifications,
    ]);
    setFlash({
      tone: 'danger',
      title: 'Request declined',
      message: 'The booker has been notified and the request has been archived as rejected.',
    });
  }

  function updateAvailability(nextAvailability) {
    const availabilityWindow = getAvailabilityWindow(nextAvailability);
    const timestamp = new Date().toISOString();

    setFighters((currentFighters) =>
      currentFighters.map((fighter) =>
        fighter.id === currentUser.fighterProfileId
          ? {
              ...fighter,
              availability: nextAvailability,
              availabilityWindow,
            }
          : fighter,
      ),
    );
    setNotifications((currentNotifications) => [
      {
        id: createId('note'),
        type: 'system',
        title: `Availability changed to ${nextAvailability}`,
        body: `Profile now reads "${nextAvailability}" with window "${availabilityWindow}".`,
        createdAt: timestamp,
      },
      ...currentNotifications,
    ]);
    setFlash({
      tone: 'success',
      title: 'Availability updated',
      message: `Your fighter profile now shows ${nextAvailability.toLowerCase()}.`,
    });
  }

  return (
    <MarketplaceContext.Provider
      value={{
        activePage: route.page,
        acceptBooking,
        bookings,
        bookingDraft,
        closeComposer,
        composerVisible,
        currentUser,
        currentUserFighter,
        declineBooking,
        fighters,
        fighterMap,
        flash,
        hrefForPage,
        hrefForWorkspace,
        incomingRequests,
        metrics,
        navigateToPage,
        nextPublicEvent,
        notifications,
        openComposer,
        outgoingRequests,
        pendingIncomingCount,
        publicFeed,
        scheduleItems,
        selectFighter,
        selectedFighter,
        selectedFighterId,
        setWorkspace,
        submitBooking,
        updateAvailability,
        updateBookingDraft,
        workspace,
        workspaceCopy,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);

  if (!context) {
    throw new Error('useMarketplace must be used inside MarketplaceProvider');
  }

  return context;
}

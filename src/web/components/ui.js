import React from 'react';

export function cx(...tokens) {
  return tokens.filter(Boolean).join(' ');
}

function getStatusTone(status) {
  if (status === 'accepted') {
    return 'ba';
  }

  if (status === 'rejected') {
    return 'br';
  }

  return 'bp';
}

function getAvailabilityTone(availability) {
  if (availability === 'Open in May') {
    return 'ao';
  }

  if (availability === 'Selective') {
    return 'as';
  }

  return 'ab';
}

export function MetricTile({ label, tone = '', value }) {
  const normalizedValue = String(value ?? '');
  const compactStyle =
    normalizedValue.length > 9
      ? { fontSize: '16px' }
      : normalizedValue.length > 5
        ? { fontSize: '18px' }
        : undefined;

  return (
    <div className={cx('m', tone)}>
      <div className="mv" style={compactStyle}>
        {normalizedValue}
      </div>
      <div className="ml">{label}</div>
    </div>
  );
}

export function Divider({ label }) {
  return (
    <div className="sdiv">
      <span>{label}</span>
    </div>
  );
}

export function StatusBadge({ status }) {
  return <span className={cx('bdg', getStatusTone(status))}>{String(status).toUpperCase()}</span>;
}

export function Badge({ className = '', children }) {
  return <span className={cx('bdg', className)}>{children}</span>;
}

export function AvailabilityBadge({ availability }) {
  return <span className={cx('fav-s', getAvailabilityTone(availability))}>{availability}</span>;
}

export function Button({
  children,
  fullWidth = false,
  onClick,
  size = 'md',
  tone = 'fire',
  type = 'button',
}) {
  const toneClass = {
    fire: 'bfire',
    outline: 'bout',
    accept: 'bacc',
    decline: 'bdec',
  }[tone] || 'bout';

  return (
    <button
      className={cx('btn', toneClass, size === 'sm' && 'bsm', fullWidth && 'bfull')}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

export function SearchInput({ onChange, placeholder, value }) {
  return (
    <div className="swrap">
      <svg
        aria-hidden="true"
        fill="none"
        height="15"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="15"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        autoComplete="off"
        className="sinp"
        onChange={onChange}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </div>
  );
}

export function EmptyState({ body, icon = '📋', title }) {
  return (
    <div className="emp">
      <div className="ei">{icon}</div>
      <div className="et">{title}</div>
      <div className="eb">{body}</div>
    </div>
  );
}

export function FlashBanner({ flash }) {
  const stateClass = !flash ? 'hid' : flash.tone === 'success' ? 'suc' : 'err';

  return (
    <div className={stateClass} id="flash">
      <div className="ft">{flash?.title || ''}</div>
      <div className="fm">{flash?.message || ''}</div>
    </div>
  );
}

export function MetaRows({ items }) {
  return (
    <div className="imeta">
      {items.map((item) => (
        <div className="mr" key={`${item.label}-${item.value}`}>
          <span className="mk">{item.label}</span>
          <span className={cx('mv2', item.valueClassName)}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function Tag({ children }) {
  return <span className="tag">{children}</span>;
}

export function LoadingState({ body, title }) {
  return (
    <div className="card">
      <div className="cb">
        <EmptyState body={body} icon="…" title={title} />
      </div>
    </div>
  );
}

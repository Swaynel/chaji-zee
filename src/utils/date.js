const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const longMonths = [
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

export function toDateValue(value) {
  if (!value) {
    return 0;
  }

  const normalized = value.includes('T') ? value : `${value}T12:00:00Z`;
  return new Date(normalized).getTime();
}

export function monthName(date, variant = 'short') {
  return variant === 'long' ? longMonths[date.getUTCMonth()] : shortMonths[date.getUTCMonth()];
}

export function formatDateShort(value) {
  const date = new Date(value.includes('T') ? value : `${value}T12:00:00Z`);
  return `${monthName(date)} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

export function formatDateLong(value) {
  const date = new Date(value.includes('T') ? value : `${value}T12:00:00Z`);
  return `${monthName(date, 'long')} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

export function formatDateTime(value) {
  const date = new Date(value);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const normalizedHour = hours % 12 || 12;

  return `${monthName(date, 'long')} ${date.getUTCDate()}, ${date.getUTCFullYear()} · ${normalizedHour}:${minutes} ${suffix}`;
}

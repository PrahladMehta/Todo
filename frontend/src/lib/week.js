import {
  addDays,
  addWeeks,
  endOfDay,
  format,
  isSameDay,
  isToday,
  parseISO,
  startOfDay,
  startOfWeek,
} from 'date-fns';

const WEEK_OPTIONS = { weekStartsOn: 1 };

export const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const toDate = (value) => (value instanceof Date ? value : parseISO(String(value)));

export const weekStartOf = (value = new Date()) => startOfWeek(toDate(value), WEEK_OPTIONS);

export const weekDays = (value = new Date()) => {
  const start = weekStartOf(value);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
};

export const shiftWeek = (value, amount) => addWeeks(weekStartOf(value), amount);

export const dayLabel = (date) => format(toDate(date), 'EEE');

export const dayNumber = (date) => format(toDate(date), 'dd');

export const weekRangeLabel = (value) => {
  const start = weekStartOf(value);
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  return sameMonth
    ? `${format(start, 'd')} - ${format(end, 'd MMM yyyy')}`
    : `${format(start, 'd MMM')} - ${format(end, 'd MMM yyyy')}`;
};

export const fullDateLabel = (value) => format(toDate(value), 'EEEE d, MMMM');

export const shortDateLabel = (value) => format(toDate(value), "'Tasks on' EEE d MMM");

export const timeLabel = (value) => (value ? format(toDate(value), 'HH:mm') : '');

export const isSelectedDay = (a, b) => isSameDay(toDate(a), toDate(b));

export const isCurrentDay = (value) => isToday(toDate(value));

export const dayBounds = (value) => ({
  from: startOfDay(toDate(value)).toISOString(),
  to: endOfDay(toDate(value)).toISOString(),
});

export const combineDateAndTime = (dateValue, timeValue) => {
  const base = toDate(dateValue);
  if (!timeValue) return base;
  const [hours, minutes] = String(timeValue).split(':').map(Number);
  const combined = new Date(base);
  combined.setHours(hours || 0, minutes || 0, 0, 0);
  return combined;
};

export const inputDateValue = (value) => format(toDate(value), 'yyyy-MM-dd');

export const progressPercent = ({ completedCount = 0, totalCount = 0 }) =>
  totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

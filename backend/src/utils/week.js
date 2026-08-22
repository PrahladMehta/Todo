import { DateTime } from 'luxon';
import { env } from '../config/env.js';
import { AppError } from './AppError.js';

export const resolveTimeZone = (timeZone) => {
  const zone = timeZone || env.APP_TIMEZONE;
  if (!DateTime.local().setZone(zone).isValid) {
    throw AppError.badRequest(`Unknown time zone "${zone}"`, undefined, 'INVALID_TIMEZONE');
  }
  return zone;
};

export const startOfWeek = (date, timeZone) =>
  DateTime.fromJSDate(date, { zone: resolveTimeZone(timeZone) }).startOf('week');

export const weekBounds = (weekStartInput, timeZone) => {
  const zone = resolveTimeZone(timeZone);
  const parsed =
    weekStartInput instanceof Date
      ? DateTime.fromJSDate(weekStartInput, { zone })
      : DateTime.fromISO(String(weekStartInput), { zone });

  if (!parsed.isValid) {
    throw AppError.badRequest('weekStart must be a valid ISO date', undefined, 'INVALID_WEEK_START');
  }

  const start = parsed.startOf('week');
  return {
    weekStart: start.toJSDate(),
    weekEnd: start.plus({ days: 6 }).endOf('day').toJSDate(),
    nextWeekStart: start.plus({ weeks: 1 }).toJSDate(),
  };
};

export const defaultWeekRange = (timeZone, { weeksBack = 4, weeksAhead = 8 } = {}) => {
  const zone = resolveTimeZone(timeZone);
  const current = DateTime.now().setZone(zone).startOf('week');
  return {
    from: current.minus({ weeks: weeksBack }).toJSDate(),
    to: current.plus({ weeks: weeksAhead }).endOf('week').toJSDate(),
  };
};

export const weekEndFor = (weekStart, timeZone) =>
  DateTime.fromJSDate(weekStart, { zone: resolveTimeZone(timeZone) })
    .plus({ days: 6 })
    .endOf('day')
    .toJSDate();

export const weekLabel = (weekStart, timeZone) => {
  const zone = resolveTimeZone(timeZone);
  const start = DateTime.fromJSDate(weekStart, { zone });
  const end = start.plus({ days: 6 });
  const sameMonth = start.month === end.month;
  return sameMonth
    ? `${start.toFormat('d')} - ${end.toFormat('d LLL yyyy')}`
    : `${start.toFormat('d LLL')} - ${end.toFormat('d LLL yyyy')}`;
};

export const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// A calendar day in studio time. Silence and "days ago" are counted from the
// day it was in Casablanca, not in UTC: a call at 00:30 local time is
// yesterday in UTC for half the year.
const STUDIO = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Casablanca' });

export const studioDay = (d: Date = new Date()): string => STUDIO.format(d);

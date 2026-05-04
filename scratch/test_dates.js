
const { parseISO, isWithinInterval } = require('date-fns');

const checkInStr = '2026-08-01';
const startDate = parseISO(checkInStr);
console.log('startDate (parseISO):', startDate.toISOString(), startDate.toString());

const seasonStartStr = '2026-06-01';
const seasonEndStr = '2026-08-31';

const seasonStart = parseISO(seasonStartStr);
const seasonEnd = parseISO(seasonEndStr);

console.log('seasonStart (parseISO):', seasonStart.toISOString(), seasonStart.toString());
console.log('seasonEnd (parseISO):', seasonEnd.toISOString(), seasonEnd.toString());

const isContained = isWithinInterval(startDate, { start: seasonStart, end: seasonEnd });
console.log('Is startDate within season?', isContained);

// Test transition day
const lastDayStr = '2026-08-31';
const lastDayDate = parseISO(lastDayStr);
console.log('lastDayDate (parseISO):', lastDayDate.toISOString(), lastDayDate.toString());
const isLastDayContained = isWithinInterval(lastDayDate, { start: seasonStart, end: seasonEnd });
console.log('Is lastDayDate within season?', isLastDayContained);

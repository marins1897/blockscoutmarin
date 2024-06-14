import type { StatsIntervalIds } from 'types/client/stats';

export const STATS_INTERVALS: { [key in StatsIntervalIds]: { title: string; start?: Date } } = {
  all: {
    title: 'Cijelo vrijeme',
  },
  oneMonth: {
    title: '1 mjesec',
    start: getStartDateInPast(1),
  },
  threeMonths: {
    title: '3 mjeseca',
    start: getStartDateInPast(3),
  },
  sixMonths: {
    title: '6 mjeseci',
    start: getStartDateInPast(6),
  },
  oneYear: {
    title: '1 godina',
    start: getStartDateInPast(12),
  },
};

function getStartDateInPast(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

import { BadRequestException } from '@nestjs/common';
import { TimeCompareSchema } from '../dto/time.dto';

const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const period = Number(hours) >= 12 ? 'PM' : 'AM';
  const formattedHours = String(Number(hours) % 12 || 12);
  const formattedMinutes = minutes.padStart(2, '0');
  return `${formattedHours}:${formattedMinutes} ${period}`;
};

const formatDate = (dateString) => {
  const [day, month, year] = dateString.split('-');
  const formattedMonth = new Date(`${year}-${month}-${day}`).toLocaleString(
    'default',
    { month: 'long' },
  );
  return `${formattedMonth} ${day}, ${year}`;
};

export const availableDateAndTimeCompare = async (
  from: TimeCompareSchema,
  compare: TimeCompareSchema,
): Promise<void> => {
  const [compareDay, compareMonth, compareYear] = compare.date.split('-');
  const [fromDay, fromMonth, fromYear] = from.date.split('-');

  const compareDate = new Date(
    parseInt(compareYear, 10),
    parseInt(compareMonth, 10) - 1, // Adjusted for zero-based indexing
    parseInt(compareDay, 10),
  );

  const compareFromDate = new Date(
    parseInt(fromYear, 10),
    parseInt(fromMonth, 10) - 1, // Adjusted for zero-based indexing
    parseInt(fromDay, 10),
  );

  const compareStartDateTime = new Date(
    compareDate.getFullYear(),
    compareDate.getMonth(),
    compareDate.getDate(),
    getHoursFromTimeString(compare.startTime),
    getMinutesFromTimeString(compare.startTime),
  );

  const compareEndDateTime = new Date(
    compareDate.getFullYear(),
    compareDate.getMonth(),
    compareDate.getDate(),
    getHoursFromTimeString(compare.endTime),
    getMinutesFromTimeString(compare.endTime),
  );

  const fromDateTime = new Date(
    compareFromDate.getFullYear(),
    compareFromDate.getMonth(),
    compareFromDate.getDate(),
    getHoursFromTimeString(from.startTime),
    getMinutesFromTimeString(from.startTime),
  );

  if (
    fromDateTime <= compareEndDateTime &&
    fromDateTime >= compareStartDateTime
  ) {
    const fromStartTimeFormatted = formatTime(from.startTime);
    const fromEndTimeFormatted = formatTime(from.endTime);

    throw new BadRequestException(
      `The vehicle is not available for booking between ${fromStartTimeFormatted} and ${fromEndTimeFormatted} on ${formatDate(
        compare.date,
      )}. Please choose another time.`,
    );
  }
};

const getHoursFromTimeString = (timeString: string): number => {
  const [hours] = timeString.split(':').map(Number);
  return hours;
};

const getMinutesFromTimeString = (timeString: string): number => {
  const [, minutes] = timeString.split(':').map(Number);
  return minutes;
};

export function getFormattedTimestamp() {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

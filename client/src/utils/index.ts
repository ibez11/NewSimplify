import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';
import { convertToRaw, convertFromHTML, ContentState } from 'draft-js';

export const isValidEmail = (email: string): boolean => {
  var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const minutesConvertToHours = (numberOfMinutes: number) => {
  const hours = numberOfMinutes / 60;
  let rhours = ('0' + Math.floor(hours)).slice(-2);
  const minutes = (hours - Number(rhours)) * 60;
  let rminutes = ('0' + Math.round(minutes)).slice(-2);
  return { rhours, rminutes };
};

export const hoursConvertToMinutes = (hours: number, minutes: number) => {
  const minutesFromHours = hours * 60;
  const numberOfMinutes = minutesFromHours + minutes;
  return numberOfMinutes;
};

export const ucWords = (str: string) => {
  return (str.toLowerCase() + '').replace(/^(.)|\s+(.)/g, function($1) {
    return $1.toUpperCase();
  });
};

export const getUnique = (arr: any[], comp: string) => {
  const unique = arr
    .map((e: any) => e[comp])
    .map((e, i, final) => final.indexOf(e) === i && i)
    .filter((e: any) => arr[e])
    .map((e: any) => arr[e]);

  return unique;
};

//get new Date with SG timezone
export const getNewDate = (date?: Date) => {
  return new Date(
    date ? new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Singapore' }) : new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' })
  );
};

//convert Date to SG timezone
export const convertTz = (date: string | Date) => {
  return zonedTimeToUtc(date, 'Asia/Singapore');
};

export const convertUTC = (value: string) => {
  const date = utcToZonedTime(new Date(value as string).toISOString(), 'UTC');
  return date;
};

export const scheduleLabelGenerate = (scheduleData: ScheduleModel) => {
  let label = '';
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weeks = ['1st', '2nd', '3rd', '4rd'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const currentRepeatType =
    scheduleData.repeatType === 'Yearly'
      ? 'Years'
      : scheduleData.repeatType === 'Weekly'
      ? 'Weeks'
      : scheduleData.repeatType === 'Monthly'
      ? 'Months'
      : 'Days';

  const every = currentRepeatType ? currentRepeatType : 'Days';
  const repeatOnType = scheduleData.repeatOnDate < 1 ? 'byDay' : 'byDate';

  let repeatOnDayLabel = '';
  let repeatOnWeekLabel = '';
  if (repeatOnType === 'byDay') {
    scheduleData.repeatOnDate = 0;
    if (scheduleData.repeatType === 'Monthly' || scheduleData.repeatType === 'Yearly') {
      repeatOnDayLabel = days[Number(scheduleData.repeatOnDay) - 1];
      repeatOnWeekLabel = weeks[scheduleData.repeatOnWeek - 1];
    }
  }

  if (every === 'Days') {
    label = `Every ${scheduleData.repeatEvery} Days, ${
      scheduleData.repeatEndType === 'AFTER'
        ? scheduleData.repeatEndAfter + ' Times'
        : 'End on ' + format(new Date(scheduleData.repeatEndOnDate), 'dd-MM-yyyy')
    }`;
  } else if (every === 'Weeks') {
    const currentRepeatOnDayLabel: any = [];
    repeatOnDayLabel = '';
    scheduleData.repeatOnDay.split(',').map(day => {
      currentRepeatOnDayLabel.push(days[Number(day) - 1]);
      return day;
    });
    repeatOnDayLabel = currentRepeatOnDayLabel.join(',');
    label = `Every ${scheduleData.repeatEvery} Weeks on ${repeatOnDayLabel}, ${
      scheduleData.repeatEndType === 'AFTER'
        ? scheduleData.repeatEndAfter + ' Times'
        : 'End on ' + format(new Date(scheduleData.repeatEndOnDate), 'dd-MM-yyyy')
    }`;
  } else if (every === 'Months') {
    label = `Every ${scheduleData.repeatEvery} Months on ${
      repeatOnType === 'byDate' ? scheduleData.repeatOnDate + ' Date' : repeatOnWeekLabel + ' ' + repeatOnDayLabel!
    }, ${
      scheduleData.repeatEndType === 'AFTER'
        ? scheduleData.repeatEndAfter + ' Times'
        : 'End on ' + format(new Date(scheduleData.repeatEndOnDate), 'MM-yyyy')
    }`;
  } else if (every === 'Years') {
    const monthLabel = months[scheduleData.repeatOnMonth - 1];
    label = `Every ${scheduleData.repeatEvery} Years on ${monthLabel} ${
      repeatOnType === 'byDate' ? scheduleData.repeatOnDate + ' Date' : repeatOnWeekLabel + repeatOnDayLabel!
    }, ${
      scheduleData.repeatEndType === 'AFTER'
        ? scheduleData.repeatEndAfter + ' Times'
        : 'End on ' + format(new Date(scheduleData.repeatEndOnDate), 'yyyy')
    }`;
  } else {
    label = '-';
  }

  return label;
};

export const combineAddress = (address: string, floorNo: string, unitNo: string, postalCode: string) => {
  // Normalize and avoid duplicating postal code if already present in `address`.
  const base = address ? address.trim() : '';

  let cleanedBase = base;
  if (postalCode && cleanedBase.endsWith(postalCode)) {
    cleanedBase = cleanedBase.slice(0, cleanedBase.length - postalCode.length).trim();
    if (cleanedBase.endsWith(',')) cleanedBase = cleanedBase.slice(0, cleanedBase.length - 1).trim();
  }

  const floorUnit = floorNo || unitNo ? `#${floorNo || ''}${floorNo && unitNo ? '-' : ''}${unitNo || ''}` : '';
  const parts: string[] = [];
  if (cleanedBase) parts.push(cleanedBase);
  if (floorUnit) parts.push(floorUnit);
  if (postalCode) parts.push(postalCode);

  return parts.join(', ');
};

export const getNumberWithOrdinal = (value: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = value % 100;
  return value + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const disablePrevDates = (startDate: Date) => {
  const startSeconds = Date.parse(startDate.toDateString());
  return (date: any) => {
    return Date.parse(date) < startSeconds;
  };
};

export const convertHtml = (value: string) => {
  const contentHTMLValue = convertFromHTML(value);

  // 2. Create the ContentState object
  const stateValue = ContentState.createFromBlockArray(contentHTMLValue.contentBlocks, contentHTMLValue.entityMap);

  // 3. Stringify `state` object from a Draft.Model.Encoding.RawDraftContentState object
  const contentValue = JSON.stringify(convertToRaw(stateValue));

  return contentValue;
};

export const hasAccessPermission = (module: string, functionName: string, roleGrants: any[]) => {
  return roleGrants.some(grant => grant.module === module && grant.function === functionName && grant.isActive === true);
};

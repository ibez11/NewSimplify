/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  getHours,
  getMinutes,
  getDate,
  getMonth,
  getYear,
  set,
  setMinutes,
  setHours,
  setDay,
  setDate,
  setMonth,
  startOfMonth,
  differenceInCalendarDays,
  differenceInMinutes,
  isSameDay,
  getDay
} from 'date-fns';
import httpContext from 'express-http-context';
import Schedule, { RepeatType } from '../database/models/Schedule';
import { JobStatus } from '../database/models/Job';
import { repeatEndType } from '../database/models/Service';
import { JobGenerateResponseModel, ScheduleTimeGenerateModel, WADataresponseModel } from '../typings/ResponseFormats';
import axios from 'axios';
import * as AwsService from '../services/AwsService';
import sharp from 'sharp';
import path from 'path';
import OpenAI from 'openai';

const { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY, S3_BUCKET_NAME } = process.env;

export const setRequestTenancy = (tenant: string): void => {
  httpContext.set('tenant', tenant.toLowerCase());
};

// eslint-disable-next-line
export const ucWords = (str: string) => {
  return (str.toLowerCase() + '').replace(/^(.)|\s+(.)/g, $1 => {
    return $1.toUpperCase();
  });
};

export const scheduling = (
  schedules: Schedule[]
): {
  jobs: JobGenerateResponseModel[];
  firstJobDate: string;
  lastJobDate: string;
  scheduleTime: ScheduleTimeGenerateModel[];
  isOverlap: boolean;
} => {
  const scheduleTime: ScheduleTimeGenerateModel[] = [];
  let jobs: JobGenerateResponseModel[] = [];
  let firstJobDate = '';
  let lastJobDate = '';
  let isOverlap = false;

  schedules.map((schedule, index) => {
    const startDateTime = format(schedule.startDateTime ? new Date(schedule.startDateTime) : new Date(), 'yyyy/MM/dd HH:mm:00');
    const endDateTime = format(schedule.endDateTime ? new Date(schedule.endDateTime) : new Date(), 'yyyy/MM/dd HH:mm:00');

    schedule.ServiceItems.map(value => {
      return (value.scheduleIndex = index);
    });

    let nextStart = new Date(startDateTime);
    let nextEnd = new Date(endDateTime);
    const hourStart = getHours(nextStart);
    const minuteStart = getMinutes(nextStart);
    const hourEnd = getHours(nextEnd);
    const minuteEnd = getMinutes(nextEnd);

    if (schedule.repeatType === RepeatType.ADHOC) {
      jobs.push({
        id: 0,
        startDateTime: format(nextStart, 'yyyy-MM-dd HH:mm:00'),
        endDateTime: format(nextEnd, 'yyyy-MM-dd HH:mm:00'),
        jobStatus: JobStatus.UNASSIGNED,
        ServiceItems: schedule.ServiceItems,
        duration: differenceInMinutes(nextEnd, nextStart)
      });
    } else if (schedule.repeatType === RepeatType.DAILY) {
      const maxDay = set(nextStart, { hours: 23, minutes: 30 });

      if (nextEnd > maxDay) {
        const startDate = getDate(nextStart);
        const startMonth = getMonth(nextStart);
        const startYear = getYear(nextStart);

        nextEnd = set(nextEnd, { year: startYear, month: startMonth, date: startDate, hours: 23, minutes: 30 });
      }

      if (schedule.repeatEndType === repeatEndType.AFTER) {
        for (let i = 0; i < schedule.repeatEndAfter; i++) {
          nextStart = new Date(startDateTime);
          nextEnd = new Date(endDateTime);

          nextStart = addDays(nextStart, schedule.repeatEvery * i);
          nextEnd = addDays(nextEnd, schedule.repeatEvery * i);

          jobs.push({
            id: 0,
            startDateTime: format(nextStart, 'yyyy-MM-dd HH:mm:00'),
            endDateTime: format(nextEnd, 'yyyy-MM-dd HH:mm:00'),
            jobStatus: JobStatus.UNASSIGNED,
            ServiceItems: schedule.ServiceItems,
            duration: differenceInMinutes(nextEnd, nextStart)
          });
        }
      } else {
        const endRepeatDate = new Date(`${format(new Date(schedule.repeatEndOnDate), 'yyyy-MM-dd')} 23:59:00`);
        while (nextStart <= endRepeatDate) {
          let i = 0;
          jobs.push({
            id: 0,
            startDateTime: format(nextStart, 'yyyy-MM-dd HH:mm:00'),
            endDateTime: format(nextEnd, 'yyyy-MM-dd HH:mm:00'),
            jobStatus: JobStatus.UNASSIGNED,
            ServiceItems: schedule.ServiceItems,
            duration: differenceInMinutes(nextEnd, nextStart)
          });

          nextStart = addDays(nextStart, schedule.repeatEvery);
          nextEnd = addDays(nextEnd, schedule.repeatEvery);
          i++;
        }
      }
    } else if (schedule.repeatType === RepeatType.WEEKLY) {
      const repeatDays = schedule.repeatOnDay.split(',');
      const newStartDateTime = new Date(startDateTime);
      const newEndDateTime = new Date(endDateTime);

      // change current time compare next job
      // if (repeatDays.length > 1) {
      //   for (let d = 0; d < repeatDays.length; d++) {
      //     const day = repeatDays[d];
      //     const nextDay = repeatDays[d + 1];

      //     if (nextDay) {
      //       let currentStart = setDay(newStartDateTime, Number(day) - 1);
      //       let currentEnd = setDay(newEndDateTime, Number(day) - 1);
      //       if (currentStart < newStartDateTime) {
      //         currentStart = addWeeks(currentStart, 1);
      //         currentEnd = addWeeks(currentEnd, 1);
      //       }

      //       const nextStart = setDay(currentStart, Number(nextDay) - 1);
      //       let currentEnd = newEndDateTime;
      //       const difDay = differenceInCalendarDays(new Date(endDateTime), new Date(startDateTime));

      //       if (difDay > 0) {
      //         currentEnd = addDays(currentStart, Number(difDay));
      //         currentEnd = set(currentEnd, { hours: hourEnd, minutes: minuteEnd });
      //       }

      //       if (currentEnd > nextStart) {
      //         currentEnd = sub(nextStart, { minutes: 30 });

      //         const newEndHours = getHours(currentEnd);
      //         const newEndMinutes = getMinutes(currentEnd);
      //         const newDiffDay = differenceInCalendarDays(currentEnd, currentStart);
      //         newEndDateTime = addDays(newStartDateTime, Number(newDiffDay));
      //         newEndDateTime = set(newEndDateTime, { hours: newEndHours, minutes: newEndMinutes });
      //       }
      //     }
      //   }
      // }

      for (let d = 0; d < repeatDays.length; d++) {
        const day = repeatDays[d];
        let newNextStart = newStartDateTime;
        let newNextEnd = newEndDateTime;

        newNextStart = setDay(newNextStart, Number(day) - 1);
        newNextEnd = setDay(newNextEnd, Number(day) - 1);

        if (newNextStart < newStartDateTime) {
          newNextStart = addWeeks(newNextStart, 1);
          newNextEnd = addWeeks(newNextEnd, 1);
        }

        const difDay = differenceInCalendarDays(newEndDateTime, newStartDateTime);
        if (difDay > 0) {
          const newEndHours = getHours(newNextEnd);
          const newEndMinutes = getMinutes(newNextEnd);
          newNextEnd = addDays(newNextStart, Number(difDay));
          newNextEnd = set(newNextEnd, { hours: newEndHours, minutes: newEndMinutes });
        }

        if (format(newStartDateTime, 'yyyy-MM-dd') === format(newEndDateTime, 'yyyy-MM-dd')) {
          const getStartDate = getDate(newNextStart);
          newNextEnd = setDate(newNextEnd, getStartDate);
        }

        if (schedule.repeatEndType === repeatEndType.AFTER) {
          for (let i = 0; i < schedule.repeatEndAfter; i++) {
            nextStart = newNextStart;
            nextEnd = newNextEnd;
            nextStart = addWeeks(nextStart, schedule.repeatEvery * i);
            nextEnd = addWeeks(nextEnd, schedule.repeatEvery * i);

            jobs.push({
              id: 0,
              startDateTime: format(nextStart, 'yyyy-MM-dd HH:mm:00'),
              endDateTime: format(nextEnd, 'yyyy-MM-dd HH:mm:00'),
              jobStatus: JobStatus.UNASSIGNED,
              ServiceItems: schedule.ServiceItems,
              duration: differenceInMinutes(nextEnd, nextStart)
            });
          }
        } else {
          nextStart = newNextStart;
          nextEnd = newNextEnd;

          const endRepeatDate = new Date(`${format(new Date(schedule.repeatEndOnDate), 'yyyy-MM-dd')} 23:59:00`);
          while (nextStart <= endRepeatDate) {
            let i = 0;
            jobs.push({
              id: 0,
              startDateTime: format(nextStart, 'yyyy-MM-dd HH:mm:00'),
              endDateTime: format(nextEnd, 'yyyy-MM-dd HH:mm:00'),
              jobStatus: JobStatus.UNASSIGNED,
              ServiceItems: schedule.ServiceItems,
              duration: differenceInMinutes(nextEnd, nextStart)
            });

            nextStart = addWeeks(new Date(nextStart), schedule.repeatEvery);
            nextEnd = addWeeks(new Date(nextEnd), schedule.repeatEvery);
            i++;
          }
        }
      }
    } else if (schedule.repeatType === RepeatType.MONTHLY) {
      let newNextStart = new Date(startDateTime);
      let newNextEnd = new Date(endDateTime);

      if (schedule.repeatOnDate) {
        const firstJobDate = setDate(newNextStart, Number(schedule.repeatOnDate));

        newNextStart = firstJobDate;
      } else {
        let firstJobDate = newNextStart;

        const jobMonth = getMonth(firstJobDate);
        firstJobDate = startOfMonth(firstJobDate);
        firstJobDate = setDay(firstJobDate, Number(schedule.repeatOnDay) - 1);

        if (getMonth(firstJobDate) !== jobMonth) {
          firstJobDate = addWeeks(firstJobDate, 1);
        }
        firstJobDate = addWeeks(firstJobDate, Number(schedule.repeatOnWeek) - 1);

        firstJobDate = set(firstJobDate, { hours: hourStart, minutes: minuteStart });

        newNextStart = firstJobDate;
      }

      if (newNextStart < new Date(startDateTime)) {
        newNextStart = addMonths(newNextStart, 1);
      }

      const difDay = differenceInCalendarDays(new Date(endDateTime), new Date(startDateTime));
      if (difDay > 0) {
        newNextEnd = addDays(newNextStart, Number(difDay));
        newNextEnd = set(newNextEnd, { hours: hourEnd, minutes: minuteEnd });
      }

      if (format(new Date(startDateTime), 'yyyy-MM-dd') === format(new Date(endDateTime), 'yyyy-MM-dd')) {
        const firstDate = getDate(newNextStart);
        const firstMonth = getMonth(newNextStart);
        const firstYear = getYear(newNextStart);
        newNextEnd = set(newNextEnd, { year: firstYear, month: firstMonth, date: firstDate, hours: hourEnd, minutes: minuteEnd });
      }

      if (schedule.repeatEndType === repeatEndType.AFTER) {
        for (let i = 0; i < schedule.repeatEndAfter; i++) {
          nextStart = newNextStart;
          nextEnd = newNextEnd;

          let nextStartDateTime = addMonths(nextStart, schedule.repeatEvery * i);
          let nextEndDateTime = addMonths(nextEnd, schedule.repeatEvery * i);

          if (!schedule.repeatOnDate) {
            const jobStartMonth = getMonth(nextStartDateTime);
            nextStartDateTime = startOfMonth(nextStartDateTime);
            nextStartDateTime = setDay(nextStartDateTime, Number(schedule.repeatOnDay) - 1);
            if (getMonth(nextStartDateTime) !== jobStartMonth) {
              nextStartDateTime = addWeeks(nextStartDateTime, 1);
            }
            nextStartDateTime = addWeeks(nextStartDateTime, Number(schedule.repeatOnWeek) - 1);
            nextStartDateTime = set(nextStartDateTime, { hours: hourStart, minutes: minuteStart });

            const difDay = differenceInCalendarDays(new Date(endDateTime), new Date(startDateTime));
            if (difDay > 0) {
              nextEndDateTime = addDays(nextStartDateTime, Number(difDay));
              nextEndDateTime = set(nextEndDateTime, { hours: hourEnd, minutes: minuteEnd });
            }
            nextEndDateTime = set(nextEndDateTime, { hours: hourEnd, minutes: minuteEnd });

            if (format(new Date(startDateTime), 'yyyy-MM-dd') === format(new Date(endDateTime), 'yyyy-MM-dd')) {
              const firstDate = getDate(nextStartDateTime);
              nextEndDateTime = set(nextEndDateTime, { date: firstDate, hours: hourEnd, minutes: minuteEnd });
            }
          }

          nextStart = nextStartDateTime;
          nextEnd = nextEndDateTime;

          jobs.push({
            id: 0,
            startDateTime: format(nextStart, 'yyyy-MM-dd HH:mm:00'),
            endDateTime: format(nextEnd, 'yyyy-MM-dd HH:mm:00'),
            jobStatus: JobStatus.UNASSIGNED,
            ServiceItems: schedule.ServiceItems,
            duration: differenceInMinutes(nextEnd, nextStart)
          });
        }
      } else {
        let nextStartDateTime = newNextStart;
        let nextEndDateTime = newNextEnd;

        const endRepeatDate = new Date(`${format(new Date(schedule.repeatEndOnDate), 'yyyy-MM-dd')} 23:59:00`);
        while (nextStartDateTime <= endRepeatDate) {
          let i = 0;
          if (!schedule.repeatOnDate) {
            const jobStartMonth = getMonth(nextStartDateTime);
            nextStartDateTime = startOfMonth(nextStartDateTime);
            nextStartDateTime = setDay(nextStartDateTime, Number(schedule.repeatOnDay) - 1);

            if (getMonth(nextStartDateTime) !== jobStartMonth) {
              nextStartDateTime = addWeeks(nextStartDateTime, 1);
            }
            nextStartDateTime = addWeeks(nextStartDateTime, Number(schedule.repeatOnWeek) - 1);

            const jobEndMonth = getMonth(nextEndDateTime);
            nextEndDateTime = startOfMonth(nextEndDateTime);
            nextEndDateTime = setDay(nextEndDateTime, Number(schedule.repeatOnDay) - 1);
            if (getMonth(nextEndDateTime) !== jobEndMonth) {
              nextEndDateTime = addWeeks(nextEndDateTime, 1);
            }
            nextEndDateTime = addWeeks(nextEndDateTime, Number(schedule.repeatOnWeek) - 1);

            const difDay = differenceInCalendarDays(new Date(endDateTime), new Date(startDateTime));

            if (difDay > 0) {
              nextEndDateTime = addDays(nextStartDateTime, Number(difDay));
            }

            nextStartDateTime = setHours(nextStartDateTime, hourStart);
            nextStartDateTime = setMinutes(nextStartDateTime, minuteStart);
            nextEndDateTime = setHours(nextEndDateTime, hourEnd);
            nextEndDateTime = setMinutes(nextEndDateTime, minuteEnd);
          }

          nextStart = nextStartDateTime;
          nextEnd = nextEndDateTime;

          jobs.push({
            id: 0,
            startDateTime: format(nextStart, 'yyyy-MM-dd HH:mm:00'),
            endDateTime: format(nextEnd, 'yyyy-MM-dd HH:mm:00'),
            jobStatus: JobStatus.UNASSIGNED,
            ServiceItems: schedule.ServiceItems,
            duration: differenceInMinutes(nextEnd, nextStart)
          });

          nextStartDateTime = addMonths(nextStartDateTime, schedule.repeatEvery);
          // if (!isLastDayOfMonth(nextStartDateTime)) {
          //   nextStartDateTime = setDate(nextStartDateTime, Number(schedule.repeatOnDate));
          // }
          nextEndDateTime = addMonths(nextEndDateTime, schedule.repeatEvery);
          i++;
        }
      }
    } else if (schedule.repeatType === RepeatType.YEARLY) {
      let newNextStart = new Date(startDateTime);
      let newNextEnd = new Date(endDateTime);

      if (schedule.repeatOnDate) {
        let firstJobDate = setDate(newNextStart, Number(schedule.repeatOnDate));
        firstJobDate = setMonth(firstJobDate, Number(schedule.repeatOnMonth) - 1);
        newNextStart = firstJobDate;
      } else {
        let firstJobDate = setDay(newNextStart, Number(schedule.repeatOnDay) - 1);
        firstJobDate = setMonth(firstJobDate, Number(schedule.repeatOnMonth) - 1);

        if (getMonth(firstJobDate) === getMonth(newNextStart)) {
          firstJobDate = addWeeks(firstJobDate, 1);
        }
        const jobMonth = getMonth(firstJobDate);
        firstJobDate = startOfMonth(firstJobDate);
        firstJobDate = setDay(firstJobDate, Number(schedule.repeatOnDay) - 1);
        if (getMonth(firstJobDate) !== jobMonth) {
          firstJobDate = addWeeks(firstJobDate, 1);
        }

        firstJobDate = addWeeks(firstJobDate, Number(schedule.repeatOnWeek) - 1);
        newNextStart = firstJobDate;
      }

      if (newNextStart < new Date(startDateTime)) {
        newNextStart = addYears(newNextStart, 1);
      }

      const difDay = differenceInCalendarDays(new Date(endDateTime), new Date(startDateTime));
      if (difDay > 0) {
        newNextEnd = addDays(newNextStart, Number(difDay));
      }

      newNextStart = set(newNextStart, { hours: hourStart, minutes: minuteStart });
      newNextEnd = set(newNextEnd, { hours: hourEnd, minutes: minuteEnd });

      if (format(new Date(startDateTime), 'yyyy-MM-dd') === format(new Date(endDateTime), 'yyyy-MM-dd')) {
        const firstDate = getDate(newNextStart);
        const firstMonth = getMonth(newNextStart);
        const firstYear = getYear(newNextStart);
        newNextEnd = set(newNextEnd, { year: firstYear, month: firstMonth, date: firstDate, hours: hourEnd, minutes: minuteEnd });
      }

      if (schedule.repeatEndType === repeatEndType.AFTER) {
        for (let i = 0; i < schedule.repeatEndAfter; i++) {
          nextStart = newNextStart;
          nextEnd = newNextEnd;

          let nextStartDateTime = addYears(nextStart, schedule.repeatEvery * i);
          let nextEndDateTime = addYears(nextEnd, schedule.repeatEvery * i);

          if (!schedule.repeatOnDate) {
            const jobStartMonth = getMonth(nextStartDateTime);
            nextStartDateTime = startOfMonth(nextStartDateTime);
            nextStartDateTime = setDay(nextStartDateTime, Number(schedule.repeatOnDay) - 1);

            if (getMonth(nextStartDateTime) !== jobStartMonth) {
              nextStartDateTime = addWeeks(nextStartDateTime, 1);
            }
            nextStartDateTime = addWeeks(nextStartDateTime, Number(schedule.repeatOnWeek) - 1);

            const jobEndMonth = getMonth(nextEndDateTime);
            nextEndDateTime = startOfMonth(nextEndDateTime);
            nextEndDateTime = setDay(nextEndDateTime, Number(schedule.repeatOnDay) - 1);

            if (getMonth(nextEndDateTime) !== jobEndMonth) {
              nextEndDateTime = addWeeks(nextEndDateTime, 1);
            }
            nextEndDateTime = addWeeks(nextEndDateTime, Number(schedule.repeatOnWeek) - 1);

            const difDay = differenceInCalendarDays(new Date(endDateTime), new Date(startDateTime));
            if (difDay > 0) {
              nextEndDateTime = addDays(nextStartDateTime, Number(difDay));
            }

            nextStartDateTime = setHours(nextStartDateTime, hourStart);
            nextStartDateTime = setMinutes(nextStartDateTime, minuteStart);
            nextEndDateTime = setHours(nextEndDateTime, hourEnd);
            nextEndDateTime = setMinutes(nextEndDateTime, minuteEnd);
          }

          nextStart = nextStartDateTime;
          nextEnd = nextEndDateTime;

          jobs.push({
            id: 0,
            startDateTime: format(nextStart, 'yyyy-MM-dd HH:mm:00'),
            endDateTime: format(nextEnd, 'yyyy-MM-dd HH:mm:00'),
            jobStatus: JobStatus.UNASSIGNED,
            ServiceItems: schedule.ServiceItems,
            duration: differenceInMinutes(nextEnd, nextStart)
          });
        }
      } else {
        let nextStartDateTime = newNextStart;
        let nextEndDateTime = newNextEnd;

        while (getYear(nextEndDateTime) <= getYear(new Date(schedule.repeatEndOnDate))) {
          let i = 0;
          if (!schedule.repeatOnDate) {
            const jobStartMonth = getMonth(nextStartDateTime);
            nextStartDateTime = startOfMonth(nextStartDateTime);
            nextStartDateTime = setDay(nextStartDateTime, Number(schedule.repeatOnDay) - 1);
            if (getMonth(nextStartDateTime) !== jobStartMonth) {
              nextStartDateTime = addWeeks(nextStartDateTime, 1);
            }
            nextStartDateTime = addWeeks(nextStartDateTime, Number(schedule.repeatOnWeek) - 1);

            const jobEndMonth = getMonth(nextEndDateTime);
            nextEndDateTime = startOfMonth(nextEndDateTime);
            nextEndDateTime = setDay(nextEndDateTime, Number(schedule.repeatOnDay) - 1);
            if (getMonth(nextEndDateTime) !== jobEndMonth) {
              nextEndDateTime = addWeeks(nextEndDateTime, 1);
            }
            nextEndDateTime = addWeeks(nextEndDateTime, Number(schedule.repeatOnWeek) - 1);

            const difDay = differenceInCalendarDays(new Date(endDateTime), new Date(startDateTime));

            if (difDay > 0) {
              nextEndDateTime = addDays(nextStartDateTime, Number(difDay));
            }

            nextStartDateTime = setHours(nextStartDateTime, hourStart);
            nextStartDateTime = setMinutes(nextStartDateTime, minuteStart);
            nextEndDateTime = setHours(nextEndDateTime, hourEnd);
            nextEndDateTime = setMinutes(nextEndDateTime, minuteEnd);
          }

          nextStart = nextStartDateTime;
          nextEnd = nextEndDateTime;

          jobs.push({
            id: 0,
            startDateTime: format(nextStart, 'yyyy-MM-dd HH:mm:00'),
            endDateTime: format(nextEnd, 'yyyy-MM-dd HH:mm:00'),
            jobStatus: JobStatus.UNASSIGNED,
            ServiceItems: schedule.ServiceItems,
            duration: differenceInMinutes(nextEnd, nextStart)
          });
          nextStartDateTime = addYears(new Date(nextStart), schedule.repeatEvery);
          nextEndDateTime = addYears(new Date(nextEnd), schedule.repeatEvery);
          i++;
        }
      }
    }
  });

  jobs.map((job, index) => {
    const findOverlap = jobs.find((j, i) => {
      if (index !== i) {
        if (
          j.startDateTime === job.startDateTime ||
          j.endDateTime === job.endDateTime ||
          (new Date(job.startDateTime) >= new Date(j.startDateTime) && new Date(job.startDateTime) <= new Date(j.endDateTime)) ||
          (new Date(job.endDateTime) >= new Date(j.startDateTime) && new Date(job.endDateTime) <= new Date(j.endDateTime))
        ) {
          return j;
        }
      }
    });

    if (findOverlap) {
      isOverlap = true;
    }

    const findSame = jobs.findIndex((j, i) => index !== i && j.startDateTime === job.startDateTime && j.endDateTime === job.endDateTime);

    if (findSame >= 0) {
      isOverlap = true;
      job.ServiceItems = [...job.ServiceItems, ...jobs[findSame].ServiceItems];
      jobs.splice(findSame, 1);
    }
  });

  jobs = jobs.sort((f, s) => {
    const dateFirst = new Date(f.startDateTime).getTime();
    const dateSecond = new Date(s.startDateTime).getTime();
    return dateFirst > dateSecond ? 1 : -1;
  });

  jobs.map((value, index) => {
    value.occurance = index + 1;
    return value;
  });

  for (let index = 0; index < jobs.length; index++) {
    const job = jobs[index];
    const currentServiceItems = job.ServiceItems;
    currentServiceItems.map(item => {
      const findSchedule = scheduleTime.find(schedule => schedule.scheduleIndex === item.scheduleIndex);

      if (!findSchedule) {
        scheduleTime.push({
          scheduleIndex: item.scheduleIndex,
          startDateTime: job.startDateTime,
          endDateTime: job.endDateTime
        });
      }
    });
  }

  firstJobDate = jobs[0].startDateTime;
  lastJobDate = jobs[jobs.length - 1].endDateTime;

  return {
    jobs,
    firstJobDate,
    lastJobDate,
    scheduleTime,
    isOverlap
  };
};

// eslint-disable-next-line
export const maskString = (str: string, pattern: string) => {
  let i = 0;
  return pattern.replace(/#/g, () => str[i++]);
};

// Send Message WhatsApp using Axios
// eslint-disable-next-line
export const sendMessageWhatsApp = async (messageData: WADataresponseModel) => {
  const whatsapp_token = process.env.WHATSAPP_TOKEN;
  // const url = ' https://graph.facebook.com/v21.0/496036543599313/messages';
  const url = 'https://graph.facebook.com/v22.0/112264078165872/messages';

  const config = {
    method: 'POST',
    url,
    headers: {
      Authorization: `Bearer ${whatsapp_token}`,
      'Content-Type': 'application/json'
    }
  };

  const { data } = await axios.post(url, JSON.stringify(messageData), config);

  return data;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const compareDateTimeArrays = (array1: any[], array2: any[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newJobs: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const oldJobs: any[] = [];

  // Loop through the first array
  for (const obj1 of array1) {
    // Find a matching object in the second array based on date and time
    const matchingObj2 = array2.find(
      obj2 =>
        new Date(obj1.startDateTime).getTime() === new Date(obj2.startDateTime).getTime() &&
        new Date(obj1.endDateTime).getTime() === new Date(obj2.endDateTime).getTime()
    );

    // If no match is found, add the object from the first array to the result
    if (!matchingObj2) {
      newJobs.push({ ...obj1 });
    } else {
      oldJobs.push({ ...obj1, id: matchingObj2.id });
    }
  }

  // Loop through the second array
  for (const obj2 of array2) {
    // Find a matching object in the first array based on date and time
    const matchingObj1 = array1.find(
      obj1 =>
        new Date(obj2.startDateTime).getTime() === new Date(obj1.startDateTime).getTime() &&
        new Date(obj2.endDateTime).getTime() === new Date(obj1.endDateTime).getTime()
    );

    // If no match is found, add the object from the second array to the result
    if (!matchingObj1) {
      newJobs.push({ ...obj2 });
    }
  }

  return { newJobs, oldJobs };
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const compareJobDateTime = (currentJobs: any[], generatedJobs: any[]) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let newJobs: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let oldJobs: any[] = [];
  currentJobs.map(value => {
    value.startDateTime = format(new Date(value.startDateTime), 'yyyy-MM-dd HH:mm:ss');
    return value;
  });

  // const jobNotUnassigned = currentJobs.filter(value => value.jobStatus !== JobStatus.UNASSIGNED);
  const sameJob = generatedJobs.filter(generate => {
    const job = currentJobs.find(value => value.startDateTime === generate.startDateTime);

    if (job) {
      generate.id = job.id;
      generate.jobStatus = job.jobStatus;
      return generate;
    }
  });

  // Create an array of objects with the datetime property
  oldJobs = sameJob;

  const differenceJob = generatedJobs.filter(generate => {
    return !currentJobs.some(value => value.startDateTime === generate.startDateTime);
  });

  // Create an array of objects with the datetime property
  newJobs = differenceJob;

  // for (const current of currentJobs) {
  //   console.log('current', current);

  //   if (current.jobStatus !== JobStatus.UNASSIGNED) {
  //     console.log('in to old');
  //     oldJobs.push(current);
  //   } else {
  //     generatedJobs.map(generated => {
  //       console.log('generated', generated.startDateTime);
  //       const findSame =
  //         isSameMinute(new Date(generated.startDateTime), new Date(current.startDateTime)) &&
  //         isSameMinute(new Date(generated.endDateTime), new Date(current.endDateTime));
  //       console.log('findSame', findSame);
  //       if (!findSame) {
  //         newJobs.push(generated);
  //       }
  //     });
  //   }
  // }

  // for (const generated of generatedJobs) {
  //   console.log('generated', generated.startDateTime);

  //   currentJobs.map(current => {
  //     console.log('current', current);
  //     const findSame =
  //       isSameMinute(new Date(generated.startDateTime), new Date(current.startDateTime)) &&
  //       isSameMinute(new Date(generated.endDateTime), new Date(current.endDateTime));
  //     console.log('findSame', findSame);
  //     if (!findSame) {
  //       newJobs.push(generated);
  //     }
  //   });
  // }

  return { newJobs, oldJobs };
};

export const imgCompressor = async (fileNames: string[]): Promise<void> => {
  const { URL } = process.env;

  try {
    await axios.post(URL, { object_keys: fileNames });
  } catch (error) {
    console.log(error);
  }
};

export const compressImageFromS3 = async (fileName: string): Promise<string> => {
  const file = await AwsService.s3BucketGetObject(fileName, 'jobs');
  const originalImageBuffer = file;

  // Step 2: Compress the image using sharp
  const compressedImageBuffer = await sharp(originalImageBuffer)
    .resize(800) // Resize to a specific width (optional)
    .jpeg({ quality: 80 }) // Compress to JPEG with quality 80 (adjust as needed)
    .toBuffer();

  // Step 3: Upload the compressed image back to S3
  const compressedFileName = path.basename(fileName, path.extname(fileName)) + '_compressed.jpg'; // Change extension as needed
  const uploadParams = {
    Key: compressedFileName,
    Body: compressedImageBuffer,
    ContentType: 'image/jpeg' // Adjust based on your image type
  };

  await AwsService.s3BucketUpload(uploadParams);

  return compressedFileName;
};

export const publicHolidays = async (termStart: any[]): Promise<any[]> => {
  const { GOOGLE_CALENDAR } = process.env;
  try {
    const result = await axios.get(GOOGLE_CALENDAR);
    const holidays = result.data.items;

    const holidayDates: any[] = [];
    if (holidays) {
      termStart.map(val => {
        const isHoliday = holidays.some((value: any) => isSameDay(new Date(value.start.date), new Date(val)));
        const isSunday = getDay(new Date(val)) === 0;
        if (isSunday || isHoliday) {
          holidayDates.push({
            date: new Date(val),
            name: val.summary
          });
        }
      });
    }

    return holidayDates ? holidayDates.sort((a, b) => a.date.getTime() - b.date.getTime()) : [];
  } catch (error) {
    console.log(error);
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isPublicHoliday = async (date: any): Promise<boolean> => {
  const { GOOGLE_CALENDAR } = process.env;
  try {
    const result = await axios.get(GOOGLE_CALENDAR);
    const holidays = result.data.items;
    const isHoliday = holidays.some((value: any) => isSameDay(new Date(value.start.date), new Date(date)));
    const isSunday = getDay(new Date(date)) === 0;
    const isSaturday = getDay(new Date(date)) === 6;
    return isSunday || isHoliday || isSaturday;
  } catch (error) {
    console.log(error);
  }
};

export const generateWithOpenAI = async (prompt: string): Promise<any> => {
  try {
    const { OPENAI_API_KEY } = process.env;
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not defined');
    }

    const client = new OpenAI({
      apiKey: OPENAI_API_KEY,
      defaultHeaders: {
        'OpenAI-Project': 'proj_yKwPA8hdxUDojQF8h6kIA3du'
      }
    });

    const response = await client.responses.create({
      model: 'gpt-4o-mini-2024-07-18',
      input: `Prompt: "${prompt}"\n\nYou are an expert air conditioning technician.\nPlease rewrite 3 to 4 English with completed tasks or item as technician of air conditioning.\n\nFormat:\n- ...\n- ...\n- ...\n\nOnly return completions. Do not repeat this instruction or include it in the output.`
    });

    if (response.output_text) {
      const suggestions = response.output_text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-'))
        .map(line => line.replace('- ', '').trim());

      return suggestions;
    } else {
      throw new Error('No suggestions found');
    }
  } catch (error) {
    throw error;
  }
};

export const spellingCheck = async (prompt: string): Promise<any> => {
  try {
    const { OPENAI_API_KEY } = process.env;
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not defined');
    }

    const client = new OpenAI({
      apiKey: OPENAI_API_KEY,
      defaultHeaders: {
        'OpenAI-Project': 'proj_yKwPA8hdxUDojQF8h6kIA3du'
      }
    });

    const response = await client.responses.create({
      model: 'gpt-4o-mini-2024-07-18',
      input: `Prompt: "${prompt}"\n\nYou are an expert air conditioning technician.\nPlease check the spelling of the following text and return the corrected text.\n\nFormat: "..."`
    });

    if (response.output_text) {
      return response.output_text.replace(/^"(.*)"$/, '$1');
    } else {
      throw new Error('No suggestions found');
    }
  } catch (error) {
    throw error;
  }
};

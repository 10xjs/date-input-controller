// @flow

// flowlint unclear-type:off

import type {State} from './types';

export const isInt = (val: mixed): boolean %checks => {
  return typeof val === 'number' && val === (val | 0);
};

export const flow: $ComposeReverse = ((...functions) => (value) => {
  return functions.reduce((intermediate, next) => next(intermediate), value);
}: any);

export const daysInMonth = (year: number, month: number): number => {
  // Create a date object at the last day of the selected month by using
  // referencing the 0th date of the next month.
  const date = new Date(year, month + 1, 0);
  return date.getDate();
};

// Check it two values represent equal dates at second precision.
export const areEqualDates = (a: ?Date, b: ?Date): boolean => {
  if (a && b && a instanceof Date && b instanceof Date) {
    return ((a.getTime() / 1000) | 0) === ((b.getTime() / 1000) | 0);
  }

  return true;
};

export const getYear = (date: Date, utc: boolean = false): number => {
  if (utc) {
    return date.getUTCFullYear();
  }
  return date.getFullYear();
};

export const getMonth = (date: Date, utc: boolean = false): number => {
  if (utc) {
    return date.getUTCMonth();
  }
  return date.getMonth();
};

export const getDay = (date: Date, utc: boolean = false): number => {
  if (utc) {
    return date.getUTCDate();
  }
  return date.getDate();
};

export const getHour = (date: Date, utc: boolean = false): number => {
  if (utc) {
    return date.getUTCHours();
  }
  return date.getHours();
};

export const getMinute = (date: Date, utc: boolean = false): number => {
  if (utc) {
    return date.getUTCMinutes();
  }
  return date.getMinutes();
};

export const getSecond = (date: Date, utc: boolean = false): number => {
  if (utc) {
    return date.getUTCSeconds();
  }
  return date.getSeconds();
};

export const dateValue = (state: State): Date => {
  const args = [
    state.year.props.value,
    state.month.props.value,
    state.day.props.value,
    state.hour.props.value,
    state.minute.props.value,
    state.second.props.value,
  ];

  if (state.utc) {
    return new Date(Date.UTC(...args));
  }

  return new Date(...args);
};

export const getSecondMin = (state: State): number => {
  const min = state.min;

  if (
    min &&
    state.year.props.value === getYear(min, state.utc) &&
    state.month.props.value === getMonth(min, state.utc) &&
    state.day.props.value === getDay(min, state.utc) &&
    state.hour.props.value === getHour(min, state.utc) &&
    state.minute.props.value === getMinute(min, state.utc)
  ) {
    return getSecond(min, state.utc);
  }

  return 0;
};

export const getSecondMax = (state: State): number => {
  const max = state.max;

  if (
    max &&
    state.year.props.value === getYear(max, state.utc) &&
    state.month.props.value === getMonth(max, state.utc) &&
    state.day.props.value === getDay(max, state.utc) &&
    state.hour.props.value === getHour(max, state.utc) &&
    state.minute.props.value === getMinute(max, state.utc)
  ) {
    return getSecond(max, state.utc);
  }

  return 59;
};

export const updateSecond = (value: number) => (state: State) => {
  let nextState = state;

  const secondMin = getSecondMin(state);
  const secondMax = getSecondMax(state);
  const second = Math.max(Math.min(value, secondMax), secondMin);

  if (
    second !== state.second.props.value ||
    secondMin !== state.second.min ||
    secondMax !== state.second.max
  ) {
    nextState = {
      ...state,
      second: {
        ...state.second,
        value: second,
        min: secondMin,
        max: secondMax,
      },
    };
  }

  return nextState;
};

export const getMinuteMin = (state: State): number => {
  const min = state.min;

  if (
    min &&
    state.year.props.value === getYear(min, state.utc) &&
    state.month.props.value === getMonth(min, state.utc) &&
    state.day.props.value === getDay(min, state.utc) &&
    state.hour.props.value === getHour(min, state.utc)
  ) {
    return getMinute(min, state.utc);
  }

  return 0;
};

export const getMinuteMax = (state: State): number => {
  const max = state.max;

  if (
    max &&
    state.year.props.value === getYear(max, state.utc) &&
    state.month.props.value === getMonth(max, state.utc) &&
    state.day.props.value === getDay(max, state.utc) &&
    state.hour.props.value === getHour(max, state.utc)
  ) {
    return getMinute(max, state.utc);
  }

  return 59;
};

export const updateMinute = (value: number) => (state: State) => {
  let nextState = state;

  const minuteMin = getMinuteMin(state);
  const minuteMax = getMinuteMax(state);
  const minute = Math.max(Math.min(value, minuteMax), minuteMin);

  if (
    minute !== state.minute.props.value ||
    minuteMin !== state.minute.min ||
    minuteMax !== state.minute.max
  ) {
    nextState = {
      ...state,
      minute: {
        ...state.minute,
        value: minute,
        min: minuteMin,
        max: minuteMax,
      },
    };
  }

  return nextState;
};

export const getHourMin = (state: State): number => {
  const min = state.min;

  if (
    min &&
    state.year.props.value === getYear(min, state.utc) &&
    state.month.props.value === getMonth(min, state.utc) &&
    state.day.props.value === getDay(min, state.utc)
  ) {
    return getHour(min, state.utc);
  }

  return 0;
};

export const getHourMax = (state: State): number => {
  const max = state.max;

  if (
    max &&
    state.year.props.value === getYear(max, state.utc) &&
    state.month.props.value === getMonth(max, state.utc) &&
    state.day.props.value === getDay(max, state.utc)
  ) {
    return getHour(max, state.utc);
  }

  return 23;
};

export const updateHour = (value: number) => (state: State) => {
  let nextState = state;

  const hourMin = getHourMin(state);
  const hourMax = getHourMax(state);
  const hour = Math.max(Math.min(value, hourMax), hourMin);

  if (
    hour !== state.hour.props.value ||
    hourMin !== state.hour.min ||
    hourMax !== state.hour.max
  ) {
    nextState = {
      ...state,
      hour: {
        ...state.hour,
        value: hour,
        min: hourMin,
        max: hourMax,
      },
    };
  }

  return nextState;
};

export const getDayMin = (state: State): number => {
  const min = state.min;

  if (
    min &&
    state.year.props.value === getYear(min, state.utc) &&
    state.month.props.value === getMonth(min, state.utc)
  ) {
    return getDay(min, state.utc);
  }

  return 0;
};

export const getDayMax = (state: State): number => {
  const max = state.max;

  if (
    max &&
    state.year.props.value === getYear(max, state.utc) &&
    state.month.props.value === getMonth(max, state.utc)
  ) {
    return getDay(max, state.utc);
  }

  return daysInMonth(state.year.props.value, state.month.props.value);
};

export const updateDay = (value: number) => (state: State) => {
  let nextState = state;

  const dayMin = getDayMin(state);
  const dayMax = getDayMax(state);
  const day = Math.max(Math.min(value, dayMax), dayMin);

  if (
    day !== state.day.props.value ||
    dayMin !== state.day.min ||
    dayMax !== state.day.max
  ) {
    nextState = {
      ...state,
      day: {
        ...state.day,
        value: day,
        min: dayMin,
        max: dayMax,
      },
    };
  }

  return nextState;
};

export const getMonthMin = (state: State): number => {
  const min = state.min;

  if (min && state.year.props.value === getYear(min, state.utc)) {
    return getMonth(min, state.utc);
  }

  return 0;
};

export const getMonthMax = (state: State): number => {
  const max = state.max;

  if (max && state.year.props.value === getYear(max, state.utc)) {
    return getMonth(max, state.utc);
  }

  return 11;
};

export const updateMonth = (value: number) => (state: State) => {
  let nextState = state;

  const monthMin = getMonthMin(state);
  const monthMax = getMonthMax(state);
  const month = Math.max(Math.min(value, monthMax), monthMin);

  if (
    month !== state.month.props.value ||
    monthMin !== state.month.min ||
    monthMax !== state.month.max
  ) {
    nextState = {
      ...state,
      month: {
        ...state.month,
        value: month,
        min: monthMin,
        max: monthMax,
      },
    };
  }

  return nextState;
};

export const getYearMin = (state: State): number | null => {
  const min = state.min;

  if (min) {
    return getYear(min, state.utc);
  }

  return null;
};

export const getYearMax = (state: State): number | null => {
  const max = state.max;

  if (max) {
    return getYear(max, state.utc);
  }

  return null;
};

export const updateYear = (value: number) => (state: State) => {
  let nextState = state;

  const yearMin = getYearMin(state);
  const yearMax = getYearMax(state);

  let year = value;

  if (yearMin !== null) {
    year = Math.max(year, yearMin);
  }

  if (yearMax !== null) {
    year = Math.min(year, yearMax);
  }

  if (
    year !== state.year.props.value ||
    yearMin !== state.year.min ||
    yearMax !== state.year.max
  ) {
    nextState = {
      ...state,
      year: {
        ...state.year,
        value: year,
        min: yearMin,
        max: yearMax,
      },
    };
  }

  return nextState;
};

export const createIsEvent = (EventClass: Function) => (
  _event: mixed,
): boolean => {
  if (_event instanceof EventClass) {
    return true;
  }

  // Duck-type SyntheticEvent instances
  if (_event !== null && _event !== undefined && typeof _event === 'object') {
    const constructor = _event.constructor;

    if (constructor !== null && constructor !== undefined) {
      const name = constructor.name;
      return /^Synthetic[A-Z]*[a-z]*Event$/.test(name);
    }
  }

  return false;
};

export const isEvent = createIsEvent(Event);

export const createCastEvent = (EventClass: Function) => {
  const isEvent = createIsEvent(EventClass);

  return <T>(event: mixed): Event | SyntheticEvent<T> | null => {
    return isEvent(event) ? (event: any) : null;
  };
};

export const castEvent = createCastEvent(Event);

export const createParseEvent = (
  EventClass: Function,
  HTMLElementClass: Function,
) => {
  const castEvent = createCastEvent(EventClass);

  return (eventOrValue: mixed): mixed => {
    const event = castEvent(eventOrValue);

    if (!event) {
      return eventOrValue;
    }

    if (event.target instanceof HTMLElementClass) {
      return event.target.value;
    }

    return undefined;
  };
};

export const parseEvent = createParseEvent(Event, HTMLElement);

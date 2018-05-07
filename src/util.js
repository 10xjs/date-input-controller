// @flow strict

import type {State, Fields, FieldActions} from './types';
import type DateInputController from './DateInputController';

export const isInt = (val: mixed): boolean %checks => {
  return typeof val === 'number' && val === (val | 0);
};

export const daysInMonth = (year: number, month: number): number => {
  // Create a date object at the last day of the selected month by using
  // referencing the 0th date of the next month.
  const date = new Date(year, month + 1, 0);
  return date.getDate();
};

// Check it two values represent equal dates at second precision.
// This comparison ROUNDS DOWN TO THE PREVIOUS SECOND.
export const areEqualDates = (a: ?Date, b: ?Date): boolean => {
  return (
    a === b ||
    (a instanceof Date &&
      b instanceof Date &&
      ((a.getTime() / 1000) | 0) === ((b.getTime() / 1000) | 0))
  );
};

export const getDateField = [
  (date: Date, utc: boolean): number =>
    utc ? date.getUTCFullYear() : date.getFullYear(),
  (date: Date, utc: boolean): number =>
    utc ? date.getUTCMonth() : date.getMonth(),
  (date: Date, utc: boolean): number =>
    utc ? date.getUTCDate() : date.getDate(),
  (date: Date, utc: boolean): number =>
    utc ? date.getUTCHours() : date.getHours(),
  (date: Date, utc: boolean): number =>
    utc ? date.getUTCMinutes() : date.getMinutes(),
  (date: Date, utc: boolean): number =>
    utc ? date.getUTCSeconds() : date.getSeconds(),
];

export const fieldKeys = ['year', 'month', 'day', 'hour', 'minute', 'second'];

export const getValue = (state: Fields, index: number): number =>
  state[fieldKeys[index]].props.value;

const setField = (state: State, index: number, update): State => {
  const key = fieldKeys[index];
  const result = Object.assign({}, state);
  // $ExpectError Flow doesn't understand that state[key] === state[key]
  result[key] = (Object.assign({}, state[key], update): any);
  return result;
};
const setValue = (state: State, index: number, value): State => {
  const key = fieldKeys[index];
  return setField(state, index, {
    props: Object.assign({}, state[key].props, {
      value,
    }),
  });
};

export const dateValue = (state: State): Date => {
  const args = fieldKeys.map((_, i) => getValue(state, i));
  if (state.utc) {
    return new Date(Date.UTC.apply(null, args));
  }
  // $ExpectError Flow doesn't like us touching Date.bind
  return new (Date.bind.apply(Date, [null].concat(args)))();
};

// Min Max Calc
const atMin = (state: State, index: number) => {
  if (index < 0) {
    return true;
  }

  const min = state.min;
  return (
    min &&
    ((index === 0 ? true : atMin(state, index - 1)) &&
      getDateField[index](min, state.utc) >= getValue(state, index))
  );
};

const atMax = (state: State, index: number) => {
  if (index < 0) {
    return true;
  }

  const max = state.max;
  return (
    max &&
    ((index === 0 ? true : atMax(state, index - 1)) &&
      getDateField[index](max, state.utc) <= getValue(state, index))
  );
};

export const defaultMin = [null, 0, 1, 0, 0, 0];
export const defaultMax = [null, 11, null, 23, 59, 59];

const resolveDefaultMax = (state: State, index: number) => {
  return index === 2
    ? daysInMonth(getValue(state, 0), getValue(state, 1))
    : defaultMax[index];
};

export const getMin = (state: State, index: number) => {
  const min = state.min;
  // If min date is defined and the next-largest field is at its min value...
  return min && atMin(state, index - 1)
    ? // return the value of the min date at the current field...
      getDateField[index](min, state.utc)
    : // or return a default min value for the field.
      defaultMin[index];
};

export const getMax = (state: State, index: number) => {
  const max = state.max;
  // If max date is defined and the next-largest field is at its max value...
  return max && atMax(state, index - 1)
    ? // return the value of the max date at the current field...
      getDateField[index](max, state.utc)
    : // or return a default max value for the field.
      resolveDefaultMax(state, index);
};

export const updateField = (index: number, value: number) => (
  state: State,
): State => {
  const key = fieldKeys[index];
  let nextState = state;

  const min = getMin(state, index);
  const max = getMax(state, index);

  let nextValue = value;

  if (min !== null && nextValue < min) {
    nextValue = min;
  } else if (max !== null && nextValue > max) {
    nextValue = max;
  }

  // console.log('getValue', key, state);

  if (nextValue !== getValue(state, index)) {
    nextState = setValue(nextState, index, nextValue);
  }

  if (min !== state[key].min || max !== state[key].max) {
    nextState = setField(nextState, index, {min, max});
  }

  return nextState;
};

export const createIsEvent = (EventClass: Class<mixed>) => (
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

export const createCastEvent = (EventClass: Class<mixed>) => {
  const isEvent = createIsEvent(EventClass);

  return <T>(event: mixed) => {
    // $ExpectError Cast our duck-typed event through any
    return isEvent(event) ? ((event: any): Event | SyntheticEvent<T>) : null;
  };
};

export const createParseEvent = (
  EventClass: Class<mixed>,
  HTMLElementClass: Class<mixed>,
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

export const createGetInitialState = (
  Event: Class<mixed>,
  HTMLElement: Class<mixed>,
) => {
  const parseEvent = createParseEvent(Event, HTMLElement);

  return (
    target: DateInputController,
  ): {state: State, actions: FieldActions} => {
    const updaters = [];

    const actions: $Shape<FieldActions> = {};
    let state: $Shape<State> = {
      value:
        target.props.value === undefined ? new Date(0) : target.props.value,
      min: target.props.min,
      max: target.props.max,
      utc: target.props.utc,
    };

    fieldKeys.forEach((field, i) => {
      updaters.push(updateField(i, getDateField[i](state.value, state.utc)));

      const setter = (value) => {
        const fields = {};
        fields[field] = value;
        target.setFields(fields);
      };

      actions[`set${field.charAt(0).toUpperCase()}${field.slice(1)}`] = setter;

      // $ExpectError min and max values will be populated in update loop
      state[field] = {
        props: {
          onChange: (event: mixed) => setter(Number(parseEvent(event))),
        },
      };
    });

    Object.assign(state, actions);

    state = updaters.reduce((state, updater) => updater(state), state);
    state.value = dateValue(state);

    return {state, actions};
  };
};

export const getInitialState = createGetInitialState(Event, HTMLElement);

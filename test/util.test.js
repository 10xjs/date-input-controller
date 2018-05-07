// @flow strict

import type DateInputController from '../src/DateInputController';

import {
  isInt,
  daysInMonth,
  areEqualDates,
  getDateField,
  getValue,
  dateValue,
  getMin,
  getMax,
  updateField,
  createIsEvent,
  createCastEvent,
  createParseEvent,
  createGetInitialState,
} from '../src/util';

const withDate = (date: Date, cb: (Date) => void) => {
  return describe(`with date: ${date.getTime()}`, () => cb(date));
};

class MockHTMLElement {
  value: string | void;
  checked: boolean | void;
  type: string | void;

  constructor(config: {value?: string, checked?: boolean, type?: string} = {}) {
    this.value = config.value;
    this.checked = config.checked;
    this.type = config.type;
  }
}

class MockEvent {
  defaultPrevented: boolean;
  target: mixed;

  constructor(target: mixed) {
    this.defaultPrevented = false;
    this.target = target;
  }
  preventDefault() {
    this.defaultPrevented = true;
  }
}

const isEvent = createIsEvent(MockEvent);
const castEvent = createCastEvent(MockEvent);
const parseEvent = createParseEvent(MockEvent, MockHTMLElement);
const getInitialState = createGetInitialState(MockEvent, MockHTMLElement);

const getInstance = ({
  // Use the current to get additional coverage each time the tests are run.
  value,
  min,
  max,
  utc = false,
}: {
  value: Date,
  min?: Date,
  max?: Date,
  utc?: boolean,
}) => {
  const instance = (({
    props: {value, min, max, utc, children() {}, onChange() {}},
    setFields: jest.fn(),
    // $ExpectError cast mock instance through any
  }: any): DateInputController);

  const {state, actions} = getInitialState(instance);

  Object.assign(instance, actions);
  instance.state = state;

  return instance;
};

const getState = (props) => getInstance(props).state;

describe('utils', () => {
  describe('assignFieldState', () => {
    withDate(new Date(1984, 0, 24, 10, 0, 0), (date) => {
      let instance;

      beforeEach(() => {
        instance = getInstance({value: date});
      });

      it('should assign the correct field values', () => {
        expect(instance.state.year).toMatchObject({
          props: {value: 1984},
          min: null,
          max: null,
        });
        expect(instance.state.month).toMatchObject({
          props: {value: 0},
          min: 0,
          max: 11,
        });
        expect(instance.state.day).toMatchObject({
          props: {value: 24},
          min: 1,
          max: 31,
        });
        expect(instance.state.hour).toMatchObject({
          props: {value: 10},
          min: 0,
          max: 23,
        });
        expect(instance.state.minute).toMatchObject({
          props: {value: 0},
          min: 0,
          max: 59,
        });
        expect(instance.state.second).toMatchObject({
          props: {value: 0},
          min: 0,
          max: 59,
        });
      });

      it('should assign year methods', () => {
        instance.state.year.props.onChange(0);
        instance.setYear(1);

        expect(instance.setFields.mock.calls).toHaveLength(2);
        expect(instance.setFields.mock.calls[0][0]).toEqual({year: 0});
        expect(instance.setFields.mock.calls[1][0]).toEqual({year: 1});
      });

      it('should assign month methods', () => {
        instance.state.month.props.onChange(0);
        instance.setMonth(1);

        expect(instance.setFields.mock.calls).toHaveLength(2);
        expect(instance.setFields.mock.calls[0][0]).toEqual({month: 0});
        expect(instance.setFields.mock.calls[1][0]).toEqual({month: 1});
      });

      it('should assign day methods', () => {
        instance.state.day.props.onChange(0);
        instance.setDay(1);

        expect(instance.setFields.mock.calls).toHaveLength(2);
        expect(instance.setFields.mock.calls[0][0]).toEqual({day: 0});
        expect(instance.setFields.mock.calls[1][0]).toEqual({day: 1});
      });

      it('should assign hour methods', () => {
        instance.state.hour.props.onChange(0);
        instance.setHour(1);

        expect(instance.setFields.mock.calls).toHaveLength(2);
        expect(instance.setFields.mock.calls[0][0]).toEqual({hour: 0});
        expect(instance.setFields.mock.calls[1][0]).toEqual({hour: 1});
      });

      it('should assign minute methods', () => {
        instance.state.minute.props.onChange(0);
        instance.setMinute(1);

        expect(instance.setFields.mock.calls).toHaveLength(2);
        expect(instance.setFields.mock.calls[0][0]).toEqual({minute: 0});
        expect(instance.setFields.mock.calls[1][0]).toEqual({minute: 1});
      });

      it('should assign second methods', () => {
        instance.state.second.props.onChange(0);
        instance.setSecond(1);

        expect(instance.setFields.mock.calls).toHaveLength(2);
        expect(instance.setFields.mock.calls[0][0]).toEqual({second: 0});
        expect(instance.setFields.mock.calls[1][0]).toEqual({second: 1});
      });
    });
  });

  describe('isInt', () => {
    it('should check if value is an integer', () => {
      expect(isInt(0)).toBe(true);
      expect(isInt(-1)).toBe(true);
      expect(isInt(1)).toBe(true);
      expect(isInt(1.0)).toBe(true);

      expect(isInt(0.5)).toBe(false);
      expect(isInt(null)).toBe(false);
      expect(isInt(false)).toBe(false);
      expect(isInt(undefined)).toBe(false);
      expect(isInt(NaN)).toBe(false);
    });
  });

  describe('daysInMonth', () => {
    it('should return the number of days for a given year and month', () => {
      expect(daysInMonth(2018, 1)).toBe(28);
    });
  });

  describe('areEqualDates', () => {
    withDate(new Date(), (date) => {
      it('should check that two dates are equal', () => {
        const b = new Date(date.getTime());

        expect(areEqualDates(date, b)).toBe(true);

        expect(areEqualDates(null, null)).toBe(true);
        expect(areEqualDates(undefined, undefined)).toBe(true);
        expect(areEqualDates(null, undefined)).toBe(false);
      });

      it('should round down to current second', () => {
        // Use the current to get additional coverage each time the tests are run.
        const seconds = (date.getTime() / 1000) | 0;

        const b = new Date(seconds * 1000 + 1);
        const c = new Date(seconds * 1000 - 1);

        expect(areEqualDates(date, b)).toBe(true);
        expect(areEqualDates(date, c)).toBe(false);
      });
    });
  });

  describe('getDateField', () => {
    withDate(new Date(), (date) => {
      it('should extract the correct field from a date object', () => {
        expect(getDateField[0](date, false)).toEqual(date.getFullYear());
        expect(getDateField[1](date, false)).toEqual(date.getMonth());
        expect(getDateField[2](date, false)).toEqual(date.getDate());
        expect(getDateField[3](date, false)).toEqual(date.getHours());
        expect(getDateField[4](date, false)).toEqual(date.getMinutes());
        expect(getDateField[5](date, false)).toEqual(date.getSeconds());
      });

      it('should extract the correct field from a date object in UTC', () => {
        expect(getDateField[0](date, true)).toEqual(date.getUTCFullYear());
        expect(getDateField[1](date, true)).toEqual(date.getUTCMonth());
        expect(getDateField[2](date, true)).toEqual(date.getUTCDate());
        expect(getDateField[3](date, true)).toEqual(date.getUTCHours());
        expect(getDateField[4](date, true)).toEqual(date.getUTCMinutes());
        expect(getDateField[5](date, true)).toEqual(date.getUTCSeconds());
      });
    });
  });

  describe('getValue', () => {
    withDate(new Date(), (date) => {
      let state;

      beforeEach(() => {
        state = getState({value: date});
      });

      it('should extract the correct value from state', () => {
        expect(getValue(state, 0)).toEqual(state.year.props.value);
        expect(getValue(state, 1)).toEqual(state.month.props.value);
        expect(getValue(state, 2)).toEqual(state.day.props.value);
        expect(getValue(state, 3)).toEqual(state.hour.props.value);
        expect(getValue(state, 4)).toEqual(state.minute.props.value);
        expect(getValue(state, 5)).toEqual(state.second.props.value);
      });
    });
  });

  describe('dateValue', () => {
    withDate(new Date(), (date) => {
      let state;

      beforeEach(() => {
        state = getState({value: date});
      });

      it('should return a Date representation of the state', () => {
        expect(dateValue(state).getTime()).toEqual(
          new Date(
            state.year.props.value,
            state.month.props.value,
            state.day.props.value,
            state.hour.props.value,
            state.minute.props.value,
            state.second.props.value,
          ).getTime(),
        );
      });

      it('should return a Date representation of the state in UTC', () => {
        state.utc = true;

        expect(dateValue(state).getTime()).toEqual(
          Date.UTC(
            state.year.props.value,
            state.month.props.value,
            state.day.props.value,
            state.hour.props.value,
            state.minute.props.value,
            state.second.props.value,
          ),
        );
      });
    });
  });

  describe('getMin', () => {
    withDate(new Date(1892, 4, 22, 6, 25, 7), (date) => {
      it('should return default min values with no min date set', () => {
        const state = getState({value: date});

        expect(getMin(state, 0)).toBe(null);
        expect(getMin(state, 1)).toBe(0);
        expect(getMin(state, 2)).toBe(1);
        expect(getMin(state, 3)).toBe(0);
        expect(getMin(state, 4)).toBe(0);
        expect(getMin(state, 5)).toBe(0);
      });

      it('should return correct min year value', () => {
        const min = new Date(
          date.getFullYear() - 1,
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
        );

        const state = getState({value: date, min});

        expect(getMin(state, 0)).toBe(min.getFullYear());
        expect(getMin(state, 1)).toBe(0);
        expect(getMin(state, 2)).toBe(1);
        expect(getMin(state, 3)).toBe(0);
        expect(getMin(state, 4)).toBe(0);
        expect(getMin(state, 5)).toBe(0);
      });

      it('should return correct min month value', () => {
        const min = new Date(
          date.getFullYear(),
          date.getMonth() - 1,
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
        );

        const state = getState({value: date, min});

        expect(getMin(state, 0)).toBe(min.getFullYear());
        expect(getMin(state, 1)).toBe(min.getMonth());
        expect(getMin(state, 2)).toBe(1);
        expect(getMin(state, 3)).toBe(0);
        expect(getMin(state, 4)).toBe(0);
        expect(getMin(state, 5)).toBe(0);
      });

      it('should return correct min day value', () => {
        const min = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() - 1,
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
        );

        const state = getState({value: date, min});

        expect(getMin(state, 0)).toBe(min.getFullYear());
        expect(getMin(state, 1)).toBe(min.getMonth());
        expect(getMin(state, 2)).toBe(min.getDate());
        expect(getMin(state, 3)).toBe(0);
        expect(getMin(state, 4)).toBe(0);
        expect(getMin(state, 5)).toBe(0);
      });

      it('should return correct min hour value', () => {
        const min = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours() - 1,
          date.getMinutes(),
          date.getSeconds(),
        );

        const state = getState({value: date, min});

        expect(getMin(state, 0)).toBe(min.getFullYear());
        expect(getMin(state, 1)).toBe(min.getMonth());
        expect(getMin(state, 2)).toBe(min.getDate());
        expect(getMin(state, 3)).toBe(min.getHours());
        expect(getMin(state, 4)).toBe(0);
        expect(getMin(state, 5)).toBe(0);
      });

      it('should return correct min minute value', () => {
        const min = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes() - 1,
          date.getSeconds(),
        );

        const state = getState({value: date, min});

        expect(getMin(state, 0)).toBe(min.getFullYear());
        expect(getMin(state, 1)).toBe(min.getMonth());
        expect(getMin(state, 2)).toBe(min.getDate());
        expect(getMin(state, 3)).toBe(min.getHours());
        expect(getMin(state, 4)).toBe(min.getMinutes());
        expect(getMin(state, 5)).toBe(0);
      });

      it('should return correct min second value', () => {
        const min = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds() - 1,
        );

        const state = getState({value: date, min});

        expect(getMin(state, 0)).toBe(min.getFullYear());
        expect(getMin(state, 1)).toBe(min.getMonth());
        expect(getMin(state, 2)).toBe(min.getDate());
        expect(getMin(state, 3)).toBe(min.getHours());
        expect(getMin(state, 4)).toBe(min.getMinutes());
        expect(getMin(state, 5)).toBe(min.getSeconds());
      });
    });
  });

  describe('getMax', () => {
    withDate(new Date(1892, 4, 22, 6, 25, 7), (date) => {
      it('should return default max values with no max date set', () => {
        const state = getState({value: date});

        expect(getMax(state, 0)).toBe(null);
        expect(getMax(state, 1)).toBe(11);
        expect(getMax(state, 2)).toBe(
          daysInMonth(date.getFullYear(), date.getMonth()),
        );
        expect(getMax(state, 3)).toBe(23);
        expect(getMax(state, 4)).toBe(59);
        expect(getMax(state, 5)).toBe(59);
      });

      it('should return correct max year value', () => {
        const max = new Date(
          date.getFullYear() + 1,
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
        );

        const state = getState({value: date, max});

        expect(getMax(state, 0)).toBe(max.getFullYear());
        expect(getMax(state, 1)).toBe(11);
        expect(getMax(state, 2)).toBe(
          daysInMonth(date.getFullYear(), date.getMonth()),
        );
        expect(getMax(state, 3)).toBe(23);
        expect(getMax(state, 4)).toBe(59);
        expect(getMax(state, 5)).toBe(59);
      });

      it('should return correct max month value', () => {
        const max = new Date(
          date.getFullYear(),
          date.getMonth() + 1,
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
        );

        const state = getState({value: date, max});

        expect(getMax(state, 0)).toBe(max.getFullYear());
        expect(getMax(state, 1)).toBe(max.getMonth());
        expect(getMax(state, 2)).toBe(
          daysInMonth(date.getFullYear(), date.getMonth()),
        );
        expect(getMax(state, 3)).toBe(23);
        expect(getMax(state, 4)).toBe(59);
        expect(getMax(state, 5)).toBe(59);
      });

      it('should return correct max day value', () => {
        const max = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + 1,
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
        );

        const state = getState({value: date, max});

        expect(getMax(state, 0)).toBe(max.getFullYear());
        expect(getMax(state, 1)).toBe(max.getMonth());
        expect(getMax(state, 2)).toBe(max.getDate());
        expect(getMax(state, 3)).toBe(23);
        expect(getMax(state, 4)).toBe(59);
        expect(getMax(state, 5)).toBe(59);
      });

      it('should return correct max hour value', () => {
        const max = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours() + 1,
          date.getMinutes(),
          date.getSeconds(),
        );

        const state = getState({value: date, max});

        expect(getMax(state, 0)).toBe(max.getFullYear());
        expect(getMax(state, 1)).toBe(max.getMonth());
        expect(getMax(state, 2)).toBe(max.getDate());
        expect(getMax(state, 3)).toBe(max.getHours());
        expect(getMax(state, 4)).toBe(59);
        expect(getMax(state, 5)).toBe(59);
      });

      it('should return correct max minute value', () => {
        const max = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes() + 1,
          date.getSeconds(),
        );

        const state = getState({value: date, max});

        expect(getMax(state, 0)).toBe(max.getFullYear());
        expect(getMax(state, 1)).toBe(max.getMonth());
        expect(getMax(state, 2)).toBe(max.getDate());
        expect(getMax(state, 3)).toBe(max.getHours());
        expect(getMax(state, 4)).toBe(max.getMinutes());
        expect(getMax(state, 5)).toBe(59);
      });

      it('should return correct max second value', () => {
        const max = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds() - 1,
        );

        const state = getState({value: date, max});

        expect(getMax(state, 0)).toBe(max.getFullYear());
        expect(getMax(state, 1)).toBe(max.getMonth());
        expect(getMax(state, 2)).toBe(max.getDate());
        expect(getMax(state, 3)).toBe(max.getHours());
        expect(getMax(state, 4)).toBe(max.getMinutes());
        expect(getMax(state, 5)).toBe(max.getSeconds());
      });
    });
  });

  describe('updateField', () => {
    let state;

    beforeEach(() => {
      state = getState({
        min: new Date(1990, 8, 30, 18, 40, 40),
        value: new Date(1993, 6, 20, 12, 30, 30),
        max: new Date(1996, 4, 10, 6, 20, 20),
      });
    });

    it('not update state if change is idempotent', () => {
      expect(updateField(0, 1993)(state)).toBe(state);
      expect(updateField(1, 6)(state)).toBe(state);
      expect(updateField(2, 20)(state)).toBe(state);
      expect(updateField(3, 12)(state)).toBe(state);
      expect(updateField(4, 30)(state)).toBe(state);
      expect(updateField(5, 30)(state)).toBe(state);
    });

    it('should change the value of a field', () => {
      expect(updateField(0, 1992)(state).year.props.value).toBe(1992);
      expect(updateField(2, 13)(state).day.props.value).toBe(13);
      expect(updateField(4, 13)(state).minute.props.value).toBe(13);
    });

    it('should clamp to min value', () => {
      state = updateField(0, 1987)(state);
      state = updateField(1, state.month.props.value)(state);
      state = updateField(2, state.day.props.value)(state);
      state = updateField(3, state.hour.props.value)(state);
      state = updateField(4, state.minute.props.value)(state);
      state = updateField(5, state.second.props.value)(state);

      expect(state.year.props.value).toBe(1990);
      expect(state.month.props.value).toBe(8);
      expect(state.day.props.value).toBe(30);
      expect(state.hour.props.value).toBe(18);
      expect(state.minute.props.value).toBe(40);
      expect(state.second.props.value).toBe(40);
    });

    it('should clamp to max value', () => {
      state = updateField(0, 1999)(state);
      state = updateField(1, state.month.props.value)(state);
      state = updateField(2, state.day.props.value)(state);
      state = updateField(3, state.hour.props.value)(state);
      state = updateField(4, state.minute.props.value)(state);
      state = updateField(5, state.second.props.value)(state);

      expect(state.year.props.value).toBe(1996);
      expect(state.month.props.value).toBe(4);
      expect(state.day.props.value).toBe(10);
      expect(state.hour.props.value).toBe(6);
      expect(state.minute.props.value).toBe(20);
      expect(state.second.props.value).toBe(20);
    });
  });

  describe('isEvent', () => {
    it('should return true if the value is an Event or SyntheticEvent', () => {
      expect(isEvent(new MockEvent())).toEqual(true);
      expect(isEvent(new class SyntheticEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticAnimationEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticCompositionEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticInputEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticUIEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticFocusEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticKeyboardEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticMouseEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticDragEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticWheelEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticTouchEvent {}())).toEqual(true);
      expect(isEvent(new class SyntheticTransitionEvent {}())).toEqual(true);

      expect(isEvent(new class SomeInvalidEvent {}())).toEqual(false);
      expect(isEvent({constructor: null})).toEqual(false);
      expect(isEvent(null)).toEqual(false);
    });
  });

  describe('castEvent', () => {
    expect(castEvent(new MockEvent()) instanceof MockEvent).toEqual(true);
    expect(castEvent(new class SomeInvalidEvent {}())).toEqual(null);
  });

  describe('parseEvent', () => {
    it('should return non Event instances', () => {
      expect(parseEvent(null)).toEqual(null);
    });

    it('should return the value of a plain event target', () => {
      const event = new MockEvent(new MockHTMLElement({value: 'foo'}));

      expect(parseEvent(event)).toEqual('foo');
    });

    it('should return `undefined` with an invalid event target', () => {
      const event = new MockEvent({value: 'foo'});

      expect(parseEvent(event)).toEqual(undefined);
    });
  });
});

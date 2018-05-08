// @flow strict

import type DateInputController from '../src/DateInputController';

import {
  daysInMonth,
  areEqualDates,
  getDateField,
  getInitialState,
  dateValue,
  getMin,
  getMax,
  updateField,
} from '../src/util';

const withDate = (date: Date, cb: (Date) => void) => {
  return describe(`with date: ${date.getTime()}`, () => cb(date));
};

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
        expect(instance.state).toMatchObject({
          year: 1984,
          yearMin: null,
          yearMax: null,

          month: 0,
          monthMin: 0,
          monthMax: 11,

          day: 24,
          dayMin: 1,
          dayMax: 31,

          hour: 10,
          hourMin: 0,
          hourMax: 23,

          minute: 0,
          minuteMin: 0,
          minuteMax: 59,

          second: 0,
          secondMin: 0,
          secondMax: 59,
        });
      });

      it('should assign year methods', () => {
        instance.setYear(1);

        expect(instance.setFields.mock.calls).toHaveLength(1);
        expect(instance.setFields.mock.calls[0][0]).toEqual({year: 1});
      });

      it('should assign month methods', () => {
        instance.setMonth(1);

        expect(instance.setFields.mock.calls).toHaveLength(1);
        expect(instance.setFields.mock.calls[0][0]).toEqual({month: 1});
      });

      it('should assign day methods', () => {
        instance.setDay(1);

        expect(instance.setFields.mock.calls).toHaveLength(1);
        expect(instance.setFields.mock.calls[0][0]).toEqual({day: 1});
      });

      it('should assign hour methods', () => {
        instance.setHour(1);

        expect(instance.setFields.mock.calls).toHaveLength(1);
        expect(instance.setFields.mock.calls[0][0]).toEqual({hour: 1});
      });

      it('should assign minute methods', () => {
        instance.setMinute(1);

        expect(instance.setFields.mock.calls).toHaveLength(1);
        expect(instance.setFields.mock.calls[0][0]).toEqual({minute: 1});
      });

      it('should assign second methods', () => {
        instance.setSecond(1);

        expect(instance.setFields.mock.calls).toHaveLength(1);
        expect(instance.setFields.mock.calls[0][0]).toEqual({second: 1});
      });
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

  describe('dateValue', () => {
    withDate(new Date(), (date) => {
      let state;

      beforeEach(() => {
        state = getState({value: date});
      });

      it('should return a Date representation of the state', () => {
        expect(dateValue(state).getTime()).toEqual(
          new Date(
            state.year,
            state.month,
            state.day,
            state.hour,
            state.minute,
            state.second,
          ).getTime(),
        );
      });

      it('should return a Date representation of the state in UTC', () => {
        state.utc = true;

        expect(dateValue(state).getTime()).toEqual(
          Date.UTC(
            state.year,
            state.month,
            state.day,
            state.hour,
            state.minute,
            state.second,
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
      expect(updateField(0, 1992)(state).year).toBe(1992);
      expect(updateField(2, 13)(state).day).toBe(13);
      expect(updateField(4, 13)(state).minute).toBe(13);
    });

    it('should clamp to min value', () => {
      state = updateField(0, 1987)(state);
      state = updateField(1, state.month)(state);
      state = updateField(2, state.day)(state);
      state = updateField(3, state.hour)(state);
      state = updateField(4, state.minute)(state);
      state = updateField(5, state.second)(state);

      expect(state.year).toBe(1990);
      expect(state.month).toBe(8);
      expect(state.day).toBe(30);
      expect(state.hour).toBe(18);
      expect(state.minute).toBe(40);
      expect(state.second).toBe(40);
    });

    it('should clamp to max value', () => {
      state = updateField(0, 1999)(state);
      state = updateField(1, state.month)(state);
      state = updateField(2, state.day)(state);
      state = updateField(3, state.hour)(state);
      state = updateField(4, state.minute)(state);
      state = updateField(5, state.second)(state);

      expect(state.year).toBe(1996);
      expect(state.month).toBe(4);
      expect(state.day).toBe(10);
      expect(state.hour).toBe(6);
      expect(state.minute).toBe(20);
      expect(state.second).toBe(20);
    });
  });
});

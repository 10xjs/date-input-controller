// @flow strict

import * as React from 'react';
import DateInputController from '../src/DateInputController';

const withDate = (date: Date, cb: (Date) => void) => {
  return describe(`with date: ${date.getTime()}`, () => cb(date));
};

const getInstance = ({
  value,
  min,
  max,
}: {
  value: Date,
  min?: Date,
  max?: Date,
}) => {
  const instance = new DateInputController({
    ...DateInputController.defaultProps,
    value,
    min,
    max,
    children() {},
  });

  // $ExpectError Cast instance as any to re-assign setState
  (instance: any).setState = (updater, callback) => {
    const nextState = updater(instance.state, instance.props);
    if (nextState !== null) {
      instance.state = nextState;
    }
    if (callback) {
      callback();
    }
  };

  return instance;
};

const shallowIntersect = (a: {}, b: {}): string | true => {
  const checked = new Set();
  const keys = Object.keys(a).concat(Object.keys(b));

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (checked.has(key)) {
      continue;
    }

    checked.add(key);

    if (a[key] === undefined || b[key] === undefined) {
      continue;
    }

    if (!Object.is(a[key], b[key])) {
      return key;
    }
  }

  return true;
};

describe('<DateInputController/>', () => {
  describe('static getDerivedStateFromProps', () => {
    withDate(new Date(1984, 0, 24, 10, 0, 0), (date) => {
      it('should not change state if props have not changed', () => {
        const instance = getInstance({value: date});

        const nextProps = {...instance.props};

        const state = DateInputController.getDerivedStateFromProps(
          nextProps,
          instance.state,
        );

        expect(state).toEqual(null);
      });

      it('should default undefined value to date with value 0', () => {
        const instance = getInstance({value: date});

        const nextProps = {...instance.props, value: undefined};

        const state = DateInputController.getDerivedStateFromProps(
          nextProps,
          instance.state,
        );

        expect(state.props.value.getTime()).toEqual(new Date(0).getTime());
      });

      it('should return updated state if value prop has changed', () => {
        const instance = getInstance({value: date});

        const nextDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + 4,
          date.getHours(),
          date.getMinutes(),
          date.getSeconds() + 10,
        );

        const nextProps = {...instance.props, value: nextDate};

        const state = (DateInputController.getDerivedStateFromProps(
          nextProps,
          instance.state,
          // $ExpectError cast nullable state as any
        ): any);

        const {value, day, second, props: _props, ...rest} = state;

        expect(day).toEqual(nextDate.getDate());

        expect(second).toEqual(nextDate.getSeconds());

        // it should update state date instance
        expect(value.getTime()).toBe(nextDate.getTime());

        // it should leave remaining state value unchanged
        expect(shallowIntersect(rest, instance.state)).toBe(true);
      });

      it('should return updated state if min prop has changed', () => {
        const instance = getInstance({value: date, min: date});

        const nextMin = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours() + 4,
          date.getMinutes(),
          date.getSeconds(),
        );

        const nextProps = {...instance.props, min: nextMin};

        const state = (DateInputController.getDerivedStateFromProps(
          nextProps,
          instance.state,
          // $ExpectError cast nullable state as any
        ): any);

        const {value, hour, hourMin, props, ...rest} = state;

        expect(value.getHours()).toBe(props.min.getHours());

        expect(hour).toBe(nextMin.getHours());

        expect(hourMin).toBe(nextMin.getHours());

        // it should leave remaining state value unchanged
        expect(shallowIntersect(rest, instance.state)).toBe(true);
      });

      it('should return updated state if max prop has changed', () => {
        const instance = getInstance({value: date, max: date});

        const nextMax = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          date.getHours() - 4,
          date.getMinutes(),
          date.getSeconds(),
        );

        const nextProps = {...instance.props, max: nextMax};

        const state = (DateInputController.getDerivedStateFromProps(
          nextProps,
          instance.state,
          // $ExpectError cast nullable state as any
        ): any);

        const {value, hour, hourMax, props, ...rest} = state;

        expect(value.getHours()).toBe(props.max.getHours());

        expect(hour).toBe(nextMax.getHours());

        expect(hourMax).toBe(nextMax.getHours());

        // it should leave remaining state value unchanged
        expect(shallowIntersect(rest, instance.state)).toBe(true);
      });

      it('should not update value if state has not changed', () => {
        const instance = getInstance({value: date});

        const nextProps = {...instance.props, max: date};

        const state = (DateInputController.getDerivedStateFromProps(
          nextProps,
          instance.state,
          // $ExpectError cast nullable state as any
        ): any);

        const {
          yearMax,
          monthMax,
          dayMax,
          hourMax,
          minuteMax,
          secondMax,
          props,
          ...rest
        } = state;

        expect(props.max).toBe(date);

        expect(yearMax).toBe(props.max.getFullYear());
        expect(monthMax).toBe(props.max.getMonth());
        expect(dayMax).toBe(props.max.getDate());
        expect(hourMax).toBe(props.max.getHours());
        expect(minuteMax).toBe(props.max.getMinutes());
        expect(secondMax).toBe(props.max.getSeconds());

        // it should leave remaining state value unchanged
        expect(shallowIntersect(rest, instance.state)).toBe(true);
      });

      it('should not overwrite state change with props', () => {
        const instance = getInstance({value: date});

        // Update internal state.
        instance.setFields({year: date.getFullYear() + 1});

        const state = DateInputController.getDerivedStateFromProps(
          instance.props,
          instance.state,
        );

        expect(state).toEqual(null);
      });
    });
  });

  describe('setFields', () => {
    withDate(new Date(1984, 0, 24, 10, 0, 0), (date) => {
      let instance;

      beforeEach(() => {
        instance = getInstance({value: date});
      });

      it('should throw if called with invalid value', () => {
        expect(() => {
          instance.setFields({year: 'foo'});
        }).toThrow('Expected int year. Received foo.');

        expect(() => {
          instance.setFields({year: 3.4});
        }).toThrow('Expected int year. Received 3.4.');
      });

      it('should not modify state with if change is idempotent', () => {
        const previousState = instance.state;

        instance.setFields({});
        instance.setFields({year: 1984, day: 24});
        expect(instance.state).toBe(previousState);
      });

      it('should update state with new field values', () => {
        const previousState = instance.state;

        instance.setFields({year: 1986, day: 12});

        const {value, year, day, ...rest} = instance.state;

        expect(year).toBe(1986);
        expect(day).toBe(12);

        // it should update state date instance
        expect(value.getTime()).toBe(new Date(1986, 0, 12, 10, 0, 0).getTime());

        // it should leave remaining state value unchanged
        expect(shallowIntersect(rest, previousState)).toBe(true);
      });

      it('should accept string values', () => {
        instance.setFields({year: '1986'});

        const {year} = instance.state;

        expect(year).toBe(1986);
      });

      it('should call onChange handler with updated date', () => {
        const onChange = jest.fn();
        instance.props = {...instance.props, onChange};

        instance.setFields({year: 1986, day: 12});

        expect(onChange.mock.calls).toHaveLength(1);
        expect(onChange.mock.calls[0][0]).toBeInstanceOf(Date);
        expect(onChange.mock.calls[0][0].getTime()).toBe(
          new Date(1986, 0, 12, 10, 0, 0).getTime(),
        );
      });
    });
  });

  describe('render', () => {
    withDate(new Date(1984, 0, 24, 10, 0, 0), (date) => {
      it('should return result of current state applied to children', () => {
        const instance = getInstance({value: date});
        const result = <div />;

        const children = jest.fn(() => result);
        instance.props = {...instance.props, children};

        expect(instance.render()).toBe(result);

        expect(children.mock.calls).toHaveLength(1);
        expect(children.mock.calls[0][0]).toBe(instance.state);
      });
    });
  });
});

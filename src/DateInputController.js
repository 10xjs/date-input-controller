// @flow strict

import * as React from 'react';

import type {Props, State, FieldName} from './types';

import {
  isInt,
  flow,
  daysInMonth,
  areEqualDates,
  getYear,
  getMonth,
  getDay,
  getHour,
  getMinute,
  getSecond,
  dateValue,
  updateYear,
  updateMonth,
  updateDay,
  updateHour,
  updateMinute,
  updateSecond,
  parseEvent,
} from './util';

const assertIntValue = (value: mixed, name: string) => {
  if (!isInt(value)) {
    throw new Error(`expected integer ${name}`);
  }
};

const initValue = new Date(0);

class DateInputController extends React.PureComponent<Props, State> {
  static defaultProps = {
    min: undefined,
    max: undefined,
    onChange: undefined,
    utc: false,
  };

  static getDerivedStateFromProps(props: Props, state: State) {
    const newValue = !areEqualDates(state.value, props.value);
    const newMin = !areEqualDates(state.min, props.min);
    const newMax = !areEqualDates(state.max, props.max);
    const newUTC = state.utc !== props.utc;

    // Check if any of the props that can affect state have changed.
    if (!newValue && !newMin && !newMax && !newUTC) {
      return null;
    }

    let nextState = {
      ...state,
      utc: props.utc,
    };

    if (newMin) {
      nextState.min = props.min;
    }

    if (newMin) {
      nextState.max = props.max;
    }

    // Calculate a new state from the incoming props.
    nextState = flow(
      updateYear(getYear(props.value, props.utc)),
      updateMonth(getMonth(props.value, props.utc)),
      updateDay(getDay(props.value, props.utc)),
      updateHour(getHour(props.value, props.utc)),
      updateMinute(getMinute(props.value, props.utc)),
      updateSecond(getSecond(props.value, props.utc)),
    )(nextState);

    const nextValue = dateValue(nextState);

    if (!areEqualDates(nextValue, state.value)) {
      nextState.value = nextValue;
    }

    // Return new state to trigger an update.
    return nextState;
  }

  _updateState = (updater: (State) => State, callback?: (boolean) => mixed) => {
    let updated = false;

    this.setState(
      (state) => {
        const nextState = updater(state);

        if (nextState === state) {
          return null;
        }

        updated = true;

        const nextDateValue = dateValue(nextState);

        if (!areEqualDates(nextDateValue, state.value)) {
          nextState.value = nextDateValue;
        }

        return nextState;
      },
      () => {
        if (callback) {
          callback(updated);
        }
      },
    );
  };

  _setFieldValue = (key: FieldName, updater: (number) => (State) => State) => (
    value: number,
  ) => {
    assertIntValue(value, key);

    this._updateState(updater(value), (updated) => {
      if (this.props.onChange && updated) {
        this.props.onChange(this.state.value);
      }
    });
  };

  setYear = this._setFieldValue('year', (value) => (state) =>
    flow(
      updateYear(value),
      updateMonth(state.month.props.value),
      updateDay(state.day.props.value),
      updateHour(state.hour.props.value),
      updateMinute(state.minute.props.value),
      updateSecond(state.second.props.value),
    )(state),
  );

  setMonth = this._setFieldValue('month', (value) => (state) =>
    flow(
      updateMonth(value),
      updateDay(state.day.props.value),
      updateHour(state.hour.props.value),
      updateMinute(state.minute.props.value),
      updateSecond(state.second.props.value),
    )(state),
  );

  setDay = this._setFieldValue('day', (value) => (state) =>
    flow(
      updateDay(value),
      updateHour(state.hour.props.value),
      updateMinute(state.minute.props.value),
      updateSecond(state.second.props.value),
    )(state),
  );

  setHour = this._setFieldValue('hour', (value) => (state) =>
    flow(
      updateHour(value),
      updateMinute(state.minute.props.value),
      updateSecond(state.second.props.value),
    )(state),
  );

  setMinute = this._setFieldValue('minute', (value) => (state) =>
    flow(updateMinute(value), updateSecond(state.second.props.value))(state),
  );

  setSecond = this._setFieldValue('second', updateSecond);

  setFields = (fields: {
    year?: number,
    month?: number,
    day?: number,
    hour?: number,
    minute?: number,
    second?: number,
  }) => {
    fields.year !== undefined && assertIntValue(fields.year, 'year');
    fields.month !== undefined && assertIntValue(fields.month, 'month');
    fields.day !== undefined && assertIntValue(fields.day, 'day');
    fields.hour !== undefined && assertIntValue(fields.hour, 'hour');
    fields.minute !== undefined && assertIntValue(fields.minute, 'minute');
    fields.second !== undefined && assertIntValue(fields.second, 'second');

    this._updateState(
      (state) => {
        if (
          fields.year === state.year.props.value &&
          fields.month === state.month.props.value &&
          fields.day === state.day.props.value &&
          fields.hour === state.hour.props.value &&
          fields.minute === state.minute.props.value &&
          fields.second === state.second.props.value
        ) {
          return state;
        }

        const {
          year = state.year.props.value,
          month = state.month.props.value,
          day = state.day.props.value,
          hour = state.hour.props.value,
          minute = state.minute.props.value,
          second = state.second.props.value,
        } = fields;

        return flow(
          updateYear(year),
          updateMonth(month),
          updateDay(day),
          updateHour(hour),
          updateMinute(minute),
          updateSecond(second),
        )(state);
      },
      (updated) => {
        if (this.props.onChange && updated) {
          this.props.onChange(this.state.value);
        }
      },
    );
  };

  state = {
    value: initValue,
    min: this.props.min,
    max: this.props.max,
    utc: this.props.utc,

    setYear: this.setYear,
    setMonth: this.setMonth,
    setDay: this.setDay,
    setHour: this.setHour,
    setMinute: this.setMinute,
    setSecond: this.setSecond,
    setFields: this.setFields,

    year: {
      props: {
        value: getYear(initValue, this.props.utc),
        onChange: (event: mixed) => this.setYear(Number(parseEvent(event))),
      },
      min: null,
      max: null,
    },

    month: {
      props: {
        value: getMonth(initValue, this.props.utc),
        onChange: (event: mixed) => this.setMonth(Number(parseEvent(event))),
      },
      min: 0,
      max: 11,
    },

    day: {
      props: {
        value: getDay(initValue, this.props.utc),
        onChange: (event: mixed) => this.setDay(Number(parseEvent(event))),
      },
      min: 0,
      max: daysInMonth(
        getYear(initValue, this.props.utc),
        getMonth(initValue, this.props.utc),
      ),
    },

    hour: {
      props: {
        value: getHour(initValue, this.props.utc),
        onChange: (event: mixed) => this.setHour(Number(parseEvent(event))),
      },
      min: 0,
      max: 23,
    },

    minute: {
      props: {
        value: getMinute(initValue, this.props.utc),
        onChange: (event: mixed) => this.setMinute(Number(parseEvent(event))),
      },
      min: 0,
      max: 59,
    },

    second: {
      props: {
        value: getSecond(initValue, this.props.utc),
        onChange: (event: mixed) => this.setSecond(Number(parseEvent(event))),
      },
      min: 0,
      max: 59,
    },
  };

  render() {
    const {children} = this.props;
    return children(this.state);
  }
}

export default DateInputController;

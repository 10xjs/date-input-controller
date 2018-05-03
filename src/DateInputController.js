// @flow

import * as React from 'react';

import type {Props, State, FieldName, ValueUpdater} from './types';

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

// eslint-disable-next-line no-bitwise

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

  _handleChange = (
    eventOrValue: mixed,
    key: FieldName,
    updater: ValueUpdater,
  ) => {
    const value = Number(parseEvent(eventOrValue));

    if (!isInt(value)) {
      throw new Error(`expected numeric ${key}`);
    }

    let updated = false;

    this.setState(
      (state) => {
        const nextState = updater(state, value);

        if (nextState === state) {
          return null;
        }

        updated = true;

        const nextValue = dateValue(nextState);

        if (!areEqualDates(nextValue, state.value)) {
          nextState.value = nextValue;
        }

        return nextState;
      },
      () => {
        if (this.props.onChange && updated) {
          this.props.onChange(this.state.value);
        }
      },
    );
  };

  _handleChangeYear = (eventOrValue: mixed) =>
    this._handleChange(eventOrValue, 'year', (state, value) =>
      flow(
        updateYear(value),
        updateMonth(state.month.props.value),
        updateDay(state.day.props.value),
        updateHour(state.hour.props.value),
        updateMinute(state.minute.props.value),
        updateSecond(state.second.props.value),
      )(state),
    );

  _handleChangeMonth = (eventOrValue: mixed) =>
    this._handleChange(eventOrValue, 'month', (state, value) =>
      flow(
        updateMonth(value),
        updateDay(state.day.props.value),
        updateHour(state.hour.props.value),
        updateMinute(state.minute.props.value),
        updateSecond(state.second.props.value),
      )(state),
    );

  _handleChangeDay = (eventOrValue: mixed) =>
    this._handleChange(eventOrValue, 'day', (state, value) =>
      flow(
        updateDay(value),
        updateHour(state.hour.props.value),
        updateMinute(state.minute.props.value),
        updateSecond(state.second.props.value),
      )(state),
    );

  _handleChangeHour = (eventOrValue: mixed) =>
    this._handleChange(eventOrValue, 'hour', (state, value) =>
      flow(
        updateHour(value),
        updateMinute(state.minute.props.value),
        updateSecond(state.second.props.value),
      )(state),
    );

  _handleChangeMinute = (eventOrValue: mixed) =>
    this._handleChange(eventOrValue, 'minute', (state, value) =>
      flow(updateMinute(value), updateSecond(state.second.props.value))(state),
    );

  _handleChangeSecond = (eventOrValue: mixed) =>
    this._handleChange(eventOrValue, 'second', (state, value) =>
      updateSecond(value)(state),
    );

  state = {
    value: initValue,
    min: this.props.min,
    max: this.props.max,
    utc: this.props.utc,

    year: {
      props: {
        value: getYear(initValue, this.props.utc),
        onChange: this._handleChangeYear,
      },
      min: null,
      max: null,
    },

    month: {
      props: {
        value: getMonth(initValue, this.props.utc),
        onChange: this._handleChangeMonth,
      },
      min: 0,
      max: 11,
    },

    day: {
      props: {
        value: getDay(initValue, this.props.utc),
        onChange: this._handleChangeDay,
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
        onChange: this._handleChangeHour,
      },
      min: 0,
      max: 23,
    },

    minute: {
      props: {
        value: getMinute(initValue, this.props.utc),
        onChange: this._handleChangeMinute,
      },
      min: 0,
      max: 59,
    },

    second: {
      props: {
        value: getSecond(initValue, this.props.utc),
        onChange: this._handleChangeSecond,
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

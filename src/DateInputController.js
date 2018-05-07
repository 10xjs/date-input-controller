// @flow strict

import * as React from 'react';

import type {Props, State} from './types';

import {
  isInt,
  areEqualDates,
  getDateField,
  dateValue,
  fieldKeys,
  getValue,
  getInitialState,
  updateField,
} from './util';

class DateInputController extends React.PureComponent<Props, State> {
  static defaultProps: typeof DateInputController.defaultProps;
  static getDerivedStateFromProps: typeof DateInputController.getDerivedStateFromProps;

  setYear: (value: number) => void;
  setMonth: (value: number) => void;
  setDay: (value: number) => void;
  setHour: (value: number) => void;
  setMinute: (value: number) => void;
  setSecond: (value: number) => void;

  _updateState(updater: (State) => State) {
    let updated = false;

    this.setState(
      (state) => {
        const nextState = updater(state);

        if (nextState === state) {
          return null;
        }

        updated = true;

        nextState.value = dateValue(nextState);

        return nextState;
      },
      () => {
        updated && this.props.onChange && this.props.onChange(this.state.value);
      },
    );
  }

  setFields(fields: {
    year?: number,
    month?: number,
    day?: number,
    hour?: number,
    minute?: number,
    second?: number,
  }) {
    this._updateState((state) => {
      const updaters = [];

      for (let i = 0; i < fieldKeys.length; i++) {
        const key = fieldKeys[i];
        const value = fields[key];

        if (value !== undefined) {
          if (!isInt(value)) {
            throw new TypeError(`Expected int ${key}. Received ${value}.`);
          }
          updaters.push(updateField(i, value));
        } else if (updaters.length) {
          updaters.push(updateField(i, getValue(state, i)));
        }
      }

      return updaters.reduce((state, updater) => updater(state), state);
    });
  }

  constructor(props: Props) {
    super(props);

    const result = getInitialState(this);
    Object.assign(this, result.actions);
    this.state = result.state;
  }

  render() {
    const {children} = this.props;
    return children(this.state);
  }
}

DateInputController.defaultProps = {
  utc: false,
};

DateInputController.getDerivedStateFromProps = (props: Props, state: State) => {
  const newValue = !areEqualDates(state.value, props.value);
  const newMin = !areEqualDates(state.min, props.min);
  const newMax = !areEqualDates(state.max, props.max);
  const newUTC = state.utc !== props.utc;

  // Check if any of the props that can affect state have changed.
  if (!newValue && !newMin && !newMax && !newUTC) {
    return null;
  }

  let nextState = Object.assign({}, state);
  nextState.utc = props.utc;

  if (newMin) {
    nextState.min = props.min;
  }

  if (newMax) {
    nextState.max = props.max;
  }

  const updaters = fieldKeys.map((_, i) =>
    updateField(i, getDateField[i](props.value, props.utc)),
  );

  // Calculate a new state from the incoming props.
  nextState = updaters.reduce((state, updater) => updater(state), nextState);

  const nextValue = dateValue(nextState);

  if (!areEqualDates(nextValue, state.value)) {
    nextState.value = nextValue;
  }

  // Return new state to trigger an update.
  return nextState;
};

export default DateInputController;

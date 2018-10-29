// @flow strict

import * as React from 'react';

import type {Props, State} from './types';

import {
  areEqualDates,
  getDateField,
  dateValue,
  fieldKeys,
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
    year?: number | string,
    month?: number | string,
    day?: number | string,
    hour?: number | string,
    minute?: number | string,
    second?: number | string,
  }) {
    this._updateState((state) => {
      const updaters = [];

      for (let i = 0; i < fieldKeys.length; i++) {
        const key = fieldKeys[i];
        const value = fields[key];

        if (value !== undefined) {
          if (typeof value === 'number' && (value | 0) === value) {
            updaters.push(updateField(i, value));
          } else if (typeof value === 'string' && /^[0-9]+$/.test(value)) {
            updaters.push(updateField(i, parseInt(value, 10)));
          } else {
            throw new TypeError(`Expected int ${key}. Received ${value}.`);
          }
        } else if (updaters.length) {
          updaters.push(updateField(i, state[fieldKeys[i]]));
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
  const {value = new Date(0), min, max, utc} = props;

  const newValue = !areEqualDates(state.props.value, value);
  const newMin = !areEqualDates(state.props.min, min);
  const newMax = !areEqualDates(state.props.max, max);
  const newUTC = state.props.utc !== utc;

  // Check if any of the props that can affect state have changed.
  if (!newValue && !newMin && !newMax && !newUTC) {
    return null;
  }

  let nextState = Object.assign({}, state, {props: {value, min, max, utc}});

  const updaters = fieldKeys.map((_, i) =>
    updateField(i, getDateField[i](newValue ? value : state.value, utc)),
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

// @flow strict

import * as React from 'react';

export type FieldState<T> = {
  props: {
    value: number,
    onChange(mixed): void,
  },
  min: T,
  max: T,
};

export type Fields = {
  year: FieldState<number | null>,
  month: FieldState<number>,
  day: FieldState<number>,
  hour: FieldState<number>,
  minute: FieldState<number>,
  second: FieldState<number>,
};

export type FieldsState = {
  value: Date,
  min?: Date,
  max?: Date,
  utc: boolean,
  ...$Exact<Fields>,
};

export type FieldActions = {
  setYear(year: number): void,
  setMonth(month: number): void,
  setDay(day: number): void,
  setHour(hour: number): void,
  setMinute(minute: number): void,
  setSecond(second: number): void,
};

export type State = {
  ...$Exact<FieldsState>,

  setFields(fields: {
    year?: number,
    month?: number,
    day?: number,
    hour?: number,
    minute?: number,
    second?: number,
  }): void,

  ...$Exact<FieldActions>,
};

export type Props = {
  value: Date,
  min?: Date,
  max?: Date,
  utc: boolean,
  onChange?: (Date) => mixed,
  children(State): React.Node,
};

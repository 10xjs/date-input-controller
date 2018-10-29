// @flow strict

import * as React from 'react';

export type Fields = {
  year: number,
  yearMin: number | null,
  yearMax: number | null,
  month: number,
  monthMin: number,
  monthMax: number,
  day: number,
  dayMin: number,
  dayMax: number,
  hour: number,
  hourMin: number,
  hourMax: number,
  minute: number,
  minuteMin: number,
  minuteMax: number,
  second: number,
  secondMin: number,
  secondMax: number,
};

export type FieldActions = {
  setYear(year: number | string): void,
  setMonth(month: number | string): void,
  setDay(day: number | string): void,
  setHour(hour: number | string): void,
  setMinute(minute: number | string): void,
  setSecond(second: number | string): void,
};

export type State = {
  props: {
    value: Date,
    min?: Date,
    max?: Date,
    utc: boolean,
  },
  value: Date,

  setFields(fields: {
    year?: number | string,
    month?: number | string,
    day?: number | string,
    hour?: number | string,
    minute?: number | string,
    second?: number | string,
  }): void,

  ...$Exact<Fields>,
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

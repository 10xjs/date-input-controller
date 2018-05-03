// @flow

import * as React from 'react';

type FieldState = {
  props: {
    value: number,
    onChange(mixed): void,
  },
  min: number,
  max: number,
};

type Fields = {
  year: {
    props: {
      value: number,
      onChange(mixed): void,
    },
    min: number | null,
    max: number | null,
  },
  month: FieldState,
  day: FieldState,
  hour: FieldState,
  minute: FieldState,
  second: FieldState,
};

export type FieldName = $Keys<Fields>;

export type State = {
  value: Date,
  min?: Date,
  max?: Date,
  utc: boolean,
} & Fields;

export type Props = {
  value: Date,
  min: Date,
  max: Date,
  utc: boolean,
  onChange: (Date) => mixed,
  children(State): React.Node,
};

export type ValueUpdater = (State, number) => State;

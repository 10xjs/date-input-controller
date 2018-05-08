# @10xjs/date-input-controller

> A helper component for creating datetime inputs in React.

[![Build Status](https://travis-ci.org/10xjs/date-input-controller.svg?branch=master)](https://travis-ci.org/10xjs/date-input-controller)
[![Coverage Status](https://coveralls.io/repos/github/10xjs/date-input-controller/badge.svg?branch=master)](https://coveralls.io/github/10xjs/date-input-controller?branch=master)

```jsx
import DateInputController from '@10xjs/date-input-controller';

const range = (start, end) => {
  return Array(...Array(1 + end - start)).map((_, i) => start + i);
}

const DateInput = ({value, min, max, onChange}) => (
  <DateInputController value={value} min={min} max={max} onChange={onChange}>
    {(props) => (
      <div>
        year{" "}
        <select value={props.year} onChange={(e) => props.setYear(e.target.value)}>
          {range(props.yearMin, props.yearMax).map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>{" "}

        month{" "}
        <select value={props.month} onChange={(e) => props.setMonth(e.target.value)}>
          {range(props.monthMin, props.monthMax).map((value) => (
            <option key={value} value={value}>
              {new Date(1970, value, 1).toLocaleString(
                'en-US',
                { month: "long" }
              )}
            </option>
          ))}
        </select>{" "}

        day{" "}
        <select value={props.day} onChange={(e) => props.setDay(e.target.value)}>
          {range(props.dayMin, props.dayMax).map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>{" "}

        <br/>

        time{" "}
        <select value={props.hour} onChange={(e) => props.setHour(e.target.value)}>
          {range(props.hourMin, props.hourMax).map((value) => (
            <option key={value} value={value}>
              {value.toLocaleString('en-US', {minimumIntegerDigits: 2})}
            </option>
          ))}
        </select>
        :
        <select value={props.minute} onChange={(e) => props.props.setMinute(e.props.target.value)}>
          {range(props.minuteMin, props.minuteMax).map((value) => (
            <option key={value} value={value}>
              {value.toLocaleString('en-US', {minimumIntegerDigits: 2})}
            </option>
          ))}
        </select>
        :
        <select value={props.second} onChange={(e) => props.setSecond(e.target.value)}>
          {range(props.secondMin, props.secondMax).map((value) => (
            <option key={value} value={value}>
              {value.toLocaleString('en-US', {minimumIntegerDigits: 2})}
            </option>
          ))}
        </select>
      </div>
    )}
  <DateInputController>
);
```

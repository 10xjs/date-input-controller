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
  <DateInputController
    value={value}
    min={min}
    max={max}
    onChange={onChange}
  >
    {({year, month, day, hour, minute, second}) => (
      <div>
        year{" "}
        <select {...year.props}>
          {range(year.min, year.max).map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>{" "}

        month{" "}
        <select {...month.props}>
          {range(month.min, month.max).map((value) => (
            <option key={value} value={value}>
              {new Date(1970, value, 1).toLocaleString(
                'en-US',
                { month: "long" }
              )}
            </option>
          ))}
        </select>{" "}

        day{" "}
        <select {...day.props}>
          {range(day.min, day.max).map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>{" "}

        <br/>

        time{" "}
        <select {...hour.props}>
          {range(hour.min, hour.max).map((value) => (
            <option key={value} value={value}>
              {value.toLocaleString('en-US', {minimumIntegerDigits: 2})}
            </option>
          ))}
        </select>
        :
        <select {...minute.props}>
          {range(minute.min, minute.max).map((value) => (
            <option key={value} value={value}>
              {value.toLocaleString('en-US', {minimumIntegerDigits: 2})}
            </option>
          ))}
        </select>
        :
        <select {...second.props}>
          {range(second.min, second.max).map((value) => (
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

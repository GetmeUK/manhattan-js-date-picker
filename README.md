<div align="center">
    <img width="196" height="96" vspace="20" src="http://assets.getme.co.uk/manhattan-logo--variation-b.svg">
    <h1>Manhattan Date Picker</h1>
    <p>Date parsing and picking for form fields.</p>
    <a href="https://badge.fury.io/js/manhattan-date-picker"><img src="https://badge.fury.io/js/manhattan-date-picker.svg" alt="npm version" height="18"></a>
    <a href="https://travis-ci.org/GetmeUK/manhattan-js-date-picker"><img src="https://travis-ci.org/GetmeUK/manhattan-js-date-picker.svg?branch=master" alt="Build Status" height="18"></a>
    <a href='https://coveralls.io/github/GetmeUK/manhattan-js-date-picker?branch=master'><img src='https://coveralls.io/repos/github/GetmeUK/manhattan-js-date-picker/badge.svg?branch=master' alt='Coverage Status' height="18"/></a>
    <a href="https://david-dm.org/GetmeUK/manhattan-js-date-picker/"><img src='https://david-dm.org/GetmeUK/manhattan-js-date-picker/status.svg' alt='dependencies status' height="18"/></a>
</div>

## Installation

`npm install manhattan-date-picker --save-dev`


## Usage

```html
<label>
    Date
    <input
        name="date"
        value="23 March 2018"
        data-mh-date-picker
        >
</label>
```

```JavaScript
import * as $ from 'manhattan-essentials'
import {datePicker} from 'manhattan-date-picker'

const picker = new datePicker.DatePicker($.one('[data-mh-date-picker]'))
picker.init()
```

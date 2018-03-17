import * as $ from 'manhattan-essentials'
import {
    DateParser,
    DEFAULT_MONTH_NAMES,
    DEFAULT_SHORT_MONTH_NAMES
} from './date-parser'


// -- Class definition --

/**
 * A date picker.
 */
export class DatePicker {

    constructor(input, options={}, prefix='data-mh-date-picker--') {

        // Configure the options
        this._options = {}

        $.config(
            this._options,
            {

                /**
                 * Flag indicating if the date picker should close when a date
                 * is picked.
                 */
                'closeOnPick': false,

                // dates
                // firstWeekday

                /**
                 * The format that dates should be displayed in.
                 */
                'format': 'human',

                // maxDate
                // minDate
                // monthNames

                /**
                 * A list of parsers that will be used to attempt to parse
                 * an input string as a date (strings are parsed using each
                 * parser in turn and in the order given).
                 */
                'parsers': ['human', 'dmy', 'iso']

                // shortMonthNames
                // weekdayNames
            },
            options,
            input,
            prefix
        )
    }
}


// @@ Behaviours for the calendar and the date picker?...
// @@ ... or send settings through to parser, calendar using options? << *
// @@ ... calendar would need to accept a function that it could call to
//        determine which if any dates should be blocked.
// @@ Behaviours for picker would be input and dateTest
// @@ Date picker will now be responsible for providing a date test function
//    that supports the date behaviour and the min/max dates.

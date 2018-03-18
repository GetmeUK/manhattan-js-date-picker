import * as $ from 'manhattan-essentials'
import {Calendar, DEFAULT_WEEKDAY_NAMES} from './calendar'
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

                /**
                 * Used to configure the `testDate` behaviour, for example if
                 * used with the `testDate.excluding` behaviour then `dates`
                 * should be a list of dates that cannot be picked.
                 */
                'dates': null,

                /**
                 * The weekday to display in the first column of the date
                 * picker's calendar. Weekday must be a integer between 0
                 * (Sunday) and 6 (Saturday).
                 */
                'firstWeekday': 1,

                /**
                 * The format that dates should be displayed in.
                 */
                'format': 'human',

                /**
                 * The latest date that can be selected.
                 */
                'maxDate': null,

                /**
                 * The earliest date that can be selected.
                 */
                'minDate': null,

                /**
                 * A list of full month names used by the date picker.
                 */
                'monthNames': DEFAULT_MONTH_NAMES,

                /**
                 * A list of parsers that will be used to attempt to parse
                 * an input string as a date (strings are parsed using each
                 * parser in turn and in the order given).
                 */
                'parsers': ['human', 'dmy', 'iso'],

                /**
                 * A list of abbreviated month names used by the date picker.
                 */
                'shortMonthNames': DEFAULT_SHORT_MONTH_NAMES,

                /**
                 * A list of weekday names used by the date picker.
                 */
                'weekdayNames': DEFAULT_WEEKDAY_NAMES

            },
            options,
            input,
            prefix
        )

        // @@
        // - parser month names
        // - parser short month names
        // - parser parsers
        // - parser weekday names
        // - parse min/max dates
        // - parser dates

        // Configure the behaviours
        this._behaviours = {}

        $.config(
            this._behaviours,
            {
                'input': 'setValue',
                'testDate': 'any'
            },
            options,
            input,
            prefix
        )

        // A handle to the date parser
        this._dateParser = null

        // A handle to the calendar component
        this._calendar = null

        // A flag indicating if the date picker is open (visible)
        this._open = false

        // Domain for related DOM elements
        this._dom = {
            'input': null,
            'picker': null
        }

        // Store a reference to the input element
        this._dom.input = input

        // set up event handlers
        this._handlers = {

            'close': () => {
                this.close()
            },

            'input': () => {
                // When the input changes attempt to parse its value as a
                // date, if successful then we pick that date.
                const date = this.dateParser.parse(
                    this.input.value,
                    this._options.parsers
                )
                if (date) {
                    this.pick(date)
                }
            },

            'open': () => {
                this.open()
            },

            'pick': (event) => {
                // Ignore the event if it was triggered by the date picker
                // itself (prevents infinite cycle).
                if (event._datePicker !== this) {
                    this.pick(event.date)
                }
            }

        }
    }

    // -- Getters & Setters --

    calendar() {
        return this._calendar
    }

    dateParser() {
        return this._dateParser
    }

    input() {
        return this._dom.input
    }

    isOpen() {
        return this._open
    }

    picker() {
        return this._dom.picker
    }

    // -- Public methods --

    /**
     * Close the date picker.
     */
    close() {
        if (!this.isOpen) {
            return
        }

        // Hide the date picker
        this.picker.classList.remove(this.constructor.css['open'])

        // Flag the date picker as closed
        this._isOpen = false

        // Dispatch closed event against the input
        $.dispatch(this.input, 'closed')
    }

    destroy() {
        // @@

        // Remove the date parser
        this._dateParser = null

        // Destroy the calendar
        this.calendar.destroy()
        this._calendar = null
    }

    init() {
        // Create the date picker element
        // @@

        // Set up date parser
        this._dateParser = new DateParser(
            this._options.monthNames,
            this._options.shortMonthNames
        )

        // Set up calendar
        this._calendar = new Calendar(
            this.picker,
            (date) => {
                // @@
                return true
            },
            this._options.firstWeekday,
            this._options.monthNames,
            this._options.weekdayNames
        )
        this.calendar.init()

        // Set up event listeners
        // @@
    }

    /**
     * Open the date picker.
     */
    open() {
        // Parse the input's value as a date, if the value is a valid date
        // then select it in the calendar.
        const date = this.dateParser.parse(
            this.input.value,
            this._options.parsers
        )
        if (date !== null) {
            this.calendar.goto(date.getMonth(), date.getFullYear())
            this.calendar.select(date)
        }

        // Update the position of the picker inline with the associated input
        this._track()

        // Show the date picker
        this.picker.classList.add(this.constructor.css['open'])

        // Flag the date picker as open
        this._isOpen = open

        // Dispatch opened event against the input
        $.dispatch(this.input, 'opened')
    }

    pick(date) {
        // Select the date in the calendar
        this.calendar.date = date

        // Update the input value with the date
        this.constructor.behaviours[this._behaviours.input](this, date)

        // Dispatch a picked event against the input
        $.dispatch(this.input, 'picked', {date})

        // Close the date picker if configured to
        if (this._options.closeOnPick) {
            this.close()
        }
    }

    // -- Private methods --

    /**
     * Position the date picker inline with the associated input element.
     */
    _track() {
        const rect = this.input.getBoundingClientRect()
        const top = rect.top + window.pageYOffset
        const left = rect.left + window.pageXOffset
        this.picker.style.top = `${top + rect.height}px`
        this.picker.style.left = `${left}px`
    }
}


// -- Behaviours --

DatePicker.behaviours = {

    /**
     * The `input` behaviour is used to set the value of the associated input
     * for the date picker when a date is picked.
     */
    'input': {

        /**
         * Set the value of the input to the formatted date.
         */
        'setValue': (inst, date) => {

            // Set the input value to the new date
            inst.input.value = inst.dateParser.format(
                inst._options.format,
                date
            )

            // Dispatch a change event against the input, but flag that the
            // event was triggered by the date picker so we don't trigger an
            // infinite cycle.
            $.dispatch(inst.input, 'change', {'_datePicker': inst})
        }

    },

    /**
     * The `testDate` behaviour is used to determine which dates can be
     * selected using the date picker.
     */
    'testDate': {

        /**
         * Allow any date to be picked.
         */
        'any': (inst, dates, date) => {
            return true
        },

        /**
         * Allow all dates to be picked excluding those in the list of given
         * dates.
         */
        'excluding': (inst, dates, date) => {
            for (let otherDate of dates) {
                if (date.getTime() === otherDate.getTime()) {
                    return false
                }
            }
            return true
        },

        /**
         * Allow only dates in the given list to be picked.
         */
        'only': (inst, dates, date) => {
            for (let otherDate of dates) {
                if (date.getTime() === otherDate.getTime()) {
                    return true
                }
            }
            return false
        },

        /**
         * Allow only the given weekdays to be picked.
         */
        'weekdays': (inst, weekdays, date) => {
            return weekdays.indexOf(date.getDay()) > -1
        }

    }

}


// -- CSS classes --

DatePicker.css = {

    /**
     * Applied to the date picker when it is open.
     */
    'open': 'mh-date-picker--open',

    /**
     * Applied to the root date picker element.
     */
    'picker': 'mh-date-picker'

}


// @@ Behaviours for the calendar and the date picker?...
// @@ ... or send settings through to parser, calendar using options? << *
// @@ ... calendar would need to accept a function that it could call to
//        determine which if any dates should be blocked.
// @@ Behaviours for picker would be input and dateTest
// @@ Date picker will now be responsible for providing a date test function
//    that supports the date behaviour and the min/max dates.

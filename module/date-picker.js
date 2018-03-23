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
                 * Used to configure the `dateTest` behaviour, for example if
                 * used with the `dateTest.excluding` behaviour then `dates`
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
                 * Flag indicating if the date picker should display the popup
                 * when the input field is in focus (by default the popup is
                 * displayed).
                 */
                'noPopup': false,

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
                 * Flag indicating if the date picker should stay open when a
                 * date is picked.
                 */
                'stayOpenOnPick': false,

                /**
                 * A list of weekday names used by the date picker.
                 */
                'weekdayNames': DEFAULT_WEEKDAY_NAMES

            },
            options,
            input,
            prefix
        )

        // Handle list based options
        let _toArray = (s) => {
            return s.split(',').map((v) => {
                return v.trim()
            })
        }

        if (typeof this._options.monthNames === 'string') {
            this._options.monthNames = _toArray(this._options.monthNames)
        }
        if (typeof this._options.parsers === 'string') {
            this._options.parsers = _toArray(this._options.parsers)
        }
        if (typeof this._options.shortMonthNames === 'string') {
            this._options.shortMonthNames
                = _toArray(this._options.shortMonthNames)
        }
        if (typeof this._options.weekdayNames === 'string') {
            this._options.weekdayNames = _toArray(this._options.weekdayNames)
        }

        // Set up date parser (the parser must be initialized before we can
        // parse options that contain dates).
        this._dateParser = new DateParser(
            this._options.monthNames,
            this._options.shortMonthNames
        )

        // Handle date based options
        let _toDate = (s) => {
            return this._dateParser.parse(this._options.parsers, s)
        }

        if (typeof this._options.maxDate === 'string') {
            this._options.maxDate = _toDate(this._options.maxDate)
        }
        if (typeof this._options.minDate === 'string') {
            this._options.minDate = _toDate(this._options.minDate)
        }
        if (typeof this._options.dates === 'string') {
            this._options.dates = this._options.dates.split(',').map((v) => {
                return _toDate(v)
            })
            this._options.dates.filter((v) => {
                return v !== null
            })
        }

        // Configure the behaviours
        this._behaviours = {}

        $.config(
            this._behaviours,
            {
                'dateTest': 'any',
                'input': 'setValue'
            },
            options,
            input,
            prefix
        )

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
                    this._options.parsers,
                    this.input.value
                )
                if (date !== null) {
                    this.pick(date)
                }
            },

            'open': () => {
                if (!this._options.noPopup) {
                    this.open()
                }
            },

            'picked': (event) => {
                this.pick(event.date)
            }

        }
    }

    // -- Getters & Setters --

    get calendar() {
        return this._calendar
    }

    get dateParser() {
        return this._dateParser
    }

    get input() {
        return this._dom.input
    }

    get isOpen() {
        return this._open
    }

    get picker() {
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
        this._open = false

        // Dispatch closed event against the input
        $.dispatch(this.input, 'closed')
    }

    destroy() {
        // Remove event listeners
        $.ignore(
            window,
            {
                'fullscreenchange': this._handlers.close,
                'orientationchange': this._handlers.close,
                'resize': this._handlers.close
            }
        )

        $.ignore(
            this.input,
            {
                'blur': this._handlers.close,
                'change': this._handlers.input,
                'click': this._handlers.open,
                'focus': this._handlers.open
            }
        )

        // Destroy the calendar
        if (this.calendar !== null) {
            $.ignore(this.calendar.calendar, {'picked': this._handlers.pick})

            this.calendar.destroy()
            this._calendar = null
        }

        // Remove the date picker element
        if (this._dom.picker !== null) {
            document.body.removeChild(this._dom.picker)
            this._dom.picker = null
        }

        // Remove the date picker reference from the input
        delete this._dom.input._mhDatePicker
    }

    init() {
        // Store a reference to the date picker instance against the input
        this._dom.input._mhDatePicker = this

        // Create the date picker element
        this._dom.picker = $.create(
            'div',
            {'class': this.constructor.css['picker']}
        )
        document.body.appendChild(this._dom.picker)

        // Set up calendar
        this._calendar = new Calendar(
            this.picker,
            (date) => {
                const {maxDate} = this._options
                const {minDate} = this._options

                // Check date is within any min/max range
                if (minDate && date.getTime() < minDate.getTime()) {
                    return false
                }

                if (maxDate && date.getTime() > maxDate.getTime()) {
                    return false
                }

                // Apply `dateTest` behaviour
                const dateTest = this.constructor
                    .behaviours
                    .dateTest[this._behaviours.dateTest]

                return dateTest(this, date)
            },
            this._options.firstWeekday,
            this._options.monthNames,
            this._options.weekdayNames
        )
        this.calendar.init()

        // Set up event listeners
        $.listen(
            window,
            {
                'fullscreenchange': this._handlers.close,
                'orientationchange': this._handlers.close,
                'resize': this._handlers.close
            }
        )

        $.listen(
            this.input,
            {
                'blur': this._handlers.close,
                'change': this._handlers.input,
                'click': this._handlers.open,
                'focus': this._handlers.open
            }
        )

        $.listen(this.calendar.calendar, {'picked': this._handlers.picked})
    }

    /**
     * Open the date picker.
     */
    open() {
        if (this.isOpen) {
            return
        }

        // Parse the input's value as a date, if the value is a valid date
        // then select it in the calendar.
        const date = this.dateParser.parse(
            this._options.parsers,
            this.input.value
        )
        if (date !== null) {
            this.calendar.goto(date.getMonth(), date.getFullYear())
            this.calendar.date = date
        }

        // Update the position of the picker inline with the associated input
        this._track()

        // Show the date picker
        this.picker.classList.add(this.constructor.css['open'])

        // Flag the date picker as open
        this._open = true

        // Dispatch opened event against the input
        $.dispatch(this.input, 'opened')
    }

    pick(date) {
        // Select the date in the calendar
        this.calendar.date = date

        // Update the input value with the date
        this.constructor.behaviours.input[this._behaviours.input](this, date)

        // Dispatch a picked event against the input
        $.dispatch(this.input, 'picked', {'date': new Date(date.valueOf())})

        // Close the date picker if configured to
        if (!this._options.stayOpenOnPick) {
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
     * The `dateTest` behaviour is used to determine which dates can be
     * selected using the date picker.
     */
    'dateTest': {

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
        'excluding': (inst, date) => {
            for (let otherDate of inst._options.dates) {
                if (date.getTime() === otherDate.getTime()) {
                    return false
                }
            }
            return true
        },

        /**
         * Allow only dates in the given list to be picked.
         */
        'only': (inst, date) => {
            for (let otherDate of inst._options.dates) {
                if (date.getTime() === otherDate.getTime()) {
                    return true
                }
            }
            return false
        }

    },

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
            const orginalValue = inst.input.value
            inst.input.value = inst.dateParser.format(
                inst._options.format,
                date
            )

            // Dispatch a change event against the input, but flag that the
            // event was triggered by the date picker so we don't trigger an
            // infinite cycle.
            if (inst.input.value !== orginalValue) {
                $.dispatch(inst.input, 'change')
            }
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

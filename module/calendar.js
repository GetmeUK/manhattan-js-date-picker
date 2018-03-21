import * as $ from 'manhattan-essentials'
import {DEFAULT_MONTH_NAMES} from './date-parser'

// -- Defaults --

export const DEFAULT_WEEKDAY_NAMES
    = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']


// -- Class definition --

/**
 * A calendar UI component (used by the date picker to provide a calendar to
 * pick a date from).
 */
export class Calendar {

    constructor(
        parent,
        dateTest=null,
        firstWeekday=1,
        monthNames=DEFAULT_MONTH_NAMES,
        weekdayNames=DEFAULT_WEEKDAY_NAMES
    ) {

        // Set the calendar options
        this.dateTest = dateTest
        this.firstWeekday = firstWeekday
        this.monthNames = monthNames
        this.weekdayNames = weekdayNames

        // Initially the calendar selects and displays today's date
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Allocate attributes for the date selection and view
        this._month = today.getMonth()
        this._year = today.getFullYear()
        this._date = today

        // Domain for related DOM elements
        this._dom = {
            'calendar': null,
            'dates': null,
            'monthYear': null,
            'next': null,
            'previous': null,
            'parent': null
        }

        // Store a reference to the calendar
        this._dom.parent = parent

        // Set up event handlers
        this._handlers = {

            'keepFocus': (event) => {
                event.preventDefault()
            },

            'next': (event) => {
                this.next()
            },

            'pick': (event) => {
                const {css} = this.constructor
                const dateElm = event.target

                // Make sure the event was triggered against a date
                if (!dateElm.classList.contains(css['date'])) {
                    return
                }

                // Check the date isn't blocked
                if (dateElm.classList.contains(css['blocked'])) {
                    return
                }

                // Update the date
                this.date = dateElm._date

                // Dispatch a picked event against the calendar
                $.dispatch(
                    this.calendar,
                    'picked',
                    {'date': this.date}
                )
            },

            'previous': (event) => {
                this.previous()
            }

        }
    }

    // -- Getters & Setters --

    get calendar() {
        return this._dom.calendar
    }

    get date() {
        return new Date(this._date.valueOf())
    }

    set date(date) {
        this._date = new Date(date.valueOf())
        this._update()
    }

    get month() {
        return this._month
    }

    set month(month) {
        this.goto(month, this.year)
    }

    get parent() {
        return this._dom.parent
    }

    get year() {
        return this._year
    }

    set year(year) {
        this.goto(this.month, year)
    }

    // -- Public methods --

    /**
     * Remove the calendar.
     */
    destroy() {
        if (this.calendar) {
            // Remove event handlers
            $.ignore(this.calendar, {'mousedown': this._handlers.keepFocus})
            $.ignore(this._dom.next, {'click': this._handlers.next})
            $.ignore(this._dom.previous, {'click': this._handlers.previous})
            $.ignore(this._dom.dates, {'click': this._handlers.pick})

            // Remove the calendar from the parent
            this.parent.removeChild(this.calendar)
            this._dom.calendar = null
        }

        // Remove the sortable reference from the container
        delete this._dom.parent._mhCalendar
    }

    /**
     * Display the given month, year in the calendar.
     */
    goto(month, year) {
        // If the calendar is already displaying month and year then there's
        // nothing to do.
        if (month === this.month && year === this.year) {
            return
        }

        // Update the calendar view to the new month/year
        this._month = month
        this._year = year
        this._update()
    }

    /**
     * Initialize the calendar.
     */
    init() {
        // Store a reference to the calendar instance against the parent
        this._dom.parent._mhCalendar = this

        // Build the calendar component...
        const {css} = this.constructor
        this._dom.calendar = $.create('div', {'class': css['calendar']})

        // ...nav components
        const navElm = $.create('div', {'class': css['nav']})
        this.calendar.appendChild(navElm)

        this._dom.monthYear = $.create('div', {'class': css['monthYear']})
        navElm.appendChild(this._dom.monthYear)

        this._dom.next = $.create('div', {'class': css['next']})
        navElm.appendChild(this._dom.next)

        this._dom.previous = $.create('div', {'class': css['previous']})
        navElm.appendChild(this._dom.previous)

        // ...weekdays components
        const weekdaysElm = $.create('div', {'class': css['weekdays']})
        this.calendar.appendChild(weekdaysElm)

        for (let i = this.firstWeekday; i < (this.firstWeekday + 7); i += 1) {

            // Create the weekday element
            const weekdayElm = $.create('div', {'class': css['weekday']})

            // Determine which day of the week this represents and set the
            // contents of the weekday element to match.
            let weekday = i
            if (i >= 7) {
                weekday -= 7
            }
            weekdayElm.textContent = this.weekdayNames[weekday]

            // Add the week day element to the weekdays container
            weekdaysElm.appendChild(weekdayElm)
        }

        // ...dates components
        this._dom.dates = $.create('div', {'class': css['dates']})
        this.calendar.appendChild(this._dom.dates)

        // We build 6 rows of 7 days which allows a full month to always be
        // visible no matter its length what weekday it starts on.
        for (let i = 0; i < 42; i += 1) {
            this._dom
                .dates
                .appendChild($.create('div', {'class': css['date']}))
        }

        // Set up event listeners
        $.listen(this.calendar, {'mousedown': this._handlers.keepFocus})
        $.listen(this._dom.next, {'click': this._handlers.next})
        $.listen(this._dom.previous, {'click': this._handlers.previous})
        $.listen(this._dom.dates, {'click': this._handlers.pick})

        // Add the calendar to the parent element
        this.parent.appendChild(this.calendar)

        // Update the initial calendar view
        this._update()
    }

    /**
     * Display the next calendar month
     */
    next() {
        this.offset(1)
    }

    /**
     * Display the given offset (from the current month, year) in the
     * calendar.
     */
    offset(months, years=0) {

        // Cater for offsets of more than 12 months
        let offsetYears = 0
        if (months > 0) {
            offsetYears += Math.floor(Math.abs(months) / 12)
        } else {
            offsetYears -= Math.floor(Math.abs(months) / 12)
        }
        let offsetMonths = months % 12

        // Calculate the new month, year
        let month = this.month + offsetMonths
        let year = this.year + offsetYears

        // Rotate the year when the month value is < 0 or > 11
        if (month < 0) {
            month = 12 + month
            year -= 1

        } else if (month > 11) {
            month -= 12
            year += 1

        }

        // Apply the offset
        this.goto(month, year)
    }

    /**
     * Display the previous calendar month
     */
    previous() {
        this.offset(-1)
    }

    // -- Private methods --

    /**
     * Update the view of the calendar to display the current month/year.
     */
    _update() {
        // Update the month and year label
        this._dom.monthYear.textContent
            = `${this.monthNames[this.month]}, ${this.year}`

        // Find the first date/day in the month
        const date = new Date(this.year, this.month, 1)

        // Determine the start date for the month given the first weekday
        // preference.
        let daysOffset = date.getDay() - this.firstWeekday
        if (daysOffset < 0) {
            daysOffset = 7 - Math.abs(daysOffset)
        }
        if (daysOffset > 0) {
            date.setDate(date.getDate() - daysOffset)
        }

        // Update the dates displayed
        const {css} = this.constructor
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        for (let i = 0; i < 42; i += 1) {
            const dateElm = this._dom.dates.childNodes[i]

            // Set the date day
            dateElm.textContent = date.getDate()

            // Associate the native date with the date element
            dateElm._date = new Date(date.valueOf())

            // Reset the the CSS class for the date element (removing any
            // modifiers).
            dateElm.setAttribute('class', css['date'])

            // Add any applicable CSS modifiers classes to the date element
            const {classList} = dateElm

            // Not in the current month (blocked)
            if (date.getMonth() !== this.month) {
                classList.add(css['blocked'])
            }

            // Blocked by the dates test (blocked)
            if (this.dateTest && !this.dateTest(date)) {
                classList.add(css['blocked'])
            }

            // Today's date
            if (date.getTime() === today.getTime()) {
                classList.add(css['today'])
            }

            // Selected date
            if (date.getTime() === this.date.getTime()) {
                classList.add(css['selected'])
            }

            // Move the date on by 1 day
            date.setDate(date.getDate() + 1)
        }

        // Dispatch an updated event against the calendar
        $.dispatch(
            this.calendar,
            'updated',
            {
                'date': this.date,
                'month': this.month,
                'year': this.year
            }
        )
    }
}


// -- CSS classes --

Calendar.css = {

    /**
     * Applied to a date in the calendar which cannot be selected.
     */
    'blocked': 'mh-calendar__date--blocked',

    /**
     * Applied to the root calendar element.
     */
    'calendar': 'mh-calendar',

    /**
     * Applied to a date in the calendar view.
     */
    'date': 'mh-calendar__date',

    /**
     * Applied to the calendars dates container element.
     */
    'dates': 'mh-calendar__dates',

    /**
     * Applied to the calendar element that displays the currently displayed
     * month and year.
     */
    'monthYear': 'mh-calendar__month-year',

    /**
     * Applied to the calendar's navigation element.
     */
    'nav': 'mh-calendar__nav',

    /**
     * Applied to the calendar's 'next month' navigation element.
     */
    'next': 'mh-calendar__next',

    /**
     * Applied to the calendar's 'previous month' navigation element.
     */
    'previous': 'mh-calendar__previous',

    /**
     * Applied to the selected date element when visible in the calendar view.
     */
    'selected': 'mh-calendar__date--selected',

    /**
     * Applied to the current date element when visible in the calendar view.
     */
    'today': 'mh-calendar__date--today',

    /**
     * Applied to a weekday heading in the calendar view.
     */
    'weekday': 'mh-calendar__weekday',

    /**
     * Applied to the calendars weekdays container element.
     */
    'weekdays': 'mh-calendar__weekdays'

}

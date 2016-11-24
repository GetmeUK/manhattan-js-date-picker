$ = require 'manhattan-essentials'


class Calendar

    # A calendar from which a date can be selected.

    constructor: (parent, options={}) ->

        # Configure the instance
        today = new Date()
        today.setHours(0, 0, 0, 0)

        $.config(
            this,
            {
                # The currently selected date range
                dateRange: [today, today],

                # The current month, year the calendar is displaying
                month: today.getMonth()
                year: 1900 + today.getYear()

                # Typically a list of dates, the `dates` option is used in
                # conjunction with the `pickable` behaviour to determine which
                # dates can be picked.
                dates: [],

                # The earliest date that can be selected
                minDate: null,

                # The latest date that can be selected
                maxDate: null,

                # The weekday that will be displayed first in the calendar view.
                # Weekday must be a number between 0 (Sunday) and 6 (Saturday).
                firstWeekday: 1,

                # A list of all month names that will be used when displaying
                # the month (must contain exactly 12 names).
                monthNames: [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                    ],

                # A list of weekday names that will be used when displaying the
                # days of the week (must contain exactly 7 names).
                weekdayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

                # A list of date parsers that will be used to attempt to parse
                # dates in string format.
                parsers: ['human', 'dmy', 'iso']
            },
            options
            )

        # Set up and configure behaviours
        @_behaviours = {}
        $.config(@_behaviours, {test: 'any'}, options)

        # Domain for related DOM elements
        @_dom = {}

        # Build the elements required for the calendar

        # Calendar
        @_dom.calendar = $.create('div', {'class': @_bem('mh-calendar')})
        parent.appendChild(@_dom.calendar)

        # Nav
        nav = $.create('div', {'class': @_bem('mh-calendar', 'nav')})
        @_dom.calendar.appendChild(nav)

        @_dom.month = $.create('div', {'class': @_bem('mh-calendar', 'month')})
        nav.appendChild(@_dom.month)

        nextMonth = $.create(
            'div', {'class': @_bem('mh-calendar', 'next-month')})
        previousMonth = $.create(
            'div', {'class': @_bem('mh-calendar', 'previous-month')})
        nav.appendChild(nextMonth)
        nav.appendChild(previousMonth)

        # Weekdays
        weekdays = $.create('div', {'class': @_bem('mh-calendar', 'weekdays')})
        @_dom.calendar.appendChild(weekdays)

        for i in [@firstWeekday...(@firstWeekday + 7)]
            weekday = $.create(
                'div', {'class': @_bem('mh-calendar', 'weekday')})

            weekdayIndex = i
            if i >= @weekdayNames.length
                weekdayIndex -= @weekdayNames.length
            weekday.innerHTML = @weekdayNames[weekdayIndex]

            weekdays.appendChild(weekday)

        # Dates
        @_dom.dates = $.create('div', {'class': @_bem('mh-calendar', 'dates')})
        @_dom.calendar.appendChild(@_dom.dates)

        for i in [0...(7 * 6)]
            date = $.create('div', {'class': @_bem('mh-calendar', 'date')})
            @_dom.dates.appendChild(date)

        # Store a reference to the parent the calendar is being added to
        @_dom.parent = parent

        # Define read-only properties
        Object.defineProperty(this, 'calendar', {value: @_dom.calendar})
        Object.defineProperty(this, 'parent', {value: @_dom.parent})

        @update()

    # Public methods

    update: () ->
        # Update the calendar based on the current date range

        # Update the month, year
        @_dom.month.innerHTML = "#{@monthNames[@month]}, #{@year}"

        # Find the first weekday in the month
        weekday = new Date(@year, @month, 1).getDay()

        # Determine the start date for the calendar month given the the first
        # day.
        daysOffset = weekday - @firstWeekday
        if daysOffset < 0
            daysOffset = @firstWeekday - daysOffset

        date = new Date(@year, @month, 1)
        if daysOffset > 0
            date.setDate(date.getDate() - daysOffset)

        # Update the dates
        for i in [0...(7 * 6)]
            dateElm = @_dom.dates.childNodes[i]

            # Set the contents of the date
            dateElm.innerHTML = date.getDate()

            # Clear all existing classes for the date
            dateElm.setAttribute('class', @_bem('mh-calendar', 'date'))

            # Add any modified classes to the date
            classList = dateElm.classList

            # Outside of the current months scope (blocked)
            if date.getMonth() != @month
                classList.add(@_bem('mh-calendar', 'date', 'blocked'))

            # Today's date
            today = new Date()
            today.setHours(0, 0, 0, 0)
            if date.getTime() is today.getTime()
                classList.add(@_bem('mh-calendar', 'date', 'today'))

            # Selected date
            if date.getTime() is @dateRange[0].getTime()
                classList.add(@_bem('mh-calendar', 'date', 'range-start'))

            if date.getTime() is @dateRange[1].getTime()
                classList.add(@_bem('mh-calendar', 'date', 'range-end'))

            if date.getTime() > @dateRange[0].getTime() and
                    date.getTime() < @dateRange[1].getTime()
                classList.add(@_bem('mh-calendar', 'date', 'in-range'))

            # Increment the date by one day
            date.setDate(date.getDate() + 1)

    # Private methods

    _bem: (block, element='', modifier='') ->
        # Build and return a class name
        name = block
        if element
            name = "#{name}__#{element}"
        if modifier
            name = "#{name}--#{modifier}"
        return name

    _et: (eventName) ->
        # Generate an event type name
        return "mh-calendar--#{eventName}"

    # Behaviours

    @behaviours:

        test:
            'any': (calendar, dates) ->
                # Allow any date

            'excluding': (calendar, dates) ->
                # Only enable dates which are not in the list of dates

            'only': (calendar, dates) ->
                # Only enable dates which are in the list of dates

            'weekdays': (calendar, dates) ->
                # Only enable dates for the given list of weekdays

    # Formats

    @formats:

        'dmy': (calendar, s) ->
            # Format a date as `dd/mm/yyyy`

        'human_en': (calendar, s) ->
            # Format a date as `{day} {full month name} {full year}`, e.g
            # `22 January 2011`.

        'human_abbr_en': (calendar, s) ->
            # Format a date as `{day} {month name} {full year}`, e.g:
            #
            # - `22 Jan 2016`

        'iso': (calendar, s) ->
            # Format a date as ISO 8601 (e.g `yyyy-mm-dd`)

        'mdy': (calendar, s) ->
            # Format a date as `mm/dd/yyyy`

    # Parsers

    @parsers:

        'dmy': (calendar, s) ->
            # Return a date from a string using the format (`d/m/y`), the slash
            # separator can be a `/`, '-', or '.'

        'human_en': (calendar, s) ->
            # Return a date from a string using a human readable format, e.g:
            #
            # - `1 Aug`
            # - `15 Feb 17`
            # - `22 January 2011`

        'iso': (calendar, s) ->
            # Return a date from a string in ISO 8601 format (e.g `yyyy-mm-dd`)

        'mdy': (calendar, s) ->
            # Return a date from a string using the format (`m/d/y`), the slash
            # separator can be a `/`, '-', or '.'


module.exports = {Calendar: Calendar}

# Events
#
# - pick

# Other
#
# - Option to select a month and edit a year
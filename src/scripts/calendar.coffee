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
                year: today.getFullYear()

                # Typically a list of dates, the `dates` option is used in
                # conjunction with the `test` behaviour to determine which dates
                # can be picked.
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
                parsers: ['human_en', 'dmy', 'iso']
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
        @_dom.nav = $.create('div', {'class': @_bem('mh-calendar', 'nav')})
        @_dom.calendar.appendChild(@_dom.nav)

        @_dom.month = $.create('div', {'class': @_bem('mh-calendar', 'month')})
        @_dom.nav.appendChild(@_dom.month)

        @_dom.next = $.create(
            'div', {'class': @_bem('mh-calendar', 'next')})
        @_dom.previous = $.create(
            'div', {'class': @_bem('mh-calendar', 'previous')})
        @_dom.nav.appendChild(@_dom.next)
        @_dom.nav.appendChild(@_dom.previous)

        # Weekdays
        @_dom.weekdays = $.create(
            'div', {'class': @_bem('mh-calendar', 'weekdays')})
        @_dom.calendar.appendChild(@_dom.weekdays)

        for i in [@firstWeekday...(@firstWeekday + 7)]
            weekday = $.create(
                'div', {'class': @_bem('mh-calendar', 'weekday')})

            weekdayIndex = i
            if i >= @weekdayNames.length
                weekdayIndex -= @weekdayNames.length
            weekday.innerHTML = @weekdayNames[weekdayIndex]

            @_dom.weekdays.appendChild(weekday)

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

        @_dateRange = @dateRange
        Object.defineProperty(
            this, 'dateRange', {get: () -> return @_dateRange})

        @_month = @month
        Object.defineProperty(this, 'month', {get: () -> return @_month})

        @_year = @year
        Object.defineProperty(this, 'year', {get: () -> return @_year})

        # Set up event listeners for the calendar
        $.listen @_dom.next,
            'click': (ev) =>
                ev.preventDefault()
                @next()

        $.listen @_dom.previous,
            'click': (ev) =>
                ev.preventDefault()
                @previous()

        $.listen @_dom.dates,
            'click': (ev) =>
                ev.preventDefault()

                # Find the parent date
                dateElm = ev.target
                while dateElm.parentNode isnt @_dom.dates
                    dateElm = dateElm.parentNode

                # Check the date isn't been blocked
                blockedCSS = @_bem('mh-calendar', 'date', 'blocked')
                if dateElm.classList.contains(blockedCSS)
                    return

                # Dispatch a pick event against the calendar
                $.dispatch @calendar, @_et('pick'), {'date': dateElm.__mh_date}

        # Update the calendar view
        @update()

    # Public methods

    destroy: () =>
        # Destroy the calendar (remove it from the DOM)
        @parent.removeChild(@calendar)

    goto: (month, year) =>
        # Display the given month, year in the calendar
        @_month = month
        @_year = year
        @update()

        # Dispatch a goto event against the calendar
        $.dispatch @calendar, @_et('goto'), {'month': month, 'year': year}

    next: () ->
        # Display the next month in the calendar
        month = @month + 1
        year = @year

        if month > 11
            month = 1
            year += 1

        @goto(month, year)

    parseDate: (s) ->
        # Parse a date string (if a date is supplied it'll be returned as is)

        # Check if we've been sent a date
        if s instanceof Date
            return s

        # Attempt to parse the string as a date
        for parser in @parsers
            date = @constructor.parsers[parser](s)
            if date
                return date

    previous: () ->
        # Display the previous month in the calendar
        month = @month - 1
        year = @year
        if month < 0
            month = 11
            year -= 1
        @goto(month, year)

    select: (startDate, endDate=null) ->
        # Set the selected date/date range for the calendar
        if endDate
            @_dateRange = [startDate, endDate]
        else
            @_dateRange = [startDate, startDate]
        @update()

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

            # Associate the JS date with the element
            dateElm.__mh_date = new Date(date)

            # Clear all existing classes for the date
            dateElm.setAttribute('class', @_bem('mh-calendar', 'date'))

            # Add any modified classes to the date
            classList = dateElm.classList

            # Outside of the current months scope (blocked)
            if date.getMonth() != @month
                classList.add(@_bem('mh-calendar', 'date', 'blocked'))

            # Check if the date is blocked
            test = @constructor.behaviours.test[@_behaviours.test]
            if not test(this, @dates, date)
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
            'any': (calendar, dates, date) ->
                # Allow any date
                return true

            'excluding': (calendar, dates, date) ->
                # Only enable dates which are not in the list of dates
                for other_date in dates
                    if date.getTime() is other_date.getTime()
                        return false
                return true

            'only': (calendar, dates, date) ->
                # Only enable dates which are in the list of dates
                for other_date in dates
                    if date.getTime() is other_date.getTime()
                        return true
                return false

            'weekdays': (calendar, weekdays, date) ->
                # Only enable dates for the given list of weekdays
                return weekdays.indexOf(date.getDay()) > -1

    # Formats

    @formats:

        'dmy': (date) ->
            # Format a date as `dd/mm/yyyy`
            dd = "00#{date.getDate()}".slice(-2)
            mm = "00#{date.getMonth() + 1}".slice(-2)
            yyyy = date.getFullYear()
            return "#{dd}/#{mm}/#{yyyy}"

        'human_en': (date) ->
            # Format a date as `{day} {full month name} {full year}`, e.g
            # `22 January 2011`.
            month_name = [
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
                'December'
                ][date.getMonth()]
            return "#{date.getDate()} #{month_name} #{date.getFullYear()}"

        'human_abbr_en': (date) ->
            # Format a date as `{day} {month name} {full year}`, e.g:
            #
            # - `22 Jan 2016`
            month_name = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
                ][date.getMonth()]
            return "#{date.getDate()} #{month_name} #{date.getFullYear()}"

        'iso': (date) ->
            # Format a date as ISO 8601 (e.g `yyyy-mm-dd`)
            dd = "00#{date.getDate()}".slice(-2)
            mm = "00#{date.getMonth() + 1}".slice(-2)
            yyyy = date.getFullYear()
            return "#{yyyy}-#{mm}-#{dd}"

        'mdy': (date) ->
            # Format a date as `mm/dd/yyyy`
            dd = "00#{date.getDate()}".slice(-2)
            mm = "00#{date.getMonth() + 1}".slice(-2)
            yyyy = date.getFullYear()
            return "#{mm}/#{dd}/#{yyyy}"

    # Parsers

    @parsers:

        'dmy': (s) ->
            # Return a date from a string using the format (`d/m/y`), the slash
            # separator can be a `/`, '-', or '.'

            # Parse the date information
            dateExp = /^(\d{1,2})(\/|\.|\-)(\d{1,2})(\/|\.|\-)(\d{2}|\d{4})$/
            match = dateExp.exec(s)
            if not match
                return

            # Generate a date
            year = parseInt(match[5])
            month = parseInt(match[3]) - 1
            day = parseInt(match[1])

            # If the year doesn't contain the century then we add the current
            # century to it.
            if year < 100
                year += parseInt((new Date()).getFullYear() / 100) * 100

            date = new Date(year, month, day)

            # Validate the date is as expected
            if date.getFullYear() isnt year or
                    date.getMonth() isnt month or
                    date.getDate() isnt day
                return

            return date

        'human_en': (s) ->
            # Return a date from a string using a human readable format, e.g:
            #
            # - `1 Aug`
            # - `15 Feb 17`
            # - `January 22, 2011`
            # - `Nov 22`
            #
            # The order of the date components is not important, one component
            # be a string representing the month, two other components must be
            # digits (numbers) representing the month and year.

            # Define the name of the months in english
            month_names = {
                'january': 0,
                'february': 1,
                'march': 2,
                'april': 3,
                'may': 4,
                'june': 5,
                'july': 6,
                'august': 7,
                'september': 8,
                'october': 9,
                'november': 10,
                'december': 11
                }

            month_short_names = {
                'jan': 0,
                'feb': 1,
                'mar': 2,
                'apr': 3,
                'may': 4,
                'jun': 5,
                'jul': 6,
                'aug': 7,
                'sep': 8,
                'oct': 9,
                'nov': 10,
                'dec': 11
            }

            # Clean up the date string removing commas as suffixes
            s = s.trim()
            s = s.toLowerCase()
            s = s.replace(',', ' ')
            s = s.replace('st', ' ')
            s = s.replace('nd', ' ')
            s = s.replace('rd', ' ')
            s = s.replace('th', ' ')

            # Split the date string into its components
            components = s.split(/\s+/)

            # Check there are 2 or 3 components
            if components.length isnt 2 and components.length isnt 3
                return

            # Find the month component
            month = null
            for component, i in components.slice()
                if month_names.hasOwnProperty(component)
                    month = month_names[component]

                else if month_short_names.hasOwnProperty(component)
                    month = month_short_names[component]

                if month isnt null
                    components.splice(i, 1)
                    break

            if not month
                return

            # Find a 4 digit year
            year = null
            for component, i in components.slice()
                if component.length == 4
                    year = parseInt(component)
                    components.splice(i, 1)
                    break

            # Check for 2 digit year
            if year is null and components.length == 2
                year = parseInt(components[1])
                components.splice(1, 1)

            if year is null
                year = (new Date()).getFullYear()

            if year is NaN
                return

            # If the year doesn't contain the century then we add the current
            # century to it.
            if year < 100
                year += parseInt((new Date()).getFullYear() / 100) * 100

            # All that's left is the day
            day = parseInt(components[0])
            if day is NaN
                return

            # Generate the date
            date = new Date(year, month, day)

            # Validate the date is as expected
            if date.getFullYear() isnt year or
                    date.getMonth() isnt month or
                    date.getDate() isnt day
                return

            return date

        'iso': (s) ->
            # Return a date from a string in ISO 8601 format (e.g `yyyy-mm-dd`)

            # Parse the date information
            dateExp = /^(\d{4})-(\d{2})-(\d{2})$/
            match = dateExp.exec(s)
            if not match
                return

            # Generate a date
            year = parseInt(match[1])
            month = parseInt(match[2]) - 1
            day = parseInt(match[3])

            date = new Date(year, month, day)

            # Validate the date is as expected
            if date.getFullYear() isnt year or
                    date.getMonth() isnt month or
                    date.getDate() isnt day
                return

            return date

        'mdy': (s) ->
            # Return a date from a string using the format (`m/d/y`), the slash
            # separator can be a `/`, '-', or '.'

            # Parse the date information
            dateExp = /^(\d{1,2})(\/|\.|\-)(\d{1,2})(\/|\.|\-)(\d{2}|\d{4})$/
            match = dateExp.exec(s)
            if not match
                return

            # Generate a date
            year = parseInt(match[5])
            month = parseInt(match[1]) - 1
            day = parseInt(match[3])

            # If the year doesn't contain the century then we add the current
            # century to it.
            if year < 100
                year += parseInt((new Date()).getFullYear() / 100) * 100

            date = new Date(year, month, day)

            # Validate the date is as expected
            if date.getFullYear() isnt year or
                    date.getMonth() isnt month or
                    date.getDate() isnt day
                return

            return date


module.exports = {Calendar: Calendar}
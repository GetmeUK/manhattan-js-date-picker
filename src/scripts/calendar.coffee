$ = require 'manhattan-essentials'


class Calendar

    # A calendar from which a date can be selected.

    constructor: (parent, options) ->

         # Configure the instance
        $.config(
            this,
            {
                # The currently select date
                date: new Date(),

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
                weekdayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],

                # A list of date parsers that will be used to attempt to parse
                # dates in string format.
                parsers: ['human', 'dmy', 'iso']
            },
            options
            )

        # Set up and configure behaviours
        @_behaviours = {}
        $.config(@_behaviours, {test: 'any'}, options)

        # A reference to the input the typeahead is being applied to (we also
        # store a reverse reference to this instance against the input).
        @_dom = {}
        @_dom.input = input
        @_dom.input.__mh_typeahead = this

        # Domain for related DOM elements
        @_dom = {}

        # Build the elements required for the calendar
        @_dom.calendar = $.create('div', {'class': @_bem('mh-calendar')})
        parent.appendChild(@_dom.calendar)

        # Store a reference to the parent the calendar is being added to
        @_dom.parent = parent

        # Define read-only properties
        Object.defineProperty(this, 'calendar', {value: @_dom.calendar})
        Object.defineProperty(this, 'parent', {value: @_dom.parent})

    # Public methods

    # @@

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
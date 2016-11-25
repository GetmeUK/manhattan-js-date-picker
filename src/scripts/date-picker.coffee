$ = require 'manhattan-essentials'

calendar = require './calendar.coffee'


# Classes

class DatePicker

    # A class that provides a date picker against a form field.

    @pkgPrefix: 'data-mh-date-picker--'

    constructor: (input, options={}) ->

        # Configure the instance
        $.config(
            this,
            {
                # The format that dates should be displayed in
                format: 'human_en',

                # A list of date parsers that will be used to attempt to parse
                # dates in string format.
                parsers: ['human_en', 'dmy', 'iso']
            },
            options,
            input,
            @constructor.pkgPrefix
            )

        # Set up and configure behaviours
        @_behaviours = {}

        $.config(
            @_behaviours,
            {
                input: 'set-value'
            },
            options,
            input,
            @constructor.pkgPrefix
            )

        # Flag indicating if the date picker is currently open
        @_isOpen = false

        # Domain for related DOM elements
        @_dom = {}

        # Store a reference to the input the date picker is being applied to (we
        # also store a reverse reference to this instance against the input).
        @_dom.input = input
        @_dom.input.__mh_typeahead = this

        # Build the elements required for the date picker
        @_dom.picker = $.create(
            'div',
            {
                'class': [
                    @_bem('mh-date-picker'),
                    @_bem('mh-date-picker', '', 'closed')
                    ].join(' ')
            }
        )
        document.body.appendChild(@_dom.picker)

        # Setup the calendar for the date picker
        calendarOptions = @parseCalendarOptions(options, input)
        @_calendar = new calendar.Calendar(@_dom.picker, calendarOptions)

        # Define read-only properties
        Object.defineProperty(this, 'calendar', {get: () => @_calendar})
        Object.defineProperty(this, 'input', {value: @_dom.input})
        Object.defineProperty(this, 'isOpen', {get: () => return @_isOpen})

        # Set up event listeners for the date picker
        $.listen @_dom.input,
            'blur': () => @close('blur')
            'focus': () => @open()
            'change': () =>
                # When the input changes attempt to parse it's value as a date
                # and replace the value with a fixed format date.
                date = @calendar.constructor.parseDate(input.value, @parsers)
                if date
                    @pick(date)

        calendarEvents = {}
        calendarEvents[@calendar._et('pick')] = (ev) =>
            @pick(ev.date)

        $.listen(@calendar.calendar, calendarEvents)

        $.listen window,
            'fullscreenchange orientationchange resize': (ev) =>
                # We close the date picker if the window is resized
                if @isOpen
                    @close('resize')

    # Public methods

    close: (reason) =>
        # Close the date picker

        # Check the date picker is open (otherwise there's nothing for us to do)
        if not @isOpen
            return

        # Hide the date picker visually
        @_dom.picker.classList.add(@_bem('mh-date-picker', '', 'closed'))

        # Flag the date picker as closed
        @_isOpen = false

        # Dispatch a close event
        $.dispatch(@input, @_et('close'), {'reason': reason})

    open: () =>
        # Open the date picker

        # Parse the input's value as a date and if valid select it in the
        # calendar.
        date = @calendar.constructor.parseDate(@input.value, @parsers)
        if date
            @calendar.goto(date.getMonth(), date.getFullYear())
            @calendar.select(date)

        # Track the position of the typeahead inline with the input
        @_track()

        # Display the date picker visually
        @_dom.picker.classList.remove(@_bem('mh-date-picker', '', 'closed'))

        # Flag the typeahead as open
        @_isOpen = true

        # Dispatch an open event
        $.dispatch(@input, @_et('open'))

    parseCalendarOptions: (options, input) ->
        # Return a set of calendar options based on the given options and input
        # field.

        calendarOptions = {}
        $.config(
            calendarOptions,
            {
                dates: null,
                minDate: null,
                maxDate: null,
                firstWeekday: null,
                monthNames: null,
                weekdayNames: null,
                parsers: null,
                test: null
            },
            options,
            input,
            @constructor.pkgPrefix
            )

        # Remove any null options
        for key, value of calendarOptions
            if value is null
                delete calendarOptions[key]

        # Coerce string values to their native types
        commaSep = (s) ->
            return (v.trim() for v in s.split(',') when v.trim())

        # Simple lists
        if typeof(calendarOptions.parsers) is 'string'
            calendarOptions.parsers = commaSep(calendarOptions.parsers)

        if typeof(calendarOptions.monthNames) is 'string'
            calendarOptions.monthNames = commaSep(calendarOptions.monthNames)

        if typeof(calendarOptions.weekdayNames) is 'string'
            calendarOptions.weekdayNames = commaSep(
                calendarOptions.weekdayNames)

        # Dates
        parseDate = (s) =>
            return calendar.Calendar.parseDate(s, @parsers)

        if typeof(calendarOptions.minDate) is 'string'
            calendarOptions.minDate = parseDate(calendarOptions.minDate)

        if typeof(calendarOptions.maxDate) is 'string'
            calendarOptions.maxDate = parseDate(calendarOptions.maxDate)

        if typeof(calendarOptions.dates) is 'string'
            calendarOptions.dates = (parseDate(v) \
                    for v in commaSep(calendarOptions.dates) when parseDate(v))

        return calendarOptions

    pick: (date) ->
        # Pick a date

        # Select the date in the calendar
        @calendar.select(date)

        # Set the date value
        @constructor.behaviours.input[@_behaviours.input](this, date)

        # Dispatch a pick event against the input
        $.dispatch(@input, @_et('pick'), {'date': date})

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
        return "mh-date-picker--#{eventName}"

    _track: () ->
        # Position and size the typeahead inline with the input

        # Get the position of the input
        rect = @_dom.input.getBoundingClientRect()
        top = rect.top += window.scrollY
        left = rect.left += window.scrollX

        # Position the typeahead
        @_dom.picker.style.top = "#{top + rect.height}px"
        @_dom.picker.style.left = "#{left}px"

    # Behaviours

    @behaviours:

        # The `input` behaviour is used to set the value of the input when a
        # date is selected.
        input:
            'set-hidden': (datePicker, date) ->
                # Set the value of the input to one formatted date and the value
                # of an associated hidden field to another.
                calendarCls = datePicker.calendar.constructor

                # Set the input's value
                dateStr = calendarCls.formats[datePicker.format](date)
                datePicker.input.value = dateStr

                # Find the associated hidden field
                hiddenSelector = datePicker.input.getAttribute(
                    "#{datePicker.constructor.pkgPrefix}hidden"
                    )
                hidden = $.one(hiddenSelector)

                # Find the associated hidden format
                hiddenFormat = datePicker.input.getAttribute(
                    "#{datePicker.constructor.pkgPrefix}hidden-format"
                    )

                # Set the hidden fields value
                hiddenDateStr = calendarCls.formats[hiddenFormat](date)
                hidden.value = hiddenDateStr

            'set-value': (datePicker, date) ->
                # Set the value of the input to the formatted date
                calendarCls = datePicker.calendar.constructor

                # Set the input's value
                dateStr = calendarCls.formats[datePicker.format](date)
                datePicker.input.value = dateStr


class DateRangePicker

    #


module.exports = {
    Calendar: calendar.Calendar,
    DatePicker: DatePicker,
    DateRangePicker: DateRangePicker
    }

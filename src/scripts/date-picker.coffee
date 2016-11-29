$ = require 'manhattan-essentials'

calendar = require './calendar.coffee'


# Classes


class BasePicker

    # A base picker class used to share functionality between `DatePicker` and
    # `DateRangePicker`.

    constructor: (input, options={}) ->
        # Configure the instance
        $.config(
            this,
            {
                # Flag indicating if the picker should close when a date is
                # picked.
                closeOnPick: false,

                # The format that dates should be displayed in
                format: 'human_en',

                # A list of date parsers that will be used to attempt to parse
                # dates in string format.
                parsers: ['human_en', 'dmy', 'iso']
            },
            options,
            input,
            @constructor.clsPrefix
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
            @constructor.clsPrefix
            )

        # Flag indicating if the picker is currently open
        @_isOpen = false

        # Domain for related DOM elements
        @_dom = {}

        # Build the elements required for the picker
        @_dom.picker = $.create(
            'div',
            {
                'class': [
                    @_bem(@constructor.cssBlock),
                    @_bem(@constructor.cssBlock, '', 'closed')
                    ].join(' ')
            }
        )
        document.body.appendChild(@_dom.picker)

        # Define read-only properties
        Object.defineProperty(this, 'isOpen', {get: () => return @_isOpen})

        # Set up event listeners for the picker
        $.listen window,
            'fullscreenchange orientationchange resize': (ev) =>
                # We close the date picker if the window is resized
                if @isOpen
                    @close('resize')

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
            @constructor.clsPrefix
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
        return "#{@constructor.clsPrefix}#{eventName}"

    _track: (input) ->
        # Position and size the picker inline with the input

        # Get the position of the input
        rect = input.getBoundingClientRect()
        top = rect.top += window.scrollY
        left = rect.left += window.scrollX

        # Position the picker
        @_dom.picker.style.top = "#{top + rect.height}px"
        @_dom.picker.style.left = "#{left}px"


class DatePicker extends BasePicker

    # A class that provides a date picker against a form field.

    @cssBlock: 'mh-date-picker'
    @clsPrefix: 'data-mh-date-picker--'

    constructor: (input, options={}) ->
        super(input, options)

        # Store a reference to the input the date picker is being applied to (we
        # also store a reverse reference to this instance against the input).
        @_dom.input = input
        @_dom.input.__mh_typeahead = this

        # Setup the calendar for the date picker
        calendarOptions = @parseCalendarOptions(options, input)
        @_calendar = new calendar.Calendar(@_dom.picker, calendarOptions)

        # Define read-only properties
        Object.defineProperty(this, 'calendar', {get: () => @_calendar})
        Object.defineProperty(this, 'input', {value: @_dom.input})

        # Set up event listeners for the date picker
        $.listen @input,
            'blur': () => @close('blur')
            'focus': () => @open()
            'click': () => @open()
            'change': () =>
                # When the input changes attempt to parse its value as a date
                # and replace the value with a fixed format date.
                date = calendar.Calendar.parseDate(input.value, @parsers)
                if date
                    @pick(date, {'source': 'input'})

        calendarEvents = {}
        calendarEvents[@calendar._et('pick')] = (ev) =>
            @pick(ev.date, {'source': 'calendar'})

        $.listen(@calendar.calendar, calendarEvents)

    # Public methods

    close: (reason) =>
        # Close the picker

        # Check the picker is open (otherwise there's nothing for us to do)
        if not @isOpen
            return

        # Hide the picker visually
        @_dom.picker.classList.add(@_bem(@constructor.cssBlock, '', 'closed'))

        # Flag the picker as closed
        @_isOpen = false

        # Dispatch a close event
        $.dispatch(@input, @_et('close'), {'reason': reason})

    open: () =>
        # Open the date picker

        # Parse the input's value as a date and if valid select it in the
        # calendar.
        date = calendar.Calendar.parseDate(@input.value, @parsers)
        if date
            @calendar.goto(date.getMonth(), date.getFullYear())
            @calendar.select(date)

        # Track the position of the typeahead inline with the input
        @_track(@input)

        # Display the date picker visually
        @_dom.picker.classList.remove(@_bem('mh-date-picker', '', 'closed'))

        # Flag the typeahead as open
        @_isOpen = true

        # Dispatch an open event
        $.dispatch(@input, @_et('open'))

    pick: (date) ->
        # Pick a date

        # Select the date in the calendar
        @calendar.select(date)

        # Dispatch a pick event against the input
        if $.dispatch(@input, @_et('pick'), {'date': date})

            # Set the date value
            @constructor.behaviours.input[@_behaviours.input](this, date)

            # Close the date picker if configured to
            if @closeOnPick
                @close()

    # Behaviours

    @behaviours:

        # The `input` behaviour is used to set the value of the input when a
        # date is selected.
        input:
            'set-hidden': (datePicker, date) ->
                # Set the value of the input to one formatted date and the value
                # of an associated hidden field to another.

                # Set the input's value
                dateStr = calendar.Calendar.formats[datePicker.format](date)
                datePicker.input.value = dateStr

                # Find the associated hidden field
                hiddenSelector = datePicker.input.getAttribute(
                    "#{datePicker.constructor.clsPrefix}hidden"
                    )
                hidden = $.one(hiddenSelector)

                # Find the associated hidden format
                hiddenFormat = datePicker.input.getAttribute(
                    "#{datePicker.constructor.clsPrefix}hidden-format"
                    )

                # Set the hidden fields value
                hiddenDateStr = calendarCls.formats[hiddenFormat](date)
                hidden.value = hiddenDateStr

            'set-value': (datePicker, date) ->
                # Set the value of the input to the formatted date

                # Set the input's value
                dateStr = calendar.Calendar.formats[datePicker.format](date)
                datePicker.input.value = dateStr


class DateRangePicker extends BasePicker

    # A class that provides a date range picker against a form field.

    @cssBlock: 'mh-date-range-picker'
    @clsPrefix: 'data-mh-date-range-picker--'

    constructor: (startInput, endInput, options={}) ->
        super(startInput, options)

         # Configure the instance
        $.config(
            this,
            {
                # Flag indicating if the date range picker should always open
                # relative to the start date (even when the end date has focus).
                pinToStart: false
            },
            options,
            startInput,
            @constructor.clsPrefix
            )

        # Flag indicating which date we're picking
        @_picking = 'start'

        # Store a reference to the inputs the date range picker is being applied
        # to (we also store a reverse reference to this instance against the
        # inputs).
        @_dom.startInput = startInput
        @_dom.startInput.__mh_typeahead = this
        @_dom.endInput = endInput
        @_dom.endInput.__mh_typeahead = this

        # Setup the calendars for the date range picker
        calendarOptions = @parseCalendarOptions(options, startInput)
        @_calendars = [
            new calendar.Calendar(@_dom.picker, calendarOptions)
            new calendar.Calendar(@_dom.picker, calendarOptions)
            ]

        # Store the index of the calendar against it's DOM element
        @_calendars[0].calendar.__mh_index = 0
        @_calendars[1].calendar.__mh_index = 1

        # Define read-only properties
        Object.defineProperty(this, 'calendars', {get: () => @_calendars})
        Object.defineProperty(this, 'endInput', {value: @_dom.endInput})
        Object.defineProperty(this, 'startInput', {value: @_dom.startInput})
        Object.defineProperty(this, 'picking', {get: () => return @_picking})

        # Set up event listeners for the date picker
        for input in [@startInput, @endInput]
            $.listen input,
                'blur': () =>
                    if @startInput is not document.activeElement and
                            @endInput is not document.activeElement

                        @close('blur')

                'focus': (ev) => @open(ev.target)
                'click': (ev) => @open(ev.target)
                'change': (ev) =>
                    # When the input changes attempt to parse its value as a
                    # date and replace the value with a fixed format date.
                    date = calendar.Calendar.parseDate(
                        ev.target.value,
                        @parsers
                        )
                    if date
                        @pick(date, {'source': 'input'})

        calendarEvents = {}

        calendarEvents[@calendars[0]._et('pick')] = (ev) =>
            @pick(ev.date, {'source': 'calendar'})

        calendarEvents[@calendars[0]._et('goto')] = (ev) =>
            # Make sure the adjacent calendar is one month on
            @calendars[1].goto(@calendars[0].month, @calendars[0].year, false)
            @calendars[1].next(false)

        $.listen(@calendars[0].calendar, calendarEvents)

        calendarEvents[@calendars[0]._et('goto')] = (ev) =>
            # Make sure the adjacent calendar is one month behind
            @calendars[0].goto(@calendars[1].month, @calendars[1].year, false)
            @calendars[0].previous(false)

        $.listen(@calendars[1].calendar, calendarEvents)

    close: (reason) =>
        # Close the picker

        # Check the picker is open (otherwise there's nothing for us to do)
        if not @isOpen
            return

        # Hide the picker visually
        @_dom.picker.classList.add(@_bem(@constructor.cssBlock, '', 'closed'))

        # Flag the picker as closed
        @_isOpen = false

        # Dispatch a close event
        $.dispatch(@startInput, @_et('close'), {'reason': reason})

    open: (input=null) =>
        # Open the date picker

        if input is null
            input = @startInput

        # Set which date will be picked by the next pick event
        @_picking = 'start'
        if input is @endInput
            @_picking = 'end'

        # Parse the input's value as a date and if valid select them as a
        # date range.
        startDate = calendar.Calendar.parseDate(@startInput.value, @parsers)

        endDate = calendar.Calendar.parseDate(@endInput.value, @parsers)
        dateRange = @calendars[0].dateRange
        if startDate
            dateRange[0] = startDate
        if endDate
            dateRange[1] = endDate

        if @picking is 'start'
            # Set the maximum date you can pick to the start date and remove any
            # the minimum date.
            for _calendar in @calendars
                _calendar.minDate = null
                _calendar.maxDate = dateRange[1]

        else
            # Set the minimum date you can pick to the start date and remove any
            # the maximum date.
            for _calendar in @calendars
                _calendar.minDate = dateRange[0]
                _calendar.maxDate = null

        for _calendar in @calendars
            _calendar.goto(startDate.getMonth() + 1, startDate.getFullYear())
            _calendar.select(dateRange[0], dateRange[1])

        # Set the last calendar to show the month after the first
        if @picking is 'start'
            @calendars[0].goto(
                dateRange[0].getMonth(),
                dateRange[0].getFullYear(),
                false
                )
            @calendars[1].goto(@calendars[0].month, @calendars[0].year, false)
            @calendars[1].next(false)
        else
            @calendars[1].goto(
                dateRange[1].getMonth(),
                dateRange[1].getFullYear(),
                false
                )
            @calendars[0].goto(@calendars[1].month, @calendars[1].year, false)
            @calendars[0].previous(false)

        # Track the position of the typeahead inline with the input
        @_track(if @pinToStart then @startInput else input)

        # Display the date picker visually
        closedClass = @_bem(@constructor.cssBlock, '', 'closed')
        @_dom.picker.classList.remove(closedClass)

        # Flag the typeahead as open
        @_isOpen = true

        # Dispatch an open event
        $.dispatch(input, @_et('open'))

    pick: (date) ->
        # Pick a date

        # Select the date range in each calendar
        dateRange = @calendars[0].dateRange
        if @picking is 'start'
            dateRange[0] = date
            @_picking = 'end'

        else
            dateRange[1] = date
            @_picking = 'start'

        for _calendar in @calendars
            _calendar.select(dateRange[0], dateRange[1])

        # Dispatch a pick event against the input
        if $.dispatch(@startInput, @_et('pick'), {'date': date})

            # Set the date value
            @constructor.behaviours.input[@_behaviours.input](this, dateRange)

            # Close the date picker if configured to
            if @closeOnPick
                @close()

        # Select the date range in each calendar
        if @picking is 'start'
            # Set the maximum date you can pick to the start date and remove any
            # the minimum date.
            for _calendar in @calendars
                _calendar.minDate = null
                _calendar.maxDate = date
                _calendar.update()

            # Switch the focus to the start input
            @startInput.focus()

        else
            # Set the minimum date you can pick to the start date and remove any
            # the maximum date.
            for _calendar in @calendars
                _calendar.minDate = date
                _calendar.maxDate = null
                _calendar.update()

            # Switch the focus to the end input
            @endInput.focus()

    @behaviours:

        # The `input` behaviour is used to set the value of the input when a
        # date is selected.
        input:
            'set-value': (dateRangePicker, dateRange) ->
                # Set the input values
                format = calendar.Calendar.formats[dateRangePicker.format]
                dateRangePicker.startInput.value = format(dateRange[0])
                dateRangePicker.endInput.value = format(dateRange[1])


module.exports = {
    Calendar: calendar.Calendar,
    DatePicker: DatePicker,
    DateRangePicker: DateRangePicker
    }

# @@ Update all other packages to use the `clsPrefix` not `pkgPrefix` class
#    property name.
# @@ Refactor calendar, need to rethink if goto should trigger events in the way
#    it does, we potentially need a reason for the goto (or a trigger) so that
#    the event handler can determine if it needs to take action (we also need to
#    review the sheer number goto events triggered.
# @@ Start over on the date picker classes, define the key behaviours of the
#    date picker range and make sure where needed these can be configured. It's
#    just to complicated as it stands (the calenderOptionsParser isn't ideal
#    either so lets see if we can improve on that).

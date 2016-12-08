$ = require 'manhattan-essentials'

Calendar = require('./calendar.coffee').Calendar


class BasePicker

    # A base class that provides some shared functionality for date pickers.

    constructor: () ->

        # Flag indicating if the picker is currently open
        @_isOpen = false
        Object.defineProperty(this, 'isOpen', {get: () => return @_isOpen})

        # Set up event listeners for the picker
        $.listen window,
            'fullscreenchange orientationchange resize': (ev) =>
                # We close the date picker if the window is resized
                if @isOpen
                    @close('resize')

    # Public methods

    close: (input, block, reason) =>
        # Close the picker

        # Check the picker is open (otherwise there's nothing for us to do)
        if not @isOpen
            return

        # Hide the picker visually
        @_dom.picker.classList.add(@_bem(block, '', 'closed'))

        # Flag the picker as closed
        @_isOpen = false

        # Dispatch a close event
        $.dispatch(input, @_et('close'), {'reason': reason})

    # Private methods

    _bem: (block, element='', modifier='') ->
        # Build and return a class name
        name = block
        if element
            name = "#{name}__#{element}"
        if modifier
            name = "#{name}--#{modifier}"
        return name

    _track: (input) ->
        # Position and size the picker inline with an input element

        # Get the position of the input
        rect = input.getBoundingClientRect()
        top = rect.top += window.scrollY
        left = rect.left += window.scrollX

        # Position the picker
        @_dom.picker.style.top = "#{top + rect.height}px"
        @_dom.picker.style.left = "#{left}px"


class DatePicker extends BasePicker

    # A class that provides a date picker against a form field.

    @clsPrefix: 'data-mh-date-picker--'

    constructor: (input, options={}) ->
        super()

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

        # Domain for related DOM elements
        @_dom = {}

        # Store a reference to the input the date picker is being applied to (we
        # also store a reverse reference to this instance against the input).
        @_dom.input = input
        @_dom.input.__mh_datePicker = this

        # Build the elements required for the picker
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
        proxyOptions = Calendar.proxyOptions(options, input)
        @_calendar = new Calendar(@_dom.picker, proxyOptions)

        # Define read-only properties
        Object.defineProperty(this, 'calendar', {get: () => @_calendar})
        Object.defineProperty(this, 'input', {value: @_dom.input})

        # Set up event listeners for the date picker
        $.listen @input,
            'blur': () =>
                @close('blur')
            'click': () => @open()
            'focus': () => @open()

            'change': () =>
                # When the input changes attempt to parse its value as a date
                # and replace the value with a formatted date.
                date = Calendar.parseDate(@input.value, @parsers)
                if date
                    @pick(date, 'input')

        # Set up event listeners for the calendar
        eventListeners = {}
        eventListeners[@calendar._et('pick')] = (ev) =>
            @pick(ev.date, 'calendar')

        $.listen(@calendar.calendar, eventListeners)

    # Public methods

    close: (reason) ->
        super(@input, 'mh-date-picker', reason)

    open: () =>
        # Open the date picker

        # Parse the input's value as a date and if valid select it in the
        # calendar.
        date = Calendar.parseDate(@input.value, @parsers)
        if date
            @calendar.goto(date.getMonth(), date.getFullYear())
            @calendar.select(date)

        # Track the position of the picker inline with the input
        @_track()

        # Display the date picker visually
        @_dom.picker.classList.remove(@_bem('mh-date-picker', '', 'closed'))

        # Flag the picker as open
        @_isOpen = true

        # Dispatch an open event
        $.dispatch(@input, @_et('open'))

    pick: (date, source='') ->
        # Pick a date

        # Select the date in the calendar
        @calendar.select(date)

        # Dispatch a pick event against the input
        if $.dispatch(@input, @_et('pick'), {'date': date, 'source': source})

            # Set the date value
            @constructor.behaviours.input[@_behaviours.input](this, date)

            # Dispatch a picked event
            $.dispatch(@input, @_et('picked'), {'date': date, 'source': source})

            # Close the date picker if configured to
            if @closeOnPick
                @close({'reason': 'pick'})

    # Private methods

    _et: (eventName) ->
        # Generate an event type name
        return "mh-date-picker--#{eventName}"

    _track: () ->
        super(@input)

    # Behaviours

    @behaviours:

        # The `input` behaviour is used to set the value of the input when a
        # date is selected.
        input:
            'set-hidden': (datePicker, date) ->
                # Set the value of the input to one formatted date and the value
                # of an associated hidden field to another.

                # Set the input's value
                dateStr = Calendar.formats[datePicker.format](date)
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
                hiddenDateStr = Calendar.formats[hiddenFormat](date)
                hidden.value = hiddenDateStr

            'set-value': (datePicker, date) ->
                # Set the value of the input to the formatted date

                # Set the input's value
                dateStr = Calendar.formats[datePicker.format](date)
                datePicker.input.value = dateStr


class DateRangePicker extends BasePicker

    # A class that provides a date range picker against a form field.

    @clsPrefix: 'data-mh-date-range-picker--'

    constructor: (startInput, endInput, options={}) ->
        super()

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
                parsers: ['human_en', 'dmy', 'iso'],

                # Flag indicating if the date range picker should always open
                # relative to the start date (even when the end date has focus).
                pinToStart: false
            },
            options,
            startInput,
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
            startInput,
            @constructor.clsPrefix
            )

        # Domain for related DOM elements
        @_dom = {}

        # Build the elements required for the picker
        @_dom.picker = $.create(
            'div',
            {
                'class': [
                    @_bem('mh-date-range-picker'),
                    @_bem('mh-date-range-picker', '', 'closed')
                    ].join(' ')
            }
        )
        document.body.appendChild(@_dom.picker)

        # Store a reference to the inputs the date range picker is being applied
        # to (we also store a reverse reference to this instance against the
        # inputs).
        @_dom.startInput = startInput
        @_dom.startInput.__mh_dateRangePicker = this
        @_dom.endInput = endInput
        @_dom.endInput.__mh_dateRangePicker = this

        # Setup the calendars for the date range picker
        proxyOptions = Calendar.proxyOptions(options, startInput)
        @_calendars = [
            new Calendar(@_dom.picker, proxyOptions)
            new Calendar(@_dom.picker, proxyOptions)
            ]

        # Flag indicating which date (start or end) we're picking in the range
        @_picking = 'start'

        # Define read-only properties
        Object.defineProperty(this, 'calendars', {get: () => @_calendars})
        Object.defineProperty(this, 'endInput', {value: @_dom.endInput})
        Object.defineProperty(this, 'startInput', {value: @_dom.startInput})
        Object.defineProperty(this, 'picking', {get: () => return @_picking})

        # Set up event listeners for the date picker
        for input in [@startInput, @endInput]
            $.listen input,
                'click': (ev) ->
                    ev.target.focus()

                'focus': (ev) =>
                    # Flag the date that's being picked
                    if ev.target is @startInput
                        @_picking = 'start'
                    else
                        @_picking = 'end'
                    @open()

                'blur': () =>
                    # Check if the active element is one of the picker's inputs
                    # (e.g when switching between date inputs), if so then we
                    # don't want to close the picker.
                    activeInput = document.activeElement
                    if @startInput is activeInput or @endInput is activeInput
                        return

                    @close('blur')

                'change': (ev) =>
                    # When the input changes attempt to parse its value as a
                    # date and replace the value with a fixed format date.

                    # Parse the date
                    date = Calendar.parseDate(ev.target.value, @parsers)
                    if date

                        # Build the date range
                        dateRange = @calendars[0].dateRange
                        if @picking is 'start'
                            dateRange[0] = date
                        else
                            dateRange[1] = date

                        @pick(dateRange, {'source': 'input'})

        # Set up event listeners for the calendar
        eventListeners = {}

        eventListeners[@calendars[0]._et('pick')] = (ev) =>

            # Build the date range
            dateRange = @calendars[0].dateRange
            if @picking is 'start'
                dateRange[0] = ev.date
            else
                dateRange[1] = ev.date

            @pick(dateRange, {'source': 'calendar'})

        eventListeners[@calendars[0]._et('view')] = (ev) =>
            # Make sure the adjacent calendar is one month on
            if @calendars.indexOf(ev.calendar) is 0
                @calendars[1].sync(@calendars[0], 1)
            else
                @calendars[0].sync(@calendars[1], -1)

        $.listen(@calendars[0].calendar, eventListeners)
        $.listen(@calendars[1].calendar, eventListeners)

    # Public methods

    close: (reason) ->
        super(@startInput, 'mh-date-range-picker', reason)

    open: () ->
        # Open the date range picker

        # Determine which input the picker is being open against
        input = @startInput
        if @picking == 'end'
            input = @endInput

        # Parse the date inputs and build a date range to select in the
        # calendars.
        startDate = Calendar.parseDate(@startInput.value, @parsers)
        endDate = Calendar.parseDate(@endInput.value, @parsers)
        dateRange = @calendars[0].dateRange
        if startDate
            dateRange[0] = startDate
        if endDate
            dateRange[1] = endDate

        # If the start date is after the end date then set the value of the
        # start input and focus on the end input.
        if dateRange[1] < dateRange[0]
            @pick([dateRange[1], dateRange[0]])
            @endInput.focus()
            return

        # Select the current date range
        for calendar in @calendars
            calendar.select(dateRange[0], dateRange[1])

        # If neither calendar contains the start or end date in the range then
        # set the first calendar to show the start date.
        startStr = "#{dateRange[0].getMonth()}.#{dateRange[0].getFullYear()}"
        endStr = "#{dateRange[1].getMonth()}.#{dateRange[1].getFullYear()}"
        viewStrs = [
            "#{@calendars[0].month}.#{@calendars[0].year}",
            "#{@calendars[1].month}.#{@calendars[1].year}"
            ]
        if viewStrs.indexOf(startStr) is -1 and viewStrs.indexOf(endStr) is -1
            viewDate = dateRange[0]
            @calendars[0].goto(viewDate.getMonth(), viewDate.getFullYear())

        # Track the position of the picker inline with the input
        @_track(if @pinToStart then @startInput else input)

        # Display the date picker visually
        closedClass = @_bem('mh-date-range-picker', '', 'closed')
        @_dom.picker.classList.remove(closedClass)

        # Flag the picker as open
        @_isOpen = true

        # Dispatch an open event
        $.dispatch(@startInput, @_et('open'))

    pick: (dateRange, source) ->
        # Pick a date

        # Set the date range for both calendar
        for calendar in @calendars
            calendar.select(dateRange[0], dateRange[1])

        # Dispatch a pick event against the input
        evData = {'dateRange': dateRange, 'source': source}
        if $.dispatch(@startInput, @_et('pick'), evData)

            # Set the date value
            @constructor.behaviours.input[@_behaviours.input](this, dateRange)

            # Dispatch a picked event
            $.dispatch(@startInput, @_et('picked'), evData)

            # Switch the focus to the next date input
            if @picking is 'start'
                @endInput.focus()
            else
                @startInput.focus()

            # Close the date picker if configured to
            if @closeOnPick
                @close()

    # Private methods

    _et: (eventName) ->
        # Generate an event type name
        return "mh-date-range-picker--#{eventName}"

    # Behaviours

    @behaviours:

        # The `input` behaviour is used to set the value of the input when a
        # date is selected.
        input:
            'set-value': (dateRangePicker, dateRange) ->
                # Set the input values
                format = Calendar.formats[dateRangePicker.format]
                dateRangePicker.startInput.value = format(dateRange[0])
                dateRangePicker.endInput.value = format(dateRange[1])


module.exports = {

    # The calendar is exported to allow new behaviours, date formats and parsers
    # to be defined.
    Calendar: Calendar,

    # UI component classes
    DatePicker: DatePicker,
    DateRangePicker: DateRangePicker
    }
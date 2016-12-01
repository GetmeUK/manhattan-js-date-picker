class DateRangePicker extends BasePicker

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
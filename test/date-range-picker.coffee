# Imports

chai = require 'chai'
jsdom = require 'mocha-jsdom'
sinon = require 'sinon'
sinonChai = require 'sinon-chai'

$ = require 'manhattan-essentials'
DateRangePicker = require('../src/scripts/date-picker').DateRangePicker


# Set up

should = chai.should()
chai.use(sinonChai)


# Tests

describe 'DateRangePicker (class)', ->

    jsdom()

    form = null
    startInput = null
    endInput = null
    dateRangePicker = null

    before ->
        # Build a form with an input field
        form = $.create('form')
        startInput = $.create(
            'input',
            {
                'value': '1 Jan 2000',
                'data-mh-date-range-picker': true
            }
        )
        startInput.getBoundingClientRect = ->
            return {
                bottom: 20,
                height: 10,
                left: 10,
                right: 110,
                top: 10,
                width: 100
                }
        endInput = $.create('input', {'value': '5 Jan 2000'})
        endInput.getBoundingClientRect = ->
            return {
                bottom: 20,
                height: 10,
                left: 50,
                right: 150,
                top: 10,
                width: 100
                }
        document.body.appendChild(form)
        form.appendChild(startInput)
        form.appendChild(endInput)

        # Initialize a date range picker for the input fields
        dateRangePicker = new DateRangePicker(startInput, endInput)

    describe 'constructor', ->

        it 'should generate a new `DateRangePicker` instance', ->

            dateRangePicker.should.be.an.instanceof DateRangePicker

        it 'should add the date range picker element to the body', ->

            $.one('.mh-date-range-picker', document.body).should.exist

    describe 'close', ->

        beforeEach ->
            dateRangePicker.open()

        it 'should flag the date range picker as closed', ->

            dateRangePicker.close()
            dateRangePicker.isOpen.should.be.false

        it 'should add a closed CSS class to the date range picker', ->

            dateRangePicker.close()
            pickerElm = dateRangePicker._dom.picker
            closed = 'mh-date-range-picker--closed'
            pickerElm.classList.contains(closed).should.be.true

        it 'should dispatch a close event against the start input', ->

            listener = sinon.spy()
            startInput.addEventListener('mh-date-range-picker--close', listener)
            dateRangePicker.close('test')
            listener.should.have.been.calledOn startInput

            ev = listener.args[0][0]
            ev.reason.should.equal 'test'

    describe 'open', ->

        beforeEach ->
            dateRangePicker.close()

        it 'should flag the date range picker as open', ->

            dateRangePicker.open()
            dateRangePicker.isOpen.should.be.true

        it 'should remove the closed CSS class from the date range picker', ->

            dateRangePicker.open()
            pickerElm = dateRangePicker._dom.picker
            closed = 'mh-date-range-picker--closed'
            pickerElm.classList.contains(closed).should.be.false

        it 'should dispatch an open event against the start input', ->

            listener = sinon.spy()
            startInput.addEventListener('mh-date-range-picker--open', listener)
            dateRangePicker.open()
            listener.should.have.been.calledOn startInput

        describe 'when the start date is greater than the end date', ->

            it 'should set the start input to the end input (and visa-versa) and
                focus the end input', ->

                startInput.value = '10 Jan 2000'
                startInput.focus()

                startInput.value.should.equal '5 January 2000'
                endInput.value.should.equal '10 January 2000'
                document.activeElement.should.equal endInput

        describe 'when the start input is focused', ->

            it 'should position the date range picker in-line with the start
                input', ->

                startInput.focus()

                pickerElm = dateRangePicker._dom.picker
                pickerElm.style.left.should.equal '10px'
                pickerElm.style.top.should.equal '20px'

        describe 'when the end input is focused', ->

            it 'should position the date range picker in-line with the end
                input', ->

                endInput.focus()

                pickerElm = dateRangePicker._dom.picker
                pickerElm.style.left.should.equal '50px'
                pickerElm.style.top.should.equal '20px'

    describe 'pick', ->

        dateRange = [new Date(2001, 1, 5), new Date(2001, 1, 10)]

        beforeEach ->
            startInput.value = '1 Jan 2000'
            endInput.value = '5 Jan 2000'
            for calendar in dateRangePicker.calendars
                calendar.select(new Date(2000, 0, 1), new Date(2000, 0, 5))

        it 'should select the date range in the calendar', ->

            dateRangePicker.pick(dateRange)
            for calendar in dateRangePicker.calendars
                dates = calendar.dateRange
                dates[0].getTime().should.deep.equal dateRange[0].getTime()
                dates[1].getTime().should.deep.equal dateRange[1].getTime()

        it 'should set the value of the start and end inputs to the picked
            date range', ->

            dateRangePicker.pick(dateRange)
            startInput.value.should.equal = '5 February 2001'
            endInput.value.should.equal '10 February 2001'

        it 'should dispatch a pick and picked event against the start input', ->

            pickListener = sinon.spy()
            pickedListener = sinon.spy()
            startInput.addEventListener(
                'mh-date-range-picker--pick',
                pickListener
                )
            startInput.addEventListener(
                'mh-date-range-picker--picked',
                pickedListener
                )

            dateRangePicker.pick(dateRange, 'test')

            pickEv = pickListener.args[0][0]
            pickedEv = pickedListener.args[0][0]

            pickListener.should.have.been.calledOn startInput
            pickEv.dateRange.should.equal dateRange
            pickEv.source.should.equal 'test'

            pickedListener.should.have.been.calledOn startInput
            pickedEv.dateRange.should.equal dateRange
            pickedEv.source.should.equal 'test'

        describe 'when the start input is focused', ->

            it 'should set the focus to the end input', ->

                startInput.focus()
                dateRangePicker.pick(dateRange)
                document.activeElement.should.equal endInput

        describe 'when the end input is focused', ->

            it 'should set the focus to the start input', ->

                endInput.focus()
                dateRangePicker.pick(dateRange)
                document.activeElement.should.equal startInput


describe 'DateRangePicker (options)', ->

    jsdom()

    form = null
    input = null
    dateRangePicker = null

    form = null
    startInput = null
    endInput = null
    dateRangePicker = null

    before ->
        # Build a form with an input field
        form = $.create('form')
        startInput = $.create(
            'input',
            {
                'value': '1 Jan 2000',
                'data-mh-date-range-picker': true
            }
        )
        startInput.getBoundingClientRect = ->
            return {
                bottom: 20,
                height: 10,
                left: 10,
                right: 110,
                top: 10,
                width: 100
                }
        endInput = $.create('input', {'value': '5 Jan 2000'})
        endInput.getBoundingClientRect = ->
            return {
                bottom: 20,
                height: 10,
                left: 50,
                right: 150,
                top: 10,
                width: 100
                }
        document.body.appendChild(form)
        form.appendChild(startInput)
        form.appendChild(endInput)

    afterEach ->
        document.body.removeChild(dateRangePicker._dom.picker)

    describe 'closeOnPick', ->

        describe 'when false', ->

            before ->
                dateRangePicker = new DateRangePicker(
                    startInput,
                    endInput,
                    {closeOnPick: false}
                    )

            it 'should keep the date picker open once a date has been
                picked', ->

                dateRangePicker.open()
                dateRangePicker.pick([
                    new Date(2000, 0, 5),
                    new Date(2000, 0, 10)
                    ])
                dateRangePicker.isOpen.should.be.true

        describe 'when true', ->

            before ->
                dateRangePicker = new DateRangePicker(
                    startInput,
                    endInput,
                    {closeOnPick: true}
                    )

            it 'should close the date picker once a date has been picked', ->

                dateRangePicker.open()
                dateRangePicker.pick([
                    new Date(2000, 0, 5),
                    new Date(2000, 0, 10)
                    ])
                dateRangePicker.isOpen.should.be.false

    describe 'format', ->

        describe 'when iso', ->

            before ->
                dateRangePicker = new DateRangePicker(
                    startInput,
                    endInput,
                    {format: 'iso'}
                    )

            it 'should set the input values as ISO 8601 format dates when a date
                range is picked', ->

                dateRangePicker.pick([
                    new Date(2000, 0, 5),
                    new Date(2000, 0, 10)
                    ])
                startInput.value.should.equal '2000-01-05'
                endInput.value.should.equal '2000-01-10'

    describe 'parsers', ->

        describe 'when ["mdy"]', ->

            before ->
                dateRangePicker = new DateRangePicker(
                    startInput,
                    endInput,
                    {
                        format: 'mdy',
                        parsers: ['mdy']
                    }
                )

            it 'should only parse dates in m/d/y format when the input value is
                changed', ->

                # Date should not be parsed and therefore the selected date and
                # input value should not have changed.
                startInput.value = '2001-01-05'
                endInput.value = '2001-01-10'
                $.dispatch(startInput, 'changed')
                $.dispatch(endInput, 'changed')

                startInput.value.should.equal '2001-01-05'
                endInput.value.should.equal '2001-01-10'

                # Date should be parsed and therefore the selected date and
                # input should have changed.
                startInput.value = '05/01/2001'
                endInput.value = '10/01/2001'
                $.dispatch(startInput, 'changed')
                $.dispatch(endInput, 'changed')

                startInput.value.should.equal '05/01/2001'
                endInput.value.should.equal '10/01/2001'

    describe 'pinToStart', ->

        describe 'when true and the end input is focused', ->

            before ->
                dateRangePicker = new DateRangePicker(
                    startInput,
                    endInput,
                    {'pinToStart': true}
                )

            it 'should position the date range picker in-line with the start
                input', ->

                endInput.focus()

                pickerElm = dateRangePicker._dom.picker
                pickerElm.style.left.should.equal '10px'
                pickerElm.style.top.should.equal '20px'


describe 'DateRangePicker (behaviours)', ->

    jsdom()

    form = null
    startInput = null
    endInput = null
    dateRangePicker = null

    before ->
        # Build a form with an input field
        form = $.create('form')
        startInput = $.create(
            'input',
            {
                'value': '1 Jan 2000',
                'data-mh-date-range-picker': true
            }
        )
        endInput = $.create('input', {'value': '5 Jan 2000'})
        document.body.appendChild(form)
        form.appendChild(startInput)
        form.appendChild(endInput)

        # Initialize a date range picker for the input fields
        dateRangePicker = new DateRangePicker(startInput, endInput)

    describe 'input', ->

        dateRange = [new Date(2001, 1, 5), new Date(2001, 1, 10)]

        describe 'set-value', ->

            before ->
                startInput.value = ''
                endInput.value = ''

            it 'should set the value of the start and end input fields', ->

                behaviour = DateRangePicker.behaviours.input['set-value']
                behaviour(dateRangePicker, dateRange)
                startInput.value.should.equal '5 February 2001'
                endInput.value.should.equal '10 February 2001'
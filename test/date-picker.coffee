# Imports

chai = require 'chai'
jsdom = require 'mocha-jsdom'
sinon = require 'sinon'
sinonChai = require 'sinon-chai'

$ = require 'manhattan-essentials'
DatePicker = require('../src/scripts/date-picker').DatePicker
DateRangePicker = require('../src/scripts/date-picker').DateRangePicker


# Set up

should = chai.should()
chai.use(sinonChai)


# Tests

describe 'DatePicker (class)', ->

    jsdom()

    form = null
    input = null
    datePicker = null

    before ->
        # Build a form with an input field
        form = $.create('form')
        input = $.create(
            'input',
            {
                'value': '1 Jan 2000',
                'data-mh-date-picker': true
            }
        )
        input.getBoundingClientRect = ->
            return {
                bottom: 20,
                height: 10,
                left: 10,
                right: 110,
                top: 10,
                width: 100
                }

        document.body.appendChild(form)
        form.appendChild(input)

        # Initialize a date picker for the input field
        datePicker = new DatePicker(input)

    describe 'constructor', ->

        it 'should generate a new `DatePicker` instance', ->

            datePicker.should.be.an.instanceof DatePicker

        it 'should add the date picker element to the body', ->

            $.one('.mh-date-picker', document.body).should.exist

    describe 'close', ->

        beforeEach ->
            datePicker.open()

        it 'should flag the date picker as closed', ->

            datePicker.close()
            datePicker.isOpen.should.be.false

        it 'should add a closed CSS class to the date picker', ->

            datePicker.close()
            pickerElm = datePicker._dom.picker
            closed = 'mh-date-picker--closed'
            pickerElm.classList.contains(closed).should.be.true

        it 'should dispatch a close event against the input', ->

            listener = sinon.spy()
            input.addEventListener('mh-date-picker--close', listener)
            datePicker.close('test')
            listener.should.have.been.calledOn input

            ev = listener.args[0][0]
            ev.reason.should.equal 'test'

    describe 'open', ->

        beforeEach ->
            datePicker.close()

        it 'should flag the date picker as open', ->

            datePicker.open()
            datePicker.isOpen.should.be.true

        it 'should remove the closed CSS class from the date picker', ->

            datePicker.open()
            pickerElm = datePicker._dom.picker
            closed = 'mh-date-picker--closed'
            pickerElm.classList.contains(closed).should.be.false

        it 'should position the typeahead in-line with the input', ->

            datePicker.open()

            pickerElm = datePicker._dom.picker
            pickerElm.style.left.should.equal '10px'
            pickerElm.style.top.should.equal '20px'

        it 'should dispatch an open event against the input', ->

            listener = sinon.spy()
            input.addEventListener('mh-date-picker--open', listener)
            datePicker.open()
            listener.should.have.been.calledOn input

        it 'should show a calendar view for the date value in the input', ->

            datePicker.open()
            datePicker.calendar.month.should.equal 0
            datePicker.calendar.year.should.equal 2000

    describe 'pick', ->

        date = new Date(2001, 2, 3)

        beforeEach ->
            input.value = '1 Jan 2000'
            datePicker.calendar.select(new Date(2000, 0, 1))

        it 'should select the date in the calendar', ->

            datePicker.pick(date)
            dateRange = datePicker.calendar.dateRange
            dateRange[0].getTime().should.deep.equal date.getTime()
            dateRange[1].getTime().should.deep.equal date.getTime()

        it 'should set the value of the input to the picked date', ->

            datePicker.pick(date)
            input.value = '3 Mar 2001'

        it 'should dispatch a pick and picked event against the input', ->

            pickListener = sinon.spy()
            pickedListener = sinon.spy()
            input.addEventListener('mh-date-picker--pick', pickListener)
            input.addEventListener('mh-date-picker--picked', pickedListener)

            datePicker.pick(date, 'test')

            pickEv = pickListener.args[0][0]
            pickedEv = pickedListener.args[0][0]

            pickListener.should.have.been.calledOn input
            pickEv.date.should.equal date
            pickEv.source.should.equal 'test'

            pickedListener.should.have.been.calledOn input
            pickedEv.date.should.equal date
            pickedEv.source.should.equal 'test'


describe 'DatePicker (options)', ->

    jsdom()

    form = null
    input = null
    datePicker = null

    before ->
        # Build a form with an input field
        form = $.create('form')
        input = $.create(
            'input',
            {
                'value': '1 Jan 2000',
                'data-mh-date-picker': true
            }
        )
        document.body.appendChild(form)
        form.appendChild(input)

    afterEach ->
        document.body.removeChild(datePicker._dom.picker)

    describe 'closeOnPick', ->

        describe 'when false', ->

            before ->
                datePicker = new DatePicker(input, {closeOnPick: false})

            it 'should keep the date picker open once a date has been
                picked', ->

                datePicker.open()
                datePicker.pick(new Date(2000, 0, 2))
                datePicker.isOpen.should.be.true

        describe 'when true', ->

            before ->
                datePicker = new DatePicker(input, {closeOnPick: true})

            it 'should close the date picker once a date has been picked', ->

                datePicker.open()
                datePicker.pick(new Date(2000, 0, 2))
                datePicker.isOpen.should.be.false

    describe 'format', ->

        describe 'when iso', ->

            before ->
                datePicker = new DatePicker(input, {format: 'iso'})

            it 'should set the input value as an ISO 8601 format date when a
                date is picked', ->

                datePicker.pick(new Date(2000, 0, 2))
                input.value.should.equal '2000-01-02'

    describe 'parsers', ->

        describe 'when ["mdy"]', ->

            before ->
                datePicker = new DatePicker(input, {
                    format: 'mdy',
                    parsers: ['mdy']
                    })

            it 'should only parse dates in m/d/y format when the input value is
                changed', ->

                # Date should not be parsed and therefore the selected date and
                # input value should not have changed.
                input.value = '2000-01-02'
                $.dispatch(input, 'changed')

                input.value.should.equal '2000-01-02'

                # Date should be parsed and therefore the selected date and
                # input should have changed.
                input.value = '02/01/2000'
                $.dispatch(input, 'changed')

                input.value.should.equal '02/01/2000'


describe 'DatePicker (behaviours)', ->

    jsdom()

    form = null
    hidden = null
    input = null
    datePicker = null

    before ->
        # Build a form with an input field
        form = $.create('form')
        hidden = $.create('input', {'class': 'foo-hidden'})
        input = $.create(
            'input',
            {
                'value': '1 Jan 2000',
                'data-mh-date-picker': true,
                'data-mh-date-picker--hidden': '.foo-hidden',
                'data-mh-date-picker--hidden-format': 'iso'
            }
        )
        document.body.appendChild(form)
        form.appendChild(hidden)
        form.appendChild(input)
        datePicker = new DatePicker(input)

    describe 'input', ->

        date = new Date(2000, 0, 1)

        describe 'set-hidden', ->

            before ->
                hidden.value = ''

            it 'should set the value of an associated hidden input', ->

                behaviour = DatePicker.behaviours.input['set-hidden']
                behaviour(datePicker, date)
                hidden.value.should.equal '2000-01-01'

        describe 'set-value', ->

            before ->
                input.value = ''

            it 'should set the value of the input field', ->

                behaviour = DatePicker.behaviours.input['set-value']
                behaviour(datePicker, date)
                input.value.should.equal '1 January 2000'
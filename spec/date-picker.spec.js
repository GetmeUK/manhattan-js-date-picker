import * as chai from 'chai'
import * as sinon from 'sinon'

import * as setup from './setup.js'
import * as $ from 'manhattan-essentials'
import {Calendar} from '../module/calendar.js'
import {DateParser} from '../module/date-parser.js'
import {DatePicker} from '../module/date-picker.js'

chai.should()
chai.use(require('sinon-chai'))


describe('DatePicker', () => {

    let inputElm = null
    let otherInputElm = null

    beforeEach(() => {
        inputElm = $.create(
            'input',
            {
                'type': 'text',
                'value': '5th March 2017'
            }
        )
        document.body.appendChild(inputElm)

        otherInputElm = $.create(
            'input',
            {
                'name': 'other_input',
                'type': 'text',
                'value': '1st March 2017'
            }
        )
        document.body.appendChild(otherInputElm)
    })

    afterEach(() => {
        document.body.removeChild(inputElm)
        document.body.removeChild(otherInputElm)
    })

    describe('constructor', () => {
        it('should generate a new `DatePicker` instance', () => {
            const datePicker = new DatePicker(inputElm)
            datePicker.should.be.an.instanceof(DatePicker)
        })
    })

    describe('option parsing', () => {

        describe('dates', () => {
            it('should accept a comma separated list of date strings and '
                + 'convert them to a list of dates', () => {

                const datePicker = new DatePicker(
                    inputElm,
                    {'dates': '12th June 2010,2015-03-15'}
                )
                const {dates} = datePicker._options

                dates.length.should.equal(2)
                dates[0].getTime()
                    .should
                    .equal((new Date(2010, 5, 12)).getTime())
                dates[1].getTime()
                    .should
                    .equal((new Date(2015, 2, 15)).getTime())
            })
        })

        describe('linkedTo', () => {
            it('should accept a selector string and convert it to an '
                + 'element', () => {

                const datePicker = new DatePicker(
                    inputElm,
                    {'linkedTo': 'input[name="other_input"]'}
                )
                const {linkedTo} = datePicker._options
                linkedTo.should.equal(otherInputElm)
            })
        })

        describe('maxDate', () => {
            it('should accept a date string and convert it to a date', () => {
                const datePicker = new DatePicker(
                    inputElm,
                    {'maxDate': '12th June 2010'}
                )
                const {maxDate} = datePicker._options
                maxDate.getTime()
                    .should
                    .equal((new Date(2010, 5, 12)).getTime())
            })
        })

        describe('minDate', () => {
            it('should accept a date string and convert it to a date', () => {
                const datePicker = new DatePicker(
                    inputElm,
                    {'minDate': '12th June 2010'}
                )
                const {minDate} = datePicker._options
                minDate.getTime()
                    .should
                    .equal((new Date(2010, 5, 12)).getTime())
            })
        })

        describe('monthNames', () => {
            it('should accept a comma separated string and convert it to a '
                + 'list of month names', () => {
                const monthNamesStr = 'J,F,M,A,M,J,J,A,S,O,N,D'
                const datePicker = new DatePicker(
                    inputElm,
                    {'monthNames': monthNamesStr}
                )
                const {monthNames} = datePicker._options
                monthNames.should.deep.equal(monthNamesStr.split(','))
            })
        })

        describe('shortMonthNames', () => {
            it('should accept a comma separated string and convert it to a '
                + 'list of month names', () => {
                const monthNamesStr = 'J,F,M,A,M,J,J,A,S,O,N,D'
                const datePicker = new DatePicker(
                    inputElm,
                    {'shortMonthNames': monthNamesStr}
                )
                const {shortMonthNames} = datePicker._options
                shortMonthNames.should.deep.equal(monthNamesStr.split(','))
            })
        })

        describe('parsers', () => {
            it('should accept a comma separated string and convert it to a '
                + 'list of parser names', () => {
                const parsersStr = 'mdy,iso,human'
                const datePicker = new DatePicker(
                    inputElm,
                    {'parsers': parsersStr}
                )
                const {parsers} = datePicker._options
                parsers.should.deep.equal(parsersStr.split(','))
            })
        })

        describe('weekdayNames', () => {
            it('should accept a comma separated string and convert it to a '
                + 'list of weekday names', () => {
                const weekdayNamesStr = 'M,T,W,T,F,S,S'
                const datePicker = new DatePicker(
                    inputElm,
                    {'weekdayNames': weekdayNamesStr}
                )
                const {weekdayNames} = datePicker._options
                weekdayNames.should.deep.equal(weekdayNamesStr.split(','))
            })
        })
    })

    describe('getters & setters', () => {
        let datePicker = null

        beforeEach(() => {
            datePicker = new DatePicker(inputElm)
            datePicker.init()
        })

        afterEach(() => {
            datePicker.destroy()
        })

        describe('calendar', () => {
            it('should return the calendar instance for the date '
                + 'picker', () => {
                datePicker.calendar.should.be.an.instanceof(Calendar)
            })
        })

        describe('dateParser', () => {
            it('should return the date parser instance for the date '
                + 'picker', () => {
                datePicker.dateParser.should.be.an.instanceof(DateParser)
            })
        })

        describe('input', () => {
            it('should return the input element for the date picker', () => {
                datePicker.input.should.equal(inputElm)
            })
        })

        describe('isOpen', () => {
            it('should return false if the date picker is closed', () => {
                datePicker.close()
                datePicker.isOpen.should.be.false
            })

            it('should return true if the date picker is open', () => {
                datePicker.open()
                datePicker.isOpen.should.be.true
            })
        })

        describe('picker', () => {
            it('should return the picker element for the date picker', () => {
                datePicker.picker
                    .classList
                    .contains(DatePicker.css['picker'])
                    .should
                    .be
                    .true
            })
        })
    })

    describe('public methods', () => {
        let datePicker = null

        beforeEach(() => {
            datePicker = new DatePicker(inputElm)
            datePicker.init()
        })

        afterEach(() => {
            datePicker.destroy()
        })

        describe('close', () => {

            beforeEach(() => {
                datePicker.open()
            })

            it('should remove the open class from the date picker', () => {
                datePicker.close()
                const openClass = DatePicker.css['open']
                datePicker.picker.classList.contains(openClass).should.be.false
            })

            it('should set the isOpen flag to false', () => {
                datePicker.close()
                datePicker.isOpen.should.be.false
            })

            it('should dispatch a closed event against the input '
                + 'element', () => {

                const onClose = sinon.spy()
                $.listen(inputElm, {'closed': onClose})
                datePicker.close()
                onClose.should.have.been.called
            })

            it('should not dispatch a closed event if the date picker '
                + 'is already closed', () => {

                const onClose = sinon.spy()
                $.listen(inputElm, {'closed': onClose})
                datePicker.close()
                datePicker.close()
                onClose.should.have.been.calledOnce
            })
        })

        describe('destroy', () => {

            beforeEach(() => {
                datePicker.destroy()

                sinon.spy(datePicker._handlers, 'close')
                sinon.spy(datePicker._handlers, 'input')
                sinon.spy(datePicker._handlers, 'open')

                datePicker.init()
            })

            it('should destroy the date picker', () => {
                datePicker.destroy()

                // Resizing the window should no longer trigger the close
                // event.
                $.dispatch(window, 'fullscreenchange')
                $.dispatch(window, 'orientationchange')
                $.dispatch(window, 'resize')
                datePicker._handlers.close.should.not.have.been.called

                // If the input is blurred it should no longer trigger the
                // close event handler.
                $.dispatch(inputElm, 'blur')
                datePicker._handlers.close.should.not.have.been.called

                // If the input's value is changed is should no longer
                // trigger the input event handler.
                $.dispatch(inputElm, 'change')
                datePicker._handlers.input.should.not.have.been.called

                // If the input is clicked or given focus it should not longer
                // trigger the open event handler.
                $.dispatch(inputElm, 'click')
                $.dispatch(inputElm, 'focus')
                datePicker._handlers.open.should.not.have.been.called

                // The calendar should have been destroyed
                chai.expect(datePicker.calendar).to.be.null

                // The picker element should have been removed from the DOM
                $.many(`.${DatePicker.css['picker']}`).length.should.equal(0)
                chai.expect(datePicker.picker).to.be.null

                // The reference to the date picker should have been removed
                // from the input.
                chai.expect(inputElm._mhDatePicker).to.be.undefined
            })

            it('should allow the date picker to be destroyed even if it has '
                + 'not been initialized', () => {
                datePicker.destroy()
                datePicker.destroy()
            })
        })

        describe('init', () => {

            beforeEach(() => {
                datePicker.destroy()

                sinon.spy(datePicker._handlers, 'close')
                sinon.spy(datePicker._handlers, 'input')
                sinon.spy(datePicker._handlers, 'open')
                sinon.spy(datePicker._handlers, 'picked')
            })

            it('should add a reference for the date picker to the '
                + 'input', () => {
                datePicker.init()
                inputElm._mhDatePicker.should.equal(datePicker)
            })

            it('should add a picker element that will be the parent for the '
                + 'calendar component', () => {

                datePicker.init()
                datePicker.picker
                    .classList
                    .contains(DatePicker.css['picker'])
                    .should
                    .be
                    .true
            })

            it('should initialize a calendar with date set', () => {
                datePicker.init()
                datePicker.calendar.should.be.an.instanceof(Calendar)

                const date = new Date(2017, 2, 5)
                datePicker.calendar.date.getTime().should.equal(date.getTime())
            })

            it('should initialize a calendar with no date set', () => {
                inputElm.value = ''
                datePicker.init()
                datePicker.calendar.should.be.an.instanceof(Calendar)

                const today = new Date()
                today.setHours(0, 0, 0, 0)
                datePicker.calendar.date.getTime().should.equal(today.getTime())
            })

            it('should set up event handlers for the date picker', () => {
                datePicker.init()

                // Resizing the window should call the close event handler
                $.dispatch(window, 'fullscreenchange')
                $.dispatch(window, 'orientationchange')
                $.dispatch(window, 'resize')
                datePicker._handlers.close.callCount.should.equal(3)

                // If the input is blurred it should trigger the close event
                // handler.
                $.dispatch(inputElm, 'blur')
                datePicker._handlers.close.callCount.should.equal(4)

                // If the input's value is changed is should trigger the
                // input event handler.
                $.dispatch(inputElm, 'change')
                datePicker._handlers.input.should.have.been.called

                // If the input is clicked or given focus it should trigger
                // the open event handler.
                $.dispatch(inputElm, 'click')
                $.dispatch(inputElm, 'focus')
                datePicker._handlers.open.should.have.been.calledTwice

                // If the calendar is picked from it should trigger the picked
                // event handler.
                $.dispatch(
                    datePicker.calendar.calendar,
                    'picked',
                    {'date': new Date()}
                )
                datePicker._handlers.picked.should.have.been.called

            })

        })

        describe('dateTest', () => {

            it('should return false if the date is less than the '
                + 'minimum date', () => {

                datePicker = new DatePicker(
                    inputElm,
                    {'minDate': '15 Jun 2010'}
                )
                datePicker.init()
                const dateTest = datePicker.calendar._dateTest
                dateTest(new Date(2010, 5, 10)).should.be.false
                dateTest(new Date(2010, 5, 20)).should.be.true
            })

            it('should return false if the date is greater than the '
                + 'maxium date', () => {

                datePicker = new DatePicker(
                    inputElm,
                    {'maxDate': '15 Jun 2010'}
                )
                datePicker.init()
                const dateTest = datePicker.calendar._dateTest
                dateTest(new Date(2010, 5, 10)).should.be.true
                dateTest(new Date(2010, 5, 20)).should.be.false
            })

        })

        describe('open', () => {

            beforeEach(() => {
                sinon.spy(datePicker, '_track')
            })

            afterEach(() => {
                datePicker._track.restore()
            })

            it('should set the selected date in calendar to that in the '
                + 'input', () => {
                datePicker.open()
                const {date} = datePicker.calendar
                date.getTime().should.equal((new Date(2017, 2, 5)).getTime())
                datePicker.calendar.month.should.equal(2)
                datePicker.calendar.year.should.equal(2017)
            })

            it('should set a default open date for the calendar if the '
                + 'input\'s value is not a valid date', () => {
                datePicker.calendar.goto(1, 2010)
                datePicker.calendar.date = new Date(2010, 1, 5)
                inputElm.value = 'querty'
                datePicker.open()

                const {date} = datePicker.calendar
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                date.getTime().should.equal(today.getTime())
                datePicker.calendar.month.should.equal(today.getMonth())
                datePicker.calendar.year.should.equal(today.getFullYear())
            })

            it('should call _track to make sure the picker is inline with '
                + 'the input', () => {
                datePicker.open()
                datePicker._track.should.have.been.called
            })

            it('should add the open class from the date picker', () => {
                datePicker.open()
                const openClass = DatePicker.css['open']
                datePicker.picker.classList.contains(openClass).should.be.true
            })

            it('should set the isOpen flag to true', () => {
                datePicker.open()
                datePicker.isOpen.should.be.true
            })

            it('should dispatch a opened event against the input '
                + 'element', () => {

                const onOpen = sinon.spy()
                $.listen(inputElm, {'opened': onOpen})
                datePicker.open()
                onOpen.should.have.been.called
            })

            it('should not dispatch a opened event if the date picker '
                + 'is already open', () => {

                const onOpen = sinon.spy()
                $.listen(inputElm, {'opened': onOpen})
                datePicker.open()
                datePicker.open()
                onOpen.should.have.been.calledOnce
            })
        })

        describe('pick', () => {
            let date = null

            beforeEach(() => {
                date = new Date(2010, 1, 5)
            })

            it('should select the given date in the calendar', () => {
                datePicker.pick(date)
                const calDate = datePicker.calendar.date
                calDate.getTime().should.equal(date.getTime())
            })

            it('should dispatched the picked event against the input', () => {
                const onPicked = sinon.spy()
                $.listen(inputElm, {'picked': onPicked})
                datePicker.pick(date)
                onPicked.should.have.been.called
            })

            it('should close the picker if the stayOpenOnPick flag is '
                + 'false', () => {
                datePicker.open()
                datePicker.pick(date)
                datePicker.isOpen.should.be.false
            })

            it('should not close the picker if the stayOpenOnPick flag is '
                + 'true', () => {

                datePicker.destroy()
                datePicker = new DatePicker(
                    inputElm,
                    {'stayOpenOnPick': true}
                )
                datePicker.init()
                datePicker.open()
                datePicker.pick(date)
                datePicker.isOpen.should.be.true

            })
        })
    })

    describe('private methods', () => {
        let datePicker = null

        beforeEach(() => {
            datePicker = new DatePicker(inputElm)
            datePicker.init()

            inputElm.getBoundingClientRect = () => {
                return {
                    'bottom': 40,
                    'height': 20,
                    'left': 30,
                    'right': 130,
                    'top': 20,
                    'width': 100
                }
            }

            window.pageXOffset = 10
            window.pageYOffset = 10
        })

        afterEach(() => {
            datePicker.destroy()
        })

        describe('track', () => {

            it('should position the picker inline with the input', () => {
                datePicker._track()
                datePicker.picker.style.top.should.equal('50px')
                datePicker.picker.style.left.should.equal('40px')
            })

        })
    })

    describe('behaviours > dateTest', () => {
        const behaviours = DatePicker.behaviours.dateTest
        let datePicker = null

        beforeEach(() => {
            datePicker = new DatePicker(
                inputElm,
                {'dates': '10th June 2010, 12th June 2010'}
            )
            datePicker.init()
        })

        afterEach(() => {
            datePicker.destroy()
        })

        describe('any', () => {

            it('should return true for any date', () => {
                behaviours.any(datePicker, new Date(2010, 1, 2))
                    .should
                    .be
                    .true
            })

        })

        describe('excluding', () => {

            it('should return false for any date in the dates option', () => {
                behaviours.excluding(datePicker, new Date(2010, 5, 10))
                    .should
                    .be
                    .false
                behaviours.excluding(datePicker, new Date(2010, 5, 11))
                    .should
                    .be
                    .true
                behaviours.excluding(datePicker, new Date(2010, 5, 12))
                    .should
                    .be
                    .false
            })

        })

        describe('only', () => {

            it('should return false for any date not in the dates '
                + 'option', () => {
                behaviours.only(datePicker, new Date(2010, 5, 10))
                    .should
                    .be
                    .true
                behaviours.only(datePicker, new Date(2010, 5, 11))
                    .should
                    .be
                    .false
                behaviours.only(datePicker, new Date(2010, 5, 12))
                    .should
                    .be
                    .true
            })

        })
    })

    describe('behaviours > input', () => {
        const behaviours = DatePicker.behaviours.input
        let datePicker = null

        beforeEach(() => {
            datePicker = new DatePicker(inputElm)
            datePicker.init()
        })

        afterEach(() => {
            datePicker.destroy()
        })

        describe('setValue', () => {
            it('should set the value of the input element to the formatted '
                + 'date', () => {

                behaviours.setValue(datePicker, new Date(2010, 1, 2))
                inputElm.value.should.equal('2 February 2010')

            })

            it('should dispatch a change event against the input if the '
                + 'value has changed', () => {

                const onChange = sinon.spy()
                $.listen(inputElm, {'change': onChange})
                behaviours.setValue(datePicker, new Date(2010, 1, 2))
                onChange.should.have.been.called

            })

            it('should not dispatch a change event against the input if the '
                + 'value has not changed', () => {

                inputElm.value = '2 February 2010'

                const onChange = sinon.spy()
                $.listen(inputElm, {'change': onChange})
                behaviours.setValue(datePicker, new Date(2010, 1, 2))
                onChange.should.not.have.been.called
            })
        })
    })

    describe('behaviours > openDate', () => {
        const behaviours = DatePicker.behaviours.openDate
        let datePicker = null
        let otherDatePicker = null

        beforeEach(() => {
            datePicker = new DatePicker(
                inputElm,
                {
                    'linkedTo': 'input[name="other_input"]',
                    'openOffset': 1
                }
            )
            datePicker.init()
            otherDatePicker = new DatePicker(otherInputElm)
            otherDatePicker.init()
        })

        afterEach(() => {
            datePicker.destroy()
            otherDatePicker.destroy()
        })

        describe('offset', () => {

            it('should return the day after the linked input\'s date', () => {
                const date = behaviours.offset(datePicker)
                const tomorrow = new Date(2017, 2, 1)
                tomorrow.setDate(tomorrow.getDate() + 1)
                date.getTime().should.equal(tomorrow.getTime())
            })

        })

        describe('today', () => {

            it('should return todays date', () => {
                const date = behaviours.today(datePicker)
                console.log(datePicker.calendar.date)
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                date.getTime().should.equal(today.getTime())
            })

        })

    })

    describe('events', () => {
        let datePicker = null

        beforeEach(() => {
            datePicker = new DatePicker(inputElm)
            datePicker.init()
        })

        afterEach(() => {
            datePicker.destroy()
        })

        describe('close', () => {

            it('should close the calendar', () => {
                datePicker.open()
                $.dispatch(window, 'resize')
                datePicker.isOpen.should.be.false
            })

        })

        describe('input', () => {

            it('should pick the date using the input\'s value', () => {
                const date = new Date(2017, 2, 5)
                $.dispatch(inputElm, 'change')
                const calDate = datePicker.calendar.date
                calDate.getTime().should.equal(date.getTime())
            })

            it('should not pick a date if the input\'s value is not a valid '
                + 'date', () => {
                const date = new Date(2010, 1, 5)
                datePicker.calendar.date = date
                inputElm.value = 'querty'

                $.dispatch(inputElm, 'change')
                const calDate = datePicker.calendar.date
                calDate.getTime().should.equal(date.getTime())
            })
        })

        describe('open', () => {

            it('should open the calendar', () => {
                datePicker.close()
                $.dispatch(inputElm, 'focus')
                datePicker.isOpen.should.be.true
            })

            it('should not open the calendar if the noPopup option is '
                + 'true', () => {
                datePicker.destroy()
                datePicker = new DatePicker(inputElm, {'noPopup': true})
                datePicker.init()

                datePicker.close()
                $.dispatch(inputElm, 'focus')
                datePicker.isOpen.should.be.false
            })
        })

        describe('pick', () => {

            it('should call pick against the date picker', () => {
                const onPicked = sinon.spy()
                $.listen(inputElm, {'picked': onPicked})
                $.dispatch(
                    datePicker.calendar.calendar,
                    'picked',
                    {'date': new Date(2010, 1, 5)}
                )
                onPicked.should.have.been.called
            })

        })
    })

})

import * as chai from 'chai'
import * as sinon from 'sinon'

import * as setup from './setup.js'
import * as $ from 'manhattan-essentials'
import {Calendar} from '../module/calendar.js'

chai.should()
chai.use(require('sinon-chai'))


describe.only('Calendar', () => {

    let pickerElm = null

    beforeEach(() => {
        pickerElm = $.create('picker')
        document.body.appendChild(pickerElm)
    })

    afterEach(() => {
        document.body.removeChild(pickerElm)
    })

    describe('constructor', () => {
        it('should generate a new `Calendar` instance', () => {
            const calendar = new Calendar(pickerElm)
            calendar.should.be.an.instanceof(Calendar)
        })
    })

    describe('getters & setters', () => {
        let calendar = null

        beforeEach(() => {
            calendar = new Calendar(pickerElm)
            calendar.init()
        })

        afterEach(() => {
            calendar.destroy()
        })

        describe('calendar', () => {
            it('should return the calendar UI component element', () => {
                calendar.calendar
                    .classList
                    .contains(Calendar.css['calendar'])
                    .should
                    .be
                    .true
            })
        })

        describe('date', () => {

            it('should return the currently selected date within the '
                + ' calendar', () => {

                const today = new Date()
                today.setHours(0, 0, 0, 0)
                calendar.date.getTime().should.equal(today.getTime())
            })

            it('should set the selected date within the calendar', () => {
                const date = new Date(2010, 2, 19)
                calendar.date = date
                calendar.date.getTime().should.equal(date.getTime())
            })

        })

        describe('month', () => {

            it('should return the month the calendar is displaying', () => {
                calendar.goto(2, 2010)
                calendar.month.should.equal(2)
            })

            it('should set the month the calendar is displaying', () => {
                const year = calendar.year
                calendar.month = 2
                calendar.month.should.equal(2)
                calendar.year.should.equal(year)
            })

        })

        describe('calendar', () => {
            it('should return the parent element for the calendar', () => {
                calendar.parent.should.equal(pickerElm)
            })
        })

        describe('year', () => {

            it('should return the year the calendar is displaying', () => {
                calendar.goto(2, 2010)
                calendar.year.should.equal(2010)
            })

            it('should set the year the calendar is displaying', () => {
                const month = calendar.month
                calendar.year = 2010
                calendar.month.should.equal(month)
                calendar.year.should.equal(2010)
            })

        })

    })

    describe('public methods', () => {
        let calendar = null

        beforeEach(() => {
            calendar = new Calendar(pickerElm)
            calendar.init()
        })

        afterEach(() => {
            calendar.destroy()
        })

        describe('destroy', () => {

            afterEach(() => {
                calendar.init()
            })

            it('should destroy the Calendar', () => {
                calendar.destroy()
                chai.expect(calendar.calendar).to.be.null
                chai.expect(pickerElm._mhCalendar).to.be.undefined
            })
        })

        describe('goto', () => {

            beforeEach(() => {
                sinon.spy(calendar, '_update')
            })

            afterEach(() => {
                calendar._update.restore()
            })

            it('should set the month/year displayed in the calendar', () => {
                calendar.goto(2, 2010)
                calendar.month.should.equal(2)
                calendar.year.should.equal(2010)
                calendar._update.should.have.been.calledOnce

                // Make sure that setting the calendar to the current month
                // and year doesn't trigger an update.
                calendar.goto(2, 2010)
                calendar.month.should.equal(2)
                calendar.year.should.equal(2010)
                calendar._update.should.have.been.calledOnce
            })
        })

        describe('init', () => {

            beforeEach(() => {
                calendar.destroy()

                sinon.spy(calendar._handlers, 'keepFocus')
                sinon.spy(calendar._handlers, 'next')
                sinon.spy(calendar._handlers, 'pick')
                sinon.spy(calendar._handlers, 'previous')
            })

            afterEach(() => {
                calendar._handlers.keepFocus.restore()
                calendar._handlers.next.restore()
                calendar._handlers.pick.restore()
                calendar._handlers.previous.restore()
            })

            it('should add a reference for the calendar to the parent', () => {
                calendar.init()
                pickerElm._mhCalendar.should.equal(calendar)
            })

            it('should create a calendar UI component', () => {
                const css = Calendar.css

                calendar.init()

                $.many(`.${css['calendar']}`, pickerElm).length
                    .should
                    .equal(1)

                $.many(`.${css['monthYear']}`, pickerElm).length
                    .should
                    .equal(1)

                $.many(`.${css['weekday']}`, pickerElm).length
                    .should
                    .equal(7)

                $.many(`.${css['date']}`, pickerElm).length
                    .should
                    .equal(42)

            })

            it('should set up event handlers for the calendar', () => {
                calendar.init()

                // Keep focus
                $.dispatch(calendar.calendar, 'mousedown')
                calendar._handlers.keepFocus.should.have.been.called

                // Next
                $.dispatch(calendar._dom.next, 'click')
                calendar._handlers.next.should.have.been.called

                // Pick
                $.dispatch(calendar._dom.dates, 'click')
                calendar._handlers.pick.should.have.been.called

                // Previous
                $.dispatch(calendar._dom.previous, 'click')
                calendar._handlers.previous.should.have.been.called
            })
        })

        describe('next', () => {

            it('should change the calendar view to the next month', () => {
                calendar.goto(6, 2010)
                calendar.next()
                calendar.month.should.equal(7)
                calendar.year.should.equal(2010)
            })

        })

        describe('offset', () => {

            it('should move the calendar view by the given offset months and '
                + 'years', () => {

                // @@

            })

        })

        describe('previous', () => {

            it('should change the calendar view to the next month', () => {
                calendar.goto(6, 2010)
                calendar.previous()
                calendar.month.should.equal(5)
                calendar.year.should.equal(2010)
            })

        })
    })

    // @@ Public methods
    // - offset

    // @@ Private methods
    // - _update

})
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

                const date = new Date(2018, 3, 19)
                calendar.date = date

                calendar.date.getTime().should.equal(date.getTime())

                // View the month in question and check the relevant date
                // element is flagged as selected.
                // @@
            })
        })

        // describe('month', () => {

        // })
    })

    // @@ Getters & Setters
    // - month (get/set)
    // - parent
    // - year (get/set)

    // @@ Public methods
    // - destroy
    // - goto
    // - init
    // - next
    // - offset
    // - previous

    // @@ Private methods
    // - _update

})
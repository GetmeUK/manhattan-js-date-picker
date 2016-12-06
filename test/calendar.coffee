# Imports

chai = require 'chai'
jsdom = require 'mocha-jsdom'
sinon = require 'sinon'
sinonChai = require 'sinon-chai'

$ = require 'manhattan-essentials'
Calendar = require('../src/scripts/calendar').Calendar


# Set up

should = chai.should()
chai.use(sinonChai)


# Tests

describe 'Calendar (class)', ->

    jsdom()

    calendar = null

    beforeEach ->
        # Initialize a calendar
        calendar = new Calendar(document.body)
        calendar.goto(0, 2000)

    afterEach ->
        calendar.destroy()

    describe 'constructor', ->

        it 'should generate a new `Calendar` instance', ->

            calendar.should.be.an.instanceof Calendar

        it 'should add the calendar element to the body', ->

            $.one('.mh-calendar', document.body).should.exist

    describe 'destroy', ->

        it 'should remove the calendar element from the body', ->

            calendar.destroy()
            should.not.exist($.one('.mh-calendar', document.body))

    describe 'goto', ->

        it 'should set the month and year for the calendar to those given', ->
            calendar.goto(5, 1979)
            calendar.month.should.equal 5
            calendar.year.should.equal 1979

        it 'should dispatch a view event against the calendar DOM element', ->

            listener = sinon.spy()
            calendar.calendar.addEventListener('mh-calendar--view', listener)
            calendar.goto(5, 1979)
            listener.should.have.been.calledOn calendar.calendar

            ev = listener.args[0][0]
            ev.calendar.should.equal calendar
            ev.month.should.equal 5
            ev.year.should.equal 1979

    describe 'next', ->

        it 'should advance the month and year the calendar displays by one
            month', ->
            calendar.next()
            calendar.month.should.equal 1
            calendar.year.should.equal 2000

    describe 'offset', ->

        it 'should move the month and year the calendar displays by the given
            number of months and years', ->
            calendar.offset(-7, -20)
            calendar.month.should.equal 5
            calendar.year.should.equal 1979

    describe 'previous', ->

        it 'should move the month and year the calendar displays back by one
            month', ->
            calendar.previous()
            calendar.month.should.equal 11
            calendar.year.should.equal 1999

    describe 'select', ->

        it 'should select the given date', ->
            date = new Date(1979, 5, 11)
            calendar.select(date)
            calendar.dateRange[0].getTime().should.equal date.getTime()
            calendar.dateRange[1].getTime().should.equal date.getTime()

        it 'should select the given date range', ->
            dateRange = [new Date(1979, 5, 11), new Date(1978, 6, 25)]
            calendar.select(dateRange[0], dateRange[1])
            calendar.dateRange[0].getTime().should.equal dateRange[0].getTime()
            calendar.dateRange[1].getTime().should.equal dateRange[1].getTime()

    describe 'sync', ->

        otherCalendar = null

        before ->
            otherCalendar = new Calendar(document.body)
            otherCalendar.goto(11, 2001)

        after ->
            otherCalendar.destroy()

        it "it should sync the calendar view with another calendar's view at the
            given offset", ->

            calendar.sync(otherCalendar, 1)
            calendar.month.should.equal 0
            calendar.year.should.equal 2002

    describe 'update', ->

        before ->
            calendar.test = 'excluding'
            calendar.dates = [
                new Date(2000, 1, 1),
                new Date(2000, 1, 2),
                new Date(2000, 1, 3)
                ]

        after ->
            calendar.test = 'any'
            calendar.dates = []

        it 'should update the view to display the given month and year', ->
            calendar.goto(5, 1979)

            dom = calendar._dom
            dom.month.textContent.should.equal 'June, 1979'

            # Check the first and last day of the month are displayed in the
            # correct slots.
            dom.dates.childNodes[4].textContent == '1'
            dom.dates.childNodes[(4 * 7) + 5].textContent == '1'

        it 'should flag dates in the current date range', ->
            startDate = new Date(2000, 0, 2)
            endDate = new Date(2000, 0, 11)
            calendar.goto(0, 2000)
            calendar.select(startDate, endDate)

            startTime = startDate.getTime()
            endTime = endDate.getTime()
            for dateElm in calendar._dom.dates.childNodes
                thisTime = dateElm.__mh_date.getTime()

                if thisTime is startTime
                    dateElm.classList.contains(
                        'mh-calendar__date--range-start').should.be.true

                if thisTime is endTime
                    dateElm.classList.contains(
                        'mh-calendar__date--range-end').should.be.true

                if thisTime > startTime and thisTime < endTime
                    dateElm.classList.contains(
                        'mh-calendar__date--in-range').should.be.true

        it 'should flag dates outside of the month as blocked', ->
            calendar.goto(0, 2000)

            for dateElm in calendar._dom.dates.childNodes
                if dateElm.__mh_date.getMonth() isnt 0
                    dateElm.classList.contains(
                        'mh-calendar__date--blocked').should.be.true

        it 'should flag the current date as today', ->
            today = new Date()
            calendar.goto(today.getMonth(), new Date().getFullYear())

            for dateElm in calendar._dom.dates.childNodes
                if dateElm.__mh_date.getTime() is today.getTime()
                    dateElm.classList.contains(
                        'mh-calendar__date--today').should.be.true

        it "should flag dates that don't pass the test behaviour as blocked", ->
            calendar.goto(0, 2000)
            excludedTimes = (d.getTime() for d in calendar.dates)

            for dateElm in calendar._dom.dates.childNodes
                if excludedTimes.indexOf(dateElm.__mh_date.getTime()) > -1
                    dateElm.classList.contains(
                        'mh-calendar__date--blocked').should.be.true

    describe '@parseDate', ->

        it 'should attempt to parse a date string using the list of named
            parsers', ->

            # Spy on the parsers we'll be calling
            human_en = sinon.spy(Calendar.parsers, 'human_en')
            dmy = sinon.spy(Calendar.parsers, 'dmy')
            iso = sinon.spy(Calendar.parsers, 'iso')

            date = Calendar.parseDate('1979-06-11', ['human_en', 'dmy', 'iso'])

            human_en.should.have.been.called
            dmy.should.have.been.called
            iso.should.have.been.called

            date.getTime().should.equal new Date(1979, 5, 11).getTime()

    describe '@proxyOptions', ->

        input = null

        before ->

            input = $.create('input', {
                'data-mh-calendar--dates': '2000-01-02,Jan 3rd 2000,4.1.00',
                'data-mh-calendar--min-date': '1990-01-01',
                'data-mh-calendar--max-date': '2nd February 2010',
                'data-mh-calendar--first-weekday': '0',
                'data-mh-calendar--month-names': \
                    'Ja,Fe,Ma,Ap,Ma,Ju,Ju,Au,Se,Oc,No,De',
                'data-mh-calendar--weekday-names': 'Su,Mo,Tu,We,Th,Fr,Sa'
                })

        it 'Return a set of config options for the calendar based on a set of
            user defined options and an input element', ->

            # Defaults (no options, no input)
            proxy = Calendar.proxyOptions(
                'data-mh-calendar--',
                {},
                null
                )
            proxy.should.deep.equal Calendar.getDefaultConfig()

            # Options (no input)
            options = {
                dates: [new Date(2000, 2, 10), new Date(2000, 2, 11)],
                minDate: new Date(2000, 1, 10),
                maxDate: new Date(2000, 3, 10),
                firstWeekday: 2,
                monthNames: 'J,F,M,A,M,J,J,A,S,O,N,D'.split(','),
                weekdayNames: 'S,M,T,W,T,F,S'.split(','),
                parsers: ['human_en', 'dmy', 'iso']
                }
            proxy = Calendar.proxyOptions(
                'data-mh-calendar--',
                options,
                null
                )
            proxy.should.deep.equal {
                dates: [new Date(2000, 2, 10), new Date(2000, 2, 11)],
                minDate: new Date(2000, 1, 10),
                maxDate: new Date(2000, 3, 10),
                firstWeekday: 2,
                monthNames: 'J,F,M,A,M,J,J,A,S,O,N,D'.split(','),
                weekdayNames: 'S,M,T,W,T,F,S'.split(',')
                }

            # Options and input
            proxy = Calendar.proxyOptions(
                'data-mh-calendar--',
                options,
                input
                )
            proxy.should.deep.equal {
                dates: [
                    new Date(2000, 0, 2),
                    new Date(2000, 0, 3),
                    new Date(2000, 0, 4)
                ],
                minDate: new Date(1990, 0, 1),
                maxDate: new Date(2010, 1, 2),
                firstWeekday: 0,
                monthNames: 'Ja,Fe,Ma,Ap,Ma,Ju,Ju,Au,Se,Oc,No,De'.split(','),
                weekdayNames: 'Su,Mo,Tu,We,Th,Fr,Sa'.split(',')
            }


describe 'Calendar (options)', ->

    jsdom()

    describe 'dates', ->

        # `dates` isn't tested as an option as it is covered under tests for the
        # `test` behaviour.

    describe 'minDate', ->

        it 'should set all dates before the minimum date as blocked', ->

            minDate = new Date(10, 0, 2000)
            calendar = new Calendar(document.body, {minDate: minDate})
            calendar.goto(0, 2000)

            for dateElm in calendar._dom.dates.childNodes
                if dateElm.__mh_date.getTime() < minDate.getTime()
                    dateElm.classList.contains(
                        'mh-calendar__date--blocked').should.be.true

    describe 'maxDate', ->

        it 'should set all dates after the maximum date as blocked', ->

            maxDate = new Date(20, 0, 2000)
            calendar = new Calendar(document.body, {maxDate: maxDate})
            calendar.goto(0, 2000)

            for dateElm in calendar._dom.dates.childNodes
                if dateElm.__mh_date.getTime() > maxDate.getTime()
                    dateElm.classList.contains(
                        'mh-calendar__date--blocked').should.be.true

    describe 'firstWeekday', ->

        it 'should set first weekday displayed in the calendar view', ->

            maxDate = new Date(20, 0, 2000)
            calendar = new Calendar(document.body, {firstWeekday: 0})
            calendar.goto(0, 2000)

            # Check the order of the weekdays
            weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            for weekdayElm, i in calendar._dom.weekdays
                weekdayElm.textContent.should.equal weekdays[i]

            # Check that every 7th date is a Sunday
            for weekdayElm, i in calendar._dom.weekdays
                if i % 7 is 0
                    weekdayElm.__mh_date.getDay().should.equal 0

    describe 'monthNames', ->

        it 'should set the month names displayed in the calendar view', ->

            monthNames = 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec'
            monthNames = monthNames.split(',')
            calendar = new Calendar(document.body, {monthNames: monthNames})

            monthElm = calendar._dom.month
            for name, i in monthNames
                calendar.goto(i, 2000)
                monthElm.textContent.should.equal "#{name}, 2000"

    describe 'weekdayNames', ->

        it 'should set the weekday names displayed in the calendar view', ->

            weekdayNames = 'Su,Mo,Tu,We,Th,Fr,Sa'.split(',')
            calendar = new Calendar(
                document.body,
                {
                    firstWeekday: 0,
                    weekdayNames: weekdayNames
                }
            )

            weekdaysElm = calendar._dom.weekdays
            for name, i in weekdayNames
                calendar.goto(i, 2000)
                weekdayElm = weekdaysElm.childNodes[i]
                weekdayElm.textContent.should.equal name


describe 'Calendar (behaviours)', ->

    jsdom()

    calendar = null

    beforeEach ->
        # Initialize a calendar
        calendar = new Calendar(document.body)
        calendar.goto(0, 2000)

    describe 'test', ->

        describe 'any', ->

            it 'should return true for any date', ->

                behaviour = Calendar.behaviours.test.any
                date = new Date(2000, 0, 1)
                for i in [0..365]
                    behaviour(calendar, [], date).should.be.true
                    date.setDate(date.getDate() + 1)


        describe 'excluding', ->

            it 'should return true only for dates not in the `dates` config
                option', ->

                behaviour = Calendar.behaviours.test.excluding
                date = new Date(2000, 0, 1)
                dates = [
                    new Date(2000, 1, 1),
                    new Date(2000, 2, 2),
                    new Date(2000, 3, 3)
                    ]
                times = (d.getTime() for d in dates)

                for i in [0..365]
                    if times.indexOf(date.getTime()) > -1
                        behaviour(calendar, dates, date).should.be.false
                    else
                        behaviour(calendar, dates, date).should.be.true
                    date.setDate(date.getDate() + 1)

        describe 'only', ->

            it 'should return true only for dates in the `dates` config
                option', ->

                behaviour = Calendar.behaviours.test.only
                date = new Date(2000, 0, 1)
                dates = [
                    new Date(2000, 1, 1),
                    new Date(2000, 2, 2),
                    new Date(2000, 3, 3)
                    ]
                times = (d.getTime() for d in dates)

                for i in [0..365]
                    if times.indexOf(date.getTime()) > -1
                        behaviour(calendar, dates, date).should.be.true
                    else
                        behaviour(calendar, dates, date).should.be.false
                    date.setDate(date.getDate() + 1)

        describe 'weekdays', ->

            it 'should return true only for dates in that fall on the weekdays
                in the `dates` config option', ->

                behaviour = Calendar.behaviours.test.weekdays
                date = new Date(2000, 0, 1)
                weekdays = [0, 6]

                for i in [0..365]
                    if weekdays.indexOf(date.getDay()) > -1
                        behaviour(calendar, weekdays, date).should.be.true
                    else
                        behaviour(calendar, weekdays, date).should.be.false
                    date.setDate(date.getDate() + 1)


describe 'Calendar (formats)', ->

    describe 'dmy', ->

        it 'should format a date as `dd/mm/yyyy`', ->

            Calendar.formats.dmy(new Date(2000, 0, 2)).should.equal '02/01/2000'

    describe 'human_en', ->

        it 'should format a date as `{day} {full month name} {full year}`, e.g
            `22 January 2011`', ->

            s = Calendar.formats.human_en(new Date(2000, 0, 2))
            s.should.equal '2 January 2000'

    describe 'human_abbr_en', ->

        it 'should format a date as
            `{day} {abbreviated month name} {full year}`, e.g `22 Jan 2011`', ->

            s = Calendar.formats.human_abbr_en(new Date(2000, 0, 2))
            s.should.equal '2 Jan 2000'

    describe 'dmy', ->

        it 'should format a date as ISO 8601 (e.g `yyyy-mm-dd`)', ->

            s = Calendar.formats.iso(new Date(2000, 0, 2))
            s.should.equal '2000-01-02'

    describe 'mdy', ->

        it 'should format a date as `mm/dd/yyyy`', ->

            Calendar.formats.mdy(new Date(2000, 0, 2)).should.equal '01/02/2000'


describe 'Calendar (parsers)', ->

    month = new Date().getMonth()
    time = new Date(2000, 0, 2).getTime()
    year = new Date().getFullYear()

    describe 'dmy', ->

        it 'should parse a date string using the format `d/m/y`', ->
            Calendar.parsers.dmy('2/1/00').getTime().should.equal time
            Calendar.parsers.dmy('2/1/2000').getTime().should.equal time
            Calendar.parsers.dmy('02/01/2000').getTime().should.equal time

        it 'should parse a date string using the format `d.m.y`', ->
            Calendar.parsers.dmy('2.01.00').getTime().should.equal time

        it 'should parse a date string using the format `d-m-y`', ->
            Calendar.parsers.dmy('2-1-00').getTime().should.equal time

    describe 'human_en', ->

        # A series of human readable dates formats that must be parsed

        it 'should parse `2nd`', ->
            date = Calendar.parsers.human_en('2nd')
            date.getTime().should.equal (new Date(year, month, 2)).getTime()

        it 'should parse `1 Aug`', ->
            date = Calendar.parsers.human_en('1 Aug')
            date.getTime().should.equal (new Date(year, 7, 1)).getTime()

        it 'should parse `15 Feb 17`', ->
            date = Calendar.parsers.human_en('15 Feb 17')
            date.getTime().should.equal (new Date(2017, 1, 15)).getTime()

        it 'should parse `January 22, 2011`', ->
            date = Calendar.parsers.human_en('January 22, 2011')
            date.getTime().should.equal (new Date(2011, 0, 22)).getTime()

        it 'should parse `Nov 22`', ->
            date = Calendar.parsers.human_en('Nov 22')
            date.getTime().should.equal (new Date(year, 10, 22)).getTime()

    describe 'iso', ->

        it 'should parse a date string using the format `yyyy-mm-dd`', ->
            Calendar.parsers.iso('2000-01-02').getTime().should.equal time

    describe 'mdy', ->

        it 'should parse a date string using the format `m/d/y`', ->
            Calendar.parsers.mdy('1/2/00').getTime().should.equal time
            Calendar.parsers.mdy('1/2/2000').getTime().should.equal time
            Calendar.parsers.mdy('01/02/2000').getTime().should.equal time

        it 'should parse a date string using the format `m.d.y`', ->
            Calendar.parsers.mdy('1.2.00').getTime().should.equal time

        it 'should parse a date string using the format `m-d-y`', ->
            Calendar.parsers.mdy('1-2-00').getTime().should.equal time

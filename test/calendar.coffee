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

    # goto
    # next
    # offset
    # previous
    # select
    # sync
    # update
    # @parseDate
    # @proxyOptions


describe 'Calendar (options)', ->

    # dates
    # minDate
    # maxDate
    # firstWeekday
    # monthNames
    # weekdayNames


describe 'Calendar (behaviours)', ->

    # test


describe 'Calendar (formats)', ->

    # dmy
    # human_en
    # human_abbr_en
    # iso
    # mdy


describe 'Calendar (parsers)', ->

    # dmy
    # human_en
    # iso
    # mdy
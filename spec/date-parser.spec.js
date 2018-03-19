import * as chai from 'chai'
import * as sinon from 'sinon'

import * as setup from './setup.js'
import {DateParser} from '../module/date-parser.js'

chai.should()
chai.use(require('sinon-chai'))

describe('DateParser', () => {

    describe('constructor', () => {
        it('should generate a new `DateParser` instance', () => {
            const parser = new DateParser()
            parser.should.be.an.instanceof(DateParser)
        })
    })

    describe('getters & setters', () => {
        let parser = null

        beforeEach(() => {
            parser = new DateParser()
        })

        describe('monthNames', () => {

            it('should get the list of month names', () => {
                parser.monthNames.should.deep.equal([
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December'
                ])
            })

            it('should set the list of month names including a lowercase '
                + 'version', () => {

                const altNames = 'ABCDEFGHIJKL'.split('')
                parser.monthNames = altNames
                parser.monthNames.should.deep.equal(altNames)
                parser._monthNamesLower
                    .should
                    .deep
                    .equal('abcdefghijkl'.split(''))
            })
        })

        describe('shortMonthNames', () => {

            it('should get the list of short month names', () => {
                parser.shortMonthNames.should.deep.equal([
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec'
                ])
            })

            it('should set the list of month names including a lowercase '
                + 'version', () => {

                const altNames = 'ABCDEFGHIJKL'.split('')
                parser.shortMonthNames = altNames
                parser.shortMonthNames.should.deep.equal(altNames)
                parser._shortMonthNamesLower
                    .should
                    .deep
                    .equal('abcdefghijkl'.split(''))
            })
        })
    })

    describe('public methods', () => {
        let parser = null

        beforeEach(() => {
            parser = new DateParser()
        })

        describe('format', () => {
            it('should format the given date using the named '
                + 'formatter', () => {

                const date = new Date(2018, 2, 19)
                const s = parser.format('human', date)
                s.should.equal('19 March 2018')

            })
        })

        describe('parse', () => {
            it('should attempt to parse the given string using the list of '
                + 'named parsers', () => {

                const date = parser.parse(
                    ['human', 'dmy', 'iso'],
                    '19 March 2018'
                )
                date.getFullYear().should.equal(2018)
                date.getMonth().should.equal(2)
                date.getDate().should.equal(19)

            })
        })

    })

    describe('formatters', () => {
        let date = null
        const {formatters} = DateParser
        let parser = null

        beforeEach(() => {
            date = new Date(2018, 2, 19)
            parser = new DateParser()
        })

        describe('dmy', () => {
            it('should format the date as `dd/mm/yyyy`', () => {
                formatters.dmy(parser, date).should.equal('19/03/2018')
            })
        })

        describe('human', () => {
            it('should format the date as ``{day} {month name} '
                + '{full year}`', () => {

                formatters.human(parser, date).should.equal('19 March 2018')
            })
        })

        describe('iso', () => {
            it('should format the date as `yyyy-mm-dd`', () => {
                formatters.iso(parser, date).should.equal('2018-03-19')
            })
        })

        describe('mdy', () => {
            it('should format the date as `mm/dd/yyyy`', () => {
                formatters.mdy(parser, date).should.equal('03/19/2018')
            })
        })
    })

    describe('formatters', () => {
        let date = null
        let parser = null
        const {parsers} = DateParser

        beforeEach(() => {
            date = new Date(2018, 2, 19)
            parser = new DateParser()
        })

        describe('dmy', () => {
            it('should parse a date from a string using the format '
                + '`d/m/y`', () => {

                parsers.dmy(parser, '19/03/2018')
                    .getTime()
                    .should
                    .equal(date.getTime())

                parsers.dmy(parser, '19-03-2018')
                    .getTime()
                    .should
                    .equal(date.getTime())

                parsers.dmy(parser, '19.03.2018')
                    .getTime()
                    .should
                    .equal(date.getTime())

            })
        })

        describe('human', () => {
            it('should parse a date from a string using a human readable '
                + 'format', () => {

                parsers.human(parser, '19th March 2018')
                    .getTime()
                    .should
                    .equal(date.getTime())

                parsers.human(parser, 'March 19th, 2018')
                    .getTime()
                    .should
                    .equal(date.getTime())

                parsers.human(parser, '19 Mar 18')
                    .getTime()
                    .should
                    .equal(date.getTime())

            })
        })

    })

    // @@ Parsers
    // - iso
    // - mdy

})

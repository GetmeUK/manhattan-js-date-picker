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

    // @@ Public methods
    // - format
    // - parser

    // @@ Formatters
    // - dmy
    // - human
    // - iso
    // - mdy

    // @@ Parsers
    // - dmy
    // - human
    // - iso
    // - mdy

})

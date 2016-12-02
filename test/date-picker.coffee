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


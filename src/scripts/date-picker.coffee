$ = require 'manhattan-essentials'

calendar = require './calendar.coffee'


# Classes

class DatePicker

    #


class DateRangePicker

    #


module.exports = {
    Calendar: calendar.Calendar,
    DatePicker: DatePicker,
    DateRangePicker: DateRangePicker
    }


# Planned features
#
# - Set the start weekday
# - Set a default date
# - Limit the date range that can be selected from
# - Disable dates
# - Set the length of the week day and month name
# - Set the strings used for month and weekday
# - Allow 2 calendars to be shown so that a date range can be selected

# Planned behaviours
#
# - format (format the date before it's entered set against the input)
# - input (set the value of the input when a date is selected)
# - parse (parse the date value within the input, need to think how we might
#       configure this to allow parse attempts with multiple parsers presumably
#       in a priority order).
// -- Class definition --

/**
 * A date parser.
 */
class DateParser {

}

/**
 * A set of functions that can ouput dates in various string format.
 */
DateParser.formatters = {

    /**
     * Format a date as `dd/mm/yyyy`
     */
    'dmy': (date) => {
        const dd = `00${date.getDate()}`.slice(-2)
        const mm = `00${date.getMonth() + 1}`.slice(-2)
        return `${dd}/${mm}/${date.getFullYear()}`
    }

}

/**
 * A set of functions that can parse various different date formats.
 */
DateParser.parsers = {}
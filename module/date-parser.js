// -- Defaults --

export const DEFAULT_MONTH_NAMES = [
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
]

export const DEFAULT_SHORT_MONTH_NAMES = [
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
]


// -- Class definition --

/**
 * A date parser.
 */
export class DateParser {

    constructor(
        monthNames=DEFAULT_MONTH_NAMES,
        shortMonthNames=DEFAULT_SHORT_MONTH_NAMES
    ) {
        // Set the month names used when formatting/parsing dates
        this.monthNames = monthNames
        this.shortMonthNames = shortMonthNames
    }

    /**
     * Format (and return) a date as a string using the named formatter.
     */
    format(formatter, date) {
        return this.constructor.formatters[formatter](this, date)
    }

    /**
     * Attempt to parse (and return) a string as a date using the list of
     * named parsers.
     */
    parse(parsers, s) {
        let date = null
        for (let parser of parsers) {
            date = this.constructor.parsers[parser](this, s)
            if (date !== null) {
                break
            }
        }
        return date
    }
}


// -- Formatters --

/**
 * A set of functions that can ouput dates in various string format.
 */
DateParser.formatters = {

    /**
     * Format a date as `dd/mm/yyyy`, e.g 22/01/2011.
     */
    'dmy': (inst, date) => {
        const dd = `00${date.getDate()}`.slice(-2)
        const mm = `00${date.getMonth() + 1}`.slice(-2)
        return `${dd}/${mm}/${date.getFullYear()}`
    },

    /**
     * Format a date as `{day} {month name} {full year}`, e.g 22 January 2011.
     */
    'human': (inst, date) => {
        const monthName = inst.monthNames[date.getMonth()]
        return `${date.getDate()} ${monthName} ${date.getFullYear()}`
    },

    /**
     * Format a date as `{day} {short month name} {full year}`, e.g:
     * 22 Jan 2011.
     */
    'humanShort': (inst, date) => {
        const monthName = inst.shortMonthNames[date.getMonth()]
        return `${date.getDate()} ${monthName} ${date.getFullYear()}`
    },

    /**
     * Format a date as ISO 8601 (yyyy-mm-dd), e.g `2011-01-22`.
     */
    'iso': (inst, date) => {
        const dd = `00${date.getDate()}`.slice(-2)
        const mm = `00${date.getMonth() + 1}`.slice(-2)
        return `${date.getFullYear()}-${mm}-${dd}`
    },

    /**
     * Format a date as `mm/dd/yyyy`, e.g 01/22/2011.
     */
    'mdy': (inst, date) => {
        const dd = `00${date.getDate()}`.slice(-2)
        const mm = `00${date.getMonth() + 1}`.slice(-2)
        return `${mm}/${dd}/${date.getFullYear()}`
    }
}


// -- Parsers --

/**
 * A set of functions that can parse various different date formats.
 */
DateParser.parsers = {

    /**
     * Return a date from a string using the format (`d/m/y`), the slash
     * separator can be a `/`, '-', or '.'.
     */
    'dmy': (inst, s) => {
        // Parse the date information
        const dateExp
            = /^(\d{1,2})(\/|\.|\-)(\d{1,2})(\/|\.|\-)(\d{2}|\d{4})$/
        const match = dateExp.exec(s)
        if (!match) {
            // Couldn't parse the date, nothing more we can do
            return null
        }

        // Convert the date information to a numbers
        let year = Number(match[5])
        const month = Number(match[3]) - 1
        const day = Number(match[1])

        // If the year doesn't contain the century then we add the current
        // century to it.
        if (year < 100) {
            year += parseInt((new Date()).getFullYear() / 100, 10) * 100
        }

        // Convert the components to a native date
        const date = new Date(year, month, day)

        // Validate the date is as expected (JS will try to handle an invalid
        // day, e.g 30th of Feb could become the 1st or 2nd of March, this
        // isn't the behaviour we want so we consider this an invalid date).
        if (date.getFullYear() !== year
            || date.getMonth() !== month
            || date.getDate() !== day) {

            return null
        }

        return date
    },

    /**
     * Return a date from a string using a human readable format, e.g:
     *
     * - `2nd`
     * - `1 Aug`
     * - `15 Feb 17`
     * - `January 22, 2011`
     * - `Nov 22`
     *
     * The order of the date components is not important, one component be a
     * string representing the month, two other components must be digits
     * (numbers) representing the month and year.
     */
    'human': (inst, s) => {
        // Clean up the date string, removing commas and suffixes
        let cleaned = s.toLowerCase()
        cleaned = cleaned.replace(',', ' ')
        cleaned = cleaned.replace(/(\d)st/g, '$1 ')
        cleaned = cleaned.replace(/(\d)nd/g, '$1 ')
        cleaned = cleaned.replace(/(\d)rd/g, '$1 ')
        cleaned = cleaned.replace(/(\d)th/g, '$1 ')
        cleaned = cleaned.trim()

        // Split the date string into its components
        let components = cleaned.split(/\s+/)

        // Check there is at most 3 components (we're only expecting 3, if
        // there's more we can't parse the date).
        if (components.length > 3) {
            return null
        }

        // If there's only one component then this must be the day so we set
        // the month and year to the current month/year until we determine the
        // number of components.
        let month = (new Date()).getMonth()
        let year = (new Date()).getYear()

        if (components.length > 1) {

            // Attempt to find a month in the components
            month = null
            for (let [i, component] of components.slice()) {

                // First check for a full month name...
                if (inst.monthNames.indexOf(component)) {
                    month = inst.monthNames.indexOf(component)

                // ...if not check for a short month name.
                } else if (inst.shortMonthNames.indexOf(component)) {
                    month = inst.shortMonthNames.indexOf(component)
                }

                if (month !== null) {
                    components.splice(i, 1)
                    break
                }

            }

            // If we couldn't find the month then we can't parse the date
            if (month === null) {
                return null
            }

            // Attempt to find a year in the components
            year = null

            // First check for a 4 digit year...
            for (let [i, component] of components.slice()) {
                if (component.length === 4) {
                    year = Number(component)
                    components.splice(i, 1)
                    break
                }
            }

            // ...if not check for a 2 digit year.
            if (year === null && components.length === 2) {
                year = Number(components[1])
                components.splice(1, 1)
            }

            // If we found a year but it couldn't be converted to a valid
            // number then we consider this a failure to parse the date.
            if (isNaN(year)) {
                return null
            }

            // If no year was found then default to the current year
            year = (new Date()).getYear()

            // If the year doesn't contain the century then we add the current
            // century to it.
            if (year < 100) {
                year += parseInt((new Date()).getFullYear() / 100, 10) * 100
            }
        }

        // The last component should contain a valid day
        const day = Number(components[0])
        if (isNaN(day)) {
            return null
        }

        // Convert the components to a native date
        const date = new Date(year, month, day)

        // Validate the date is as expected (JS will try to handle an invalid
        // day, e.g 30th of Feb could become the 1st or 2nd of March, this
        // isn't the behaviour we want so we consider this an invalid date).
        if (date.getFullYear() !== year
            || date.getMonth() !== month
            || date.getDate() !== day) {

            return null
        }

        return date
    },

    /**
     * Return a date from a string in ISO 8601 format (e.g `yyyy-mm-dd`).
     */
    'iso': (inst, s) => {
        // Parse the date information
        const dateExp = /^(\d{4})-(\d{2})-(\d{2})$/
        const match = dateExp.exec(s)
        if (!match) {
            // Couldn't parse the date, nothing more we can do
            return null
        }

        // Convert the date information to a numbers
        const year = Number(match[5])
        const month = Number(match[3]) - 1
        const day = Number(match[1])

        // Convert the components to a native date
        const date = new Date(year, month, day)

        // Validate the date is as expected (JS will try to handle an invalid
        // day, e.g 30th of Feb could become the 1st or 2nd of March, this
        // isn't the behaviour we want so we consider this an invalid date).
        if (date.getFullYear() !== year
            || date.getMonth() !== month
            || date.getDate() !== day) {

            return null
        }

        return date
    },

    /**
     * Return a date from a string using the format (`m/d/y`), the slash
     * separator can be a `/`, '-', or '.'.
     */
    'mdy': (inst, s) => {
        // Parse the date information
        const dateExp
            = /^(\d{1,2})(\/|\.|\-)(\d{1,2})(\/|\.|\-)(\d{2}|\d{4})$/
        const match = dateExp.exec(s)
        if (!match) {
            // Couldn't parse the date, nothing more we can do
            return null
        }

        // Convert the date information to a numbers
        let year = Number(match[5])
        const month = Number(match[1]) - 1
        const day = Number(match[3])

        // If the year doesn't contain the century then we add the current
        // century to it.
        if (year < 100) {
            year += parseInt((new Date()).getFullYear() / 100, 10) * 100
        }

        // Convert the components to a native date
        const date = new Date(year, month, day)

        // Validate the date is as expected (JS will try to handle an invalid
        // day, e.g 30th of Feb could become the 1st or 2nd of March, this
        // isn't the behaviour we want so we consider this an invalid date).
        if (date.getFullYear() !== year
            || date.getMonth() !== month
            || date.getDate() !== day) {

            return null
        }

        return date
    }
}

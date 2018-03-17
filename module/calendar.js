import * as $ from 'manhattan-essentials'
import {DEFAULT_MONTH_NAMES} from './date-parser'

// -- Defaults --

export const DEFAULT_WEEKDAY_NAMES
    = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']


// -- Class definition --

/**
 * A calendar UI component (used by the date picker to provide a calander to
 * pick a date from).
 */
export class Calendar {

    constructor(
        dateTest=null,
        firstWeekday=1,
        maxDate=null,
        minDate=null,
        monthNames=DEFAULT_MONTH_NAMES,
        weekdayNames=DEFAULT_WEEKDAY_NAMES
    ) {

        return null
    }

}


// @@ Consider use for configurable objects {param: value} over params list


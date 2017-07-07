(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ManhattanDatePicker"] = factory();
	else
		root["ManhattanDatePicker"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "date-picker.css";

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var $, BasePicker, Calendar, DatePicker, DateRangePicker,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
	  hasProp = {}.hasOwnProperty;

	$ = __webpack_require__(3);

	Calendar = __webpack_require__(4).Calendar;

	BasePicker = (function() {
	  function BasePicker() {
	    this.close = bind(this.close, this);
	    this._isOpen = false;
	    Object.defineProperty(this, 'isOpen', {
	      get: (function(_this) {
	        return function() {
	          return _this._isOpen;
	        };
	      })(this)
	    });
	    $.listen(window, {
	      'fullscreenchange orientationchange resize': (function(_this) {
	        return function(ev) {
	          if (_this.isOpen) {
	            return _this.close('resize');
	          }
	        };
	      })(this)
	    });
	  }

	  BasePicker.prototype.close = function(input, block, reason) {
	    if (!this.isOpen) {
	      return;
	    }
	    this._dom.picker.classList.add(this._bem(block, '', 'closed'));
	    this._isOpen = false;
	    return $.dispatch(input, this._et('close'), {
	      'reason': reason
	    });
	  };

	  BasePicker.prototype._bem = function(block, element, modifier) {
	    var name;
	    if (element == null) {
	      element = '';
	    }
	    if (modifier == null) {
	      modifier = '';
	    }
	    name = block;
	    if (element) {
	      name = name + "__" + element;
	    }
	    if (modifier) {
	      name = name + "--" + modifier;
	    }
	    return name;
	  };

	  BasePicker.prototype._track = function(input) {
	    var left, rect, top;
	    rect = input.getBoundingClientRect();
	    top = rect.top += window.scrollY;
	    left = rect.left += window.scrollX;
	    this._dom.picker.style.top = (top + rect.height) + "px";
	    return this._dom.picker.style.left = left + "px";
	  };

	  return BasePicker;

	})();

	DatePicker = (function(superClass) {
	  extend(DatePicker, superClass);

	  DatePicker.clsPrefix = 'data-mh-date-picker--';

	  function DatePicker(input, options) {
	    var eventListeners, proxyOptions;
	    if (options == null) {
	      options = {};
	    }
	    this.open = bind(this.open, this);
	    DatePicker.__super__.constructor.call(this);
	    $.config(this, {
	      closeOnPick: false,
	      format: 'human_en',
	      parsers: ['human_en', 'dmy', 'iso']
	    }, options, input, this.constructor.clsPrefix);
	    this._behaviours = {};
	    $.config(this._behaviours, {
	      input: 'set-value'
	    }, options, input, this.constructor.clsPrefix);
	    this._dom = {};
	    this._dom.input = input;
	    this._dom.input.__mh_datePicker = this;
	    this._dom.picker = $.create('div', {
	      'class': [this._bem('mh-date-picker'), this._bem('mh-date-picker', '', 'closed')].join(' ')
	    });
	    document.body.appendChild(this._dom.picker);
	    proxyOptions = Calendar.proxyOptions(options, input);
	    this._calendar = new Calendar(this._dom.picker, proxyOptions);
	    Object.defineProperty(this, 'calendar', {
	      get: (function(_this) {
	        return function() {
	          return _this._calendar;
	        };
	      })(this)
	    });
	    Object.defineProperty(this, 'input', {
	      value: this._dom.input
	    });
	    $.listen(this.input, {
	      'blur': (function(_this) {
	        return function() {
	          return _this.close('blur');
	        };
	      })(this),
	      'click': (function(_this) {
	        return function() {
	          return _this.open();
	        };
	      })(this),
	      'focus': (function(_this) {
	        return function() {
	          return _this.open();
	        };
	      })(this),
	      'change': (function(_this) {
	        return function(ev) {
	          var date;
	          if (ev.caller === _this) {
	            return;
	          }
	          date = Calendar.parseDate(_this.input.value, _this.parsers);
	          if (date) {
	            return _this.pick(date, 'input');
	          }
	        };
	      })(this)
	    });
	    eventListeners = {};
	    eventListeners[this.calendar._et('pick')] = (function(_this) {
	      return function(ev) {
	        return _this.pick(ev.date, 'calendar');
	      };
	    })(this);
	    $.listen(this.calendar.calendar, eventListeners);
	  }

	  DatePicker.prototype.close = function(reason) {
	    return DatePicker.__super__.close.call(this, this.input, 'mh-date-picker', reason);
	  };

	  DatePicker.prototype.open = function() {
	    var date;
	    date = Calendar.parseDate(this.input.value, this.parsers);
	    if (date) {
	      this.calendar.goto(date.getMonth(), date.getFullYear());
	      this.calendar.select(date);
	    }
	    this._track();
	    this._dom.picker.classList.remove(this._bem('mh-date-picker', '', 'closed'));
	    this._isOpen = true;
	    return $.dispatch(this.input, this._et('open'));
	  };

	  DatePicker.prototype.pick = function(date, source) {
	    if (source == null) {
	      source = '';
	    }
	    this.calendar.select(date);
	    if ($.dispatch(this.input, this._et('pick'), {
	      'date': date,
	      'source': source
	    })) {
	      this.constructor.behaviours.input[this._behaviours.input](this, date);
	      $.dispatch(this.input, this._et('picked'), {
	        'date': date,
	        'source': source
	      });
	      if (this.closeOnPick) {
	        return this.close({
	          'reason': 'pick'
	        });
	      }
	    }
	  };

	  DatePicker.prototype._et = function(eventName) {
	    return "mh-date-picker--" + eventName;
	  };

	  DatePicker.prototype._track = function() {
	    return DatePicker.__super__._track.call(this, this.input);
	  };

	  DatePicker.behaviours = {
	    input: {
	      'set-hidden': function(datePicker, date) {
	        var dateStr, hidden, hiddenDateStr, hiddenFormat, hiddenSelector;
	        dateStr = Calendar.formats[datePicker.format](date);
	        datePicker.input.value = dateStr;
	        hiddenSelector = datePicker.input.getAttribute(datePicker.constructor.clsPrefix + "hidden");
	        hidden = $.one(hiddenSelector);
	        hiddenFormat = datePicker.input.getAttribute(datePicker.constructor.clsPrefix + "hidden-format");
	        hiddenDateStr = Calendar.formats[hiddenFormat](date);
	        hidden.value = hiddenDateStr;
	        return $.dispatch(hidden, 'change');
	      },
	      'set-value': function(datePicker, date) {
	        var dateStr;
	        dateStr = Calendar.formats[datePicker.format](date);
	        datePicker.input.value = dateStr;
	        $.dispatch(datePicker.input, 'change', {
	          caller: datePicker
	        });
	        return console.log(dateStr);
	      }
	    }
	  };

	  return DatePicker;

	})(BasePicker);

	DateRangePicker = (function(superClass) {
	  extend(DateRangePicker, superClass);

	  DateRangePicker.clsPrefix = 'data-mh-date-range-picker--';

	  function DateRangePicker(startInput, endInput, options) {
	    var eventListeners, i, input, len, proxyOptions, ref;
	    if (options == null) {
	      options = {};
	    }
	    DateRangePicker.__super__.constructor.call(this);
	    $.config(this, {
	      closeOnPick: false,
	      format: 'human_en',
	      parsers: ['human_en', 'dmy', 'iso'],
	      pinToStart: false
	    }, options, startInput, this.constructor.clsPrefix);
	    this._behaviours = {};
	    $.config(this._behaviours, {
	      input: 'set-value'
	    }, options, startInput, this.constructor.clsPrefix);
	    this._dom = {};
	    this._dom.picker = $.create('div', {
	      'class': [this._bem('mh-date-range-picker'), this._bem('mh-date-range-picker', '', 'closed')].join(' ')
	    });
	    document.body.appendChild(this._dom.picker);
	    this._dom.startInput = startInput;
	    this._dom.startInput.__mh_dateRangePicker = this;
	    this._dom.endInput = endInput;
	    this._dom.endInput.__mh_dateRangePicker = this;
	    proxyOptions = Calendar.proxyOptions(options, startInput);
	    this._calendars = [new Calendar(this._dom.picker, proxyOptions), new Calendar(this._dom.picker, proxyOptions)];
	    this._picking = 'start';
	    Object.defineProperty(this, 'calendars', {
	      get: (function(_this) {
	        return function() {
	          return _this._calendars;
	        };
	      })(this)
	    });
	    Object.defineProperty(this, 'endInput', {
	      value: this._dom.endInput
	    });
	    Object.defineProperty(this, 'startInput', {
	      value: this._dom.startInput
	    });
	    Object.defineProperty(this, 'picking', {
	      get: (function(_this) {
	        return function() {
	          return _this._picking;
	        };
	      })(this)
	    });
	    ref = [this.startInput, this.endInput];
	    for (i = 0, len = ref.length; i < len; i++) {
	      input = ref[i];
	      $.listen(input, {
	        'click': function(ev) {
	          return ev.target.focus();
	        },
	        'focus': (function(_this) {
	          return function(ev) {
	            if (ev.target === _this.startInput) {
	              _this._picking = 'start';
	            } else {
	              _this._picking = 'end';
	            }
	            return _this.open();
	          };
	        })(this),
	        'blur': (function(_this) {
	          return function() {
	            var activeInput;
	            activeInput = document.activeElement;
	            if (_this.startInput === activeInput || _this.endInput === activeInput) {
	              return;
	            }
	            return _this.close('blur');
	          };
	        })(this),
	        'change': (function(_this) {
	          return function(ev) {
	            var date, dateRange;
	            if (ev.caller === _this) {
	              return;
	            }
	            date = Calendar.parseDate(ev.target.value, _this.parsers);
	            if (date) {
	              dateRange = _this.calendars[0].dateRange;
	              if (_this.picking === 'start') {
	                dateRange[0] = date;
	              } else {
	                dateRange[1] = date;
	              }
	              return _this.pick(dateRange, {
	                'source': 'input'
	              });
	            }
	          };
	        })(this)
	      });
	    }
	    eventListeners = {};
	    eventListeners[this.calendars[0]._et('pick')] = (function(_this) {
	      return function(ev) {
	        var dateRange;
	        dateRange = _this.calendars[0].dateRange;
	        if (_this.picking === 'start') {
	          dateRange[0] = ev.date;
	        } else {
	          dateRange[1] = ev.date;
	        }
	        return _this.pick(dateRange, {
	          'source': 'calendar'
	        });
	      };
	    })(this);
	    eventListeners[this.calendars[0]._et('view')] = (function(_this) {
	      return function(ev) {
	        if (_this.calendars.indexOf(ev.calendar) === 0) {
	          return _this.calendars[1].sync(_this.calendars[0], 1);
	        } else {
	          return _this.calendars[0].sync(_this.calendars[1], -1);
	        }
	      };
	    })(this);
	    $.listen(this.calendars[0].calendar, eventListeners);
	    $.listen(this.calendars[1].calendar, eventListeners);
	  }

	  DateRangePicker.prototype.close = function(reason) {
	    return DateRangePicker.__super__.close.call(this, this.startInput, 'mh-date-range-picker', reason);
	  };

	  DateRangePicker.prototype.open = function() {
	    var calendar, closedClass, dateRange, endDate, endStr, i, input, len, ref, startDate, startStr, viewDate, viewStrs;
	    input = this.startInput;
	    if (this.picking === 'end') {
	      input = this.endInput;
	    }
	    startDate = Calendar.parseDate(this.startInput.value, this.parsers);
	    endDate = Calendar.parseDate(this.endInput.value, this.parsers);
	    dateRange = this.calendars[0].dateRange;
	    if (startDate) {
	      dateRange[0] = startDate;
	    }
	    if (endDate) {
	      dateRange[1] = endDate;
	    }
	    if (dateRange[1] < dateRange[0]) {
	      this.pick([dateRange[1], dateRange[0]]);
	      this.endInput.focus();
	      return;
	    }
	    ref = this.calendars;
	    for (i = 0, len = ref.length; i < len; i++) {
	      calendar = ref[i];
	      calendar.select(dateRange[0], dateRange[1]);
	    }
	    startStr = (dateRange[0].getMonth()) + "." + (dateRange[0].getFullYear());
	    endStr = (dateRange[1].getMonth()) + "." + (dateRange[1].getFullYear());
	    viewStrs = [this.calendars[0].month + "." + this.calendars[0].year, this.calendars[1].month + "." + this.calendars[1].year];
	    if (viewStrs.indexOf(startStr) === -1 && viewStrs.indexOf(endStr) === -1) {
	      viewDate = dateRange[0];
	      this.calendars[0].goto(viewDate.getMonth(), viewDate.getFullYear());
	    }
	    this._track(this.pinToStart ? this.startInput : input);
	    closedClass = this._bem('mh-date-range-picker', '', 'closed');
	    this._dom.picker.classList.remove(closedClass);
	    this._isOpen = true;
	    return $.dispatch(this.startInput, this._et('open'));
	  };

	  DateRangePicker.prototype.pick = function(dateRange, source) {
	    var calendar, evData, i, len, ref;
	    ref = this.calendars;
	    for (i = 0, len = ref.length; i < len; i++) {
	      calendar = ref[i];
	      calendar.select(dateRange[0], dateRange[1]);
	    }
	    evData = {
	      'dateRange': dateRange,
	      'source': source
	    };
	    if ($.dispatch(this.startInput, this._et('pick'), evData)) {
	      this.constructor.behaviours.input[this._behaviours.input](this, dateRange);
	      $.dispatch(this.startInput, this._et('picked'), evData);
	      if (this.picking === 'start') {
	        this.endInput.focus();
	      } else {
	        this.startInput.focus();
	      }
	      if (this.closeOnPick) {
	        return this.close();
	      }
	    }
	  };

	  DateRangePicker.prototype._et = function(eventName) {
	    return "mh-date-range-picker--" + eventName;
	  };

	  DateRangePicker.behaviours = {
	    input: {
	      'set-value': function(dateRangePicker, dateRange) {
	        var format;
	        format = Calendar.formats[dateRangePicker.format];
	        dateRangePicker.startInput.value = format(dateRange[0]);
	        $.dispatch(dateRangePicker.startInput, 'change', {
	          caller: datePicker
	        });
	        dateRangePicker.endInput.value = format(dateRange[1]);
	        return $.dispatch(dateRangePicker.endInput, 'change', {
	          caller: datePicker
	        });
	      }
	    }
	  };

	  return DateRangePicker;

	})(BasePicker);

	module.exports = {
	  Calendar: Calendar,
	  DatePicker: DatePicker,
	  DateRangePicker: DateRangePicker
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	!function(e,t){ true?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.ManhattanEssentials=t():e.ManhattanEssentials=t()}(this,function(){return function(e){function __webpack_require__(r){if(t[r])return t[r].exports;var n=t[r]={exports:{},id:r,loaded:!1};return e[r].call(n.exports,n,n.exports,__webpack_require__),n.loaded=!0,n.exports}var t={};return __webpack_require__.m=e,__webpack_require__.c=t,__webpack_require__.p="",__webpack_require__(0)}([function(e,t,r){e.exports=r(1)},function(e,t){var r,n,u,o,i,a,c,s,p=[].indexOf||function(e){for(var t=0,r=this.length;t<r;t++)if(t in this&&this[t]===e)return t;return-1};n=function(e,t){var r,n,u;null==t&&(t={}),r=document.createElement(e);for(n in t)u=t[n],p.call(r,n)>=0?r[n]=u:r.setAttribute(n,u);return r},c=function(e,t){return null==t&&(t=document),Array.prototype.slice.call(t.querySelectorAll(e))},s=function(e,t){return null==t&&(t=document),t.querySelector(e)},u=function(e,t,r){var n,u,o;null==r&&(r={}),n=document.createEvent("Event"),n.initEvent(t,!0,!0);for(u in r)o=r[u],n[u]=o;return e.dispatchEvent(n)},i=function(e,t){var r,n,u,o;o=[];for(n in t)u=t[n],o.push(function(){var t,o,i,a;for(i=n.split(/\s+/),a=[],t=0,o=i.length;t<o;t++)r=i[t],a.push(e.removeEventListener(r,u));return a}());return o},a=function(e,t){var r,n,u,o;o=[];for(n in t)u=t[n],o.push(function(){var t,o,i,a;for(i=n.split(/\s+/),a=[],t=0,o=i.length;t<o;t++)r=i[t],a.push(e.addEventListener(r,u));return a}());return o},r=function(e,t,r,n,u){var o,i,a,c;null==u&&(u="data-"),a=[];for(i in t)c=t[i],e[i]=c,r.hasOwnProperty(i)&&(e[i]=r[i]),n&&(o=u+i.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase(),n.hasAttribute(o)?"number"==typeof c?a.push(e[i]=parseInt(n.getAttribute(o))):c===!1?a.push(e[i]=!0):a.push(e[i]=n.getAttribute(o)):a.push(void 0));return a},o=function(e){return e.replace(/[\^\$\\\.\*\+\?\(\)\[\]\{\}\|]/g,"\\$&")},e.exports={create:n,one:s,many:c,dispatch:u,ignore:i,listen:a,config:r,escapeRegExp:o}}])});

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var $, Calendar,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

	$ = __webpack_require__(3);

	Calendar = (function() {
	  Calendar.getDefaultConfig = function() {
	    return {
	      dates: [],
	      minDate: null,
	      maxDate: null,
	      firstWeekday: 1,
	      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	      weekdayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
	    };
	  };

	  function Calendar(parent, options) {
	    var date, i, j, k, ref, ref1, ref2, today, weekday, weekdayIndex;
	    if (options == null) {
	      options = {};
	    }
	    this.goto = bind(this.goto, this);
	    this.destroy = bind(this.destroy, this);
	    $.config(this, Calendar.getDefaultConfig(), options);
	    this._behaviours = {};
	    $.config(this._behaviours, {
	      test: 'any'
	    }, options);
	    today = new Date();
	    today.setHours(0, 0, 0, 0);
	    this._dateRange = [today, today];
	    this._month = today.getMonth();
	    this._year = today.getFullYear();
	    this._dom = {};
	    this._dom.parent = parent;
	    this._dom.calendar = $.create('div', {
	      'class': this._bem('mh-calendar')
	    });
	    parent.appendChild(this._dom.calendar);
	    this._dom.nav = $.create('div', {
	      'class': this._bem('mh-calendar', 'nav')
	    });
	    this._dom.calendar.appendChild(this._dom.nav);
	    this._dom.month = $.create('div', {
	      'class': this._bem('mh-calendar', 'month')
	    });
	    this._dom.nav.appendChild(this._dom.month);
	    this._dom.next = $.create('div', {
	      'class': this._bem('mh-calendar', 'next')
	    });
	    this._dom.previous = $.create('div', {
	      'class': this._bem('mh-calendar', 'previous')
	    });
	    this._dom.nav.appendChild(this._dom.next);
	    this._dom.nav.appendChild(this._dom.previous);
	    this._dom.weekdays = $.create('div', {
	      'class': this._bem('mh-calendar', 'weekdays')
	    });
	    this._dom.calendar.appendChild(this._dom.weekdays);
	    for (i = j = ref = this.firstWeekday, ref1 = this.firstWeekday + 7; ref <= ref1 ? j < ref1 : j > ref1; i = ref <= ref1 ? ++j : --j) {
	      weekday = $.create('div', {
	        'class': this._bem('mh-calendar', 'weekday')
	      });
	      weekdayIndex = i;
	      if (i >= this.weekdayNames.length) {
	        weekdayIndex -= this.weekdayNames.length;
	      }
	      weekday.innerHTML = this.weekdayNames[weekdayIndex];
	      this._dom.weekdays.appendChild(weekday);
	    }
	    this._dom.dates = $.create('div', {
	      'class': this._bem('mh-calendar', 'dates')
	    });
	    this._dom.calendar.appendChild(this._dom.dates);
	    for (i = k = 0, ref2 = 7 * 6; 0 <= ref2 ? k < ref2 : k > ref2; i = 0 <= ref2 ? ++k : --k) {
	      date = $.create('div', {
	        'class': this._bem('mh-calendar', 'date')
	      });
	      this._dom.dates.appendChild(date);
	    }
	    Object.defineProperty(this, 'calendar', {
	      value: this._dom.calendar
	    });
	    Object.defineProperty(this, 'parent', {
	      value: this._dom.parent
	    });
	    Object.defineProperty(this, 'dateRange', {
	      get: function() {
	        return this._dateRange.slice();
	      }
	    });
	    Object.defineProperty(this, 'month', {
	      get: function() {
	        return this._month;
	      }
	    });
	    Object.defineProperty(this, 'year', {
	      get: function() {
	        return this._year;
	      }
	    });
	    $.listen(this._dom.calendar, {
	      'mousedown': function(ev) {
	        return ev.preventDefault();
	      }
	    });
	    $.listen(this._dom.next, {
	      'click': (function(_this) {
	        return function(ev) {
	          ev.preventDefault();
	          return _this.next();
	        };
	      })(this)
	    });
	    $.listen(this._dom.previous, {
	      'click': (function(_this) {
	        return function(ev) {
	          ev.preventDefault();
	          return _this.previous();
	        };
	      })(this)
	    });
	    $.listen(this._dom.dates, {
	      'click': (function(_this) {
	        return function(ev) {
	          var blockedCSS, dateElm;
	          ev.preventDefault();
	          dateElm = ev.target;
	          if (dateElm === _this._dom.dates) {
	            return;
	          }
	          while (dateElm.parentNode !== _this._dom.dates) {
	            dateElm = dateElm.parentNode;
	          }
	          blockedCSS = _this._bem('mh-calendar', 'date', 'blocked');
	          if (dateElm.classList.contains(blockedCSS)) {
	            return;
	          }
	          return $.dispatch(_this.calendar, _this._et('pick'), {
	            'calendar': _this,
	            'date': dateElm.__mh_date
	          });
	        };
	      })(this)
	    });
	    this.update();
	  }

	  Calendar.prototype.destroy = function() {
	    if (this.calendar.parentNode === this.parent) {
	      return this.parent.removeChild(this.calendar);
	    }
	  };

	  Calendar.prototype.goto = function(month, year) {
	    if (this._month === month && year === this._year) {
	      return;
	    }
	    this._month = month;
	    this._year = year;
	    this.update();
	    return $.dispatch(this.calendar, this._et('view'), {
	      'calendar': this,
	      'month': month,
	      'year': year
	    });
	  };

	  Calendar.prototype.next = function() {
	    return this.offset(1);
	  };

	  Calendar.prototype.offset = function(months, years) {
	    var month, year;
	    if (years == null) {
	      years = 0;
	    }
	    if (months > 0) {
	      years += Math.floor(Math.abs(months) / 12);
	    } else {
	      years -= Math.floor(Math.abs(months) / 12);
	    }
	    months = months % 12;
	    month = this._month + months;
	    year = this._year + years;
	    if (month < 0) {
	      month = 12 + month;
	      year -= 1;
	    } else if (month > 11) {
	      month = month - 12;
	      year += 1;
	    }
	    return this.goto(month, year);
	  };

	  Calendar.prototype.previous = function() {
	    return this.offset(-1);
	  };

	  Calendar.prototype.select = function(startDate, endDate) {
	    if (endDate == null) {
	      endDate = null;
	    }
	    if (endDate) {
	      this._dateRange = [startDate, endDate];
	    } else {
	      this._dateRange = [startDate, startDate];
	    }
	    return this.update();
	  };

	  Calendar.prototype.sync = function(otherCalendar, months, years) {
	    var month, year;
	    if (years == null) {
	      years = 0;
	    }
	    if (months > 0) {
	      years += Math.floor(Math.abs(months) / 12);
	    } else {
	      years -= Math.floor(Math.abs(months) / 12);
	    }
	    months = months % 12;
	    month = otherCalendar.month + months;
	    year = otherCalendar.year + years;
	    if (month < 0) {
	      month = 12 + month;
	      year -= 1;
	    } else if (month > 11) {
	      month = month - 12;
	      year += 1;
	    }
	    if (this._month === month && year === this._year) {
	      return;
	    }
	    this._month = month;
	    this._year = year;
	    return this.update();
	  };

	  Calendar.prototype.update = function() {
	    var classList, date, dateElm, daysOffset, i, j, ref, results, test, today, weekday;
	    this._dom.month.innerHTML = this.monthNames[this.month] + ", " + this.year;
	    weekday = new Date(this.year, this.month, 1).getDay();
	    console.log(weekday, this.firstWeekday);
	    daysOffset = weekday - this.firstWeekday;
	    if (daysOffset < 0) {
	      daysOffset = 7 - Math.abs(daysOffset);
	    }
	    date = new Date(this.year, this.month, 1);
	    if (daysOffset > 0) {
	      date.setDate(date.getDate() - daysOffset);
	    }
	    results = [];
	    for (i = j = 0, ref = 7 * 6; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
	      dateElm = this._dom.dates.childNodes[i];
	      dateElm.innerHTML = date.getDate();
	      dateElm.__mh_date = new Date(date);
	      dateElm.setAttribute('class', this._bem('mh-calendar', 'date'));
	      classList = dateElm.classList;
	      if (date.getMonth() !== this.month) {
	        classList.add(this._bem('mh-calendar', 'date', 'blocked'));
	      }
	      if (this.minDate && this.minDate.getTime() > date.getTime()) {
	        classList.add(this._bem('mh-calendar', 'date', 'blocked'));
	      }
	      if (this.maxDate && this.maxDate.getTime() < date.getTime()) {
	        classList.add(this._bem('mh-calendar', 'date', 'blocked'));
	      }
	      test = this.constructor.behaviours.test[this._behaviours.test];
	      if (!test(this, this.dates, date)) {
	        classList.add(this._bem('mh-calendar', 'date', 'blocked'));
	      }
	      today = new Date();
	      today.setHours(0, 0, 0, 0);
	      if (date.getTime() === today.getTime()) {
	        classList.add(this._bem('mh-calendar', 'date', 'today'));
	      }
	      if (date.getTime() === this.dateRange[0].getTime()) {
	        classList.add(this._bem('mh-calendar', 'date', 'range-start'));
	      }
	      if (date.getTime() === this.dateRange[1].getTime()) {
	        classList.add(this._bem('mh-calendar', 'date', 'range-end'));
	      }
	      if (date.getTime() > this.dateRange[0].getTime() && date.getTime() < this.dateRange[1].getTime()) {
	        classList.add(this._bem('mh-calendar', 'date', 'in-range'));
	      }
	      results.push(date.setDate(date.getDate() + 1));
	    }
	    return results;
	  };

	  Calendar.prototype._bem = function(block, element, modifier) {
	    var name;
	    if (element == null) {
	      element = '';
	    }
	    if (modifier == null) {
	      modifier = '';
	    }
	    name = block;
	    if (element) {
	      name = name + "__" + element;
	    }
	    if (modifier) {
	      name = name + "--" + modifier;
	    }
	    return name;
	  };

	  Calendar.prototype._et = function(eventName) {
	    return "mh-calendar--" + eventName;
	  };

	  Calendar.parseDate = function(s, parsers) {
	    var date, j, len, parser;
	    if (s instanceof Date) {
	      return s;
	    }
	    for (j = 0, len = parsers.length; j < len; j++) {
	      parser = parsers[j];
	      date = this.parsers[parser](s);
	      if (date) {
	        return date;
	      }
	    }
	  };

	  Calendar.proxyOptions = function(prefix, options, input) {
	    var _parse, _split, defaults, j, len, option, proxy, ref, v;
	    defaults = Calendar.getDefaultConfig();
	    defaults.parsers = [];
	    proxy = {};
	    $.config(proxy, defaults, options, input, prefix);
	    _parse = function(s, parsers) {
	      return Calendar.parseDate(s, parsers);
	    };
	    _split = function(s) {
	      var v;
	      return (function() {
	        var j, len, ref, results;
	        ref = s.split(',');
	        results = [];
	        for (j = 0, len = ref.length; j < len; j++) {
	          v = ref[j];
	          if (v.trim()) {
	            results.push(v.trim());
	          }
	        }
	        return results;
	      })();
	    };
	    if (typeof proxy.firstWeekday === 'string') {
	      proxy.firstWeekday = Number(proxy.firstWeekday);
	    }
	    ref = ['dates', 'monthNames', 'parsers', 'weekdayNames'];
	    for (j = 0, len = ref.length; j < len; j++) {
	      option = ref[j];
	      if (typeof proxy[option] === 'string') {
	        proxy[option] = _split(proxy[option]);
	      }
	    }
	    if (typeof proxy.minDate === 'string') {
	      proxy.minDate = _parse(proxy.minDate, proxy.parsers);
	    }
	    if (typeof proxy.maxDate === 'string') {
	      proxy.maxDate = _parse(proxy.maxDate, proxy.parsers);
	    }
	    proxy.dates = (function() {
	      var k, len1, ref1, results;
	      ref1 = proxy.dates;
	      results = [];
	      for (k = 0, len1 = ref1.length; k < len1; k++) {
	        v = ref1[k];
	        if (_parse(v, proxy.parsers)) {
	          results.push(_parse(v, proxy.parsers));
	        }
	      }
	      return results;
	    })();
	    delete proxy.parsers;
	    return proxy;
	  };

	  Calendar.behaviours = {
	    test: {
	      'any': function(calendar, dates, date) {
	        return true;
	      },
	      'excluding': function(calendar, dates, date) {
	        var j, len, other_date;
	        for (j = 0, len = dates.length; j < len; j++) {
	          other_date = dates[j];
	          if (date.getTime() === other_date.getTime()) {
	            return false;
	          }
	        }
	        return true;
	      },
	      'only': function(calendar, dates, date) {
	        var j, len, other_date;
	        for (j = 0, len = dates.length; j < len; j++) {
	          other_date = dates[j];
	          if (date.getTime() === other_date.getTime()) {
	            return true;
	          }
	        }
	        return false;
	      },
	      'weekdays': function(calendar, weekdays, date) {
	        return weekdays.indexOf(date.getDay()) > -1;
	      }
	    }
	  };

	  Calendar.formats = {
	    'dmy': function(date) {
	      var dd, mm, yyyy;
	      dd = ("00" + (date.getDate())).slice(-2);
	      mm = ("00" + (date.getMonth() + 1)).slice(-2);
	      yyyy = date.getFullYear();
	      return dd + "/" + mm + "/" + yyyy;
	    },
	    'human_en': function(date) {
	      var month_name;
	      month_name = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()];
	      return (date.getDate()) + " " + month_name + " " + (date.getFullYear());
	    },
	    'human_abbr_en': function(date) {
	      var month_name;
	      month_name = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
	      return (date.getDate()) + " " + month_name + " " + (date.getFullYear());
	    },
	    'iso': function(date) {
	      var dd, mm, yyyy;
	      dd = ("00" + (date.getDate())).slice(-2);
	      mm = ("00" + (date.getMonth() + 1)).slice(-2);
	      yyyy = date.getFullYear();
	      return yyyy + "-" + mm + "-" + dd;
	    },
	    'mdy': function(date) {
	      var dd, mm, yyyy;
	      dd = ("00" + (date.getDate())).slice(-2);
	      mm = ("00" + (date.getMonth() + 1)).slice(-2);
	      yyyy = date.getFullYear();
	      return mm + "/" + dd + "/" + yyyy;
	    }
	  };

	  Calendar.parsers = {
	    'dmy': function(s) {
	      var date, dateExp, day, match, month, year;
	      dateExp = /^(\d{1,2})(\/|\.|\-)(\d{1,2})(\/|\.|\-)(\d{2}|\d{4})$/;
	      match = dateExp.exec(s);
	      if (!match) {
	        return;
	      }
	      year = Number(match[5]);
	      month = Number(match[3]) - 1;
	      day = Number(match[1]);
	      if (year < 100) {
	        year += parseInt((new Date()).getFullYear() / 100) * 100;
	      }
	      date = new Date(year, month, day);
	      if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
	        return;
	      }
	      return date;
	    },
	    'human_en': function(s) {
	      var component, components, date, day, i, j, k, len, len1, month, month_names, month_short_names, ref, ref1, year;
	      month_names = {
	        'january': 0,
	        'february': 1,
	        'march': 2,
	        'april': 3,
	        'may': 4,
	        'june': 5,
	        'july': 6,
	        'august': 7,
	        'september': 8,
	        'october': 9,
	        'november': 10,
	        'december': 11
	      };
	      month_short_names = {
	        'jan': 0,
	        'feb': 1,
	        'mar': 2,
	        'apr': 3,
	        'may': 4,
	        'jun': 5,
	        'jul': 6,
	        'aug': 7,
	        'sep': 8,
	        'oct': 9,
	        'nov': 10,
	        'dec': 11
	      };
	      s = s.toLowerCase();
	      s = s.replace(',', ' ');
	      s = s.replace(/(\d)st/g, '$1 ');
	      s = s.replace(/(\d)nd/g, '$1 ');
	      s = s.replace(/(\d)rd/g, '$1 ');
	      s = s.replace(/(\d)th/g, '$1 ');
	      s = s.trim();
	      components = s.split(/\s+/);
	      if (components.length > 3) {
	        return;
	      }
	      month = (new Date()).getMonth();
	      year = (new Date()).getFullYear();
	      if (components.length > 1) {
	        month = null;
	        ref = components.slice();
	        for (i = j = 0, len = ref.length; j < len; i = ++j) {
	          component = ref[i];
	          if (month_names.hasOwnProperty(component)) {
	            month = month_names[component];
	          } else if (month_short_names.hasOwnProperty(component)) {
	            month = month_short_names[component];
	          }
	          if (month !== null) {
	            components.splice(i, 1);
	            break;
	          }
	        }
	        if (month === null) {
	          return;
	        }
	        year = null;
	        ref1 = components.slice();
	        for (i = k = 0, len1 = ref1.length; k < len1; i = ++k) {
	          component = ref1[i];
	          if (component.length === 4) {
	            year = Number(component);
	            components.splice(i, 1);
	            break;
	          }
	        }
	        if (year === null && components.length === 2) {
	          year = Number(components[1]);
	          components.splice(1, 1);
	        }
	        if (year === (0/0)) {
	          return;
	        }
	        if (year === null) {
	          year = (new Date()).getFullYear();
	        }
	        if (year < 100) {
	          year += parseInt((new Date()).getFullYear() / 100) * 100;
	        }
	      }
	      day = Number(components[0]);
	      if (day === (0/0)) {
	        return;
	      }
	      date = new Date(year, month, day);
	      if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
	        return;
	      }
	      return date;
	    },
	    'iso': function(s) {
	      var date, dateExp, day, match, month, year;
	      dateExp = /^(\d{4})-(\d{2})-(\d{2})$/;
	      match = dateExp.exec(s);
	      if (!match) {
	        return;
	      }
	      year = Number(match[1]);
	      month = Number(match[2]) - 1;
	      day = Number(match[3]);
	      date = new Date(year, month, day);
	      if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
	        return;
	      }
	      return date;
	    },
	    'mdy': function(s) {
	      var date, dateExp, day, match, month, year;
	      dateExp = /^(\d{1,2})(\/|\.|\-)(\d{1,2})(\/|\.|\-)(\d{2}|\d{4})$/;
	      match = dateExp.exec(s);
	      if (!match) {
	        return;
	      }
	      year = Number(match[5]);
	      month = Number(match[1]) - 1;
	      day = Number(match[3]);
	      if (year < 100) {
	        year += parseInt((new Date()).getFullYear() / 100) * 100;
	      }
	      date = new Date(year, month, day);
	      if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
	        return;
	      }
	      return date;
	    }
	  };

	  return Calendar;

	})();

	module.exports = {
	  Calendar: Calendar
	};


/***/ }
/******/ ])
});
;
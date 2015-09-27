/** Appointment model **/
'use strict';

var ko = require('knockout'),
    Model = require('./Model'),
    moment = require('moment'),
    PricingSummaryDetail = require('./PricingSummaryDetail'),
    CalendarEvent = require('./CalendarEvent'),
    Booking = require('./Booking');

function Appointment(values) {
    
    Model(this);

    this.model.defProperties({
        // An appointment ever references an event, and its 'id' is a CalendarEventID
        // even if other complementary object are used as 'source'
        id: null,
        
        startTime: null,
        endTime: null,
        
        // CommonEvent fields:
        summary: 'New booking',
        description: null,
        
        // Event specific fields:
        isAllDay: false,

        // Fields specific for bookings
        price: 0,
        // Actual bookings fields to use on post/put
        clientUserID: null,
        pricing: {
            Model: PricingSummaryDetail,
            isArray: true
        },
        addressID: null,
        preNotesToClient: null,
        postNotesToClient: null,
        preNotesToSelf: null,
        postNotesToSelf: null,
        
        jobTitleID: 0,
        
        readOnly: false,
        
        sourceEvent: {
            Model: CalendarEvent,
            defaultValue: null
        },
        sourceBooking: {
            Model: Booking,
            defaultValue: null
        }
    }, values);

    // Smart visualization of date and time
    this.displayedDate = ko.pureComputed(function() {
        
        return moment(this.startTime()).locale('en-US-LC').calendar();
        
    }, this);
    
    this.displayedStartTime = ko.pureComputed(function() {
        
        return moment(this.startTime()).locale('en-US-LC').format('LT');
        
    }, this);
    
    this.displayedEndTime = ko.pureComputed(function() {
        
        return moment(this.endTime()).locale('en-US-LC').format('LT');
        
    }, this);
    
    this.displayedTimeRange = ko.pureComputed(function() {
        
        return this.displayedStartTime() + '-' + this.displayedEndTime();
        
    }, this);
    
    this.itStarted = ko.pureComputed(function() {
        return (this.startTime() && new Date() >= this.startTime());
    }, this);
    
    this.itEnded = ko.pureComputed(function() {
        return (this.endTime() && new Date() >= this.endTime());
    }, this);
    
    this.isNew = ko.pureComputed(function() {
        return (!this.id());
    }, this);
    
    this.stateHeader = ko.pureComputed(function() {
        
        var text = '';
        if (this.id() > 0 && this.sourceEvent()) {
            if (!this.sourceBooking()) {
                text = 'Calendar block';
            }
            else if (this.itStarted()) {
                if (this.itEnded()) {
                    text = 'Completed';
                }
                else {
                    text = 'Now';
                }
            }
            else {
                text = 'Upcoming';
            }
        }

        return text;
        
    }, this);
}

module.exports = Appointment;

/**
    Creates an appointment instance from a CalendarEvent model instance
**/
Appointment.fromCalendarEvent = function fromCalendarEvent(event) {
    var apt = new Appointment();
    
    // Include event in apt
    apt.id(event.calendarEventID());
    apt.startTime(event.startTime());
    apt.endTime(event.endTime());
    apt.summary(event.summary());
    apt.description(event.description());
    apt.isAllDay(event.isAllDay());
    apt.readOnly(event.readOnly());
    apt.sourceEvent(event);
    
    return apt;
};

/**
    Creates an appointment instance from a Booking and a CalendarEvent model instances
**/
Appointment.fromBooking = function fromBooking(booking, event) {
    // Include event in apt
    var apt = Appointment.fromCalendarEvent(event);
    
    // Include booking in apt
    apt.clientUserID(booking.clientUserID());
    apt.addressID(booking.serviceAddressID());
    apt.jobTitleID(booking.jobTitleID());
    apt.pricing(booking.pricingSummary() && booking.pricingSummary().details());
    apt.preNotesToClient(booking.preNotesToClient());
    apt.postNotesToClient(booking.postNotesToClient());
    apt.preNotesToSelf(booking.preNotesToSelf());
    apt.postNotesToSelf(booking.postNotesToSelf());
    
    // On bookings, readOnly must set to false (is sent as true ever from
    // the server, to prevent direct manipulation of the event that is part of
    // a booking
    apt.readOnly(false);

    var prices = booking.pricingSummary();
    if (prices) {
        // TODO Setting service professional price, for clients must be
        // just totalPrice()
        apt.price(prices.totalPrice() - prices.pFeePrice());
    }

    apt.sourceBooking(booking);

    return apt;
};

/**
    Creates a list of appointment instances from the list of events and bookings.
    The bookings list must contain every booking that belongs to the events of type
    'booking' from the list of events.
**/
Appointment.listFromCalendarEventsBookings = function listFromCalendarEventsBookings(events, bookings) {
    return events.map(function(event) {
        var booking = null;
        bookings.some(function(searchBooking) {
            var found = searchBooking.serviceDateID() === event.calendarEventID();
            if (found) {
                booking = searchBooking;
                return true;
            }
        });

        if (booking)
            return Appointment.fromBooking(booking, event);
        else
            return Appointment.fromCalendarEvent(event);
    });
};

Appointment.specialIds = {
    loading: 0,
    emptyDate: -1,
    free: -2,
    newEvent: -3,
    newBooking: -4,
    unavailable: -5,
    preparationTime: -6
};

var Time = require('../utils/Time');
/**
    Creates an Appointment instance that represents a calendar slot of
    free/spare time, for the given time range, or the full given date.
    @param options:Object {
        date:Date. Optional. Used to create a full date slot or default for start/end
            to date start or date end
        start:Date. Optional. Beggining of the slot
        end:Date. Optional. Ending of the slot
        text:string. Optional ['Free']. To allow external localization of the text.
    }
**/
Appointment.newFreeSlot = function newFreeSlot(options) {
    
    var start = options.start || new Time(options.date, 0, 0, 0),
        end = options.end || new Time(options.date, 0, 0, 0);

    return new Appointment({
        id: Appointment.specialIds.free,

        startTime: start,
        endTime: end,

        summary: options.text || 'Free',
        description: null
    });
};

Appointment.newUnavailableSlot = function newUnavailableSlot(options) {
    
    var start = options.start || new Time(options.date, 0, 0, 0),
        end = options.end || new Time(options.date, 0, 0, 0);

    return new Appointment({
        id: Appointment.specialIds.unavailable,

        startTime: start,
        endTime: end,

        summary: options.text || 'Unavailable',
        description: null
    });
};

Appointment.newPreparationTimeSlot = function newPreparationTimeSlot(options) {

    var start = options.start || new Time(options.date, 0, 0, 0),
        end = options.end || new Time(options.date, 0, 0, 0);

    return new Appointment({
        id: Appointment.specialIds.preparationTime,

        startTime: start,
        endTime: end,

        summary: options.text || 'Preparation time',
        description: null
    });
};
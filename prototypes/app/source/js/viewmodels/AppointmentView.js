/**
    Appointment View model that wraps an Appointment
    model instance extended with extra methods connected
    to related data
**/
'use strict';

var ko = require('knockout');

module.exports = function AppointmentView(appointment, app) {
    
    appointment.customer = ko.computed(function() {
        var b = this.sourceBooking();
        if (!b) return null;
        
        var cid = this.customerUserID();
        if (cid) {
            return app.model.customers.getObservableItem(cid, true)();
        }
        return null;
    }, appointment);
    
    appointment.address = ko.computed(function() {
        var b = this.sourceBooking();
        if (!b) return null;
        
        var aid = this.addressID(),
            jid = this.jobTitleID();
        if (aid && jid) {
            return app.model.serviceAddresses.getObservableItem(jid, aid, true)();
        }
        return null;
    }, appointment);

    appointment.addressSummary = ko.computed(function() {
        var add = this.address();
        return add && add.singleLine() || '';
    }, appointment);
    
    /* Property with the pricing array plus information about the
        freelancerPricing.
    */
    appointment.pricingWithInfo = ko.computed(function() {
        var b = this.sourceBooking();
        if (!b) return [];

        var jid = this.jobTitleID(),
            details = this.pricing();

        return details.map(function(det) {
            return PricingEstimateDetailView(det, jid, app);
        });
    }, appointment);

    appointment.servicesSummary = ko.computed(function() {
        return this.pricingWithInfo()
        .map(function(service) {
            return service.freelancerPricing().name();
        }).join(', ');
    }, appointment);
    
    // TODO Review for any change of compute the full service duration
    appointment.serviceDurationMinutes = ko.computed(function() {
        var pricing = this.pricingWithInfo();
        return pricing.reduce(function(prev, service) {
            return prev + service.freelancerPricing().serviceDurationMinutes();
        }, 0);
    }, appointment);
    
    // TODO Review if calculation of fees and that is needed
    appointment.pricing.subscribe(function(pricing) {
        this.price(pricing.reduce(function(prev, cur) {
            return prev + cur.totalPrice();
        }, 0));
    }.bind(appointment));

    return appointment;
};

function PricingEstimateDetailView(pricingEstimateDetail, jobTitleID, app) {

    pricingEstimateDetail.freelancerPricing = ko.computed(function() {
        var pid = this.freelancerPricingID();
        return app.model.freelancerPricing
            .getObservableItem(jobTitleID, pid, true)();
    }, pricingEstimateDetail);

    return pricingEstimateDetail;
}

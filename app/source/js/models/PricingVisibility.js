'use strict';

function PricingVisibility() {
    var names = {
            firstTimeClient: 'First-time Clients Only',
            existingClient: 'Existing Clients Only',
            everyone: 'Everyone',
            specificClient: 'Specific Clients Only'
        },
        namesByID = {};

    namesByID[-2] = names.firstTimeClient;
    namesByID[-1] = names.existingClient;
    namesByID[0] = names.everyone;

    this.categoryNames = function() {
        return this.publicCategoryNames().concat([names.specificClient]);
    };

    this.publicCategoryNames = function() {
        return [names.everyone, names.existingClient, names.firstTimeClient];
    };

    this.categoryNameByID = function(id) {
        return namesByID[id] || names.specificClient;
    };

    this.isClientSpecific = function(visibleToClientID) {
        return visibleToClientID > 0;
    };
}

module.exports = PricingVisibility;

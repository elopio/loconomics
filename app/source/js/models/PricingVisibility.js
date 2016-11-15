'use strict';

function PricingVisibility() {
    this.categoryNames = function() {
        return this.publicCategoryNames().concat(['Specific Clients Only']);
    };

    this.publicCategoryNames = function() {
        return ['Everyone', 'Existing Clients Only', 'First-time Clients Only'];
    };
}

module.exports = PricingVisibility;

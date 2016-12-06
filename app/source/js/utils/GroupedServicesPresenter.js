/*
  Given a list of pricing types and pricings, creates an array of pricing types with
  pricings grouped by visibility to client.
*/
'use strict';

var groupBy = require('./groupBy'),
    PricingVisibility = require('../models/PricingVisibility.js');

// For a given pricing type and optional pricings, returns a 
// service object with pricings sorted by client visibility.

var service = function(pricingType, pricings) {
    var pricingsByVisibilityCategory = function(pricings) {
        var categoryNames = (new PricingVisibility()).publicCategoryNames(),
            groupedPricings = groupBy(pricings, function(p) { return p.visibilityCategoryName(); }, categoryNames); 

        return Object.keys(groupedPricings).map(function(categoryName) {
            return {
              label: categoryName,
              pricings: groupedPricings[categoryName]
            };
        });
    };

    var pluralLabel = pricingType().pluralName() || 'Services';

    return {
        label: pricings.length == 1 ? pricingType().singularName() : pluralLabel,
        type: pricingType,
        pricings: pricings,
        pluralLabel: pluralLabel,
        visibilityCategories: pricingsByVisibilityCategory(pricings)
    };
};


/*
  services: [
    { label, 
      type, 
      pricings: [],
      pluralLabel,
      visibilityCategories: [
        {
          label,
          pricings: []
        }, 
        ...
      ]
    }, 
    ...
  ]
*/
var GroupedServicesPresenter = {
    // For list of pricing types and optional pricings, returns service objects
    servicesGroupedByType : function(pricingTypes, pricings) {
        var pricingTypesByID = pricingTypes.reduce(function(obj, type) {
                obj[type().pricingTypeID()] = type;
                return obj;
            }, {}),
            defaultTypeIDs = Object.keys(pricingTypesByID),
            pricingsByTypeID = groupBy(pricings, function(pricing) { return pricing.pricingTypeID(); }, defaultTypeIDs);

        return Object.keys(pricingsByTypeID).map(function(pricingTypeID) {
                var pricings = pricingsByTypeID[pricingTypeID],
                    pricingType = pricingTypesByID[pricingTypeID];

                return service(pricingType, pricings);
        });
    },

    sortServicesByPricings : function(a, b) {
      return b.pricings.length - a.pricings.length;
    }
};

module.exports = GroupedServicesPresenter;

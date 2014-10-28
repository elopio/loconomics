﻿/* Author: Loconomics */
// OUR namespace (abbreviated Loconomics)
var LC = window['LC'] || {};

function bookingChangeLocation() {
    var sel = $(this);
    // :hidden selectors is a hack because jQuery doesn't
    // hide elements that are inside a hidden parent.
    if (sel.val() == "0") {
        sel.siblings('.enter-new-location').slideDown('fast');
    } else {
        sel.siblings('.enter-new-location, .enter-new-location:hidden').slideUp('fast');
    }
}
/* DEPRECATED: use LC.timeSpan defined at script.js, ever available */
function lcTime (hour, minute, second) {
    this.hour = Math.floor(parseFloat(hour || 0));
    this.minute = Math.floor(parseFloat(minute || 0));
    this.second = Math.floor(parseFloat(second || 0));

    this.toString = function () {
        var h = this.hour.toString();
        if (h.length == 1)
            h = '0' + h;
        var m = this.minute.toString();
        if (m.length == 1)
            m = '0' + m;
        var s = this.second.toString();
        if (s.length == 1)
            s = '0' + s;
        return h + lcTime.delimiter + m + lcTime.delimiter + s;
    };
    /* Print only hours and minutes in the common time of the day format
        (AM/PM in US, 24h on ES)
       TODO: Needs migration to LC.timeSpan
    */
    this.toDayTimeString = function () {
        switch ($('html').attr('lang')) {
            case 'es':
                var h = this.hour.toString();
                if (h.length == 1)
                    h = '0' + h;
                var m = this.minute.toString();
                if (m.length == 1)
                    m = '0' + m;
                return h + lcTime.delimiter + m;
            case 'en':
            default:
                var h = this.hour.toString();
                var sufix = ' AM';
                if (h >= 12 && h < 24)
                    sufix = ' PM';
                if (h > 12)
                    h = h % 12;
                if (h == 0)
                    h = 12;
                var m = this.minute.toString();
                if (m.length == 1)
                    m = '0' + m;
                return h + lcTime.delimiter + m + sufix;
        }
    };
    /* TODO: Needs migration to LC.timeSpan
    */
    this.addHours = function (hours) {
        this.addMinutes(hours * 60);
        return this;
    };
    /* TODO: Needs migration to LC.timeSpan
    */
    this.addMinutes = function (minutes) {
        var m = this.hour * 60 + this.minute;
        var ntime = minutes + m;
        this.hour = Math.floor(ntime / 60);
        this.minute = ntime % 60;
        return this;
    };
};
// For spanish and english works good ':' as delimiter
lcTime.delimiter = ':';
lcTime.parse = function (strtime) {
    strtime = (strtime || '').split(this.delimiter);
    if (strtime.length > 1) {
        return new lcTime(strtime[0], strtime[1], (strtime.length > 2 ? strtime[2] : 0));
    }
    return null;
};

LC.showDateHours = function (date) {
    // Load date hours:
    var $day = $('#dayHoursSelector');
    var strdate = LC.dateToInterchangleString(date);
    var minutes = $day.data('duration-minutes');
    var userid = $day.data('user-id');
    var isInstantBooking = $day.is('.is-instantBooking');
    $day.reload({
        url: LcUrl.LangPath + "Booking/$ScheduleCalendarElements/DayHoursSelector/" +
            encodeURIComponent(strdate) + '/' + minutes + '/' + userid + '/' +
            '?instantBooking=' + isInstantBooking,
        complete: LC.markSelectedDates,
        autofocus: false
    });
    $day.data('date', date);
};
LC.showWeek = function (date) {
    var $week = $('#weekDaySelector');

    if (/(previous|next)/.test(date.toString())) {
        var x = date;
        date = new Date($week.data('date'));
        if (/previous/.test(x))
            date.setDate(date.getDate() - 7);
        else if (/next/.test(x))
            date.setDate(date.getDate() + 7);
    }

    var strdate = LC.dateToInterchangleString(date);
    $week.reload({
        url: LcUrl.LangPath + "Booking/$ScheduleCalendarElements/WeekDaySelector/" +
            encodeURIComponent(strdate) + '/',
        complete: function () { LC.selectWeekDay(date); LC.showDateHours(date); },
        autofocus: false 
    });
    $week.data('date', date);
};
LC.selectWeekDay = function (date) {
    var $week = $('#weekDaySelector');
    // Mark selected day in calendar
    $week.find('.day-selection-action').removeClass('current')
    .filter(function () {
        var elDate = new Date($(this).data('date'));
        return (elDate.toDateString() == date.toDateString());
    }).addClass('current');
};
LC.setupScheduleCalendar = function () {

    function selectTime() {
        var $s = $(this),
            $c = $s.closest('#dayHoursSelector'),
            instantBooking = $c.is('.is-instantBooking');

        var v;

        if (instantBooking) {
            // Toggle button status
            function toggleInstantSelector($is, pressed) {
                if (pressed) {
                    $is
                    .removeClass('is-btn-pressed')
                    .addClass('is-btn-unpressed')
                    .text($is.data('btn-unpressed'));
                }
                else {
                    $is
                    .removeClass('is-btn-unpressed')
                    .addClass('is-btn-pressed')
                    .text($is.data('btn-pressed'));
                }
            }

            if ($s.is('.is-btn-pressed')) {

                // DISABLED by: Dont' allow to de-select the option
                // (Is a required option, and the de-selection
                // doesn't really de-selects the value right now)
                //toggleInstantSelector($s, true);

                v = '';
            }
            else {

                toggleInstantSelector($s, false);

                $s.closest('tr').siblings().find('.instant-selector')
                .each(function () { toggleInstantSelector($(this), true); });

                v = 'instant';
            }
        }
        else {
            v = $s.val();
        }

        if (v) {
            // Get row date and time
            var $row = $s.closest('tr');
            var $table = $row.closest('table');
            var start = $row.find('.start').text();
            var end = $row.find('.end').text();
            var date = new Date($table.data('date'));
            var dateshowed = $table.find('caption').text();

            // Get choice
            var choice = $s.closest('form').find('.selected-schedule').find('.' + v + '-choice');

            // Show date and time
            choice.addClass('has-values');
            choice.find('span.date-showed').text(dateshowed);
            choice.find('span.start-time').text(start);
            choice.find('span.end-time').text(end);
            choice.find('input.date').val(LC.dateToInterchangleString(date));
            choice.find('input.start-time').val(start);

            // Others Select with this same option selected must be reset:
            $s.closest('tr').siblings().find('option[value=' + v + ']:selected').closest('select').val('');
        }
    }

    var $scheduleStep = $('#booking-schedule')
    .on('click', '#weekDaySelector .week-slider', function () {

        LC.showWeek(this.getAttribute('href').substring(1));

        return false;
    })
    .on('click', '#weekDaySelector .day-selection-action', function () {
        var date = new Date($(this).data('date'));

        LC.showDateHours(date);
        LC.selectWeekDay(date);

        return false;
    })
    .on('change', '#dayHoursSelector select.choice-selector', selectTime)
    .on('click', '#dayHoursSelector .instant-selector', selectTime)
    .on('click', '.unselect-action', function () {
        // Remove values from view-selection panel and form
        $(this).siblings('span').text('')
        .closest('.has-values').removeClass('has-values')
        .find('input').val('');
        // Remove selection from day-hours panel
        var v = $(this).closest('.choice').data('choice');
        $('#dayHoursSelector').find('.selector option[value=' + v + ']').prop('selected', false);
        return false;
    });

    // Select current day in week selector
    LC.selectWeekDay(new Date($('#dayHoursSelector').data('date')));
};
LC.getSelectedDates = function (filterDate) {
    var selected = { first: 0, second: 0, third: 0 };
    for (var v in selected) {
        var choice = $('.selected-schedule').find('.' + v + '-choice');
        var d = choice.find('input.date').val();
        var t = choice.find('input.start-time').val();
        if (filterDate == d)
            selected[v] = { Date: d, Time: t };
    }
    return selected;
};
LC.markSelectedDates = function () {
    var $day = $('#dayHoursSelector');
    var selected = LC.getSelectedDates(LC.dateToInterchangleString(new Date($day.data('date'))));
    $day.find('tr > .start').each(function () {
        for (var v in selected)
            if (selected[v] && $(this).text() == selected[v].Time)
                $(this).siblings('.selector').find('option[value=' + v + ']').prop('selected', true);
    });
};
LC.setupServiceMap = function () {
    LC.mapReady(function () {
        $('.serviceRadiusMap').each(function () {
            var m = $(this);
            var radius = m.data('service-radius');
            var latlng = new google.maps.LatLng(parseFloat(m.data('latitude')), parseFloat(m.data('longitude')));
            var zoom = m.data('map-zoom-level') || 13;
            //latlng = new google.maps.LatLng(37.75334439226298, -122.4254606035156);
            var mapOptions = {
                zoom: zoom,
                center: latlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }
            var map = new google.maps.Map(m.get(0), mapOptions);
            var radiusUnit = LC.distanceUnits[LC.getCurrentCulture().country];
            var circle = new google.maps.Circle({
                center: latlng,
                map: map,
                clickable: false,
                radius: (radiusUnit == 'miles' ? convertMilesKm(radius, radiusUnit) : radius) * 1000, // in meters
                fillColor: '#00989A',
                fillOpacity: .3,
                strokeWeight: 0
            });
        });
    });
};

LC.setupLocations = function LC_setupLocations() {
    var applying = false;
    $('[name=selected-provider-location],[name=select-location]').on('change', function () {
        if (applying) return;
        applying = true;
        if ($(this).attr('name') == 'select-location') {
            $('[name=selected-provider-location]').prop('checked', false).trigger('change');
        } else {
            $('[name=select-location]').prop('selectedIndex', 0).trigger('change');
        }
        applying = false;
    });
};

LC.initScheduleStep = function () {
    var tab = $('#schedule');

    // Execute first time when showing the step
    $.proxy(bookingChangeLocation, $('.select-location'))();
    $('.select-location').change(bookingChangeLocation);

    applyDatePicker(tab);

    // Read current hidden date to be set in show date (previous apply datepicker options)
    var date = $('#hideDate').val();

    $("#showDate")
    .datepicker('setDate', date)
    .datepicker('option', 'dateFormat', 'DD, M d, yy')
    .datepicker('option', 'altField', $('#hideDate'))
    .datepicker('option', 'altFormat', $.datepicker._defaults.dateFormat)
    .datepicker('option', 'numberOfMonths', 2)
    .datepicker('option', 'onSelect', function () {
        // Hour is added with GMT (+0000) to avoid problems on getting date because by
        // default javascript adds the local time zone
        var date = new Date($('#hideDate').val() + ' 00:00:00 GMT');
        LC.showDateHours(date);
        LC.showWeek(date);
    });

    LC.setupLocations();

    LC.setupScheduleCalendar();

    LC.setupServiceMap();
};
// Sliders on Housekeeper price:
LC.initCustomerPackageSliders = function () {
    /** Setups for different 'special type' sliders (stype)
    **/
    var stypes = {};
    /** Houseekeeper pricing
    **/
    stypes['housekeeper'] = {
        calculate: function housekeeper_calculate($sliderContent) {
            // Look for the housekeeper pricing container for this package
            // that contains all fields for calculation
            var calcContext = $sliderContent.closest('.housekeeper-pricing');
            // Get the package container, where contents to be update are
            var pak = calcContext.closest('tr');
            // Calculation formula for housekeeper pricing
            var formula = function (numbedrooms, numbathrooms) {
                var formulaA = parseFloat(calcContext.data('formula-a')),
                    formulaB = parseFloat(calcContext.data('formula-b')),
                    formulaC = parseFloat(calcContext.data('formula-c')),
                    rate = parseFloat(calcContext.data('provider-rate'));
                // It returns a time in float minutes
                return (formulaA * numbedrooms + formulaB * numbathrooms + formulaC) * rate;
            };

            // Getting var-values from form and calculating
            var numbedrooms = calcContext.find('.housekeeper-pricing-bedrooms input').val(),
                numbathrooms = calcContext.find('.housekeeper-pricing-bathrooms input').val();
            // ...Gets duration rounded up to quarter-hours.
            var duration = LC.roundTimeToQuarterHour(
            // ..create a time object..
                LC.timeSpan.fromMinutes(
            // Computes formula with customer values...
                    formula(numbedrooms, numbathrooms)
                )
            , LC.roundingTypeEnum.Up);

            // Recalculating price with new time, using the package hourly-rate
            var hourlyRate = parseFloat(calcContext.data('hourly-rate'));
            var hourlyFee = parseFloat(calcContext.data('hourly-fee'));
            // Calculate the price for the total time,
            // with the hourleRate (already with fees), hourlyFeeAmount
            // and the already rounded duration:
            var totalTimePrice = LC.calculateHourlyPrice(duration, { totalPrice: hourlyRate, feePrice: hourlyFee, basePrice: hourlyRate - hourlyFee });
            // Update front-end
            updateFrontendPackageDetails(pak, totalTimePrice, duration);
        },
        setup: function housekeeper_setup(setup, $c) {
            setup.min = setup.value - 3 * setup.step;
            setup.max = setup.value + 3 * setup.step;
        }
    };
    /** Hourly pricing
    **/
    stypes['hourly'] = {
        calculate: function hourly_calculate($sliderContent) {
            // Look for the hourly pricing container for this package
            // that contains all fields for calculation
            var calcContext = $sliderContent.closest('.hourly-pricing');
            // Get the package container, where contents to be update are
            var pak = calcContext.closest('tr');

            // Initializing global computation values
            var hourlySurcharge = 0,
                hourlyRate = 0,
                timeDuration = LC.timeSpan.zero,
                fee = {
                    feeRate: parseFloat(calcContext.data('fee-rate'))
                    , fixedFeeAmount: parseFloat(calcContext.data('fixed-fee-amount'))
                };

            // Iterate every variable to calculate
            calcContext.find('.customer-slider, .customer-list').each(function () {
                // Get the values to compute
                var $t = $(this),
                    $input = $t.find($t.hasClass('customer-list') ? 'select' : 'input'),
                    custValue = $input.val(),
                    provValue = parseFloat($t.data('prov-value')),
                    numberIncluded = parseFloat($t.data('slider-number-included')) || 0;

                // Compute depending on the variable
                if (/^Hours\[\d+\]$/.test($input.attr('name'))) {
                    // Its 'Hours' variable, get as duration
                    timeDuration = LC.roundTimeToQuarterHour(LC.timeSpan.fromHours(custValue), LC.roundingTypeEnum.Up);
                    // And save the hourly-rate for last calculations (is the provider-value at 'Hours')
                    hourlyRate = provValue;
                } else {
                    // For other variables, we calculate it using the general formula and its added to the hourly surcharge.
                    // General formula for 1 hour: (CustomerValueInputVariable - ProviderNumberIncludedVariable) * ProviderPriceVariable
                    // EXCEPT when CustomerValueInputVariable is equal or less than ProviderNumberIncludedVariable, then is 0
                    if (custValue > numberIncluded)
                        hourlySurcharge += (custValue - numberIncluded) * provValue;
                }
            });

            // Doing last calculations: get final price with fees
            var hourlyPrice = new LC.Price(hourlyRate || 0, fee, 1),
                hourlySurchargePrice = new LC.Price(hourlySurcharge || 0, fee, 1),
                totalTimePrice = LC.calculateHourlyPrice(timeDuration, hourlyPrice, hourlySurchargePrice);

            // Update front-end
            updateFrontendPackageDetails(pak, totalTimePrice, timeDuration);
        },
        setup: function hourly_setup(setup, $c) {
            setup.min = $c.data('slider-min') || 0;
            setup.max = $c.data('slider-max') || 20;
        }
    };
    /* Some utilities */
    /** Update the internal form @value for the given slider variable container at $c
    **/
    function updateBackendValue($c, value) {
        // Update input value and trigger change event to notify standard listeners
        $c.find('input').val(value).change();
    }
    /** Update the showed prices for a package, from a calculated fees LC.Price object @price,
    **  launching the total booking pricing update too, and the duration as a LC.TimeSpan object.
    **/
    function updateFrontendPackageDetails($pak, price, duration) {
        // Set new item-price and trigger a change event to allow the items-fees calculation
        // system do their job and showing the total price
        LC.setMoneyNumber(price.totalPrice, $pak.find('.calculate-item-price'));
        LC.setMoneyNumber(price.feePrice, $pak.find('.calculate-item-fee'));
        $pak.find('.calculate-item-price').trigger('change');
        // Duration showed in the 'smart' way
        $pak.find('.package-duration').text(duration.toSmartString());
    }
    /** Initializing sliders
    **/
    $(".customer-slider").each(function () {
        var $c = $(this).addClass('ui-slider-container');
        // Creating sliders
        var initial_value = $c.data('slider-value'),
            step = $c.data('slider-step') || 1,
            stype = $c.data('slider-stype'),
            footnote = $c.data('slider-footnote');
        if (initial_value === undefined || stype === undefined || !(stype in stypes)) return;
        stype = stypes[stype];
        var slider = $('<div class="slider"/>').appendTo($c).data($c.data());
        // Basic setup
        var setup = {
            range: "min",
            value: initial_value,
            step: step,
            change: function (event, ui) {
                updateBackendValue($c, ui.value);
            }
        };
        // Specific setup
        stype.setup(setup, $c);
        // Creating slider
        slider.slider(setup);
        if (footnote)
            slider.after($('<div class="ui-slider-footnote"/>').html(footnote));
        LC.createLabelsForUISlider(slider);
        if (slider.is(':visible'))
            LC.updateLabelsForUISlider(slider);
        // Setup the input field, hidden and with initial value synchronized with slider
        var field = $c.find('input');
        field.hide();
        var currentValue = field.val() || initial_value;
        updateBackendValue($c, currentValue);
        slider.slider('value', currentValue);

        // Perform calculation of time-prices for the package on
        // init and on variables changes
        stype.calculate($c);
        $c.on('change', 'input', function () { stype.calculate($c) });
    });
    /** Allowing select lists, integrated with sliders logic:
    **/
    $(".customer-list").each(function () {
        var $c = $(this),
            stype = $c.data('slider-stype'),
            footnote = $c.data('slider-footnote');
        if (!(stype in stypes)) return;
        stype = stypes[stype];
        $('<div class="list-footnote"/>').text(footnote).appendTo($c);
        // Calculate on init and on changes
        stype.calculate($c);
        $c.on('change', 'select', function () { stype.calculate($c) });
    });
    // Switching sliders visualization on active package
    var radios = $('.pricing-wizard .packages-list .package-extra-data').closest('tr').find('input[name="provider-package"]');
    radios.change(function () {
        var $t = $(this),
            row = $t.closest('tr');
        if ($t.is(':checked')) {
            row.find('.package-extra-data').slideDown('fast').find('.customer-slider .slider').each(function () {
                LC.updateLabelsForUISlider($(this));
            });
            // Execute change on unchecked elements (only from checked to avoid infinite loops)
            $('[name="' + $t.attr('name') + '"]:not(:checked)').change();
            // Mark with a class
            $t.closest('tr').removeClass('hide-calculations');
        } else {
            row.find('.package-extra-data').slideUp('fast');
            // Unmark the class
            $t.closest('tr').addClass('hide-calculations');
        }
    });
    // Initializing radio-switchers for active package. Because the checked one already triggers 'change' on
    // others, we trigger it only on the checked one or all if there is no one checked
    var checkedRadio = radios.filter(':checked');
    (checkedRadio.length > 0 ? checkedRadio : radios).change();
};

/** Quick view handler for packages
 **/
LC.packageQuickView = function LC_packageQuickView(id) {
    if (typeof (id) != 'number')
        id = parseInt($(this).closest('[data-package-id]').data('package-id'));
    if (!id || id == Number.NaN)
        return;
    // Open popup with ajax-loaded package information
    popup({
        url: LcUrl.LangPath + 'PricingWizard/$PackageView/?PackageID=' + id,
        size: { width: 660, height: 150 },
        closable: { onLoad: true },
        autoSize: true,
        autoFocus: false,
        containerClass: 'view-panel quick-view booking-quick-view',
        complete: function () {
            this.container.find('.provider-package-price').each(function () {
                var $t = $(this);
                $t
                .children().removeClass('actions book')
                .children().attr('href', null)
                .removeClass('button book-action main-action')
                .find('.book-now-label').remove();
            });
        }
    });
    return false;
};

LC.initCreditCardEdition = function LC_initCreditCardEdition($c) {
    if ($c.find('.saved-cards').length == 0)
    // There are not saved cards
        return;
    // Duration is 0 for first animation
    var anim_duration = 0;
    var $edit = $c.find('.edit-card');
    var $update = $c.find('[name=update-credit-card]');
    function updateUpdateFlagWith($card) {

        var cardVal = $card.find('[name=credit-card]').val();

        var flag =
            $card.find('.update-credit-card').hasClass('cancel-update')
            ||
            cardVal == '';

        if (flag) {
            $update.val('true');
            $edit
            .slideDown(anim_duration);
        } else {
            $update.val('false');
            $edit
            .slideUp(anim_duration)
            .addClass('updating-card');
        }

        if (cardVal == '') {
            $edit.removeClass('updating-card');
        } else {
            $edit.addClass('updating-card');
        }
    }

    $c.find('[name=credit-card]').on('change', function () {
        var $t = $(this);
        updateUpdateFlagWith($t.closest('.card'));
    });
    $c.find('.update-credit-card').on('click', function () {
        var $t = $(this);
        $t.toggleClass('cancel-update');
        var $card = $t.closest('.card');
        $card.find('input').prop('checked', true);
        updateUpdateFlagWith($card);
        return false;
    });

    // First update on load
    var preCheckedCard = $c.find('[name=credit-card]:checked');
    if (!preCheckedCard.length) preCheckedCard = $c.find('[name=credit-card][value=""]');
    if (preCheckedCard.length) {
        if (/true/i.test($update.val()))
            preCheckedCard.closest('.card').find('.update-credit-card').addClass('cancel-update');
        preCheckedCard.trigger('change');
    }
    // Normal animation duration
    anim_duration = 400;
};

LC.initPaymentAddress = function LC_initPaymentAddress($c) {
    var working = false;
    var $use = $c.find('[name=use-scheduled-address]').on('change', function () {
        working = true;
        var $t = $(this),
            $copy = $t.closest('.copy-address');
        if ($t.is(':checked')) {
            $c.find('[name=street-address-line-1]').val($copy.data('address-line1')).trigger('change');
            $c.find('[name=street-address-line-2]').val($copy.data('address-line2')).trigger('change');
            $c.find('[name=city]').val($copy.data('address-city')).trigger('change');
            $c.find('[name=state]').val($copy.data('address-stateprovinceid')).trigger('change');
            $c.find('[name=zip]').val($copy.data('address-postalcode')).trigger('change');
        }
        working = false;
    }).trigger('change');
    // On any address field change -except from the copy-, uncheck
    $c.find('.is-addressField').on('change', function () {
        if (!working)
            $use.prop('checked', false);
    });
};

$(document).ready(function () {
    LC.initCustomerPackageSliders();

    // Setup package quick view
    $('body').on('click', '.packages-list .quick-view', LC.packageQuickView);

    // Init the generation of detailed pricing summary
    LC.setupUpdateDetailedPricingSummary();

    // Setup Schedule step:
    $('#schedule').on('endLoadWizardStep', function (e, $button) {
        // Getting the tab content for payment that is not loaded at the start
        var tab = $('#schedule');

        // Loading, with retard
        var loadingtimer = setTimeout(function () {
            var loadingMsg = $button.data('loading-message');
            var blockOpts = $.extend({}, loadingBlock, {
                message: loadingMsg ? loadingBlock.message + '<br/><br/><strong>' + loadingMsg + '</strong><br/><br/>' : loadingBlock.message
            });
            tab.block(blockOpts);
        }, gLoadingRetard);

        $.ajax({
            // Request $Payment partial page, with all the original url parameters
            url: LcUrl.LangPath + "Booking/$Schedule/" + location.search,
            type: 'GET',
            success: function (data, text, jx) {
                // load tab content
                tab.html(data);

                LC.initScheduleStep();
            },
            error: ajaxErrorPopupHandler,
            complete: function () {
                // Disable loading
                clearTimeout(loadingtimer);
                // Unblock
                tab.unblock();
            }
        });
    }).on('reloadedHtmlWizardStep', function () {
        LC.initScheduleStep();
    });

    // Load payment content on step change:
    $('#payment').bind('endLoadWizardStep', function () {
        // Getting the tab content for payment that is not loaded at the start
        var paymentTab = $('#payment');

        // Loading, with retard
        var loadingtimer = setTimeout(function () {
            paymentTab.block(loadingBlock);
        }, gLoadingRetard);

        $.ajax({
            // Request $Payment partial page, with all the original url parameters
            url: LcUrl.LangPath + "Booking/$Payment/" + location.search,
            type: 'GET',
            success: function (data, text, jx) {
                // load tab content
                paymentTab.html(data);
                LC.initCreditCardEdition(paymentTab);
                LC.initPaymentAddress(paymentTab);
            },
            error: ajaxErrorPopupHandler,
            complete: function () {
                // Disable loading
                clearTimeout(loadingtimer);
                // Unblock
                paymentTab.unblock();
            }
        });
    });
});
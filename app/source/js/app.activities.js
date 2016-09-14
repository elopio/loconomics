/**
    List of activities loaded in the App,
    as an object with the activity name as the key
    and the controller as value.
**/
'use strict';

var Activity = require('./components/Activity');
var EmptyActivity = Activity.extend(function EmptyActivity() {

    Activity.apply(this, arguments);

    this.accessLevel = null;
    this.viewModel = {};
    this.navBar = Activity.createSectionNavBar();
});

module.exports = {
    '_test': EmptyActivity,
    'downloadApp': require('./activities/downloadApp'),
    'calendar': require('./activities/calendar'),
    'datetimePicker': require('./activities/datetimePicker'),
    'clients': require('./activities/clients'),
    'serviceProfessionalService': require('./activities/serviceProfessionalService'),
    'serviceAddresses': require('./activities/serviceAddresses'),
    'dashboard': require('./activities/dashboard'),
    'appointment': require('./activities/appointment'),
    'login': require('./activities/login'),
    'logout': require('./activities/logout'),
    'signup': require('./activities/signup'),
    'contactInfo': require('./activities/contactInfo'),
    'welcome': require('./activities/welcome'),
    'addressEditor': require('./activities/addressEditor'),
    'account': require('./activities/account'),
    'inbox': require('./activities/inbox'),
    'conversation': require('./activities/conversation'),
    'scheduling': require('./activities/scheduling'),
    'jobtitles': require('./activities/jobtitles'),
    'help': require('./activities/help'),
    'feedbackForm': require('./activities/feedbackForm'),
    'contactForm': require('./activities/contactForm'),
    'cms': require('./activities/cms'),
    'clientEditor': require('./activities/clientEditor'),
    'schedulingPreferences': require('./activities/schedulingPreferences'),
    'calendarSyncing': require('./activities/calendarSyncing'),
    'weeklySchedule': require('./activities/weeklySchedule'),
    'bookMeButton': require('./activities/bookMeButton'),
    'ownerInfo': require('./activities/ownerInfo'),
    'privacySettings': require('./activities/privacySettings'),
    'addJobTitles': require('./activities/addJobTitles'),
    'serviceProfessionalServiceEditor': require('./activities/serviceProfessionalServiceEditor'),
    'marketplaceProfile': require('./activities/marketplaceProfile'),
    'marketplaceJobtitles': require('./activities/marketplaceJobtitles'),
    'profilePictureBio': require('./activities/profilePictureBio'),
    'servicesOverview': require('./activities/servicesOverview'),
    'verifications': require('./activities/verifications'),
    'education': require('./activities/education'),
    'serviceProfessionalWebsite': require('./activities/serviceProfessionalWebsite'),
    'backgroundCheck': require('./activities/backgroundCheck'),
    'educationForm': require('./activities/educationForm'),
    'cancellationPolicy': require('./activities/cancellationPolicy'),
    'licensesCertifications': require('./activities/licensesCertifications'),
    'licensesCertificationsForm': require('./activities/licensesCertificationsForm'),
    'workPhotos': require('./activities/workPhotos'),
    'profile': require('./activities/profile'),
    'home': require('./activities/home'),
    'learnMoreProfessionals': require('./activities/learnMoreProfessionals'),
    'booking': require('./activities/booking'),
    'terms': require('./activities/terms'),
    'about': require('./activities/about'),
    'payments': require('./activities/payments'),
    'userFees': require('./activities/userFees'),
    'performance': require('./activities/performance'),
    'searchJobTitle': require('./activities/searchJobTitle'),
    'searchCategory': require('./activities/searchCategory'),
    'serviceProfessionalProfileUrl': require('./activities/serviceProfessionalProfileUrl'),
    'boardMemberNominations': require('./activities/boardMemberNominations'),
    'paymentAccount': require('./activities/paymentAccount'),
    'myAppointments': require('./activities/myAppointments'),
    'clientAppointment': require('./activities/clientAppointment'),
    'viewBooking': require('./activities/viewBooking'),
    'blog': require('./activities/blog'),
    'instantBooking': require('./activities/instantBooking'),
    'ownerPerks': require('./activities/ownerPerks'),
    'cancellationPolicies': require('./activities/cancellationPolicies'),
    'mockupHouseCleanerServiceEditor': require('./activities/mockupHouseCleanerServiceEditor'),
    'mockupDogWalkerServiceEditor': require('./activities/mockupDogWalkerServiceEditor'),
    'mockupBabySitterServiceEditor': require('./activities/mockupBabySitterServiceEditor'),
    'mockupRateEditor': require('./activities/mockupRateEditor'),
    'mockupServiceConsultationEditor': require('./activities/mockupServiceConsultationEditor'),
    'mockupServiceEditor': require('./activities/mockupServiceEditor'),
    'mockupPackageEditor': require('./activities/mockupPackageEditor'),
    'mockupPackageMultiClientServiceEditor': require('./activities/mockupPackageMultiClientServiceEditor'),
    'mockupRollingMultiClientServiceEditor': require('./activities/mockupRollingMultiClientServiceEditor'),
    'mockupContractServiceEditor': require('./activities/mockupContractServiceEditor')
};

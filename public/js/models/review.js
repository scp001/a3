'use strict';

var splat =  splat || {};

splat.Review = Backbone.Model.extend({

  idAttribute: "_id",	// to match Mongo, which uses _id rather than id

  initialize: function() {
        this.validators = {};

        this.validators.reviewname = function(value) {
            return (value && value.length > 0) ?
		{isValid: true}
		: {isValid: false, message: "reviewer's name required"};
        };

        this.validators.reviewaffil = function(value) {
            return (value && value.length > 0) ?
		{isValid: true}
		: {isValid: false, message: "reviewer's affiliation required"};
        };

        this.validators.reviewtext = function(value) {
            return (value && value.length > 0) ?
		{isValid: true}
		: {isValid: false, message: "You must enter some review text"};
        };

    },

    validateItem: function (key) {
        return (this.validators[key]) ?
		this.validators[key](this.get(key)) : {isValid: true};
    },

    validateAll: function () {

        var messages = {};

        for (var key in this.validators) {
            if (this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ?
		{isValid: false, messages: messages} : {isValid: true};

    },

    defaults: {
        freshness: 1.0,
        reviewtext: "",
        reviewname: "",
        reviewaffil: "",
        movieid: null
   }

});

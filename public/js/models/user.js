'use strict';

var splat =  splat || {};

splat.User = Backbone.Model.extend({

    urlRoot: "/user", 

    idAttribute: "_id",   // to match mongo, which uses _id rather than id

    initialize: function() {

        this.validators = {};

        this.validators.username = function (value) {
            return value && value.length > 0 ? {isValid: true} :
		{isValid: false, message: "username required"};
        };

        this.validators.email = function (value) {
            return value && value.length > 0 ? {isValid: true} :
		{isValid: false, message: "email required"};
        };

        this.validators.password = function (value) {
            return (value && value.length > 0) ? {isValid: true} :
		{isValid: false, message: "password required"};
        };

        this.validators.password2 = function (value) {
            return (value && value.length > 0) ?  {isValid: true} :
		{isValid: false, message: "password required"};
        };
    },

    validateItem: function(key) {
        return (this.validators[key]) ? this.validators[key](this.get(key)) :
		{isValid: true};
    },

    validateAll: function() {

        var messages = {};

        for (var key in this.validators) {
            if(this.validators.hasOwnProperty(key)) {
                var check = this.validators[key](this.get(key));
                if (check.isValid === false) {
                    messages[key] = check.message;
                }
            }
        }

        return _.size(messages) > 0 ? {isValid: false, messages: messages} :
		{isValid: true};
    }

});

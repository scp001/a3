"use strict";

var splat =  splat || {};

splat.Signup = Backbone.View.extend({

    el: '<form id="signupForm" accept-charset="UTF-8">',

    events: {
        "change .signup" : "change",
        "click .signupSubmit": "signup"
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    /**
      * @param {Event} e   the change event
      */
    change: function (e) {
        var self = this;
        // Remove any existing alert messages
	splat.utils.hideAlert();
	if (!this.model) {
	    // create User model to hold auth credentials
            this.model = new splat.User();
	}
        var change = {};

        // Apply change to the model;
        // change is triggered once for each changed field-value
        change[e.target.name] = (e.target.value);
        // reflect changes in the model
        this.model.set(change);
        // Run validation rule (if any) on changed item.  Special-case password
        // fields, since there is just one password in the model.  Have the
        // model validate that field, but have the view verify that the 2
        // password fields are the same.
	var check;
        if (e.target.name === 'password' || e.target.name === 'password2') {
            if (self.$('#signup_password').val() !== self.$('#signup_password2').val()) {
                check = {isValid: false, message: "Password values must match"};
            } else {
                check = this.model.validateItem(e.target.name);
                splat.utils.removeValidationError('password');
                splat.utils.removeValidationError('password2');
            }
        } else {
            check = this.model.validateItem(e.target.name);
	}
        check.isValid ?
              splat.utils.removeValidationError(e.target.name)
            : splat.utils.addValidationError(e.target.name, check.message);
    },

    signup: function(e) {
        e.preventDefault();

	var self = this;
        var check = self.model.validateAll();
        if (check.isValid === false) {
            splat.utils.displayValidationErrors(check.messages);
            return false;
        };

	this.model.save(null, {
            wait: true,
            success: function(model, response) {
		if (response.error) {
                    splat.utils.showAlert('Signup Failed',
			'Failed to create account', 'alert-danger');
		} else {
		    splat.token = response.token;
                    splat.userid = response.userid;
                    splat.username = response.username;
                    splat.utils.showAlert('Signup Successful!',
			'Welcome ' + splat.username, 'alert-success');
		    // header view updates when signedUp event fires
		    Backbone.trigger('signedUp', response);
		}
            },
            error: function (model, err) {
                splat.utils.showAlert('Error', err.responseText, 'alert-danger');
            }
	});
    }

});

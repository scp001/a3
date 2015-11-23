"use strict";

var splat =  splat || {};

splat.Signin = Backbone.View.extend({

    el: '<form id="signinForm" accept-charset="UTF-8">',

    events: {
        "change .signinput" : "change",
        "click .signinSubmit": "signin",
        "click .signoutSubmit": "signout"
    },

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    /**
      * @param {Event} e   the change event
      */
    change: function (e) {
        // Remove any existing alert messages
        splat.utils.hideAlert();
        if (!this.model) {
            // create model to hold auth credentials
            this.model = new splat.User();
	}
        var change = {};

        // Apply change to the model;
        // change is triggered once for each changed field-value
        change[e.target.name] = (e.target.value);
        // reflect changes in the model
        this.model.set(change);
        var check = this.model.validateItem(e.target.name);
        check.isValid ?
              splat.utils.removeValidationError(e.target.name)
            : splat.utils.addValidationError(e.target.name, check.message);
    },

    signin: function(e) {
        e.preventDefault();
	var self = this;
        var checku = self.model.validateItem('username');
        checku.isValid ?
              splat.utils.removeValidationError('username')
            : splat.utils.addValidationError('username', checku.message);
        var checkp = self.model.validateItem('password');
        checkp.isValid ?
              splat.utils.removeValidationError('password')
            : splat.utils.addValidationError('password', checkp.message);

	if (! (checku.isValid && checkp.isValid)) {
	    return false;
	}
	this.model.set({login: 1});
	this.model.save(null, {
	    type: 'put',
            wait: true,
            success: function(model, response) {
		if (response.error) {
                    splat.utils.showAlert('Signin Failed',
			response.error, 'alert-danger');
		} else {
		    splat.token = response.token;
		    splat.userid = response.userid;
		    splat.username = response.username;
                    splat.utils.showAlert('Signin Successful!',
			'Welcome back ' + splat.username, 'alert-success');
		    Backbone.trigger('signedIn', response);
		}
            },
            error: function (model, err) {
                splat.utils.showAlert('Error', err.responseText, 'alert-danger');
            }
	});
    },

    signout: function(e){
	e.preventDefault();
	$('#logoutdrop').removeClass('open');
	this.model.set({login: 0, username:"", password:""});
	this.model.save(null, {
	    type: 'put',
	    success: function(model, response) {
                splat.token = response.token;
		splat.utils.showAlert('Signout Successful!',
			'Please Come Back Soon', 'alert-success');
		Backbone.trigger('signedOut', response);
	    },
            error: function (err) {
                splat.utils.showAlert('Error', err.responseText, 'alert-danger');
            }
        });
    },

});

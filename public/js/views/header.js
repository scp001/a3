/**
  * @author Alan Rosselet
  * @version 0.1
  */

// catch simple errors
"use strict";

// declare splat-app namespace if it doesn't already exist
var splat =  splat || {};

/**
  * @constructor HeaderView constructs the app header view
  */
splat.Header = Backbone.View.extend({

    initialize: function () {
        // update navbar in response to authentication events
        this.listenTo(Backbone, 'signedUp', this.signedUp);
        this.listenTo(Backbone, 'signedIn', this.signedIn);
        this.listenTo(Backbone, 'signedOut', this.signedOut);
    },

    events: {
        // trigger sortOrder function on change in sortOrder inputs
        "change input[name=sortOrder]":"sortOrder"
    },

    render: function() {
	// create DOM content for header
        this.$el.html(this.template()); 
       
	// create new User model for signup
        var newuser = new splat.User(); 

        this.signupform = new splat.Signup({ model:newuser });
        this.$('#signupDiv').append(this.signupform.render().el);

        this.signinform = new splat.Signin({ model:newuser });
        this.$('#signinDiv').append(this.signinform.render().el);

        return this;
    },

    // helper for signedUp, signedIn to update UI on successful authentication
    authenticatedUI: function(response) {
        $('#greet').html(response.username);  // ugly!
        $('#signoutUser').html('<b>'+response.username+'</b>');
        $('.btn.signinSubmit').css("display","none");
        $('.btn.signoutSubmit').css("display","block");
        $('#addMovie').show();  // auth'd users can add movies
    },

    // update UI on successful signup authentication
    signedUp: function(response) {
        $('#signupdrop').removeClass('open');
        $('.signinput').css("display","none");
        $('#signupForm')[0].reset();   // clear signup form
        this.authenticatedUI(response);
    },

    // update UI on successful signin authentication
    signedIn: function(response) {
        $('#signindrop').removeClass('open');
        $('[class*="signin"]').css("display","none");
        $('#signinForm')[0].reset();   // clear signin form
        this.authenticatedUI(response);
    },

    // update UI on authentication signout
    signedOut: function(model) {
        $('#greet').html('Sign In');
        $('#signoutUser').html('');
        $('.btn.signoutSubmit').css("display","none");
        $('.btn.signinSubmit').css("display","block");
        $('[class*="signin"]').css("display","block");
        $('#signindrop').removeClass('open');
        $('#addMovie').hide();  // non-auth'd users can't add movies
    },

    /**
      * @param {Event} e  the event that triggered the sort
      */
    // Set ordering on movies collection from Ordering input and
    // trigger an orderevent to cause the collection to re-render.
    // Close the ordering dropdown menu after re-ordering.
    sortOrder: function(event) {
        //e.preventDefault();
	event.stopPropagation();
        //var val = $('.sortOrder :selected').val();
        splat.order = event.target.value;
        Backbone.trigger('orderevent', event);
        $('#orderdrop').removeClass('open');
    },

    /**
      * @param {String} menuItem  highlights as active the header menuItem
      */
    // Set Bootstrap "active" class to visually highlight the active header item
    selectMenuItem: function (menuItem) {
        $('.nav li').removeClass('active');
        if (menuItem) {
            $('.' + menuItem).addClass('active');
        };
    }

});

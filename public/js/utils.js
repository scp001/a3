"use strict";

var splat = splat || {};

splat.utils = {

    // Asynchronously load templates located in separate .html files using
    // jQuery "deferred" mechanism, an implementation of Promises.  Note we
    // depend on template file names matching corresponding View file names,
    // e.g. HomeView.html and home.js which defines Backbone View HomeView.
    loadTemplates: function(views, callback) {

        var deferreds = [];

        $.each(views, function(index, view) {
            if (splat[view]) {  // splat[view] is defined as a Backbone View
                deferreds.push($.get('tpl/' + view + '.html', function(data) {
		    // splat[view].prototype.template is a template function
                    splat[view].prototype.template = _.template(data);
                }));
            } else {
		// if you see this alert when loading your app, it usually
		// means you've got a syntax error in the named Backbone View
                alert(view + " not found");
            }
        });
	// all the deferreds have completed, now invoke the callback (function)
        $.when.apply(null, deferreds).done(callback);
    },

    displayValidationErrors: function(messages) {
        for (var key in messages) {
            if (messages.hasOwnProperty(key)) {
                this.addValidationError(key, messages[key]);
            }
        }
	this.showAlert('Error!', 'Fix validation errors and try again',
                                                        'alert-danger');
    },

    addValidationError: function(field, message) {
        if (field === "synopsis") {
            var formGroup = $("textarea").parent();
        } else {
            var formGroup = $("input[name='" + field + "']").parent();
        };
        formGroup.addClass('has-error');  // was 'error' in Bootstrap 2
        $('.help-block', formGroup).html(message);
    },

    removeValidationError: function(field) {
        if (field === "synopsis") {
            var formGroup = $("textarea").parent();
        } else {
            var formGroup = $("input[name='" + field + "']").parent();
        };
        formGroup.removeClass('has-error');  // was 'error' in Bootstrap 2
        $('.help-block', formGroup).html('');
    },

    showAlert: function(title, text, klass) {
        $('.alert').removeClass("alert-danger alert-warning alert-success alert-info");
        $('.alert').addClass(klass);
        $('.alert').html('<strong>' + title + '</strong> ' + text);
        $('.alert').stop(true,true).show().fadeOut(5000);
    },

    hideAlert: function() {
        $('.alert').stop(true,true).hide();
    },

    // update header to reflect user's authentication state
    requestFailed: function(resp) {
	if (resp.responseText.indexOf('"status":403') > -1) {
            splat.utils.showAlert('Error',
		 'Please Sign-In to complete this action', 'alert-danger');
            $('#greet').html('Sign In');
            $('#logoutUser').html('');
            $('.btn.logout').css("display","none");
            $('.btn.login').css("display","block");
            $('[class*="signin"]').css("display","block");
            $('#logindrop').removeClass('open');
            $('#addMovie').hide();  // unauth'd users can't add movies
        } else {
	    splat.utils.showAlert('Error',  resp.responseText, 'alert-danger');
	}
    },

    // upload an image file using the HTML5 file API
    /**
     *  @param id   movie id the image is associated with
     *  @param userid  the userid who posted the movie model for this image
     *  @param file  the image data file in blob format
     *  @param callbackSuccess  on success, invoke this function
     */
    uploadFile: function (id, userid, file, callbackSuccess) {
        var self = this;
	// FormData is part of the HTML5 file API
        var data = new FormData();
        data.append('file', file);
        data.append('userid', userid);
        $.ajax({
            url: '/movies/' +id+ '/image',
            type: 'POST',
            data: data,
            processData: false,  // tell jQuery not to process the data
            cache: false,
	    /* tell jQuery to not add Content-Type header, else MIME
	     * multipart boundary string will be omitted */
            contentType: false 
        })
        .done(function (res) {
            callbackSuccess(res);
        })
        .fail(function (err) {
            self.showAlert('Error!', err.responseText, 'alert-danger');
        });
    }

};

'use strict';

var splat =  splat || {};

splat.Movie = Backbone.Model.extend({

    idAttribute: "_id",	// to match localStorage, which uses _id rather than id
  
    initialize: function() {
        // associate reviews-collection for this movie
	this.reviews = new splat.Reviews();
	this.reviews.url = '/movies/' + this.id + '/reviews';

	// model-validation code 
        this.validators = {};
	var titleDirector = /^([\ \,\.\?\-\'\*]*[a-zA-Z0-9]+[\ \,\.\?\-\'\*]*)+$/;
	var date = /^(19[1-9]\d)|(200\d)|(201[0-6])$/;
	var starringGenre = /^([\w\-\']+(\s[\w\-\']+)*)(,[\w\-\']+(\s[\w\-\']+)*)*$/;
	var rating = /^G|(PG)|(PG-13)|R|(NC-17)|(NR)$/;
	var duration = /^(\d)|(\d\d)|\d{3}$/;
	var synopsis = /^\w+(\s+\w+)*$/;  // OK to add other punctuation with \s
	var trailer = /^(https?:\/\/\w+(\.\w+)*(:\d+)?(\/[\w\.#]+)*\/?)?$/;

        this.validators.title = function (value) {
            return (value && titleDirector.test(value)) ?
		 {isValid: true}
		 : {isValid: false,
			message: 'Must be: one or more letters-digits-spaces'
				+ ' with one or more of " ,.?-\'*" '};
        };

        this.validators.released = function (value) {
            return (value && date.test(value)) ?
		{isValid: true}
		: {isValid: false,
		    message: "Release Date must be from 1910 to 2016 inclusive"};
        };

        this.validators.director = function (value) {
            return (value && titleDirector.test(value)) ?
		 {isValid: true}
		 : {isValid: false,
			message: 'Must be: one or more letters-digits-spaces'
				+ ' with one or more of " ,.?-\'*" '};
        };

        this.validators.rating = function (value) {
            return (value && rating.test(value)) ?
		{isValid: true}
		: {isValid: false,
		     message: "You must enter a valid MPAA rating, e.g. PG"};
        };

        this.validators.starring = function (value) {
            return (value && starringGenre.test(value)) ?
		{isValid: true}
		: {isValid: false,
		     message: "At least one star must be listed"};
        };

        this.validators.duration = function (value) {
            return (value && duration.test(value)) ?
		{isValid: true}
		: {isValid: false,
		     message: "Duration must be in the range 0 to 999"};
        };

        this.validators.genre = function (value) {
            return (value && starringGenre.test(value)) ?
		{isValid: true}
		: {isValid: false,
		     message: "You must enter at least one genre"};
        };

        this.validators.synopsis = function (value) {
            return (value && synopsis.test(value)) ?
		{isValid: true}
		: {isValid: false,
		    message: "Synopsis must consist of a non-empty word list"};
        };

        this.validators.trailer = function (value) {
            return (value === "" || trailer.test(value)) ?
		{isValid: true}
		: {isValid: false,
		    message: "Trailer must be empty or a valid URL"};
        };

    },

    validateItem: function (key) {
        return (this.validators[key]) ?
		this.validators[key](this.get(key))
		: {isValid: true};
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

        return _.size(messages) > 0 ? {isValid: false, messages: messages}
					: {isValid: true};

    },

    defaults: {
      title: "",
      released: null,
      director: "",
      starring: [],
      rating: "",
      duration: null,
      genre: "",
      synopsis: "",
      freshTotal: 0.0,
      freshVotes: 0.0,
      trailer: "",
      poster: "img/placeholder.png",
      dated: new Date()
   }

});

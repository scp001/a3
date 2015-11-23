"use strict";

var splat =  splat || {};

splat.MovieImg = Backbone.View.extend({

    initialize: function () {
        this.pictureFile = null;
    },

    events: {
        "change .fileImage"  : "selectImage",  // "click" event has no file
        "drop #editImage" : "dropHandler",
        "dragover #editImage" : "dragoverHandler",
        "dragenter #editImage" : "dragenterHandler",  // ??? does not work
        "dragleave #editImage" : "dragleaveHandler"  // ??? does not work
    },

    render:function () {
        this.$el.html(this.template(this.model.toJSON()));
	return this;
    },

    // Handle file-system selection of picture.
    // pictureFile upload is done in save-handler,
    // so user can change picture selection without
    // incurring cost of multiple uploads
    selectImage: function(event) {
	// set object attribute for use by uploadPicture
        this.pictureFile = event.target.files[0];
        if (this.pictureFile.type.indexOf("image") === 0) {
            this.imageRead(this.pictureFile, this.pictureFile.type);
        } else {
	    this.showAlert('Error!', 'Please select an image file', 'alert-danger');
	};
    },

    // Handle drag-n-drop of picture (following 4 methods)
    dragoverHandler: function(event) {
	event.stopPropagation();  // don't let parent element catch event
        event.preventDefault();  // prevent default to enable drop event
        // jQuery event does not have dataTransfer field - so use originalEvent
	event.originalEvent.dataTransfer.dropEffect = 'copy';
    },

    dragenterHandler: function(event) {
        var types = event.originalEvent.dataTransfer.types;
        if (!types || (types.contains && types.contains("Files"))
	    || (types.indexOf && types.indexOf("Files") !== -1)) {
            $("#dropImage").addClass("active");
	}
    },

    dragleaveHandler: function(event) {
        $("#dropImage").removeClass("active");  // doesn't work ???
    },

    dropHandler: function (event) {
        event.stopPropagation();
        event.preventDefault();
        // jQuery event doesn't have dataTransfer field - so use originalEvent
	var ev = event.originalEvent;
	// set object attribute for use by uploadPicture
        this.pictureFile = ev.dataTransfer.files[0];
	// only process image files
        if (this.pictureFile && this.pictureFile.type
		&& this.pictureFile.type.indexOf("image") === 0) {
            // Read image file from local file system and display in img tag
	    this.imageRead(this.pictureFile, this.pictureFile.type);
        } else {
	    this.showAlert('Error!', 'Please select an image file', 'alert-danger');
	};
        $("#dropImage").removeClass("active");
    },

    // Read the pictureFile from the filesystem resulting in a DataURL
    // (base64 representation of the image data).
    // Pass this to the resize() function below, which returns a resized
    // DataURL representation of the image data, that is then stored as
    // the model's poster-attribute and the DOM-image's src attribute.
    imageRead: function(pictureFile, type) {
	var self = this;
        var reader = new FileReader();
        reader.onload = function(event) {
	    // pass in callback function since resizing is asynchronous
	    self.resize(reader.result, type, "0.90", function(resizedImg) {
		// callback function changes img element src in DOM and
		// sets movie poster field to resized image dataURL
	        var targetImgElt = $('#editImage')[0];
	        targetImgElt.src = resizedImg;
	        self.model.set('poster', resizedImg);
	    });
        };
        reader.readAsDataURL(pictureFile);
    },

    // Resize sourceImg, returning result as a DataURL value.  Type, and
    // quality are optional params for image-type and quality setting
    resize: function(sourceImg, type, quality, callback) {
	var type = type || "image/jpeg";   // default MIME image type
    	var quality = quality || "0.95";  // tradeoff of quality vs size
    	var image = new Image(), MAX_HEIGHT = 300, MAX_WIDTH = 450;
	image.onload = function() {
    	    image.height *= MAX_HEIGHT / image.height;  // scale image
    	    image.width *= MAX_WIDTH / image.width;
    	    var canvas = document.createElement("canvas"); 
    	    canvas.width = image.width;  // scale canvas
    	    canvas.height = image.height;
    	    var ctx = canvas.getContext("2d");  // get 2D rendering context
    	    ctx.drawImage(image, 0, 0, image.width, image.height);  // render
	    if (callback) {
		callback(canvas.toDataURL(type, quality));
	    };
	};
    	image.src = sourceImg;
    }

});

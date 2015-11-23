'use strict';

var splat =  splat || {};

splat.Users = Backbone.Collection.extend({
    model:splat.User,

    url:'/user'  // to interact with the model via the server API
});

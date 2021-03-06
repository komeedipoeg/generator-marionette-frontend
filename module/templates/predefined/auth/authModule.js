define(function (require) {
    'use strict';

    var app = require('app');

    var Marionette = require('marionette');
    var Backbone = require('backbone');
    var _ = require('underscore');

    var entities = require('./entities');
    var helpers = require('./helpers');
    var controller = require('./controller');


    /**
     * Patch the route function
     * @type {Function}
     */
    Backbone.Router.prototype.route = _.wrap(Backbone.Router.prototype.route, function (originalRoute, route, name, callback) {

        if(this.protected === false) {
            originalRoute.call(this, route, name, callback);
        }
        else {

            var newCallback = _.wrap(callback, function(originalCallback){

                var callbackArguments = Array.prototype.slice.call(arguments);
                callbackArguments.shift(); //The first argument is the actual callback we're calling

                if(!app.bootstrap.authorized) {
                    app.execute('navigate:auth:login');
                }
                else {
                    originalCallback.apply( this, callbackArguments );
                }
            });
            originalRoute.call(this, route, name, newCallback);
        }
    });

    /**
     * Routers
     */
    var Router = Marionette.AppRouter.extend({

        protected : false,

        appRoutes: {
            'auth/login' : 'login',
            'auth/login/redirect/:path' : 'redirect'
        },
        controller : {
            'login' : function () {
                controller.login(decodeURIComponent('home'));
            },
            'redirect' : function (path) {
                controller.login(decodeURIComponent(path));
            }
        }
    });

    /**
     * Commands
     */
    app.commands.setHandler('navigate:auth:login', function (path) {
        path = path || Backbone.history.getFragment();
        app.navigate('auth/login/redirect/' + encodeURIComponent(path));
        controller.login(path);
    });

    app.commands.setHandler('auth:logout', function () {
        localStorage.setItem('authorized', false);
        window.location.reload();
    });

    return {
        entities: entities,
        controllers: controller,
        router: new Router(),
        helpers : helpers
    };
});
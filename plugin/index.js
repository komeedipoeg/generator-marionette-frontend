'use strict';
var util = require('util');
var path = require('path');
var fs = require('fs');
var os = require('os');
var yeoman = require('yeoman-generator');

var PluginGenerator = module.exports = function PluginGenerator(args, options, config) {

    yeoman.generators.Base.apply(this, arguments);

    this.predefined = options.predefined;
    this.plugin = options.plugin;
    this.autoload = options.autoload;

};
util.inherits(PluginGenerator, yeoman.generators.Base);

PluginGenerator.prototype.askFor = function askFor() {

    if (!this.plugin) {
        var cb = this.async();

        var prompts = [
            {
                name: 'plugin',
                message: 'What do you want to call your plugin?'
            },
            {
                type: 'confirm',
                name: 'autoload',
                message: 'Would you like to generate the plugin autoloader file?',
                default: true
            }
        ];

        this.prompt(prompts, function (props) {
            this.plugin = props.plugin;
            this.autoload = props.autoload;
            cb();
        }.bind(this));

    }
};

PluginGenerator.prototype.generatePlugin = function generatePlugin() {
    if (!this.predefined) {
        this.template('default.js', 'frontend/app/plugins/' + this.plugin + '.js');
    }
    else {
        this.copy('predefined/' + this.plugin + '.js', 'frontend/app/plugins/' + this.plugin + '.js');
    }

};


PluginGenerator.prototype.generateAutoloader = function generateAutoloader() {

    if (this.autoload) {

        var pluginStart = this.readFileAsString(path.join(__dirname, 'templates', '_pluginsStart.js'));
        var pluginEnd = this.readFileAsString(path.join(__dirname, 'templates', '_pluginsEnd.js'));
        var files = fs.readdirSync(path.join(process.cwd(), 'frontend', 'app', 'plugins')).map(function (filename) {
            return '    require(\'plugins/' + path.basename(filename, '.js') + '\')(app);';
        });
        var pluginAutoloader = pluginStart + files.join(os.EOL) + pluginEnd;

        this.write('frontend/app/autoload/plugins.js', pluginAutoloader);
    }

};


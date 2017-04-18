
var os = require('os');
var path = require('path');
var _ = require('lodash');
var nconf = require('nconf');
var q = require("q");

var Newrelic = require('./lib/newrelic');

var version = require("./package.json").version;
var defaultConfFile = 'pfmon.config.json';

// read config file
try {
    nconf.env();
    // file defined in env variable
    var envConf = nconf.get('PFMON_CONFIG');
    if (envConf) {
        nconf.file('envConf', path.resolve(envConf));
    }

    // file in home dir
    nconf.file('homeConf', path.resolve(process.env.HOME, defaultConfFile));

    // file in local dir
    nconf.file('localConf', path.resolve(defaultConfFile));
} catch (e) {
    console.error('ERROR: reading configuration file:', e.message);
    return;
}

var pollSeconds = nconf.get('pollSeconds') || 30;
var guid = nconf.get('guid');
var newrelicConf = nconf.get('newrelic');
var modulesConf = nconf.get('modules');
var newrelic = new Newrelic(newrelicConf);

if (!newrelicConf) {
    console.error('ERROR: Couldn\'t read \'newrelic\' section of config file');
    return;
}

if (!modulesConf) {
    console.error('ERROR: Couldn\'t read \'modules\' section of config file');
    return;
}

// load modules
var modules = {};
_.each(modulesConf, function (config, modName) {
    modules[modName] = {config: config};
    // import the module
    modules[modName].monitor = require(modName).monitor;
});

var poll = function () {
    var msg = {agent: {
        host: os.hostname(),
        pid: process.pid,
        version: version
    }, components: []};

    var funcs = [];

    _.each(modules, function (mod, modName) {
        var f = q.promise(function (resolve, reject) {
            if (_.isFunction(mod.monitor)) {
                // inherit guid, if not set
                if (!mod.config.guid) {
                    mod.config.guid = guid;
                };

                mod.monitor(mod.config).then(function(data) {
                    return resolve(data);
                }, function (err) {
                    console.error(`ERROR: failed running ${modName} monitor`);
                    console.error(err);
                    return reject(err);
                });
            }
        });
        funcs.push(f);
    });

    q.all(funcs).then(function (results) {
        // loop through each modules results and merge the arrays
        _.each(results, function (res) {
            msg.components = _.concat(msg.components, res);
        })
        newrelic.send(msg);
    });

    setTimeout(poll, pollSeconds * 1000);
};

poll();

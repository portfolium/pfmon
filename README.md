# pfmon - Node.js monitoring utility for New Relic

**pfmon** is a modular monitoring utility for New Relic. In fact, this doesn't do much without at least one module installed. Modules are very easy to create. See pfmon-heartbeat for an example.

## Installation

This was designed to be installed as a [PM2](http://pm2.keymetrics.io/) module, but it can also be run independently. You can install this on your existing servers (that have Node.js) or you can run **pfmon** on tiny VMs in your environment. It is very lightweight and does not require much resources at all.

##### Install npm package

```
$ npm install pfmon --save
```

##### Install a pfmon module (i.e. [pfmon-heartbeat](https://github.com/portfolium/pfmon-heartbeat))

```
$ npm install pfmon-heartbeat --save
```

##### Create config file

Copy the `pfmon-config-template.json` to `pfmon-config.json` and save it in either the **pfmon** directory **or** in the users home directory that will be running the app.

For example, we could run **pfmon** as the `portfolium` user and copy `pfmon-config-template.json` to `/home/portfolium/pfmon-config.json `.

##### Add New Relic license key to config file

Replace `YOUR_LICENSE_KEY ` with your New Relic license key

```
	...
    "newrelic": {
        "license": "YOUR_LICENSE_KEY",  // <--- add your license key here
        "url": "https://platform-api.newrelic.com/platform/v1/metrics"
    },
    ...
```

##### Add module(s) to config file

Follow the module's installation instructions for details on the config requirements. Below is what would be needed for the `pfmon-heartbeat` module. Multiple modules can be added to the `"modules"` object. The key will be the module name as used in the `npm install` command. The value will be an object that describes the module configuration, as defined by the module developer.
 
```
	...
	},
    "modules": {
        "pfmon-heartbeat": {
            "duration": 60,
            "hosts": [
                {"host": "localhost", "port": 3000},
                {"host": "localhost", "port": 8000}
            ]
        }
    }
```

#### Run as a PM2 module

From the `pfmon` directory:

```
$ pm2 install .
```

**pfmon** will be listed as a module

```
$ pm2 ls

 Module activated
┌────────┬─────────┬────────────┬────────┬─────────┬─────┬─────────────┐
│ Module │ version │ target PID │ status │ restart │ cpu │ memory      │
├────────┼─────────┼────────────┼────────┼─────────┼─────┼─────────────┤
│ pfmon  │ 2.4.4   │ N/A        │ online │ 0       │ 0%  │ 49.473 MB   │
└────────┴─────────┴────────────┴────────┴─────────┴─────┴─────────────┘
```

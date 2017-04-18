var request = require('request');

function Newrelic(config) {
    this.license = config.license;
    this.guid = config.guid;
    this.url = config.url;
}

Newrelic.prototype.send = function (data, method) {
    request({
        url: this.url,
        method: method || "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-License-Key': this.license
        },
        json: true,
        body: data
    }, function (err, httpResponse, body) {
        if (!err) {
            console.log('New Relic Reponse: %d', httpResponse.statusCode);
            if (body) {
                console.log('Response from NR: ' + JSON.stringify(body));
            }
        } else {
            console.log('*** ERROR ***');
            console.log(err);
        }
    });
}

module.exports = Newrelic;

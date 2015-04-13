/*==========  REQUIRE  ==========*/

var util = require('util');
var request = require('request');
var Arduino = require('./class/arduino');

/*==========  API  ==========*/

exports = module.exports = createApplication;

/* API constructor */

function createApplication() {
    var app = new API();
    return app;
}

/* API */

var API = function() {
    this.arduino = {};
    this.arduino.status = "CLOSED";
    this.url = undefined;
};

/* Return object with states */

API.prototype.getState = function(callback) {
    var that = this;
    if (that.url !== undefined) {
        request.post(
            that.url + '/getStatus',
            function(error, response, body) {
                body = JSON.parse(body);
                if (!error && response.statusCode == 200) {
                    var status = {
                        open: (body.CONNECTED == "true" ? true : false),
                        closed: (body.DISCONNECTED == "true" ? true : false)
                    };
                    callback(status);
                    return;
                } else {
                    var status = {
                        open: false,
                        closed: true
                    };
                    callback(status);
                    return;
                }
            });
    }
    else
    {
        var status = {
            open: false,
            closed: true
        };
        callback(status);
        return;
    }
};

/* Connect to the first Arduino */

API.prototype.connect = function(baud, url, connection) {
    var that = this;
    that.getState(function(status) {
        if (status.open)
        {
            that.arduino.status = "OPEN";
            if (typeof(connection) == "function")
                connection({
                    status: that.arduino.status
                });
            return;
        }
        that.arduino.status = "CLOSED";
        if (!baud) {
            baud = 9600;
        }
        that.url = url;
        request.post(
            that.url + '/list',
            function(error, response, body) {
                body = JSON.parse(body);
                if (!error && response.statusCode == 200) {
                    if (!body.ports || body.ports.length === 0) {
                        that.arduino.status = "CLOSED";
                        if (typeof(connection) == "function")
                            connection({
                                status: that.arduino.status
                            });
                        return;
                    }
                    that.arduino = new Arduino(body.ports[0]);
                    var options = {
                        uri: that.url + '/connect',
                        method: 'POST',
                        json: {
                            portName: body.ports[0],
                            baudRate: baud
                        }
                    };
                    request(options, function(error, response, body) {
                        if (!error && response.statusCode == 200) {
                            that.arduino.status = "OPEN";
                            if (typeof(connection) == "function")
                                connection({
                                    status: that.arduino.status
                                });
                            return;
                        } else {
                            that.arduino.status = "CLOSED";
                            if (typeof(connection) == "function")
                                connection({
                                    status: that.arduino.status
                                });
                            return;
                        }
                    });
                } else {
                    that.arduino.status = "CLOSED";
                    if (typeof(connection) == "function")
                        connection({
                            status: that.arduino.status
                        });
                    return;
                }
            }
        );
    });
};

/* Send JSON to Arduino */

API.prototype.send = function(cmd, callback) {
    var that = this;
    if (that.arduino === undefined) {
        callback({
            code: "error",
            err: util.format('Arduino status : %s', that.arduino.status)
        });
        return;
    }
    that.getState(function(status) {
        if (status.open) {
            json = JSON.stringify(cmd);
            var options = {
                uri: that.url + '/data',
                method: 'POST',
                body: json
            };
            request(options, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    try {
                        var stringData = body.toString('utf8');
                        var object = JSON.parse(stringData);
                        if (object !== undefined) {
                            callback(object);
                        } else {
                            callback({
                                code: "error",
                                err: 'Unable to parse arduino response'
                            });
                            return;
                        }
                    } catch (e) {
                        //console.log(e);
                        callback({
                            code: "error",
                            err: 'Unable to parse arduino response'
                        });
                        return;
                    }
                } else {
                    callback({
                        code: "error",
                        err: util.format('Arduino status : %s', that.arduino.status)
                    });
                    return;
                }
            });
        } else {
            callback({
                code: "error",
                err: util.format('Arduino status : %s', that.arduino.status)
            });
            return;
        }
    });
};

exports.connect = API.prototype.connect;
exports.send = API.prototype.send;
exports.getState = API.prototype.getState;
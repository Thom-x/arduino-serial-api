/*==========  REQUIRE  ==========*/

var serialPortModule = require("serialport");
var util = require('util');
var SerialPort = serialPortModule.SerialPort
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
    this.serialPort = undefined;
    this.arduino = {};
    this.arduino.status = "CLOSED";
    this.respQueue = [];
    this.enumStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
};

/* Return object with states */

API.prototype.getState = function() {
    if (this.arduino !== undefined) {
        var res = {
            open: (this.arduino.status === "OPEN"),
            closed: (this.arduino.status === "CLOSED"),
            connecting: (this.arduino.status === "CONNECTING"),
            closing: (this.arduino.status === "CLOSING")
        };
        return res;
    }
    var res2 = {
        open: false,
        closed: true,
        connecting: false,
        closing: false
    };
    return res2;
};

/* Connect to the first Arduino */

API.prototype.connect = function(baud,connection) {
    if (this.getState().open)
        return;
    if(!baud)
    {
        baud = 9600;
    }
    var that = this;
    that.arduino.status = "CONNECTING"
    serialPortModule.list(function(err, ports) {
        if (err) {
            that.arduino.status = "CLOSED";
            connection({status : that.arduino.status});
            return;
        }
        if (ports.length === 0) {
            that.arduino.status = "CLOSED";
            connection({status : that.arduino.status});
            return;
        }
        that.arduino = new Arduino(ports[0]);
        that.serialPort = new SerialPort(ports[0].comName, {
            baudrate: baud
        });
        that.serialPort.on("open", function(error) {
            if (error) {
                that.arduino.status = "CLOSED";
                connection({status : that.arduino.status});
                return;
            }
            that.arduino.status = "OPEN";
            connection({status : that.arduino.status});
            that.serialPort.on('data', function(data) {
                try {
                    var stringData = data.toString('utf8');
                    var object = JSON.parse(stringData);
                    if (object !== undefined) {
                        var callback = that.respQueue.shift();
                        callback(object);
                    } else {
                        var callback = that.respQueue.shift();
                        callback({
                            code: "error",
                            err: 'Unable to parse arduino response'
                        });
                    }
                } catch (e) {
                    //console.log(e);
                    var callback = that.respQueue.shift();
                    callback({
                        code: "error",
                        err: 'Unable to parse arduino response'
                    });
                }
            });
        });
    });
};

/* Send JSON to Arduino */

API.prototype.send = function(cmd, callback) {
    if (this.arduino === undefined) {
        callback({
            code: "error",
            err: util.format('Arduino status : %s', this.arduino.status)
        });
        return;
    }
    if (this.getState().open) {
        json = JSON.stringify(cmd);
        this.serialPort.write(json + '\n', function(err, results) {});
        this.respQueue.push(callback);
        return;
    } else {
        callback({
            code: "error",
            err: util.format('Arduino status : %s', this.arduino.status)
        });
        return;
    }
};

exports.connect = API.prototype.connect;
exports.send = API.prototype.send;
exports.getState = API.prototype.getState;
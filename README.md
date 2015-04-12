# Arduino-serial-api
Simple nodejs module to communicate with arduino using serial port.

# Install

Then install the module :
```
npm install arduino-serial-api --save
```

# Usage

```javascript
var arduinoSerialAPI = require('arduino-serial-api');	// call arduino-api
var API = arduinoSerialAPI();						// create our API
API.connect(115200,function(rep){ 		    // connect to Arduino with baud rate at 115200
	console.log(status);                    // get status : ["CONNECTING", "OPEN", "CLOSING", "CLOSED"]
	if(rep.status === "OPEN")
	{
		API.send({
		        led : {
		            r : 255,
		            g : 255,
		            b : 255
		        }
		    },function(resp){
		  console.log(resp);                 // log response
		});
	}
});
```

## Methods

### connect (baudrate, callback)

Connect to the first arduino with the specified `baudrate`.

**_baudrate_**

The baudrate speed of the serial port to open. For example, `9600` or `115200`.
Defaults to 9600. Should be one of: 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, or 115200.

**_callback_**

Callback function returning a string corresponding to the connection status. For example `"CLOSED"` or `"OPEN"`.

### send (data, callback)

Send the `data` object to the arduino. For example `{led : "on"}`.

**_callback_**

Callback function returning an object corresponding to the parsed json string of the arduino. For example `{status : "ok"}`.

### getState ()

Return an object corresponding to the conneciton status.
For example `{open: false, closed: true, connecting: false, closing: false}`.
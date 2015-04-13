var Arduino = function(port) {
  this.portName = port;
  this.status = "CLOSED";
}

module.exports = Arduino;
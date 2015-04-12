var Arduino = function(arduino) {
  this.comName = arduino.comName;
  this.manufacturer = arduino.manufacturer;
  this.serialNumber = arduino.serialNumber;
  this.pnpId = arduino.pnpId;
  this.locationId = arduino.locationId;
  this.vendorId = arduino.vendorId;
  this.productId = arduino.productId;
  this.status = "CLOSED";
}

module.exports = Arduino;
//ENVIRONMENT VARIABLES:
var setup={
	sql: {
	    host : 'localhost',
	    user : 'tictap',
	    password : '1234',
	    database : 'KONI'
	},
    antenna_a: {				//ARDUINO AMB PLACA NFC I PISTOLA QR
  	port:   '/dev/ttyACM0', //'/dev/ttyUSB0',   //  /dev/ttyACM0
		bauds: 9600, //9600, //19200
		parity: 'none',
		bytes: 8,
		stop: 1
    },
    keyboard_id: '/dev/input/by-id/usb-SM_SM-2D_PRODUCT_HID_KBW_APP-000000000-event-kbd' //'/dev/input/by-id/usb-2D_IMAGER_2D_IMAGER-event-kbd'
};
module.exports=setup;

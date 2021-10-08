'use strict';

/*
 * Created with @iobroker/create-adapter v2.0.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
// const fs = require("fs");

//variables
let meteoblueAPIURL;

class Meteoblue extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: 'meteoblue',
		});
		this.on('ready', this.onReady.bind(this));
		this.on('stateChange', this.onStateChange.bind(this));
		// this.on('objectChange', this.onObjectChange.bind(this));
		// this.on('message', this.onMessage.bind(this));
		this.on('unload', this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here
		this.log.info('starting Adapter "meteoblue" ...');

		// Reset the connection indicator during startup
		this.setState('info.connection', false, true);

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
		this.log.info('this.config.location: ' + this.config.location);
		this.log.info('this.config.latitude: ' + this.config.latitude);
		this.log.info('this.config.longitude: ' + this.config.longitude);
		this.log.info('this.config.elevation: ' + this.config.elevation);
		this.log.info('this.config.timezone: ' + this.config.timezone);
		this.log.info('this.config.apikey: ' + this.config.apikey);
		this.log.info('this.config.temperature: ' + this.config.temperature);
		this.log.info('this.config.windspeed: ' + this.config.windspeed);
		this.log.info('this.config.winddirection: ' + this.config.winddirection);
		this.log.info('this.config.precipitationamount: ' + this.config.precipitationamount);
		this.log.info('this.config.timeformat: ' + this.config.timeformat);
	
		//https://docs.meteoblue.com/en/weather-apis/packages-api/introduction#time-zone
	
		meteoblueAPIURL = 'http://my.meteoblue.com/packages/basic-day?';

		//required
		if ((!this.config.latitude && this.config.latitude !== 0) || isNaN(this.config.latitude) || (!this.config.longitude && this.config.longitude !== 0) || isNaN(this.config.longitude)) {
			this.log.info('latitude/longitude not set, get data from system')

            try {
                const state = await this.getForeignObjectAsync('system.config');
				this.config.latitude = state.common.latitude;
                this.config.longitude = state.common.longitude;
            } catch (err) {
                this.log.error(err);
            }

			if ((!this.config.latitude && this.config.latitude !== 0) || isNaN(this.config.latitude) || (!this.config.longitude && this.config.longitude !== 0) || isNaN(this.config.longitude)) {
				//shut down
				this.log.error('latitude and/or longitude not set. Adapter will be terminated.')
				this.setForeignState("system.adapter." + this.namespace + ".alive", false);
			} else {
				meteoblueAPIURL += 'lat=' + this.config.latitude + '&lon=' + this.config.longitude;
			}

		} else {
			this.log.info('latitude/longitude manually set')
			meteoblueAPIURL += 'lat=' + this.config.latitude + '&lon=' + this.config.longitude;
		}
		if (this.config.location !== null) {
			//convert location to UTF8; see https://docs.meteoblue.com/en/weather-apis/packages-api/introduction#misc
			meteoblueAPIURL += '&name=' + encodeURIComponent(this.config.location);
		}
		if (this.config.elevation !== null) {
			meteoblueAPIURL += '&asl=' + this.config.elevation;
		}
		if (this.config.timezone !== null) {
			meteoblueAPIURL += '&tz=' + this.config.timezone;
		}
		if (this.config.apikey !== null) {
			meteoblueAPIURL += '&apikey=' + this.config.apikey;
		}
		if (this.config.temperature !== null) {
			meteoblueAPIURL += '&temperature=' + this.config.temperature;
		}
		if (this.config.windspeed !== null) {
			meteoblueAPIURL += '&windspeed=' + this.config.windspeed;
		}
		if (this.config.winddirection !== null) {
			meteoblueAPIURL += '&winddirection=' + this.config.winddirection;
		}
		if (this.config.precipitationamount !== null) {
			meteoblueAPIURL += '&precipitationamount=' + this.config.precipitationamount;
		}
		if (this.config.timeformat !== null) {
			meteoblueAPIURL += '&timeformat=' + this.config.timeformat;
		}
		meteoblueAPIURL += '&format=json';
		this.log.info('meteoblueAPIURL: ' + meteoblueAPIURL);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === 'object' && obj.message) {
	// 		if (obj.command === 'send') {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info('send command');

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
	// 		}
	// 	}
	// }

}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new Meteoblue(options);
} else {
	// otherwise start the instance directly
	new Meteoblue();
}
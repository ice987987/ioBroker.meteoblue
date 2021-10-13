'use strict';

/*
 * Created with @iobroker/create-adapter v2.0.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
const axios = require('axios');

//variables
let meteoblueAPIURL;
let intervallGetMeteoblueData;

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
		this.log.debug('this.config.location: ' + this.config.location);
		this.log.debug('this.config.latitude: ' + this.config.latitude);
		this.log.debug('this.config.longitude: ' + this.config.longitude);
		this.log.debug('this.config.elevation: ' + this.config.elevation);
		this.log.debug('this.config.timezone: ' + this.config.timezone);
		this.log.debug('this.config.apikey: ' + this.config.apikey);
		this.log.debug('this.config.temperature: ' + this.config.temperature);
		this.log.debug('this.config.windspeed: ' + this.config.windspeed);
		this.log.debug('this.config.winddirection: ' + this.config.winddirection);
		this.log.debug('this.config.precipitationamount: ' + this.config.precipitationamount);
		this.log.debug('this.config.timeformat: ' + this.config.timeformat);
	
		//https://docs.meteoblue.com/en/weather-apis/packages-api/introduction#time-zone
	
		meteoblueAPIURL = 'http://my.meteoblue.com/packages/basic-day?';

		//check apikey
		if(typeof(this.config.apikey) === 'string') {
			this.log.debug('APIKEY set. (' + this.config.apikey +')')
			meteoblueAPIURL += 'apikey=' + this.config.apikey;
			
			//check and set latitute & longitude
			if(typeof(this.config.latitude) === 'number' && !isNaN(this.config.latitude) && this.config.latitude >= -90 && this.config.latitude <= 90 &&
			   typeof(this.config.longitude) === 'number' && !isNaN(this.config.longitude) && this.config.longitude >= -180 && this.config.longitude <= 180) {
				this.log.info('latitude/longitude manually set');
				meteoblueAPIURL += '&lat=' + this.config.latitude + '&lon=' + this.config.longitude;
				await this.meteoblueAPIURL2ndPart();
			} else {
				this.log.info('latitude/longitude not manually set, get data from system')
				
				try {
					const state = await this.getForeignObjectAsync('system.config');
					this.config.latitude = state.common.latitude;
					this.config.longitude = state.common.longitude;
				} catch (err) {
					this.log.error(err);
				}

				this.log.debug('system latitude: ' + this.config.latitude);
				this.log.debug('system longitude: ' + this.config.longitude);

				if(typeof(this.config.latitude) === 'number' && !isNaN(this.config.latitude) && this.config.latitude >= -90 && this.config.latitude <= 90 &&
			       typeof(this.config.longitude) === 'number' && !isNaN(this.config.longitude) && this.config.longitude >= -180 && this.config.longitude <= 180) {
					this.log.info('latitude/longitude set from system')
					meteoblueAPIURL += '&lat=' + this.config.latitude + '&lon=' + this.config.longitude;
					await this.meteoblueAPIURL2ndPart();
				} else {
					//shut down
					this.log.error('latitude and/or longitude not set. Adapter will be terminated.')
					this.setForeignState("system.adapter." + this.namespace + ".alive", false);
				}
			}
		} else {
			//shut down
			this.log.error('APIKEY not set. Adapter will be terminated.')
			this.setForeignState("system.adapter." + this.namespace + ".alive", false);
		};
	}

	async meteoblueAPIURL2ndPart() {
		if (this.config.location !== null && this.config.location !== '') {
			//convert location to UTF8; see https://docs.meteoblue.com/en/weather-apis/packages-api/introduction#misc
			meteoblueAPIURL += '&name=' + encodeURIComponent(this.config.location);
		}
		if (this.config.elevation !== null) {
			meteoblueAPIURL += '&asl=' + this.config.elevation;
		}
		if (this.config.timezone !== null) {
			meteoblueAPIURL += '&tz=' + this.config.timezone;
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
	
		await this.createObjectsAPI();
		await this.getMeteoblueData(meteoblueAPIURL);
		await this.getMeteoblueDateIntervall(meteoblueAPIURL);
	}
	
	async createObjectsAPI() {
		this.log.info('create states...');

		//metadata
		await this.setObjectNotExistsAsync('metadata.name', {
			type: 'state',
			common: {
				name: 'name',
				desc: 'location name',
				type: 'string',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('metadata.latitude', {
			type: 'state',
			common: {
				name: 'latitude',
				desc: 'Latitude coordinate in WGS-84',
				unit: '°N',
				type: 'number',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('metadata.longitude', {
			type: 'state',
			common: {
				name: 'longitude',
				desc: 'Longitude coordinate in WGS-84',
				unit: '°E',
				type: 'number',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('metadata.height', {
			type: 'state',
			common: {
				name: 'height',
				desc: 'elevation in meters above sea level',
				unit: 'm',
				type: 'number',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('metadata.timezone_abbrevation', {
			type: 'state',
			common: {
				name: 'timezone_abbrevation',
				desc: 'timezone_abbrevation',
				type: 'string',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('metadata.utc_timeoffset', {
			type: 'state',
			common: {
				name: 'utc_timeoffset',
				desc: 'utc_timeoffset',
				unit: 'h',
				type: 'number',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('metadata.modelrun_utc', {
			type: 'state',
			common: {
				name: 'modelrun_utc',
				desc: 'modelrun_utc',
				type: 'number',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('metadata.modelrun_updatetime_utc', {
			type: 'state',
			common: {
				name: 'modelrun_updatetime_utc',
				desc: 'modelrun_updatetime_utc zone',
				type: 'number',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('metadata.modelrun', {
			type: 'state',
			common: {
				name: 'modelrun',
				desc: 'modelrun',
				type: 'string',
				role: 'date',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('metadata.modelrun_updatetime', {
			type: 'state',
			common: {
				name: 'modelrun_updatetime',
				desc: 'modelrun_updatetime',
				type: 'string',
				role: 'date',
				read: true,
				write: false
			},
			native: {}
		});

		//units
		await this.setObjectNotExistsAsync('units.time', {
			type: 'state',
			common: {
				name: 'time',
				desc: 'time',
				type: 'string',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('units.predictability', {
			type: 'state',
			common: {
				name: 'predictability',
				desc: 'predictability',
				type: 'string',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('units.precipitation_probability', {
			type: 'state',
			common: {
				name: 'precipitation_probability',
				desc: 'precipitation_probability',
				type: 'string',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('units.pressure', {
			type: 'state',
			common: {
				name: 'pressure',
				desc: 'pressure',
				type: 'string',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('units.relativehumidity', {
			type: 'state',
			common: {
				name: 'relativehumidity',
				desc: 'relativehumidity',
				type: 'string',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('units.co', {
			type: 'state',
			common: {
				name: 'co',
				desc: 'co',
				type: 'string',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('units.temperature', {
			type: 'state',
			common: {
				name: 'temperature',
				desc: 'temperature',
				type: 'string',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('units.winddirection', {
			type: 'state',
			common: {
				name: 'winddirection',
				desc: 'winddirection',
				type: 'string',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('units.precipitation', {
			type: 'state',
			common: {
				name: 'precipitation',
				desc: 'precipitation',
				type: 'string',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('units.windspeed', {
			type: 'state',
			common: {
				name: 'windspeed',
				desc: 'windspeed',
				type: 'string',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		//data_day 0-6
		for (let i = 0; i <= 6; i++) {
			await this.setObjectNotExistsAsync('data_day.' + i + '.time', {
				type: 'state',
				common: {
					name: 'time',
					desc: 'time',
					type: 'string',
					role: 'date',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.time_UTC', {
				type: 'state',
				common: {
					name: 'time',
					desc: 'time',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.pictocode', {
				type: 'state',
				common: {
					name: 'pictocode',
					desc: 'pictocode',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.uvindex', {
				type: 'state',
				common: {
					name: 'uvindex',
					desc: 'uvindex',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.temperature_max', {
				type: 'state',
				common: {
					name: 'temperature_max',
					desc: 'temperature_max',
					unit: '°',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.temperature_min', {
				type: 'state',
				common: {
					name: 'temperature_min',
					desc: 'temperature_min',
					unit: '°',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.temperature_mean', {
				type: 'state',
				common: {
					name: 'temperature_mean',
					desc: 'temperature_mean',
					unit: '°',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.felttemperature_max', {
				type: 'state',
				common: {
					name: 'felttemperature_max',
					desc: 'felttemperature_max',
					unit: '°',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.felttemperature_min', {
				type: 'state',
				common: {
					name: 'felttemperature_min',
					desc: 'felttemperature_min',
					unit: '°',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.winddirectionDeg', {
				type: 'state',
				common: {
					name: 'winddirection',
					desc: 'winddirection',
					unit: '°',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.winddirectionChar', {
				type: 'state',
				common: {
					name: 'winddirection',
					desc: 'winddirection',
					type: 'string',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});


			await this.setObjectNotExistsAsync('data_day.' + i + '.precipitation_probability', {
				type: 'state',
				common: {
					name: 'precipitation_probability',
					desc: 'precipitation_probability',
					unit: '%',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.rainspot', {
				type: 'state',
				common: {
					name: 'rainspot',
					desc: 'rainspot',
					type: 'string',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.predictability_class', {
				type: 'state',
				common: {
					name: 'predictability_class',
					desc: 'predictability_class',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.predictability', {
				type: 'state',
				common: {
					name: 'predictability',
					desc: 'predictability',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.precipitation', {
				type: 'state',
				common: {
					name: 'precipitation',
					desc: 'precipitation',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.snowfraction', {
				type: 'state',
				common: {
					name: 'snowfraction',
					desc: 'snowfraction',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.sealevelpressure_max', {
				type: 'state',
				common: {
					name: 'sealevelpressure_max',
					desc: 'sealevelpressure_max',
					unit: 'hPa',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.sealevelpressure_min', {
				type: 'state',
				common: {
					name: 'sealevelpressure_min',
					desc: 'sealevelpressure_min',
					unit: 'hPa',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.sealevelpressure_mean', {
				type: 'state',
				common: {
					name: 'sealevelpressure_mean',
					desc: 'sealevelpressure_mean',
					unit: 'hPa',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.windspeed_max', {
				type: 'state',
				common: {
					name: 'sealevelpressure_mean',
					desc: 'sealevelpressure_mean',
					unit: 'hPa',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.windspeed_mean', {
				type: 'state',
				common: {
					name: 'windspeed_mean',
					desc: 'windspeed_mean',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.windspeed_min', {
				type: 'state',
				common: {
					name: 'windspeed_min',
					desc: 'windspeed_min',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.relativehumidity_max', {
				type: 'state',
				common: {
					name: 'relativehumidity_max',
					desc: 'relativehumidity_max',
					unit: '%',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.relativehumidity_min', {
				type: 'state',
				common: {
					name: 'relativehumidity_min',
					desc: 'relativehumidity_min',
					unit: '%',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.relativehumidity_mean', {
				type: 'state',
				common: {
					name: 'relativehumidity_mean',
					desc: 'relativehumidity_mean',
					unit: '%',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.convective_precipitation', {
				type: 'state',
				common: {
					name: 'convective_precipitation',
					desc: 'convective_precipitation',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.precipitation_hours', {
				type: 'state',
				common: {
					name: 'precipitation_hours',
					desc: 'precipitation_hours',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.humiditygreater90_hours', {
				type: 'state',
				common: {
					name: 'humiditygreater90_hours',
					desc: 'humiditygreater90_hours',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});
		}
		this.log.info('states created...');
	}

	async getMeteoblueData(meteoblueAPIURL) {
		//adapter.log.info('adapter: ' + adapter);
		this.log.info('getMeteoblueData...');
	
		//https://www.npmjs.com/package/axios
		axios({
			method: 'get',
			baseURL: meteoblueAPIURL,
			//url: '/data.json',
			//timeout: this.config.requestTimeout * 1000,
			//responseType: 'json'
		})
		.then(async (response) => {
	
			this.setState('info.connection', true, true);
	
			const content = response.data;
			this.log.debug('received data (' + response.status + '): ' + JSON.stringify(content));
	
			//metadata
			this.setState('metadata.name', {val: content.metadata.name, ack: true});
			//this.log.debug('metadata.name: ' + content.metadata.name);
			this.setState('metadata.latitude', {val: content.metadata.latitude, ack: true});
			//this.log.debug('metadata.latitude: ' + content.metadata.latitude);
			this.setState('metadata.longitude', {val: content.metadata.longitude, ack: true});
			//this.log.debug('metadata.longitude: ' + content.metadata.longitude);
			this.setState('metadata.height', {val: content.metadata.height, ack: true});
			this.setState('metadata.timezone_abbrevation', {val: content.metadata.timezone_abbrevation, ack: true});
			this.setState('metadata.utc_timeoffset', {val: content.metadata.utc_timeoffset, ack: true});
			if(typeof(content.metadata.modelrun_utc) === 'number') {
				this.setState('metadata.modelrun_utc', {val: content.metadata.modelrun, ack: true});
				this.setState('metadata.modelrun', {val: '', ack: true});
			} else {
				this.setState('metadata.modelrun_utc', {val: null, ack: true});
				this.setState('metadata.modelrun', {val: content.metadata.modelrun, ack: true});
			}
			if(typeof(content.metadata.modelrun_utc) === 'number') {
				this.setState('metadata.modelrun_updatetime_utc', {val: content.metadata.modelrun_updatetime_utc, ack: true});
				this.setState('metadata.modelrun_updatetime', {val: '', ack: true});
			} else {
				this.setState('metadata.modelrun_updatetime_utc', {val: null, ack: true});
				this.setState('metadata.modelrun_updatetime', {val: content.metadata.modelrun_updatetime_utc, ack: true});
			}
			
			//units
			this.setState('units.time', {val: content.units.time, ack: true});
			this.setState('units.predictability', {val: content.units.predictability, ack: true});
			this.setState('units.precipitation_probability', {val: content.units.precipitation_probability, ack: true});
			this.setState('units.pressure', {val: content.units.pressure, ack: true});
			this.setState('units.relativehumidity', {val: content.units.relativehumidity, ack: true});
			this.setState('units.co', {val: content.units.co, ack: true});
			this.setState('units.temperature', {val: content.units.temperature, ack: true});
			this.setState('units.winddirection', {val: content.units.winddirection, ack: true});
			this.setState('units.precipitation', {val: content.units.precipitation, ack: true});
			this.setState('units.windspeed', {val: content.units.windspeed, ack: true});
	
			//data_day 0-6
			for (let i = 0; i <= 6; i++) {
				if(typeof(content.data_day.time[i]) === 'number') {
					this.setState('data_day.' + i + '.time_UTC', {val: content.data_day.time[i], ack: true});
					this.setState('data_day.' + i + '.time', {val: '', ack: true});
				} else {
					this.setState('data_day.' + i + '.time_UTC', {val: null, ack: true});
					this.setState('data_day.' + i + '.time', {val: content.data_day.time[i], ack: true});
				}
				this.setState('data_day.' + i + '.pictocode', {val: content.data_day.pictocode[i], ack: true});
				this.setState('data_day.' + i + '.uvindex', {val: content.data_day.uvindex[i], ack: true});
				this.setState('data_day.' + i + '.temperature_max', {val: content.data_day.temperature_max[i], ack: true});
				this.setState('data_day.' + i + '.temperature_min', {val: content.data_day.temperature_min[i], ack: true});
				this.setState('data_day.' + i + '.temperature_mean', {val: content.data_day.temperature_mean[i], ack: true});
				this.setState('data_day.' + i + '.felttemperature_max', {val: content.data_day.felttemperature_max[i], ack: true});
				this.setState('data_day.' + i + '.felttemperature_min', {val: content.data_day.felttemperature_min[i], ack: true});
				if(typeof(content.data_day.winddirection[i]) === 'number') {
					this.setState('data_day.' + i + '.winddirectionDeg', {val: content.data_day.winddirection[i], ack: true});
					this.setState('data_day.' + i + '.winddirectionChar', {val: '', ack: true});
				} else {
					this.setState('data_day.' + i + '.winddirectionDeg', {val: '', ack: true});
					this.setState('data_day.' + i + '.winddirectionChar', {val: content.data_day.winddirection[i], ack: true});
				}
				this.setState('data_day.' + i + '.precipitation_probability', {val: content.data_day.precipitation_probability[i], ack: true});
				this.setState('data_day.' + i + '.rainspot', {val: content.data_day.rainspot[i], ack: true});
				this.setState('data_day.' + i + '.predictability_class', {val: content.data_day.predictability_class[i], ack: true});
				this.setState('data_day.' + i + '.predictability', {val: content.data_day.predictability[i], ack: true});
				this.setState('data_day.' + i + '.precipitation', {val: content.data_day.precipitation[i], ack: true});
				this.setState('data_day.' + i + '.snowfraction', {val: content.data_day.snowfraction[i], ack: true});
				this.setState('data_day.' + i + '.sealevelpressure_max', {val: content.data_day.sealevelpressure_max[i], ack: true});
				this.setState('data_day.' + i + '.sealevelpressure_min', {val: content.data_day.sealevelpressure_min[i], ack: true});
				this.setState('data_day.' + i + '.sealevelpressure_mean', {val: content.data_day.sealevelpressure_mean[i], ack: true});
				this.setState('data_day.' + i + '.windspeed_max', {val: content.data_day.windspeed_max[i], ack: true});
				this.setState('data_day.' + i + '.windspeed_mean', {val: content.data_day.windspeed_mean[i], ack: true});
				this.setState('data_day.' + i + '.windspeed_min', {val: content.data_day.windspeed_min[i], ack: true});
				this.setState('data_day.' + i + '.relativehumidity_max', {val: content.data_day.relativehumidity_max[i], ack: true});
				this.setState('data_day.' + i + '.relativehumidity_min', {val: content.data_day.relativehumidity_min[i], ack: true});
				this.setState('data_day.' + i + '.relativehumidity_mean', {val: content.data_day.relativehumidity_mean[i], ack: true});
				this.setState('data_day.' + i + '.convective_precipitation', {val: content.data_day.convective_precipitation[i], ack: true});
				this.setState('data_day.' + i + '.precipitation_hours', {val: content.data_day.precipitation_hours[i], ack: true});
				this.setState('data_day.' + i + '.humiditygreater90_hours', {val: content.data_day.humiditygreater90_hours[i], ack: true});
			}
			this.log.info('all states written...');
		})
		.catch((error) => {
			if (error.response) {
				// The request was made and the server responded with a status code that falls out of the range of 2xx
	
				this.log.warn('received error ' + error.response.status +' with content: ' + JSON.stringify(error.response.data) + '(' + JSON.stringify(error.response.headers) +')');
	
			} else if (error.request) {
				// The request was made but no response was received `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
				this.log.info(error.message);
	
			} else {
				// Something happened in setting up the request that triggered an Error
				this.log.info(error.message);
			}
			this.log.info(error.config);
		});
	}

	async getMeteoblueDateIntervall(meteoblueAPIURL) {
		intervallGetMeteoblueData = setInterval(async () => {
			await this.getMeteoblueData(meteoblueAPIURL)
		}, 30*60000); //30*60000=1800000ms=30min
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
			clearInterval(intervallGetMeteoblueData);
			this.log.info('cleaned everything up... (#1)');
		} catch (e) {
			callback();
			this.log.info('cleaned everything up... (#2)');
		}
	}
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
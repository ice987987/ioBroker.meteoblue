'use strict';

/*
 * Created with @iobroker/create-adapter v2.0.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
const axios = require('axios').default;

// variables
const isValidApplicationKey = /[a-zA-Z0-9]{12,}/;
const compassDirection = ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const time15min = ['00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00', '02:15', '02:30', '02:45', '03:00', '03:15', '03:30', '03:45', '04:00', '04:15', '04:30', '04:45', '05:00', '05:15', '05:30', '05:45', '06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45', '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45', '12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45', '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30', '22:45', '23:00', '23:15', '23:30', '23:45'];
const time1h = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
const time3h = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];

let createVisHTMLBindingRainspot = null;
let calculateWinddirectionChar = null;

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

		this.meteoblueApiUrl = '';
		this.intervall = null;
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here
		this.log.info('starting adapter "meteoblue"...');

		// Reset the connection indicator during startup
		this.setState('info.connection', false, true);

		// The adapters config (in the instance object everything under the attribute "native") is accessible via this.config:
		this.log.debug(`this.config.applicationKey: ${this.config.applicationKey}`);
		this.log.debug(`this.config.latlongFromSystem: ${this.config.latlongFromSystem}`);
		this.log.debug(`this.config.latitude: ${this.config.latitude}`);
		this.log.debug(`this.config.longitude: ${this.config.longitude}`);
		this.log.debug(`this.config.cityFromSystem: ${this.config.cityFromSystem}`);
		this.log.debug(`this.config.city: ${this.config.city}`);
		this.log.debug(`this.config.elevation: ${this.config.elevation}`);
		this.log.debug(`this.config.timezone: ${this.config.timezone}`);
		this.log.debug(`this.config.tempunitFromSystem: ${this.config.tempunitFromSystem}`);
		this.log.debug(`this.config.tempunit: ${this.config.tempunit}`);
		this.log.debug(`this.config.windspeed: ${this.config.windspeed}`);
		this.log.debug(`this.config.precipitationamount: ${this.config.precipitationamount}`);
		this.log.debug(`this.config.intervall: ${this.config.intervall}`);
		this.log.debug(`this.config.forecastPackage_basic_15min: ${this.config.forecastPackage_basic_15min}`);
		this.log.debug(`this.config.forecastPackage_basic_1h: ${this.config.forecastPackage_basic_1h}`);
		this.log.debug(`this.config.forecastPackage_basic_3h: ${this.config.forecastPackage_basic_3h}`);
		this.log.debug(`this.config.forecastPackage_basic_day: ${this.config.forecastPackage_basic_day}`);
		this.log.debug(`this.config.forecastPackage_current: ${this.config.forecastPackage_current}`);

		// https://docs.meteoblue.com/en/weather-apis/packages-api/introduction#url-parameter
		this.meteoblueApiUrl = 'http://my.meteoblue.com/packages/';

		// load system.config
		const state = await this.getForeignObjectAsync('system.config', 'state');
		// this.log.debug(`state: ${JSON.stringify(state)}`);

		if (state) {

			// check forecast package
			if (!this.config.forecastPackage_basic_15min && !this.config.forecastPackage_basic_1h && !this.config.forecastPackage_basic_3h && !this.config.forecastPackage_basic_day && !this.config.forecastPackage_current) {
				this.log.error('No "forecast Package" selected. Please check configuration! (ERR_#001)');
				return;
			} else {
				if (this.config.forecastPackage_basic_15min) {
					this.meteoblueApiUrl += 'basic-15min_';
				}
				if (this.config.forecastPackage_basic_1h) {
					this.meteoblueApiUrl += 'basic-1h_';
				}
				if (this.config.forecastPackage_basic_3h) {
					this.meteoblueApiUrl += 'basic-3h_';
				}
				if (this.config.forecastPackage_basic_day) {
					this.meteoblueApiUrl += 'basic-day_';
				}
				if (this.config.forecastPackage_current) {
					this.meteoblueApiUrl += 'current_';
				}
				this.meteoblueApiUrl = this.meteoblueApiUrl.substring(0, this.meteoblueApiUrl.length - 1);
				this.meteoblueApiUrl += '?';
			}

			// check applicationKey
			if (!isValidApplicationKey.test(this.config.applicationKey)) {
				this.log.error('"API-Key" is not valid. Please check configuration! (ERR_#002)');
				return;
			}
			this.meteoblueApiUrl += `apikey=${this.config.applicationKey}`;

			// check latitude / longitude
			if (this.config.latlongFromSystem) {
				if (((isNaN(Number(state.common.latitude)) === true) || Number(state.common.latitude) !== 0) && (isNaN(Number(state.common.longitude)) === true || Number(state.common.longitude) !== 0)) {
					this.config.latitude = state.common.latitude;
					this.config.longitude = state.common.longitude;
				} else {
					this.log.error('"Latitude" and/or "longitude" from system settings is/are not valid. Please check configuration! (ERR_#003)');
					return;
				}
			} else if ((Number(this.config.latitude) < -90 || Number(this.config.latitude) > 90) && (Number(this.config.longitude) < -180 || Number(this.config.longitude) > 180)) {
				this.log.error('"Latitude" and/or "longitude" is/are not valid. Please check configuration! (ERR_#004)');
				return;
			}
			this.meteoblueApiUrl += `&lat=${this.config.latitude}&lon=${this.config.longitude}`;

			// check city
			if (this.config.cityFromSystem) {
				if (state.common.city) {
					this.config.city = state.common.city;
				} else {
					this.log.error('"City" from system settings is not valid. Please check configuration! (ERR_#005)');
					return;
				}
			} else if (!this.config.city) {
				this.log.error('"City" is not valid. Pleae check configuration! (ERR_#006)');
				return;
			}
			// convert city to UTF8; see https://docs.meteoblue.com/en/weather-apis/packages-api/introduction#misc
			this.meteoblueApiUrl += `&name=${encodeURIComponent(this.config.city)}`;

			// check elevation
			if (Number(this.config.elevation) < -428 || Number(this.config.elevation) > 8848) {
				this.log.error('"Elevation" is not valid. Please check configuration! (ERR_#007)');
				return;
			}
			this.meteoblueApiUrl += `&asl=${this.config.elevation}`;

			// check timezone
			if (this.config.timezone == null || this.config.timezone == '') {
				this.log.error('"Timezone" not valid. Please check configuration! (ERR_#008)');
				return;
			}
			this.meteoblueApiUrl += `&tz=${this.config.timezone}`;

			// check tempunit
			if (this.config.tempunitFromSystem) {
				if (state.common.tempUnit) {
					this.config.tempunit = (state.common.tempUnit).substr(1, 1);
				} else {
					this.log.error('"Temperature unit" from system settings is not valid. Please check configuration! (ERR_#009)');
					return;
				}
			} else if (this.config.tempunit == null || this.config.tempunit == '') {
				this.log.error('"Temperature unit" not valid. Please check configuration! (ERR_#010)');
				return;
			}
			this.meteoblueApiUrl += `&temperature=${this.config.tempunit}`;

			// check windspeed
			if (this.config.windspeed == null || this.config.windspeed == '') {
				this.log.error('"Unit of windspeed" not valid. Please check configuration! (ERR_#011)');
				return;
			}
			this.meteoblueApiUrl += `&windspeed=${this.config.windspeed}`;

			// check precipitationamount
			if (this.config.precipitationamount == null || this.config.precipitationamount == '') {
				this.log.error('"Unit of precipitationamount" not valid. Please check configuration! (ERR_#012)');
				return;
			}
			this.meteoblueApiUrl += `&precipitationamount=${this.config.precipitationamount}`;
			this.meteoblueApiUrl += '&timeformat=Y-M-D&format=json';

			// check intervall
			if (Number(this.config.intervall) < 1 || Number(this.config.intervall > 1440)) {
				this.log.error('"Polling intervall" not valid. Please check configuration! (ERR_#013)');
				return;
			}

			this.log.debug(`this.meteoblueApiUrl: ${this.meteoblueApiUrl}`);

		}

		try {
			await this.createObjects();
			await this.getMeteoblueData();
			await this.getMeteoblueDateIntervall();
		} catch (error){
			// Reset the connection indicator
			this.setState('info.connection', false, true);
			this.log.error(`${error} (ERR_#014)`);
		}
	}

	async createObjects() {
		this.log.debug('[createObjects]: start objects creation...');
		this.log.debug('[createObjects]: create folder "metadata"');

		// https://github.com/ioBroker/ioBroker/blob/master/doc/STATE_ROLES.md#state-roles
		// create channel metadata
		await this.setObjectNotExistsAsync('metadata', {
			type: 'channel',
			common: {
				name: 'metadata',
				desc: 'metadata'
			},
			native: {}
		});

		// create states metadata
		await this.setObjectNotExistsAsync('metadata.name', {
			type: 'state',
			common: {
				name: 'Location name',
				desc: 'Location name',
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
				name: 'Latitude coordinate in WGS-84',
				desc: 'Latitude coordinate in WGS-84',
				unit: '°N',
				type: 'number',
				role: 'value.gps.latitude',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('metadata.longitude', {
			type: 'state',
			common: {
				name: 'Longitude coordinate in WGS-84',
				desc: 'Longitude coordinate in WGS-84',
				unit: '°E',
				type: 'number',
				role: 'value.gps.longitude',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('metadata.height', {
			type: 'state',
			common: {
				name: 'height',
				desc: 'Elevation in meters above sea level',
				unit: 'm',
				type: 'number',
				role: 'value.gps.elevation',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('metadata.timezone_abbrevation', {
			type: 'state',
			common: {
				name: 'Time zone',
				desc: 'Time zone',
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
				name: 'UTC offset (±hh:mm)',
				desc: 'UTC offset (±hh:mm)',
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
				name: 'Initialisation time of the meteoblue model run which delivers the raw meteoblue model data to the forecast API packages',
				desc: 'Initialisation time of the meteoblue model run which delivers the raw meteoblue model data to the forecast API packages',
				type: 'string',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		await this.setObjectNotExistsAsync('metadata.modelrun_updatetime_utc', {
			type: 'state',
			common: {
				name: 'Displays the time at which the last meteoblue model run has been completed',
				desc: 'Displays the time at which the last meteoblue model run has been completed',
				type: 'string',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		// create channel units
		await this.setObjectNotExistsAsync('units', {
			type: 'channel',
			common: {
				name: 'units',
				desc: 'units'
			},
			native: {}
		});

		// create states metadata
		await this.setObjectNotExistsAsync('units.time', {
			type: 'state',
			common: {
				name: 'Time format',
				desc: 'Time format',
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
				name: 'Unit of temperature',
				desc: 'Unit of temperature',
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
				name: 'Unit of windspeed',
				desc: 'Unit of windspeed',
				type: 'string',
				role: 'value',
				read: true,
				write: false
			},
			native: {}
		});

		// Objetcs only needed in forecastPackages basic_15min, basic_1h, basic_3h and basic_day
		if (this.config.forecastPackage_basic_15min || this.config.forecastPackage_basic_1h || this.config.forecastPackage_basic_3h || this.config.forecastPackage_basic_day) {
			await this.setObjectNotExistsAsync('units.predictability', {
				type: 'state',
				common: {
					name: 'Unit of predictability',
					desc: 'Unit of predictability',
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
					name: 'Unit of precipitation probability',
					desc: 'Unit of precipitation probability',
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
					name: 'Unit of pressure',
					desc: 'Unit of pressure',
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
					name: 'Unit of relative humidity',
					desc: 'Unit of relative humidity',
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
					name: 'Unit of CO',
					desc: 'Unit of CO',
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
					name: 'Unit of winddirection',
					desc: 'Unit of winddirection',
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
					name: 'Unit of precipitation',
					desc: 'Unit of precipitation',
					type: 'string',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});
		} else {
			await this.delObjectAsync('units.predictability');
			await this.delObjectAsync('units.precipitation_probability');
			await this.delObjectAsync('units.pressure');
			await this.delObjectAsync('units.relativehumidity');
			await this.delObjectAsync('units.co');
			await this.delObjectAsync('units.winddirection');
			await this.delObjectAsync('units.precipitation');
		}

		// forecast package: basic_15min
		if (this.config.forecastPackage_basic_15min) {
			this.log.debug('[createObjects]: create folder "data_15min"');
			// create folder data_15min
			await this.setObjectNotExistsAsync('data_15min', {
				type: 'folder',
				common: {
					name: 'data_15min',
					desc: 'data_15min'
				},
				native: {}
			});

			for (let i = 0; i < 8; i++) {
				// minutes j:00_id, j:15_id, j:30_id, j:45_id
				for (let j = 0; j < time15min.length; j++) {
					// create channel
					await this.setObjectNotExistsAsync(`data_15min.${time15min[j]}_+${i}d`, {
						type: 'channel',
						common: {
							name: `forecast ${time15min[j]}_+${i}d`,
							desc: `forecast ${time15min[j]}_+${i}d`,
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_15min.${time15min[j]}_+${i}d.time`, {
						type: 'state',
						common: {
							name: 'Day and time of forecast',
							desc: 'Day and time of forecast',
							type: 'string',
							role: 'value',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_15min.${time15min[j]}_+${i}d.temperature`, {
						type: 'state',
						common: {
							name: 'Temperature, 2m above ground',
							desc: 'Temperature, 2m above ground',
							unit: '°',
							type: 'number',
							role: 'value.temperature.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_15min.${time15min[j]}_+${i}d.felttemperature`, {
						type: 'state',
						common: {
							name: 'Felttemperature, 2m above ground',
							desc: 'Felttemperature, 2m above ground',
							unit: '°',
							type: 'number',
							role: 'value.temperature.feelslike.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_15min.${time15min[j]}_+${i}d.windspeed`, {
						type: 'state',
						common: {
							name: 'Windspeed, 10m above ground',
							desc: 'Windspeed, 10m above ground',
							type: 'number',
							role: 'value.speed.wind.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_15min.${time15min[j]}_+${i}d.winddirectionDeg`, {
						type: 'state',
						common: {
							name: 'Wind direction 10m above ground, degree',
							desc: 'Wind direction 10m above ground, degree',
							unit: '°',
							type: 'number',
							role: 'weather.direction.wind.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_15min.${time15min[j]}_+${i}d.winddirectionChar2`, {
						type: 'state',
						common: {
							name: 'Wind direction 10m above ground, 2 char',
							desc: 'Wind direction 10m above ground, 2 char',
							type: 'string',
							role: 'weather.direction.wind.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_15min.${time15min[j]}_+${i}d.winddirectionChar3`, {
						type: 'state',
						common: {
							name: 'Wind direction 10m above ground, 3 char',
							desc: 'Wind direction 10m above ground, 3 char',
							type: 'string',
							role: 'weather.direction.wind.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_15min.${time15min[j]}_+${i}d.relativehumidity`, {
						type: 'state',
						common: {
							name: 'Relative air humidity',
							desc: 'Relative air humidity',
							unit: '%',
							type: 'number',
							role: 'value.humidity.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_15min.${time15min[j]}_+${i}d.sealevelpressure`, {
						type: 'state',
						common: {
							name: 'Sea level pressure, adjusted to mean sea level',
							desc: 'Sea level pressure, adjusted to mean sea level',
							unit: 'hPa',
							type: 'number',
							role: 'value.pressure.forecast',
							read: true,
							write: false
						},
						native: {}
					});
				}
			}

		} else {
			// delete folder and content of data_15min if exists
			if (await this.getObjectAsync('data_15min')) {
				await this.delObjectAsync('data_15min', {recursive: true});
				this.log.debug('[createObjects]: deleting existing folder with ID "data_15min"');
			}
		}

		// forecast package: basic_1h
		if (this.config.forecastPackage_basic_1h) {
			this.log.debug('[createObjects]: create folder "data_1h"');
			// create folder data_1h
			await this.setObjectNotExistsAsync('data_1h', {
				type: 'folder',
				common: {
					name: 'data_1h',
					desc: 'data_1h'
				},
				native: {}
			});

			for (let i = 0; i < 8; i++) {
				// hours 00:00 to 23:00
				for (let j = 0; j < time1h.length; j++) {
					// create channel
					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d`, {
						type: 'channel',
						common: {
							name: `forecast ${time1h[j]}_+${i}d`,
							desc: `forecast ${time1h[j]}_+${i}d`,
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.time`, {
						type: 'state',
						common: {
							name: 'Day and time of forecast',
							desc: 'Day and time of forecast',
							type: 'string',
							role: 'value',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.precipitation`, {
						type: 'state',
						common: {
							name: 'Precipitation',
							desc: 'Precipitation',
							type: 'number',
							role: 'value.precipitation.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.snowfraction`, {
						type: 'state',
						common: {
							name: 'Snow fraction, information whether precipitation falls as rain or snow',
							desc: 'Snow fraction, information whether precipitation falls as rain or snow',
							type: 'number',
							role: 'value.snowfraction.forecast',
							states: {0: 'rain', 1: 'snow'},
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.rainspot`, {
						type: 'state',
						common: {
							name: 'rainspot (0 ≤ 0.02 mm, 1 = 0.2 - 1.5 mm, 2 = 1.5 - 5 mm, 3 ≥ 5 mm, 9 = 0.02 - 0.2 mm)',
							desc: 'rainspot (0 ≤ 0.02 mm, 1 = 0.2 - 1.5 mm, 2 = 1.5 - 5 mm, 3 ≥ 5 mm, 9 = 0.02 - 0.2 mm)',
							type: 'string',
							role: 'value',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.rainspot_vis`, {
						type: 'state',
						common: {
							name: 'rainspot for vis (html-widget binding)',
							desc: 'rainspot for vis (html-widget binding)',
							type: 'string',
							role: 'html',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.temperature`, {
						type: 'state',
						common: {
							name: 'Temperature, 2m above ground',
							desc: 'Temperature, 2m above ground',
							unit: '°',
							type: 'number',
							role: 'value.temperature.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.felttemperature`, {
						type: 'state',
						common: {
							name: 'Felttemperature, 2m above ground',
							desc: 'Felttemperature, 2m above ground',
							unit: '°',
							type: 'number',
							role: 'value.temperature.feelslike.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.pictocode`, {
						type: 'state',
						common: {
							name: 'Classification of weather conditions "sunny", "partly cloudy" or "overcast with rain" using a numeric number',
							desc: 'Classification of weather conditions "sunny", "partly cloudy" or "overcast with rain" using a numeric number',
							type: 'number',
							role: 'weather.icon.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.windspeed`, {
						type: 'state',
						common: {
							name: 'Windspeed, 10m above ground',
							desc: 'Windspeed, 10m above ground',
							type: 'number',
							role: 'value.speed.wind.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.winddirectionDeg`, {
						type: 'state',
						common: {
							name: 'Wind direction 10m above ground, degree',
							desc: 'Wind direction 10m above ground, degree',
							unit: '°',
							type: 'number',
							role: 'weather.direction.wind.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.winddirectionChar2`, {
						type: 'state',
						common: {
							name: 'Wind direction 10m above ground, 2 char',
							desc: 'Wind direction 10m above ground, 2 char',
							type: 'string',
							role: 'weather.direction.wind.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.winddirectionChar3`, {
						type: 'state',
						common: {
							name: 'Wind direction 10m above ground, 3 char',
							desc: 'Wind direction 10m above ground, 3 char',
							type: 'string',
							role: 'weather.direction.wind.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.relativehumidity`, {
						type: 'state',
						common: {
							name: 'Relative air humidity',
							desc: 'Relative air humidity',
							unit: '%',
							type: 'number',
							role: 'value.humidity.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.sealevelpressure`, {
						type: 'state',
						common: {
							name: 'Sea level pressure, adjusted to mean sea level',
							desc: 'Sea level pressure, adjusted to mean sea level',
							unit: 'hPa',
							type: 'number',
							role: 'value.pressure.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.precipitation_probability`, {
						type: 'state',
						common: {
							name: 'Precipitation Probability',
							desc: 'Precipitation Probability',
							unit: '%',
							type: 'number',
							role: 'value.precipitation_probability.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.convective_precipitation`, {
						type: 'state',
						common: {
							name: 'Water amount, caused by convection e.g. thunderstorms',
							desc: 'Water amount, caused by convection e.g. thunderstorms',
							type: 'number',
							role: 'value',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.isdaylight`, {
						type: 'state',
						common: {
							name: 'Day or night',
							desc: 'Day or night',
							type: 'number',
							role: 'value.isdaylight.forecast',
							states: {0: 'night', 1: 'day'},
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_1h.${time1h[j]}_+${i}d.uvindex`, {
						type: 'state',
						common: {
							name: 'UV-index	on ground level (0 ... 11+)',
							desc: 'UV-index	on ground level (0 ... 11+)',
							type: 'number',
							role: 'value.uv.forecast',
							read: true,
							write: false
						},
						native: {}
					});
				}
			}

		} else {
			// delete folder and content of data_1h if exists
			if (await this.getObjectAsync('data_1h')) {
				await this.delObjectAsync('data_1h', {recursive: true});
				this.log.debug('[createObjects]: deleting existing folder with ID "data_1h"');
			}
		}

		// forecast package: basic_3h
		if (this.config.forecastPackage_basic_3h) {
			this.log.debug('[createObjects]: create folder "data_3h"');
			// create folder data_3h
			await this.setObjectNotExistsAsync('data_3h', {
				type: 'folder',
				common: {
					name: 'data_3h',
					desc: 'data_3h'
				},
				native: {}
			});

			for (let i = 0; i < 8; i++) {
				// hours 00:00 to 23:00_+7d
				for (let j = 0; j < time3h.length; j++) {
					// create channel
					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d`, {
						type: 'channel',
						common: {
							name: 'forecast ' + time3h[i] + '_+' + i + 'd',
							desc: 'forecast ' + time3h[i] + '_+' + i + 'd',
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.rainspot`, {
						type: 'state',
						common: {
							name: 'rainspot (0 ≤ 0.02 mm, 1 = 0.2 - 1.5 mm, 2 = 1.5 - 5 mm, 3 ≥ 5 mm, 9 = 0.02 - 0.2 mm)',
							desc: 'rainspot (0 ≤ 0.02 mm, 1 = 0.2 - 1.5 mm, 2 = 1.5 - 5 mm, 3 ≥ 5 mm, 9 = 0.02 - 0.2 mm)',
							type: 'string',
							role: 'value',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.rainspot_vis`, {
						type: 'state',
						common: {
							name: 'rainspot for vis (html-widget binding)',
							desc: 'rainspot for vis (html-widget binding)',
							type: 'string',
							role: 'html',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.time`, {
						type: 'state',
						common: {
							name: 'Day and time of forecast',
							desc: 'Day and time of forecast',
							type: 'string',
							role: 'value',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.pictocode`, {
						type: 'state',
						common: {
							name: 'Classification of weather conditions "sunny", "partly cloudy" or "overcast with rain" using a numeric number',
							desc: 'Classification of weather conditions "sunny", "partly cloudy" or "overcast with rain" using a numeric number',
							type: 'number',
							role: 'weather.icon.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.precipitation`, {
						type: 'state',
						common: {
							name: 'Precipitation',
							desc: 'Precipitation',
							type: 'number',
							role: 'value.precipitation.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.snowfraction`, {
						type: 'state',
						common: {
							name: 'Snow fraction, information whether precipitation falls as rain or snow',
							desc: 'Snow fraction, information whether precipitation falls as rain or snow',
							type: 'number',
							role: 'value.snowfraction.forecast',
							states: {0: 'rain', 1: 'snow'},
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.precipitation_probability`, {
						type: 'state',
						common: {
							name: 'Precipitation Probability',
							desc: 'Precipitation Probability',
							unit: '%',
							type: 'number',
							role: 'value.precipitation_probability.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.temperature`, {
						type: 'state',
						common: {
							name: 'Maximum temperature, 2m above ground',
							desc: 'Maximum temperature, 2m above ground',
							unit: '°',
							type: 'number',
							role: 'value.temperature.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.felttemperature`, {
						type: 'state',
						common: {
							name: 'Felttemperature, 2m above ground',
							desc: 'Felttemperature, 2m above ground',
							unit: '°',
							type: 'number',
							role: 'value.temperature.feelslike.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.windspeed`, {
						type: 'state',
						common: {
							name: 'Maximum windspeed, 10m above ground',
							desc: 'Maximum windspeed, 10m above ground',
							type: 'number',
							role: 'value.speed.wind.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.winddirectionDeg`, {
						type: 'state',
						common: {
							name: 'Wind direction 10m above ground, degree',
							desc: 'Wind direction 10m above ground, degree',
							unit: '°',
							type: 'number',
							role: 'weather.direction.wind.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.winddirectionChar2`, {
						type: 'state',
						common: {
							name: 'Wind direction 10m above ground, 2 char',
							desc: 'Wind direction 10m above ground, 2 char',
							type: 'string',
							role: 'weather.direction.wind.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.winddirectionChar3`, {
						type: 'state',
						common: {
							name: 'Wind direction 10m above ground, 3 char',
							desc: 'Wind direction 10m above ground, 3 char',
							type: 'string',
							role: 'weather.direction.wind.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.relativehumidity`, {
						type: 'state',
						common: {
							name: 'Relative air humidity',
							desc: 'Relative air humidity',
							unit: '%',
							type: 'number',
							role: 'value.humidity.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.sealevelpressure`, {
						type: 'state',
						common: {
							name: 'Sea level pressure, adjusted to mean sea level',
							desc: 'Sea level pressure, adjusted to mean sea level',
							unit: 'hPa',
							type: 'number',
							role: 'value.pressure.forecast',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.convective_precipitation`, {
						type: 'state',
						common: {
							name: 'Water amount, caused by convection e.g. thunderstorms',
							desc: 'Water amount, caused by convection e.g. thunderstorms',
							type: 'number',
							role: 'value',
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.isdaylight`, {
						type: 'state',
						common: {
							name: 'Day or night',
							desc: 'Day or night',
							type: 'number',
							role: 'value.isdaylight.forecast',
							states: {0: 'night', 1: 'day'},
							read: true,
							write: false
						},
						native: {}
					});

					await this.setObjectNotExistsAsync(`data_3h.${time3h[j]}_+${i}d.uvindex`, {
						type: 'state',
						common: {
							name: 'UV-index	on ground level (0 ... 11+)',
							desc: 'UV-index	on ground level (0 ... 11+)',
							type: 'number',
							role: 'value.uv.forecast',
							read: true,
							write: false
						},
						native: {}
					});
				}

			}
		} else {
			// delete folder and content of data_3h if exists
			if (await this.getObjectAsync('data_3h')) {
				await this.delObjectAsync('data_3h', {recursive: true});
				this.log.debug('[createObjects]: deleting existing folder with ID "data_3h"');
			}
		}

		// forecast package: basic_day
		if (this.config.forecastPackage_basic_day) {
			this.log.debug('[createObjects]: create folder "data_day"');
			// create folder data_day
			await this.setObjectNotExistsAsync('data_day', {
				type: 'folder',
				common: {
					name: 'data_day',
					desc: 'data_day'
				},
				native: {}
			});

			// data_day 0-6
			for (let i = 0; i <= 6; i++) {

				// create channel data_day + i
				await this.setObjectNotExistsAsync(`data_day.+${i}d`, {
					type: 'channel',
					common: {
						name: `forecast +${i}d`,
						desc: `forecast +${i}d`,
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.time`, {
					type: 'state',
					common: {
						name: 'Day of forecast',
						desc: 'Day of forecast',
						type: 'string',
						role: `date.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.pictocode`, {
					type: 'state',
					common: {
						name: 'Classification of weather conditions "sunny", "partly cloudy" or "overcast with rain" using a numeric number',
						desc: 'Classification of weather conditions "sunny", "partly cloudy" or "overcast with rain" using a numeric number',
						type: 'number',
						role: `weather.icon.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.uvindex`, {
					type: 'state',
					common: {
						name: 'UV-index	on ground level (0 ... 11+)',
						desc: 'UV-index	on ground level (0 ... 11+)',
						type: 'number',
						role: `value.uv.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.temperature_max`, {
					type: 'state',
					common: {
						name: 'Maximum temperature, 2m above ground',
						desc: 'Maximum temperature, 2m above ground',
						unit: '°',
						type: 'number',
						role: `value.temperature.max.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.temperature_min`, {
					type: 'state',
					common: {
						name: 'Minimum temperature, 2m above ground',
						desc: 'Minimum temperature, 2m above ground',
						unit: '°',
						type: 'number',
						role: `value.temperature.min.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.temperature_mean`, {
					type: 'state',
					common: {
						name: 'Mean temperature, 2m above ground',
						desc: 'Mean temperature, 2m above ground',
						unit: '°',
						type: 'number',
						role: `value.temperature.mean.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.felttemperature_max`, {
					type: 'state',
					common: {
						name: 'Maximum felttemperature, 2m above ground',
						desc: 'Maximum felttemperature, 2m above ground',
						unit: '°',
						type: 'number',
						role: `value.temperature.feelslike.max.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.felttemperature_min`, {
					type: 'state',
					common: {
						name: 'Minimum felttemperature, 2m above ground',
						desc: 'Minimum felttemperature, 2m above ground',
						unit: '°',
						type: 'number',
						role: `value.temperature.feelslike.min.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.winddirectionDeg`, {
					type: 'state',
					common: {
						name: 'Wind direction 10m above ground, degree',
						desc: 'Wind direction 10m above ground, degree',
						unit: '°',
						type: 'number',
						role: `weather.direction.wind.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.winddirectionChar2`, {
					type: 'state',
					common: {
						name: 'Wind direction 10m above ground, 2 char',
						desc: 'Wind direction 10m above ground, 2 char',
						type: 'string',
						role: `weather.direction.wind.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.winddirectionChar3`, {
					type: 'state',
					common: {
						name: 'Wind direction 10m above ground, 3 char',
						desc: 'Wind direction 10m above ground, 3 char',
						type: 'string',
						role: `weather.direction.wind.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.precipitation_probability`, {
					type: 'state',
					common: {
						name: 'Precipitation probability',
						desc: 'Precipitation probability',
						unit: '%',
						type: 'number',
						role: `value.precipitation_probability.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.rainspot`, {
					type: 'state',
					common: {
						name: 'rainspot (0 ≤ 0.02 mm, 1 = 0.2 - 1.5 mm, 2 = 1.5 - 5 mm, 3 ≥ 5 mm, 9 = 0.02 - 0.2 mm)',
						desc: 'rainspot (0 ≤ 0.02 mm, 1 = 0.2 - 1.5 mm, 2 = 1.5 - 5 mm, 3 ≥ 5 mm, 9 = 0.02 - 0.2 mm)',
						type: 'string',
						role: 'value',
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.rainspot_vis`, {
					type: 'state',
					common: {
						name: 'rainspot for vis (html-widget binding)',
						desc: 'rainspot for vis (html-widget binding)',
						type: 'string',
						role: 'html',
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.predictability_class`, {
					type: 'state',
					common: {
						name: 'Predictability class (1 = very low, 5 = very high)',
						desc: 'Predictability class (1 = very low, 5 = very high)',
						type: 'number',
						role: `value.predictability_class.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.predictability`, {
					type: 'state',
					common: {
						name: 'Predictability (24h)',
						desc: 'Predictability (24h)',
						unit: '%',
						type: 'number',
						role: `value.predictability.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.precipitation`, {
					type: 'state',
					common: {
						name: 'Precipitation, total amount of Water',
						desc: 'Precipitation, total amount of Water',
						type: 'number',
						role: `value.precipitation.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.snowfraction`, {
					type: 'state',
					common: {
						name: 'Snow fraction, information whether precipitation falls as rain or snow',
						desc: 'Snow fraction, information whether precipitation falls as rain or snow',
						type: 'number',
						role: `value.snowfraction.forecast.${i}`,
						states: {0: 'rain', 1: 'snow'},
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.sealevelpressure_max`, {
					type: 'state',
					common: {
						name: 'Maximum sea level pressure, adjusted to mean sea level',
						desc: 'Maximum sea level pressure, adjusted to mean sea level',
						unit: 'hPa',
						type: 'number',
						role: `value.pressure.max.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.sealevelpressure_min`, {
					type: 'state',
					common: {
						name: 'Minimum sea level pressure, adjusted to mean sea level',
						desc: 'Minimum sea level pressure, adjusted to mean sea level',
						unit: 'hPa',
						type: 'number',
						role: `value.pressure.min.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.sealevelpressure_mean`, {
					type: 'state',
					common: {
						name: 'Mean sea level pressure, adjusted to mean sea level',
						desc: 'Mean sea level pressure, adjusted to mean sea level',
						unit: 'hPa',
						type: 'number',
						role: `value.pressure.mean.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.windspeed_max`, {
					type: 'state',
					common: {
						name: 'Maximum windspeed, 10m above ground',
						desc: 'Maximum windspeed, 10m above ground',
						type: 'number',
						role: `value.speed.wind.max.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.windspeed_mean`, {
					type: 'state',
					common: {
						name: 'Mean windspeed, 10m above ground',
						desc: 'Mean windspeed, 10m above ground',
						type: 'number',
						role: `value.speed.wind.mean.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.windspeed_min`, {
					type: 'state',
					common: {
						name: 'Minimum windspeed, 10m above ground',
						desc: 'Minimum windspeed, 10m above ground',
						type: 'number',
						role: `value.speed.wind.min.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.relativehumidity_max`, {
					type: 'state',
					common: {
						name: 'Maximum relative air humidity',
						desc: 'Maximum relative air humidity',
						unit: '%',
						type: 'number',
						role: `value.humidity.max.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.relativehumidity_min`, {
					type: 'state',
					common: {
						name: 'Mimimum relative air humidity',
						desc: 'Mimimum relative air humidity',
						unit: '%',
						type: 'number',
						role: `value.humidity.min.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.relativehumidity_mean`, {
					type: 'state',
					common: {
						name: 'Mean relative air humidity',
						desc: 'Mean relative air humidity',
						unit: '%',
						type: 'number',
						role: `value.humidity.mean.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.convective_precipitation`, {
					type: 'state',
					common: {
						name: 'Water amount, caused by convection e.g. thunderstorms',
						desc: 'Water amount, caused by convection e.g. thunderstorms',
						type: 'number',
						role: `value.convective_precipitation.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.precipitation_hours`, {
					type: 'state',
					common: {
						name: 'Hours with precipitation',
						desc: 'Hours with precipitation',
						unit: 'h',
						type: 'number',
						role: `value.precipitation_hours.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});

				await this.setObjectNotExistsAsync(`data_day.+${i}d.humiditygreater90_hours`, {
					type: 'state',
					common: {
						name: 'Hours with humidity greater than 90%',
						desc: 'Hours with humidity greater than 90%',
						unit: 'h',
						type: 'number',
						role: `value.humiditygreater90_hours.forecast.${i}`,
						read: true,
						write: false
					},
					native: {}
				});
			}
		} else {
			// delete folder and content of data_day if exists
			if (await this.getObjectAsync('data_day')) {
				await this.delObjectAsync('data_day', {recursive: true});
				this.log.debug('[createObjects]: deleting existing folder with ID "data_day"');
			}
		}

		// forecast package: basic_day
		if (this.config.forecastPackage_current) {
			this.log.debug('[createObjects]: create folder "current"');
			// create folder data_day
			await this.setObjectNotExistsAsync('current', {
				type: 'folder',
				common: {
					name: 'current',
					desc: 'current'
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('current.time', {
				type: 'state',
				common: {
					name: 'Day of forecast',
					desc: 'Day of forecast',
					type: 'string',
					role: `date.forecast.0`,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('current.pictocode', {
				type: 'state',
				common: {
					name: 'Classification of weather conditions "sunny", "partly cloudy" or "overcast with rain" using a numeric number (1-17)',
					desc: 'Classification of weather conditions "sunny", "partly cloudy" or "overcast with rain" using a numeric number (1-17)',
					type: 'number',
					role: `weather.icon.forecast.0`,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('current.temperature', {
				type: 'state',
				common: {
					name: 'Temperature, 2m above ground',
					desc: 'Temperature, 2m above ground',
					unit: '°',
					type: 'number',
					role: 'value.temperature.forecast.0',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('current.isdaylight', {
				type: 'state',
				common: {
					name: 'Day or night',
					desc: 'Day or night',
					type: 'number',
					role: 'value.isdaylight.forecast',
					states: {0: 'night', 1: 'day'},
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('current.windspeed', {
				type: 'state',
				common: {
					name: 'Windspeed, 10m above ground',
					desc: 'Windspeed, 10m above ground',
					type: 'number',
					role: 'value.speed.wind.forecast.0',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('current.isobserveddata', {
				type: 'state',
				common: {
					name: 'Is observed data',
					desc: 'Is observed data',
					type: 'number',
					role: 'value.isobserveddata.forecast.0',
					states: {0: 'no obs', 1: 'obs available'},
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('current.zenithangle', {
				type: 'state',
				common: {
					name: 'Angle between zenith and centre of the suns disc',
					desc: 'Angle between zenith and centre of the suns disc',
					unit: '°',
					type: 'number',
					role: 'value.zenithangle.forecast.0',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('current.pictocode_detailed', {
				type: 'state',
				common: {
					name: 'Classification of weather conditions "sunny", "partly cloudy" or "overcast with rain" using a numeric number (1-35)',
					desc: 'Classification of weather conditions "sunny", "partly cloudy" or "overcast with rain" using a numeric number (1-35)',
					type: 'number',
					role: 'weather.icon.forecast',
					read: true,
					write: false
				},
				native: {}
			});

		} else {
			// delete folder and content of current if exists
			if (await this.getObjectAsync('current')) {
				await this.delObjectAsync('current', {recursive: true});
				this.log.debug('[createObjects]: deleting existing folder with ID "current"');
			}
		}
		this.log.debug('[createObjects]: Objects created.');
	}

	createVisHTMLBindingRainspot(day) {
		// https://content.meteoblue.com/en/spatial-dimensions/spot
		let counter = 0;
		// correction of +2px/-2px due to basic-HTML widget issues
		let html = '<style> ' +
						'table.meteoblue {width: 100%; height: 100%; border: none; border-collapse: collapse; empty-cells: show; } ' +
						'table.meteoblue tr {height: calc(100% / 7); } ' +
						'table.meteoblue td {width: calc(100% / 7); } ' +
						'table.meteoblue td.value0 {background-color: rgba(0, 0, 0, 0); } ' +
						'table.meteoblue td.value1 {background-color: rgba(19, 238, 252, 1); } ' +
						'table.meteoblue td.value2 {background-color: rgba(58, 170, 220, 1); } ' +
						'table.meteoblue td.value3 {background-color: rgba(23, 116, 196, 1); } ' +
						'table.meteoblue td.value9 {background-color: rgba(38, 215, 146, 1); } ' +
						'#meteoblueMain {position: absolute; top: 0px; left: 0px; width: 100%; height: 100%; border: none; } ' +
						'#meteoblueCircle1 {position: absolute; top: 0px; left: 0px; width: calc(100% - 2px); height: calc(100% - 2px); border: 1px solid rgba(109, 109, 114, 1); border-radius: 50%; } ' +
						'#meteoblueCircle2 {position: absolute; top: calc(((100% - 2px) / 7) * 1); left: calc(((100% - 2px) / 7) * 1); width: calc(((100% - 2px) / 7) * 5); height: calc(((100% - 2px) / 7) * 5); border: 1px solid rgba(109, 109, 114, 1); border-radius: 50%; } ' +
						'#meteoblueCircle3 {position: absolute; top: calc(((100% - 2px) / 7) * 2); left: calc(((100% - 2px) / 7) * 2); width: calc(((100% - 2px) / 7) * 3); height: calc(((100% - 2px) / 7) * 3); border: 1px solid rgba(109, 109, 114, 1); border-radius: 50%; } ' +
						'#meteoblueCircle4 {position: absolute; top: calc(((100% - 2px) / 7) * 3); left: calc(((100% - 2px) / 7) * 3); width: calc(((100% - 2px) / 7) * 1); height: calc(((100% - 2px) / 7) * 1); border: 1px solid rgba(109, 109, 114, 1); border-radius: 50%; } ' +
						'#meteoblueLineleft {position: absolute; top: calc((100% - 2px) / 2); left: 0px; border: 0.5px solid rgba(109, 109, 114, 0.5); width: calc(100% / 14); height: 0px; } ' +
						'#meteoblueLineright {position: absolute; top: calc((100% - 2px) / 2); right: 0px; border: 0.5px solid rgba(109, 109, 114, 0.5); width: calc(100% / 14); } ' +
						'#meteoblueLinetop {position: absolute; top: 0px; left: calc((100% - 2px) / 2); border: 0.5px solid rgba(109, 109, 114, 0.5); width: 0px; height: calc(100% / 14); } ' +
						'#meteoblueLinedown {position: absolute; top: calc((100% - 2px) - ((100% - 2px) / 14)); left: calc((100% - 2px) / 2); border: 0.5px solid rgba(109, 109, 114, 0.5); width: 0px; height: calc(100% / 14); } ' +
					'</style> ' +
					'<div id="meteoblueMain"> ' +
					'<div id="meteoblueCircle1"></div> ' +
					'<div id="meteoblueCircle2"></div> ' +
					'<div id="meteoblueCircle3"></div> ' +
					'<div id="meteoblueCircle4"></div> ' +
					'<div id="meteoblueLineleft"></div> ' +
					'<div id="meteoblueLineright"></div> ' +
					'<div id="meteoblueLinetop"></div> ' +
					'<div id="meteoblueLinedown"></div> ' +
					'<table class="meteoblue"> ';
		for (let i = 0; i < 7; i++) {
			html += '<tr> ';
			for (let j = 0; j < 7; j++) {
				html += '<td class ="value' + day.substr(counter, 1) + '"></td> ';
				counter += 1;
			}
			html += '</tr> ';
		}
		html += '</table></div>';
		return html;
	}

	calculateWinddirectionChar(degree) {
		// https://docs.meteoblue.com/en/meteo/variables/weather-variables#wind-direction
		const value2 = Math.round(degree / 45);
		const value3 = Math.round(degree / 22.5);
		return [compassDirection[(value2 % 8) * 2], compassDirection[value3 % 16]];
	}

	async getMeteoblueData() {
		await axios({
			method: 'get',
			url: this.meteoblueApiUrl,
			timeout: 2000,
			responseType: 'json'
		})
			.then((response) => {

				this.setState('info.connection', true, true);

				this.log.debug(`[getMeteoblueData]: HTTP status response: ${response.status} ${response.statusText}; config: ${JSON.stringify(response.config)}; headers: ${JSON.stringify(response.headers)}; data: ${JSON.stringify(response.data)}`);
				const content = response.data;

				// metadata
				this.setState('metadata.name', {val: content.metadata.name, ack: true});
				this.setState('metadata.latitude', {val: content.metadata.latitude, ack: true});
				this.setState('metadata.longitude', {val: content.metadata.longitude, ack: true});
				this.setState('metadata.height', {val: content.metadata.height, ack: true});
				this.setState('metadata.timezone_abbrevation', {val: content.metadata.timezone_abbrevation, ack: true});
				this.setState('metadata.utc_timeoffset', {val: content.metadata.utc_timeoffset, ack: true});
				this.setState('metadata.modelrun_utc', {val: content.metadata.modelrun_utc, ack: true});
				this.setState('metadata.modelrun_updatetime_utc', {val: content.metadata.modelrun_updatetime_utc, ack: true});

				// units
				this.setState('units.time', {val: content.units.time, ack: true});
				this.setState('units.temperature', {val: content.units.temperature, ack: true});
				this.setState('units.windspeed', {val: content.units.windspeed, ack: true});

				// Objetcs only needed in forecastPackages basic_15min, basic_1h, basic_3h and basic_day
				if (this.config.forecastPackage_basic_15min || this.config.forecastPackage_basic_1h || this.config.forecastPackage_basic_3h || this.config.forecastPackage_basic_day) {
					this.setState('units.predictability', {val: content.units.predictability, ack: true});
					this.setState('units.precipitation_probability', {val: content.units.precipitation_probability, ack: true});
					this.setState('units.pressure', {val: content.units.pressure, ack: true});
					this.setState('units.relativehumidity', {val: content.units.relativehumidity, ack: true});
					this.setState('units.co', {val: content.units.co, ack: true});
					this.setState('units.winddirection', {val: content.units.winddirection, ack: true});
					this.setState('units.precipitation', {val: content.units.precipitation, ack: true});
				}

				// data_xmin 00:00 - 23:45
				if (content.data_xmin && this.config.forecastPackage_basic_15min) {
					let k = 0;

					for (let i = 0; i < 8; i++) {
						// minutes j:00_id, j:15_id, j:30_id, j:45_id
						for (let j = 0; j < time15min.length; j++) {

							calculateWinddirectionChar = this.calculateWinddirectionChar(content.data_xmin.winddirection[k]);

							this.setState(`data_15min.${time15min[j]}_+${i}d.time`, {val: content.data_xmin.time[k], ack: true});
							this.setState(`data_15min.${time15min[j]}_+${i}d.temperature`, {val: content.data_xmin.temperature[k], ack: true});
							this.setState(`data_15min.${time15min[j]}_+${i}d.felttemperature`, {val: content.data_xmin.felttemperature[k], ack: true});
							this.setState(`data_15min.${time15min[j]}_+${i}d.windspeed`, {val: content.data_xmin.windspeed[k], ack: true});

							this.setState(`data_15min.${time15min[j]}_+${i}d.winddirectionDeg`, {val: content.data_xmin.winddirection[k], ack: true});
							this.setState(`data_15min.${time15min[j]}_+${i}d.winddirectionChar2`, {val: calculateWinddirectionChar[0], ack: true});
							this.setState(`data_15min.${time15min[j]}_+${i}d.winddirectionChar3`, {val: calculateWinddirectionChar[1], ack: true});

							this.setState(`data_15min.${time15min[j]}_+${i}d.relativehumidity`, {val: content.data_xmin.relativehumidity[k], ack: true});
							this.setState(`data_15min.${time15min[j]}_+${i}d.sealevelpressure`, {val: content.data_xmin.sealevelpressure[k], ack: true});
							k += 1;
						}
					}
				}

				// data_1h 00:00 - 23:00 (24DP's)
				if (content.data_1h && this.config.forecastPackage_basic_1h) {
					let k = 0;

					for (let i = 0; i < 8; i++) {
						// hours 00:00 to 23:00
						for (let j = 0; j < time1h.length; j++) {
							calculateWinddirectionChar = this.calculateWinddirectionChar(content.data_1h.winddirection[k]);
							createVisHTMLBindingRainspot = this.createVisHTMLBindingRainspot(content.data_1h.rainspot[k]);

							this.setState(`data_1h.${time1h[j]}_+${i}d.time`, {val: content.data_1h.time[k], ack: true});
							this.setState(`data_1h.${time1h[j]}_+${i}d.precipitation`, {val: content.data_1h.precipitation[k], ack: true});
							this.setState(`data_1h.${time1h[j]}_+${i}d.snowfraction`, {val: content.data_1h.snowfraction[k], ack: true});
							this.setState(`data_1h.${time1h[j]}_+${i}d.rainspot`, {val: content.data_1h.rainspot[k], ack: true});
							this.setState(`data_1h.${time1h[j]}_+${i}d.rainspot_vis`, {val: createVisHTMLBindingRainspot, ack: true});
							this.setState(`data_1h.${time1h[j]}_+${i}d.temperature`, {val: content.data_1h.temperature[k], ack: true});
							this.setState(`data_1h.${time1h[j]}_+${i}d.felttemperature`, {val: content.data_1h.felttemperature[k], ack: true});
							this.setState(`data_1h.${time1h[j]}_+${i}d.pictocode`, {val: content.data_1h.pictocode[k], ack: true});
							this.setState(`data_1h.${time1h[j]}_+${i}d.windspeed`, {val: content.data_1h.windspeed[k], ack: true});

							this.setState(`data_1h.${time1h[j]}_+${i}d.winddirectionDeg`, {val: content.data_1h.winddirection[k], ack: true});
							this.setState(`data_1h.${time1h[j]}_+${i}d.winddirectionChar2`, {val: calculateWinddirectionChar[0], ack: true});
							this.setState(`data_1h.${time1h[j]}_+${i}d.winddirectionChar3`, {val: calculateWinddirectionChar[1], ack: true});

							this.setState(`data_1h.${time1h[j]}_+${i}d.relativehumidity`, {val: content.data_1h.relativehumidity[k], ack: true});
							this.setState(`data_1h.${time1h[j]}_+${i}d.sealevelpressure`, {val: content.data_1h.sealevelpressure[k], ack: true});
							this.setState(`data_1h.${time1h[j]}_+${i}d.precipitation_probability`, {val: content.data_1h.precipitation_probability[k], ack: true});
							this.setState(`data_1h.${time1h[j]}_+${i}d.convective_precipitation`, {val: content.data_1h.convective_precipitation[k], ack: true});
							this.setState(`data_1h.${time1h[j]}_+${i}d.isdaylight`, {val: content.data_1h.isdaylight[k], ack: true});
							this.setState(`data_1h.${time1h[j]}_+${i}d.uvindex`, {val: content.data_1h.uvindex[k], ack: true});
							k += 1;
						}
					}
				}

				// data_3h 00:00 - 00:00 (xxDP's)
				if (content.data_3h && this.config.forecastPackage_basic_3h) {
					let k = 0;

					for (let i = 0; i < 8; i++) {
						for (let j = 0; j < time3h.length; j++) {
							calculateWinddirectionChar = this.calculateWinddirectionChar(content.data_3h.winddirection[k]);
							createVisHTMLBindingRainspot = this.createVisHTMLBindingRainspot(content.data_3h.rainspot[k]);

							this.setState(`data_3h.${time3h[j]}_+${i}d.rainspot`, {val: content.data_3h.rainspot[k], ack: true});
							this.setState(`data_3h.${time3h[j]}_+${i}d.rainspot_vis`, {val: createVisHTMLBindingRainspot, ack: true});
							this.setState(`data_3h.${time3h[j]}_+${i}d.time`, {val: content.data_3h.time[k], ack: true});
							this.setState(`data_3h.${time3h[j]}_+${i}d.pictocode`, {val: content.data_3h.pictocode[k], ack: true});
							this.setState(`data_3h.${time3h[j]}_+${i}d.precipitation`, {val: content.data_3h.precipitation[k], ack: true});
							this.setState(`data_3h.${time3h[j]}_+${i}d.snowfraction`, {val: content.data_3h.snowfraction[k], ack: true});
							this.setState(`data_3h.${time3h[j]}_+${i}d.precipitation_probability`, {val: content.data_3h.precipitation_probability[k], ack: true});
							this.setState(`data_3h.${time3h[j]}_+${i}d.temperature`, {val: content.data_3h.temperature[k], ack: true});
							this.setState(`data_3h.${time3h[j]}_+${i}d.felttemperature`, {val: content.data_3h.felttemperature[k], ack: true});
							this.setState(`data_3h.${time3h[j]}_+${i}d.windspeed`, {val: content.data_3h.windspeed[k], ack: true});

							this.setState(`data_3h.${time3h[j]}_+${i}d.winddirectionDeg`, {val: content.data_3h.winddirection[k], ack: true});
							this.setState(`data_3h.${time3h[j]}_+${i}d.winddirectionChar2`, {val: calculateWinddirectionChar[0], ack: true});
							this.setState(`data_3h.${time3h[j]}_+${i}d.winddirectionChar3`, {val: calculateWinddirectionChar[1], ack: true});
							this.setState(`data_3h.${time3h[j]}_+${i}d.relativehumidity`, {val: content.data_3h.relativehumidity[k], ack: true});
							this.setState(`data_3h.${time3h[j]}_+${i}d.sealevelpressure`, {val: content.data_3h.sealevelpressure[k], ack: true});
							this.setState(`data_3h.${time3h[j]}_+${i}d.convective_precipitation`, {val: content.data_3h.convective_precipitation[k], ack: true});
							this.setState(`data_3h.${time3h[j]}_+${i}d.isdaylight`, {val: content.data_3h.isdaylight[k], ack: true});
							this.setState(`data_3h.${time3h[j]}_+${i}d.uvindex`, {val: content.data_3h.uvindex[k], ack: true});
							k += 1;
						}
					}
				}

				// data_day 0-6
				if (content.data_day && this.config.forecastPackage_basic_day) {
					for (let i = 0; i <= 6; i++) {
						createVisHTMLBindingRainspot = this.createVisHTMLBindingRainspot(content.data_day.rainspot[i]);
						calculateWinddirectionChar = this.calculateWinddirectionChar(content.data_day.winddirection[i]);

						this.setState(`data_day.+${i}d.time`, {val: content.data_day.time[i], ack: true});
						this.setState(`data_day.+${i}d.pictocode`, {val: content.data_day.pictocode[i], ack: true});
						this.setState(`data_day.+${i}d.uvindex`, {val: content.data_day.uvindex[i], ack: true});
						this.setState(`data_day.+${i}d.temperature_max`, {val: content.data_day.temperature_max[i], ack: true});
						this.setState(`data_day.+${i}d.temperature_min`, {val: content.data_day.temperature_min[i], ack: true});
						this.setState(`data_day.+${i}d.temperature_mean`, {val: content.data_day.temperature_mean[i], ack: true});
						this.setState(`data_day.+${i}d.felttemperature_max`, {val: content.data_day.felttemperature_max[i], ack: true});
						this.setState(`data_day.+${i}d.felttemperature_min`, {val: content.data_day.felttemperature_min[i], ack: true});

						this.setState(`data_day.+${i}d.winddirectionDeg`, {val: content.data_day.winddirection[i], ack: true});
						this.setState(`data_day.+${i}d.winddirectionChar2`, {val: calculateWinddirectionChar[0], ack: true});
						this.setState(`data_day.+${i}d.winddirectionChar3`, {val: calculateWinddirectionChar[1], ack: true});

						this.setState(`data_day.+${i}d.precipitation_probability`, {val: content.data_day.precipitation_probability[i], ack: true});
						this.setState(`data_day.+${i}d.rainspot`, {val: content.data_day.rainspot[i], ack: true});
						this.setState(`data_day.+${i}d.rainspot_vis`, {val: createVisHTMLBindingRainspot, ack: true});
						this.setState(`data_day.+${i}d.predictability_class`, {val: content.data_day.predictability_class[i], ack: true});
						this.setState(`data_day.+${i}d.predictability`, {val: content.data_day.predictability[i], ack: true});
						this.setState(`data_day.+${i}d.precipitation`, {val: content.data_day.precipitation[i], ack: true});
						this.setState(`data_day.+${i}d.snowfraction`, {val: content.data_day.snowfraction[i], ack: true});
						this.setState(`data_day.+${i}d.sealevelpressure_max`, {val: content.data_day.sealevelpressure_max[i], ack: true});
						this.setState(`data_day.+${i}d.sealevelpressure_min`, {val: content.data_day.sealevelpressure_min[i], ack: true});
						this.setState(`data_day.+${i}d.sealevelpressure_mean`, {val: content.data_day.sealevelpressure_mean[i], ack: true});
						this.setState(`data_day.+${i}d.windspeed_max`, {val: content.data_day.windspeed_max[i], ack: true});
						this.setState(`data_day.+${i}d.windspeed_mean`, {val: content.data_day.windspeed_mean[i], ack: true});
						this.setState(`data_day.+${i}d.windspeed_min`, {val: content.data_day.windspeed_min[i], ack: true});
						this.setState(`data_day.+${i}d.relativehumidity_max`, {val: content.data_day.relativehumidity_max[i], ack: true});
						this.setState(`data_day.+${i}d.relativehumidity_min`, {val: content.data_day.relativehumidity_min[i], ack: true});
						this.setState(`data_day.+${i}d.relativehumidity_mean`, {val: content.data_day.relativehumidity_mean[i], ack: true});
						this.setState(`data_day.+${i}d.convective_precipitation`, {val: content.data_day.convective_precipitation[i], ack: true});
						this.setState(`data_day.+${i}d.precipitation_hours`, {val: content.data_day.precipitation_hours[i], ack: true});
						this.setState(`data_day.+${i}d.humiditygreater90_hours`, {val: content.data_day.humiditygreater90_hours[i], ack: true});
					}
				}

				// current
				if (content.data_current && this.config.forecastPackage_current) {
					this.setState('current.pictocode', {val: content.data_current.pictocode, ack: true});
					this.setState('current.time', {val: content.data_current.time, ack: true});
					this.setState('current.temperature', {val: content.data_current.temperature, ack: true});
					this.setState('current.isdaylight', {val: content.data_current.isdaylight, ack: true});
					this.setState('current.windspeed', {val: content.data_current.windspeed, ack: true});
					this.setState('current.isobserveddata', {val: content.data_current.isobserveddata, ack: true});
					this.setState('current.zenithangle', {val: content.data_current.zenithangle, ack: true});
					this.setState('current.pictocode_detailed', {val: content.data_current.pictocode_detailed, ack: true});
				}
				this.log.debug('[getMeteoblueData]: all states written.');

			})
			.catch((error) => {
				if (error.response) {
					// The request was made and the server responded with a status code that falls out of the range of 2xx
					this.log.debug(`[getMeteoblueData]: HTTP status response: ${error.response.status}; headers: ${JSON.stringify(error.response.headers)}; data: ${JSON.stringify(error.response.data)}`);
				} else if (error.request) {
					// The request was made but no response was received `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
					this.log.debug(`[getMeteoblueData]: error request: ${error}`);
				} else {
					// Something happened in setting up the request that triggered an Error
					this.log.debug(`[getMeteoblueData]: error message: ${error.message}`);
				}
				this.log.debug(`[getMeteoblueData]: error.config: ${JSON.stringify(error.config)}`);
				throw new Error(`"Meteoblue API" not reachable. ${error.response.data.error_message} (ERR_#015)`);
			});
	}

	async getMeteoblueDateIntervall() {
		this.log.info(`[getMeteoblueData]: Starting polltimer with a ${this.config.intervall} minutes interval.`);
		try {
			this.intervall = setInterval(async () => {
				await this.getMeteoblueData();
			}, this.config.intervall * 60000);
		} catch (error) {
			this.log.error(`${error}: (ERR_#016)`);
		}
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			this.intervall && clearInterval(this.intervall);

			this.setState('info.connection', false, true);

			callback();
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
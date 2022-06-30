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

		// https://docs.meteoblue.com/en/weather-apis/packages-api/introduction#url-parameter
		this.meteoblueApiUrl = 'http://my.meteoblue.com/packages/basic-day?';

		// load system.config
		const state = await this.getForeignObjectAsync('system.config', 'state');
		// this.log.debug(`state: ${JSON.stringify(state)}`);

		if (state) {

			// check applicationKey
			if (!isValidApplicationKey.test(this.config.applicationKey)) {
				this.log.error('"API-Key" is not valid. Please check configuration! (ERR_#001)');
				return;
			}
			this.meteoblueApiUrl += `apikey=${this.config.applicationKey}`;

			// check latitude / longitude
			if (this.config.latlongFromSystem) {
				if (((isNaN(Number(state.common.latitude)) === true) || Number(state.common.latitude) !== 0) && (isNaN(Number(state.common.longitude)) === true || Number(state.common.longitude) !== 0)) {
					this.config.latitude = state.common.latitude;
					this.config.longitude = state.common.longitude;
				} else {
					this.log.error('"Latitude" and/or "longitude" from system settings is/are not valid. Please check configuration! (ERR_#002)');
					return;
				}
			} else if ((Number(this.config.latitude) < -90 || Number(this.config.latitude) > 90) && (Number(this.config.longitude) < -180 || Number(this.config.longitude) > 180)) {
				this.log.error('"Latitude" and/or "longitude" is/are not valid. Please check configuration! (ERR_#003)');
				return;
			}
			this.meteoblueApiUrl += `&lat=${this.config.latitude}&lon=${this.config.longitude}`;

			// check city
			if (this.config.cityFromSystem) {
				if (state.common.city) {
					this.config.city = state.common.city;
				} else {
					this.log.error('"City" from system settings is not valid. Please check configuration! (ERR_#004)');
					return;
				}
			} else if (!this.config.city) {
				this.log.error('"City" is not valid. Pleae check configuration! (ERR_#005)');
				return;
			}
			// convert city to UTF8; see https://docs.meteoblue.com/en/weather-apis/packages-api/introduction#misc
			this.meteoblueApiUrl += `&name=${encodeURIComponent(this.config.city)}`;

			// check elevation
			if (Number(this.config.elevation) < -428 || Number(this.config.elevation) > 8848) {
				this.log.error('"Elevation" is not valid. Please check configuration! (ERR_#004)');
				return;
			}
			this.meteoblueApiUrl += `&asl=${this.config.elevation}`;

			// check timezone
			if (this.config.timezone == null || this.config.timezone == '') {
				this.log.error('"Timezone" not valid. Please check configuration! (ERR_#006)');
				return;
			}
			this.meteoblueApiUrl += `&tz=${this.config.timezone}`;

			// check tempunit
			if (this.config.tempunitFromSystem) {
				if (state.common.tempUnit) {
					this.config.tempunit = (state.common.tempUnit).substr(1, 1);
				} else {
					this.log.error('"Temperature unit" from system settings is not valid. Please check configuration! (ERR_#007)');
					return;
				}
			} else if (this.config.tempunit == null || this.config.tempunit == '') {
				this.log.error('"Temperature unit" not valid. Please check configuration! (ERR_#008)');
				return;
			}
			this.meteoblueApiUrl += `&temperature=${this.config.tempunit}`;

			// check windspeed
			if (this.config.windspeed == null || this.config.windspeed == '') {
				this.log.error('"Unit of windspeed" not valid. Please check configuration! (ERR_#009)');
				return;
			}
			this.meteoblueApiUrl += `&windspeed=${this.config.windspeed}`;

			// check precipitationamount
			if (this.config.precipitationamount == null || this.config.precipitationamount == '') {
				this.log.error('"Unit of precipitationamount" not valid. Please check configuration! (ERR_#010)');
				return;
			}
			this.meteoblueApiUrl += `&precipitationamount=${this.config.precipitationamount}`;

			this.meteoblueApiUrl += '&timeformat=Y-M-D&format=json';

			this.log.debug(`this.meteoblueApiUrl: ${this.meteoblueApiUrl}`);

		}

		try {
			await this.createObjects();
			await this.getMeteoblueData();
			await this.getMeteoblueDateIntervall();
		} catch (error){
			// Reset the connection indicator
			this.setState('info.connection', false, true);
			this.log.error(`${error}`);
		}
	}

	async createObjects() {
		this.log.debug('[createObjects]: start objects creation...');

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
				role: 'date',
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
				role: 'date',
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
			await this.setObjectNotExistsAsync('data_day.' + i, {
				type: 'channel',
				common: {
					name: 'forecast data of day ' + i,
					desc: 'forecast data of day ' + i
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.time', {
				type: 'state',
				common: {
					name: 'Day of forecast',
					desc: 'Day of forecast',
					type: 'string',
					role: 'date.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.pictocode', {
				type: 'state',
				common: {
					name: 'Classification of weather conditions "sunny", "partly cloudy" or "overcast with rain" using a numeric number',
					desc: 'Classification of weather conditions "sunny", "partly cloudy" or "overcast with rain" using a numeric number',
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
					name: 'UV-index	on ground level (0 ... 11+)',
					desc: 'UV-index	on ground level (0 ... 11+)',
					type: 'number',
					role: 'value.uv.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.temperature_max', {
				type: 'state',
				common: {
					name: 'Maximum temperature, 2m above ground',
					desc: 'Maximum temperature, 2m above ground',
					unit: '°',
					type: 'number',
					role: 'value.temperature.max.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.temperature_min', {
				type: 'state',
				common: {
					name: 'Minimum temperature, 2m above ground',
					desc: 'Minimum temperature, 2m above ground',
					unit: '°',
					type: 'number',
					role: 'value.temperature.min.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.temperature_mean', {
				type: 'state',
				common: {
					name: 'Mean temperature, 2m above ground',
					desc: 'Mean temperature, 2m above ground',
					unit: '°',
					type: 'number',
					role: 'value.temperature.mean.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.felttemperature_max', {
				type: 'state',
				common: {
					name: 'Maximum felttemperature, 2m above ground',
					desc: 'Maximum felttemperature, 2m above ground',
					unit: '°',
					type: 'number',
					role: 'value.felttemperature.max.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.felttemperature_min', {
				type: 'state',
				common: {
					name: 'Minimum felttemperature, 2m above ground',
					desc: 'Minimum felttemperature, 2m above ground',
					unit: '°',
					type: 'number',
					role: 'value.felttemperature.min.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.winddirectionDeg', {
				type: 'state',
				common: {
					name: 'Wind direction 10m above ground, degree',
					desc: 'Wind direction 10m above ground, degree',
					unit: '°',
					type: 'number',
					role: 'value.direction.wind.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.winddirectionChar2', {
				type: 'state',
				common: {
					name: 'Wind direction 10m above ground, 2 char',
					desc: 'Wind direction 10m above ground, 2 char',
					type: 'string',
					role: 'weather.direction.wind.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.winddirectionChar3', {
				type: 'state',
				common: {
					name: 'Wind direction 10m above ground, 3 char',
					desc: 'Wind direction 10m above ground, 3 char',
					type: 'string',
					role: 'weather.direction.wind.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.precipitation_probability', {
				type: 'state',
				common: {
					name: 'Precipitation probability',
					desc: 'Precipitation probability',
					unit: '%',
					type: 'number',
					role: 'value.precipitation.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.rainspot', {
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

			await this.setObjectNotExistsAsync('data_day.' + i + '.rainspot_vis', {
				type: 'state',
				common: {
					name: 'rainspot 30x30km for vis (html-widget binding)',
					desc: 'rainspot 30x30km for vis (html-widget binding)',
					type: 'string',
					role: 'html',
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.predictability_class', {
				type: 'state',
				common: {
					name: 'Predictability class (1 = very low, 5 = very high)',
					desc: 'Predictability class (1 = very low, 5 = very high)',
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
					name: 'Predictability (24h)',
					desc: 'Predictability (24h)',
					unit: '%',
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
					name: 'Precipitation, total amount of Water',
					desc: 'Precipitation, total amount of Water',
					type: 'number',
					role: 'value.precipitation.day.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.snowfraction', {
				type: 'state',
				common: {
					name: 'Snow fraction, information whether precipitation falls as rain or snow (0 = rain, 1 = snow)',
					desc: 'Snow fraction, information whether precipitation falls as rain or snow: (0 = rain, 1 = snow)',
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
					name: 'Maximum sea level pressure, adjusted to mean sea level',
					desc: 'Maximum sea level pressure, adjusted to mean sea level',
					unit: 'hPa',
					type: 'number',
					role: 'value.pressure.max.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.sealevelpressure_min', {
				type: 'state',
				common: {
					name: 'Minimum sea level pressure, adjusted to mean sea level',
					desc: 'Minimum sea level pressure, adjusted to mean sea level',
					unit: 'hPa',
					type: 'number',
					role: 'value.pressure.min.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.sealevelpressure_mean', {
				type: 'state',
				common: {
					name: 'Mean sea level pressure, adjusted to mean sea level',
					desc: 'Mean sea level pressure, adjusted to mean sea level',
					unit: 'hPa',
					type: 'number',
					role: 'value.pressure.mean.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.windspeed_max', {
				type: 'state',
				common: {
					name: 'Maximum windspeed, 10m above ground',
					desc: 'Maximum windspeed, 10m above ground',
					type: 'number',
					role: 'value.speed.max.wind.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.windspeed_mean', {
				type: 'state',
				common: {
					name: 'Mean windspeed, 10m above ground',
					desc: 'Mean windspeed, 10m above ground',
					type: 'number',
					role: 'value.speed.mean.wind.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.windspeed_min', {
				type: 'state',
				common: {
					name: 'Minimum windspeed, 10m above ground',
					desc: 'Minimum windspeed, 10m above ground',
					type: 'number',
					role: 'value.speed.min.wind.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.relativehumidity_max', {
				type: 'state',
				common: {
					name: 'Maximum relative air humidity',
					desc: 'Maximum relative air humidity',
					unit: '%',
					type: 'number',
					role: 'value.humidity.max.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.relativehumidity_min', {
				type: 'state',
				common: {
					name: 'Mimimum relative air humidity',
					desc: 'Mimimum relative air humidity',
					unit: '%',
					type: 'number',
					role: 'value.humidity.min.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.relativehumidity_mean', {
				type: 'state',
				common: {
					name: 'Mean relative air humidity',
					desc: 'Mean relative air humidity',
					unit: '%',
					type: 'number',
					role: 'value.humidity.mean.forecast.' + i,
					read: true,
					write: false
				},
				native: {}
			});

			await this.setObjectNotExistsAsync('data_day.' + i + '.convective_precipitation', {
				type: 'state',
				common: {
					name: 'Convective precipitation, total amount',
					desc: 'Convective precipitation, total amount',
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
					name: 'Precipitation hours',
					desc: 'Precipitation hours',
					unit: 'h',
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
					name: 'Hours with humidity greater than 90%',
					desc: 'Hours with humidity greater than 90%',
					unit: 'h',
					type: 'number',
					role: 'value',
					read: true,
					write: false
				},
				native: {}
			});
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
				this.setState('units.predictability', {val: content.units.predictability, ack: true});
				this.setState('units.precipitation_probability', {val: content.units.precipitation_probability, ack: true});
				this.setState('units.pressure', {val: content.units.pressure, ack: true});
				this.setState('units.relativehumidity', {val: content.units.relativehumidity, ack: true});
				this.setState('units.co', {val: content.units.co, ack: true});
				this.setState('units.temperature', {val: content.units.temperature, ack: true});
				this.setState('units.winddirection', {val: content.units.winddirection, ack: true});
				this.setState('units.precipitation', {val: content.units.precipitation, ack: true});
				this.setState('units.windspeed', {val: content.units.windspeed, ack: true});

				// data_day 0-6
				for (let i = 0; i <= 6; i++) {
					createVisHTMLBindingRainspot = this.createVisHTMLBindingRainspot(content.data_day.rainspot[i]);
					calculateWinddirectionChar = this.calculateWinddirectionChar(content.data_day.winddirection[i]);

					this.setState('data_day.' + i + '.time', {val: content.data_day.time[i], ack: true});
					this.setState('data_day.' + i + '.pictocode', {val: content.data_day.pictocode[i], ack: true});
					this.setState('data_day.' + i + '.uvindex', {val: content.data_day.uvindex[i], ack: true});
					this.setState('data_day.' + i + '.temperature_max', {val: content.data_day.temperature_max[i], ack: true});
					this.setState('data_day.' + i + '.temperature_min', {val: content.data_day.temperature_min[i], ack: true});
					this.setState('data_day.' + i + '.temperature_mean', {val: content.data_day.temperature_mean[i], ack: true});
					this.setState('data_day.' + i + '.felttemperature_max', {val: content.data_day.felttemperature_max[i], ack: true});
					this.setState('data_day.' + i + '.felttemperature_min', {val: content.data_day.felttemperature_min[i], ack: true});

					this.setState('data_day.' + i + '.winddirectionDeg', {val: content.data_day.winddirection[i], ack: true});
					this.setState('data_day.' + i + '.winddirectionChar2', {val: calculateWinddirectionChar[0], ack: true});
					this.setState('data_day.' + i + '.winddirectionChar3', {val: calculateWinddirectionChar[1], ack: true});

					this.setState('data_day.' + i + '.precipitation_probability', {val: content.data_day.precipitation_probability[i], ack: true});
					this.setState('data_day.' + i + '.rainspot', {val: content.data_day.rainspot[i], ack: true});
					this.setState('data_day.' + i + '.rainspot_vis', {val: createVisHTMLBindingRainspot, ack: true});
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
				throw new Error (`"Meteoblue API" not reachable. ${error.response.data.error_message} (ERR_#012)`);
			});
	}

	async getMeteoblueDateIntervall() {
		this.log.info('[getMeteoblueData]: Starting polltimer with a 30 minutes interval.');
		try {
			this.intervall = setInterval(async () => {
				await this.getMeteoblueData();
			}, 30 * 60000); // default-intervall: 30*60000=1800000ms=30min ; max-intervall: 86400000/100=864000=14min24s
		} catch (error) {
			this.log.error(`${error}: (ERR_#013)`);
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
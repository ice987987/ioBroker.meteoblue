'use strict';

/*
 * Created with @iobroker/create-adapter v2.0.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');
const objectsStates = require('./lib/objectsStates.js');

// Load your modules:
const axios = require('axios').default;

// variables
const isValidApplicationKey = /[a-zA-Z0-9]{12,}/;

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
		this.log.debug(`this.config.forecastPackage_clouds_1h: ${this.config.forecastPackage_clouds_1h}`);
		this.log.debug(`this.config.forecastPackage_clouds_3h: ${this.config.forecastPackage_clouds_3h}`);
		this.log.debug(`this.config.forecastPackage_clouds_day: ${this.config.forecastPackage_clouds_day}`);
		this.log.debug(`this.config.forecastPackage_sunmoon: ${this.config.forecastPackage_sunmoon}`);
		this.log.debug(`this.config.forecastPackage_agro_1h: ${this.config.forecastPackage_agro_1h}`);
		this.log.debug(`this.config.forecastPackage_agro_3h: ${this.config.forecastPackage_agro_3h}`);
		this.log.debug(`this.config.forecastPackage_agro_day: ${this.config.forecastPackage_agro_day}`);
		this.log.debug(`this.config.forecastPackage_agromodelLeafWetness_1h: ${this.config.forecastPackage_agromodelLeafWetness_1h}`);
		this.log.debug(`this.config.forecastPackage_agromodelSowing_1h: ${this.config.forecastPackage_agromodelSowing_1h}`);
		this.log.debug(`this.config.forecastPackage_agromodelSpray_1h: ${this.config.forecastPackage_agromodelSpray_1h}`);

		// load system.config
		const systemConfig = await this.getForeignObjectAsync('system.config', 'state');
		// this.log.debug(`systemConfig: ${JSON.stringify(systemConfig)}`);

		// https://docs.meteoblue.com/en/weather-apis/packages-api/introduction#url-parameter
		this.meteoblueApiUrl = 'http://my.meteoblue.com/packages/';

		// check forecast package
		if (!this.config.forecastPackage_basic_15min && !this.config.forecastPackage_basic_1h && !this.config.forecastPackage_basic_3h && !this.config.forecastPackage_basic_day && !this.config.forecastPackage_current && ! this.config.forecastPackage_clouds_1h && !this.config.forecastPackage_clouds_3h && !this.config.forecastPackage_clouds_day && !this.config.forecastPackage_sunmoon && !this.config.forecastPackage_agro_1h && !this.config.forecastPackage_agro_3h && !this.config.forecastPackage_agro_day && !this.config.forecastPackage_agromodelLeafWetness_1h && !this.config.forecastPackage_agromodelSowing_1h && !this.config.forecastPackage_agromodelSpray_1h) {
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
			if (this.config.forecastPackage_clouds_1h) {
				this.meteoblueApiUrl += 'clouds-1h_';
			}
			if (this.config.forecastPackage_clouds_3h) {
				this.meteoblueApiUrl += 'clouds-3h_';
			}
			if (this.config.forecastPackage_clouds_day) {
				this.meteoblueApiUrl += 'clouds-day_';
			}
			if (this.config.forecastPackage_clouds_3h) {
				this.meteoblueApiUrl += 'clouds-3h_';
			}
			if (this.config.forecastPackage_sunmoon) {
				this.meteoblueApiUrl += 'sunmoon_';
			}
			if (this.config.forecastPackage_agro_1h) {
				this.meteoblueApiUrl += 'agro-1h_';
			}
			if (this.config.forecastPackage_agro_3h) {
				this.meteoblueApiUrl += 'agro-3h_';
			}
			if (this.config.forecastPackage_agro_day) {
				this.meteoblueApiUrl += 'agro-day_';
			}
			if (this.config.forecastPackage_agromodelLeafWetness_1h) {
				this.meteoblueApiUrl += 'agromodelleafwetness-1h_';
			}
			if (this.config.forecastPackage_agromodelSowing_1h) {
				this.meteoblueApiUrl += 'agromodelsowing-1h_';
			}
			if (this.config.forecastPackage_agromodelSpray_1h) {
				this.meteoblueApiUrl += 'agromodelspray-1h_';
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
			if (systemConfig) {
				if (((isNaN(Number(systemConfig.common.latitude)) === true) || Number(systemConfig.common.latitude) !== 0) && (isNaN(Number(systemConfig.common.longitude)) === true || Number(systemConfig.common.longitude) !== 0)) {
					this.config.latitude = systemConfig.common.latitude;
					this.config.longitude = systemConfig.common.longitude;
				} else {
					this.log.error('"Latitude" and/or "longitude" from system settings is/are not valid. Please check configuration! (ERR_#003)');
					return;
				}
			} else {
				this.log.error('system.config not available. Please check configuration! (ERR_#004)');
			}
		} else if ((Number(this.config.latitude) < -90 || Number(this.config.latitude) > 90) && (Number(this.config.longitude) < -180 || Number(this.config.longitude) > 180)) {
			this.log.error('"Latitude" and/or "longitude" is/are not valid. Please check configuration! (ERR_#005)');
			return;
		}
		this.meteoblueApiUrl += `&lat=${this.config.latitude}&lon=${this.config.longitude}`;

		// check city
		if (this.config.cityFromSystem) {
			if (systemConfig) {
				if (systemConfig.common.city) {
					this.config.city = systemConfig.common.city;
				} else {
					this.log.error('"City" from system settings is not valid. Please check configuration! (ERR_#006)');
					return;
				}
			} else {
				this.log.error('system.config not available. Please check configuration! (ERR_#007)');
			}
		} else if (!this.config.city) {
			this.log.error('"City" is not valid. Pleae check configuration! (ERR_#008)');
			return;
		}
		// convert city to UTF8; see https://docs.meteoblue.com/en/weather-apis/packages-api/introduction#misc
		this.meteoblueApiUrl += `&name=${encodeURIComponent(this.config.city)}`;

		// check elevation
		if (Number(this.config.elevation) < -428 || Number(this.config.elevation) > 8848) {
			this.log.error('"Elevation" is not valid. Please check configuration! (ERR_#009)');
			return;
		}
		this.meteoblueApiUrl += `&asl=${this.config.elevation}`;

		// check timezone
		if (this.config.timezone == null || this.config.timezone == '') {
			this.log.error('"Timezone" not valid. Please check configuration! (ERR_#010)');
			return;
		}
		this.meteoblueApiUrl += `&tz=${this.config.timezone}`;

		// check tempunit
		if (this.config.tempunitFromSystem) {
			if (systemConfig) {
				if (systemConfig.common.tempUnit) {
					this.config.tempunit = (systemConfig.common.tempUnit).substr(1, 1);
				} else {
					this.log.error('"Temperature unit" from system settings is not valid. Please check configuration! (ERR_#011)');
					return;
				}
			} else {
				this.log.error('system.config not available. Please check configuration! (ERR_#012)');
			}
		} else if (this.config.tempunit == null || this.config.tempunit == '') {
			this.log.error('"Temperature unit" not valid. Please check configuration! (ERR_#013)');
			return;
		}
		this.meteoblueApiUrl += `&temperature=${this.config.tempunit}`;

		// check windspeed
		if (this.config.windspeed == null || this.config.windspeed == '') {
			this.log.error('"Unit of windspeed" not valid. Please check configuration! (ERR_#014)');
			return;
		}
		this.meteoblueApiUrl += `&windspeed=${this.config.windspeed}`;

		// check precipitationamount
		if (this.config.precipitationamount == null || this.config.precipitationamount == '') {
			this.log.error('"Unit of precipitationamount" not valid. Please check configuration! (ERR_#015)');
			return;
		}
		this.meteoblueApiUrl += `&precipitationamount=${this.config.precipitationamount}`;
		this.meteoblueApiUrl += '&timeformat=Y-M-D&format=json';

		// check intervall
		if (Number(this.config.intervall) === 0) {
			this.log.info('"Polling intervall" set to manual mode.');
			await this.createStatesObjects1(objectsStates.manual_mode);
			// subscribeStates
			await this.subscribeStatesAsync('ACTION.REQUEST_DATA');
		} else if (Number(this.config.intervall) >= 1 || Number(this.config.intervall <= 1440)) {
			this.log.debug(`[deleteObjects]: start deleting existing folder with ID "ACTION". Please be patient...`);
			await this.delObjectAsync('ACTION', {recursive: true});
			this.log.debug('[deleteObjects]: deleting existing folder with ID "ACTION" finished.');
		} else {
			this.log.error('"Polling intervall" not valid. Please check configuration! (ERR_#016)');
			return;
		}

		this.log.debug(`this.meteoblueApiUrl: ${this.meteoblueApiUrl}`);

		try {

			this.log.info('create/delete all required states. Please be patient...');

			// create metatada / units0 are always needed
			await this.createStatesObjects1(objectsStates.metadata);
			await this.createStatesObjects1(objectsStates.units0);

			// units00 needed in forcast packages basic_15min, basic_1h, basic_3h, basic_day, current, agro_1h, agro_3h, agro_day
			if (!this.config.forecastPackage_basic_15min && !this.config.forecastPackage_basic_1h && !this.config.forecastPackage_basic_3h && !this.config.forecastPackage_basic_day && !this.config.forecastPackage_current && !this.config.forecastPackage_agro_1h && !this.config.forecastPackage_agro_3h && !this.config.forecastPackage_agro_day) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units00". Please be patient...`);
				for (let i = 1; i < objectsStates.units00.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units00[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units00" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units00);
			}

			// units1 needed in forcast packages basic_15min, basic_1h, basic_3h, basic_day, current
			if (!this.config.forecastPackage_basic_15min && !this.config.forecastPackage_basic_1h && !this.config.forecastPackage_basic_3h && !this.config.forecastPackage_basic_day && !this.config.forecastPackage_current) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units1". Please be patient...`);
				for (let i = 1; i < objectsStates.units1.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units1[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units1" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units1);
			}

			// units2 needed in forcast packages basic_15min, basic_1h, basic_3h, basic_day
			if (!this.config.forecastPackage_basic_15min && !this.config.forecastPackage_basic_1h && !this.config.forecastPackage_basic_3h && !this.config.forecastPackage_basic_day) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units2". Please be patient...`);
				for (let i = 1; i < objectsStates.units2.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units2[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units2" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units2);
			}

			// units3 needed in forcast packages clouds_1h, clouds_3h, clouds_day
			if (!this.config.forecastPackage_clouds_1h && !this.config.forecastPackage_clouds_3h && !this.config.forecastPackage_clouds_day) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units3". Please be patient...`);
				for (let i = 1; i < objectsStates.units3.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units3[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units3" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units3);
			}

			// units4 needed in forcast packages agro_1h, agro_3h, agro_day
			if (!this.config.forecastPackage_agro_1h && !this.config.forecastPackage_agro_3h && !this.config.forecastPackage_agro_day) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units4". Please be patient...`);
				for (let i = 1; i < objectsStates.units4.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units4[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units4" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units4);
			}

			// forecast package basic_15min
			if (!this.config.forecastPackage_basic_15min) {
				this.log.debug(`[deleteObjects0]: start deleting states for channel "data_xmin". Please be patient...`);
				await this.delObjectAsync('data_xmin', {recursive: true});
				this.log.debug(`[deleteObjects0]: states deletion for channel "data_xmin" finished.`);
			} else {
				await this.createStatesObjects3(objectsStates.basic_15min);
			}

			// forecast packages basic_1h / clouds_1h / agro_1h / agromodelLeafWetness_1h / agromodelSowing_1h / agromodelSpray_1h
			if (!this.config.forecastPackage_basic_1h && !this.config.forecastPackage_clouds_1h && !this.config.forecastPackage_agro_1h && !this.config.forecastPackage_agromodelLeafWetness_1h && !this.config.forecastPackage_agromodelSowing_1h && !this.config.forecastPackage_agromodelSpray_1h) {
				this.log.debug(`[deleteObjects0]: start deleting states for channel "data_1h". Please be patient...`);
				await this.delObjectAsync('data_1h', {recursive: true});
				this.log.debug(`[deleteObjects0]: states deletion for channel "data_1h" finished.`);
			} else {
				if (!this.config.forecastPackage_basic_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "data_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.basic_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.basic_1h.length; i++) {
								if (objectsStates.basic_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.basic_1h[0].id}.${k}d_${objectsStates.basic_1h[1].id[j]}.${objectsStates.basic_1h[i].id}`);
									//this.log.debug(`${objectsStates.basic_1h[0].id}.${k}d_${objectsStates.basic_1h[1].id[j]}.${objectsStates.basic_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "data_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.basic_1h);
				}
				if (!this.config.forecastPackage_clouds_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "clouds_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.clouds_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.clouds_1h.length; i++) {
								if (objectsStates.clouds_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.clouds_1h[0].id}.${k}d_${objectsStates.clouds_1h[1].id[j]}.${objectsStates.clouds_1h[i].id}`);
									//this.log.debug(`${objectsStates.clouds_1h[0].id}.${k}d_${objectsStates.clouds_1h[1].id[j]}.${objectsStates.clouds_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "clouds_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.clouds_1h);
				}
				if (!this.config.forecastPackage_agro_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "agro_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.agro_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.agro_1h.length; i++) {
								if (objectsStates.agro_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.agro_1h[0].id}.${k}d_${objectsStates.agro_1h[1].id[j]}.${objectsStates.agro_1h[i].id}`);
									//this.log.debug(`${objectsStates.agro_1h[0].id}.${k}d_${objectsStates.agro_1h[1].id[j]}.${objectsStates.agro_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "agro_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.agro_1h);
				}
				if (!this.config.forecastPackage_agromodelLeafWetness_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "agromodelLeafWetness_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.agromodelLeafWetness_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.agromodelLeafWetness_1h.length; i++) {
								if (objectsStates.agromodelLeafWetness_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.agromodelLeafWetness_1h[0].id}.${k}d_${objectsStates.agromodelLeafWetness_1h[1].id[j]}.${objectsStates.agromodelLeafWetness_1h[i].id}`);
									//this.log.debug(`${objectsStates.agromodelLeafWetness_1h[0].id}.${k}d_${objectsStates.agromodelLeafWetness_1h[1].id[j]}.${objectsStates.agromodelLeafWetness_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "agromodelLeafWetness_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.agromodelLeafWetness_1h);
				}
				if (!this.config.forecastPackage_agromodelSowing_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "agromodelSowing_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.agromodelSowing_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.agromodelSowing_1h.length; i++) {
								if (objectsStates.agromodelSowing_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.agromodelSowing_1h[0].id}.${k}d_${objectsStates.agromodelSowing_1h[1].id[j]}.${objectsStates.agromodelSowing_1h[i].id}`);
									//this.log.debug(`${objectsStates.agromodelSowing_1h[0].id}.${k}d_${objectsStates.agromodelSowing_1h[1].id[j]}.${objectsStates.agromodelSowing_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "agromodelSowing_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.agromodelSowing_1h);
				}
				if (!this.config.forecastPackage_agromodelSpray_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "agromodelSpray_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.agromodelSpray_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.agromodelSpray_1h.length; i++) {
								if (objectsStates.agromodelSpray_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.agromodelSpray_1h[0].id}.${k}d_${objectsStates.agromodelSpray_1h[1].id[j]}.${objectsStates.agromodelSpray_1h[i].id}`);
									//this.log.debug(`${objectsStates.agromodelSpray_1h[0].id}.${k}d_${objectsStates.agromodelSpray_1h[1].id[j]}.${objectsStates.agromodelSpray_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "agromodelSpray_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.agromodelSpray_1h);
				}
			}

			// forecast packages basic_3h / clouds_3h / agro_3h
			if (!this.config.forecastPackage_basic_3h && !this.config.forecastPackage_clouds_3h && !this.config.forecastPackage_agro_3h) {
				this.log.debug(`[deleteObjects0]: start deleting states for channel "data_3h". Please be patient...`);
				await this.delObjectAsync('data_3h', {recursive: true});
				this.log.debug(`[deleteObjects0]: states deletion for channel "data_3h" finished.`);
			} else {
				if (!this.config.forecastPackage_basic_3h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "basic_3h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.basic_3h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.basic_3h.length; i++) {
								if (objectsStates.basic_3h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.basic_3h[0].id}.${k}d_${objectsStates.basic_3h[1].id[j]}.${objectsStates.basic_3h[i].id}`);
									//this.log.debug(`${objectsStates.basic_3h[0].id}.${k}d_${objectsStates.basic_3h[1].id[j]}.${objectsStates.basic_3h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "basic_3h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.basic_3h);
				}
				if (!this.config.forecastPackage_clouds_3h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "clouds_3h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.clouds_3h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.clouds_3h.length; i++) {
								if (objectsStates.clouds_3h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.clouds_3h[0].id}.${k}d_${objectsStates.clouds_3h[1].id[j]}.${objectsStates.clouds_3h[i].id}`);
									//this.log.debug(`${objectsStates.clouds_3h[0].id}.${k}d_${objectsStates.clouds_3h[1].id[j]}.${objectsStates.clouds_3h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "clouds_3h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.clouds_3h);
				}
				if (!this.config.forecastPackage_agro_3h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "agro_3h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.agro_3h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.agro_3h.length; i++) {
								if (objectsStates.agro_3h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.agro_3h[0].id}.${k}d_${objectsStates.agro_3h[1].id[j]}.${objectsStates.agro_3h[i].id}`);
									//this.log.debug(`${objectsStates.agro_3h[0].id}.${k}d_${objectsStates.agro_3h[1].id[j]}.${objectsStates.agro_3h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "agro_3h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.agro_3h);
				}
			}

			// forecast packages basic_day / clouds_day / agro_day
			if (!this.config.forecastPackage_basic_day && !this.config.forecastPackage_clouds_day && !this.config.forecastPackage_sunmoon && !this.config.forecastPackage_agro_day) {
				this.log.debug(`[deleteObjects0]: start deleting states for channel "data_day". Please be patient...`);
				await this.delObjectAsync('data_day', {recursive: true});
				this.log.debug(`[deleteObjects0]: states deletion for channel "data_day" finished.`);
			} else {
				if (!this.config.forecastPackage_basic_day) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "basic_day". Please be patient...`);
					for (let k = 0; k < objectsStates.basic_day[1].id.length; k++) {
						for (let i = 2; i < objectsStates.basic_day.length; i++) {
							if (objectsStates.basic_day[i].id !== 'time') {
								await this.delObjectAsync(`${objectsStates.basic_day[0].id}.${objectsStates.basic_day[1].id[k]}.${objectsStates.basic_day[i].id}`);
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "basic_day" finished.`);
				} else {
					await this.createStatesObjects2(objectsStates.basic_day);
				}
				if (!this.config.forecastPackage_clouds_day) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "clouds_day". Please be patient...`);
					for (let k = 0; k < objectsStates.clouds_day[1].id.length; k++) {
						for (let i = 2; i < objectsStates.clouds_day.length; i++) {
							if (objectsStates.clouds_day[i].id !== 'time') {
								await this.delObjectAsync(`${objectsStates.clouds_day[0].id}.${objectsStates.clouds_day[1].id[k]}.${objectsStates.clouds_day[i].id}`);
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "clouds_day" finished.`);
				} else {
					await this.createStatesObjects2(objectsStates.clouds_day);
				}
				if (!this.config.forecastPackage_sunmoon) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "sunmoon". Please be patient...`);
					for (let k = 0; k < objectsStates.sunmoon[1].id.length; k++) {
						for (let i = 2; i < objectsStates.sunmoon.length; i++) {
							if (objectsStates.sunmoon[i].id !== 'time') {
								await this.delObjectAsync(`${objectsStates.sunmoon[0].id}.${objectsStates.sunmoon[1].id[k]}.${objectsStates.sunmoon[i].id}`);
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "sunmoon" finished.`);
				} else {
					await this.createStatesObjects2(objectsStates.sunmoon);
				}
				if (!this.config.forecastPackage_agro_day) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "agro_day". Please be patient...`);
					for (let k = 0; k < objectsStates.agro_day[1].id.length; k++) {
						for (let i = 2; i < objectsStates.agro_day.length; i++) {
							if (objectsStates.agro_day[i].id !== 'time') {
								await this.delObjectAsync(`${objectsStates.agro_day[0].id}.${objectsStates.agro_day[1].id[k]}.${objectsStates.agro_day[i].id}`);
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "agro_day" finished.`);
				} else {
					await this.createStatesObjects2(objectsStates.agro_day);
				}
			}

			// forecast package current
			if (!this.config.forecastPackage_current) {
				this.log.debug(`[deleteObjects0]: start deleting states for channel "data_current". Please be patient...`);
				await this.delObjectAsync('data_current', {recursive: true});
				this.log.debug(`[deleteObjects0]: states deletion for channel "data_current" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.current);
			}

			this.log.info('creation/deletion of all required states finished.');

			await this.getMeteoblueData();
			if (Number(this.config.intervall) !== 0) {
				await this.getMeteoblueDateIntervall();
			}
		} catch (error){
			// Reset the connection indicator
			this.setState('info.connection', false, true);
			this.log.error(`${error} (ERR_#017)`);
		}
	}

	/**
	 * creates one channel with several states
	 * @param statesObjectInfo {object}
	 */
	async createStatesObjects1(statesObjectInfo) {
		this.log.debug(`[createStatesObjects1]: start objects creation for channel "${statesObjectInfo[0].id}". Please be patient...`);
		for (let i = 0; i < statesObjectInfo.length; i++) {
			await this.createObject(statesObjectInfo[0].id, null, statesObjectInfo[i]);
		}
		this.log.debug(`[createStatesObjects1]: objects creation for channel "${statesObjectInfo[0].id}" finished.`);
	}

	/**
	 * creates one channel with several states, without time in the description
	 * @param statesObjectInfo {object}
	 */
	async createStatesObjects2(statesObjectInfo) {
		this.log.debug(`[createStatesObjects2]: start objects creation for channel "${statesObjectInfo[0].id}". Please be patient...`);
		for (let k = 0; k < statesObjectInfo[1].id.length; k++) {
			for (let i = 0; i < statesObjectInfo.length; i++) {
				await this.createObject(statesObjectInfo[0].id, statesObjectInfo[1].id[k], statesObjectInfo[i]);
			}
		}
		this.log.debug(`[createStatesObjects2]: objects creation for channel "${statesObjectInfo[0].id}" finished.`);
	}

	/**
	 * creates one channel with several states, with time in the description
	 * @param statesObjectInfo {object}
	 */
	async createStatesObjects3(statesObjectInfo) {
		this.log.debug(`[createStatesObjects3]: start objects creation for channel "${statesObjectInfo[0].id}". Please be patient...`);
		for (let k = 0; k < 7; k++) {
			for (let j = 0; j < statesObjectInfo[1].id.length; j++) {
				for (let i = 0; i < statesObjectInfo.length; i++) {
					await this.createObject(statesObjectInfo[0].id, `${k}d_${statesObjectInfo[1].id[j]}`, statesObjectInfo[i]);
				}
			}
		}
		this.log.debug(`[createStatesObjects3]: objects creation for channel "${statesObjectInfo[0].id}" finished.`);
	}

	async createObject(channel_0, channel_1, stateInfo) {
		// this.log.debug('channel_0: ' + channel_0);
		// this.log.debug('channel_1: ' + channel_1);
		// this.log.debug('stateInfo: ' + JSON.stringify(stateInfo));
		const common = {};
		let id = '';

		// if-situation, because type: 'channel' and 'state' does not allow to be a variable
		if (stateInfo.type.substr(0, stateInfo.type.length - 2) === 'channel') {
			// channel_0
			if (stateInfo.type === 'channel_0') {
				id = `${channel_0}`;
				common.name = stateInfo.cname;
				common.desc = stateInfo.cname;
			}
			// channel_1
			if (stateInfo.type === 'channel_1') {
				id = `${channel_0}.${channel_1}`;
				if (channel_0 !== 'data_day') {
					common.name = `forecast +${channel_1.substring(0, 2)} ${channel_1.substring(3, 5)}:${channel_1.substring(channel_1.length - 2, channel_1.length)}h`;
					common.desc = `forecast +${channel_1.substring(0, 2)} ${channel_1.substring(3, 5)}:${channel_1.substring(channel_1.length - 2, channel_1.length)}h`;
				} else {
					common.name = `forecast +${channel_1}`;
					common.desc = `forecast +${channel_1}`;
				}
			}
			await this.setObjectNotExistsAsync(id, {
				type: 'channel',
				common: common,
				native: {},
			});
		}
		// states
		if (stateInfo.type === 'state') {
			// id
			if (channel_1) {
				id = `${channel_0}.${channel_1}.${stateInfo.id}`;
			} else {
				id = `${channel_0}.${stateInfo.id}`;
			}
			// name/desc/ctype
			common.name = stateInfo.cname || '';
			common.desc = stateInfo.cname || '';
			common.type = stateInfo.ctype || '';
			// role
			if (channel_1) {
				if (stateInfo.crole.split('.')[stateInfo.crole.split('.').length - 1] === 'forecast') {
					common.role = `${stateInfo.crole}.${channel_1.match(/\d(?=d)/)}`;
				} else {
					common.role = stateInfo.crole || '';
				}
			} else {
				common.role = stateInfo.crole || '';
			}
			// cunit
			if (stateInfo.cunit) {common.unit = stateInfo.cunit;}
			// cstates
			if (stateInfo.cstates) {common.states = stateInfo.cstates;}
			// read
			common.read = true;
			// write
			if (stateInfo.cwrite) {
				common.write = true;
			} else {
				common.write = false;
			}
			await this.setObjectNotExistsAsync(id, {
				type: 'state',
				common: common,
				native: {},
			});
		}
	}

	createVisHTMLBindingRainspot(day) {
		// https://content.meteoblue.com/en/spatial-dimensions/spot
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

		for (let i = 7; i > 0; i--) {
			html += '<tr> ';
			// display correct order of values
			for (let j = 7; j > 0; j--) {
				html += '<td class ="value' + day.substr((7 * i) - j, 1) + '"></td> ';
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
		return [objectsStates.compassDirection[(value2 % 8) * 2], objectsStates.compassDirection[value3 % 16]];
	}

	async getMeteoblueData() {

		await axios({
			method: 'get',
			url: this.meteoblueApiUrl,
			timeout: 2000,
			responseType: 'json'
		})
			.then(async (response) => {

				this.setState('info.connection', true, true);

				this.log.debug(`[getMeteoblueData]: HTTP status response: ${response.status} ${response.statusText}; config: ${JSON.stringify(response.config)}; headers: ${JSON.stringify(response.headers)}; data: ${JSON.stringify(response.data)}`);
				const content = response.data;

				this.log.info('start writing all configured states...');

				// metatada / units0 are always needed
				await this.writeStates1(objectsStates.metadata, content);
				await this.writeStates1(objectsStates.units0, content);

				// units00 needed in forcast packages basic_15min, basic_1h, basic_3h, basic_day, current, agro_1h, agro_3h, agro_day
				if (this.config.forecastPackage_basic_15min || this.config.forecastPackage_basic_1h || this.config.forecastPackage_basic_3h || this.config.forecastPackage_basic_day || this.config.forecastPackage_current || this.config.forecastPackage_agro_1h || this.config.forecastPackage_agro_3h || this.config.forecastPackage_agro_day) {
					await this.writeStates1(objectsStates.units00, content);
				}

				// units1 needed in forcast packages basic_15min, basic_1h, basic_3h, basic_day, current
				if (this.config.forecastPackage_basic_15min || this.config.forecastPackage_basic_1h || this.config.forecastPackage_basic_3h || this.config.forecastPackage_basic_day || this.config.forecastPackage_current) {
					await this.writeStates1(objectsStates.units1, content);
				}

				// units2 needed in forcast basic_15min, basic_1h, basic_3h, basic_day
				if (this.config.forecastPackage_basic_15min || this.config.forecastPackage_basic_1h || this.config.forecastPackage_basic_3h || this.config.forecastPackage_basic_day) {
					await this.writeStates1(objectsStates.units2, content);
				}

				// units3 needed in forcast clouds_1h, clouds_3h, clouds_day
				if (this.config.forecastPackage_clouds_1h || this.config.forecastPackage_clouds_3h || this.config.forecastPackage_clouds_day) {
					await this.writeStates1(objectsStates.units3, content);
				}

				// units4 needed in forcast agro_1h, agro_3h, agro_day
				if (this.config.forecastPackage_agro_1h || this.config.forecastPackage_agro_3h || this.config.forecastPackage_agro_day) {
					await this.writeStates1(objectsStates.units4, content);
				}

				// basic_15min
				if (content.data_xmin && this.config.forecastPackage_basic_15min) {
					await this.writeStates3(objectsStates.basic_15min, content);
				}
				// basic_1h
				if (content.data_1h && this.config.forecastPackage_basic_1h) {
					await this.writeStates3(objectsStates.basic_1h, content);
				}
				// basic_3h
				if (content.data_3h && this.config.forecastPackage_basic_3h) {
					await this.writeStates3(objectsStates.basic_3h, content);
				}
				// basic_day
				if (content.data_day && this.config.forecastPackage_basic_day) {
					await this.writeStates2(objectsStates.basic_day, content);
				}
				// current
				if (content.data_current && this.config.forecastPackage_current) {
					await this.writeStates1(objectsStates.current, content);
				}

				// clouds_1h
				if (content.data_1h && this.config.forecastPackage_clouds_1h) {
					await this.writeStates3(objectsStates.clouds_1h, content);
				}
				// clouds_3h
				if (content.data_3h && this.config.forecastPackage_clouds_3h) {
					await this.writeStates3(objectsStates.clouds_3h, content);
				}
				// clouds_day
				if (content.data_day && this.config.forecastPackage_clouds_day) {
					await this.writeStates2(objectsStates.clouds_day, content);
				}

				// sunmoon
				if (content.data_day && this.config.forecastPackage_sunmoon) {
					await this.writeStates2(objectsStates.sunmoon, content);
				}

				// agro_1h
				if (content.data_1h && this.config.forecastPackage_agro_1h) {
					await this.writeStates3(objectsStates.agro_1h, content);
				}
				// agro_3h
				if (content.data_3h && this.config.forecastPackage_agro_3h) {
					await this.writeStates3(objectsStates.agro_3h, content);
				}
				// agro_day
				if (content.data_day && this.config.forecastPackage_agro_day) {
					await this.writeStates2(objectsStates.agro_day, content);
				}

				// agromodelLeafWetness_1h
				if (content.data_1h && this.config.forecastPackage_agromodelLeafWetness_1h) {
					await this.writeStates3(objectsStates.agromodelLeafWetness_1h, content);
				}

				// agromodelSowing_1h
				if (content.data_1h && this.config.forecastPackage_agromodelSowing_1h) {
					await this.writeStates3(objectsStates.agromodelSowing_1h, content);
				}

				// agromodelSpray_1h
				if (content.data_1h && this.config.forecastPackage_agromodelSpray_1h) {
					await this.writeStates3(objectsStates.agromodelSpray_1h, content);
				}

				this.log.info('[getMeteoblueData]: all states written.');

			})
			.catch((error) => {
				if (error.response) {
					// The request was made and the server responded with a status code that falls out of the range of 2xx
					this.log.debug(`[getMeteoblueData]: HTTP status response: ${error.response.status}; headers: ${JSON.stringify(error.response.headers)}; data: ${JSON.stringify(error.response.data)}`);
					this.log.error(`[getMeteoblueData]: ${error.response.data.error_message}`);
				} else if (error.request) {
					// The request was made but no response was received `error.request` is an instance of XMLHttpRequest in the browser and an instance of http.ClientRequest in node.js
					this.log.debug(`[getMeteoblueData]: error request: ${error}`);
				} else {
					// Something happened in setting up the request that triggered an Error
					this.log.debug(`[getMeteoblueData]: error message: ${error.message}`);
				}
				this.log.debug(`[getMeteoblueData]: error.config: ${JSON.stringify(error.config)}`);
			});

	}

	async writeStates1(ids, content) {
		this.log.debug(`[writeStates1]: start writing states for channel "${ids[0].id}". Please be patient...`);
		for (let i = 1; i < ids.length; i++) {
			// const testy2 because it does not directly work (number string issue)
			const testy2 = content[ids[0].id][ids[i].id];
			this.setState(`${ids[0].id}.${ids[i].id}`, {val: testy2, ack: true});

			// this.log.debug(`Path: ${ids[0].id}.${ids[i].id}`);
			// this.log.debug(`Value: ${content[ids[0].id][ids[i].id]}`);
		}
		this.log.debug(`[writeStates1]: objects creation for channel "${ids[0].id}" finished.`);
	}

	async writeStates2(ids, content) {
		this.log.debug(`[writeStates2]: start writing states for channel "${ids[0].id}". Please be patient...`);
		for (let k = 0; k < ids[1].id.length; k++) {
			for (let i = 2; i < ids.length; i++) {

				if (ids[i].id === 'winddirectionChar2') {
					this.setState(`${ids[0].id}.${ids[1].id[k]}.${ids[i].id}`, {val: this.calculateWinddirectionChar(content[ids[0].id]['winddirection'][k])[0], ack: true});
				} else if (ids[i].id === 'winddirectionChar3') {
					this.setState(`${ids[0].id}.${ids[1].id[k]}.${ids[i].id}`, {val: this.calculateWinddirectionChar(content[ids[0].id]['winddirection'][k])[1], ack: true});
				} else if (ids[i].id === 'rainspot_vis') {
					this.setState(`${ids[0].id}.${ids[1].id[k]}.${ids[i].id}`, {val: this.createVisHTMLBindingRainspot(content[ids[0].id]['rainspot'][k]), ack: true});
				} else {
					// const testy3 because it does not directly work (number string issue)
					const testy3 = content[ids[0].id][ids[i].id][k];
					this.setState(`${ids[0].id}.${ids[1].id[k]}.${ids[i].id}`, {val: testy3, ack: true});
					// this.log.debug(`Path: ${ids[0].id}.${ids[1].id[k]}.${ids[i].id}`);
					// this.log.debug(`Value: ${content[ids[0].id][ids[i].id][k]}`);
				}
			}
		}
		this.log.debug(`[writeStates2]: objects creation for channel "${ids[0].id}" finished.`);
	}

	async writeStates3(ids, content) {
		this.log.debug(`[writeStates3]: start writing states for channel "${ids[0].id}". Please be patient...`);
		let iteration = 0;
		for (let k = 0; k < 7; k++) {
			for (let j = 0; j < ids[1].id.length; j++) {
				for (let i = 2; i < ids.length; i++) {

					if (ids[i].id === 'winddirectionChar2') {
						this.setState(`${ids[0].id}.${k}d_${ids[1].id[j]}.${ids[i].id}`, {val: this.calculateWinddirectionChar(content[ids[0].id]['winddirection'][iteration])[0], ack: true});
					} else if (ids[i].id === 'winddirectionChar3') {
						this.setState(`${ids[0].id}.${k}d_${ids[1].id[j]}.${ids[i].id}`, {val: this.calculateWinddirectionChar(content[ids[0].id]['winddirection'][iteration])[1], ack: true});
					} else if (ids[i].id === 'rainspot_vis') {
						this.setState(`${ids[0].id}.${k}d_${ids[1].id[j]}.${ids[i].id}`, {val: this.createVisHTMLBindingRainspot(content[ids[0].id]['rainspot'][iteration]), ack: true});
					} else {
						const testy1 = content[ids[0].id][ids[i].id][iteration];
						this.setState(`${ids[0].id}.${k}d_${ids[1].id[j]}.${ids[i].id}`, {val: testy1, ack: true});
						// this.log.debug(`Path: ${ids[0].id}.+${k}d_${ids[1].id[j]}.${ids[i].id}`);
						// this.log.debug(`Value: ${content[ids[0].id][ids[i].id][iteration]}`);
						// this.log.debug(`iteration: ${iteration}`);
					}

				}
				iteration += 1;
			}
		}
		this.log.debug(`[writeStates3]: objects creation for channel "${ids[0].id}" finished.`);
	}

	async getMeteoblueDateIntervall() {
		this.log.info(`[getMeteoblueDateIntervall]: Starting polltimer with a ${this.config.intervall} minutes interval.`);
		try {
			this.intervall = setInterval(async () => {
				await this.getMeteoblueData();
			}, this.config.intervall * 60000);
		} catch (error) {
			this.log.error(`${error}: (ERR_#019)`);
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

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	async onStateChange(id, state) {
		if (state !== null && state !== undefined) {
			if (state.ack === false) {
				// The state was manually changed
				// this.log.debug(`[onStateChange]: state ${id} changed: ${state.val} (ack = ${state.ack}). DO SOMETHING.`);
				await this.getMeteoblueData();
			} else {
				// The state was changed by system
				this.log.debug(`[onStateChange]: state ${id} changed: ${state.val} (ack = ${state.ack}). NO ACTION PERFORMED.`);
			}
		} else {
			// The state was deleted
			this.log.debug(`[onStateChange]: state ${id} was changed. NO ACTION PERFORMED.`);
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
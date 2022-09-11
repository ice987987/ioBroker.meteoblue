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
		this.log.debug(`this.config.basic_15min: ${this.config.basic_15min}`);
		this.log.debug(`this.config.basic_1h: ${this.config.basic_1h}`);
		this.log.debug(`this.config.basic_3h: ${this.config.basic_3h}`);
		this.log.debug(`this.config.basic_day: ${this.config.basic_day}`);
		this.log.debug(`this.config.current: ${this.config.current}`);
		this.log.debug(`this.config.clouds_1h: ${this.config.clouds_1h}`);
		this.log.debug(`this.config.clouds_3h: ${this.config.clouds_3h}`);
		this.log.debug(`this.config.clouds_day: ${this.config.clouds_day}`);
		this.log.debug(`this.config.sunmoon: ${this.config.sunmoon}`);
		this.log.debug(`this.config.agro_1h: ${this.config.agro_1h}`);
		this.log.debug(`this.config.agro_3h: ${this.config.agro_3h}`);
		this.log.debug(`this.config.agro_day: ${this.config.agro_day}`);
		this.log.debug(`this.config.agromodelLeafWetness_1h: ${this.config.agromodelleafwetness_1h}`);
		this.log.debug(`this.config.agromodelSowing_1h: ${this.config.agromodelsowing_1h}`);
		this.log.debug(`this.config.agromodelSpray_1h: ${this.config.agromodelspray_1h}`);
		this.log.debug(`this.config.solar_15min: ${this.config.solar_15min}`);
		this.log.debug(`this.config.solar_1h: ${this.config.solar_1h}`);
		this.log.debug(`this.config.solar_3h: ${this.config.solar_3h}`);
		this.log.debug(`this.config.solar_day: ${this.config.solar_day}`);
		this.log.debug(`this.config.solarEnsemble_1h: ${this.config.solarensemble_1h}`);
		this.log.debug(`this.config.wind_15min: ${this.config.wind_15min}`);
		this.log.debug(`this.config.wind_1h: ${this.config.wind_1h}`);
		this.log.debug(`this.config.wind_3h: ${this.config.wind_3h}`);
		this.log.debug(`this.config.wind_day: ${this.config.wind_day}`);
		this.log.debug(`this.config.wind80ensemble_1h: ${this.config.wind80ensemble_1h}`);
		this.log.debug(`this.config.sea_1h: ${this.config.sea_1h}`);
		this.log.debug(`this.config.sea_3h: ${this.config.sea_3h}`);
		this.log.debug(`this.config.sea_day: ${this.config.sea_day}`);
		this.log.debug(`this.config.air_1h: ${this.config.air_1h}`);
		this.log.debug(`this.config.air_3h: ${this.config.air_3h}`);
		this.log.debug(`this.config.air_day: ${this.config.air_day}`);
		this.log.debug(`this.config.airquality_1h: ${this.config.airquality_1h}`);
		this.log.debug(`this.config.airquality_3h: ${this.config.airquality_3h}`);
		this.log.debug(`this.config.airquality_day: ${this.config.airquality_day}`);
		this.log.debug(`this.config.ensemble_1h: ${this.config.ensemble_1h}`);
		this.log.debug(`this.config.trend_1h: ${this.config.trend_1h}`);
		this.log.debug(`this.config.trend_day: ${this.config.trend_day}`);

		// load system.config
		try {
			const systemConfig = await this.getForeignObjectAsync('system.config', 'state');
			this.log.debug(`systemConfig: ${JSON.stringify(systemConfig)}`);
		} catch (error) {
			this.log.debug(`error systemConfig: ${error}`);
		}

		// https://docs.meteoblue.com/en/weather-apis/packages-api/introduction#url-parameter
		this.meteoblueApiUrl = 'http://my.meteoblue.com/packages/';

		// check forecast package
		if (!this.config.basic_15min && !this.config.basic_1h && !this.config.basic_3h && !this.config.basic_day && !this.config.current && ! this.config.clouds_1h && !this.config.clouds_3h && !this.config.clouds_day && !this.config.sunmoon && !this.config.agro_1h && !this.config.agro_3h && !this.config.agro_day && !this.config.agromodelleafwetness_1h && !this.config.agromodelsowing_1h && !this.config.agromodelspray_1h && !this.config.solar_15min && !this.config.solar_1h && !this.config.solar_3h && !this.config.solar_day && !this.config.solarensemble_1h && !this.config.wind_15min && !this.config.wind_1h && !this.config.wind_3h && !this.config.wind_day && !this.config.wind80ensemble_1h && !this.config.sea_1h && !this.config.sea_3h && !this.config.sea_day && !this.config.air_1h && !this.config.air_3h && !this.config.air_day && !this.config.airquality_1h && !this.config.airquality_3h && !this.config.airquality_day && !this.config.trend_1h && !this.config.trend_day && !this.config.ensemble_1h) {
			this.log.error('No "forecast Package" selected. Please check configuration! (ERR_#001)');
			return;
		} else {
			if (this.config.basic_15min) {
				this.meteoblueApiUrl += 'basic-15min_';
			}
			if (this.config.basic_1h) {
				this.meteoblueApiUrl += 'basic-1h_';
			}
			if (this.config.basic_3h) {
				this.meteoblueApiUrl += 'basic-3h_';
			}
			if (this.config.basic_day) {
				this.meteoblueApiUrl += 'basic-day_';
			}
			if (this.config.current) {
				this.meteoblueApiUrl += 'current_';
			}
			if (this.config.clouds_1h) {
				this.meteoblueApiUrl += 'clouds-1h_';
			}
			if (this.config.clouds_3h) {
				this.meteoblueApiUrl += 'clouds-3h_';
			}
			if (this.config.clouds_day) {
				this.meteoblueApiUrl += 'clouds-day_';
			}
			if (this.config.clouds_3h) {
				this.meteoblueApiUrl += 'clouds-3h_';
			}
			if (this.config.sunmoon) {
				this.meteoblueApiUrl += 'sunmoon_';
			}
			if (this.config.agro_1h) {
				this.meteoblueApiUrl += 'agro-1h_';
			}
			if (this.config.agro_3h) {
				this.meteoblueApiUrl += 'agro-3h_';
			}
			if (this.config.agro_day) {
				this.meteoblueApiUrl += 'agro-day_';
			}
			if (this.config.agromodelleafwetness_1h) {
				this.meteoblueApiUrl += 'agromodelleafwetness-1h_';
			}
			if (this.config.agromodelsowing_1h) {
				this.meteoblueApiUrl += 'agromodelsowing-1h_';
			}
			if (this.config.agromodelspray_1h) {
				this.meteoblueApiUrl += 'agromodelspray-1h_';
			}
			if (this.config.solar_15min) {
				this.meteoblueApiUrl += 'solar-15min_';
			}
			if (this.config.solar_1h) {
				this.meteoblueApiUrl += 'solar-1h_';
			}
			if (this.config.solar_3h) {
				this.meteoblueApiUrl += 'solar-3h_';
			}
			if (this.config.solar_day) {
				this.meteoblueApiUrl += 'solar-day_';
			}
			if (this.config.solarensemble_1h) {
				this.meteoblueApiUrl += 'solarensemble-1h_';
			}
			if (this.config.wind_15min) {
				this.meteoblueApiUrl += 'wind-15min_';
			}
			if (this.config.wind_1h) {
				this.meteoblueApiUrl += 'wind-1h_';
			}
			if (this.config.wind_3h) {
				this.meteoblueApiUrl += 'wind-3h_';
			}
			if (this.config.wind_day) {
				this.meteoblueApiUrl += 'wind-day_';
			}
			if (this.config.wind80ensemble_1h) {
				this.meteoblueApiUrl += 'wind80ensemble-1h_';
			}
			if (this.config.sea_1h) {
				this.meteoblueApiUrl += 'sea-1h_';
			}
			if (this.config.sea_3h) {
				this.meteoblueApiUrl += 'sea-3h_';
			}
			if (this.config.sea_day) {
				this.meteoblueApiUrl += 'sea-day_';
			}
			if (this.config.air_1h) {
				this.meteoblueApiUrl += 'air-1h_';
			}
			if (this.config.air_3h) {
				this.meteoblueApiUrl += 'air-3h_';
			}
			if (this.config.air_day) {
				this.meteoblueApiUrl += 'air-day_';
			}
			if (this.config.airquality_1h) {
				this.meteoblueApiUrl += 'airquality-1h_';
			}
			if (this.config.airquality_3h) {
				this.meteoblueApiUrl += 'airquality-3h_';
			}
			if (this.config.airquality_day) {
				this.meteoblueApiUrl += 'airquality-day_';
			}
			if (this.config.trend_1h) {
				this.meteoblueApiUrl += 'trend-1h_';
			}
			if (this.config.trend_day) {
				this.meteoblueApiUrl += 'trend-day_';
			}
			if (this.config.ensemble_1h) {
				this.meteoblueApiUrl += 'ensemble-1h_';
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

			// units00 needed in forcast packages: basic-15min, basic-1h, basic-3h, basic-day, current, agro-1h, agro-3h, agro-day, sea-1h, sea-3h, sea-day, trend-1h, trend-day, ensemble-1h
			if (!this.config.basic_15min && !this.config.basic_1h && !this.config.basic_3h && !this.config.basic_day && !this.config.current && !this.config.agro_1h && !this.config.agro_3h && !this.config.agro_day && !this.config.sea_1h && !this.config.sea_3h && !this.config.sea_day && !this.config.trend_1h && !this.config.trend_day && !this.config.ensemble_1h) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units00". Please be patient...`);
				for (let i = 1; i < objectsStates.units00.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units00[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units00" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units00);
			}

			// units1 needed in forcast packages: basic-15min, basic-1h, basic-3h, basic-day, current, wind-15min, wind-1h, wind-3h, wind-day, wind80ensemble-1h, trend-1h, trend-day, ensemble-1h
			if (!this.config.basic_15min && !this.config.basic_1h && !this.config.basic_3h && !this.config.basic_day && !this.config.current && !this.config.wind_15min && !this.config.wind_1h && !this.config.wind_3h && !this.config.wind_day && !this.config.wind80ensemble_1h && !this.config.trend_1h && !this.config.trend_day && !this.config.ensemble_1h) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units1". Please be patient...`);
				for (let i = 1; i < objectsStates.units1.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units1[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units1" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units1);
			}

			// units2 needed in forcast packages: basic-15min, basic-1h, basic-3h, basic-day
			if (!this.config.basic_15min && !this.config.basic_1h && !this.config.basic_3h && !this.config.basic_day) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units2". Please be patient...`);
				for (let i = 1; i < objectsStates.units2.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units2[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units2" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units2);
			}

			// units21 needed in forcast packages: basic-15min, basic-1h, basic-3h, basic-day, wind-15min, wind-1h, wind-3h, wind-day, sea-1h, sea-3h, sea-day, trend-1h, trend-day, ensemble-1h
			if (!this.config.basic_15min && !this.config.basic_1h && !this.config.basic_3h && !this.config.basic_day && !this.config.wind_15min && !this.config.wind_1h && !this.config.wind_3h && !this.config.wind_day && !this.config.sea_1h && !this.config.sea_3h && !this.config.sea_day && !this.config.trend_1h && !this.config.trend_day && !this.config.ensemble_1h) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units21". Please be patient...`);
				for (let i = 1; i < objectsStates.units21.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units21[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units21" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units21);
			}

			// units22 needed in forecast packages: basic-15min, basic-1h, basic-3h, basic-day, air-1h, air-3h, air-day, airquality-1h, airquality-3h, airquality-day
			if (!this.config.basic_15min && !this.config.basic_1h && !this.config.basic_3h && !this.config.basic_day && !this.config.air_1h && !this.config.air_3h && !this.config.air_day && !this.config.airquality_1h && !this.config.airquality_3h && !this.config.airquality_day) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units21". Please be patient...`);
				for (let i = 1; i < objectsStates.units22.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units22[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units22" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units22);
			}

			// units23 needed in forecast packages: basic-15min, basic-1h, basic-3h, basic-day, trend-1h, trend-day, ensemble-1h
			if (!this.config.basic_15min && !this.config.basic_1h && !this.config.basic_3h && !this.config.basic_day && !this.config.trend_1h && !this.config.trend_day && !this.config.ensemble_1h) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units23". Please be patient...`);
				for (let i = 1; i < objectsStates.units23.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units23[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units23" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units23);
			}

			// units24 needed in forecast packages: basic-15min, basic-1h, basic-3h, basic-day, trend-1h, trend-day
			if (!this.config.basic_15min && !this.config.basic_1h && !this.config.basic_3h && !this.config.basic_day && !this.config.trend_1h && !this.config.trend_day) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units24". Please be patient...`);
				for (let i = 1; i < objectsStates.units24.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units24[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units24" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units24);
			}

			// units3 needed in forcast packages: clouds-1h, clouds-3h, clouds-day
			if (!this.config.clouds_1h && !this.config.clouds_3h && !this.config.clouds_day) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units3". Please be patient...`);
				for (let i = 1; i < objectsStates.units3.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units3[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units3" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units3);
			}

			// units31 needed in forcast packages: clouds-1h, clouds-3h, clouds-day, trend-1h, trend-day, ensemble-1h
			if (!this.config.clouds_1h && !this.config.clouds_3h && !this.config.clouds_day && !this.config.trend_1h && !this.config.trend_day && !this.config.ensemble_1h) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units31". Please be patient...`);
				for (let i = 1; i < objectsStates.units31.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units31[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units31" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units31);
			}

			// units4 needed in forcast packages: agro-1h, agro-3h, agro-day
			if (!this.config.agro_1h && !this.config.agro_3h && !this.config.agro_day) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units4". Please be patient...`);
				for (let i = 1; i < objectsStates.units4.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units4[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units4" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units4);
			}

			// units5 needed in forcast packages: solar-15min, solar-1h, solar-3h, solar-day, solarensemble-1h, trend-1h, trend-day, ensemble-1h
			if (!this.config.solar_15min && !this.config.solar_1h && !this.config.solar_3h && !this.config.solar_day && !this.config.solarensemble_1h && !this.config.trend_1h && !this.config.trend_day && !this.config.ensemble_1h) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units5". Please be patient...`);
				for (let i = 1; i < objectsStates.units5.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units5[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units5" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units5);
			}

			// units6 needed in forcast packages: solar-15min, solar-1h, solar-3h, solar-day
			if (!this.config.solar_15min && !this.config.solar_1h && !this.config.solar_3h && !this.config.solar_day) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units6". Please be patient...`);
				for (let i = 1; i < objectsStates.units6.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units6[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units6" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units6);
			}

			// units61 needed in forcast packages: solar-15min, solar-1h, solar-3h, solar-day, trend-1h, trend-day
			if (!this.config.solar_15min && !this.config.solar_1h && !this.config.solar_3h && !this.config.solar_day && !this.config.trend_1h && !this.config.trend_day) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units61". Please be patient...`);
				for (let i = 1; i < objectsStates.units61.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units61[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units61" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units61);
			}

			// units7 needed in forcast packages: wind_15min, wind_1h, wind_3h, wind_day
			if (!this.config.wind_15min && !this.config.wind_1h && !this.config.wind_3h && !this.config.wind_day) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units7". Please be patient...`);
				for (let i = 1; i < objectsStates.units7.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units7[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units7" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units7);
			}

			// units8 needed in forcast packages: sea-1h, sea-3h, sea-day
			if (!this.config.sea_1h && !this.config.sea_3h && !this.config.sea_day) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units8". Please be patient...`);
				for (let i = 1; i < objectsStates.units8.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units8[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units8" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units8);
			}

			// units9 needed in forcast packages: air-1h, air-3h, air-day
			if (!this.config.air_1h && !this.config.air_3h && !this.config.air_day) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units9". Please be patient...`);
				for (let i = 1; i < objectsStates.units9.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units9[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units9" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units9);
			}

			// units10 needed in forcast packages: airquality-1h, airquality-3h, airquality-day
			if (!this.config.airquality_1h && !this.config.airquality_3h && !this.config.airquality_day) {
				this.log.debug(`[deleteObjects1]: start deleting states for channel "units10". Please be patient...`);
				for (let i = 1; i < objectsStates.units10.length; i++) {
					await this.delObjectAsync(`units.${objectsStates.units10[i].id}`);
				}
				this.log.debug(`[deleteObjects1]: states deletion for channel "units10" finished.`);
			} else {
				await this.createStatesObjects1(objectsStates.units10);
			}

			// forecast package basic-15min, solar-15min, wind-15min
			if (!this.config.basic_15min && !this.config.solar_15min && !this.config.wind_15min) {
				this.log.debug(`[deleteObjects0]: start deleting states for channel "data_xmin". Please be patient...`);
				await this.delObjectAsync('data_xmin', {recursive: true});
				this.log.debug(`[deleteObjects0]: states deletion for channel "data_xmin" finished.`);
			} else {
				if (!this.config.basic_15min) {
					this.log.debug(`[deleteObjects0]: start deleting states for channel "basic_15min". Please be patient...`);
					//todo
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.basic_15min[1].id.length; j++) {
							for (let i = 2; i < objectsStates.basic_15min.length; i++) {
								if (objectsStates.basic_15min[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.basic_15min[0].id}.${k}d_${objectsStates.basic_15min[1].id[j]}.${objectsStates.basic_15min[i].id}`);
									//this.log.debug(`${objectsStates.basic_15min[0].id}.${k}d_${objectsStates.basic_15min[1].id[j]}.${objectsStates.basic_15min[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects0]: states deletion for channel "basic_15min" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.basic_15min);
				}
				if (!this.config.solar_15min) {
					this.log.debug(`[deleteObjects0]: start deleting states for channel "solar_15min". Please be patient...`);
					//todo
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.solar_15min[1].id.length; j++) {
							for (let i = 2; i < objectsStates.solar_15min.length; i++) {
								if (objectsStates.solar_15min[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.solar_15min[0].id}.${k}d_${objectsStates.solar_15min[1].id[j]}.${objectsStates.solar_15min[i].id}`);
									//this.log.debug(`${objectsStates.solar_15min[0].id}.${k}d_${objectsStates.solar_15min[1].id[j]}.${objectsStates.solar_15min[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects0]: states deletion for channel "solar_15min" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.solar_15min);
				}
				if (!this.config.wind_15min) {
					this.log.debug(`[deleteObjects0]: start deleting states for channel "wind_15min". Please be patient...`);
					//todo
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.wind_15min[1].id.length; j++) {
							for (let i = 2; i < objectsStates.wind_15min.length; i++) {
								if (objectsStates.wind_15min[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.wind_15min[0].id}.${k}d_${objectsStates.wind_15min[1].id[j]}.${objectsStates.wind_15min[i].id}`);
									//this.log.debug(`${objectsStates.wind_15min[0].id}.${k}d_${objectsStates.wind_15min[1].id[j]}.${objectsStates.wind_15min[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects0]: states deletion for channel "wind_15min" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.wind_15min);
				}
			}

			// forecast packages basic-1h, clouds-1h, agro_1h, agromodelleafwetness-1h, agromodelsowing_1h, agromodelspray_1h, solar_1h, wind-1h, sea-1h, air-1h, airquality_1h
			if (!this.config.basic_1h && !this.config.clouds_1h && !this.config.agro_1h && !this.config.agromodelleafwetness_1h && !this.config.agromodelsowing_1h && !this.config.agromodelspray_1h && !this.config.solar_1h && !this.config.wind_1h && !this.config.sea_1h && !this.config.air_1h && !this.config.airquality_1h) {
				this.log.debug(`[deleteObjects0]: start deleting states for channel "data_1h". Please be patient...`);
				await this.delObjectAsync('data_1h', {recursive: true});
				this.log.debug(`[deleteObjects0]: states deletion for channel "data_1h" finished.`);
			} else {
				if (!this.config.basic_1h) {
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
				if (!this.config.clouds_1h) {
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
				if (!this.config.agro_1h) {
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
				if (!this.config.agromodelleafwetness_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "agromodelleafwetness_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.agromodelleafwetness_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.agromodelleafwetness_1h.length; i++) {
								if (objectsStates.agromodelleafwetness_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.agromodelleafwetness_1h[0].id}.${k}d_${objectsStates.agromodelleafwetness_1h[1].id[j]}.${objectsStates.agromodelleafwetness_1h[i].id}`);
									//this.log.debug(`${objectsStates.agromodelleafwetness_1h[0].id}.${k}d_${objectsStates.agromodelleafwetness_1h[1].id[j]}.${objectsStates.agromodelleafwetness_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "agromodelleafwetness_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.agromodelleafwetness_1h);
				}
				if (!this.config.agromodelsowing_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "agromodelSowing_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.agromodelsowing_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.agromodelsowing_1h.length; i++) {
								if (objectsStates.agromodelsowing_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.agromodelsowing_1h[0].id}.${k}d_${objectsStates.agromodelsowing_1h[1].id[j]}.${objectsStates.agromodelsowing_1h[i].id}`);
									//this.log.debug(`${objectsStates.agromodelsowing_1h[0].id}.${k}d_${objectsStates.agromodelsowing_1h[1].id[j]}.${objectsStates.agromodelsowing_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "agromodelSowing_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.agromodelsowing_1h);
				}
				if (!this.config.agromodelspray_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "agromodelspray_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.agromodelspray_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.agromodelspray_1h.length; i++) {
								if (objectsStates.agromodelspray_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.agromodelspray_1h[0].id}.${k}d_${objectsStates.agromodelspray_1h[1].id[j]}.${objectsStates.agromodelspray_1h[i].id}`);
									//this.log.debug(`${objectsStates.agromodelspray_1h[0].id}.${k}d_${objectsStates.agromodelspray_1h[1].id[j]}.${objectsStates.agromodelspray_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "agromodelspray_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.agromodelspray_1h);
				}
				if (!this.config.solar_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "solar_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.solar_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.solar_1h.length; i++) {
								if (objectsStates.solar_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.solar_1h[0].id}.${k}d_${objectsStates.solar_1h[1].id[j]}.${objectsStates.solar_1h[i].id}`);
									//this.log.debug(`${objectsStates.solar_1h[0].id}.${k}d_${objectsStates.solar_1h[1].id[j]}.${objectsStates.solar_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "solar_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.solar_1h);
				}
				if (!this.config.solarensemble_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "solarensemble_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.solarensemble_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.solarensemble_1h.length; i++) {
								if (objectsStates.solarensemble_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.solarensemble_1h[0].id}.${k}d_${objectsStates.solarensemble_1h[1].id[j]}.${objectsStates.solarensemble_1h[i].id}`);
									//this.log.debug(`${objectsStates.solarensemble_1h[0].id}.${k}d_${objectsStates.solarensemble_1h[1].id[j]}.${objectsStates.solarensemble_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "solarensemble_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.solarensemble_1h);
				}
				if (!this.config.wind_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "wind_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.wind_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.wind_1h.length; i++) {
								if (objectsStates.wind_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.solarensemble_1h[0].id}.${k}d_${objectsStates.wind_1h[1].id[j]}.${objectsStates.wind_1h[i].id}`);
									//this.log.debug(`${objectsStates.wind_1h[0].id}.${k}d_${objectsStates.wind_1h[1].id[j]}.${objectsStates.wind_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "wind_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.wind_1h);
				}
				if (!this.config.wind80ensemble_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "wind80ensemble_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.wind80ensemble_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.wind80ensemble_1h.length; i++) {
								if (objectsStates.wind80ensemble_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.wind80ensemble_1h[0].id}.${k}d_${objectsStates.wind80ensemble_1h[1].id[j]}.${objectsStates.wind80ensemble_1h[i].id}`);
									//this.log.debug(`${objectsStates.wind80ensemble_1h[0].id}.${k}d_${objectsStates.wind80ensemble_1h[1].id[j]}.${objectsStates.wind80ensemble_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "wind80ensemble_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.wind80ensemble_1h);
				}
				if (!this.config.sea_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "sea_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.sea_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.sea_1h.length; i++) {
								if (objectsStates.sea_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.sea_1h[0].id}.${k}d_${objectsStates.sea_1h[1].id[j]}.${objectsStates.sea_1h[i].id}`);
									//this.log.debug(`${objectsStates.sea_1h[0].id}.${k}d_${objectsStates.sea_1h[1].id[j]}.${objectsStates.sea_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "sea_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.sea_1h);
				}
				if (!this.config.air_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "air_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.air_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.air_1h.length; i++) {
								if (objectsStates.air_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.air_1h[0].id}.${k}d_${objectsStates.air_1h[1].id[j]}.${objectsStates.air_1h[i].id}`);
									//this.log.debug(`${objectsStates.air_1h[0].id}.${k}d_${objectsStates.air_1h[1].id[j]}.${objectsStates.air_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "air_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.air_1h);
				}
				if (!this.config.airquality_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "airquality_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.airquality_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.airquality_1h.length; i++) {
								if (objectsStates.airquality_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.airquality_1h[0].id}.${k}d_${objectsStates.airquality_1h[1].id[j]}.${objectsStates.airquality_1h[i].id}`);
									//this.log.debug(`${objectsStates.airquality_1h[0].id}.${k}d_${objectsStates.airquality_1h[1].id[j]}.${objectsStates.airquality_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "airquality_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.airquality_1h);
				}
			}

			// forecast packages solarensemble-1h, wind80ensemble-1h, trend-1h
			if (!this.config.solarensemble_1h && !this.config.wind80ensemble_1h && !this.config.trend_1h) {
				this.log.debug(`[deleteObjects0]: start deleting states for channel "trend_1h". Please be patient...`);
				await this.delObjectAsync('trend_1h', {recursive: true});
				this.log.debug(`[deleteObjects0]: states deletion for channel "trend_1h" finished.`);
			} else {
				if (!this.config.solarensemble_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "solarensemble_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.solarensemble_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.solarensemble_1h.length; i++) {
								if (objectsStates.solarensemble_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.solarensemble_1h[0].id}.${k}d_${objectsStates.solarensemble_1h[1].id[j]}.${objectsStates.solarensemble_1h[i].id}`);
									//this.log.debug(`${objectsStates.solarensemble_1h[0].id}.${k}d_${objectsStates.solarensemble_1h[1].id[j]}.${objectsStates.solarensemble_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "solarensemble_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.solarensemble_1h);
				}
				if (!this.config.wind80ensemble_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "wind80ensemble_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.wind80ensemble_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.wind80ensemble_1h.length; i++) {
								if (objectsStates.wind80ensemble_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.wind80ensemble_1h[0].id}.${k}d_${objectsStates.wind80ensemble_1h[1].id[j]}.${objectsStates.wind80ensemble_1h[i].id}`);
									//this.log.debug(`${objectsStates.wind80ensemble_1h[0].id}.${k}d_${objectsStates.wind80ensemble_1h[1].id[j]}.${objectsStates.wind80ensemble_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "wind80ensemble_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.wind80ensemble_1h);
				}
				if (!this.config.trend_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "trend_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.trend_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.trend_1h.length; i++) {
								if (objectsStates.trend_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.trend_1h[0].id}.${k}d_${objectsStates.trend_1h[1].id[j]}.${objectsStates.trend_1h[i].id}`);
									//this.log.debug(`${objectsStates.trend_1h[0].id}.${k}d_${objectsStates.trend_1h[1].id[j]}.${objectsStates.trend_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "trend_1h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.trend_1h);
				}
			}

			// forecast packages ensemble-1h
			if (!this.config.ensemble_1h) {
				this.log.debug(`[deleteObjects0]: start deleting states for channel "gfsensemble_1h". Please be patient...`);
				await this.delObjectAsync('gfsensemble_1h', {recursive: true});
				this.log.debug(`[deleteObjects0]: states deletion for channel "gfsensemble_1h" finished.`);
			} else {
				/*
				if (!this.config.ensemble_1h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "ensemble_1h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.ensemble_1h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.ensemble_1h.length; i++) {
								if (objectsStates.ensemble_1h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.ensemble_1h[0].id}.${k}d_${objectsStates.ensemble_1h[1].id[j]}.${objectsStates.ensemble_1h[i].id}`);
									//this.log.debug(`${objectsStates.ensemble_1h[0].id}.${k}d_${objectsStates.ensemble_1h[1].id[j]}.${objectsStates.ensemble_1h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "ensemble_1h" finished.`);
				} else {
				*/
				await this.createStatesObjects3(objectsStates.ensemble_1h);
				/*
				}
				*/
			}
			/*
			// forecast packages multimodel-3h
			if (!this.config.multimodel_3h) {
				this.log.debug(`[deleteObjects0]: start deleting states for channel "trend_3h". Please be patient...`);
				await this.delObjectAsync('trend_3h', {recursive: true});
				this.log.debug(`[deleteObjects0]: states deletion for channel "trend_3h" finished.`);
			} else {
				if (!this.config.multimodel_3h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "multimodel_3h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.multimodel_3h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.multimodel_3h.length; i++) {
								if (objectsStates.multimodel_3h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.multimodel_3h[0].id}.${k}d_${objectsStates.multimodel_3h[1].id[j]}.${objectsStates.multimodel_3h[i].id}`);
									//this.log.debug(`${objectsStates.multimodel_3h[0].id}.${k}d_${objectsStates.multimodel_3h[1].id[j]}.${objectsStates.multimodel_3h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "multimodel_3h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.multimodel_3h);
				}
			}
			*/

			// forecast packages basic-3h, clouds-3h, agro-3h, solar-3h, wind-3h, sea-3h, air-3h, airquality-3h
			if (!this.config.basic_3h && !this.config.clouds_3h && !this.config.agro_3h && !this.config.solar_3h && !this.config.wind_3h && !this.config.sea_3h && !this.config.air_3h && !this.config.airquality_3h) {
				this.log.debug(`[deleteObjects0]: start deleting states for channel "data_3h". Please be patient...`);
				await this.delObjectAsync('data_3h', {recursive: true});
				this.log.debug(`[deleteObjects0]: states deletion for channel "data_3h" finished.`);
			} else {
				if (!this.config.basic_3h) {
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
				if (!this.config.clouds_3h) {
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
				if (!this.config.agro_3h) {
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
				if (!this.config.solar_3h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "solar_3h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.solar_3h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.solar_3h.length; i++) {
								if (objectsStates.solar_3h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.solar_3h[0].id}.${k}d_${objectsStates.solar_3h[1].id[j]}.${objectsStates.solar_3h[i].id}`);
									//this.log.debug(`${objectsStates.solar_3h[0].id}.${k}d_${objectsStates.solar_3h[1].id[j]}.${objectsStates.solar_3h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "solar_3h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.solar_3h);
				}
				if (!this.config.wind_3h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "wind_3h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.wind_3h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.wind_3h.length; i++) {
								if (objectsStates.wind_3h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.wind_3h[0].id}.${k}d_${objectsStates.wind_3h[1].id[j]}.${objectsStates.wind_3h[i].id}`);
									//this.log.debug(`${objectsStates.wind_3h[0].id}.${k}d_${objectsStates.wind_3h[1].id[j]}.${objectsStates.wind_3h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "wind_3h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.wind_3h);
				}
				if (!this.config.sea_3h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "sea_3h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.sea_3h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.sea_3h.length; i++) {
								if (objectsStates.sea_3h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.sea_3h[0].id}.${k}d_${objectsStates.sea_3h[1].id[j]}.${objectsStates.sea_3h[i].id}`);
									//this.log.debug(`${objectsStates.sea_3h[0].id}.${k}d_${objectsStates.sea_3h[1].id[j]}.${objectsStates.sea_3h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "sea_3h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.sea_3h);
				}
				if (!this.config.air_3h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "air_3h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.air_3h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.air_3h.length; i++) {
								if (objectsStates.air_3h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.air_3h[0].id}.${k}d_${objectsStates.air_3h[1].id[j]}.${objectsStates.air_3h[i].id}`);
									//this.log.debug(`${objectsStates.air_3h[0].id}.${k}d_${objectsStates.air_3h[1].id[j]}.${objectsStates.air_3h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "air_3h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.air_3h);
				}
				if (!this.config.airquality_3h) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "airquality_3h". Please be patient...`);
					for (let k = 0; k < 7; k++) {
						for (let j = 0; j < objectsStates.airquality_3h[1].id.length; j++) {
							for (let i = 2; i < objectsStates.airquality_3h.length; i++) {
								if (objectsStates.airquality_3h[i].id !== 'time') {
									await this.delObjectAsync(`${objectsStates.airquality_3h[0].id}.${k}d_${objectsStates.airquality_3h[1].id[j]}.${objectsStates.airquality_3h[i].id}`);
									//this.log.debug(`${objectsStates.airquality_3h[0].id}.${k}d_${objectsStates.airquality_3h[1].id[j]}.${objectsStates.airquality_3h[i].id}`);
								}
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "airquality_3h" finished.`);
				} else {
					await this.createStatesObjects3(objectsStates.airquality_3h);
				}
			}

			// forecast packages basic-day, clouds-day, agro-day, solar-day, wind-day, sea-day, air-day, airquality-day
			if (!this.config.basic_day && !this.config.clouds_day && !this.config.sunmoon && !this.config.agro_day && !this.config.solar_day && !this.config.wind_day && !this.config.sea_day && !this.config.air_day && !this.config.airquality_day) {
				this.log.debug(`[deleteObjects0]: start deleting states for channel "data_day". Please be patient...`);
				await this.delObjectAsync('data_day', {recursive: true});
				this.log.debug(`[deleteObjects0]: states deletion for channel "data_day" finished.`);
			} else {
				if (!this.config.basic_day) {
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
				if (!this.config.clouds_day) {
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
				if (!this.config.sunmoon) {
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
				if (!this.config.agro_day) {
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
				if (!this.config.solar_day) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "solar_day". Please be patient...`);
					for (let k = 0; k < objectsStates.solar_day[1].id.length; k++) {
						for (let i = 2; i < objectsStates.solar_day.length; i++) {
							if (objectsStates.solar_day[i].id !== 'time') {
								await this.delObjectAsync(`${objectsStates.solar_day[0].id}.${objectsStates.solar_day[1].id[k]}.${objectsStates.solar_day[i].id}`);
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "solar_day" finished.`);
				} else {
					await this.createStatesObjects2(objectsStates.solar_day);
				}
				if (!this.config.wind_day) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "wind_day". Please be patient...`);
					for (let k = 0; k < objectsStates.wind_day[1].id.length; k++) {
						for (let i = 2; i < objectsStates.wind_day.length; i++) {
							if (objectsStates.wind_day[i].id !== 'time') {
								await this.delObjectAsync(`${objectsStates.wind_day[0].id}.${objectsStates.wind_day[1].id[k]}.${objectsStates.wind_day[i].id}`);
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "wind_day" finished.`);
				} else {
					await this.createStatesObjects2(objectsStates.wind_day);
				}
				if (!this.config.sea_day) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "sea_day". Please be patient...`);
					for (let k = 0; k < objectsStates.sea_day[1].id.length; k++) {
						for (let i = 2; i < objectsStates.sea_day.length; i++) {
							if (objectsStates.sea_day[i].id !== 'time') {
								await this.delObjectAsync(`${objectsStates.sea_day[0].id}.${objectsStates.sea_day[1].id[k]}.${objectsStates.sea_day[i].id}`);
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "sea_day" finished.`);
				} else {
					await this.createStatesObjects2(objectsStates.sea_day);
				}
				if (!this.config.air_day) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "air_day". Please be patient...`);
					for (let k = 0; k < objectsStates.air_day[1].id.length; k++) {
						for (let i = 2; i < objectsStates.air_day.length; i++) {
							if (objectsStates.air_day[i].id !== 'time') {
								await this.delObjectAsync(`${objectsStates.air_day[0].id}.${objectsStates.air_day[1].id[k]}.${objectsStates.air_day[i].id}`);
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "air_day" finished.`);
				} else {
					await this.createStatesObjects2(objectsStates.air_day);
				}
				if (!this.config.airquality_day) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "airquality_day". Please be patient...`);
					for (let k = 0; k < objectsStates.airquality_day[1].id.length; k++) {
						for (let i = 2; i < objectsStates.airquality_day.length; i++) {
							if (objectsStates.airquality_day[i].id !== 'time') {
								await this.delObjectAsync(`${objectsStates.airquality_day[0].id}.${objectsStates.airquality_day[1].id[k]}.${objectsStates.airquality_day[i].id}`);
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "airquality_day" finished.`);
				} else {
					await this.createStatesObjects2(objectsStates.airquality_day);
				}
			}

			// forecast packages trend-day
			if (!this.config.trend_day) {
				this.log.debug(`[deleteObjects0]: start deleting states for channel "trend_day". Please be patient...`);
				await this.delObjectAsync('trend_day', {recursive: true});
				this.log.debug(`[deleteObjects0]: states deletion for channel "trend_day" finished.`);
			} else {
				/*
				if (!this.config.trend_day) {
					this.log.debug(`[deleteObjects3]: start deleting states for channel "trend_day". Please be patient...`);
					for (let k = 0; k < objectsStates.trend_day[1].id.length; k++) {
						for (let i = 2; i < objectsStates.trend_day.length; i++) {
							if (objectsStates.trend_day[i].id !== 'time') {
								await this.delObjectAsync(`${objectsStates.trend_day[0].id}.${objectsStates.trend_day[1].id[k]}.${objectsStates.trend_day[i].id}`);
							}
						}
					}
					this.log.debug(`[deleteObjects3]: states deletion for channel "trend_day" finished.`);
				} else {
				*/
				await this.createStatesObjects2(objectsStates.trend_day);
				/*
				}
				*/
			}

			// forecast package current
			if (!this.config.current) {
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


				// units00 needed in forcast packages basic-15min, basic-1h, basic-3h, basic-day, current, agro-1h, agro-3h, agro-day, sea-1h, trend-1h, trend-day, ensemble-1h
				if (this.config.basic_15min || this.config.basic_1h || this.config.basic_3h || this.config.basic_day || this.config.current || this.config.agro_1h || this.config.agro_3h || this.config.agro_day || this.config.sea_1h || this.config.trend_1h || this.config.trend_day || this.config.ensemble_1h) {
					await this.writeStates1(objectsStates.units00, content);
				}

				// units1 needed in forcast packages basic-15min, basic-1h, basic-3h, basic-day, current, wind-15min, wind-1h, wind-3h, wind-day, wind80ensemble-1h, trend-1h, trend-day, ensemble-1h
				if (this.config.basic_15min || this.config.basic_1h || this.config.basic_3h || this.config.basic_day || this.config.current || this.config.wind_15min || this.config.wind_1h || this.config.wind_3h || this.config.wind_day || this.config.wind80ensemble_1h || this.config.trend_1h || this.config.trend_day || this.config.ensemble_1h) {
					await this.writeStates1(objectsStates.units1, content);
				}

				// units2 needed in forcast basic-15min, basic-1h, basic-3h, basic-day
				if (this.config.basic_15min || this.config.basic_1h || this.config.basic_3h || this.config.basic_day) {
					await this.writeStates1(objectsStates.units2, content);
				}

				// units21 needed in forecast basic-15min, basic-1h, basic-3h, basic-day, wind-15min, wind-1h, wind-3h, wind-day, sea-1h, trend-1h, trend-day, ensemble-1h
				if (this.config.basic_15min || this.config.basic_1h || this.config.basic_3h || this.config.basic_day || this.config.wind_15min || this.config.wind_1h || this.config.wind_3h || this.config.wind_day || this.config.sea_1h || this.config.trend_1h || this.config.trend_day || this.config.ensemble_1h) {
					await this.writeStates1(objectsStates.units21, content);
				}

				// units22 needed in forecast basic-15min, basic-1h, basic-3h, basic-day, air-1h, air-3h, air-day, airquality-1h, airquality-3h, airquality-day
				if (this.config.basic_15min || this.config.basic_1h || this.config.basic_3h || this.config.basic_day || this.config.air_1h || this.config.air_3h || this.config.air_day || this.config.airquality_1h || this.config.airquality_3h || this.config.airquality_day) {
					await this.writeStates1(objectsStates.units22, content);
				}

				// units23 needed in forecast basic-15min, basic-1h, basic-3h, basic-day, trend-1h, trend-day, ensemble-1h
				if (this.config.basic_15min || this.config.basic_1h || this.config.basic_3h || this.config.basic_day || this.config.trend_1h || this.config.trend_day || this.config.ensemble_1h) {
					await this.writeStates1(objectsStates.units23, content);
				}

				// units24 needed in forecast basic-15min, basic-1h, basic-3h, basic-day, trend-1h, trend-day
				if (this.config.basic_15min || this.config.basic_1h || this.config.basic_3h || this.config.basic_day || this.config.trend_1h || this.config.trend_day) {
					await this.writeStates1(objectsStates.units24, content);
				}

				// units3 needed in forcast clouds-1h, clouds-3h, clouds-day
				if (this.config.clouds_1h || this.config.clouds_3h || this.config.clouds_day) {
					await this.writeStates1(objectsStates.units3, content);
				}

				// units31 needed in forcast clouds-1h, clouds-3h, clouds-day, trend-1h, trend-day, ensemble-1h
				if (this.config.clouds_1h || this.config.clouds_3h || this.config.clouds_day || this.config.trend_1h || this.config.trend_day || this.config.ensemble_1h) {
					await this.writeStates1(objectsStates.units31, content);
				}

				// units4 needed in forcast agro-1h, agro-3h, agro-day
				if (this.config.agro_1h || this.config.agro_3h || this.config.agro_day) {
					await this.writeStates1(objectsStates.units4, content);
				}

				// units5 needed in forcast solar-15min, solar-1h, solar-3h, solar-day, solarensemble-1h, trend-1h, trend-day, ensemble-1h
				if (this.config.solar_15min || this.config.solar_1h || this.config.solar_3h || this.config.solar_day || this.config.solarensemble_1h || this.config.trend_1h || this.config.trend_day || this.config.ensemble_1h) {
					await this.writeStates1(objectsStates.units5, content);
				}

				// units6 needed in forcast solar-15min, solar-1h, solar-3h, solar-day
				if (this.config.solar_15min || this.config.solar_1h || this.config.solar_3h || this.config.solar_day) {
					await this.writeStates1(objectsStates.units6, content);
				}

				// units61 needed in forcast solar-15min, solar-1h, solar-3h, solar-day, trend-1h, trend-day
				if (this.config.solar_15min || this.config.solar_1h || this.config.solar_3h || this.config.solar_day || this.config.trend_1h || this.config.trend_day) {
					await this.writeStates1(objectsStates.units61, content);
				}

				// units7 needed in forcast wind-15min, wind-1h, wind-3h, wind-day
				if (this.config.wind_15min || this.config.wind_1h || this.config.wind_3h || this.config.wind_day) {
					await this.writeStates1(objectsStates.units7, content);
				}

				// units8 needed in forcast sea-1h, sea-3h, sea-day
				if (this.config.sea_1h || this.config.sea_3h || this.config.sea_day) {
					await this.writeStates1(objectsStates.units8, content);
				}

				// units9 needed in forcast air-1h, air-3h, air-day
				if (this.config.air_1h || this.config.air_3h || this.config.air_day) {
					await this.writeStates1(objectsStates.units9, content);
				}

				// unit10 needed in forcast airquality-1h, airquality-3h, airquality-day
				if (this.config.airquality_1h || this.config.airquality_3h || this.config.airquality_day) {
					await this.writeStates1(objectsStates.units10, content);
				}

				// basic-15min
				if (content.data_xmin && this.config.basic_15min) {
					await this.writeStates3(objectsStates.basic_15min, content);
				}
				// basic-1h
				if (content.data_1h && this.config.basic_1h) {
					await this.writeStates3(objectsStates.basic_1h, content);
				}
				// basic-3h
				if (content.data_3h && this.config.basic_3h) {
					await this.writeStates3(objectsStates.basic_3h, content);
				}
				// basic-day
				if (content.data_day && this.config.basic_day) {
					await this.writeStates2(objectsStates.basic_day, content);
				}
				// current
				if (content.data_current && this.config.current) {
					await this.writeStates1(objectsStates.current, content);
				}

				// clouds-1h
				if (content.data_1h && this.config.clouds_1h) {
					await this.writeStates3(objectsStates.clouds_1h, content);
				}
				// clouds-3h
				if (content.data_3h && this.config.clouds_3h) {
					await this.writeStates3(objectsStates.clouds_3h, content);
				}
				// clouds-day
				if (content.data_day && this.config.clouds_day) {
					await this.writeStates2(objectsStates.clouds_day, content);
				}

				// sunmoon
				if (content.data_day && this.config.sunmoon) {
					await this.writeStates2(objectsStates.sunmoon, content);
				}

				// agro-1h
				if (content.data_1h && this.config.agro_1h) {
					await this.writeStates3(objectsStates.agro_1h, content);
				}
				// agro-3h
				if (content.data_3h && this.config.agro_3h) {
					await this.writeStates3(objectsStates.agro_3h, content);
				}
				// agro-day
				if (content.data_day && this.config.agro_day) {
					await this.writeStates2(objectsStates.agro_day, content);
				}

				// agromodelleafwetness-1h
				if (content.data_1h && this.config.agromodelleafwetness_1h) {
					await this.writeStates3(objectsStates.agromodelleafwetness_1h, content);
				}

				// agromodelsowing-1h
				if (content.data_1h && this.config.agromodelsowing_1h) {
					await this.writeStates3(objectsStates.agromodelsowing_1h, content);
				}

				// agromodelspray-1h
				if (content.data_1h && this.config.agromodelspray_1h) {
					await this.writeStates3(objectsStates.agromodelspray_1h, content);
				}

				// solar-15min
				if (content.data_xmin && this.config.solar_15min) {
					await this.writeStates3(objectsStates.solar_15min, content);
				}
				// solar-1h
				if (content.data_1h && this.config.solar_1h) {
					await this.writeStates3(objectsStates.solar_1h, content);
				}
				// solar-3h
				if (content.data_3h && this.config.solar_3h) {
					await this.writeStates3(objectsStates.solar_3h, content);
				}
				// solar-day
				if (content.data_day && this.config.solar_day) {
					await this.writeStates2(objectsStates.solar_day, content);
				}

				// solarensemble-1h
				if (content.data_1h && this.config.solarensemble_1h) {
					await this.writeStates3(objectsStates.solarensemble_1h, content);
				}

				// wind-15min
				if (content.data_xmin && this.config.wind_15min) {
					await this.writeStates3(objectsStates.wind_15min, content);
				}
				// wind-1h
				if (content.data_1h && this.config.wind_1h) {
					await this.writeStates3(objectsStates.wind_1h, content);
				}
				// wind-3h
				if (content.data_3h && this.config.wind_3h) {
					await this.writeStates3(objectsStates.wind_3h, content);
				}
				// wind-day
				if (content.data_day && this.config.wind_day) {
					await this.writeStates2(objectsStates.wind_day, content);
				}

				// wind80ensemble-1h
				if (content.data_1h && this.config.wind80ensemble_1h) {
					await this.writeStates3(objectsStates.wind80ensemble_1h, content);
				}

				// sea_1h
				if (content.data_1h && this.config.sea_1h) {
					await this.writeStates3(objectsStates.sea_1h, content);
				}
				// sea_3h
				if (content.data_3h && this.config.sea_3h) {
					await this.writeStates3(objectsStates.sea_3h, content);
				}
				// sea_day
				if (content.data_day && this.config.sea_day) {
					await this.writeStates2(objectsStates.sea_day, content);
				}
				// air_1h
				if (content.data_1h && this.config.air_1h) {
					await this.writeStates3(objectsStates.air_1h, content);
				}
				// air_3h
				if (content.data_3h && this.config.air_3h) {
					await this.writeStates3(objectsStates.air_3h, content);
				}
				// air_day
				if (content.data_day && this.config.air_day) {
					await this.writeStates2(objectsStates.air_day, content);
				}
				// airquality_1h
				if (content.data_1h && this.config.airquality_1h) {
					await this.writeStates3(objectsStates.airquality_1h, content);
				}
				// airquality_3h
				if (content.data_3h && this.config.airquality_3h) {
					await this.writeStates3(objectsStates.airquality_3h, content);
				}
				// airquality_day
				if (content.data_day && this.config.airquality_day) {
					await this.writeStates2(objectsStates.airquality_day, content);
				}
				// trend_1h
				if (content.trend_1h && this.config.trend_1h) {
					await this.writeStates3(objectsStates.trend_1h, content);
				}
				// trend_day
				if (content.trend_day && this.config.trend_day) {
					await this.writeStates2(objectsStates.trend_day, content);
				}

				// ensemble_1h
				if (content.gfsensemble_1h && this.config.ensemble_1h) {
					await this.writeStates3(objectsStates.ensemble_1h, content);
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

				if (ids[i].id === 'winddirectionChar2' || ids[i].id === 'winddirection_80mChar2') {
					this.setState(`${ids[0].id}.${ids[1].id[k]}.${ids[i].id}`, {val: this.calculateWinddirectionChar(content[ids[0].id]['winddirection'][k])[0], ack: true});
				} else if (ids[i].id === 'winddirectionChar3' || ids[i].id === 'winddirection_80mChar3') {
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

					if (ids[i].id === 'winddirectionChar2' || ids[i].id === 'winddirection_80mChar2') {
						this.setState(`${ids[0].id}.${k}d_${ids[1].id[j]}.${ids[i].id}`, {val: this.calculateWinddirectionChar(content[ids[0].id]['winddirection'][iteration])[0], ack: true});
					} else if (ids[i].id === 'winddirectionChar3' || ids[i].id === 'winddirection_80mChar3') {
						this.setState(`${ids[0].id}.${k}d_${ids[1].id[j]}.${ids[i].id}`, {val: this.calculateWinddirectionChar(content[ids[0].id]['winddirection'][iteration])[1], ack: true});
					} else if (ids[i].id === 'rainspot_vis') {
						this.setState(`${ids[0].id}.${k}d_${ids[1].id[j]}.${ids[i].id}`, {val: this.createVisHTMLBindingRainspot(content[ids[0].id]['rainspot'][iteration]), ack: true});
					} else if (ids[0].id === 'gfsensemble_1h') {
						const testy1 = JSON.stringify(content[ids[0].id][ids[i].id][iteration]);
						this.setState(`${ids[0].id}.${k}d_${ids[1].id[j]}.${ids[i].id}`, {val: testy1, ack: true});
					} else {
						const testy1 = content[ids[0].id][ids[i].id][iteration];
						this.setState(`${ids[0].id}.${k}d_${ids[1].id[j]}.${ids[i].id}`, {val: testy1, ack: true});
						//this.log.debug(`Path: ${ids[0].id}.+${k}d_${ids[1].id[j]}.${ids[i].id}`);
						//this.log.debug(`Value: ${content[ids[0].id][ids[i].id][iteration]}`);
						//this.log.debug(`iteration: ${iteration}`);
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
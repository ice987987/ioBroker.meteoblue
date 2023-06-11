'use strict';

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');
const objectsStates = require('./lib/objectsStates.js');

// Load your modules:
const axios = require('axios').default;
const crypto = require('crypto');

// variables
const isValidApplicationKey = /[a-zA-Z0-9]{12,}/;
let systemConfig;

const metadata_active = ['metadata'];
const units_active = ['units'];
const valuesForFolderData_xmin = ['data_xmin', 'forecast'];
const valuesForFolderData_1h = ['data_1h', 'forecast'];
const valuesForFolderData_3h = ['data_3h', 'forecast'];
const valuesForFolderData_day = ['data_day', 'forecast'];
const valuesForFolderData_current = ['data_current'];
const valuesForFolderGfsensemble_1h = ['gfsensemble_1h', 'forecast'];
const valuesForFolderSoiltrafficability_1h = ['soiltrafficability_1h', 'forecast'];
const valuesForFolderTrend_1h = ['trend_1h', 'forecast'];
const valuesForFolderTrend_day = ['trend_day', 'forecast'];

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
		this.log.debug(`config.applicationKey: ${this.config.applicationKey}`);
		this.log.debug(`config.latlongFromSystem: ${this.config.latlongFromSystem}`);
		this.log.debug(`config.latitude: ${this.config.latitude}`);
		this.log.debug(`config.longitude: ${this.config.longitude}`);
		this.log.debug(`config.cityFromSystem: ${this.config.cityFromSystem}`);
		this.log.debug(`config.city: ${this.config.city}`);
		this.log.debug(`config.elevation: ${this.config.elevation}`);
		this.log.debug(`config.timezone: ${this.config.timezone}`);
		this.log.debug(`config.tempunitFromSystem: ${this.config.tempunitFromSystem}`);
		this.log.debug(`config.tempunit: ${this.config.tempunit}`);
		this.log.debug(`config.windspeed: ${this.config.windspeed}`);
		this.log.debug(`config.precipitationamount: ${this.config.precipitationamount}`);
		this.log.debug(`config.intervall: ${this.config.intervall}`);
		this.log.debug(`config.basic_15min: ${this.config.basic_15min}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'basic_15min')].active = this.config.basic_15min;
		this.log.debug(`config.basic_1h: ${this.config.basic_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'basic_1h')].active = this.config.basic_1h;
		this.log.debug(`config.basic_3h: ${this.config.basic_3h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'basic_3h')].active = this.config.basic_3h;
		this.log.debug(`config.basic_day: ${this.config.basic_day}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'basic_day')].active = this.config.basic_day;
		this.log.debug(`config.current: ${this.config.current}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'current')].active = this.config.current;
		this.log.debug(`config.clouds_1h: ${this.config.clouds_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'clouds_1h')].active = this.config.clouds_1h;
		this.log.debug(`config.clouds_3h: ${this.config.clouds_3h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'clouds_3h')].active = this.config.clouds_3h;
		this.log.debug(`config.clouds_day: ${this.config.clouds_day}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'clouds_day')].active = this.config.clouds_day;
		this.log.debug(`config.sunmoon: ${this.config.sunmoon}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'sunmoon')].active = this.config.sunmoon;
		this.log.debug(`config.basic_day_webcolors: ${this.config.basic_day_webcolors}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'basic_day_webcolors')].active = this.config.basic_day_webcolors;
		this.log.debug(`config.agro_1h: ${this.config.agro_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'agro_1h')].active = this.config.agro_1h;
		this.log.debug(`config.agro_3h: ${this.config.agro_3h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'agro_3h')].active = this.config.agro_3h;
		this.log.debug(`config.agro_day: ${this.config.agro_day}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'agro_day')].active = this.config.agro_day;
		this.log.debug(`config.agromodelleafwetness_1h: ${this.config.agromodelleafwetness_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'agromodelleafwetness_1h')].active = this.config.agromodelleafwetness_1h;
		this.log.debug(`config.agromodelsowing_1h: ${this.config.agromodelsowing_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'agromodelsowing_1h')].active = this.config.agromodelsowing_1h;
		this.log.debug(`config.agromodelspray_1h: ${this.config.agromodelspray_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'agromodelspray_1h')].active = this.config.agromodelspray_1h;
		this.log.debug(`config.soiltrafficability_1h: ${this.config.soiltrafficability_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'soiltrafficability_1h')].active = this.config.soiltrafficability_1h;
		this.log.debug(`config.solar_15min: ${this.config.solar_15min}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'solar_15min')].active = this.config.solar_15min;
		this.log.debug(`config.solar_1h: ${this.config.solar_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'solar_1h')].active = this.config.solar_1h;
		this.log.debug(`config.solar_3h: ${this.config.solar_3h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'solar_3h')].active = this.config.solar_3h;
		this.log.debug(`config.solar_day: ${this.config.solar_day}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'solar_day')].active = this.config.solar_day;
		this.log.debug(`config.solarensemble_1h: ${this.config.solarensemble_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'solarensemble_1h')].active = this.config.solarensemble_1h;
		this.log.debug(`config.pvpro_1h: ${this.config.pvpro_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'pvpro_1h')].active = this.config.pvpro_1h;
		this.log.debug(`config.pvpro_day: ${this.config.pvpro_day}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'pvpro_day')].active = this.config.pvpro_day;
		this.log.debug(`config.wind_15min: ${this.config.wind_15min}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'wind_15min')].active = this.config.wind_15min;
		this.log.debug(`config.wind_1h: ${this.config.wind_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'wind_1h')].active = this.config.wind_1h;
		this.log.debug(`config.wind_3h: ${this.config.wind_3h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'wind_3h')].active = this.config.wind_3h;
		this.log.debug(`config.wind_day: ${this.config.wind_day}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'wind_day')].active = this.config.wind_day;
		this.log.debug(`config.wind80ensemble_1h: ${this.config.wind80ensemble_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'wind80ensemble_1h')].active = this.config.wind80ensemble_1h;
		this.log.debug(`config.windpower_1h: ${this.config.windpower_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'windpower_1h')].active = this.config.windpower_1h;
		this.log.debug(`config.sea_1h: ${this.config.sea_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'sea_1h')].active = this.config.sea_1h;
		this.log.debug(`config.sea_3h: ${this.config.sea_3h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'sea_3h')].active = this.config.sea_3h;
		this.log.debug(`config.sea_day: ${this.config.sea_day}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'sea_day')].active = this.config.sea_day;
		this.log.debug(`config.air_1h: ${this.config.air_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'air_1h')].active = this.config.air_1h;
		this.log.debug(`config.air_3h: ${this.config.air_3h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'air_3h')].active = this.config.air_3h;
		this.log.debug(`config.air_day: ${this.config.air_day}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'air_day')].active = this.config.air_day;
		this.log.debug(`config.airquality_1h: ${this.config.airquality_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'airquality_1h')].active = this.config.airquality_1h;
		this.log.debug(`config.airquality_3h: ${this.config.airquality_3h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'airquality_3h')].active = this.config.airquality_3h;
		this.log.debug(`config.airquality_day: ${this.config.airquality_day}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'airquality_day')].active = this.config.airquality_day;
		this.log.debug(`config.sigmalevel_1h: ${this.config.sigmalevel_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'sigmalevel_1h')].active = this.config.sigmalevel_1h;
		this.log.debug(`config.sigmalevel_day: ${this.config.sigmalevel_day}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'sigmalevel_day')].active = this.config.sigmalevel_day;
		this.log.debug(`config.profiletemp_1h: ${this.config.profiletemp_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'profiletemp_1h')].active = this.config.profiletemp_1h;
		this.log.debug(`config.profileheight_1h: ${this.config.profileheight_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'profileheight_1h')].active = this.config.profileheight_1h;
		this.log.debug(`config.profilewind_1h: ${this.config.profilewind_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'profilewind_1h')].active = this.config.profilewind_1h;
		this.log.debug(`config.profileclouds_1h: ${this.config.profileclouds_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'profileclouds_1h')].active = this.config.profileclouds_1h;
		this.log.debug(`config.profilerh_1h: ${this.config.profilerh_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'profilerh_1h')].active = this.config.profilerh_1h;
		this.log.debug(`config.ensemble_1h: ${this.config.ensemble_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'ensemble_1h')].active = this.config.ensemble_1h;
		this.log.debug(`config.trend_1h: ${this.config.trend_1h}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'trend_1h')].active = this.config.trend_1h;
		this.log.debug(`config.trend_day: ${this.config.trend_day}`);
		objectsStates.packages_master[objectsStates.packages_master.findIndex((obj) => obj.id === 'trend_day')].active = this.config.trend_day;

		this.log.debug(`packages_master: ${JSON.stringify(objectsStates.packages_master)}`);

		// load system.config
		try {
			systemConfig = await this.getForeignObjectAsync('system.config', 'state');
			// this.log.debug(`systemConfig: ${JSON.stringify(systemConfig)}`);
		} catch (error) {
			this.log.debug(`error systemConfig: ${error}`);
		}

		// https://docs.meteoblue.com/en/weather-apis/packages-api/introduction#url-parameter
		this.meteoblueApiUrl = 'http://my.meteoblue.com/packages/';

		/**
		 * CHECK ENTRIES OF GUI
		 */
		// https://docs.meteoblue.com/en/weather-apis/packages-api/introduction#url-parameter
		this.meteoblueApiUrl = 'http://my.meteoblue.com/packages/';

		// check forecast packages
		if (
			!this.config.basic_15min &&
			!this.config.basic_1h &&
			!this.config.basic_3h &&
			!this.config.basic_day &&
			!this.config.current &&
			!this.config.clouds_1h &&
			!this.config.clouds_3h &&
			!this.config.clouds_day &&
			!this.config.sunmoon &&
			!this.config.basic_day_webcolors &&
			!this.config.agro_1h &&
			!this.config.agro_3h &&
			!this.config.agro_day &&
			!this.config.agromodelleafwetness_1h &&
			!this.config.agromodelsowing_1h &&
			!this.config.agromodelspray_1h &&
			!this.config.soiltrafficability_1h &&
			!this.config.solar_15min &&
			!this.config.solar_1h &&
			!this.config.solar_3h &&
			!this.config.solar_day &&
			!this.config.solarensemble_1h &&
			!this.config.pvpro_1h &&
			!this.config.pvpro_day &&
			!this.config.wind_15min &&
			!this.config.wind_1h &&
			!this.config.wind_3h &&
			!this.config.wind_day &&
			!this.config.wind80ensemble_1h &&
			!this.config.windpower_1h &&
			!this.config.sea_1h &&
			!this.config.sea_3h &&
			!this.config.sea_day &&
			!this.config.air_1h &&
			!this.config.air_3h &&
			!this.config.air_day &&
			!this.config.airquality_1h &&
			!this.config.airquality_3h &&
			!this.config.airquality_day &&
			!this.config.sigmalevel_1h &&
			!this.config.sigmalevel_day &&
			!this.config.profiletemp_1h &&
			!this.config.profileheight_1h &&
			!this.config.profilewind_1h &&
			!this.config.profileclouds_1h &&
			!this.config.profilerh_1h &&
			!this.config.trend_1h &&
			!this.config.trend_day &&
			!this.config.ensemble_1h
		) {
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
			if (this.config.basic_day_webcolors) {
				this.meteoblueApiUrl += 'basic-day_webcolors_';
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
			if (this.config.soiltrafficability_1h) {
				this.meteoblueApiUrl += 'soiltrafficability-1h_';
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
			if (this.config.pvpro_1h) {
				this.meteoblueApiUrl += 'pvpro-1h_';
			}
			if (this.config.pvpro_day) {
				this.meteoblueApiUrl += 'pvpro-day_';
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
			if (this.config.windpower_1h) {
				this.meteoblueApiUrl += 'windpower-1h_';
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
			if (this.config.sigmalevel_1h) {
				this.meteoblueApiUrl += 'sigmalevel-1h_';
			}
			if (this.config.airquality_day) {
				this.meteoblueApiUrl += 'sigmalevel-day_';
			}
			if (this.config.profiletemp_1h) {
				this.meteoblueApiUrl += 'profiletemp-1h_';
			}
			if (this.config.profileheight_1h) {
				this.meteoblueApiUrl += 'profileheight-1h_';
			}
			if (this.config.profilewind_1h) {
				this.meteoblueApiUrl += 'profilewind-1h_';
			}
			if (this.config.profileclouds_1h) {
				this.meteoblueApiUrl += 'profileclouds-1h_';
			}
			if (this.config.profilerh_1h) {
				this.meteoblueApiUrl += 'profilerh-1h_';
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
				if ((isNaN(Number(systemConfig.common.latitude)) === true || Number(systemConfig.common.latitude) !== 0) && (isNaN(Number(systemConfig.common.longitude)) === true || Number(systemConfig.common.longitude) !== 0)) {
					this.config.latitude = systemConfig.common.latitude;
					this.config.longitude = systemConfig.common.longitude;
				} else {
					this.log.error('"Latitude" and/or "Longitude" from system settings is/are not valid. Please check configuration! (ERR_#003)');
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
					this.config.tempunit = systemConfig.common.tempUnit.substr(1, 1);
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
			await this.createObject(objectsStates.channel_0_master[objectsStates.channel_0_master.findIndex((obj) => obj.id === 'ACTION')], null, objectsStates.manual_mode[objectsStates.manual_mode.findIndex((obj) => obj.id === 'REQUEST_DATA')]);
			// subscribeState
			await this.subscribeStatesAsync('ACTION.REQUEST_DATA');
		} else if (Number(this.config.intervall) >= 1 || Number(this.config.intervall <= 1440)) {
			this.log.debug(`[deleteObjects]: start deleting existing folder with ID "ACTION". Please be patient...`);
			await this.delObjectAsync('ACTION', { recursive: true });
			this.log.debug('[deleteObjects]: deleting existing folder with ID "ACTION" finished.');
		} else {
			this.log.error('"Polling intervall" not valid. Please check configuration! (ERR_#016)');
			return;
		}

		this.log.debug(`this.meteoblueApiUrl: ${this.meteoblueApiUrl}`);

		// create array of active packages
		const packages_active = [];
		for (const key of objectsStates.packages_master.filter((x) => x.active === true)) {
			packages_active.push(key);
		}
		this.log.debug(`[packages_active]: ${JSON.stringify(packages_active)}`);

		/**
		 * METADATA / UNITS
		 */
		// create array of active metadata/units
		for (let i = 0; i < Object.keys(packages_active).length; i++) {
			for (let j = 0; j < packages_active[i].metadata.length; j++) {
				// push only if not exists
				if (!metadata_active.includes(packages_active[i].metadata[j])) {
					metadata_active.push(packages_active[i].metadata[j]);
				}
			}
			for (let j = 0; j < packages_active[i].units.length; j++) {
				// push only if not exists
				if (!units_active.includes(packages_active[i].units[j])) {
					units_active.push(packages_active[i].units[j]);
				}
			}
		}
		this.log.debug(`[metadata_active]: ${JSON.stringify(metadata_active)}`);
		this.log.debug(`[units_active]: ${JSON.stringify(units_active)}`);

		this.log.debug(`[delete metadata/units]: start deleting channel "metadata" and "units". Please be patient...`);
		await this.delObjectAsync('metadata', { recursive: true });
		await this.delObjectAsync('units', { recursive: true });
		this.log.debug(`[delete metadata/units]: states deletion for channel "metadata" and "units" finished.`);

		// create channel metadata
		this.log.debug(`[create metadata]: start creation channel "metadata". Please be patient...`);
		for (let i = 0; i < metadata_active.length; i++) {
			// this.log.debug(`value1: ${JSON.stringify(objectsStates.channel_0_master[objectsStates.channel_0_master.findIndex(obj => obj.id === metadata_active[0])])}`);
			// this.log.debug(`value3: ${JSON.stringify(objectsStates.metadata_master[objectsStates.metadata_master.findIndex(obj => obj.id === metadata_active[i])])}`);
			await this.createObject(objectsStates.channel_0_master[objectsStates.channel_0_master.findIndex((obj) => obj.id === metadata_active[0])], null, objectsStates.metadata_master[objectsStates.metadata_master.findIndex((obj) => obj.id === metadata_active[i])] || `channel_${i}`);
		}
		this.log.debug(`[create metadata]: states creation for channel "metadata" finished.`);

		// create channel units
		this.log.debug(`[create units]: start creation channel "units". Please be patient...`);
		for (let i = 0; i < units_active.length; i++) {
			await this.createObject(objectsStates.channel_0_master[objectsStates.channel_0_master.findIndex((obj) => obj.id === units_active[0])], null, objectsStates.units_master[objectsStates.units_master.findIndex((obj) => obj.id === units_active[i])] || `channel_${i}`);
		}
		this.log.debug(`[create units]: states creation for channel "units" finished.`);

		/**
		 * VALUES
		 */
		// create array per folder
		for (let i = 0; i < Object.keys(packages_active).length; i++) {
			for (let j = 0; j < packages_active[i].values.length; j++) {
				if (packages_active[i].folder === 'data_xmin' && !valuesForFolderData_xmin.includes(packages_active[i].values[j])) {
					valuesForFolderData_xmin.push(packages_active[i].values[j]);
				}
				if (packages_active[i].folder === 'data_1h' && !valuesForFolderData_1h.includes(packages_active[i].values[j])) {
					valuesForFolderData_1h.push(packages_active[i].values[j]);
				}
				if (packages_active[i].folder === 'data_3h' && !valuesForFolderData_3h.includes(packages_active[i].values[j])) {
					valuesForFolderData_3h.push(packages_active[i].values[j]);
				}
				if (packages_active[i].folder === 'data_day' && !valuesForFolderData_day.includes(packages_active[i].values[j])) {
					valuesForFolderData_day.push(packages_active[i].values[j]);
				}
				if (packages_active[i].folder === 'data_current' && !valuesForFolderData_day.includes(packages_active[i].values[j])) {
					valuesForFolderData_current.push(packages_active[i].values[j]);
				}
				if (packages_active[i].folder === 'gfsensemble_1h' && !valuesForFolderGfsensemble_1h.includes(packages_active[i].values[j])) {
					valuesForFolderGfsensemble_1h.push(packages_active[i].values[j]);
				}
				if (packages_active[i].folder === 'soiltrafficability_1h' && !valuesForFolderSoiltrafficability_1h.includes(packages_active[i].values[j])) {
					valuesForFolderSoiltrafficability_1h.push(packages_active[i].values[j]);
				}
				if (packages_active[i].folder === 'trend_1h' && !valuesForFolderTrend_1h.includes(packages_active[i].values[j])) {
					valuesForFolderTrend_1h.push(packages_active[i].values[j]);
				}
				if (packages_active[i].folder === 'trend_day' && !valuesForFolderTrend_day.includes(packages_active[i].values[j])) {
					valuesForFolderTrend_day.push(packages_active[i].values[j]);
				}
			}
		}
		this.log.debug(`[valuesForFolderData_xmin]: ${JSON.stringify(valuesForFolderData_xmin)}`);
		this.log.debug(`[valuesForFolderData_1h]: ${JSON.stringify(valuesForFolderData_1h)}`);
		this.log.debug(`[valuesForFolderData_3h]: ${JSON.stringify(valuesForFolderData_3h)}`);
		this.log.debug(`[valuesForFolderData_day]: ${JSON.stringify(valuesForFolderData_day)}`);
		this.log.debug(`[valuesForFolderData_current]: ${JSON.stringify(valuesForFolderData_current)}`);
		this.log.debug(`[valuesForFolderGfsensemble_1h]: ${JSON.stringify(valuesForFolderGfsensemble_1h)}`);
		this.log.debug(`[valuesForFolderSoiltrafficability_1h]: ${JSON.stringify(valuesForFolderSoiltrafficability_1h)}`);
		this.log.debug(`[valuesForFolderTrend_1h]: ${JSON.stringify(valuesForFolderTrend_1h)}`);
		this.log.debug(`[valuesForFolderTrend_day]: ${JSON.stringify(valuesForFolderTrend_day)}`);

		const crc = crypto.createHash('sha256').update(this.meteoblueApiUrl).digest('hex');
		this.log.debug(`current crc: ${crc}`);

		// get oldCRC
		const object = await this.getStateAsync('checksumUserData');
		if (typeof (object) !== 'undefined' && object !== null) {
			this.oldCrc = object.val;
		}
		// compare to previous config
		if (!this.oldCrc || this.oldCrc != crc) {
			this.log.debug(`[checkUserData] has changed or is new; oldCrc: ${this.oldCrc}; current crc: ${crc}`);
			// write datapoint
			await this.setObjectNotExistsAsync('checksumUserData', {
				type: 'state',
				common: {
					name: {
						'en': 'Checksum user data',
						'de': 'Checksumme Benutzerdaten',
						'ru': 'Проверьте данные пользователя Checksum',
						'pt': 'Dados do usuário do checksum',
						'nl': 'Vertaling:',
						'fr': 'Vérifier les données utilisateur',
						'it': 'Dati utente di checksum',
						'es': 'Datos de usuario de checksum',
						'pl': 'Checksum data',
						'uk': 'Перевірити дані користувачів',
						'zh-cn': '用户数据'
					},
					type: 'string',
					role: 'state',
					read: true,
					write: false,
				},
				native: {},
			});
			await this.setStateAsync('checksumUserData', { val: crc, ack: true });

			/**
			 * DELETE EVERYTHING
			 */
			this.log.debug(`[delete]: start deleting all channels. Please be patient...`);
			await this.delObjectAsync('data_xmin', { recursive: true });
			await this.delObjectAsync('data_1h', { recursive: true });
			await this.delObjectAsync('data_3h', { recursive: true });
			await this.delObjectAsync('data_day', { recursive: true });
			await this.delObjectAsync('data_current', { recursive: true });
			await this.delObjectAsync('gfsensemble_1h', { recursive: true });
			await this.delObjectAsync('soiltrafficability_1h', { recursive: true });
			await this.delObjectAsync('trend_1h', { recursive: true });
			await this.delObjectAsync('trend_day', { recursive: true });
			this.log.debug(`[delete]: deletion for all channels finished.`);
		}

		/**
		 * CREATE REQUIRED CHANNELS AND OBJECTS
		 */
		// channel data_xmin
		if (valuesForFolderData_xmin.length > 2) {
			this.log.debug(`[createObject]: start objects creation for channel "data_xmin". Please be patient...`);
			for (let k = 0; k < objectsStates.channel_1_master[3].timeresolution.length; k++) {
				for (let j = 0; j < objectsStates.channel_1_master[0].timeresolution.length; j++) {
					for (let i = 0; i < valuesForFolderData_xmin.length; i++) {
						await this.createObject(objectsStates.channel_0_master[objectsStates.channel_0_master.findIndex((obj) => obj.id === valuesForFolderData_xmin[0])], `${objectsStates.channel_1_master[3].timeresolution[k]}_${objectsStates.channel_1_master[0].timeresolution[j]}`, objectsStates.values_master[objectsStates.values_master.findIndex((obj) => obj.id === valuesForFolderData_xmin[i])] || `channel_${i}`);
					}
				}
			}
			this.log.debug(`[createObject]: objects creation for channel "data_xmin" finished.`);
		}
		// channel data_1h
		if (valuesForFolderData_1h.length > 2) {
			this.log.debug(`[createObject]: start objects creation for channel "data_1h". Please be patient...`);
			for (let k = 0; k < objectsStates.channel_1_master[3].timeresolution.length; k++) {
				for (let j = 0; j < objectsStates.channel_1_master[1].timeresolution.length; j++) {
					for (let i = 0; i < valuesForFolderData_1h.length; i++) {
						await this.createObject(objectsStates.channel_0_master[objectsStates.channel_0_master.findIndex((obj) => obj.id === valuesForFolderData_1h[0])], `${objectsStates.channel_1_master[3].timeresolution[k]}_${objectsStates.channel_1_master[1].timeresolution[j]}`, objectsStates.values_master[objectsStates.values_master.findIndex((obj) => obj.id === valuesForFolderData_1h[i])] || `channel_${i}`);
					}
				}
			}
			this.log.debug(`[createObject]: objects creation for channel "data_1h" finished.`);
		}
		// channel data_3h
		if (valuesForFolderData_3h.length > 2) {
			this.log.debug(`[createObject]: start objects creation for channel "data_3h". Please be patient...`);
			for (let k = 0; k < objectsStates.channel_1_master[3].timeresolution.length; k++) {
				for (let j = 0; j < objectsStates.channel_1_master[2].timeresolution.length; j++) {
					for (let i = 0; i < valuesForFolderData_3h.length; i++) {
						// this.log.debug(`value1: ${JSON.stringify(objectsStates.channel_0_master[objectsStates.channel_0_master.findIndex(obj => obj.id === valuesForFolderData_3h[0])])}`);
						// this.log.debug(`value2: ${objectsStates.channel_1_master[3].timeresolution[k]}_${objectsStates.channel_1_master[2].timeresolution[j]}`);
						// this.log.debug(`value3: ${JSON.stringify(objectsStates.values_master[objectsStates.values_master.findIndex(obj => obj.id === valuesForFolderData_3h[i])])}`);
						await this.createObject(objectsStates.channel_0_master[objectsStates.channel_0_master.findIndex((obj) => obj.id === valuesForFolderData_3h[0])], `${objectsStates.channel_1_master[3].timeresolution[k]}_${objectsStates.channel_1_master[2].timeresolution[j]}`, objectsStates.values_master[objectsStates.values_master.findIndex((obj) => obj.id === valuesForFolderData_3h[i])] || `channel_${i}`);
					}
				}
			}
			this.log.debug(`[createObject]: objects creation for channel "data_3h" finished.`);
		}
		// channel data_day
		if (valuesForFolderData_day.length > 2) {
			this.log.debug(`[createObject]: start objects creation for channel "data_day". Please be patient...`);
			for (let j = 0; j < objectsStates.channel_1_master[3].timeresolution.length; j++) {
				for (let i = 0; i < valuesForFolderData_day.length; i++) {
					// this.log.debug(`value1: ${JSON.stringify(objectsStates.channel_0_master[objectsStates.channel_0_master.findIndex(obj => obj.id === valuesForFolderData_day[0])])}`);
					// this.log.debug(`value2: ${objectsStates.channel_1_master[3].timeresolution[j]}`);
					// this.log.debug(`value3: ${JSON.stringify(objectsStates.values_master[objectsStates.values_master.findIndex(obj => obj.id === valuesForFolderData_day[i])])}`);
					await this.createObject(objectsStates.channel_0_master[objectsStates.channel_0_master.findIndex((obj) => obj.id === valuesForFolderData_day[0])], objectsStates.channel_1_master[3].timeresolution[j], objectsStates.values_master[objectsStates.values_master.findIndex((obj) => obj.id === valuesForFolderData_day[i])] || `channel_${i}`);
				}
			}
			this.log.debug(`[createObject]: objects creation for channel "data_day" finished.`);
		}
		// channel data_current
		if (valuesForFolderData_current.length > 1) {
			this.log.debug(`[createObject]: start objects creation for channel "current". Please be patient...`);
			for (let i = 0; i < valuesForFolderData_current.length; i++) {
				// this.log.debug(`value1: ${JSON.stringify(objectsStates.channel_0_master[objectsStates.channel_0_master.findIndex(obj => obj.id === valuesForFolderData_current[0])])}`);
				// this.log.debug(`value3: ${JSON.stringify(objectsStates.values_master[objectsStates.values_master.findIndex(obj => obj.id === valuesForFolderData_current[i])])}`);
				await this.createObject(objectsStates.channel_0_master[objectsStates.channel_0_master.findIndex((obj) => obj.id === valuesForFolderData_current[0])], null, objectsStates.values_master[objectsStates.values_master.findIndex((obj) => obj.id === valuesForFolderData_current[i])] || `channel_${i}`);
			}
			this.log.debug(`[createObject]: objects creation for channel "current" finished.`);
		}
		// channel gfsensemble_1h
		if (valuesForFolderGfsensemble_1h.length > 2) {
			this.log.debug(`[createObject]: start objects creation for channel "gfsensemble_1h". Please be patient...`);
			for (let k = 0; k < objectsStates.channel_1_master[3].timeresolution.length; k++) {
				for (let j = 0; j < objectsStates.channel_1_master[1].timeresolution.length; j++) {
					for (let i = 0; i < valuesForFolderGfsensemble_1h.length; i++) {
						await this.createObject(objectsStates.channel_0_master[objectsStates.channel_0_master.findIndex((obj) => obj.id === valuesForFolderGfsensemble_1h[0])], `${objectsStates.channel_1_master[3].timeresolution[k]}_${objectsStates.channel_1_master[1].timeresolution[j]}`, objectsStates.values_master[objectsStates.values_master.findIndex((obj) => obj.id === valuesForFolderGfsensemble_1h[i])] || `channel_${i}`);
					}
				}
			}
			this.log.debug(`[createObject]: objects creation for channel "gfsensemble_1h" finished.`);
		}
		// channel soiltrafficability_1h
		if (valuesForFolderSoiltrafficability_1h.length > 2) {
			this.log.debug(`[createObject]: start objects creation for channel "soiltrafficability_1h". Please be patient...`);
			for (let k = 0; k < objectsStates.channel_1_master[3].timeresolution.length; k++) {
				for (let j = 0; j < objectsStates.channel_1_master[1].timeresolution.length; j++) {
					for (let i = 0; i < valuesForFolderSoiltrafficability_1h.length; i++) {
						await this.createObject(objectsStates.channel_0_master[objectsStates.channel_0_master.findIndex((obj) => obj.id === valuesForFolderSoiltrafficability_1h[0])], `${objectsStates.channel_1_master[3].timeresolution[k]}_${objectsStates.channel_1_master[1].timeresolution[j]}`, objectsStates.values_master[objectsStates.values_master.findIndex((obj) => obj.id === valuesForFolderSoiltrafficability_1h[i])] || `channel_${i}`);
					}
				}
			}
			this.log.debug(`[createObject]: objects creation for channel "soiltrafficability_1h" finished.`);
		}
		// channel trend_1h
		if (valuesForFolderTrend_1h.length > 2) {
			this.log.debug(`[createObject]: start objects creation for channel "trend_1h". Please be patient...`);
			for (let k = 0; k < objectsStates.channel_1_master[3].timeresolution.length; k++) {
				for (let j = 0; j < objectsStates.channel_1_master[1].timeresolution.length; j++) {
					for (let i = 0; i < valuesForFolderTrend_1h.length; i++) {
						await this.createObject(objectsStates.channel_0_master[objectsStates.channel_0_master.findIndex((obj) => obj.id === valuesForFolderTrend_1h[0])], `${objectsStates.channel_1_master[3].timeresolution[k]}_${objectsStates.channel_1_master[1].timeresolution[j]}`, objectsStates.values_master[objectsStates.values_master.findIndex((obj) => obj.id === valuesForFolderTrend_1h[i])] || `channel_${i}`);
					}
				}
			}
			this.log.debug(`[createObject]: objects creation for channel "trend_1h" finished.`);
		}
		// channel trend_day
		if (valuesForFolderTrend_day.length > 2) {
			this.log.debug(`[createObject]: start objects creation for channel "trend_day". Please be patient...`);
			for (let j = 0; j < objectsStates.channel_1_master[3].timeresolution.length; j++) {
				for (let i = 0; i < valuesForFolderTrend_day.length; i++) {
					await this.createObject(objectsStates.channel_0_master[objectsStates.channel_0_master.findIndex((obj) => obj.id === valuesForFolderTrend_day[0])], objectsStates.channel_1_master[3].timeresolution[j], objectsStates.values_master[objectsStates.values_master.findIndex((obj) => obj.id === valuesForFolderTrend_day[i])] || `channel_${i}`);
				}
			}
			this.log.debug(`[createObject]: objects creation for channel "trend_day" finished.`);
		}

		await this.getMeteoblueData();

		if (Number(this.config.intervall) !== 0) {
			this.log.info(`[getMeteoblueDataByIntervall]: Starting polltimer with a ${this.config.intervall} minutes interval.`);
			try {
				this.intervall = setInterval(async () => {
					await this.getMeteoblueData();
				}, this.config.intervall * 60000);
			} catch (error) {
				this.log.error(`${error}: (ERR_#019)`);
			}
		}
	}

	/**
	 * Create Objects
	 */
	async createObject(channel_0, channel_1, stateInfo) {
		// this.log.debug(`channel_0: ${JSON.stringify(channel_0)}`);
		// this.log.debug(`channel_1: ${JSON.stringify(channel_1)}`);
		// this.log.debug(`stateInfo: ${JSON.stringify(stateInfo)}`);
		const common = {};
		if (stateInfo === 'channel_0') {
			await this.setObjectNotExistsAsync(channel_0.id, {
				type: 'channel',
				common: {
					name: channel_0.cname,
					desc: channel_0.cname,
				},
				native: {},
			});
		}
		if (stateInfo === 'channel_1') {
			if (channel_0.id !== 'data_day') {
				common.name = `forecast +${channel_1.substring(0, 2)} ${channel_1.substring(3, 5)}:${channel_1.substring(channel_1.length - 2, channel_1.length)}h`;
				common.desc = `forecast +${channel_1.substring(0, 2)} ${channel_1.substring(3, 5)}:${channel_1.substring(channel_1.length - 2, channel_1.length)}h`;
			} else {
				common.name = `forecast +${channel_1}`;
				common.desc = `forecast +${channel_1}`;
			}

			await this.setObjectNotExistsAsync(`${channel_0.id}.${channel_1}`, {
				type: 'channel',
				common: common,
				native: {},
			});
		}
		if (stateInfo.type === 'state') {
			let id = '';

			if (channel_1) {
				id = `${channel_0.id}.${channel_1}.${stateInfo.id}`;
			} else {
				id = `${channel_0.id}.${stateInfo.id}`;
			}

			common.name = stateInfo.cname || '';
			common.desc = stateInfo.cname || '';
			common.type = stateInfo.ctype || '';
			common.role = stateInfo.crole || '';
			if (stateInfo.cunit === 'tempunit') {
				common.unit = `°${this.config.tempunit}`;
			} else if (stateInfo.cunit === 'windspeed') {
				this.config.windspeed === 'kmh' ? (common.unit = 'km/h') : (common.unit = this.config.windspeed);
			} else if (stateInfo.cunit === 'precipitationamount') {
				common.unit = this.config.precipitationamount;
			} else if (stateInfo.cunit) {
				common.unit = stateInfo.cunit;
			}
			stateInfo.cstates ? (common.states = stateInfo.cstates) : null;
			common.read = true;
			stateInfo.cwrite ? (common.write = true) : (common.write = false);

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
		let html = `<div style="position:relative; width:100%; height:100%; border:none;">
					<div style="display:inline-block; position:absolute; top:0px; left: 0px; width: calc(100% - 2px); height: calc(100% - 2px); border: 1px solid rgba(109, 109, 114, 1); border-radius: 50%"></div>
					<div style="display:inline-block; position:absolute; top:calc(((100% - 2px) / 7) * 1); left:calc(((100% - 2px) / 7) * 1); width:calc(((100% - 2px) / 7) * 5); height:calc(((100% - 2px) / 7) * 5); border:1px solid rgba(109, 109, 114, 1); border-radius:50%"></div>
					<div style="display:inline-block; position:absolute; top:calc(((100% - 2px) / 7) * 2); left:calc(((100% - 2px) / 7) * 2); width:calc(((100% - 2px) / 7) * 3); height:calc(((100% - 2px) / 7) * 3); border:1px solid rgba(109, 109, 114, 1); border-radius:50%"></div>
					<div style="display:inline-block; position:absolute; top:calc(((100% - 2px) / 7) * 3); left:calc(((100% - 2px) / 7) * 3); width:calc(((100% - 2px) / 7) * 1); height:calc(((100% - 2px) / 7) * 1); border:1px solid rgba(109, 109, 114, 1); border-radius:50%"></div>
					<div style="display:inline-block; position:absolute; top:calc((100% - 2px) / 2); left:0px; border:0.5px solid rgba(109, 109, 114, 0.5); width:calc(100% / 14); height:0px"></div>
					<div style="display:inline-block; position:absolute; top:calc((100% - 2px) / 2); right:0px; border:0.5px solid rgba(109, 109, 114, 0.5); width:calc(100% / 14)"></div>
					<div style="display:inline-block; position:absolute; top:0px; left: calc((100% - 2px) / 2); border:0.5px solid rgba(109, 109, 114, 0.5); width:0px; height:calc(100% / 14)"></div>
					<div style="display:inline-block; position:absolute; top:calc((100% - 2px) - ((100% - 2px) / 14)); left:calc((100% - 2px) / 2); border:0.5px solid rgba(109, 109, 114, 0.5); width:0px; height:calc(100% / 14)"></div>
					<table style="width:100%; height:100%; border:none; border-collapse:collapse; empty-cells:show"> `;
		for (let i = 7; i > 0; i--) {
			html += '<tr style="height:calc(100% / 7); border:none"> ';
			// display correct order of values
			for (let j = 7; j > 0; j--) {
				switch (day.substr(7 * i - j, 1)) {
					case '0':
						html += `<td style="width:calc(100% / 7); border:none; background-color:rgba(0, 0, 0, 0)"></td> `;
						break;
					case '1':
						html += `<td style="width:calc(100% / 7); border:none; background-color:rgba(19, 238, 252, 1)"></td> `;
						break;
					case '2':
						html += `<td style="width:calc(100% / 7); border:none; background-color:rgba(58, 170, 220, 1)"></td> `;
						break;
					case '3':
						html += `<td style="width:calc(100% / 7); border:none; background-color:rgba(23, 116, 196, 1)"></td> `;
						break;
					case '9':
						html += `<td style="width:calc(100% / 7); border:none; background-color:rgba(38, 215, 146, 1)"></td> `;
						break;
				}
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

	/**
	 * fill Objects
	 */
	async writeStates1(channel, valuesForFolder, content) {
		this.log.debug(`[writeStates1]: start writing states for channel "${channel}". Please be patient...`);
		for (let i = 0; i < valuesForFolder.length; i++) {
			this.setState(`${channel}.${valuesForFolder[i]}`, { val: content[channel][valuesForFolder[i]], ack: true });
		}
		this.log.debug(`[writeStates1]: writing states for channel "${channel}" finished.`);
	}

	async writeStates2(channel, valuesForFolder, content) {
		this.log.debug(`[writeStates2]: start writing states for channel "${channel}". Please be patient...`);
		for (let j = 0; j < objectsStates.channel_1_master[3].timeresolution.length; j++) {
			for (let i = 0; i < valuesForFolder.length; i++) {
				if (valuesForFolder[i] === 'winddirectionChar2' || valuesForFolder[i] === 'winddirection_80mChar2') {
					this.setState(`${channel}.${objectsStates.channel_1_master[3].timeresolution[j]}.${valuesForFolder[i]}`, { val: this.calculateWinddirectionChar(content[channel]['winddirection'][j])[0], ack: true });
				} else if (valuesForFolder[i] === 'winddirectionChar3' || valuesForFolder[i] === 'winddirection_80mChar3') {
					this.setState(`${channel}.${objectsStates.channel_1_master[3].timeresolution[j]}.${valuesForFolder[i]}`, { val: this.calculateWinddirectionChar(content[channel]['winddirection'][j])[1], ack: true });
				} else if (valuesForFolder[i] === 'rainspot_vis') {
					this.setState(`${channel}.${objectsStates.channel_1_master[3].timeresolution[j]}.${valuesForFolder[i]}`, { val: this.createVisHTMLBindingRainspot(content[channel]['rainspot'][j]), ack: true });
				} else {
					this.setState(`${channel}.${objectsStates.channel_1_master[3].timeresolution[j]}.${valuesForFolder[i]}`, { val: content[channel][valuesForFolder[i]][j], ack: true });
				}
			}
		}
		this.log.debug(`[writeStates2]: writing states for channel "${channel}" finished.`);
	}

	async writeStates3(channel, valuesForFolder, content) {
		// xmin = 0
		let timerresolution = 0;
		if (channel.split('_')[1] === '1h') {
			timerresolution = 1;
		} else if (channel.split('_')[1] === '3h') {
			timerresolution = 2;
		}

		this.log.debug(`[writeStates3]: start writing states for channel "${channel}". Please be patient...`);
		let iteration = 0;
		for (let k = 0; k < objectsStates.channel_1_master[3].timeresolution.length; k++) {
			for (let j = 0; j < objectsStates.channel_1_master[timerresolution].timeresolution.length; j++) {
				for (let i = 0; i < valuesForFolder.length; i++) {
					if (valuesForFolder[i] === 'winddirectionChar2' || valuesForFolder[i] === 'winddirection_80mChar2') {
						this.setState(`${channel}.${objectsStates.channel_1_master[3].timeresolution[k]}_${objectsStates.channel_1_master[timerresolution].timeresolution[j]}.${valuesForFolder[i]}`, { val: this.calculateWinddirectionChar(content[channel]['winddirection'][iteration])[0], ack: true });
					} else if (valuesForFolder[i] === 'winddirectionChar3' || valuesForFolder[i] === 'winddirection_80mChar3') {
						this.setState(`${channel}.${objectsStates.channel_1_master[3].timeresolution[k]}_${objectsStates.channel_1_master[timerresolution].timeresolution[j]}.${valuesForFolder[i]}`, { val: this.calculateWinddirectionChar(content[channel]['winddirection'][iteration])[1], ack: true });
					} else if (valuesForFolder[i] === 'rainspot_vis') {
						this.setState(`${channel}.${objectsStates.channel_1_master[3].timeresolution[k]}_${objectsStates.channel_1_master[timerresolution].timeresolution[j]}.${valuesForFolder[i]}`, { val: this.createVisHTMLBindingRainspot(content[channel]['rainspot'][iteration]), ack: true });
					} else {
						this.setState(`${channel}.${objectsStates.channel_1_master[3].timeresolution[k]}_${objectsStates.channel_1_master[timerresolution].timeresolution[j]}.${valuesForFolder[i]}`, { val: content[channel][valuesForFolder[i]][iteration], ack: true });

						// this.log.debug(`Path: ${channel}.${objectsStates.channel_1_master[3].timeresolution[k]}_${objectsStates.channel_1_master[timerresolution].timeresolution[j]}.${valuesForFolder[i]}`);
						// this.log.debug(`Value: ${content[channel][valuesForFolder[i]][iteration]}`);
					}
				}
				iteration += 1;
			}
		}
		this.log.debug(`[writeStates3]: writing states for channel "${channel}" finished.`);
	}

	/**
	 * GET VALUES FROM METEOBLUE
	 */
	async getMeteoblueData() {
		await axios({
			method: 'get',
			url: this.meteoblueApiUrl,
			timeout: 2000,
			responseType: 'json',
		})
			.then(async (response) => {
				this.setState('info.connection', true, true);

				this.log.debug(`[getMeteoblueData]: HTTP status response: ${response.status} ${response.statusText}; config: ${JSON.stringify(response.config)}; headers: ${JSON.stringify(response.headers)}; data: ${JSON.stringify(response.data)}`);
				const content = response.data;

				this.log.info('[getMeteoblueData]: start writing all configured states...');

				await this.writeStates1('units', units_active.slice(1), content);

				if (valuesForFolderData_xmin.length > 2 && 'data_xmin' in content) {
					await this.writeStates3('data_xmin', valuesForFolderData_xmin.slice(2), content);
				} else {
					this.log.debug(`[writeStates3 data_xmin]: No Data available. Nothing written.`);
				}
				if (valuesForFolderData_1h.length > 2 && 'data_1h' in content) {
					await this.writeStates3('data_1h', valuesForFolderData_1h.slice(2), content);
				} else {
					this.log.debug(`[writeStates3 data_1h]: No Data available. Nothing written.`);
				}
				if (valuesForFolderData_3h.length > 2 && 'data_3h' in content) {
					await this.writeStates3('data_3h', valuesForFolderData_3h.slice(2), content);
				} else {
					this.log.debug(`[writeStates3 data_3h]: No Data available. Nothing written.`);
				}
				if (valuesForFolderData_day.length > 2 && 'data_day' in content) {
					await this.writeStates2('data_day', valuesForFolderData_day.slice(2), content);
				} else {
					this.log.debug(`[writeStates3 data_day]: No Data available. Nothing written.`);
				}
				if (valuesForFolderData_current.length > 1 && 'data_current' in content) {
					await this.writeStates1('data_current', valuesForFolderData_current.slice(1), content);
				} else {
					this.log.debug(`[writeStates3 data_current]: No Data available. Nothing written.`);
				}
				if (valuesForFolderGfsensemble_1h.length > 2 && 'gfsensemble_1h' in content) {
					await this.writeStates3('gfsensemble_1h', valuesForFolderGfsensemble_1h.slice(2), content);
				} else {
					this.log.debug(`[writeStates3 gfsensemble_1h]: No Data available. Nothing written.`);
				}
				if (valuesForFolderSoiltrafficability_1h.length > 2 && 'soiltrafficability_1h' in content) {
					await this.writeStates3('soiltrafficability_1h', valuesForFolderSoiltrafficability_1h.slice(2), content);
				} else {
					this.log.debug(`[writeStates3 soiltrafficability_1h]: No Data available. Nothing written.`);
				}
				if (valuesForFolderTrend_1h.length > 2 && 'trend_1h' in content) {
					await this.writeStates3('trend_1h', valuesForFolderTrend_1h.slice(2), content);
				} else {
					this.log.debug(`[writeStates3 trend_1h]: No Data available. Nothing written.`);
				}
				if (valuesForFolderTrend_day.length > 2 && 'trend_day' in content) {
					await this.writeStates2('trend_day', valuesForFolderTrend_day.slice(2), content);
				} else {
					this.log.debug(`[writeStates3 trend_day]: No Data available. Nothing written.`);
				}

				await this.writeStates1('metadata', metadata_active.slice(1), content);

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
				this.log.debug(`[onStateChange]: state ${id} changed: ${state.val} (ack = ${state.ack}). DO SOMETHING.`);
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
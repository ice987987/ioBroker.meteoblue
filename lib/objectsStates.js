'use strict';

const compassDirection = ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

// https://github.com/ioBroker/ioBroker/blob/master/doc/STATE_ROLES.md#state-roles
const packages_master = [
	{id: 'basic_15min',				active: false,	folder: 'data_xmin',				metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['co', 'precipitation', 'precipitation_probability', 'predictability', 'pressure', 'relativehumidity', 'temperature', 'time', 'winddirection', 'windspeed'],																			values: ['felttemperature', 'relativehumidity', 'sealevelpressure', 'temperature', 'time', 'winddirection', 'winddirectionChar2', 'winddirectionChar3', 'windspeed']},
	{id: 'basic_1h',				active: false,	folder: 'data_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['co', 'precipitation', 'precipitation_probability', 'predictability', 'pressure', 'relativehumidity', 'temperature', 'time', 'winddirection', 'windspeed'],																			values: ['convective_precipitation', 'felttemperature', 'isdaylight', 'pictocode', 'precipitation', 'precipitation_probability', 'rainspot', 'rainspot_vis', 'relativehumidity', 'sealevelpressure', 'snowfraction', 'temperature', 'time', 'uvindex', 'winddirection', 'winddirectionChar2', 'winddirectionChar3', 'windspeed']},
	{id: 'basic_3h',				active: false,	folder: 'data_3h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'],																								units: ['co', 'precipitation', 'precipitation_probability', 'predictability', 'pressure', 'relativehumidity', 'temperature', 'time', 'winddirection', 'windspeed'],																			values: ['convective_precipitation', 'felttemperature', 'isdaylight', 'pictocode', 'precipitation', 'precipitation_probability', 'rainspot', 'rainspot_vis', 'relativehumidity', 'sealevelpressure', 'snowfraction', 'temperature', 'time', 'uvindex', 'winddirection', 'winddirectionChar2', 'winddirectionChar3', 'windspeed']},
	{id: 'basic_day',				active: false,	folder: 'data_day',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['co', 'precipitation', 'precipitation_probability', 'predictability', 'pressure', 'relativehumidity', 'temperature', 'time', 'winddirection', 'windspeed'],																			values: ['convective_precipitation', 'felttemperature_max', 'felttemperature_min', 'humiditygreater90_hours', 'pictocode', 'precipitation', 'precipitation_hours', 'precipitation_probability', 'predictability', 'predictability_class', 'rainspot', 'rainspot_vis', 'relativehumidity_max', 'relativehumidity_mean', 'relativehumidity_min', 'sealevelpressure_max', 'sealevelpressure_mean', 'sealevelpressure_min', 'snowfraction', 'temperature_max', 'temperature_mean', 'temperature_min', 'time', 'uvindex', 'winddirection', 'winddirectionChar2', 'winddirectionChar3', 'windspeed_max', 'windspeed_mean', 'windspeed_min']},

	{id: 'current',					active: false,	folder: 'data_current',				metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['temperature', 'time', 'windspeed'],																																																values: ['isdaylight', 'isobserveddata', 'pictocode', 'pictocode_detailed', 'temperature', 'time', 'windspeed', 'zenithangle']},

	{id: 'clouds_1h',				active: false,	folder: 'data_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['time', 'sunshinetime', 'visibility', 'cloudcover'],																																												values: ['highclouds', 'lowclouds', 'midclouds', 'sunshinetime', 'time', 'totalcloudcover', 'visibility']},
	{id: 'clouds_3h',				active: false,	folder: 'data_3h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['time', 'sunshinetime', 'visibility', 'cloudcover'],																																												values: ['highclouds', 'lowclouds', 'midclouds', 'sunshinetime', 'time', 'totalcloudcover', 'visibility']},
	{id: 'clouds_day',				active: false,	folder: 'data_day',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['time', 'sunshinetime', 'visibility', 'cloudcover'],																																												values: ['highclouds_max', 'highclouds_mean', 'highclouds_min', 'lowclouds_max', 'lowclouds_mean', 'lowclouds_min', 'midclouds_max', 'midclouds_mean', 'midclouds_min', 'sunshine_time', 'time', 'totalcloudcover_max', 'totalcloudcover_mean', 'totalcloudcover_min', 'visibility_max', 'visibility_mean', 'visibility_min']},

	{id: 'sunmoon',					active: false,	folder: 'data_day',					metadata: ['height', 'latitude', 'longitude', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																														units: ['time'],																																																							values: ['moonage', 'moonphaseangle', 'moonphasename', 'moonphasetransittime', 'moonrise', 'moonset', 'sunrise', 'sunset', 'time']},

	{id: 'basic_day_webcolors',		active: false,	folder: 'data_day',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['co', 'precipitation', 'precipitation_probability', 'predictability', 'pressure', 'relativehumidity', 'temperature', 'time', 'winddirection', 'windspeed'],																			values: ['convective_precipitation', 'felttemperature_max', 'felttemperature_max_color', 'felttemperature_max_fontcolor', 'felttemperature_min', 'felttemperature_min_color', 'felttemperature_min_fontcolor', 'humiditygreater90_hours', 'pictocode', 'precipitation', 'precipitation_hours', 'precipitation_probability', 'predictability', 'predictability_class', 'predictability_class_color', 'rainspot', 'rainspot_vis', 'relativehumidity_max', 'relativehumidity_mean', 'relativehumidity_min', 'sealevelpressure_max', 'sealevelpressure_mean', 'sealevelpressure_min', 'snowfraction', 'temperature_max', 'temperature_max_color', 'temperature_max_fontcolor', 'temperature_mean', 'temperature_mean_color', 'temperature_mean_fontcolor', 'temperature_min', 'temperature_min_color', 'temperature_min_fontcolor', 'time', 'uvindex', 'uvindex_color', 'winddirection', 'winddirectionChar2', 'winddirectionChar3', 'windspeed_max', 'windspeed_max_color', 'windspeed_mean', 'windspeed_mean_color', 'windspeed_min', 'windspeed_min_color']},

	{id: 'agro_1h',					active: false,	folder: 'data_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['leafwetness', 'sensibleheatflux', 'soilmoisture', 'temperature', 'time', 'transpiration'],																																			values: ['dewpointtemperature', 'evapotranspiration', 'leafwetnessindex', 'potentialevapotranspiration', 'referenceevapotranspiration_fao', 'sensibleheatflux', 'skintemperature', 'soilmoisture_0to10cm', 'soiltemperature_0to10cm', 'time', 'wetbulbtemperature']},
	{id: 'agro_3h',					active: false,	folder: 'data_3h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['leafwetness', 'sensibleheatflux', 'soilmoisture', 'temperature', 'time', 'transpiration'],																																			values: ['dewpointtemperature', 'evapotranspiration', 'leafwetnessindex', 'potentialevapotranspiration', 'referenceevapotranspiration_fao', 'sensibleheatflux', 'skintemperature', 'soilmoisture_0to10cm', 'soiltemperature_0to10cm', 'time', 'wetbulbtemperature']},
	{id: 'agro_day',				active: false,	folder: 'data_day',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['leafwetness', 'sensibleheatflux', 'soilmoisture', 'temperature', 'time', 'transpiration'],																																			values: ['dewpointtemperature_max', 'dewpointtemperature_mean', 'dewpointtemperature_min', 'evapotranspiration', 'leafwetnessindex', 'potentialevapotranspiration', 'referenceevapotranspiration_fao', 'sensibleheatflux', 'skintemperature_max', 'skintemperature_mean', 'skintemperature_min', 'soilmoisture_0to10cm_max', 'soilmoisture_0to10cm_mean', 'soilmoisture_0to10cm_min', 'soiltemperature_0to10cm_max', 'soiltemperature_0to10cm_mean', 'soiltemperature_0to10cm_min', 'time', 'wetbulbtemperature_max', 'wetbulbtemperature_mean', 'wetbulbtemperature_min']},

	{id: 'agromodelleafwetness_1h',	active: false,	folder: 'data_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['time'],																																																							values: ['leafwetness_dewindex', 'leafwetness_evaporationindex', 'leafwetness_probability', 'leafwetness_rainindex', 'time']},

	{id: 'agromodelsowing_1h',		active: false,	folder: 'data_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['time'],																																																							values: ['sowing_barley', 'sowing_cotton', 'sowing_maize', 'sowing_potato', 'sowing_rapseed', 'sowing_riceindica', 'sowing_ricejaponi', 'sowing_sorghum', 'sowing_soybean', 'sowing_sugarbeets', 'sowing_wheat', 'time']},

	{id: 'agromodelspray_1h',		active: false,	folder: 'data_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['time'],																																																							values: ['spraywindow', 'time']},

	{id: 'soiltrafficability_1h',	active: false,	folder: 'soiltrafficability_1h',	metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['time'],																																																							values: ['clay', 'sand', 'silt', 'siltyloam', 'time']},

	{id: 'solar_15min',				active: false,	folder: 'data_xmin',				metadata: ['facing', 'height',' kwp', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'slope', 'timezone_abbrevation', 'tracking', 'utc_timeoffset'], 														units: ['dif_total', 'dni_total', 'extraterrestrialradiation_total', 'ghi_total', 'gni_total', 'radiation', 'time'],																														values: ['dif_backwards', 'dif_instant', 'dni_backwards', 'dni_instant', 'extraterrestrialradiation_backwards', 'extraterrestrialradiation_instant', 'ghi_backwards', 'ghi_instant', 'gni_backwards', 'gni_instant', 'time']},
	{id: 'solar_1h',				active: false,	folder: 'data_1h',					metadata: ['facing', 'height', 'kwp', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'slope', 'timezone_abbrevation', 'tracking', 'utc_timeoffset'], 														units: ['dif_total', 'dni_total', 'extraterrestrialradiation_total', 'ghi_total', 'gni_total', 'radiation', 'time'],																														values: ['dif_backwards', 'dif_instant', 'dni_backwards', 'dni_instant', 'extraterrestrialradiation_backwards', 'extraterrestrialradiation_instant', 'ghi_backwards', 'ghi_instant', 'gni_backwards', 'gni_instant', 'time']},
	{id: 'solar_3h',				active: false,	folder: 'data_3h',					metadata: ['facing', 'height', 'kwp', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'slope', 'timezone_abbrevation', 'tracking', 'utc_timeoffset'], 														units: ['dif_total', 'dni_total', 'extraterrestrialradiation_total', 'ghi_total', 'gni_total', 'radiation', 'time'],																														values: ['dif_backwards', 'dif_instant', 'dni_backwards', 'dni_instant', 'extraterrestrialradiation_backwards', 'extraterrestrialradiation_instant', 'ghi_backwards', 'ghi_instant', 'gni_backwards', 'gni_instant', 'time']},
	{id: 'solar_day',				active: false,	folder: 'data_day',					metadata: ['facing', 'height', 'kwp', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'slope', 'timezone_abbrevation', 'tracking', 'utc_timeoffset'], 														units: ['dif_total', 'dni_total', 'extraterrestrialradiation_total', 'ghi_total', 'gni_total', 'radiation', 'time'],																														values: ['dif_total', 'dni_total', 'extraterrestrialradiation_total', 'ghi_total', 'gni_total', 'time']},

	{id: 'solarensemble_1h',		active: false,	folder: 'trend_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['time', 'radiation'],																																																				values: ['ghi_backwards_consensus', 'ghi_backwards_max', 'ghi_backwards_min', 'ghi_backwards_p10exceedence', 'ghi_backwards_p15exceedence', 'ghi_backwards_p20exceedence', 'ghi_backwards_p25exceedence', 'ghi_backwards_p30exceedence', 'ghi_backwards_p40exceedence', 'ghi_backwards_p50exceedence', 'ghi_backwards_p5exceedence', 'ghi_backwards_p60exceedence', 'ghi_backwards_p70exceedence', 'ghi_backwards_p75exceedence', 'ghi_backwards_p80exceedence', 'ghi_backwards_p85exceedence', 'ghi_backwards_p90exceedence', 'ghi_backwards_p95exceedence', 'time']},

	{id: 'pvpro_1h',				active: false,	folder: 'data_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset', 'facing', 'kwp', 'slope', 'power_efficiency', 'tracking'],									units: ['iam', 'pvpower', 'snowcover', 'temperature', 'time'],																																												values: ['gti_backwards', 'gti_instant', 'iam_backwards', 'iam_instant', 'moduletemperature_backwards', 'moduletemperature_instant', 'performanceratio', 'pvpower_backwards', 'pvpower_instant', 'snowcover', 'time']},
	{id: 'pvpro_day',				active: false,	folder: 'data_day',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset', 'facing', 'kwp', 'slope', 'power_efficiency', 'tracking'],									units: ['iam', 'pvpower', 'snowcover', 'temperature', 'time'],																																												values: ['gti_total', 'moduletemperature_mean', 'pvpower_total', 'snowcover_mean', 'time']},

	{id: 'wind_15min',				active: false,	folder: 'data_xmin',				metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['time', 'windspeed', 'winddirection', 'surfaceairpressure', 'density'],																																								values: ['airdensity', 'gust', 'surfaceairpressure', 'time', 'winddirection_80m', 'winddirection_80mChar2', 'winddirection_80mChar3', 'windspeed_80m']},
	{id: 'wind_1h',					active: false,	folder: 'data_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['time', 'windspeed', 'winddirection', 'surfaceairpressure', 'density'],																																								values: ['airdensity', 'gust', 'surfaceairpressure', 'time', 'winddirection_80m', 'winddirection_80mChar2', 'winddirection_80mChar3', 'windspeed_80m']},
	{id: 'wind_3h',					active: false,	folder: 'data_3h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['time', 'windspeed', 'winddirection', 'surfaceairpressure', 'density'],																																								values: ['airdensity', 'gust', 'surfaceairpressure', 'time', 'winddirection_80m', 'winddirection_80mChar2', 'winddirection_80mChar3', 'windspeed_80m']},
	{id: 'wind_day',				active: false,	folder: 'data_day',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['time', 'windspeed', 'winddirection', 'surfaceairpressure', 'density'],																																								values: ['airdensity_max', 'airdensity_mean', 'airdensity_min', 'gust_max', 'gust_mean', 'gust_min', 'surfaceairpressure_max', 'surfaceairpressure_mean', 'surfaceairpressure_min', 'time', 'winddirection_80m', 'winddirection_80mChar2', 'winddirection_80mChar3', 'windspeed_80m_max', 'windspeed_80m_mean', 'windspeed_80m_min']},

	{id: 'wind80ensemble_1h',		active: false,	folder: 'trend_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['time', 'windspeed'],																																																				values: ['time', 'windspeed_80m_consensus', 'windspeed_80m_max', 'windspeed_80m_min', 'windspeed_80m_p10exceedence', 'windspeed_80m_p15exceedence', 'windspeed_80m_p20exceedence', 'windspeed_80m_p25exceedence', 'windspeed_80m_p30exceedence', 'windspeed_80m_p40exceedence', 'windspeed_80m_p5exceedence', 'windspeed_80m_p50exceedence', 'windspeed_80m_p60exceedence', 'windspeed_80m_p70exceedence', 'windspeed_80m_p75exceedence', 'windspeed_80m_p80exceedence', 'windspeed_80m_p85exceedence', 'windspeed_80m_p90exceedence', 'windspeed_80m_p95exceedence']},

	{id: 'windpower_1h',			active: false,	folder: 'data_1h',					metadata: ['forecasttype', 'height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'numberofturbines', 'powerefficiency', 'timezone_abbrevation', 'turbinepeakpower', 'turbinetype', 'utc_timeoffset'],	units: ['time', 'windpower'],																																																				values: ['time', 'windpower']},

	{id: 'sea_1h',					active: false,	folder: 'data_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['currentvelocity', 'salinity', 'temperature', 'time', 'wave_direction', 'wave_height', 'wave_period', 'winddirection'],																												values: ['currentvelocity_u', 'currentvelocity_v', 'mean_wavedirection', 'mean_waveperiod', 'salinity', 'seasurfacetemperature', 'significantwaveheight', 'swell_meandirection', 'swell_meanperiod', 'swell_peakwaveperiod', 'swell_significantheight', 'time', 'windwave_direction', 'windwave_height', 'windwave_meanperiod', 'windwave_peakwaveperiod']},
	{id: 'sea_3h',					active: false,	folder: 'data_3h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['currentvelocity', 'salinity', 'temperature', 'time', 'wave_direction', 'wave_height', 'wave_period', 'winddirection'],																												values: ['currentvelocity_u', 'currentvelocity_v', 'mean_wavedirection', 'mean_waveperiod', 'salinity', 'seasurfacetemperature', 'significantwaveheight', 'swell_meandirection', 'swell_meanperiod', 'swell_peakwaveperiod', 'swell_significantheight', 'time', 'windwave_direction', 'windwave_height', 'windwave_meanperiod', 'windwave_peakwaveperiod']},
	{id: 'sea_day',					active: false,	folder: 'data_day',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['currentvelocity', 'salinity', 'temperature', 'time', 'wave_direction', 'wave_height', 'wave_period', 'winddirection'],																												values: ['currentvelocity_u_max', 'currentvelocity_u_mean', 'currentvelocity_u_min', 'currentvelocity_v_max', 'currentvelocity_v_mean', 'currentvelocity_v_min', 'mean_wavedirection_dominant', 'mean_waveperiod_max', 'mean_waveperiod_mean', 'mean_waveperiod_min', 'salinity_mean', 'seasurfacetemperature_mean', 'significantwaveheight_max', 'significantwaveheight_mean', 'significantwaveheight_min', 'swell_meandirection_dominant', 'swell_meanperiod_max', 'swell_meanperiod_mean', 'swell_meanperiod_min', 'swell_peakwaveperiod_max', 'swell_peakwaveperiod_mean', 'swell_peakwaveperiod_min', 'swell_significantheight_max', 'swell_significantheight_mean', 'swell_significantheight_min', 'time', 'windwave_direction_dominant', 'windwave_height_max', 'windwave_height_mean', 'windwave_height_min', 'windwave_meanperiod_max', 'windwave_meanperiod_mean', 'windwave_meanperiod_min', 'windwave_peakwaveperiod_max', 'windwave_peakwaveperiod_mean', 'windwave_peakwaveperiod_min']},

	{id: 'air_1h',					active: false,	folder: 'data_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['boundarylayerheight', 'cape', 'cloudice', 'cloudwater', 'co', 'convectiveinhibition', 'freezinglevelheight', 'helicity', 'time'],																									values: ['boundarylayerheight', 'cape', 'cloudice', 'cloudwater', 'convectiveinhibition', 'freezinglevelheight', 'helicity', 'liftedindex', 'time']},
	{id: 'air_3h',					active: false,	folder: 'data_3h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['boundarylayerheight', 'cape', 'cloudice', 'cloudwater', 'co', 'convectiveinhibition', 'freezinglevelheight', 'helicity', 'time'],																									values: ['boundarylayerheight', 'cape', 'cloudice', 'cloudwater', 'convectiveinhibition', 'freezinglevelheight', 'helicity', 'liftedindex', 'time']},
	{id: 'air_day',					active: false,	folder: 'data_day',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['boundarylayerheight', 'cape', 'cloudice', 'cloudwater', 'co', 'convectiveinhibition', 'freezinglevelheight', 'helicity', 'time'],																									values: ['boundarylayerheight_max', 'boundarylayerheight_mean', 'boundarylayerheight_min', 'cape_max', 'cape_mean', 'cape_min', 'cloudice_max', 'cloudice_mean', 'cloudice_min', 'cloudwater_max', 'cloudwater_mean', 'cloudwater_min', 'convectiveinhibition_max', 'convectiveinhibition_mean', 'convectiveinhibition_min', 'freezinglevelheight_max', 'freezinglevelheight_mean', 'freezinglevelheight_min', 'helicity_max', 'helicity_mean', 'helicity_min', 'liftedindex_max', 'liftedindex_mean', 'liftedindex_min', 'time']},

	{id: 'airquality_1h',			active: false,	folder: 'data_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['airqualityindex', 'aod550', 'co', 'dust_concentration', 'no2', 'ozone', 'pm10', 'pm25', 'pollen_birch', 'pollen_grass', 'pollen_olive', 'so2', 'time'],																			values: ['airqualityindex', 'aod550', 'co', 'dust_concentration', 'no2', 'ozone', 'pm10', 'pm25', 'pollen_birch', 'pollen_grass', 'pollen_olive', 'sandstorm_alert', 'so2', 'time']},
	{id: 'airquality_3h',			active: false,	folder: 'data_3h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['airqualityindex', 'aod550', 'co', 'dust_concentration', 'no2', 'ozone', 'pm10', 'pm25', 'pollen_birch', 'pollen_grass', 'pollen_olive', 'so2', 'time'],																			values: ['airqualityindex', 'aod550', 'co', 'dust_concentration', 'no2', 'ozone', 'pm10', 'pm25', 'pollen_birch', 'pollen_grass', 'pollen_olive', 'sandstorm_alert', 'so2', 'time']},
	{id: 'airquality_day',			active: false,	folder: 'data_day',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'], 																							units: ['airqualityindex', 'aod550', 'co', 'dust_concentration', 'no2', 'ozone', 'pm10', 'pm25', 'pollen_birch', 'pollen_grass', 'pollen_olive', 'so2', 'time'],																			values: ['airqualityindex_max', 'airqualityindex_mean', 'airqualityindex_min', 'aod550_max', 'aod550_mean', 'aod550_min', 'dust_concentration_max', 'dust_concentration_mean', 'dust_concentration_min', 'ozone_max', 'ozone_mean', 'ozone_min', 'pm10_max', 'pm10_mean', 'pm10_min', 'pm25_max', 'pm25_mean', 'pm25_min', 'sandstorm_alert', 'so2_max', 'so2_mean', 'so2_min', 'time']},

	{id: 'sigmalevel_1h',			active: false,	folder: 'data_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'sigmalevelheight', 'utc_timeoffset'],																			units: ['density', 'relativehumidity', 'temperature', 'time', 'winddirection', 'windspeed'],																																				values: ['airdensity', 'relativehumidity', 'temperature', 'time', 'winddirection', 'winddirectionChar2', 'winddirectionChar3', 'windspeed']},
	{id: 'sigmalevel_day',			active: false,	folder: 'data_day',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'sigmalevelheight', 'utc_timeoffset'],																			units: ['density', 'relativehumidity', 'temperature', 'time', 'winddirection', 'windspeed'],																																				values: ['airdensity_max', 'airdensity_mean', 'airdensity_min', 'relativehumidity_max', 'relativehumidity_mean', 'relativehumidity_min', 'temperature_max', 'temperature_mean', 'temperature_min', 'time', 'winddirection_dominant', 'windspeed_max', 'windspeed_mean', 'windspeed_min']},

	{id: 'profiletemp_1h',			active: false,	folder: 'data_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'],																								units: ['time', 'temperature'],																																																				values: ['temperatureprofile_1000_mb', 'temperatureprofile_200_mb', 'temperatureprofile_250_mb', 'temperatureprofile_300_mb', 'temperatureprofile_350_mb', 'temperatureprofile_400_mb', 'temperatureprofile_450_mb', 'temperatureprofile_500_mb', 'temperatureprofile_550_mb', 'temperatureprofile_600_mb', 'temperatureprofile_650_mb', 'temperatureprofile_700_mb', 'temperatureprofile_750_mb', 'temperatureprofile_800_mb', 'temperatureprofile_850_mb', 'temperatureprofile_875_mb', 'temperatureprofile_900_mb', 'temperatureprofile_925_mb', 'temperatureprofile_950_mb', 'temperatureprofile_975_mb', 'time']},

	{id: 'profileheight_1h',		active: false,	folder: 'data_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'],																								units: ['time'],																																																							values: ['heightprofile_1000_mb', 'heightprofile_200_mb', 'heightprofile_250_mb', 'heightprofile_300_mb', 'heightprofile_350_mb', 'heightprofile_400_mb', 'heightprofile_450_mb', 'heightprofile_500_mb', 'heightprofile_550_mb', 'heightprofile_600_mb', 'heightprofile_650_mb', 'heightprofile_700_mb', 'heightprofile_750_mb', 'heightprofile_800_mb', 'heightprofile_850_mb', 'heightprofile_875_mb', 'heightprofile_900_mb', 'heightprofile_925_mb', 'heightprofile_950_mb', 'heightprofile_975_mb', 'time']},

	{id: 'profilewind_1h',			active: false,	folder: 'data_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'],																								units: ['time', 'winddirection', 'windspeed'],																																																values: ['time', 'winddirectionprofile1000_mb', 'winddirectionprofile200_mb', 'winddirectionprofile250_mb', 'winddirectionprofile300_mb', 'winddirectionprofile350_mb', 'winddirectionprofile400_mb', 'winddirectionprofile450_mb', 'winddirectionprofile500_mb', 'winddirectionprofile550_mb', 'winddirectionprofile600_mb', 'winddirectionprofile650_mb', 'winddirectionprofile700_mb', 'winddirectionprofile750_mb', 'winddirectionprofile800_mb', 'winddirectionprofile850_mb', 'winddirectionprofile875_mb', 'winddirectionprofile900_mb', 'winddirectionprofile925_mb', 'winddirectionprofile950_mb', 'winddirectionprofile975_mb', 'windspeedprofile_1000_mb', 'windspeedprofile_200_mb', 'windspeedprofile_250_mb', 'windspeedprofile_300_mb', 'windspeedprofile_350_mb', 'windspeedprofile_400_mb', 'windspeedprofile_450_mb', 'windspeedprofile_500_mb', 'windspeedprofile_550_mb', 'windspeedprofile_600_mb', 'windspeedprofile_650_mb', 'windspeedprofile_875_mb', 'windspeedprofile_700_mb', 'windspeedprofile_750_mb', 'windspeedprofile_800_mb', 'windspeedprofile_850_mb', 'windspeedprofile_900_mb', 'windspeedprofile_925_mb', 'windspeedprofile_950_mb', 'windspeedprofile_975_mb']},

	{id: 'profileclouds_1h',		active: false,	folder: 'data_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'],																								units: ['time', 'cloudcover'],																																																				values: ['cloudcoverprofile_1000_mb', 'cloudcoverprofile_200_mb', 'cloudcoverprofile_250_mb', 'cloudcoverprofile_300_mb', 'cloudcoverprofile_350_mb', 'cloudcoverprofile_400_mb', 'cloudcoverprofile_450_mb', 'cloudcoverprofile_500_mb', 'cloudcoverprofile_550_mb', 'cloudcoverprofile_600_mb', 'cloudcoverprofile_650_mb', 'cloudcoverprofile_700_mb', 'cloudcoverprofile_750_mb', 'cloudcoverprofile_800_mb', 'cloudcoverprofile_850_mb', 'cloudcoverprofile_875_mb', 'cloudcoverprofile_900_mb', 'cloudcoverprofile_925_mb', 'cloudcoverprofile_950_mb', 'cloudcoverprofile_975_mb', 'time']},

	{id: 'profilerh_1h',			active: false,	folder: 'data_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'],																								units: ['time', 'relativehumidity'],																																																		values: ['relativehumidityprofile_1000_mb', 'relativehumidityprofile_200_mb', 'relativehumidityprofile_250_mb', 'relativehumidityprofile_300_mb', 'relativehumidityprofile_350_mb', 'relativehumidityprofile_400_mb', 'relativehumidityprofile_450_mb', 'relativehumidityprofile_500_mb', 'relativehumidityprofile_550_mb', 'relativehumidityprofile_600_mb', 'relativehumidityprofile_650_mb', 'relativehumidityprofile_700_mb', 'relativehumidityprofile_750_mb', 'relativehumidityprofile_800_mb', 'relativehumidityprofile_850_mb', 'relativehumidityprofile_875_mb', 'relativehumidityprofile_900_mb', 'relativehumidityprofile_925_mb', 'relativehumidityprofile_950_mb', 'relativehumidityprofile_975_mb', 'time']},

	{id: 'ensemble_1h',				active: false,	folder: 'gfsensemble_1h',			metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset', 'gfsensemble_members'],																		units: ['cloudcover', 'precipitation', 'radiation', 'temperature',' time', 'winddirection', 'windspeed'],																																	values: ['ghi_backwards', 'gust', 'highclouds', 'lowclouds', 'midclouds', 'precipitation', 'skintemperature', 'temperature', 'time', 'winddirection', 'winddirectionChar2', 'winddirectionChar3', 'windspeed']},

	{id: 'trend_1h',				active: false,	folder: 'trend_1h',					metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'],																								units: ['cloudcover', 'extraterrestrialradiation_total', 'ghi_total', 'precipitation', 'precipitation_probability', 'predictability', 'pressure', 'radiation', 'relativehumidity', 'temperature', 'time', 'winddirection', 'windspeed'],	values: ['extraterrestrialradiation_backwards', 'ghi_backwards', 'pictocode', 'precipitation', 'precipitation_spread', 'relativehumidity', 'sealevelpressure', 'snowfraction', 'temperature', 'temperature_spread', 'time', 'totalcloudcover', 'totalcloudcover_spread', 'winddirection', 'winddirectionChar2', 'winddirectionChar3', 'windspeed', 'windspeed_spread']},
	{id: 'trend_day',				active: false,	folder: 'trend_day',				metadata: ['height', 'latitude', 'longitude', 'modelrun_updatetime_utc', 'modelrun_utc', 'name', 'timezone_abbrevation', 'utc_timeoffset'],																								units: ['cloudcover', 'extraterrestrialradiation_total', 'ghi_total', 'precipitation', 'precipitation_probability', 'predictability', 'pressure', 'radiation', 'relativehumidity', 'temperature', 'time', 'winddirection', 'windspeed'],	values: ['extraterrestrialradiation_total', 'ghi_total', 'pictocode', 'precipitation', 'precipitation_probability', 'precipitation_spread', 'predictability', 'predictability_class', 'relativehumidity_max', 'relativehumidity_mean', 'relativehumidity_min', 'sealevelpressure_max', 'sealevelpressure_mean', 'sealevelpressure_min', 'snowfraction', 'temperature_max', 'temperature_mean', 'temperature_min', 'temperature_spread', 'time', 'totalcloudcover_max', 'totalcloudcover_mean', 'totalcloudcover_min', 'totalcloudcover_spread', 'winddirection', 'winddirectionChar2', 'winddirectionChar3', 'windspeed_max', 'windspeed_mean', 'windspeed_min', 'windspeed_spread']}
];

const channel_0_master = [
	{id: 'ACTION', 								type: 'channel_0',																													cname: 'ACTION'},
	{id: 'metadata',							type: 'channel_0',																													cname: 'metadata'},
	{id: 'units',								type: 'channel_0',																													cname: 'units'},
	{id: 'data_xmin',							type: 'channel_0',																													cname: 'data 15min'},
	{id: 'data_1h',								type: 'channel_0',																													cname: 'data 1h'},
	{id: 'data_3h',								type: 'channel_0',																													cname: 'data 3h'},
	{id: 'data_day',							type: 'channel_0',																													cname: 'data day'},
	{id: 'data_current',						type: 'channel_0',																													cname: 'current'},
	// {id: 'gfsensemble_1h',					type: 'channel_0',																													cname: 'gfsensemble 1h'},
	{id: 'soiltrafficability_1h',				type: 'channel_0',																													cname: 'soiltrafficability 1h'},
	{id: 'trend_1h',							type: 'channel_0',																													cname: 'trend 1h'},
	{id: 'trend_day',							type: 'channel_0',																													cname: 'trend day'}
];

const channel_1_master = [
	{id: '15min',								type: 'channel_1',					timeresolution: ['0000', '0015', '0030', '0045', '0100', '0115', '0130', '0145', '0200', '0215', '0230', '0245', '0300', '0315', '0330', '0345', '0400', '0415', '0430', '0445', '0500', '0515', '0530', '0545', '0600', '0615', '0630', '0645', '0700', '0715', '0730', '0745', '0800', '0815', '0830', '0845', '0900', '0915', '0930', '0945', '1000', '1015', '1030', '1045', '1100', '1115', '1130', '1145', '1200', '1215', '1230', '1245', '1300', '1315', '1330', '1345', '1400', '1415', '1430', '1445', '1500', '1515', '1530', '1545', '1600', '1615', '1630', '1645', '1700', '1715', '1730', '1745', '1800', '1815', '1830', '1845', '1900', '1915', '1930', '1945', '2000', '2015', '2030', '2045', '2100', '2115', '2130', '2145', '2200', '2215', '2230', '2245', '2300', '2315', '2330', '2345']},
	{id: '1h',									type: 'channel_1',					timeresolution: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300']},
	{id: '3h',									type: 'channel_1',					timeresolution: ['0000', '0300', '0600', '0900', '1200', '1500', '1800', '2100']},
	{id: 'day',									type: 'channel_1',					timeresolution: ['0d', '1d', '2d', '3d', '4d', '5d', '6d']}
];

const manual_mode = [
	{id: 'REQUEST_DATA',						type: 'state',	ctype: 'boolean',	crole: 'button',																				cname: 'Request data from meteoblue',										cwrite: true}
];

const metadata_master = [
	{id: 'height',								type: 'state',	ctype: 'number',	crole: 'value.gps.elevation',									cunit: 'm',						cname: 'Elevation in meters above sea level'},
	{id: 'latitude',							type: 'state',	ctype: 'number',	crole: 'value.gps.latitude',									cunit: '°N',					cname: 'Latitude coordinate in WGS-84'},
	{id: 'longitude',							type: 'state',	ctype: 'number',	crole: 'value.gps.longitude',									cunit: '°E',					cname: 'Longitude coordinate in WGS-84'},
	{id: 'modelrun_updatetime_utc',				type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Displays the time at which the last meteoblue model run has been completed'},
	{id: 'modelrun_utc',						type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Initialisation time of the meteoblue model run which delivers the raw meteoblue model data to the forecast API packages'},
	{id: 'name',								type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Location name'},
	{id: 'timezone_abbrevation',				type: 'state',	ctype: 'string',	crole: 'value', 																				cname: 'Time zone'},
	{id: 'utc_timeoffset',						type: 'state',	ctype: 'number',	crole: 'value',													cunit: 'h', 					cname: 'UTC offset (±hh:mm)'},
	// forecast packages: pvpro-x
	{id: 'facing',								type: 'state',	ctype: 'number',	crole: 'value',																					cname: 'Orientation of solar panel'},
	{id: 'kwp',									type: 'state',	ctype: 'number',	crole: 'value',																					cname: 'Kilowatt peak production'},
	{id: 'slope',								type: 'state',	ctype: 'number',	crole: 'value',																					cname: 'Inclination of solar panel'},
	{id: 'power_efficiency',					type: 'state',	ctype: 'number',	crole: 'value',																					cname: 'Power efficiency of pv module'}, // to be checked
	{id: 'tracking',							type: 'state',	ctype: 'number',	crole: 'value',																					cname: 'For solar panels using a sun tracker',								cstates: {0: 'no tracker', 1: 'Daily vertical axis tracker', 2: 'Daily 2-axis tracker', 3: 'Yearly horizontal tracker', 4: 'Daily DNI tracker', 5: 'Daily horizontal axis tracker'}},
	// forecast package: windpower-x
	{id: 'forecasttype',						type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Forecast type'},
	{id: 'numberofturbines',					type: 'state',	ctype: 'number',	crole: 'value',																					cname: 'Number of turbines'},
	{id: 'powerefficiency',						type: 'state',	ctype: 'number',	crole: 'value',																					cname: 'Power efficiency of wind turbine'},
	{id: 'turbinepeakpower',					type: 'state',	ctype: 'number',	crole: 'value',																					cname: 'Kilowatt peak production'},
	{id: 'turbinetype',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Turbine type'},
	// forecast package: sigmalevel-x
	{id: 'sigmalevelheight',					type: 'state',	ctype: 'number',	crole: 'value',																					cname: 'Sigma level, height above ground in [m]'}
];

const units_master = [
	{id: 'time',								type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Time format'},
	// forecast packages: basic-x, current, agro-x, sea-x, profiletemp-x, ensemble-x, trend-x
	{id: 'temperature',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of temperature'},
	// forecast packages: basic-x, current, wind-x, wind80ensemble-x, profilewind-x, ensemble-x, trend-x,
	{id: 'windspeed',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of windspeed'},
	// forecast packages: basic-x
	{id: 'pressure',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of pressure'},
	// forecast packages: basic-x, wind-x, sea-x, profilewind-1h, ensemble-x, trend-x
	{id: 'winddirection',						type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of winddirection'},
	// forecast packages: basic-x, air-x, airquality-x
	{id: 'co',									type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of CO'},
	// forecast packages: basic-x, ensemble-x, trend-x
	{id: 'precipitation',						type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of precipitation'},
	// forecast packages: basic-x, trend-x
	{id: 'pressure',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of pressure'},
	{id: 'predictability',						type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of predictability'},
	{id: 'precipitation_probability',			type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of precipitation probability'},
	// forecast packages: basic-x, sigmalevel-x, profilerh-x, trend-x
	{id: 'relativehumidity',					type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of relative humidity'},
	// forecast packages: clouds-x
	{id: 'sunshinetime',						type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of sunshinetime'},
	{id: 'visibility',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of visibility'},
	// forecast packages: clouds-x, profileclouds-x, ensemble-x, trend-x
	{id: 'cloudcover',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of cloudcover'},
	// forecast package: agro-x
	{id: 'leafwetness',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of leaf wetness'},
	{id: 'soilmoisture',						type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of soil moisture'},
	{id: 'sensibleheatflux',					type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of sensible heat flux'},
	{id: 'transpiration',						type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of transpiration'},
	// forecast package: solar-x, solarensemble-x, ensemble-x, trend-x
	{id: 'radiation',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of radiation'},
	// forecast package: solar-x
	{id: 'dif_total',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of diffuse radiation'},
	{id: 'dni_total',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of direct normalized irradiance (Radiation)'},
	{id: 'gni_total',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of global normalized irradiance (Radiation)'},
	// forecast package: solar-x, trend-x
	{id: 'ghi_total',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of global horizontal radiation'},
	{id: 'extraterrestrialradiation_total',		type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of extraterrestrial solar radiation'},
	// forecast package: wind-x
	{id: 'surfaceairpressure',					type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of surfaceairpressure'},
	// forecast package: wind-x, sigmalevel-x
	{id: 'density',								type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of wind density'},
	// forecast package: sea-x
	{id: 'wave_height',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of wave height'},
	{id: 'wave_period',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of wave period'},
	{id: 'currentvelocity',						type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of current velocity'},
	{id: 'salinity',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of salinity'},
	{id: 'wave_direction',						type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of wave direction'},
	// forecast package: air-x
	{id: 'cape',								type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of cape'},
	{id: 'convectiveinhibition',				type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of convectiveinhibition'},
	{id: 'helicity',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of helicity'},
	{id: 'boundarylayerheight',					type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of boundarylayerheight'},
	{id: 'cloudwater',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of cloudwater'},
	{id: 'cloudice',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of cloudice'},
	{id: 'freezinglevelheight',					type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of freezinglevelheight'},
	// forecast package: airquality-x
	{id: 'ozone',								type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of ozone'},
	{id: 'dust_concentration',					type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of dust concentration'},
	{id: 'pm25',								type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of PM2.5'},
	{id: 'pm10',								type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of PM10 '},
	{id: 'so2',									type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of sulphur dioxide'},
	{id: 'no2',									type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of nitrogen dioxide'},
	{id: 'pollen_birch',						type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of birch pollen'},
	{id: 'pollen_grass',						type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of grass pollen'},
	{id: 'pollen_olive',						type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of olive pollen'},
	{id: 'aod550',								type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of aerosol optical depth'},
	{id: 'airqualityindex',						type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of airquality index'},
	// forecast package: pvpower-x
	{id: 'iam',									type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of incidence angle modifier'},
	{id: 'pvpower',								type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of photovoltaic power'},
	{id: 'snowcover',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of snow cover'},
	// forecast package: windpower-x
	{id: 'windpower',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Unit of wind power'}
];

const values_master = [
	{id: 'airdensity',							type: 'state',	ctype: 'number',	crole: 'value.airdensity.forecast',								cunit: 'kg/m3',					cname: 'Air density (result of altitude, temperature and humidity)'},
	{id: 'airdensity_max',						type: 'state',	ctype: 'number',	crole: 'value.airdensitdy_max.forecast',						cunit: 'kg/m3',					cname: 'Maximum air density (result of altitude, temperature and humidity)'},
	{id: 'airdensity_mean',						type: 'state',	ctype: 'number',	crole: 'value.airdensitdy_mean.forecast',						cunit: 'kg/m3',					cname: 'Mean air density (result of altitude, temperature and humidity)'},
	{id: 'airdensity_min',						type: 'state',	ctype: 'number',	crole: 'value.airdensitdy_min.forecast',						cunit: 'kg/m3',					cname: 'Minimum air density (result of altitude, temperature and humidity)'},

	{id: 'airqualityindex',						type: 'state',	ctype: 'number',	crole: 'value.airqualityindex.forecast',														cname: 'Air quality index (2m above ground)'},
	{id: 'airqualityindex_max',					type: 'state',	ctype: 'number',	crole: 'value.airqualityindex_max.forecast',													cname: 'Maximum air quality index (2m above ground)'},
	{id: 'airqualityindex_mean',				type: 'state',	ctype: 'number',	crole: 'value.airqualityindex_mean.forecast',													cname: 'Mean air quality index (2m above ground)'},
	{id: 'airqualityindex_min',					type: 'state',	ctype: 'number',	crole: 'value.airqualityindex_min.forecast',													cname: 'Minimum air quality index (2m above ground)'},

	{id: 'aod550',								type: 'state',	ctype: 'number',	crole: 'value.aod550.forecast',									cunit: 'ug/m3',					cname: 'AOD500 concentration (2m above ground, aerosol optical depth at 550nm)'},
	{id: 'aod550_max',							type: 'state',	ctype: 'number',	crole: 'value.aod550_max.forecast',								cunit: 'ug/m3',					cname: 'Maximunm AOD500 concentration (2m above ground, aerosol optical depth at 550nm))'},
	{id: 'aod550_mean',							type: 'state',	ctype: 'number',	crole: 'value.aod550_mean.forecast',							cunit: 'ug/m3',					cname: 'Mean AOD500 concentration (2m above ground, aerosol optical depth at 550nm))'},
	{id: 'aod550_min',							type: 'state',	ctype: 'number',	crole: 'value.aod550_min.forecast',								cunit: 'ug/m3',					cname: 'Minimum AOD500 concentration (2m above ground, aerosol optical depth at 550nm))'},

	{id: 'boundarylayerheight',					type: 'state',	ctype: 'number',	crole: 'value.boundarylayerheight.forecast',					cunit: 'm',						cname: 'Boundary layer height (Layer with inversion)'},
	{id: 'boundarylayerheight_max',				type: 'state',	ctype: 'number',	crole: 'value.boundarylayerheight_max.forecast',				cunit: 'm',						cname: 'Maximum boundary layer height (Layer with inversion'},
	{id: 'boundarylayerheight_mean',			type: 'state',	ctype: 'number',	crole: 'value.boundarylayerheight_mean.forecast',				cunit: 'm',						cname: 'Mean boundary layer height (Layer with inversion'},
	{id: 'boundarylayerheight_min',				type: 'state',	ctype: 'number',	crole: 'value.boundarylayerheight_min.forecast',				cunit: 'm',						cname: 'Minimum boundary layer height (Layer with inversion'},

	{id: 'cape',								type: 'state',	ctype: 'number',	crole: 'value.cape.forecast',									cunit: 'J/kg',					cname: 'Convective available potential Energy'},
	{id: 'cape_max',							type: 'state',	ctype: 'number',	crole: 'value.cape_max.forecast',								cunit: 'J/kg',					cname: 'Maximum convective available potential Energy'},
	{id: 'cape_mean',							type: 'state',	ctype: 'number',	crole: 'value.cape_mean.forecast',								cunit: 'J/kg',					cname: 'Mean convective available potential Energy'},
	{id: 'cape_min',							type: 'state',	ctype: 'number',	crole: 'value.cape_min.forecast',								cunit: 'J/kg',					cname: 'Minimum convective available potential Energy'},

	{id: 'clay',								type: 'state',	ctype: 'number',	crole: 'value.clay.forecast',																	cname: 'Stability of the clay for moving vehicles',							cstates: {0: 'no trafficability', 1: 'good trafficiability'}},

	{id: 'cloudcover',							type: 'state',	ctype: 'number',	crole: 'value.cloudcover.forecast',								cunit: '%',						cname: 'Cloud cover (Cover of the sky)'},

	{id: 'cloudcoverprofile_1000_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_1000_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 1000mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_200_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_200_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 200mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_250_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_250_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 250mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_300_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_300_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 300mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_350_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_350_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 350mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_400_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_400_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 400mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_450_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_450_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 450mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_500_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_500_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 500mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_550_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_550_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 550mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_600_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_600_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 600mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_650_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_650_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 650mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_700_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_700_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 700mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_750_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_750_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 750mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_800_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_800_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 800mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_850_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_850_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 850mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_875_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_875_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 875mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_900_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_900_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 900mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_925_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_925_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 925mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_950_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_950_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 950mb (Cover of the sky)'},
	{id: 'cloudcoverprofile_975_mb',			type: 'state',	ctype: 'number',	crole: 'value.cloudcoverprofile_975_mb.forecast',				cunit: '%',						cname: 'Cloud cover profile 975mb (Cover of the sky)'},

	{id: 'cloudice',							type: 'state',	ctype: 'number',	crole: 'value.cloudice.forecast',								cunit: 'g',						cname: 'Cloud ice (Total atmospheric column frozen water content of all clouds, excluding precipitation, Total column (ground to top of atmosphere))'},
	{id: 'cloudice_max',						type: 'state',	ctype: 'number',	crole: 'value.cloudice_max.forecast',							cunit: 'g',						cname: 'Maximum cloud ice (Total atmospheric column frozen water content of all clouds, excluding precipitation, Total column (ground to top of atmosphere))'},
	{id: 'cloudice_mean',						type: 'state',	ctype: 'number',	crole: 'value.cloudice_mean.forecast',							cunit: 'g',						cname: 'Mean cloud ice (Total atmospheric column frozen water content of all clouds, excluding precipitation, Total column (ground to top of atmosphere))'},
	{id: 'cloudice_min',						type: 'state',	ctype: 'number',	crole: 'value.cloudice_min.forecast',							cunit: 'g',						cname: 'Minimum cloud ice (Total atmospheric column frozen water content of all clouds, excluding precipitation, Total column (ground to top of atmosphere))'},

	{id: 'cloudwater',							type: 'state',	ctype: 'number',	crole: 'value.cloudwater.forecast',								cunit: 'g',						cname: 'Cloud water (Total atmospheric column liquid water content of all clouds, excluding precipitation, Total column (ground to top of atmosphere))'},
	{id: 'cloudwater_max',						type: 'state',	ctype: 'number',	crole: 'value.cloudwater_max.forecast',							cunit: 'g',						cname: 'Maximum cloud water (Total atmospheric column liquid water content of all clouds, excluding precipitation, Total column (ground to top of atmosphere))'},
	{id: 'cloudwater_mean',						type: 'state',	ctype: 'number',	crole: 'value.cloudwater_mean.forecast',						cunit: 'g',						cname: 'Mean cloud water (Total atmospheric column liquid water content of all clouds, excluding precipitation, Total column (ground to top of atmosphere))'},
	{id: 'cloudwater_min',						type: 'state',	ctype: 'number',	crole: 'value.cloudwater_min.forecast',							cunit: 'g',						cname: 'Minimum cloud water (Total atmospheric column liquid water content of all clouds, excluding precipitation, Total column (ground to top of atmosphere))'},

	{id: 'co',									type: 'state',	ctype: 'number',	crole: 'value.co.forecast',										cunit: 'ug/m3',					cname: 'Carbon monoxide conentration (2m above ground)'},

	{id: 'convective_precipitation',			type: 'state',	ctype: 'number',	crole: 'value.convective_precipitation.forecast',				cunit: 'precipitationamount',	cname: 'Convective precipitation (Water amount, caused by convection e.g. thunderstorms)'},

	{id: 'convectiveinhibition',				type: 'state',	ctype: 'number',	crole: 'value.convectiveinhibition.forecast',					cunit: 'm',						cname: 'Convective inhibition (Measure of the unlikelihood of thunderstorm development)'},
	{id: 'convectiveinhibition_max',			type: 'state',	ctype: 'number',	crole: 'value.convectiveinhibition_max.forecast',				cunit: 'm',						cname: 'Maximum convective inhibition (Measure of the unlikelihood of thunderstorm development)'},
	{id: 'convectiveinhibition_mean',			type: 'state',	ctype: 'number',	crole: 'value.convectiveinhibition_mean.forecast',				cunit: 'm',						cname: 'Mean convective inhibition (Measure of the unlikelihood of thunderstorm development)'},
	{id: 'convectiveinhibition_min',			type: 'state',	ctype: 'number',	crole: 'value.convectiveinhibition_min.forecast',				cunit: 'm',						cname: 'Minimum convective inhibition (Measure of the unlikelihood of thunderstorm development)'},

	{id: 'currentvelocity_u',					type: 'state',	ctype: 'number',	crole: 'value.currentvelocity_u.forecast',						cunit: 'm/s',					cname: 'Current velocity U (Velocity on longitude-axis)'},
	{id: 'currentvelocity_u_max',				type: 'state',	ctype: 'number',	crole: 'value.currentvelocity_u_max.forecast',					cunit: 'm/s',					cname: 'Maximum velocity U (Velocity on longitude-axis)'},
	{id: 'currentvelocity_u_mean',				type: 'state',	ctype: 'number',	crole: 'value.currentvelocity_u_mean.forecast',					cunit: 'm/s',					cname: 'Mean velocity U (Velocity on longitude-axis)'},
	{id: 'currentvelocity_u_min',				type: 'state',	ctype: 'number',	crole: 'value.currentvelocity_u_min.forecast',					cunit: 'm/s',					cname: 'Minimum velocity U (Velocity on longitude-axis)'},

	{id: 'currentvelocity_v',					type: 'state',	ctype: 'number',	crole: 'value.currentvelocity_v.forecast',						cunit: 'm/s',					cname: 'Current velocity V (Velocity on latitude-axis)'},
	{id: 'currentvelocity_v_max',				type: 'state',	ctype: 'number',	crole: 'value.currentvelocity_v_max.forecast',					cunit: 'm/s',					cname: 'Maximum velocity V (Velocity on latitude-axis)'},
	{id: 'currentvelocity_v_mean',				type: 'state',	ctype: 'number',	crole: 'value.currentvelocity_v_mean.forecast',					cunit: 'm/s',					cname: 'Mean velocity V (Velocity on latitude-axis)'},
	{id: 'currentvelocity_v_min',				type: 'state',	ctype: 'number',	crole: 'value.currentvelocity_v_min.forecast',					cunit: 'm/s',					cname: 'Minimum velocity V (Velocity on latitude-axis)'},

	{id: 'dewpointtemperature',					type: 'state',	ctype: 'number',	crole: 'value.dewpointtemperature.forecast',					cunit: 'tempunit',				cname: 'Dewpoint temperature (2m above ground)'},
	{id: 'dewpointtemperature_max',				type: 'state',	ctype: 'number',	crole: 'value.dewpointtemperature_max.forecast',				cunit: 'tempunit',				cname: 'Maximum dewpoint temperature (2m above ground)'},
	{id: 'dewpointtemperature_mean',			type: 'state',	ctype: 'number',	crole: 'value.dewpointtemperature_mean.forecast',				cunit: 'tempunit',				cname: 'Mean dewpoint temperature (2m above ground)'},
	{id: 'dewpointtemperature_min',				type: 'state',	ctype: 'number',	crole: 'value.dewpointtemperature_min.forecast',				cunit: 'tempunit',				cname: 'Minimum dewpoint temperature (2m above ground)'},

	{id: 'dif_backwards',						type: 'state',	ctype: 'number',	crole: 'value.dif_backwards.forecast',							cunit: 'W/m2',					cname: 'Diffuse radiation (backwards)'},
	{id: 'dif_instant',							type: 'state',	ctype: 'number',	crole: 'value.dif_instant.forecast',							cunit: 'W/m2',					cname: 'Diffuse radiation (instant)'},
	{id: 'dif_total',							type: 'state',	ctype: 'number',	crole: 'value.dif_total.forecast',								cunit: 'W/m2',					cname: 'Diffuse radiation (total)'},

	{id: 'dni_backwards',						type: 'state',	ctype: 'number',	crole: 'value.dni_backwards.forecast',							cunit: 'W/m2',					cname: 'Direct normalized irradiance (Radiation, backwards)'},
	{id: 'dni_instant',							type: 'state',	ctype: 'number',	crole: 'value.dni_instant.forecast',							cunit: 'W/m2',					cname: 'Direct normalized irradiance (Radiation, instant)'},
	{id: 'dni_total',							type: 'state',	ctype: 'number',	crole: 'value.dni_total.forecast',								cunit: 'W/m2',					cname: 'Direct normalized irradiance (Radiation, total)'},

	{id: 'dust_concentration',					type: 'state',	ctype: 'number',	crole: 'value.dust_concentration.forecast',						cunit: 'ug/m3',					cname: 'Dust concentration (2m above ground)'},
	{id: 'dust_concentration_max',				type: 'state',	ctype: 'number',	crole: 'value.dust_concentration_max.forecast',					cunit: 'ug/m3',					cname: 'Maximum dust concentration (2m above ground)'},
	{id: 'dust_concentration_mean',				type: 'state',	ctype: 'number',	crole: 'value.dust_concentration_mean.forecast',				cunit: 'ug/m3',					cname: 'Mean dust concentration (2m above ground)'},
	{id: 'dust_concentration_min',				type: 'state',	ctype: 'number',	crole: 'value.dust_concentration_min.forecast',					cunit: 'ug/m3',					cname: 'Minimum dust concentration (2m above ground)'},

	{id: 'evapotranspiration',					type: 'state',	ctype: 'number',	crole: 'value.evapotranspiration.forecast',						cunit: 'precipitationamount',	cname: 'Total evapotranspiration'},

	{id: 'extraterrestrialradiation_backwards',	type: 'state',	ctype: 'number',	crole: 'value.extraterrestrialradiation_backwards.forecast',									cname: 'Extraterrestrial solar radiation (backwards)'},
	{id: 'extraterrestrialradiation_instant',	type: 'state',	ctype: 'number',	crole: 'value.extraterrestrialradiation_instant.forecast',										cname: 'Extraterrestrial solar radiation (instant)'},
	{id: 'extraterrestrialradiation_total',		type: 'state',	ctype: 'number',	crole: 'value.extraterrestrialradiation_total.forecast',										cname: 'Extraterrestrial solar radiation (total)'},

	{id: 'felttemperature',						type: 'state',	ctype: 'number',	crole: 'value.temperature.feelslike.forecast',					cunit: 'tempunit',				cname: 'Felttemperature (2m above ground)'},
	{id: 'felttemperature_max',					type: 'state',	ctype: 'number',	crole: 'value.temperature.feelslike.max.forecast',				cunit: 'tempunit',				cname: 'Maximum felttemperature (2m above ground)'},
	{id: 'felttemperature_max_color',			type: 'state',	ctype: 'string',	crole: 'value.felttemperature_max_color.color.forecast',										cname: 'Web color maximum felttemperature'},
	{id: 'felttemperature_max_fontcolor',		type: 'state',	ctype: 'string',	crole: 'value.felttemperature_max_fontcolor.color.forecast',									cname: 'Web color maximum felttemperature, font'},
	{id: 'felttemperature_min',					type: 'state',	ctype: 'number',	crole: 'value.temperature.feelslike.min.forecast',				cunit: 'tempunit',				cname: 'Minimum felttemperature (2m above ground)'},
	{id: 'felttemperature_min_color',			type: 'state',	ctype: 'string',	crole: 'value.felttemperature_min_color.color.forecast',										cname: 'Web color minimum felttemperature'},
	{id: 'felttemperature_min_fontcolor',		type: 'state',	ctype: 'string',	crole: 'value.felttemperature_min_fontcolor.color.forecast',									cname: 'Web color minimum felttemperature, font'},

	{id: 'freezinglevelheight',					type: 'state',	ctype: 'number',	crole: 'value.freezinglevelheigh.forecast',						cunit: 'm',						cname: 'Freezing level height (Zero-degree isotherm in the free atmosphere, above sea level)'},
	{id: 'freezinglevelheight_max',				type: 'state',	ctype: 'number',	crole: 'value.freezinglevelheight_max.forecast',				cunit: 'm',						cname: 'Maximum freezing level height (Zero-degree isotherm in the free atmosphere, above sea level)'},
	{id: 'freezinglevelheight_mean',			type: 'state',	ctype: 'number',	crole: 'value.freezinglevelheight_mean.forecast',				cunit: 'm',						cname: 'Mean freezing level height (Zero-degree isotherm in the free atmosphere, above sea level)'},
	{id: 'freezinglevelheight_min',				type: 'state',	ctype: 'number',	crole: 'value.freezinglevelheight_min.forecast',				cunit: 'm',						cname: 'Minimum freezing level height (Zero-degree isotherm in the free atmosphere, above sea level)'},

	{id: 'ghi_backwards',						type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards.forecast',							cunit: 'W/m2',					cname: 'Global horizontal radiation (backwards)'},
	{id: 'ghi_backwards_consensus',				type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_consensus.forecast',				cunit: 'W/m2',					cname: 'Global horizontal radiation (backwards, consensus)'},
	{id: 'ghi_backwards_max',					type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_max.forecast',						cunit: 'W/m2',					cname: 'Maximum global horizontal radiation (backwards)'},
	{id: 'ghi_backwards_min',					type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_min.forecast',						cunit: 'W/m2',					cname: 'Minimum global horizontal radiation (backwards)'},

	{id: 'ghi_backwards_p10exceedence',			type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_p10exceedence.forecast',			cunit: 'W/m2',					cname: 'Global horizontal radiation (backwards, p10 exceedence)'},
	{id: 'ghi_backwards_p15exceedence',			type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_p15exceedence.forecast',			cunit: 'W/m2',					cname: 'Global horizontal radiation (backwards, p15 exceedence)'},
	{id: 'ghi_backwards_p20exceedence',			type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_p20exceedence.forecast',			cunit: 'W/m2',					cname: 'Global horizontal radiation (backwards, p20 exceedence)'},
	{id: 'ghi_backwards_p25exceedence',			type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_p25exceedence.forecast',			cunit: 'W/m2',					cname: 'Global horizontal radiation (backwards, p25 exceedence)'},
	{id: 'ghi_backwards_p30exceedence',			type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_p30exceedence.forecast',			cunit: 'W/m2',					cname: 'Global horizontal radiation (backwards, p30 exceedence)'},
	{id: 'ghi_backwards_p40exceedence',			type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_p40exceedence.forecast',			cunit: 'W/m2',					cname: 'Global horizontal radiation (backwards, p40 exceedence)'},
	{id: 'ghi_backwards_p50exceedence',			type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_p50exceedence.forecast',			cunit: 'W/m2',					cname: 'Global horizontal radiation (backwards, p50 exceedence)'},
	{id: 'ghi_backwards_p5exceedence',			type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_p5exceedence.forecast',				cunit: 'W/m2',					cname: 'Global horizontal radiation (backwards, p5 exceedence)'},
	{id: 'ghi_backwards_p60exceedence',			type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_p60exceedence.forecast',			cunit: 'W/m2',					cname: 'Global horizontal radiation (backwards, p60 exceedence)'},
	{id: 'ghi_backwards_p70exceedence',			type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_p70exceedence.forecast',			cunit: 'W/m2',					cname: 'Global horizontal radiation (backwards, p70 exceedence)'},
	{id: 'ghi_backwards_p75exceedence',			type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_p75exceedence.forecast',			cunit: 'W/m2',					cname: 'Global horizontal radiation (backwards, p75 exceedence)'},
	{id: 'ghi_backwards_p80exceedence',			type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_p80exceedence.forecast',			cunit: 'W/m2',					cname: 'Global horizontal radiation (backwards, p80 exceedence)'},
	{id: 'ghi_backwards_p85exceedence',			type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_p85exceedence.forecast',			cunit: 'W/m2',					cname: 'Global horizontal radiation (backwards, p85 exceedence)'},
	{id: 'ghi_backwards_p90exceedence',			type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_p90exceedence.forecast',			cunit: 'W/m2',					cname: 'Global horizontal radiation (backwards, p90 exceedence)'},
	{id: 'ghi_backwards_p95exceedence',			type: 'state',	ctype: 'number',	crole: 'value.ghi_backwards_p95exceedence.forecast',			cunit: 'W/m2',					cname: 'Global horizontal radiation (backwards, p95 exceedence)'},

	{id: 'ghi_instant',							type: 'state',	ctype: 'number',	crole: 'value.ghi_instant.forecast',							cunit: 'W/m2',					cname: 'Global horizontal radiation (instant)'},
	{id: 'ghi_total',							type: 'state',	ctype: 'number',	crole: 'value.ghi_total.forecast',								cunit: 'W/m2',					cname: 'Total global horizontal radiation'},

	{id: 'gni_backwards',						type: 'state',	ctype: 'number',	crole: 'value.gni_backwards.forecast',							cunit: 'W/m2',					cname: 'Global normalized irradiance (radiation, backwards)'},
	{id: 'gni_instant',							type: 'state',	ctype: 'number',	crole: 'value.gni_instant.forecast',							cunit: 'W/m2',					cname: 'Global normalized irradiance (radiation, instant)'},
	{id: 'gni_total',							type: 'state',	ctype: 'number',	crole: 'value.gni_total.forecast',								cunit: 'W/m2',					cname: 'Total global normalized irradiance'},

	{id: 'gti_backwards',						type: 'state',	ctype: 'number',	crole: 'value.gti_backwards.forecast',							cunit: '%',						cname: 'Global tilted irradiance (Radiaton, backwards)'},
	{id: 'gti_instant',							type: 'state',	ctype: 'number',	crole: 'value.gti_instant.forecast',							cunit: '%',						cname: 'Global tilted irradiance (Radiation, instant)'},
	{id: 'gti_total',							type: 'state',	ctype: 'number',	crole: 'value.gti_total.forecast',								cunit: '%',						cname: 'Total global tilted irradiance (Radiaton)'},

	{id: 'gust',								type: 'state',	ctype: 'number',	crole: 'value.gust.forecast',									cunit: 'windspeed',				cname: 'Wind gusts (10m above ground)'},
	{id: 'gust_max',							type: 'state',	ctype: 'number',	crole: 'value.gust_max.forecast',								cunit: 'windspeed',				cname: 'Maximum wind gusts (10m above ground)'},
	{id: 'gust_mean',							type: 'state',	ctype: 'number',	crole: 'value.gust_mean.forecast',								cunit: 'windspeed',				cname: 'Mean wind gusts (10m above ground)'},
	{id: 'gust_min',							type: 'state',	ctype: 'number',	crole: 'value.gust_min.forecast',								cunit: 'windspeed',				cname: 'Minimum wind gusts (10m above ground)'},

	{id: 'heightprofile_1000_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_1000_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 1000mb'},
	{id: 'heightprofile_200_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_200_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 200mb'},
	{id: 'heightprofile_250_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_250_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 250mb'},
	{id: 'heightprofile_300_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_300_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 300mb'},
	{id: 'heightprofile_350_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_350_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 350mb'},
	{id: 'heightprofile_400_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_400_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 400mb'},
	{id: 'heightprofile_450_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_450_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 450mb'},
	{id: 'heightprofile_500_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_500_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 500mb'},
	{id: 'heightprofile_550_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_550_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 550mb'},
	{id: 'heightprofile_600_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_600_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 600mb'},
	{id: 'heightprofile_650_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_650_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 650mb'},
	{id: 'heightprofile_700_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_700_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 700mb'},
	{id: 'heightprofile_750_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_750_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 750mb'},
	{id: 'heightprofile_800_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_800_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 800mb'},
	{id: 'heightprofile_850_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_850_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 850mb'},
	{id: 'heightprofile_875_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_875_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 875mb'},
	{id: 'heightprofile_900_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_900_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 900mb'},
	{id: 'heightprofile_925_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_925_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 925mb'},
	{id: 'heightprofile_950_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_950_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 950mb'},
	{id: 'heightprofile_975_mb',				type: 'state',	ctype: 'number',	crole: 'value.heightprofile_975_mb.forecast',					cunit: 'gpm',					cname: 'Geopotential height profile 975mb'},

	{id: 'helicity',							type: 'state',	ctype: 'number',	crole: 'value.helicity.forecast',								cunit: 'm2s-2',					cname: 'Helicity (Potential for helical flow)'},
	{id: 'helicity_max',						type: 'state',	ctype: 'number',	crole: 'value.helicity_max.forecast',							cunit: 'm2s-2',					cname: 'Maximum helicity (Potential for helical flow)'},
	{id: 'helicity_mean',						type: 'state',	ctype: 'number',	crole: 'value.helicity_mean.forecast',							cunit: 'm2s-2',					cname: 'Mean helicity (Potential for helical flow)'},
	{id: 'helicity_min',						type: 'state',	ctype: 'number',	crole: 'value.helicity_min.forecast',							cunit: 'm2s-2',					cname: 'Minimum helicity (Potential for helical flow)'},

	{id: 'highclouds',							type: 'state',	ctype: 'number',	crole: 'value.highclouds.forecast',								cunit: '%',						cname: 'High clouds (Cover of the sky)'},
	{id: 'highclouds_max',						type: 'state',	ctype: 'number',	crole: 'value.highclouds_max.forecast',							cunit: '%',						cname: 'Maximum high clouds (Cover of the sky)'},
	{id: 'highclouds_mean',						type: 'state',	ctype: 'number',	crole: 'value.highclouds_mean.forecast',						cunit: '%',						cname: 'Mean high clouds (Cover of the sky)'},
	{id: 'highclouds_min',						type: 'state',	ctype: 'number',	crole: 'value.highclouds_min.forecast',							cunit: '%',						cname: 'Minimum high clouds (Cover of the sky)'},

	{id: 'humiditygreater90_hours',				type: 'state',	ctype: 'number',	crole: 'value.humiditygreater90_hours.forecast',				cunit: 'h',						cname: 'Hours with humidity greater than 90%'},

	{id: 'iam_backwards',						type: 'state',	ctype: 'number',	crole: 'value.iam_backwards.forecast',							cunit: '%',						cname: 'Incidence angle modifier (backwards)'},
	{id: 'iam_instant',							type: 'state',	ctype: 'number',	crole: 'value.iam_instant.forecast',							cunit: '%',						cname: 'Incidence sngle modifier (instan)'},

	{id: 'isdaylight',							type: 'state',	ctype: 'number',	crole: 'value.isdaylight.forecast',																cname: 'Day or night',														cstates: {0: 'night', 1: 'day'}},
	{id: 'isobserveddata',						type: 'state',	ctype: 'number',	crole: 'value.isobserveddata.forecast.0',														cname: 'Observed data',														cstates: {0: 'no observation', 1: 'observation available'}},

	{id: 'leafwetness_dewindex',				type: 'state',	ctype: 'number',	crole: 'value.leafwetness_dewindex.forecast',													cname: 'Leaf wetness dew index (Index describing the contribution of dew to leaf wetness (0 = no contribution, 1 = maximal contribution))'},
	{id: 'leafwetness_evaporationindex',		type: 'state',	ctype: 'number',	crole: 'value.leafwetness_evaporationindex.forecast',											cname: 'Leaf wetness evaporation index (Index describing the contribution of evaporation to leaf wetness (0 = no contribution, 1 = maximal contribution))'},
	{id: 'leafwetness_probability',				type: 'state',	ctype: 'number',	crole: 'value.leafwetness_probability.forecast',				cunit: '%',						cname: 'Leaf wetness probability (Probability of leaf wetness (0% = low probability, 100% = high probability))'},
	{id: 'leafwetness_rainindex',				type: 'state',	ctype: 'number',	crole: 'value.leafwetness_rainindex.forecast',													cname: 'Leaf wetness rain index (Index describing the contribution of rain to leaf wetness (0 = no contribution, 1 = maximal contribution))'},
	{id: 'leafwetnessindex',					type: 'state',	ctype: 'number',	crole: 'value.leafwetnessindex.forecast',														cname: 'Mean dew on leaves'},

	{id: 'liftedindex',							type: 'state',	ctype: 'number',	crole: 'value.liftedindex.forecast',							cunit: 'J/kg',					cname: 'Lifted index (Risk of thunderstorms)'},
	{id: 'liftedindex_max',						type: 'state',	ctype: 'number',	crole: 'value.liftedindex_max.forecast',						cunit: 'J/kg',					cname: 'Maximum lifted index (Risk of thunderstorms)'},
	{id: 'liftedindex_mean',					type: 'state',	ctype: 'number',	crole: 'value.liftedindex_mean.forecast',						cunit: 'J/kg',					cname: 'Mean lifted index (Risk of thunderstorms)'},
	{id: 'liftedindex_min',						type: 'state',	ctype: 'number',	crole: 'value.liftedindex_min.forecast',						cunit: 'J/kg',					cname: 'Minimum lifted index (Risk of thunderstorms)'},

	{id: 'lowclouds',							type: 'state',	ctype: 'number',	crole: 'value.lowclouds.forecast',								cunit: '%',						cname: 'Low clouds (Cover of the sky)'},
	{id: 'lowclouds_max',						type: 'state',	ctype: 'number',	crole: 'value.lowclouds_max.forecast',							cunit: '%',						cname: 'Maximum low clouds (Cover of the sky)'},
	{id: 'lowclouds_mean',						type: 'state',	ctype: 'number',	crole: 'value.lowclouds_mean.forecast',							cunit: '%',						cname: 'Mean low clouds (Cover of the sky)'},
	{id: 'lowclouds_min',						type: 'state',	ctype: 'number',	crole: 'value.lowclouds_min.forecast',							cunit: '%',						cname: 'Minimum low clouds (Cover of the sky)'},

	{id: 'mean_wavedirection',					type: 'state',	ctype: 'number',	crole: 'value.mean_wavedirection.forecast',						cunit: '°',						cname: 'Mean wave direction (Average of all waves, direction to which the waves move)'},
	{id: 'mean_wavedirection_dominant',			type: 'state',	ctype: 'number',	crole: 'value.mean_wavedirection_dominant.forecast',			cunit: '°',						cname: 'Dominant mean wave direction (Average of all waves, direction to which the waves move, dominant)'},

	{id: 'mean_waveperiod',						type: 'state',	ctype: 'number',	crole: 'value.mean_waveperiod.forecast',						cunit: 's',						cname: 'Mean wave period (Average of all waves)'},
	{id: 'mean_waveperiod_max',					type: 'state',	ctype: 'number',	crole: 'value.mean_waveperiod_max.forecast',					cunit: 's',						cname: 'Maximum mean wave period (Average of all waves)'},
	{id: 'mean_waveperiod_mean',				type: 'state',	ctype: 'number',	crole: 'value.mean_waveperiod_mean.forecast',					cunit: 's',						cname: 'Mean wave period (Average of all waves)'},
	{id: 'mean_waveperiod_min',					type: 'state',	ctype: 'number',	crole: 'value.mean_waveperiod_min.forecast',					cunit: 's',						cname: 'Minimum mean wave period (Average of all waves)'},

	{id: 'midclouds',							type: 'state',	ctype: 'number',	crole: 'value.midclouds.forecast',								cunit: '%',						cname: 'Mid clouds (Cover of the sky)'},
	{id: 'midclouds_max',						type: 'state',	ctype: 'number',	crole: 'value.midclouds_max.forecast',							cunit: '%',						cname: 'Maximum mid clouds (Cover of the sky)'},
	{id: 'midclouds_mean',						type: 'state',	ctype: 'number',	crole: 'value.midclouds_mean.forecast',							cunit: '%',						cname: 'Mean mid clouds (Cover of the sky)'},
	{id: 'midclouds_min',						type: 'state',	ctype: 'number',	crole: 'value.midclouds_min.forecast',							cunit: '%',						cname: 'Minimum mid clouds (Cover of the sky)'},

	{id: 'moduletemperature_backwards',			type: 'state',	ctype: 'number',	crole: 'value.moduletemperature_backwards.forecast',			cunit: 'tempunit',				cname: 'Module temperature (backwards)'},
	{id: 'moduletemperature_instant',			type: 'state',	ctype: 'number',	crole: 'value.moduletemperature_instant.forecast',				cunit: 'tempunit',				cname: 'Module temperature (instant)'},
	{id: 'moduletemperature_mean',				type: 'state',	ctype: 'number',	crole: 'value.moduletemperature_mean.forecast',					cunit: 'tempunit',				cname: 'Mean module temperature'},

	{id: 'moonage',								type: 'state',	ctype: 'number',	crole: 'value.moonage.forecast',								cunit: 'd',						cname: 'Moon age'},
	{id: 'moonphaseangle',						type: 'state',	ctype: 'number',	crole: 'value.moonphaseangle.forecast',							cunit: '°',						cname: 'Moon phase angle'},
	{id: 'moonphasename',						type: 'state',	ctype: 'string',	crole: 'value.moonphasename.forecast',															cname: 'Moon phase name',													cstates: {'new':'new','waxing crescent':'waxing crescent','first quarter':'first quarter','waxing gibbous':'waxing gibbous','full':'full','waning gibbous':'waning gibbous','last quarter':'last quarter','waning crescent':'waning crescent'}},
	{id: 'moonphasetransittime',				type: 'state',	ctype: 'string',	crole: 'value.moonphasetransittime.forecast',													cname: 'Moon phase transit time'},
	{id: 'moonrise',							type: 'state',	ctype: 'string',	crole: 'value.moonrise.forecast',																cname: 'Moonrise time'},
	{id: 'moonset',								type: 'state',	ctype: 'string',	crole: 'value.moonset.forecast',																cname: 'Moonset time'},

	{id: 'no2',									type: 'state',	ctype: 'number',	crole: 'value.no2.forecast',									cunit: 'ug/m3',					cname: 'Nitrogen dioxide concentration (2m above ground)'},
	{id: 'ozone',								type: 'state',	ctype: 'number',	crole: 'value.ozone.forecast',									cunit: 'ug/m3',					cname: 'Ozone concentration (2m above ground)'},
	{id: 'ozone_max',							type: 'state',	ctype: 'number',	crole: 'value.ozone_max.forecast',								cunit: 'ug/m3',					cname: 'Maximum ozone concentration (2m above ground)'},
	{id: 'ozone_mean',							type: 'state',	ctype: 'number',	crole: 'value.ozone_mean.forecast',								cunit: 'ug/m3',					cname: 'Mean ozone concentration (2m above ground)'},
	{id: 'ozone_min',							type: 'state',	ctype: 'number',	crole: 'value.ozone_min.forecast',								cunit: 'ug/m3',					cname: 'Minimum ozone concentration (2m above ground)'},

	{id: 'performanceratio',					type: 'state',	ctype: 'number',	crole: 'value.performanceratio.forecast',						cunit: '%',						cname: 'Performance ratio'},

	{id: 'pictocode',							type: 'state',	ctype: 'number',	crole: 'weather.icon.forecast',																	cname: 'Classification of weather conditions, using a numeric number (1-17)'},
	{id: 'pictocode_detailed',					type: 'state',	ctype: 'number',	crole: 'weather.icon.forecast',																	cname: 'Classification of weather conditions, using a numeric number (1-35)'},

	{id: 'pm10',								type: 'state',	ctype: 'number',	crole: 'value.pm10.forecast',									cunit: 'ug/m3',					cname: 'PM10 concentration (2m above ground, particulate matter)'},
	{id: 'pm10_max',							type: 'state',	ctype: 'number',	crole: 'value.pm10_max.forecast',								cunit: 'ug/m3',					cname: 'Maximum PM10 concentration (2m above ground, particulate matter)'},
	{id: 'pm10_mean',							type: 'state',	ctype: 'number',	crole: 'value.pm10_mean.forecast',								cunit: 'ug/m3',					cname: 'Mean PM10 concentration (2m above ground, particulate matter)'},
	{id: 'pm10_min',							type: 'state',	ctype: 'number',	crole: 'value.pm10_min.forecast',								cunit: 'ug/m3',					cname: 'Minimum PM10 concentration (2m above ground, particulate matter)'},
	{id: 'pm25',								type: 'state',	ctype: 'number',	crole: 'value.pm25.forecast',									cunit: 'ug/m3',					cname: 'PM2.5 concentration (2m above ground, particulate matter)'},
	{id: 'pm25_max',							type: 'state',	ctype: 'number',	crole: 'value.pm25_max.forecast',								cunit: 'ug/m3',					cname: 'Maximum PM2.5 concentration (2m above ground, particulate matter)'},
	{id: 'pm25_mean',							type: 'state',	ctype: 'number',	crole: 'value.pm25_mean.forecast',								cunit: 'ug/m3',					cname: 'Mean PM2.5 concentration (2m above ground, particulate matter)'},
	{id: 'pm25_min',							type: 'state',	ctype: 'number',	crole: 'value.pm25_min.forecast',								cunit: 'ug/m3',					cname: 'Minimum PM2.5 concentration (2m above ground, particulate matter)'},

	{id: 'pollen_birch',						type: 'state',	ctype: 'number',	crole: 'value.pollen_birch.forecast',							cunit: 'ug/m3',					cname: 'Birch pollen (2m above ground, Europe only)'},
	{id: 'pollen_grass',						type: 'state',	ctype: 'number',	crole: 'value.pollen_grass.forecast',							cunit: 'ug/m3',					cname: 'Grass pollen (2m above ground, Europe only)'},
	{id: 'pollen_olive',						type: 'state',	ctype: 'number',	crole: 'value.pollen_olive.forecast',							cunit: 'ug/m3',					cname: 'Olive pollen (2m above ground, Europe only)'},

	{id: 'potentialevapotranspiration',			type: 'state',	ctype: 'number',	crole: 'value.potentialevapotranspiration.forecast',			cunit: 'mm',					cname: 'Potential evapotranspiration (Assuming unlimited water supply)'},

	{id: 'precipitation',						type: 'state',	ctype: 'number',	crole: 'value.precipitation.forecast',							cunit: 'precipitationamount',	cname: 'Precipation (Water amount)'},
	{id: 'precipitation_hours',					type: 'state',	ctype: 'number',	crole: 'value.precipitation_hours.forecast',					cunit: 'h',						cname: 'Precipation hours (Hours with precipitation)'},
	{id: 'precipitation_probability',			type: 'state',	ctype: 'number',	crole: 'value.precipitation_probability.forecast',				cunit: '%',						cname: 'Precipitation probability'},
	{id: 'precipitation_spread',				type: 'state',	ctype: 'number',	crole: 'value.precipitation_spread.forecast',					cunit: 'precipitationamount',	cname: 'Precipitation spread (Water amount, 1h from the mean precipitation)'},

	{id: 'predictability',						type: 'state',	ctype: 'number',	crole: 'value.predictability.forecast',							cunit: '%',						cname: 'Predictability (24h)'},
	{id: 'predictability_class',				type: 'state',	ctype: 'number',	crole: 'value.predictability_class.forecast',													cname: 'Predictability class (1 = very low, 5 = very high)'},
	{id: 'predictability_class_color',			type: 'state',	ctype: 'string',	crole: 'value.predictability_class_color.color.forecast',										cname: 'Web color predictability class'},

	{id: 'pvpower_backwards',					type: 'state',	ctype: 'number',	crole: 'value.pvpower_backwards.forecast',														cname: 'Photovoltaic power (backwards)'},
	{id: 'pvpower_instant',						type: 'state',	ctype: 'number',	crole: 'value.pvpower_instant.forecast',														cname: 'Photovoltaic power (instant)'},
	{id: 'pvpower_total',						type: 'state',	ctype: 'number',	crole: 'value.pvpower_total.forecast',															cname: 'Total photovoltaic power'},

	{id: 'rainspot',							type: 'state',	ctype: 'string',	crole: 'value',																					cname: 'Rainspot (0 ≤ 0.02 mm, 1 = 0.2 - 1.5 mm, 2 = 1.5 - 5 mm, 3 ≥ 5 mm, 9 = 0.02 - 0.2 mm)'},
	{id: 'rainspot_vis',						type: 'state',	ctype: 'string',	crole: 'html',																					cname: 'Rainspot for vis (html-widget binding)'},

	{id: 'referenceevapotranspiration_fao',		type: 'state',	ctype: 'number',	crole: 'value.referenceevapotranspiration_fao.forecast',		cunit: 'precipitationamount',	cname: 'Reference evapotranspiration (ET_0)'},

	{id: 'relativehumidity',					type: 'state',	ctype: 'number',	crole: 'value.relativehumidity.forecast',						cunit: '%',						cname: 'Relative humidity (Air humidity)'},
	{id: 'relativehumidity_max',				type: 'state',	ctype: 'number',	crole: 'value.relativehumidity_max.forecast',					cunit: '%',						cname: 'Maximum relative humidity (Air humidity)'},
	{id: 'relativehumidity_mean',				type: 'state',	ctype: 'number',	crole: 'value.relativehumidity_mean.forecast',					cunit: '%',						cname: 'Mean relative humidity (Air humidity)'},
	{id: 'relativehumidity_min',				type: 'state',	ctype: 'number',	crole: 'value.relativehumidity_min.forecast',					cunit: '%',						cname: 'Minimum relative humidity (Air humidity)'},

	{id: 'relativehumidityprofile_1000_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_1000_mb.forecast',		cunit: '%',						cname: 'Relative humidity profile 1000mb (Air humidity)'},
	{id: 'relativehumidityprofile_200_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_200_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 200mb (Air humidity)'},
	{id: 'relativehumidityprofile_250_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_250_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 250mb (Air humidity)'},
	{id: 'relativehumidityprofile_300_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_300_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 300mb (Air humidity)'},
	{id: 'relativehumidityprofile_350_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_350_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 350mb (Air humidity)'},
	{id: 'relativehumidityprofile_400_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_400_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 400mb (Air humidity)'},
	{id: 'relativehumidityprofile_450_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_450_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 450mb (Air humidity)'},
	{id: 'relativehumidityprofile_500_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_500_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 500mb (Air humidity)'},
	{id: 'relativehumidityprofile_550_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_550_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 550mb (Air humidity)'},
	{id: 'relativehumidityprofile_600_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_600_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 600mb (Air humidity)'},
	{id: 'relativehumidityprofile_650_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_650_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 650mb (Air humidity)'},
	{id: 'relativehumidityprofile_700_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_700_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 700mb (Air humidity)'},
	{id: 'relativehumidityprofile_750_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_750_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 750mb (Air humidity)'},
	{id: 'relativehumidityprofile_800_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_800_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 800mb (Air humidity)'},
	{id: 'relativehumidityprofile_850_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_850_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 850mb (Air humidity)'},
	{id: 'relativehumidityprofile_875_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_875_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 875mb (Air humidity)'},
	{id: 'relativehumidityprofile_900_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_900_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 900mb (Air humidity)'},
	{id: 'relativehumidityprofile_925_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_925_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 925mb (Air humidity)'},
	{id: 'relativehumidityprofile_950_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_950_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 950mb (Air humidity)'},
	{id: 'relativehumidityprofile_975_mb',		type: 'state',	ctype: 'number',	crole: 'value.relativehumidityprofile_975_mb.forecast',			cunit: '%',						cname: 'Relative humidity profile 975mb (Air humidity)'},

	{id: 'salinity',							type: 'state',	ctype: 'number',	crole: 'value.salinity.forecast',								cunit: 'PSA',					cname: 'Practical salinity unit'},
	{id: 'salinity_mean',						type: 'state',	ctype: 'number',	crole: 'value.salinity_mean.forecast',							cunit: 'PSA',					cname: 'Mean practical salinity unit'},

	{id: 'sand',								type: 'state',	ctype: 'number',	crole: 'value.sand.forecast',																	cname: 'Stability of the sand for moving vehicles',						cstates: {0: 'no trafficability', 1: 'good trafficiability'}},
	{id: 'sandstorm_alert',						type: 'state',	ctype: 'number',	crole: 'value.sandstorm_alert.forecast',														cname: 'Sandstorm alert (2m above ground)'},

	{id: 'sealevelpressure',					type: 'state',	ctype: 'number',	crole: 'value.sealevelpressure.forecast',						cunit: 'hPa',					cname: 'Sea level pressure (Adjusted to mean sea level)'},
	{id: 'sealevelpressure_max',				type: 'state',	ctype: 'number',	crole: 'value.sealevelpressure_max.forecast',					cunit: 'hPa',					cname: 'Maximum sea level pressure (Adjusted to mean sea level)'},
	{id: 'sealevelpressure_mean',				type: 'state',	ctype: 'number',	crole: 'value.sealevelpressure_mean.forecast',					cunit: 'hPa',					cname: 'Mean sea level pressure (Adjusted to mean sea level)'},
	{id: 'sealevelpressure_min',				type: 'state',	ctype: 'number',	crole: 'value.sealevelpressure_min.forecast',					cunit: 'hPa',					cname: 'Minimum sea level pressure (Adjusted to mean sea level)'},

	{id: 'seasurfacetemperature',				type: 'state',	ctype: 'number',	crole: 'value.seasurfacetemperature.forecast',					cunit: 'tempunit',				cname: 'Sea surface temperature (Average for (open) sea)'},
	{id: 'seasurfacetemperature_mean',			type: 'state',	ctype: 'number',	crole: 'value.seasurfacetemperature_mean.forecast',				cunit: 'tempunit',				cname: 'Mean sea surface temperature (Average for (open) sea)'},

	{id: 'sensibleheatflux',					type: 'state',	ctype: 'number',	crole: 'value.sensibleheatflux.forecast',						cunit: 'W/m2',					cname: 'Mean sensible heat flux (Mean energy flux of the surface energy balance which is used to heat(+) or cool(-) the air)'},

	{id: 'shortwaveradiation',					type: 'state',	ctype: 'number',	crole: 'value.shortwaveradiation.forecast',						cunit: 'W/m2',					cname: 'Shortwave ratiation (Global horizontal radiation)'},

	{id: 'significantwaveheight',				type: 'state',	ctype: 'number',	crole: 'value.significantwaveheight.forecast',					cunit: 'm',						cname: 'Significant wave height (Average of all waves, effective wave height)'},
	{id: 'significantwaveheight_max',			type: 'state',	ctype: 'number',	crole: 'value.significantwaveheight_max.forecast',				cunit: 'm',						cname: 'Maximum significant wave height (Average of all waves, effective wave height)'},
	{id: 'significantwaveheight_mean',			type: 'state',	ctype: 'number',	crole: 'value.significantwaveheight_mean.forecast',				cunit: 'm',						cname: 'Mean significant wave height (Average of all waves, effective wave height)'},
	{id: 'significantwaveheight_min',			type: 'state',	ctype: 'number',	crole: 'value.significantwaveheight_min.forecast',				cunit: 'm',						cname: 'Minimum significant wave height (Average of all waves, effective wave height)'},

	{id: 'silt',								type: 'state',	ctype: 'number',	crole: 'value.silt.forecast',																	cname: 'Stability of the silt for moving vehicles',						cstates: {0: 'no trafficability', 1: 'good trafficiability'}},
	{id: 'siltyloam',							type: 'state',	ctype: 'number',	crole: 'value.siltyloam.forecast',																cname: 'Stability of the siltiloam for moving vehicles',				cstates: {0: 'no trafficability', 1: 'good trafficiability'}},

	{id: 'skintemperature',						type: 'state',	ctype: 'number',	crole: 'value.skintemperature.forecast',						cunit: 'tempunit',				cname: 'Skin / Surface temperature (Soil surface or skin)'},
	{id: 'skintemperature_max',					type: 'state',	ctype: 'number',	crole: 'value.skintemperature_max.forecast',					cunit: 'tempunit',				cname: 'Maximum skin / surface temperature (Soil surface or skin)'},
	{id: 'skintemperature_mean',				type: 'state',	ctype: 'number',	crole: 'value.skintemperature_mean.forecast',					cunit: 'tempunit',				cname: 'Mean skin / surface temperature (Soil surface or skin)'},
	{id: 'skintemperature_min',					type: 'state',	ctype: 'number',	crole: 'value.skintemperature_min.forecast',					cunit: 'tempunit',				cname: 'Minimum skin / surface temperature (Soil surface or skin)'},

	{id: 'snowcover',							type: 'state',	ctype: 'number',	crole: 'value.snowcover.forecast',								cunit: 'cm',					cname: 'Snowcover (on the PV modules, considers incination)'},
	{id: 'snowcover_mean',						type: 'state',	ctype: 'number',	crole: 'value.snowcover_mean.forecast',							cunit: 'cm',					cname: 'Mean snowcover (on the PV modules, considers incination)'},

	{id: 'snowfraction',						type: 'state',	ctype: 'number',	crole: 'value.snowfraction.forecast',															cname: 'Snow fraction (information whether precipitation falls as rain or snow: 0 = rain, 1 = snow)'},

	{id: 'so2',									type: 'state',	ctype: 'number',	crole: 'value.so2.forecast',									cunit: 'ug/m3',					cname: 'Sulphur dioxide concentration (2m above ground)'},
	{id: 'so2_max',								type: 'state',	ctype: 'number',	crole: 'value.so2_max.forecast',								cunit: 'ug/m3',					cname: 'Maximum Sulphur dioxide concentration (2m above ground)'},
	{id: 'so2_mean',							type: 'state',	ctype: 'number',	crole: 'value.so2_mean.forecast',								cunit: 'ug/m3',					cname: 'Mean Sulphur dioxide concentration (2m above ground)'},
	{id: 'so2_min',								type: 'state',	ctype: 'number',	crole: 'value.so2_min.forecast',								cunit: 'ug/m3',					cname: 'Minimum Sulphur dioxide concentration (2m above ground)'},

	{id: 'soilmoisture_0to10cm',				type: 'state',	ctype: 'number',	crole: 'value.soilmoisture_0to10cm.forecast',					cunit: '%',						cname: 'Soil moisture (0 - 10cm)'},
	{id: 'soilmoisture_0to10cm_max',			type: 'state',	ctype: 'number',	crole: 'value.soilmoisture_0to10cm_max.forecast',				cunit: '%',						cname: 'Maximum soil moisture (0 - 10cm)'},
	{id: 'soilmoisture_0to10cm_mean',			type: 'state',	ctype: 'number',	crole: 'value.soilmoisture_0to10cm_mean.forecast',				cunit: '%',						cname: 'Mean soil moisture (0 - 10cm)'},
	{id: 'soilmoisture_0to10cm_min',			type: 'state',	ctype: 'number',	crole: 'value.soilmoisture_0to10cm_min.forecast',				cunit: '%',						cname: 'Minimum soil moisture (0 - 10cm)'},

	{id: 'soiltemperature_0to10cm',				type: 'state',	ctype: 'number',	crole: 'value.soiltemperature_0to10cm.forecast',				cunit: 'tempunit',				cname: 'Soil temperature (0 - 10cm)'},
	{id: 'soiltemperature_0to10cm_max',			type: 'state',	ctype: 'number',	crole: 'value.soiltemperature_0to10cm_max.forecast',			cunit: 'tempunit',				cname: 'Maximum soil temperature (0 - 10cm)'},
	{id: 'soiltemperature_0to10cm_mean',		type: 'state',	ctype: 'number',	crole: 'value.soiltemperature_0to10cm_mean.forecast',			cunit: 'tempunit',				cname: 'Mean soil temperature (0 - 10cm)'},
	{id: 'soiltemperature_0to10cm_min',			type: 'state',	ctype: 'number',	crole: 'value.soiltemperature_0to10cm_min.forecast',			cunit: 'tempunit',				cname: 'Minimum soil temperature (0 - 10cm)'},

	{id: 'sowing_barley',						type: 'state',	ctype: 'number',	crole: 'value.sowing_barley.forecast',															cname: 'Sowing barley',														cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_cotton',						type: 'state',	ctype: 'number',	crole: 'value.sowing_cotton.forecast',															cname: 'Sowing cotton',														cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_maize',						type: 'state',	ctype: 'number',	crole: 'value.sowing_maize.forecast',															cname: 'Sowing maize',														cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_potato',						type: 'state',	ctype: 'number',	crole: 'value.sowing_potato.forecast',															cname: 'Sowing potato',														cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_rapseed',						type: 'state',	ctype: 'number',	crole: 'value.sowing_rapseed.forecast',															cname: 'Sowing rapseed',													cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_riceindica',					type: 'state',	ctype: 'number',	crole: 'value.sowing_riceindica.forecast',														cname: 'Sowing riceindica',													cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_ricejaponi',					type: 'state',	ctype: 'number',	crole: 'value.sowing_ricejaponi.forecast',														cname: 'Sowing ricejaponi',													cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_sorghum',						type: 'state',	ctype: 'number',	crole: 'value.sowing_sorghum.forecast',															cname: 'Sowing sorghum',													cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_soybean',						type: 'state',	ctype: 'number',	crole: 'value.sowing_soybean.forecast',															cname: 'Sowing soybean',													cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_sugarbeets',					type: 'state',	ctype: 'number',	crole: 'value.sowing_sugarbeets.forecast',														cname: 'Sowing sugarbeets',													cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_wheat',						type: 'state',	ctype: 'number',	crole: 'value.sowing_wheat.forecast',															cname: 'Sowing wheat',														cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},

	{id: 'spraywindow',							type: 'state',	ctype: 'number',	crole: 'value.spraywindow.forecast',															cname: 'Spray window',														cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},

	{id: 'sunrise',								type: 'state',	ctype: 'string',	crole: 'value.sunrise.forecast',																cname: 'Sunrise time'},
	{id: 'sunset',								type: 'state',	ctype: 'string',	crole: 'value.sunset.forecast',																	cname: 'Sunset time'},
	{id: 'sunshine_time',						type: 'state',	ctype: 'number',	crole: 'value.sunshinetime.forecast',							cunit: 'min/h',					cname: 'Direct sunlight, depends also on day length'},
	{id: 'sunshinetime',						type: 'state',	ctype: 'number',	crole: 'value.sunshinetime.forecast',							cunit: 'min/h',					cname: 'Direct sunlight, depends also on day length'},

	{id: 'surfaceairpressure',					type: 'state',	ctype: 'number',	crole: 'value.surfaceairpressure.forecast',						cunit: 'hPa',					cname: 'Air pressure (at surface height, not converted to sea level)'},
	{id: 'surfaceairpressure_max',				type: 'state',	ctype: 'number',	crole: 'value.surfaceairpressure_max.forecast',					cunit: 'hPa',					cname: 'Maximum air pressure (at surface height, not converted to sea level)'},
	{id: 'surfaceairpressure_mean',				type: 'state',	ctype: 'number',	crole: 'value.surfaceairpressure_mean.forecast',				cunit: 'hPa',					cname: 'Mean air pressure (at surface height, not converted to sea level)'},
	{id: 'surfaceairpressure_min',				type: 'state',	ctype: 'number',	crole: 'value.surfaceairpressure_min.forecast',					cunit: 'hPa',					cname: 'Minimum air pressure (at surface height, not converted to sea level)'},

	{id: 'swell_meandirection',					type: 'state',	ctype: 'number',	crole: 'value.swell_meandirection.forecast',					cunit: '°',						cname: 'Mean direction of swell waves'},
	{id: 'swell_meandirection_dominant',		type: 'state',	ctype: 'number',	crole: 'value.swell_meandirection_dominant.forecast',			cunit: '°',						cname: 'Dominant mean wave direction'},
	{id: 'swell_meanperiod',					type: 'state',	ctype: 'number',	crole: 'value.swell_meanperiod.forecast',						cunit: 's',						cname: 'Mean period of swell waves'},
	{id: 'swell_meanperiod_max',				type: 'state',	ctype: 'number',	crole: 'value.swell_meanperiod_max.forecast',					cunit: 's',						cname: 'Maximum mean swell wave period'},
	{id: 'swell_meanperiod_mean',				type: 'state',	ctype: 'number',	crole: 'value.swell_meanperiod_mean.forecast',					cunit: 's',						cname: 'Mean mean swell wave period'},
	{id: 'swell_meanperiod_min',				type: 'state',	ctype: 'number',	crole: 'value.swell_meanperiod_min.forecast',					cunit: 's',						cname: 'Minimum mean swell wave period'},
	{id: 'swell_peakwaveperiod',				type: 'state',	ctype: 'number',	crole: 'value.swell_peakwaveperiod.forecast',					cunit: 's',						cname: 'Peak wave period of swell waves'},
	{id: 'swell_peakwaveperiod_max',			type: 'state',	ctype: 'number',	crole: 'value.swell_peakwaveperiod_max.forecast',				cunit: 's',						cname: 'Maximum peak swell wave period'},
	{id: 'swell_peakwaveperiod_mean',			type: 'state',	ctype: 'number',	crole: 'value.swell_peakwaveperiod_mean.forecast',				cunit: 's',						cname: 'Mean peak swell wave period'},
	{id: 'swell_peakwaveperiod_min',			type: 'state',	ctype: 'number',	crole: 'value.swell_peakwaveperiod_min.forecast',				cunit: 's',						cname: 'Minimum peak swell wave period'},
	{id: 'swell_significantheight',				type: 'state',	ctype: 'number',	crole: 'value.swell_significantheight.forecast',				cunit: 'm',						cname: 'Significant height of swell waves'},
	{id: 'swell_significantheight_max',			type: 'state',	ctype: 'number',	crole: 'value.swell_significantheight_max.forecast',			cunit: 'm',						cname: 'Maximum significant swell wave height'},
	{id: 'swell_significantheight_mean',		type: 'state',	ctype: 'number',	crole: 'value.swell_significantheight_mean.forecast',			cunit: 'm',						cname: 'Mean significant swell wave height'},
	{id: 'swell_significantheight_min',			type: 'state',	ctype: 'number',	crole: 'value.swell_significantheight_min.forecast',			cunit: 'm',						cname: 'Minimum significant swell wave height'},

	{id: 'temperature',							type: 'state',	ctype: 'number',	crole: 'value.temperature.forecast',							cunit: 'tempunit',				cname: 'Temperature (2m above ground)'},
	{id: 'temperature_max',						type: 'state',	ctype: 'number',	crole: 'value.temperature_max.forecast',						cunit: 'tempunit',				cname: 'Maximum temperature (2m above ground)'},
	{id: 'temperature_max_color',				type: 'state',	ctype: 'string',	crole: 'value.temperature_max_color.color.forecast',											cname: 'Web color maximum temperature'},
	{id: 'temperature_max_fontcolor',			type: 'state',	ctype: 'string',	crole: 'value.temperature_max_fontcolor.color.forecast',										cname: 'Web color maximum temperature, font'},
	{id: 'temperature_mean',					type: 'state',	ctype: 'number',	crole: 'value.temperature.mean.forecast',						cunit: 'tempunit',				cname: 'Mean temperature (2m above ground)'},
	{id: 'temperature_mean_color',				type: 'state',	ctype: 'string',	crole: 'value.temperature_mean_color.color.forecast',											cname: 'Web color mean temperature'},
	{id: 'temperature_mean_fontcolor',			type: 'state',	ctype: 'string',	crole: 'value.temperature_mean_fontcolor.color.forecast',										cname: 'Web color mean temperature, font'},
	{id: 'temperature_min',						type: 'state',	ctype: 'number',	crole: 'value.temperature.min.forecast',						cunit: 'tempunit',				cname: 'Minimum temperature (2m above ground)'},
	{id: 'temperature_min_color',				type: 'state',	ctype: 'string',	crole: 'value.temperature_min_color.color.forecast',											cname: 'Web color minimum temperature'},
	{id: 'temperature_min_fontcolor',			type: 'state',	ctype: 'string',	crole: 'value.temperature_min_fontcolor.color.forecast',										cname: 'Web color minimum temperature, font'},
	{id: 'temperature_spread',					type: 'state',	ctype: 'number',	crole: 'value.temperature_spread.forecast',						cunit: 'tempunit',				cname: 'Temperature spread (1h from the multimodel mean)'},

	{id: 'temperatureprofile_1000_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_1000_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 1000mb'},
	{id: 'temperatureprofile_200_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_200_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 200mb'},
	{id: 'temperatureprofile_250_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_250_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 250mb'},
	{id: 'temperatureprofile_300_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_300_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 300mb'},
	{id: 'temperatureprofile_350_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_350_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 350mb'},
	{id: 'temperatureprofile_400_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_400_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 400mb'},
	{id: 'temperatureprofile_450_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_450_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 450mb'},
	{id: 'temperatureprofile_500_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_500_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 500mb'},
	{id: 'temperatureprofile_550_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_550_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 550mb'},
	{id: 'temperatureprofile_600_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_600_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 600mb'},
	{id: 'temperatureprofile_650_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_650_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 650mb'},
	{id: 'temperatureprofile_700_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_700_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 700mb'},
	{id: 'temperatureprofile_750_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_750_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 750mb'},
	{id: 'temperatureprofile_800_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_800_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 800mb'},
	{id: 'temperatureprofile_850_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_850_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 850mb'},
	{id: 'temperatureprofile_875_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_875_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 875mb'},
	{id: 'temperatureprofile_900_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_900_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 900mb'},
	{id: 'temperatureprofile_925_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_925_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 925mb'},
	{id: 'temperatureprofile_950_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_950_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 950mb'},
	{id: 'temperatureprofile_975_mb',			type: 'state',	ctype: 'number',	crole: 'value.temperatureprofile_975_mb.forecast',				cunit: 'tempunit',				cname: 'Temperature profile 975mb'},

	{id: 'time',								type: 'state',	ctype: 'string',	crole: 'date.forecast',																			cname: 'Day and time of forecast'},

	{id: 'totalcloudcover',						type: 'state',	ctype: 'number',	crole: 'value.totalcloudcover.forecast',						cunit: '%',						cname: 'Total cloud cover (cover of the sky)'},
	{id: 'totalcloudcover_max',					type: 'state',	ctype: 'number',	crole: 'value.totalcloudcover_max.forecast',					cunit: '%',						cname: 'Maximum total cloud cover (cover of the sky)'},
	{id: 'totalcloudcover_mean',				type: 'state',	ctype: 'number',	crole: 'value.totalcloudcover_mean.forecast',					cunit: '%',						cname: 'Mean total cloud cover (cover of the sky)'},
	{id: 'totalcloudcover_min',					type: 'state',	ctype: 'number',	crole: 'value.totalcloudcover_min.forecast',					cunit: '%',						cname: 'Minimum total cloud cover (cover of the sky)'},
	{id: 'totalcloudcover_spread',				type: 'state',	ctype: 'number',	crole: 'value.totalcloudcover_spread.forecast',					cunit: '%',						cname: 'Total cloud cover spread (cover of the sky, 1h from the mean cloud cover)'},

	{id: 'uvindex',								type: 'state',	ctype: 'number',	crole: 'value.uv.forecast',																		cname: 'UV-index on ground level (0 ... 11+)'},
	{id: 'uvindex_color',						type: 'state',	ctype: 'string',	crole: 'value.uvindex_color.color.forecast',													cname: 'Web color UV index'},

	{id: 'visibility',							type: 'state',	ctype: 'number',	crole: 'value.visibility.forecast',								cunit: 'm',						cname: 'Visibility (distance)'},
	{id: 'visibility_max',						type: 'state',	ctype: 'number',	crole: 'value.visibility_max.forecast',							cunit: 'm',						cname: 'Maximum visibility (distance)'},
	{id: 'visibility_mean',						type: 'state',	ctype: 'number',	crole: 'value.visibility_mean.forecast',						cunit: 'm',						cname: 'Mean visibility (distance)'},
	{id: 'visibility_min',						type: 'state',	ctype: 'number',	crole: 'value.visibility_min.forecast',							cunit: 'm',						cname: 'Minimum visibility (distance)'},

	{id: 'wetbulbtemperature',					type: 'state',	ctype: 'number',	crole: 'value.wetbulbtemperature.forecast',						cunit: 'tempunit',				cname: 'Wetbulb temperature'},
	{id: 'wetbulbtemperature_max',				type: 'state',	ctype: 'number',	crole: 'value.wetbulbtemperature.forecast_max',					cunit: 'tempunit',				cname: 'Maximum wetbulb temperature'},
	{id: 'wetbulbtemperature_mean',				type: 'state',	ctype: 'number',	crole: 'value.wetbulbtemperature.forecast_mean',				cunit: 'tempunit',				cname: 'Mean wetbulb temperature'},
	{id: 'wetbulbtemperature_min',				type: 'state',	ctype: 'number',	crole: 'value.wetbulbtemperature.forecast_min',					cunit: 'tempunit',				cname: 'Minimum wetbulb temperature'},

	{id: 'winddirection',						type: 'state',	ctype: 'number',	crole: 'weather.direction.wind.forecast',						cunit: '°',						cname: 'Wind direction (10m above ground)'},
	{id: 'winddirectionChar2',					type: 'state',	ctype: 'string',	crole: 'weather.direction.wind.forecast',														cname: 'Wind direction (10m above ground, 2 char)'},
	{id: 'winddirectionChar3',					type: 'state',	ctype: 'string',	crole: 'weather.direction.wind.forecast',														cname: 'Wind direction (10m above ground, 3 char)'},
	{id: 'winddirection_80m',					type: 'state',	ctype: 'number',	crole: 'value.winddirection_80m.forecast',						cunit: '°',						cname: 'Wind direction (80m above ground)'},
	{id: 'winddirection_80mChar2',				type: 'state',	ctype: 'string',	crole: 'weather.direction.wind.forecast',														cname: 'Wind direction (80m above ground, 2 char)'},
	{id: 'winddirection_80mChar3',				type: 'state',	ctype: 'string',	crole: 'weather.direction.wind.forecast',														cname: 'Wind direction (80m above ground, 3 char)'},
	{id: 'winddirection_dominant',				type: 'state',	ctype: 'number',	crole: 'value.winddirection_dominant.forecast',					cunit: '°',						cname: 'Dominant wind direction'},

	{id: 'winddirectionprofile1000_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile1000_mb.forecast',			cunit: '°',						cname: 'Wind direction profile 1000mb'},
	{id: 'winddirectionprofile200_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile200_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 200mb'},
	{id: 'winddirectionprofile250_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile250_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 250mb'},
	{id: 'winddirectionprofile300_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile300_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 300mb'},
	{id: 'winddirectionprofile350_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile350_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 350mb'},
	{id: 'winddirectionprofile400_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile400_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 400mb'},
	{id: 'winddirectionprofile450_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile450_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 450mb'},
	{id: 'winddirectionprofile500_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile500_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 500mb'},
	{id: 'winddirectionprofile550_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile550_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 550mb'},
	{id: 'winddirectionprofile600_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile600_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 600mb'},
	{id: 'winddirectionprofile650_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile650_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 650mb'},
	{id: 'winddirectionprofile700_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile700_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 700mb'},
	{id: 'winddirectionprofile750_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile750_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 750mb'},
	{id: 'winddirectionprofile800_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile800_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 800mb'},
	{id: 'winddirectionprofile850_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile850_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 850mb'},
	{id: 'winddirectionprofile875_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile875_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 875mb'},
	{id: 'winddirectionprofile900_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile900_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 900mb'},
	{id: 'winddirectionprofile925_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile925_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 925mb'},
	{id: 'winddirectionprofile950_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile950_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 950mb'},
	{id: 'winddirectionprofile975_mb',			type: 'state',	ctype: 'number',	crole: 'value.winddirectionprofile975_mb.forecast',				cunit: '°',						cname: 'Wind direction profile 975mb'},

	{id: 'windpower',							type: 'state',	ctype: 'number',	crole: 'value.windpower.forecast',								cunit: 'kW',					cname: 'Wind power (80m above ground)'},

	{id: 'windspeed',							type: 'state',	ctype: 'number',	crole: 'value.windspeed.forecast',								cunit: 'windspeed',				cname: 'Wind speed (10m above ground)'},
	{id: 'windspeed_80m',						type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m.forecast',							cunit: 'windspeed',				cname: 'Wind speed (80m above ground)'},
	{id: 'windspeed_80m_consensus',				type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_consenus.forecast',					cunit: 'windspeed',				cname: 'Wind speed 80m consensus (80m above ground)'},
	{id: 'windspeed_80m_max',					type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_max.forecast',						cunit: 'windspeed',				cname: 'Maximum wind speed (80m above ground)'},
	{id: 'windspeed_80m_mean',					type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_mean.forecast',						cunit: 'windspeed',				cname: 'Mean wind speed (80m above ground)'},
	{id: 'windspeed_80m_min',					type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_min.forecast',						cunit: 'windspeed',				cname: 'Minimum wind speed (80m above ground)'},
	{id: 'windspeed_80m_p10exceedence',			type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_p10exceedence.forecast',			cunit: 'windspeed',				cname: 'Wind speed p10 exceedence (80m above ground)'},
	{id: 'windspeed_80m_p15exceedence',			type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_p15exceedence.forecast',			cunit: 'windspeed',				cname: 'Wind speed p15 exceedence (80m above ground)'},
	{id: 'windspeed_80m_p20exceedence',			type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_p20exceedence.forecast',			cunit: 'windspeed',				cname: 'Wind speed p20 exceedence (80m above ground)'},
	{id: 'windspeed_80m_p25exceedence',			type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_p25exceedence.forecast',			cunit: 'windspeed',				cname: 'Wind speed p25 exceedence (80m above ground)'},
	{id: 'windspeed_80m_p30exceedence',			type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_p30exceedence.forecast',			cunit: 'windspeed',				cname: 'Wind speed p30 exceedence (80m above ground)'},
	{id: 'windspeed_80m_p40exceedence',			type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_p40exceedence.forecast',			cunit: 'windspeed',				cname: 'Wind speed p40 exceedence (80m above ground)'},
	{id: 'windspeed_80m_p50exceedence',			type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_p50exceedence.forecast',			cunit: 'windspeed',				cname: 'Wind speed p50 exceedence (80m above ground)'},
	{id: 'windspeed_80m_p5exceedence',			type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_p5exceedence.forecast',				cunit: 'windspeed',				cname: 'Wind speed p5 exceedence (80m above ground)'},
	{id: 'windspeed_80m_p60exceedence',			type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_p60exceedence.forecast',			cunit: 'windspeed',				cname: 'Wind speed p60 exceedence (80m above ground)'},
	{id: 'windspeed_80m_p70exceedence',			type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_p70exceedence.forecast',			cunit: 'windspeed',				cname: 'Wind speed p70 exceedence (80m above ground)'},
	{id: 'windspeed_80m_p75exceedence',			type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_p75exceedence.forecast',			cunit: 'windspeed',				cname: 'Wind speed p75 exceedence (80m above ground)'},
	{id: 'windspeed_80m_p80exceedence',			type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_p80exceedence.forecast',			cunit: 'windspeed',				cname: 'Wind speed p80 exceedence (80m above ground)'},
	{id: 'windspeed_80m_p85exceedence',			type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_p85exceedence.forecast',			cunit: 'windspeed',				cname: 'Wind speed p85 exceedence (80m above ground)'},
	{id: 'windspeed_80m_p90exceedence',			type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_p90exceedence.forecast',			cunit: 'windspeed',				cname: 'Wind speed p90 exceedence (80m above ground)'},
	{id: 'windspeed_80m_p95exceedence',			type: 'state',	ctype: 'number',	crole: 'value.windspeed_80m_p95exceedence.forecast',			cunit: 'windspeed',				cname: 'Wind speed p95 exceedence (80m above ground)'},

	{id: 'windspeed_max',						type: 'state',	ctype: 'number',	crole: 'value.windspeed_max.forecast',							cunit: 'windspeed',				cname: 'Maximum wind speed (10m above ground)'},
	{id: 'windspeed_max_color',					type: 'state',	ctype: 'string',	crole: 'value.windspeed_max_color.color.forecast',												cname: 'Web color maximum windspeed'},
	{id: 'windspeed_mean',						type: 'state',	ctype: 'number',	crole: 'value.windspeed_mean.forecast',							cunit: 'windspeed',				cname: 'Mean wind speed (10m above ground)'},
	{id: 'windspeed_mean_color',				type: 'state',	ctype: 'string',	crole: 'value.windspeed_mean_color.color.forecast',												cname: 'Web color mean windspeed'},
	{id: 'windspeed_min',						type: 'state',	ctype: 'number',	crole: 'value.speed.wind.min.forecast',							cunit: 'windspeed',				cname: 'Minimum windspeed (10m above ground)'},
	{id: 'windspeed_min_color',					type: 'state',	ctype: 'string',	crole: 'value.windspeed_min_color.color.forecast',												cname: 'Web color minimum windspeed'},
	{id: 'windspeed_spread',					type: 'state',	ctype: 'number',	crole: 'value.windspeed_spread.forecast',						cunit: 'windspeed',				cname: 'Wind speed spread (10m above ground, 1h from the mean wind speed)'},

	{id: 'windspeedprofile_1000_mb',			type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_1000_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 1000mb'},
	{id: 'windspeedprofile_200_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_200_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 200mb'},
	{id: 'windspeedprofile_250_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_250_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 250mb'},
	{id: 'windspeedprofile_300_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_300_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 300mb'},
	{id: 'windspeedprofile_350_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_350_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 350mb'},
	{id: 'windspeedprofile_400_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_400_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 400mb'},
	{id: 'windspeedprofile_450_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_450_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 450mb'},
	{id: 'windspeedprofile_500_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_500_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 500mb'},
	{id: 'windspeedprofile_550_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_550_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 550mb'},
	{id: 'windspeedprofile_600_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_600_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 600mb'},
	{id: 'windspeedprofile_650_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_650_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 650mb'},
	{id: 'windspeedprofile_700_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_700_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 700mb'},
	{id: 'windspeedprofile_750_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_750_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 750mb'},
	{id: 'windspeedprofile_800_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_800_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 800mb'},
	{id: 'windspeedprofile_850_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_850_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 850mb'},
	{id: 'windspeedprofile_875_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_675_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 675mb'},
	{id: 'windspeedprofile_900_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_900_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 900mb'},
	{id: 'windspeedprofile_925_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_925_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 925mb'},
	{id: 'windspeedprofile_950_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_950_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 950mb'},
	{id: 'windspeedprofile_975_mb',				type: 'state',	ctype: 'number',	crole: 'value.windspeedprofile_975_mb.forecast',				cunit: 'windspeed',				cname: 'Wind speed profile 975mb'},

	{id: 'windwave_direction',					type: 'state',	ctype: 'number',	crole: 'value.windwave_direction.forecast',						cunit: '°',						cname: 'Wind wave direction (Average for open sea, direction to which the waves move)'},
	{id: 'windwave_direction_dominant',			type: 'state',	ctype: 'number',	crole: 'value.windwave_direction_dominant.forecast',			cunit: '°',						cname: 'Dominant wind wave direction'},
	{id: 'windwave_height',						type: 'state',	ctype: 'number',	crole: 'value.windwave_height.forecast',						cunit: 'm',						cname: 'Wind wave height (highest 3 of wind waves)'},
	{id: 'windwave_height_max',					type: 'state',	ctype: 'number',	crole: 'value.windwave_height_max.forecast',					cunit: 'm',						cname: 'Maximum wind wave height (highest 3 of wind waves)'},
	{id: 'windwave_height_mean',				type: 'state',	ctype: 'number',	crole: 'value.windwave_height_mean.forecast',					cunit: 'm',						cname: 'Mean wind wave height (highest 3 of wind waves)'},
	{id: 'windwave_height_min',					type: 'state',	ctype: 'number',	crole: 'value.windwave_height_min.forecast',					cunit: 'm',						cname: 'Minimum wind wave height (highest 3 of wind waves)'},

	{id: 'windwave_meanperiod',					type: 'state',	ctype: 'number',	crole: 'value.windwave_meanperiod.forecast',													cname: 'Mean wind wave period (majority of waves)'},
	{id: 'windwave_meanperiod_max',				type: 'state',	ctype: 'number',	crole: 'value.windwave_meanperiod_max.forecast',				cunit: 's',						cname: 'Maximum mean wind wave period (majority of waves)'},
	{id: 'windwave_meanperiod_mean',			type: 'state',	ctype: 'number',	crole: 'value.windwave_meanperiod_mean.forecast',				cunit: 's',						cname: 'Mean mean wind wave period (majority of waves)'},
	{id: 'windwave_meanperiod_min',				type: 'state',	ctype: 'number',	crole: 'value.windwave_meanperiod_min.forecast',				cunit: 's',						cname: 'Minimum mean wind wave period (majority of waves)'},

	{id: 'windwave_peakwaveperiod',				type: 'state',	ctype: 'number',	crole: 'value.windwave_peakwaveperiod.forecast',				cunit: 's',						cname: 'Peak wave period of wind waves'},
	{id: 'windwave_peakwaveperiod_max',			type: 'state',	ctype: 'number',	crole: 'value.windwave_peakwaveperiod_max.forecast',			cunit: 's',						cname: 'Maximum peak wave period'},
	{id: 'windwave_peakwaveperiod_mean',		type: 'state',	ctype: 'number',	crole: 'value.windwave_peakwaveperiod_mean.forecast',			cunit: 's',						cname: 'Mean peak wave period'},
	{id: 'windwave_peakwaveperiod_min',			type: 'state',	ctype: 'number',	crole: 'value.windwave_peakwaveperiod_min.forecast',			cunit: 's',						cname: 'Minimum pewk wave period'},

	{id: 'zenithangle',							type: 'state',	ctype: 'number',	crole: 'value.zenithangle.forecast.0',							cunit: '°',						cname: 'Angle between zenith and centre of the suns disc'}
];

// missing packages:
// multimodel-temperature (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#multimodel-temperature)
// multimodel-precipitation (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#multimodel-precipitation)
// multimodel-relative-humidity (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#multimodel-relative-humidity)
// multimodel-wind (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#multimodel-wind)
// multimodel-wind-80m (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#multimodel-wind-80m)
// multimodel-clouds (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#multimodel-clouds)
// multimodel-radiation (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#multimodel-radiation)
// trendpro (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#trend-pro)
// seasonal-anomalies-forecast (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#seasonal-anomalies-forecast)

module.exports = {
	manual_mode,
	packages_master,
	compassDirection,
	channel_0_master,
	channel_1_master,
	metadata_master,
	units_master,
	values_master
};
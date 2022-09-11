'use strict';

const compassDirection = ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

// https://github.com/ioBroker/ioBroker/blob/master/doc/STATE_ROLES.md#state-roles
const manual_mode = [
	{id: 'ACTION', 						type: 'channel_0',																							cname: 'ACTION'},
	{id: 'REQUEST_DATA',				type: 'state',		ctype: 'boolean',	crole: 'button',													cname: 'Request data from meteoblue',											cwrite: true}
];

const metadata = [
	{id: 'metadata',					type: 'channel_0',																							cname: 'metadata'},
	{id: 'height',						type: 'state',		ctype: 'number',	crole: 'value.gps.elevation',						cunit: 'm',		cname: 'Elevation in meters above sea level'},
	{id: 'latitude',					type: 'state',		ctype: 'number',	crole: 'value.gps.latitude',						cunit: '°N',	cname: 'Latitude coordinate in WGS-84'},
	{id: 'longitude',					type: 'state',		ctype: 'number',	crole: 'value.gps.longitude',						cunit: '°E',	cname: 'Longitude coordinate in WGS-84'},
	{id: 'modelrun_updatetime_utc',		type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Displays the time at which the last meteoblue model run has been completed'},
	{id: 'modelrun_utc',				type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Initialisation time of the meteoblue model run which delivers the raw meteoblue model data to the forecast API packages'},
	{id: 'name',						type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Location name'},
	{id: 'timezone_abbrevation',		type: 'state',		ctype: 'string',	crole: 'value', 													cname: 'Time zone'},
	{id: 'utc_timeoffset',				type: 'state',		ctype: 'number',	crole: 'value',										cunit: 'h', 	cname: 'UTC offset (±hh:mm)'}
];

// forecast packages: always needed
const units0 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Time format'}
];
// forecast packages: basic-15min, basic-1h, basic-3h, basic-day, current, agro-1h, agro-3h, agro-day, sea-1h, trend-1h, trend-day, ensemble-1h
const units00 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'temperature',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of temperature'}
];
// forecast packages: basic-15min, basic-1h, basic-3h, basic-day, current, wind-15min, wind-1h, wind-3h, wind-day, wind80ensemble-1h, trend-1h, trend-day, ensemble-1h
const units1 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'windspeed',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of windspeed'}
];
// forecast packages: basic-15min, basic-1h, basic-3h, basic-day
const units2 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'pressure',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of pressure'}
];
// forecast packages: basic-15min, basic-1h, basic-3h, basic-day, wind-15min, wind-1h, wind-3h, wind-day, sea-1h, trend-1h, trend-day, ensemble-1h
const units21 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'winddirection',				type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of winddirection'}
];
// forecast packages: basic-15min, basic-1h, basic-3h, basic-day, air-1h, air-3h, air-day, airquality-1h, airquality-3h, airquality-day
const units22 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'co',							type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of CO'}
];
// forecast packages: basic-15min, basic-1h, basic-3h, basic-day, trend-1h, trend-day, ensemble-1h
const units23 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'precipitation',				type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of precipitation'}
];
// forecast packages: basic-15min, basic-1h, basic-3h, basic-day, trend-1h, trend-day
const units24 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'pressure',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of pressure'},
	{id: 'relativehumidity',			type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of relative humidity'},
	{id: 'predictability',				type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of predictability'},
	{id: 'precipitation_probability',	type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of precipitation probability'}
];
// forecast packages: clouds-1h, clouds-3h, clouds-day
const units3 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'sunshinetime',				type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of sunshinetime'},
	{id: 'visibility',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of visibility'}
];
// forecast packages: clouds-1h, clouds-3h, clouds-day, trend-1h, trend-day, ensemble-1h
const units31 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'cloudcover',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of cloudcover'}
];
// forecast package: agro-1h, agro-3h, agro-day
const units4 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'leafwetness',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of leaf wetness'},
	{id: 'soilmoisture',				type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of soil moisture'},
	{id: 'sensibleheatflux',			type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of sensible heat flux'},
	{id: 'transpiration',				type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of transpiration'}
];
// forecast package: solar-15min, solar-1h, solar-3h, solar-day, solarensemble-1h, trend-1h, trend-day, ensemble-1h
const units5 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'radiation',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of radiation'}
];
// forecast package: solar-15min, solar-1h, solar-3h, solar-day
const units6 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'dif_total',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of diffuse radiation'},
	{id: 'dni_total',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of direct normalized irradiance (Radiation)'},
	{id: 'gni_total',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of global normalized irradiance (Radiation)'}
];
// forecast package: solar-15min, solar-1h, solar-3h, solar-day, trend-1h, trend-day
const units61 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'ghi_total',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of global horizontal radiation'},
	{id: 'extraterrestrialradiation_total',	type: 'state',	ctype: 'string',	crole: 'value',														cname: 'Unit of extraterrestrial solar radiation'}
];
// forecast package: wind-15min, wind-1h, wind-3h, wind-day
const units7 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'density',						type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of wind density'},
	{id: 'surfaceairpressure',			type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of surfaceairpressure'}
];
// forecast package: sea-1h, sea-3h, sea-day
const units8 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'wave_height',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of wave height'},
	{id: 'wave_period',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of wave period'},
	{id: 'currentvelocity',				type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of current velocity'},
	{id: 'salinity',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of salinity'},
	{id: 'wave_direction',				type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of wave direction'}
];
// forecast package: air-1h, air-3h, air-day
const units9 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'cape',						type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of cape'},
	{id: 'convectiveinhibition',		type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of convectiveinhibition'},
	{id: 'helicity',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of helicity'},
	{id: 'boundarylayerheight',			type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of boundarylayerheight'},
	{id: 'cloudwater',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of cloudwater'},
	{id: 'cloudice',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of cloudice'},
	{id: 'freezinglevelheight',			type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of freezinglevelheight'}
];
// forecast package: airquality-1h, airquality-3h, airquality-day
const units10 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'ozone',						type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of ozone'},
	{id: 'dust_concentration',			type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of dust concentration'},
	{id: 'pm25',						type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of PM2.5'},
	{id: 'pm10',						type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of PM10 '},
	{id: 'so2',							type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of sulphur dioxide'},
	{id: 'no2',							type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of nitrogen dioxide'},
	{id: 'pollen_birch',				type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of birch pollen'},
	{id: 'pollen_grass',				type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of grass pollen'},
	{id: 'pollen_olive',				type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of olive pollen'},
	{id: 'aod550',						type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of aerosol optical depth'},
	{id: 'airqualityindex',				type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of airquality index'}
];

// template
// {id: '',			type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of '}

// forecast package: basic-15min (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#list-of-all-variables-in-the-basic-package)
const basic_15min = [
	{id: 'data_xmin',					type: 'channel_0',																							cname: 'data 15min'},
	{id: ['0000', '0015', '0030', '0045', '0100', '0115', '0130', '0145', '0200', '0215', '0230', '0245', '0300', '0315', '0330', '0345', '0400', '0415', '0430', '0445', '0500', '0515', '0530', '0545', '0600', '0615', '0630', '0645', '0700', '0715', '0730', '0745', '0800', '0815', '0830', '0845', '0900', '0915', '0930', '0945', '1000', '1015', '1030', '1045', '1100', '1115', '1130', '1145', '1200', '1215', '1230', '1245', '1300', '1315', '1330', '1345', '1400', '1415', '1430', '1445', '1500', '1515', '1530', '1545', '1600', '1615', '1630', '1645', '1700', '1715', '1730', '1745', '1800', '1815', '1830', '1845', '1900', '1915', '1930', '1945', '2000', '2015', '2030', '2045', '2100', '2115', '2130', '2145', '2200', '2215', '2230', '2245', '2300', '2315', '2330', '2345'], type: 'channel_1'},
	{id: 'felttemperature',				type: 'state',		ctype: 'number',	crole: 'value.temperature.feelslike.forecast',		cunit: '°',		cname: 'Felttemperature, 2m above ground'},
	{id: 'relativehumidity',			type: 'state',		ctype: 'number',	crole: 'value.humidity.forecast', 					cunit: '%',		cname: 'Relative air humidity'},
	{id: 'sealevelpressure',			type: 'state',		ctype: 'number',	crole: 'value.pressure.forecast',					cunit: 'hPa',	cname: 'Sea level pressure, adjusted to mean sea level'},
	{id: 'temperature', 				type: 'state',		ctype: 'number',	crole: 'value.temperature.forecast',				cunit: '°',		cname: 'Temperature, 2m above ground'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'},
	{id: 'winddirectionChar2',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction 10m above ground, 2 char'},
	{id: 'winddirectionChar3',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction 10m above ground, 3 char'},
	{id: 'winddirection',				type: 'state',		ctype: 'number',	crole: 'weather.direction.wind.forecast',			cunit: '°',		cname: 'Wind direction 10m above ground, degree'},
	{id: 'windspeed',					type: 'state',		ctype: 'number',	crole: 'value.speed.wind.forecast',									cname: 'Windspeed, 10m above ground'}
];
// forecast package: basic-1h
const basic_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'convective_precipitation',	type: 'state',		ctype: 'number',	crole: 'value.convective_precipitation.forecast',					cname: 'Water amount, caused by convection e.g. thunderstorms'},
	{id: 'felttemperature',				type: 'state',		ctype: 'number',	crole: 'value.temperature.feelslike.forecast',		cunit: '°',		cname: 'Felttemperature, 2m above ground'},
	{id: 'isdaylight',					type: 'state',		ctype: 'number',	crole: 'value.isdaylight.forecast',									cname: 'Day or night',																cstates: {0: 'night', 1: 'day'},},
	{id: 'pictocode',					type: 'state',		ctype: 'number',	crole: 'weather.icon.forecast',										cname: 'Classification of weather conditions, using a numeric number (1-35)'},
	{id: 'precipitation',				type: 'state',		ctype: 'number',	crole: 'value.precipitation.forecast',								cname: 'Precipitation'},
	{id: 'precipitation_probability',	type: 'state',		ctype: 'number',	crole: 'value.precipitation_probability.forecast',	cunit: '%',		cname: 'Precipitation Probability'},
	{id: 'rainspot',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Rainspot (0 ≤ 0.02 mm, 1 = 0.2 - 1.5 mm, 2 = 1.5 - 5 mm, 3 ≥ 5 mm, 9 = 0.02 - 0.2 mm)'},
	{id: 'rainspot_vis',				type: 'state',		ctype: 'string',	crole: 'html',														cname: 'Rainspot for vis (html-widget binding)'},
	{id: 'relativehumidity',			type: 'state',		ctype: 'number',	crole: 'value.humidity.forecast', 					cunit: '%',		cname: 'Relative air humidity'},
	{id: 'sealevelpressure',			type: 'state',		ctype: 'number',	crole: 'value.pressure.forecast',					cunit: 'hPa',	cname: 'Sea level pressure, adjusted to mean sea level'},
	{id: 'snowfraction',				type: 'state',		ctype: 'number',	crole: 'value.snowfraction.forecast',								cname: 'Snow fraction, information whether precipitation falls as rain or snow',	cstates: {0: 'rain', 1: 'snow'}},
	{id: 'temperature', 				type: 'state',		ctype: 'number',	crole: 'value.temperature.forecast',				cunit: '°',		cname: 'Temperature, 2m above ground'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'},
	{id: 'uvindex',						type: 'state',		ctype: 'number',	crole: 'value.uv.forecast',											cname: 'UV-index on ground level (0 ... 11+)'},
	{id: 'winddirectionChar2',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction 10m above ground, 2 char'},
	{id: 'winddirectionChar3',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction 10m above ground, 3 char'},
	{id: 'winddirection',				type: 'state',		ctype: 'number',	crole: 'weather.direction.wind.forecast',			cunit: '°',		cname: 'Wind direction 10m above ground, degree'},
	{id: 'windspeed',					type: 'state',		ctype: 'number',	crole: 'value.speed.wind.forecast',									cname: 'Windspeed, 10m above ground'}
];
// forecast package: basic-3h
const basic_3h = [
	{id: 'data_3h',						type: 'channel_0',																							cname: 'data 3h'},
	{id: ['0000', '0300', '0600', '0900', '1200', '1500', '1800', '2100'], 																																								type: 'channel_1'},
	{id: 'convective_precipitation',	type: 'state',		ctype: 'number',	crole: 'value.convective_precipitation.forecast',					cname: 'Water amount, caused by convection e.g. thunderstorms',	},
	{id: 'felttemperature',				type: 'state',		ctype: 'number',	crole: 'value.temperature.feelslike.forecast',		cunit: '°',		cname: 'Felttemperature, 2m above ground'},
	{id: 'isdaylight',					type: 'state',		ctype: 'number',	crole: 'value.isdaylight.forecast',									cname: 'Day or night',																cstates: {0: 'night', 1: 'day'}},
	{id: 'pictocode',					type: 'state',		ctype: 'number',	crole: 'weather.icon.forecast',										cname: 'Classification of weather conditions, using a numeric number (1-35)'},
	{id: 'precipitation',				type: 'state',		ctype: 'number',	crole: 'value.precipitation.forecast',								cname: 'Precipitation'},
	{id: 'precipitation_probability',	type: 'state',		ctype: 'number',	crole: 'value.precipitation_probability.forecast',	cunit: '%',		cname: 'Precipitation Probability'},
	{id: 'rainspot',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Rainspot (0 ≤ 0.02 mm, 1 = 0.2 - 1.5 mm, 2 = 1.5 - 5 mm, 3 ≥ 5 mm, 9 = 0.02 - 0.2 mm)'},
	{id: 'rainspot_vis',				type: 'state',		ctype: 'string',	crole: 'html',														cname: 'Rainspot for vis (html-widget binding)'},
	{id: 'relativehumidity',			type: 'state',		ctype: 'number',	crole: 'value.humidity.forecast', 					cunit: '%',		cname: 'Relative air humidity'},
	{id: 'sealevelpressure',			type: 'state',		ctype: 'number',	crole: 'value.pressure.forecast',					cunit: 'hPa',	cname: 'Sea level pressure, adjusted to mean sea level'},
	{id: 'snowfraction',				type: 'state',		ctype: 'number',	crole: 'value.snowfraction.forecast',								cname: 'Snow fraction, information whether precipitation falls as rain or snow',	cstates: {0: 'rain', 1: 'snow'}},
	{id: 'temperature', 				type: 'state',		ctype: 'number',	crole: 'value.temperature.forecast',				cunit: '°',		cname: 'Temperature, 2m above ground'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'},
	{id: 'uvindex',						type: 'state',		ctype: 'number',	crole: 'value.uv.forecast',											cname: 'UV-index on ground level (0 ... 11+)'},
	{id: 'winddirectionChar2',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction 10m above ground, 2 char'},
	{id: 'winddirectionChar3',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction 10m above ground, 3 char'},
	{id: 'winddirection',				type: 'state',		ctype: 'number',	crole: 'weather.direction.wind.forecast',			cunit: '°',		cname: 'Wind direction 10m above ground, degree'},
	{id: 'windspeed',					type: 'state',		ctype: 'number',	crole: 'value.speed.wind.forecast',									cname: 'Windspeed, 10m above ground'}
];
// forecast package: basic-day
const basic_day = [
	{id: 'data_day',					type: 'channel_0',																							cname: 'data day'},
	{id: ['0d', '1d', '2d', '3d', '4d', '5d', '6d'],																																													type: 'channel_1'},
	{id: 'convective_precipitation',	type: 'state',		ctype: 'number',	crole: 'value.convective_precipitation.forecast',					cname: 'Water amount, caused by convection e.g. thunderstorms'},
	{id: 'felttemperature_max',			type: 'state',		ctype: 'number',	crole: 'value.temperature.feelslike.max.forecast',	cunit: '°',		cname: 'Maximum felttemperature, 2m above ground'},
	{id: 'felttemperature_min',			type: 'state',		ctype: 'number',	crole: 'value.temperature.feelslike.min.forecast',	cunit: '°',		cname: 'Minimum felttemperature, 2m above ground'},
	{id: 'humiditygreater90_hours',		type: 'state',		ctype: 'number',	crole: 'value.humiditygreater90_hours.forecast',	cunit: 'h',		cname: 'Hours with humidity greater than 90%'},
	{id: 'pictocode',					type: 'state',		ctype: 'number',	crole: 'weather.icon.forecast',										cname: 'Classification of weather conditions, using a numeric number (1-17)'},
	{id: 'precipitation',				type: 'state',		ctype: 'number',	crole: 'value.precipitation.forecast',								cname: 'Precipitation'},
	{id: 'precipitation_hours',			type: 'state',		ctype: 'number',	crole: 'value.precipitation_hours.forecast',		cunit: 'h',		cname: 'Hours with precipitation'},
	{id: 'precipitation_probability',	type: 'state',		ctype: 'number',	crole: 'value.precipitation_probability.forecast',	cunit: '%',		cname: 'Precipitation Probability'},
	{id: 'predictability',				type: 'state',		ctype: 'number',	crole: 'value.predictability.forecast',				cunit: '%',		cname: 'Predictability (24h)'},
	{id: 'predictability_class',		type: 'state',		ctype: 'number',	crole: 'value.predictability_class.forecast',						cname: 'Predictability class (1 = very low, 5 = very high)'},
	{id: 'rainspot',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Rainspot (0 ≤ 0.02 mm, 1 = 0.2 - 1.5 mm, 2 = 1.5 - 5 mm, 3 ≥ 5 mm, 9 = 0.02 - 0.2 mm)'},
	{id: 'rainspot_vis',				type: 'state',		ctype: 'string',	crole: 'html',														cname: 'Rainspot for vis (html-widget binding)'},
	{id: 'relativehumidity_max',		type: 'state',		ctype: 'number',	crole: 'value.humidity.max.forecast', 				cunit: '%',		cname: 'Max relative air humidity'},
	{id: 'relativehumidity_mean',		type: 'state',		ctype: 'number',	crole: 'value.humidity.mean.forecast', 				cunit: '%',		cname: 'Mean relative air humidity'},
	{id: 'relativehumidity_min',		type: 'state',		ctype: 'number',	crole: 'value.humidity.min.forecast', 				cunit: '%',		cname: 'Min relative air humidity'},
	{id: 'sealevelpressure_max',		type: 'state',		ctype: 'number',	crole: 'value.pressure.max.forecast',				cunit: 'hPa',	cname: 'Maximum sea level pressure, adjusted to mean sea level'},
	{id: 'sealevelpressure_mean',		type: 'state',		ctype: 'number',	crole: 'value.pressure.mean.forecast',				cunit: 'hPa',	cname: 'Mean sea level pressure, adjusted to mean sea level'},
	{id: 'sealevelpressure_min',		type: 'state',		ctype: 'number',	crole: 'value.pressure.min.forecast',				cunit: 'hPa',	cname: 'Minimum sea level pressure, adjusted to mean sea level'},
	{id: 'snowfraction',				type: 'state',		ctype: 'number',	crole: 'value.snowfraction.forecast',								cname: 'Snow fraction, information whether precipitation falls as rain or snow',	cstates: {0: 'rain', 1: 'snow'}},
	{id: 'temperature_max', 			type: 'state',		ctype: 'number',	crole: 'value.temperature.max.forecast',			cunit: '°',		cname: 'Maximum temperature, 2m above ground'},
	{id: 'temperature_mean',			type: 'state',		ctype: 'number',	crole: 'value.temperature.mean.forecast',			cunit: '°',		cname: 'Mean temperature, 2m above ground'},
	{id: 'temperature_min', 			type: 'state',		ctype: 'number',	crole: 'value.temperature.min.forecast',			cunit: '°',		cname: 'Minimum temperature, 2m above ground'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day of forecast'},
	{id: 'uvindex',						type: 'state',		ctype: 'number',	crole: 'value.uv.forecast',											cname: 'UV-index on ground level (0 ... 11+)'},
	{id: 'winddirectionChar2',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction 10m above ground, 2 char'},
	{id: 'winddirectionChar3',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction 10m above ground, 3 char'},
	{id: 'winddirection',				type: 'state',		ctype: 'number',	crole: 'weather.direction.wind.forecast',			cunit: '°',		cname: 'Wind direction 10m above ground, degree'},
	{id: 'windspeed_max',				type: 'state',		ctype: 'number',	crole: 'value.speed.wind.max.forecast',								cname: 'Max windspeed, 10m above ground'},
	{id: 'windspeed_mean',				type: 'state',		ctype: 'number',	crole: 'value.speed.wind.mean.forecast',							cname: 'Mean windspeed, 10m above ground'},
	{id: 'windspeed_min',				type: 'state',		ctype: 'number',	crole: 'value.speed.wind.min.forecast',								cname: 'Minimum windspeed, 10m above ground'}
];

// forecast package: current (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#current)
const current = [
	{id: 'data_current',				type: 'channel_0',																							cname: 'data current'},
	{id: 'isdaylight',					type: 'state',		ctype: 'number',	crole: 'value.isdaylight.forecast.0',								cname: 'Day or night',																cstates: {0: 'night', 1: 'day'}},
	{id: 'isobserveddata',				type: 'state',		ctype: 'number',	crole: 'value.isobserveddata.forecast.0',							cname: 'Is observed data',															cstates: {0: 'no obs', 1: 'obs available'}},
	{id: 'pictocode',					type: 'state',		ctype: 'number',	crole: 'weather.icon.forecast.0',									cname: 'Classification of weather conditions, using a numeric number (1-17)'},
	{id: 'pictocode_detailed',			type: 'state',		ctype: 'number',	crole: 'weather.icon.forecast.0',									cname: 'Classification of weather conditions, using a numeric number (1-35)'},
	{id: 'temperature', 				type: 'state',		ctype: 'number',	crole: 'value.temperature.forecast.0',				cunit: '°',		cname: 'Temperature, 2m above ground'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast.0',											cname: 'Day of forecast'},
	{id: 'windspeed',					type: 'state',		ctype: 'number',	crole: 'value.speed.wind.forecast.0',								cname: 'Windspeed, 10m above ground'},
	{id: 'zenithangle',					type: 'state',		ctype: 'number',	crole: 'value.zenithangle.forecast.0',				cunit: '°',		cname: 'Angle between zenith and centre of the suns disc'}
];

// forecast package: clouds-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#clouds)
const clouds_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'highclouds',					type: 'state',		ctype: 'number',	crole: 'value.highclouds.forecast',					cunit: '%',		cname: 'Cover of the sky (high clouds)'},
	{id: 'lowclouds',					type: 'state',		ctype: 'number',	crole: 'value.lowclouds.forecast',					cunit: '%',		cname: 'Cover of the sky (low clouds)'},
	{id: 'midclouds',					type: 'state',		ctype: 'number',	crole: 'value.midclouds.forecast',					cunit: '%',		cname: 'Cover of the sky (mid clouds)'},
	{id: 'sunshinetime',				type: 'state',		ctype: 'number',	crole: 'value.sunshinetime.forecast',								cname: 'Direct sunlight, depends also on day length'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'},
	{id: 'totalcloudcover',				type: 'state',		ctype: 'number',	crole: 'value.totalcloudcover.forecast',			cunit: '%',		cname: 'Cover of the sky (total cloud cover)'},
	{id: 'visibility',					type: 'state',		ctype: 'number',	crole: 'value.visibility.forecast',									cname: 'Visibility (distance)'}
];
// forecast package: clouds_3h
const clouds_3h = [
	{id: 'data_3h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0300', '0600', '0900', '1200', '1500', '1800', '2100'], 																																								type: 'channel_1'},
	{id: 'highclouds',					type: 'state',		ctype: 'number',	crole: 'value.highclouds.forecast',					cunit: '%',		cname: 'Cover of the sky (high clouds)'},
	{id: 'lowclouds',					type: 'state',		ctype: 'number',	crole: 'value.lowclouds.forecast',					cunit: '%',		cname: 'Cover of the sky (low clouds)'},
	{id: 'midclouds',					type: 'state',		ctype: 'number',	crole: 'value.midclouds.forecast',					cunit: '%',		cname: 'Cover of the sky (mid clouds)'},
	{id: 'sunshinetime',				type: 'state',		ctype: 'number',	crole: 'value.sunshinetime.forecast',								cname: 'Direct sunlight, depends also on day length'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'},
	{id: 'totalcloudcover',				type: 'state',		ctype: 'number',	crole: 'value.totalcloudcover.forecast',			cunit: '%',		cname: 'Cover of the sky (total cloud cover)'},
	{id: 'visibility',					type: 'state',		ctype: 'number',	crole: 'value.visibility.forecast',									cname: 'Visibility (distance)'}
];
// forecast package: clouds-day
const clouds_day = [
	{id: 'data_day',					type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0d', '1d', '2d', '3d', '4d', '5d', '6d'],																																													type: 'channel_1'},
	{id: 'highclouds_max',				type: 'state',		ctype: 'number',	crole: 'value.highclouds_max.forecast',				cunit: '%',		cname: 'Cover of the sky (maximum high clouds)'},
	{id: 'highclouds_mean',				type: 'state',		ctype: 'number',	crole: 'value.highclouds_mean.forecast',			cunit: '%',		cname: 'Cover of the sky (mean high clouds)'},
	{id: 'highclouds_min',				type: 'state',		ctype: 'number',	crole: 'value.highclouds_min.forecast',				cunit: '%',		cname: 'Cover of the sky (minimum high clouds)'},
	{id: 'lowclouds_max',				type: 'state',		ctype: 'number',	crole: 'value.lowclouds_max.forecast',				cunit: '%',		cname: 'Cover of the sky (maximum low clouds)'},
	{id: 'lowclouds_mean',				type: 'state',		ctype: 'number',	crole: 'value.lowclouds_mean.forecast',				cunit: '%',		cname: 'Cover of the sky (mean low clouds)'},
	{id: 'lowclouds_min',				type: 'state',		ctype: 'number',	crole: 'value.lowclouds_min.forecast',				cunit: '%',		cname: 'Cover of the sky (minimum low clouds)'},
	{id: 'midclouds_max',				type: 'state',		ctype: 'number',	crole: 'value.midclouds_max.forecast',				cunit: '%',		cname: 'Cover of the sky (maximum mid clouds)'},
	{id: 'midclouds_mean',				type: 'state',		ctype: 'number',	crole: 'value.midclouds_mean.forecast',				cunit: '%',		cname: 'Cover of the sky (mean mid clouds)'},
	{id: 'midclouds_min',				type: 'state',		ctype: 'number',	crole: 'value.midclouds_min.forecast',				cunit: '%',		cname: 'Cover of the sky (minimum mid clouds)'},
	{id: 'sunshine_time',				type: 'state',		ctype: 'number',	crole: 'value.sunshinetime.forecast',								cname: 'Direct sunlight, depends also on day length'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day of forecast'},
	{id: 'totalcloudcover_max',			type: 'state',		ctype: 'number',	crole: 'value.totalcloudcover_max.forecast',		cunit: '%',		cname: 'Cover of the sky (total maximum cloud cover)'},
	{id: 'totalcloudcover_mean',		type: 'state',		ctype: 'number',	crole: 'value.totalcloudcover_mean.forecast',		cunit: '%',		cname: 'Cover of the sky (total mean cloud cover)'},
	{id: 'totalcloudcover_min',			type: 'state',		ctype: 'number',	crole: 'value.totalcloudcover_min.forecast',		cunit: '%',		cname: 'Cover of the sky (total minimum cloud cover)'},
	{id: 'visibility_max',				type: 'state',		ctype: 'number',	crole: 'value.visibility_max.forecast',								cname: 'Maximum visibility (distance)'},
	{id: 'visibility_mean',				type: 'state',		ctype: 'number',	crole: 'value.visibility_mean.forecast',							cname: 'Mean visibility (distance)'},
	{id: 'visibility_min',				type: 'state',		ctype: 'number',	crole: 'value.visibility_min.forecast',								cname: 'Minimum visibility (distance)'}
];

// forecast package: sunmoon (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#sun-and-moon)
const sunmoon = [
	{id: 'data_day',					type: 'channel_0',																							cname: 'data day'},
	{id: ['0d', '1d', '2d', '3d', '4d', '5d', '6d'],																																													type: 'channel_1'},
	{id: 'moonage',						type: 'state',		ctype: 'number',	crole: 'value.moonage.forecast',					cunit: 'd',		cname: 'Moon age'},
	{id: 'moonphaseangle',				type: 'state',		ctype: 'number',	crole: 'value.moonphaseangle.forecast',				cunit: '°',		cname: 'Moon phase angle'},
	{id: 'moonphasename',				type: 'state',		ctype: 'string',	crole: 'value.moonphasename.forecast',								cname: 'Moon phase name',															cstates: {'new': 'new', 'waxing crescent': 'waxing crescent', 'first quarter': 'first quarter', 'waxing gibbous': 'waxing gibbous', 'full': 'full', 'waning gibbous': 'waning gibbous', 'last quarter': 'last quarter', 'waning crescent': 'waning crescent'}},
	{id: 'moonphasetransittime',		type: 'state',		ctype: 'string',	crole: 'value.moonphasetransittime.forecast',						cname: 'Moon phase transit time'},
	{id: 'moonrise',					type: 'state',		ctype: 'string',	crole: 'value.moonrise.forecast',									cname: 'Moon rise time'},
	{id: 'moonset',						type: 'state',		ctype: 'string',	crole: 'value.moonset.forecast',									cname: 'Moon set time'},
	{id: 'sunrise',						type: 'state',		ctype: 'string',	crole: 'value.sunrise.forecast',									cname: 'Sunrise time'},
	{id: 'sunset',						type: 'state',		ctype: 'string',	crole: 'value.sunset.forecast',										cname: 'Sunset time'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day of forecast'}
];

// forecast package: basic-day_webcolors (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#web-colors)
/*
const basic_day_webcolors = [
	{id: 'data_day',					type: 'channel_0',																							cname: 'data day'},
	{id: 'felttemperature_max_color',	type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Web color maximum felttemperature'},
	{id: 'felttemperature_max_fontcolor',type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Web color maximum felttemperature, font'},
	{id: 'felttemperature_min_color',	type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Web color minimum felttemperature'},
	{id: 'felttemperature_min_fontcolor',type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Web color minimum felttemperature, font'},
	{id: 'predictability_class_color',	type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Web color maximum windspeed'},
	{id: 'temperature_max_color',		type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Web color maximum temperature'},
	{id: 'temperature_max_fontcolor',	type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Web color maximum temperature, font'},
	{id: 'temperature_mean_color',		type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Web color mean temperature'},
	{id: 'temperature_mean_fontcolor',	type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Web color mean temperature, font'},
	{id: 'temperature_min_color',		type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Web color minimum temperature'},
	{id: 'temperature_min_fontcolor',	type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Web color minimum temperature, font'},
	{id: 'windspeed_max_color',			type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Web color mean windspeed'},
	{id: 'windspeed_mean_color',		type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Web color minimum windspeed'}
];
*/

// forecast package: agro-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#agro)
const agro_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'dewpointtemperature',			type: 'state',		ctype: 'number',	crole: 'value.dewpointtemperature.forecast',						cname: 'Dewpoint temperature'},
	{id: 'evapotranspiration',			type: 'state',		ctype: 'number',	crole: 'value.evapotranspiration.forecast',							cname: 'Total evapotranspiration'},
	{id: 'leafwetnessindex',			type: 'state',		ctype: 'number',	crole: 'value.leafwetnessindex.forecast',							cname: 'Leaf wetness index'},
	{id: 'potentialevapotranspiration',	type: 'state',		ctype: 'number',	crole: 'value.potentialevapotranspiration.forecast',				cname: 'Potential evapotranspiration'},
	{id: 'referenceevapotranspiration_fao',	type: 'state',	ctype: 'number',	crole: 'value.referenceevapotranspiration_fao.forecast',			cname: 'Reference evapotranspiration (ET_0)'},
	{id: 'sensibleheatflux',			type: 'state',		ctype: 'number',	crole: 'value.sensibleheatflux.forecast',							cname: 'Mean sensible heat flux'},
	{id: 'skintemperature',				type: 'state',		ctype: 'number',	crole: 'value.skintemperature.forecast',							cname: 'Skin / Surface temperature'},
	{id: 'soilmoisture_0to10cm',		type: 'state',		ctype: 'number',	crole: 'value.soilmoisture_0to10cm.forecast',						cname: 'Soil moisture (0 - 10cm)'},
	{id: 'soiltemperature_0to10cm',		type: 'state',		ctype: 'number',	crole: 'value.soiltemperature_0to10cm.forecast',					cname: 'Soil temperature (0 - 10cm)'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'},
	{id: 'wetbulbtemperature',			type: 'state',		ctype: 'number',	crole: 'value.wetbulbtemperature.forecast',							cname: 'Wetbulb temperature'}
];
// forecast package: agro-3h
const agro_3h = [
	{id: 'data_3h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0300', '0600', '0900', '1200', '1500', '1800', '2100'], 																																								type: 'channel_1'},
	{id: 'dewpointtemperature',			type: 'state',		ctype: 'number',	crole: 'value.dewpointtemperature.forecast',						cname: 'Dewpoint temperature'},
	{id: 'evapotranspiration',			type: 'state',		ctype: 'number',	crole: 'value.evapotranspiration.forecast',			cunit: 'mm',	cname: 'Total evapotranspiration'},
	{id: 'leafwetnessindex',			type: 'state',		ctype: 'number',	crole: 'value.leafwetnessindex.forecast',							cname: 'Leaf wetness index'},
	{id: 'potentialevapotranspiration',	type: 'state',		ctype: 'number',	crole: 'value.potentialevapotranspiration.forecast',cunit: 'mm',	cname: 'Potential evapotranspiration'},
	{id: 'referenceevapotranspiration_fao',	type: 'state',	ctype: 'number',	crole: 'value.referenceevapotranspiration_fao.forecast',cunit: 'mm',cname: 'Reference evapotranspiration (ET_0)'},
	{id: 'sensibleheatflux',			type: 'state',		ctype: 'number',	crole: 'value.sensibleheatflux.forecast',			cunit: 'W/m2',	cname: 'Mean sensible heat flux'},
	{id: 'skintemperature',				type: 'state',		ctype: 'number',	crole: 'value.skintemperature.forecast',							cname: 'Skin / Surface temperature'},
	{id: 'soilmoisture_0to10cm',		type: 'state',		ctype: 'number',	crole: 'value.soilmoisture_0to10cm.forecast',		cunit: '%',		cname: 'Soil moisture (0 - 10cm)'},
	{id: 'soiltemperature_0to10cm',		type: 'state',		ctype: 'number',	crole: 'value.soiltemperature_0to10cm.forecast',					cname: 'Soil temperature (0 - 10cm)'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'},
	{id: 'wetbulbtemperature',			type: 'state',		ctype: 'number',	crole: 'value.wetbulbtemperature.forecast',							cname: 'Wetbulb temperature'}
];
// forecast package: agro-day
const agro_day = [
	{id: 'data_day',					type: 'channel_0',																							cname: 'data day'},
	{id: ['0d', '1d', '2d', '3d', '4d', '5d', '6d'],																																													type: 'channel_1'},
	{id: 'dewpointtemperature_max',		type: 'state',		ctype: 'number',	crole: 'value.dewpointtemperature_max.forecast',					cname: 'Maximum ewpoint temperature'},
	{id: 'dewpointtemperature_mean',	type: 'state',		ctype: 'number',	crole: 'value.dewpointtemperature_mean.forecast',					cname: 'Mean dewpoint temperature'},
	{id: 'dewpointtemperature_min',		type: 'state',		ctype: 'number',	crole: 'value.dewpointtemperature_min.forecast',					cname: 'Minimum dewpoint temperature'},
	{id: 'evapotranspiration',			type: 'state',		ctype: 'number',	crole: 'value.evapotranspiration.forecast',			cunit: 'mm',	cname: 'Total evapotranspiration'},
	{id: 'leafwetnessindex',			type: 'state',		ctype: 'number',	crole: 'value.leafwetnessindex.forecast',							cname: 'Leaf wetness index'},
	{id: 'potentialevapotranspiration',	type: 'state',		ctype: 'number',	crole: 'value.potentialevapotranspiration.forecast',cunit: 'mm',	cname: 'Potential evapotranspiration'},
	{id: 'referenceevapotranspiration_fao',	type: 'state',	ctype: 'number',	crole: 'value.referenceevapotranspiration_fao.forecast',cunit: 'mm',cname: 'Reference evapotranspiration (ET_0)'},
	{id: 'sensibleheatflux',			type: 'state',		ctype: 'number',	crole: 'value.sensibleheatflux.forecast',			cunit: 'W/m2',	cname: 'Mean sensible heat flux'},
	{id: 'skintemperature_max',			type: 'state',		ctype: 'number',	crole: 'value.skintemperature_max.forecast',						cname: 'Maximum skin / surface temperature'},
	{id: 'skintemperature_mean',		type: 'state',		ctype: 'number',	crole: 'value.skintemperature_mean.forecast',						cname: 'Mean skin / surface temperature'},
	{id: 'skintemperature_min',			type: 'state',		ctype: 'number',	crole: 'value.skintemperature_min.forecast',						cname: 'Minimum skin / surface temperature'},
	{id: 'soilmoisture_0to10cm_max',	type: 'state',		ctype: 'number',	crole: 'value.soilmoisture_0to10cm_max.forecast',	cunit: '%',		cname: 'Maximum soil moisture (0 - 10cm)'},
	{id: 'soilmoisture_0to10cm_mean',	type: 'state',		ctype: 'number',	crole: 'value.soilmoisture_0to10cm_mean.forecast',	cunit: '%',		cname: 'Mean soil moisture (0 - 10cm)'},
	{id: 'soilmoisture_0to10cm_min',	type: 'state',		ctype: 'number',	crole: 'value.soilmoisture_0to10cm_min.forecast',	cunit: '%',		cname: 'Minimum soil moisture (0 - 10cm)'},
	{id: 'soiltemperature_0to10cm_max',	type: 'state',		ctype: 'number',	crole: 'value.soiltemperature_0to10cm_max.forecast',				cname: 'Maximum soil temperature (0 - 10cm)'},
	{id: 'soiltemperature_0to10cm_mean',type: 'state',		ctype: 'number',	crole: 'value.soiltemperature_0to10cm_mean.forecast',				cname: 'Mean soil temperature (0 - 10cm)'},
	{id: 'soiltemperature_0to10cm_min',	type: 'state',		ctype: 'number',	crole: 'value.soiltemperature_0to10cm_min.forecast',				cname: 'Minimum soil temperature (0 - 10cm)'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day of forecast'},
	{id: 'wetbulbtemperature_max',		type: 'state',		ctype: 'number',	crole: 'value.wetbulbtemperature.forecast_max',						cname: 'Maximum wetbulb temperature'},
	{id: 'wetbulbtemperature_mean',		type: 'state',		ctype: 'number',	crole: 'value.wetbulbtemperature.forecast_mean',					cname: 'Mean wetbulb temperature'},
	{id: 'wetbulbtemperature_min',		type: 'state',		ctype: 'number',	crole: 'value.wetbulbtemperature.forecast_min',						cname: 'Minimum wetbulb temperature'}
];

// forecast package: agromodelleafwetness-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#agromodel-leaf-wetness)
const agromodelleafwetness_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'leafwetness_dewindex',		type: 'state',		ctype: 'number',	crole: 'value.leafwetness_dewindex.forecast',						cname: 'Leaf wetness dew index'},
	{id: 'leafwetness_evaporationindex',type: 'state',		ctype: 'number',	crole: 'value.leafwetness_evaporationindex.forecast',				cname: 'Leaf wetness evaporation index'},
	{id: 'leafwetness_probability',		type: 'state',		ctype: 'number',	crole: 'value.leafwetness_probability.forecast',	cunit: '%',		cname: 'Leaf wetness probability'},
	{id: 'leafwetness_rainindex',		type: 'state',		ctype: 'number',	crole: 'value.leafwetness_rainindex.forecast',						cname: 'Leaf wetness rain index'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'}
];

// forecast package: agromodelsowing-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#agromodel-sowing)
const agromodelsowing_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'sowing_barley',				type: 'state',		ctype: 'number',	crole: 'value.sowing_barley.forecast',								cname: 'Sowing barley',																cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_cotton',				type: 'state',		ctype: 'number',	crole: 'value.sowing_cotton.forecast',								cname: 'Sowing cotton',																cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_maize',				type: 'state',		ctype: 'number',	crole: 'value.sowing_maize.forecast',								cname: 'Sowing maize',																cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_potato',				type: 'state',		ctype: 'number',	crole: 'value.sowing_potato.forecast',								cname: 'Sowing potato',																cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_rapseed',				type: 'state',		ctype: 'number',	crole: 'value.sowing_rapseed.forecast',								cname: 'Sowing rapseed',															cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_riceindica',			type: 'state',		ctype: 'number',	crole: 'value.sowing_riceindica.forecast',							cname: 'Sowing riceindica',															cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_ricejaponi',			type: 'state',		ctype: 'number',	crole: 'value.sowing_ricejaponi.forecast',							cname: 'Sowing ricejaponi',															cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_sorghum',				type: 'state',		ctype: 'number',	crole: 'value.sowing_sorghum.forecast',								cname: 'Sowing sorghum',															cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_soybean',				type: 'state',		ctype: 'number',	crole: 'value.sowing_soybean.forecast',								cname: 'Sowing soybean',															cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_sugarbeets',			type: 'state',		ctype: 'number',	crole: 'value.sowing_sugarbeets.forecast',							cname: 'Sowing sugarbeets',															cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'sowing_wheat',				type: 'state',		ctype: 'number',	crole: 'value.sowing_wheat.forecast',								cname: 'Sowing wheat',																cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'}
];

// forecast package: agromodelspray-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#agromodel-spray)
const agromodelspray_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'spraywindow',					type: 'state',		ctype: 'number',	crole: 'value.spraywindow.forecast',								cname: 'Spray window',																cstates: {0: 'Suitable period for application (green)', 1: 'Less suitable period for application (yellow)', 2: 'Unsuitable period for application (red)'}},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'}
];

// forecast package: soiltrafficability-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#soil-trafficability)
/*
const soiltrafficability_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'clay',						type: 'state',		ctype: 'number',	crole: 'value.clay.forecast',										cname: 'Stability of the clay for moving vehicles',									cstates: {0: 'no trafficability', 1: 'good trafficiability'}},
	{id: 'sand',						type: 'state',		ctype: 'number',	crole: 'value.sand.forecast',										cname: 'Stability of the soil for moving vehicles',									cstates: {0: 'no trafficability', 1: 'good trafficiability'}},
	{id: 'silt',						type: 'state',		ctype: 'number',	crole: 'value.silt.forecast',										cname: 'Stability of the silt for moving vehicles',									cstates: {0: 'no trafficability', 1: 'good trafficiability'}},
	{id: 'siltyloam',					type: 'state',		ctype: 'number',	crole: 'value.siltyloam.forecast',									cname: 'Stability of the siltiloam for moving vehicles',							cstates: {0: 'no trafficability', 1: 'good trafficiability'}},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'}
];
*/

// forecast package: solar-15min (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#solar)
const solar_15min = [
	{id: 'data_xmin',					type: 'channel_0',																							cname: 'data 15min'},
	{id: ['0000', '0015', '0030', '0045', '0100', '0115', '0130', '0145', '0200', '0215', '0230', '0245', '0300', '0315', '0330', '0345', '0400', '0415', '0430', '0445', '0500', '0515', '0530', '0545', '0600', '0615', '0630', '0645', '0700', '0715', '0730', '0745', '0800', '0815', '0830', '0845', '0900', '0915', '0930', '0945', '1000', '1015', '1030', '1045', '1100', '1115', '1130', '1145', '1200', '1215', '1230', '1245', '1300', '1315', '1330', '1345', '1400', '1415', '1430', '1445', '1500', '1515', '1530', '1545', '1600', '1615', '1630', '1645', '1700', '1715', '1730', '1745', '1800', '1815', '1830', '1845', '1900', '1915', '1930', '1945', '2000', '2015', '2030', '2045', '2100', '2115', '2130', '2145', '2200', '2215', '2230', '2245', '2300', '2315', '2330', '2345'], type: 'channel_1'},
	{id: 'dif_backwards',				type: 'state',		ctype: 'number',	crole: 'value.dif_backwards.forecast',				cunit: 'W/m2',	cname: 'Diffuse radiation (backwards)'},
	{id: 'dif_instant',					type: 'state',		ctype: 'number',	crole: 'value.dif_instant.forecast',				cunit: 'W/m2',	cname: 'Diffuse radiation (instant)'},
	{id: 'dni_backwards',				type: 'state',		ctype: 'number',	crole: 'value.dni_backwards.forecast',				cunit: 'W/m2',	cname: 'Direct normalized irradiance (Radiation, backwards)'},
	{id: 'dni_instant',					type: 'state',		ctype: 'number',	crole: 'value.dni_instant.forecast',				cunit: 'W/m2',	cname: 'Direct normalized irradiance (Radiation, instant)'},
	{id: 'extraterrestrialradiation_backwards',	type: 'state',	ctype: 'number',	crole: 'value.extraterrestrialradiation_backwards.forecast',	cunit: 'W/m2',	cname: 'Extraterrestrial solar radiation (backwards)'},
	{id: 'extraterrestrialradiation_instant',	type: 'state',	ctype: 'number',	crole: 'value.extraterrestrialradiation_instant.forecast',		cunit: 'W/m2',	cname: 'Extraterrestrial solar radiation (instant)'},
	{id: 'ghi_backwards',				type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards.forecast',				cunit: 'W/m2',	cname: 'Global horizontal radiation (backwards)'},
	{id: 'ghi_instant',					type: 'state',		ctype: 'number',	crole: 'value.ghi_instant.forecast',				cunit: 'W/m2',	cname: 'Global horizontal radiation (instant)'},
	{id: 'gni_backwards',				type: 'state',		ctype: 'number',	crole: 'value.gni_backwards.forecast',				cunit: 'W/m2',	cname: 'Global normalized irradiance (Radiation, backwards)'},
	{id: 'gni_instant',					type: 'state',		ctype: 'number',	crole: 'value.gni_instant.forecast',				cunit: 'W/m2',	cname: 'Global normalized irradiance (Radiation, instant)'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'}
];
// forecast package: solar-1h
const solar_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'dif_backwards',				type: 'state',		ctype: 'number',	crole: 'value.dif_backwards.forecast',				cunit: 'W/m2',	cname: 'Diffuse radiation (backwards)'},
	{id: 'dif_instant',					type: 'state',		ctype: 'number',	crole: 'value.dif_instant.forecast',				cunit: 'W/m2',	cname: 'Diffuse radiation (instant)'},
	{id: 'dni_backwards',				type: 'state',		ctype: 'number',	crole: 'value.dni_backwards.forecast',				cunit: 'W/m2',	cname: 'Direct normalized irradiance (Radiation, backwards)'},
	{id: 'dni_instant',					type: 'state',		ctype: 'number',	crole: 'value.dni_instant.forecast',				cunit: 'W/m2',	cname: 'Direct normalized irradiance (Radiation, instant)'},
	{id: 'extraterrestrialradiation_backwards',	type: 'state',	ctype: 'number',	crole: 'value.extraterrestrialradiation_backwards.forecast',	cunit: 'W/m2',	cname: 'Extraterrestrial solar radiation (backwards)'},
	{id: 'extraterrestrialradiation_instant',	type: 'state',	ctype: 'number',	crole: 'value.extraterrestrialradiation_instant.forecast',		cunit: 'W/m2',	cname: 'Extraterrestrial solar radiation (instant)'},
	{id: 'ghi_backwards',				type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards.forecast',				cunit: 'W/m2',	cname: 'Global horizontal radiation (backwards)'},
	{id: 'ghi_instant',					type: 'state',		ctype: 'number',	crole: 'value.ghi_instant.forecast',				cunit: 'W/m2',	cname: 'Global horizontal radiation (instant)'},
	{id: 'gni_backwards',				type: 'state',		ctype: 'number',	crole: 'value.gni_backwards.forecast',				cunit: 'W/m2',	cname: 'Global normalized irradiance (Radiation, backwards)'},
	{id: 'gni_instant',					type: 'state',		ctype: 'number',	crole: 'value.gni_instant.forecast',				cunit: 'W/m2',	cname: 'Global normalized irradiance (Radiation, instant)'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'}
];
// forecast package: solar-3h
const solar_3h = [
	{id: 'data_3h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0300', '0600', '0900', '1200', '1500', '1800', '2100'], 																																								type: 'channel_1'},
	{id: 'dif_backwards',				type: 'state',		ctype: 'number',	crole: 'value.dif_backwards.forecast',				cunit: 'W/m2',	cname: 'Diffuse radiation (backwards)'},
	{id: 'dif_instant',					type: 'state',		ctype: 'number',	crole: 'value.dif_instant.forecast',				cunit: 'W/m2',	cname: 'Diffuse radiation (instant)'},
	{id: 'dni_backwards',				type: 'state',		ctype: 'number',	crole: 'value.dni_backwards.forecast',				cunit: 'W/m2',	cname: 'Direct normalized irradiance (Radiation, backwards)'},
	{id: 'dni_instant',					type: 'state',		ctype: 'number',	crole: 'value.dni_instant.forecast',				cunit: 'W/m2',	cname: 'Direct normalized irradiance (Radiation, instant)'},
	{id: 'extraterrestrialradiation_backwards',	type: 'state',	ctype: 'number',	crole: 'value.extraterrestrialradiation_backwards.forecast',	cunit: 'W/m2',	cname: 'Extraterrestrial solar radiation (backwards)'},
	{id: 'extraterrestrialradiation_instant',	type: 'state',	ctype: 'number',	crole: 'value.extraterrestrialradiation_instant.forecast',		cunit: 'W/m2',	cname: 'Extraterrestrial solar radiation (instant)'},
	{id: 'ghi_backwards',				type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards.forecast',				cunit: 'W/m2',	cname: 'Global horizontal radiation (backwards)'},
	{id: 'ghi_instant',					type: 'state',		ctype: 'number',	crole: 'value.ghi_instant.forecast',				cunit: 'W/m2',	cname: 'Global horizontal radiation (instant)'},
	{id: 'gni_backwards',				type: 'state',		ctype: 'number',	crole: 'value.gni_backwards.forecast',				cunit: 'W/m2',	cname: 'Global normalized irradiance (Radiation, backwards)'},
	{id: 'gni_instant',					type: 'state',		ctype: 'number',	crole: 'value.gni_instant.forecast',				cunit: 'W/m2',	cname: 'Global normalized irradiance (Radiation, instant)'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'}
];
// forecast package: solar-day
const solar_day = [
	{id: 'data_day',					type: 'channel_0',																							cname: 'data day'},
	{id: ['0d', '1d', '2d', '3d', '4d', '5d', '6d'],																																													type: 'channel_1'},
	{id: 'dif_total',					type: 'state',		ctype: 'number',	crole: 'value.dif_total.forecast',					cunit: 'W/m2',	cname: 'Diffuse radiation (total)'},
	{id: 'dni_total',					type: 'state',		ctype: 'number',	crole: 'value.dni_total.forecast',					cunit: 'W/m2',	cname: 'Direct normalized irradiance (Radiation, total)'},
	{id: 'extraterrestrialradiation_total',	type: 'state',	ctype: 'number',	crole: 'value.extraterrestrialradiation_total.forecast',			cunit: 'W/m2',	cname: 'Extraterrestrial solar radiation (total)'},
	{id: 'ghi_total',					type: 'state',		ctype: 'number',	crole: 'value.ghi_total.forecast',					cunit: 'W/m2',	cname: 'Global horizontal radiation (total)'},
	{id: 'gni_total',					type: 'state',		ctype: 'number',	crole: 'value.gni_total.forecast',					cunit: 'W/m2',	cname: 'Global normalized irradiance (total)'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day of forecast'}
];

// forecast package: solarensemble-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#solar-ensemble)
const solarensemble_1h = [
	{id: 'trend_1h',					type: 'channel_0',																							cname: 'trend 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'ghi_backwards_consensus',		type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_consensus.forecast',	cunit: 'W/m2',	cname: 'GHI backwards consensus'},
	{id: 'ghi_backwards_max',			type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_max.forecast',			cunit: 'W/m2',	cname: 'Maximum GHI backwards'},
	{id: 'ghi_backwards_min',			type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_min.forecast',			cunit: 'W/m2',	cname: 'Minimum GHI backwards'},
	{id: 'ghi_backwards_p10exceedence',	type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_p10exceedence.forecast',cunit: 'W/m2',	cname: 'GHI backwards p10 exceedence'},
	{id: 'ghi_backwards_p15exceedence',	type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_p15exceedence.forecast',cunit: 'W/m2',	cname: 'GHI backwards p15 exceedence'},
	{id: 'ghi_backwards_p20exceedence',	type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_p20exceedence.forecast',cunit: 'W/m2',	cname: 'GHI backwards p20 exceedence'},
	{id: 'ghi_backwards_p25exceedence',	type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_p25exceedence.forecast',cunit: 'W/m2',	cname: 'GHI backwards p25 exceedence'},
	{id: 'ghi_backwards_p30exceedence',	type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_p30exceedence.forecast',cunit: 'W/m2',	cname: 'GHI backwards p30 exceedence'},
	{id: 'ghi_backwards_p40exceedence',	type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_p40exceedence.forecast',cunit: 'W/m2',	cname: 'GHI backwards p40 exceedence'},
	{id: 'ghi_backwards_p50exceedence',	type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_p50exceedence.forecast',cunit: 'W/m2',	cname: 'GHI backwards p50 exceedence'},
	{id: 'ghi_backwards_p5exceedence',	type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_p5exceedence.forecast',	cunit: 'W/m2',	cname: 'GHI backwards p5 exceedence'},
	{id: 'ghi_backwards_p60exceedence',	type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_p60exceedence.forecast',cunit: 'W/m2',	cname: 'GHI backwards p60 exceedence'},
	{id: 'ghi_backwards_p70exceedence',	type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_p70exceedence.forecast',cunit: 'W/m2',	cname: 'GHI backwards p70 exceedence'},
	{id: 'ghi_backwards_p75exceedence',	type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_p75exceedence.forecast',cunit: 'W/m2',	cname: 'GHI backwards p75 exceedence'},
	{id: 'ghi_backwards_p80exceedence',	type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_p80exceedence.forecast',cunit: 'W/m2',	cname: 'GHI backwards p80 exceedence'},
	{id: 'ghi_backwards_p85exceedence',	type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_p85exceedence.forecast',cunit: 'W/m2',	cname: 'GHI backwards p85 exceedence'},
	{id: 'ghi_backwards_p90exceedence',	type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_p90exceedence.forecast',cunit: 'W/m2',	cname: 'GHI backwards p90 exceedence'},
	{id: 'ghi_backwards_p95exceedence',	type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards_p95exceedence.forecast',cunit: 'W/m2',	cname: 'GHI backwards p95 exceedence'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day of forecast'}
];

// forecast package: pvpro-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#pvpro)
/*
const pvpro_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'gti_backwards',				type: 'state',		ctype: 'number',	crole: 'value.gti_backwards.forecast',				cunit: '%',		cname: 'Global Tilted Irradiance (Radiaton), backwards'},
	{id: 'gti_instant',					type: 'state',		ctype: 'number',	crole: 'value.gti_instant.forecast',				cunit: '%',		cname: 'Global Tilted Irradiance (Radiation), instant'},
	{id: 'iam_backwards',				type: 'state',		ctype: 'number',	crole: 'value.iam_backwards.forecast',				cunit: '%',		cname: 'Incidence Angle Modifier, backwards'},
	{id: 'iam_instant',					type: 'state',		ctype: 'number',	crole: 'value.iam_instant.forecast',				cunit: '%',		cname: 'Incidence Angle Modifier, instant'},
	{id: 'moduletemperature_backwards',	type: 'state',		ctype: 'number',	crole: 'value.moduletemperature_backwards.forecast',				cname: 'Module temperature, backwards'},
	{id: 'moduletemperature_instant',	type: 'state',		ctype: 'number',	crole: 'value.moduletemperature_instant.forecast',					cname: 'Module temperature, instant'},
	{id: 'performanceratio',			type: 'state',		ctype: 'number',	crole: 'value.performanceratio.forecast',			cunit: '%',		cname: 'Performance ratio'},
	{id: 'pvpower_backwards',			type: 'state',		ctype: 'number',	crole: 'value.pvpower_backwards.forecast',							cname: 'Photovoltaic power, backwards'},
	{id: 'pvpower_instant',				type: 'state',		ctype: 'number',	crole: 'value.pvpower_instant.forecast',							cname: 'Photovoltaic power, instant'},
	{id: 'snowcover',					type: 'state',		ctype: 'number',	crole: 'value.snowcover.forecast',					cunit: 'cm',	cname: 'Snowcover, on the PV modules, considers incination'},
	{id: 'time',						type: 'state',		ctype: 'number',	crole: 'date.forecast',												cname: 'Day and time of forecast'}
];
const pvpro_day = [
	{id: 'data_day',					type: 'channel_0',																							cname: 'data day'},
	{id: ['0d', '1d', '2d', '3d', '4d', '5d', '6d'],																																													type: 'channel_1'},
	{id: 'gti_total',					type: 'state',		ctype: 'number',	crole: 'value.gti_total.forecast',					cunit: '%',		cname: 'Global Tilted Irradiance (Radiaton), total'},
	{id: 'pvpower_total',				type: 'state',		ctype: 'number',	crole: 'value.pvpower_total.forecast',								cname: 'Photovoltaic power, total'},
	{id: 'moduletemperature_mean',		type: 'state',		ctype: 'number',	crole: 'value.moduletemperature_mean.forecast',						cname: 'Module temperature'},
	{id: 'snowcover_mean',				type: 'state',		ctype: 'number',	crole: 'value.snowcover_mean.forecast',				cunit: 'cm',	cname: 'Snowcover, on the PV modules, considers incination, mean'},
	{id: 'time',						type: 'state',		ctype: 'number',	crole: 'date.forecast',												cname: 'Day of forecast'}
];
*/

// forecast package: wind-15min (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#wind)
const wind_15min = [
	{id: 'data_xmin',					type: 'channel_0',																							cname: 'data 15min'},
	{id: ['0000', '0015', '0030', '0045', '0100', '0115', '0130', '0145', '0200', '0215', '0230', '0245', '0300', '0315', '0330', '0345', '0400', '0415', '0430', '0445', '0500', '0515', '0530', '0545', '0600', '0615', '0630', '0645', '0700', '0715', '0730', '0745', '0800', '0815', '0830', '0845', '0900', '0915', '0930', '0945', '1000', '1015', '1030', '1045', '1100', '1115', '1130', '1145', '1200', '1215', '1230', '1245', '1300', '1315', '1330', '1345', '1400', '1415', '1430', '1445', '1500', '1515', '1530', '1545', '1600', '1615', '1630', '1645', '1700', '1715', '1730', '1745', '1800', '1815', '1830', '1845', '1900', '1915', '1930', '1945', '2000', '2015', '2030', '2045', '2100', '2115', '2130', '2145', '2200', '2215', '2230', '2245', '2300', '2315', '2330', '2345'], type: 'channel_1'},
	{id: 'airdensity',					type: 'state',		ctype: 'number',	crole: 'value.airdensity.forecast',					cunit: 'kg/m3',	cname: 'Air density (as result of altitude, temperature and humidity)'},
	{id: 'gust',						type: 'state',		ctype: 'number',	crole: 'value.gust.forecast',										cname: 'Wind gusts (10m above ground)'},
	{id: 'winddirection_80mChar2',		type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction (80m above ground), 2 char'},
	{id: 'winddirection_80mChar3',		type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction (80m above ground), 3 char'},
	{id: 'winddirection_80m',			type: 'state',		ctype: 'number',	crole: 'value.winddirection_80m.forecast',							cname: 'Wind direction (80m above ground)'},
	{id: 'windspeed_80m',				type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m.forecast',								cname: 'Wind speed (80m above ground)'},
	{id: 'surfaceairpressure',			type: 'state',		ctype: 'number',	crole: 'value.surfaceairpressure.forecast',							cname: 'Air pressure (at surface height, not converted to sea level)'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'}
];
// forecast package: wind-1h
const wind_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'airdensity',					type: 'state',		ctype: 'number',	crole: 'value.airdensity.forecast',					cunit: 'kg/m3',	cname: 'Air density (as result of altitude, temperature and humidity)'},
	{id: 'gust',						type: 'state',		ctype: 'number',	crole: 'value.gust.forecast',										cname: 'Wind gusts (10m above ground)'},
	{id: 'winddirection_80mChar2',		type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction (80m above ground), 2 char'},
	{id: 'winddirection_80mChar3',		type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction (80m above ground), 3 char'},
	{id: 'winddirection_80m',			type: 'state',		ctype: 'number',	crole: 'value.winddirection_80m.forecast',							cname: 'Wind direction (80m above ground)'},
	{id: 'windspeed_80m',				type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m.forecast',								cname: 'Wind speed (80m above ground)'},
	{id: 'surfaceairpressure',			type: 'state',		ctype: 'number',	crole: 'value.surfaceairpressure.forecast',							cname: 'Air pressure (at surface height, not converted to sea level)'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'}
];
// forecast package: wind-3h
const wind_3h = [
	{id: 'data_3h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0300', '0600', '0900', '1200', '1500', '1800', '2100'], 																																								type: 'channel_1'},
	{id: 'airdensity',					type: 'state',		ctype: 'number',	crole: 'value.airdensity.forecast',					cunit: 'kg/m3',	cname: 'Air density (as result of altitude, temperature and humidity)'},
	{id: 'gust',						type: 'state',		ctype: 'number',	crole: 'value.gust.forecast',										cname: 'Wind gusts (10m above ground)'},
	{id: 'winddirection_80mChar2',		type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction (80m above ground), 2 char'},
	{id: 'winddirection_80mChar3',		type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction (80m above ground), 3 char'},
	{id: 'winddirection_80m',			type: 'state',		ctype: 'number',	crole: 'value.winddirection_80m.forecast',							cname: 'Wind direction (80m above ground)'},
	{id: 'windspeed_80m',				type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m.forecast',								cname: 'Wind speed (80m above ground)'},
	{id: 'surfaceairpressure',			type: 'state',		ctype: 'number',	crole: 'value.surfaceairpressure.forecast',							cname: 'Air pressure (at surface height, not converted to sea level)'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'}
];
// forecast package: wind-day
const wind_day = [
	{id: 'data_day',					type: 'channel_0',																							cname: 'data day'},
	{id: ['0d', '1d', '2d', '3d', '4d', '5d', '6d'],																																													type: 'channel_1'},
	{id: 'airdensity_max',				type: 'state',		ctype: 'number',	crole: 'value.airdensity_max.forecast',				cunit: 'kg/m3',	cname: 'Maximum air density (as result of altitude, temperature and humidity)'},
	{id: 'airdensity_mean',				type: 'state',		ctype: 'number',	crole: 'value.airdensity_mean.forecast',			cunit: 'kg/m3',	cname: 'Mean air density (as result of altitude, temperature and humidity)'},
	{id: 'airdensity_min',				type: 'state',		ctype: 'number',	crole: 'value.airdensity_min.forecast',				cunit: 'kg/m3',	cname: 'Minimum air density (as result of altitude, temperature and humidity)'},
	{id: 'gust_max',					type: 'state',		ctype: 'number',	crole: 'value.gust_max.forecast',									cname: 'Maximum wind gusts (10m above ground)'},
	{id: 'gust_mean',					type: 'state',		ctype: 'number',	crole: 'value.gust_mean.forecast',									cname: 'Mean wind gusts (10m above ground)'},
	{id: 'gust_min',					type: 'state',		ctype: 'number',	crole: 'value.gust_min.forecast',									cname: 'Minimum wind gusts (10m above ground)'},
	{id: 'windspeed_80m_max',			type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_max.forecast',							cname: 'Maximum wind speed (80m above ground)'},
	{id: 'windspeed_80m_mean',			type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_mean.forecast',							cname: 'Mean wind speed (80m above ground)'},
	{id: 'windspeed_80m_min',			type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_min.forecast',							cname: 'Minimum wind speed (80m above ground)'},
	{id: 'winddirection_80mChar2',		type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Maximum wind direction (80m above ground), 2 char'},
	{id: 'winddirection_80mChar3',		type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Mean wind direction (80m above ground), 3 char'},
	{id: 'winddirection_80m',			type: 'state',		ctype: 'number',	crole: 'value.winddirection_80m.forecast',							cname: 'Minimum wind direction (80m above ground)'},
	{id: 'surfaceairpressure_max',		type: 'state',		ctype: 'number',	crole: 'value.surfaceairpressure_max.forecast',						cname: 'Maximum air pressure (at surface height, not converted to sea level)'},
	{id: 'surfaceairpressure_mean',		type: 'state',		ctype: 'number',	crole: 'value.surfaceairpressure_mean.forecast',					cname: 'Mean air pressure (at surface height, not converted to sea level)'},
	{id: 'surfaceairpressure_min',		type: 'state',		ctype: 'number',	crole: 'value.surfaceairpressure_min.forecast',						cname: 'Minimum air pressure (at surface height, not converted to sea level)'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day of forecast'}
];

// forecast package: wind80ensemble-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#wind-80m-ensemble)
const wind80ensemble_1h = [
	{id: 'trend_1h',					type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'windspeed_80m_consensus',		type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_consenus.forecast',						cname: 'Wind speed 80m consensus (80m above ground)'},
	{id: 'windspeed_80m_max',			type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_max.forecast',							cname: 'Maximum wind speed (80m above ground)'},
	{id: 'windspeed_80m_min',			type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_min.forecast',							cname: 'Minimum wind speed (80m above ground)'},
	{id: 'windspeed_80m_p10exceedence',	type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_p10exceedence.forecast',				cname: 'Wind speed 80m p10 exceedence'},
	{id: 'windspeed_80m_p15exceedence',	type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_p15exceedence.forecast',				cname: 'Wind speed 80m p15 exceedence'},
	{id: 'windspeed_80m_p20exceedence',	type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_p20exceedence.forecast',				cname: 'Wind speed 80m p20 exceedence'},
	{id: 'windspeed_80m_p25exceedence',	type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_p25exceedence.forecast',				cname: 'Wind speed 80m p25 exceedence'},
	{id: 'windspeed_80m_p30exceedence',	type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_p30exceedence.forecast',				cname: 'Wind speed 80m p30 exceedence'},
	{id: 'windspeed_80m_p40exceedence',	type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_p40exceedence.forecast',				cname: 'Wind speed 80m p40 exceedence'},
	{id: 'windspeed_80m_p5exceedence',	type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_p5exceedence.forecast',					cname: 'Wind speed 80m p5 exceedence'},
	{id: 'windspeed_80m_p50exceedence',	type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_p50exceedence.forecast',				cname: 'Wind speed 80m p50 exceedence'},
	{id: 'windspeed_80m_p60exceedence',	type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_p60exceedence.forecast',				cname: 'Wind speed 80m p60 exceedence'},
	{id: 'windspeed_80m_p70exceedence',	type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_p70exceedence.forecast',				cname: 'Wind speed 80m p70 exceedence'},
	{id: 'windspeed_80m_p75exceedence',	type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_p75exceedence.forecast',				cname: 'Wind speed 80m p75 exceedence'},
	{id: 'windspeed_80m_p80exceedence',	type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_p80exceedence.forecast',				cname: 'Wind speed 80m p80 exceedence'},
	{id: 'windspeed_80m_p85exceedence',	type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_p85exceedence.forecast',				cname: 'Wind speed 80m p85 exceedence'},
	{id: 'windspeed_80m_p90exceedence',	type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_p90exceedence.forecast',				cname: 'Wind speed 80m p90 exceedence'},
	{id: 'windspeed_80m_p95exceedence',	type: 'state',		ctype: 'number',	crole: 'value.windspeed_80m_p95exceedence.forecast',				cname: 'Wind speed 80m p95 exceedence'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'}
];

// forecast package: windpower-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#wind-power)
/*
const windpower_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'},
	{id: 'windpower',					type: 'state',		ctype: 'number',	crole: 'value.windpower.forecast',					cunit: 'kW',	cname: 'Wind power, 80m above ground'}
];
*/

// forecast package: sea-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#sea)
const sea_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'currentvelocity_u',			type: 'state',		ctype: 'number',	crole: 'value.currentvelocity_u.forecast',			cunit: 'm/s',	cname: 'Current velocity U'},
	{id: 'currentvelocity_v',			type: 'state',		ctype: 'number',	crole: 'value.currentvelocity_v.forecast',			cunit: 'm/s',	cname: 'Current velocity V'},
	{id: 'mean_wavedirection',			type: 'state',		ctype: 'number',	crole: 'value.mean_wavedirection.forecast',			cunit: '°',		cname: 'Mean wave direction'},
	{id: 'mean_waveperiod',				type: 'state',		ctype: 'number',	crole: 'value.mean_waveperiod.forecast',			cunit: 's',		cname: 'Mean wave period'},
	{id: 'salinity',					type: 'state',		ctype: 'number',	crole: 'value.salinity.forecast',					cunit: 'PSA',	cname: 'Salinity'},
	{id: 'seasurfacetemperature',		type: 'state',		ctype: 'number',	crole: 'value.seasurfacetemperature.forecast',						cname: 'Sea surface temperature'},
	{id: 'significantwaveheight',		type: 'state',		ctype: 'number',	crole: 'value.significantwaveheight.forecast',		cunit: 'm',		cname: 'Significant wave height'},
	{id: 'swell_meandirection',			type: 'state',		ctype: 'number',	crole: 'value.swell_meandirection.forecast',		cunit: '°',		cname: 'Mean direction of swell waves'},
	{id: 'swell_meanperiod',			type: 'state',		ctype: 'number',	crole: 'value.swell_meanperiod.forecast',			cunit: 's',		cname: 'Mean period of swell waves'},
	{id: 'swell_peakwaveperiod',		type: 'state',		ctype: 'number',	crole: 'value.swell_peakwaveperiod.forecast',		cunit: 's',		cname: 'Peak wave period of swell waves'},
	{id: 'swell_significantheight',		type: 'state',		ctype: 'number',	crole: 'value.swell_significantheight.forecast',	cunit: 'm',		cname: 'Significant height of swell waves'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'},
	{id: 'windwave_direction',			type: 'state',		ctype: 'number',	crole: 'value.windwave_direction.forecast',			cunit: '°',		cname: 'Wind wave direction'},
	{id: 'windwave_height',				type: 'state',		ctype: 'number',	crole: 'value.windwave_height.forecast',			cunit: 'm',		cname: 'Wind wave height'},
	{id: 'windwave_meanperiod',			type: 'state',		ctype: 'number',	crole: 'value.windwave_meanperiod.forecast',						cname: 'Mean wind wave period'},
	{id: 'windwave_peakwaveperiod',		type: 'state',		ctype: 'number',	crole: 'value.windwave_peakwaveperiod.forecast',	cunit: 's',		cname: 'Peak wave period of wind waves'}
];
const sea_3h = [
	{id: 'data_3h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0300', '0600', '0900', '1200', '1500', '1800', '2100'], 																																								type: 'channel_1'},
	{id: 'currentvelocity_u',			type: 'state',		ctype: 'number',	crole: 'value.currentvelocity_u.forecast',			cunit: 'm/s',	cname: 'Current velocity U'},
	{id: 'currentvelocity_v',			type: 'state',		ctype: 'number',	crole: 'value.currentvelocity_v.forecast',			cunit: 'm/s',	cname: 'Current velocity V'},
	{id: 'mean_wavedirection',			type: 'state',		ctype: 'number',	crole: 'value.mean_wavedirection.forecast',			cunit: '°',		cname: 'Mean wave direction'},
	{id: 'mean_waveperiod',				type: 'state',		ctype: 'number',	crole: 'value.mean_waveperiod.forecast',			cunit: 's',		cname: 'Mean wave period'},
	{id: 'salinity',					type: 'state',		ctype: 'number',	crole: 'value.salinity.forecast',					cunit: 'PSA',	cname: 'Salinity'},
	{id: 'seasurfacetemperature',		type: 'state',		ctype: 'number',	crole: 'value.seasurfacetemperature.forecast',						cname: 'Sea surface temperature'},
	{id: 'significantwaveheight',		type: 'state',		ctype: 'number',	crole: 'value.significantwaveheight.forecast',		cunit: 'm',		cname: 'Significant wave height'},
	{id: 'swell_meandirection',			type: 'state',		ctype: 'number',	crole: 'value.swell_meandirection.forecast',		cunit: '°',		cname: 'Mean direction of swell waves'},
	{id: 'swell_meanperiod',			type: 'state',		ctype: 'number',	crole: 'value.swell_meanperiod.forecast',			cunit: 's',		cname: 'Mean period of swell waves'},
	{id: 'swell_peakwaveperiod',		type: 'state',		ctype: 'number',	crole: 'value.swell_peakwaveperiod.forecast',		cunit: 's',		cname: 'Peak wave period of swell waves'},
	{id: 'swell_significantheight',		type: 'state',		ctype: 'number',	crole: 'value.swell_significantheight.forecast',	cunit: 'm',		cname: 'Significant height of swell waves'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'},
	{id: 'windwave_direction',			type: 'state',		ctype: 'number',	crole: 'value.windwave_direction.forecast',			cunit: '°',		cname: 'Wind wave direction'},
	{id: 'windwave_height',				type: 'state',		ctype: 'number',	crole: 'value.windwave_height.forecast',			cunit: 'm',		cname: 'Wind wave height'},
	{id: 'windwave_meanperiod',			type: 'state',		ctype: 'number',	crole: 'value.windwave_meanperiod.forecast',						cname: 'Mean wind wave period'},
	{id: 'windwave_peakwaveperiod',		type: 'state',		ctype: 'number',	crole: 'value.windwave_peakwaveperiod.forecast',	cunit: 's',		cname: 'Peak wave period of wind waves'}
];
const sea_day = [
	{id: 'data_day',					type: 'channel_0',																							cname: 'data day'},
	{id: ['0d', '1d', '2d', '3d', '4d', '5d', '6d'],																																													type: 'channel_1'},
	{id: 'currentvelocity_u_max',		type: 'state',		ctype: 'number',	crole: 'value.currentvelocity_u_max.forecast',		cunit: 'm/s',	cname: 'Maximum velocity on longitude-axis'},
	{id: 'currentvelocity_u_mean',		type: 'state',		ctype: 'number',	crole: 'value.currentvelocity_u_mean.forecast',		cunit: 'm/s',	cname: 'Mean velocity on longitude-axis'},
	{id: 'currentvelocity_u_min',		type: 'state',		ctype: 'number',	crole: 'value.currentvelocity_u_min.forecast',		cunit: 'm/s',	cname: 'Minimum velocity on longitude-axis'},
	{id: 'currentvelocity_v_max',		type: 'state',		ctype: 'number',	crole: 'value.currentvelocity_v_max.forecast',		cunit: 'm/s',	cname: 'Maximum velocity on latitude-axis'},
	{id: 'currentvelocity_v_mean',		type: 'state',		ctype: 'number',	crole: 'value.currentvelocity_v_mean.forecast',		cunit: 'm/s',	cname: 'Mean velocity on latitude-axis'},
	{id: 'currentvelocity_v_min',		type: 'state',		ctype: 'number',	crole: 'value.currentvelocity_v_min.forecast',		cunit: 'm/s',	cname: 'Minimum velocity on latitude-axis'},
	{id: 'mean_wavedirection_dominant',	type: 'state',		ctype: 'number',	crole: 'value.mean_wavedirection_dominant.forecast',cunit: '°',		cname: 'Dominant wave direction'},
	{id: 'mean_waveperiod_max',			type: 'state',		ctype: 'number',	crole: 'value.mean_waveperiod_max.forecast',		cunit: 's',		cname: 'Maximum wave period'},
	{id: 'mean_waveperiod_mean',		type: 'state',		ctype: 'number',	crole: 'value.mean_waveperiod_mean.forecast',		cunit: 's',		cname: 'Mean wave period'},
	{id: 'mean_waveperiod_min',			type: 'state',		ctype: 'number',	crole: 'value.mean_waveperiod_min.forecast',		cunit: 's',		cname: 'Minimum wave period'},
	{id: 'salinity_mean',				type: 'state',		ctype: 'number',	crole: 'value.salinity_mean.forecast',				cunit: 'PSA',	cname: 'Mean practical salinity unit'},
	{id: 'seasurfacetemperature_mean',	type: 'state',		ctype: 'number',	crole: 'value.seasurfacetemperature_mean.forecast',					cname: 'Mean sea surface temperature'},
	{id: 'significantwaveheight_max',	type: 'state',		ctype: 'number',	crole: 'value.significantwaveheight_max.forecast',	cunit: 'm',		cname: 'Maximum significant wave height'},
	{id: 'significantwaveheight_mean',	type: 'state',		ctype: 'number',	crole: 'value.significantwaveheight_mean.forecast',	cunit: 'm',		cname: 'Mean significant wave height'},
	{id: 'significantwaveheight_min',	type: 'state',		ctype: 'number',	crole: 'value.significantwaveheight_min.forecast',	cunit: 'm',		cname: 'Minimum significant wave height'},
	{id: 'swell_meandirection_dominant',type: 'state',		ctype: 'number',	crole: 'value.swell_meandirection_dominant.forecast',	cunit: '°',	cname: 'Dominant mean wave direction'},
	{id: 'swell_meanperiod_max',		type: 'state',		ctype: 'number',	crole: 'value.swell_meanperiod_max.forecast',		cunit: 's',		cname: 'Maximum mean swell wave period'},
	{id: 'swell_meanperiod_mean',		type: 'state',		ctype: 'number',	crole: 'value.swell_meanperiod_mean.forecast',		cunit: 's',		cname: 'Mean mean swell wave period'},
	{id: 'swell_meanperiod_min',		type: 'state',		ctype: 'number',	crole: 'value.swell_meanperiod_min.forecast',		cunit: 's',		cname: 'Minimum mean swell wave period'},
	{id: 'swell_peakwaveperiod_max',	type: 'state',		ctype: 'number',	crole: 'value.swell_peakwaveperiod_max.forecast',	cunit: 's',		cname: 'Maximum peak swell wave period'},
	{id: 'swell_peakwaveperiod_mean',	type: 'state',		ctype: 'number',	crole: 'value.swell_peakwaveperiod_mean.forecast',	cunit: 's',		cname: 'Mean peak swell wave period'},
	{id: 'swell_peakwaveperiod_min',	type: 'state',		ctype: 'number',	crole: 'value.swell_peakwaveperiod_min.forecast',	cunit: 's',		cname: 'Minimum peak swell wave period'},
	{id: 'swell_significantheight_max',	type: 'state',		ctype: 'number',	crole: 'value.swell_significantheight_max.forecast',cunit: 'm',		cname: 'Maximum significant swell wave height'},
	{id: 'swell_significantheight_mean',type: 'state',		ctype: 'number',	crole: 'value.swell_significantheight_mean.forecast',	cunit: 'm',	cname: 'Mean significant swell wave height'},
	{id: 'swell_significantheight_min',	type: 'state',		ctype: 'number',	crole: 'value.swell_significantheight_min.forecast',cunit: 'm',		cname: 'Minimum significant swell wave height'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day of forecast'},
	{id: 'windwave_direction_dominant',	type: 'state',		ctype: 'number',	crole: 'value.windwave_direction_dominant.forecast',cunit: '°',		cname: 'Dominant wind wave direction'},
	{id: 'windwave_height_max',			type: 'state',		ctype: 'number',	crole: 'value.windwave_height_max.forecast',		cunit: 'm',		cname: 'Maximum wind wave height'},
	{id: 'windwave_height_mean',		type: 'state',		ctype: 'number',	crole: 'value.windwave_height_mean.forecast',		cunit: 'm',		cname: 'Mean wind wave height'},
	{id: 'windwave_height_min',			type: 'state',		ctype: 'number',	crole: 'value.windwave_height_min.forecast',		cunit: 'm',		cname: 'Minimum wind wave height'},
	{id: 'windwave_meanperiod_max',		type: 'state',		ctype: 'number',	crole: 'value.windwave_meanperiod_max.forecast',	cunit: 's',		cname: 'Maximum mean wind wave period'},
	{id: 'windwave_meanperiod_mean',	type: 'state',		ctype: 'number',	crole: 'value.windwave_meanperiod_mean.forecast',	cunit: 's',		cname: 'Mean mean wind wave period'},
	{id: 'windwave_meanperiod_min',		type: 'state',		ctype: 'number',	crole: 'value.windwave_meanperiod_min.forecast',	cunit: 's',		cname: 'Minimum mean wind wave period'},
	{id: 'windwave_peakwaveperiod_max',	type: 'state',		ctype: 'number',	crole: 'value.windwave_peakwaveperiod_max.forecast',cunit: 's',		cname: 'Maximum peak wave period'},
	{id: 'windwave_peakwaveperiod_mean',type: 'state',		ctype: 'number',	crole: 'value.windwave_peakwaveperiod_mean.forecast',	cunit: 's',	cname: 'Mean peak wave period'},
	{id: 'windwave_peakwaveperiod_min',	type: 'state',		ctype: 'number',	crole: 'value.windwave_peakwaveperiod_min.forecast',cunit: 's',		cname: 'Minimum pewk wave period'}
];

// forcast package: air (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#air)
const air_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'boundarylayerheight',			type: 'state',		ctype: 'number',	crole: 'value.boundarylayerheight.forecast',		cunit: 'm',		cname: 'Bounday layer height'},
	{id: 'cape',						type: 'state',		ctype: 'number',	crole: 'value.cape.forecast',						cunit: 'J/kg',	cname: 'Convective available potential Energy'},
	{id: 'cloudice',					type: 'state',		ctype: 'number',	crole: 'value.cloudice.forecast',					cunit: 'g',		cname: 'Cloud ice'},
	{id: 'cloudwater',					type: 'state',		ctype: 'number',	crole: 'value.cloudwater.forecast',					cunit: 'g',		cname: 'Cloud water'},
	{id: 'convectiveinhibition',		type: 'state',		ctype: 'number',	crole: 'value.convectiveinhibition.forecast',		cunit: 'm',		cname: 'Convective inhibition'},
	{id: 'freezinglevelheight',			type: 'state',		ctype: 'number',	crole: 'value.freezinglevelheigh.forecast',			cunit: 'm',		cname: 'Freezing level height'},
	{id: 'helicity',					type: 'state',		ctype: 'number',	crole: 'value.helicity.forecast',					cunit: 'm2s-2',	cname: 'Helicity'},
	{id: 'liftedindex',					type: 'state',		ctype: 'number',	crole: 'value.liftedindex.forecast',				cunit: 'J/kg',	cname: 'Lifted index'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'}
];
const air_3h = [
	{id: 'data_3h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0300', '0600', '0900', '1200', '1500', '1800', '2100'], 																																								type: 'channel_1'},
	{id: 'boundarylayerheight',			type: 'state',		ctype: 'number',	crole: 'value.boundarylayerheight.forecast',		cunit: 'm',		cname: 'Bounday layer height'},
	{id: 'cape',						type: 'state',		ctype: 'number',	crole: 'value.cape.forecast',						cunit: 'J/kg',	cname: 'Convective available potential Energy'},
	{id: 'cloudice',					type: 'state',		ctype: 'number',	crole: 'value.cloudice.forecast',					cunit: 'g',		cname: 'Cloud ice'},
	{id: 'cloudwater',					type: 'state',		ctype: 'number',	crole: 'value.cloudwater.forecast',					cunit: 'g',		cname: 'Cloud water'},
	{id: 'convectiveinhibition',		type: 'state',		ctype: 'number',	crole: 'value.convectiveinhibition.forecast',		cunit: 'm',		cname: 'Convective inhibition'},
	{id: 'freezinglevelheight',			type: 'state',		ctype: 'number',	crole: 'value.freezinglevelheigh.forecast',			cunit: 'm',		cname: 'Freezing level height'},
	{id: 'helicity',					type: 'state',		ctype: 'number',	crole: 'value.helicity.forecast',					cunit: 'm2s-2',	cname: 'Helicity'},
	{id: 'liftedindex',					type: 'state',		ctype: 'number',	crole: 'value.liftedindex.forecast',				cunit: 'J/kg',	cname: 'Lifted index'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'}
];
const air_day = [
	{id: 'data_day',					type: 'channel_0',																							cname: 'data day'},
	{id: ['0d', '1d', '2d', '3d', '4d', '5d', '6d'],																																													type: 'channel_1'},
	{id: 'boundarylayerheight_max',		type: 'state',		ctype: 'number',	crole: 'value.boundarylayerheight_max.forecast',	cunit: 'm',		cname: 'Maximum bounday layer height'},
	{id: 'boundarylayerheight_mean',	type: 'state',		ctype: 'number',	crole: 'value.boundarylayerheight_mean.forecast',	cunit: 'm',		cname: 'Mean bounday layer height'},
	{id: 'boundarylayerheight_min',		type: 'state',		ctype: 'number',	crole: 'value.boundarylayerheight_min.forecast',	cunit: 'm',		cname: 'Minimum bounday layer height'},
	{id: 'cape_max',					type: 'state',		ctype: 'number',	crole: 'value.cape_max.forecast',					cunit: 'J/kg',	cname: 'Maximum convective available potential Energy'},
	{id: 'cape_mean',					type: 'state',		ctype: 'number',	crole: 'value.cape_mean.forecast',					cunit: 'J/kg',	cname: 'Mean convective available potential Energy'},
	{id: 'cape_min',					type: 'state',		ctype: 'number',	crole: 'value.cape_min.forecast',					cunit: 'J/kg',	cname: 'Minimum convective available potential Energy'},
	{id: 'cloudice_max',				type: 'state',		ctype: 'number',	crole: 'value.cloudice_max.forecast',				cunit: 'g',		cname: 'Maximum cloud ice'},
	{id: 'cloudice_mean',				type: 'state',		ctype: 'number',	crole: 'value.cloudice_mean.forecast',				cunit: 'g',		cname: 'Mean cloud ice'},
	{id: 'cloudice_min',				type: 'state',		ctype: 'number',	crole: 'value.cloudice_min.forecast',				cunit: 'g',		cname: 'Minimum cloud ice'},
	{id: 'cloudwater_max',				type: 'state',		ctype: 'number',	crole: 'value.cloudwater_max.forecast',				cunit: 'g',		cname: 'Maximum cloud water'},
	{id: 'cloudwater_mean',				type: 'state',		ctype: 'number',	crole: 'value.cloudwater_mean.forecast',			cunit: 'g',		cname: 'Mean cloud water'},
	{id: 'cloudwater_min',				type: 'state',		ctype: 'number',	crole: 'value.cloudwater_min.forecast',				cunit: 'g',		cname: 'Minimum cloud water'},
	{id: 'convectiveinhibition_max',	type: 'state',		ctype: 'number',	crole: 'value.convectiveinhibition_max.forecast',	cunit: 'm',		cname: 'Maximum convective inhibition'},
	{id: 'convectiveinhibition_mean',	type: 'state',		ctype: 'number',	crole: 'value.convectiveinhibition_mean.forecast',	cunit: 'm',		cname: 'Mean convective inhibition'},
	{id: 'convectiveinhibition_min',	type: 'state',		ctype: 'number',	crole: 'value.convectiveinhibition_min.forecast',	cunit: 'm',		cname: 'Minimum convective inhibition'},
	{id: 'freezinglevelheight_max',		type: 'state',		ctype: 'number',	crole: 'value.freezinglevelheight_max.forecast',	cunit: 'm',		cname: 'Maximum freezing level height'},
	{id: 'freezinglevelheight_mean',	type: 'state',		ctype: 'number',	crole: 'value.freezinglevelheight_mean.forecast',	cunit: 'm',		cname: 'Mean freezing level height'},
	{id: 'freezinglevelheight_min',		type: 'state',		ctype: 'number',	crole: 'value.freezinglevelheight_min.forecast',	cunit: 'm',		cname: 'Minimum freezing level height'},
	{id: 'helicity_max',				type: 'state',		ctype: 'number',	crole: 'value.helicity_max.forecast',				cunit: 'm2s-2',	cname: 'Maximum helicity'},
	{id: 'helicity_mean',				type: 'state',		ctype: 'number',	crole: 'value.helicity_mean.forecast',				cunit: 'm2s-2',	cname: 'Mean helicity'},
	{id: 'helicity_min',				type: 'state',		ctype: 'number',	crole: 'value.helicity_min.forecast',				cunit: 'm2s-2',	cname: 'Minimum helicity'},
	{id: 'liftedindex_max',				type: 'state',		ctype: 'number',	crole: 'value.liftedindex_max.forecast',			cunit: 'J/kg',	cname: 'Maximum lifted index'},
	{id: 'liftedindex_mean',			type: 'state',		ctype: 'number',	crole: 'value.liftedindex_mean.forecast',			cunit: 'J/kg',	cname: 'Mean lifted index'},
	{id: 'liftedindex_min',				type: 'state',		ctype: 'number',	crole: 'value.liftedindex_min.forecast',			cunit: 'J/kg',	cname: 'Minimum lifted index'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day of forecast'}
];

// forecast package: airquality (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#air-quality)
const airquality_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'airqualityindex',				type: 'state',		ctype: 'number',	crole: 'value.airqualityindex.forecast',							cname: 'Air quality index (2m above ground)'},
	{id: 'aod550',						type: 'state',		ctype: 'number',	crole: 'value.aod550.forecast',						cunit: 'ug/m3',	cname: 'AOD500 concentration (aerosol optical depth at 550nm, 2m above ground)'},
	{id: 'co',							type: 'state',		ctype: 'number',	crole: 'value.co.forecast',							cunit: 'ug/m3',	cname: 'CO conentration (carbon monoxide, 2m above ground)'},
	{id: 'dust_concentration',			type: 'state',		ctype: 'number',	crole: 'value.dust_concentration.forecast',			cunit: 'ug/m3',	cname: 'Dust concentration (2m above ground)'},
	{id: 'no2',							type: 'state',		ctype: 'number',	crole: 'value.no2.forecast',						cunit: 'ug/m3',	cname: 'NO2 concentration (nitrogen dioxide, 2m above ground)'},
	{id: 'ozone',						type: 'state',		ctype: 'number',	crole: 'value.ozone.forecast',						cunit: 'ug/m3',	cname: 'Ozone concentration (2m above ground)'},
	{id: 'pm10',						type: 'state',		ctype: 'number',	crole: 'value.pm10.forecast',						cunit: 'ug/m3',	cname: 'PM10 concentration (particulate matter, 2m above ground)'},
	{id: 'pm25',						type: 'state',		ctype: 'number',	crole: 'value.pm25.forecast',						cunit: 'ug/m3',	cname: 'PM2.5 concentration (particulate matter, 2m above ground)'},
	{id: 'pollen_birch',				type: 'state',		ctype: 'number',	crole: 'value.pollen_birch.forecast',				cunit: 'ug/m3',	cname: 'Birch pollen (Europe only, 2m above ground)'},
	{id: 'pollen_grass',				type: 'state',		ctype: 'number',	crole: 'value.pollen_grass.forecast',				cunit: 'ug/m3',	cname: 'Grass pollen (Europe only, 2m above ground)'},
	{id: 'pollen_olive',				type: 'state',		ctype: 'number',	crole: 'value.pollen_olive.forecast',				cunit: 'ug/m3',	cname: 'Olive pollen (Europe only, 2m above ground)'},
	{id: 'sandstorm_alert',				type: 'state',		ctype: 'number',	crole: 'value.sandstorm_alert.forecast',							cname: 'Sandstorm alert (2m above ground)'},
	{id: 'so2',							type: 'state',		ctype: 'number',	crole: 'value.so2.forecast',						cunit: 'ug/m3',	cname: 'SO2 concentration (sulphur dioxide, 2m above ground)'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',								cunit: 'ug/m3',	cname: 'Day and time of forecast'}
];
const airquality_3h = [
	{id: 'data_3h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0300', '0600', '0900', '1200', '1500', '1800', '2100'], 																																								type: 'channel_1'},
	{id: 'airqualityindex',				type: 'state',		ctype: 'number',	crole: 'value.airqualityindex.forecast',							cname: 'Air quality index (2m above ground)'},
	{id: 'aod550',						type: 'state',		ctype: 'number',	crole: 'value.aod550.forecast',						cunit: 'ug/m3',	cname: 'AOD500 concentration (aerosol optical depth at 550nm, 2m above ground)'},
	{id: 'co',							type: 'state',		ctype: 'number',	crole: 'value.co.forecast',							cunit: 'ug/m3',	cname: 'CO conentration (carbon monoxide, 2m above ground)'},
	{id: 'dust_concentration',			type: 'state',		ctype: 'number',	crole: 'value.dust_concentration.forecast',			cunit: 'ug/m3',	cname: 'Dust concentration (2m above ground)'},
	{id: 'no2',							type: 'state',		ctype: 'number',	crole: 'value.no2.forecast',						cunit: 'ug/m3',	cname: 'NO2 concentration (nitrogen dioxide, 2m above ground)'},
	{id: 'ozone',						type: 'state',		ctype: 'number',	crole: 'value.ozone.forecast',						cunit: 'ug/m3',	cname: 'Ozone concentration (2m above ground)'},
	{id: 'pm10',						type: 'state',		ctype: 'number',	crole: 'value.pm10.forecast',						cunit: 'ug/m3',	cname: 'PM10 concentration (particulate matter, 2m above ground)'},
	{id: 'pm25',						type: 'state',		ctype: 'number',	crole: 'value.pm25.forecast',						cunit: 'ug/m3',	cname: 'PM2.5 concentration (particulate matter, 2m above ground)'},
	{id: 'pollen_birch',				type: 'state',		ctype: 'number',	crole: 'value.pollen_birch.forecast',				cunit: 'ug/m3',	cname: 'Birch pollen (Europe only, 2m above ground)'},
	{id: 'pollen_grass',				type: 'state',		ctype: 'number',	crole: 'value.pollen_grass.forecast',				cunit: 'ug/m3',	cname: 'Grass pollen (Europe only, 2m above ground)'},
	{id: 'pollen_olive',				type: 'state',		ctype: 'number',	crole: 'value.pollen_olive.forecast',				cunit: 'ug/m3',	cname: 'Olive pollen (Europe only, 2m above ground)'},
	{id: 'sandstorm_alert',				type: 'state',		ctype: 'number',	crole: 'value.sandstorm_alert.forecast',							cname: 'Sandstorm alert (2m above ground)'},
	{id: 'so2',							type: 'state',		ctype: 'number',	crole: 'value.so2.forecast',						cunit: 'ug/m3',	cname: 'SO2 concentration (sulphur dioxide, 2m above ground)'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',								cunit: 'ug/m3',	cname: 'Day and time of forecast'}
];
const airquality_day = [
	{id: 'data_day',					type: 'channel_0',																							cname: 'data day'},
	{id: ['0d', '1d', '2d', '3d', '4d', '5d', '6d'],																																													type: 'channel_1'},
	{id: 'airqualityindex_max',			type: 'state',		ctype: 'number',	crole: 'value.airqualityindex_max.forecast',						cname: 'Maximum air quality index (2m above ground)'},
	{id: 'airqualityindex_mean',		type: 'state',		ctype: 'number',	crole: 'value.airqualityindex_mean.forecast',						cname: 'Mean air quality index (2m above ground)'},
	{id: 'airqualityindex_min',			type: 'state',		ctype: 'number',	crole: 'value.airqualityindex_min.forecast',						cname: 'Minimum air quality index (2m above ground)'},
	{id: 'aod550_max',					type: 'state',		ctype: 'number',	crole: 'value.aod550_max.forecast',					cunit: 'ug/m3',	cname: 'Maximunm AOD500 concentration (aerosol optical depth at 550nm, 2m above ground)'},
	{id: 'aod550_mean',					type: 'state',		ctype: 'number',	crole: 'value.aod550_mean.forecast',				cunit: 'ug/m3',	cname: 'Mean AOD500 concentration (aerosol optical depth at 550nm, 2m above ground)'},
	{id: 'aod550_min',					type: 'state',		ctype: 'number',	crole: 'value.aod550_min.forecast',					cunit: 'ug/m3',	cname: 'Minimum AOD500 concentration (aerosol optical depth at 550nm, 2m above ground)'},
	{id: 'dust_concentration_max',		type: 'state',		ctype: 'number',	crole: 'value.dust_concentration_max.forecast',		cunit: 'ug/m3',	cname: 'Maximum dust concentration (2m above ground)'},
	{id: 'dust_concentration_mean',		type: 'state',		ctype: 'number',	crole: 'value.dust_concentration_mean.forecast',	cunit: 'ug/m3',	cname: 'Mean dust concentration (2m above ground)'},
	{id: 'dust_concentration_min',		type: 'state',		ctype: 'number',	crole: 'value.dust_concentration_min.forecast',		cunit: 'ug/m3',	cname: 'Minimum dust concentration (2m above ground)'},
	{id: 'ozone_max',					type: 'state',		ctype: 'number',	crole: 'value.ozone_max.forecast',					cunit: 'ug/m3',	cname: 'Maximum ozone concentration (2m above ground)'},
	{id: 'ozone_mean',					type: 'state',		ctype: 'number',	crole: 'value.ozone_mean.forecast',					cunit: 'ug/m3',	cname: 'Mean ozone concentration (2m above ground)'},
	{id: 'ozone_min',					type: 'state',		ctype: 'number',	crole: 'value.ozone_min.forecast',					cunit: 'ug/m3',	cname: 'Minimum ozone concentration (2m above ground)'},
	{id: 'pm10_max',					type: 'state',		ctype: 'number',	crole: 'value.pm10_max.forecast',					cunit: 'ug/m3',	cname: 'Maximum PM10 concentration (particulate matter, 2m above ground)'},
	{id: 'pm10_mean',					type: 'state',		ctype: 'number',	crole: 'value.pm10_mean.forecast',					cunit: 'ug/m3',	cname: 'Mean PM10 concentration (particulate matter, 2m above ground)'},
	{id: 'pm10_min',					type: 'state',		ctype: 'number',	crole: 'value.pm10_min.forecast',					cunit: 'ug/m3',	cname: 'Minimum PM10 concentration (particulate matter, 2m above ground)'},
	{id: 'pm25_max',					type: 'state',		ctype: 'number',	crole: 'value.pm25_max.forecast',					cunit: 'ug/m3',	cname: 'Maximum PM2.5 concentration (particulate matter, 2m above ground)'},
	{id: 'pm25_mean',					type: 'state',		ctype: 'number',	crole: 'value.pm25_mean.forecast',					cunit: 'ug/m3',	cname: 'Mean PM2.5 concentration (particulate matter, 2m above ground)'},
	{id: 'pm25_min',					type: 'state',		ctype: 'number',	crole: 'value.pm25_min.forecast',					cunit: 'ug/m3',	cname: 'Minimum PM2.5 concentration (particulate matter, 2m above ground)'},
	{id: 'sandstorm_alert',				type: 'state',		ctype: 'number',	crole: 'value.sandstorm_alert.forecast',							cname: 'Sandstorm alert (2m above ground)'},
	{id: 'so2_max',						type: 'state',		ctype: 'number',	crole: 'value.so2_max.forecast',					cunit: 'ug/m3',	cname: 'Maximum SO2 concentration (sulphur dioxide, 2m above ground)'},
	{id: 'so2_mean',					type: 'state',		ctype: 'number',	crole: 'value.so2_mean.forecast',					cunit: 'ug/m3',	cname: 'Mean SO2 concentration (sulphur dioxide, 2m above ground)'},
	{id: 'so2_min',						type: 'state',		ctype: 'number',	crole: 'value.so2_min.forecast',					cunit: 'ug/m3',	cname: 'Minimum SO2 concentration (sulphur dioxide, 2m above ground)'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day of forecast'}
];

// forecast package: sigmalevel-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#sigma-level)
/*
const sigmalevel_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'airdensity',					type: 'state',		ctype: 'number',	crole: 'value.airdensity.forecast',					cunit: 'kg/m3',	cname: 'Air density'},
	{id: 'relativehumidity',			type: 'state',		ctype: 'number',	crole: 'value.relativehumidity.forecast',			cunit: '%',		cname: 'Air humidity'},
	{id: 'temperature',					type: 'state',		ctype: 'number',	crole: 'value.temperature.forecast',								cname: 'Temperature'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'},
	{id: 'winddirectionChar2',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction, 2 char'},
	{id: 'winddirectionChar3',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction, 3 char'},
	{id: 'winddirection',				type: 'state',		ctype: 'number',	crole: 'weather.direction.wind.forecast',			cunit: '°',		cname: 'Wind direction, degree'},
	{id: 'windspeed',					type: 'state',		ctype: 'number',	crole: 'value.windspeed.forecast',									cname: 'Wind speed'}
];
const sigmalevel_day = [
	{id: 'trend_day',					type: 'channel_0',																							cname: 'data day'},
	{id: ['0d', '1d', '2d', '3d', '4d', '5d', '6d'],																																													type: 'channel_1'},
	{id: 'airdensitdy_max',				type: 'state',		ctype: 'number',	crole: 'value.airdensitdy_max.forecast',			cunit: 'kg/m3',	cname: 'Maximum air density'},
	{id: 'airdensity_mean',				type: 'state',		ctype: 'number',	crole: 'value.airdensitdy_mean.forecast',			cunit: 'kg/m3',	cname: 'Mean air density'},
	{id: 'airdensity_min',				type: 'state',		ctype: 'number',	crole: 'value.airdensitdy_min.forecast',			cunit: 'kg/m3',	cname: 'Minimum air density'},
	{id: 'relativehumidity_max',		type: 'state',		ctype: 'number',	crole: 'value.relativehumidity_max.forecast',		cunit: '%',		cname: 'Maximum relative humidity'},
	{id: 'relativehumidity_mean',		type: 'state',		ctype: 'number',	crole: 'value.relativehumidity_mean.forecast',		cunit: '%',		cname: 'Mean relative humidity'},
	{id: 'relativehumidity_min',		type: 'state',		ctype: 'number',	crole: 'value.relativehumidity_min.forecast',		cunit: '%',		cname: 'Minimum relative humidity'},
	{id: 'temperature_max',				type: 'state',		ctype: 'number',	crole: 'value.temperature_max.forecast',							cname: 'Maximum temperature'},
	{id: 'temperature_mean',			type: 'state',		ctype: 'number',	crole: 'value.temperature_mean.forecast',							cname: 'Mean temperature'},
	{id: 'temperature_min',				type: 'state',		ctype: 'number',	crole: 'value.temperature_min.forecast',							cname: 'Minimum temperature'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day of forecast'},
	{id: 'winddirection_dominant',		type: 'state',		ctype: 'number',	crole: 'value.winddirection_dominant.forecast',		cunit: '°',		cname: 'Dominant wind direction'},
	{id: 'windspeed_max',				type: 'state',		ctype: 'number',	crole: 'value.windspeed_max.forecast',								cname: 'Maximum wind speed'},
	{id: 'windspeed_mean',				type: 'state',		ctype: 'number',	crole: 'value.windspeed_mean.forecast',								cname: 'Mean wind speed'},
	{id: 'windspeed_min',				type: 'state',		ctype: 'number',	crole: 'value.windspeed_min.forecast',								cname: 'Minimum wind speed'}
];
*/

// forecast package: profiletemp-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#profile-series-temperature)
/*
const profiletemp_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'temperatureprofile_1000_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_1000_mb.forecast',					cname: 'Temperature profile	1000mb'},
	{id: 'temperatureprofile_975_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_975_mb.forecast',					cname: 'Temperature profile	975mb'},
	{id: 'temperatureprofile_950_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_950_mb.forecast',					cname: 'Temperature profile	950mb'},
	{id: 'temperatureprofile_925_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_925_mb.forecast',					cname: 'Temperature profile	925mb'},
	{id: 'temperatureprofile_900_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_900_mb.forecast',					cname: 'Temperature profile	900mb'},
	{id: 'temperatureprofile_875_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_875_mb.forecast',					cname: 'Temperature profile	875mb'},
	{id: 'temperatureprofile_850_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_850_mb.forecast',					cname: 'Temperature profile	850mb'},
	{id: 'temperatureprofile_800_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_800_mb.forecast',					cname: 'Temperature profile	800mb'},
	{id: 'temperatureprofile_750_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_750_mb.forecast',					cname: 'Temperature profile	750mb'},
	{id: 'temperatureprofile_700_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_700_mb.forecast',					cname: 'Temperature profile	700mb'},
	{id: 'temperatureprofile_650_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_650_mb.forecast',					cname: 'Temperature profile	650mb'},
	{id: 'temperatureprofile_600_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_600_mb.forecast',					cname: 'Temperature profile	600mb'},
	{id: 'temperatureprofile_550_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_550_mb.forecast',					cname: 'Temperature profile	550mb'},
	{id: 'temperatureprofile_500_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_500_mb.forecast',					cname: 'Temperature profile	500mb'},
	{id: 'temperatureprofile_450_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_450_mb.forecast',					cname: 'Temperature profile	450mb'},
	{id: 'temperatureprofile_400_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_400_mb.forecast',					cname: 'Temperature profile	400mb'},
	{id: 'temperatureprofile_350_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_350_mb.forecast',					cname: 'Temperature profile	350mb'},
	{id: 'temperatureprofile_300_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_300_mb.forecast',					cname: 'Temperature profile	300mb'},
	{id: 'temperatureprofile_250_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_250_mb.forecast',					cname: 'Temperature profile	250mb'},
	{id: 'temperatureprofile_200_mb',	type: 'state',		ctype: 'number',	crole: 'value.temperatureprofile_200_mb.forecast',					cname: 'Temperature profile	200mb'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'}
];
*/

// forecast package: profileheight-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#profile-series-geopotential-height)
/*
const profileheight_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'heightprofile_1000_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_1000_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 1000mb'},
	{id: 'heightprofile_975_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_975_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 975mb'},
	{id: 'heightprofile_950_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_950_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 950mb'},
	{id: 'heightprofile_925_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_925_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 925mb'},
	{id: 'heightprofile_900_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_900_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 900mb'},
	{id: 'heightprofile_875_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_875_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 875mb'},
	{id: 'heightprofile_850_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_850_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 850mb'},
	{id: 'heightprofile_800_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_800_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 800mb'},
	{id: 'heightprofile_750_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_750_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 7250mb'},
	{id: 'heightprofile_700_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_700_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 700mb'},
	{id: 'heightprofile_650_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_650_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 650mb'},
	{id: 'heightprofile_600_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_600_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 600mb'},
	{id: 'heightprofile_550_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_550_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 550mb'},
	{id: 'heightprofile_500_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_500_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 500mb'},
	{id: 'heightprofile_450_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_450_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 450mb'},
	{id: 'heightprofile_400_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_400_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 400mb'},
	{id: 'heightprofile_350_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_350_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 350mb'},
	{id: 'heightprofile_300_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_300_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 300mb'},
	{id: 'heightprofile_250_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_250_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 250mb'},
	{id: 'heightprofile_200_mb',		type: 'state',		ctype: 'number',	crole: 'value.heightprofile_200_mb.forecast',		cunit: 'gpm',	cname: 'Geopotential height profile 200mb'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'},
];
*/

// forecast package: profilewind-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#profile-series-wind)
/*
const profilewind_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'},
	{id: 'winddirectionprofile1000_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile1000_mb.forecast',cunit: '°',		cname: 'Wind direction profile 1000mb'},
	{id: 'winddirectionprofile975_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile975_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 975mb'},
	{id: 'winddirectionprofile950_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile950_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 950mb'},
	{id: 'winddirectionprofile925_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile925_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 925mb'},
	{id: 'winddirectionprofile900_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile900_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 900mb'},
	{id: 'winddirectionprofile875_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile875_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 875mb'},
	{id: 'winddirectionprofile850_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile850_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 850mb'},
	{id: 'winddirectionprofile800_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile800_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 800mb'},
	{id: 'winddirectionprofile750_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile750_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 750mb'},
	{id: 'winddirectionprofile700_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile700_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 700mb'},
	{id: 'winddirectionprofile650_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile650_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 650mb'},
	{id: 'winddirectionprofile600_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile600_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 600mb'},
	{id: 'winddirectionprofile550_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile550_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 550mb'},
	{id: 'winddirectionprofile500_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile500_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 500mb'},
	{id: 'winddirectionprofile450_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile450_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 450mb'},
	{id: 'winddirectionprofile400_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile400_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 400mb'},
	{id: 'winddirectionprofile350_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile350_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 350mb'},
	{id: 'winddirectionprofile300_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile300_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 300mb'},
	{id: 'winddirectionprofile250_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile250_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 250mb'},
	{id: 'winddirectionprofile200_mb',	type: 'state',		ctype: 'number',	crole: 'value.winddirectionprofile200_mb.forecast',	cunit: '°',		cname: 'Wind direction profile 200mb'},
	{id: 'windspeedprofile_1000_mb',	type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_1000_mb.forecast',					cname: 'Wind speed profile 1000mb'},
	{id: 'windspeedprofile_975_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_975_mb.forecast',					cname: 'Wind speed profile 975mb'},
	{id: 'windspeedprofile_950_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_950_mb.forecast',					cname: 'Wind speed profile 950mb'},
	{id: 'windspeedprofile_925_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_925_mb.forecast',					cname: 'Wind speed profile 925mb'},
	{id: 'windspeedprofile_900_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_900_mb.forecast',					cname: 'Wind speed profile 900mb'},
	{id: 'windspeedprofile_850_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_850_mb.forecast',					cname: 'Wind speed profile 850mb'},
	{id: 'windspeedprofile_800_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_800_mb.forecast',					cname: 'Wind speed profile 800mb'},
	{id: 'windspeedprofile_750_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_750_mb.forecast',					cname: 'Wind speed profile 750mb'},
	{id: 'windspeedprofile_700_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_700_mb.forecast',					cname: 'Wind speed profile 700mb'},
	{id: 'windspeedprofile_875_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_675_mb.forecast',					cname: 'Wind speed profile 675mb'},
	{id: 'windspeedprofile_650_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_650_mb.forecast',					cname: 'Wind speed profile 650mb'},
	{id: 'windspeedprofile_600_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_600_mb.forecast',					cname: 'Wind speed profile 600mb'},
	{id: 'windspeedprofile_550_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_550_mb.forecast',					cname: 'Wind speed profile 550mb'},
	{id: 'windspeedprofile_500_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_500_mb.forecast',					cname: 'Wind speed profile 500mb'},
	{id: 'windspeedprofile_450_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_450_mb.forecast',					cname: 'Wind speed profile 450mb'},
	{id: 'windspeedprofile_400_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_400_mb.forecast',					cname: 'Wind speed profile 400mb'},
	{id: 'windspeedprofile_350_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_350_mb.forecast',					cname: 'Wind speed profile 350mb'},
	{id: 'windspeedprofile_300_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_300_mb.forecast',					cname: 'Wind speed profile 300mb'},
	{id: 'windspeedprofile_250_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_250_mb.forecast',					cname: 'Wind speed profile 250mb'},
	{id: 'windspeedprofile_200_mb',		type: 'state',		ctype: 'number',	crole: 'value.windspeedprofile_200_mb.forecast',					cname: 'Wind speed profile 200mb'}
];
*/

// forecast package: profileclouds-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#profile-series-cloud-cover)
/*
const profileclouds_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'cloudcoverprofile_1000_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_1000_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	1000mb'},
	{id: 'cloudcoverprofile_975_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_975_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	975mb'},
	{id: 'cloudcoverprofile_950_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_950_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	950mb'},
	{id: 'cloudcoverprofile_925_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_925_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	925mb'},
	{id: 'cloudcoverprofile_900_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_900_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	900mb'},
	{id: 'cloudcoverprofile_875_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_875_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	875mb'},
	{id: 'cloudcoverprofile_850_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_850_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	850mb'},
	{id: 'cloudcoverprofile_800_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_800_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	800mb'},
	{id: 'cloudcoverprofile_750_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_750_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	750mb'},
	{id: 'cloudcoverprofile_700_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_700_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	700mb'},
	{id: 'cloudcoverprofile_650_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_650_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	650mb'},
	{id: 'cloudcoverprofile_600_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_600_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	600mb'},
	{id: 'cloudcoverprofile_550_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_550_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	550mb'},
	{id: 'cloudcoverprofile_500_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_500_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	500mb'},
	{id: 'cloudcoverprofile_450_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_450_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	450mb'},
	{id: 'cloudcoverprofile_400_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_400_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	400mb'},
	{id: 'cloudcoverprofile_350_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_350_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	350mb'},
	{id: 'cloudcoverprofile_300_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_300_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	300mb'},
	{id: 'cloudcoverprofile_250_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_250_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	250mb'},
	{id: 'cloudcoverprofile_200_mb',	type: 'state',		ctype: 'number',	crole: 'value.cloudcoverprofile_200_mb.forecast',	cunit: '%',		cname: 'Cloud cover profile	200mb'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'}
];
*/

// forecast package: profilerh-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#profile-series-relative-humidity)
/*
const profilerh_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'relativehumidityprofile_1000_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_1000_mb.forecast',cunit: '%',	cname: 'Relative humidity profile 1000mb'},
	{id: 'relativehumidityprofile_975_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_975_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 975mb'},
	{id: 'relativehumidityprofile_950_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_950_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 950mb'},
	{id: 'relativehumidityprofile_925_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_925_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 925mb'},
	{id: 'relativehumidityprofile_900_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_900_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 900mb'},
	{id: 'relativehumidityprofile_875_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_875_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 875mb'},
	{id: 'relativehumidityprofile_850_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_850_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 850mb'},
	{id: 'relativehumidityprofile_800_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_800_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 800mb'},
	{id: 'relativehumidityprofile_750_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_750_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 750mb'},
	{id: 'relativehumidityprofile_700_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_700_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 700mb'},
	{id: 'relativehumidityprofile_650_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_650_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 650mb'},
	{id: 'relativehumidityprofile_600_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_600_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 600mb'},
	{id: 'relativehumidityprofile_550_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_550_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 550mb'},
	{id: 'relativehumidityprofile_500_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_500_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 500mb'},
	{id: 'relativehumidityprofile_450_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_450_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 450mb'},
	{id: 'relativehumidityprofile_400_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_400_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 400mb'},
	{id: 'relativehumidityprofile_350_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_350_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 350mb'},
	{id: 'relativehumidityprofile_300_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_300_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 300mb'},
	{id: 'relativehumidityprofile_250_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_250_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 250mb'},
	{id: 'relativehumidityprofile_200_mb',	type: 'state',		ctype: 'number',	crole: 'value.relativehumidityprofile_200_mb.forecast',	cunit: '%',	cname: 'Relative humidity profile 200mb'},
	{id: 'time',							type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'}
];
*/

/*
// forcast package: multimodel (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#multimodel)
const multimodel_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'cloudcover',					type: 'state',		ctype: 'number',	crole: 'value.cloudcover.forecast',					cunit: '%',		cname: 'Cloud cover'},
	{id: 'precipitation',				type: 'state',		ctype: 'number',	crole: 'value.precipitation.forecast',								cname: 'Precipation'},
	{id: 'shortwaveradiation',			type: 'state',		ctype: 'number',	crole: 'value.shortwaveradiation.forecast',			cunit: 'W/m2',	cname: 'Shortwave ratiation (GHI)'},
	{id: 'temperature',					type: 'state',		ctype: 'number',	crole: 'value.temperature.forecast',								cname: 'Temperature'},
	{id: 'temperature_spread',			type: 'state',		ctype: 'number',	crole: 'value.temperature_spread.forecast',							cname: 'Temperature spread'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'},
	{id: 'winddirectionChar2',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction,2 char'},
	{id: 'winddirectionChar3',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction, 3 char'},
	{id: 'winddirection',				type: 'state',		ctype: 'number',	crole: 'value.winddirection.forecast',								cname: 'Wind direction'},
	{id: 'windspeed',					type: 'state',		ctype: 'number',	crole: 'value.windspeed.forecast',									cname: 'Wind speed'},
	{id: 'windspeed_spread',			type: 'state',		ctype: 'number',	crole: 'value.windspeed_spread.forecast',							cname: 'Wind speed spread'}
];
const multimodel_3h = [
	{id: 'data_3h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0300', '0600', '0900', '1200', '1500', '1800', '2100'], 																																								type: 'channel_1'},
	{id: 'cloudcover',					type: 'state',		ctype: 'number',	crole: 'value.cloudcover.forecast',					cunit: '%',		cname: 'Cloud cover'},
	{id: 'precipitation',				type: 'state',		ctype: 'number',	crole: 'value.precipitation.forecast',								cname: 'Precipation'},
	{id: 'shortwaveradiation',			type: 'state',		ctype: 'number',	crole: 'value.shortwaveradiation.forecast',			cunit: 'W/m2',	cname: 'Shortwave ratiation (GHI)'},
	{id: 'temperature',					type: 'state',		ctype: 'number',	crole: 'value.temperature.forecast',								cname: 'Temperature'},
	{id: 'temperature_spread',			type: 'state',		ctype: 'number',	crole: 'value.temperature_spread.forecast',							cname: 'Temperature spread'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'},
	{id: 'winddirectionChar2',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction,2 char'},
	{id: 'winddirectionChar3',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction, 3 char'},
	{id: 'winddirection',				type: 'state',		ctype: 'number',	crole: 'value.winddirection.forecast',								cname: 'Wind direction'},
	{id: 'windspeed',					type: 'state',		ctype: 'number',	crole: 'value.windspeed.forecast',									cname: 'Wind speed'},
	{id: 'windspeed_spread',			type: 'state',		ctype: 'number',	crole: 'value.windspeed_spread.forecast',							cname: 'Wind speed spread'}
];
*/

// forecast package: multimodel-temperature (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#multimodel-temperature)
// forecast package: multimodel-precipitation (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#multimodel-precipitation)
// forecast package: multimodel-relative-humidity (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#multimodel-relative-humidity)
// forecast package: multimodel-wind (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#multimodel-wind)
// forecast package: multimodel-wind-80m (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#multimodel-wind-80m)
// forecast package: multimodel-clouds (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#multimodel-clouds)
// forecast package: multimodel-radiation (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#multimodel-radiation)

// forecast package: multimodelpv-1h (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#multimodel-pv)
/*
const multimodelpv_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'gem15',						type: 'state',		ctype: 'number',	crole: 'value.gem15.forecast',										cname: ''},
	{id: 'gfs05',						type: 'state',		ctype: 'number',	crole: 'value.gfs05.forecast',										cname: ''},
	{id: 'harmonie',					type: 'state',		ctype: 'number',	crole: 'value.harmonie.forecast',									cname: ''},
	{id: 'hireu7',						type: 'state',		ctype: 'number',	crole: 'value.hireu7.forecast',										cname: ''},
	{id: 'icon',						type: 'state',		ctype: 'number',	crole: 'value.icon.forecast',										cname: ''},
	{id: 'icond2',						type: 'state',		ctype: 'number',	crole: 'value.icond2.forecast',										cname: ''},
	{id: 'iconeu',						type: 'state',		ctype: 'number',	crole: 'value.iconeu.forecast',										cname: ''},
	{id: 'ifs04',						type: 'state',		ctype: 'number',	crole: 'value.ifs04.forecast',										cname: ''},
	{id: 'mfeu',						type: 'state',		ctype: 'number',	crole: 'value.mfeu.forecast',										cname: ''},
	{id: 'mffr',						type: 'state',		ctype: 'number',	crole: 'value.mffr.forecast',										cname: ''},
	{id: 'mfglobal',					type: 'state',		ctype: 'number',	crole: 'value.mfglobal.forecast',									cname: ''},
	{id: 'max',							type: 'state',		ctype: 'number',	crole: 'value.max.forecast',										cname: ''},
	{id: 'mean',						type: 'state',		ctype: 'number',	crole: 'value.mean.forecast',										cname: ''},
	{id: 'min',							type: 'state',		ctype: 'number',	crole: 'value.min.forecast',										cname: ''},
	{id: 'nems12',						type: 'state',		ctype: 'number',	crole: 'value.nems12.forecast',										cname: ''},
	{id: 'nems12_e',					type: 'state',		ctype: 'number',	crole: 'value.nems12_e.forecast',									cname: ''},
	{id: 'nems4',						type: 'state',		ctype: 'number',	crole: 'value.nems4.forecast',										cname: ''},
	{id: 'nemsglobal',					type: 'state',		ctype: 'number',	crole: 'value.nemsglobal.forecast',									cname: ''},
	{id: 'nemsglobal_e',				type: 'state',		ctype: 'number',	crole: 'value.nemsglobal_e.forecast',								cname: ''},
	{id: 'nmm22',						type: 'state',		ctype: 'number',	crole: 'value.nmm22.forecast',										cname: ''},
	{id: 'nmm4',						type: 'state',		ctype: 'number',	crole: 'value.nmm4.forecast',										cname: ''},
	{id: 'p95exceedence',				type: 'state',		ctype: 'number',	crole: 'value.p95exceedence.forecast',								cname: ''},
	{id: 'p90exceedence',				type: 'state',		ctype: 'number',	crole: 'value.p90exceedence.forecast',								cname: ''},
	{id: 'p85exceedence',				type: 'state',		ctype: 'number',	crole: 'value.p85exceedence.forecast',								cname: ''},
	{id: 'p80exceedence',				type: 'state',		ctype: 'number',	crole: 'value.p80exceedence.forecast',								cname: ''},
	{id: 'p75exceedence',				type: 'state',		ctype: 'number',	crole: 'value.p75exceedence.forecast',								cname: ''},
	{id: 'p70exceedence',				type: 'state',		ctype: 'number',	crole: 'value.p70exceedence.forecast',								cname: ''},
	{id: 'p60exceedence',				type: 'state',		ctype: 'number',	crole: 'value.p60exceedence.forecast',								cname: ''},
	{id: 'p50exceedence',				type: 'state',		ctype: 'number',	crole: 'value.p50exceedence.forecast',								cname: ''},
	{id: 'p40exceedence',				type: 'state',		ctype: 'number',	crole: 'value.p40exceedence.forecast',								cname: ''},
	{id: 'p30exceedence',				type: 'state',		ctype: 'number',	crole: 'value.p30exceedence.forecast',								cname: ''},
	{id: 'p25exceedence',				type: 'state',		ctype: 'number',	crole: 'value.p25exceedence.forecast',								cname: ''},
	{id: 'p20exceedence',				type: 'state',		ctype: 'number',	crole: 'value.p20exceedence.forecast',								cname: ''},
	{id: 'p15exceedence',				type: 'state',		ctype: 'number',	crole: 'value.p15exceedence.forecast',								cname: ''},
	{id: 'p10exceedence',				type: 'state',		ctype: 'number',	crole: 'value.p10exceedence.forecast',								cname: ''},
	{id: 'standarddeviation',			type: 'state',		ctype: 'number',	crole: 'value.standarddeviation.forecast',							cname: ''},
	{id: 'ukmo2',						type: 'state',		ctype: 'number',	crole: 'value.ukmo2.forecast',										cname: ''},
	{id: 'umglobal10',					type: 'state',		ctype: 'number',	crole: 'value.umglobal10.forecast',									cname: ''}
];
*/

// forcast package: ensemble (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#ensemble)
const ensemble_1h = [
	{id: 'gfsensemble_1h',				type: 'channel_0',																							cname: 'gfsensemble_1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'ghi_backwards',				type: 'state',		ctype: 'array',	crole: 'value.ghi_backwards.forecast',				cunit: 'W/m2',	cname: 'Global horizontal radiation, backwards'},
	{id: 'gust',						type: 'state',		ctype: 'array',	crole: 'value.gust.forecast',										cname: 'Wind gusts'},
	{id: 'highclouds',					type: 'state',		ctype: 'array',	crole: 'value.highclouds.forecast',					cunit: '%',		cname: 'High clouds'},
	{id: 'lowclouds',					type: 'state',		ctype: 'array',	crole: 'value.lowclouds.forecast',					cunit: '%',		cname: 'Low clouds'},
	{id: 'midclouds',					type: 'state',		ctype: 'array',	crole: 'value.midclouds.forecast',					cunit: '%',		cname: 'Mean clouds'},
	{id: 'precipitation',				type: 'state',		ctype: 'array',	crole: 'value.precipitation.forecast',								cname: 'Precipitation'},
	{id: 'skintemperature',				type: 'state',		ctype: 'array',	crole: 'value.skintemperature.forecast',							cname: 'Skin / Surface temperature'},
	{id: 'temperature',					type: 'state',		ctype: 'array',	crole: 'value.temperature.forecast',								cname: 'Temperature'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',											cname: 'Day and time of forecast'},
	{id: 'winddirection',				type: 'state',		ctype: 'array',	crole: 'value.winddirection.forecast',								cname: 'Wind direction'},
	{id: 'windspeed',					type: 'state',		ctype: 'array',	crole: 'value.windspeed.forecast',									cname: 'Wind speed'}
];

// forecast package: trend (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#trend)
const trend_1h = [
	{id: 'trend_1h',					type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],								type: 'channel_1'},
	{id: 'extraterrestrialradiation_backwards',	type: 'state',	ctype: 'number',crole: 'value.extraterrestrialradiation_backwards.forecast',		cname: 'Extraterrestrial solar radiation'},
	{id: 'ghi_backwards',				type: 'state',		ctype: 'number',	crole: 'value.ghi_backwards.forecast',								cname: 'Global horizontal radiation, backwards'},
	{id: 'pictocode',					type: 'state',		ctype: 'number',	crole: 'value.pictocode.forecast',									cname: 'Classification of weather conditions, using a numeric number (1-35)'},
	{id: 'precipitation',				type: 'state',		ctype: 'number',	crole: 'value.precipitation.forecast',								cname: 'Precipitation'},
	{id: 'precipitation_spread',		type: 'state',		ctype: 'number',	crole: 'value.precipitation_spread.forecast',						cname: 'Precipitation spread'},
	{id: 'relativehumidity',			type: 'state',		ctype: 'number',	crole: 'value.relativehumidity.forecast',			cunit: '%',		cname: 'Relative humidity'},
	{id: 'sealevelpressure',			type: 'state',		ctype: 'number',	crole: 'value.sealevelpressure.forecast',			cunit: '%',		cname: 'Sea level pressure'},
	{id: 'snowfraction',				type: 'state',		ctype: 'number',	crole: 'value.snowfraction.forecast',								cname: 'Snow fracture'},
	{id: 'temperature',					type: 'state',		ctype: 'number',	crole: 'value.temperature.forecast',								cname: 'Temperature'},
	{id: 'temperature_spread',			type: 'state',		ctype: 'number',	crole: 'value.temperature_spread.forecast',							cname: 'Temperature spread'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day and time of forecast'},
	{id: 'totalcloudcover',				type: 'state',		ctype: 'number',	crole: 'value.totalcloudcover.forecast',			cunit: '%',		cname: 'Total cloud cover'},
	{id: 'totalcloudcover_spread',		type: 'state',		ctype: 'number',	crole: 'value.totalcloudcover_spread.forecast',		cunit: '%',		cname: 'Total cloud cover spread'},
	{id: 'winddirectionChar2',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction,2 char'},
	{id: 'winddirectionChar3',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction, 3 char'},
	{id: 'winddirection',				type: 'state',		ctype: 'number',	crole: 'value.winddirection.forecast',				cunit: '°',		cname: 'Wind direction'},
	{id: 'windspeed',					type: 'state',		ctype: 'number',	crole: 'value.windspeed.forecast',									cname: 'Wind speed'},
	{id: 'windspeed_spread',			type: 'state',		ctype: 'number',	crole: 'value.windspeed_spread.forecast',							cname: 'Wind speed spread'}
];
const trend_day = [
	{id: 'trend_day',					type: 'channel_0',																							cname: 'data day'},
	{id: ['0d', '1d', '2d', '3d', '4d', '5d', '6d'],																																													type: 'channel_1'},
	{id: 'extraterrestrialradiation_total',	type: 'state',	ctype: 'number',	crole: 'value.extraterrestrialradiation_total.forecast',			cname: 'Extraterrestrial solar radiation'},
	{id: 'ghi_total',					type: 'state',		ctype: 'number',	crole: 'value.ghi_total.forecast',									cname: 'Total global horizontal radiation, backwards'},
	{id: 'pictocode',					type: 'state',		ctype: 'number',	crole: 'value.pictocode.forecast',									cname: 'Classification of weather conditions, using a numeric number (1-35)'},
	{id: 'precipitation',				type: 'state',		ctype: 'number',	crole: 'value.precipitation.forecast',								cname: 'Precipitation'},
	{id: 'precipitation_probability',	type: 'state',		ctype: 'number',	crole: 'value.precipitation_probability.forecast',	cunit: '%',		cname: 'Precipitation probability'},
	{id: 'precipitation_spread',		type: 'state',		ctype: 'number',	crole: 'value.precipitation_spread.forecast',						cname: 'Precipitation spread'},
	{id: 'predictability',				type: 'state',		ctype: 'number',	crole: 'value.predictability.forecast',				cunit: '%',		cname: 'Predictability'},
	{id: 'predictability_class',		type: 'state',		ctype: 'number',	crole: 'value.predictability_class.forecast',						cname: 'Predictability class'},
	{id: 'relativehumidity_max',		type: 'state',		ctype: 'number',	crole: 'value.relativehumidity_max.forecast',		cunit: '%',		cname: 'Maximum relative humidity'},
	{id: 'relativehumidity_mean',		type: 'state',		ctype: 'number',	crole: 'value.relativehumidity_mean.forecast',		cunit: '%',		cname: 'Mean relative humidity'},
	{id: 'relativehumidity_min',		type: 'state',		ctype: 'number',	crole: 'value.relativehumidity_min.forecast',		cunit: '%',		cname: 'Minimum relative humidity'},
	{id: 'sealevelpressure_max',		type: 'state',		ctype: 'number',	crole: 'value.sealevelpressure_max.forecast',		cunit: '%',		cname: 'Maximum sea level pressure'},
	{id: 'sealevelpressure_mean',		type: 'state',		ctype: 'number',	crole: 'value.sealevelpressure_mean.forecast',		cunit: '%',		cname: 'Mean sea level pressure'},
	{id: 'sealevelpressure_min',		type: 'state',		ctype: 'number',	crole: 'value.sealevelpressure_min.forecast',		cunit: '%',		cname: 'Minimum sea level pressure'},
	{id: 'snowfraction',				type: 'state',		ctype: 'number',	crole: 'value.snowfraction.forecast',								cname: 'Snow fracture'},
	{id: 'temperature_max',				type: 'state',		ctype: 'number',	crole: 'value.temperature_max.forecast',							cname: 'Maximum temperature'},
	{id: 'temperature_mean',			type: 'state',		ctype: 'number',	crole: 'value.temperature_mean.forecast',							cname: 'Mean temperature'},
	{id: 'temperature_min',				type: 'state',		ctype: 'number',	crole: 'value.temperature_min.forecast',							cname: 'Minimum temperature'},
	{id: 'temperature_spread',			type: 'state',		ctype: 'number',	crole: 'value.temperature_spread.forecast',							cname: 'Temperature spread'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'date.forecast',												cname: 'Day of forecast'},
	{id: 'totalcloudcover_max',			type: 'state',		ctype: 'number',	crole: 'value.totalcloudcover_max.forecast',		cunit: '%',		cname: 'Maximum total cloud cover'},
	{id: 'totalcloudcover_mean',		type: 'state',		ctype: 'number',	crole: 'value.totalcloudcover_mean.forecast',		cunit: '%',		cname: 'Mean total cloud cover'},
	{id: 'totalcloudcover_min',			type: 'state',		ctype: 'number',	crole: 'value.totalcloudcover_min.forecast',		cunit: '%',		cname: 'Minimum total cloud cover'},
	{id: 'totalcloudcover_spread',		type: 'state',		ctype: 'number',	crole: 'value.totalcloudcover_spread.forecast',		cunit: '%',		cname: 'Total clound cover spread'},
	{id: 'winddirectionChar2',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction,2 char'},
	{id: 'winddirectionChar3',			type: 'state',		ctype: 'string',	crole: 'weather.direction.wind.forecast',							cname: 'Wind direction, 3 char'},
	{id: 'winddirection',				type: 'state',		ctype: 'number',	crole: 'value.winddirection.forecast',								cname: 'Wind direction'},
	{id: 'windspeed_max',				type: 'state',		ctype: 'number',	crole: 'value.windspeed_max.forecast',								cname: 'Maximum wind speed'},
	{id: 'windspeed_mean',				type: 'state',		ctype: 'number',	crole: 'value.windspeed_mean.forecast',								cname: 'Mean wind speed'},
	{id: 'windspeed_min',				type: 'state',		ctype: 'number',	crole: 'value.windspeed_min.forecast',								cname: 'Minimum wind speed'},
	{id: 'windspeed_spread',			type: 'state',		ctype: 'number',	crole: 'value.windspeed_spread.forecast',							cname: 'Wind speed spread'}
];

// forecast package: trendpro (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#trend-pro)
// forecast package: seasonal-anomalies-forecast (https://docs.meteoblue.com/en/weather-apis/packages-api/forecast-data#seasonal-anomalies-forecast)

module.exports = {
	manual_mode,
	compassDirection,
	metadata,
	units0,
	units00,
	units1,
	units2,
	units21,
	units22,
	units23,
	units24,
	units3,
	units31,
	units4,
	units5,
	units6,
	units61,
	units7,
	units8,
	units9,
	units10,
	basic_15min,
	basic_1h,
	basic_3h,
	basic_day,
	current,
	clouds_1h,
	clouds_3h,
	clouds_day,
	sunmoon,
	agro_1h,
	agro_3h,
	agro_day,
	agromodelleafwetness_1h,
	agromodelsowing_1h,
	agromodelspray_1h,
	solar_15min,
	solar_1h,
	solar_3h,
	solar_day,
	solarensemble_1h,
	wind_15min,
	wind_1h,
	wind_3h,
	wind_day,
	wind80ensemble_1h,
	sea_1h,
	sea_3h,
	sea_day,
	air_1h,
	air_3h,
	air_day,
	airquality_1h,
	airquality_3h,
	airquality_day,
	trend_1h,
	trend_day,
	ensemble_1h
};
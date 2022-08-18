'use strict';

const compassDirection = ['N', 'NNO', 'NO', 'ONO', 'O', 'OSO', 'SO', 'SSO', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

// https://github.com/ioBroker/ioBroker/blob/master/doc/STATE_ROLES.md#state-roles
const manual_mode = [
	{id: 'ACTION', 						type: 'channel_0',																							cname: 'ACTION'},
	{id: 'REQUEST_DATA',				type: 'state',		ctype: 'boolean',	crole: 'button',													cname: 'Request data from meteoblue',												cwrite: true}
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

const units1 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'temperature',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of temperature'},
	{id: 'time',						type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Time format'},
	{id: 'windspeed',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of windspeed'}
];
const units2 = [
	{id: 'units',						type: 'channel_0',																							cname: 'units'},
	{id: 'co',							type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of CO'},
	{id: 'precipitation',				type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of precipitation'},
	{id: 'precipitation_probability',	type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of precipitation probability'},
	{id: 'predictability',				type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of predictability'},
	{id: 'pressure',					type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of pressure'},
	{id: 'relativehumidity',			type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of relative humidity'},
	{id: 'winddirection',				type: 'state',		ctype: 'string',	crole: 'value',														cname: 'Unit of winddirection'},
];

// forecast package: basic_15min
const data_15min = [
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
	{id: 'windspeed',					type: 'state',		ctype: 'number',	crole: 'value.speed.wind.forecast',									cname: 'Windspeed, 10m above ground'},
];

// forecast package: basic_1h
const data_1h = [
	{id: 'data_1h',						type: 'channel_0',																							cname: 'data 1h'},
	{id: ['0000', '0100', '0200', '0300', '0400', '0500', '0600', '0700', '0800', '0900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700', '1800', '1900', '2000', '2100', '2200', '2300'],		type: 'channel_1'},
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

// forecast package: basic_3h
const data_3h = [
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

// forecast package: basic_day
const data_day = [
	{id: 'data_day',					type: 'channel_0',																							cname: 'data day'},
	{id: ['0d', '1d', '2d', '3d', '4d', '5d', '6d'],																																											type: 'channel_1'},
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

// forecast package: current
const data_current = [
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

module.exports = {
	manual_mode,
	compassDirection,
	metadata,
	units1,
	units2,
	data_15min,
	data_1h,
	data_3h,
	data_day,
	data_current
};
![Logo](admin/meteoblue.png)
# ioBroker.meteoblue

[![NPM version](https://img.shields.io/npm/v/iobroker.meteoblue.svg)](https://www.npmjs.com/package/iobroker.meteoblue)
[![Downloads](https://img.shields.io/npm/dm/iobroker.meteoblue.svg)](https://www.npmjs.com/package/iobroker.meteoblue)
![Number of Installations](https://iobroker.live/badges/meteoblue-installed.svg)
![Current version in stable repository](https://img.shields.io/badge/stable-not%20published-%23264777)
<!-- ![Current version in stable repository](https://iobroker.live/badges/meteoblue-stable.svg) -->
<!-- [![Dependency Status](https://img.shields.io/david/ice987987/iobroker.meteoblue.svg)](https://david-dm.org/ice987987/iobroker.meteoblue) -->

[![NPM](https://nodei.co/npm/iobroker.meteoblue.png?downloads=true)](https://nodei.co/npm/iobroker.meteoblue/)

![Test and Release](https://github.com/ice987987/ioBroker.meteoblue/workflows/Test%20and%20Release/badge.svg)

[![Donate](https://img.shields.io/badge/donate-paypal-blue?style=flat)](https://paypal.me/ice987987)

## meteoblue adapter for ioBroker

This adapter fetches weather forecast from [meteoblue.com](http://www.meteoblue.com) and creates a rainspot (precipitation distribution within 35km).

## Installation requirements

* at least Node >=12.x is required
* js-controller >=3.x is required
* Application Key for "data package: basic-day", generated by [meteoblue.com](https://content.meteoblue.com/en/access-options/meteoblue-weather-api/non-commercial-use), is required

## Changelog

<!-- ### **WORK IN PROGRESS** -->

### v0.0.4 (2022-02-06)
- (ice987987) update dependencies
- (ice987987) update readme.md
- (ice987987) bugfix

### v0.0.3 (2022-01-23)
- (ice987987) revision of the index_m input page
- (ice987987) implementation of API-Key de- and entcryption
- (ice987987) bugfix

### v0.0.2 (2021-11-05)
- (ice987987) add rainspot
- (ice987987) remove user inputfield winddirection, calculate winddirection as 2 and 3 chars
- (ice987987) remove user inputfield timezone
- (ice987987) bugfix

### v0.0.1 (2021-10-17)
- (ice987987) initial development

## License
MIT License

Copyright (c) 2021-2022 ice987987 <mathias.frei@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

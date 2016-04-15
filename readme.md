# bin-build [![Build Status](https://travis-ci.org/kevva/bin-build.svg?branch=master)](https://travis-ci.org/kevva/bin-build)

> Easily build binaries


## Install

```
$ npm install --save bin-build
```


## Usage

```js
const binBuild = require('bin-build');

binBuild('http://www.lcdf.org/gifsicle/gifsicle-1.80.tar.gz', [
	'./configure --disable-gifview --disable-gifdiff',
	'make install'
]).then(() => {
	console.log('gifsicle built successfully');
});
```


## API

### binBuild(file, commands, [options])

Returns a promise.

#### file

*Required*<br>
Type: `string`

Accepts a URL to a archive containing the source code, a path to an archive or a path to a directory containing the source code.

#### commands

*Required*<br>
Type: `array`

An array of commands to run when building.

#### options

##### strip

Type: `number`<br>
Default: `1`

Strip a number of leading paths from file names on extraction.


## License

MIT © [Kevin Mårtensson](https://github.com/kevva)

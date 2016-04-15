# bin-build [![Build Status](https://travis-ci.org/kevva/bin-build.svg?branch=master)](https://travis-ci.org/kevva/bin-build)

> Easily build binaries


## Install

```
$ npm install --save bin-build
```


## Usage

```js
const binBuild = require('bin-build');

binBuild.url('http://www.lcdf.org/gifsicle/gifsicle-1.80.tar.gz', [
	'./configure --disable-gifview --disable-gifdiff',
	'make install'
]).then(() => {
	console.log('gifsicle built successfully');
});

binBuild.file('gifsicle-1.80.tar.gz', [
	'./configure --disable-gifview --disable-gifdiff',
	'make install'
]).then(() => {
	console.log('gifsicle built successfully');
});
```


## API

### binBuild.dir(dir, commands, [options])

#### dir

*Required*<br>
Type: `string`

Path to a directory containing the source code.

#### commands

*Required*<br>
Type: `array`

An array of commands to run when building.

#### options

##### dependencies

Type: `array`

Array of dependencies (compile-time libraries etc.) required for the binary to build. E.g:

```js
binBuild.dir('/tmp/optipng-0.7.6', [
	'./configure --with-system-zlib',
	'make install'
], {
	dependencies: [
		'libpng-dev - sudo apt-get install libpng-dev',
		'zlib1g-dev - sudo apt-get install zlib1g-dev'
	]
}).catch(err => {
	console.log(err.message);
	/*
		Command `make install` failed in directory /tmp/optipng-0.7.6. Make sure you have the following dependencies installed:

		    libpng-dev - sudo apt-get install libpng-dev
		    zlib1g-dev - sudo apt-get install zlib1g-dev

		...
	*/
});
```

### binBuild.file(file, commands, [options])

#### file

*Required*<br>
Type: `string`

Path to a archive file containing the source code.

#### commands

*Required*<br>
Type: `array`

An array of commands to run when building.

#### options

##### dependencies

Type: `array`

Array of dependencies (compile-time libraries etc.) required for the binary to build. See [example](#dependencies).

##### strip

Type: `number`<br>
Default: `1`

Strip a number of leading paths from file names on extraction.

### binBuild.url(url, commands, [options])

#### url

*Required*<br>
Type: `string`

URL to a archive file containing the source code.

#### commands

*Required*<br>
Type: `array`

An array of commands to run when building.

#### options

##### dependencies

Type: `array`

Array of dependencies (compile-time libraries etc.) required for the binary to build. See [example](#dependencies).

##### strip

Type: `number`<br>
Default: `1`

Strip a number of leading paths from file names on extraction.


## License

MIT © [Kevin Mårtensson](https://github.com/kevva)

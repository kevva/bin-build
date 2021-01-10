'use strict';
const decompress = require('decompress');
const download = require('download');
const execa = require('execa');
const pMapSeries = require('p-map-series');
const tempfile = require('tempfile');

const exec = (cmd, cwd) => pMapSeries(cmd, x => {
	console.log(x);
	return execa(x, {cwd, shell: true});
});

exports.directory = (dir, cmd) => {
	if (typeof dir !== 'string') {
		return Promise.reject(new TypeError(`Expected a \`string\`, got \`${typeof dir}\``));
	}

	return exec(cmd, dir);
};

exports.file = async (file, cmd, options) => {
	options = Object.assign({strip: 1}, options);

	if (typeof file !== 'string') {
		return Promise.reject(new TypeError(`Expected a \`string\`, got \`${typeof file}\``));
	}

	const temporary = tempfile();

	await decompress(file, temporary, options);
	return exec(cmd, temporary);
};

exports.url = async (url, cmd, options) => {
	options = Object.assign({
		extract: true,
		strip: 1
	}, options);

	if (typeof url !== 'string') {
		return Promise.reject(new TypeError(`Expected a \`string\`, got \`${typeof url}\``));
	}

	const temporary = tempfile();

	await download(url, temporary, options);
	return exec(cmd, temporary);
};

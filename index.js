'use strict';
const arrify = require('arrify');
const decompress = require('decompress');
const download = require('download');
const execa = require('execa');
const pMapSeries = require('p-map-series');
const tempfile = require('tempfile');

const exec = (cmd, cwd) => pMapSeries(arrify(cmd), x => execa.shell(x, {cwd}));

exports.dir = (dir, cmd) => {
	if (typeof dir !== 'string') {
		return Promise.reject(new Error('Directory is required'));
	}

	return exec(cmd, dir);
};

exports.file = (file, cmd, opts) => {
	opts = Object.assign({strip: 1}, opts);

	if (typeof file !== 'string') {
		return Promise.reject(new Error('File is required'));
	}

	const tmp = tempfile();

	return decompress(file, tmp, opts).then(() => exec(cmd, tmp));
};

exports.url = (url, cmd, opts) => {
	opts = Object.assign({
		extract: true,
		strip: 1
	}, opts);

	if (typeof url !== 'string') {
		return Promise.reject(new Error('URL is required'));
	}

	const tmp = tempfile();

	return download(url, tmp, opts).then(() => exec(cmd, tmp));
};

'use strict';
const arrify = require('arrify');
const Decompress = require('decompress');
const Download = require('download');
const execa = require('execa');
const objectAssign = require('object-assign');
const promiseMapSeries = require('promise-map-series');
const tempfile = require('tempfile');

const exec = (cmd, cwd) => promiseMapSeries(arrify(cmd), x => execa.shell(x, {cwd}));

exports.dir = (dir, cmd) => {
	if (typeof dir !== 'string') {
		return Promise.reject(new Error('Directory is required'));
	}

	return exec(cmd, dir);
};

exports.file = (file, cmd, opts) => {
	if (typeof file !== 'string') {
		return Promise.reject(new Error('File is required'));
	}

	opts = objectAssign({
		strip: 1,
		tmp: tempfile()
	}, opts);

	const decompress = new Decompress({
		mode: '777',
		strip: opts.strip
	})
		.src(file)
		.dest(opts.tmp);

	return new Promise((resolve, reject) => decompress.run(err => err ? reject(err) : resolve()))
		.then(() => exec(cmd, opts.tmp));
};

exports.url = (url, cmd, opts) => {
	if (typeof url !== 'string') {
		return Promise.reject(new Error('URL is required'));
	}

	opts = objectAssign({
		strip: 1,
		tmp: tempfile()
	}, opts);

	const download = new Download({
		extract: true,
		mode: '777',
		strip: opts.strip
	})
		.get(url)
		.dest(opts.tmp);

	return new Promise((resolve, reject) => download.run(err => err ? reject(err) : resolve()))
		.then(() => exec(cmd, opts.tmp));
};

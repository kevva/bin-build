'use strict';
const fs = require('fs');
const archiveType = require('archive-type');
const arrify = require('arrify');
const Decompress = require('decompress');
const Download = require('download');
const execa = require('execa');
const objectAssign = require('object-assign');
const pify = require('pify');
const promiseMapSeries = require('promise-map-series');
const tempfile = require('tempfile');
const urlRegex = require('url-regex');

const exec = (cmd, cwd) => promiseMapSeries(cmd, x => execa.shell(x, {cwd}));

const download = (file, opts) => {
	const download = new Download({
		extract: true,
		mode: '777',
		strip: opts.strip
	})
		.get(file)
		.dest(opts.tmp);

	return new Promise((resolve, reject) => download.run(err => err ? reject(err) : resolve()));
};

const extract = (file, opts) => {
	const decompress = new Decompress({
		mode: '777',
		strip: opts.strip
	})
		.src(file)
		.dest(opts.tmp);

	return new Promise((resolve, reject) => decompress.run(err => err ? reject(err) : resolve()));
};

const read = (file, opts) => {
	return pify(fs.readFile)(file).then(data => {
		if (!archiveType(data)) {
			throw new Error('Invalid file');
		}

		return extract(file, opts);
	});
};

module.exports = (file, cmd, opts) => {
	if (typeof file !== 'string') {
		return Promise.reject(new Error('Source file or directory required'));
	}

	cmd = arrify(cmd);
	opts = objectAssign({
		strip: 1,
		tmp: tempfile()
	}, opts);

	const fn = urlRegex().test(file) ? download : read;

	return fn(file, opts)
		.then(() => exec(cmd, opts.tmp))
		.catch(err => {
			if (err && err.code !== 'EISDIR') {
				throw err;
			}

			return exec(cmd, file);
		});
};

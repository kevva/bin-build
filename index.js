'use strict';
const arrify = require('arrify');
const Decompress = require('decompress');
const Download = require('download');
const execa = require('execa');
const objectAssign = require('object-assign');
const promiseMapSeries = require('promise-map-series');
const tempfile = require('tempfile');

const exec = (cmd, cwd, opts) => promiseMapSeries(arrify(cmd), x => {
	return execa.shell(x, {cwd}).catch(err => {
		const msg = [`Command \`${x}\` failed in directory ${cwd}.`];

		if (arrify(opts.dependencies).length !== 0) {
			msg.push(
				' Make sure that the following dependencies are installed:\n\n',
				opts.dependencies.map(x => `    ${x}`).join('\n')
			);
		}

		msg.push(`\n\n${err.message}`);
		err.message = msg.join('');

		throw err;
	});
});

exports.dir = (dir, cmd, opts) => {
	if (typeof dir !== 'string') {
		return Promise.reject(new Error('Directory is required'));
	}

	return exec(cmd, dir, objectAssign({}, opts));
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
		.then(() => exec(cmd, opts.tmp, opts));
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
		.then(() => exec(cmd, opts.tmp, opts));
};

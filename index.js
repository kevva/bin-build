'use strict';
const arrify = require('arrify');
const decompress = require('decompress');
const download = require('download');
const execa = require('execa');
const promiseMapSeries = require('promise-map-series');
const tempfile = require('tempfile');

const exec = (cmd, cwd, opts) => promiseMapSeries(arrify(cmd), x => execa.shell(x, {cwd}).catch(err => {
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
}));

exports.dir = (dir, cmd, opts) => {
	opts = Object.assign({}, opts);

	if (typeof dir !== 'string') {
		return Promise.reject(new Error('Directory is required'));
	}

	return exec(cmd, dir, opts);
};

exports.file = (file, cmd, opts) => {
	opts = Object.assign({strip: 1}, opts);

	if (typeof file !== 'string') {
		return Promise.reject(new Error('File is required'));
	}

	const tmp = tempfile();

	return decompress(file, tmp, opts).then(() => exec(cmd, tmp, opts));
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

	return download(url, tmp, opts).then(() => exec(cmd, tmp, opts));
};

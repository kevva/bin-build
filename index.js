import download from 'download';
import decompress from 'decompress';
import execa from 'execa';
import pMapSeries from 'p-map-series';
import tempfile from 'tempfile';

const exec = (cmd, cwd) => pMapSeries(cmd, x => execa.shell(x, {cwd}));

export function directory(dir, cmd) {
	if (typeof dir !== 'string') {
		return Promise.reject(new TypeError(`Expected a \`string\`, got \`${typeof dir}\``));
	}

	return exec(cmd, dir);
}

export function file(file, cmd, options) {
	options = Object.assign({strip: 1}, options);

	if (typeof file !== 'string') {
		return Promise.reject(new TypeError(`Expected a \`string\`, got \`${typeof file}\``));
	}

	const temporary = tempfile();

	return decompress(file, temporary, options).then(() => exec(cmd, temporary));
}

export function url(url, cmd, options) {
	options = Object.assign({
		extract: true,
		strip: 1,
	}, options);

	if (typeof url !== 'string') {
		return Promise.reject(new TypeError(`Expected a \`string\`, got \`${typeof url}\``));
	}

	const temporary = tempfile();

	return download(url, temporary, options).then(() => exec(cmd, temporary));
}

/* eslint import/no-anonymous-default-export: [2, {"allowObject": true}] */
export default {
	directory,
	file,
	url,
};

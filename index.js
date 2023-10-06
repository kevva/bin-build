import decompress from '@xhmikosr/decompress';
import download from '@xhmikosr/downloader';
import {execaCommand} from 'execa';
import pMapSeries from 'p-map-series';
import tempfile from 'tempfile';

function exec (cmd, cwd) {
	return pMapSeries(cmd, x => execaCommand(x, {
		cwd,
		shell: true
	}));
}

export function directory (dir, cmd) {
	if (typeof dir !== 'string') {
		return Promise.reject(new TypeError(`Expected a \`string\`, got \`${typeof dir}\``));
	}

	return exec(cmd, dir);
}

export function file (file, cmd, options) {
	const optionsWithDefaults = {
		strip: 1,
		...options
	};

	if (typeof file !== 'string') {
		return Promise.reject(new TypeError(`Expected a \`string\`, got \`${typeof file}\``));
	}

	const temporary = tempfile();

	return decompress(file, temporary, optionsWithDefaults).then(() => exec(cmd, temporary));
}

export function url (url, cmd, options) {
	const optionsWithDefaults = {
		extract: true,
		decompress: {
			strip: options?.strip ?? 1
		},
		...options
	};

	if (typeof url !== 'string') {
		return Promise.reject(new TypeError(`Expected a \`string\`, got \`${typeof url}\``));
	}

	const temporary = tempfile();

	return download(url, temporary, optionsWithDefaults).then(() => exec(cmd, temporary));
}

const all = {
	directory,
	file,
	url
};

export default all;

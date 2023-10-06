/* eslint-env jest */
import path from 'node:path';
import url from 'node:url';
import fs from 'node:fs/promises';
import nock from 'nock';
import tempfile from 'tempfile';
import decompress from '@xhmikosr/decompress';
import m from '../index.js';

const thisDirname = url.fileURLToPath(new URL('.', import.meta.url));

async function pathExists (path) {
	let result;

	try {
		await fs.access(path);
		result = true;
	} catch {
		result = false;
	}

	return result;
}

function fixturePath (name) {
	return path.join(thisDirname, 'fixtures', name);
}

function autoCommand (temp) {
  return [
		'autoreconf -ivf',
		`./configure --disable-gifview --disable-gifdiff --prefix="${temp}" --bindir="${temp}"`,
		'make install',
	];
}

describe('bin-build', () => {
	let temporaryFile;

	beforeEach(() => {
		temporaryFile = tempfile();
	});

	afterEach(async () => {
		let recursive = false;
		const exists = await pathExists(temporaryFile);
		if (exists) {
			const stats = await fs.stat(temporaryFile);
			recursive = stats.isDirectory();
		}
		await fs.rm(temporaryFile, {
			force: true,
			recursive
		});
	});

	test('download and build source', async () => {
		nock('http://foo.com')
			.get('/gifsicle.tar.gz')
			.replyWithFile(200, fixturePath('test.tar.gz'));

		await m.url('http://foo.com/gifsicle.tar.gz', autoCommand(temporaryFile));

		expect(await pathExists(path.join(temporaryFile, 'gifsicle'))).toBeTruthy();
	});

	test('build source from existing archive', async () => {
		await m.file(fixturePath('test.tar.gz'), autoCommand(temporaryFile));

		expect(await pathExists(path.join(temporaryFile, 'gifsicle'))).toBeTruthy();
	});

	test('build source from directory', async () => {
		await fs.mkdir(temporaryFile, {
			recursive: true
		});

		await decompress(fixturePath('test.tar.gz'), temporaryFile, {strip: 1});
		await m.directory(temporaryFile, autoCommand(temporaryFile));

		expect(await pathExists(path.join(temporaryFile, 'gifsicle'))).toBeTruthy();
	});

	test('directory accepts a string', () => {
		return expect(m.directory([])).rejects.toThrow('Expected a `string`, got `object`');
	});

	test('file accepts a string', () => {
		return expect(m.file([])).rejects.toThrow('Expected a `string`, got `object`');
	});

	test('url accepts a string', () => {
		return expect(m.url([])).rejects.toThrow('Expected a `string`, got `object`');
	});
});


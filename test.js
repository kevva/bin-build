import path from 'path';
import nock from 'nock';
import pathExists from 'path-exists';
import pify from 'pify';
import rimraf from 'rimraf';
import test from 'ava';
import fn from './';

const tmp = path.join(__dirname, 'tmp');

test.afterEach(async () => await pify(rimraf)(tmp));

test('download and build source', async t => {
	const scope = nock('http://foo.com')
		.get('/gifsicle.tar.gz')
		.replyWithFile(200, path.join(__dirname, 'fixtures', 'test.tar.gz'));

	await fn('http://foo.com/gifsicle.tar.gz', [
		'autoreconf -ivf',
		`./configure --disable-gifview --disable-gifdiff --prefix="${tmp}" --bindir="${tmp}"`,
		'make install'
	]);

	t.true(scope.isDone());
	t.true(await pathExists(path.join(tmp, 'gifsicle')));
});

test('build source from existing archive', async t => {
	await fn(path.join(__dirname, 'fixtures', 'test.tar.gz'), [
		'autoreconf -ivf',
		`./configure --disable-gifview --disable-gifdiff --prefix="${tmp}" --bindir="${tmp}"`,
		'make install'
	]);

	t.true(await pathExists(path.join(tmp, 'gifsicle')));
});

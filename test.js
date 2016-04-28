import path from 'path';
import nock from 'nock';
import pathExists from 'path-exists';
import pify from 'pify';
import rimraf from 'rimraf';
import tempfile from 'tempfile';
import test from 'ava';
import fn from './';

test.beforeEach(t => {
	t.context.tmp = tempfile();
});

test.afterEach(async t => {
	await pify(rimraf)(t.context.tmp);
});

test('download and build source', async t => {
	const scope = nock('http://foo.com')
		.get('/gifsicle.tar.gz')
		.replyWithFile(200, path.join(__dirname, 'fixtures', 'test.tar.gz'));

	await fn.url('http://foo.com/gifsicle.tar.gz', [
		'autoreconf -ivf',
		`./configure --disable-gifview --disable-gifdiff --prefix="${t.context.tmp}" --bindir="${t.context.tmp}"`,
		'make install'
	]);

	t.true(scope.isDone());
	t.true(await pathExists(path.join(t.context.tmp, 'gifsicle')));
});

test('build source from existing archive', async t => {
	await fn.file(path.join(__dirname, 'fixtures', 'test.tar.gz'), [
		'autoreconf -ivf',
		`./configure --disable-gifview --disable-gifdiff --prefix="${t.context.tmp}" --bindir="${t.context.tmp}"`,
		'make install'
	]);

	t.true(await pathExists(path.join(t.context.tmp, 'gifsicle')));
});

test('show helpful error message on failure', async t => {
	const msg = [
		'Make sure that the following dependencies are installed:\n\n',
		'    unicorn\n',
		'    cake'
	].join('');

	t.throws(fn.file(path.join(__dirname, 'fixtures', 'test.tar.gz'), [
		'make install'
	], {dependencies: ['unicorn', 'cake']}), new RegExp(msg));
});

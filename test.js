'use strict';

var BinBuild = require('./');
var fs = require('fs');
var path = require('path');
var test = require('ava');

test('expose a constructor', function (t) {
    t.plan(1);
    t.assert(typeof BinBuild === 'function');
});

test('set source file', function (t) {
    t.plan(1);

    var build = new BinBuild()
        .src('src.tar.gz');

    t.assert(build._src === 'src.tar.gz');
});

test('add commands to run', function (t) {
    t.plan(2);

    var build = new BinBuild()
        .cmd('make')
        .cmd('make install');

    t.assert(build._cmd[0] === 'make');
    t.assert(build._cmd[1] === 'make install');
});

test('should download and build source', function (t) {
    t.plan(2);

    var tmp = path.join(__dirname, 'tmp');
    var build = new BinBuild()
        .src('http://www.lcdf.org/gifsicle/gifsicle-1.84.tar.gz')
        .cmd('./configure --disable-gifview --disable-gifdiff --prefix="' + tmp + '" --bindir="' + tmp + '"')
        .cmd('make install');

    build.build(function (err) {
        t.assert(!err);

        fs.exists(path.join(tmp, 'gifsicle'), function (exists) {
            t.assert(exists);
        });
    });
});

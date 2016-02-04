'use strict';

let gulp = require('gulp');
let del = require('del');

gulp.paths = {
  tssrc: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!node_modules',
    '!**/*.{ts,coffee}.js'],
  jssrc: [
    '*.js',
    'gulp-tasks/*.js',
    '!node_modules',
    '!**/*.{ts,coffee}.js']
};

require('require-dir')('./gulp-tasks');

gulp.task('clean', function(cb) {
  del([
    'src/**/*.d.ts',
    'src/**/*.js',
    'src/**/*.js.map'
  ]).then(() => {cb();});
});

gulp.task('default', function () {
  gulp.start('lint');
});

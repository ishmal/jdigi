var babelify = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var concat = require('gulp-concat');
var gulp = require('gulp');
var jshint = require("gulp-jshint");
var rimraf = require("gulp-rimraf");
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var mocha = require('gulp-mocha');

/*
gulp.task('build', function() {
    var bundler = browserify('./src/index.js', { debug: true }).transform(babelify.configure({compact: false}));
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('jdigi.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'));
});
*/

gulp.task('build', function() {
    var bundler = browserify('./src/index.js', { debug: true }).transform(babelify);
    bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('jdigi.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'));
});

gulp.task('jshint', function() {
    return gulp.src('src/**/*.js')
        .pipe(jshint({esnext : true}))
        .pipe(jshint.reporter('default'))
});

gulp.task('mocha', function() {
    return gulp.src('test/**/test*.js')
        .pipe(jshint())
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('copy', function() {
    return gulp.src('./html/**')
        .pipe(gulp.dest('./dist'));
});

gulp.task('clean', function () {
    gulp.src('build/*', {read: false}).pipe(rimraf());
    gulp.src('dist/*', {read: false}).pipe(rimraf());
    gulp.src('tmp/*', {read: false}).pipe(rimraf());
});

gulp.task('default', ['build', 'copy']);
gulp.task('test', ['jshint', 'mocha'])

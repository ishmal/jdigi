var gulp       = require('gulp');
var browserify = require('gulp-browserify');
var rimraf     = require('gulp-rimraf');
var concat     = require('gulp-concat');
var jshint     = require('gulp-jshint');
var mocha      = require('gulp-mocha');
var rename     = require('gulp-rename');
var requirejs  = require('gulp-requirejs');
var traceur    = require('gulp-traceur');
var uglify     = require('gulp-uglify');

gulp.task('jshint', function() {
    return gulp.src('src/**/*.js')
        .pipe(jshint({esnext : true}))
        .pipe(jshint.reporter('default'))
 });


gulp.task('traceur', function() {
    return gulp.src('src/**/*.js')
        .pipe(traceur({modules:'commonjs'}))
        .pipe(gulp.dest('tmp'));
});

gulp.task('webify', ['traceur'], function() {
    return gulp.src('tmp/main.js')
        .pipe(browserify({insertGlobals : true, debug:true}))
        .pipe(rename('jdigi.js'))
        .pipe(gulp.dest('dist'));
});

// this is for future implementation
gulp.task('webify2', ['traceur'], function() {
    requirejs({
        baseUrl: 'tmp',
        name: 'main',
        out: 'jdigi.js',
        paths: {
            requireLib : "../html/require"
        },
        include: "requireLib",
        shim: {
            //standard require.js shim options
        }
        })
        .pipe(gulp.dest('dist'));
});

gulp.task('uglify', ['webify'], function() {
    return gulp.src('dist/jdigi.js')
        .pipe(uglify())
        .pipe(rename('jdigi.min.js'))
        .pipe(gulp.dest('dist'));
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
    gulp.src('dist/*', {read: false}).pipe(rimraf());
    gulp.src('tmp/*', {read: false}).pipe(rimraf());
});

gulp.task('build', ['uglify']);
gulp.task('default', ['jshint', 'build', 'copy']);
gulp.task('test', ['jshint', 'mocha'])

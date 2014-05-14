var gulp       = require('gulp');
var browserify = require('gulp-browserify');
var concat     = require('gulp-concat');
var jshint     = require('gulp-jshint');
var mocha      = require('gulp-mocha');
var uglify     = require('gulp-uglify');

gulp.task('jshint', function() {
    return gulp.src('src/**/*.js')
        .pipe(jshint())
 });

gulp.task('build', function() {
    return gulp.src('src/main.js')
        .pipe(browserify({insertGlobals : true}))
        .pipe(concat('jdigi.js'))
        .pipe(gulp.dest('dist'))
});

gulp.task('minify', function() {
    return gulp.src('src/main.js')
        .pipe(browserify({insertGlobals : true}))
        .pipe(uglify())
        .pipe(concat('jdigi.min.js'))
        .pipe(gulp.dest('dist'))
});

gulp.task('mocha', function() {
    return gulp.src(['test/**/test*.js'], { read: false })
        .pipe(jshint())
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('copy', function() {
    return gulp.src('./html/*')
        .pipe(gulp.dest('./dist'));
});


gulp.task('default', ['jshint', 'build', 'minify', 'copy']);
gulp.task('test', ['jshint', 'mocha'])

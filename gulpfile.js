var gulp       = require('gulp');
var browserify = require('gulp-browserify');
var clean      = require('gulp-clean');
var concat     = require('gulp-concat');
var jshint     = require('gulp-jshint');
var mocha      = require('gulp-mocha');
var rename     = require('gulp-rename');
var uglify     = require('gulp-uglify');

gulp.task('jshint', function() {
    return gulp.src('src/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
 });

gulp.task('build', function() {
    return gulp.src('src/main.js')
        .pipe(browserify({insertGlobals : true}))
        .pipe(rename('jdigi.js'))
        .pipe(gulp.dest('dist'))
        .pipe(uglify())
        .pipe(rename('jdigi.min.js'))
        .pipe(gulp.dest('dist'))
});

gulp.task('mocha', function() {
    return gulp.src(['test/**/test*.js'], { read: false })
        .pipe(jshint())
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('copy', function() {
    return gulp.src('./html/**')
        .pipe(gulp.dest('./dist'));
});

gulp.task('clean', function () {  
  return gulp.src('dist/*', {read: false})
    .pipe(clean());
});
gulp.task('default', ['jshint', 'build', 'copy']);
gulp.task('test', ['jshint', 'mocha'])

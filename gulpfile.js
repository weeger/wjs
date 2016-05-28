/**
 * To install dependencies run :
 * npm i -D gulp gulp-babel babel-preset-es2015 gulp-sourcemaps gulp-uglify gulp-concat
 */
const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

gulp.task('buildCoreJs', () => {
  return gulp.src('src/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(concat('w.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.'));
});

gulp.task('watch', () => {
  gulp.watch(['src/*.js'], ['buildCoreJs']);
});

gulp.task('default', ['watch']);

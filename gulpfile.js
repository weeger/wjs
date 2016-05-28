/**
 * To install dependencies run :
 * npm i -D gulp gulp-babel gulp-sync babel-preset-es2015 gulp-sourcemaps gulp-uglify gulp-concat git-guppy
 */
const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const git = require('gulp-git');
const gulpsync = require('gulp-sync')(gulp);

gulp.task('buildCoreJs', () => {
  console.log('core');
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

var guppy = require('git-guppy')(gulp);

gulp.task('gitCommit', () => {
  console.log('commit');
  return gulp.src('w.min.js')
    .pipe(git.add());
});

gulp.task('default', ['watch']);
gulp.task('pre-commit', gulpsync.sync(['buildCoreJs', 'gitCommit']));

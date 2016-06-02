/**
 * To install dependencies run :
 * npm i -D gulp gulp-git gulp-babel gulp-sync babel-preset-es2015 gulp-sourcemaps gulp-uglify gulp-concat git-guppy guppy-pre-commit
 */
var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var git = require('gulp-git');
var sync = require('gulp-sync')(gulp);

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

// Define files to watch.
gulp.task('watch', () => {
  gulp.watch(['src/*.js'], ['buildCoreJs']);
});

// Define extra actions to perform on commit only.
gulp.task('gitCommit', () => {
  return gulp.src(['w.min.js','w.min.js.map'])
    .pipe(git.add());
});

// Hook git.
gulp.task('pre-commit', sync.sync(['buildCoreJs', 'gitCommit']));

gulp.task('default', ['watch']);

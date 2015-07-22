/* jshint -W079 */ // prevent redefinition of $ warning

'use strict'
// gulp
var gulp = require('gulp')
var paths = gulp.paths
// plugins
var $ = require('gulp-load-plugins')()

// all linting tasks
gulp.task('linting', ['standard', 'jsonlint'])
gulp.task('linting-throw', ['standard-throw', 'jsonlint-throw'])

// check for standard errors
var standard = function (fail) {
  return function () {
    return gulp.src(paths.jsFiles)
      .pipe($.standard())
      .pipe($.standard.reporter('default', {
        breakOnError: true
      }))
      .pipe($.if(fail, $.standard.reporter('default')))
  }
}
gulp.task('standard', standard())
gulp.task('standard-throw', standard(true))

// check for jsonlint errors
var jsonlint = function (fail) {
  var failReporter = function (file) {
    throw new Error(file.path + '\n' + file.jsonlint.message)
  }
  return function () {
    return gulp.src(paths.jsonFiles)
      .pipe($.jsonlint())
      .pipe($.jsonlint.reporter(fail ? failReporter : undefined))
  }
}
gulp.task('jsonlint', jsonlint())
gulp.task('jsonlint-throw', jsonlint(true))

"use strict";

var gulp = require("gulp"),
    lint = require("gulp-jshint");

var src = ["start.js", "src/**/*.js"];
var allSrc = src;

gulp.task("lint", function() {
    return gulp.src(allSrc)
        .pipe(lint())
        .pipe(lint.reporter("default"));
});

gulp.task("default", ["lint"]);

var gulp = require('gulp')
var replace = require('gulp-replace')
var rename = require("gulp-rename")
var fs = require('fs')

gulp.task('build', function() {
    var settingHtml = fs.readFileSync('./advanced-transformation-setting.html', 'utf8');

    gulp.src('./advanced-transformation.js')
        .pipe(replace(
            "SETTING_TEMPLATE = 'app/tabledata/advanced-transformation-setting.html'",
            "SETTING_TEMPLATE = `" + settingHtml + "`"))
        // .pipe(replace(
        //     "lo = _",
        //     "lo = require('lodash')"))
        .pipe(replace(
            "const Transformation = require('./transformation')",
            "import Transformation from 'zeppelin-tabledata/transformation'"))
        .pipe(rename('index.js'))
        .pipe(gulp.dest('./'))
})

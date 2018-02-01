var gulp = require('gulp');
var sass = require('gulp-sass')
var htmlmin = require('gulp-htmlmin');

gulp.task('minify-prod', function() {
  return gulp.src('production/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('production'));
});
gulp.task('minify-stage', function() {
  return gulp.src('staging/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('staging'));
});

gulp.task('sass', function () {
  return gulp.src('./themes/regisphilibert/src/sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./themes/regisphilibert/static/css/'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./themes/regisphilibert/src/sass/**/*.scss', ['sass']);
});

gulp.task('default', ['minify-prod', 'minify-stage', 'sass']);
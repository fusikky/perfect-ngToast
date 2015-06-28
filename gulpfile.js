var gulp = require('gulp');
var stylus = require('gulp-stylus');
var babel = require('gulp-babel');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('stylus', function() {
  gulp.src('src/css/*.styl')
  .pipe(stylus())
  .pipe(autoprefixer())
  .pipe(gulp.dest('dist/css/'));
});

gulp.task('js', function() {
  gulp.src('src/js/*.js')
  .pipe(babel())
  .pipe(gulp.dest('dist/js/'));
});

gulp.task('watch', function(){
  gulp.watch('./src/css/*.styl', ['stylus']);
  gulp.watch('./src/js/*.js', ['js']);
});

gulp.task('build', ['stylus', 'js']);

gulp.task('default', ['build', 'watch']);


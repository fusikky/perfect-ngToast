var gulp = require('gulp');
var stylus = require('gulp-stylus');
var babel = require('gulp-babel');

gulp.task('stylus', function() {
  gulp.src('src/*.styl')
  .pipe(stylus())
  .pipe(gulp.dest('dist/'));
});

gulp.task('js', function() {
  gulp.src('src/*.js')
  .pipe(babel())
  .pipe(gulp.dest('dist/'));
});

gulp.task('watch', function(){
  gulp.watch('./src/*.styl', ['stylus']);
  gulp.watch('./src/*.js', ['js']);
});

gulp.task('build', ['stylus', 'js']);

gulp.task('default', ['build', 'watch']);


var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    processhtml = require('gulp-processhtml'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    minifyhtml = require('gulp-minify-html'),
    watch = require('gulp-watch'),
    notifier = require('node-notifier'),
    plumber = require('gulp-plumber'),
    webserver = require('gulp-webserver'),
    babel = require('gulp-babel'),
    babelify = require("babelify"),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    eslint = require('gulp-eslint'),
    del = require('del'),
    runSequence = require('run-sequence'),
    minimist = require('minimist');

// Set ENV constant
var ENV = process.env['NODE_ENV'] || 'local';

// CLI Options
var options = minimist(process.argv.slice(2));

console.log('[XX:XX:XX] Curent ENV:', ENV)

// Sass Options
var sassOptions = {
  outputStyle: 'compressed' // Minify CSS
}

// Plumber Options
var plumbererrorHandler = function (error) {
    console.log('\033[31m[EE:EE:EE]\033[0m', error.plugin + ' error:', error.message.replace(process.cwd(), ''));

    notifier.notify({
      'title': error.plugin + ' error',
      'sound': true,
      'message': error.message.replace(process.cwd(), '')
    });

    this.end();
    this.emit('end');
  }

// SASS Compilation
gulp.task('sass', function () {
  return gulp.src('src/scss/*.scss')
          .pipe(plumber(plumbererrorHandler))
          .pipe(sourcemaps.init())
          .pipe(sass(sassOptions))
          .pipe(sourcemaps.write('.'))
          .pipe(gulp.dest('dist/css'));
});

// JS Linting
gulp.task('lint', function() {
  return gulp.src(['!src/js/vendor/*.js', 'src/js/**/*.js'])
          .pipe(plumber(plumbererrorHandler))
          .pipe(eslint())
          .pipe(eslint.format())
});

if (options.browserify) {
    // Babel & Browserify 🔥🔥🔥
    gulp.task('scripts', ['vendor-scripts'], function() {
        return browserify({
                    entries: './src/js/main.js',
                    debug: true
                })
                .transform(babelify)
                .bundle()
                .pipe(source('site.min.js'))
                .pipe(buffer())
                .pipe(plumber(plumbererrorHandler))
                .pipe(sourcemaps.init({loadMaps: true}))
                .pipe(uglify())
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest('dist/js'));
    });
} else {
    // Just Babel 🔥
    gulp.task('scripts', ['vendor-scripts'], function () {
        return gulp.src(['!src/js/vendor/*.js', 'src/js/**/*.js'])
                .pipe(plumber(plumbererrorHandler))
                .pipe(sourcemaps.init())
                .pipe(babel())
                .pipe(uglify())
                .pipe(concat('site.min.js'))
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest('dist/js'));
    });
}


// Vendor bundle
gulp.task('vendor-scripts', function () {
    return gulp.src('src/js/vendor/**/*.js')
            .pipe(plumber(plumbererrorHandler))
            .pipe(sourcemaps.init())
            .pipe(concat('vendor.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('dist/js'));
});

// Process (and copy) HTML
gulp.task('processhtml', function () {
    return gulp.src('src/**/*.html')
            .pipe(plumber(plumbererrorHandler))
            .pipe(processhtml({
            environment: ENV,
            process: true,
            data: {
              isCritical: options.optimize || false
            }
            }))
            .pipe(gulp.dest('dist'));
});

// Minify HTML after processhtml has run.
gulp.task('html', ['processhtml'], function() {
  var opts = {
    comments: true,
    spare: true
  };

  return gulp.src(['!dist/**/_*.html', 'dist/**/*.html'])
        .pipe(plumber(plumbererrorHandler))
        .pipe(minifyhtml(opts))
        .pipe(gulp.dest('./dist'))
});

// Process Images (also copies them to dist)
gulp.task('imgmin', function () {
  return gulp.src('src/img/**/*', {base: 'src/img'})
          .pipe(plumber(plumbererrorHandler))
          .pipe(imagemin({
              progressive: true,
              svgoPlugins: [{removeViewBox: false}],
              use: [pngquant()]
          }))
          .pipe(gulp.dest('dist/img'));
});

// Main tasks.
gulp.task('default', function (cb) {
    runSequence('clean', 'build');
});
gulp.task('build', ['sass', 'lint', 'scripts', 'imgmin', 'html']);
gulp.task('clean', function (cb) {
  // Delete dist folder and rebuild.
  return del(['dist'], function () {
    cb();
  });
});

// Webserver.
gulp.task('server', function() {
  gulp.src('dist')
    .pipe(webserver({
      livereload: true,
      open: true
    }));
});

// Watch Tasks.
gulp.task('watch', ['server'], function () {
  watch('src/**/*.html', function (f, c) {
    gulp.start(['html'], c);
  });
  watch('src/js/**/*.js', function (f, c) {
    gulp.start(['lint','scripts'], c);
  });
  watch('src/scss/**/*.scss', function (f, c) {
    gulp.start('sass', c);
  });
})

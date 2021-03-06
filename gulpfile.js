// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const {
    src,
    dest,
    watch,
    series,
    parallel
} = require('gulp');
// Importing all the Gulp-related packages we want to use
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
var replace = require('gulp-replace');
const browserSync = require('browser-sync');
const server = browserSync.create();

// File paths
const files = {
    scssPath: 'docs/static/scss/*.scss',
    jsPath: 'docs/static/js/**/*.js'
}

// Sass task: compiles the style.scss file into style.css
function scssTask() {
    return src(files.scssPath)
        .pipe(sourcemaps.init()) // initialize sourcemaps first
        .pipe(sass()) // compile SCSS to CSS
        .pipe(postcss([autoprefixer(), cssnano()])) // PostCSS plugins
        .pipe(sourcemaps.write('.')) // write sourcemaps file in current directory
        .pipe(dest('docs/static/css')); // put final CSS in htdocs folder
}

// JS task: concatenates and uglifies JS files to script.js
function jsTask() {
    return src([
            files.jsPath,
            '!' + 'external/*', // to exclude any specific files
        ])
        .pipe(concat('script.js'))
        .pipe(uglify())
        .pipe(dest('docs/static/js'));
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask() {
    watch([files.scssPath, files.jsPath], {
            interval: 1000,
            usePolling: true
        }, //Makes docker work
        series(
            parallel(scssTask, jsTask)
        )
    );
}

function serveTask() {
    server.init({
        server: {
            baseDir: 'docs/'
        }
    });
}

// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs watch and serve tasks simultaneously
exports.default = series(
    parallel(scssTask, jsTask),
    parallel(watchTask, serveTask)
);

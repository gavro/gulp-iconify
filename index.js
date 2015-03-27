var gulp    = require('gulp');
var iconify = require('./lib/iconify');
var del     = require('del');
var svg2png = require('gulp-svg2png');
var sass    = require('gulp-sass');
var gutil   = require('gulp-util');
var path    = require('path');

function getErrors(opts) {
    var error = {};

    if(!opts.src) {
        error.src = "Error: src not defined; please specify your source (src: './img/icons/*.svg').";
    }

    if(Object.keys(error).length) {
        Object.keys(error).forEach(function(k) {
            gutil.log(error[k]);
        });

        process.exit();
    }
}

function setFallbacks(opts) {
    var warning = {};

    if(!opts.pngOutput) {
        opts.pngOutput = path.dirname(opts.src)+'/png';
        warning.pngOutput = "Info: No pngOutput folder defined. Using fallback ("+opts.pngOutput+").";
    }

    if(!opts.cssOutput) {
        opts.cssOutput = './css';
        warning.cssOutput = "Info: No cssOutput folder defined. Using fallback ("+opts.cssOutput+").";
    }

    if(!opts.scssOutput) {
        opts.scssDisabled = true;
        warning.scssOutput = "Info: No scssOutput folder defined. SCSS files will not be saved.";
    }

    if(!opts.styleTemplate) {
        opts.styleTemplate = path.join(__dirname, 'lib/output.mustache');
        warning.styleTemplate = "Info: No styleTemplate defined. Using default template.";
    }

    if(!opts.svgoOptions) {
        opts.svgoOptions = { enabled: true }
        warning.svgoOptions = "Info: No SVGO options defined, enabling SVGO by default.";
    }

    if(!opts.defaultWidth) {
        opts.defaultWidth = "300px";
        warning.defaultWidth = "Info: No defaultWidth defined. Using fallback ("+opts.defaultWidth+") if SVG has no width.";
    }

    if(!opts.defaultHeight) {
        opts.defaultHeight = "200px";
        warning.defaultHeight = "Info: No defaultHeight defined. Using fallback ("+opts.defaultHeight+") if SVG has no height.";
    }

    if(Object.keys(warning).length) {
        Object.keys(warning).forEach(function(k) {
            gutil.log(warning[k]);
        });
    }
}

module.exports = function(opts) {
    opts = opts || {};
    opts.scssDisabled = false;

    getErrors(opts);
    setFallbacks(opts);

    gulp.task('iconify-clean', function(cb) {
        if(!opts.scssOutput) {
            opts.scssDisabled = true;
            opts.scssOutput = opts.cssOutput;
        }

        del([opts.scssOutput+'/icons.*.scss', opts.cssOutput+'/icons.*.css', opts.pngOutput+'/*.png'], cb);
    });

    gulp.task('iconify-convert', ['iconify-clean'], function() {
        gulp.src(opts.src)
            .pipe(iconify({
                styleTemplate: opts.styleTemplate,
                styleName: 'icons.svg.scss',
                svgoOptions: opts.svgoOptions,
                defaultWidth: opts.defaultWidth,
                defaultHeight: opts.defaultHeight
            }))
            .pipe(gulp.dest(opts.scssOutput));

        var stream = gulp.src(opts.src)
            .pipe(svg2png())
                .pipe(gulp.dest(opts.pngOutput))
                    .pipe(iconify({
                        styleTemplate: opts.styleTemplate,
                        styleName: 'icons.png.scss',
                        defaultWidth: opts.defaultWidth,
                        defaultHeight: opts.defaultHeight
                    }))
                    .pipe(gulp.dest(opts.scssOutput));

        return stream;
    });

    gulp.task('iconify-fallback', ['iconify-clean', 'iconify-convert'], function() {
        var stream = gulp.src(opts.pngOutput+'/*.png')
            .pipe(iconify({
                styleTemplate: opts.styleTemplate,
                styleName: 'icons.fallback.scss',
                noConvert: true,
                noConvertTarget: opts.scssOutput
            }))
            .pipe(gulp.dest(opts.scssOutput));

        return stream;
    });

    gulp.task('iconify-sass', ['iconify-convert', 'iconify-fallback'], function() {
        var stream = gulp.src(opts.scssOutput+'/icons.*.scss')
            .pipe(sass({
                outputStyle: 'compressed'
            }))
            .pipe(gulp.dest(opts.cssOutput));

        return stream;
    });

    gulp.task('iconify', ['iconify-convert', 'iconify-fallback', 'iconify-sass'], function() {
        // remove SCSS files if folder is not set.
        if(opts.scssDisabled) {
            del.sync([opts.scssOutput+'/icons.*.scss']);
        }
    });

    gulp.start('iconify');
};
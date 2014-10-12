var gulp    = require('gulp');
var iconify = require('./lib/iconify');
var del     = require('del');
var svg2png = require('gulp-svg2png');
var sass    = require('gulp-sass');

module.exports = function(opts) {
    gulp.task('iconify-clean', function(cb) {
        del([opts.scssOutput+'/icons.*.scss', opts.cssOutput+'/icons.*.css', opts.pngOutput+'/*.png'], cb);
    });

    gulp.task('iconify-convert', ['iconify-clean'], function() {
        gulp.src(opts.svgSrc)
            .pipe(iconify({
                styleTemplate: opts.styleTemplate,
                styleName: 'icons.svg.scss'
            }))
            .pipe(gulp.dest(opts.scssOutput));

        var stream = gulp.src(opts.svgSrc)
            .pipe(svg2png())
                .pipe(gulp.dest(opts.pngOutput))
                    .pipe(iconify({
                        styleTemplate: opts.styleTemplate,
                        styleName: 'icons.png.scss'
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

    gulp.task('iconify', ['iconify-convert', 'iconify-fallback'], function() {
        gulp.src(opts.scssOutput+'/icons.*.scss')
            .pipe(sass())
            .pipe(gulp.dest(opts.cssOutput));
    });

    gulp.start('iconify');
};
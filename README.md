gulp-iconify
============

'A mystical CSS icon solution', [grunticon](https://github.com/filamentgroup/grunticon)-like build system for [Gulp](https://github.com/gulpjs/gulp):

'~~grunticon is a Grunt.js~~ gulp-iconify is a gulp task that makes it easy to manage icons and background images for all devices, preferring HD (retina) SVG icons but also provides fallback support for standard definition browsers, and old browsers alike. From a CSS perspective, it's easy to use, as it generates a class referencing each icon, and doesn't use CSS sprites.'


##Usage
```shell
npm install gulp-iconify --save-dev
```


###Example config
```javascript
gulp.task('default', function() {
    iconify({
        svgSrc: './img/icons/*.svg',
        pngOutput: './img/icons/png',
        scssOutput: './scss',
        cssOutput:  './css',
        styleTemplate: '_icon_gen.scss.mustache'
    });
});
```


###Example styleTemplate:
```mustache
.icon {
    background-repeat: no-repeat;

    {{#items}}
    &.icon-{{slug}} {
        background-image: url('{{{datauri}}}');
    }

    {{/items}}
}
```
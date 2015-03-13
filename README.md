gulp-iconify
============

'A mystical CSS icon solution', [grunticon](https://github.com/filamentgroup/grunticon)-like build system for [Gulp](https://github.com/gulpjs/gulp):

'~~grunticon is a Grunt.js~~ gulp-iconify is a gulp task that makes it easy to manage icons and background images for all devices, preferring HD (retina) SVG icons but also provides fallback support for standard definition browsers, and old browsers alike. From a CSS perspective, it's easy to use, as it generates a class referencing each icon, and doesn't use CSS sprites.'


##Usage
```shell
npm install gulp-iconify --save-dev
```

###Simple example
```javascript
gulp.task('default', function() {
    iconify({
        src: './img/icons/*.svg'
    });
});
```

This simple call defaults to the following:
- SVGs will be passed through SVGO (and optimised)
- Rendered PNGs will be saved in: './img/icons/png'
- Rendered SCSS files will NOT be saved
- Rendered CSS files will be saved in: './css'
- The default styleTemplate fill be used (see below)

###Customized example
```javascript
gulp.task('default', function() {
    iconify({
        src: './img/icons/*.svg',
        pngOutput: './img/icons/png',
        scssOutput: './scss',
        cssOutput:  './css',
        styleTemplate: '_icon_gen.scss.mustache'
        svgoOptions: {
            enabled: true,
            options: {
                plugins: [
                    { removeUnknownsAndDefaults: false },
                    { mergePaths: false }
                ]
            }
        }
    });
});
```

Note: To disable SVGO, just set ```svgoOptions: { enabled: ___ }``` to anything but ```true``` .

###Example (and default) styleTemplate:
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
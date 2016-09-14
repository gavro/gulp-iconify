gulp-svgify
===========
A SVG to CSS icon solution non-broken fork of gulp-iconify

##Usage
```shell
npm install gulp-svgify --save-dev
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
- If SVG has no width attribute, the default fallback will be 300px
- If SVG has no height attribute, the default fallback will be 200px
- The default styleTemplate fill be used (examples shown below)
- The default styleTemplate will *not* use the height/width slugs
- See [gulp-svg2png](https://github.com/akoenig/gulp-svg2png) for default settings

###Customized example
```javascript
gulp.task('default', function() {
    iconify({
        src: './img/icons/*.svg',
        pngOutput: './img/icons/png',
        scssOutput: './scss',
        cssOutput:  './css',
        styleTemplate: '_icon_gen.scss.mustache',
        defaultWidth: '300px',
        defaultHeight: '200px',
        svgoOptions: {
            enabled: true,
            options: {
                plugins: [
                    { removeUnknownsAndDefaults: false },
                    { mergePaths: false }
                ]
            }
        },
        svg2pngOptions: {
            scaling: 1.0,
            verbose: true,
            concurrency: null
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

###Example styleTemplate with height/width slugs:
```mustache
.icon {
    background-repeat: no-repeat;

    {{#items}}
    &.icon-{{slug}} {
        background-image: url('{{{datauri}}}');
        width: {{width}}px;
        height: {{height}}px;
    }

    {{/items}}
}
```
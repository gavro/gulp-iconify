var fs       = require('fs');
var path     = require('path');
var mustache = require('mustache');
var through  = require('through');
var gutil    = require('gulp-util');
var imacss   = require('imacss');
var svgo     = require('svgo');
var dom      = require('xmldom');

var getDimensions = function (type, image) {
    var dimensions = {};

    if(type === 'svg') {
        var doc = new dom.DOMParser().parseFromString(image.contents.toString('utf-8'));
        dimensions.width = Math.round(doc.documentElement.getAttribute('width'));
        dimensions.height = Math.round(doc.documentElement.getAttribute('height'));
    } else {
        var hexString = image.contents.toString("hex");
        var i = 16, l;

        for( l = hexString.length; i < l; i++ ){
            var d = hexString.slice(i, i+8);
            if( d === "49484452" ){
                i = i+8;
                break;
            }
        }

        dimensions.width = parseInt(hexString.slice(i, i+8).toString(16), 16);
        i = i+8;
        dimensions.height = parseInt(hexString.slice(i, i+8).toString(16), 16);
    }

    return dimensions;
}

imacss.partialtransform = function partialtransform (glob, css, opts) {
    // imacss extra includes
    var domain   = require('domain');
    var through  = require('through2');
    var pipeline = require('imacss/lib');
    var pkg      = require('../package.json');

    var execution = domain.create();
    var transformation;

    css = css || pkg.name;

    execution.on('error', function (err) {
        transformation.emit('error', err);
    });

    execution.run(function () {
        function normalizeSVGs (image, enc, callback) {
            var dim;

            if(image.mime === 'image/svg+xml') {
                if(typeof opts.svgoOptions !== 'undefined' && (typeof opts.svgoOptions.enabled === 'undefined' || opts.svgoOptions.enabled === true)) {
                    if(typeof opts.svgoOptions.options === 'object') {
                        var svg = new svgo(opts.svgoOptions.options);
                    } else {
                        var svg = new svgo();
                    }

                    svg.optimize(String(image.contents), function(result) {
                        if (result.error) {
                            gutil.log('Error: ' + result.error + ' [file: '+image.name+']');
                        } else {
                            image.contents = new Buffer(result.data);
                        }
                    });
                }

                image.datauri = 'data:'+image.mime+';charset=UTF-8,'+encodeURIComponent(image.contents.toString('utf-8'));
                dim = getDimensions('svg', image);
            } else {
                dim = getDimensions('png', image);
            }

            image.width = String(dim.width || opts.defaultWidth).replace(/px/, "");
            image.height = String(dim.height || opts.defaultHeight).replace(/px/, "");

            this.push(image);
            callback();
        }

        transformation = pipeline.createFileStream(glob)
            .pipe(pipeline.purify())
            .pipe(pipeline.slugify())
            .pipe(pipeline.mimeify())
            .pipe(pipeline.urify())
            .pipe(through.obj(normalizeSVGs));
    });

    return transformation;
};

module.exports = function(opts) {
    var tpl = fs.readFileSync(opts.styleTemplate).toString();

    var buffer = [];
    var noConvert = opts.noConvert;
    var noConvertTarget = '.';

    if(typeof opts.noConvertTarget !== 'undefined') {
        var parts = opts.noConvertTarget.replace(/^[\/\.]+|[\/\.]+$/g, '').split('/');

        noConvertTarget = '';
        for (var i = parts.length - 1; i >= 0; i--) {
            noConvertTarget += '../';
        }
    }

    var bufferContents = function(file) {
        if(noConvert) {
            buffer.push({
                slug: file.relative.replace('.'+getExtension(file.relative), ''),
                datauri: path.normalize(noConvertTarget+file.base.replace(file.cwd, ''))+file.relative
            });
        } else {
            imacss
                .partialtransform(file, 'icon', opts)
                .on('data', function (selector) {
                    buffer.push(selector);
                })
                .once('error', this.emit.bind(this, 'error'));
        }
    };

    var endStream = function() {
        this.emit('data', new gutil.File({
              contents: new Buffer(mustache.render(tpl, {
                  items: buffer
              }), 'utf8'),
              path: opts.styleName
          }));
        this.emit('end');
    };

    var getExtension = function (filename) {
        var ext = path.extname(filename||'').split('.');
        return ext[ext.length - 1];
    };

    return new through(bufferContents, endStream);
};

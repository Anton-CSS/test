const { src, dest, parallel, series, watch } = require('gulp');
const sass = require('gulp-sass');
const notify = require("gulp-notify");
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const rename = require("gulp-rename");
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const fs = require('fs');
const ttf2woff2 = require('gulp-ttf2woff2');
const del = require('del');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const uglify = require('gulp-uglify-es').default;
const imagemin = require('gulp-imagemin');
const gutil = require('gulp-util');
const ftp = require('vinyl-ftp');
const htmlmin = require('gulp-htmlmin');
const webp = require('gulp-webp');

const fonts = () => {
  // src('./src/fonts/**.ttf')
  //   .pipe(ttfToWoff())
  //   .pipe(dest('./dist/fonts/'))
  return src('./src/fonts/**.ttf')
    .pipe(ttf2woff2())
    .pipe(dest('./dist/fonts/'))
}

const checkWeight = (fontname) => {
  let weight = 400;
  switch (true) {
    case /Thin/.test(fontname):
      weight = 100;
      break;
    case /ExtraLight/.test(fontname):
      weight = 200;
      break;
    case /Light/.test(fontname):
      weight = 300;
      break;
    case /Regular/.test(fontname):
      weight = 400;
      break;
    case /Medium/.test(fontname):
      weight = 500;
      break;
    case /SemiBold/.test(fontname):
      weight = 600;
      break;
    case /Semi/.test(fontname):
      weight = 600;
      break;
    case /Bold/.test(fontname):
      weight = 700;
      break;
    case /ExtraBold/.test(fontname):
      weight = 800;
      break;
    case /Heavy/.test(fontname):
      weight = 700;
      break;
    case /Black/.test(fontname):
      weight = 900;
      break;
    default:
      weight = 400;
  }
  return weight;
}


const cb = () => { }

let srcFonts = './src/scss/_fonts.scss';
let appFonts = './dist/fonts/';

const fontsStyle = (done) => {
  let file_content = fs.readFileSync(srcFonts);

  fs.writeFile(srcFonts, '', cb);
  fs.readdir(appFonts, function (err, items) {
    if (items) {
      let c_fontname;
      for (var i = 0; i < items.length; i++) {
        let fontname = items[i].split('.');
        fontname = fontname[0];
        let font = fontname.split('-')[0];
        let weight = checkWeight(fontname);

        if (c_fontname != fontname) {
          fs.appendFile(srcFonts, '@include font-face("' + font + '", "' + fontname + '", ' + weight + ');\r\n', cb);
        }
        c_fontname = fontname;
      }
    }
  })

  done();
}

const svgSprites = () => {
  return src('./src/img/svg/**.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../sprite.svg"
        }
      }
    }))
    .pipe(dest('./dist/img'))
}

const resources = () => {
  return src('./src/assets/**')
    .pipe(dest('./dist/assets/'))
}

const styles = () => {
  return src('./src/scss/style.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', notify.onError()))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(cleanCSS({
      level: 2,
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./dist/css/'))
    .pipe(browserSync.stream());
};

const scripts = () => {
  return src('./src/js/index.js')
    .pipe(webpackStream({
      mode: 'development',
      output: {
        filename: 'index.js',
      },
      module: {
        rules: [{
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }]
      },
    }))
    .on('error', function (err) {
      console.error('WEBPACK ERROR', err);
      this.emit('end'); // Don't stop the rest of the task
    })

    .pipe(sourcemaps.init())
    .pipe(uglify().on("error", notify.onError()))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./dist/js'))
    .pipe(browserSync.stream());
}


const htmlInclude = () => {
  return src(['./src/**/*.html'])
    .pipe(fileinclude({
      prefix: '@',
      basepath: '@file'
    }))
    .pipe(dest('./dist'))
    .pipe(browserSync.stream());
}
const clean = () => {
  return del(['dist/*'])
}
const imgToDist = () => {
  src(['./src/img/**.jpg', './src/img/**.png', './src/img/**.jpeg', './src/img/**.svg'])
    .pipe(dest('./dist/img'))
  return src(['./src/img/**.jpg', './src/img/**.png', './src/img/**.jpeg'])
    .pipe(webp({
      quality: 70,
    }))
    .pipe(dest('./dist/img'))
}
const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
  watch('./src/scss/**/*.scss', styles);
  watch('./src/**/*.html', htmlInclude);
  watch('./src/img/**.jpg', imgToDist);
  watch('./src/img/**.png', imgToDist);
  watch('./src/img/**.jpeg', imgToDist);
  watch('./src/img/**.webp', imgToDist);
  watch('./src/img/**.svg', svgSprites);
  watch('./src/assets/**', resources);
  watch('./src/fonts/**.ttf', fonts);
  watch('./src/fonts/**.ttf', fontsStyle);
  watch('./src/js/**/*.js', scripts);
}

exports.styles = styles;
exports.watchFiles = watchFiles;
exports.fileinclude = htmlInclude;


exports.default = series(clean, parallel(htmlInclude, scripts, fonts, imgToDist, svgSprites, resources), fontsStyle, styles, watchFiles)

const imageMin = () => {
  return src(['./src/img/**.jpg', './src/img/**.png', './src/img/**.jpeg', './src/img/**.webp'])
    .pipe(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      optimizationLevel: 3
    }))
    .pipe(dest('./dist/img'))
}

const stylesBuild = () => {
  return src('./src/scss/**/*.scss')
    .pipe(sass({
      outputStyle: 'expanded'
    }).on('error', notify.onError()))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(autoprefixer({
      cascade: false,
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(dest('./dist/css/'))
}

const scriptsBuild = () => {
  return src('./src/js/index.js')
    .pipe(webpackStream({
      mode: 'development',
      output: {
        filename: 'buindle.js',
      },
      module: {
        rules: [{
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        }]
      },
    }))
    .on('error', function (err) {
      console.error('WEBPACK ERROR', err);
      this.emit('end'); // Don't stop the rest of the task
    })
    .pipe(uglify().on("error", notify.onError()))
    .pipe(dest('./dist/js'))
}

const htmlMinify = () => {
  return src('dist/index.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(dest('dist'));
}

exports.build = series(clean, parallel(htmlInclude, scriptsBuild, fonts, resources, imgToDist, svgSprites), fontsStyle, stylesBuild, htmlMinify, imageMin);

const deploy = () => {
  let conn = ftp.create({
    host: '136.243.147.150',
    user: 'rokun132',
    password: 'dYgT91Dkht',
    parallel: 10,
    log: gutil.log
  });

  let globs = [
    'dist/**',
  ];

  return src(globs, {
    base: './dist',
    buffer: false
  })
    .pipe(conn.newer('/www/rokunets.ru/shopInet')) // only upload newer files
    .pipe(conn.dest('/www/rokunets.ru/shopInet'));
}

exports.deploy = deploy;
const gulp = require("gulp");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const sourcemaps = require("gulp-sourcemaps");
const bytediff = require("gulp-bytediff");
const browserSync = require("browser-sync").create();
const rename = require("gulp-rename");
const filter = require("gulp-filter");
const flatten = require("gulp-flatten");
const sizereport = require("gulp-sizereport");
const postcssImport = require("postcss-import");
const postcssInlineSvg = require("postcss-inline-svg");
const postcssSimpleVars = require("postcss-simple-vars");
const postcssNested = require("postcss-nested");
const postcssMixins = require("postcss-mixins");
const postcssCombineMediaQuery = require('postcss-combine-media-query');

const paths = {
  srcDir: "src/**/*",
  docsDir: "*",
  styles: {
    src: "src/builds/*.css",
    dest: "dist"
  }
};

function build() {
  return gulp
    .src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(postcss([postcssImport(), postcssInlineSvg(), postcssMixins(), postcssSimpleVars(), postcssNested(), postcssCombineMediaQuery()]))
    .pipe(
      postcss([
        autoprefixer({
          env: "legacy"
        })
      ])
    )
    .pipe(sourcemaps.write("."))
    .pipe(flatten())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(filter("**/*.css"))
    .pipe(bytediff.start())
    .pipe(
      postcss([
        cssnano({
          preset: [
            "default",
            {
              svgo: {
                floatPrecision: 0
              }
            }
          ]
        })
      ])
    )
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(
      sizereport({
        gzip: true,
        total: false
      })
    )
    .pipe(browserSync.stream());
}

function copy() {
  return gulp
    .src('./dist/bonsai.css')
    .pipe(gulp.dest('./../bedrock-docs/themes/bedrock/assets/'));
}

function watch() {
  build();
  copy();

  browserSync.init({
    server: {
      baseDir: "./"
    },
    startPath: "index.html"
  });

  gulp.watch(paths.srcDir, build);
  gulp.watch(paths.srcDir, copy);
  gulp.watch([paths.srcDir, paths.docsDir], browserSync.reload);
}

module.exports.build = build;
module.exports.watch = watch;

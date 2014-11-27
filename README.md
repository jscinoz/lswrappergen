# lswrappergen

This project consists of a common Handlebars template & stylesheet, and a
gulpfile used both to generate the scaffolding for new branded SILK wrappers
(terminology used by Localist to refer to a minimalist page chrome into which
they inject their own content), and to assemble the assorted static resources
into their deployable forms.

## Tasks
* generate-brand-scaffold:$BRAND - Generate scaffolding for a new brand
* build - Build all brands
* build:$BRAND - Build a specific brand
* watch - Watch source files for all brands & rebuild upon change
* watch:$BRAND - Watch source files for a specific brand & rebuild upon change
* css:$BRAND - Generate output CSS (via Myth) for a specific brand
* js:$BRAND - Generate output JS (via UglifyJS) for a specific brand
* html:$BRAND - Merge data for given brand into template (via Assemble)
* images:$BRAND - Generate output images (via imagemin) for a specific brand
* fonts:$BRAND - Copy fonts into build directory for a specific brand
* watch-{js,css,html,images,fonts}:$BRAND - Watch tasks corresponding to the five previous tasks

## Creating a new branded wrapper
1. Generate the brand scaffolding with 'gulp generate-brand-scaffold:$BRAND'
2. Set the URLs and other data as appropriate in brands/$BRAND/data.json
3. Place your logo image as brands/$BRAND/img/logo.png
4. Place assorted favicon & app icons in brands/$BRAND/img/. See index.hbs for expected filenames & sizes (realfavicongenerator.net is a useful tool to generate these at the assorted sizes, from a large source image.)
5. Set brand colours as appropriate in brands/$BRAND/css/style.css
6. Add any other brand-specific styling in style.css
7. Build it (gulp build:$BRAND)
8. Host it somewhere
9. Configure your Localist instance's "SILK Wrapper URL" property to point at wherever you hosted the generated files.

## Tools used
* nconf for configuration file parsing
* gulp-concat & UglifyJS for script processing
* gulp-sourcemaps (only in non-production mode) to generate JS sourcemaps
* gulp-concat & Myth for stylesheet processing
* Assemble for merging data into templates
* gulp-imagemin for image processing
* gulp-conflict to avoid overwriting existing brands when generating new
  scaffolds

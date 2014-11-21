# lswrappergen

This project consists of a common Handlebars template & stylesheet, and a
gulpfile used both to generate the scaffolding for new branded SILK wrappers
(terminology used by Localist to refer to a minimalist page chrome into which
they inject their own content), and to assemble the assorted static resources
into their deployable forms.

## Tasks
* generate-brand-scaffold:BRAND - Generate scaffolding for a new brand
* build - Build all brands
* build:BRAND - Build a specific brand
* watch - Watch source files for all brands & rebuild upon change
* watch:BRAND - Watch source files for a specific brand & rebuild upon change
* css:BRAND - Generate output CSS (via Myth) for a specific brand
* js:BRAND - Generate output JS (via UglifyJS) for a specific brand
* html:BRAND - Merge data for given brand into template (via Assemble)
* images:BRAND - Generate output images (via imagemin) for a specific brand
* fonts:BRAND - Copy fonts into build directory for a specific brand
* watch-{js,css,html,images,fonts}:BRAND - Watch tasks corresponding to the five previous tasks

## Tools used
* nconf for configuration file parsing
* gulp-concat & UglifyJS for script processing
* gulp-sourcemaps (only in non-production mode) to generate JS sourcemaps
* gulp-concat & Myth for stylesheet processing
* Assemble for merging data into templates
* gulp-imagemin for image processing
* gulp-conflict to avoid overwriting existing brands when generating new
  scaffolds

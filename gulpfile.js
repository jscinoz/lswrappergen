"use strict";

var gulp = require("gulp"),
    nconf = require("nconf"),
    concat = require("gulp-concat"),
    assemble = require("gulp-assemble"),
    myth = require("gulp-myth"),
    uglify = require("gulp-uglify"),
    conflict = require("gulp-conflict"),
    sourcemaps = require("gulp-sourcemaps"),
    imagemin = require("gulp-imagemin"),
    pngcrush = require("imagemin-pngcrush");

// Load config (brand list)
nconf.file("config.json");

// Tasks to be run for each brand
var tasks = {
    css: {
        getInputGlobs: function(brand) {
            return [
                "common/css/*.css",
                ["brands", brand, "css/*.css"].join("/")
            ];
        },
        getDestPath: function(brand) {
            return ["build", brand, "css"].join("/");
        },
        taskFn: function(brand) {
            // TODO: Add uncss and cssmin
            return gulp.src(this.getInputGlobs(brand))
                .pipe(concat("style.css"))
                .pipe(myth())
                .pipe(gulp.dest(this.getDestPath(brand)))

        }
    },
    js: {
        getInputGlobs: function(brand) {
            return "common/js/*.js";
        },
        getDestPath: function(brand) {
            return ["build", brand, "js"].join("/");
        },
        taskFn: function(brand) {
            var stream = gulp.src(this.getInputGlobs(brand));


            if (!nconf.get("production")) {
                stream = stream.pipe(sourcemaps.init());
            }

            stream = stream.pipe(concat("main.js"))
                           .pipe(uglify());

            if (!nconf.get("production")) {
                stream = stream.pipe(sourcemaps.write());
            }

            return stream.pipe(gulp.dest(this.getDestPath(brand)));
        }
    },
    html: {
        // globComponent is an optional parameter to return a subset of globs
        getInputGlobs: function(brand, globComponent) {
            var globs = {
                    template: [
                        "common/templates/*.hbs"
                    ],
                    data: [
                        ["brands", brand, "data.json"].join("/")
                    ]
                },
                key, result;

            if (globComponent && (result = globs[globComponent])) {
                return result;
            } else {
                for (key in globs) if (globs.hasOwnProperty(key)) {
                    if (!result) result = [];

                    result = result.concat(globs[key]);
                }

                return result;
            }
        },
        getDestPath: function(brand) {
            return ["build", brand].join("/");
        },
        taskFn: function(brand) {
            var options = {
                data: this.getInputGlobs(brand, "data")
            };

            return gulp.src(this.getInputGlobs(brand, "template"))
                .pipe(assemble(options))
                .pipe(gulp.dest(this.getDestPath(brand)));
        }
    },
    images: {
        getInputGlobs: function(brand) {
            return [
                "common/img/*",
                [ "brands", brand, "img/*" ].join("/")
            ]
        },
        getDestPath: function(brand) {
            return ["build", brand, "img"].join("/");
        },
        taskFn: function(brand) {
            return gulp.src(this.getInputGlobs(brand))
                .pipe(imagemin({
                    progressive: true
                    // imagemin-pngcrush is currently broken, try again later
                    // with a version GREATER than 2.0.0
                    /*
                    use: [
                        pngcrush({ reduce: true })
                    ]
                    */
                }))
                .pipe(gulp.dest(this.getDestPath(brand)));
        }
    },
    fonts: {
        getInputGlobs: function(brand) {
            return "common/fonts/*";
        },
        getDestPath: function(brand) {
            return ["build", brand, "fonts"].join("/");
        },
        taskFn: function(brand) {
            return gulp.src(this.getInputGlobs(brand))
                .pipe(gulp.dest(this.getDestPath(brand)));
        }
    }
}

function makeTask(task, brand) {
    var taskName = [task, brand].join(":"),
        taskObj = tasks[task];

    gulp.task(taskName, taskObj.taskFn.bind(taskObj, brand));

    return taskName;
}

function makeWatch(task, brand) {
    var taskName = [task, brand].join(":"),
        watchName = ["watch", taskName].join("-"),
        taskObj = tasks[task];

    gulp.task(watchName, function(brand, taskName) {
        gulp.watch(this.getInputGlobs(brand), [taskName]);
    }.bind(taskObj, brand, taskName));

    return watchName;
}

function makeBrandTasks(brand, taskBuilder) {
    var brandTasks = [];

    for (var task in tasks) if (tasks.hasOwnProperty(task)) {
        brandTasks.push(taskBuilder(task, brand));
    }

    return brandTasks;
}

function createTasks(prefix, taskBuilder) {
    var brands = nconf.get("brands"),
        brandTasks = [],
        taskName, brand;

    for (var i = 0, ii = brands.length; i < ii; ++i) {
        brand = brands[i];
        taskName = [prefix, brand].join(":");

        gulp.task(taskName, makeBrandTasks(brand, taskBuilder));

        brandTasks.push(taskName);
    }

    return brandTasks;
}

function generateBrandScaffold(brand) {
    var destPath = ["brands", brand].join("/");

    return gulp.src("scaffold/**")
        .pipe(conflict(destPath))
        .pipe(gulp.dest(destPath));
}

function createGenerationTasks() {
    var taskRE = /generate-brand-scaffold:(.+)/,
        brandName, matches, taskName,
        i, ii;

    for (i = 2, ii = process.argv.length; i < ii; ++i) {
        if ((taskName = process.argv[i]) && (matches = taskName.match(taskRE))) {
            brandName = matches[1];

            gulp.task(taskName, generateBrandScaffold.bind(this, brandName));
        }
    }
}

createGenerationTasks();

gulp.task("build", createTasks("build", makeTask));
gulp.task("watch", createTasks("watch", makeWatch));
gulp.task("default", ["build", "watch"]);

"use strict";

var gulp = require("gulp"),
    nconf = require("nconf"),
    concat = require("gulp-concat"),
    assemble = require("gulp-assemble"),
    myth = require("gulp-myth"),
    imagemin = require("gulp-imagemin"),
    pngcrush = require("imagemin-pngcrush");

// Load config (brand list)
nconf.file("config.json");

// Tasks to be run for each brand
var tasks = {
    myth: {
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
    assemble: {
        // globComponnent is an optional parameter to return a subset of globs
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
    imagemin: {
        getInputGlobs: function(brand) {
            return ["brands", brand, "img/*"].join("/")
        },
        getDestPath: function(brand) {
            return ["build", brand, "img"].join("/");
        },
        taskFn: function(brand) {
            return gulp.src(this.getInputGlobs(brand))
                // XXX: Re-enable later
                /*.pipe(imagemin({
                    progressive: true,
                    use: [ pngcrush() ] 
                }))*/
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
    var taskName = [task, brand].join("-"),
        taskObj = tasks[task];
    
    gulp.task(taskName, taskObj.taskFn.bind(taskObj, brand));

    return taskName;
}

function makeWatch(task, brand) {
    var taskName = [task, brand].join("-"),
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
        taskName = [prefix, brand].join("-");

        gulp.task(taskName, makeBrandTasks(brand, taskBuilder));

        brandTasks.push(taskName);
    }

    return brandTasks;
}

gulp.task("build", createTasks("build", makeTask));
gulp.task("watch", createTasks("watch", makeWatch));

gulp.task("default", ["build", "watch"]);

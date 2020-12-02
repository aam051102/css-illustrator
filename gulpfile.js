const gulp = require("gulp");
const minify = require("gulp-minify");
const connect = require("gulp-connect");
const cleanCSS = require("gulp-clean-css");
const htmlmin = require("gulp-htmlmin");

const js = (next) => {
    gulp.src("./src/**/*.js")
        .pipe(
            minify({
                ext: {
                    min: ".js",
                },
                noSource: true,
            }).on("error", (err) => console.error(err))
        )
        .pipe(gulp.dest("./dist"))
        .pipe(connect.reload());

    next();
};

const css = (next) => {
    gulp.src("./src/**/*.css")
        .pipe(cleanCSS())
        .pipe(gulp.dest("./dist"))
        .pipe(connect.reload());

    next();
};

const html = (next) => {
    gulp.src("./src/**/*.html")
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(gulp.dest("./dist"))
        .pipe(connect.reload());

    next();
};

function watchHtml() {
    gulp.watch("./src/**/*.html", { ignoreInitial: false }, html);
}

function watchCss() {
    gulp.watch("./src/**/*.css", { ignoreInitial: false }, css);
}

function watchJs() {
    gulp.watch("./src/**/*.js", { ignoreInitial: false }, js);
}

gulp.task("dev", function (next) {
    watchHtml();
    watchCss();
    watchJs();

    connect.server({
        livereload: true,
        root: "dist",
    });

    next();
});

gulp.task("build", function (next) {
    js(next);
    css(next);
    html(next);

    next();
});

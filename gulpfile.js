const gulp = require('gulp');
const rename = require('gulp-rename');
const connect = require('gulp-connect');

const folders = ['css', 'icon-fonts', 'img', 'img/icon', 'js', 'skills'];

gulp.task('copy-all', function () {
    for (var key in folders) {
        gulp.src('www/' + folders[key] + '/*.*')
            .pipe(gulp.dest('dist/' + folders[key]))
            .pipe(connect.reload());
    }
    gulp.src('www/*.*')
        .pipe(gulp.dest('dist/'))
        .pipe(connect.reload());

});

gulp.task('run-server-www', function () {
    connect.server({
        root: 'dist',
        port:3030,
        livereload: true
    })
});

gulp.task('watch', function () {
    for (var key in folders) {
        gulp.watch(['www/' + folders[key] + '/*.*'], ['copy-all']);
    }
    gulp.watch(['www/*.*'], ['copy-all']);
});

gulp.task('local-conf', () => {
    gulp.src("conf-dev.js")
        .pipe(rename('config.js'))
        .pipe(gulp.dest('dist/js'))
});

gulp.task('build-loc', ['local-conf', 'copy-all']);
gulp.task('run-loc', ['build-loc', 'run-server-www', 'watch']);
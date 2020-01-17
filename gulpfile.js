const gulp = require('gulp');
const rename = require('gulp-rename');
const connect = require('gulp-connect');

const folders = [
    'css', 'icon-fonts', 'img', 'img/icon', 'js', 'skills',
    'beerme', 'thoughts', 'thoughts/css', 'thoughts/js', 'thoughts/js/bootstrap', 'thoughts/js/jquery', 'thoughts/js/plugins', 'thoughts/fonts', 'thoughts/img/bg-img', 'thoughts/img/core-img'
];

gulp.task('copy-all', function (done) {
    for (var key in folders)
        gulp.src('www/' + folders[key] + '/*.*').pipe(gulp.dest('dist/' + folders[key])).pipe(connect.reload());
    gulp.src('www/*.*').pipe(gulp.dest('dist/')).pipe(connect.reload());
    done();
});

gulp.task('run-server-www', function () {
    connect.server({
        root: 'dist',
        port: 3030,
        livereload: true
    })
});

gulp.task('watch', function () {
    for (var key in folders) gulp.watch(['www/' + folders[key] + '/*.*'], ['copy-all']);
    gulp.watch(['www/*.*'], ['copy-all']);
});

gulp.task('local-conf', (done) => {
    gulp.src("conf-dev.js")
        .pipe(rename('config.js'))
        .pipe(gulp.dest('dist/js'))
    done();
});

gulp.task('build-loc', gulp.series(['local-conf', 'copy-all']), () => {

});
gulp.task('run-loc', gulp.series(['build-loc', 'run-server-www', 'watch']), () => {
});

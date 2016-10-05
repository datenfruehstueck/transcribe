var gulp = require('gulp');
var merge = require('merge-stream');
var plugins = require('gulp-load-plugins')({
	pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
	replaceString: /\bgulp[\-.]/
});

gulp.task('js', function() {
	gulp.src([
            'bower_components/jquery/dist/jquery.js', 
            'bower_components/bootstrap/dist/js/bootstrap.js', 
            'bower_components/moment/moment.js', 
            'bower_components/crypto-js/crypto-js.js', 
            'bower_components/blueimp-file-upload/js/vendor/jquery.ui.widget.js', 
            'bower_components/blueimp-file-upload/js/jquery.iframe-transport.js', 
            'bower_components/blueimp-file-upload/js/jquery.fileupload.js', 
            'bower_components/wavesurfer.js/dist/wavesurfer.js',
            'js/*'
        ])
		.pipe(plugins.filter('**/*.js'))
		.pipe(plugins.concat('app.js'))
		.pipe(plugins.uglify())
		.pipe(gulp.dest('dist'));
});


gulp.task('css', function() {
	var oStyleLess = gulp.src([
            'bower_components/bootstrap/less/bootstrap.less',
            'css/*'
        ])
		.pipe(plugins.filter('**/*.less'))
        .pipe(plugins.less())
        .pipe(plugins.concat('main-less.css'));
    var oStyleCss = gulp.src([
            'bower_components/blueimp-file-upload/css/jquery.fileupload.css'
        ])
        .pipe(plugins.concat('main-css.css'));
    
    merge(oStyleLess, oStyleCss)
		.pipe(plugins.concat('main.css'))
		.pipe(plugins.uglifycss())
		.pipe(gulp.dest('dist'));
});

gulp.task('default', ['js', 'css']);





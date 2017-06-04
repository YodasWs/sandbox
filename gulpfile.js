'use strict';

const gulp = require('gulp');

const plugins = {
	prefixCSS: require('gulp-autoprefixer'),
	sourcemaps: require('gulp-sourcemaps'),
	rmLines: require('gulp-delete-lines'),
	compileSass: require('gulp-sass'),
	addHeader: require('gulp-header'),
	compileJS: require('gulp-babel'),
	concat: require('gulp-concat'),
	lintES: require('gulp-eslint'),
	git: require('gulp-git'),
	ssi: require('gulp-ssi'),
}

const options = {
	compileJS:{
		comments:false,
		plugins: [
			'transform-exponentiation-operator',
			'transform-remove-console'
		],
		presets: [
			'react',
			'es2015'
		]
	},
	compileSass:{
		outputStyle: 'compressed'
	},
	lintES:{
		env: {
			browser: true,
			es6: true
		},
		rules: {
			strict: [
				'error',
				'global'
			]
		}
	},
	prefixCSS:{
		// more options at https://github.com/postcss/autoprefixer#options
		browsers: [
			// browser strings detailed at https://github.com/ai/browserslist#queries
			'last 2 Firefox versions',
			'last 2 Chrome versions',
			'Safari >= 10',
			'ie_mob >= 11',
			'ie >= 11'
		],
		cascade: false
	},
	dest: 'docs/',
	addHeader:{
		css:(function(){
			// properties found at https://github.com/gulpjs/vinyl
			return '/* <%= file.relative %> */\n'
		})(),
		js:(function(){
			return ''
		})()
	},
	rmLines:{
		filters:[
			'^\s*$',
		]
	},
	concat: {
		css: {
			path: 'min.css'
		},
		js: {
			path: 'min.js'
		}
	},
	ssi:{
		root: 'src'
	},
	git:{
	}
}

function runTasks ( stream, tasks, fileType='static' ) {
	stream = stream.pipe(plugins.sourcemaps.init())
	if (tasks.length) for (let i=0, k=tasks.length; i<k; i++) {
		let option = options[tasks[i]] || {}
		if (option[fileType]) option = option[fileType]
		stream = stream.pipe(plugins[tasks[i]](option))
	}
	if (tasks.indexOf('lintES') != -1) {
		stream = stream.pipe(plugins.lintES.format())
	}
	return stream.pipe(plugins.sourcemaps.write())
		.pipe(gulp.dest(options.dest))
}

;[
	{
		name: 'compile:sass',
		src: [
			'src/main.{sa,sc,c}ss',
			'src/**/*.{sa,sc,c}ss',
			'!**/*.min.css',
			'!**/min.css'
		],
		tasks: [
			'compileSass',
			'prefixCSS',
			'addHeader',
			'concat',
			'rmLines',
		],
		fileType: 'css'
	},
	{
		name: 'compile:js',
		src: [
			'src/**/*.js',
			'!**/*.min.js',
			'!**/min.js'
		],
		tasks: [
			'lintES',
			'compileJS',
			'addHeader',
			'concat',
			'rmLines',
		],
		fileType: 'js'
	},
	{
		name: 'compile:html',
		src: [
			'./src/**/*.html',
			'!**/components/**/*.html'
		],
		tasks: [
			'ssi',
		],
		fileType: 'html'
	},
	{
		name: 'transfer-files',
		src: [
			'./src/**/*.jp{,e}g',
			'./src/**/*.gif',
			'./src/**/*.png',
			'./src/**/*.ttf'
		],
		tasks: []
	}
].forEach((task) => {
	gulp.task(task.name, () => {
		return runTasks(gulp.src(task.src), task.tasks, task.fileType)
	})
})

gulp.task('compile', gulp.parallel('compile:html', 'compile:js', 'compile:sass', 'transfer-files'))

//gulp.task('watch', () => {
	//gulp.watch('./src/**/*.{sa,sc,c}ss', gulp.series('compile:sass'))
	//gulp.watch('./src/**/*.js', gulp.series('compile:js'))
//})

gulp.task('default', gulp.series(
	'compile'
//	'watch'
))

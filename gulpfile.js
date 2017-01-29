'use strict';

const gulp = require('gulp');
const filterUpdatedFiles = require('gulp-changed');
const prefixCSS = require('gulp-autoprefixer');
const rmLines = require('gulp-delete-lines');
const compileSass = require('gulp-sass');
const minifyJS = require('gulp-babel');
const concat = require('gulp-concat');
const header = require('gulp-header');
const ignore = require('gulp-ignore');
const string = require('gulp-change');
const mv = require('gulp-rename');
const git = require('gulp-git');
const ssi = require('gulp-ssi');

const options = {
	filterUpdatedFiles:{
		cwd: __dirname
	},
	ignore:{
		html:'**/components/**/*.html',
		css:'{*.min.css,min.css}',
		js:'{*.min.js}'
	},
	minifyJS:{
		comments:false,
		presets: [
			'babili'
		],
		plugins: [
			'transform-remove-console'
		]
	},
	compileSass:{
		outputStyle: 'compressed'
	},
	prefixCSS:{
		// more options at https://github.com/postcss/autoprefixer#options
		browsers: [
			// browser strings detailed at https://github.com/ai/browserslist#queries
			'last 2 versions',
			'not ie_mob < 11',
			'not ie < 11',
			'Safari >= 8'
		],
		cascade: false
	},
	dest:{
		// Save in build directory
		build:'build/',
		// Save in dist(rubutable) directory
		dist:'dist/'
	},
	header:{
		css:(function(){
			let str = "/**\n"
			// properties found at https://github.com/gulpjs/vinyl
			str += ` * <%= file.relative %>\n`
			str += " */\n"
			return str
		})(),
		js:(function(){
			return ''
		})()
	},
	git:{
	}
}

gulp.task('sass', () => {
	// Compile and Minify CSS Files
	return gulp.src('src/**/*.{,s}css')
		// Compile only updated files
		.pipe(filterUpdatedFiles(options.dest.build), options.filterUpdatedFiles)
		// Compile Sass into CSS
		.pipe(compileSass(options.compileSass))
		// Save in build directory
		.pipe(gulp.dest(options.dest.build))
});

gulp.task('mergeCSS', () => {
	return gulp.src('build/**/*.css')
		// Ignore minified files
		.pipe(ignore.exclude(options.ignore.css))
		// Add File Headers
		.pipe(header(options.header.css))
		// Autoprefix CSS for Backwards Compatibility
		.pipe(prefixCSS(options.prefixCSS))
		// Combine into one File
		.pipe(concat('min.css'))
		// Save in dist(rubutable) directory
		.pipe(gulp.dest(options.dest.dist))
});

gulp.task('css', gulp.series('sass', 'mergeCSS'));

gulp.task('js', () => {
	// Minify JavaScript Files
	return gulp.src('src/**/*.js')
		// Ignore minified files
		.pipe(ignore.exclude(options.ignore.js))
		// Minify only updated files
		.pipe(filterUpdatedFiles(options.dest.dist), options.filterUpdatedFiles)
		// Minify!
		.pipe(minifyJS(options.minifyJS))
		// Add Project and License Header
		.pipe(header(options.header.js))
		// Save in dist(rubutable) directory
		.pipe(gulp.dest(options.dest.dist))
});

gulp.task('html', () => {
	return gulp.src('src/**/*.html')
		// Ignore include files
		.pipe(ignore.exclude(options.ignore.html))
		// Include include files
		.pipe(ssi({root:'src'}))
		// Save in dist(rubutable) directory
		.pipe(gulp.dest(options.dest.dist))
});

// TODO: Need a watch task

gulp.task('default', gulp.parallel('html', 'js', 'css'));

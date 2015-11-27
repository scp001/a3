module.exports = function(grunt) {
    grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),

	uglify: {
	    options: {
		banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
	    },
	    build: {
		src: [
			'public/js/utils.js',
		    'public/js/models/review.js',
		    'public/js/models/movie.js',
		    'public/js/models/user.js',

		    'public/js/collections/users.js',
		    'public/js/collections/movies.js',
		    'public/js/collections/reviews.js',

		    'public/js/views/about.js',
		    'public/js/views/header.js',
			'public/js/views/signin.js',
		    'public/js/views/signup.js',
		    'public/js/views/home.js',
		    'public/js/views/movie.js',
		    'public/js/views/movieform.js',
		    'public/js/views/movieimg.js',
		    'public/js/views/movies.js',
		    'public/js/views/reviewer.js',
			"public/js/views/reviewthumbs.js",
		    'public/js/views/reviewsview.js',
			'public/js/views/details.js',

		    'public/js/main.js',
		],
		dest: 'public/js/<%= pkg.name %>-min.js'
	    },
	},

	qunit: {
	    all: {
		options: {
		    urls: ['https://mathlab.utsc.utoronto.ca:<%= pkg.port %>/test/test.html']
		}
	    }
	},

	jshint: {
	    options: {
		curly: true,  // require curly braces around all blocks
		eqeqeq: true,  // require use of exact equality comparison
		nonew: true,   // prohibit use of Constructor for side effects
		undef: true,  // prohibit use of explicitly undeclared var's
		unused: true,  // warn on variables that are defined but not used
		// want browser false for server-side code, true for client-side
		browser: false,  // expose globals defined by browsers
		devel: true,  // expose globals used for debugging, s.a. console
		globals: {
		    jQuery: true,
		    _: false,
		    $: false,
		    Backbone: true
		},
		ignores: ['public/js/lib/**/*.js'],
		reporter: require('jshint-html-reporter'),
		reporterOutput: 'public/jshint_report.html'
	    },
	    files: {
		src: ['public/js/**/*.js']
	    }
	}

    });

    // Load plugins for , "uglify", "qunit", "jshint"
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task(s)
    grunt.registerTask('default', ['jshint', 'uglify', 'qunit']);

};

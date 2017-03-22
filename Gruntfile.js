

module.exports = function(grunt){
	
	
	
	grunt.initConfig({
		
		
		pkg:grunt.file.readJSON('package.json'),
		
		uglify:{
			options:{
				stripBanners:true,
				banner:'/*!<%=pkg.name%>-<%=pkg.version%>.js <%= grunt.template.today("yyyy-mm-dd")%>*/\n'
			},
			build:{
				src:'scripts/angular/*.js',
				dest:'build/<%=pkg.name%>-<%=pkg.version%>.js.min.js'
			}	
		},
		jshint:{
			build:['Gruntfile.js','views/*.html',],
			options:{
				jshintrc:'.jshintrc.json'
			}
		},
		watch:{
			files:['Gruntfile.js','styles/*.css','*.html'],
			tasks:['jshint','uglify'],
			options:{livereload: true}
		}	
		
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');

	
	grunt.registerTask('default',['watch','jshint','uglify']);
	
};
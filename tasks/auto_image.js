/*
 * grunt-auto-image
 * https://github.com/ericsims/grunt-auto-image
 *
 * Copyright (c) 2015 Eric Sims
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('auto_image', 'Automatically insert images from folder into Jade.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      punctuation: '.',
      separator: ', '
    });

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      
      
      /* This is the old Template example
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      }).join(grunt.util.normalizelf(options.separator));
      */
      
      // Handle options.
      src += options.punctuation;
      
      getKeyedLine(src, "<!--", "-->").forEach(function (val) {
        console.log(val.files);
        console.log(val.height);
      });

      // Write the destination file.
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });
  
  // return a segment of a file as a JSON object between startKey and endKey
  function getKeyedLine(val, startKey, endKey) {
    var lines = [], i = -1;
    while (true) {
        var start = val.indexOf(startKey, i + 1);
        if(start == -1) break;
        var end = val.indexOf(endKey, start + 1);
        if(end == -1) break;
        i = end;
        var line = val.substring(start + startKey.length, end - 1).trim();
        try {
          var obj = JSON.parse(line);
          if (obj && typeof obj === "object" && obj !== null) {
            lines.push(obj);
          } else throw SyntaxError;
        } catch (e) {
          grunt.log.warn('invalid JSON: "' + line + '"');
        }

    }
    return lines;
  }
  
};

/*
 * grunt-auto-image
 * https://github.com/ericsims/grunt-auto-image
 *
 * Copyright (c) 2015 Eric Sims
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');

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
      
      
      // This is the old Template example
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
      });
      
      // Handle options.
      src += options.punctuation;
      
      getKeyedLine(src, '<!--', '-->', function (line, index) {
        console.log(line.indent);
        var dir = path.resolve('client/' + line.directory.toString());
        var images = [], imageTags = '\n';
        grunt.file.recurse(dir, function(abspath, rootdir, subdir, filename) {
          var img = {};
          img.path = path.relative('client', abspath);
          img.dir = path.relative('client', dir);
          img.filename = filename;
          if(!subdir && isImage(abspath)) {
            images.push(img);
          }
        });
        images.forEach(function (val, index) {
          imageTags += newLine('<a href="' + val.path + '" class="highslide" onclick="return hs.expand(this)">', ' ', line.indent);
          imageTags += newLine('<img src="' + val.dir + '\thumbnails\\' + removeExt(val.filename) + '_thumb.png" title="Click to enlarge" height="' + line.height.toString() + '" /></a>', ' ', line.indent);
        });
        src = src.insertAt(imageTags, index);
      });

      
      // Write the destination file.
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });
  
  var newLine = function(str, pref, multi) {
    if (multi && pref) {
      var prefix = '';
      for(var i = 0; i < multi; i++) {
        prefix += pref;
      }
      return prefix + str + '\n';
    }
    else {
      return str + '\n';
    }
  };
  
  // return a segment of a file as a JSON object between startKey and endKey
  var getKeyedLine = function(val, startKey, endKey, handleData) {
    var i = -1;
    while (true) {
        var start = val.indexOf(startKey, i + 1);
        if(start === -1) { break; }
        var end = val.indexOf(endKey, start + 1);
        if(end === -1) { break; }
        var indent = 0;
        while(start - indent > 0) {
          if(val.charAt(start) === '\n') {
            break;
          } else {
            indent++;
          }
        }
        i = end;
        var line = val.substring(start + startKey.length, end - 1).trim();
        try {
          var obj = JSON.parse(line);
          if (obj && typeof obj === "object" && obj !== null) {
            obj.indent = indent;
            handleData(obj, end + endKey.length);
          } else {
            throw SyntaxError;
          }
        } catch (e) {
          grunt.log.warn(e);
        }
    }
  };
  
  String.prototype.insertAt = function(string, index) { 
    return this.substr(0, index) + string + this.substr(index);
  };
  
  var isImage = function(path) {
    var splitz = path.split('.');
    var ext = splitz[splitz.length-1].toLowerCase();
    return (ext === 'jpg' || ext === 'png');
  };
  
  var removeExt = function(str) {
    return str.substring(0, str.lastIndexOf('.'));
  };
  
};

# jdigi

A simple experiment in javascript digital signal processing.  HTML5's Web Audio API is a wonderful opportunity for people interested in DSP to experiment in audio modulation and demodulation.  It's also a great way to provide radio digital mode codecs to users without the need to port code or install binaries.   This project in an experiment in doing just that.

### Building

This library is intended to run in browsers.  However, it is managed, tested and build by Node.js and Gulp.js.  So for the aspiring developer to perform a build of the code, Node must be installed, then Gulp.

Currently the commands are:
* To build:  <pre>gulp</pre>
* To test:  <pre>gulp test</pre>
* To clean up:  <pre>gulp clean</pre>

### Getting

For the average person who just wants to run the code, we will occasionally zip up a build and put a copy in the /builds folder.   Look there.

### Running

Note that for Web Audio to be able to listen to your audio inputs, the html that loads the Javascript must be loaded from a web server.  You can simply put the code on a webserver and run it.  There is also a server.js file that will allow you to run it if you have node and "http-connect".   Just type "npm install http connect" and then "node server".

Alternatively, you can start Chrome with a command-line option: <pre>--allow-file-access-from-files.</pre>

* On OSX, make an alias: <pre>alias chromew='open -a Google\ Chrome --args --allow-file-access-from-files'</pre>
* On Linux: <pre>alias chromew='/path/to/chrome --allow-file-access-from-files'</pre>
* On Windows, make a batch file.


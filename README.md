TS House Styles for Frontend Development
=========================================
This is our initial set of front end files for beginning a new site build. The intent is to provide a solid starting point that will then help to shape the final front end. This should save time and effort, but also provide a consistent approach to front end projects.

The suite uses the **Bootstrap 3.3.6** SASS core as a general base.


Uses [Gulp](https://github.com/gulpjs/gulp)
-------------------------------------------
The house styles rely on Gulp to automate watching/building front-end resources. Developers are encouraged to customise the Gulpfile to fit the needs of any particular project.


Installation
------------
All OSes:
- Requires [Node.js](https://nodejs.org/en/)

Windows:
- [Visual Studio 2015 Community](https://www.visualstudio.com/en-us/downloads/download-visual-studio-vs.aspx) - **needed ONLY for the bundled C++ compilers**, allowing certain Node packages to build/install correctly - most importantly, **BrowserSync**.

Install all of the project dependencies:
- Run `npm run setup`

This will:
- Install required Node packages both locally and globally on your system
- Install the Bower dependencies found in `bower.json`
- Run the default tasks found in the `gulpfile.js`
- Run a local Node server on `localhost:3000`

Note that the `node_packages` and `bower_components` folders are machine-specific, and are intentionally left untracked by Git. Installation

Notes on Bower
-------------
[Bower](_http://bower.io/) is used alongside Gulp to manage front-end library dependencies - jQuery, HTML5Shiv, etc. Gulp will handle moving/minifying these packages into their appropriate directories.

### BrowserSync

The main component of this Gulp setup is BrowserSync. This plugin provides the following advantages for development:
* Simultaneous page scrolling for all devices connected to the same link
* Clicking links or populating form fields on one device will duplicate this behaviour on all other linked devices
* A dashboard at `localhost:3001` where you can send commands to all connected devices, perform actions and do network throttle testing.


Gulp packages currently used (December 2015)
--------------------------------------------------------------------------------

Name              | Version     | Description
----------------- | ----------- | -----------------------------------------------------------------------------------------------
bower             | ^1.5.2      | Used to pull in third-party front-end JS and CSS libraries (jQuery, etc.)
browser-sync      | ^2.9.11     | Enables synchronised browser testing using DOM injection, with a built-in server setup
del               | ^1.2.0      | Deletes files, used to clean up 'dest' directories upon running gulp
gulp              | ^3.9.0      | Task runner core
gulp-autoprefixer | ^3.1.0      | Handles all browser-specific CSS prefixing. Hooks into [caniuse.com](http://caniuse.com/) as its source
gulp-bytediff     | ^0.2.1      | Logs before/after filesize diff to the console when files are minified/processed, etc.
gulp-cache        | ^0.2.10     | Enables caching of piped files to prevent tasks being run unnecessarily
gulp-concat       | ^2.6.0      | Concatenates file streams into one
gulp-filter       | ^3.0.1      | Allows glob-based filename filtering on node streams
gulp-if           | ^2.0.0      | Some simple if/else functionality for streams
gulp-ignore       | ^2.0.1      | Allows glob-based filename filtering on node streams
gulp-imagemin     | ^2.3.0      | Losslessly optimises images - handles gif, jpeg, png, and svg
gulp-jshint       | ^1.11.2     | Logs JSHint lint errors/warnings
gulp-load-plugins | ^1.0.0-rc.1 | Handles the `require()` functions for all devDependencies in `package.json`
gulp-minify-css   | ^1.2.0      | CSS minification
gulp-newer        | ^0.5.1      | Ensure that gulp tasks only run on file streams that are newer than their destination files
gulp-notify       | ^2.2.0      | Enables the use of native notifications to display when tasks are complete
gulp-plumber      | ^1.0.1      | Prevent pipe breaking caused by errors from gulp plugins
gulp-rename       | ^1.2.2      | Allows files to be renamed via JS
gulp-sass         | ^2.1.0      | Used to compile all our SASS/SCSS
gulp-sourcemaps   | ^1.6.0      | Writes sourcemaps of minified source files
gulp-uglify       | ^1.2.0      | Handles minification of our JS
gulp-util         | ^3.0.6      | Utility functions for gulp plugins
jshint-stylish    | ^2.0.1      | Stylish reporter for JSHint
main-bower-files  | ^2.9.0      | Handles automatic processing of components pulled in via Bower
merge-stream      | ^1.0.0      | Merges multiple streams into one, used in concatenation and accurate task ending reporting
minimist          | ^1.2.0      | Allows us to provide flags (e.g. --notify) to gulp, allowing certain tasks to run conditionally


Uses Bootstrap 3.x
------------------

In order to prevent code redundancy and reduce generated CSS filesize, BS3 components such as `buttons`, `navs`, `jumbotrons`, etc. should be disabled in `sass/bootstrap/_bootstrap-custom.scss` and copied into an app-specific clone under the same name if/when they need to be used.

This allows for full bootstrap customisation without the code duplication in the generated CSS.

Bootstrap **must** be included **after** the app-specific variables and mixins, to allow BS3's grid to be customised.


Customising the grid
------------------
Edit the app-specific Grid variables in `sass/imports/_variables.scss`.

These include:

- Default breakpoints
  - $screen-xs-min: 30em;  // 480px
  - $screen-sm-min: 48em;  // 768px
  - $screen-md-min: 62em;  // 992px
  - $screen-lg-min: 75em; // 1200px

- Default grid layout
  - $grid-columns:      12;
  - $grid-gutter-width: 30px; // 30px


General guidelines
------------------
- Style using the mobile-first media query methodology, as in BS3 (`min-width`, as opposed to `max-width`, etc.)
- Global variables such as colours are kept in variables.scss. Specific variables (such as for forms) should be placed at the top of the relevant SASS file.
- Browser specific declarations and mixins aren't necessary - write W3C-recommended CSS with impunity glorious disregard. **Autoprefixer** will handle the rest.
- Each individual SASS file should include the set of media queries used to define layout at the bottom of the document.

Our FE approach favours a generic element approach to page building, which means that where possible we try to build styles for all required variants of an element and then use them where needed, rather than writing page specific styles and grouping them together. This is why the SASS is divided by element type. For most builds there should be no need to add further SASS files, particularly page specific ones.

The styleguide should always be included in a build, ideally accessible only to admin users via the /styleguide URL. The styleguide included here is a skeleton - it contains examples of the elements available but requires fleshing out during a build. Developers are encouraged to sections to it. Specific items that must be completed are highlighted. The styleguide has several objectives:
- to provide visual examples of how elements should appear
- to provide samples of markup to aid backend developers
- to provide extended documentation on the front end. This can include anything you can think of that might be useful for anyone working on the project after you to know. For example, pitfalls/traps, anything unusual that was implemented, etc.

Some basic JavaScript has been included to support the basic styles provided, in main.js. Where bootstrap.js is already present in a project, much of main.js can be removed.


Further expansion
-----------------
It is expected that this set of front end files will be expanded and improved over time. If you have any suggestions or improvements, create a new branch (feature/name, or something similar - make sure it's logical!) and issue a pull request for review.


Things to avoid
---------------
We try to maintain the following as general FED standards:

- Use a new line for each style attribute
- Use a four space tab for indenting
- Order attributes generally as follows: display, position, size, borders, backgrounds, colours, fonts
- Don't use a class with a specific purpose to accomplish something that a second class would do better, e.g. don't apply colours to a specific grid element, add another class to it
- Don't use !important
- Don't use IDs for styling, only classes
- Don't use the * rule to apply a style to all elements
- Avoid styling base elements such as `<div>` and `<li>`

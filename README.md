TS House styles for front end development
=========================================

This is our initial set of front end files for beginning a new site build. The intent is to provide a basic starting point that will then help to shape the final front end. This should save time and effort but also provide a consistent approach to front end projects. Styles that control visual appearance such as backgrounds, shadows, etc. have deliberately been avoided.

Due to increasing use of bootstrap 2 for some projects this CSS uses bootstrap compatible class names for common elements like the grid and buttons. This CSS is therefore designed to replace any initial bootstrap CSS, rather than work alongside it.

LESS is divided into files for each element type or related group of element types. For example, form elements are in forms.less. Some more specific information:

- global variables such as colours and responsive breakpoints are kept in variables.less. Specific variables such as form variables should be placed at the top of the relevant LESS file, unless also required for responsive styles (see below).
- browser specific styles should go at the bottom of the relevant LESS file.
- grid.less contains a grid generator. Set the variables at the top of the file for the required page width, number of columns and column spacing.
- responsive styles should be kept in a element-responsive.less file, e.g. grid-responsive.less. These files are then compiled into a separate stylesheet, styles-responsive, which is included using a media query in the HEAD element and can also be specifically served to older browsers.
- page.less is intended to include html and body styles, along with any elements that are present on all pages, such as a page wrapping element or background class variants.

Our FE approach favours a generic element approach to page building, which means that where possible we try to build styles for all required variants of an element and then use them where needed, rather than writing page specific styles and grouping them together. This is why the LESS is divided by element type. For most builds there should be no need to add further LESS files, particularly page specific ones.

The styleguide should always be included in a build, ideally accessible only to admin users via the /styleguide URL. The styleguide included here is a skeleton - it contains examples of the elements available but requires fleshing out during a build. Feel free to add additional sections to it. Specific items that must be completed are highlighted. The styleguide has several objectives:
- to provide visual examples of how elements should appear
- to provide samples of markup to aid backend developers
- to provide extended documentation on the front end. This can include anything you can think of that might be useful for anyone working on the project after you to know. For example, pitfalls/traps, anything unusual that was implemented, etc.

Some basic JavaScript has been included to support the basic styles provided, in main.js. Where bootstrap.js is already present in a project, much of main.js can be removed.

Further expansion
-----------------

It is expected that this set of front end files will be expanded and improved over time. If you have any suggestions or improvements, create a new branch (feature/name) and issue a pull request for review.

General rules
-------------

This section will be folded into our FE coding standards eventually.

- Use a new line for each style attribute
- Use a four space tab for indenting
- Order attributes generally as follows: display, position, size, borders, backgrounds, colours, fonts
- Don't use a class with a specific purpose to accomplish something that a second class would do better, e.g. don't apply colours to a specific grid element, add another class to it

Please follow these rules.

- Don't use !important
- Don't use IDs for styling, only classes
- Don't use the * rule to apply a style to all elements, and avoid styling base elements such as DIV or LI  

Use of Gulp
------------  

There is a `gulpfile.js` within this repository to make development much quicker for the house styles. All you need to do is:  
* Install Node (http://nodejs.org) & Gulp (https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)  
* Run `npm run setup`  
This will install all the dependencies found in `package.json` (The `node_modules` folder that is generated when you run this command should be created on a case-by-case basis and not pushed to a repository), install the Bower dependencies found in `package.json` and run the local server through the `gulp` command. 
  
This will open up a tab in your browser, running a server at `localhost:3000` (unless you have set up a proxy server address - details on how to change this are in the `gulpfile.js` file).

Gulp features
-------------

Name | Version | Description
--- | --- | ---
**gulp** | ^3.9.0 | Task runner to automate various tasks
**browser-sync** | ^2.8.0 | Local server enabling instant DOM injection to all devices connected when a file is changed
**gulp-byetdiff | ^1.0.0 | Shows a the difference between file sizes before and after gulp tasks have run.
**gulp-concat** | ^2.6.0 | Concatenates multiple files into one
**gulp-cache** | ^0.2.10 | Enables caching of piped files to prevent tasks being run unnecessarily
**gulp-imagemin** | ^2.3.0 | Compresses images - packaged with gifsicle, jpegtran, optipng, and svgo
**gulp-jshint** | ^1.11.2 | Provides JS validation and hinting. Settings for this are in the `.jshintrc` file
**gulp-less** | ^3.0.3 | Converts LESS files in CSS
**gulp-load-plugins** | ^1.0.0-rc.1 | Handles the `require()` functions for all plugins in `package.json`
**gulp-minify-css** | ^1.2.0 | Minifies CSS files to reduce file sizes
**gulp-newer** | ^0.5.1 | Ensure that gulp tasks only run on files that have changed rather than all files.
**gulp-notify** | ^2.2.0 | Enables the use of native notifications to display when tasks are complete
**gulp-plumber** | ^1.0.1 | Prevent pipe breaking caused by errors from gulp plugins
**gulp-rename** | ^1.2.2 | Allows files to be renamed via JS
**gulp-uglify** | ^1.2.0 | Minifies JS files
**gulp-util** | ^3.0.6 | Utility functions for gulp plugins
**jshint-stylish** | ^2.0.1 | Stylish reporter for JSHint
**path** | ^0.11.14 | Copy of Node.JS path module
**del** | ^1.2.0 | Enables the deleting of files

### BrowserSync  
  
The main component of this Gulp setup is BrowserSync. This plugin provides the following advantages for development:  
* Simultaneous page scrolling for all devices connected to the same link  
* Clicking links or populating form fields on one device will duplicate this behaviour on all other linked devices  
* A dashboard at `localhost:3001` where you can send commands to all connected devices, perform actions and do network throttle testing.


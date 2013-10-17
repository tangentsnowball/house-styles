TS House styles for front end development
=========================================

This is our initial set of front end files for beginning a new site build. The intent is to provide a basic starting point that will then help to shape the final front end. This is intended to both save time and effort but also to provide a consistent approach to front end projects. Therefore styles that control visual appearance such as backgrounds, shadows, etc. have deliberately been avoided.

Due to increasing use of bootstrap 2 for some projects this CSS uses bootstrap compatible class names for common elements like the grid and buttons. This CSS is therefore designed to replace any initial bootstrap CSS, rather than work alongside it.

LESS is divided into files for each element type or related group of element types. For example, form elements are in forms.less. Some more specific information:

- global variables such as colours and responsive breakpoints are kept in variables.less. Specific variables such as form variables should be placed at the top of the relevant LESS file.
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
# Fifi Front End

## Installation

* Clone this repo

## Development

To start up the UI, open **www/index.html** in a web browser.

By default, it will try to connect to the Heroku installation of fifiback,
but if you append `#dev` to the URL, it will connect to your local fifiback.

Check the console.log, it will print the server the front end is using.

To see the topcoat style guide open:

    www/lib/topcoat-0.4.1/docs/styleguide/topcoat-mobile-light.html

## Directory layout

This web project has the following setup:

* www/ - the web assets for the project
    * index.html - the entry point into the app.
    * js/
        * app.js - the top-level config script used by index.html
        * app/ - the directory to store project-specific scripts.
        * lib/ - the directory to hold third party scripts.
* tools/ - the build tools to optimize the project.

To optimize, run:

    volo build

This will run the "build" command in the volofile that is in this directory.

That build command creates an optimized version of the project in a
**www-built** directory. The js/app.js file will be optimized to include
all of its dependencies.

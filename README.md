# .buk

.buk is a cube rolling puzzle game

## Requirements

You need Node.js 6.3.1 or newer to start developing.

To bootstrap your environment run `npm run bootstrap` in the root
directory of the project.
 
> This npm script will install all dependencies and type definitions

## Development

Run `npm run develop` to start the development server and navigate to
`http://localhost:3000` (as seen in the console output).

Any change you make in the `src/` directory will trigger the browser
to reload. The server is available externally to so you can access
the application on your phone easily.

*To set it up in VS code check 
[these](https://gist.github.com/caiwan/c23ee4b06e6c90748b2da58a9ea98e38) 
sample jsons.* Also please note that
`/// <reference path="../../typings/index.d.ts" />` line seems to be
mandatory before any includes to make it work with it *(But also YMMW)*.
Please don't remove them.

## Release build

Simply run `npm run build`. The result will be written in `dist/`

# Controls

## Keyboard

Shortcuts are case sensitive

-   Avatar
    - `w` or `up arrow` - Move forward
    - `s` or `down arrow` - Move back
    - `a` or `left arrow` - Move left
    - `d` or `right arrow` - Move right
-   Camera
    - `shift + a` - Rotate clockwise
    - `shift + d` - Rotate counterclockwise
    - `shift + w` - Zoom in
    - `shift + s` - Zoom out
    
## Touch

-   Avatar
    Swipe up, down, left or right to move.
-   Camera
    -   Swipe left or right in the bottom 5% of the screen to rotate
        the camera
    -   Pinch to zoom

# Babylon Boilerplate

A boilerplate for BabylonJS. Documentation coming soon!

## Installation

* Run: `yarn install`


## Development

* Run: `yarn start`


### Scene

The main class you'll need extend is the `AbstractScene` (or the `SceneInterface`) class, which can be found in `src/Framework/Scenes/Scene.ts`. The most important bits are:

#### start()

In this function you'll normally just set the `babylonScene`.

#### load()

This function will return a promise once the scene is ready and loaded. Here inside you start the preloader, load all your assets, hide the preloader and resolve the promise.

#### unload()

This function can be used to detach possible listeners you have, that are only related to that scene. It is also a promise and will be triggered before you start loading a new scene, if any previous scene is loaded.

#### update()

This function is triggered each render loop/tick. Right now it updates the controller.


## Build

* Run: `yarn build`

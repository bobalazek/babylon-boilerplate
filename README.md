# Babylon Boilerplate

A boilerplate for BabylonJS.

## Installation

* Run: `yarn install`

## Development

* Run: `yarn start`

## Build

* Run: `yarn build`

## Directory structure

* `src/`
    * `src/Game/` - All of your unique game logic goes in here.
    * `src/Game/index.ts` - The main file that boots up the game.
    * `src/Game/Resources/` - All of your static assets, such as 3D models, CSS, audio and more.
    * `src/Framework/` - All of your reusable game stuff goes in here. Think of it as a collection of classes, helpers, managers, ... that you'll be able to reuse in your next game.

## Concepts

### GameManager

That is our main object in the game. It handles the boot up of the game & contains the main, static variables (engine, canvas element, input manager, currently active level, ...). You can use it all across your codebase, as all the important variables are static.

#### GameManager - InputManager

Handles all the input stuff for the keyboard, mouse & gamepad(-s). The most important methods here are are `GameManager.inputManager.getAxes()` and `GameManager.inputManager.getActions()`. It will return back the axes values & action booleans, that you specified as your input bindings.

#### GameManager - InputManager - InputBindings

This is the class, that will supply your input manager with your bindings. View the `src/Framework/Input/Bindings/InputBindingsDefault` class as an example.

### Scene

All your scenes should go inside the `src/Game/Scenes/` directory. Your scene class needs to extend the `src/Framework/Scenes/Scene.ts`. Your scene should then include the following methods:

* `Scene::start()` - This will be executed once everything is ready and loaded.
* `Scene::load()` - Can/should be used when preloading assets/resources. Must always return a promise.
* `Scene::update()` - This method is ran on every tick, so you can use it for things like the PlayerController.

### Asset imports

Because we always want to get the newest assets, especially when they change, we can do that easily by just adding the following:

In your scene file, import the asset as following:

```javascript
import vehicleModelAsset from '../../Resources/assets/models/vehicle.glb'; // returns a URL string
```

And then, you can use it below to import it:

```javascript
return new Promise((resolve, reject) => {
  SceneLoader.LoadAssetContainer(
    '',
    vehicleModelAsset,
    this.babylonScene,
    (container: AssetContainer) => {
      // do something with it
    }
  );
});
```

Same goes for all the other file types mentioned in webpacks's [url-loader](https://github.com/bobalazek/babylon-boilerplate/blob/master/webpack.common.js#L68). Note: if you want to add new file types there, you must also add them inside the [declaration file](https://github.com/bobalazek/babylon-boilerplate/blob/master/src/declarations.d.ts).

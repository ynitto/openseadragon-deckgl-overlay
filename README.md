# OpenSeadragon deck.gl Overlay

An [OpenSeadragon](http://openseadragon.github.io) plugin that adds deck.gl overlay capability.

Compatible with OpenSeadragon 3.1.0 or greater.

## Documentation

To use, include the `openseadragon-deckgl-overlay.js` file after `openseadragon.js` on your web page.

To add deck.gl overlay capability to your OpenSeadragon Viewer, call `deckOverlay(options)` on it. The argument `options` is a same type of [Deck constructor options](https://deck.gl/docs/api-reference/core/deck#properties).

For example:

```javascript
var overlay = this.viewer.deckOverlay({
    layers: [new ScatterplotLayer({id: "scatterplot", ...})]
});
```

If you omit to set options, it will use the default options;

* `views`: [OrthographicView](https://deck.gl/docs/api-reference/core/orthographic-view) is used.
* `controller`: false is set.

This will return a new object with the following methods:

* `deck()`: Gives access to [Deck](https://deck.gl/docs/api-reference/core/deck), to add graphics.
* `resize()`: If your viewer changes size, you'll need to resize the overlay by calling this method.


See [online demo](https://ynitto.github.io/openseadragon-deckgl-overlay/demo.html) or demo.html for an example of it in use.


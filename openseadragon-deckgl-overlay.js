(function() {
  // ----------
  if (window.OpenSeadragon && window.deck) {
    const $ = window.OpenSeadragon;
    const d = window.deck;

    $.Viewer.prototype.deckGLOverlay = function(options) {
      if (this._deckOverlay) {
        return this._deckOverlay;
      }

      const factory = (parent) => {
        return new d.Deck(Object.assign({
          parent: parent,
          views: new d.OrthographicView(),
          controller: false
        }, options || {}));
      }

      this._deckOverlay = new Overlay(this, factory);
      return this._deckOverlay;
    };
  }

  // ----------
  const Overlay = function(viewer, deckFactory) {
    var self = this;
    this._viewer = viewer;

    this._containerWidth = 0;
    this._containerHeight = 0;

    this._canvasdiv = document.createElement('div');
    this._canvasdiv.style.position = 'absolute';
    this._canvasdiv.style.left = "0px";
    this._canvasdiv.style.top = "0px";
    this._canvasdiv.style.width = '100%';
    this._canvasdiv.style.height = '100%';
    this._viewer.canvas.appendChild(this._canvasdiv);

    this._deck = deckFactory(this._canvasdiv);

    this._viewer.addHandler('update-viewport', function () {
      self.resize();
      self.updateViewport();
    });

    this._viewer.addHandler('open', function () {
      self.resize();
      self.updateViewport();
    });
    window.addEventListener('resize', function () {
      self.resize();
      self.updateViewport();
    });
  };

  // ----------
  Overlay.prototype = {
    deck: function() {
      return this._deck;
    },
    resize: function() {
      if (this._containerWidth !== this._viewer.container.clientWidth) {
        this._containerWidth = this._viewer.container.clientWidth;
        this._canvasdiv.setAttribute('width', this._containerWidth);
      }

      if (this._containerHeight !== this._viewer.container.clientHeight) {
        this._containerHeight = this._viewer.container.clientHeight;
        this._canvasdiv.setAttribute('height', this._containerHeight);
      }
    },
    updateViewport: function() {
      const viewport = this._viewer.viewport;
      const lastFlag = viewport.silenceMultiImageWarnings || false;
      viewport.silenceMultiImageWarnings = true;

      const center = viewport.viewportToImageCoordinates(viewport.getCenter(true));
      const zoom = Math.log2(viewport.viewportToImageZoom(viewport.getZoom(true)));

      this._deck.setProps({
        initialViewState: {
          target: [center.x, center.y, 0],
          zoom: zoom
        }
      });

      viewport.silenceMultiImageWarnings = lastFlag;
    }
  };

  (function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    } else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
  })(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DeckGLOverlay = Overlay;
  });

})();
import { Viewer } from "openseadragon";
import { DeckGLOverlay } from "../../openseadragon-deckgl-overlay";
import { Deck, OrthographicView, Position, RGBAColor } from "@deck.gl/core";
import { PathLayer } from "@deck.gl/layers";
import { EditableGeoJsonLayer, DrawLineStringMode } from "nebula.gl";

class App {
  viewer: Viewer;
  overlay: any;
  geojson: any;

  constructor() {
    var tileSource = {
      Image: {
        xmlns: "http://schemas.microsoft.com/deepzoom/2008",
        Url: "http://openseadragon.github.io/example-images/highsmith/highsmith_files/",
        Format: "jpg",
        Overlap: "2",
        TileSize: "256",
        Size: {
          Height: "9221",
          Width: "7026"
        }
      }
    };

    this.viewer = new Viewer({
      id: "contentDiv",
      prefixUrl: "openseadragon/images/",
      showNavigationControl: false,
      tileSources: tileSource
    });

    this.overlay = new DeckGLOverlay(this.viewer, (parent) => new Deck({
      parent,
      views: [new OrthographicView({})],
      controller: false
    }));

    this.geojson = {
      type: "FeatureCollection",
      features: []
    };
  }

  run() {
    const d = this.overlay.deck();
    const data = new Array<{path: Position[], color: RGBAColor}>;
    for (let i = 0; i < 100000; i++) {
      let x = Math.random() * 7026;
      let y = Math.random() * 9221;

      const path = new Array<Position>;
      path.push([x, y]);

      const counts = (Math.random() * 5) || 0;
      for (let j = 0; j <= counts; j++) {
        x += Math.random() * 20 - 10;
        y += Math.random() * 20;
        path.push([x, y]);
      }

      data.push({
        path,
        color: [255 * Math.random(), 255 * Math.random(), 255 * Math.random()]
      });
    }

    const getLayers = () => {
      return [new PathLayer({
        data,
        getPath: d => d.path,
        getColor: d => d.color,
        widthMinPixels: 1
      }), new EditableGeoJsonLayer({
        id: 'geojson',
        data: this.geojson,
        mode: DrawLineStringMode,
        onEdit: ({ updatedData }) => {
          this.geojson = updatedData;
          d.setProps({ layers: getLayers() });
        }
      })];
    }

    d.setProps({
      layers: getLayers()
    });
  }
}

window.onload = () => {
  const app = new App();
  app.run();
};
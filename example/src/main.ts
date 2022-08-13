import { Viewer } from "openseadragon";
import { DeckGLOverlay } from "../../openseadragon-deckgl-overlay";
import { Deck, OrthographicView, Position } from "@deck.gl/core";
import { CompositeMode, DrawLineStringMode, ModifyMode, ViewMode } from "@nebula.gl/edit-modes";
import { EditableGeoJsonLayer } from "@nebula.gl/layers";

class App {
  viewer: Viewer;
  overlay: any;
  editable: boolean;
  editing: boolean;
  zoom: number;
  geojson: any;
  hoveredIndex: number;
  selectedIndex: number;

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
      tileSources: tileSource,
      gestureSettingsMouse: {
        clickToZoom: false,
        dblClickToZoom: false
      },
      gestureSettingsTouch: {
        clickToZoom: false,
        dblClickToZoom: false
      }
    });

    this.overlay = new DeckGLOverlay(this.viewer, (parent) => new Deck({
      parent,
      views: [new OrthographicView({})],
      controller: false,
      pickingRadius: 5,
      getCursor: ({isDragging}) => isDragging ? 'crosshair' : 'grab'
    }));

    this.editable = false;
    this.editing = false;
    this.zoom = 0;

    this.geojson = {
      type: "FeatureCollection",
      features: []
    };

    this.hoveredIndex = -1;
    this.selectedIndex = -1;
  }

  run() {
    const d = this.overlay.deck();
    for (let i = 0; i < 10000; i++) {
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

      this.geojson.features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: path
        },
        properties: {
          color: [255 * Math.random(), 255 * Math.random(), 255 * Math.random()]
        }
      });
    }

    this.viewer.addHandler("canvas-drag", (e) => {
      e.preventDefaultAction = this.editing;
    });
    this.viewer.addHandler("zoom", (e) => {
      this.zoom = this.viewer.viewport.viewportToImageZoom(e.zoom);
      d.setProps({
        layers: this.createLayers()
      });
    });

    this.update();
  }

  update() {
    const d = this.overlay.deck();
    const layers = this.createLayers();
    d.setProps({
      layers
    });
  }
  createLayers() {
    const indexes = new Array<number>();
    if (this.hoveredIndex >= 0) {
      indexes.push(this.hoveredIndex);
    }
    if (this.selectedIndex >= 0) {
      indexes.push(this.selectedIndex);
    }

    return [
      new (EditableGeoJsonLayer as any)({
        id: 'editor',
        data: this.geojson,
        mode: this.getMode(),
        selectedFeatureIndexes: indexes,
        lineWidthMinPixels: 3,
        lineWidthMaxPixels: 3,
        pickingLineWidthExtraPixels: 3,
        editHandlePointOutline: true,
        editHandlePointStrokeWidth: 1,
        editHandlePointRadiusMinPixels: 3,
        editHandlePointRadiusMaxPixels: 3,
        getEditHandlePointColor: [0,0,0,0],
        pickable: true,
        getLineColor: (feature, isSelected, mode) => feature.properties.color,
        onHover: ({ index }) => {
          if (!this.editing) {
            this.hoveredIndex = (index == null || index < 0) ? -1 : index;
            this.update();
          }
        },
        onClick: ({ index }) => {
          if (!this.editing) {
            this.selectedIndex = (index == null || index < 0) ? -1 : index;
            this.update();
          }
        },
        onEdit: ({editType, updatedData, editContext}) => {
          if (editType === "movePosition" || editType === "addTentativePosition") {
            this.editing = true;
          }
          if (editType === "addFeature") {
            updatedData.features[editContext.featureIndexes[0]].properties = {
              color: [255 * Math.random(), 255 * Math.random(), 255 * Math.random()]
            };
          }

          if (editType !== "addTentativePosition") {
            this.geojson = updatedData;
            this.selectedIndex = editContext.featureIndexes[0];
            this.update();
          }

          if (editType === "finishMovePosition" || editType === "addFeature") {
            this.editing = false;
          }
        }
      })
    ];
  }
  getMode() {
    return (this.zoom > 0.8) ? new CompositeMode([new DrawLineStringMode(), new ModifyMode()]) : new ViewMode();
  }
}

window.onload = () => {
  const app = new App();
  app.run();
};
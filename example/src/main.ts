import { Viewer } from "openseadragon";
import { DeckGLOverlay } from "../../openseadragon-deckgl-overlay";
import { Deck, OrthographicView, Position } from "@deck.gl/core";
import { CompositeMode, DrawLineStringMode, ModifyMode, ViewMode } from "@nebula.gl/edit-modes";
import { EditableGeoJsonLayer } from "@nebula.gl/layers";

const getFeatureIndex = (info) => {
  if (info.picked) {
    if (info.object?.properties?.featureIndex != null) {
      return info.object.properties.featureIndex;
    }
    if (info.index != null) {
      return info.index;
    }
    return -1;
  }
  return -1;
}

class App {
  viewer: Viewer;
  overlay: any;
  editable: boolean;
  editing: boolean;
  zoom: number;
  geojson: any;
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
      maxZoomPixelRatio: 3.0,
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
      getCursor: () => 'crosshair'
    }));

    this.editable = false;
    this.editing = false;
    this.zoom = 0;

    this.geojson = {
      type: "FeatureCollection",
      features: []
    };

    this.selectedIndex = -1;
  }

  run() {
    for (let i = 0; i < 50000; i++) {
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

      const prevEditable = this.editable;
      this.editable = this.zoom > 2.0;
      if (prevEditable != this.editable) {
        this.render();
      }
    });

    this.render();
  }

  render() {
    const d = this.overlay.deck();

    const indexes = new Array<number>();
    if (this.selectedIndex >= 0) {
      indexes.push(this.selectedIndex);
    }

    const layers = [
      new (EditableGeoJsonLayer as any)({
        id: 'editor',
        data: this.geojson,
        mode: this.editable ? new CompositeMode([new DrawLineStringMode(), new ModifyMode()]) : new ViewMode(),
        selectedFeatureIndexes: indexes,
        lineWidthMinPixels: 1,
        lineWidthMaxPixels: 3,
        editHandlePointOutline: true,
        editHandlePointStrokeWidth: 1,
        editHandlePointRadiusMinPixels: 3,
        editHandlePointRadiusMaxPixels: 5,
        getEditHandlePointColor: [0, 0, 0, 0],
        pickable: true,
        getLineColor: (feature, isSelected, mode) => feature.properties.color,
        onHover: (info) => {
          this.editing = info.picked || info.featureType || false;
          const index = getFeatureIndex(info);
          if (this.editable && this.selectedIndex !== index) {
            this.selectedIndex = index;
            this.render();
          }
        },
        onDragStart: (info) => {
          this.editing = info.picked || info.featureType || false;
        },
        onDragEnd: () => {
          this.editing = false;
          if (this.selectedIndex >= 0) {
            this.selectedIndex = -1;
            this.render();
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
            this.selectedIndex = (editType === "addFeature") ? -1 : editContext.featureIndexes[0];
            this.render();
          }

          if (editType === "finishMovePosition" || editType === "addFeature") {
            this.editing = false;
          }
        }
      })
    ];

    d.setProps({
      layers
    });
  }
}

window.onload = () => {
  const app = new App();
  app.run();
};
import { Viewer } from "openseadragon";
import { Deck } from "@deck.gl/core";

export class DeckGLOverlay {
  constructor(viewer: Viewer, deckProvider?: (parent: HTMLElement) => Deck);

  deck(): Deck;
  render();
}

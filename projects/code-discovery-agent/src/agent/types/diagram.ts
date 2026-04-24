export interface ExcalidrawElement {
  id: string;
  type: "rectangle" | "arrow" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: "solid";
  strokeWidth: number;
  strokeStyle: "solid";
  roughness: number;
  opacity: number;
  seed: number;
  version: number;
  versionNonce: number;
  isDeleted: boolean;
  groupIds: string[];
  roundness: null;
  boundElements: null;
  updated: number;
  link: null;
  locked: boolean;
}

export interface ExcalidrawDiagram {
  type: "excalidraw";
  version: 2;
  source: "code-discovery-agent";
  elements: ExcalidrawElement[];
  appState: {
    viewBackgroundColor: string;
    currentItemStrokeColor: string;
    currentItemBackgroundColor: string;
    currentItemFillStyle: "solid";
    currentItemStrokeWidth: number;
    currentItemStrokeStyle: "solid";
    currentItemRoughness: number;
    currentItemOpacity: number;
    currentItemFontFamily: number;
    currentItemFontSize: number;
    currentItemTextAlign: "left";
    currentItemStrokeSharpness: "sharp";
    currentItemStartArrowhead: null;
    currentItemEndArrowhead: "arrow";
  };
  files: Record<string, never>;
}

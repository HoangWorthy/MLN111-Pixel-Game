export const USE_VIETNAM_MAP = true;
export const SHOW_VIETNAM_COLLISION_DEBUG = false;

export interface VietnamHintMarker {
  kind: "hint";
  index: number;
  x: number;
  y: number;
  hintText: string;
}

export interface VietnamQuestionMarker {
  kind: "question";
  index: number;
  x: number;
  y: number;
  title: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  correctAnswerIndex: number;
}

export type VietnamInteractiveMarker =
  | VietnamHintMarker
  | VietnamQuestionMarker;

interface TiledChunk {
  data: number[];
  height: number;
  width: number;
  x: number;
  y: number;
}

interface TiledLayer {
  chunks?: TiledChunk[];
  type: string;
}

interface TiledMapData {
  layers?: TiledLayer[];
  tileheight?: number;
  tilewidth?: number;
  tilesets?: Array<{ firstgid?: number }>;
}

type TilesetProperties = Record<string, string>;

export class MapManager {
  private scene: Phaser.Scene;
  public map!: Phaser.Tilemaps.Tilemap;
  public layer1!: Phaser.Tilemaps.TilemapLayer;
  public layer2!: Phaser.Tilemaps.TilemapLayer;
  public layer3!: Phaser.Tilemaps.TilemapLayer;
  public vietnamCollisionGroup?: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createAllMaps() {
    return this.createVietnamMap();
  }

  private createVietnamMap() {
    const texture = this.scene.textures.get("VietNamMap");
    const source = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const width = source.width;
    const height = source.height;

    this.scene.add.image(0, 0, "VietNamMap").setOrigin(0).setDepth(0);

    this.map = this.createMapStub(width, height);
    this.createVietnamCollisions();

    return { totalWidth: width, totalHeight: height };
  }

  private createMapStub(width: number, height: number) {
    return { widthInPixels: width, heightInPixels: height } as Phaser.Tilemaps.Tilemap;
  }
  private createVietnamCollisions() {
    const mapData = this.scene.cache.json.get("VietNamMapData") as TiledMapData | undefined;
    const tilesetText = this.scene.cache.text.get("VietNamTileset") as string | undefined;

    if (!mapData || !tilesetText) return;

    const firstgid = mapData.tilesets?.[0]?.firstgid ?? 1;
    const collidingGids = this.getCollidingGids(tilesetText, firstgid);
    const layer = mapData.layers?.find((item) => item.type === "tilelayer");

    if (!layer?.chunks || collidingGids.size === 0) return;

    const tileWidth = mapData.tilewidth ?? 48;
    const tileHeight = mapData.tileheight ?? 48;
    let minTileX = Number.POSITIVE_INFINITY;
    let minTileY = Number.POSITIVE_INFINITY;

    for (const chunk of layer.chunks) {
      minTileX = Math.min(minTileX, chunk.x);
      minTileY = Math.min(minTileY, chunk.y);
    }

    this.vietnamCollisionGroup = this.scene.physics.add.staticGroup();

    for (const chunk of layer.chunks) {
      chunk.data.forEach((rawGid: number, index: number) => {
        if (!collidingGids.has(this.getBaseGid(rawGid))) return;

        const tileX = chunk.x + (index % chunk.width);
        const tileY = chunk.y + Math.floor(index / chunk.width);
        const x = (tileX - minTileX) * tileWidth + tileWidth / 2;
        const y = (tileY - minTileY) * tileHeight + tileHeight / 2;
        const collider = this.scene.add.rectangle(
          x,
          y,
          tileWidth,
          tileHeight,
          0xff1744,
          SHOW_VIETNAM_COLLISION_DEBUG ? 0.35 : 0
        );

        if (SHOW_VIETNAM_COLLISION_DEBUG) {
          collider.setStrokeStyle(1, 0xffff00, 0.9);
          collider.setDepth(8);
        }

        this.vietnamCollisionGroup!.add(collider);
      });
    }

    this.vietnamCollisionGroup.refresh();
  }

  private getCollidingGids(tilesetText: string, firstgid: number) {
    const collidingGids = new Set<number>();

    this.getTilesetProperties(tilesetText).forEach((properties, tileId) => {
      if (properties.collides === "true") {
        collidingGids.add(tileId + firstgid);
      }
    });

    return collidingGids;
  }

  getVietnamInteractiveMarkers(): VietnamInteractiveMarker[] {
    const mapData = this.scene.cache.json.get("VietNamMapData") as
      | TiledMapData
      | undefined;
    const tilesetText = this.scene.cache.text.get("VietNamTileset") as
      | string
      | undefined;

    if (!mapData || !tilesetText) return [];

    const layer = mapData.layers?.find((item) => item.type === "tilelayer");
    if (!layer?.chunks) return [];

    const firstgid = mapData.tilesets?.[0]?.firstgid ?? 1;
    const tileProperties = this.getTilesetProperties(tilesetText);
    const markerPropertiesByGid = new Map<number, TilesetProperties>();

    tileProperties.forEach((properties, tileId) => {
      if (properties.hint !== undefined || properties.question !== undefined) {
        markerPropertiesByGid.set(tileId + firstgid, properties);
      }
    });

    if (markerPropertiesByGid.size === 0) return [];

    const tileWidth = mapData.tilewidth ?? 48;
    const tileHeight = mapData.tileheight ?? 48;
    let minTileX = Number.POSITIVE_INFINITY;
    let minTileY = Number.POSITIVE_INFINITY;

    for (const chunk of layer.chunks) {
      minTileX = Math.min(minTileX, chunk.x);
      minTileY = Math.min(minTileY, chunk.y);
    }

    const markers: VietnamInteractiveMarker[] = [];

    for (const chunk of layer.chunks) {
      chunk.data.forEach((rawGid: number, index: number) => {
        const properties = markerPropertiesByGid.get(this.getBaseGid(rawGid));
        if (!properties) return;

        const tileX = chunk.x + (index % chunk.width);
        const tileY = chunk.y + Math.floor(index / chunk.width);
        const x = (tileX - minTileX) * tileWidth + tileWidth / 2;
        const y = (tileY - minTileY) * tileHeight + tileHeight / 2;

        if (properties.hint !== undefined) {
          markers.push({
            kind: "hint",
            index: Number(properties.hint),
            x,
            y,
            hintText: properties.hintText ?? "",
          });
        }

        if (properties.question !== undefined) {
          markers.push({
            kind: "question",
            index: Number(properties.question),
            x,
            y,
            title: properties.questionTitle ?? "",
            questionText: properties.questionText ?? "",
            options: [
              properties.optionA ?? "",
              properties.optionB ?? "",
              properties.optionC ?? "",
              properties.optionD ?? "",
            ],
            correctAnswer: properties.correctAnswer ?? "",
            correctAnswerIndex: Number(properties.correctAnswerIndex ?? -1),
          });
        }
      });
    }

    return markers.sort((left, right) => {
      if (left.kind !== right.kind) return left.kind.localeCompare(right.kind);
      return left.index - right.index;
    });
  }

  private getTilesetProperties(tilesetText: string) {
    const xml = new DOMParser().parseFromString(tilesetText, "application/xml");
    const tileProperties = new Map<number, TilesetProperties>();

    xml.querySelectorAll("tile").forEach((tile) => {
      const tileId = Number(tile.getAttribute("id"));
      const properties: TilesetProperties = {};

      tile.querySelectorAll("property").forEach((property) => {
        const name = property.getAttribute("name");
        if (!name) return;

        properties[name] =
          property.getAttribute("value") ?? property.textContent ?? "";
      });

      tileProperties.set(tileId, properties);
    });

    return tileProperties;
  }

  private getBaseGid(rawGid: number) {
    return rawGid & 0x0fffffff;
  }
}

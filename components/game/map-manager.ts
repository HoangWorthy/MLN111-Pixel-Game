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
  public map2!: Phaser.Tilemaps.Tilemap;
  public map2wall!: Phaser.Tilemaps.TilemapLayer;
  public map2floor!: Phaser.Tilemaps.TilemapLayer;
  public map3!: Phaser.Tilemaps.Tilemap;
  public map3wall!: Phaser.Tilemaps.TilemapLayer;
  public map3floor1!: Phaser.Tilemaps.TilemapLayer;
  public map3floor2!: Phaser.Tilemaps.TilemapLayer;
  public vietnamCollisionGroup?: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createAllMaps() {
    if (USE_VIETNAM_MAP) {
      return this.createVietnamMap();
    }

    this.createMap1();
    this.createMap2();
    this.createMap3();
    return this.getTotalDimensions();
  }

  private createVietnamMap() {
    const texture = this.scene.textures.get("VietNamMap");
    const source = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    const width = source.width;
    const height = source.height;

    this.scene.add.image(0, 0, "VietNamMap").setOrigin(0).setDepth(0);

    this.map = this.createMapStub(width, height);
    this.map2 = this.createMapStub(0, height);
    this.map3 = this.createMapStub(0, height);

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

  private createMap1() {
    this.map = this.scene.make.tilemap({ key: "map1" });
    const tileset1 = this.map.addTilesetImage("room", "room")!;
    const tileset2 = this.map.addTilesetImage("interior", "interior")!;

    this.layer1 = this.map.createLayer("layer1", [tileset1, tileset2], 0, 0)!;
    this.layer2 = this.map.createLayer("layer2", [tileset1, tileset2], 0, 0)!;
    this.layer3 = this.map.createLayer("layer3", [tileset1, tileset2], 0, 0)!;

    this.layer1.setVisible(true);
    this.layer2.setVisible(true);
    this.layer3.setVisible(true);

    this.layer3.setDepth(0);
    this.layer2.setDepth(1);
    this.layer1.setDepth(2);
  }

  private createMap2() {
    this.map2 = this.scene.make.tilemap({ key: "map2" });
    const map2tileset = this.map2.addTilesetImage("Dungeon_Tileset", "Dungeon_Tileset")!;

    this.map2floor = this.map2.createLayer("Floor0", [map2tileset], this.map.widthInPixels, 0)!;
    this.map2wall = this.map2.createLayer("Floor1", [map2tileset], this.map.widthInPixels, 0)!;

    this.map2floor.setVisible(true);
    this.map2wall.setVisible(true);
    this.map2floor.setDepth(3);
    this.map2wall.setDepth(4);

    this.createMap2Title();
  }

  private createMap3() {
    this.map3 = this.scene.make.tilemap({ key: "map3" });
    const map3tileset = this.map3.addTilesetImage("antarcticbees_interior_free_sample-export", "antarcticbees_interior")!;
    const map3OffsetX = this.map.widthInPixels + this.map2.widthInPixels;

    this.map3floor1 = this.map3.createLayer("floor1", [map3tileset], map3OffsetX, 0)!;
    this.map3floor2 = this.map3.createLayer("floor2", [map3tileset], map3OffsetX, 0)!;
    this.map3wall = this.map3.createLayer("wall", [map3tileset], map3OffsetX, 0)!;

    this.map3floor1.setVisible(true);
    this.map3floor2.setVisible(true);
    this.map3wall.setVisible(true);
    this.map3floor1.setDepth(5);
    this.map3floor2.setDepth(6);
    this.map3wall.setDepth(7);

    this.createMap3Title();
  }

  private createMap2Title() {
    this.scene.add.rectangle(720 + this.map.widthInPixels, 100, 600, 60, 0x0f3460);
    this.scene.add
      .text(720 + this.map.widthInPixels, 100, "PHÒNG 2: BẢN CHẤT & HÌNH THỨC", {
        fontSize: "24px",
        color: "#e8e8e8",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(10);
  }

  private createMap3Title() {
    this.scene.add.rectangle(720 + this.map.widthInPixels + this.map2.widthInPixels, 100, 600, 60, 0x0f3460);
    this.scene.add
      .text(720 + this.map.widthInPixels + this.map2.widthInPixels, 100, "PHÒNG 3: NGHIÊN CỨU KHOA HỌC", {
        fontSize: "24px",
        color: "#e8e8e8",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(10);
  }

  getTotalDimensions() {
    const totalWidth = this.map.widthInPixels + this.map2.widthInPixels + this.map3.widthInPixels;
    const totalHeight = Math.max(this.map.heightInPixels, this.map2.heightInPixels, this.map3.heightInPixels);
    return { totalWidth, totalHeight };
  }

  getMap3OffsetX() {
    return this.map.widthInPixels + this.map2.widthInPixels;
  }
}

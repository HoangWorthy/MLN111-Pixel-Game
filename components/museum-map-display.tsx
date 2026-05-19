import type { ExhibitData } from "@/types/museum";

export class MuseumMapDisplay {
  private scene: Phaser.Scene;
  private map!: Phaser.Tilemaps.Tilemap;
  private layer1!: Phaser.Tilemaps.TilemapLayer;
  private layer2!: Phaser.Tilemaps.TilemapLayer;
  private layer3!: Phaser.Tilemaps.TilemapLayer;
  private map2!: Phaser.Tilemaps.Tilemap;
  private map2wall!: Phaser.Tilemaps.TilemapLayer;
  private map2floor!: Phaser.Tilemaps.TilemapLayer;
  private map3!: Phaser.Tilemaps.Tilemap;
  private map3wall!: Phaser.Tilemaps.TilemapLayer;
  private map3floor1!: Phaser.Tilemaps.TilemapLayer;
  private map3floor2!: Phaser.Tilemaps.TilemapLayer;
  private exhibits: Phaser.Physics.Arcade.Sprite[] = [];
  private pictures: {
    collision: Phaser.GameObjects.Rectangle;
    id: number;
    imagePath: string;
    caption: string;
  }[] = [];
  private infoPoints: {
    collision: Phaser.GameObjects.Rectangle;
    exhibit: ExhibitData;
    sprite: Phaser.GameObjects.Arc;
  }[] = [];
  private columns: {
    collision: Phaser.GameObjects.Rectangle;
    roomNumber: number;
    title: string;
  }[] = [];
  private roomBorders: {
    room2Border: Phaser.GameObjects.Rectangle;
    room3Border: Phaser.GameObjects.Rectangle;
  } | null = null;
  private backButtons: {
    bg: Phaser.GameObjects.Rectangle;
    text: Phaser.GameObjects.Text;
    room: number;
  }[] = [];
  private goToRoomButtons: {
    bg: Phaser.GameObjects.Rectangle;
    text: Phaser.GameObjects.Text;
    targetRoom: number;
  }[] = [];
  private lockedDoors: {
    collision: Phaser.GameObjects.Rectangle;
    roomNumber: number;
  }[] = [];
  private topBorder!: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createMap(museumData: any[], unlockedRooms: Set<number>) {
    this.setupTilemaps();
    this.createExhibits(museumData);
    this.createWalls(unlockedRooms);
    this.createPictures();
    this.createInfoPoints();
    this.createColumns();
    this.createRoomBorders();
    this.createButtons();
  }

  private setupTilemaps() {
    this.map = this.scene.make.tilemap({ key: "map1" });
    const tileset1 = this.map.addTilesetImage("room", "room")!;
    const tileset2 = this.map.addTilesetImage("interior", "interior")!;

    this.layer1 = this.map.createLayer(
      "layer1",
      [tileset1, tileset2],
      0,
      0
    )!;
    this.layer2 = this.map.createLayer(
      "layer2",
      [tileset1, tileset2],
      0,
      0
    )!;
    this.layer3 = this.map.createLayer(
      "layer3",
      [tileset1, tileset2],
      0,
      0
    )!;

    this.layer1.setVisible(true);
    this.layer2.setVisible(true);
    this.layer3.setVisible(true);

    this.layer3.setDepth(-3);
    this.layer2.setDepth(-2);
    this.layer1.setDepth(-1);

    this.map2 = this.scene.make.tilemap({ key: "map2" });
    const map2tileset = this.map2.addTilesetImage(
      "Dungeon_Tileset",
      "Dungeon_Tileset"
    )!;

    this.map2floor = this.map2.createLayer(
      "Floor0",
      [map2tileset],
      this.map.widthInPixels,
      0
    )!;
    this.map2wall = this.map2.createLayer(
      "Floor1",
      [map2tileset],
      this.map.widthInPixels,
      0
    )!;

    this.map2floor.setVisible(true);
    this.map2wall.setVisible(true);

    this.map2floor.setDepth(-1);
    this.map2wall.setDepth(0);

    this.scene.add
      .rectangle(
        this.map.widthInPixels + this.map2.widthInPixels / 2,
        this.map2.heightInPixels / 2,
        this.map2.widthInPixels,
        this.map2.heightInPixels,
        0xff0000,
        0.3
      )
      .setDepth(6);

    this.map3 = this.scene.make.tilemap({ key: "map3" });

    const map3tileset = this.map3.addTilesetImage(
      "antarcticbees_interior_free_sample-export",
      "antarcticbees_interior"
    )!;

    const map3OffsetX = this.map.widthInPixels + this.map2.widthInPixels;

    this.map3floor1 = this.map3.createLayer(
      "floor1",
      [map3tileset],
      map3OffsetX,
      0
    )!;
    this.map3floor2 = this.map3.createLayer(
      "floor2",
      [map3tileset],
      map3OffsetX,
      0
    )!;
    this.map3wall = this.map3.createLayer(
      "wall",
      [map3tileset],
      map3OffsetX,
      0
    )!;

    this.map3floor1.setVisible(true);
    this.map3floor2.setVisible(true);
    this.map3wall.setVisible(true);

    this.map3floor1.setDepth(-1);
    this.map3floor2.setDepth(0);
    this.map3wall.setDepth(1);

    this.scene.add
      .rectangle(
        map3OffsetX + this.map3.widthInPixels / 2,
        this.map3.heightInPixels / 2,
        this.map3.widthInPixels,
        this.map3.heightInPixels,
        0x0000ff,
        0.3
      )
      .setDepth(6);
  }

  private createExhibits(museumData: any[]) {
    museumData.forEach((exhibit) => {
      const exhibitSprite = this.scene.physics.add.sprite(
        exhibit.position.x,
        exhibit.position.y,
        `exhibit-${exhibit.id}`
      );
      exhibitSprite.setImmovable(true);
      exhibitSprite.setData("exhibitData", exhibit);
      this.exhibits.push(exhibitSprite);

      const roomLabels = [
        "PHÒNG 1: KHỞI NGUỒN & NỀN TẢNG",
        "PHÒNG 2: BẢN CHẤT & HÌNH THỨC",
        "PHÒNG 3: NHÀ NƯỚC PHÁP QUYỀN",
        "PHÒNG 4: PHÁT HUY DÂN CHỦ",
        "PHÒNG 5: PHÒNG CHỐNG THAM NHŨNG",
        "PHÒNG 6: ĐỔI MỚI & CHUYỂN ĐỔI SỐ",
        "PHÒNG 7: TRÁCH NHIỆM CÔNG DÂN",
        "PHÒNG 8: ĐANG XÂY DỰNG",
        "PHÒNG 9: ĐANG XÂY DỰNG",
      ];

      this.scene.add
        .text(
          exhibit.position.x,
          exhibit.position.y - 120,
          roomLabels[exhibit.roomNumber - 1],
          {
            fontSize: "18px",
            color: "#fbbf24",
            fontStyle: "bold",
          }
        )
        .setOrigin(0.5);

      this.scene.add
        .text(exhibit.position.x, exhibit.position.y + 100, exhibit.title, {
          fontSize: "13px",
          color: "#e8e8e8",
          align: "center",
          wordWrap: { width: 180 },
        })
        .setOrigin(0.5);

      const spotlight = this.scene.add.circle(
        exhibit.position.x,
        exhibit.position.y,
        120,
        0xffffff,
        0.1
      );
      this.scene.tweens.add({
        targets: spotlight,
        alpha: 0.2,
        duration: 2000,
        yoyo: true,
        repeat: -1,
      });
    });
  }

  private createWalls(unlockedRooms: Set<number>) {
    for (let i = 1; i <= 8; i++) {
      const x = i * 1000;

      this.createWall(x, 250, 40, 460, 0x1e293b);
      this.createWall(x, 950, 40, 460, 0x1e293b);

      if (!unlockedRooms.has(i + 1)) {
        const doorCollision = this.scene.add.rectangle(
          x,
          600,
          40,
          200,
          0xff0000,
          0
        );
        this.scene.physics.add.existing(doorCollision, true);

        this.lockedDoors.push({
          collision: doorCollision,
          roomNumber: i + 1,
        });

        const doorSprite = this.scene.add.sprite(x, 600, "door");
        doorSprite.setScale(2);
        doorSprite.setTint(0xff0000);
        doorSprite.setDepth(5);

        const lockIcon = this.scene.add
          .text(x, 600 - 120, "🔒", {
            fontSize: "32px",
          })
          .setOrigin(0.5);
        lockIcon.setDepth(10);
      }
    }

    for (let i = 1; i <= 8; i++) {
      const baseX = i * 1000;
      this.createPillar(baseX + 650, 250);
      this.createPillar(baseX + 650, 950);
    }

    this.topBorder = this.scene.add.rectangle(
      4500,
      100,
      9000,
      200,
      0x000000,
      0
    );
    this.scene.physics.add.existing(this.topBorder, true);
  }

  private createWall(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number
  ) {
    const wall = this.scene.add.rectangle(x, y, width, height, color);
    this.scene.physics.add.existing(wall, true);
    return wall;
  }

  private createPillar(x: number, y: number) {
    const pillar = this.scene.add.rectangle(x, y, 40, 40, 0x8b7355);
    pillar.setDepth(10);

    const pillarCollision = this.scene.add.rectangle(x, y, 40, 40, 0xff0000, 0);
    this.scene.physics.add.existing(pillarCollision, true);

    return pillar;
  }

  private createPictures() {
    const picturePositions = [
      { x: 300, y: 400, id: 1, imagePath: "/pic/1.jpg", caption: "Bức tranh 1" },
      { x: 500, y: 400, id: 2, imagePath: "/pic/2.jpg", caption: "Bức tranh 2" },
      { x: 700, y: 400, id: 3, imagePath: "/pic/3.jpg", caption: "Bức tranh 3" },
      { x: 900, y: 400, id: 4, imagePath: "/pic/4.jpg", caption: "Bức tranh 4" },
      { x: 1100, y: 400, id: 5, imagePath: "/pic/5.jpg", caption: "Bức tranh 5" },
      { x: 1300, y: 400, id: 6, imagePath: "/pic/6.jpg", caption: "Bức tranh 6" },
      { x: 300, y: 800, id: 7, imagePath: "/pic/7.jpg", caption: "Bức tranh 7" },
      { x: 500, y: 800, id: 8, imagePath: "/pic/8.jpg", caption: "Bức tranh 8" },
      { x: 700, y: 800, id: 9, imagePath: "/pic/9.jpg", caption: "Bức tranh 9" },
      { x: 900, y: 800, id: 10, imagePath: "/pic/10.jpg", caption: "Bức tranh 10" },
    ];

    picturePositions.forEach((pos) => {
      const pictureCollision = this.scene.add.rectangle(
        pos.x,
        pos.y,
        60,
        80,
        0x8b5a3c,
        0
      );
      this.scene.physics.add.existing(pictureCollision, true);

      const pictureFrame = this.scene.add.rectangle(
        pos.x,
        pos.y,
        60,
        80,
        0x8b5a3c
      );
      pictureFrame.setStrokeStyle(2, 0xffd700);

      const pictureIcon = this.scene.add
        .text(pos.x, pos.y, "🖼️", {
          fontSize: "24px",
        })
        .setOrigin(0.5);

      this.pictures.push({
        collision: pictureCollision,
        id: pos.id,
        imagePath: pos.imagePath,
        caption: pos.caption,
      });
    });
  }

  private createInfoPoints() {
    const infoPositions = [
      { x: 200, y: 500, room: 1, exhibit: null },
      { x: 400, y: 500, room: 1, exhibit: null },
      { x: 600, y: 500, room: 1, exhibit: null },
      { x: 800, y: 500, room: 1, exhibit: null },
      { x: 1000, y: 500, room: 1, exhibit: null },
      { x: 1200, y: 500, room: 1, exhibit: null },
      { x: 200, y: 700, room: 1, exhibit: null },
      { x: 400, y: 700, room: 1, exhibit: null },
      { x: 600, y: 700, room: 1, exhibit: null },
      { x: 800, y: 700, room: 1, exhibit: null },
    ];

    infoPositions.forEach((pos) => {
      const infoCollision = this.scene.add.rectangle(
        pos.x,
        pos.y,
        30,
        30,
        0x00aaff,
        0
      );
      this.scene.physics.add.existing(infoCollision, true);

      const infoSprite = this.scene.add.circle(pos.x, pos.y, 15, 0x00aaff);
      infoSprite.setStrokeStyle(2, 0xffffff);

      const infoText = this.scene.add
        .text(pos.x, pos.y, "i", {
          fontSize: "12px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0.5);

      this.infoPoints.push({
        collision: infoCollision,
        exhibit: pos.exhibit as any,
        sprite: infoSprite,
      });
    });
  }

  private createColumns() {
    const columnPositions: any[] = [];
    columnPositions.forEach((pos) => {
      this.createColumn(pos.x, pos.y, pos.roomNumber, pos.title);
    });
  }

  private createColumn(x: number, y: number, roomNumber: number, title: string) {
    const pillar = this.scene.add.rectangle(x, y, 60, 60, 0x8b7355);
    this.scene.add.rectangle(x, y, 50, 50, 0xa67c52);
    this.scene.add.rectangle(x, y, 40, 40, 0xd4af37);
    pillar.setDepth(3);

    const columnCollision = this.scene.add.rectangle(x, y, 60, 60, 0xff0000, 0);
    this.scene.physics.add.existing(columnCollision, true);

    this.columns.push({
      collision: columnCollision,
      roomNumber: roomNumber,
      title: title,
    });
  }

  private createRoomBorders() {
    const room2Border = this.scene.add.rectangle(
      2880,
      600,
      40,
      200,
      0x00ff00,
      0
    );
    this.scene.physics.add.existing(room2Border, true);

    const room3Border = this.scene.add.rectangle(
      4320,
      600,
      40,
      200,
      0x0000ff,
      0
    );
    this.scene.physics.add.existing(room3Border, true);

    this.roomBorders = {
      room2Border: room2Border,
      room3Border: room3Border,
    };
  }

  private createButtons() {
    this.refreshBackButtons();
  }

  private refreshBackButtons() {
    this.backButtons.forEach((button) => {
      button.bg.destroy();
      button.text.destroy();
    });
    this.backButtons = [];

    this.goToRoomButtons.forEach((button) => {
      button.bg.destroy();
      button.text.destroy();
    });
    this.goToRoomButtons = [];

    for (let room = 1; room <= 9; room++) {
      const x = room * 1000 - 500;

      const backButtonBg = this.scene.add.rectangle(x, 150, 140, 40, 0x333333);
      backButtonBg.setStrokeStyle(2, 0xffffff);
      backButtonBg.setInteractive();
      backButtonBg.setScrollFactor(0);
      backButtonBg.setDepth(50);

      const backButtonText = this.scene.add
        .text(x, 150, `← Về phòng ${room}`, {
          fontSize: "14px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      backButtonText.setScrollFactor(0);
      backButtonText.setDepth(51);

      this.backButtons.push({
        bg: backButtonBg,
        text: backButtonText,
        room: room,
      });
    }
  }

  getMapDimensions() {
    return {
      width: this.map.widthInPixels +
        this.map2.widthInPixels +
        this.map3.widthInPixels,
      height: Math.max(
        this.map.heightInPixels,
        this.map2.heightInPixels,
        this.map3.heightInPixels
      )
    };
  }

  getExhibits() {
    return this.exhibits;
  }

  getPictures() {
    return this.pictures;
  }

  getInfoPoints() {
    return this.infoPoints;
  }

  getColumns() {
    return this.columns;
  }

  getRoomBorders() {
    return this.roomBorders;
  }

  getBackButtons() {
    return this.backButtons;
  }

  getGoToRoomButtons() {
    return this.goToRoomButtons;
  }

  getLockedDoors() {
    return this.lockedDoors;
  }

  getTopBorder() {
    return this.topBorder;
  }
}
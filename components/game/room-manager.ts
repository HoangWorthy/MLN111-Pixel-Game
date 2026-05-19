export class RoomManager {
  private scene: Phaser.Scene;
  private unlockedRooms: Set<number>;

  constructor(scene: Phaser.Scene, unlockedRooms: Set<number>) {
    this.scene = scene;
    this.unlockedRooms = unlockedRooms;
  }

  createRoomTriggers() {
    return {
      1: new Phaser.Geom.Rectangle(40, 260, 1380, 680),
      2: new Phaser.Geom.Rectangle(1480, 260, 1380, 680),
      3: new Phaser.Geom.Rectangle(2920, 260, 1380, 680),
    };
  }

  createWall(x: number, y: number, width: number, height: number, color: number) {
    const wall = this.scene.add.rectangle(x, y, width, height, color);
    this.scene.physics.add.existing(wall, true);
    return wall;
  }

  createRoomSeparators() {
    for (let i = 1; i <= 8; i++) {
      const x = i * 1000;

      this.createWall(x, 250, 40, 460, 0x1e293b);
      this.createWall(x, 950, 40, 460, 0x1e293b);
    }
  }

  createRoomBorders(map: Phaser.Tilemaps.Tilemap, map2: Phaser.Tilemaps.Tilemap) {
    const room2BorderX = map.widthInPixels;
    const room2BorderY = map.heightInPixels / 2;
    const room2Border = this.scene.add.rectangle(
      room2BorderX,
      room2BorderY,
      20,
      map.heightInPixels,
      0xff0000,
      0
    );
    this.scene.physics.add.existing(room2Border, true);

    const room3BorderX = map.widthInPixels + map2.widthInPixels;
    const room3BorderY = map2.heightInPixels / 2;
    const room3Border = this.scene.add.rectangle(
      room3BorderX,
      room3BorderY,
      20,
      map2.heightInPixels,
      0xff0000,
      0
    );
    this.scene.physics.add.existing(room3Border, true);

    this.addRoomLabels(room2BorderX, room2BorderY, room3BorderX, room3BorderY);

    return {
      room2Border,
      room3Border,
    };
  }

  private addRoomLabels(room2BorderX: number, room2BorderY: number, room3BorderX: number, room3BorderY: number) {
    this.scene.add
      .text(
        room2BorderX - 50,
        room2BorderY - 100,
        "🔒 PHÒNG 2\nLàm quiz để mở",
        {
          fontSize: "14px",
          color: "#fbbf24",
          fontStyle: "bold",
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setDepth(10);

    this.scene.add
      .text(
        room3BorderX - 50,
        room3BorderY - 100,
        "🔒 PHÒNG 3\nLàm quiz để mở",
        {
          fontSize: "14px",
          color: "#fbbf24",
          fontStyle: "bold",
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setDepth(10);
  }

  updateCameraBounds(cameras: Phaser.Cameras.Scene2D.CameraManager, roomNumber: number) {
    switch (roomNumber) {
      case 1:
        cameras.main.setBounds(50, 150, 1340, 500);
        break;
      case 2:
        cameras.main.setBounds(1490, 150, 1340, 500);
        break;
      case 3:
        cameras.main.setBounds(2930, 150, 1340, 500);
        break;
      default:
        cameras.main.setBounds(0, 150, 9000, 500);
    }
  }
}
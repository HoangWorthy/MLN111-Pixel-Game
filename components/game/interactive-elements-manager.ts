import type { ExhibitData } from "@/types/museum";
import { museumData } from "@/data/museum-data";
import type {
  MapManager,
  VietnamInteractiveMarker,
} from "@/components/game/map-manager";

interface VietnamMapMarkerView {
  marker: VietnamInteractiveMarker;
  sprite: Phaser.GameObjects.Sprite;
}

export class InteractiveElementsManager {
  private scene: Phaser.Scene;

  public exhibits: Phaser.Physics.Arcade.Sprite[] = [];
  public infoPoints: {
    exhibit: ExhibitData;
    sprite: Phaser.GameObjects.Sprite;
  }[] = [];
  public quizPoint: {
    collision: Phaser.GameObjects.Rectangle;
    sprite: Phaser.GameObjects.Sprite;
  } | null = null;
  public pictures: {
    collision: Phaser.GameObjects.Rectangle;
    id: number;
    imagePath: string;
    caption: string;
  }[] = [];
  public vietnamMapMarkers: VietnamMapMarkerView[] = [];
  public finishLine: {
    collision: Phaser.GameObjects.Rectangle;
    area: Phaser.GameObjects.Rectangle;
    text: Phaser.GameObjects.Text;
  } | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createInfoPoints() {
    const room1Exhibits = museumData
      .filter((exhibit) => exhibit.roomNumber === 1)
      .slice(0, 2);
    const room2Exhibits = museumData
      .filter((exhibit) => exhibit.roomNumber === 2)
      .slice(0, 2);
    const room3Exhibits = museumData
      .filter((exhibit) => exhibit.roomNumber === 3)
      .slice(0, 2);

    // Get map dimensions from the scene
    const map = (this.scene as any).map;
    const map2 = (this.scene as any).map2;

    const room1Positions = [
      { x: 300, y: 300 },
      { x: 300, y: 600 },
    ];
    room1Exhibits.forEach((exhibit, index) => {
      const pos = room1Positions[index];
      this.createInfoPoint(pos.x, pos.y, exhibit);
    });

    const room2Positions = [
      { x: map.widthInPixels + 300, y: 300 },
      { x: map.widthInPixels + 300, y: 600 },
    ];
    room2Exhibits.forEach((exhibit, index) => {
      const pos = room2Positions[index];
      this.createInfoPoint(pos.x, pos.y, exhibit);
    });

    const room3Positions = [
      { x: map.widthInPixels + map2.widthInPixels + 300, y: 300 },
      { x: map.widthInPixels + map2.widthInPixels + 300, y: 600 },
    ];
    room3Exhibits.forEach((exhibit, index) => {
      const pos = room3Positions[index];
      this.createInfoPoint(pos.x, pos.y, exhibit);
    });
  }

  createInfoPoint(x: number, y: number, exhibit: ExhibitData) {
    const sprite = this.scene.add.sprite(x, y, "info-point");
    sprite.setDepth(5);
    sprite.setScale(0.8);
    sprite.setInteractive();

    this.scene.tweens.add({
      targets: sprite,
      scale: 1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.scene.add
      .text(x, y + 60, exhibit.title, {
        fontSize: "12px",
        color: "#e8e8e8",
        backgroundColor: "#000000",
        padding: { x: 8, y: 4 },
        align: "center",
        wordWrap: { width: 200 },
      })
      .setOrigin(0.5)
      .setDepth(5);

    sprite.on("pointerdown", () => {
      (window as any).handleExhibitInteract(exhibit);
    });

    this.infoPoints.push({
      sprite: sprite,
      exhibit: exhibit,
    });
  }

  createPictures() {
    const map = (this.scene as any).map;
    const roomWidth = map.widthInPixels;
    const sectionWidth = roomWidth / 6;

    const picturePositions = [
      {
        x: sectionWidth * 0.5,
        y: 100,
        id: 1,
        imagePath: "/pic/r1-e3.jpg",
        caption: "Chân dung Bác Hồ thời trẻ bên lá cờ Đảng",
      },
      {
        x: sectionWidth * 1.5,
        y: 100,
        id: 2,
        imagePath: "/pic/r1-e4.jpg",
        caption:
          'Hình ảnh minh họa về tư tưởng của Chủ tịch Hồ Chí Minh với câu nói: "Bài báo ấy của Bác vẫn có giá trị để đời cho sự nghiệp xây dựng, chỉnh đốn Đảng của chúng ta."',
      },
      {
        x: sectionWidth * 2.5,
        y: 100,
        id: 3,
        imagePath: "/pic/r2-e3.jpg",
        caption: "Chân dung Bác Hồ thời thanh niên",
      },
      {
        x: sectionWidth * 3.5,
        y: 100,
        id: 4,
        imagePath: "/pic/r1-e5.jpg",
        caption: "Bác Hồ miệt mài soạn thảo tài liệu cách mạng",
      },
      {
        x: sectionWidth * 4.5,
        y: 100,
        id: 5,
        imagePath: "/pic/r1-e6.jpg",
        caption: "Bác Hồ kiên cường dưới lá cờ Tổ quốc",
      },
      {
        x: sectionWidth * 5.5,
        y: 100,
        id: 6,
        imagePath: "/pic/r1-e7.jpg",
        caption: "Hành trình bôn ba tìm đường cứu nước của Bác Hồ",
      },
    ];

    picturePositions.forEach((pos) => {
      const collision = this.scene.add.rectangle(
        pos.x,
        pos.y,
        100,
        60,
        0xff0000,
        0
      );
      this.scene.physics.add.existing(collision, true);

      this.pictures.push({
        collision: collision,
        id: pos.id,
        imagePath: pos.imagePath,
        caption: pos.caption,
      });
    });
  }

  createVietnamTileMarkers(
    mapManager: MapManager,
    onMarkerInteract?: (marker: VietnamInteractiveMarker) => void
  ) {
    const markers = mapManager.getVietnamInteractiveMarkers();

    markers.forEach((marker) => {
      const textureKey = marker.kind === "question" ? "quiz-point" : "info-point";
      const sprite = this.scene.add.sprite(marker.x, marker.y, textureKey);

      sprite.setDepth(20);
      sprite.setScale(0.55);
      sprite.setInteractive();

      this.scene.tweens.add({
        targets: sprite,
        scale: 0.7,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      sprite.on("pointerdown", () => onMarkerInteract?.(marker));

      this.vietnamMapMarkers.push({
        marker,
        sprite,
      });
    });
  }

  createComprehensiveQuizPoint() {
    // Calculate map3 position
    const map = (this.scene as any).map;
    const map2 = (this.scene as any).map2;
    const map3 = (this.scene as any).map3;
    const map3OffsetX = map.widthInPixels + map2.widthInPixels;
    const x = map3OffsetX + map3.widthInPixels / 2;
    const y = map3.heightInPixels / 2;

    const sprite = this.scene.add.sprite(x, y, "quiz-point");
    sprite.setScale(1.2);
    sprite.setDepth(10);

    const collision = this.scene.add.rectangle(x, y, 100, 100, 0xff0000, 0);
    this.scene.physics.add.existing(collision, true);

    this.scene.tweens.add({
      targets: sprite,
      scaleX: 1.4,
      scaleY: 1.4,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Power2.easeInOut",
    });

    const label = this.scene.add
      .text(x, y - 80, "QUIZ TỔNG HỢP", {
        fontSize: "16px",
        color: "#f59e0b",
        fontStyle: "bold",
        backgroundColor: "#000000",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.quizPoint = { collision, sprite };
  }

  createFinishLine(mapManager: any) {
    const map3OffsetX = mapManager.getMap3OffsetX();
    const x = map3OffsetX + mapManager.map3.widthInPixels - 80;
    const y = mapManager.map3.heightInPixels / 2;

    // Create finish line with map-consistent style
    const finishArea = this.scene.add.rectangle(x, y, 120, 350, 0x0f3460, 0.9);
    finishArea.setStrokeStyle(4, 0x374151);
    finishArea.setDepth(15);

    // Create decorative border
    const finishBorder = this.scene.add.rectangle(x, y, 130, 360, 0x2d3748, 0);
    finishBorder.setStrokeStyle(6, 0x4a5568);
    finishBorder.setDepth(14);

    const finishText = this.scene.add
      .text(x - 50, y, "FINISH", {
        fontSize: "28px",
        color: "#e8e8e8",
        fontStyle: "bold",
        stroke: "#2d3748",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setRotation(-Math.PI / 2);

    // Subtle animation matching map style
    this.scene.tweens.add({
      targets: finishArea,
      alpha: 0.7,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.scene.tweens.add({
      targets: finishText,
      scale: 1.1,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    const collision = this.scene.add.rectangle(x, y, 120, 350, 0xff0000, 0);
    this.scene.physics.add.existing(collision, true);

    this.finishLine = { collision, area: finishArea, text: finishText };

    const guidanceText = this.scene.add
      .text(
        map3OffsetX + mapManager.map3.widthInPixels / 2,
        300,
        "🏃‍♂️ ĐI ĐẾN VẠCH ĐÍCH BÊN PHẢI ĐỂ HOÀN THÀNH!",
        {
          fontSize: "20px",
          color: "#e8e8e8",
          fontStyle: "bold",
          backgroundColor: "#2d3748",
          padding: { x: 12, y: 8 },
          stroke: "#4a5568",
          strokeThickness: 2,
        }
      )
      .setOrigin(0.5)
      .setDepth(25);

    this.scene.tweens.add({
      targets: guidanceText,
      y: 280,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}

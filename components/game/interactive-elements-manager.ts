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
    // Legacy comprehensive quiz point removed for VietNam map mode.
  }

  createFinishLine(mapManager: any) {
    // Legacy finish line removed for VietNam map mode.
  }
}

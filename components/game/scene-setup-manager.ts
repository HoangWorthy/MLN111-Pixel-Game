export class SceneSetupManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createBaseFloor() {
    for (let x = 0; x < 9000; x += 120) {
      for (let y = 0; y < 1200; y += 120) {
        const baseColor = (x + y) % 240 === 0 ? 0x374151 : 0x2d3748;
        this.scene.add.rectangle(x + 60, y + 60, 118, 118, baseColor);
      }
    }
  }

  createTitle() {
    this.scene.add.rectangle(4500, 100, 800, 80, 0x0f3460);
    this.scene.add
      .text(4500, 100, "BẢO TÀNG KHOA HỌC CHÍNH TRỊ", {
        fontSize: "32px",
        color: "#e8e8e8",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
  }

  createWall(x: number, y: number, width: number, height: number, color: number) {
    const wall = this.scene.add.rectangle(x, y, width, height, color);
    this.scene.physics.add.existing(wall, true);
    return wall;
  }

  setupPhysicsWorld() {
    this.scene.physics.world.setBounds(0, 0, 9000, 1200);
  }

  setupCamera(player: Phaser.Physics.Arcade.Sprite) {
    this.scene.cameras.main.startFollow(player, true, 0.1, 0.1);
    this.scene.cameras.main.centerOn(player.x, player.y);
  }

  updateCameraBounds(totalWidth: number, totalHeight: number, player: Phaser.Physics.Arcade.Sprite) {
    this.scene.cameras.main.setZoom(0.9);
    this.scene.cameras.main.setBounds(0, 0, totalWidth, totalHeight);
    this.scene.cameras.main.startFollow(player, true, 1, 1);
    this.scene.cameras.main.centerOn(player.x, player.y);
  }
}
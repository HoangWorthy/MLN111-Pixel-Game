export class GraphicsCreator {
  static createInfoPointGraphic(scene: Phaser.Scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0 });

    graphics.fillStyle(0x3b82f6, 1);
    graphics.fillCircle(40, 40, 35);

    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(40, 25, 5);
    graphics.fillRect(35, 35, 10, 25);

    graphics.generateTexture("info-point", 80, 80);
    graphics.destroy();
  }

  static createQuizPointGraphic(scene: Phaser.Scene) {
    const canvas = document.createElement("canvas");
    canvas.width = 80;
    canvas.height = 80;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = "#f59e0b";
    context.beginPath();
    context.arc(40, 40, 35, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#ffffff";
    context.font = "bold 54px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("?", 40, 42);

    if (scene.textures.exists("quiz-point")) {
      scene.textures.remove("quiz-point");
    }
    scene.textures.addCanvas("quiz-point", canvas);
  }
}

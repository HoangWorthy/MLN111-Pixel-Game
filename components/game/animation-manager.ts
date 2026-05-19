export class AnimationManager {
  static createPlayerAnimations(scene: Phaser.Scene) {
    scene.anims.create({
      key: "walk-down",
      frames: scene.anims.generateFrameNumbers("player", {
        start: 18,
        end: 23,
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: "walk-left",
      frames: scene.anims.generateFrameNumbers("player", {
        start: 12,
        end: 17,
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: "walk-right",
      frames: scene.anims.generateFrameNumbers("player", {
        start: 0,
        end: 5,
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: "walk-up",
      frames: scene.anims.generateFrameNumbers("player", {
        start: 6,
        end: 11,
      }),
      frameRate: 8,
      repeat: -1,
    });

    scene.anims.create({
      key: "idle-down",
      frames: [{ key: "player", frame: 21 }],
      frameRate: 1,
    });

    scene.anims.create({
      key: "idle-left",
      frames: [{ key: "player", frame: 15 }],
      frameRate: 1,
    });

    scene.anims.create({
      key: "idle-right",
      frames: [{ key: "player", frame: 3 }],
      frameRate: 1,
    });

    scene.anims.create({
      key: "idle-up",
      frames: [{ key: "player", frame: 9 }],
      frameRate: 1,
    });
  }
}
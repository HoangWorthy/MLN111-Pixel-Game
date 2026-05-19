import { PlayerMovement } from "../player-movement";

export class RoomNavigationManager {
  private scene: Phaser.Scene;
  private playerMovement: PlayerMovement;
  private backButtons: Array<{
    bg: Phaser.GameObjects.Rectangle;
    text: Phaser.GameObjects.Text;
    room: number;
  }> = [];
  private goToRoomButtons: Array<{
    bg: Phaser.GameObjects.Rectangle;
    text: Phaser.GameObjects.Text;
    room: number;
  }> = [];

  constructor(scene: Phaser.Scene, playerMovement: PlayerMovement) {
    this.scene = scene;
    this.playerMovement = playerMovement;
  }

  refreshBackButtons() {
    // Clear existing back buttons
    if (this.backButtons) {
      this.backButtons.forEach((button) => {
        button.bg.destroy();
        button.text.destroy();
      });
      this.backButtons = [];
    }

    // Clear existing go-to-room buttons
    if (this.goToRoomButtons) {
      this.goToRoomButtons.forEach((button) => {
        button.bg.destroy();
        button.text.destroy();
      });
      this.goToRoomButtons = [];
    }

    // Recreate back buttons for unlocked rooms (in rooms 2 and 3)
    const currentUnlockedRooms = (window as any).unlockedRooms;

    // Get map dimensions from the scene
    const map = (this.scene as any).map;
    const map2 = (this.scene as any).map2;

    if (currentUnlockedRooms && currentUnlockedRooms.has(2)) {
      this.createBackToRoom1Button(map.widthInPixels + 100, 200, 2);
    }
    if (currentUnlockedRooms && currentUnlockedRooms.has(3)) {
      this.createBackToRoom1Button(
        map.widthInPixels + map2.widthInPixels + 100,
        200,
        3
      );
    }

    let buttonY = 300;
    if (currentUnlockedRooms && currentUnlockedRooms.has(2)) {
      this.createGoToRoomButton(720, buttonY, 2);
      buttonY += 70;
    }
    if (currentUnlockedRooms && currentUnlockedRooms.has(3)) {
      this.createGoToRoomButton(720, buttonY, 3);
    }
  }

  createBackToRoom1Button(x: number, y: number, fromRoom: number) {
    const buttonBg = this.scene.add.rectangle(x, y, 200, 50, 0x3366cc, 0.8);
    buttonBg.setStrokeStyle(2, 0x4488ff);
    buttonBg.setDepth(10);
    buttonBg.setInteractive({ cursor: "pointer" });

    const buttonText = this.scene.add.text(x, y, "VỀ PHÒNG 1", {
      fontSize: "16px",
      color: "#ffffff",
      fontStyle: "bold",
    });
    buttonText.setOrigin(0.5);
    buttonText.setDepth(11);

    this.backButtons.push({ bg: buttonBg, text: buttonText, room: fromRoom });

    buttonBg.on("pointerdown", () => {
      this.teleportToRoom1(fromRoom);
    });

    buttonBg.on("pointerover", () => {
      buttonBg.setFillStyle(0x4488ff, 1);
      this.scene.tweens.add({
        targets: [buttonBg, buttonText],
        scale: 1.05,
        duration: 150,
        ease: "Power1",
      });
    });

    buttonBg.on("pointerout", () => {
      buttonBg.setFillStyle(0x3366cc, 0.8);
      this.scene.tweens.add({
        targets: [buttonBg, buttonText],
        scale: 1,
        duration: 150,
        ease: "Power1",
      });
    });
  }

  createGoToRoomButton(x: number, y: number, roomNumber: number) {
    const roomNames = { 2: "PHÒNG 2", 3: "PHÒNG 3" };

    const buttonBg = this.scene.add.rectangle(x, y, 160, 50, 0x2d5a27, 0.8);
    buttonBg.setStrokeStyle(2, 0x4caf50);
    buttonBg.setDepth(10);
    buttonBg.setInteractive({ cursor: "pointer" });

    const buttonText = this.scene.add.text(
      x,
      y,
      roomNames[roomNumber as keyof typeof roomNames],
      {
        fontSize: "14px",
        color: "#ffffff",
        fontStyle: "bold",
      }
    );
    buttonText.setOrigin(0.5);
    buttonText.setDepth(11);

    this.goToRoomButtons.push({
      bg: buttonBg,
      text: buttonText,
      room: roomNumber,
    });

    buttonBg.on("pointerdown", () => {
      this.teleportToRoom(roomNumber);
    });

    buttonBg.on("pointerover", () => {
      buttonBg.setFillStyle(0x4caf50, 1);
      this.scene.tweens.add({
        targets: [buttonBg, buttonText],
        scale: 1.05,
        duration: 150,
        ease: "Power1",
      });
    });

    buttonBg.on("pointerout", () => {
      buttonBg.setFillStyle(0x2d5a27, 0.8);
      this.scene.tweens.add({
        targets: [buttonBg, buttonText],
        scale: 1,
        duration: 150,
        ease: "Power1",
      });
    });
  }

  teleportToRoom1(fromRoom: number) {
    const player = this.playerMovement.getPlayer();
    const teleportEffect = this.scene.add.circle(
      player.x,
      player.y,
      0,
      0x00aaff,
      0.6
    );
    teleportEffect.setDepth(15);

    this.scene.tweens.add({
      targets: teleportEffect,
      radius: 100,
      alpha: 0,
      duration: 500,
      ease: "Power2",
      onComplete: () => {
        teleportEffect.destroy();
      },
    });

    this.playerMovement.teleportTo(720, 480);
    (window as any).currentRoom = 1;

    // Get map dimensions
    const map = (this.scene as any).map;
    const map2 = (this.scene as any).map2;
    const map3 = (this.scene as any).map3;

    // Calculate total world bounds
    const totalWidth =
      map.widthInPixels + map2.widthInPixels + map3.widthInPixels;
    const totalHeight = Math.max(
      map.heightInPixels,
      map2.heightInPixels,
      map3.heightInPixels
    );

    // Update camera bounds to entire world first
    this.scene.cameras.main.setBounds(0, 0, totalWidth, totalHeight);

    // Get player and force camera follow
    const p = this.playerMovement.getPlayer();
    this.scene.cameras.main.stopFollow();
    this.scene.cameras.main.startFollow(p, true, 0.1, 0.1);

    // Center camera immediately on player
    this.scene.cameras.main.centerOn(p.x, p.y);

    // Small delay to ensure smooth transition
    this.scene.time.delayedCall(50, () => {
      this.scene.cameras.main.centerOn(p.x, p.y);
    });
  }

  teleportToRoom(roomNumber: number) {
    const player = this.playerMovement.getPlayer();
    let targetX: number;

    const map = (this.scene as any).map;
    const map2 = (this.scene as any).map2;
    const map3 = (this.scene as any).map3;

    switch (roomNumber) {
      case 2:
        targetX = map.widthInPixels + 720;
        break;
      case 3:
        targetX = map.widthInPixels + map2.widthInPixels + 720;
        break;
      default:
        return;
    }

    const teleportEffect = this.scene.add.circle(
      player.x,
      player.y,
      0,
      0x00aaff,
      0.6
    );
    teleportEffect.setDepth(15);

    this.scene.tweens.add({
      targets: teleportEffect,
      radius: 100,
      alpha: 0,
      duration: 500,
      ease: "Power2",
      onComplete: () => {
        teleportEffect.destroy();
      },
    });

    this.playerMovement.teleportTo(targetX, 480);
    (window as any).currentRoom = roomNumber;

    // Calculate total world bounds
    const totalWidth =
      map.widthInPixels + map2.widthInPixels + map3.widthInPixels;
    const totalHeight = Math.max(
      map.heightInPixels,
      map2.heightInPixels,
      map3.heightInPixels
    );

    // Update camera bounds to entire world
    this.scene.cameras.main.setBounds(0, 0, totalWidth, totalHeight);

    // Get player and force camera follow
    const p = this.playerMovement.getPlayer();
    this.scene.cameras.main.stopFollow();
    this.scene.cameras.main.startFollow(p, true, 0.1, 0.1);

    // Center camera immediately on player
    this.scene.cameras.main.centerOn(p.x, p.y);

    // Small delay to ensure smooth transition
    this.scene.time.delayedCall(50, () => {
      this.scene.cameras.main.centerOn(p.x, p.y);
    });
  }

  getBackButtons() {
    return this.backButtons;
  }

  getGoToRoomButtons() {
    return this.goToRoomButtons;
  }
}

import { Player } from "@/types/api";

export class OtherPlayersManager {
  private scene: Phaser.Scene;
  private otherPlayerSprites: Map<string, Phaser.GameObjects.Sprite> =
    new Map();
  private username: string;
  private fallbackModel: Phaser.GameObjects.Rectangle | null = null;

  constructor(scene: Phaser.Scene, username: string) {
    this.scene = scene;
    this.username = username;
    this.initializeFallbackModel();
  }

  private initializeFallbackModel() {
    this.fallbackModel = this.scene.add.rectangle(0, 0, 32, 48, 0x4a90e2);
    this.fallbackModel.setVisible(false);
    this.fallbackModel.setDepth(10);
  }

  private createPlayerInstance(x: number, y: number, playerId: string): Phaser.GameObjects.Sprite | null {
    let sprite: Phaser.GameObjects.Sprite;
    
    try {
      if (
        this.scene.textures.exists("player") &&
        this.scene.textures.get("player").source.length > 0
      ) {
        sprite = this.scene.add.sprite(x, y, "player");
        sprite.setScale(2);
        sprite.setDepth(10);
        sprite.setVisible(true);

        if (this.scene.anims.exists("idle-down")) {
          sprite.anims.play("idle-down");
        } else {
          sprite.setFrame(21);
        }
      } else {
        if (!this.fallbackModel) {
          this.initializeFallbackModel();
        }
        sprite = this.scene.add.sprite(x, y, "");
        sprite.setDisplaySize(32, 48);
        sprite.setTint(0x4a90e2);
        sprite.setDepth(10);
        sprite.setVisible(true);
        (sprite as any).isFallback = true;
      }

      const nameText = this.scene.add.text(x, y + 45, playerId, {
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 6, y: 3 },
      });
      nameText.setOrigin(0.5);
      nameText.setDepth(100);
      
      (sprite as any).nameText = nameText;
      (sprite as any).lastX = x;
      (sprite as any).lastY = y;
      (sprite as any).lastDirection = "down";
      (sprite as any).isMoving = false;
      (sprite as any).playerId = playerId;

      return sprite;
    } catch (error) {
      console.warn(`Failed to create sprite for player ${playerId}:`, error);
      
      try {
        if (!this.fallbackModel) {
          this.initializeFallbackModel();
        }
        sprite = this.scene.add.rectangle(x, y, 32, 48, 0x4a90e2) as any;
        sprite.setDepth(10);
        sprite.setVisible(true);
        (sprite as any).isFallback = true;
        (sprite as any).playerId = playerId;
        return sprite as any;
      } catch (fallbackError) {
        console.error(`Complete failure to create sprite for player ${playerId}:`, fallbackError);
        return null;
      }
    }
  }

  private removePlayerInstance(playerId: string) {
    const sprite = this.otherPlayerSprites.get(playerId);
    if (sprite) {
      this.scene.tweens.killTweensOf(sprite);
      if ((sprite as any).nameText) {
        this.scene.tweens.killTweensOf((sprite as any).nameText);
        (sprite as any).nameText.destroy();
      }
      sprite.destroy();
      this.otherPlayerSprites.delete(playerId);
    }
  }

  updateOtherPlayers(players: Map<string, Player>) {
    players.forEach((player, playerId) => {
      if (player.username === this.username) return;

      let sprite = this.otherPlayerSprites.get(playerId);

      if (!sprite) {
        const newSprite = this.createPlayerInstance(player.x, player.y, player.username);
        if (!newSprite) return;
        sprite = newSprite;
        
        this.otherPlayerSprites.set(playerId, sprite);
      } else {
        const isFallback = (sprite as any).isFallback;
        const isCorrupted = !isFallback && (
          !sprite.texture || 
          sprite.texture.key === "__MISSING" || 
          sprite.texture.key === "__DEFAULT" || 
          !sprite.visible
        );
        
        if (isCorrupted) {
          console.log(`Recreating corrupted sprite for player ${playerId}`);
          this.removePlayerInstance(playerId);
          return;
        }

        const lastX = (sprite as any).lastX || sprite.x;
        const lastY = (sprite as any).lastY || sprite.y;

        const deltaX = player.x - lastX;
        const deltaY = player.y - lastY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const threshold = 10;

        if (distance > threshold) {
          let animKey = "walk-down";
          let direction = (sprite as any).lastDirection || "down";

          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            direction = deltaX > 0 ? "right" : "left";
          } else {
            direction = deltaY > 0 ? "down" : "up";
          }

          animKey = `walk-${direction}`;

          if (
            (sprite as any).lastDirection !== direction ||
            !(sprite as any).isMoving
          ) {
            (sprite as any).lastDirection = direction;
            (sprite as any).isMoving = true;

            if (!(sprite as any).isFallback && this.scene.anims.exists(animKey)) {
              sprite.anims.play(animKey, true);
            }
          }
        } else {
          if ((sprite as any).isMoving) {
            const direction = (sprite as any).lastDirection || "down";
            const idleKey = `idle-${direction}`;
            (sprite as any).isMoving = false;

            if (!(sprite as any).isFallback && this.scene.anims.exists(idleKey)) {
              sprite.anims.play(idleKey, true);
            }
          }
        }

        const activeSprite = sprite;
        const nameText = (activeSprite as any).nameText as
          | Phaser.GameObjects.Text
          | undefined;

        this.scene.tweens.killTweensOf(activeSprite);

        if (distance > 400) {
          activeSprite.setPosition(player.x, player.y);
          if (nameText) {
            nameText.setPosition(player.x, player.y + 45);
          }
        } else {
          this.scene.tweens.add({
            targets: activeSprite,
            x: player.x,
            y: player.y,
            duration: 90,
            ease: "Linear",
            onUpdate: () => {
              if (nameText) {
                nameText.setPosition(activeSprite.x, activeSprite.y + 45);
              }
            },
            onComplete: () => {
              if (nameText) {
                nameText.setPosition(player.x, player.y + 45);
              }
            },
          });
        }

        (sprite as any).lastX = player.x;
        (sprite as any).lastY = player.y;
      }
    });

    this.otherPlayerSprites.forEach((sprite, playerId) => {
      if (!players.has(playerId)) {
        this.removePlayerInstance(playerId);
      }
    });
  }

  cleanupCorruptedSprites() {
    this.otherPlayerSprites.forEach((sprite, playerId) => {
      const isFallback = (sprite as any).isFallback;
      const isCorrupted = !isFallback && (
        !sprite.texture ||
        sprite.texture.key === "__MISSING" ||
        sprite.texture.key === "__DEFAULT" ||
        !sprite.visible ||
        sprite.width <= 0 ||
        sprite.height <= 0
      );
      
      if (isCorrupted) {
        console.log(`Recreating corrupted sprite for player ${playerId}`);
        this.removePlayerInstance(playerId);
      }
    });
  }

  removePlayer(playerId: string) {
    this.removePlayerInstance(playerId);
  }

  getSprites() {
    return this.otherPlayerSprites;
  }
}

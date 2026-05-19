import type { ExhibitData } from "@/types/museum";

export class PhaserGameConfig {
  static createConfig(gameRef: React.RefObject<HTMLDivElement>, MainScene: any): Phaser.Types.Core.GameConfig {
    return {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: window.innerWidth,
      height: window.innerHeight - 100,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: MainScene,
      backgroundColor: "#1a1a2e",
    };
  }
}

export interface GameSceneCallbacks {
  onExhibitInteract: (exhibit: ExhibitData) => void;
  onDoorInteract: (roomNumber: number) => void;
  showPictureModal: (imagePath: string, caption: string) => void;
  playerPositionRef: React.MutableRefObject<{ x: number; y: number }>;
}
"use client";

import { useEffect, useRef, useState } from "react";
const PhaserLib = typeof window !== "undefined" ? require("phaser") : null;
type Phaser = typeof import("phaser");
import type { ExhibitData } from "@/types/museum";
import PictureModal from "@/components/picture-modal";
import { PlayerMovement } from "@/components/player-movement";
import { ChatBox } from "@/components/chat-box";
import { LeaderboardModal } from "@/components/leaderboard-modal";
import { gameClient } from "@/lib/game-client";
import { Player, ChatMessage, GameOverData, GameResetData } from "@/types/api";
import { GraphicsCreator } from "@/components/game/graphics-creator";
import { AnimationManager } from "@/components/game/animation-manager";
import { RoomManager } from "@/components/game/room-manager";
import { OtherPlayersManager } from "@/components/game/other-players-manager";
import { PopupManager } from "@/components/game/popup-manager";
import { SceneSetupManager } from "@/components/game/scene-setup-manager";
import { RoomNavigationManager } from "@/components/game/room-navigation-manager";
import {
  MapManager,
  USE_VIETNAM_MAP,
  type VietnamInteractiveMarker,
} from "@/components/game/map-manager";
import { InteractiveElementsManager } from "@/components/game/interactive-elements-manager";
import { InputManager } from "@/components/game/input-manager";
import { Crosshair, ZoomOut } from "lucide-react";

interface MuseumSceneProps {
  onExhibitInteract: (exhibit: ExhibitData) => void;
  onDoorInteract: (roomNumber: number) => void;
  visitedExhibits: Set<string>;
  unlockedRooms: Set<number>;
  username: string;
}

export default function MuseumScene({
  onExhibitInteract,
  onDoorInteract,
  visitedExhibits,
  unlockedRooms,
  username,
}: MuseumSceneProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<any>(null);
  const [pictureModalOpen, setPictureModalOpen] = useState(false);
  const [currentPicture, setCurrentPicture] = useState<string>("");
  const [currentCaption, setCurrentCaption] = useState<string>("");
  const playerPositionRef = useRef<{ x: number; y: number }>({
    x: 10 * 48 + 24,
    y: 20 * 48 + 24,
  });
  const [isConnected, setIsConnected] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [otherPlayers, setOtherPlayers] = useState<Map<string, Player>>(
    new Map()
  );
  const otherPlayersRef = useRef<Map<string, Player>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isMapOverview, setIsMapOverview] = useState(false);
  const gameOverRef = useRef(false);
  const gameOverDataRef = useRef<GameOverData | null>(null);

  useEffect(() => {
    const renderOtherPlayers = (playersMap: Map<string, Player>) => {
      const scene = phaserGameRef.current?.scene.getScene("MainScene") as any;
      if (scene && scene.updateOtherPlayers) {
        scene.updateOtherPlayers(playersMap);
      }
    };

    const applyOtherPlayers = (playersMap: Map<string, Player>) => {
      const nextPlayers = new Map(playersMap);
      otherPlayersRef.current = nextPlayers;
      setOtherPlayers(nextPlayers);
      renderOtherPlayers(nextPlayers);
    };

    const handleGameOver = (data: GameOverData) => {
      gameOverRef.current = true;
      gameOverDataRef.current = data;

      const scene = phaserGameRef.current?.scene.getScene(
        "MainScene"
      ) as any;
      if (scene && scene.showGameOver) {
        scene.showGameOver(data);
      }
    };

    const handleGameReset = (_data: GameResetData) => {
      gameOverRef.current = false;
      gameOverDataRef.current = null;
      window.location.reload();
    };

    const connectToServer = async () => {
      try {
        applyOtherPlayers(new Map());

        await gameClient.connect();
        setIsConnected(true);
        gameClient.onGameOver(handleGameOver);
        gameClient.onGameReset(handleGameReset);

        const joinResult = await gameClient.joinGame(username);
        setCurrentPlayer(joinResult.player);
        (window as any).currentPlayer = joinResult.player;
        playerPositionRef.current = {
          x: joinResult.player.x,
          y: joinResult.player.y,
        };

        const existingPlayersMap = new Map<string, Player>();
        joinResult.existingPlayers.forEach((existingPlayer) => {
          existingPlayersMap.set(existingPlayer.id, existingPlayer);
        });
        applyOtherPlayers(existingPlayersMap);

        const scene = phaserGameRef.current?.scene.getScene(
          "MainScene"
        ) as any;
        if (scene && scene.setLocalPlayerPosition) {
          scene.setLocalPlayerPosition(joinResult.player.x, joinResult.player.y);
        }

        gameClient.onPlayerJoined((newPlayer) => {
          const nextPlayers = new Map(otherPlayersRef.current);
          nextPlayers.set(newPlayer.id, newPlayer);
          applyOtherPlayers(nextPlayers);
        });

        gameClient.onPlayerMoved((movedPlayer) => {
          const nextPlayers = new Map(otherPlayersRef.current);
          nextPlayers.set(movedPlayer.id, movedPlayer);
          applyOtherPlayers(nextPlayers);
        });

        gameClient.onPlayerDisconnected((playerId) => {
          const nextPlayers = new Map(otherPlayersRef.current);
          nextPlayers.delete(playerId);
          applyOtherPlayers(nextPlayers);

          if (phaserGameRef.current) {
            const scene = phaserGameRef.current.scene.getScene(
              "MainScene"
            ) as any;
            if (scene && scene.removePlayer) {
              scene.removePlayer(playerId);
            }
          }
        });

        gameClient.onChatMessage((message) => {
          setChatMessages((prev) => [...prev, message]);
          const chatBox = (window as any).chatBoxInstance;
          if (chatBox && chatBox.addServerMessage) {
            chatBox.addServerMessage(message);
          }
        });

        gameClient.onError((error) => {
          console.error("Game client error:", error);
          if (error.includes("đã tồn tại")) {
            alert("Tên người dùng đã tồn tại. Vui lòng chọn tên khác.");
            window.location.reload();
          }
        });

        gameClient.onGameCompleted((data) => {
          const scene = phaserGameRef.current?.scene.getScene(
            "MainScene"
          ) as any;
          if (scene && scene.showCompletionMessage) {
            scene.showCompletionMessage(data.rank, data.time);
          }
        });

        gameClient.onLeaderboardUpdated((data) => {
          const scene = phaserGameRef.current?.scene.getScene(
            "MainScene"
          ) as any;
          if (scene && scene.updateLeaderboard) {
            scene.updateLeaderboard(data.leaderboard);
          }
        });
      } catch (error) {
        console.error("Connection error:", error);
        if (error instanceof Error && error.message.includes("đã tồn tại")) {
          alert("Tên người dùng đã tồn tại. Vui lòng chọn tên khác.");
          window.location.reload();
        }
      }
    };

    connectToServer();

    const handlePlayerMove = (event: CustomEvent) => {
      if (gameOverRef.current) return;

      const { x, y } = event.detail;
      try {
        gameClient.movePlayer(x, y);
      } catch (error) {
        console.error("Error moving player:", error);
      }
    };

    window.addEventListener("playerMove", handlePlayerMove as EventListener);

    const handleToggleLeaderboard = () => {
      setShowLeaderboard((prev) => !prev);
    };

    window.addEventListener("toggleLeaderboard", handleToggleLeaderboard);

    const handleQuizComplete = () => {
      if (gameClient.isConnected()) {
        gameClient.finishGame();
      }
    };

    window.addEventListener(
      "quizCompleted",
      handleQuizComplete as EventListener
    );

    return () => {
      gameClient.disconnect();
      window.removeEventListener(
        "playerMove",
        handlePlayerMove as EventListener
      );
      window.removeEventListener("toggleLeaderboard", handleToggleLeaderboard);
      window.removeEventListener(
        "quizCompleted",
        handleQuizComplete as EventListener
      );
    };
  }, [username]);

  useEffect(() => {
    if (!gameRef.current || phaserGameRef.current || !PhaserLib) return;

    (window as any).setOtherPlayersFromScene = (
      playersMap: Map<string, Player>
    ) => {
      const nextPlayers = new Map(playersMap);
      otherPlayersRef.current = nextPlayers;
      setOtherPlayers(nextPlayers);
    };

    const Phaser = PhaserLib as unknown as Phaser;

    class MainScene extends Phaser.Scene {
      private playerMovement!: PlayerMovement;
      private nearExhibit: ExhibitData | null = null;
      private nearLockedDoor: number | null = null;
      private nearPicture: {
        id: number;
        imagePath: string;
        caption: string;
      } | null = null;
      private nearInfoPoint: ExhibitData | null = null;
      private nearVietnamMapMarker: VietnamInteractiveMarker | null = null;
      private interactKey!: Phaser.Input.Keyboard.Key;
      private finishKey!: Phaser.Input.Keyboard.Key;
      private tabKey!: Phaser.Input.Keyboard.Key;
      private promptText!: Phaser.GameObjects.Text;
      private chatBox!: ChatBox;
      private nearQuizPoint: boolean = false;
      private quizCompleted: boolean = false;
      private currentRoom: number = 1;
      private roomTriggers: { [key: number]: Phaser.Geom.Rectangle } = {};
      private lockedDoors: {
        collision: Phaser.GameObjects.Rectangle;
        roomNumber: number;
      }[] = [];
      private roomBorders: {
        room2Border: Phaser.GameObjects.Rectangle;
        room3Border: Phaser.GameObjects.Rectangle;
      } | null = null;
      private finishLine: {
        collision: Phaser.GameObjects.Rectangle;
        area: Phaser.GameObjects.Rectangle;
        text: Phaser.GameObjects.Text;
      } | null = null;
      private backButtons: {
        bg: Phaser.GameObjects.Rectangle;
        text: Phaser.GameObjects.Text;
        room: number;
      }[] = [];
      private goToRoomButtons: {
        bg: Phaser.GameObjects.Rectangle;
        text: Phaser.GameObjects.Text;
        room: number;
      }[] = [];
      private nearFinishLine: boolean = false;
      private completionMessage: Phaser.GameObjects.Text | null = null;
      private leaderboardDisplay: Phaser.GameObjects.Text | null = null;
      private roomsUnlockedByQuiz: Set<number> = new Set();
      private completedVietnamQuestions: Set<number> = new Set();
      private totalVietnamQuestionCount = 0;
      private gameOver = false;
      private gameOverWinnerId: string | null = null;
      private gameResetCountdownEvent: Phaser.Time.TimerEvent | null = null;
      private mapDimensions: { totalWidth: number; totalHeight: number } | null =
        null;
      private isMapOverview = false;
      private readonly defaultCameraZoom = 0.9;

      private topBorder!: Phaser.GameObjects.Rectangle;
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

      private infoPoints: {
        exhibit: ExhibitData;
        sprite: Phaser.GameObjects.Sprite;
      }[] = [];
      private quizPoint: {
        collision: Phaser.GameObjects.Rectangle;
        sprite: Phaser.GameObjects.Sprite;
      } | null = null;
      private pictures: {
        collision: Phaser.GameObjects.Rectangle;
        id: number;
        imagePath: string;
        caption: string;
      }[] = [];
      private vietnamMapMarkers: {
        marker: VietnamInteractiveMarker;
        sprite: Phaser.GameObjects.Sprite;
      }[] = [];

      private roomManager!: RoomManager;
      private otherPlayersManager!: OtherPlayersManager;
      private popupManager!: PopupManager;
      private sceneSetupManager!: SceneSetupManager;
      private mapManager!: MapManager;
      private interactiveElementsManager!: InteractiveElementsManager;
      private inputManager!: InputManager;
      private roomNavigationManager!: RoomNavigationManager;

      private currentPopup: {
        overlay?: Phaser.GameObjects.Rectangle;
        bg?: Phaser.GameObjects.Rectangle;
        text?: Phaser.GameObjects.Text;
        button?: Phaser.GameObjects.Rectangle;
        buttonText?: Phaser.GameObjects.Text;
      } | null = null;

      constructor() {
        super({ key: "MainScene" });
      }

      preload() {
        this.load.spritesheet("player", "/sprites/Adam_run.png", {
          frameWidth: 16,
          frameHeight: 32,
        });

        this.load.image("VietNamMap", "/tiles/VietNamMap.png");
        this.load.json("VietNamMapData", "/tiles/VietNamMap.json");
        this.load.text("VietNamTileset", "/tiles/VietNam.tsx");

        GraphicsCreator.createInfoPointGraphic(this);
        GraphicsCreator.createQuizPointGraphic(this);
      }

      create() {
        this.roomManager = new RoomManager(this, unlockedRooms);
        this.otherPlayersManager = new OtherPlayersManager(this, username);
        this.popupManager = new PopupManager(this);
        this.sceneSetupManager = new SceneSetupManager(this);
        this.mapManager = new MapManager(this);
        this.interactiveElementsManager = new InteractiveElementsManager(this);
        this.inputManager = new InputManager(this);

        this.sceneSetupManager.setupPhysicsWorld();

        AnimationManager.createPlayerAnimations(this);

        this.playerMovement = new PlayerMovement(this, username);
        this.roomNavigationManager = new RoomNavigationManager(
          this,
          this.playerMovement
        );

        const startX = playerPositionRef.current?.x || 400;
        const startY = playerPositionRef.current?.y || 400;

        const player = this.playerMovement.createPlayer(startX, startY);

        this.sceneSetupManager.setupCamera(player);

        this.updateOtherPlayers(otherPlayersRef.current);

        const { totalWidth, totalHeight } = this.mapManager.createAllMaps();
        this.mapDimensions = { totalWidth, totalHeight };

        this.map = this.mapManager.map;
        this.layer1 = this.mapManager.layer1;
        this.layer2 = this.mapManager.layer2;
        this.layer3 = this.mapManager.layer3;

        this.physics.world.setBounds(0, 0, totalWidth, totalHeight);

        if (this.mapManager.vietnamCollisionGroup) {
          this.physics.add.collider(player, this.mapManager.vietnamCollisionGroup);
        }

        const gamePlayer = this.playerMovement.getPlayer();
        if (gamePlayer) {
          this.sceneSetupManager.updateCameraBounds(
            totalWidth,
            totalHeight,
            gamePlayer
          );
        }

        // Legacy multi-map layout removed. Using single VietNam map only.

        if (USE_VIETNAM_MAP) {
          this.interactiveElementsManager.createVietnamTileMarkers(
            this.mapManager,
            (marker) => this.showVietnamMapMarker(marker)
          );
        }
        // Legacy non-Vietnam interactive elements removed.

        this.infoPoints = this.interactiveElementsManager.infoPoints;
        this.quizPoint = this.interactiveElementsManager.quizPoint;
        this.pictures = this.interactiveElementsManager.pictures;
        this.vietnamMapMarkers =
          this.interactiveElementsManager.vietnamMapMarkers;
        this.totalVietnamQuestionCount = new Set(
          this.vietnamMapMarkers
            .filter((item) => item.marker.kind === "question")
            .map((item) => item.marker.index)
        ).size;

        if (this.roomBorders && this.roomBorders.room2Border) {
          this.physics.add.collider(player, this.roomBorders.room2Border);
        }
        if (this.roomBorders && this.roomBorders.room3Border) {
          this.physics.add.collider(player, this.roomBorders.room3Border);
        }

        this.roomTriggers = this.roomManager.createRoomTriggers();

        this.interactKey = this.input.keyboard!.addKey(
          Phaser.Input.Keyboard.KeyCodes.E
        );

        this.finishKey = this.input.keyboard!.addKey(
          Phaser.Input.Keyboard.KeyCodes.F
        );

        this.finishKey.on("down", () => {
          if (this.gameOver) return;

          if (this.nearFinishLine) {
            this.popupManager.showFinalCompletionPopup();
          }
        });

        this.promptText = this.add
          .text(0, 0, "Nhấn E để xem nội dung", {
            fontSize: "18px",
            color: "#ffffff",
            backgroundColor: "#000000",
            padding: { x: 12, y: 6 },
          })
          .setOrigin(0.5)
          .setVisible(false)
          .setScrollFactor(0)
          .setDepth(100);

        this.createChat();

        this.interactKey.on("down", () => {
          if (this.gameOver) return;

          if (this.nearQuizPoint && !this.quizCompleted) {
            window.dispatchEvent(new Event("quizPointInteract"));
          } else if (this.nearVietnamMapMarker !== null) {
            this.showVietnamMapMarker(this.nearVietnamMapMarker);
          } else if (this.nearInfoPoint !== null) {
            (window as any).handleExhibitInteract?.(this.nearInfoPoint);
          } else if (this.nearPicture !== null) {
            this.showPictureModal(
              this.nearPicture.imagePath,
              this.nearPicture.caption
            );
          } else if (this.nearLockedDoor !== null) {
            (window as any).handleDoorInteract?.(this.nearLockedDoor);
          }
        });

        this.tabKey = this.input.keyboard!.addKey(
          Phaser.Input.Keyboard.KeyCodes.TAB
        );

        this.tabKey.on("down", () => {
          const currentPlayer = (window as any).currentPlayer;
          if (currentPlayer && currentPlayer.username === "admin1234509876") {
            window.dispatchEvent(new Event("toggleLeaderboard"));
          }
        });

        if (this.roomBorders) {
          if (
            this.roomBorders.room2Border &&
            this.roomBorders.room2Border.body
          ) {
            this.physics.add.collider(player, this.roomBorders.room2Border);
          }
          if (
            this.roomBorders.room3Border &&
            this.roomBorders.room3Border.body
          ) {
            this.physics.add.collider(player, this.roomBorders.room3Border);
          }
        }

        if (!USE_VIETNAM_MAP) {
          this.physics.add.collider(player, this.topBorder);
        }
      }

      createColumn(x: number, y: number, roomNumber: number, title: string) {
        const pillar = this.add.rectangle(x, y, 60, 60, 0x8b7355);
        this.add.rectangle(x, y, 50, 50, 0xa67c52);
        this.add.rectangle(x, y, 40, 40, 0xd4af37);
        pillar.setDepth(3);

        const columnCollision = this.add.rectangle(x, y, 60, 60, 0xff0000, 0);
        this.physics.add.existing(columnCollision, true);

        this.add
          .text(x, y + 50, title, {
            fontSize: "10px",
            color: "#fbbf24",
            fontStyle: "bold",
            align: "center",
          })
          .setOrigin(0.5)
          .setDepth(4);
      }

      showPictureModal(imagePath: string, caption: string) {
        this.scene.pause();

        (window as any).showPictureModal?.(imagePath, caption);
      }

      showVietnamMapMarker(marker: VietnamInteractiveMarker) {
        if (this.gameOver) return;

        if (marker.kind === "hint") {
          this.popupManager.showGamePopup(
            `Gợi ý ${marker.index + 1}`,
            marker.hintText || "Chưa có nội dung gợi ý.",
            "Đóng"
          );
          return;
        }

        if (this.completedVietnamQuestions.has(marker.index)) {
          this.popupManager.showGamePopup(
            `Câu hỏi ${marker.index + 1} đã hoàn thành`,
            "Bạn đã trả lời đúng câu hỏi này.",
            "Đóng"
          );
          return;
        }

        this.popupManager.showQuestionPopup(
          `Câu hỏi ${marker.index + 1}: ${marker.title}`,
          marker.questionText,
          marker.options,
          (selectedAnswerIndex) => {
            const correctAnswerIndex = this.getCorrectAnswerIndex(marker);
            const isCorrect = selectedAnswerIndex === correctAnswerIndex;

            if (isCorrect) {
              this.completedVietnamQuestions.add(marker.index);
              this.markVietnamQuestionCompleted(marker.index);

              if (this.hasCompletedAllVietnamQuestions()) {
                this.finishVietnamQuizRun();
                return;
              }
            }

            this.popupManager.showGamePopup(
              isCorrect ? "Trả lời đúng" : "Trả lời sai",
              isCorrect
                ? "Câu hỏi này đã được hoàn thành."
                : "Chưa đúng. Hãy tìm hint liên quan trên bản đồ rồi thử lại.",
              "Đóng"
            );
          }
        );
      }

      hasCompletedAllVietnamQuestions() {
        return (
          this.totalVietnamQuestionCount > 0 &&
          this.completedVietnamQuestions.size >= this.totalVietnamQuestionCount
        );
      }

      finishVietnamQuizRun() {
        this.gameOver = true;
        this.playerMovement?.setMovementEnabled(false);
        this.promptText?.setVisible(false);

        this.popupManager.showGamePopup(
          `Hoàn thành ${this.totalVietnamQuestionCount} câu hỏi`,
          "Đang xác nhận người chiến thắng và dừng tất cả phiên chơi...",
          "OK"
        );

        window.dispatchEvent(new Event("quizCompleted"));
      }

      getCorrectAnswerIndex(
        marker: Extract<VietnamInteractiveMarker, { kind: "question" }>
      ) {
        if (marker.correctAnswerIndex >= 0) {
          return marker.correctAnswerIndex;
        }

        return ["A", "B", "C", "D"].indexOf(marker.correctAnswer);
      }

      getCorrectAnswerText(
        marker: Extract<VietnamInteractiveMarker, { kind: "question" }>
      ) {
        const correctAnswerIndex = this.getCorrectAnswerIndex(marker);
        const optionLabels = ["A", "B", "C", "D"];
        const correctOption = marker.options[correctAnswerIndex] ?? "";

        return `${
          optionLabels[correctAnswerIndex] ?? marker.correctAnswer
        }. ${correctOption}`;
      }

      markVietnamQuestionCompleted(questionIndex: number) {
        const markerView = this.vietnamMapMarkers.find(
          (item) =>
            item.marker.kind === "question" &&
            item.marker.index === questionIndex
        );

        if (!markerView) return;

        markerView.sprite.setTint(0x22c55e);
        markerView.sprite.setAlpha(0.75);
      }

      refreshBackButtons() {
        this.roomNavigationManager.refreshBackButtons();
        this.backButtons = this.roomNavigationManager.getBackButtons();
        this.goToRoomButtons = this.roomNavigationManager.getGoToRoomButtons();
      }

      unlockRoom(roomNumber: number) {
        // Check if room is already unlocked to prevent duplicate teleporting
        if (this.roomsUnlockedByQuiz.has(roomNumber)) {
          console.log(`Room ${roomNumber} already unlocked, skipping teleport`);
          return;
        }

        this.roomsUnlockedByQuiz.add(roomNumber);

        const teleportPositions = {
          2: { x: this.map.widthInPixels + 100, y: 480 }, // Room 2 entrance
          3: {
            x: this.map.widthInPixels + this.map2.widthInPixels + 100,
            y: 480,
          },
        };

        if (roomNumber === 2) {
          const targetPos = teleportPositions[2];
          const player = this.playerMovement.getPlayer();

          const teleportEffect = this.add.circle(
            player.x,
            player.y,
            50,
            0x00ff00,
            0.8
          );
          teleportEffect.setDepth(200);

          // Animate teleport effect
          this.tweens.add({
            targets: teleportEffect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => {
              teleportEffect.destroy();
            },
          });

          this.playerMovement.teleportTo(targetPos.x, targetPos.y);

          const playerPositionRef = (window as any).playerPositionRef;
          if (playerPositionRef) {
            playerPositionRef.current = {
              x: targetPos.x,
              y: targetPos.y,
            };
          }
        } else if (roomNumber === 3) {
          const targetPos = teleportPositions[3];
          const player = this.playerMovement.getPlayer();

          const teleportEffect = this.add.circle(
            player.x,
            player.y,
            50,
            0x0099ff,
            0.8
          );
          teleportEffect.setDepth(200);

          // Animate teleport effect
          this.tweens.add({
            targets: teleportEffect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => {
              teleportEffect.destroy();
            },
          });

          // Teleport player
          this.playerMovement.teleportTo(targetPos.x, targetPos.y);

          // Update player position ref for persistence
          const playerPositionRef = (window as any).playerPositionRef;
          if (playerPositionRef) {
            playerPositionRef.current = {
              x: targetPos.x,
              y: targetPos.y,
            };
          }

          // Send position to server
          if ((window as any).gameClient && (window as any).currentPlayer) {
            (window as any).gameClient.movePlayer(targetPos.x, targetPos.y);
          }
        }

        // Refresh back buttons after unlocking a room
        this.refreshBackButtons();
      }

      createPillar(x: number, y: number) {
        const pillar = this.add.rectangle(x, y, 40, 40, 0x8b7355);
        this.add.rectangle(x, y, 35, 35, 0xa67c52);
        pillar.setDepth(2);

        const pillarCollision = this.add.rectangle(x, y, 40, 40, 0xff0000, 0);
        this.physics.add.existing(pillarCollision, true);
        // this.walls.push(pillarCollision); // Managed by mapDisplay now

        return pillar;
      }

      setLocalPlayerPosition(x: number, y: number) {
        if (!this.playerMovement) return;

        this.playerMovement.teleportTo(x, y);
        playerPositionRef.current = { x, y };
      }

      toggleMapOverview() {
        if (this.isMapOverview) {
          return this.restorePlayerCamera();
        }

        return this.showWholeMap();
      }

      private showWholeMap() {
        if (!this.mapDimensions) return false;

        const { totalWidth, totalHeight } = this.mapDimensions;
        const camera = this.cameras.main;
        const overviewZoom =
          Math.min(camera.width / totalWidth, camera.height / totalHeight) *
          0.96;

        camera.stopFollow();
        camera.removeBounds();
        camera.setZoom(
          Math.min(this.defaultCameraZoom, Math.max(0.01, overviewZoom))
        );
        camera.centerOn(totalWidth / 2, totalHeight / 2);
        this.isMapOverview = true;

        return true;
      }

      private restorePlayerCamera() {
        const camera = this.cameras.main;
        const player = this.playerMovement?.getPlayer();

        if (this.mapDimensions) {
          camera.setBounds(
            0,
            0,
            this.mapDimensions.totalWidth,
            this.mapDimensions.totalHeight
          );
        }

        camera.setZoom(this.defaultCameraZoom);

        if (player) {
          camera.startFollow(player, true, 1, 1);
          camera.centerOn(player.x, player.y);
        }

        this.isMapOverview = false;

        return false;
      }

      update() {
        if (!this.playerMovement) return;

        this.playerMovement.update();
        const player = this.playerMovement.getPlayer();

        if (player && this.cameras.main && !this.isMapOverview) {
          this.cameras.main.centerOn(player.x, player.y);
        }

        if (this.gameOver) {
          this.promptText?.setVisible(false);
          return;
        }

        if (this.otherPlayersManager && this.time.now % 5000 < 16) {
          this.otherPlayersManager.cleanupCorruptedSprites();
        }

        this.nearLockedDoor = null;
        if (this.roomBorders) {
          const door2X = this.map.widthInPixels;
          const door2Y = this.map.heightInPixels / 2;
          const distanceToDoor2 = Phaser.Math.Distance.Between(
            player.x,
            player.y,
            door2X,
            door2Y
          );

          const door3X = this.map.widthInPixels + this.map2.widthInPixels;
          const door3Y = this.map2.heightInPixels / 2;
          const distanceToDoor3 = Phaser.Math.Distance.Between(
            player.x,
            player.y,
            door3X,
            door3Y
          );

          if (distanceToDoor2 < 100) {
            this.nearLockedDoor = 2;
          } else if (distanceToDoor3 < 100) {
            this.nearLockedDoor = 3;
          }
        }

        this.nearQuizPoint = false;
        if (this.quizPoint && !this.quizCompleted) {
          const distance = Phaser.Math.Distance.Between(
            player.x,
            player.y,
            this.quizPoint.collision.x,
            this.quizPoint.collision.y
          );
          if (distance < 90) {
            this.nearQuizPoint = true;
          }
        }

        this.nearFinishLine = false;
        if (this.finishLine) {
          const distance = Phaser.Math.Distance.Between(
            player.x,
            player.y,
            this.finishLine.collision.x,
            this.finishLine.collision.y
          );
          if (distance < 100) {
            this.nearFinishLine = true;
          }
        }

        this.nearPicture = null;
        for (const picture of this.pictures) {
          const distance = Phaser.Math.Distance.Between(
            player.x,
            player.y,
            picture.collision.x,
            picture.collision.y
          );

          if (distance < 80) {
            this.nearPicture = {
              id: picture.id,
              imagePath: picture.imagePath,
              caption: picture.caption,
            };
            break;
          }
        }

        this.nearInfoPoint = null;
        for (const infoPoint of this.infoPoints) {
          const distance = Phaser.Math.Distance.Between(
            player.x,
            player.y,
            infoPoint.sprite.x,
            infoPoint.sprite.y
          );

          if (distance < 80) {
            this.nearInfoPoint = infoPoint.exhibit;
            break;
          }
        }

        this.nearVietnamMapMarker = null;
        for (const markerView of this.vietnamMapMarkers) {
          const distance = Phaser.Math.Distance.Between(
            player.x,
            player.y,
            markerView.sprite.x,
            markerView.sprite.y
          );

          if (distance < 80) {
            this.nearVietnamMapMarker = markerView.marker;
            break;
          }
        }

        if (this.nearQuizPoint && !this.quizCompleted) {
          this.promptText.setText("Nhấn E để làm quiz tổng hợp");
          this.promptText.setVisible(true);
          this.promptText.setPosition(
            (this.sys.game.config.width as number) / 2,
            (this.sys.game.config.height as number) - 60
          );
        } else if (this.nearVietnamMapMarker !== null) {
          this.promptText.setText(
            this.nearVietnamMapMarker.kind === "question"
              ? "Nhấn E để xem câu hỏi"
              : "Nhấn E để xem gợi ý"
          );
          this.promptText.setVisible(true);
          this.promptText.setPosition(
            (this.sys.game.config.width as number) / 2,
            (this.sys.game.config.height as number) - 60
          );
        } else if (this.nearInfoPoint !== null) {
          this.promptText.setText("Nhấn E để xem thông tin");
          this.promptText.setVisible(true);
          this.promptText.setPosition(
            (this.sys.game.config.width as number) / 2,
            (this.sys.game.config.height as number) - 60
          );
        } else if (this.nearPicture !== null) {
          this.promptText.setText("Nhấn E để xem bức tranh");
          this.promptText.setVisible(true);
          this.promptText.setPosition(
            (this.sys.game.config.width as number) / 2,
            (this.sys.game.config.height as number) - 60
          );
        } else if (this.nearLockedDoor !== null) {
          this.promptText.setText(
            `Nhấn E để làm quiz mở khóa Phòng ${this.nearLockedDoor}`
          );
          this.promptText.setVisible(true);
          this.promptText.setPosition(
            (this.sys.game.config.width as number) / 2,
            (this.sys.game.config.height as number) - 60
          );
        } else if (this.nearFinishLine) {
          this.promptText.setText("Nhấn F để hoàn thành trò chơi!");
          this.promptText.setVisible(true);
          this.promptText.setPosition(
            (this.sys.game.config.width as number) / 2,
            (this.sys.game.config.height as number) - 60
          );
        } else {
          this.promptText.setVisible(false);
        }

        const playerPositionRef = (window as any).playerPositionRef;
        if (playerPositionRef) {
          playerPositionRef.current = {
            x: player.x,
            y: player.y,
          };
        }
      }

      createChat() {
        this.chatBox = new ChatBox(this, username, (enabled: boolean) => {
          if (this.gameOver) return;

          this.playerMovement.setMovementEnabled(enabled);
        });
        this.chatBox.create();
        (window as any).chatBoxInstance = this.chatBox;
      }

      updateOtherPlayers(players: Map<string, Player>) {
        if (!this.otherPlayersManager) return;
        this.otherPlayersManager.updateOtherPlayers(players);
      }

      removePlayer(playerId: string) {
        if (!this.otherPlayersManager) return;
        this.otherPlayersManager.removePlayer(playerId);
      }

      showGameOver(data: GameOverData) {
        if (this.gameOverWinnerId === data.winner.id) return;

        this.gameOver = true;
        this.gameOverWinnerId = data.winner.id;
        this.playerMovement?.setMovementEnabled(false);
        this.promptText?.setVisible(false);

        const currentPlayer = (window as any).currentPlayer as
          | Player
          | undefined;
        const isWinner = currentPlayer?.id === data.winner.id;

        this.popupManager.showGamePopup(
          "Trò chơi kết thúc",
          this.getGameOverMessage(data, isWinner),
          "OK"
        );
        this.startGameResetCountdown(data, isWinner);
      }

      private getGameOverMessage(data: GameOverData, isWinner: boolean) {
        const resultText = isWinner
          ? `Bạn là người chiến thắng!\nThời gian: ${data.time}`
          : `Người chiến thắng: ${data.winner.username}\nThời gian: ${data.time}`;
        const secondsRemaining = this.getGameResetSecondsRemaining(data);

        return `${resultText}\nTất cả phiên chơi đã dừng.\nTrò chơi sẽ tự reset sau ${secondsRemaining} giây.`;
      }

      private getGameResetSecondsRemaining(data: GameOverData) {
        const resetTime = new Date(data.resetAt).getTime();
        const fallbackSeconds = 60;

        if (!Number.isFinite(resetTime)) {
          return fallbackSeconds;
        }

        return Math.max(0, Math.ceil((resetTime - Date.now()) / 1000));
      }

      private startGameResetCountdown(data: GameOverData, isWinner: boolean) {
        this.gameResetCountdownEvent?.remove(false);
        this.gameResetCountdownEvent = this.time.addEvent({
          delay: 1000,
          loop: true,
          callback: () => {
            this.popupManager.updateCurrentPopupMessage(
              this.getGameOverMessage(data, isWinner)
            );

            if (this.getGameResetSecondsRemaining(data) <= 0) {
              this.gameResetCountdownEvent?.remove(false);
              this.gameResetCountdownEvent = null;
            }
          },
        });
      }

      showCompletionMessage(rank: number, time: string) {
        if (this.completionMessage) {
          this.completionMessage.destroy();
        }

        const medals = ["🥇", "🥈", "🥉"];
        const medal = rank <= 3 ? medals[rank - 1] : `#${rank}`;

        this.completionMessage = this.add
          .text(
            (this.sys.game.config.width as number) / 2,
            100,
            `${medal} Hoàn thành!\nThứ hạng: ${rank}\nThời gian: ${time}`,
            {
              fontSize: "24px",
              color: "#00ff00",
              fontStyle: "bold",
              align: "center",
              backgroundColor: "#000000",
              padding: { x: 15, y: 10 },
            }
          )
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(200);

        this.time.delayedCall(5000, () => {
          if (this.completionMessage) {
            this.completionMessage.destroy();
            this.completionMessage = null;
          }
        });
      }

      updateLeaderboard(leaderboard: any[]) {
        if (this.leaderboardDisplay) {
          this.leaderboardDisplay.destroy();
        }

        const top5 = leaderboard.slice(0, 5);
        let displayText = "🏆 TOP 5 LEADERBOARD 🏆\n\n";

        top5.forEach((entry, index) => {
          const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
          displayText += `${medals[index]} ${entry.username}: ${entry.completionTime}\n`;
        });

        this.leaderboardDisplay = this.add
          .text((this.sys.game.config.width as number) - 20, 20, displayText, {
            fontSize: "14px",
            color: "#ffffff",
            backgroundColor: "#000000aa",
            padding: { x: 10, y: 8 },
            align: "left",
          })
          .setOrigin(1, 0)
          .setScrollFactor(0)
          .setDepth(150);
      }

      showGamePopup(
        title: string,
        message: string,
        buttonText: string = "OK",
        onClose?: () => void
      ) {
        this.popupManager.showGamePopup(title, message, buttonText, onClose);
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
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

    const game = new Phaser.Game(config);
    phaserGameRef.current = game;
    setIsMapOverview(false);

    (window as any).handleExhibitInteract = onExhibitInteract;
    (window as any).handleDoorInteract = onDoorInteract;
    (window as any).showPictureModal = (imagePath: string, caption: string) => {
      setCurrentPicture(imagePath);
      setCurrentCaption(caption);
      setPictureModalOpen(true);
    };
    (window as any).playerPositionRef = playerPositionRef;
    (window as any).gameClient = gameClient;
    (window as any).currentPlayer = currentPlayer;
    (window as any).unlockedRooms = unlockedRooms;
    (window as any).unlockRoom = (roomNumber: number) => {
      const scene = game.scene.getScene("MainScene") as MainScene;
      if (scene && scene.unlockRoom) {
        scene.unlockRoom(roomNumber);
      }
    };

    if (!USE_VIETNAM_MAP) {
      (window as any).createFinishLine = () => {
        const scene = game.scene.getScene("MainScene") as any;
        if (scene && scene.interactiveElementsManager) {
          scene.interactiveElementsManager.createFinishLine(scene.mapManager);
          scene.finishLine = scene.interactiveElementsManager.finishLine;
        }
      };
    }

    (window as any).showGamePopup = (
      title: string,
      message: string,
      buttonText?: string,
      onClose?: () => void
    ) => {
      const scene = game.scene.getScene("MainScene") as any;
      if (scene && scene.showGamePopup) {
        scene.showGamePopup(title, message, buttonText || "OK", onClose);
      } else {
        console.warn("Scene not ready for popup:", title);
        setTimeout(() => {
          const retryScene = game.scene.getScene("MainScene") as any;
          if (retryScene && retryScene.showGamePopup) {
            retryScene.showGamePopup(
              title,
              message,
              buttonText || "OK",
              onClose
            );
          }
        }, 100);
      }
    };

    if (gameOverDataRef.current) {
      setTimeout(() => {
        const scene = game.scene.getScene("MainScene") as any;
        if (scene && scene.showGameOver && gameOverDataRef.current) {
          scene.showGameOver(gameOverDataRef.current);
        }
      }, 100);
    }

    return () => {
      game.destroy(true);
      phaserGameRef.current = null;
      (window as any).setOtherPlayersFromScene = null;
    };
  }, [
    onExhibitInteract,
    onDoorInteract,
    visitedExhibits,
    unlockedRooms,
    username,
  ]);

  useEffect(() => {
    otherPlayersRef.current = otherPlayers;

    if (phaserGameRef.current) {
      const scene = phaserGameRef.current.scene.getScene("MainScene") as any;
      if (scene && scene.updateOtherPlayers) {
        scene.updateOtherPlayers(otherPlayers);
      }
    }
  }, [otherPlayers]);

  const handlePictureModalClose = () => {
    setPictureModalOpen(false);
    if (phaserGameRef.current) {
      const scene = phaserGameRef.current.scene.getScene("MainScene");
      if (scene) {
        scene.scene.resume();
      }
    }
  };

  const handleToggleMapOverview = () => {
    const scene = phaserGameRef.current?.scene.getScene("MainScene") as
      | { toggleMapOverview?: () => boolean }
      | undefined;

    if (scene?.toggleMapOverview) {
      setIsMapOverview(scene.toggleMapOverview());
    }
  };

  return (
    <div className="relative h-full w-full">
      <div ref={gameRef} className="w-full h-full" />
      <button
        type="button"
        onClick={handleToggleMapOverview}
        aria-label={isMapOverview ? "Follow player" : "View whole map"}
        aria-pressed={isMapOverview}
        title={isMapOverview ? "Follow player" : "View whole map"}
        className="absolute left-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-md border border-white/20 bg-[#16213e]/90 text-white shadow-lg backdrop-blur transition hover:bg-[#1f2f5a] focus:outline-none focus:ring-2 focus:ring-white/70"
      >
        {isMapOverview ? (
          <Crosshair className="h-5 w-5" aria-hidden="true" />
        ) : (
          <ZoomOut className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
      <PictureModal
        isOpen={pictureModalOpen}
        onClose={handlePictureModalClose}
        imagePath={currentPicture}
        caption={currentCaption}
      />
      {currentPlayer?.username === "admin1234509876" && (
        <LeaderboardModal
          isOpen={showLeaderboard}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}

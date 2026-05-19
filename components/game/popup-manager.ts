export class PopupManager {
  private scene: Phaser.Scene;
  private currentPopup: {
    overlay?: Phaser.GameObjects.Rectangle;
    bg?: Phaser.GameObjects.Rectangle;
    text?: Phaser.GameObjects.Text;
    button?: Phaser.GameObjects.Rectangle;
    buttonText?: Phaser.GameObjects.Text;
    titleText?: Phaser.GameObjects.Text;
    extraObjects?: Phaser.GameObjects.GameObject[];
  } | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  showGamePopup(title: string, message: string, buttonText: string = "OK", onClose?: () => void) {
    if (this.currentPopup) {
      this.closeCurrentPopup();
    }

    const gameWidth = this.scene.sys.game.config.width as number;
    const gameHeight = this.scene.sys.game.config.height as number;
    const centerX = gameWidth / 2;
    const centerY = gameHeight / 2;
    const popupWidth = Math.min(680, gameWidth - 48);
    const contentWidth = popupWidth - 64;

    const overlay = this.scene.add.rectangle(centerX, centerY, gameWidth, gameHeight, 0x000000, 0.9);
    overlay.setDepth(10000).setScrollFactor(0);

    const titleText = this.scene.add.text(centerX, 0, title, {
      fontSize: "24px",
      color: "#e8e8e8",
      fontStyle: "bold",
      align: "center",
      wordWrap: { width: contentWidth },
    }).setOrigin(0.5, 0).setDepth(10002).setScrollFactor(0);

    const messageText = this.scene.add.text(centerX, 0, message, {
      fontSize: "16px",
      color: "#e8e8e8",
      align: "center",
      lineSpacing: 6,
      wordWrap: { width: contentWidth }
    }).setOrigin(0.5, 0).setDepth(10002).setScrollFactor(0);

    const popupHeight = Math.min(
      Math.max(240, titleText.height + messageText.height + 140),
      gameHeight - 48
    );
    const top = centerY - popupHeight / 2;

    const bg = this.scene.add.rectangle(centerX, centerY, popupWidth, popupHeight, 0x1a1a2e);
    bg.setDepth(10001).setScrollFactor(0);

    titleText.setPosition(centerX, top + 28);
    messageText.setPosition(centerX, top + 72 + titleText.height);

    const buttonY = top + popupHeight - 42;
    const button = this.scene.add.rectangle(centerX, buttonY, 150, 40, 0x0f3460);
    button.setDepth(10002).setScrollFactor(0);
    button.setInteractive();

    const btnText = this.scene.add.text(centerX, buttonY, buttonText, {
      fontSize: "14px",
      color: "#e8e8e8",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(10003).setScrollFactor(0);

    this.currentPopup = {
      overlay,
      bg,
      text: messageText,
      button,
      buttonText: btnText,
      titleText: titleText
    };

    const closePopup = () => {
      this.closeCurrentPopup();
      if (onClose) onClose();
    };

    button.on("pointerdown", closePopup);

    button.on("pointerover", () => {
      button.setFillStyle(0x1e3a5f);
    });

    button.on("pointerout", () => {
      button.setFillStyle(0x0f3460);
    });
  }

  showQuestionPopup(
    title: string,
    question: string,
    options: string[],
    onAnswer: (selectedAnswerIndex: number) => void
  ) {
    if (this.currentPopup) {
      this.closeCurrentPopup();
    }

    const gameWidth = this.scene.sys.game.config.width as number;
    const gameHeight = this.scene.sys.game.config.height as number;
    const centerX = gameWidth / 2;
    const centerY = gameHeight / 2;
    const popupWidth = Math.min(760, gameWidth - 48);
    const contentWidth = popupWidth - 64;
    const optionLabels = ["A", "B", "C", "D"];
    const extraObjects: Phaser.GameObjects.GameObject[] = [];

    const overlay = this.scene.add.rectangle(
      centerX,
      centerY,
      gameWidth,
      gameHeight,
      0x000000,
      0.9
    );
    overlay.setDepth(10000).setScrollFactor(0);

    const titleText = this.scene.add
      .text(centerX, 0, title, {
        fontSize: "24px",
        color: "#e8e8e8",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: contentWidth },
      })
      .setOrigin(0.5, 0)
      .setDepth(10002)
      .setScrollFactor(0);

    const questionText = this.scene.add
      .text(centerX, 0, question, {
        fontSize: "16px",
        color: "#e8e8e8",
        align: "center",
        lineSpacing: 6,
        wordWrap: { width: contentWidth },
      })
      .setOrigin(0.5, 0)
      .setDepth(10002)
      .setScrollFactor(0);

    const optionHeight = 52;
    const optionGap = 10;
    const popupHeight = Math.min(
      Math.max(
        360,
        titleText.height +
          questionText.height +
          options.length * (optionHeight + optionGap) +
          170
      ),
      gameHeight - 48
    );
    const top = centerY - popupHeight / 2;

    const bg = this.scene.add.rectangle(
      centerX,
      centerY,
      popupWidth,
      popupHeight,
      0x1a1a2e
    );
    bg.setDepth(10001).setScrollFactor(0);

    titleText.setPosition(centerX, top + 28);
    questionText.setPosition(centerX, top + 72 + titleText.height);

    let optionY = questionText.y + questionText.height + 28;
    options.forEach((option, index) => {
      const optionBg = this.scene.add.rectangle(
        centerX,
        optionY + optionHeight / 2,
        contentWidth,
        optionHeight,
        0x0f3460
      );
      optionBg.setDepth(10002).setScrollFactor(0).setInteractive();

      const optionText = this.scene.add
        .text(
          centerX,
          optionY + optionHeight / 2,
          `${optionLabels[index]}. ${option}`,
          {
            fontSize: "14px",
            color: "#e8e8e8",
            align: "center",
            wordWrap: { width: contentWidth - 24 },
          }
        )
        .setOrigin(0.5)
        .setDepth(10003)
        .setScrollFactor(0);

      optionBg.on("pointerover", () => {
        optionBg.setFillStyle(0x1e3a5f);
      });

      optionBg.on("pointerout", () => {
        optionBg.setFillStyle(0x0f3460);
      });

      optionBg.on("pointerdown", () => {
        this.closeCurrentPopup();
        onAnswer(index);
      });

      extraObjects.push(optionBg, optionText);
      optionY += optionHeight + optionGap;
    });

    const closeButtonY = top + popupHeight - 38;
    const closeButton = this.scene.add.rectangle(
      centerX,
      closeButtonY,
      140,
      36,
      0x374151
    );
    closeButton.setDepth(10002).setScrollFactor(0).setInteractive();

    const closeButtonText = this.scene.add
      .text(centerX, closeButtonY, "Đóng", {
        fontSize: "14px",
        color: "#e8e8e8",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(10003)
      .setScrollFactor(0);

    closeButton.on("pointerover", () => {
      closeButton.setFillStyle(0x4b5563);
    });

    closeButton.on("pointerout", () => {
      closeButton.setFillStyle(0x374151);
    });

    closeButton.on("pointerdown", () => {
      this.closeCurrentPopup();
    });

    this.currentPopup = {
      overlay,
      bg,
      text: questionText,
      titleText,
      button: closeButton,
      buttonText: closeButtonText,
      extraObjects,
    };
  }

  closeCurrentPopup() {
    if (this.currentPopup) {
      this.currentPopup.overlay?.destroy();
      this.currentPopup.bg?.destroy();
      this.currentPopup.text?.destroy();
      this.currentPopup.button?.destroy();
      this.currentPopup.buttonText?.destroy();
      this.currentPopup.titleText?.destroy();
      this.currentPopup.extraObjects?.forEach((object) => object.destroy());
      this.currentPopup = null;
    }
  }

  updateCurrentPopupMessage(message: string) {
    this.currentPopup?.text?.setText(message);
  }

  showFinalCompletionPopup() {
    this.showGamePopup(
      "🏆 HOÀN THÀNH! 🏆",
      "Chúc mừng bạn đã hoàn thành trò chơi!\nBạn sẽ được ghi nhận thành tích.",
      "KẾT THÚC",
      () => {
        window.dispatchEvent(new Event("quizCompleted"));
      }
    );
  }
}

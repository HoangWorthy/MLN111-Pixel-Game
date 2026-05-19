export class InputManager {
  private scene: Phaser.Scene;
  
  public interactKey!: Phaser.Input.Keyboard.Key;
  public finishKey!: Phaser.Input.Keyboard.Key;
  public tabKey!: Phaser.Input.Keyboard.Key;
  public promptText!: Phaser.GameObjects.Text;

  private onInteractCallback?: () => void;
  private onFinishCallback?: () => void;
  private onTabCallback?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  setupInput(
    onInteract: () => void, 
    onFinish: () => void, 
    onTab: () => void
  ) {
    this.onInteractCallback = onInteract;
    this.onFinishCallback = onFinish;
    this.onTabCallback = onTab;

    this.interactKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.finishKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.tabKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TAB);

    this.interactKey.on("down", this.onInteractCallback);
    this.finishKey.on("down", this.onFinishCallback);
    this.tabKey.on("down", this.onTabCallback);

    this.createPromptText();
  }

  private createPromptText() {
    this.promptText = this.scene.add
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
  }

  showPrompt(x: number, y: number, text: string) {
    this.promptText.setText(text);
    this.promptText.setPosition(x, y - 50);
    this.promptText.setVisible(true);
  }

  hidePrompt() {
    this.promptText.setVisible(false);
  }

  destroy() {
    this.interactKey?.off("down", this.onInteractCallback);
    this.finishKey?.off("down", this.onFinishCallback);
    this.tabKey?.off("down", this.onTabCallback);
    this.promptText?.destroy();
  }
}
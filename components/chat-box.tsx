"use client";

const PhaserLib = typeof window !== "undefined" ? require("phaser") : null;
type Phaser = typeof import("phaser");

export class ChatBox {
  private scene: Phaser.Scene;
  private chatBackground!: Phaser.GameObjects.Rectangle;
  private chatText!: Phaser.GameObjects.Text;
  private chatInputBox!: Phaser.GameObjects.Rectangle;
  private chatInputText!: Phaser.GameObjects.Text;
  private chatToggleButton!: Phaser.GameObjects.Rectangle;
  private chatToggleText!: Phaser.GameObjects.Text;
  private chatMessagesArea!: Phaser.GameObjects.Rectangle;
  private chatInputArea!: Phaser.GameObjects.Rectangle;
  private chatSendButton!: Phaser.GameObjects.Rectangle;
  private chatSendIcon!: Phaser.GameObjects.Text;
  private chatHeaderBar!: Phaser.GameObjects.Rectangle;
  private chatHeaderText!: Phaser.GameObjects.Text;
  private chatMessages: string[] = [];
  private isChatMinimized: boolean = false;
  private currentMessage: string = "";
  private isTyping: boolean = false;
  private username: string;
  private onMovementToggle: (enabled: boolean) => void;
  private gameClient: any;

  constructor(scene: Phaser.Scene, username: string, onMovementToggle: (enabled: boolean) => void) {
    this.scene = scene;
    this.username = username;
    this.onMovementToggle = onMovementToggle;
    this.gameClient = (window as any).gameClient;
  }

  create() {
    const chatWidth = 320;
    const chatHeight = 220;
    const padding = 20;

    this.chatBackground = this.scene.add.rectangle(
      padding, 
      this.scene.sys.game.config.height as number - chatHeight - padding, 
      chatWidth, 
      chatHeight, 
      0x2a2a2a, 
      0.95
    );
    this.chatBackground.setStrokeStyle(2, 0x4a4a4a);
    this.chatBackground.setOrigin(0, 0);
    this.chatBackground.setScrollFactor(0);
    this.chatBackground.setDepth(200);

    this.chatHeaderBar = this.scene.add.rectangle(
      padding, 
      this.scene.sys.game.config.height as number - chatHeight - padding, 
      chatWidth, 
      30, 
      0x1a1a1a, 
      1
    );
    this.chatHeaderBar.setStrokeStyle(1, 0x4a4a4a);
    this.chatHeaderBar.setOrigin(0, 0);
    this.chatHeaderBar.setScrollFactor(0);
    this.chatHeaderBar.setDepth(201);

    this.chatHeaderText = this.scene.add.text(
      padding + 10, 
      this.scene.sys.game.config.height as number - chatHeight - padding + 15, 
      "💬 Chat", 
      {
        fontSize: "14px",
        color: "#ffffff",
        fontStyle: "bold"
      }
    ).setOrigin(0, 0.5);
    this.chatHeaderText.setScrollFactor(0);
    this.chatHeaderText.setDepth(202);

    this.chatToggleButton = this.scene.add.rectangle(
      padding + chatWidth - 20, 
      this.scene.sys.game.config.height as number - chatHeight - padding + 15, 
      16, 
      16, 
      0x555555
    );
    this.chatToggleButton.setStrokeStyle(1, 0x777777);
    this.chatToggleButton.setOrigin(0.5, 0.5);
    this.chatToggleButton.setInteractive({ cursor: 'pointer' });
    this.chatToggleButton.setScrollFactor(0);
    this.chatToggleButton.setDepth(203);
    
    this.chatToggleText = this.scene.add.text(
      padding + chatWidth - 20, 
      this.scene.sys.game.config.height as number - chatHeight - padding + 15, 
      '−', 
      {
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5, 0.5);
    this.chatToggleText.setScrollFactor(0);
    this.chatToggleText.setDepth(204);

    this.chatMessagesArea = this.scene.add.rectangle(
      padding + 5, 
      this.scene.sys.game.config.height as number - chatHeight - padding + 35, 
      chatWidth - 10, 
      chatHeight - 75, 
      0x1e1e1e, 
      0.8
    );
    this.chatMessagesArea.setStrokeStyle(1, 0x333333);
    this.chatMessagesArea.setOrigin(0, 0);
    this.chatMessagesArea.setScrollFactor(0);
    this.chatMessagesArea.setDepth(201);

    this.chatText = this.scene.add.text(
      padding + 10, 
      this.scene.sys.game.config.height as number - chatHeight - padding + 40, 
      "", 
      {
        fontSize: "12px",
        color: "#ffffff",
        wordWrap: { width: chatWidth - 20 },
        lineSpacing: 2
      }
    ).setOrigin(0, 0);
    this.chatText.setScrollFactor(0);
    this.chatText.setDepth(202);

    this.chatInputArea = this.scene.add.rectangle(
      padding + 5, 
      this.scene.sys.game.config.height as number - 35 - padding, 
      chatWidth - 10, 
      30, 
      0x333333, 
      0.9
    );
    this.chatInputArea.setStrokeStyle(1, 0x555555);
    this.chatInputArea.setOrigin(0, 0);
    this.chatInputArea.setScrollFactor(0);
    this.chatInputArea.setDepth(201);

    this.chatInputBox = this.scene.add.rectangle(
      padding + 8, 
      this.scene.sys.game.config.height as number - 32 - padding, 
      chatWidth - 16, 
      24, 
      0x2a2a2a, 
      0.1
    );
    this.chatInputBox.setOrigin(0, 0);
    this.chatInputBox.setInteractive({ cursor: 'text' });
    this.chatInputBox.setScrollFactor(0);
    this.chatInputBox.setDepth(203);

    this.chatInputText = this.scene.add.text(
      padding + 12, 
      this.scene.sys.game.config.height as number - 20 - padding, 
      "Nhấn để gõ tin nhắn...", 
      {
        fontSize: "11px",
        color: "#888888"
      }
    ).setOrigin(0, 0.5);
    this.chatInputText.setScrollFactor(0);
    this.chatInputText.setDepth(204);

    this.chatSendButton = this.scene.add.rectangle(
      padding + chatWidth - 25, 
      this.scene.sys.game.config.height as number - 20 - padding, 
      20, 
      16, 
      0x4CAF50
    );
    this.chatSendButton.setStrokeStyle(1, 0x45a049);
    this.chatSendButton.setOrigin(0.5, 0.5);
    this.chatSendButton.setInteractive({ cursor: 'pointer' });
    this.chatSendButton.setScrollFactor(0);
    this.chatSendButton.setDepth(203);

    this.chatSendIcon = this.scene.add.text(
      padding + chatWidth - 25, 
      this.scene.sys.game.config.height as number - 20 - padding, 
      '➤', 
      {
        fontSize: '10px',
        color: '#ffffff'
      }
    ).setOrigin(0.5, 0.5);
    this.chatSendIcon.setScrollFactor(0);
    this.chatSendIcon.setDepth(204);

    this.setupEventListeners();
    this.addChatMessage("Hệ thống: Chào mừng đến với bảo tàng!");
  }

  private setupEventListeners() {
    this.chatInputBox.on('pointerdown', () => {
      this.activateChatInput();
    });

    this.chatSendButton.on('pointerdown', () => {
      this.sendMessage();
    });

    this.chatToggleButton.on('pointerdown', () => {
      this.toggleChat();
    });

    this.scene.input.keyboard!.on('keydown-ENTER', () => {
      if (this.chatInputText.text !== "Nhấn để gõ tin nhắn...") {
        this.sendMessage();
      } else {
        this.activateChatInput();
      }
    });
  }

  private activateChatInput() {
    this.isTyping = true;
    this.currentMessage = "";
    this.chatInputText.setText("|");
    this.chatInputText.setColor("#ffffff");
    
    this.onMovementToggle(false);
    
    this.scene.input.keyboard!.removeAllListeners();
    this.scene.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      if (!this.isTyping) return;
      
      if (event.key === 'Enter') {
        this.sendMessage();
      } else if (event.key === 'Escape') {
        this.cancelInput();
      } else if (event.key === 'Backspace') {
        this.currentMessage = this.currentMessage.slice(0, -1);
        this.updateInputDisplay();
      } else if (event.key.length === 1 && this.currentMessage.length < 50) {
        this.currentMessage += event.key;
        this.updateInputDisplay();
      }
    });
  }

  private updateInputDisplay() {
    if (this.isTyping) {
      this.chatInputText.setText(this.currentMessage + "|");
    }
  }

  private sendMessage() {
    if (this.isTyping && this.currentMessage.trim()) {
      // Send to server if connected
      if (this.gameClient && (window as any).currentPlayer) {
        this.gameClient.sendMessage(this.currentMessage.trim());
      } else {
        // Fallback to local display
        const timestamp = new Date().toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        this.addChatMessage(`[${timestamp}] ${this.username}: ${this.currentMessage.trim()}`);
      }
    }
    this.cancelInput();
  }

  private cancelInput() {
    this.isTyping = false;
    this.currentMessage = "";
    this.chatInputText.setText("Nhấn để gõ tin nhắn...");
    this.chatInputText.setColor("#888888");
    
    this.onMovementToggle(true);
    
    this.scene.input.keyboard!.removeAllListeners();
  }

  private toggleChat() {
    const chatWidth = 320;
    const chatHeight = 220;
    const headerHeight = 30;
    const padding = 20;
    
    this.isChatMinimized = !this.isChatMinimized;
    
    if (this.isChatMinimized) {
      this.chatBackground.setSize(chatWidth, headerHeight);
      this.chatBackground.setPosition(padding, this.scene.sys.game.config.height as number - headerHeight - padding);
      this.chatHeaderBar.setPosition(padding, this.scene.sys.game.config.height as number - headerHeight - padding);
      this.chatHeaderText.setPosition(padding + 10, this.scene.sys.game.config.height as number - headerHeight - padding + 15);
      this.chatText.setVisible(false);
      this.chatInputBox.setVisible(false);
      this.chatInputText.setVisible(false);
      this.chatMessagesArea.setVisible(false);
      this.chatInputArea.setVisible(false);
      this.chatSendButton.setVisible(false);
      this.chatSendIcon.setVisible(false);
      this.chatToggleText.setText('+');
      this.chatToggleButton.setPosition(padding + chatWidth - 20, this.scene.sys.game.config.height as number - headerHeight - padding + 15);
    } else {
      this.chatBackground.setSize(chatWidth, chatHeight);
      this.chatBackground.setPosition(padding, this.scene.sys.game.config.height as number - chatHeight - padding);
      this.chatHeaderBar.setPosition(padding, this.scene.sys.game.config.height as number - chatHeight - padding);
      this.chatHeaderText.setPosition(padding + 10, this.scene.sys.game.config.height as number - chatHeight - padding + 15);
      this.chatText.setVisible(true);
      this.chatText.setPosition(padding + 10, this.scene.sys.game.config.height as number - chatHeight - padding + 40);
      this.chatInputBox.setVisible(true);
      this.chatInputBox.setPosition(padding + 8, this.scene.sys.game.config.height as number - 32 - padding);
      this.chatInputText.setVisible(true);
      this.chatInputText.setPosition(padding + 12, this.scene.sys.game.config.height as number - 20 - padding);
      this.chatMessagesArea.setVisible(true);
      this.chatMessagesArea.setPosition(padding + 5, this.scene.sys.game.config.height as number - chatHeight - padding + 35);
      this.chatInputArea.setVisible(true);
      this.chatInputArea.setPosition(padding + 5, this.scene.sys.game.config.height as number - 35 - padding);
      this.chatSendButton.setVisible(true);
      this.chatSendButton.setPosition(padding + chatWidth - 25, this.scene.sys.game.config.height as number - 20 - padding);
      this.chatSendIcon.setVisible(true);
      this.chatSendIcon.setPosition(padding + chatWidth - 25, this.scene.sys.game.config.height as number - 20 - padding);
      this.chatToggleText.setText('−');
      this.chatToggleButton.setPosition(padding + chatWidth - 20, this.scene.sys.game.config.height as number - chatHeight - padding + 15);
    }
  }

  public addChatMessage(message: string) {
    this.chatMessages.push(message);
    if (this.chatMessages.length > 8) {
      this.chatMessages.shift();
    }
    
    const formattedMessages = this.chatMessages.map(msg => {
      if (msg.startsWith('Hệ thống:')) {
        return `[SYS] ${msg.replace('Hệ thống:', '')}`;
      }
      return msg;
    });
    
    this.chatText.setText(formattedMessages.join('\n'));
    
    this.scene.time.delayedCall(50, () => {
      if (this.chatText.height > 120) {
        this.chatText.y = Math.max(40, 160 - this.chatText.height);
      }
    });
  }

  public getIsTyping(): boolean {
    return this.isTyping;
  }

  public addServerMessage(message: any) {
    const timestamp = new Date(message.timestamp).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    this.addChatMessage(`[${timestamp}] ${message.username}: ${message.message}`);
  }

  public destroy() {
    this.chatBackground?.destroy();
    this.chatText?.destroy();
    this.chatInputBox?.destroy();
    this.chatInputText?.destroy();
    this.chatToggleButton?.destroy();
    this.chatToggleText?.destroy();
    this.chatMessagesArea?.destroy();
    this.chatInputArea?.destroy();
    this.chatSendButton?.destroy();
    this.chatSendIcon?.destroy();
    this.chatHeaderBar?.destroy();
    this.chatHeaderText?.destroy();
  }
}
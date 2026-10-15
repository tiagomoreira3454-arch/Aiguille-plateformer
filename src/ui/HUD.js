import { ROOM_COUNT } from "../world/ForestTilemap.js";

export class HUD {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.panel = scene.add.graphics().setScrollFactor(0).setDepth(50);
    this.panel.fillStyle(0x11191c, 0.86);
    this.panel.fillRoundedRect(14, 12, 260, 78, 8);
    this.panel.lineStyle(1, 0x8ba89a, 0.45);
    this.panel.strokeRoundedRect(14, 12, 260, 78, 8);
    this.panel.fillStyle(0x38433d, 1);
    this.panel.fillRoundedRect(72, 28, 180, 10, 4);
    this.panel.fillRoundedRect(72, 57, 180, 8, 4);

    this.healthText = scene.add.text(24, 18, "", {
      fontFamily: "Georgia, serif",
      fontSize: "14px",
      color: "#e8e2d4",
      letterSpacing: 1,
    }).setScrollFactor(0).setDepth(51);
    this.silkText = scene.add.text(24, 46, "", {
      fontFamily: "Georgia, serif",
      fontSize: "12px",
      color: "#b6d9d1",
      letterSpacing: 1,
    }).setScrollFactor(0).setDepth(51);

    this.roomText = scene.add.text(480, 19, "", {
      fontFamily: "Georgia, serif",
      fontSize: "13px",
      color: "#dbe8d2",
      letterSpacing: 2,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(51);

    this.mapGraphics = scene.add.graphics().setScrollFactor(0).setDepth(50);
    this.hintText = scene.add.text(936, 20, "A/D DÉPLACER   ESPACE SAUT   MAJ DASH", {
      fontFamily: "Segoe UI, sans-serif",
      fontSize: "11px",
      color: "#c0cfbd",
      backgroundColor: "#11191cbb",
      padding: { x: 10, y: 8 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(51);
    this.combatHint = scene.add.text(
      936,
      508,
      "J  ATTAQUE    K  AIGUILLE    ↓ + J  POGO",
      {
        fontFamily: "Segoe UI, sans-serif",
        fontSize: "11px",
        color: "#d8dfc7",
        backgroundColor: "#11191cbb",
        padding: { x: 10, y: 8 },
      },
    ).setOrigin(1, 1).setScrollFactor(0).setDepth(51);

    this.statusText = scene.add.text(480, 245, "", {
      fontFamily: "Georgia, serif",
      fontSize: "36px",
      fontStyle: "bold",
      color: "#f0cbc0",
      stroke: "#11191c",
      strokeThickness: 7,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(52);

    this.messageText = scene.add.text(480, 292, "RÉAPPARITION  —  ENTRÉE", {
      fontFamily: "Segoe UI, sans-serif",
      fontSize: "14px",
      color: "#dbe8d2",
      backgroundColor: "#11191cdd",
      padding: { x: 12, y: 8 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(52).setVisible(false);

    this.messageText.setInteractive({ useHandCursor: true });
    this.messageText.on("pointerdown", () => this.scene.scene.restart());
    this.enterHandler = () => {
      if (this.player.dead) this.scene.scene.restart();
    };
    scene.input.keyboard.on("keydown-ENTER", this.enterHandler);
  }

  update(playerX) {
    this.healthText.setText(`VIE  ${this.player.health} / ${this.player.maxHealth}`);
    this.silkText.setText(`SOIE  ${this.player.silk} / 100`);
    this.roomText.setText(this.scene.getRoomName(playerX).toUpperCase());
    this.statusText.setText(this.player.dead ? "ÉPUISÉE" : "");
    this.messageText.setVisible(this.player.dead);

    this.mapGraphics.clear();
    this.mapGraphics.fillStyle(0x38433d, 1);
    this.mapGraphics.fillRoundedRect(365, 42, 230, 8, 4);
    this.mapGraphics.fillStyle(0xa6c184, 0.9);
    this.mapGraphics.fillRoundedRect(
      365,
      42,
      Math.max(8, 230 * (playerX / this.scene.worldWidth)),
      8,
      4,
    );
    for (let room = 1; room < ROOM_COUNT; room += 1) {
      const markerX = 365 + (230 * room) / ROOM_COUNT;
      this.mapGraphics.fillStyle(0x17201d, 1);
      this.mapGraphics.fillCircle(markerX, 46, 4);
    }

    this.panel.clear();
    this.panel.fillStyle(0x11191c, 0.86);
    this.panel.fillRoundedRect(14, 12, 260, 78, 8);
    this.panel.lineStyle(1, 0x8ba89a, 0.45);
    this.panel.strokeRoundedRect(14, 12, 260, 78, 8);
    this.panel.fillStyle(0x38433d, 1);
    this.panel.fillRoundedRect(72, 28, 180, 10, 4);
    this.panel.fillStyle(0xc8757a, 1);
    this.panel.fillRoundedRect(
      72,
      28,
      Math.max(0, 180 * (this.player.health / this.player.maxHealth)),
      10,
      4,
    );
    this.panel.fillStyle(0x38433d, 1);
    this.panel.fillRoundedRect(72, 57, 180, 8, 4);
    this.panel.fillStyle(0x8fcfc0, 1);
    this.panel.fillRoundedRect(72, 57, 180 * (this.player.silk / 100), 8, 4);
  }

  destroy() {
    this.scene.input.keyboard.off("keydown-ENTER", this.enterHandler);
  }
}

import Phaser from "phaser";

const FIREFLY_COLORS = [0xb8e9a0, 0xf4d98a, 0x91d9ce];

export class ForestEffects {
  constructor(scene, worldWidth) {
    this.scene = scene;
    this.worldWidth = worldWidth;
    this.createParallaxLayers();
    this.createFireflies();
    this.leafTimer = scene.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => this.spawnLeaf(),
    });
  }

  createParallaxLayers() {
    const distant = this.scene.add.graphics().setScrollFactor(0.16, 0.28).setDepth(-8);
    distant.fillStyle(0x17272a, 0.9);
    distant.fillRect(-300, 0, this.worldWidth + 600, 540);
    distant.fillStyle(0x263c38, 0.85);
    for (let x = -180; x < this.worldWidth + 240; x += 300) {
      const offset = (x * 17) % 90;
      distant.fillRect(x + 42, 75 + offset, 24, 430);
      distant.fillRect(x - 24, 150 + offset, 156, 30);
      distant.fillRect(x - 48, 174 + offset, 200, 12);
      distant.fillRect(x - 76, 100 + offset, 124, 25);
      distant.fillStyle(0x263c38, 0.56);
      distant.fillCircle(x + 40, 94 + offset, 74);
      distant.fillStyle(0x263c38, 0.85);
    }

    const middle = this.scene.add.graphics().setScrollFactor(0.38, 0.55).setDepth(-7);
    middle.fillStyle(0x304a3d, 0.76);
    for (let x = -120; x < this.worldWidth + 180; x += 230) {
      const offset = (x * 11) % 58;
      middle.fillRect(x + 70, 150 + offset, 18, 390);
      middle.fillRect(x + 28, 275 + offset, 102, 18);
      middle.fillRect(x, 300 + offset, 150, 12);
      middle.fillCircle(x + 74, 190 + offset, 52);
      middle.fillCircle(x + 30, 235 + offset, 34);
    }

    const canopy = this.scene.add.graphics().setScrollFactor(0.24, 0.3).setDepth(-6);
    canopy.fillStyle(0x101f20, 0.64);
    canopy.fillRect(-300, 0, this.worldWidth + 600, 28);
    canopy.fillStyle(0x182d29, 0.8);
    for (let x = -100; x < this.worldWidth + 150; x += 150) {
      canopy.fillCircle(x, 18 + ((x * 7) % 30), 48);
      canopy.fillCircle(x + 55, 5, 37);
    }

    const godRays = this.scene.add.graphics().setScrollFactor(0.5, 0.35).setDepth(-5);
    for (let x = 150; x < this.worldWidth; x += 760) {
      godRays.fillStyle(0xc5ddac, 0.035);
      godRays.fillPoints(
        [
          { x, y: 0 },
          { x: x + 50, y: 0 },
          { x: x + 280, y: 390 },
          { x: x + 180, y: 390 },
        ],
        true,
      );
    }
  }

  createFireflies() {
    for (let index = 0; index < 24; index += 1) {
      const x = 40 + ((index * 197) % this.worldWidth);
      const y = 120 + ((index * 83) % 320);
      const light = this.scene.add
        .circle(x, y, index % 4 === 0 ? 3 : 2, FIREFLY_COLORS[index % 3], 0.18)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(4);
      this.scene.tweens.add({
        targets: light,
        alpha: { from: 0.16, to: 0.92 },
        y: y - 18,
        duration: 1500 + (index % 5) * 320,
        yoyo: true,
        repeat: -1,
        delay: index * 110,
        ease: "Sine.InOut",
      });
    }
  }

  spawnLeaf() {
    const view = this.scene.cameras.main.worldView;
    const x = view.x + Math.random() * view.width;
    const leaf = this.scene.add
      .rectangle(
        x,
        view.y - 8,
        5,
        3,
        Math.random() > 0.5 ? 0xa6bf72 : 0xd29661,
      )
      .setDepth(5)
      .setRotation(Math.random() * Math.PI);

    this.scene.tweens.add({
      targets: leaf,
      x: x + 30 + Math.random() * 90,
      y: view.y + 420 + Math.random() * 130,
      rotation: leaf.rotation + Math.PI * 3,
      alpha: 0,
      duration: 4500 + Math.random() * 2200,
      onComplete: () => leaf.destroy(),
    });
  }

  burst(x, y, color, count = 7) {
    for (let index = 0; index < count; index += 1) {
      const particle = this.scene.add
        .rectangle(x, y, 3 + Math.random() * 3, 3 + Math.random() * 3, color)
        .setDepth(6);
      this.scene.tweens.add({
        targets: particle,
        x: x + (Math.random() - 0.5) * 82,
        y: y - Math.random() * 30 - 8,
        alpha: 0,
        scale: 0.3,
        duration: 250 + Math.random() * 250,
        onComplete: () => particle.destroy(),
      });
    }
  }

  destroy() {
    this.leafTimer.remove();
  }
}

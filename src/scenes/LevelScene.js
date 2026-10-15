import Phaser from "phaser";
import { ForestEffects } from "../effects/ForestEffects.js";
import { Enemy } from "../entities/Enemy.js";
import { Player } from "../entities/Player.js";
import { Trap } from "../entities/Trap.js";
import { createPixelArt } from "../rendering/PixelArt.js";
import { HUD } from "../ui/HUD.js";
import {
  createForestTilemap,
  ROOM_COUNT,
  ROOM_WIDTH,
  TILE_SIZE,
} from "../world/ForestTilemap.js";

export class LevelScene extends Phaser.Scene {
  constructor() {
    super("LevelScene");
  }

  create() {
    createPixelArt(this);
    const forest = createForestTilemap(this);
    this.worldWidth = forest.width;
    this.rooms = forest.rooms;
    this.physics.world.setBounds(0, 0, forest.width, forest.height);
    this.cameras.main.setBounds(0, 0, forest.width, forest.height);
    this.cameras.main.setBackgroundColor("#14201f");
    this.forestEffects = new ForestEffects(this, forest.width);
    this.addForestDetails(forest.rooms);

    this.player = new Player(this, 120, 460);
    this.physics.add.collider(this.player.gameObject, forest.layer);
    this.cameras.main.startFollow(this.player.gameObject, true, 0.085, 0.085);

    this.enemies = [
      new Enemy(this, 520, 490, 100),
      new Enemy(this, 1350, 330, 85),
      new Enemy(this, 2360, 490, 125),
      new Enemy(this, 3320, 330, 100),
    ];
    for (const enemy of this.enemies) {
      this.physics.add.collider(enemy.gameObject, forest.layer);
      this.physics.add.collider(this.player.gameObject, enemy.gameObject);
    }

    this.traps = [
      new Trap(this, 800, 503, 90, 18),
      new Trap(this, 2830, 503, 90, 18),
    ];
    for (const trap of this.traps) {
      this.physics.add.collider(this.player.gameObject, trap.gameObject);
      for (const enemy of this.enemies) {
        this.physics.add.collider(enemy.gameObject, trap.gameObject);
      }
    }

    this.hud = new HUD(this, this.player);
  }

  addForestDetails(rooms) {
    const flora = this.add.graphics().setDepth(2);

    rooms.forEach((room, index) => {
      const roomStart = index * ROOM_WIDTH * TILE_SIZE;
      const roomCenter = roomStart + (ROOM_WIDTH * TILE_SIZE) / 2;

      this.add.text(roomCenter, 105, room.name.toUpperCase(), {
        fontFamily: "Georgia, serif",
        fontSize: "18px",
        color: room.color,
        letterSpacing: 3,
        shadow: { color: "#0b1412", blur: 8, fill: true },
      }).setOrigin(0.5).setAlpha(0.83).setDepth(2);

      for (let patch = 0; patch < 7; patch += 1) {
        const x = roomStart + 65 + patch * 126;
        const ground = 510;
        flora.fillStyle(0x263a30, 0.95);
        flora.fillRect(x, ground - 16, 5, 16);
        flora.fillRect(x + 12, ground - 21, 5, 21);
        flora.fillRect(x + 24, ground - 13, 5, 13);
        flora.fillStyle(0x78956a, 0.9);
        flora.fillRect(x - 4, ground - 20, 12, 5);
        flora.fillRect(x + 8, ground - 26, 14, 5);
        flora.fillRect(x + 20, ground - 17, 12, 5);

        if (patch % 2 === 0) {
          flora.fillStyle(0xd4a1a3, 0.9);
          flora.fillRect(x + 42, ground - 8, 10, 8);
          flora.fillStyle(0xe8cad0, 0.95);
          flora.fillRect(x + 40, ground - 11, 14, 4);
          flora.fillStyle(0xe7d9a2, 0.95);
          flora.fillRect(x + 45, ground - 3, 3, 3);
        }
      }
    });
  }

  update(time, delta) {
    this.player.update(time, delta);
    for (const enemy of this.enemies) enemy.update();
    this.resolveMelee();
    this.resolveContactDamage();
    this.updateProjectiles();
    this.hud.update(this.player.gameObject.x);
  }

  getRoomName(playerX) {
    const roomIndex = Math.min(
      Math.floor(playerX / (ROOM_WIDTH * TILE_SIZE)),
      ROOM_COUNT - 1,
    );
    return this.rooms[roomIndex].name;
  }

  resolveMelee() {
    const attackBounds = this.player.getAttackBounds();
    if (!attackBounds) return;

    for (const enemy of this.enemies) {
      if (
        enemy.active &&
        !this.player.attackTargets.has(enemy) &&
        rectanglesTouch(attackBounds, enemy.getBounds())
      ) {
        enemy.takeDamage();
        this.player.attackTargets.add(enemy);
        this.player.gainSilk(18);
        if (this.player.isPogoAttack) this.bounceFromTarget();
      }
    }

    for (const trap of this.traps) {
      if (
        this.player.isPogoAttack &&
        !this.player.attackTargets.has(trap) &&
        rectanglesTouch(attackBounds, trap.getBounds())
      ) {
        this.player.attackTargets.add(trap);
        this.bounceFromTarget();
      }
    }
  }

  bounceFromTarget() {
    this.player.body.setVelocityY(-440);
    this.player.jumpsRemaining = 1;
    this.forestEffects.burst(
      this.player.gameObject.x,
      this.player.gameObject.y + 18,
      0xf1d58d,
      8,
    );
  }

  resolveContactDamage() {
    const playerBounds = this.player.getBounds();
    for (const enemy of this.enemies) {
      if (enemy.active && rectanglesTouch(playerBounds, enemy.getBounds())) {
        this.player.damage(1, enemy.gameObject.x);
      }
    }

    for (const trap of this.traps) {
      if (rectanglesTouch(playerBounds, trap.getBounds())) {
        this.player.damage(1, trap.gameObject.x);
      }
    }
  }

  updateProjectiles() {
    for (const projectile of [...this.player.projectiles]) {
      for (const enemy of this.enemies) {
        if (
          enemy.active &&
          rectanglesTouch(projectile.getBounds(), enemy.getBounds())
        ) {
          enemy.takeDamage();
          this.player.gainSilk(18);
          projectile.destroy();
          this.player.projectiles = this.player.projectiles.filter(
            (item) => item !== projectile,
          );
          break;
        }
      }
    }
  }

  shutdown() {
    this.forestEffects?.destroy();
    this.hud?.destroy();
  }
}

function rectanglesTouch(first, second) {
  return (
    first.left <= second.right &&
    first.right >= second.left &&
    first.top <= second.bottom &&
    first.bottom >= second.top
  );
}

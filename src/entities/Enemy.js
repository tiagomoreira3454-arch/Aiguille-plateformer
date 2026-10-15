import Phaser from "phaser";

export class Enemy {
  constructor(scene, x, y, patrolDistance = 110) {
    this.scene = scene;
    this.originX = x;
    this.patrolDistance = patrolDistance;
    this.direction = -1;
    this.health = 2;
    this.active = true;
    this.gameObject = scene.add.sprite(x, y, "moss-enemy-art", "enemy-0").setDepth(3);
    scene.physics.add.existing(this.gameObject);
    this.gameObject.body.setAllowGravity(true);
    this.gameObject.body.setBounce(0);
    this.gameObject.body.setMaxVelocity(180, 900);
    this.gameObject.body.setCollideWorldBounds(true);
    this.gameObject.body.setSize(34, 36);
    this.gameObject.anims.play("enemy-hover");
  }

  update() {
    if (!this.active) return;

    if (
      this.gameObject.x < this.originX - this.patrolDistance ||
      this.gameObject.x > this.originX + this.patrolDistance
    ) {
      this.direction *= -1;
    }

    this.gameObject.body.setVelocityX(this.direction * 45);
    this.gameObject.setFlipX(this.direction > 0);
  }

  takeDamage() {
    if (!this.active) return;

    this.health -= 1;
    this.gameObject.setTint(this.health === 1 ? 0xffc68a : 0xffffff);
    this.scene.time.delayedCall(100, () => {
      if (this.active) this.gameObject.clearTint();
    });

    if (this.health <= 0) {
      this.active = false;
      this.gameObject.destroy();
    }
  }

  getBounds() {
    return new Phaser.Geom.Rectangle(
      this.gameObject.body.x,
      this.gameObject.body.y,
      this.gameObject.body.width,
      this.gameObject.body.height,
    );
  }
}

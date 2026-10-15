import Phaser from "phaser";

const MAX_SILK = 100;

export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.gameObject = scene.add.sprite(x, y, "hero-pixel-art", "idle-0");
    this.gameObject.setDepth(3);
    scene.physics.add.existing(this.gameObject);

    this.body = this.gameObject.body;
    this.body.setSize(26, 38);
    this.body.setCollideWorldBounds(true);
    this.body.setMaxVelocity(520, 1000);
    this.body.setDragX(1800);

    this.keys = scene.input.keyboard.addKeys({
      left: "LEFT",
      right: "RIGHT",
      up: "UP",
      down: "DOWN",
      a: "A",
      d: "D",
      w: "W",
      s: "S",
      jump: "SPACE",
      dash: "SHIFT",
      melee: "J",
      needle: "K",
    });

    this.facing = 1;
    this.health = 5;
    this.maxHealth = 5;
    this.silk = 35;
    this.jumpsRemaining = 2;
    this.dashCooldown = 0;
    this.dashTime = 0;
    this.attackTime = 0;
    this.attackTargets = new Set();
    this.damageCooldown = 0;
    this.dead = false;
    this.projectiles = [];
    this.currentAnimation = "";
    this.wasGrounded = false;
    this.dashTrailTimer = 0;
  }

  update(_time, delta) {
    if (this.dead) return;

    const left = this.keys.left.isDown || this.keys.a.isDown;
    const right = this.keys.right.isDown || this.keys.d.isDown;
    const up = this.keys.up.isDown || this.keys.w.isDown;
    const down = this.keys.down.isDown || this.keys.s.isDown;
    const jumpPressed =
      Phaser.Input.Keyboard.JustDown(this.keys.jump) ||
      Phaser.Input.Keyboard.JustDown(this.keys.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.w);
    const jumpReleased =
      Phaser.Input.Keyboard.JustUp(this.keys.jump) ||
      Phaser.Input.Keyboard.JustUp(this.keys.up) ||
      Phaser.Input.Keyboard.JustUp(this.keys.w);
    const horizontal = Number(right) - Number(left);

    this.dashCooldown = Math.max(0, this.dashCooldown - delta);
    this.damageCooldown = Math.max(0, this.damageCooldown - delta);
    this.attackTime = Math.max(0, this.attackTime - delta);

    if (this.body.blocked.down) this.jumpsRemaining = 2;
    if (horizontal !== 0 && this.dashTime <= 0) {
      this.facing = Math.sign(horizontal);
      this.body.setVelocityX(horizontal * 260);
    }

    if (jumpPressed) this.jump();
    if (jumpReleased && this.body.velocity.y < -250) {
      this.body.setVelocityY(-250);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.dash)) {
      this.startDash(horizontal, Number(down) - Number(up));
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.melee)) this.startAttack(down);
    if (Phaser.Input.Keyboard.JustDown(this.keys.needle)) this.throwNeedle();

    this.updateDash(delta, horizontal);
    this.updateWallSlide(left, right);
    this.updateProjectiles(delta);
    this.updateAnimation(horizontal);
    this.gameObject.setFlipX(this.facing < 0);
    this.gameObject.setAlpha(
      this.damageCooldown > 0 && Math.floor(this.damageCooldown / 80) % 2 === 0
        ? 0.48
        : 1,
    );

    const grounded = this.body.blocked.down || this.body.touching.down;
    if (grounded && !this.wasGrounded && this.body.velocity.y >= 0) {
      this.scene.forestEffects.burst(this.gameObject.x, this.gameObject.y + 18, 0x9cae83, 6);
    }
    this.wasGrounded = grounded;

    if (this.dashTime > 0) {
      this.dashTrailTimer -= delta;
      if (this.dashTrailTimer <= 0) {
        this.dashTrailTimer = 42;
        this.spawnDashGhost();
      }
    }
  }

  jump() {
    if (this.body.blocked.down) {
      this.jumpsRemaining = 2;
    }

    const againstWall =
      (this.body.blocked.left && (this.keys.left.isDown || this.keys.a.isDown)) ||
      (this.body.blocked.right && (this.keys.right.isDown || this.keys.d.isDown));

    if (againstWall) {
      this.facing = this.body.blocked.left ? 1 : -1;
      this.body.setVelocity(250 * this.facing, -520);
      this.jumpsRemaining = 1;
      return;
    }

    if (this.jumpsRemaining > 0) {
      this.body.setVelocityY(this.jumpsRemaining === 2 ? -520 : -470);
      this.jumpsRemaining -= 1;
    }
  }

  startDash(horizontal, vertical) {
    if (this.dashCooldown > 0 || this.dashTime > 0) return;

    let x = horizontal || this.facing;
    let y = vertical;
    const magnitude = Math.hypot(x, y) || 1;
    x /= magnitude;
    y /= magnitude;

    this.dashTime = 170;
    this.dashCooldown = 700;
    this.damageCooldown = Math.max(this.damageCooldown, 190);
    this.dashTrailTimer = 0;
    this.body.setAllowGravity(false);
    this.body.setVelocity(x * 560, y * 560);
    this.scene.forestEffects.burst(this.gameObject.x, this.gameObject.y, 0x83d9d0, 10);
  }

  updateDash(delta, horizontal) {
    if (this.dashTime <= 0) return;

    this.dashTime = Math.max(0, this.dashTime - delta);
    if (this.dashTime === 0) {
      this.body.setAllowGravity(true);
      this.body.setVelocityY(0);
      if (horizontal !== 0) this.body.setVelocityX(horizontal * 260);
    }
  }

  updateWallSlide(left, right) {
    const pressingIntoWall =
      (this.body.blocked.left && left) || (this.body.blocked.right && right);
    if (!this.body.blocked.down && pressingIntoWall && this.body.velocity.y > 100) {
      this.body.setVelocityY(100);
    }
  }

  startAttack(down) {
    this.attackTime = 150;
    this.attackTargets.clear();
    this.isPogoAttack = down;
    this.gameObject.anims.play("hero-attack", true);
  }

  updateAnimation(horizontal) {
    let animation = "idle";
    if (this.attackTime > 0) {
      animation = "attack";
    } else if (this.dashTime > 0) {
      animation = "dash";
    } else if (!this.body.blocked.down && !this.body.touching.down) {
      animation = this.body.velocity.y < 0 ? "jump" : "fall";
    } else if (horizontal !== 0) {
      animation = "run";
    }

    if (this.currentAnimation !== animation) {
      this.currentAnimation = animation;
      this.gameObject.anims.play(`hero-${animation}`, true);
    }
  }

  spawnDashGhost() {
    const ghost = this.scene.add
      .sprite(this.gameObject.x, this.gameObject.y, "hero-pixel-art", this.gameObject.frame.name)
      .setFlipX(this.facing < 0)
      .setTint(0x8ce1d6)
      .setAlpha(0.38)
      .setDepth(2);
    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      duration: 190,
      onComplete: () => ghost.destroy(),
    });
  }

  getAttackBounds() {
    if (this.attackTime <= 0) return null;

    const x = this.gameObject.x + (this.isPogoAttack ? 0 : this.facing * 30);
    const y = this.gameObject.y + (this.isPogoAttack ? 20 : 0);
    return new Phaser.Geom.Rectangle(
      x - (this.isPogoAttack ? 16 : 28),
      y - (this.isPogoAttack ? 0 : 14),
      this.isPogoAttack ? 32 : 56,
      this.isPogoAttack ? 38 : 28,
    );
  }

  getBounds() {
    return new Phaser.Geom.Rectangle(
      this.body.x,
      this.body.y,
      this.body.width,
      this.body.height,
    );
  }

  throwNeedle() {
    if (this.silk < 20) return;

    this.silk -= 20;
    const projectile = this.scene.add.image(
      this.gameObject.x + this.facing * 20,
      this.gameObject.y,
      "needle-pixel-art",
    );
    this.scene.physics.add.existing(projectile);
    projectile.body.setAllowGravity(false);
    projectile.body.setVelocity(this.facing * 620, 0);
    projectile.body.setSize(28, 10);
    projectile.damage = 1;
    projectile.lifetime = 1100;
    this.projectiles.push(projectile);
  }

  updateProjectiles(delta) {
    this.projectiles = this.projectiles.filter((projectile) => {
      projectile.lifetime -= delta;
      const outside =
        projectile.x < 0 ||
        projectile.x > this.scene.worldWidth ||
        projectile.lifetime <= 0;
      if (outside) projectile.destroy();
      return !outside && projectile.active;
    });
  }

  damage(amount = 1, sourceX = this.gameObject.x) {
    if (this.damageCooldown > 0 || this.dead) return;

    this.health = Math.max(0, this.health - amount);
    this.damageCooldown = 850;
    this.body.setVelocity(sourceX < this.gameObject.x ? 220 : -220, -260);
    this.scene.cameras.main.shake(110, 0.003);
    this.scene.forestEffects.burst(this.gameObject.x, this.gameObject.y, 0xd87577, 8);
    if (this.health === 0) {
      this.dead = true;
      this.body.setAllowGravity(false);
      this.body.setVelocity(0, 0);
    }
  }

  gainSilk(amount) {
    this.silk = Math.min(MAX_SILK, this.silk + amount);
  }
}

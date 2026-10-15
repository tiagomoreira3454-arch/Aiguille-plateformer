const FRAME_SIZE = 64;

function block(context, x, y, width, height, color) {
  context.fillStyle = color;
  context.fillRect(x, y, width, height);
}

function makeSheet(scene, key, frames, drawFrame) {
  if (!scene.textures.exists(key)) {
    // Named 64px frames keep the generated art ready for Phaser's animation system.
    const texture = scene.textures.createCanvas(
      key,
      FRAME_SIZE * frames.length,
      FRAME_SIZE,
    );
    const context = texture.getContext();
    context.imageSmoothingEnabled = false;

    frames.forEach((frame, index) => {
      context.save();
      context.translate(index * FRAME_SIZE, 0);
      drawFrame(context, frame);
      context.restore();
      texture.add(frame.name, 0, index * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE);
    });
    texture.refresh();
  }

  return frames.map((frame) => ({ key, frame: frame.name }));
}

function drawHero(context, pose) {
  const step = pose.step ?? 0;
  const arm = pose.arm ?? 0;
  const legLift = pose.legLift ?? 0;

  block(context, 24, 8, 16, 4, "#171d29");
  block(context, 20, 12, 24, 16, "#171d29");
  block(context, 16, 16, 8, 8, "#171d29");
  block(context, 40, 16, 8, 8, "#171d29");
  block(context, 24, 12, 16, 12, "#e3e8e1");
  block(context, 20, 16, 4, 8, "#b9c9cb");
  block(context, 28, 24, 8, 4, "#f7f5e9");
  block(context, 36, 20, 4, 4, "#192333");
  block(context, 24, 28, 20, 4, "#17202a");

  block(context, 20, 32, 24, 16, "#293e50");
  block(context, 24, 32, 16, 4, "#c95b66");
  block(context, 16, 36, 8, 8, "#17202a");
  block(context, 20, 36, 4, 8, "#d7a1a0");
  block(context, 40, 34 + arm, 8, 8, "#17202a");
  block(context, 44, 36 + arm, 8, 4, "#e7d8bb");
  block(context, 20, 44, 24, 4, "#18212d");

  block(context, 24, 46 + legLift, 8, 10 - legLift, "#384c5c");
  block(context, 36, 46 + step, 8, 10 - step, "#384c5c");
  block(context, 20, 54 + legLift, 12, 4, "#111923");
  block(context, 36, 54 + step, 12, 4, "#111923");

  block(context, 8, 36, 12, 4, "#c95b66");
  block(context, 4, 40, 8, 8, "#8d465b");
  block(context, 8, 48, 12, 4, "#293e50");
  block(context, 46, 38 + arm, 14, 3, "#f4dfa7");
  block(context, 58, 36 + arm, 4, 3, "#fff2c8");
  block(context, 48, 42 + arm, 4, 3, "#9cb6c3");
}

const HERO_FRAMES = {
  idle: [
    { name: "idle-0", step: 0, arm: 0 },
    { name: "idle-1", step: 0, arm: -1 },
  ],
  run: [
    { name: "run-0", step: 0, arm: -2 },
    { name: "run-1", step: 2, arm: 1, legLift: 1 },
    { name: "run-2", step: 0, arm: 2 },
    { name: "run-3", step: -2, arm: -1, legLift: 1 },
  ],
  jump: [{ name: "jump-0", step: -2, arm: -3, legLift: 2 }],
  fall: [{ name: "fall-0", step: 2, arm: 3 }],
  dash: [{ name: "dash-0", step: 0, arm: -4, legLift: 2 }],
  attack: [{ name: "attack-0", step: 0, arm: -4 }],
};

const ENEMY_FRAMES = [
  { name: "enemy-0", lift: 0 },
  { name: "enemy-1", lift: 2 },
];

export function createPixelArt(scene) {
  const heroFrames = Object.values(HERO_FRAMES).flat();
  makeSheet(scene, "hero-pixel-art", heroFrames, drawHero);
  const heroAnimations = {};

  for (const [animation, definitions] of Object.entries(HERO_FRAMES)) {
    heroAnimations[animation] = definitions.map((frame) => ({
      key: "hero-pixel-art",
      frame: frame.name,
    }));
  }

  if (!scene.anims.exists("hero-idle")) {
    for (const [name, frameRate, repeat] of [
      ["idle", 2, -1],
      ["run", 12, -1],
      ["jump", 1, 0],
      ["fall", 1, 0],
      ["dash", 1, 0],
      ["attack", 1, 0],
    ]) {
      scene.anims.create({
        key: `hero-${name}`,
        frames: heroAnimations[name],
        frameRate,
        repeat,
      });
    }
  }

  makeSheet(scene, "moss-enemy-art", ENEMY_FRAMES, (context, frame) => {
    const lift = frame.lift;
    block(context, 20, 16 + lift, 24, 8, "#14251f");
    block(context, 12, 24 + lift, 40, 16, "#14251f");
    block(context, 8, 28 + lift, 8, 8, "#14251f");
    block(context, 48, 28 + lift, 8, 8, "#14251f");
    block(context, 16, 24 + lift, 32, 12, "#557b54");
    block(context, 20, 20 + lift, 24, 8, "#8db574");
    block(context, 20, 28 + lift, 8, 4, "#f4e6a6");
    block(context, 36, 28 + lift, 8, 4, "#f4e6a6");
    block(context, 24, 28 + lift, 4, 4, "#15221e");
    block(context, 40, 28 + lift, 4, 4, "#15221e");
    block(context, 16, 40 + lift, 8, 8, "#293b32");
    block(context, 40, 40 + lift, 8, 8, "#293b32");
    block(context, 12, 44 + lift, 12, 4, "#17251e");
    block(context, 40, 44 + lift, 12, 4, "#17251e");
    block(context, 16, 12 + lift, 4, 8, "#b5c979");
    block(context, 44, 12 + lift, 4, 8, "#b5c979");
  });

  if (!scene.anims.exists("enemy-hover")) {
    scene.anims.create({
      key: "enemy-hover",
      frames: [
        { key: "moss-enemy-art", frame: "enemy-0" },
        { key: "moss-enemy-art", frame: "enemy-1" },
      ],
      frameRate: 3,
      repeat: -1,
    });
  }

  if (!scene.textures.exists("thorn-pixel-art")) {
    const texture = scene.textures.createCanvas("thorn-pixel-art", 96, 32);
    const context = texture.getContext();
    context.imageSmoothingEnabled = false;
    block(context, 0, 24, 96, 8, "#302d36");
    for (let x = 4; x < 96; x += 16) {
      block(context, x, 12, 8, 12, "#9a5360");
      block(context, x + 4, 4, 4, 8, "#d27a77");
      block(context, x - 4, 20, 4, 4, "#6b4358");
      block(context, x + 8, 16, 4, 8, "#6b4358");
    }
    texture.refresh();
  }

  if (!scene.textures.exists("needle-pixel-art")) {
    const texture = scene.textures.createCanvas("needle-pixel-art", 32, 16);
    const context = texture.getContext();
    context.imageSmoothingEnabled = false;
    block(context, 0, 6, 20, 4, "#e8d8ad");
    block(context, 20, 4, 8, 8, "#f8edcf");
    block(context, 28, 6, 4, 4, "#fff8e6");
    block(context, 4, 4, 12, 2, "#97b4b4");
    texture.refresh();
  }
}

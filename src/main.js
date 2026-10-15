import Phaser from "phaser";
import "./style.css";
import { LevelScene } from "./scenes/LevelScene.js";

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: 960,
  height: 540,
  backgroundColor: "#18202b",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1100 },
      debug: false,
    },
  },
  scene: [LevelScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);

export class Trap {
  constructor(scene, x, y, width = 72, height = 20) {
    this.gameObject = scene.add.image(x, y, "thorn-pixel-art");
    this.gameObject.setDisplaySize(width, height).setDepth(2);
    scene.physics.add.existing(this.gameObject, true);
    this.gameObject.body.setSize(width, height, true);
  }

  getBounds() {
    return this.gameObject.getBounds();
  }
}

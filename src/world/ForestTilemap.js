export const TILE_SIZE = 32;
export const ROOM_WIDTH = 30;
export const ROOM_COUNT = 4;
export const MAP_WIDTH = ROOM_WIDTH * ROOM_COUNT;
export const MAP_HEIGHT = 18;
export const WORLD_WIDTH = MAP_WIDTH * TILE_SIZE;
export const WORLD_HEIGHT = MAP_HEIGHT * TILE_SIZE;

const ROOMS = [
  {
    name: "Lisière oubliée",
    color: "#91b69a",
    platforms: [[4, 13, 9], [13, 11, 18], [21, 13, 27]],
  },
  {
    name: "Bosquet des lucioles",
    color: "#d6e7a0",
    platforms: [[33, 13, 38], [39, 11, 45], [48, 13, 55]],
  },
  {
    name: "Racines anciennes",
    color: "#d59676",
    platforms: [[63, 13, 69], [70, 11, 76], [80, 13, 86]],
  },
  {
    name: "Sanctuaire moussu",
    color: "#94d5c0",
    platforms: [[93, 13, 99], [100, 11, 106], [110, 13, 116]],
  },
];

export function createForestTileTexture(scene) {
  if (scene.textures.exists("forest-tiles")) return;

  const texture = scene.textures.createCanvas("forest-tiles", TILE_SIZE * 4, TILE_SIZE);
  const context = texture.getContext();
  context.imageSmoothingEnabled = false;

  const tiles = [
    { base: "#394f3c", top: "#a6c184", highlight: "#d0d69a" },
    { base: "#4b423d", top: "#635345", highlight: "#80624d" },
    { base: "#43594a", top: "#78956a", highlight: "#a8bb82" },
    { base: "#343b42", top: "#515b61", highlight: "#707773" },
  ];

  tiles.forEach((tile, tileIndex) => {
    const origin = tileIndex * TILE_SIZE;
    context.fillStyle = tile.base;
    context.fillRect(origin, 0, TILE_SIZE, TILE_SIZE);
    context.fillStyle = tile.top;
    context.fillRect(origin, 0, TILE_SIZE, 7);
    context.fillStyle = tile.highlight;
    context.fillRect(origin + 4, 3, 8, 2);
    context.fillRect(origin + 20, 1, 7, 2);
    context.fillStyle = "#1e2929";
    context.fillRect(origin + 3, 12, 5, 3);
    context.fillRect(origin + 22, 20, 7, 4);
    context.fillStyle = tileIndex === 3 ? "#87928a" : "#69574a";
    context.fillRect(origin + 12, 16, 7, 3);
    context.fillRect(origin + 5, 27, 8, 3);
  });

  texture.refresh();
}

export function createForestTilemap(scene) {
  createForestTileTexture(scene);

  const tilemap = scene.make.tilemap({
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
  });
  const tileset = tilemap.addTilesetImage(
    "forest-ground",
    "forest-tiles",
    TILE_SIZE,
    TILE_SIZE,
    0,
    0,
  );
  const layer = tilemap.createBlankLayer("forest-ground", tileset, 0, 0);

  for (let x = 0; x < MAP_WIDTH; x += 1) {
    layer.putTileAt(0, x, 16);
    layer.putTileAt(1, x, 17);
    if (x % 9 === 0) layer.putTileAt(2, x, 16);
  }

  for (const room of ROOMS) {
    for (const [start, row, end] of room.platforms) {
      for (let x = start; x <= end; x += 1) {
        layer.putTileAt(x % 7 === 0 ? 2 : 0, x, row);
        if (x === start || x === end) layer.putTileAt(3, x, row);
      }
    }
  }

  // Blank cells (-1) stay empty; every painted tile is a solid platform.
  layer.setCollisionByExclusion([-1]);
  layer.setDepth(1);

  return {
    tilemap,
    layer,
    rooms: ROOMS,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
  };
}

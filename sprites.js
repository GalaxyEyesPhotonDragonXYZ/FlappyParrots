const birdSelectRects = [
  { x: 92, y: 107, width: 252, height: 258 },
  { x: 408, y: 109, width: 270, height: 253 },
  { x: 715, y: 112, width: 235, height: 252 },
  { x: 1023, y: 91, width: 236, height: 277 },
  { x: 69, y: 413, width: 266, height: 276 },
  { x: 386, y: 402, width: 254, height: 287 },
  { x: 701, y: 443, width: 244, height: 244 },
  { x: 1005, y: 439, width: 285, height: 248 },
  { x: 58, y: 730, width: 263, height: 287 },
  { x: 349, y: 735, width: 295, height: 284 },
  { x: 686, y: 752, width: 322, height: 259 },
  { x: 1019, y: 740, width: 230, height: 277 }
];

const birdFlyRects = [
  { x: 107, y: 102, width: 258, height: 183 },
  { x: 422, y: 104, width: 258, height: 184 },
  { x: 734, y: 107, width: 285, height: 183 },
  { x: 1045, y: 82, width: 235, height: 209 },
  { x: 95, y: 358, width: 244, height: 182 },
  { x: 396, y: 342, width: 257, height: 218 },
  { x: 736, y: 380, width: 233, height: 175 },
  { x: 1073, y: 370, width: 221, height: 185 },
  { x: 90, y: 607, width: 249, height: 183 },
  { x: 406, y: 616, width: 239, height: 174 },
  { x: 732, y: 624, width: 269, height: 168 },
  { x: 1054, y: 626, width: 244, height: 160 }
];

export const SPRITES = Object.freeze({
  backgrounds: { x: 44, y: 136, width: 482, height: 804, variants: { day: 0, sunset: 1, night: 2 } },
  birds: {
    select: { columns: 4, rows: 3, rects: birdSelectRects },
    fly: { columns: 4, rows: 4, rects: birdFlyRects }
  },
  pipes: {
    cap: { y: 370, width: 190, height: 84 },
    shaft: { offsetX: 24, y: 450, width: 142, height: 410 },
    colors: { normal: 54, easy: 552, hard: 1043 }
  },
  ui: {
    goldButton: { x: 55, y: 94, width: 470, height: 103 },
    greenButton: { x: 55, y: 219, width: 470, height: 105 },
    blueButton: { x: 545, y: 219, width: 416, height: 105 },
    redButton: { x: 55, y: 606, width: 376, height: 105 },
    check: { x: 734, y: 492, width: 114, height: 112 },
    lock: { x: 734, y: 606, width: 114, height: 104 }
  },
  effects: {
    spark: { x: 332, y: 314, width: 88, height: 115 },
    burst: { x: 1057, y: 316, width: 160, height: 120 },
    wind: { x: 942, y: 520, width: 105, height: 75 },
    shield: { x: 1000, y: 642, width: 108, height: 108 },
    star: { x: 52, y: 640, width: 110, height: 105 },
    bomb: { x: 742, y: 650, width: 107, height: 102 },
    feather: { x: 448, y: 838, width: 60, height: 118 },
    squawk: { x: 544, y: 838, width: 80, height: 118 }
  },
  logo: { x: 0, y: 0, width: 1182, height: 1126 }
});

/* ============================================================
   DreamGirl · Portrait Engine
   分层矢量肖像：肤色 / 轮廓 / 眼睛 / 眉毛 / 鼻子 / 嘴唇 / 发型 / 细节
   每个特征都是独立路径，任意组合即可实时生成新肖像。
   ============================================================ */
(function () {
  'use strict';

  var CX = 300;
  var EYE_Y = 296;

  /* ---------------- 肤色 ---------------- */
  var SKINS = [
    { id: 'porcelain', name: '瓷白', base: '#FBE5D9', shade: '#F0CABA', deep: '#D8A695', line: '#B9836F' },
    { id: 'fair',      name: '暖白', base: '#F6D8C3', shade: '#E8BDA0', deep: '#CC9B7C', line: '#AE7E5F' },
    { id: 'beige',     name: '蜜色', base: '#EDC39D', shade: '#DBA77D', deep: '#BC855C', line: '#9C6A45' },
    { id: 'tan',       name: '小麦', base: '#D9A773', shade: '#C28C5A', deep: '#9F6B3F', line: '#835433' },
    { id: 'brown',     name: '深棕', base: '#B07B4E', shade: '#96633A', deep: '#7A4B27', line: '#5F381D' },
    { id: 'deep',      name: '巧克力', base: '#7C4D31', shade: '#673E26', deep: '#4F2D19', line: '#3C2113' }
  ];

  /* ---------------- 脸型 ---------------- */
  var FACES = {
    oval:    { name: '鹅蛋脸', hw: 96,  path: 'M 300 140 C 356 140 396 196 396 284 C 396 356 354 436 300 436 C 246 436 204 356 204 284 C 204 196 244 140 300 140 Z' },
    round:   { name: '圆脸',   hw: 106, path: 'M 300 152 C 362 152 410 202 410 288 C 410 358 364 424 300 424 C 236 424 190 358 190 288 C 190 202 238 152 300 152 Z' },
    square:  { name: '方脸',   hw: 100, path: 'M 300 146 C 350 146 390 176 396 230 L 400 300 C 401 340 398 372 380 398 C 362 424 334 434 300 434 C 266 434 238 424 220 398 C 202 372 199 340 200 300 L 204 230 C 210 176 250 146 300 146 Z' },
    heart:   { name: '心形脸', hw: 98,  path: 'M 300 144 C 362 144 402 190 402 252 C 402 294 386 324 364 348 C 344 370 326 400 300 430 C 274 400 256 370 236 348 C 214 324 198 294 198 252 C 198 190 238 144 300 144 Z' },
    long:    { name: '长脸',   hw: 86,  path: 'M 300 134 C 350 134 386 182 386 264 C 386 346 350 442 300 442 C 250 442 214 346 214 264 C 214 182 250 134 300 134 Z' },
    diamond: { name: '菱形脸', hw: 94,  path: 'M 300 148 C 344 148 378 184 386 236 C 396 276 396 306 382 336 C 364 376 336 424 300 436 C 264 424 236 376 218 336 C 204 306 204 276 214 236 C 222 184 256 148 300 148 Z' }
  };

  /* ---------------- 眼型（右眼坐标，左眼镜像） ---------------- */
  var EYES = {
    almond:  { name: '杏眼', sclera: 'M 328 297 C 337 283 363 283 372 297 C 363 309 337 309 328 297 Z', iris: { x: 350, y: 296, r: 11 }, lash: 'M 328 297 C 337 283 363 283 372 297', flick: 'M 371 295 L 378 289' },
    round:   { name: '圆眼', sclera: 'M 329 296 C 332 280 368 280 371 296 C 368 312 332 312 329 296 Z', iris: { x: 350, y: 296, r: 12 }, lash: 'M 329 296 C 332 280 368 280 371 296', flick: 'M 370 292 L 376 287' },
    phoenix: { name: '丹凤眼', sclera: 'M 330 302 C 342 286 360 283 374 288 C 366 301 344 312 330 302 Z', iris: { x: 351, y: 296, r: 10.5 }, lash: 'M 330 302 C 342 286 360 283 374 288', flick: 'M 373 287 L 380 282' },
    monolid: { name: '单眼皮', sclera: 'M 330 298 C 340 287 362 287 371 295 C 362 306 340 308 330 298 Z', iris: { x: 350, y: 297, r: 10 }, lash: 'M 330 298 C 340 287 362 287 371 295', flick: 'M 370 294 L 376 291' },
    droopy:  { name: '下垂眼', sclera: 'M 330 292 C 340 284 360 286 371 300 C 360 311 338 309 330 292 Z', iris: { x: 350, y: 296, r: 11 }, lash: 'M 330 292 C 340 284 360 286 371 300', flick: 'M 370 300 L 376 303' }
  };

  /* ---------------- 眉型 ---------------- */
  var BROWS = {
    straight: { name: '平眉',   d: 'M 326 256 Q 350 248 374 254', w: 7 },
    arched:   { name: '弯眉',   d: 'M 326 258 Q 350 236 374 256', w: 7 },
    thick:    { name: '粗眉',   d: 'M 324 255 Q 350 244 376 252', w: 10.5 },
    thin:     { name: '柳叶眉', d: 'M 328 256 Q 350 242 372 252', w: 4.5 },
    angled:   { name: '剑眉',   d: 'M 325 262 L 350 243 L 375 250', w: 7.5 }
  };

  /* ---------------- 鼻型 ---------------- */
  var NOSES = {
    small:    { name: '小巧鼻', tip: 'M 290 338 Q 300 348 310 338', bridge: 'M 300 312 L 300 334', w: 2.6, ty: 346 },
    straight: { name: '直鼻',   tip: 'M 289 345 Q 300 354 311 345', bridge: 'M 300 304 L 300 341', w: 2.6, ty: 352 },
    button:   { name: '小翘鼻', tip: 'M 288 341 Q 300 330 312 341', bridge: 'M 300 316 L 300 337', w: 2.6, ty: 344 },
    wide:     { name: '宽鼻',   tip: 'M 282 343 Q 300 355 318 343', bridge: 'M 300 312 L 300 339', w: 2.8, ty: 351 }
  };

  /* ---------------- 唇型 ---------------- */
  var LIPS = {
    full: { name: '饱满唇', path: 'M 272 384 C 281 373 291 375 300 380 C 309 375 319 373 328 384 C 319 401 281 401 272 384 Z', line: 'M 272 384 C 292 390 308 390 328 384' },
    thin: { name: '薄唇',   path: 'M 275 384 C 284 378 291 379 300 382 C 309 379 316 378 325 384 C 316 393 284 393 275 384 Z', line: 'M 275 384 C 292 388 308 388 325 384' },
    bow:  { name: '心形唇', path: 'M 271 385 C 279 373 288 373 293 378 C 297 382 300 374 300 370 C 300 374 303 382 307 378 C 312 373 321 373 329 385 C 319 402 281 402 271 385 Z', line: 'M 271 385 C 292 391 308 391 329 385' },
    wide: { name: '微笑唇', path: 'M 266 384 C 276 372 288 374 300 379 C 312 374 324 372 334 384 C 324 403 276 403 266 384 Z', line: 'M 266 384 C 292 391 308 391 334 384' },
    soft: { name: '柔唇',   path: 'M 273 385 C 282 376 291 377 300 381 C 309 377 318 376 327 385 C 317 398 283 398 273 385 Z', line: 'M 273 385 C 292 390 308 390 327 385' }
  };

  /* ---------------- 发型（后层轮廓） ---------------- */
  var HAIRS = {
    long: {
      name: '长直发',
      back: ['M 300 94 C 204 94 164 170 166 268 C 168 372 150 486 138 730 L 462 730 C 450 486 432 372 434 268 C 436 170 396 94 300 94 Z']
    },
    wavy: {
      name: '波浪卷',
      back: ['M 300 92 C 198 92 156 174 160 274 C 164 322 144 352 152 392 C 160 432 140 472 146 512 C 152 552 132 592 140 740 L 460 740 C 468 592 448 552 454 512 C 460 472 440 432 448 392 C 456 352 436 322 440 274 C 444 174 402 92 300 92 Z']
    },
    lob: {
      name: '锁骨发',
      back: ['M 300 96 C 206 96 168 168 170 262 C 172 340 164 452 172 520 C 200 550 248 560 300 560 C 352 560 400 550 428 520 C 436 452 428 340 430 262 C 432 168 394 96 300 96 Z']
    },
    bob: {
      name: '波波头',
      back: ['M 300 96 C 206 96 168 168 170 262 C 172 322 162 378 172 418 C 198 446 246 456 300 456 C 354 456 402 446 428 418 C 438 378 428 322 430 262 C 432 168 394 96 300 96 Z']
    },
    bun: {
      name: '丸子头',
      back: ['M 300 106 C 218 106 186 174 188 260 C 190 318 196 356 200 384 L 400 384 C 404 356 410 318 412 260 C 414 174 382 106 300 106 Z'],
      extra: '<circle cx="300" cy="84" r="44" fill="var(--hair)"/><path d="M 268 100 C 276 62 324 62 332 100" fill="none" stroke="var(--hairShade)" stroke-width="3" opacity=".55"/>'
    },
    twin: {
      name: '双马尾',
      back: [
        'M 300 100 C 212 100 178 172 180 258 C 182 326 188 372 194 420 L 406 420 C 412 372 418 326 420 258 C 422 172 388 100 300 100 Z',
        'M 190 306 C 158 350 148 432 158 502 C 163 534 183 540 189 508 C 179 438 186 362 204 320 Z',
        'M 410 306 C 442 350 452 432 442 502 C 437 534 417 540 411 508 C 421 438 414 362 396 320 Z'
      ],
      extra: '<ellipse cx="196" cy="310" rx="11" ry="8" fill="var(--hairShade)"/><ellipse cx="404" cy="310" rx="11" ry="8" fill="var(--hairShade)"/>'
    },
    pony: {
      name: '马尾',
      back: [
        'M 300 100 C 214 100 180 170 182 256 C 184 316 190 356 196 398 L 404 398 C 410 356 416 316 418 256 C 420 170 386 100 300 100 Z',
        'M 412 292 C 470 318 498 406 490 516 C 486 572 458 594 448 560 C 460 478 444 386 400 336 Z'
      ]
    },
    pixie: {
      name: '精灵短发',
      back: ['M 300 96 C 212 96 180 168 182 254 C 184 300 190 332 198 352 C 214 346 222 328 222 302 C 222 240 250 196 300 196 C 350 196 378 240 378 302 C 378 328 386 346 402 352 C 410 332 416 300 418 254 C 420 168 388 96 300 96 Z']
    }
  };

  /* ---------------- 刘海（前层） ---------------- */
  var FRINGES = {
    none:    { name: '露额头', paths: ['M 198 200 C 194 128 242 88 300 88 C 358 88 406 128 402 200 C 380 172 344 156 300 156 C 256 156 220 172 198 200 Z'] },
    blunt:   { name: '齐刘海', paths: ['M 196 208 C 190 132 240 88 300 88 C 360 88 410 132 404 208 C 356 226 244 226 196 208 Z'] },
    airy:    { name: '空气刘海', paths: ['M 198 206 C 192 130 240 88 300 88 C 360 88 408 130 402 206 C 372 218 340 198 300 200 C 258 202 226 216 198 206 Z'] },
    side:    { name: '斜刘海', paths: ['M 196 198 C 192 126 242 86 300 86 C 362 86 408 128 402 198 C 384 166 358 150 326 156 C 292 162 244 178 196 198 Z'] },
    parted:  { name: '中分', paths: ['M 300 88 C 250 90 208 130 200 202 C 218 174 246 154 280 148 C 292 146 300 118 300 88 Z', 'M 300 88 C 350 90 392 130 400 202 C 382 174 354 154 320 148 C 308 146 300 118 300 88 Z'] },
    curtain: { name: '八字刘海', paths: ['M 296 88 C 246 96 206 138 200 208 C 194 268 198 316 192 352 C 210 320 216 268 220 224 C 226 178 258 132 296 88 Z', 'M 304 88 C 354 96 394 138 400 208 C 406 268 402 316 408 352 C 390 320 384 268 380 224 C 374 178 342 132 304 88 Z'] }
  };

  /* ---------------- 颜色选项 ---------------- */
  var HAIR_COLORS = ['#241C24', '#4A2E22', '#7A4A2E', '#C08B4A', '#A98C6B', '#C97F92', '#8E7EA8', '#B9B4C4'];
  var HAIR_NAMES  = ['墨黑', '深棕', '栗棕', '蜜金', '亚麻', '玫瑰', '雾紫', '银灰'];
  var IRIS_COLORS = ['#5A3A28', '#B5733A', '#6E8CA0', '#5E7A5A', '#8A7A9A', '#2B2226'];
  var IRIS_NAMES  = ['深棕', '琥珀', '灰蓝', '森绿', '紫灰', '曜黑'];
  var LIP_COLORS  = ['#C4837F', '#E09B8C', '#B25362', '#D2717E', '#C99B8B', '#A93B4E'];
  var LIP_NAMES   = ['豆沙', '蜜桃', '莓果', '玫瑰', '裸色', '樱桃'];

  var BGS = {
    mist:   { name: '晨雾', from: '#F5EAE3', to: '#E2D0C5', outfit: '#C8A79D', outfitDark: '#B08F86' },
    dusk:   { name: '暮色', from: '#3D2C47', to: '#6B4763', outfit: '#7A5C74', outfitDark: '#654A60' },
    mint:   { name: '薄荷', from: '#DFEEE6', to: '#BFDCCB', outfit: '#8FB3A2', outfitDark: '#799C8C' },
    honey:  { name: '蜜糖', from: '#FCE8CE', to: '#F2CDA1', outfit: '#D9A87C', outfitDark: '#C1926A' },
    night:  { name: '夜蓝', from: '#1B2233', to: '#2E3A55', outfit: '#4A5678', outfitDark: '#3B4664' },
    sakura: { name: '樱粉', from: '#FCE5ED', to: '#F5C3D6', outfit: '#E0A0B4', outfitDark: '#C98A9E' }
  };

  /* ---------------- 工具 ---------------- */
  function hex2rgb(h) {
    h = h.replace('#', '');
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }
  function rgb2hex(r, g, b) {
    var s = function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return ('0' + v.toString(16)).slice(-2); };
    return '#' + s(r) + s(g) + s(b);
  }
  function mix(a, b, t) {
    var A = hex2rgb(a), B = hex2rgb(b);
    return rgb2hex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  }

  /* ---------------- 主绘制 ---------------- */
  function buildPortrait(s, uid) {
    uid = uid || 'p';
    var skin = SKINS[s.skin] || SKINS[1];
    var face = FACES[s.face] || FACES.oval;
    var eye = EYES[s.eye] || EYES.almond;
    var brow = BROWS[s.brow] || BROWS.arched;
    var nose = NOSES[s.nose] || NOSES.small;
    var lip = LIPS[s.lip] || LIPS.full;
    var hair = HAIRS[s.hair] || HAIRS.long;
    var fringe = FRINGES[s.fringe] || FRINGES.side;
    var bg = BGS[s.bg] || BGS.mist;

    var hairColor = s.hairColor;
    var hairShade = mix(hairColor, '#000000', 0.3);
    var hairLight = mix(hairColor, '#FFFFFF', 0.16);
    var browColor = mix(hairColor, '#150E14', 0.42);
    var irisColor = s.iris;
    var irisDark = mix(irisColor, '#0D0808', 0.55);
    var irisLight = mix(irisColor, '#FFFFFF', 0.45);
    var lipColor = s.lipColor;
    var lipLine = mix(lipColor, '#3A1A20', 0.5);

    /* 后层头发 */
    var backPaths = hair.back.map(function (d) {
      return '<path d="' + d + '" fill="' + hairColor + '"/>';
    }).join('');
    var extra = (hair.extra || '').replace(/var\(--hairShade\)/g, hairShade).replace(/var\(--hair\)/g, hairColor);

    var strandClip =
      '<g clip-path="url(#' + uid + '-hairclip)">' +
      '<path d="M 212 190 C 194 300 182 430 172 580" fill="none" stroke="' + hairShade + '" stroke-width="12" opacity=".45" stroke-linecap="round"/>' +
      '<path d="M 388 190 C 406 300 418 430 428 580" fill="none" stroke="' + hairShade + '" stroke-width="12" opacity=".45" stroke-linecap="round"/>' +
      '<path d="M 246 150 C 236 220 232 300 234 380" fill="none" stroke="' + hairLight + '" stroke-width="7" opacity=".22" stroke-linecap="round"/>' +
      '<path d="M 354 150 C 364 220 368 300 366 380" fill="none" stroke="' + hairLight + '" stroke-width="7" opacity=".22" stroke-linecap="round"/>' +
      '<ellipse cx="238" cy="148" rx="70" ry="48" fill="#FFFFFF" opacity=".12" transform="rotate(-28 238 148)"/>' +
      '</g>';

    /* 前层头发 */
    var fringePaths = fringe.paths.map(function (d) {
      return '<path d="' + d + '" fill="' + hairColor + '"/>';
    }).join('');

    /* 眼睛 */
    var eyeRight =
      '<path d="' + eye.sclera + '" fill="#FBF6F4"/>' +
      '<circle cx="' + eye.iris.x + '" cy="' + eye.iris.y + '" r="' + eye.iris.r + '" fill="' + irisColor + '"/>' +
      '<circle cx="' + eye.iris.x + '" cy="' + (eye.iris.y + 1.6) + '" r="' + (eye.iris.r * 0.76) + '" fill="' + irisDark + '" opacity=".85"/>' +
      '<circle cx="' + eye.iris.x + '" cy="' + (eye.iris.y - 4.4) + '" r="' + (eye.iris.r * 0.44) + '" fill="' + irisLight + '" opacity=".5"/>' +
      '<circle cx="' + (eye.iris.x - 4) + '" cy="' + (eye.iris.y - 4.6) + '" r="3.5" fill="#FFFFFF" opacity=".95"/>' +
      '<circle cx="' + (eye.iris.x + 4.6) + '" cy="' + (eye.iris.y + 5.2) + '" r="1.9" fill="#FFFFFF" opacity=".5"/>' +
      '<path d="' + eye.lash + '" fill="none" stroke="#2A1C24" stroke-width="3.8" stroke-linecap="round"/>' +
      '<path d="' + eye.flick + '" fill="none" stroke="#2A1C24" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M 332 304 C 340 310 362 310 369 303" fill="none" stroke="' + skin.deep + '" stroke-width="1.5" opacity=".4" stroke-linecap="round"/>';

    var eyes = '<g>' + eyeRight + '</g><g transform="translate(600,0) scale(-1,1)">' + eyeRight + '</g>';

    /* 眉毛 */
    var browOne = '<path d="' + brow.d + '" fill="none" stroke="' + browColor + '" stroke-width="' + brow.w + '" stroke-linecap="round" stroke-linejoin="round"/>';
    var brows = '<g opacity=".94">' + browOne + '<g transform="translate(600,0) scale(-1,1)">' + browOne + '</g></g>';

    /* 腮红 */
    var blushMap = { none: 0, soft: 0.24, strong: 0.44 };
    var blushA = blushMap[s.blush] !== undefined ? blushMap[s.blush] : 0.24;
    var blush = blushA > 0
      ? '<g filter="url(#' + uid + '-blur)">' +
        '<ellipse cx="228" cy="352" rx="25" ry="13" fill="#E8776F" opacity="' + blushA + '"/>' +
        '<ellipse cx="372" cy="352" rx="25" ry="13" fill="#E8776F" opacity="' + blushA + '"/>' +
        '</g>'
      : '';

    /* 雀斑 */
    var freckle = s.freckle === 'on'
      ? '<g fill="' + skin.line + '" opacity=".42">' +
        '<circle cx="240" cy="338" r="2.2"/><circle cx="252" cy="345" r="1.8"/><circle cx="232" cy="350" r="1.6"/>' +
        '<circle cx="246" cy="330" r="1.5"/><circle cx="360" cy="338" r="2.2"/><circle cx="348" cy="345" r="1.8"/>' +
        '<circle cx="368" cy="350" r="1.6"/><circle cx="354" cy="330" r="1.5"/>' +
        '</g>'
      : '';

    /* 眼镜 */
    var glasses = '';
    if (s.glasses === 'thin') {
      glasses =
        '<g fill="none" stroke="#2E2430" stroke-width="3" opacity=".9">' +
        '<rect x="224" y="277" width="52" height="38" rx="13"/>' +
        '<rect x="324" y="277" width="52" height="38" rx="13"/>' +
        '<path d="M 276 292 Q 300 283 324 292"/>' +
        '<path d="M 224 288 L 202 281"/><path d="M 376 288 L 398 281"/>' +
        '</g>' +
        '<g fill="#FFFFFF" opacity=".12"><rect x="224" y="277" width="52" height="38" rx="13"/><rect x="324" y="277" width="52" height="38" rx="13"/></g>';
    } else if (s.glasses === 'round') {
      glasses =
        '<g fill="none" stroke="#6B4A3A" stroke-width="3.2" opacity=".92">' +
        '<circle cx="250" cy="296" r="26"/><circle cx="350" cy="296" r="26"/>' +
        '<path d="M 276 292 Q 300 283 324 292"/>' +
        '<path d="M 224 292 L 200 285"/><path d="M 376 292 L 400 285"/>' +
        '</g>' +
        '<g fill="#FFFFFF" opacity=".1"><circle cx="250" cy="296" r="26"/><circle cx="350" cy="296" r="26"/></g>';
    } else if (s.glasses === 'sun') {
      glasses =
        '<g fill="#221A24" opacity=".92">' +
        '<path d="M 220 281 L 280 281 C 282 307 271 318 253 318 C 234 318 222 307 220 281 Z"/>' +
        '<path d="M 380 281 L 320 281 C 318 307 329 318 347 318 C 366 318 378 307 380 281 Z"/>' +
        '<path d="M 280 285 Q 300 279 320 285 L 320 291 Q 300 285 280 291 Z"/>' +
        '</g>';
    }

    /* 耳饰 */
    var ex = face.hw - 3;
    var earring = '';
    if (s.earring === 'pearl') {
      earring =
        '<g><path d="M ' + (CX - ex) + ' 320 L ' + (CX - ex) + ' 331" stroke="#D9C7B4" stroke-width="1.6"/>' +
        '<path d="M ' + (CX + ex) + ' 320 L ' + (CX + ex) + ' 331" stroke="#D9C7B4" stroke-width="1.6"/>' +
        '<circle cx="' + (CX - ex) + '" cy="338" r="6.5" fill="#FBF3EA" stroke="#D9C7B4" stroke-width="1"/>' +
        '<circle cx="' + (CX + ex) + '" cy="338" r="6.5" fill="#FBF3EA" stroke="#D9C7B4" stroke-width="1"/></g>';
    } else if (s.earring === 'hoop') {
      earring =
        '<g fill="none" stroke="#E8C27E" stroke-width="3">' +
        '<circle cx="' + (CX - ex) + '" cy="340" r="9"/><circle cx="' + (CX + ex) + '" cy="340" r="9"/></g>';
    } else if (s.earring === 'drop') {
      earring =
        '<g>' +
        '<path d="M ' + (CX - ex) + ' 320 L ' + (CX - ex) + ' 333" stroke="#E8C27E" stroke-width="2"/>' +
        '<path d="M ' + (CX + ex) + ' 320 L ' + (CX + ex) + ' 333" stroke="#E8C27E" stroke-width="2"/>' +
        '<path d="M ' + (CX - ex) + ' 333 l -6 14 l 6 7 l 6 -7 Z" fill="#D98A9A"/>' +
        '<path d="M ' + (CX + ex) + ' 333 l -6 14 l 6 7 l 6 -7 Z" fill="#D98A9A"/>' +
        '</g>';
    }

    /* 颈部 */
    var neck =
      '<path d="M 258 384 L 258 484 C 258 500 246 512 234 520 L 366 520 C 354 512 342 500 342 484 L 342 384 Z" fill="' + skin.base + '"/>' +
      '<path d="M 258 384 L 258 430 C 276 452 324 452 342 430 L 342 384 Z" fill="' + skin.deep + '" opacity=".55" filter="url(#' + uid + '-blur2)"/>';

    /* 服装 */
    var outfit =
      '<path d="M 300 492 C 250 492 210 508 184 536 C 148 578 128 640 118 704 L 482 704 C 472 640 452 578 416 536 C 390 508 350 492 300 492 Z" fill="' + bg.outfit + '"/>' +
      '<path d="M 262 496 Q 300 544 338 496" fill="none" stroke="' + bg.outfitDark + '" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M 300 492 C 250 492 210 508 184 536 L 176 552 C 204 524 248 508 300 508 C 352 508 396 524 424 552 L 416 536 C 390 508 350 492 300 492 Z" fill="' + bg.outfitDark + '" opacity=".35"/>';

    /* 面部体积 */
    var faceShade =
      '<g clip-path="url(#' + uid + '-faceclip)">' +
      '<ellipse cx="300" cy="486" rx="150" ry="76" fill="' + skin.shade + '" opacity=".55" filter="url(#' + uid + '-blur3)"/>' +
      '<ellipse cx="300" cy="188" rx="104" ry="56" fill="#FFFFFF" opacity=".14" filter="url(#' + uid + '-blur3)"/>' +
      '<ellipse cx="232" cy="330" rx="26" ry="38" fill="#FFFFFF" opacity=".1" filter="url(#' + uid + '-blur3)"/>' +
      '<ellipse cx="368" cy="330" rx="26" ry="38" fill="#FFFFFF" opacity=".1" filter="url(#' + uid + '-blur3)"/>' +
      '</g>';

    var svg =
      '<svg viewBox="0 0 600 700" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">' +
      '<defs>' +
      '<linearGradient id="' + uid + '-bg" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + bg.from + '"/><stop offset="1" stop-color="' + bg.to + '"/>' +
      '</linearGradient>' +
      '<radialGradient id="' + uid + '-glow" cx="50%" cy="32%" r="44%">' +
      '<stop offset="0" stop-color="#FFFFFF" stop-opacity=".55"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<filter id="' + uid + '-blur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>' +
      '<filter id="' + uid + '-blur2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>' +
      '<filter id="' + uid + '-blur3" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="16"/></filter>' +
      '<clipPath id="' + uid + '-clip"><rect x="0" y="0" width="600" height="700"/></clipPath>' +
      '<clipPath id="' + uid + '-hairclip">' + hair.back.map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</clipPath>' +
      '<clipPath id="' + uid + '-faceclip"><path d="' + face.path + '"/></clipPath>' +
      '</defs>' +
      '<g clip-path="url(#' + uid + '-clip)">' +
      '<rect width="600" height="700" fill="url(#' + uid + '-bg)"/>' +
      '<rect width="600" height="700" fill="url(#' + uid + '-glow)"/>' +
      '<g transform="translate(300,352) scale(1.07) translate(-300,-352)">' +
      outfit +
      '<g>' + backPaths + extra + '</g>' +
      strandClip +
      neck +
      '<path d="' + face.path + '" fill="' + skin.base + '"/>' +
      faceShade +
      '<path d="' + face.path + '" fill="none" stroke="' + skin.shade + '" stroke-width="1.4" opacity=".45"/>' +
      blush +
      eyes +
      brows +
      '<g>' +
      '<ellipse cx="300" cy="' + nose.ty + '" rx="16" ry="7" fill="' + skin.deep + '" opacity=".2" filter="url(#' + uid + '-blur2)"/>' +
      '<path d="' + nose.bridge + '" stroke="' + skin.deep + '" stroke-width="2.2" opacity=".22" fill="none" stroke-linecap="round"/>' +
      '<path d="' + nose.tip + '" stroke="' + skin.deep + '" stroke-width="' + nose.w + '" opacity=".92" fill="none" stroke-linecap="round"/>' +
      '<path d="M 296 316 L 296 332" stroke="#FFFFFF" stroke-width="3" opacity=".2" stroke-linecap="round"/>' +
      '</g>' +
      freckle +
      '<g><path d="' + lip.path + '" fill="' + lipColor + '"/>' +
      '<path d="' + lip.line + '" fill="none" stroke="' + lipLine + '" stroke-width="1.6" opacity=".55" stroke-linecap="round"/>' +
      '<ellipse cx="300" cy="394" rx="12" ry="3" fill="#FFFFFF" opacity=".22"/></g>' +
      fringePaths +
      glasses +
      earring +
      '</g></g>' +
      '</svg>';

    return svg;
  }

  /* ---------------- 小图标 ---------------- */
  function iconFace(id) {
    return '<svg viewBox="0 0 76 96" class="ic ic-face"><g transform="translate(-52,-38.4) scale(0.3)" fill="none" stroke="currentColor" stroke-width="9" stroke-linejoin="round"><path d="' + FACES[id].path + '"/></g></svg>';
  }
  function iconEye(id) {
    var e = EYES[id];
    return '<svg viewBox="0 0 84 42" class="ic"><g transform="translate(-308,-274)" fill="none" stroke="currentColor" stroke-linecap="round"><path d="' + e.sclera + '" stroke-width="3.4"/><circle cx="' + e.iris.x + '" cy="' + e.iris.y + '" r="' + e.iris.r + '" stroke-width="2.4"/><path d="' + e.lash + '" stroke-width="3.6"/></g></svg>';
  }
  function iconBrow(id) {
    var b = BROWS[id];
    return '<svg viewBox="0 0 84 40" class="ic"><g transform="translate(-308,-232)"><path d="' + b.d + '" fill="none" stroke="currentColor" stroke-width="' + b.w + '" stroke-linecap="round" stroke-linejoin="round"/></g></svg>';
  }
  function iconNose(id) {
    var n = NOSES[id];
    return '<svg viewBox="0 0 84 42" class="ic"><g transform="translate(-192,-236.1) scale(0.78)" fill="none" stroke="currentColor" stroke-linecap="round"><path d="' + n.bridge + '" stroke-width="2" opacity=".38"/><path d="' + n.tip + '" stroke-width="3.4"/></g></svg>';
  }
  function iconLip(id) {
    var l = LIPS[id];
    return '<svg viewBox="0 0 84 44" class="ic"><g transform="translate(-318,-441.8) scale(1.2)" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"><path d="' + l.path + '"/></g></svg>';
  }

  window.DG = {
    SKINS: SKINS, FACES: FACES, EYES: EYES, BROWS: BROWS, NOSES: NOSES, LIPS: LIPS,
    HAIRS: HAIRS, FRINGES: FRINGES, BGS: BGS,
    HAIR_COLORS: HAIR_COLORS, HAIR_NAMES: HAIR_NAMES,
    IRIS_COLORS: IRIS_COLORS, IRIS_NAMES: IRIS_NAMES,
    LIP_COLORS: LIP_COLORS, LIP_NAMES: LIP_NAMES,
    buildPortrait: buildPortrait,
    icons: { face: iconFace, eye: iconEye, brow: iconBrow, nose: iconNose, lip: iconLip }
  };
})();

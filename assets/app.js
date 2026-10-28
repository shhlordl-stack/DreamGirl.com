/* ============================================================
   DreamGirl · App
   ============================================================ */
(function () {
  'use strict';

  var D = window.DG;

  var PRESETS = {
    female:  { face: 'oval',   eye: 'almond',  brow: 'arched',  nose: 'small',    lip: 'full', hair: 'long',  fringe: 'side',    bg: 'mist'   },
    male:    { face: 'square', eye: 'phoenix', brow: 'thick',   nose: 'straight', lip: 'thin', hair: 'pixie', fringe: 'none',    bg: 'night'  },
    neutral: { face: 'heart',  eye: 'monolid', brow: 'straight',nose: 'button',   lip: 'soft', hair: 'lob',   fringe: 'curtain', bg: 'mint'   }
  };

  var state = {
    gender: 'female',
    face: 'oval', skin: 1,
    eye: 'almond', iris: '#5A3A28',
    brow: 'arched',
    nose: 'small',
    lip: 'full', lipColor: '#C4837F',
    hair: 'long', fringe: 'side', hairColor: '#241C24',
    blush: 'soft', glasses: 'none', earring: 'none', freckle: 'off',
    bg: 'mist'
  };

  var TABS = [
    {
      id: 'face', label: '轮廓',
      groups: [
        { title: '脸型', type: 'icon', key: 'face',
          items: function () { return Object.keys(D.FACES).map(function (k) { return { val: k, label: D.FACES[k].name, icon: D.icons.face(k) }; }); } },
        { title: '肤色', type: 'color', key: 'skin',
          items: function () { return D.SKINS.map(function (s, i) { return { val: i, label: s.name, color: s.base }; }); } }
      ]
    },
    {
      id: 'eyes', label: '眼睛',
      groups: [
        { title: '眼型', type: 'icon', key: 'eye',
          items: function () { return Object.keys(D.EYES).map(function (k) { return { val: k, label: D.EYES[k].name, icon: D.icons.eye(k) }; }); } },
        { title: '瞳色', type: 'color', key: 'iris',
          items: function () { return D.IRIS_COLORS.map(function (c, i) { return { val: c, label: D.IRIS_NAMES[i], color: c }; }); } }
      ]
    },
    {
      id: 'brow', label: '眉毛',
      groups: [
        { title: '眉型', type: 'icon', key: 'brow',
          items: function () { return Object.keys(D.BROWS).map(function (k) { return { val: k, label: D.BROWS[k].name, icon: D.icons.brow(k) }; }); } }
      ]
    },
    {
      id: 'nose', label: '鼻子',
      groups: [
        { title: '鼻型', type: 'icon', key: 'nose',
          items: function () { return Object.keys(D.NOSES).map(function (k) { return { val: k, label: D.NOSES[k].name, icon: D.icons.nose(k) }; }); } }
      ]
    },
    {
      id: 'lip', label: '嘴唇',
      groups: [
        { title: '唇型', type: 'icon', key: 'lip',
          items: function () { return Object.keys(D.LIPS).map(function (k) { return { val: k, label: D.LIPS[k].name, icon: D.icons.lip(k) }; }); } },
        { title: '唇色', type: 'color', key: 'lipColor',
          items: function () { return D.LIP_COLORS.map(function (c, i) { return { val: c, label: D.LIP_NAMES[i], color: c }; }); } }
      ]
    },
    {
      id: 'hair', label: '发型',
      groups: [
        { title: '发型', type: 'pill', key: 'hair',
          items: function () { return Object.keys(D.HAIRS).map(function (k) { return { val: k, label: D.HAIRS[k].name }; }); } },
        { title: '刘海', type: 'pill', key: 'fringe',
          items: function () { return Object.keys(D.FRINGES).map(function (k) { return { val: k, label: D.FRINGES[k].name }; }); } },
        { title: '发色', type: 'color', key: 'hairColor',
          items: function () { return D.HAIR_COLORS.map(function (c, i) { return { val: c, label: D.HAIR_NAMES[i], color: c }; }); } }
      ]
    },
    {
      id: 'detail', label: '细节',
      groups: [
        { title: '腮红', type: 'pill', key: 'blush',
          items: function () { return [{ val: 'none', label: '无' }, { val: 'soft', label: '淡' }, { val: 'strong', label: '明显' }]; } },
        { title: '眼镜', type: 'pill', key: 'glasses',
          items: function () { return [{ val: 'none', label: '不戴' }, { val: 'thin', label: '细框' }, { val: 'round', label: '圆框' }, { val: 'sun', label: '墨镜' }]; } },
        { title: '耳饰', type: 'pill', key: 'earring',
          items: function () { return [{ val: 'none', label: '无' }, { val: 'pearl', label: '珍珠' }, { val: 'hoop', label: '金环' }, { val: 'drop', label: '水滴' }]; } },
        { title: '雀斑', type: 'pill', key: 'freckle',
          items: function () { return [{ val: 'off', label: '无' }, { val: 'on', label: '有' }]; } }
      ]
    },
    {
      id: 'bg', label: '背景',
      groups: [
        { title: '色调', type: 'bg', key: 'bg',
          items: function () {
            return Object.keys(D.BGS).map(function (k) {
              var b = D.BGS[k];
              return { val: k, label: b.name, from: b.from, to: b.to };
            });
          } }
      ]
    }
  ];

  var activeTab = 'face';

  /* ---------------- 渲染 ---------------- */
  function renderPortrait() {
    var host = document.getElementById('stagePortrait');
    if (host) host.innerHTML = D.buildPortrait(state, 'main');
  }

  function renderTabs() {
    var el = document.getElementById('tabs');
    el.innerHTML = TABS.map(function (t) {
      return '<button class="tab' + (t.id === activeTab ? ' is-on' : '') + '" data-tab="' + t.id + '">' + t.label + '</button>';
    }).join('');
  }

  function renderOptions() {
    var tab = TABS.filter(function (t) { return t.id === activeTab; })[0];
    var el = document.getElementById('options');
    el.innerHTML = tab.groups.map(function (g) {
      var items = g.items();
      var body;

      if (g.type === 'icon') {
        body = '<div class="grid grid-icon">' + items.map(function (it) {
          var on = state[g.key] === it.val ? ' is-on' : '';
          return '<button class="opt opt-icon' + on + '" data-key="' + g.key + '" data-val="' + it.val + '">' +
            it.icon + '<span>' + it.label + '</span></button>';
        }).join('') + '</div>';
      } else if (g.type === 'color') {
        body = '<div class="grid grid-color">' + items.map(function (it) {
          var on = String(state[g.key]) === String(it.val) ? ' is-on' : '';
          return '<button class="opt opt-color' + on + '" data-key="' + g.key + '" data-val="' + it.val + '" title="' + it.label + '">' +
            '<i style="background:' + it.color + '"></i></button>';
        }).join('') + '</div>';
      } else if (g.type === 'bg') {
        body = '<div class="grid grid-bg">' + items.map(function (it) {
          var on = state[g.key] === it.val ? ' is-on' : '';
          return '<button class="opt opt-bg' + on + '" data-key="' + g.key + '" data-val="' + it.val + '">' +
            '<i style="background:linear-gradient(160deg,' + it.from + ',' + it.to + ')"></i><span>' + it.label + '</span></button>';
        }).join('') + '</div>';
      } else {
        body = '<div class="grid grid-pill">' + items.map(function (it) {
          var on = state[g.key] === it.val ? ' is-on' : '';
          return '<button class="opt opt-pill' + on + '" data-key="' + g.key + '" data-val="' + it.val + '">' + it.label + '</button>';
        }).join('') + '</div>';
      }

      return '<div class="group"><div class="group-head"><h4>' + g.title + '</h4></div>' + body + '</div>';
    }).join('');
  }

  function renderAll() {
    renderTabs();
    renderOptions();
    renderPortrait();
    renderRecipe();
  }

  function renderRecipe() {
    var el = document.getElementById('recipeText');
    if (!el) return;
    el.textContent = [
      D.FACES[state.face].name,
      D.SKINS[state.skin].name + '肤色',
      D.EYES[state.eye].name,
      D.BROWS[state.brow].name,
      D.NOSES[state.nose].name,
      D.LIPS[state.lip].name,
      D.HAIRS[state.hair].name,
      D.FRINGES[state.fringe].name,
      D.BGS[state.bg].name + '底'
    ].join(' · ');
  }

  /* ---------------- 事件 ---------------- */
  document.addEventListener('click', function (e) {
    var tab = e.target.closest('[data-tab]');
    if (tab) {
      activeTab = tab.getAttribute('data-tab');
      renderTabs();
      renderOptions();
      return;
    }

    var opt = e.target.closest('.opt');
    if (opt) {
      var key = opt.getAttribute('data-key');
      var raw = opt.getAttribute('data-val');
      var val = raw;
      if (key === 'skin') val = parseInt(raw, 10);
      state[key] = val;
      renderOptions();
      renderPortrait();
      renderRecipe();
      return;
    }

    var g = e.target.closest('[data-gender]');
    if (g) {
      var gender = g.getAttribute('data-gender');
      state.gender = gender;
      Object.keys(PRESETS[gender]).forEach(function (k) { state[k] = PRESETS[gender][k]; });
      document.querySelectorAll('[data-gender]').forEach(function (b) {
        b.classList.toggle('is-on', b.getAttribute('data-gender') === gender);
      });
      renderAll();
      return;
    }
  });

  /* 随机 */
  function pick(obj) {
    var keys = Object.keys(obj);
    return keys[Math.floor(Math.random() * keys.length)];
  }
  function pickArr(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function shuffle() {
    state.face = pick(D.FACES);
    state.skin = Math.floor(Math.random() * D.SKINS.length);
    state.eye = pick(D.EYES);
    state.iris = pickArr(D.IRIS_COLORS);
    state.brow = pick(D.BROWS);
    state.nose = pick(D.NOSES);
    state.lip = pick(D.LIPS);
    state.lipColor = pickArr(D.LIP_COLORS);
    state.hair = pick(D.HAIRS);
    state.fringe = pick(D.FRINGES);
    state.hairColor = pickArr(D.HAIR_COLORS);
    state.glasses = pickArr(['none', 'none', 'none', 'thin', 'round']);
    state.earring = pickArr(['none', 'pearl', 'hoop', 'drop']);
    state.freckle = pickArr(['off', 'off', 'on']);
    state.bg = pick(D.BGS);
    renderAll();
    flash();
  }

  function flash() {
    var card = document.getElementById('stageCard');
    if (!card) return;
    card.classList.remove('is-flash');
    void card.offsetWidth;
    card.classList.add('is-flash');
  }

  /* 重置 */
  function reset() {
    var p = PRESETS[state.gender];
    Object.keys(p).forEach(function (k) { state[k] = p[k]; });
    state.skin = 1;
    state.iris = '#5A3A28';
    state.lipColor = '#C4837F';
    state.hairColor = '#241C24';
    state.blush = 'soft';
    state.glasses = 'none';
    state.earring = 'none';
    state.freckle = 'off';
    renderAll();
    flash();
    toast('已重置为默认组合');
  }

  /* 下载 PNG */
  function download() {
    var host = document.getElementById('stagePortrait');
    var svg = host.querySelector('svg');
    if (!svg) return;

    var clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', '1200');
    clone.setAttribute('height', '1400');
    clone.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    var str = new XMLSerializer().serializeToString(clone);
    var blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var img = new Image();

    img.onload = function () {
      var c = document.createElement('canvas');
      c.width = 1200;
      c.height = 1400;
      var ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, 1200, 1400);
      URL.revokeObjectURL(url);
      c.toBlob(function (b) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'dreamgirl-' + Date.now() + '.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      }, 'image/png');
    };
    img.onerror = function () { toast('导出失败，请换个浏览器试试'); };
    img.src = url;
  }

  /* 收藏 */
  var STORE = 'dreamgirl.looks.v1';

  function loadLooks() {
    try { return JSON.parse(localStorage.getItem(STORE) || '[]'); } catch (e) { return []; }
  }
  function saveLooks(list) {
    try { localStorage.setItem(STORE, JSON.stringify(list.slice(0, 12))); } catch (e) {}
  }

  function saveLook() {
    var list = loadLooks();
    list.unshift(JSON.parse(JSON.stringify(state)));
    saveLooks(list);
    renderGallery();
    flash();
    toast('已生成并保存到「我的作品」');
  }

  function renderGallery() {
    var list = loadLooks();
    var wrap = document.getElementById('galleryGrid');
    var empty = document.getElementById('galleryEmpty');
    if (!wrap) return;

    if (!list.length) {
      wrap.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }
    if (empty) empty.style.display = 'none';

    wrap.innerHTML = list.map(function (st, i) {
      return '<figure class="look" data-idx="' + i + '">' +
        '<div class="look-img">' + D.buildPortrait(st, 'g' + i) + '</div>' +
        '<figcaption><span>#' + (list.length - i) + '</span>' +
        '<button class="look-del" data-del="' + i + '" title="删除">✕</button></figcaption>' +
        '</figure>';
    }).join('');
  }

  document.addEventListener('click', function (e) {
    var del = e.target.closest('[data-del]');
    if (del) {
      e.stopPropagation();
      var idx = parseInt(del.getAttribute('data-del'), 10);
      var list = loadLooks();
      list.splice(idx, 1);
      saveLooks(list);
      renderGallery();
      return;
    }
    var look = e.target.closest('.look');
    if (look) {
      var list2 = loadLooks();
      var i2 = parseInt(look.getAttribute('data-idx'), 10);
      if (list2[i2]) {
        state = list2[i2];
        document.querySelectorAll('[data-gender]').forEach(function (b) {
          b.classList.toggle('is-on', b.getAttribute('data-gender') === state.gender);
        });
        renderAll();
        document.getElementById('studio').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  /* Toast */
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 2400);
  }

  /* 按钮绑定 */
  document.addEventListener('DOMContentLoaded', function () {
    // 支持通过 #tab 深链接直接打开某个分类
    var hash = (location.hash || '').replace('#', '');
    if (hash && TABS.some(function (t) { return t.id === hash; })) activeTab = hash;

    document.querySelectorAll('[data-gender]').forEach(function (b) {
      b.classList.toggle('is-on', b.getAttribute('data-gender') === state.gender);
    });

    var map = {
      randomBtn: shuffle,
      randomBtn2: shuffle,
      randomBtn3: shuffle,
      downloadBtn: download,
      saveBtn: saveLook,
      resetBtn: reset
    };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('click', map[id]);
    });

    renderAll();
    renderGallery();
  });
})();

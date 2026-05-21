(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const COUNT = 20;
  const SIZE = 6;
  const LERP = 0.15;

  let mx = 0, my = 0, raf;

  const el = document.createElement('div');
  el.style.cssText =
    'position:fixed;top:0;left:0;width:' + SIZE + 'px;height:' + SIZE + 'px;' +
    'border-radius:50%;background:var(--accent);pointer-events:none;z-index:9999;' +
    'transform:translate(-50%,-50%);will-change:transform;transition:background 0.3s;';
  document.body.appendChild(el);

  const trail = [];
  for (let i = 0; i < COUNT; i++) {
    const d = document.createElement('div');
    const opacity = 0.6 * (1 - i / COUNT);
    const s = SIZE * (1 - i / COUNT * 0.5);
    d.style.cssText =
      'position:fixed;top:0;left:0;width:' + s + 'px;height:' + s + 'px;' +
      'border-radius:50%;background:var(--accent);pointer-events:none;z-index:9998;' +
      'transform:translate(-50%,-50%);opacity:' + opacity + ';' +
      'will-change:transform,opacity;transition:background 0.3s,opacity 0.3s;';
    document.body.appendChild(d);
    trail.push({ el: d, x: 0, y: 0 });
  }

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
  });

  function frame() {
    trail[0].x += (mx - trail[0].x) * LERP;
    trail[0].y += (my - trail[0].y) * LERP;
    trail[0].el.style.transform = 'translate(-50%,-50%) translate(' + trail[0].x + 'px,' + trail[0].y + 'px)';

    for (let i = 1; i < COUNT; i++) {
      const prev = trail[i - 1];
      const cur = trail[i];
      cur.x += (prev.x - cur.x) * LERP;
      cur.y += (prev.y - cur.y) * LERP;
      cur.el.style.transform = 'translate(-50%,-50%) translate(' + cur.x + 'px,' + cur.y + 'px)';
    }

    el.style.transform = 'translate(-50%,-50%) translate(' + mx + 'px,' + my + 'px)';

    raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);

  window.__updateCursorTrail = function () {
    el.style.background = 'var(--accent)';
    trail.forEach(function (d) { d.el.style.background = 'var(--accent)'; });
  };
})();

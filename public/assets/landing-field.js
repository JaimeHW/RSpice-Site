(function () {
  "use strict";

  var canvas = document.querySelector("[data-landing-field]");
  if (!canvas || !canvas.getContext) return;

  var context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var routes = [];
  var width = 0;
  var height = 0;
  var pixelRatio = 1;
  var animationFrame = 0;
  var previousFrame = 0;
  var pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };

  function seededRandom(seed) {
    var state = seed >>> 0;
    return function () {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function rebuildRoutes() {
    var random = seededRandom(Math.round(width) * 31 + Math.round(height) * 17 + 20260710);
    var spacing = width < 700 ? 54 : 72;
    var routeCount = Math.max(10, Math.min(22, Math.ceil(width / 105)));
    routes = [];

    for (var index = 0; index < routeCount; index += 1) {
      var fromLeft = index % 2 === 0;
      var y1 = Math.round((random() * (height + spacing * 2) - spacing) / spacing) * spacing;
      var y2 = Math.round((random() * (height + spacing * 2) - spacing) / spacing) * spacing;
      var x1 = Math.round((width * (0.18 + random() * 0.28)) / spacing) * spacing;
      var x2 = Math.round((width * (0.56 + random() * 0.31)) / spacing) * spacing;
      var start = fromLeft ? -spacing : width + spacing;
      var end = fromLeft ? width + spacing : -spacing;
      var points = fromLeft
        ? [{ x: start, y: y1 }, { x: x1, y: y1 }, { x: x1, y: y2 }, { x: x2, y: y2 }, { x: x2, y: y1 }, { x: end, y: y1 }]
        : [{ x: start, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 }, { x: x1, y: y1 }, { x: end, y: y1 }];
      var total = 0;

      for (var point = 1; point < points.length; point += 1) {
        total += Math.abs(points[point].x - points[point - 1].x) + Math.abs(points[point].y - points[point - 1].y);
      }

      routes.push({ points: points, total: total, offset: random(), speed: 0.000018 + random() * 0.000018, accent: index % 5 === 0 });
    }
  }

  function resize() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    pointer.x = pointer.targetX = width * 0.5;
    pointer.y = pointer.targetY = height * 0.42;
    rebuildRoutes();
    draw(performance.now());
  }

  function pointAlong(route, distance) {
    var remaining = distance;
    for (var index = 1; index < route.points.length; index += 1) {
      var from = route.points[index - 1];
      var to = route.points[index];
      var length = Math.abs(to.x - from.x) + Math.abs(to.y - from.y);
      if (remaining <= length) {
        var ratio = length ? remaining / length : 0;
        return { x: from.x + (to.x - from.x) * ratio, y: from.y + (to.y - from.y) * ratio };
      }
      remaining -= length;
    }
    return route.points[route.points.length - 1];
  }

  function drawGrid(offsetX, offsetY) {
    var spacing = width < 700 ? 54 : 72;
    context.beginPath();
    for (var x = (offsetX % spacing) - spacing; x < width + spacing; x += spacing) {
      context.moveTo(Math.round(x) + 0.5, 0);
      context.lineTo(Math.round(x) + 0.5, height);
    }
    for (var y = (offsetY % spacing) - spacing; y < height + spacing; y += spacing) {
      context.moveTo(0, Math.round(y) + 0.5);
      context.lineTo(width, Math.round(y) + 0.5);
    }
    context.strokeStyle = "rgba(207, 216, 221, 0.022)";
    context.lineWidth = 1;
    context.stroke();
  }

  function draw(timestamp) {
    context.clearRect(0, 0, width, height);
    pointer.x += (pointer.targetX - pointer.x) * 0.075;
    pointer.y += (pointer.targetY - pointer.y) * 0.075;

    var driftX = (pointer.x / width - 0.5) * -10;
    var driftY = (pointer.y / height - 0.5) * -8;
    drawGrid(driftX, driftY);

    var halo = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, Math.max(220, width * 0.24));
    halo.addColorStop(0, "rgba(242, 184, 36, 0.045)");
    halo.addColorStop(0.45, "rgba(114, 201, 183, 0.018)");
    halo.addColorStop(1, "rgba(9, 11, 13, 0)");
    context.fillStyle = halo;
    context.fillRect(0, 0, width, height);

    routes.forEach(function (route, routeIndex) {
      context.beginPath();
      route.points.forEach(function (point, pointIndex) {
        var x = point.x + driftX * (0.25 + (routeIndex % 4) * 0.08);
        var y = point.y + driftY * (0.25 + (routeIndex % 3) * 0.08);
        if (pointIndex === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.strokeStyle = route.accent ? "rgba(242, 184, 36, 0.075)" : "rgba(185, 198, 202, 0.055)";
      context.lineWidth = route.accent ? 1.1 : 0.8;
      context.stroke();

      route.points.slice(1, -1).forEach(function (point, pointIndex) {
        if (pointIndex % 2 !== 0) return;
        context.beginPath();
        context.arc(point.x + driftX * 0.35, point.y + driftY * 0.35, route.accent ? 2 : 1.5, 0, Math.PI * 2);
        context.fillStyle = route.accent ? "rgba(242, 184, 36, 0.16)" : "rgba(190, 203, 207, 0.11)";
        context.fill();
      });

      var progress = reducedMotion.matches ? route.offset : (route.offset + timestamp * route.speed) % 1;
      var pulse = pointAlong(route, progress * route.total);
      context.beginPath();
      context.arc(pulse.x + driftX * 0.35, pulse.y + driftY * 0.35, route.accent ? 2.1 : 1.25, 0, Math.PI * 2);
      context.fillStyle = route.accent ? "rgba(255, 205, 72, 0.56)" : "rgba(153, 211, 198, 0.27)";
      context.fill();
    });
  }

  function animate(timestamp) {
    if (timestamp - previousFrame >= 33) {
      previousFrame = timestamp;
      draw(timestamp);
    }
    animationFrame = window.requestAnimationFrame(animate);
  }

  function updateAnimation() {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    if (!reducedMotion.matches && !document.hidden) animationFrame = window.requestAnimationFrame(animate);
    else draw(performance.now());
  }

  window.addEventListener("pointermove", function (event) {
    pointer.targetX = event.clientX;
    pointer.targetY = event.clientY;
  }, { passive: true });
  window.addEventListener("pointerleave", function () {
    pointer.targetX = width * 0.5;
    pointer.targetY = height * 0.42;
  });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", updateAnimation);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", updateAnimation);

  resize();
  updateAnimation();
})();

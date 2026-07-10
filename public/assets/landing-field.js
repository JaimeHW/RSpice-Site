(function () {
  "use strict";

  var canvas = document.querySelector("[data-landing-field]");
  if (!canvas || !canvas.getContext) return;

  var context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var contours = [];
  var strokeGradient = null;
  var width = 0;
  var height = 0;
  var pixelRatio = 1;
  var animationFrame = 0;
  var previousFrame = 0;
  var pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    strength: 0,
    targetStrength: 0
  };

  function seededRandom(seed) {
    var state = seed >>> 0;
    return function () {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function rebuildContours() {
    var random = seededRandom(Math.round(width) * 23 + Math.round(height) * 11 + 730201);
    var count = width < 700 ? 9 : 14;
    var usableHeight = height * 0.88;
    contours = [];

    for (var index = 0; index < count; index += 1) {
      contours.push({
        y: height * 0.06 + usableHeight * ((index + 0.5) / count),
        amplitudeA: 3.5 + random() * 7,
        amplitudeB: 1.5 + random() * 4,
        frequencyA: Math.PI * 2 * (0.75 + random() * 0.8) / width,
        frequencyB: Math.PI * 2 * (1.8 + random() * 1.4) / width,
        phaseA: random() * Math.PI * 2,
        phaseB: random() * Math.PI * 2,
        speed: (random() - 0.5) * 0.000025,
        opacity: index % 4 === 0 ? 0.13 : 0.075,
        major: index % 4 === 0
      });
    }

    strokeGradient = context.createLinearGradient(0, 0, width, 0);
    strokeGradient.addColorStop(0, "rgba(152, 165, 171, 0)");
    strokeGradient.addColorStop(0.1, "rgba(152, 165, 171, 0.42)");
    strokeGradient.addColorStop(0.5, "rgba(166, 177, 182, 0.62)");
    strokeGradient.addColorStop(0.9, "rgba(152, 165, 171, 0.42)");
    strokeGradient.addColorStop(1, "rgba(152, 165, 171, 0)");
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
    pointer.y = pointer.targetY = height * 0.44;
    rebuildContours();
    draw(performance.now());
  }

  function contourY(contour, x, timestamp) {
    var phase = timestamp * contour.speed;
    var y = contour.y
      + Math.sin(x * contour.frequencyA + contour.phaseA + phase) * contour.amplitudeA
      + Math.sin(x * contour.frequencyB + contour.phaseB - phase * 0.58) * contour.amplitudeB;

    if (pointer.strength > 0.001) {
      var radiusX = Math.max(190, width * 0.17);
      var radiusY = 155;
      var distanceX = (x - pointer.x) / radiusX;
      var distanceY = (y - pointer.y) / radiusY;
      var influence = Math.exp(-(distanceX * distanceX * 2.2 + distanceY * distanceY * 1.35));
      var direction = y >= pointer.y ? 1 : -1;
      y += direction * influence * 8 * pointer.strength;
    }

    return y;
  }

  function draw(timestamp) {
    context.clearRect(0, 0, width, height);
    pointer.x += (pointer.targetX - pointer.x) * 0.06;
    pointer.y += (pointer.targetY - pointer.y) * 0.06;
    pointer.strength += (pointer.targetStrength - pointer.strength) * 0.055;
    context.strokeStyle = strokeGradient;

    contours.forEach(function (contour) {
      context.beginPath();
      for (var x = -8; x <= width + 8; x += 8) {
        var y = contourY(contour, x, timestamp);
        if (x === -8) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.globalAlpha = contour.opacity;
      context.lineWidth = contour.major ? 0.9 : 0.65;
      context.stroke();
    });

    context.globalAlpha = 1;
  }

  function animate(timestamp) {
    if (timestamp - previousFrame >= 50) {
      previousFrame = timestamp;
      draw(timestamp);
    }
    animationFrame = window.requestAnimationFrame(animate);
  }

  function updateAnimation() {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    if (!reducedMotion.matches && !document.hidden) {
      animationFrame = window.requestAnimationFrame(animate);
    } else {
      pointer.strength = 0;
      draw(0);
    }
  }

  window.addEventListener("pointermove", function (event) {
    pointer.targetX = event.clientX;
    pointer.targetY = event.clientY;
    pointer.targetStrength = event.pointerType === "touch" ? 0 : 1;
  }, { passive: true });
  window.addEventListener("pointerleave", function () {
    pointer.targetStrength = 0;
  });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", updateAnimation);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", updateAnimation);

  resize();
  updateAnimation();
})();

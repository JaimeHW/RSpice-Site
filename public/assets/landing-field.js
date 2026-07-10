(function () {
  "use strict";

  var canvas = document.querySelector("[data-landing-field]");
  if (!canvas || !canvas.getContext) return;

  var context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var width = 1;
  var height = 1;
  var pixelRatio = 1;
  var animationFrame = 0;
  var previousFrame = 0;
  var noisePattern = null;
  var pointer = {
    x: 0.5,
    y: 0.42,
    targetX: 0.5,
    targetY: 0.42,
    strength: 0,
    targetStrength: 0
  };

  function buildNoisePattern() {
    var noise = document.createElement("canvas");
    var size = 96;
    var state = 912367;
    noise.width = size;
    noise.height = size;

    var noiseContext = noise.getContext("2d");
    if (!noiseContext) return null;

    var image = noiseContext.createImageData(size, size);
    for (var index = 0; index < image.data.length; index += 4) {
      state = (state * 1664525 + 1013904223) >>> 0;
      var value = 205 + ((state >>> 24) % 51);
      image.data[index] = value;
      image.data[index + 1] = value;
      image.data[index + 2] = value;
      image.data[index + 3] = 18 + ((state >>> 17) % 28);
    }
    noiseContext.putImageData(image, 0, 0);
    return context.createPattern(noise, "repeat");
  }

  function drawBloom(x, y, radiusX, radiusY, color, opacity) {
    context.save();
    context.translate(x, y);
    context.scale(radiusX, radiusY);

    var gradient = context.createRadialGradient(0, 0, 0, 0, 0, 1);
    gradient.addColorStop(0, "rgba(" + color + ", " + opacity + ")");
    gradient.addColorStop(0.34, "rgba(" + color + ", " + (opacity * 0.62) + ")");
    gradient.addColorStop(0.72, "rgba(" + color + ", " + (opacity * 0.16) + ")");
    gradient.addColorStop(1, "rgba(" + color + ", 0)");
    context.fillStyle = gradient;
    context.fillRect(-1, -1, 2, 2);
    context.restore();
  }

  function draw(timestamp) {
    var phase = timestamp * 0.000025;
    pointer.x += (pointer.targetX - pointer.x) * 0.035;
    pointer.y += (pointer.targetY - pointer.y) * 0.035;
    pointer.strength += (pointer.targetStrength - pointer.strength) * 0.045;

    context.clearRect(0, 0, width, height);

    drawBloom(
      width * (0.12 + Math.sin(phase) * 0.025 + (pointer.x - 0.5) * 0.018),
      height * (0.12 + Math.cos(phase * 0.82) * 0.025),
      Math.max(width * 0.64, 540),
      Math.max(height * 0.68, 430),
      "34, 135, 128",
      0.075
    );

    drawBloom(
      width * (0.92 + Math.cos(phase * 0.73) * 0.022 + (pointer.x - 0.5) * 0.012),
      height * (0.46 + Math.sin(phase * 0.64) * 0.03),
      Math.max(width * 0.55, 500),
      Math.max(height * 0.74, 520),
      "77, 85, 161",
      0.052
    );

    drawBloom(
      width * (0.48 + Math.sin(phase * 0.41) * 0.02),
      height * 1.04,
      Math.max(width * 0.72, 620),
      Math.max(height * 0.55, 390),
      "176, 118, 52",
      0.025
    );

    if (pointer.strength > 0.002) {
      drawBloom(
        pointer.x * width,
        pointer.y * height,
        Math.max(width * 0.3, 310),
        Math.max(height * 0.46, 310),
        "68, 155, 145",
        0.018 * pointer.strength
      );
    }

    if (noisePattern) {
      context.save();
      context.globalAlpha = 0.027;
      context.fillStyle = noisePattern;
      context.fillRect(0, 0, width, height);
      context.restore();
    }
  }

  function resize() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.35);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    noisePattern = buildNoisePattern();
    draw(reducedMotion.matches ? 0 : performance.now());
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
    pointer.targetX = event.clientX / Math.max(1, width);
    pointer.targetY = event.clientY / Math.max(1, height);
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

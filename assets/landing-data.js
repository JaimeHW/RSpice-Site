(function () {
  "use strict";

  var fields = Array.prototype.slice.call(document.querySelectorAll("[data-catalog-field]"));
  if (!fields.length || !window.fetch) return;

  function valueAtPath(source, path) {
    return path.split(".").reduce(function (value, key) {
      return value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : null;
    }, source);
  }

  fetch("reference/catalog.json", {
    credentials: "same-origin",
    headers: { "Accept": "application/json" }
  }).then(function (response) {
    if (!response.ok) throw new Error("catalog request failed");
    return response.json();
  }).then(function (catalog) {
    fields.forEach(function (field) {
      var path = field.getAttribute("data-catalog-field") || "";
      var value = valueAtPath(catalog, path);
      if (value !== null && value !== undefined) field.textContent = String(value);
    });
    document.documentElement.setAttribute("data-catalog-state", "ready");
  }).catch(function () {
    document.documentElement.setAttribute("data-catalog-state", "fallback");
  });
})();

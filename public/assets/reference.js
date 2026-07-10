(function () {
  "use strict";

  var input = document.querySelector("[data-reference-search]");
  var count = document.querySelector("[data-reference-count]");
  if (!input || !count) return;

  var items = Array.prototype.slice.call(document.querySelectorAll("[data-reference-item]"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("[data-reference-section]"));
  var groups = Array.prototype.slice.call(document.querySelectorAll("[data-reference-group]"));

  function normalizedTerms(value) {
    return value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  }

  function matches(item, terms) {
    var text = (item.getAttribute("data-search-text") || item.textContent || "").toLowerCase();
    return terms.every(function (term) { return text.indexOf(term) !== -1; });
  }

  function update() {
    var terms = normalizedTerms(input.value);
    var shown = 0;

    items.forEach(function (item) {
      var visible = matches(item, terms);
      item.hidden = !visible;
      if (visible) shown += 1;
    });

    groups.forEach(function (group) {
      var visibleItems = Array.prototype.slice.call(group.querySelectorAll("[data-reference-item]")).some(function (item) {
        return !item.hidden;
      });
      group.hidden = !visibleItems;
      if (terms.length && visibleItems) group.open = true;
    });

    sections.forEach(function (section) {
      var visibleItems = Array.prototype.slice.call(section.querySelectorAll("[data-reference-item]")).some(function (item) {
        return !item.hidden;
      });
      section.hidden = !visibleItems;
    });

    count.textContent = shown + (shown === 1 ? " entry shown" : " entries shown");
  }

  input.addEventListener("input", update);
  input.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && input.value) {
      input.value = "";
      update();
    }
  });
})();

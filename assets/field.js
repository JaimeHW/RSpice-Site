(function () {
  "use strict";

  var trigger = document.querySelector("[data-nav-trigger]");
  var navigation = document.querySelector("[data-site-nav]");

  function setNavigation(open) {
    if (!trigger || !navigation) return;
    trigger.setAttribute("aria-expanded", String(open));
    navigation.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    var label = trigger.querySelector(".visually-hidden");
    if (label) label.textContent = open ? "Close navigation" : "Open navigation";
  }

  if (trigger && navigation) {
    trigger.addEventListener("click", function () {
      setNavigation(trigger.getAttribute("aria-expanded") !== "true");
    });

    navigation.addEventListener("click", function (event) {
      if (event.target.closest("a")) setNavigation(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setNavigation(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 930) setNavigation(false);
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });
})();

/* Riversong Cabin — menu, header, scroll reveal and photo lightbox. */
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  // ---------- Mobile menu ----------
  var header = document.getElementById("site-header");
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var setMenu = function (open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (header) header.classList.toggle("scrolled", open || window.scrollY > 40);
  };
  if (toggle && nav) {
    toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); toggle.focus(); }
    });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  }

  // ---------- Transparent header over the hero ----------
  if (header && header.classList.contains("over-hero")) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 40 || (nav && nav.classList.contains("open")));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---------- Footer year ----------
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ---------- Reveal on scroll ----------
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // ---------- Lightbox (one per gallery) ----------
  var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  if (!buttons.length) return;

  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "Photo viewer");
  lb.innerHTML =
    '<button type="button" class="lb-btn lb-close" aria-label="Close photo viewer">&times;</button>' +
    '<button type="button" class="lb-btn lb-prev" aria-label="Previous photo">&lsaquo;</button>' +
    '<figure><img alt=""><figcaption></figcaption><span class="lb-count" aria-live="polite"></span></figure>' +
    '<button type="button" class="lb-btn lb-next" aria-label="Next photo">&rsaquo;</button>';
  document.body.appendChild(lb);
  var lbImg = lb.querySelector("img");
  var lbCap = lb.querySelector("figcaption");
  var lbCount = lb.querySelector(".lb-count");
  var controls = Array.prototype.slice.call(lb.querySelectorAll("button"));
  var set = [];
  var idx = 0;
  var lastFocus = null;

  var show = function (i) {
    idx = (i + set.length) % set.length;
    var b = set[idx];
    var img = b.querySelector("img");
    lbImg.src = b.getAttribute("data-lightbox");
    lbImg.alt = img ? img.alt : "";
    lbCap.textContent = b.getAttribute("data-caption") || (img ? img.alt : "");
    lbCount.textContent = (idx + 1) + " / " + set.length;
  };
  var open = function (btn) {
    var gallery = btn.closest("[data-gallery]");
    set = gallery ? buttons.filter(function (b) { return gallery.contains(b); }) : buttons;
    lastFocus = btn;
    show(set.indexOf(btn));
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    lb.querySelector(".lb-close").focus();
  };
  var close = function () {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    lbImg.removeAttribute("src");
    if (lastFocus) lastFocus.focus();
  };

  buttons.forEach(function (b) { b.addEventListener("click", function () { open(b); }); });
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
  lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowLeft") show(idx - 1);
    else if (e.key === "ArrowRight") show(idx + 1);
    else if (e.key === "Tab") {
      // keep focus inside the viewer
      var first = controls[0], last = controls[controls.length - 1];
      var i = controls.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && i === controls.length - 1) { e.preventDefault(); first.focus(); }
    }
  });

  // Swipe left/right on touch screens
  var startX = null;
  lb.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    startX = null;
  });
})();

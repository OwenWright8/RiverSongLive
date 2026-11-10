/* Riversong availability calendar.
   Booked nights come from data/booked.json, which a GitHub Action copies from
   Darlene's Google Calendar every hour (see scripts/update_calendar.py).
   If that file can't be loaded, the original Google Calendar embed is shown instead. */
(function () {
  "use strict";
  var root = document.getElementById("calendar");
  if (!root) return;

  var monthsEl = root.querySelector(".cal-months");
  var label = root.querySelector("[data-cal-label]");
  var status = root.querySelector("[data-cal-status]");
  var prevBtn = root.querySelector("[data-cal-prev]");
  var nextBtn = root.querySelector("[data-cal-next]");

  var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
  var key = function (y, m, d) { return y + "-" + pad(m + 1) + "-" + pad(d); };
  var booked = {};

  var now = new Date();
  var todayKey = key(now.getFullYear(), now.getMonth(), now.getDate());
  var firstMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  var view = firstMonth;
  var perView = function () { return window.matchMedia("(max-width: 820px)").matches ? 1 : 2; };

  function renderMonth(y, m) {
    var first = new Date(y, m, 1);
    var days = new Date(y, m + 1, 0).getDate();
    var name = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    var month = name.split(" ")[0];
    var html = '<div class="cal-month"><h3>' + name + '</h3><div class="cal-grid" role="grid" aria-label="' + name + '"><div class="cal-row" role="row">';
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(function (d) {
      html += '<div class="cal-dow" role="columnheader" aria-label="' + d + '">' + d.slice(0, 2) + "</div>";
    });
    html += "</div><div class=\"cal-row\" role=\"row\">";
    for (var i = 0; i < first.getDay(); i++) html += '<div class="cal-day empty" role="gridcell"></div>';
    for (var d = 1; d <= days; d++) {
      var k = key(y, m, d);
      var cls = "cal-day";
      var desc = "open";
      if (k < todayKey) { cls += " past"; desc = "past"; }
      else if (booked[k]) { cls += " booked"; desc = "booked"; }
      if (k === todayKey) cls += " today";
      html += '<div class="' + cls + '" role="gridcell" aria-label="' + month + " " + d + ", " + desc + '"><span>' + d + "</span></div>";
      if ((first.getDay() + d) % 7 === 0 && d < days) html += '</div><div class="cal-row" role="row">';
    }
    return html + "</div></div></div>";
  }

  function render() {
    var n = perView();
    var html = "";
    for (var i = 0; i < n; i++) {
      var dt = new Date(view.getFullYear(), view.getMonth() + i, 1);
      html += renderMonth(dt.getFullYear(), dt.getMonth());
    }
    monthsEl.innerHTML = html;
    var last = new Date(view.getFullYear(), view.getMonth() + n - 1, 1);
    label.textContent = n === 1
      ? view.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : view.toLocaleDateString("en-US", { month: "short" }) + " – " + last.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    prevBtn.disabled = view <= firstMonth;
  }

  prevBtn.addEventListener("click", function () {
    var prev = new Date(view.getFullYear(), view.getMonth() - 1, 1);
    if (prev >= firstMonth) { view = prev; render(); }
  });
  nextBtn.addEventListener("click", function () {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1); render();
  });
  var lastPer = perView();
  window.addEventListener("resize", function () { if (perView() !== lastPer) { lastPer = perView(); render(); } });

  function showGoogleEmbed() {
    var tpl = document.getElementById("google-cal");
    root.querySelector(".cal-live").hidden = true;
    if (tpl) root.querySelector(".cal-fallback").appendChild(tpl.content.cloneNode(true));
  }

  render();
  fetch("data/booked.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (data) {
      if (!data || !Array.isArray(data.nights)) throw new Error("Unexpected format");
      booked = {};
      data.nights.forEach(function (k) { booked[k] = true; });
      render();
      if (data.updated) {
        var u = new Date(data.updated.replace("Z", ":00Z"));
        if (!isNaN(u)) status.textContent = "Bookings last changed " + u.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) + ". Please call to confirm your dates.";
      }
    })
    .catch(showGoogleEmbed);
})();

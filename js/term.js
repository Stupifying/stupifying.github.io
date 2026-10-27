// Small bits of terminal life: spinner, glitchy banner, sneezing dog, and the A2 screen toggle.
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // add ?draft to the URL to outline every paragraph that is still a draft
  if (/[?&]draft\b/.test(location.search)) document.documentElement.classList.add("show-drafts");

  /* ---------- Spinner: ✻ Sketching… (12s · esc to interrupt) ---------- */
  var line = document.querySelector("[data-spinner]");
  if (line) {
    var glyphEl = line.querySelector(".spin-glyph");
    var verbEl = line.querySelector(".spin-verb");
    var timeEl = line.querySelector(".spin-time");
    var glyphs = ["·", "✢", "✳", "✶", "✻", "✽", "✻", "✶", "✳", "✢"];
    var verbs = (line.getAttribute("data-verbs") || "Sketching").split("|");
    var start = Date.now();
    var g = 0, v = 0, running = !reduceMotion;
    var glyphTimer, verbTimer, clockTimer;

    function tickGlyph() { g = (g + 1) % glyphs.length; glyphEl.textContent = glyphs[g]; }
    function tickClock() { timeEl.textContent = Math.floor((Date.now() - start) / 1000) + "s"; }

    // scramble the old verb into the new one, a few characters at a time
    function scrambleTo(text) {
      var noise = "▓▒░█#%&@*+=<>/";
      var frame = 0, total = 14;
      var from = verbEl.textContent;
      var len = Math.max(from.length, text.length);
      var timer = setInterval(function () {
        frame++;
        var out = "";
        for (var i = 0; i < len; i++) {
          var settled = i < (frame / total) * len;
          if (settled) out += text[i] || "";
          else out += Math.random() < 0.5 ? noise[Math.floor(Math.random() * noise.length)] : (from[i] || "");
        }
        verbEl.textContent = out;
        if (frame >= total) { clearInterval(timer); verbEl.textContent = text; }
      }, 40);
    }
    function tickVerb() { v = (v + 1) % verbs.length; scrambleTo(verbs[v] + "…"); }

    function run() {
      running = true;
      line.classList.remove("stopped");
      line.querySelector(".spin-hint").textContent = "esc to interrupt";
      glyphTimer = setInterval(tickGlyph, 120);
      verbTimer = setInterval(tickVerb, 2600);
      clockTimer = setInterval(tickClock, 1000);
    }
    function stop(msg) {
      running = false;
      clearInterval(glyphTimer); clearInterval(verbTimer); clearInterval(clockTimer);
      line.classList.add("stopped");
      glyphEl.textContent = "✻";
      if (msg) verbEl.textContent = msg;
      line.querySelector(".spin-hint").textContent = "click to resume";
    }

    verbEl.textContent = verbs[0] + "…";
    if (running) run(); else stop();

    line.addEventListener("click", function () { if (running) stop("Interrupted by visitor"); else run(); });
    line.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); line.click(); } });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && running) stop("Interrupted by visitor"); });
  }

  /* ---------- Glitchy banner ---------- */
  var banner = document.querySelector("[data-glitch]");
  if (banner && !reduceMotion) {
    var base = banner.querySelector(".g-base");
    ["g-a", "g-b"].forEach(function (cls) {
      var layer = base.cloneNode(true);
      layer.className = "g-layer " + cls;
      layer.setAttribute("aria-hidden", "true");
      banner.appendChild(layer);
    });
    var glitch = function () {
      banner.classList.remove("glitching");
      void banner.offsetWidth;
      banner.classList.add("glitching");
      setTimeout(function () { banner.classList.remove("glitching"); }, 360);
    };
    var loop = function () { glitch(); setTimeout(loop, 2600 + Math.random() * 3800); };
    setTimeout(loop, 900);
    banner.addEventListener("mouseenter", glitch);
  }

  /* ---------- The dog sneezes fur (a nod to Group Project 1) ---------- */
  var dogBtn = document.querySelector("[data-sneeze]");
  if (dogBtn) {
    var caption = document.querySelector("[data-sneeze-caption]");
    var sneezes = 0;
    dogBtn.addEventListener("click", function () {
      sneezes++;
      if (caption) caption.textContent = sneezes === 1 ? "achoo! (that's my A1 mechanic)" : "achoo ×" + sneezes;
      if (reduceMotion) return;
      dogBtn.classList.remove("sneeze");
      void dogBtn.offsetWidth;
      dogBtn.classList.add("sneeze");
      for (var i = 0; i < 12; i++) {
        var f = document.createElement("span");
        f.className = "fur";
        var angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
        var dist = 40 + Math.random() * 70;
        f.style.left = "78%";
        f.style.top = "34%";
        f.style.setProperty("--dx", Math.cos(angle) * dist + 30 + "px");
        f.style.setProperty("--dy", Math.sin(angle) * dist + "px");
        f.style.setProperty("--rot", Math.random() * 180 + "deg");
        f.style.background = ["#8a8580", "#a39e98", "#6f6b66"][i % 3];
        dogBtn.appendChild(f);
        setTimeout(function (el) { el.remove(); }, 950, f);
      }
    });
  }

  /* ---------- A2: my concept screens vs. the final screens ---------- */
  document.querySelectorAll("[data-toggle-group]").forEach(function (group) {
    var buttons = group.querySelectorAll("button[data-show]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) {
          var on = b === btn;
          b.setAttribute("aria-pressed", on ? "true" : "false");
          var panel = document.getElementById(b.getAttribute("data-show"));
          if (panel) panel.hidden = !on;
        });
      });
    });
  });
})();

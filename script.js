/* ===== PEARLSCAN: ALL JAVASCRIPT LIVES IN THIS FILE =====
   Add new scripts below, each in its own section. */

/* --- ALWAYS START AT THE TOP (hero) ON LOAD / RELOAD --- */
(function () {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (location.hash) {
    history.replaceState(null, "", location.pathname + location.search);
  }
  const top = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  top();
  addEventListener("load", top);
  addEventListener("pageshow", (e) => {
    if (e.persisted) top();
  });
})();

/* --- AOS: scroll animations --- */
(function () {
  if (typeof AOS === "undefined") return;
  AOS.init({
    duration: 800,
    easing: "ease-out-cubic",
    once: true,
    offset: 40,
    disable: function () {
      return matchMedia("(prefers-reduced-motion: reduce)").matches;
    },
  });
})();

/* --- HERO SLIDER --- */
(function () {
  const slider = document.querySelector(".slider");
  if (!slider) return;
  const slides = Array.from(slider.querySelectorAll(".slide"));
  const segs = Array.from(slider.querySelectorAll(".seg"));
  const count = slider.querySelector(".slider-count");
  const prev = slider.querySelector(".arrow.prev");
  const next = slider.querySelector(".arrow.next");
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = (n) => String(n).padStart(2, "0");
  let cur = 0;

  function go(i) {
    i = (i + slides.length) % slides.length;
    slides.forEach((s, j) => {
      s.classList.toggle("is-active", j === i);
      s.inert = j !== i;
      s.setAttribute("aria-hidden", j === i ? "false" : "true");
    });
    segs.forEach((b, j) => {
      b.classList.remove("is-current", "is-done");
      b.removeAttribute("aria-current");
      if (j < i) b.classList.add("is-done");
    });
    const c = segs[i];
    void c.offsetWidth; /* restart the progress animation */
    c.style.setProperty("--dur", (slides[i].dataset.duration || 6000) + "ms");
    c.classList.add("is-current");
    c.setAttribute("aria-current", "true");
    count.textContent = pad(i + 1) + " / " + pad(slides.length);
    slider.dataset.theme = slides[i].dataset.theme || "dark";
    cur = i;
  }

  segs.forEach((b, j) => {
    b.addEventListener("click", () => go(j));
    b.querySelector("i").addEventListener("animationend", () => {
      if (!RM && j === cur) go(cur + 1);
    });
  });
  prev.addEventListener("click", () => go(cur - 1));
  next.addEventListener("click", () => go(cur + 1));

  /* pause while hovering, focused, or when the tab is hidden */
  const pause = () => slider.classList.add("is-paused");
  const resume = () => {
    if (!document.hidden && !slider.matches(":hover, :focus-within"))
      slider.classList.remove("is-paused");
  };
  slider.addEventListener("mouseenter", pause);
  slider.addEventListener("mouseleave", resume);
  slider.addEventListener("focusin", pause);
  slider.addEventListener("focusout", resume);
  document.addEventListener("visibilitychange", () =>
    document.hidden ? pause() : resume(),
  );

  /* swipe on touch screens */
  let sx = 0,
    sy = 0,
    tracking = false;
  slider.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, a")) return;
    tracking = true;
    sx = e.clientX;
    sy = e.clientY;
  });
  slider.addEventListener("pointerup", (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.clientX - sx,
      dy = e.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
      go(cur + (dx < 0 ? 1 : -1));
  });
  slider.addEventListener("pointercancel", () => (tracking = false));
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") go(cur + 1);
    if (e.key === "ArrowLeft") go(cur - 1);
  });

  /* start: replay the entrance animation of slide 1 */
  slides.forEach((s, j) => {
    if (j) s.inert = true;
  });
  slides[0].classList.remove("is-active");
  requestAnimationFrame(() => requestAnimationFrame(() => go(0)));
})();

/* --- TEAM: CINEMATIC (reveals, spotlight, tilt, parallax) --- */
(function () {
  var sec = document.getElementById("team");
  if (!sec) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  sec.classList.add(
    "tm-anim",
  ); /* hidden start-states only exist once JS runs */

  /* 1. reveal each part when it scrolls into view */
  var targets = sec.querySelectorAll(".tm-head, .tm-row, .tm-rule, .tm-roster");
  function show(el) {
    el.classList.add("in-view");
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            show(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    targets.forEach(function (t) {
      io.observe(t);
    });
  } else {
    targets.forEach(show);
  }
  if (reduce) return;

  /* parallax: photos drift slowly as you scroll */
  var rows = Array.prototype.slice.call(sec.querySelectorAll(".tm-row"));
  var ticking = false;
  function parallax() {
    var vh = window.innerHeight;
    rows.forEach(function (row) {
      var r = row.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh; /* about -1 .. 1 */
      var img = row.querySelector(".tm-frame img");
      if (img) img.style.setProperty("--py", (p * -26).toFixed(1) + "px");
    });
    ticking = false;
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(parallax);
    }
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  parallax();
})();

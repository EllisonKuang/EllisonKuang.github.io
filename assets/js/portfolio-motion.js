(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  root.classList.add("motion-ready");

  var introTimer;
  function showIntro(force) {
    var alreadyPlayed = false;
    try {
      alreadyPlayed = window.sessionStorage.getItem("haowei-intro-played") === "1";
    } catch (error) {
      alreadyPlayed = false;
    }

    if ((!force && (alreadyPlayed || reduceMotion)) || document.querySelector(".site-intro")) {
      return;
    }

    var intro = document.createElement("div");
    intro.className = "site-intro";
    intro.setAttribute("aria-label", "Opening animation");
    intro.innerHTML = [
      '<div class="site-intro__grid" aria-hidden="true"></div>',
      '<div class="site-intro__beam" aria-hidden="true"></div>',
      '<button class="site-intro__skip" type="button">Skip intro</button>',
      '<div class="site-intro__content">',
        '<div class="site-intro__monogram" aria-hidden="true"><span>H</span><span>K</span></div>',
        '<p class="site-intro__kicker">Visual Intelligence · Research Portfolio</p>',
        '<p class="site-intro__name">Haowei Kuang</p>',
        '<div class="site-intro__loader" aria-hidden="true"><i></i></div>',
        '<p class="site-intro__status"><span></span> Initializing research space</p>',
      '</div>',
      '<div class="site-intro__curtain site-intro__curtain--top" aria-hidden="true"></div>',
      '<div class="site-intro__curtain site-intro__curtain--bottom" aria-hidden="true"></div>'
    ].join("");

    document.body.appendChild(intro);
    document.body.classList.add("intro-is-running");
    window.requestAnimationFrame(function () {
      intro.classList.add("is-playing");
    });

    function dismissIntro() {
      if (!intro.parentNode || intro.classList.contains("is-leaving")) {
        return;
      }
      window.clearTimeout(introTimer);
      intro.classList.add("is-leaving");
      document.body.classList.remove("intro-is-running");
      try {
        window.sessionStorage.setItem("haowei-intro-played", "1");
      } catch (error) {
        // The animation still works when browser storage is unavailable.
      }
      window.setTimeout(function () {
        if (intro.parentNode) {
          intro.parentNode.removeChild(intro);
        }
      }, 850);
    }

    intro.querySelector(".site-intro__skip").addEventListener("click", dismissIntro);
    intro.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        dismissIntro();
      }
    });
    introTimer = window.setTimeout(dismissIntro, force ? 2500 : 2200);
  }

  showIntro(false);

  var replayButton = document.querySelector(".intro-replay");
  if (replayButton) {
    replayButton.addEventListener("click", function () {
      showIntro(true);
    });
  }

  var ambient = document.createElement("div");
  ambient.className = "ambient-field";
  ambient.setAttribute("aria-hidden", "true");
  ambient.innerHTML = [
    '<span class="ambient-field__orb ambient-field__orb--one"></span>',
    '<span class="ambient-field__orb ambient-field__orb--two"></span>',
    '<span class="ambient-field__orb ambient-field__orb--three"></span>',
    '<span class="ambient-field__beam ambient-field__beam--one"></span>',
    '<span class="ambient-field__beam ambient-field__beam--two"></span>'
  ].join("");
  document.body.insertBefore(ambient, document.body.firstChild);

  var progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  var publicationHeading = document.querySelector(".page__content h2");
  if (publicationHeading && publicationHeading.textContent.trim().toLowerCase() === "publication") {
    var candidate = publicationHeading.nextElementSibling;
    while (candidate) {
      if (candidate.tagName === "P" && /^\s*\[\d+\]/.test(candidate.textContent)) {
        candidate.classList.add("publication-card");
      }
      candidate = candidate.nextElementSibling;
    }
  }

  var revealTargets = document.querySelectorAll(
    ".page__title, .research-hero, .section-heading, .impact-card, .achievement-details, .publication-card, .journey-stop, .author__avatar, .author__content, .author__urls-wrapper"
  );

  Array.prototype.forEach.call(revealTargets, function (element, index) {
    element.classList.add("motion-reveal");
    element.style.transitionDelay = Math.min(index * 45, 260) + "ms";
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(revealTargets, function (element) {
      element.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });

    Array.prototype.forEach.call(revealTargets, function (element) {
      observer.observe(element);
    });
  }

  var ticking = false;
  function updateProgress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.transform = "scaleX(" + Math.min(Math.max(ratio, 0), 1) + ")";
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });
  updateProgress();

  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", function (event) {
      root.style.setProperty("--pointer-x", event.clientX + "px");
      root.style.setProperty("--pointer-y", event.clientY + "px");
    }, { passive: true });

    var interactiveCards = document.querySelectorAll("a.publication-card, a.impact-card");
    Array.prototype.forEach.call(interactiveCards, function (card) {
      card.addEventListener("pointermove", function (event) {
        var rect = card.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        var rotateY = ((x / rect.width) - 0.5) * 3.2;
        var rotateX = (0.5 - (y / rect.height)) * 3.2;

        card.style.setProperty("--card-x", x + "px");
        card.style.setProperty("--card-y", y + "px");
        card.style.transform = "perspective(900px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-5px)";
      }, { passive: true });

      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
      });
    });
  }
}());

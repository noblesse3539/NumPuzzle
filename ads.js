(function () {
  "use strict";

  var config = window.FOURCAST_AD_CONFIG || {};
  var slots = Array.prototype.slice.call(
    document.querySelectorAll("[data-ad-slot-key]")
  );
  var slotStates = Object.create(null);
  var scriptPromise = null;
  var currentScreen = "home";
  var suppressed = false;

  function isValidClient(value) {
    return /^ca-pub-[0-9]+$/u.test(String(value || ""));
  }

  function isValidSlot(value) {
    return /^[0-9]+$/u.test(String(value || ""));
  }

  function getSlotValue(key) {
    if (!config.slots || typeof config.slots !== "object") {
      return "";
    }
    return config.slots[key] || "";
  }

  function isConfigured() {
    return Boolean(
      config.enabled &&
        isValidClient(config.client) &&
        slots.some(function (slot) {
          return isValidSlot(getSlotValue(slot.dataset.adSlotKey));
        })
    );
  }

  function isAdLayoutAllowed() {
    return window.innerHeight > 700 && window.innerWidth >= 360;
  }

  function loadAdSenseScript() {
    if (scriptPromise) {
      return scriptPromise;
    }

    if (window.adsbygoogle) {
      scriptPromise = Promise.resolve();
      return scriptPromise;
    }

    scriptPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      script.src =
        "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
        encodeURIComponent(config.client);
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener("error", reject, { once: true });
      document.head.appendChild(script);
    });

    return scriptPromise;
  }

  function markSlotDisabled(slot) {
    var wrapper = slot.closest("[data-ad-screen]");
    if (wrapper) {
      wrapper.hidden = true;
      wrapper.dataset.adState = "disabled";
    }
    slot.dataset.adState = "disabled";
  }

  function prepareSlot(slot) {
    var key = slot.dataset.adSlotKey;
    var slotId = getSlotValue(key);

    if (!config.enabled || !isValidClient(config.client) || !isValidSlot(slotId)) {
      markSlotDisabled(slot);
      return;
    }

    if (slotStates[key] === "pending" || slotStates[key] === "ready") {
      return;
    }

    slot.setAttribute("data-ad-client", config.client);
    slot.setAttribute("data-ad-slot", slotId);
    slot.setAttribute("data-ad-format", "auto");
    slot.setAttribute("data-full-width-responsive", "true");
    slotStates[key] = "pending";
    slot.dataset.adState = "pending";

    loadAdSenseScript()
      .then(function () {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        slotStates[key] = "ready";
        slot.dataset.adState = "ready";
      })
      .catch(function () {
        slotStates[key] = "error";
        slot.dataset.adState = "error";
        var wrapper = slot.closest("[data-ad-screen]");
        if (wrapper) {
          wrapper.hidden = true;
        }
      });
  }

  function updateVisibility() {
    slots.forEach(function (slot) {
      var wrapper = slot.closest("[data-ad-screen]");
      var visible = Boolean(
          wrapper &&
          isConfigured() &&
          isAdLayoutAllowed() &&
          !suppressed &&
          wrapper.dataset.adScreen === currentScreen
      );

      if (!wrapper) {
        return;
      }

      wrapper.hidden = !visible;
      wrapper.setAttribute("aria-hidden", String(!visible));
      if (visible) {
        prepareSlot(slot);
      }
    });
  }

  function init() {
    updateVisibility();
  }

  function setScreen(screenName) {
    currentScreen = screenName === "game-over" ? "game-over" : screenName;
    updateVisibility();
  }

  function setSuppressed(nextSuppressed) {
    suppressed = Boolean(nextSuppressed);
    updateVisibility();
  }

  function getStatus() {
    return {
      enabled: Boolean(config.enabled),
      configured: isConfigured(),
      screen: currentScreen,
      suppressed: suppressed,
      slots: Object.assign({}, slotStates)
    };
  }

  window.FOURCAST_ADS = {
    init: init,
    setScreen: setScreen,
    setSuppressed: setSuppressed,
    getStatus: getStatus
  };

  window.addEventListener("resize", updateVisibility);
  window.addEventListener("orientationchange", updateVisibility);
  init();
})();

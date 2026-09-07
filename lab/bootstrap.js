(function () {
  "use strict";

  var CHANNEL = "fourcast-lab-v1";
  var ALLOWED_ACTIONS = new Set([
    "observe",
    "start-stage",
    "prepare-scenario",
    "reset-scenario",
    "pause",
    "resume",
    "run-safety-release",
    "run-perfect",
    "run-perfect-single",
    "run-perfect-invalid",
    "run-safety-pulse",
    "change-safety-pulse",
    "run-wave-spacing",
    "run-wave-entry-spacing",
    "trigger-red-line"
  ]);
  var controller = null;

  function reply(type, requestId, payload) {
    window.parent.postMessage(
      {
        channel: CHANNEL,
        type: type,
        requestId: requestId || null,
        payload: payload || null
      },
      window.location.origin
    );
  }

  window.__FOURCAST_LAB_BOOTSTRAP__ = {
    attach: function (nextController) {
      controller = nextController;
      reply("ready", null, controller.observe());
    }
  };

  window.addEventListener("message", function (event) {
    if (
      event.source !== window.parent ||
      event.origin !== window.location.origin ||
      !event.data ||
      event.data.channel !== CHANNEL
    ) {
      return;
    }

    var action = event.data.action;
    var requestId = event.data.requestId;
    if (!controller || !ALLOWED_ACTIONS.has(action)) {
      reply("error", requestId, {
        message: controller
          ? "허용되지 않은 Lab 동작입니다."
          : "게임 프레임이 아직 준비되지 않았습니다."
      });
      return;
    }

    try {
      reply("state", requestId, controller.command(action, event.data.payload));
    } catch (error) {
      reply("error", requestId, {
        message: error && error.message ? error.message : String(error)
      });
    }
  });
})();

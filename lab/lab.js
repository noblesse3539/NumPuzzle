(function () {
  "use strict";

  var CHANNEL = "fourcast-lab-v1";
  var frame = document.getElementById("gameFrame");
  var connectionStatus = document.getElementById("connectionStatus");
  var statusMessage = document.getElementById("statusMessage");
  var stageInput = document.getElementById("stageInput");
  var requestNumber = 0;
  var ready = false;

  var fields = {
    phase: document.getElementById("phaseValue"),
    scenario: document.getElementById("scenarioValue"),
    stage: document.getElementById("stageValue"),
    progress: document.getElementById("progressValue"),
    safety: document.getElementById("safetyValue"),
    next: document.getElementById("nextValue"),
    combo: document.getElementById("comboValue"),
    score: document.getElementById("scoreValue"),
    perfect: document.getElementById("perfectValue"),
    perfectPath: document.getElementById("perfectPathValue"),
    perfectSuccess: document.getElementById("perfectSuccessValue"),
    feedback: document.getElementById("feedbackValue"),
    safetyPulse: document.getElementById("safetyPulseValue"),
    waveCenterGap: document.getElementById("waveCenterGapValue"),
    waveEdgeGap: document.getElementById("waveEdgeGapValue"),
    waveRatio: document.getElementById("waveRatioValue"),
    waveJitter: document.getElementById("waveJitterValue"),
    overlap: document.getElementById("overlapValue"),
    reflow: document.getElementById("reflowValue"),
    speedSpread: document.getElementById("speedSpreadValue"),
    spawnFootprint: document.getElementById("spawnFootprintValue"),
    fallDuration: document.getElementById("fallDurationValue"),
    wavePlan: document.getElementById("wavePlanValue"),
    parked: document.getElementById("parkedValue"),
    resetCount: document.getElementById("resetCountValue"),
    gameOver: document.getElementById("gameOverValue"),
    lastAction: document.getElementById("lastActionValue")
  };

  function selectedStage() {
    var value = Math.floor(Number(stageInput.value));
    if (!Number.isFinite(value)) {
      value = 11;
    }
    value = Math.min(99, Math.max(1, value));
    stageInput.value = String(value);
    return value;
  }

  function send(action, payload) {
    if (!ready || !frame.contentWindow) {
      showStatus("게임 프레임이 아직 준비되지 않았습니다.", true);
      return;
    }
    requestNumber += 1;
    frame.contentWindow.postMessage(
      {
        channel: CHANNEL,
        requestId: "lab-" + String(requestNumber),
        action: action,
        payload: payload || {}
      },
      window.location.origin
    );
  }

  function showStatus(message, isError) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle("is-error", Boolean(isError));
  }

  function pixels(value) {
    return value === null || value === undefined || !Number.isFinite(Number(value))
      ? "-"
      : Number(value).toFixed(2) + "px";
  }

  function renderState(state) {
    if (!state) {
      return;
    }
    fields.phase.textContent = state.phase || "-";
    fields.scenario.textContent = state.scenarioId || "-";
    fields.stage.textContent = String(state.stage || "-");
    fields.progress.textContent =
      String(state.stageRemoved || 0) + " / " + String(state.stageTarget || 0);
    fields.safety.textContent = state.safetyCheck ? "켜짐" : "꺼짐";
    fields.next.textContent =
      String(state.currentNext ?? "-") + " → " + String(state.previewNext ?? "-");
    fields.combo.textContent = "x" + String(state.combo || 0);
    fields.score.textContent = String(state.score || 0);
    fields.perfect.textContent = state.perfectOpportunityActive
      ? "가능 · " + String(Number(state.perfectLaneIndex) + 1) + "번 라인"
      : "무효";
    fields.perfectPath.textContent = state.perfectPathActive ? "대기 중" : "-";
    fields.perfectSuccess.textContent = String(state.perfectSuccessCount || 0);
    fields.feedback.textContent = state.feedbackType || "-";
    fields.safetyPulse.textContent = state.safetyCueActive
      ? "재생 중 · 3회"
      : state.safetyCueShown
        ? "완료"
        : "-";
    fields.waveCenterGap.textContent =
      state.waveCenterGapPixels === null || state.waveCenterGapPixels === undefined
        ? "-"
        : pixels(state.waveCenterGapPixels);
    fields.waveEdgeGap.textContent =
      state.waveEdgeGapPixels === null || state.waveEdgeGapPixels === undefined
        ? "-"
        : pixels(state.waveEdgeGapPixels) + " / 목표 " +
          pixels(state.waveGapTargetPixels);
    fields.waveRatio.textContent =
      state.waveGapRatio === null || state.waveGapRatio === undefined
        ? "-"
        : (state.waveGapRatio * 100).toFixed(2) + "% / 목표 " +
          (state.waveGapTargetRatio * 100).toFixed(2) + "%";
    fields.waveJitter.textContent =
      state.waveGapJitterPixels === null || state.waveGapJitterPixels === undefined
        ? "측정 전"
        : pixels(state.waveGapJitterPixels);
    fields.overlap.textContent =
      state.maxOverlapPixels === null || state.maxOverlapPixels === undefined
        ? "-"
        : pixels(state.maxOverlapPixels);
    fields.reflow.textContent =
      state.reflowMoveCount === null || state.reflowMoveCount === undefined
        ? "-"
        : String(state.reflowMoveCount) + "개 이동";
    fields.speedSpread.textContent =
      state.movingSpeedSpreadPixels === null || state.movingSpeedSpreadPixels === undefined
        ? "측정 전"
        : pixels(state.movingSpeedSpreadPixels) + "/s";
    if (
      state.spawnFootprintStable === null ||
      state.spawnFootprintStable === undefined
    ) {
      fields.spawnFootprint.textContent = "측정 전";
    } else {
      fields.spawnFootprint.textContent =
        (state.spawnFootprintScaled ? "0.28 → 1 확대" : "변화 없음") +
        " · 시작 " +
        Number(state.spawnFootprintStartPixels).toFixed(2) +
        "px · 끝 " +
        Number(state.spawnFootprintEndPixels).toFixed(2) +
        "px · " +
        (state.spawnFootprintStable ? "정착" : "정착 오차") ;
    }
    fields.fallDuration.textContent = state.fallDurationSeconds
      ? state.fallDurationSeconds.toFixed(2) + "초"
      : "-";
    fields.wavePlan.textContent =
      String(state.visibleWaveCount || 0) + "/" +
      String(state.totalWaveCount || 0) + " · " +
      (state.waveIntervalSeconds ? state.waveIntervalSeconds.toFixed(2) : "-") +
      "초";
    fields.parked.textContent = state.parkedRejoinCount
      ? String(state.parkedRejoinCount) + "개 재합류"
      : "-";
    fields.resetCount.textContent = String(state.resetCount || 0);
    fields.gameOver.textContent = state.gameOverVisible ? "표시됨" : "숨김";
    fields.lastAction.textContent = state.lastAction || "-";
  }

  function bind(id, action, payloadFactory) {
    document.getElementById(id).addEventListener("click", function () {
      send(action, payloadFactory ? payloadFactory() : {});
    });
  }

  bind("startStageButton", "start-stage", function () {
    return { stage: selectedStage() };
  });
  bind("resetButton", "reset-scenario");
  bind("pauseButton", "pause");
  bind("resumeButton", "resume");
  bind("prepareSafetyButton", "prepare-scenario", function () {
    return { scenarioId: "safety-release-10-to-11", stage: 10 };
  });
  bind("runSafetyButton", "run-safety-release");
  bind("preparePerfectButton", "prepare-scenario", function () {
    return { scenarioId: "perfect-score", stage: Math.max(11, selectedStage()) };
  });
  bind("runPerfectSingleButton", "run-perfect-single");
  bind("runPerfectButton", "run-perfect");
  bind("runPerfectInvalidButton", "run-perfect-invalid");
  bind("prepareRedLineButton", "prepare-scenario", function () {
    return { scenarioId: "red-line-auto-reset", stage: selectedStage() };
  });
  bind("runRedLineButton", "trigger-red-line");
  bind("prepareSafetyPulseButton", "prepare-scenario", function () {
    return { scenarioId: "safety-pulse-stage-11", stage: 11 };
  });
  bind("runSafetyPulseButton", "run-safety-pulse");
  bind("changeSafetyPulseButton", "change-safety-pulse");
  bind("prepareWaveSpacingButton", "prepare-scenario", function () {
    return { scenarioId: "wave-spacing-and-rejoin", stage: selectedStage() };
  });
  bind("runWaveSpacingButton", "run-wave-spacing");
  bind("prepareWaveEntryButton", "prepare-scenario", function () {
    return { scenarioId: "wave-entry-spacing", stage: selectedStage() };
  });
  bind("runWaveEntryButton", "run-wave-entry-spacing");

  window.addEventListener("message", function (event) {
    if (
      event.source !== frame.contentWindow ||
      event.origin !== window.location.origin ||
      !event.data ||
      event.data.channel !== CHANNEL
    ) {
      return;
    }

    if (event.data.type === "ready") {
      ready = true;
      connectionStatus.textContent = "게임 연결됨";
      connectionStatus.classList.add("is-ready");
      showStatus("시나리오를 준비하거나 원하는 스테이지를 시작하세요.", false);
      renderState(event.data.payload);
      return;
    }

    if (event.data.type === "error") {
      showStatus(event.data.payload.message, true);
      return;
    }

    if (event.data.type === "state") {
      renderState(event.data.payload);
      if (event.data.requestId !== null && event.data.requestId !== undefined) {
        showStatus("허용된 실제 게임 동작을 실행했습니다.", false);
      }
    }
  });

  window.setInterval(function () {
    if (ready) {
      send("observe");
    }
  }, 120);
})();

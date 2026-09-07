(function () {
  "use strict";

  var LANE_COUNT = 4;
  var DIGITS = [1, 2, 3, 4];
  var MODE_STACK_RUSH = "stack-rush";
  var MAX_PENDING_INPUTS = 4;
  var SCORE_PER_BLOCK = 10;
  var RED_LINE_Y = 0.9;
  var FEEDBACK_DURATION_MS = 350;
  var PROJECTILE_DURATION_MS = 190;
  var STACK_RUSH_PROJECTILE_DURATION_MS = Math.round(
    PROJECTILE_DURATION_MS / 1.5
  );
  var SHRINK_DURATION_MS = 160;
  var COUNTDOWN_SECONDS = 3;
  var SPAWN_FEEDBACK_DURATION_MS = 160;
  var STACK_JELLY_DURATION_MS = 180;
  var STAGE_DURATION_SECONDS = 30;
  var STACK_RUSH_INITIAL_WAVE_COUNT = 2;
  var STACK_RUSH_STAGE_END_MARGIN_SECONDS = 0.5;
  var STACK_RUSH_WAVE_GAP_RATIO = 0.03;
  var STACK_RUSH_WAVE_GAP_EPSILON = 0.0001;
  var STACK_RUSH_TARGET_SUPPLY_RATIO = 0.72;
  var STACK_RUSH_STAGE_ONE_FALL_DURATION_SECONDS = 30;
  var STACK_RUSH_NORMAL_FALL_FACTOR = 0.985;
  var STACK_RUSH_PRESSURE_FALL_FACTOR = 0.88;
  var STACK_RUSH_MIN_FALL_DURATION_SECONDS = 8;
  var STAGE_BANNER_DURATION_MS = 1800;
  var STAGE_BREAK_DURATION_MS = 700;
  var PHASE_STAGE_BREAK = "stage-break";
  var HUD_FEEDBACK_DURATION_MS = 650;
  var NEXT_SAFETY_PULSE_DURATION_MS = 300;
  var NEXT_SAFETY_PULSE_COUNT = 3;
  var NEXT_SAFETY_CUE_DURATION_MS =
    NEXT_SAFETY_PULSE_DURATION_MS * NEXT_SAFETY_PULSE_COUNT;
  var BGM_FADE_DURATION_MS = 600;
  var BGM_PREPARE_TIMEOUT_MS = 2000;
  var BGM_PREPARATION_MIN_DISPLAY_MS = 500;
  var BGM_SOURCE_URL = "./audio/fourcast-bgm-v2.wav";
  var LANGUAGE_STORAGE_KEY = "fourcast-language";
  var BGM_ENABLED_STORAGE_KEY = "fourcast-bgm-enabled";
  var BGM_VOLUME_STORAGE_KEY = "fourcast-bgm-volume";
  var BEST_SCORE_STORAGE_KEY = "fourcast-stack-rush-best-score";
  var LEGACY_STACK_RUSH_SCORES_STORAGE_KEY = "fourcast-best-scores";
  var DEFAULT_LANGUAGE = "ko";
  var DEFAULT_BGM_VOLUME = 0.6;

  var TRANSLATIONS = {
    ko: {
      appAriaLabel: "FOURCAST 숫자블록 생존 게임",
      helpButtonAria: "게임 방법",
      settingsButtonAria: "설정",
      stackRushModeName: "스택 러시",
      stackRushModeTagline: "끝없이 내려오는 블록들을 제거하세요",
      bestScoreAria: "최고 점수",
      siteIntro: "네 개의 라인에서 숫자를 맞추고, 다음 스테이지까지 살아남으세요.",
      siteLinksAria: "사이트 정보",
      privacyLink: "개인정보처리방침",
      contactLink: "문의·크레딧",
      adLabel: "광고",
      start: "시작",
      preparing: "준비 중…",
      score: "점수",
      stage: "스테이지",
      combo: "콤보",
      next: "다음",
      best: "최고 점수",
      stageProgressAria: "스테이지 목표 진행",
      currentComboAria: "현재 콤보",
      nextDisplayAria: "현재 Next와 다음 Next",
      currentNextAria: "현재 Next",
      previewNextAria: "다음 Next",
      musicButtonAria: "BGM 켜기",
      musicPauseAria: "BGM 끄기",
      musicRetryAria: "BGM 다시 재생",
      gameBoardAria: "숫자 블록 라인",
      lane1Aria: "1번 라인 선택",
      lane2Aria: "2번 라인 선택",
      lane3Aria: "3번 라인 선택",
      lane4Aria: "4번 라인 선택",
      gameOver: "게임 오버",
      restart: "다시 시작",
      mainMenu: "메인 메뉴",
      stageClear: "스테이지 클리어",
      pressureUp: "압박 상승",
      keepPushing: "계속 도전하세요",
      nextStage: "다음 스테이지",
      goal: "목표",
      hit: "성공",
      miss: "실수",
      milestone: "마일스톤",
      perfect: "완벽",
      reachedStage: "도달 스테이지",
      bestCombo: "최고 콤보",
      orientationTitle: "세로 화면으로 플레이하세요",
      orientationBody: "화면을 세로로 돌리면 게임이 이어집니다.",
      helpTitle: "게임 방법",
      closeHelpAria: "도움말 닫기",
      helpBody: "빨간 선에 닿기 전에 내려오는 숫자 블록을 제거하세요.",
      confirm: "확인",
      settingsTitle: "설정",
      closeSettingsAria: "설정 닫기",
      language: "언어",
      languageSelectAria: "언어 선택",
      bgm: "BGM",
      bgmOn: "켜짐",
      bgmOff: "꺼짐",
      bgmToggleAria: "BGM 켜기/끄기",
      bgmVolume: "BGM 음량",
      bgmVolumeAria: "BGM 음량",
      getReady: "준비",
      startCaption: "시작",
      paused: "일시정지"
    },
    en: {
      appAriaLabel: "FOURCAST number block survival game",
      helpButtonAria: "How to play",
      settingsButtonAria: "Settings",
      stackRushModeName: "STACK RUSH",
      stackRushModeTagline: "REMOVE THE ENDLESSLY FALLING BLOCKS.",
      bestScoreAria: "Best score",
      siteIntro: "Match the falling numbers across four lanes and survive each stage.",
      siteLinksAria: "Site information",
      privacyLink: "Privacy policy",
      contactLink: "Contact & credits",
      adLabel: "Advertisement",
      start: "START",
      preparing: "PREPARING…",
      score: "SCORE",
      stage: "STAGE",
      combo: "COMBO",
      next: "NEXT",
      best: "BEST",
      stageProgressAria: "Stage goal progress",
      currentComboAria: "Current combo",
      nextDisplayAria: "Current Next and preview Next",
      currentNextAria: "Current Next",
      previewNextAria: "Preview Next",
      musicButtonAria: "Turn BGM on",
      musicPauseAria: "Turn BGM off",
      musicRetryAria: "Play BGM again",
      gameBoardAria: "Number block lanes",
      lane1Aria: "Select lane 1",
      lane2Aria: "Select lane 2",
      lane3Aria: "Select lane 3",
      lane4Aria: "Select lane 4",
      gameOver: "GAME OVER",
      restart: "RESTART",
      mainMenu: "MAIN MENU",
      stageClear: "STAGE CLEAR",
      pressureUp: "PRESSURE UP",
      keepPushing: "KEEP PUSHING",
      nextStage: "NEXT STAGE",
      goal: "GOAL",
      hit: "HIT",
      miss: "MISS",
      milestone: "MILESTONE",
      perfect: "PERFECT",
      reachedStage: "REACHED STAGE",
      bestCombo: "BEST COMBO",
      orientationTitle: "Play in portrait mode",
      orientationBody: "Rotate your screen to continue.",
      helpTitle: "HOW TO PLAY",
      closeHelpAria: "Close help",
      helpBody: "Remove the falling number blocks before they reach the red line.",
      confirm: "OK",
      settingsTitle: "SETTINGS",
      closeSettingsAria: "Close settings",
      language: "LANGUAGE",
      languageSelectAria: "Select language",
      bgm: "BGM",
      bgmOn: "ON",
      bgmOff: "OFF",
      bgmToggleAria: "Toggle BGM",
      bgmVolume: "BGM VOLUME",
      bgmVolumeAria: "BGM volume",
      getReady: "GET READY",
      startCaption: "START",
      paused: "PAUSED"
    }
  };

  var elements = {
    startScreen: document.getElementById("startScreen"),
    gameScreen: document.getElementById("gameScreen"),
    gameOverScreen: document.getElementById("gameOverScreen"),
    startButton: document.getElementById("startButton"),
    startButtonLabel: document.getElementById("startButtonLabel"),
    restartButton: document.getElementById("restartButton"),
    restartButtonLabel: document.getElementById("restartButtonLabel"),
    mainMenuButton: document.getElementById("mainMenuButton"),
    helpButton: document.getElementById("helpButton"),
    settingsButton: document.getElementById("settingsButton"),
    stackRushBestScore: document.getElementById("stackRushBestScore"),
    helpModal: document.getElementById("helpModal"),
    helpCloseButton: document.getElementById("helpCloseButton"),
    helpDoneButton: document.getElementById("helpDoneButton"),
    settingsModal: document.getElementById("settingsModal"),
    settingsCard: document.querySelector(".settings-card"),
    settingsCloseButton: document.getElementById("settingsCloseButton"),
    settingsDoneButton: document.getElementById("settingsDoneButton"),
    languageControl: document.getElementById("languageControl"),
    languageSelect: document.getElementById("languageSelect"),
    languageSelectValue: document.getElementById("languageSelectValue"),
    languageMenu: document.getElementById("languageMenu"),
    languageOptions: Array.prototype.slice.call(
      document.querySelectorAll(".language-option")
    ),
    bgmToggle: document.getElementById("bgmToggle"),
    bgmStateText: document.getElementById("bgmStateText"),
    bgmVolume: document.getElementById("bgmVolume"),
    bgmVolumeValue: document.getElementById("bgmVolumeValue"),
    musicButton: document.getElementById("musicButton"),
    scoreValue: document.getElementById("scoreValue"),
    stageValue: document.getElementById("stageValue"),
    stageProgress: document.getElementById("stageProgress"),
    stageProgressText: document.getElementById("stageProgressText"),
    stageProgressFill: document.getElementById("stageProgressFill"),
    stageTimeValue: document.getElementById("stageTimeValue"),
    comboValue: document.getElementById("comboValue"),
    feedbackText: document.getElementById("feedbackText"),
    runBanner: document.getElementById("runBanner"),
    runBannerKicker: document.getElementById("runBannerKicker"),
    runBannerTitle: document.getElementById("runBannerTitle"),
    runBannerDetail: document.getElementById("runBannerDetail"),
    nextValues: document.querySelector(".next-values"),
    currentNext: document.getElementById("currentNext"),
    previewNext: document.getElementById("previewNext"),
    countdownLayer: document.getElementById("countdownLayer"),
    countdownCaption: document.getElementById("countdownCaption"),
    countdownNumber: document.getElementById("countdownNumber"),
    finalScore: document.getElementById("finalScore"),
    finalBestScore: document.getElementById("finalBestScore"),
    finalStage: document.getElementById("finalStage"),
    finalBestCombo: document.getElementById("finalBestCombo"),
    orientationBlocker: document.getElementById("orientationBlocker")
  };

  var laneElements = Array.prototype.map.call(
    document.querySelectorAll(".lane"),
    function (laneElement) {
      return {
        root: laneElement,
        track: laneElement.querySelector(".lane-track"),
        blocks: laneElement.querySelector(".lane-blocks"),
        button: laneElement.querySelector(".lane-button")
      };
    }
  );

  var state = {
    phase: "start",
    language: readLanguagePreference(),
    bgmEnabled: readBooleanPreference(BGM_ENABLED_STORAGE_KEY, true),
    bgmVolume: readVolumePreference(),
    bgmPlayback: "idle",
    bgmFadeFrame: null,
    bgmWasPlayingBeforePause: false,
    bgmStartedThisRun: false,
    score: 0,
    bestScore: readBestScore(),
    elapsed: 0,
    stageElapsed: 0,
    level: 1,
    stage: 1,
    stageRemoved: 0,
    stageTarget: getStackRushStageTarget(1),
    stageResult: null,
    highestStage: 1,
    stageBanner: {
      active: false,
      type: null,
      until: 0,
      token: 0,
      completedStage: 0,
      nextStage: 0
    },
    stageBreak: null,
    stageProfile: null,
    stageSpawnedWaveCount: 0,
    waveSpacingCalibrationPending: false,
    combo: 0,
    bestCombo: 0,
    feedback: {
      type: null,
      text: "",
      until: 0,
      token: 0
    },
    nextInsight: {
      safetyCuePending: false,
      safetyCueShown: false,
      safetyCueUntil: 0,
      perfectOpportunity: null,
      perfectOpportunityActive: false,
      perfectLaneIndex: null,
      perfectPath: null,
      perfectSuccessCount: 0
    },
    difficulty: null,
    motionDifficulty: null,
    waveTimer: 0,
    nextWaveNumber: 1,
    nextBlockNumber: 1,
    nextStackImpactToken: 1,
    waves: [],
    futureWaves: [],
    lastWaveReflowSummary: {
      movedBlocks: [],
      releasedParkedBlocks: []
    },
    lanes: createLanes(),
    next: null,
    resolve: null,
    pendingInputs: [],
    buttonsLocked: false,
    countdownTimer: null,
    countdownFinishTimer: null,
    pauseReason: null,
    lastFrameTime: 0,
    lastRenderedCurrent: null,
    lastRenderedPreview: null,
    layout: {
      trackHeight: 0,
      trackWidth: 0,
      blockLayerHeight: 0,
      blockLayerWidth: 0,
      blockWidth: 0,
      blockHeight: 0
    },
    orientationBlocked: false
  };

  var languageMenuOpen = false;
  var languageMenuIndex = 0;

  state.difficulty = buildStackRushStageProfile(1);
  state.motionDifficulty = state.difficulty;

  var bgmEngine = {
    context: null,
    gain: null,
    buffer: null,
    bufferPromise: null,
    webAudioFailure: null,
    source: null,
    backend: "none",
    loopStart: null,
    loopEnd: null,
    bufferDuration: null,
    gainValue: DEFAULT_BGM_VOLUME,
    fade: null,
    preparationToken: 0,
    preparationActive: false
  };

  function createLanes() {
    return Array.from({ length: LANE_COUNT }, function () {
      return {
        blocks: [],
        serviceDebt: 0,
        lastServiceTime: null,
        emptyError: false
      };
    });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function easeOutCubic(value) {
    var t = clamp(value, 0, 1);
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOut(value) {
    var t = clamp(value, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function randomDigit() {
    return DIGITS[Math.floor(Math.random() * DIGITS.length)];
  }

  function unique(values) {
    return Array.from(new Set(values));
  }

  function chooseUniform(values) {
    if (!values || values.length === 0) {
      return randomDigit();
    }
    return values[Math.floor(Math.random() * values.length)];
  }

  function chooseWeighted(values, weightForValue) {
    if (!values || values.length === 0) {
      return randomDigit();
    }

    var weighted = values.map(function (value) {
      return {
        value: value,
        weight: Math.max(0, weightForValue ? weightForValue(value) : 1)
      };
    });
    var total = weighted.reduce(function (sum, item) {
      return sum + item.weight;
    }, 0);

    if (total <= 0) {
      return chooseUniform(values);
    }

    var cursor = Math.random() * total;
    for (var index = 0; index < weighted.length; index += 1) {
      cursor -= weighted[index].weight;
      if (cursor <= 0) {
        return weighted[index].value;
      }
    }
    return weighted[weighted.length - 1].value;
  }

  function getStackRushStageTarget(stage) {
    var safeStage = Math.max(1, Math.floor(Number(stage) || 1));
    var pressureTier = Math.floor(safeStage / 5);
    return 12 + 2 * (safeStage - 1) + pressureTier * (pressureTier + 1);
  }

  function getStackRushFallDuration(stage) {
    var safeStage = Math.max(1, Math.floor(Number(stage) || 1));
    var fallDuration = STACK_RUSH_STAGE_ONE_FALL_DURATION_SECONDS;

    for (var currentStage = 2; currentStage <= safeStage; currentStage += 1) {
      fallDuration *=
        currentStage % 5 === 0
          ? STACK_RUSH_PRESSURE_FALL_FACTOR
          : STACK_RUSH_NORMAL_FALL_FACTOR;
    }

    return Math.max(STACK_RUSH_MIN_FALL_DURATION_SECONDS, fallDuration);
  }

  function buildStackRushStageProfile(stage) {
    var safeStage = Math.max(1, Math.floor(Number(stage) || 1));
    var rawTarget = getStackRushStageTarget(safeStage);
    var fallDurationSeconds = getStackRushFallDuration(safeStage);
    var plannedTotalWaveCount = Math.max(
      STACK_RUSH_INITIAL_WAVE_COUNT,
      Math.round((rawTarget * 1.5) / LANE_COUNT)
    );
    if (safeStage === 1) {
      plannedTotalWaveCount = 5;
    }
    var wavePitchNormalized = getStackRushWavePitchNormalized();
    var waveInterval = Math.max(
      0.1,
      (wavePitchNormalized * fallDurationSeconds) / RED_LINE_Y
    );
    var timeLimitedSpawnWaveCount = Math.max(
      0,
      Math.floor(
        (STAGE_DURATION_SECONDS - STACK_RUSH_STAGE_END_MARGIN_SECONDS) /
          waveInterval
      )
    );
    var totalWaveCount = Math.max(
      STACK_RUSH_INITIAL_WAVE_COUNT,
      Math.min(
        plannedTotalWaveCount,
        STACK_RUSH_INITIAL_WAVE_COUNT + timeLimitedSpawnWaveCount
      )
    );
    var spawnWaveCount = totalWaveCount - STACK_RUSH_INITIAL_WAVE_COUNT;
    var totalBlockBudget = totalWaveCount * LANE_COUNT;
    var target = Math.min(
      rawTarget,
      Math.max(1, Math.floor(totalBlockBudget * STACK_RUSH_TARGET_SUPPLY_RATIO))
    );
    var currentLookProbability =
      safeStage <= 30
        ? (safeStage - 1) * 0.02
        : Math.min(0.7, 0.58 + (safeStage - 30) * 0.012);

    return {
      level: state.level,
      stage: safeStage,
      target: target,
      rawTarget: rawTarget,
      fallDurationSeconds: fallDurationSeconds,
      waveIntervalSeconds: waveInterval,
      waveGapRatio: STACK_RUSH_WAVE_GAP_RATIO,
      wavePitchNormalized: wavePitchNormalized,
      initialWaveCount: STACK_RUSH_INITIAL_WAVE_COUNT,
      spawnWaveCount: spawnWaveCount,
      totalWaveCount: totalWaveCount,
      totalBlockBudget: totalBlockBudget,
      targetSupplyRatio: STACK_RUSH_TARGET_SUPPLY_RATIO,
      currentLookProbability: currentLookProbability,
      safetyCheck: safeStage <= 10,
      starvationGuard: true,
      starvationWeight: 2,
      pressureStage: safeStage > 1 && safeStage % 5 === 0
    };
  }

  function getStageTarget(stage) {
    var safeStage = Math.max(1, Math.floor(Number(stage) || 1));
    return buildStackRushStageProfile(safeStage).target;
  }

  function getStageRemainingSeconds() {
    return Math.max(
      0,
      Math.ceil(
        STAGE_DURATION_SECONDS -
          clamp(state.stageElapsed, 0, STAGE_DURATION_SECONDS)
      )
    );
  }

  function readBestScore() {
    try {
      var storedScore = window.localStorage.getItem(BEST_SCORE_STORAGE_KEY);
      if (storedScore !== null) {
        var parsedScore = Number(storedScore);
        return Number.isFinite(parsedScore) && parsedScore > 0 ? parsedScore : 0;
      }

      var legacyScores = window.localStorage.getItem(
        LEGACY_STACK_RUSH_SCORES_STORAGE_KEY
      );
      if (!legacyScores) {
        return 0;
      }

      var parsedLegacyScores = JSON.parse(legacyScores);
      var migratedScore = Number(
        parsedLegacyScores && parsedLegacyScores[MODE_STACK_RUSH]
      );
      if (!Number.isFinite(migratedScore) || migratedScore <= 0) {
        return 0;
      }

      window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(migratedScore));
      return migratedScore;
    } catch (error) {
      return 0;
    }
  }

  function writeBestScore() {
    try {
      window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(state.bestScore));
    } catch (error) {
      // Private browsing modes may deny localStorage. The current run still works.
    }
  }

  function readLanguagePreference() {
    var storedLanguage = null;
    try {
      storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch (error) {
      storedLanguage = null;
    }

    if (TRANSLATIONS[storedLanguage]) {
      return storedLanguage;
    }

    var browserLanguage = window.navigator && window.navigator.language;
    return browserLanguage && browserLanguage.toLowerCase().indexOf("ko") === 0
      ? "ko"
      : "en";
  }

  function readBooleanPreference(key, fallback) {
    try {
      var storedValue = window.localStorage.getItem(key);
      if (storedValue === "true") {
        return true;
      }
      if (storedValue === "false") {
        return false;
      }
    } catch (error) {
      return fallback;
    }
    return fallback;
  }

  function readVolumePreference() {
    try {
      var storedText = window.localStorage.getItem(BGM_VOLUME_STORAGE_KEY);
      if (storedText === null || storedText.trim() === "") {
        return DEFAULT_BGM_VOLUME;
      }
      var storedValue = Number(storedText);
      if (Number.isFinite(storedValue)) {
        if (storedValue > 1) {
          storedValue /= 100;
        }
        return clamp(storedValue, 0, 1);
      }
    } catch (error) {
      return DEFAULT_BGM_VOLUME;
    }
    return DEFAULT_BGM_VOLUME;
  }

  function writeLanguagePreference() {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, state.language);
    } catch (error) {
      // The current language still applies when storage is unavailable.
    }
  }

  function writeBgmPreferences() {
    try {
      window.localStorage.setItem(BGM_ENABLED_STORAGE_KEY, String(state.bgmEnabled));
      window.localStorage.setItem(BGM_VOLUME_STORAGE_KEY, String(state.bgmVolume));
    } catch (error) {
      // Audio settings remain active for this session when storage is unavailable.
    }
  }

  function translate(key) {
    var languageTable = TRANSLATIONS[state.language] || TRANSLATIONS[DEFAULT_LANGUAGE];
    return languageTable[key] || TRANSLATIONS[DEFAULT_LANGUAGE][key] || key;
  }

  function applyLanguage() {
    document.documentElement.lang = state.language;

    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n]"), function (element) {
      element.textContent = translate(element.getAttribute("data-i18n"));
    });

    Array.prototype.forEach.call(document.querySelectorAll("[data-i18n-aria]"), function (element) {
      element.setAttribute(
        "aria-label",
        translate(element.getAttribute("data-i18n-aria"))
      );
    });

    updateLanguageSelectUi();
    updateBgmUi();
    applyStackRushUi();
    updateBestScoreUi();
    updateStageUi();
    updateComboUi();
  }

  function setLanguage(language) {
    if (!TRANSLATIONS[language]) {
      return;
    }
    state.language = language;
    writeLanguagePreference();
    applyLanguage();
  }

  function getLanguageOptionIndex(language) {
    for (var index = 0; index < elements.languageOptions.length; index += 1) {
      if (elements.languageOptions[index].dataset.language === language) {
        return index;
      }
    }
    return 0;
  }

  function updateLanguageSelectUi() {
    if (!elements.languageSelect) {
      return;
    }

    if (elements.languageSelectValue) {
      elements.languageSelectValue.textContent =
        state.language === "en" ? "English" : "한국어";
    }

    elements.languageOptions.forEach(function (option, index) {
      var selected = option.dataset.language === state.language;
      option.setAttribute("aria-selected", String(selected));
      option.classList.toggle("is-selected", selected);
      option.classList.toggle("is-active", languageMenuOpen && index === languageMenuIndex);
    });

    if (languageMenuOpen) {
      positionLanguageMenu();
    }
  }

  function applyStackRushUi() {
    document.documentElement.dataset.gameMode = MODE_STACK_RUSH;
    if (elements.startScreen) {
      elements.startScreen.dataset.gameMode = MODE_STACK_RUSH;
    }
    if (elements.gameScreen) {
      elements.gameScreen.dataset.gameMode = MODE_STACK_RUSH;
    }
    if (elements.gameOverScreen) {
      elements.gameOverScreen.dataset.gameMode = MODE_STACK_RUSH;
    }
  }

  function updateBgmUi() {
    var isPlaying = state.bgmPlayback === "playing";
    var isBlocked = state.bgmPlayback === "blocked";
    var isMuted = !state.bgmEnabled || isBlocked;

    if (elements.bgmToggle) {
      elements.bgmToggle.checked = state.bgmEnabled;
      elements.bgmToggle.setAttribute("aria-checked", String(state.bgmEnabled));
    }
    if (elements.bgmStateText) {
      elements.bgmStateText.textContent = state.bgmEnabled
        ? translate("bgmOn")
        : translate("bgmOff");
    }
    if (elements.bgmVolume) {
      var volumePercent = Math.round(state.bgmVolume * 100);
      elements.bgmVolume.value = String(volumePercent);
      elements.bgmVolume.style.setProperty("--range-progress", String(volumePercent) + "%");
    }
    if (elements.bgmVolumeValue) {
      elements.bgmVolumeValue.textContent = String(Math.round(state.bgmVolume * 100)) + "%";
    }
    if (elements.musicButton) {
      elements.musicButton.classList.toggle("is-muted", isMuted);
      elements.musicButton.classList.toggle("is-blocked", isBlocked);
      elements.musicButton.setAttribute(
        "aria-label",
        translate(
          isBlocked
            ? "musicRetryAria"
            : isPlaying
              ? "musicPauseAria"
              : "musicButtonAria"
        )
      );
      elements.musicButton.setAttribute("aria-pressed", String(isPlaying));
    }
  }

  function showHudFeedback(type) {
    var feedback = state.feedback;
    feedback.type = type;
    feedback.text = translate(type);
    feedback.until = performance.now() + HUD_FEEDBACK_DURATION_MS;
    feedback.token += 1;
  }

  function clearHudFeedback() {
    state.feedback.type = null;
    state.feedback.text = "";
    state.feedback.until = 0;
    state.feedback.token += 1;
  }

  function resetNextInsightForRun() {
    state.nextInsight.safetyCuePending = false;
    state.nextInsight.safetyCueShown = false;
    state.nextInsight.safetyCueUntil = 0;
    state.nextInsight.perfectOpportunity = null;
    state.nextInsight.perfectOpportunityActive = false;
    state.nextInsight.perfectLaneIndex = null;
    state.nextInsight.perfectPath = null;
    state.nextInsight.perfectSuccessCount = 0;
  }

  function resetNextInsightForStage(preserveSafetyCuePending) {
    var safetyCuePending = preserveSafetyCuePending
      ? state.nextInsight.safetyCuePending
      : false;
    state.nextInsight.safetyCuePending = safetyCuePending;
    state.nextInsight.safetyCueUntil = 0;
    state.nextInsight.perfectOpportunity = null;
    state.nextInsight.perfectOpportunityActive = false;
    state.nextInsight.perfectLaneIndex = null;
    state.nextInsight.perfectPath = null;
  }

  function queueSafetyReleaseCue(previousSafetyCheck, nextProfile) {
    if (
      previousSafetyCheck === true &&
      nextProfile &&
      nextProfile.safetyCheck === false &&
      !state.nextInsight.safetyCueShown
    ) {
      state.nextInsight.safetyCuePending = true;
    }
  }

  function showPendingSafetyReleaseCue() {
    if (!state.nextInsight.safetyCuePending || !state.next) {
      return;
    }

    state.nextInsight.safetyCuePending = false;
    state.nextInsight.safetyCueShown = true;
    state.nextInsight.safetyCueUntil =
      performance.now() + NEXT_SAFETY_CUE_DURATION_MS;
  }

  function cloneNextSourceMeta(meta) {
    return meta ? Object.assign({}, meta) : null;
  }

  function cancelPerfectPath() {
    state.nextInsight.perfectPath = null;
  }

  function getSimulatedBottomBlock(laneIndex, removedBlockId) {
    return getActiveBlocks(laneIndex)
      .filter(function (block) {
        return block.id !== removedBlockId;
      })
      .reduce(function (bottom, block) {
        return !bottom || block.normalizedY > bottom.normalizedY
          ? block
          : bottom;
      }, null);
  }

  function computePerfectOpportunity() {
    if (
      !state.next ||
      !state.difficulty ||
      state.difficulty.safetyCheck ||
      state.nextInsight.perfectPath
    ) {
      return null;
    }

    var currentValue = state.next.current;
    var previewValue = state.next.preview;
    var previewMeta = state.next.previewMeta;
    if (currentValue === null || currentValue === undefined ||
        previewValue === null || previewValue === undefined) {
      return null;
    }

    var candidates = [];
    state.lanes.forEach(function (lane, laneIndex) {
      var currentBlock = getBottomBlock(laneIndex);
      if (!currentBlock || String(currentBlock.value) !== String(currentValue)) {
        return;
      }

      var nextBlock = getNextActiveBlock(laneIndex, currentBlock);
      if (!nextBlock || String(nextBlock.value) !== String(previewValue)) {
        return;
      }

      // A visible block is a real two-step target only when the preview
      // generator kept that block's identity in its source metadata.
      if (
        !previewMeta ||
        previewMeta.sourceType !== "visible-window" ||
        previewMeta.sourceBlockId !== nextBlock.id
      ) {
        return;
      }

      var previewPlacements = 0;
      state.lanes.forEach(function (candidateLane, candidateLaneIndex) {
        var simulatedBottom = getSimulatedBottomBlock(
          candidateLaneIndex,
          candidateLaneIndex === laneIndex ? currentBlock.id : null
        );
        if (
          simulatedBottom &&
          String(simulatedBottom.value) === String(previewValue)
        ) {
          previewPlacements += 1;
        }
      });

      if (previewPlacements === 1) {
        candidates.push({
          laneIndex: laneIndex,
          currentBlockId: currentBlock.id,
          previewBlockId: nextBlock.id,
          currentValue: currentValue,
          previewValue: previewValue,
          stage: state.stage,
          previewMeta: cloneNextSourceMeta(previewMeta)
        });
      }
    });

    return candidates.length === 1 ? candidates[0] : null;
  }

  function refreshPerfectOpportunity() {
    var opportunity = computePerfectOpportunity();
    state.nextInsight.perfectOpportunity = opportunity;
    state.nextInsight.perfectOpportunityActive = Boolean(opportunity);
    state.nextInsight.perfectLaneIndex = opportunity
      ? opportunity.laneIndex
      : null;
    return opportunity;
  }

  function validatePerfectPath() {
    var path = state.nextInsight.perfectPath;
    if (!path) {
      return null;
    }
    if (
      path.stage !== state.stage ||
      !state.next ||
      String(state.next.current) !== String(path.previewValue)
    ) {
      cancelPerfectPath();
      return null;
    }

    var promotedBlock = findBlock(path.laneIndex, path.previewBlockId);
    var bottomBlock = getBottomBlock(path.laneIndex);
    if (
      !promotedBlock ||
      promotedBlock.status !== "active" ||
      !bottomBlock ||
      bottomBlock.id !== path.previewBlockId
    ) {
      cancelPerfectPath();
      return null;
    }
    return path;
  }

  function preparePerfectResolution(laneIndex, target, firedValue) {
    var path = validatePerfectPath();
    if (path) {
      if (
        laneIndex !== path.laneIndex ||
        !target ||
        target.id !== path.previewBlockId ||
        String(firedValue) !== String(path.previewValue)
      ) {
        cancelPerfectPath();
        return null;
      }
      return { step: "second", path: path };
    }

    var opportunity = refreshPerfectOpportunity();
    if (
      opportunity &&
      opportunity.laneIndex === laneIndex &&
      target &&
      target.id === opportunity.currentBlockId &&
      String(firedValue) === String(opportunity.currentValue)
    ) {
      return { step: "first", opportunity: opportunity };
    }
    return null;
  }

  function registerPerfectFirstStep(resolution) {
    if (!resolution || resolution.perfectStep !== "first") {
      return;
    }
    var opportunity = resolution.perfectOpportunity;
    var promotedBlock = opportunity
      ? findBlock(opportunity.laneIndex, opportunity.previewBlockId)
      : null;
    if (
      !opportunity ||
      !promotedBlock ||
      promotedBlock.status !== "active" ||
      String(state.next && state.next.current) !== String(opportunity.previewValue)
    ) {
      cancelPerfectPath();
      return;
    }
    state.nextInsight.perfectPath = {
      stage: opportunity.stage,
      laneIndex: opportunity.laneIndex,
      currentBlockId: opportunity.currentBlockId,
      previewBlockId: opportunity.previewBlockId,
      previewValue: opportunity.previewValue,
      previewMeta: cloneNextSourceMeta(opportunity.previewMeta)
    };
    refreshPerfectOpportunity();
  }

  function registerPerfectSecondStep(resolution) {
    if (!resolution || resolution.perfectStep !== "second") {
      return false;
    }
    var path = resolution.perfectPath || state.nextInsight.perfectPath;
    if (
      !path ||
      path.stage !== state.stage ||
      path.previewBlockId !== resolution.blockId ||
      String(path.previewValue) !== String(resolution.value)
    ) {
      cancelPerfectPath();
      return false;
    }
    state.nextInsight.perfectSuccessCount += 1;
    cancelPerfectPath();
    return true;
  }

  function breakStackRushNextInsightChain() {
    cancelPerfectPath();
    refreshPerfectOpportunity();
  }

  function showStageBanner(type, completedStage, nextStage) {
    state.stageBanner.active = true;
    state.stageBanner.type = type;
    state.stageBanner.until = performance.now() + STAGE_BANNER_DURATION_MS;
    state.stageBanner.token += 1;
    state.stageBanner.completedStage = completedStage;
    state.stageBanner.nextStage = nextStage;
    state.stageBanner.pressureUp = nextStage % 5 === 0;
  }

  function clearStageBanner() {
    state.stageBanner.active = false;
    state.stageBanner.until = 0;
    state.stageBanner.token += 1;
    state.stageBanner.pressureUp = false;
  }

  function startStageBreak() {
    if (state.phase !== "running" || state.stageBreak) {
      return;
    }

    var now = performance.now();
    var completedStage = state.stage;
    var nextStage = completedStage + 1;

    state.stageResult = "clear";
    state.stageBreak = {
      startedAt: now,
      until: now + STAGE_BREAK_DURATION_MS,
      completedStage: completedStage,
      completedRemoved: state.stageRemoved,
      completedTarget: state.stageTarget,
      nextStage: nextStage
    };
    state.phase = PHASE_STAGE_BREAK;
    state.buttonsLocked = true;
    showStageBanner("clear", completedStage, nextStage);
    clearStageBoard();
  }

  function finishStageBreak(now) {
    if (
      state.phase !== PHASE_STAGE_BREAK ||
      !state.stageBreak ||
      now < state.stageBreak.until
    ) {
      return;
    }

    var nextStage = state.stageBreak.nextStage;
    state.stage = nextStage;
    state.stageElapsed = 0;
    state.stageRemoved = 0;
    applyStageDifficulty(nextStage);
    state.stageTarget = state.difficulty.target;
    state.highestStage = Math.max(state.highestStage, nextStage);
    state.stageBreak = null;
    state.phase = "running";
    initialiseStageBoard();
  }

  function updateStageProgress() {
    if (
      state.phase !== "running" ||
      state.stageElapsed < STAGE_DURATION_SECONDS
    ) {
      return;
    }

    var completedStage = state.stage;
    var nextStage = completedStage + 1;

    state.stageResult = "miss";
    showStageBanner("miss", completedStage, nextStage);
    state.stage = nextStage;
    state.stageElapsed = 0;
    state.stageRemoved = 0;
    state.highestStage = Math.max(state.highestStage, state.stage);
    clearStageBoard();
    applyStageDifficulty(nextStage);
    state.stageTarget = state.difficulty.target;
    initialiseStageBoard();
  }

  function updateStageUi() {
    if (!elements.stageValue) {
      return;
    }

    var target = Math.max(1, state.stageTarget);
    var progress = clamp(state.stageRemoved / target, 0, 1);
    var remainingSeconds = getStageRemainingSeconds();
    var timeSuffix = state.language === "ko" ? "초" : "s";

    elements.stageValue.textContent = String(state.stage);
    elements.stageProgressText.textContent =
      String(state.stageRemoved) + "/" + String(target);
    elements.stageProgressFill.style.width = String(progress * 100) + "%";
    elements.stageProgress.setAttribute("aria-valuemax", String(target));
    elements.stageProgress.setAttribute(
      "aria-valuenow",
      String(Math.min(state.stageRemoved, target))
    );
    elements.stageProgress.setAttribute(
      "aria-valuetext",
      String(state.stageRemoved) + "/" + String(target)
    );
    elements.stageTimeValue.textContent =
      String(remainingSeconds) + timeSuffix;
  }

  function updateComboUi() {
    if (!elements.comboValue) {
      return;
    }

    elements.comboValue.textContent = "x" + String(state.combo);
    elements.comboValue.setAttribute(
      "aria-label",
      translate("currentComboAria") + " x" + String(state.combo)
    );
  }

  function renderHudFeedback(now) {
    if (!elements.feedbackText) {
      return;
    }

    var feedback = state.feedback;
    var active =
      Boolean(feedback.type) &&
      now < feedback.until &&
      state.phase !== "start" &&
      state.phase !== "game-over";

    if (!active) {
      elements.feedbackText.hidden = true;
      elements.feedbackText.classList.remove(
        "is-visible",
        "is-hit",
        "is-miss",
        "is-milestone",
        "is-perfect"
      );
      return;
    }

    elements.feedbackText.hidden = false;
    elements.feedbackText.textContent = feedback.text;
    var feedbackToken = String(feedback.token);
    if (elements.feedbackText.dataset.feedbackToken !== feedbackToken) {
      elements.feedbackText.classList.remove(
        "is-visible",
        "is-hit",
        "is-miss",
        "is-milestone",
        "is-perfect"
      );
      void elements.feedbackText.offsetWidth;
      elements.feedbackText.classList.add(
        "is-visible",
        "is-" + feedback.type
      );
      elements.feedbackText.dataset.feedbackToken = feedbackToken;
    }
  }

  function renderNextInsight(now) {
    var stackRushRunning = state.phase === "running";
    var safetyCueActive =
      stackRushRunning && now < state.nextInsight.safetyCueUntil;
    if (elements.previewNext) {
      elements.previewNext.classList.toggle("is-safety-pulse", safetyCueActive);
    }

    if (
      stackRushRunning &&
      state.nextInsight.perfectPath &&
      !(state.resolve && state.resolve.perfectStep === "second")
    ) {
      validatePerfectPath();
    } else if (stackRushRunning && !state.nextInsight.perfectPath) {
      refreshPerfectOpportunity();
    }
  }

  function renderStageBanner(now) {
    if (!elements.runBanner) {
      return;
    }

    var banner = state.stageBanner;
    var active =
      banner.active &&
      now < banner.until &&
      (state.phase === "running" || state.phase === PHASE_STAGE_BREAK);

    if (!active) {
      elements.runBanner.hidden = true;
      elements.runBanner.classList.remove("is-visible", "is-clear", "is-miss");
      delete elements.runBanner.dataset.bannerToken;
      return;
    }

    elements.runBanner.hidden = false;
    elements.runBannerKicker.textContent =
      translate("stage") + " " + String(banner.completedStage);
    elements.runBannerTitle.textContent = translate(
      banner.pressureUp
        ? "pressureUp"
        : banner.type === "clear"
          ? "stageClear"
          : "keepPushing"
    );
    elements.runBannerDetail.textContent =
      translate("nextStage") +
      " " +
      String(banner.nextStage) +
      " · " +
      translate("goal") +
      " " +
      String(getStageTarget(banner.nextStage));

    var bannerToken = String(banner.token);
    if (elements.runBanner.dataset.bannerToken !== bannerToken) {
      elements.runBanner.classList.remove("is-visible", "is-clear", "is-miss");
      void elements.runBanner.offsetWidth;
      elements.runBanner.classList.add("is-visible", "is-" + banner.type);
      elements.runBanner.dataset.bannerToken = bannerToken;
    }
  }

  function getAudioContextConstructor() {
    return window.AudioContext || window.webkitAudioContext || null;
  }

  function ensureBgmAudioContext() {
    if (bgmEngine.context) {
      return bgmEngine.context;
    }

    var AudioContextConstructor = getAudioContextConstructor();
    if (!AudioContextConstructor) {
      bgmEngine.webAudioFailure = new Error("Web Audio is not supported.");
      return null;
    }

    try {
      bgmEngine.context = new AudioContextConstructor();
      bgmEngine.gain = bgmEngine.context.createGain();
      bgmEngine.gain.gain.value = state.bgmVolume;
      bgmEngine.gainValue = state.bgmVolume;
      bgmEngine.gain.connect(bgmEngine.context.destination);
      bgmEngine.context.addEventListener("statechange", function () {
        if (
          bgmEngine.context.state === "interrupted" &&
          state.bgmPlayback === "playing"
        ) {
          state.bgmWasPlayingBeforePause = true;
          state.bgmPlayback = "paused";
          updateBgmUi();
        }
      });
      return bgmEngine.context;
    } catch (error) {
      bgmEngine.webAudioFailure = error;
      bgmEngine.context = null;
      bgmEngine.gain = null;
      return null;
    }
  }

  function decodeBgmAudioData(context, arrayBuffer) {
    return new Promise(function (resolve, reject) {
      var settled = false;

      function succeed(buffer) {
        if (!settled) {
          settled = true;
          resolve(buffer);
        }
      }

      function fail(error) {
        if (!settled) {
          settled = true;
          reject(error);
        }
      }

      try {
        var decodeResult = context.decodeAudioData(arrayBuffer, succeed, fail);
        if (decodeResult && typeof decodeResult.then === "function") {
          decodeResult.then(succeed, fail);
        }
      } catch (error) {
        fail(error);
      }
    });
  }

  function prepareWebAudioBuffer() {
    if (bgmEngine.buffer) {
      return Promise.resolve(bgmEngine.buffer);
    }
    if (bgmEngine.bufferPromise) {
      return bgmEngine.bufferPromise;
    }
    if (window.location.protocol === "file:") {
      bgmEngine.webAudioFailure = new Error("BGM requires an HTTP or HTTPS origin.");
      return Promise.reject(bgmEngine.webAudioFailure);
    }
    if (!window.fetch) {
      bgmEngine.webAudioFailure = new Error("Fetch is not supported.");
      return Promise.reject(bgmEngine.webAudioFailure);
    }

    var context = ensureBgmAudioContext();
    if (!context) {
      return Promise.reject(bgmEngine.webAudioFailure);
    }

    bgmEngine.bufferPromise = window.fetch(BGM_SOURCE_URL).then(function (response) {
      if (!response.ok) {
        throw new Error("BGM request failed with status " + response.status + ".");
      }
      return response.arrayBuffer();
    }).then(function (arrayBuffer) {
      return decodeBgmAudioData(context, arrayBuffer);
    }).then(function (buffer) {
      if (!buffer || !buffer.duration || !buffer.length || !buffer.sampleRate) {
        throw new Error("BGM decoded without a playable duration.");
      }
      bgmEngine.buffer = buffer;
      bgmEngine.loopStart = 0;
      bgmEngine.loopEnd = buffer.length / buffer.sampleRate;
      bgmEngine.bufferDuration = buffer.duration;
      return buffer;
    }).catch(function (error) {
      bgmEngine.webAudioFailure = error;
      throw error;
    });

    return bgmEngine.bufferPromise;
  }

  function prepareBgmAssets() {
    prepareWebAudioBuffer().catch(function () {
      // The game can start without BGM and the music button can expose the retry state.
    });
  }

  function prepareBgmForRun() {
    if (!state.bgmEnabled) {
      return Promise.resolve("none");
    }

    return new Promise(function (resolve) {
      var settled = false;
      var timeoutId = window.setTimeout(function () {
        finish(bgmEngine.buffer ? "web-audio" : "none");
      }, BGM_PREPARE_TIMEOUT_MS);

      function finish(backend) {
        if (settled) {
          return;
        }
        settled = true;
        window.clearTimeout(timeoutId);
        resolve(backend);
      }

      prepareWebAudioBuffer().then(function () {
        finish("web-audio");
      }).catch(function () {
        finish("none");
      });
    });
  }

  function getCurrentWebAudioGain() {
    if (!bgmEngine.fade || !bgmEngine.context) {
      return bgmEngine.gainValue;
    }

    var progress = clamp(
      (bgmEngine.context.currentTime - bgmEngine.fade.startedAt) /
        bgmEngine.fade.duration,
      0,
      1
    );
    return bgmEngine.fade.from +
      (bgmEngine.fade.to - bgmEngine.fade.from) * easeOutCubic(progress);
  }

  function cancelBgmFade() {
    if (state.bgmFadeFrame !== null) {
      window.cancelAnimationFrame(state.bgmFadeFrame);
      state.bgmFadeFrame = null;
    }

    if (bgmEngine.gain && bgmEngine.context) {
      var currentValue = clamp(getCurrentWebAudioGain(), 0, 1);
      var now = bgmEngine.context.currentTime;
      try {
        bgmEngine.gain.gain.cancelScheduledValues(now);
        bgmEngine.gain.gain.setValueAtTime(currentValue, now);
      } catch (error) {
        // A closed or interrupted context can reject automation changes.
      }
      bgmEngine.gainValue = currentValue;
    }
    bgmEngine.fade = null;
  }

  function setWebAudioGain(value) {
    if (!bgmEngine.gain || !bgmEngine.context) {
      return;
    }

    cancelBgmFade();
    var nextValue = clamp(value, 0, 1);
    var now = bgmEngine.context.currentTime;
    try {
      bgmEngine.gain.gain.cancelScheduledValues(now);
      bgmEngine.gain.gain.setValueAtTime(nextValue, now);
      bgmEngine.gainValue = nextValue;
    } catch (error) {
      // A closed or interrupted context can reject automation changes.
    }
  }

  function fadeWebAudioTo(targetValue) {
    if (!bgmEngine.gain || !bgmEngine.context) {
      return;
    }

    var fromValue = clamp(getCurrentWebAudioGain(), 0, 1);
    var toValue = clamp(targetValue, 0, 1);
    cancelBgmFade();
    var now = bgmEngine.context.currentTime;
    var duration = BGM_FADE_DURATION_MS / 1000;
    var curve = new Float32Array(32);

    for (var index = 0; index < curve.length; index += 1) {
      var progress = index / (curve.length - 1);
      curve[index] = fromValue +
        (toValue - fromValue) * easeOutCubic(progress);
    }

    try {
      bgmEngine.gain.gain.cancelScheduledValues(now);
      bgmEngine.gain.gain.setValueAtTime(fromValue, now);
      bgmEngine.gain.gain.setValueCurveAtTime(curve, now, duration);
      bgmEngine.gain.gain.setValueAtTime(toValue, now + duration);
      bgmEngine.gainValue = toValue;
      bgmEngine.fade = {
        startedAt: now,
        duration: duration,
        from: fromValue,
        to: toValue
      };
    } catch (error) {
      setWebAudioGain(toValue);
    }
  }

  function fadeBgmIn() {
    fadeWebAudioTo(state.bgmVolume);
  }

  function handleBgmPlaybackFailure() {
    cancelBgmFade();
    state.bgmPlayback = "blocked";
    updateBgmUi();
  }

  function startWebAudioPlayback(withFade) {
    var context = ensureBgmAudioContext();
    if (!context || !bgmEngine.buffer || !bgmEngine.gain) {
      handleBgmPlaybackFailure();
      return Promise.reject(new Error("Web Audio BGM is not ready."));
    }

    var resumePromise;
    try {
      resumePromise = context.state === "running"
        ? Promise.resolve()
        : context.resume();
    } catch (error) {
      handleBgmPlaybackFailure();
      return Promise.reject(error);
    }

    return Promise.resolve(resumePromise).then(function () {
      if (state.phase !== "running" || !state.bgmEnabled) {
        return;
      }

      if (bgmEngine.source && state.bgmPlayback === "paused") {
        bgmEngine.backend = "web-audio";
        state.bgmPlayback = "playing";
        if (withFade) {
          fadeBgmIn();
        } else {
          setWebAudioGain(state.bgmVolume);
        }
        updateBgmUi();
        return;
      }

      if (bgmEngine.source && state.bgmPlayback === "playing") {
        return;
      }

      var source = context.createBufferSource();
      source.buffer = bgmEngine.buffer;
      source.loop = true;
      source.loopStart = bgmEngine.loopStart;
      source.loopEnd = bgmEngine.loopEnd;
      source.connect(bgmEngine.gain);
      bgmEngine.gainValue = withFade ? 0 : state.bgmVolume;
      bgmEngine.gain.gain.cancelScheduledValues(context.currentTime);
      bgmEngine.gain.gain.setValueAtTime(bgmEngine.gainValue, context.currentTime);
      source.start(0);
      source.addEventListener("ended", function () {
        if (bgmEngine.source === source) {
          bgmEngine.source = null;
        }
      });
      bgmEngine.source = source;
      bgmEngine.backend = "web-audio";
      state.bgmStartedThisRun = true;
      state.bgmPlayback = "playing";
      if (withFade) {
        fadeBgmIn();
      }
      updateBgmUi();
    }).catch(function (error) {
      handleBgmPlaybackFailure();
      throw error;
    });
  }

  function selectBgmBackendForPlayback() {
    if (bgmEngine.backend !== "none") {
      return bgmEngine.backend;
    }
    if (bgmEngine.buffer && !bgmEngine.webAudioFailure) {
      bgmEngine.backend = "web-audio";
      return bgmEngine.backend;
    }
    return "none";
  }

  function startBgmPlayback(withFade) {
    if (!state.bgmEnabled) {
      updateBgmUi();
      return;
    }

    var backend = selectBgmBackendForPlayback();
    if (backend === "web-audio") {
      startWebAudioPlayback(withFade).catch(function () {
        // The blocked state is already reflected in the music button.
      });
      return;
    }

    if (!bgmEngine.buffer && !bgmEngine.webAudioFailure) {
      prepareWebAudioBuffer().then(function () {
        if (state.phase === "running" && state.bgmEnabled) {
          bgmEngine.backend = "web-audio";
          startBgmPlayback(withFade);
        }
      }).catch(function () {
        state.bgmPlayback = "blocked";
        updateBgmUi();
      });
      return;
    }

    state.bgmPlayback = "blocked";
    updateBgmUi();
  }

  function pauseBgmForExternal() {
    cancelBgmFade();
    state.bgmWasPlayingBeforePause =
      state.bgmPlayback === "playing" || state.bgmWasPlayingBeforePause;
    if (!state.bgmWasPlayingBeforePause) {
      updateBgmUi();
      return;
    }

    if (
      bgmEngine.backend === "web-audio" &&
      bgmEngine.context &&
      bgmEngine.context.state === "running"
    ) {
      bgmEngine.context.suspend().catch(function () {
        // A later resume attempt can expose the blocked state if needed.
      });
    }
    state.bgmPlayback = "paused";
    updateBgmUi();
  }

  function stopBgm(resetPosition) {
    cancelBgmFade();
    state.bgmWasPlayingBeforePause = false;

    if (bgmEngine.source) {
      try {
        bgmEngine.source.stop();
      } catch (error) {
        // The source may already have stopped during teardown.
      }
      try {
        bgmEngine.source.disconnect();
      } catch (error) {
        // The source may already be disconnected.
      }
      bgmEngine.source = null;
    }

    if (bgmEngine.gain && bgmEngine.context) {
      setWebAudioGain(state.bgmVolume);
      if (resetPosition && bgmEngine.context.state === "running") {
        bgmEngine.context.suspend().catch(function () {
          // The context can remain running without an active source.
        });
      }
    }

    bgmEngine.backend = "none";
    bgmEngine.gainValue = state.bgmVolume;
    state.bgmPlayback = "idle";
    updateBgmUi();
  }

  function setBgmEnabled(enabled) {
    state.bgmEnabled = Boolean(enabled);
    writeBgmPreferences();

    if (!state.bgmEnabled) {
      cancelBgmFade();
      if (
        bgmEngine.backend === "web-audio" &&
        bgmEngine.gain &&
        bgmEngine.context
      ) {
        setWebAudioGain(0);
        bgmEngine.context.suspend().catch(function () {
          // Muting remains reflected in state even if suspension is interrupted.
        });
      }
      state.bgmPlayback = "paused";
    } else if (state.phase === "running") {
      startBgmPlayback(true);
      return;
    }
    updateBgmUi();
  }

  function setBgmVolume(value) {
    state.bgmVolume = clamp(Number(value) / 100, 0, 1);
    writeBgmPreferences();

    if (
      bgmEngine.backend === "web-audio" &&
      state.bgmPlayback === "playing"
    ) {
      if (bgmEngine.fade) {
        fadeWebAudioTo(state.bgmVolume);
      } else {
        setWebAudioGain(state.bgmVolume);
      }
    }
    updateBgmUi();
  }

  function handleMusicButtonClick() {
    if (state.phase !== "running") {
      return;
    }

    if (state.bgmEnabled && state.bgmPlayback === "playing") {
      setBgmEnabled(false);
      return;
    }

    if (!state.bgmEnabled) {
      setBgmEnabled(true);
      return;
    }

    startBgmPlayback(true);
  }

  function createWave() {
    return {
      id: "wave-" + state.nextWaveNumber++,
      values: Array.from({ length: LANE_COUNT }, function () {
        return randomDigit();
      }),
      visible: false,
      blockIds: []
    };
  }

  function createBlock(laneIndex, value, normalizedY, wave, options) {
    var blockOptions = options || {};
    return {
      id: "block-" + state.nextBlockNumber++,
      laneIndex: laneIndex,
      value: value,
      normalizedY: normalizedY,
      status: "active",
      kind: blockOptions.kind || "wave",
      parked: Boolean(blockOptions.parked),
      wrongFeedback: false,
      wrongFeedbackUntil: 0,
      stackImpact: null,
      redLineExempt: Boolean(blockOptions.redLineExempt),
      spawnedAt: performance.now(),
      waveId: wave ? wave.id : null,
      element: null
    };
  }

  function getHighestVisibleWaveY() {
    var highestWaveY = null;
    state.lanes.forEach(function (lane) {
      lane.blocks.forEach(function (block) {
        if (
          (block.status === "active" || block.status === "removing") &&
          block.kind === "wave"
        ) {
          highestWaveY =
            highestWaveY === null
              ? block.normalizedY
              : Math.min(highestWaveY, block.normalizedY);
        }
      });
    });
    return highestWaveY === null ? 0 : highestWaveY;
  }

  function getWaveInsertionY() {
    return clamp(
      getHighestVisibleWaveY() - getStackRushWavePitchNormalized(),
      0,
      1
    );
  }

  function reflowLaneForWaveInsertion(lane, insertionY, releaseParkedBlocks) {
    var wavePitch = getStackRushWavePitchNormalized();
    var candidates = lane.blocks
      .filter(function (block) {
        return (
          (block.status === "active" || block.status === "removing") &&
          (block.parked ||
            block.normalizedY >= insertionY - STACK_RUSH_WAVE_GAP_EPSILON)
        );
      })
      .sort(function (first, second) {
        // Parked penalties represent rows that have already settled at the
        // red-line end. They must always be inserted immediately behind the
        // incoming wave, even when their current normalizedY is deeper than
        // moving blocks that are still part of the old cascade.
        if (first.parked !== second.parked) {
          return first.parked ? -1 : 1;
        }
        var yDifference = first.normalizedY - second.normalizedY;
        if (Math.abs(yDifference) > STACK_RUSH_WAVE_GAP_EPSILON) {
          return yDifference;
        }
        return first.id < second.id ? -1 : first.id > second.id ? 1 : 0;
      });
    var movedBlocks = [];
    var releasedParkedBlocks = [];
    var previousTargetY = insertionY;

    candidates.forEach(function (block, index) {
      // Parked penalties are logical rows that have stopped at the line end.
      // Put every one directly behind the incoming wave, then let the normal
      // stack continue behind them. The incoming wave itself is created after
      // this pass, so it never gets pushed by the reflow.
      var minimumTargetY = insertionY + wavePitch * (index + 1);
      var targetY = block.parked
        ? minimumTargetY
        : Math.max(block.normalizedY, minimumTargetY, previousTargetY + wavePitch);
      if (Math.abs(targetY - block.normalizedY) > STACK_RUSH_WAVE_GAP_EPSILON) {
        block.normalizedY = targetY;
        movedBlocks.push(block);
      }
      if (
        releaseParkedBlocks &&
        block.kind === "penalty" &&
        block.parked
      ) {
        block.parked = false;
        releasedParkedBlocks.push(block);
      }
      previousTargetY = block.normalizedY;
    });

    return {
      movedBlocks: movedBlocks,
      releasedParkedBlocks: releasedParkedBlocks
    };
  }

  function addWaveToVisible(wave, normalizedY, releaseParkedBlocks) {
    wave.visible = true;
    wave.spawnedAt = performance.now();
    wave.blockIds = [];

    if (state.waves.indexOf(wave) === -1) {
      state.waves.push(wave);
    }

    var reflowSummary = {
      movedBlocks: [],
      releasedParkedBlocks: []
    };

    wave.values.forEach(function (value, laneIndex) {
      var lane = state.lanes[laneIndex];
      var laneReflow = reflowLaneForWaveInsertion(
        lane,
        normalizedY,
        releaseParkedBlocks
      );
      reflowSummary.movedBlocks = reflowSummary.movedBlocks.concat(
        laneReflow.movedBlocks
      );
      reflowSummary.releasedParkedBlocks = reflowSummary.releasedParkedBlocks.concat(
        laneReflow.releasedParkedBlocks
      );

      var block = createBlock(laneIndex, value, normalizedY, wave);
      lane.blocks.push(block);
      wave.blockIds.push(block.id);

      if (laneReflow.releasedParkedBlocks.length > 0) {
        triggerStackImpact(
          block,
          laneReflow.releasedParkedBlocks[0],
          "from-top"
        );
      }
    });

    return reflowSummary;
  }

  function removeStaleWaveMetadata() {
    state.waves = state.waves.filter(function (wave) {
      return wave.blockIds.some(function (blockId) {
        return state.lanes.some(function (lane) {
          return lane.blocks.some(function (block) {
            return block.id === blockId;
          });
        });
      });
    });
  }

  function spawnNextFutureWave() {
    var wave = state.futureWaves.shift();
    if (!wave) {
      wave = createWave();
    }
    var insertionY = getWaveInsertionY();
    var reflowSummary = addWaveToVisible(wave, insertionY, true);
    state.lastWaveReflowSummary = reflowSummary;
    state.futureWaves.push(createWave());
    removeStaleWaveMetadata();
    return reflowSummary;
  }

  function clearRenderedStageObjects() {
    laneElements.forEach(function (laneElement) {
      Array.prototype.forEach.call(
        laneElement.blocks.children,
        function (child) {
          child.remove();
        }
      );
      Array.prototype.forEach.call(
        laneElement.track.querySelectorAll(".projectile"),
        function (projectile) {
          projectile.remove();
        }
      );
    });
  }

  function clearStageBoard() {
    clearRenderedStageObjects();
    state.waves = [];
    state.futureWaves = [];
    state.lanes = createLanes();
    state.resolve = null;
    state.pendingInputs = [];
    state.buttonsLocked = true;
    state.waveTimer = 0;
    state.stageSpawnedWaveCount = 0;
    state.waveSpacingCalibrationPending = false;
    state.lastWaveReflowSummary = {
      movedBlocks: [],
      releasedParkedBlocks: []
    };
    state.next = null;
    state.lastRenderedCurrent = null;
    state.lastRenderedPreview = null;
    resetNextInsightForStage();
  }

  function initialiseStageBoard() {
    state.waves = [];
    state.futureWaves = [];
    state.lanes = createLanes();
    state.resolve = null;
    state.pendingInputs = [];
    state.buttonsLocked = false;
    state.waveTimer = state.difficulty.waveIntervalSeconds;
    state.stageSpawnedWaveCount = 0;
    state.waveSpacingCalibrationPending = false;
    state.lastWaveReflowSummary = {
      movedBlocks: [],
      releasedParkedBlocks: []
    };
    state.lastRenderedCurrent = null;
    state.lastRenderedPreview = null;
    // applyStageDifficulty() may have queued the Stage 11 safety-release cue
    // immediately before this board is rebuilt. Keep that one pending signal
    // long enough for showPendingSafetyReleaseCue() below to arm the preview.
    resetNextInsightForStage(true);

    var firstWave = createWave();
    var secondWave = createWave();
    var wavePitch = getStackRushWavePitchNormalized();
    state.waves = [firstWave, secondWave];
    addWaveToVisible(firstWave, wavePitch, false);
    addWaveToVisible(secondWave, 0, false);

    state.futureWaves = [createWave(), createWave()];

    state.next = {
      current: chooseUniform(unique(firstWave.values)),
      preview: null,
      source: "visible-window",
      currentMeta: null,
      previewMeta: null
    };
    var currentLaneIndex = firstWave.values.indexOf(state.next.current);
    state.next.currentMeta = {
      sourceType: "visible-window",
      sourceBlockId:
        currentLaneIndex >= 0 ? firstWave.blockIds[currentLaneIndex] : null,
      sourceWaveId: firstWave.id,
      laneIndex: currentLaneIndex >= 0 ? currentLaneIndex : null
    };
    var preview = generateNextPreview();
    state.next.preview = preview.value;
    state.next.previewSource = preview.source;
    state.next.previewMeta = cloneNextSourceMeta(preview.sourceMeta);
    showPendingSafetyReleaseCue();
    scheduleInitialWaveSpacingCalibration();
  }

  function initialiseRun() {
    clearCountdownTimers();
    stopBgm(true);

    state.phase = "countdown";
    state.score = 0;
    state.elapsed = 0;
    state.stageElapsed = 0;
    state.level = 1;
    state.stage = 1;
    state.stageRemoved = 0;
    state.stageTarget = getStageTarget(state.stage);
    state.stageResult = null;
    state.highestStage = 1;
    state.stageBreak = null;
    state.stageProfile = null;
    state.stageSpawnedWaveCount = 0;
    clearStageBanner();
    state.combo = 0;
    state.bestCombo = 0;
    clearHudFeedback();
    resetNextInsightForRun();
    state.difficulty = buildStackRushStageProfile(1);
    state.motionDifficulty = state.difficulty;
    state.waveTimer = state.difficulty.waveIntervalSeconds;
    state.nextWaveNumber = 1;
    state.nextBlockNumber = 1;
    state.nextStackImpactToken = 1;
    state.lastWaveReflowSummary = {
      movedBlocks: [],
      releasedParkedBlocks: []
    };
    state.waves = [];
    state.futureWaves = [];
    state.lanes = createLanes();
    state.resolve = null;
    state.pendingInputs = [];
    state.buttonsLocked = false;
    state.pauseReason = null;
    state.bgmWasPlayingBeforePause = false;
    state.bgmStartedThisRun = false;
    state.countdownResumeFade = false;
    state.lastRenderedCurrent = null;
    state.lastRenderedPreview = null;

    showScreen("game");
    measureLayout();
    state.difficulty = buildStackRushStageProfile(1);
    state.motionDifficulty = state.difficulty;
    state.waveTimer = state.difficulty.waveIntervalSeconds;
    state.stageProfile = state.difficulty;
    state.stageTarget = state.difficulty.target;

    initialiseStageBoard();

    state.lastFrameTime = performance.now();
    render(performance.now());
  }

  function getActiveBlocks(laneIndex, lanes) {
    var sourceLanes = lanes || state.lanes;
    return sourceLanes[laneIndex].blocks.filter(function (block) {
      return block.status === "active";
    });
  }

  function getBottomBlock(laneIndex, lanes) {
    var activeBlocks = getActiveBlocks(laneIndex, lanes);
    if (activeBlocks.length === 0) {
      return null;
    }
    return activeBlocks.reduce(function (bottom, block) {
      return !bottom || block.normalizedY > bottom.normalizedY ? block : bottom;
    }, null);
  }

  function getVisibleBlockCount() {
    return state.lanes.reduce(function (sum, lane, laneIndex) {
      return sum + getActiveBlocks(laneIndex).length;
    }, 0);
  }

  function createBlockDescriptor(block, laneIndex) {
    return {
      value: block.value,
      laneIndex: laneIndex,
      sourceType: "visible-window",
      sourceBlockId: block.id,
      sourceWaveId: block.waveId
    };
  }

  function createFutureDescriptor(wave, laneIndex) {
    if (!wave) {
      return {
        value: randomDigit(),
        laneIndex: laneIndex,
        sourceType: "future-wave",
        sourceBlockId: null,
        sourceWaveId: null
      };
    }

    return {
      value: wave.values[laneIndex],
      laneIndex: laneIndex,
      sourceType: "future-wave",
      sourceBlockId: null,
      sourceWaveId: wave.id
    };
  }

  function getNextActiveBlock(laneIndex, block, lanes) {
    return getActiveBlocks(laneIndex, lanes)
      .filter(function (candidate) {
        return (
          candidate.id !== block.id &&
          candidate.normalizedY < block.normalizedY
        );
      })
      .reduce(function (nextBlock, candidate) {
        return !nextBlock || candidate.normalizedY > nextBlock.normalizedY
          ? candidate
          : nextBlock;
      }, null);
  }

  function getLogicalFrontierSlots(lanes, futureWaves) {
    var sourceLanes = lanes || state.lanes;
    var sourceFutureWaves = futureWaves || state.futureWaves;

    return sourceLanes.map(function (lane, laneIndex) {
      var bottomBlock = getBottomBlock(laneIndex, sourceLanes);
      var frontier = bottomBlock
        ? createBlockDescriptor(bottomBlock, laneIndex)
        : createFutureDescriptor(sourceFutureWaves[0], laneIndex);
      var nextBlock = bottomBlock
        ? getNextActiveBlock(laneIndex, bottomBlock, sourceLanes)
        : null;
      var next = nextBlock
        ? createBlockDescriptor(nextBlock, laneIndex)
        : createFutureDescriptor(
            sourceFutureWaves[bottomBlock ? 0 : 1],
            laneIndex
          );

      return {
        value: frontier.value,
        laneIndex: frontier.laneIndex,
        sourceType: frontier.sourceType,
        sourceBlockId: frontier.sourceBlockId,
        sourceWaveId: frontier.sourceWaveId,
        next: next
      };
    });
  }

  function createFrontierCandidate(slot) {
    return {
      value: slot.value,
      laneIndex: slot.laneIndex,
      sourceType: slot.sourceType,
      sourceBlockId: slot.sourceBlockId,
      sourceWaveId: slot.sourceWaveId
    };
  }

  function createNextBlockCandidate(slot) {
    return {
      value: slot.next.value,
      laneIndex: slot.next.laneIndex,
      sourceType: slot.next.sourceType,
      sourceBlockId: slot.next.sourceBlockId,
      sourceWaveId: slot.next.sourceWaveId
    };
  }

  function getMatchingFrontierSlots(frontierSlots) {
    if (!state.next) {
      return [];
    }

    return frontierSlots.filter(function (slot) {
      return slot.value === state.next.current;
    });
  }

  function getActualCurrentChoices(frontierSlots) {
    return getMatchingFrontierSlots(frontierSlots).filter(function (slot) {
      return slot.sourceType === "visible-window";
    });
  }

  function simulateFrontierAfterChoice(frontierSlots, possibleChoice) {
    return frontierSlots.map(function (slot) {
      if (slot.laneIndex !== possibleChoice.laneIndex) {
        return slot;
      }

      return {
        value: slot.next.value,
        laneIndex: slot.next.laneIndex,
        sourceType: slot.next.sourceType,
        sourceBlockId: slot.next.sourceBlockId,
        sourceWaveId: slot.next.sourceWaveId,
        next: slot.next
      };
    });
  }

  function candidateSurvivesSafety(candidateValue, frontierSlots) {
    if (!state.next) {
      return true;
    }

    var matchingChoices = getActualCurrentChoices(frontierSlots);
    if (matchingChoices.length === 0) {
      return true;
    }

    return matchingChoices.every(function (possibleChoice) {
      var simulatedSlots = simulateFrontierAfterChoice(
        frontierSlots,
        possibleChoice
      );
      return simulatedSlots.some(function (slot) {
        return slot.value === candidateValue;
      });
    });
  }

  function getBasePreviewCandidates(frontierSlots, matchingSlots) {
    var excludedSlot = null;
    if (matchingSlots.length > 0) {
      excludedSlot =
        matchingSlots[Math.floor(Math.random() * matchingSlots.length)];
    }

    return frontierSlots
      .filter(function (slot) {
        return slot !== excludedSlot;
      })
      .map(createFrontierCandidate);
  }

  function getBlockLayerHeight() {
    return Math.max(
      1,
      state.layout.blockLayerHeight || state.layout.trackHeight || 520
    );
  }

  function getBlockHeightPixels() {
    if (state.layout.blockHeight > 0) {
      return state.layout.blockHeight;
    }
    if (state.layout.blockWidth > 0) {
      return state.layout.blockWidth;
    }
    var layerWidth = state.layout.blockLayerWidth || state.layout.trackWidth;
    if (layerWidth > 0) {
      return clamp(layerWidth * 0.8, 24, 78);
    }
    return 52;
  }

  function getBlockHeightNormalized() {
    return Math.max(0.001, getBlockHeightPixels() / getBlockLayerHeight());
  }

  function getStackRushWaveGapPixels() {
    return getBlockHeightPixels() * STACK_RUSH_WAVE_GAP_RATIO;
  }

  function getStackRushWavePitchNormalized() {
    return getBlockHeightNormalized() * (1 + STACK_RUSH_WAVE_GAP_RATIO);
  }

  function getWavePairForDiagnostics() {
    for (var laneIndex = 0; laneIndex < state.lanes.length; laneIndex += 1) {
      // Measure the closest rendered stack pair. Penalties are part of the
      // same row spacing contract, so a reflow cannot hide a bad gap between
      // two waves by measuring only blocks tagged as wave.
      var stackBlocks = state.lanes[laneIndex].blocks
        .filter(function (block) {
          return block.status === "active" || block.status === "removing";
        })
        .sort(function (first, second) {
          return first.normalizedY - second.normalizedY;
        });

      if (stackBlocks.length >= 2) {
        return {
          laneIndex: laneIndex,
          upper: stackBlocks[0],
          lower: stackBlocks[1]
        };
      }
    }

    return null;
  }

  function getBlockElementRect(block) {
    if (!block || !block.element || !block.element.isConnected) {
      return null;
    }
    var rect = block.element.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      return null;
    }
    return rect;
  }

  function getWaveGapDiagnostics() {
    var layerHeight = getBlockLayerHeight();
    var blockHeight = getBlockHeightPixels();
    var pair = getWavePairForDiagnostics();
    var centerGapPixels = null;
    var edgeGapPixels = null;
    var waveGapRatio = null;

    if (pair) {
      centerGapPixels =
        (pair.lower.normalizedY - pair.upper.normalizedY) * layerHeight;
      edgeGapPixels = centerGapPixels - blockHeight;

      var upperRect = getBlockElementRect(pair.upper);
      var lowerRect = getBlockElementRect(pair.lower);
      var hasTransientVisual = false;
      if (upperRect && lowerRect) {
        hasTransientVisual =
          pair.upper.element.classList.contains("is-stack-impact") ||
          pair.lower.element.classList.contains("is-stack-impact") ||
          pair.upper.element.classList.contains("is-removing") ||
          pair.lower.element.classList.contains("is-removing") ||
          pair.upper.element.classList.contains("is-spawn-feedback") ||
          pair.lower.element.classList.contains("is-spawn-feedback") ||
          pair.upper.element.classList.contains("is-wrong") ||
          pair.lower.element.classList.contains("is-wrong");
      }
      if (upperRect && lowerRect && !hasTransientVisual) {
        centerGapPixels =
          (lowerRect.top + lowerRect.bottom) / 2 -
          (upperRect.top + upperRect.bottom) / 2;
        edgeGapPixels = lowerRect.top - upperRect.bottom;
        blockHeight = (upperRect.height + lowerRect.height) / 2;
      }

      waveGapRatio = blockHeight > 0 ? edgeGapPixels / blockHeight : null;
    }

    var maxOverlapPixels = 0;
    state.lanes.forEach(function (lane) {
      var blocks = lane.blocks
        .filter(function (block) {
          return block.status === "active" || block.status === "removing";
        })
        .sort(function (first, second) {
          return first.normalizedY - second.normalizedY;
        });
      for (var index = 1; index < blocks.length; index += 1) {
        var centerDistance =
          (blocks[index].normalizedY - blocks[index - 1].normalizedY) *
          layerHeight;
        maxOverlapPixels = Math.max(
          maxOverlapPixels,
          blockHeight - centerDistance
        );
      }
    });

    return {
      blockHeightPixels: blockHeight,
      blockLayerHeightPixels: layerHeight,
      centerGapPixels:
        centerGapPixels === null ? null : Math.round(centerGapPixels * 100) / 100,
      edgeGapPixels:
        edgeGapPixels === null ? null : Math.round(edgeGapPixels * 100) / 100,
      waveGapRatio:
        waveGapRatio === null ? null : Math.round(waveGapRatio * 10000) / 10000,
      maxOverlapPixels: Math.max(0, Math.round(maxOverlapPixels * 100) / 100)
    };
  }

  function getMeasuredStackRushWaveGapPixels() {
    return getWaveGapDiagnostics().edgeGapPixels;
  }

  function enforceLayoutSpacing(lane) {
    var wavePitch = getStackRushWavePitchNormalized();
    var previousY = null;
    lane.blocks
      .filter(function (block) {
        return (
          (block.status === "active" || block.status === "removing") &&
          !block.parked
        );
      })
      .sort(function (first, second) {
        return first.normalizedY - second.normalizedY;
      })
      .forEach(function (block) {
        if (previousY !== null) {
          block.normalizedY = Math.max(block.normalizedY, previousY + wavePitch);
        }
        previousY = block.normalizedY;
      });
  }

  function preserveBlockGeometry(previousLayerHeight, nextLayerHeight) {
    if (
      previousLayerHeight <= 0 ||
      nextLayerHeight <= 0 ||
      Math.abs(previousLayerHeight - nextLayerHeight) < 0.01
    ) {
      return;
    }

    state.lanes.forEach(function (lane) {
      lane.blocks.forEach(function (block) {
        if (
          (block.status === "active" || block.status === "removing") &&
          Number.isFinite(block.normalizedY)
        ) {
          block.normalizedY =
            (block.normalizedY * previousLayerHeight) / nextLayerHeight;
        }
      });
      enforceLayoutSpacing(lane);
    });
  }

  function scheduleInitialWaveSpacingCalibration() {
    state.waveSpacingCalibrationPending = true;
    window.requestAnimationFrame(calibrateInitialWaveSpacing);
  }

  function calibrateInitialWaveSpacing() {
    if (
      !state.waveSpacingCalibrationPending ||
      state.stageSpawnedWaveCount > 0 ||
      !state.difficulty
    ) {
      return;
    }

    var firstWave = state.waves[0];
    var secondWave = state.waves[1];
    if (!firstWave || !secondWave) {
      state.waveSpacingCalibrationPending = false;
      return;
    }
    var hasRenderedBlock = state.lanes.some(function (lane) {
      return lane.blocks.some(function (block) {
        return block.waveId === firstWave.id && Boolean(block.element);
      });
    });

    if (!hasRenderedBlock) {
      window.requestAnimationFrame(calibrateInitialWaveSpacing);
      return;
    }

    var calibratedPitch = getStackRushWavePitchNormalized();
    state.lanes.forEach(function (lane) {
      lane.blocks.forEach(function (block) {
        if (block.waveId === firstWave.id) {
          block.normalizedY = calibratedPitch;
        } else if (block.waveId === secondWave.id) {
          block.normalizedY = 0;
        }
      });
    });

    var profile = buildStackRushStageProfile(state.stage);
    state.stageProfile = profile;
    state.difficulty = profile;
    state.motionDifficulty = profile;
    state.waveTimer = profile.waveIntervalSeconds;
    if (state.stageRemoved === 0) {
      state.stageTarget = profile.target;
    }
    state.waveSpacingCalibrationPending = false;
    render(performance.now());
  }

  function getGameOverY() {
    return clamp(
      RED_LINE_Y - 0.4 * getBlockHeightNormalized(),
      0,
      RED_LINE_Y
    );
  }

  function getPriorityDangerLane(lanes) {
    if (!state.difficulty.starvationGuard) {
      return null;
    }

    var sourceLanes = lanes || state.lanes;
    var blockHeight = getBlockHeightNormalized();
    var candidates = [];
    sourceLanes.forEach(function (lane, laneIndex) {
      var bottom = getBottomBlock(laneIndex, sourceLanes);
      if (!bottom) {
        return;
      }

      var distanceToRedLine = RED_LINE_Y - bottom.normalizedY;
      var isNearBoundary = distanceToRedLine <= blockHeight * 2;
      var isWaiting = lane.serviceDebt >= 3;
      if (isNearBoundary || isWaiting) {
        candidates.push({
          laneIndex: laneIndex,
          bottom: bottom,
          distanceToRedLine: distanceToRedLine,
          serviceDebt: lane.serviceDebt
        });
      }
    });

    candidates.sort(function (a, b) {
      if (a.distanceToRedLine !== b.distanceToRedLine) {
        return a.distanceToRedLine - b.distanceToRedLine;
      }
      return b.serviceDebt - a.serviceDebt;
    });
    return candidates[0] || null;
  }

  function chooseWithStarvationGuard(candidates, lanes) {
    if (!candidates || candidates.length === 0) {
      return null;
    }

    var priorityLane = getPriorityDangerLane(lanes);
    return chooseWeighted(candidates, function (value) {
      if (priorityLane && value.laneIndex === priorityLane.laneIndex) {
        return state.difficulty.starvationWeight;
      }
      return 1;
    });
  }

  function generateNextPreview(lanes) {
    var frontierSlots = getLogicalFrontierSlots(lanes, state.futureWaves);
    var matchingSlots = getMatchingFrontierSlots(frontierSlots);
    var candidates;

    if (state.next && matchingSlots.length > 0) {
      var shouldLookAtCurrent =
        Math.random() < state.difficulty.currentLookProbability;

      if (shouldLookAtCurrent) {
        var currentLookCandidates = matchingSlots.map(
          createNextBlockCandidate
        );

        if (state.difficulty.safetyCheck) {
          currentLookCandidates = currentLookCandidates.filter(function (
            candidate
          ) {
            return candidateSurvivesSafety(candidate.value, frontierSlots);
          });
        }

        candidates =
          currentLookCandidates.length > 0
            ? currentLookCandidates
            : getBasePreviewCandidates(frontierSlots, matchingSlots);
      } else {
        candidates = getBasePreviewCandidates(frontierSlots, matchingSlots);
      }
    } else {
      candidates = frontierSlots.map(createFrontierCandidate);
    }

    var selectedCandidate = chooseWithStarvationGuard(candidates, lanes);
    return {
      value: selectedCandidate ? selectedCandidate.value : randomDigit(),
      source: selectedCandidate ? selectedCandidate.sourceType : "future-wave",
      sourceMeta: selectedCandidate
        ? {
            sourceType: selectedCandidate.sourceType,
            sourceBlockId: selectedCandidate.sourceBlockId,
            sourceWaveId: selectedCandidate.sourceWaveId,
            laneIndex: selectedCandidate.laneIndex
          }
        : {
            sourceType: "future-wave",
            sourceBlockId: null,
            sourceWaveId: null,
            laneIndex: null
          }
    };
  }

  function registerSuccessfulRemoval(laneIndex) {
    state.lanes.forEach(function (lane, index) {
      if (index === laneIndex) {
        lane.serviceDebt = 0;
        lane.lastServiceTime = state.elapsed;
      } else if (getActiveBlocks(index).length > 0) {
        lane.serviceDebt = Math.min(99, lane.serviceDebt + 1);
      } else {
        lane.serviceDebt = 0;
      }
    });
  }

  function getScoreForCombo(combo) {
    if (combo <= 1) {
      return SCORE_PER_BLOCK;
    }
    if (combo <= 10) {
      return SCORE_PER_BLOCK + 1;
    }
    return SCORE_PER_BLOCK + 2 + Math.floor((combo - 11) / 10);
  }

  function registerClearedBlock(resolution) {
    state.stageRemoved += 1;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    var perfect =
      Boolean(resolution && resolution.perfectStep === "second") &&
      registerPerfectSecondStep(resolution);
    state.score += getScoreForCombo(state.combo) + (perfect ? 50 : 0);
    showHudFeedback(
      perfect ? "perfect" : state.combo % 5 === 0 ? "milestone" : "hit"
    );
  }

  function registerClearedResolution(resolution) {
    if (!resolution || resolution.clearedAccounted) {
      return;
    }

    resolution.clearedAccounted = true;
    registerClearedBlock(resolution);
  }

  function breakCombo() {
    state.combo = 0;
    showHudFeedback("miss");
  }

  function getMotionDifficulty() {
    return state.motionDifficulty;
  }

  function applyStageDifficulty(stage) {
    var previousSafetyCheck = state.difficulty
      ? state.difficulty.safetyCheck
      : null;
    var profile = buildStackRushStageProfile(stage);
    state.stageProfile = profile;
    state.difficulty = profile;
    state.motionDifficulty = profile;
    state.waveTimer = profile.waveIntervalSeconds;
    state.stageSpawnedWaveCount = 0;
    queueSafetyReleaseCue(previousSafetyCheck, profile);
  }

  function updateBlocks(deltaSeconds, motionDifficulty) {
    state.lanes.forEach(function (lane, laneIndex) {
      lane.blocks.forEach(function (block) {
        var isMovingBlock =
          (block.status === "active" || block.status === "removing") &&
          !block.parked;
        if (isMovingBlock) {
          block.normalizedY +=
            (deltaSeconds * RED_LINE_Y) /
            motionDifficulty.fallDurationSeconds;
        }
      });
    });

    var gameOverY = getGameOverY();
    var boundaryReached = state.lanes.some(function (lane, laneIndex) {
      return lane.blocks.some(function (block) {
        var isBoundaryCandidate =
          block.status === "active" || block.status === "removing";
        var isCompletingCorrectRemoval =
          state.resolve &&
          state.resolve.outcome === "correct" &&
          state.resolve.removeBlockIds.indexOf(block.id) !== -1;
        return (
          isBoundaryCandidate &&
          !isCompletingCorrectRemoval &&
          !block.redLineExempt &&
          block.normalizedY >= gameOverY
        );
      });
    });

    if (boundaryReached) {
      endRun("red-line");
    }
  }

  function updateResolution(deltaSeconds) {
    updateStackRushResolution(deltaSeconds);
  }

  function advanceNextAfterResolution() {
    if (!state.next) {
      return;
    }

    state.next.current = state.next.preview;
    state.next.currentMeta = cloneNextSourceMeta(state.next.previewMeta);
    var nextPreview = generateNextPreview();
    state.next.preview = nextPreview.value;
    state.next.previewSource = nextPreview.source;
    state.next.previewMeta = cloneNextSourceMeta(nextPreview.sourceMeta);
  }

  function getRushProjectileDuration() {
    return STACK_RUSH_PROJECTILE_DURATION_MS;
  }

  function cloneLanesForStackPreview() {
    return state.lanes.map(function (lane) {
      return Object.assign({}, lane, {
        blocks: lane.blocks.map(function (block) {
          return Object.assign({}, block);
        })
      });
    });
  }

  function createProjectedPenaltyBlock(laneIndex, value, target) {
    var isEmpty = !target;
    var parked = isEmpty ? true : Boolean(target.parked);

    return {
      id: "projected-penalty-" + laneIndex,
      laneIndex: laneIndex,
      value: value,
      normalizedY: isEmpty
        ? 0
        : target.normalizedY + getStackRushWavePitchNormalized(),
      status: "active",
      kind: "penalty",
      parked: parked,
      wrongFeedback: false,
      wrongFeedbackUntil: 0,
      stackImpact: null,
      redLineExempt: false,
      spawnedAt: 0,
      waveId: null,
      element: null
    };
  }

  function projectStackRushShot(laneIndex, target, value) {
    var projectedLanes = cloneLanesForStackPreview();
    var projectedLane = projectedLanes[laneIndex];

    if (target && target.value === value) {
      projectedLane.blocks = projectedLane.blocks.filter(function (block) {
        return block.id !== target.id;
      });
    } else {
      projectedLane.blocks.push(
        createProjectedPenaltyBlock(laneIndex, value, target)
      );
    }

    return projectedLanes;
  }

  function advanceNextAtStackLaunch(laneIndex, target, firedValue) {
    if (!state.next) {
      return;
    }

    var projectedLanes = projectStackRushShot(
      laneIndex,
      target,
      firedValue
    );
    state.next.current = state.next.preview;
    state.next.currentMeta = cloneNextSourceMeta(state.next.previewMeta);
    var nextPreview = generateNextPreview(projectedLanes);
    state.next.preview = nextPreview.value;
    state.next.previewSource = nextPreview.source;
    state.next.previewMeta = cloneNextSourceMeta(nextPreview.sourceMeta);
  }

  function triggerStackImpact(upperBlock, lowerBlock, impulseFrom) {
    if (!upperBlock || !lowerBlock || upperBlock === lowerBlock) {
      return;
    }

    var token = state.nextStackImpactToken++;
    var startedAt = performance.now();
    upperBlock.stackImpact = {
      startedAt: startedAt,
      token: token,
      role: "upper",
      impulseFrom: impulseFrom
    };
    lowerBlock.stackImpact = {
      startedAt: startedAt,
      token: token,
      role: "lower",
      impulseFrom: impulseFrom
    };
  }

  function triggerSoloStackImpact(block, impulseFrom) {
    if (!block) {
      return;
    }
    block.stackImpact = {
      startedAt: performance.now(),
      token: state.nextStackImpactToken++,
      role: "solo",
      impulseFrom: impulseFrom
    };
  }

  function markWrongFeedback(block) {
    if (!block) {
      return;
    }
    block.wrongFeedback = true;
    block.wrongFeedbackUntil = performance.now() + FEEDBACK_DURATION_MS;
  }

  function createRushPenaltyBlock(laneIndex, value, normalizedY, parked) {
    var penalty = createBlock(laneIndex, value, normalizedY, null, {
      kind: "penalty",
      parked: parked
    });
    state.lanes[laneIndex].blocks.push(penalty);
    return penalty;
  }

  function resolveStackRushImpact(resolution) {
    resolution.impactDone = true;
    var target = resolution.blockId
      ? findBlock(resolution.laneIndex, resolution.blockId)
      : null;

    if (target && target.status === "active" && target.value === resolution.value) {
      resolution.outcome = "correct";
      resolution.targetYAtImpact = target.normalizedY;
      resolution.removeBlockIds = [target.id];
      target.status = "removing";
      target.redLineExempt = false;
      registerSuccessfulRemoval(resolution.laneIndex);
      return;
    }

    resolution.outcome = target ? "wrong" : "empty";
    breakCombo();
    breakStackRushNextInsightChain();
    clearProjectile(resolution);

    var stackingTarget =
      target && target.status === "active"
        ? target
        : getBottomBlock(resolution.laneIndex);

    if (stackingTarget && stackingTarget.status === "active") {
      var penalty = createRushPenaltyBlock(
        resolution.laneIndex,
        resolution.value,
        stackingTarget.normalizedY + getStackRushWavePitchNormalized(),
        stackingTarget.parked
      );
      markWrongFeedback(stackingTarget);
      markWrongFeedback(penalty);
      triggerStackImpact(stackingTarget, penalty, "from-bottom");
    } else {
      var soloPenalty = createRushPenaltyBlock(
        resolution.laneIndex,
        resolution.value,
        0,
        true
      );
      markWrongFeedback(soloPenalty);
      triggerSoloStackImpact(soloPenalty, "from-bottom");
    }

    state.resolve = null;
    processNextPendingInput();
  }

  function updateStackRushResolution(deltaSeconds) {
    var resolution = state.resolve;
    if (!resolution) {
      return;
    }

    resolution.elapsedMs += deltaSeconds * 1000;
    if (
      !resolution.impactDone &&
      resolution.elapsedMs >= resolution.projectileDurationMs
    ) {
      resolveStackRushImpact(resolution);
    }

    if (
      state.phase === "running" &&
      state.resolve === resolution &&
      resolution.outcome === "correct" &&
      resolution.elapsedMs >=
        resolution.projectileDurationMs + SHRINK_DURATION_MS
    ) {
      finishResolution();
    }
  }

  function resolveCorrectImpact(resolution) {
    resolution.impactDone = true;
    var block = findBlock(resolution.laneIndex, resolution.blockId);

    if (!block || block.status !== "active" || !state.next) {
      return;
    }

    block.status = "removing";
    resolution.targetYAtImpact = block.normalizedY;
    registerSuccessfulRemoval(resolution.laneIndex);

    advanceNextAfterResolution();
  }

  function finishResolution() {
    var resolution = state.resolve;
    if (!resolution) {
      return;
    }

    clearProjectile(resolution);
    if (resolution.outcome === "correct") {
      var lane = state.lanes[resolution.laneIndex];
      lane.blocks = lane.blocks.filter(function (block) {
        return resolution.removeBlockIds.indexOf(block.id) === -1;
      });
      registerClearedResolution(resolution);
      registerPerfectFirstStep(resolution);
      removeStaleWaveMetadata();
    }

    state.resolve = null;
    if (
      resolution.outcome === "correct" &&
      state.stageRemoved >= state.stageTarget
    ) {
      startStageBreak();
      updateStageUi();
      updateComboUi();
      renderButtonState();
      renderHudFeedback(performance.now());
      return;
    }
    processNextPendingInput();
    updateStageUi();
    updateComboUi();
    renderButtonState();
    renderHudFeedback(performance.now());
  }

  function findBlock(laneIndex, blockId) {
    return state.lanes[laneIndex].blocks.find(function (block) {
      return block.id === blockId;
    });
  }

  function updateGame(deltaSeconds) {
    state.elapsed += deltaSeconds;
    state.stageElapsed += deltaSeconds;
    var motionDifficulty = getMotionDifficulty();

    updateBlocks(deltaSeconds, motionDifficulty);
    if (state.phase !== "running") {
      return;
    }

    updateResolution(deltaSeconds);
    if (state.phase !== "running") {
      return;
    }

    updateStageProgress();

    var canSpawnWave =
      state.stageSpawnedWaveCount < state.difficulty.spawnWaveCount;
    if (canSpawnWave) {
      state.waveTimer -= deltaSeconds;
      var safetyCounter = 0;
      while (state.waveTimer <= 0 && safetyCounter < 4) {
        if (state.stageSpawnedWaveCount >= state.difficulty.spawnWaveCount) {
          break;
        }
        spawnNextFutureWave();
        state.stageSpawnedWaveCount += 1;
        state.waveTimer += motionDifficulty.waveIntervalSeconds;
        safetyCounter += 1;
      }
    }
  }

  function updateStageBreak(deltaSeconds, now) {
    state.elapsed += deltaSeconds;
    finishStageBreak(now);
  }

  function createProjectile(resolution) {
    var projectile = document.createElement("div");
    projectile.className = "projectile rush-projectile";
    projectile.textContent = String(resolution.value);
    projectile.dataset.value = String(resolution.value);
    projectile.setAttribute("aria-hidden", "true");
    projectile.style.top = "100%";
    laneElements[resolution.laneIndex].track.appendChild(projectile);
    resolution.projectileElement = projectile;
  }

  function clearProjectile(resolution) {
    if (resolution && resolution.projectileElement) {
      resolution.projectileElement.remove();
      resolution.projectileElement = null;
    }
  }

  function startStackRushShot(laneIndex) {
    if (state.resolve || !state.next) {
      return;
    }

    var target = getBottomBlock(laneIndex);
    var firedValue = state.next.current;
    var previewValueAtLaunch = state.next.preview;
    var previewMetaAtLaunch = cloneNextSourceMeta(state.next.previewMeta);
    var perfectResolution = preparePerfectResolution(
      laneIndex,
      target,
      firedValue
    );
    var predictedOutcome = target
      ? target.value === firedValue
        ? "correct"
        : "wrong"
      : "empty";

    advanceNextAtStackLaunch(laneIndex, target, firedValue);
    state.resolve = {
      type: "rush-shot",
      laneIndex: laneIndex,
      blockId: target ? target.id : null,
      value: firedValue,
      previewValueAtLaunch: previewValueAtLaunch,
      previewMetaAtLaunch: previewMetaAtLaunch,
      perfectStep: perfectResolution ? perfectResolution.step : null,
      perfectOpportunity: perfectResolution
        ? perfectResolution.opportunity || null
        : null,
      perfectPath: perfectResolution ? perfectResolution.path || null : null,
      elapsedMs: 0,
      impactDone: false,
      outcome: null,
      predictedOutcome: predictedOutcome,
      targetYAtLaunch: target ? target.normalizedY : 0,
      targetYAtImpact: target ? target.normalizedY : 0,
      projectileDurationMs: getRushProjectileDuration(),
      removeBlockIds: [],
      clearedAccounted: false,
      projectileElement: null
    };
    createProjectile(state.resolve);
  }

  function processNextPendingInput() {
    if (
      state.phase !== "running" ||
      state.resolve ||
      state.pendingInputs.length === 0
    ) {
      return;
    }

    startStackRushShot(state.pendingInputs.shift());
  }

  function showRushButtonPress(laneIndex) {
    var button = laneElements[laneIndex].button;
    button.classList.remove("is-rush-pressed");
    void button.offsetWidth;
    button.classList.add("is-rush-pressed");
    window.setTimeout(function () {
      button.classList.remove("is-rush-pressed");
    }, 100);
  }

  function handleLaneClick(laneIndex) {
    if (state.phase !== "running" || !state.next) {
      return;
    }

    showRushButtonPress(laneIndex);
    if (state.resolve || state.pendingInputs.length > 0) {
      if (state.pendingInputs.length < MAX_PENDING_INPUTS) {
        state.pendingInputs.push(laneIndex);
      }
      processNextPendingInput();
      return;
    }
    startStackRushShot(laneIndex);
  }

  function endRun(reason) {
    /* FOURCAST_LAB_START */
    if (handleLabEndRun(reason)) {
      return;
    }
    /* FOURCAST_LAB_END */

    if (state.phase === "game-over") {
      return;
    }

    clearCountdownTimers();
    clearProjectile(state.resolve);
    stopBgm(true);
    state.resolve = null;
    state.pendingInputs = [];
    state.buttonsLocked = false;
    state.phase = "game-over";
    clearStageBanner();
    clearHudFeedback();

    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      writeBestScore();
    }

    elements.finalScore.textContent = String(state.score);
    elements.finalBestScore.textContent = String(state.bestScore);
    elements.finalStage.textContent = String(state.highestStage);
    elements.finalBestCombo.textContent = String(state.bestCombo);
    showScreen("game-over");
    applyStackRushUi();
    updateBestScoreUi();
    updateOrientationState();

    if (reason === "red-line") {
      elements.gameOverScreen.setAttribute("data-reason", "red-line");
    }
  }

  function clearCountdownTimers() {
    if (state.countdownTimer !== null) {
      window.clearInterval(state.countdownTimer);
      state.countdownTimer = null;
    }
    if (state.countdownFinishTimer !== null) {
      window.clearTimeout(state.countdownFinishTimer);
      state.countdownFinishTimer = null;
    }
  }

  function setCountdownVisual(number, caption) {
    elements.countdownLayer.classList.remove("is-preparing");
    elements.countdownCaption.textContent = caption;
    elements.countdownNumber.hidden = false;
    elements.countdownNumber.textContent = number;
    elements.countdownNumber.classList.remove("countdown-pop");
    void elements.countdownNumber.offsetWidth;
    elements.countdownNumber.classList.add("countdown-pop");
  }

  function setPreparationVisual() {
    elements.countdownLayer.hidden = false;
    elements.countdownLayer.classList.add("is-preparing");
    elements.countdownCaption.textContent = translate("preparing");
    elements.countdownNumber.hidden = true;
    elements.countdownNumber.classList.remove("countdown-pop");
  }

  function waitForMinimumPreparationDisplay(startedAt) {
    var remainingMs =
      BGM_PREPARATION_MIN_DISPLAY_MS - (performance.now() - startedAt);
    if (remainingMs <= 0) {
      return Promise.resolve();
    }
    return new Promise(function (resolve) {
      window.setTimeout(resolve, remainingMs);
    });
  }

  function beginCountdown() {
    if (isLandscapeViewport()) {
      state.phase = "auto-paused";
      state.pauseReason = "orientation";
      updateOrientationState();
      return;
    }

    var wasAutoPaused = state.phase === "auto-paused";
    var shouldFadeOnResume = wasAutoPaused && state.bgmWasPlayingBeforePause;
    var shouldStartBgm =
      !wasAutoPaused ||
      state.bgmWasPlayingBeforePause ||
      !state.bgmStartedThisRun;
    clearCountdownTimers();
    state.phase = "countdown";
    state.countdownResumeFade = shouldFadeOnResume;
    state.countdownStartBgm = shouldStartBgm;
    state.bgmWasPlayingBeforePause = false;
    state.countdownRemaining = COUNTDOWN_SECONDS;
    elements.countdownLayer.hidden = false;
    setCountdownVisual(String(COUNTDOWN_SECONDS), translate("getReady"));
    renderButtonState();

    state.countdownTimer = window.setInterval(function () {
      if (document.hidden || state.phase !== "countdown") {
        return;
      }

      state.countdownRemaining -= 1;
      if (state.countdownRemaining > 0) {
        setCountdownVisual(String(state.countdownRemaining), translate("getReady"));
      } else {
        clearCountdownTimers();
        setCountdownVisual("GO", translate("startCaption"));
        state.countdownFinishTimer = window.setTimeout(function () {
          finishCountdown();
        }, 260);
      }
    }, 1000);
  }

  function finishCountdown() {
    if (state.phase !== "countdown") {
      return;
    }

    clearCountdownTimers();
    state.phase = "running";
    elements.countdownLayer.hidden = true;
    state.lastFrameTime = performance.now();
    renderButtonState();
    if (state.countdownStartBgm) {
      startBgmPlayback(state.countdownResumeFade);
    }
    state.countdownStartBgm = false;
    state.countdownResumeFade = false;
  }

  function pauseForExternal(reason) {
    if (state.phase !== "running" && state.phase !== "countdown") {
      return;
    }

    state.phase = "auto-paused";
    state.pauseReason = reason;
    clearCountdownTimers();
    pauseBgmForExternal();
    elements.countdownLayer.hidden = false;
    setCountdownVisual("Ⅱ", translate("paused"));
    renderButtonState();
  }

  function tryResumeAfterExternalPause() {
    if (
      state.phase === "auto-paused" &&
      !document.hidden &&
      !isLandscapeViewport()
    ) {
      beginCountdown();
    }
  }

  function isLandscapeViewport() {
    return window.innerWidth < 800 && window.innerWidth > window.innerHeight;
  }

  function updateOrientationState() {
    var landscape = isLandscapeViewport();
    state.orientationBlocked = landscape;
    elements.orientationBlocker.hidden = !landscape;

    if (landscape) {
      if (state.phase === "running" || state.phase === "countdown") {
        pauseForExternal("orientation");
      }
    } else if (
      state.phase === "auto-paused" &&
      state.pauseReason === "orientation" &&
      !document.hidden
    ) {
      tryResumeAfterExternalPause();
    }
  }

  function setAdScreen(screenName) {
    if (
      window.FOURCAST_ADS &&
      typeof window.FOURCAST_ADS.setScreen === "function"
    ) {
      window.FOURCAST_ADS.setScreen(
        screenName === "start" ? "home" : screenName
      );
    }
  }

  function setAdsSuppressed(isSuppressed) {
    if (
      window.FOURCAST_ADS &&
      typeof window.FOURCAST_ADS.setSuppressed === "function"
    ) {
      window.FOURCAST_ADS.setSuppressed(isSuppressed);
    }
  }

  function showScreen(screenName) {
    elements.startScreen.hidden = screenName !== "start";
    elements.gameScreen.hidden = screenName !== "game";
    elements.gameOverScreen.hidden = screenName !== "game-over";
    setAdsSuppressed(false);
    setAdScreen(screenName);
  }

  function updateBestScoreUi() {
    if (elements.stackRushBestScore) {
      elements.stackRushBestScore.textContent = String(state.bestScore);
    }
  }

  function renderToken(element, value, isPreview) {
    if (value === null || value === undefined) {
      element.hidden = true;
      return;
    }

    element.hidden = false;
    var previousValue = isPreview
      ? state.lastRenderedPreview
      : state.lastRenderedCurrent;

    if (previousValue !== value) {
      element.textContent = String(value);
      element.dataset.value = String(value);
      element.classList.remove("token-pop");
      void element.offsetWidth;
      element.classList.add("token-pop");
      if (isPreview) {
        state.lastRenderedPreview = value;
      } else {
        state.lastRenderedCurrent = value;
      }
    } else if (!element.dataset.value) {
      element.textContent = String(value);
      element.dataset.value = String(value);
    }
  }

  function clearStackImpactClasses(element) {
    element.classList.remove(
      "is-stack-impact",
      "is-stack-impact-upper",
      "is-stack-impact-lower",
      "is-stack-impact-solo",
      "is-stack-impact-from-top",
      "is-stack-impact-from-bottom"
    );
    delete element.dataset.stackImpactToken;
    element.style.removeProperty("--jelly-distance");
  }

  function renderStackImpact(element, block, now) {
    var impact = block.stackImpact;
    var elapsedMs = impact ? now - impact.startedAt : 0;
    var isActive =
      impact &&
      elapsedMs >= 0 &&
      elapsedMs < STACK_JELLY_DURATION_MS;

    if (!isActive) {
      clearStackImpactClasses(element);
      if (impact && elapsedMs >= STACK_JELLY_DURATION_MS) {
        block.stackImpact = null;
      }
      return;
    }

    var impactToken = String(impact.token);
    if (element.dataset.stackImpactToken === impactToken) {
      return;
    }

    clearStackImpactClasses(element);
    var blockWidth = element.offsetWidth || getBlockHeightPixels();
    var jellyDistance = clamp(blockWidth * 0.05, 2, 5);
    element.style.setProperty("--jelly-distance", String(jellyDistance) + "px");
    void element.offsetWidth;
    element.classList.add(
      "is-stack-impact",
      impact.role === "solo"
        ? "is-stack-impact-solo"
        : impact.role === "upper"
          ? "is-stack-impact-upper"
          : "is-stack-impact-lower",
      impact.impulseFrom === "from-top"
        ? "is-stack-impact-from-top"
        : "is-stack-impact-from-bottom"
    );
    element.dataset.stackImpactToken = impactToken;
  }

  function renderBlocks(now) {
    state.lanes.forEach(function (lane, laneIndex) {
      var laneElement = laneElements[laneIndex];
      var liveElements = new Set();

      lane.blocks.forEach(function (block) {
        var element = block.element;
        if (!element) {
          element = document.createElement("div");
          element.className = "lane-block";
          element.textContent = String(block.value);
          element.dataset.value = String(block.value);
          element.setAttribute("aria-hidden", "true");
          laneElement.blocks.appendChild(element);
          block.element = element;
        }

        liveElements.add(element);
        var scale = 1;
        var opacity = 1;
        var brightness = 1;

        if (
          block.status === "removing" &&
          state.resolve &&
          (state.resolve.type === "correct" ||
            (state.resolve.type === "rush-shot" &&
              state.resolve.outcome === "correct" &&
              state.resolve.removeBlockIds.indexOf(block.id) !== -1))
        ) {
          var removalStartMs =
            state.resolve.type === "rush-shot"
              ? state.resolve.projectileDurationMs
              : PROJECTILE_DURATION_MS;
          var shrinkProgress = clamp(
            (state.resolve.elapsedMs - removalStartMs) / SHRINK_DURATION_MS,
            0,
            1
          );
          var shrinkEase = easeInOut(shrinkProgress);
          scale = 1 - shrinkEase;
          opacity = 1 - shrinkEase;
        } else if (
          block.status === "active" &&
          block.spawnedAt &&
          block.kind === "wave"
        ) {
          var spawnProgress = clamp(
            (now - block.spawnedAt) / SPAWN_FEEDBACK_DURATION_MS,
            0,
            1
          );
          scale = 0.28 + 0.72 * easeOutCubic(spawnProgress);
          opacity = 0.72 + 0.28 * easeOutCubic(spawnProgress);
          brightness = 0.88 + 0.12 * easeOutCubic(spawnProgress);
        }

        var wrongFeedbackActive =
          block.wrongFeedback &&
          (!block.wrongFeedbackUntil || now < block.wrongFeedbackUntil);
        if (block.wrongFeedback && !wrongFeedbackActive) {
          block.wrongFeedback = false;
        }

        element.style.setProperty(
          "--block-y",
          String(clamp(block.normalizedY, -1, 1))
        );
        element.style.setProperty("--block-scale", String(scale));
        element.style.setProperty("--block-opacity", String(opacity));
        element.style.setProperty("--block-brightness", String(brightness));
        element.classList.toggle("is-wrong", wrongFeedbackActive);
        element.classList.toggle("is-penalty", block.kind === "penalty");
        element.classList.toggle("is-removing", block.status === "removing");
        element.classList.toggle(
          "is-spawn-feedback",
          block.status === "active" &&
            block.kind === "wave" &&
            block.spawnedAt &&
            now - block.spawnedAt < SPAWN_FEEDBACK_DURATION_MS
        );
        renderStackImpact(element, block, now);
      });

      Array.prototype.forEach.call(laneElement.blocks.children, function (child) {
        if (!liveElements.has(child)) {
          child.remove();
        }
      });

      laneElement.root.classList.toggle("is-empty-error", lane.emptyError);
    });
  }

  function renderProjectile() {
    var resolution = state.resolve;
    if (!resolution || (resolution.type !== "correct" && resolution.type !== "rush-shot")) {
      return;
    }

    var projectile = resolution.projectileElement;
    if (!projectile) {
      return;
    }

    if (resolution.type === "correct" && resolution.impactDone) {
      return;
    }

    if (resolution.type === "rush-shot" && resolution.impactDone) {
      if (resolution.outcome !== "correct") {
        return;
      }
      var rushShrinkProgress = clamp(
        (resolution.elapsedMs - resolution.projectileDurationMs) /
          SHRINK_DURATION_MS,
        0,
        1
      );
      var rushShrinkEase = easeInOut(rushShrinkProgress);
      projectile.classList.add("is-removing");
      projectile.style.setProperty(
        "--projectile-scale",
        String(1 - rushShrinkEase)
      );
      projectile.style.opacity = String(1 - rushShrinkEase);
      return;
    }

    var targetBlock = findBlock(resolution.laneIndex, resolution.blockId);
    var targetY = targetBlock
      ? targetBlock.normalizedY
      : resolution.targetYAtLaunch || resolution.targetYAtImpact;
    var projectileDuration =
      resolution.type === "rush-shot"
        ? resolution.projectileDurationMs
        : PROJECTILE_DURATION_MS;
    var progress = clamp(resolution.elapsedMs / projectileDuration, 0, 1);
    var y = 1 - progress * (1 - clamp(targetY, 0, 1));
    projectile.style.top = String(y * 100) + "%";
    projectile.style.opacity =
      resolution.type === "rush-shot"
        ? "1"
        : String(1 - Math.max(0, progress - 0.78) / 0.22);
  }

  function isLaneNearRedLine(laneIndex, blockHeight) {
    var bottomBlock = getBottomBlock(laneIndex);
    if (!bottomBlock) {
      return false;
    }
    return (
      RED_LINE_Y - bottomBlock.normalizedY <=
      (blockHeight || getBlockHeightNormalized()) * 2
    );
  }

  function canShowTargetAffordance() {
    if (state.phase !== "running" || !state.next || state.resolve) {
      return false;
    }
    return state.pendingInputs.length === 0;
  }

  function isLaneTargetCandidate(laneIndex) {
    if (!canShowTargetAffordance()) {
      return false;
    }
    var bottomBlock = getBottomBlock(laneIndex);
    if (
      !bottomBlock ||
      state.next.current === null ||
      state.next.current === undefined
    ) {
      return false;
    }
    return String(bottomBlock.value) === String(state.next.current);
  }

  function renderButtonState() {
    var locked = state.phase !== "running";
    var blockHeight =
      state.phase === "running" ? getBlockHeightNormalized() : 0;
    laneElements.forEach(function (laneElement, laneIndex) {
      var laneIsDangerous =
        state.phase === "running" &&
        isLaneNearRedLine(laneIndex, blockHeight);
      laneElement.button.disabled = locked;
      laneElement.button.classList.toggle("is-locked", locked);
      laneElement.button.classList.toggle(
        "is-target-candidate",
        isLaneTargetCandidate(laneIndex)
      );
      laneElement.button.classList.toggle("is-danger", laneIsDangerous && !locked);
      laneElement.root.classList.toggle("is-danger", laneIsDangerous);
    });
  }

  function render(now) {
    if (state.next) {
      renderToken(elements.currentNext, state.next.current, false);
      renderToken(elements.previewNext, state.next.preview, true);
    } else {
      renderToken(elements.currentNext, null, false);
      renderToken(elements.previewNext, null, true);
    }
    elements.scoreValue.textContent = String(state.score);
    updateStageUi();
    updateComboUi();
    renderBlocks(now);
    renderProjectile();
    renderButtonState();
    renderHudFeedback(now);
    renderNextInsight(now);
    renderStageBanner(now);
  }

  function measureLayout() {
    if (!laneElements[0]) {
      return;
    }
    var trackRect = laneElements[0].track.getBoundingClientRect();
    var blockLayerRect = laneElements[0].blocks.getBoundingClientRect();
    var previousLayerHeight = state.layout.blockLayerHeight;
    var nextLayerHeight = blockLayerRect.height;
    var nextLayerWidth = blockLayerRect.width;
    var nextBlockWidth = clamp(nextLayerWidth * 0.8, 24, 78);
    var nextBlockHeight = nextBlockWidth;
    var sampleBlock = laneElements[0].blocks.querySelector(
      ".lane-block:not(.is-removing):not(.is-stack-impact):not(.is-wrong)"
    );
    if (sampleBlock) {
      // Computed layout dimensions retain fractional CSS pixels while ignoring
      // spawn, jelly, and removal transforms that affect only the visual box.
      var computedBlockStyle = window.getComputedStyle(sampleBlock);
      var sampleWidth = Number.parseFloat(computedBlockStyle.width);
      var sampleHeight = Number.parseFloat(computedBlockStyle.height);
      if (sampleWidth > 0 && sampleHeight > 0) {
        nextBlockWidth = sampleWidth;
        nextBlockHeight = sampleHeight;
      }
    }

    state.layout.trackHeight = trackRect.height;
    state.layout.trackWidth = trackRect.width;
    state.layout.blockLayerHeight = nextLayerHeight;
    state.layout.blockLayerWidth = nextLayerWidth;
    state.layout.blockWidth = nextBlockWidth;
    state.layout.blockHeight = nextBlockHeight;
    preserveBlockGeometry(previousLayerHeight, nextLayerHeight);
    document.documentElement.style.setProperty(
      "--viewport-height",
      String(window.innerHeight) + "px"
    );
  }

  function scheduleLayout() {
    window.requestAnimationFrame(function () {
      measureLayout();
      updateOrientationState();
      render(performance.now());
    });
  }

  function openHelp() {
    if (state.phase !== "start") {
      return;
    }
    elements.helpModal.hidden = false;
    setAdsSuppressed(true);
    elements.helpCloseButton.focus();
  }

  function closeHelp() {
    elements.helpModal.hidden = true;
    setAdsSuppressed(false);
    elements.helpButton.focus();
  }

  function openSettings() {
    if (state.phase !== "start") {
      return;
    }
    elements.settingsModal.hidden = false;
    setAdsSuppressed(true);
    updateBgmUi();
    elements.settingsCloseButton.focus();
  }

  function isLanguageMenuVisible() {
    return Boolean(
      languageMenuOpen &&
        elements.languageMenu &&
        !elements.languageMenu.hidden
    );
  }

  function positionLanguageMenu() {
    if (!isLanguageMenuVisible() || !elements.languageSelect) {
      return;
    }

    var triggerRect = elements.languageSelect.getBoundingClientRect();
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;
    var viewportPadding = 12;
    var gap = 8;
    var menuWidth = Math.min(
      triggerRect.width,
      Math.max(0, viewportWidth - viewportPadding * 2)
    );
    var left = Math.min(
      Math.max(triggerRect.left, viewportPadding),
      Math.max(viewportPadding, viewportWidth - viewportPadding - menuWidth)
    );

    elements.languageMenu.style.left = String(Math.round(left)) + "px";
    elements.languageMenu.style.width = String(Math.round(menuWidth)) + "px";
    elements.languageMenu.style.right = "auto";
    elements.languageMenu.style.maxHeight = "none";

    var naturalHeight = elements.languageMenu.scrollHeight;
    var availableBelow = Math.max(
      0,
      viewportHeight - triggerRect.bottom - viewportPadding - gap
    );
    var availableAbove = Math.max(
      0,
      triggerRect.top - viewportPadding - gap
    );
    var opensAbove =
      availableBelow < naturalHeight && availableAbove > availableBelow;
    var availableSpace = opensAbove ? availableAbove : availableBelow;
    var menuHeight = Math.min(naturalHeight, Math.max(1, availableSpace));
    var top = opensAbove
      ? triggerRect.top - gap - menuHeight
      : triggerRect.bottom + gap;
    var maxTop = Math.max(
      viewportPadding,
      viewportHeight - viewportPadding - menuHeight
    );

    top = Math.min(Math.max(top, viewportPadding), maxTop);
    elements.languageMenu.style.maxHeight = String(Math.round(menuHeight)) + "px";
    elements.languageMenu.style.top = String(Math.round(top)) + "px";
    elements.languageMenu.dataset.placement = opensAbove ? "above" : "below";
  }

  function focusLanguageOption(index) {
    if (!isLanguageMenuVisible() || elements.languageOptions.length === 0) {
      return;
    }

    var optionCount = elements.languageOptions.length;
    languageMenuIndex = (index + optionCount) % optionCount;
    elements.languageOptions.forEach(function (option, optionIndex) {
      option.classList.toggle("is-active", optionIndex === languageMenuIndex);
    });
    elements.languageOptions[languageMenuIndex].focus();
  }

  function openLanguageMenu(initialIndex) {
    if (
      !elements.languageMenu ||
      !elements.languageSelect ||
      elements.settingsModal.hidden
    ) {
      return;
    }

    languageMenuOpen = true;
    languageMenuIndex =
      initialIndex === undefined
        ? getLanguageOptionIndex(state.language)
        : initialIndex;
    elements.languageMenu.hidden = false;
    elements.languageSelect.setAttribute("aria-expanded", "true");
    updateLanguageSelectUi();
    positionLanguageMenu();
    focusLanguageOption(languageMenuIndex);
  }

  function closeLanguageMenu(restoreFocus) {
    if (!elements.languageMenu) {
      return;
    }

    languageMenuOpen = false;
    elements.languageMenu.hidden = true;
    elements.languageSelect.setAttribute("aria-expanded", "false");
    elements.languageOptions.forEach(function (option) {
      option.classList.remove("is-active");
    });
    elements.languageMenu.style.top = "";
    elements.languageMenu.style.left = "";
    elements.languageMenu.style.width = "";
    elements.languageMenu.style.maxHeight = "";
    elements.languageMenu.dataset.placement = "";

    if (restoreFocus) {
      elements.languageSelect.focus();
    }
  }

  function toggleLanguageMenu() {
    if (isLanguageMenuVisible()) {
      closeLanguageMenu(true);
      return;
    }
    openLanguageMenu();
  }

  function selectLanguageOption(option) {
    var language = option && option.dataset.language;
    if (!language) {
      return;
    }
    setLanguage(language);
    closeLanguageMenu(true);
  }

  function handleLanguageSelectKeydown(event) {
    var currentIndex = getLanguageOptionIndex(state.language);
    var optionCount = elements.languageOptions.length;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      openLanguageMenu((currentIndex + 1) % optionCount);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openLanguageMenu((currentIndex - 1 + optionCount) % optionCount);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleLanguageMenu();
    } else if (event.key === "Escape" && isLanguageMenuVisible()) {
      event.preventDefault();
      closeLanguageMenu(true);
    }
  }

  function handleLanguageOptionKeydown(event) {
    var option = event.currentTarget;
    var currentIndex = elements.languageOptions.indexOf(option);
    var optionCount = elements.languageOptions.length;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      event.stopPropagation();
      focusLanguageOption(currentIndex + 1);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      event.stopPropagation();
      focusLanguageOption(currentIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      event.stopPropagation();
      focusLanguageOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      event.stopPropagation();
      focusLanguageOption(optionCount - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      selectLanguageOption(option);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeLanguageMenu(true);
    } else if (event.key === "Tab") {
      closeLanguageMenu(true);
    }
  }

  function closeSettings() {
    closeLanguageMenu(false);
    elements.settingsModal.hidden = true;
    setAdsSuppressed(false);
    elements.settingsButton.focus();
  }

  function cancelRunPreparation() {
    bgmEngine.preparationToken += 1;
    bgmEngine.preparationActive = false;
  }

  function returnToMainMenu() {
    cancelRunPreparation();
    clearCountdownTimers();
    stopBgm(true);
    state.phase = "start";
    state.pauseReason = null;
    state.stage = 1;
    state.stageRemoved = 0;
    state.stageTarget = getStageTarget(state.stage);
    state.stageResult = null;
    state.highestStage = 1;
    state.combo = 0;
    state.bestCombo = 0;
    clearStageBanner();
    clearHudFeedback();
    resetNextInsightForRun();
    state.resolve = null;
    state.pendingInputs = [];
    state.buttonsLocked = false;
    state.waves = [];
    state.futureWaves = [];
    state.lanes = createLanes();
    state.next = null;
    elements.countdownLayer.hidden = true;
    elements.countdownLayer.classList.remove("is-preparing");
    elements.countdownNumber.hidden = false;
    showScreen("start");
    applyStackRushUi();
    updateBestScoreUi();
    updateOrientationState();
    render(performance.now());
  }

  function startOrRestart(event) {
    if (isLandscapeViewport()) {
      updateOrientationState();
      return;
    }

    if (bgmEngine.preparationActive) {
      return;
    }

    if (!state.bgmEnabled) {
      initialiseRun();
      bgmEngine.backend = "none";
      beginCountdown();
      return;
    }

    bgmEngine.preparationToken += 1;
    var preparationToken = bgmEngine.preparationToken;
    bgmEngine.preparationActive = true;
    initialiseRun();
    var preparationStartedAt = performance.now();
    setPreparationVisual();

    prepareBgmForRun().then(function (backend) {
      return waitForMinimumPreparationDisplay(preparationStartedAt).then(function () {
        return backend;
      });
    }).then(function (backend) {
      if (
        preparationToken !== bgmEngine.preparationToken ||
        !bgmEngine.preparationActive
      ) {
        return;
      }

      bgmEngine.preparationActive = false;
      bgmEngine.backend = backend;
      if (backend === "none" && state.bgmEnabled) {
        state.bgmPlayback = "blocked";
        updateBgmUi();
      }
      beginCountdown();
    }).catch(function () {
      if (
        preparationToken !== bgmEngine.preparationToken ||
        !bgmEngine.preparationActive
      ) {
        return;
      }

      bgmEngine.preparationActive = false;
      bgmEngine.backend = "none";
      if (state.bgmEnabled) {
        state.bgmPlayback = "blocked";
        updateBgmUi();
      }
      beginCountdown();
    });
  }

  laneElements.forEach(function (laneElement, laneIndex) {
    laneElement.button.addEventListener("click", function () {
      handleLaneClick(laneIndex);
    });
  });

  elements.startButton.addEventListener("click", startOrRestart);
  elements.restartButton.addEventListener("click", startOrRestart);
  elements.mainMenuButton.addEventListener("click", returnToMainMenu);
  elements.helpButton.addEventListener("click", openHelp);
  elements.helpCloseButton.addEventListener("click", closeHelp);
  elements.helpDoneButton.addEventListener("click", closeHelp);
  elements.settingsButton.addEventListener("click", openSettings);
  elements.settingsCloseButton.addEventListener("click", closeSettings);
  elements.settingsDoneButton.addEventListener("click", closeSettings);
  elements.languageSelect.addEventListener("click", function () {
    toggleLanguageMenu();
  });
  elements.languageSelect.addEventListener("keydown", handleLanguageSelectKeydown);
  elements.languageOptions.forEach(function (option) {
    option.addEventListener("click", function () {
      selectLanguageOption(option);
    });
    option.addEventListener("keydown", handleLanguageOptionKeydown);
  });
  elements.bgmToggle.addEventListener("change", function (event) {
    setBgmEnabled(event.target.checked);
  });
  elements.bgmVolume.addEventListener("input", function (event) {
    setBgmVolume(event.target.value);
  });
  elements.musicButton.addEventListener("click", handleMusicButtonClick);
  elements.helpModal.addEventListener("click", function (event) {
    if (event.target === elements.helpModal) {
      closeHelp();
    }
  });
  elements.settingsModal.addEventListener("click", function (event) {
    if (event.target === elements.settingsModal) {
      closeSettings();
    }
  });
  document.addEventListener("pointerdown", function (event) {
    if (
      isLanguageMenuVisible() &&
      !elements.languageControl.contains(event.target)
    ) {
      closeLanguageMenu(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") {
      return;
    }
    if (isLanguageMenuVisible()) {
      event.preventDefault();
      closeLanguageMenu(true);
      return;
    }
    if (!elements.helpModal.hidden) {
      closeHelp();
    } else if (!elements.settingsModal.hidden) {
      closeSettings();
    }
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      pauseForExternal("visibility");
    } else {
      tryResumeAfterExternalPause();
    }
  });

  window.addEventListener("pagehide", function () {
    pauseForExternal("pagehide");
  });

  window.addEventListener("pageshow", function () {
    tryResumeAfterExternalPause();
  });

  window.addEventListener("resize", scheduleLayout);
  window.addEventListener("orientationchange", scheduleLayout);
  window.addEventListener("resize", positionLanguageMenu);
  window.addEventListener("orientationchange", positionLanguageMenu);
  if (typeof ResizeObserver === "function") {
    var laneResizeObserver = new ResizeObserver(function () {
      scheduleLayout();
    });
    laneElements.forEach(function (laneElement) {
      laneResizeObserver.observe(laneElement.blocks);
    });
  }
  elements.settingsCard.addEventListener("scroll", positionLanguageMenu);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", scheduleLayout);
    window.visualViewport.addEventListener("resize", positionLanguageMenu);
    window.visualViewport.addEventListener("scroll", positionLanguageMenu);
  }

  /* FOURCAST_LAB_START */
  var FOURCAST_LAB_CHANNEL = "fourcast-lab-v1";
  var FOURCAST_LAB_SCENARIOS = {
    STAGE_SANDBOX: "stage-sandbox",
    SAFETY_RELEASE: "safety-release-10-to-11",
    SAFETY_PULSE: "safety-pulse-stage-11",
    PERFECT: "perfect-score",
    RED_LINE_RESET: "red-line-auto-reset",
    WAVE_SPACING: "wave-spacing-and-rejoin",
    WAVE_ENTRY_SPACING: "wave-entry-spacing"
  };
  var labSession = {
    active: false,
    scenarioId: null,
    selectedStage: 11,
    resetCount: 0,
    parkedRejoinCount: 0,
    reflowMoveCount: 0,
    waveGapSamples: [],
    waveGapJitterPixels: null,
    movingSpeedSpreadPixels: null,
    spawnFootprintStable: null,
    spawnFootprintScaled: null,
    spawnFootprintBaselinePixels: null,
    spawnFootprintMinPixels: null,
    spawnFootprintMaxPixels: null,
    spawnFootprintStartPixels: null,
    spawnFootprintEndPixels: null,
    spawnWaveId: null,
    waveSamplingToken: 0,
    lastAction: "idle",
    resetTimer: null
  };

  function normalizeLabStage(value) {
    var stage = Math.floor(Number(value));
    if (!Number.isFinite(stage)) {
      throw new Error("Stage must be an integer.");
    }
    return clamp(stage, 1, 99);
  }

  function clearLabResetTimer() {
    if (labSession.resetTimer !== null) {
      window.clearTimeout(labSession.resetTimer);
      labSession.resetTimer = null;
    }
  }

  function resetLabMeasurements() {
    labSession.reflowMoveCount = 0;
    labSession.waveGapSamples = [];
    labSession.waveGapJitterPixels = null;
    labSession.movingSpeedSpreadPixels = null;
    labSession.spawnFootprintStable = null;
    labSession.spawnFootprintScaled = null;
    labSession.spawnFootprintBaselinePixels = null;
    labSession.spawnFootprintMinPixels = null;
    labSession.spawnFootprintMaxPixels = null;
    labSession.spawnFootprintStartPixels = null;
    labSession.spawnFootprintEndPixels = null;
    labSession.spawnWaveId = null;
    labSession.waveSamplingToken += 1;
  }

  function prepareLabBase(stage, scenarioId, preserveResetCount) {
    var selectedStage = normalizeLabStage(stage);
    clearLabResetTimer();
    clearCountdownTimers();
    clearProjectile(state.resolve);
    stopBgm(true);

    labSession.active = true;
    labSession.scenarioId = scenarioId;
    labSession.selectedStage = selectedStage;
    resetLabMeasurements();
    if (!preserveResetCount) {
      labSession.resetCount = 0;
      labSession.parkedRejoinCount = 0;
    }

    state.phase = "running";
    state.score = 0;
    state.elapsed = 0;
    state.stageElapsed = 0;
    state.level = 1;
    state.stage = selectedStage;
    state.stageRemoved = 0;
    state.stageTarget = getStackRushStageTarget(selectedStage);
    state.stageResult = null;
    state.highestStage = selectedStage;
    state.stageBreak = null;
    state.stageSpawnedWaveCount = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.resolve = null;
    state.pendingInputs = [];
    state.buttonsLocked = false;
    state.pauseReason = null;
    state.nextWaveNumber = 1;
    state.nextBlockNumber = 1;
    state.nextStackImpactToken = 1;
    clearStageBanner();
    clearHudFeedback();
    resetNextInsightForRun();

    showScreen("game");
    applyStackRushUi();
    measureLayout();
    var profile = buildStackRushStageProfile(selectedStage);
    state.stageProfile = profile;
    state.difficulty = profile;
    state.motionDifficulty = profile;
    state.waveTimer = profile.waveIntervalSeconds;
    state.stageTarget = profile.target;
    initialiseStageBoard();
    elements.countdownLayer.hidden = true;
    state.lastFrameTime = performance.now();
    render(performance.now());
  }

  function setLabBottomValue(laneIndex, value) {
    var block = getBottomBlock(laneIndex);
    if (!block) {
      throw new Error("Scenario lane has no target block.");
    }
    block.value = value;
    block.status = "active";
    block.kind = "normal";
    block.parked = false;
    block.redLineExempt = false;
    if (block.element) {
      block.element.textContent = String(value);
      block.element.dataset.value = String(value);
    }
    return block;
  }

  function setLabNextValue(laneIndex, value) {
    var bottom = getBottomBlock(laneIndex);
    var nextBlock = bottom ? getNextActiveBlock(laneIndex, bottom) : null;
    if (!nextBlock) {
      throw new Error("Scenario lane has no second visible block.");
    }
    nextBlock.value = value;
    nextBlock.status = "active";
    nextBlock.kind = "normal";
    nextBlock.parked = false;
    nextBlock.redLineExempt = true;
    if (nextBlock.element) {
      nextBlock.element.textContent = String(value);
      nextBlock.element.dataset.value = String(value);
    }
    return nextBlock;
  }

  function setLabQueue(currentValue, previewValue, previewMeta) {
    state.next.current = currentValue;
    state.next.preview = previewValue;
    state.next.source = "visible-window";
    state.next.previewSource = "visible-window";
    state.next.currentMeta = null;
    state.next.previewMeta = cloneNextSourceMeta(
      previewMeta || {
        sourceType: "visible-window",
        sourceBlockId: null,
        sourceWaveId: null,
        laneIndex: null
      }
    );
    state.lastRenderedCurrent = null;
    state.lastRenderedPreview = null;
    render(performance.now());
  }

  function primeLabPerfectScenario(kind) {
    if (state.resolve || state.pendingInputs.length > 0) {
      throw new Error("Wait for the current resolution before running another action.");
    }
    var bottomValues = kind === "invalid-branch"
      ? [1, 2, 3, 4]
      : kind === "single"
        ? [1, 3, 4, 4]
        : [1, 3, 1, 4];
    var nextValues = kind === "invalid-branch"
      ? [2, 3, 1, 1]
      : kind === "single"
        ? [2, 1, 1, 1]
        : [4, 2, 2, 1];
    var previewLane = kind === "invalid-branch" || kind === "single" ? 0 : 2;
    state.lanes.forEach(function (lane) {
      lane.blocks.forEach(function (block) {
        block.redLineExempt = true;
      });
    });
    bottomValues.forEach(function (value, laneIndex) {
      setLabBottomValue(laneIndex, value);
      setLabNextValue(laneIndex, nextValues[laneIndex]);
    });
    var previewBlock = getNextActiveBlock(
      previewLane,
      getBottomBlock(previewLane)
    );
    setLabQueue(1, 2, {
      sourceType: "visible-window",
      sourceBlockId: previewBlock ? previewBlock.id : null,
      sourceWaveId: previewBlock ? previewBlock.waveId : null,
      laneIndex: previewLane
    });
    refreshPerfectOpportunity();
  }

  function prepareLabScenario(scenarioId, stage, preserveResetCount) {
    if (scenarioId === FOURCAST_LAB_SCENARIOS.STAGE_SANDBOX) {
      prepareLabBase(stage, scenarioId, preserveResetCount);
    } else if (scenarioId === FOURCAST_LAB_SCENARIOS.SAFETY_RELEASE) {
      prepareLabBase(10, scenarioId, preserveResetCount);
      state.stageRemoved = Math.max(0, state.stageTarget - 1);
      setLabBottomValue(0, 1);
      setLabQueue(1, 2);
    } else if (scenarioId === FOURCAST_LAB_SCENARIOS.SAFETY_PULSE) {
      prepareLabBase(11, scenarioId, preserveResetCount);
      state.lanes.forEach(function (lane) {
        lane.blocks.forEach(function (block) {
          block.redLineExempt = true;
        });
      });
      state.nextInsight.safetyCuePending = true;
      showPendingSafetyReleaseCue();
      setLabQueue(1, 2);
    } else if (scenarioId === FOURCAST_LAB_SCENARIOS.PERFECT) {
      prepareLabBase(Math.max(11, normalizeLabStage(stage)), scenarioId, preserveResetCount);
      primeLabPerfectScenario("perfect");
    } else if (scenarioId === FOURCAST_LAB_SCENARIOS.RED_LINE_RESET) {
      prepareLabBase(stage, scenarioId, preserveResetCount);
    } else if (scenarioId === FOURCAST_LAB_SCENARIOS.WAVE_SPACING) {
      prepareLabBase(stage, scenarioId, preserveResetCount);
      pauseForExternal("lab-wave-spacing");
    } else if (scenarioId === FOURCAST_LAB_SCENARIOS.WAVE_ENTRY_SPACING) {
      prepareLabBase(stage, scenarioId, preserveResetCount);
      pauseForExternal("lab-wave-entry-spacing");
    } else {
      throw new Error("Unknown Lab scenario.");
    }

    labSession.lastAction = "prepared:" + scenarioId;
    updateStageUi();
    updateComboUi();
    render(performance.now());
    return observeLabState();
  }

  function runLabSafetyRelease() {
    if (labSession.scenarioId !== FOURCAST_LAB_SCENARIOS.SAFETY_RELEASE) {
      throw new Error("Prepare the Stage 10 to 11 scenario first.");
    }
    if (state.resolve || state.phase !== "running") {
      throw new Error("The scenario is not ready for input.");
    }
    labSession.lastAction = "input:stage-10-final-hit";
    handleLaneClick(0);
    return observeLabState();
  }

  function runLabSafetyPulse() {
    if (labSession.scenarioId !== FOURCAST_LAB_SCENARIOS.SAFETY_PULSE) {
      throw new Error("Prepare the Stage 11 preview pulse scenario first.");
    }
    if (state.phase !== "running" || !state.next) {
      throw new Error("The preview pulse scenario is not ready.");
    }
    // Re-arm the cue so the case can be repeated without reloading the Lab.
    state.nextInsight.safetyCueShown = false;
    state.nextInsight.safetyCuePending = true;
    showPendingSafetyReleaseCue();
    labSession.lastAction = "cue:stage-11-preview-three-pulse";
    render(performance.now());
    return observeLabState();
  }

  function changeLabSafetyPulseValue() {
    if (labSession.scenarioId !== FOURCAST_LAB_SCENARIOS.SAFETY_PULSE) {
      throw new Error("Prepare the Stage 11 preview pulse scenario first.");
    }
    if (!state.next) {
      throw new Error("The preview pulse scenario is not ready.");
    }
    var nextValue = Number(state.next.preview) % DIGITS.length + 1;
    setLabQueue(state.next.current, nextValue, null);
    labSession.lastAction = "cue:preview-value-changed-during-pulse";
    return observeLabState();
  }

  function runLabPerfect(kind) {
    if (labSession.scenarioId !== FOURCAST_LAB_SCENARIOS.PERFECT) {
      throw new Error("Prepare the perfect score scenario first.");
    }
    if (state.phase !== "running") {
      throw new Error("Resume the scenario before running input.");
    }
    prepareLabBase(11, FOURCAST_LAB_SCENARIOS.PERFECT, true);
    primeLabPerfectScenario(kind);
    var laneIndex = kind === "invalid-branch" || kind === "single" ? 0 : 2;
    labSession.lastAction = kind === "invalid-branch"
      ? "input:perfect-branch-invalid"
      : "input:perfect-two-step";
    handleLaneClick(laneIndex);
    handleLaneClick(laneIndex);
    return observeLabState();
  }

  function roundLabMetric(value) {
    return Math.round(value * 100) / 100;
  }

  function findLabSpawnBlock() {
    if (!labSession.spawnWaveId) {
      return null;
    }
    for (var laneIndex = 0; laneIndex < state.lanes.length; laneIndex += 1) {
      var block = state.lanes[laneIndex].blocks.find(function (candidate) {
        return (
          candidate.waveId === labSession.spawnWaveId &&
          candidate.status === "active" &&
          !candidate.parked &&
          candidate.element
        );
      });
      if (block) {
        return block;
      }
    }
    return null;
  }

  function collectLabWaveEntrySample(previousPositions, previousTime, now) {
    var diagnostics = getWaveGapDiagnostics();
    if (Number.isFinite(diagnostics.edgeGapPixels)) {
      labSession.waveGapSamples.push(diagnostics.edgeGapPixels);
    }

    var spawnBlock = findLabSpawnBlock();
    if (spawnBlock) {
      var spawnRect = getBlockElementRect(spawnBlock);
      if (spawnRect) {
        var height = spawnRect.height;
        if (labSession.spawnFootprintStartPixels === null) {
          labSession.spawnFootprintStartPixels = height;
        }
        if (labSession.spawnFootprintBaselinePixels === null) {
          labSession.spawnFootprintBaselinePixels = height;
          labSession.spawnFootprintMinPixels = height;
          labSession.spawnFootprintMaxPixels = height;
        } else {
          labSession.spawnFootprintMinPixels = Math.min(
            labSession.spawnFootprintMinPixels,
            height
          );
          labSession.spawnFootprintMaxPixels = Math.max(
            labSession.spawnFootprintMaxPixels,
            height
          );
        }
      }
    }

    var positions = {};
    state.lanes.forEach(function (lane) {
      lane.blocks.forEach(function (block) {
        if (
          (block.status === "active" || block.status === "removing") &&
          !block.parked &&
          Number.isFinite(block.normalizedY)
        ) {
          positions[block.id] = block.normalizedY;
        }
      });
    });

    if (previousPositions && previousTime !== null) {
      var elapsedSeconds = Math.max(1, now - previousTime) / 1000;
      var speeds = [];
      Object.keys(positions).forEach(function (blockId) {
        if (Object.prototype.hasOwnProperty.call(previousPositions, blockId)) {
          speeds.push(
            (Math.abs(positions[blockId] - previousPositions[blockId]) *
              getBlockLayerHeight()) /
              elapsedSeconds
          );
        }
      });
      if (speeds.length > 1) {
        var minimumSpeed = Math.min.apply(Math, speeds);
        var maximumSpeed = Math.max.apply(Math, speeds);
        var spread = maximumSpeed - minimumSpeed;
        labSession.movingSpeedSpreadPixels =
          labSession.movingSpeedSpreadPixels === null
            ? spread
            : Math.max(labSession.movingSpeedSpreadPixels, spread);
      }
    }

    return {
      positions: positions,
      time: now
    };
  }

  function finishLabWaveEntrySampling() {
    if (labSession.waveGapSamples.length > 1) {
      var minimumGap = Math.min.apply(Math, labSession.waveGapSamples);
      var maximumGap = Math.max.apply(Math, labSession.waveGapSamples);
      labSession.waveGapJitterPixels = roundLabMetric(maximumGap - minimumGap);
    } else if (labSession.waveGapSamples.length === 1) {
      labSession.waveGapJitterPixels = 0;
    }

    if (
      labSession.spawnFootprintMinPixels !== null &&
      labSession.spawnFootprintMaxPixels !== null
    ) {
      labSession.spawnFootprintEndPixels = labSession.spawnFootprintMaxPixels;
      labSession.spawnFootprintScaled =
        labSession.spawnFootprintStartPixels !== null &&
        labSession.spawnFootprintEndPixels !== null &&
        labSession.spawnFootprintEndPixels - labSession.spawnFootprintStartPixels > 2;
      labSession.spawnFootprintStable =
        labSession.spawnFootprintEndPixels !== null &&
        Math.abs(labSession.spawnFootprintEndPixels - getBlockHeightPixels()) <= 0.5;
      labSession.spawnFootprintBaselinePixels = roundLabMetric(
        labSession.spawnFootprintBaselinePixels
      );
      labSession.spawnFootprintMinPixels = roundLabMetric(
        labSession.spawnFootprintMinPixels
      );
      labSession.spawnFootprintMaxPixels = roundLabMetric(
        labSession.spawnFootprintMaxPixels
      );
      labSession.spawnFootprintStartPixels = roundLabMetric(
        labSession.spawnFootprintStartPixels
      );
      labSession.spawnFootprintEndPixels = roundLabMetric(
        labSession.spawnFootprintEndPixels
      );
    }
    if (labSession.movingSpeedSpreadPixels !== null) {
      labSession.movingSpeedSpreadPixels = roundLabMetric(
        labSession.movingSpeedSpreadPixels
      );
    }
  }

  function scheduleLabWaveEntrySampling() {
    var samplingToken = ++labSession.waveSamplingToken;
    var startedAt = performance.now();
    var deadline = startedAt + 240;
    // Capture the freshly inserted wave before the first animation frame so
    // the measured footprint includes the intended 0.28 starting scale.
    var initialSample = collectLabWaveEntrySample(null, null, startedAt);
    var previousPositions = initialSample.positions;
    var previousTime = initialSample.time;

    function sample(now) {
      if (samplingToken !== labSession.waveSamplingToken) {
        return;
      }
      var result = collectLabWaveEntrySample(
        previousPositions,
        previousTime,
        now
      );
      previousPositions = result.positions;
      previousTime = result.time;
      if (now < deadline) {
        window.requestAnimationFrame(sample);
        return;
      }
      finishLabWaveEntrySampling();
      labSession.lastAction = "motion:wave-entry-240ms-measured";
      pauseForExternal("lab-wave-entry-spacing");
      render(performance.now());
    }

    window.requestAnimationFrame(sample);
  }

  function runLabWaveSpacing() {
    if (labSession.scenarioId !== FOURCAST_LAB_SCENARIOS.WAVE_SPACING) {
      throw new Error("Prepare the 3% wave spacing scenario first.");
    }
    if (
      state.phase === "auto-paused" &&
      state.pauseReason === "lab-wave-spacing"
    ) {
      state.phase = "running";
      state.pauseReason = null;
      elements.countdownLayer.hidden = true;
      state.lastFrameTime = performance.now();
    }
    if (state.phase !== "running" || state.resolve) {
      throw new Error("Resume the scenario before advancing the wave.");
    }

    // Park the penalties at the line end, where their current Y is deeper
    // than the moving cascade. Reflow must still put them first behind the
    // incoming wave instead of letting Y-order leave them stranded below it.
    var parkedY = clamp(getGameOverY() - 0.02, 0, 1);
    createRushPenaltyBlock(0, 4, parkedY, true);
    createRushPenaltyBlock(0, 3, parkedY, true);
    // Keep the deliberately deep cascade on screen long enough to inspect
    // every moved row; the scenario is about reflow, not red-line teardown.
    state.lanes.forEach(function (lane) {
      lane.blocks.forEach(function (block) {
        block.redLineExempt = true;
      });
    });
    var advanceSeconds = Math.max(0, state.waveTimer);
    updateGame(advanceSeconds);
    var reflowSummary = state.lastWaveReflowSummary || {
      movedBlocks: [],
      releasedParkedBlocks: []
    };
    labSession.parkedRejoinCount = reflowSummary.releasedParkedBlocks.length;
    labSession.reflowMoveCount = reflowSummary.movedBlocks.length;
    var spacingDiagnostics = getWaveGapDiagnostics();
    if (Number.isFinite(spacingDiagnostics.edgeGapPixels)) {
      labSession.waveGapSamples = [spacingDiagnostics.edgeGapPixels];
      labSession.waveGapJitterPixels = 0;
    }
    labSession.lastAction = "motion:next-wave-and-parked-rejoin";
    updateStageUi();
    updateComboUi();
    render(performance.now());
    pauseForExternal("lab-wave-spacing");
    return observeLabState();
  }

  function runLabWaveEntrySpacing() {
    if (labSession.scenarioId !== FOURCAST_LAB_SCENARIOS.WAVE_ENTRY_SPACING) {
      throw new Error("Prepare the wave entry spacing scenario first.");
    }
    if (
      state.phase === "auto-paused" &&
      state.pauseReason === "lab-wave-entry-spacing"
    ) {
      state.phase = "running";
      state.pauseReason = null;
      elements.countdownLayer.hidden = true;
      state.lastFrameTime = performance.now();
    }
    if (state.phase !== "running" || state.resolve) {
      throw new Error("Resume the scenario before advancing the wave.");
    }

    var advanceSeconds = Math.max(0, state.waveTimer);
    updateGame(advanceSeconds);
    var reflowSummary = state.lastWaveReflowSummary || {
      movedBlocks: [],
      releasedParkedBlocks: []
    };
    labSession.reflowMoveCount = reflowSummary.movedBlocks.length;
    var visibleWaves = state.waves.filter(function (wave) {
      return wave.visible && wave.blockIds.length > 0;
    });
    var spawnedWave = visibleWaves[visibleWaves.length - 1];
    labSession.spawnWaveId = spawnedWave ? spawnedWave.id : null;
    labSession.lastAction = "motion:wave-entry-sampling-started";
    updateStageUi();
    updateComboUi();
    render(performance.now());
    scheduleLabWaveEntrySampling();
    return observeLabState();
  }

  function triggerLabRedLine() {
    if (labSession.scenarioId !== FOURCAST_LAB_SCENARIOS.RED_LINE_RESET) {
      throw new Error("Prepare the red-line reset scenario first.");
    }
    if (state.phase !== "running") {
      throw new Error("Resume the scenario before triggering the boundary.");
    }
    var block = getBottomBlock(0);
    if (!block) {
      throw new Error("Scenario lane has no red-line block.");
    }
    block.status = "active";
    block.parked = false;
    block.redLineExempt = false;
    block.normalizedY = getGameOverY() + 0.02;
    labSession.lastAction = "state:red-line-ready";
    return observeLabState();
  }

  function handleLabEndRun(reason) {
    if (!labSession.active || reason !== "red-line") {
      return false;
    }

    var scenarioId = labSession.scenarioId;
    var selectedStage = labSession.selectedStage;
    labSession.resetCount += 1;
    labSession.lastAction = "event:red-line-reset";
    state.phase = "lab-resetting";
    clearProjectile(state.resolve);
    state.resolve = null;
    state.pendingInputs = [];
    state.buttonsLocked = true;
    clearStageBanner();
    clearHudFeedback();

    labSession.resetTimer = window.setTimeout(function () {
      labSession.resetTimer = null;
      prepareLabScenario(scenarioId, selectedStage, true);
      labSession.lastAction = "reset:" + scenarioId;
    }, 120);
    return true;
  }

  function observeLabState() {
    var now = performance.now();
    var waveDiagnostics = getWaveGapDiagnostics();
    return {
      channel: FOURCAST_LAB_CHANNEL,
      scenarioId: labSession.scenarioId,
      selectedStage: labSession.selectedStage,
      phase: state.phase,
      stage: state.stage,
      stageRemoved: state.stageRemoved,
      stageTarget: state.stageTarget,
      safetyCheck: state.difficulty
        ? Boolean(state.difficulty.safetyCheck)
        : null,
      currentNext: state.next ? state.next.current : null,
      previewNext: state.next ? state.next.preview : null,
      combo: state.combo,
      score: state.score,
      perfectOpportunityActive: state.nextInsight.perfectOpportunityActive,
      perfectLaneIndex: state.nextInsight.perfectLaneIndex,
      perfectSuccessCount: state.nextInsight.perfectSuccessCount,
      perfectPathActive: Boolean(state.nextInsight.perfectPath),
      feedbackType: state.feedback.type,
      safetyCueShown: state.nextInsight.safetyCueShown,
      safetyCueActive: now < state.nextInsight.safetyCueUntil,
      waveGapPixels: waveDiagnostics.edgeGapPixels,
      waveGapTargetPixels: getStackRushWaveGapPixels(),
      waveGapRatio: waveDiagnostics.waveGapRatio,
      waveGapTargetRatio: STACK_RUSH_WAVE_GAP_RATIO,
      waveCenterGapPixels: waveDiagnostics.centerGapPixels,
      waveEdgeGapPixels: waveDiagnostics.edgeGapPixels,
      blockHeightPixels: waveDiagnostics.blockHeightPixels,
      waveGapJitterPixels: labSession.waveGapJitterPixels,
      maxOverlapPixels: waveDiagnostics.maxOverlapPixels,
      reflowMoveCount: labSession.reflowMoveCount,
      movingSpeedSpreadPixels: labSession.movingSpeedSpreadPixels,
      spawnFootprintStable: labSession.spawnFootprintStable,
      spawnFootprintScaled: labSession.spawnFootprintScaled,
      spawnFootprintBaselinePixels: labSession.spawnFootprintBaselinePixels,
      spawnFootprintMinPixels: labSession.spawnFootprintMinPixels,
      spawnFootprintMaxPixels: labSession.spawnFootprintMaxPixels,
      spawnFootprintStartPixels: labSession.spawnFootprintStartPixels,
      spawnFootprintEndPixels: labSession.spawnFootprintEndPixels,
      fallDurationSeconds: state.difficulty
        ? state.difficulty.fallDurationSeconds
        : null,
      waveIntervalSeconds: state.difficulty
        ? state.difficulty.waveIntervalSeconds
        : null,
      visibleWaveCount: state.difficulty
        ? state.difficulty.initialWaveCount + state.stageSpawnedWaveCount
        : 0,
      totalWaveCount: state.difficulty ? state.difficulty.totalWaveCount : 0,
      parkedRejoinCount: labSession.parkedRejoinCount,
      resetCount: labSession.resetCount,
      gameOverVisible: !elements.gameOverScreen.hidden,
      lastAction: labSession.lastAction
    };
  }

  function handleLabCommand(action, payload) {
    var data = payload || {};
    if (action === "observe") {
      return observeLabState();
    }
    if (action === "start-stage") {
      return prepareLabScenario(
        FOURCAST_LAB_SCENARIOS.STAGE_SANDBOX,
        data.stage,
        false
      );
    }
    if (action === "prepare-scenario") {
      return prepareLabScenario(data.scenarioId, data.stage || 11, false);
    }
    if (action === "reset-scenario") {
      if (!labSession.scenarioId) {
        throw new Error("Choose a scenario before resetting.");
      }
      return prepareLabScenario(
        labSession.scenarioId,
        labSession.selectedStage,
        false
      );
    }
    if (action === "pause") {
      pauseForExternal("lab-control");
      labSession.lastAction = "control:pause";
      return observeLabState();
    }
    if (action === "resume") {
      if (state.phase === "auto-paused" && state.pauseReason === "lab-control") {
        tryResumeAfterExternalPause();
      }
      labSession.lastAction = "control:resume";
      return observeLabState();
    }
    if (action === "run-safety-release") {
      return runLabSafetyRelease();
    }
    if (action === "run-safety-pulse") {
      return runLabSafetyPulse();
    }
    if (action === "change-safety-pulse") {
      return changeLabSafetyPulseValue();
    }
    if (action === "run-perfect") {
      return runLabPerfect("perfect");
    }
    if (action === "run-perfect-single") {
      return runLabPerfect("single");
    }
    if (action === "run-perfect-invalid") {
      return runLabPerfect("invalid-branch");
    }
    if (action === "run-wave-spacing") {
      return runLabWaveSpacing();
    }
    if (action === "run-wave-entry-spacing") {
      return runLabWaveEntrySpacing();
    }
    if (action === "trigger-red-line") {
      return triggerLabRedLine();
    }
    throw new Error("Lab action is not allowed.");
  }

  if (
    window.__FOURCAST_LAB_BOOTSTRAP__ &&
    typeof window.__FOURCAST_LAB_BOOTSTRAP__.attach === "function"
  ) {
    window.__FOURCAST_LAB_BOOTSTRAP__.attach({
      command: handleLabCommand,
      observe: observeLabState
    });
  }
  /* FOURCAST_LAB_END */

  window.FOURCAST = {
    getState: function () {
      return {
        phase: state.phase,
        score: state.score,
        bestScore: state.bestScore,
        elapsed: state.elapsed,
        level: state.level,
        stage: state.stage,
        stageRemoved: state.stageRemoved,
        stageTarget: state.stageTarget,
        stageRemainingSeconds: getStageRemainingSeconds(),
        stageResult: state.stageResult,
        highestStage: state.highestStage,
        combo: state.combo,
        bestCombo: state.bestCombo,
        feedbackType: state.feedback.type,
        perfectOpportunityActive: state.nextInsight.perfectOpportunityActive,
        perfectLaneIndex: state.nextInsight.perfectLaneIndex,
        perfectSuccessCount: state.nextInsight.perfectSuccessCount,
        perfectPathActive: Boolean(state.nextInsight.perfectPath),
        difficulty: Object.assign({}, state.difficulty),
        stageProfile: state.stageProfile
          ? Object.assign({}, state.stageProfile)
          : null,
        stageSpawnedWaveCount: state.stageSpawnedWaveCount,
        next: state.next ? Object.assign({}, state.next) : null,
        nextInsight: Object.assign({}, state.nextInsight),
        futureWaveCount: state.futureWaves.length,
        visibleBlockCount: getVisibleBlockCount(),
        buttonsLocked: state.buttonsLocked,
        pendingInputCount: state.pendingInputs.length,
        language: state.language,
        bgmEnabled: state.bgmEnabled,
        bgmVolume: state.bgmVolume,
        bgmPlayback: state.bgmPlayback,
        bgmBackend: bgmEngine.backend,
        bgmLoopStart: bgmEngine.loopStart,
        bgmLoopEnd: bgmEngine.loopEnd,
        bgmBufferDuration: bgmEngine.bufferDuration,
        bgmAudioContextState: bgmEngine.context ? bgmEngine.context.state : null
      };
    },
    getStackRushStageProfile: function (stage) {
      return Object.assign({}, buildStackRushStageProfile(stage));
    },
    start: startOrRestart,
    pressLane: handleLaneClick,
    pause: function () {
      pauseForExternal("manual-test");
    }
  };

  prepareBgmAssets();
  applyLanguage();
  updateBestScoreUi();
  measureLayout();
  updateOrientationState();
  showScreen("start");
  render(performance.now());

  function frame(now) {
    if (!state.lastFrameTime) {
      state.lastFrameTime = now;
    }

    var deltaSeconds = Math.min(0.1, Math.max(0, (now - state.lastFrameTime) / 1000));
    state.lastFrameTime = now;

    if (state.phase === "running") {
      updateGame(deltaSeconds);
    } else if (state.phase === PHASE_STAGE_BREAK) {
      updateStageBreak(deltaSeconds, now);
    }
    render(now);
    window.requestAnimationFrame(frame);
  }

  window.requestAnimationFrame(frame);
})();

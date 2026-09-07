import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROD_ROOT = path.join(ROOT, "dist", "prod");
const LAB_ROOT = path.join(ROOT, "dist", "lab");
const PROD_ALLOWED_FILES = [
  "ads-config.js",
  "ads.js",
  "ads.txt",
  "app.js",
  "audio/fourcast-bgm-v2.wav",
  "index.html",
  "privacy.html",
  "robots.txt",
  "sitemap.xml",
  "styles.css"
];
const PROD_FORBIDDEN_TEXT = [
  "FOURCAST_LAB",
  "fourcast-lab-v1",
  "stage-sandbox",
  "safety-release-10-to-11",
  "safety-pulse-stage-11",
  "perfect-score",
  "red-line-auto-reset",
  "wave-spacing-and-rejoin",
  "wave-entry-spacing",
  "run-perfect",
  "run-safety-pulse",
  "next-relationship",
  "stack-impact-pulse",
  "__FOURCAST_LAB_BOOTSTRAP__",
  "handleLabCommand"
];
const PROD_SINGLE_MODE_FORBIDDEN_TEXT = [
  "classic",
  "MODE_CLASSIC",
  "classicModeCard",
  "classicModeName",
  "getDifficulty: function",
  "bestScores"
];

async function walk(directory, base = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(absolute, base)));
    } else {
      files.push(path.relative(base, absolute).split(path.sep).join("/"));
    }
  }
  return files.sort();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

export async function verifyBuild() {
  const productionFiles = await walk(PROD_ROOT);
  assert(
    JSON.stringify(productionFiles) === JSON.stringify(PROD_ALLOWED_FILES),
    "Production allowlist mismatch: " + productionFiles.join(", ")
  );

  for (const relativePath of productionFiles) {
    if (!/\.(?:html|css|js)$/u.test(relativePath)) {
      continue;
    }
    const text = await readFile(path.join(PROD_ROOT, relativePath), "utf8");
    for (const forbidden of PROD_FORBIDDEN_TEXT) {
      assert(
        !text.includes(forbidden),
        "Production contamination in " + relativePath + ": " + forbidden
      );
    }
    for (const forbidden of PROD_SINGLE_MODE_FORBIDDEN_TEXT) {
      assert(
        !text.toLowerCase().includes(forbidden.toLowerCase()),
        "Classic mode residue in " + relativePath + ": " + forbidden
      );
    }
  }

  const productionHtml = await readFile(path.join(PROD_ROOT, "index.html"), "utf8");
  const productionApp = await readFile(path.join(PROD_ROOT, "app.js"), "utf8");
  const productionAdsConfig = await readFile(
    path.join(PROD_ROOT, "ads-config.js"),
    "utf8"
  );
  const productionAds = await readFile(path.join(PROD_ROOT, "ads.js"), "utf8");
  const productionPrivacy = await readFile(
    path.join(PROD_ROOT, "privacy.html"),
    "utf8"
  );
  assert(productionHtml.includes("./app.js"), "Production app entry is missing.");
  assert(productionHtml.includes("./styles.css"), "Production stylesheet is missing.");
  assert(
    productionHtml.includes("./ads-config.js") &&
      productionHtml.includes("./ads.js"),
    "Production ad manager entry is missing."
  );
  assert(
    productionHtml.includes("./privacy.html"),
    "Production privacy link is missing."
  );
  assert(
    productionHtml.includes('data-ad-slot-key="home"') &&
      productionHtml.includes('data-ad-slot-key="gameOver"'),
    "Production ad slots are missing."
  );
  assert(productionApp.includes("window.FOURCAST ="), "Public FOURCAST API is missing.");
  assert(productionApp.includes("getState: function"), "Public read API is missing.");
  assert(
    productionApp.includes("getStackRushStageProfile: function"),
    "Stack Rush profile API is missing."
  );
  assert(
    productionAdsConfig.includes("FOURCAST_AD_CONFIG") &&
      productionAdsConfig.includes("client:") &&
      productionAdsConfig.includes("slots:"),
    "AdSense configuration is incomplete."
  );
  assert(
    productionAds.includes("pagead2.googlesyndication.com"),
    "AdSense loader is missing."
  );
  assert(
    !productionPrivacy.includes("adsbygoogle") &&
      !productionPrivacy.includes("pagead2.googlesyndication.com") &&
      !productionPrivacy.includes("FOURCAST_AD_CONFIG"),
    "Privacy page must not load advertising or consent scripts."
  );
  const productionAdsTxt = await readFile(path.join(PROD_ROOT, "ads.txt"), "utf8");
  const productionRobots = await readFile(path.join(PROD_ROOT, "robots.txt"), "utf8");
  const productionSitemap = await readFile(
    path.join(PROD_ROOT, "sitemap.xml"),
    "utf8"
  );
  assert(productionAdsTxt.trim().length > 0, "ads.txt is empty.");
  assert(productionRobots.includes("User-agent:"), "robots.txt is missing.");
  assert(productionSitemap.includes("<urlset"), "sitemap.xml is missing.");

  const requiredLabFiles = [
    "game/app.js",
    "game/bootstrap.js",
    "game/ads-config.js",
    "game/ads.js",
    "game/index.html",
    "game/styles.css",
    "game/audio/fourcast-bgm-v2.wav",
    "index.html",
    "lab.css",
    "lab.js"
  ];
  const labFiles = await walk(LAB_ROOT);
  for (const required of requiredLabFiles) {
    assert(labFiles.includes(required), "Lab artifact is missing: " + required);
  }

  const labHtml = await readFile(path.join(LAB_ROOT, "index.html"), "utf8");
  const labGameHtml = await readFile(path.join(LAB_ROOT, "game", "index.html"), "utf8");
  const labApp = await readFile(path.join(LAB_ROOT, "game", "app.js"), "utf8");
  assert(labHtml.includes("./game/index.html"), "Lab mobile frame entry is missing.");
  assert(labGameHtml.includes("./bootstrap.js"), "Lab bridge entry is missing.");
  assert(labApp.includes("FOURCAST_LAB_START"), "Lab scenario driver is missing.");

  const audioInfo = await stat(path.join(PROD_ROOT, "audio", "fourcast-bgm-v2.wav"));
  assert(audioInfo.size > 0, "Production BGM asset is empty.");

  return {
    productionFiles,
    labFiles
  };
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  verifyBuild()
    .then((result) => {
      console.log(
        "Build verification passed: " +
          String(result.productionFiles.length) +
          " production files, " +
          String(result.labFiles.length) +
          " Lab files."
      );
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}

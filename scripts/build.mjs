import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyBuild } from "./verify-build.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST_ROOT = path.join(ROOT, "dist");
const PROD_ROOT = path.join(DIST_ROOT, "prod");
const LAB_ROOT = path.join(DIST_ROOT, "lab");
const LAB_BLOCK =
  /\n?[ \t]*\/\* FOURCAST_LAB_START \*\/[\s\S]*?\/\* FOURCAST_LAB_END \*\/[ \t]*\n?/gu;

async function copyFile(relativeSource, destinationRoot, relativeDestination = relativeSource) {
  const destination = path.join(destinationRoot, relativeDestination);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(ROOT, relativeSource), destination);
}

async function buildProduction() {
  await mkdir(PROD_ROOT, { recursive: true });
  await copyFile("index.html", PROD_ROOT);
  await copyFile("styles.css", PROD_ROOT);
  await copyFile("ads-config.js", PROD_ROOT);
  await copyFile("ads.js", PROD_ROOT);
  await copyFile("privacy.html", PROD_ROOT);
  await copyFile("ads.txt", PROD_ROOT);
  await copyFile("robots.txt", PROD_ROOT);
  await copyFile("sitemap.xml", PROD_ROOT);
  await copyFile("audio/fourcast-bgm-v2.wav", PROD_ROOT);

  const sourceApp = await readFile(path.join(ROOT, "app.js"), "utf8");
  const productionApp = sourceApp.replace(LAB_BLOCK, "\n");
  if (productionApp.includes("FOURCAST_LAB")) {
    throw new Error("Lab-only source remained after production stripping.");
  }
  await writeFile(path.join(PROD_ROOT, "app.js"), productionApp, "utf8");
}

async function buildLab() {
  await mkdir(path.join(LAB_ROOT, "game"), { recursive: true });
  await copyFile("lab/index.html", LAB_ROOT, "index.html");
  await copyFile("lab/lab.css", LAB_ROOT, "lab.css");
  await copyFile("lab/lab.js", LAB_ROOT, "lab.js");
  await copyFile("lab/bootstrap.js", LAB_ROOT, "game/bootstrap.js");
  await copyFile("app.js", LAB_ROOT, "game/app.js");
  await copyFile("styles.css", LAB_ROOT, "game/styles.css");
  await copyFile("ads-config.js", LAB_ROOT, "game/ads-config.js");
  await copyFile("ads.js", LAB_ROOT, "game/ads.js");
  await copyFile(
    "audio/fourcast-bgm-v2.wav",
    LAB_ROOT,
    "game/audio/fourcast-bgm-v2.wav"
  );

  const productionHtml = await readFile(path.join(ROOT, "index.html"), "utf8");
  const labGameHtml = productionHtml.replace(
    '<script src="./app.js" defer></script>',
    '<script src="./bootstrap.js" defer></script>\n    <script src="./app.js" defer></script>'
  );
  if (!labGameHtml.includes("./bootstrap.js")) {
    throw new Error("Could not inject the Lab bridge entry.");
  }
  await writeFile(path.join(LAB_ROOT, "game/index.html"), labGameHtml, "utf8");
}

async function main() {
  await rm(DIST_ROOT, { recursive: true, force: true });
  await buildProduction();
  await buildLab();
  const result = await verifyBuild();
  console.log(
    "Built dist/prod and dist/lab. Production allowlist contains " +
      String(result.productionFiles.length) +
      " files."
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

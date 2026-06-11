import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = join(root, "public/favicon.svg");
const publicDir = join(root, "public");
const resvg = "npx -y @resvg/resvg-js-cli";

function renderPng(width, outPath) {
  execSync(`${resvg} --fit-width ${width} "${svg}" "${outPath}"`, {
    stdio: "inherit",
    cwd: root,
  });
}

renderPng(180, join(publicDir, "apple-touch-icon.png"));

const tmpPngs = [16, 32, 48].map((size) => {
  const path = join(root, `.favicon-${size}.png`);
  renderPng(size, path);
  return path;
});

const toIcoDir = join(root, ".favicon-gen");
execSync(
  `mkdir -p "${toIcoDir}" && cd "${toIcoDir}" && npm init -y >/dev/null 2>&1 && npm install to-ico >/dev/null 2>&1`,
  { stdio: "ignore" },
);

const icoScript = `
import { readFileSync, writeFileSync } from "node:fs";
import toIco from "to-ico";
const pngs = ${JSON.stringify(tmpPngs)}.map((p) => readFileSync(p));
writeFileSync(${JSON.stringify(join(publicDir, "favicon.ico"))}, await toIco(pngs));
`;

execSync(`node --input-type=module -e ${JSON.stringify(icoScript)}`, {
  cwd: toIcoDir,
  stdio: "inherit",
});

for (const path of tmpPngs) {
  execSync(`rm -f "${path}"`);
}

console.log("Generated public/favicon.ico and public/apple-touch-icon.png");

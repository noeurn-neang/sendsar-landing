import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import toIco from "to-ico";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const logo = join(publicDir, "logo.svg");
const svg = join(publicDir, "favicon.svg");
const resvg = "npx -y @resvg/resvg-js-cli";

function buildFavicon() {
  const icon = readFileSync(logo, "utf8");
  const body = icon.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").trim();

  writeFileSync(
    svg,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" fill="none" role="img" aria-label="Sendsar">
  <svg x="11" y="9" width="74" height="78" viewBox="0 0 724 774" xmlns="http://www.w3.org/2000/svg">
${body}
  </svg>
</svg>
`,
  );
}

buildFavicon();

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

writeFileSync(
  join(publicDir, "favicon.ico"),
  await toIco(tmpPngs.map((path) => readFileSync(path))),
);

for (const path of tmpPngs) {
  execSync(`rm -f "${path}"`);
}

console.log("Generated public/favicon.svg, favicon.ico, and apple-touch-icon.png");

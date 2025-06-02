import fs from "node:fs";
import { execSync } from "child_process";

if (fs.existsSync("lib")) {
	fs.rmSync("lib", { recursive: true });
}
execSync("tsc");
fs.writeFileSync("akashic-lib.json", JSON.stringify({}, null, "\t"));
execSync("akashic scan asset");
/** @type {import("@akashic/akashic-cli-commons").LibConfiguration} */
const akashicLib = JSON.parse(fs.readFileSync("akashic-lib.json", { encoding: "utf8" }));
for (const asset of akashicLib.assetList.filter(a => a.path.match(/\.default\./))) {
	asset.global = true;
}
fs.writeFileSync("akashic-lib.json", JSON.stringify(akashicLib, null, "\t"));

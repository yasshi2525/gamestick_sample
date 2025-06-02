import fs from "fs";
import path from "path";
import { GameContext } from "@akashic/headless-akashic";
import { execSync } from "child_process";

const TMP_PATH = "tmp";
const SCREENSHOT_PATH = path.join(TMP_PATH, "screenshot");
const MODULE_NAME = "@yasshi2525/simple-game-stick";

const setup = async () => {
	fs.rmSync(TMP_PATH, { recursive: true, force: true });
	fs.mkdirSync(TMP_PATH, { recursive: true });
	globalThis.TMP_PATH = TMP_PATH;
	fs.mkdirSync(SCREENSHOT_PATH, { recursive: true });
	globalThis.SCREENSHOT_PATH = SCREENSHOT_PATH;

	// テストスクリプト中でデフォルト画像アセットを読み込めるよう、game.jsonを作成する
	/** @type {import("@akashic/game-configuration").GameConfiguration} */
	const gameJson = {
		main: "./script/main.js",
		width: 1280,
		height: 720,
		fps: 30,
		assets: {},
		environment: {
			"sandbox-runtime": "3",
		}
	};
	fs.cpSync(path.join("spec", "image"), path.join(TMP_PATH, "image"), { recursive: true });
	fs.mkdirSync(path.join(TMP_PATH, "script"), { recursive: true });
	fs.writeFileSync(
		path.join(TMP_PATH, "script", "main.js"),
		"module.exports = () => { g.game.pushScene(new g.Scene({ game: g.game })); };"
	);
	fs.writeFileSync(
		path.join(TMP_PATH, "game.json"),
		JSON.stringify(gameJson, null, 4)
	);
	execSync("akashic scan asset", { cwd: TMP_PATH });
	execSync("npm init -y", { cwd: TMP_PATH });
	execSync("npm install ..", { cwd: TMP_PATH });
	execSync(`akashic install ${MODULE_NAME}`, { cwd: TMP_PATH });

	const context = new GameContext({
		gameJsonPath: path.join(TMP_PATH, "game.json")
	});
	const client = await context.getGameClient({ renderingMode: "@napi-rs/canvas" });
	globalThis.context = context;
	globalThis.client = client;
	globalThis.g = client.g;
	globalThis.g.game = client.game;
	// default-loading-scene から次の scene に遷移するタイミングで画像アセットが読み込まれるため、ここで待機する
	await client.advanceUntil(() => g.game.scene().name !== "akashic:default-loading-scene");
};

export default setup;

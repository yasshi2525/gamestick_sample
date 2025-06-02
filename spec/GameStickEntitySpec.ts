import * as fs from "node:fs";
import * as path from "node:path";
import type {LibConfiguration} from "@akashic/akashic-cli-commons";
import {Canvas} from "@napi-rs/canvas";
import {GameStickEntity} from "../src";

const akashicLib = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "akashic-lib.json"), { encoding: "utf8" })) as LibConfiguration;
const defaultImage = akashicLib.assetList!.find(
	a => a.type === "image" && a.path === "image/game-stick.default.png")! as g.ImageAssetConfigurationBase;
const gameJson = JSON.parse(fs.readFileSync(path.join(TMP_PATH, "game.json"), { encoding: "utf8" })) as g.GameConfiguration;
const customImage = (gameJson.assets as g.AssetConfigurationMap)["game-stick.custom"] as g.ImageAssetConfigurationBase;

/**
 * GameStickEntity の背景とスティックスプライトを取得する。
 * @param obj 取得対象
 * @returns [background(影), body(スティック本体)]
 */
const extractGameStickChildren = (obj: GameStickEntity): [g.Sprite, g.Sprite] => {
	if (obj.children?.length !== 2 || !(obj.children[0] instanceof g.Sprite) || !(obj.children[1] instanceof g.Sprite)) {
		throw new Error("Invalid GameStickEntity structure: expected 2 children of type g.Sprite");
	}
	return [obj.children[0] as g.Sprite, obj.children[1] as g.Sprite];
};

describe("GameStickEntity", () => {
	let scene: g.Scene;
	beforeEach(async () => {
		scene = new g.Scene({ game: g.game, assetIds: ["game-stick.custom"] });
		g.game.pushScene(scene);
		await context.step();
	});
	afterEach(async () => {
		await context.step();
		const dataURL = (client.getPrimarySurfaceCanvas() as Canvas).toDataURL();
		fs.writeFileSync(
			path.join(SCREENSHOT_PATH, `${expect.getState().currentTestName}.png`),
			dataURL.replace(/^data:image\/png;base64,/, ""), "base64");
		// デグレード防止用チェック
		expect(dataURL).toMatchSnapshot();
	});

	it("何も指定がないとき、デフォルトの画像が使われる。サイズは画像と同じ", () => {
		const obj = new GameStickEntity({
			scene,
			parent: scene
		});
		const [background, body] = extractGameStickChildren(obj);
		// デフォルトの画像が使われる
		expect((background.src as g.ImageAsset).path.endsWith(defaultImage.path)).toBe(true);
		expect((body.src as g.ImageAsset).path.endsWith(defaultImage.path)).toBe(true);
		// size の指定がないので本体は影の半分のサイズ
		expect(background.scaleX).toBe(1);
		expect(background.scaleY).toBe(1);
		expect(body.scaleX).toBe(0.5);
		expect(body.scaleY).toBe(0.5);
		// 影と本体の x, y は 画像の中心座標
		expect(background.x).toBe(Math.round(defaultImage.width / 2));
		expect(background.y).toBe(Math.round(defaultImage.height / 2));
		expect(body.x).toBe(Math.round(defaultImage.width / 2));
		expect(body.y).toBe(Math.round(defaultImage.height / 2));
		// x, y は g.E デフォルトの値
		expect(obj.x).toBe(0);
		expect(obj.y).toBe(0);
		// width, height は画像のサイズ
		expect(obj.width).toBe(defaultImage.width);
		expect(obj.height).toBe(defaultImage.height);
	});

	it("画像の指定はあるが、area, size の指定がないとき、画像のサイズが使われる", () => {
		const obj = new GameStickEntity({
			scene,
			parent: scene,
			image: scene.asset.getImageById("game-stick.custom")
		});
		const [background, body] = extractGameStickChildren(obj);
		// 指定した画像が使われる
		expect((background.src as g.ImageAsset).path.endsWith("game-stick.custom.png")).toBe(true);
		expect((body.src as g.ImageAsset).path.endsWith("game-stick.custom.png")).toBe(true);
		// size の指定がないので本体は影の半分のサイズ
		expect(background.scaleX).toBe(1);
		expect(background.scaleY).toBe(1);
		expect(body.scaleX).toBe(0.5);
		expect(body.scaleY).toBe(0.5);
		// 影と本体の x, y は 画像の中心座標
		expect(background.x).toBe(Math.round(customImage.width / 2));
		expect(background.y).toBe(Math.round(customImage.height / 2));
		expect(body.x).toBe(Math.round(customImage.width / 2));
		expect(body.y).toBe(Math.round(customImage.height / 2));
		// x,y は g.E デフォルトの値
		expect(obj.x).toBe(0);
		expect(obj.y).toBe(0);
		// width, height は画像のサイズ
		expect(obj.width).toBe(customImage.width);
		expect(obj.height).toBe(customImage.height);
	});

	it("area の指定があるとき、areaにあわせて大きさが決まる", () => {
		const area = { x: 10, y: 20, width: 50, height: 400 };
		// x, y 軸方向誤りがないかテストするため、縦横比の異なるcustom画像を使う
		const obj = new GameStickEntity({
			scene,
			parent: scene,
			image: scene.asset.getImageById("game-stick.custom"),
			area
		});
		const [background, body] = extractGameStickChildren(obj);
		// size の指定がないので本体は影の半分のサイズ
		expect(body.scaleX).toBe(background.scaleX / 2);
		expect(body.scaleY).toBe(background.scaleY / 2);
		// x, y, width, height は area の値
		expect(obj.x).toBe(area.x);
		expect(obj.y).toBe(area.y);
		expect(obj.width).toBe(area.width);
		expect(obj.height).toBe(area.height);
		// 影と本体の x, y は obj の中心座標 (area が指定されても省略時のときと変わらない)
		expect(background.x).toBe(Math.round(obj.width / 2));
		expect(background.y).toBe(Math.round(obj.height / 2));
		expect(body.x).toBe(Math.round(obj.width / 2));
		expect(body.y).toBe(Math.round(obj.height / 2));
		// width, height に合わせて影と本体のスケールが変わる
		expect(background.scaleX).toBe(area.width / customImage.width);
		expect(background.scaleY).toBe(area.height / customImage.height);
		expect(body.scaleX).toBe(area.width / customImage.width / 2);
		expect(body.scaleY).toBe(area.height / customImage.height / 2);
	});

	it("area の指定があるとき、x, y, width, height の指定は無視される", () => {
		const area = { x: 50, y: 200, width: 400, height: 50 };
		const obj = new GameStickEntity({
			scene,
			parent: scene,
			area,
			x: 100, // 無視される
			y: 200, // 無視される
			width: 300, // 無視される
			height: 400, // 無視される
		});
		// x, y, width, height は area の値
		expect(obj.x).toBe(area.x);
		expect(obj.y).toBe(area.y);
		expect(obj.width).toBe(area.width);
		expect(obj.height).toBe(area.height);
	});

	it("size の指定はあるが、area, width, height の指定がないとき、影と本体は size の大きさとなる", () => {
		const size = { width: 25, height: 35 };
		const obj = new GameStickEntity({
			scene,
			parent: scene,
			size
		});
		const [background, body] = extractGameStickChildren(obj);
		// size の指定があるので影と本体は同じ大きさ
		expect(background.scaleX).toBe(size.width / defaultImage.width);
		expect(background.scaleY).toBe(size.height / defaultImage.height);
		expect(body.scaleX).toBe(size.width / defaultImage.width);
		expect(body.scaleY).toBe(size.height / defaultImage.height);
		// 影と本体の x, y は obj の中心座標 (size が指定されても省略時のときと変わらない)
		expect(background.x).toBe(Math.round(obj.width / 2));
		expect(background.y).toBe(Math.round(obj.height / 2));
		expect(body.x).toBe(Math.round(obj.width / 2));
		expect(body.y).toBe(Math.round(obj.height / 2));
	});

	it("size が area より小さければ、本体は size, 影は area の大きさとなる", () => {
		const area = { x: 200, y: 300, width: 500, height: 300 };
		const size = { width: 400, height: 150 };
		const obj = new GameStickEntity({
			scene,
			parent: scene,
			area,
			size
		});
		const [background, body] = extractGameStickChildren(obj);
		// 影は area の大きさ
		expect(background.scaleX).toBe(area.width / defaultImage.width);
		expect(background.scaleY).toBe(area.height / defaultImage.height);
		// size は area より小さいので、本体は size の大きさ
		expect(body.scaleX).toBe(size.width / defaultImage.width);
		expect(body.scaleY).toBe(size.height / defaultImage.height);
	});

	it("size が area より大きければ、影の大きさは本体と同じ大きさとなる", () => {
		const area = { x: 400, y: 200, width: 200, height: 300 };
		const size = { width: 400, height: 450 };
		const obj = new GameStickEntity({
			scene,
			parent: scene,
			area,
			size
		});
		const [background, body] = extractGameStickChildren(obj);
		// size が area より大きいので、影と本体は size の大きさ
		expect(background.scaleX).toBe(size.width / defaultImage.width);
		expect(background.scaleY).toBe(size.height / defaultImage.height);
		expect(body.scaleX).toBe(size.width / defaultImage.width);
		expect(body.scaleY).toBe(size.height / defaultImage.height);
	});

	it.each([
		[ "左", -1, 0, -1, 0 ],
		[ "右", +1, 0, +1, 0 ],
		[ "上", 0, -1, 0, -1 ],
		[ "下", 0, +1, 0, +1 ],
	])("%s 方向に最大まで動かすと、 (%d, %d) の値が通知される", async (_, pointX, pointY, dx, dy) => {
		const point: g.CommonOffset = { x: 0, y: 0 };
		const obj = new GameStickEntity({
			scene,
			parent: scene,
			image: scene.asset.getImageById("game-stick.custom"),
			func: (p) => {
				point.x = p.x;
				point.y = p.y;
			}
		});
		await context.step();
		const initial: g.CommonOffset = { x: obj.x + obj.width / 2, y: obj.y + obj.height / 2 };
		client.sendPointDown(initial.x, initial.y, 1);
		await context.step();
		for (let len = 0; len < Math.max(obj.width, obj.height); len++) {
			client.sendPointMove(initial.x + len * dx, initial.y + len * dy, 1);
			await context.step();
		}
		expect(point.x).toBe(pointX);
		expect(point.y).toBe(pointY);
	});

	it("離されたら元の位置に戻る", async () => {
		const point: g.CommonOffset = { x: 0, y: 0 };
		const obj = new GameStickEntity({
			scene,
			parent: scene,
			image: scene.asset.getImageById("game-stick.custom"),
			func: (p) => {
				point.x = p.x;
				point.y = p.y;
			}
		});
		const [background, body] = extractGameStickChildren(obj);
		const initial: g.CommonOffset = { x: obj.x + obj.width / 2, y: obj.y + obj.height / 2 };
		client.sendPointDown(initial.x, initial.y, 1);
		await context.step();
		client.sendPointMove(initial.x + 10, initial.y + 10, 1);
		await context.step();
		client.sendPointUp(initial.x + 10, initial.y + 10, 1);
		await context.step();
		expect(point.x).toBe(0);
		expect(point.y).toBe(0);
		expect(background.x).toBe(Math.round(obj.width / 2));
		expect(background.y).toBe(Math.round(obj.height / 2));
		expect(body.x).toBe(Math.round(obj.width / 2));
		expect(body.y).toBe(Math.round(obj.height / 2));
	});
});

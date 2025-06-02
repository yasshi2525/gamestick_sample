import {GameStickEntity} from "@yasshi2525/simple-game-stick";

/**
 * メイン関数。
 *
 * Original author: dera- (https://github.com/dera-)
 * Modified by: yasshi2525
 *
 * @author dera-
 * @author yasshi2525
 */
function main(_param: g.GameMainParameterObject ): void {
	const scene = new g.Scene({
		game: g.game,
		// このシーンで利用するアセットのIDを列挙し、シーンに通知します
		assetIds: ["player"]
	});
	scene.onLoad.add(() => {
		// ここからゲーム内容を記述します

		// 各アセットオブジェクトを取得します
		const playerImageAsset = scene.asset.getImageById("player");

		// プレイヤーを生成します
		const player = new g.Sprite({
			scene: scene,
			src: playerImageAsset,
			width: playerImageAsset.width,
			height: playerImageAsset.height,
			x: Math.round(g.game.width / 2),
			y: Math.round(g.game.height / 2),
			anchorX: 0.5,
			anchorY: 0.5,
		});
		scene.append(player);

		const gameStickBackSize = 150; // バーチャルスティックの影の１辺の大きさ
		const gameStickSize = 100; // バーチャルスティック自体の１辺の大きさ
		const gameStick = new GameStickEntity({
			scene,
			area:{ x: 50, y: g.game.height - gameStickBackSize - 50, width : gameStickBackSize, height: gameStickBackSize },
			size:{ width: gameStickSize, height: gameStickSize },
			func:(offset) => {
				const speed = 10;
				let dx = Math.round(offset.x * speed);
				let dy = Math.round(offset.y * speed);
				// 場外には出ないように
				if (player.x + dx < 0 || player.x + dx > g.game.width) {
					dx = 0;
				}
				if (player.y + dy < 0 || player.y + dy > g.game.height) {
					dy = 0;
				}
				player.moveBy(dx, dy);
				player.modified();
			}
		});
		scene.append(gameStick);

		// ここまでゲーム内容を記述します
	});
	g.game.pushScene(scene);
}

export = main;

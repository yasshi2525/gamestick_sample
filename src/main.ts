function main(_param: g.GameMainParameterObject ): void {
	const scene = new g.Scene({
		game: g.game,
		// このシーンで利用するアセットのIDを列挙し、シーンに通知します
		assetIds: ["player", "game-stick"]
	});
	scene.onLoad.add(() => {
		// ここからゲーム内容を記述します

		// 各アセットオブジェクトを取得します
		const playerImageAsset = scene.asset.getImageById("player");
		const gameStickImageAsset = scene.asset.getImageById("game-stick");

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

		const gameStickBackSize = 150;
		const gameStickSize = 100;
		const gameStick = createGameStickEntity(
			scene,
			gameStickImageAsset,
			{ x: 50, y: g.game.height - gameStickBackSize - 50, width: gameStickBackSize, height: gameStickBackSize },
			{ width: gameStickSize, height: gameStickSize },
			(offset) => {
				const speed = 10;
				let dx = Math.round(offset.x * speed);
				let dy = Math.round(offset.y * speed);
				if (player.x + dx < 0 || player.x + dx > g.game.width) {
					dx = 0;
				}
				if (player.y + dy < 0 || player.y + dy > g.game.height) {
					dy = 0;
				}
				player.moveBy(dx, dy);
				player.modified();
			}
		);
		scene.append(gameStick);

		// ここまでゲーム内容を記述します
	});
	g.game.pushScene(scene);
}

function createGameStickEntity(
	scene: g.Scene,
	image: g.ImageAsset,
	area: g.CommonArea,
	size: g.CommonSize,
	func: (point: g.CommonOffset) => void
): g.E {
	const width = area.width > size.width ? area.width : size.width;
	const height = area.height > size.height ? area.height : size.height;
	const entity = new g.E({
		scene,
		x: area.x,
		y: area.y,
		width,
		height
	});
	const gameStickInitialX = Math.round(width / 2);
	const gameStickInitialY = Math.round(height / 2);
	const gameStickBack = new g.Sprite({
		scene,
		src: image,
		x: gameStickInitialX,
		y: gameStickInitialY,
		scaleX: width / image.width,
		scaleY: height / image.height,
		anchorX: 0.5,
		anchorY: 0.5,
		opacity: 0.5
	});
	entity.append(gameStickBack);
	const gameStick = new g.Sprite({
		scene,
		src: image,
		x: gameStickInitialX,
		y: gameStickInitialY,
		scaleX: size.width / image.width,
		scaleY: size.height / image.height,
		anchorX: 0.5,
		anchorY: 0.5,
		touchable: true
	});
	gameStick.onPointMove.add(ev => {
		let dx = ev.prevDelta.x;
		let dy = ev.prevDelta.y;
		if (gameStick.x + dx < 0 || gameStick.x + dx > width) {
			dx = 0;
		}
		if (gameStick.y + dy < 0 || gameStick.y + dy > height) {
			dy = 0;
		}
		gameStick.moveBy(dx, dy);
		gameStick.modified();
	});
	gameStick.onPointUp.add(_ev => {
		gameStick.moveTo(gameStickInitialX, gameStickInitialY);
		gameStick.modified();
	});
	gameStick.onUpdate.add(_ev => {
		func({ x: (gameStick.x - gameStickInitialX) / (width / 2), y: (gameStick.y - gameStickInitialY) / (height / 2) });
	});
	entity.append(gameStick);
	return entity;
}

export = main;

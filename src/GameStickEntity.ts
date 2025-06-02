/**
 * `GameStickEntity` のコンストラクタに渡すことができるパラメータ。
 */
export interface GameStickEntityParameterObject extends g.EParameterObject {
	/**
	 * バーチャルスティックとして利用する画像。
	 * 省略した場合、本拡張ライブラリデフォルトの画像が利用されます。
	 */
	image?: g.ImageAsset;
	/**
	 * バーチャルスティックの影を表示する領域。
	 *
	 * 指定すると `x`, `y`, `width`, `height` の値を上書きします。
	 *
	 * 省略時は `x`, `y`, `width`, `height` の値に設定されます。
	 * `width` と `height` の指定がないときは `image` の大きさに設定されます。
	 * `image` の設定がないときはデフォルトの画像の大きさに設定されます。
	 *
	 * `size` の大きさの方が大きい場合は、`size` の値を優先します。
	 */
	area?: g.CommonArea;
	/**
	 * バーチャルスティック自体の大きさ。
	 *
	 * 省略時は `image` の半分の大きさに設定されます。
	 * `image` の設定がないときはデフォルトの画像の半分の大きさに設定されます。
	 *
	 * `area` の大きさよりも大きい場合は、`area` の値を上書きします。
	 */
	size?: g.CommonSize;
	/**
	 * ゲームスティックの位置に連動する動作。ゲームスティックの位置を引数に毎フレーム呼び出されます。
	 *
	 * 第一引数 `point` の `x` と `y` は、ゲームスティックの初期位置を中心に -1 から +1 の値域に正規化された値が渡されます。
	 *
	 * @example
	 * ```typescript
	 * func: (point: g.CommonOffset) => {
	 * 	point.x; // -1 から +1 の値域
	 * 	point.y; // -1 から +1 の値域
	 * }
	 * ```
	 */
	func?: g.HandlerFunction<g.CommonOffset>;
}

/**
 * ゲームスティックエンティティ。
 *
 * 指定された画像をバーチャルスティックとして、薄くしたものを影として利用
 *
 * Original author: dera- (https://github.com/dera-)
 * Modified by: yasshi2525
 *
 * @author dera-
 * @author yasshi2525
 */
export class GameStickEntity extends g.E {
	/**
	 * ゲームスティックの位置を毎フレーム通知するイベント。
	 */
	readonly onStickUpdate: g.Trigger<g.CommonOffset>;

	constructor(param: GameStickEntityParameterObject) {
		if (param.area) {
			param.x = param.area.x;
			param.y = param.area.y;
			param.width = param.area.width;
			param.height = param.area.height;
		}
		if (param.size) {
			if (param.size.width > (param.width ?? 0)) {
				param.width = param.size.width;
			}
			if (param.size.height > (param.height ?? 0)) {
				param.height = param.size.height;
			}
		}
		if (param.image === undefined) {
			param.image = param.scene.asset.getImage("/node_modules/@yasshi2525/simple-game-stick/image/game-stick.default.png");
		}
		if (param.width === undefined) {
			param.width = param.image.width;
		}
		if (param.height === undefined) {
			param.height = param.image.height;
		}
		super(param);
		this.onStickUpdate = new g.Trigger<g.CommonOffset>();
		if (param.func) {
			this.onStickUpdate.add(param.func);
		}
		const gameStickInitialX = Math.round(this.width / 2);
		const gameStickInitialY = Math.round(this.height / 2);
		const gameStickBack = new g.Sprite({
			scene: this.scene,
			src: param.image,
			x: gameStickInitialX,
			y: gameStickInitialY,
			scaleX: this.width / param.image.width,
			scaleY: this.height / param.image.height,
			anchorX: 0.5,
			anchorY: 0.5,
			opacity: 0.5
		});
		this.append(gameStickBack);
		const gameStick = new g.Sprite({
			scene: this.scene,
			src: param.image,
			x: gameStickInitialX,
			y: gameStickInitialY,
			scaleX: (param.size?.width ?? this.width / 2) / param.image.width,
			scaleY: (param.size?.height ?? this.height / 2) / param.image.height,
			anchorX: 0.5,
			anchorY: 0.5,
			touchable: true
		});
		gameStick.onPointMove.add(ev => {
			let dx = ev.prevDelta.x;
			let dy = ev.prevDelta.y;
			if (gameStick.x + dx < 0 || gameStick.x + dx > this.width) {
				dx = 0;
			}
			if (gameStick.y + dy < 0 || gameStick.y + dy > this.height) {
				dy = 0;
			}
			gameStick.moveBy(dx, dy);
			gameStick.modified();
		});
		gameStick.onPointUp.add(_ev => {
			// スティックなので離されたら元の位置に戻る
			gameStick.moveTo(gameStickInitialX, gameStickInitialY);
			gameStick.modified();
		});
		gameStick.onUpdate.add(_ev => {
			// ゲームスティックの位置に連動する動作は関数呼び出し側にお任せする
			// こちら側でやることは、ゲームスティックの位置を-1~+1の値域に正規化したものを引数として渡すのみ
			this.onStickUpdate.fire({
				x: (gameStick.x - gameStickInitialX) / (this.width / 2),
				y: (gameStick.y - gameStickInitialY) / (this.height / 2)
			});
		});
		this.append(gameStick);
	}
}

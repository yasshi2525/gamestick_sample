import type {GameClient, GameContext} from "@akashic/headless-akashic";

/**
 * テストスクリプト内でのみ参照可能なグローバル変数
 */
declare global {
	var context: GameContext<3>;
	var client: GameClient<3>;
	var TMP_PATH: string;
	var SCREENSHOT_PATH: string;
}

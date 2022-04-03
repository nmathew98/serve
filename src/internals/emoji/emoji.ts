import { emoji } from "node-emoji";

export interface Emoji {
	/**
	 * Hourglass emoji
	 */
	hourglass: string;

	/**
	 * White check mark emoji
	 */
	whiteCheckMark: string;

	/**
	 * Rocket emoji
	 */
	rocket: string;
}

const Emoji: Emoji = {
	hourglass: emoji.hourglass,
	whiteCheckMark: emoji.white_check_mark,
	rocket: emoji.rocket,
};

export default Emoji;

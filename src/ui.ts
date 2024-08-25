import { MATCH, RENDERER, TEXT, TEXTURE } from "../types";

import { Game } from "./game";

import { Sound } from "./sound";

export class UI {
	renderer: RENDERER;
	boardTexture: TEXTURE;
	gameOverBackgroundTexture: TEXTURE;
	playBackgroundTexture: TEXTURE;
	restartTexture: TEXTURE;
	playTexture: TEXTURE;
	move: number = 0;
	score: number = 0;
	moveText: TEXT;

	scoreText: TEXT;
	scoreBoard: any;
	soundManager = new Sound();

	playBackground: any | null = null; // Allow null
	playText: TEXT | null = null; // Allow null
	playIcon: any | null = null; // Allow null
	game: Game;
	constructor(renderer: RENDERER, game: Game) {
		this.renderer = renderer;
		this.game = game;
	}
	async init() {
		this.boardTexture = await this.renderer.loadAsset(
			"public/ui/time_scores.png"
		);
		this.gameOverBackgroundTexture = await this.renderer.loadAsset(
			"public/assets/level1.png"
		);
		this.restartTexture = await this.renderer.loadAsset(
			"public/assets/restart-2.png"
		);

		this.playBackgroundTexture = await this.renderer.loadAsset(
			"public/ui/button.png"
		);
		this.playTexture = await this.renderer.loadAsset(
			"public/assets/play.png"
		);
	}
	createCounterBoard(gridPos: { x: number; y: number }, gridWidth: number) {
		const boardbg = this.renderer.createSprite(this.boardTexture);
		const margin = 50;
		const gridEnd = gridPos.x + gridWidth + margin;
		boardbg.position.set(gridEnd, gridPos.y + margin);
		boardbg.width = window.innerWidth - gridEnd - margin;
		boardbg.height = 200;
		const text = this.renderer.write(
			`Move : ${this.move}`,
			boardbg.position.x + boardbg.width / 2,
			boardbg.position.y + boardbg.height / 2
		);
		this.moveText = text;
		text.zIndex = 1;
		this.renderer.stage(boardbg, text);
	}
	createScoreBoard(gridPos: { x: number; y: number }) {
		const boardbg = this.renderer.createSprite(this.boardTexture);
		const margin = 50;
		boardbg.position.set(margin, gridPos.y + margin);
		boardbg.width = gridPos.x - 2 * margin;
		boardbg.height = 200;
		const text = this.renderer.write(
			`Score: ${this.score}`,
			boardbg.position.x + boardbg.width / 2 - 40,
			boardbg.position.y + boardbg.height / 2
		);
		this.scoreText = text;
		text.zIndex = 1;
		this.renderer.stage(boardbg, text);
	}

	createGameOverScreen() {
		const verticalOffset = 250;
		const gameOverBackground = this.renderer.createGameOverBackground(
			this.gameOverBackgroundTexture,
			600, // Width
			100, // Height
			verticalOffset
		);

		const gameOverText = this.renderer.createGameOverText(
			"Game Over",
			this.renderer.app.screen.width / 2,
			this.renderer.app.screen.height / 2 - verticalOffset
		);

		const restartIcon = this.renderer.createRestartButton(
			this.restartTexture,
			100, // Width
			100, // Height
			{
				x: this.renderer.app.screen.width / 2,
				y: this.renderer.app.screen.height / 2 + 150,
			},
			verticalOffset
		);

		restartIcon.on("pointerdown", this.onRestartClick.bind(this));

		this.renderer.stage(gameOverBackground, gameOverText, restartIcon);
	}
	onRestartClick() {
		this.soundManager.playSound("buttonClick");
		this.soundManager.setVolume("buttonClick", 0.1);
		location.reload(); // for now it just refreshes the page
	}
	createplayScreen() {
		const playBackground = this.renderer.createplayBackground(
			this.playBackgroundTexture,
			650	, // Width
			300 // Height
		);

		const playText = this.renderer.createplayText(
			"Play",
			this.renderer.app.screen.width / 2,
			this.renderer.app.screen.height / 2
		);

		const playIcon = this.renderer.createplayButton(
			this.playTexture,
			200, // Width
			200, // Height
			{
				x: this.renderer.app.screen.width / 2,
				y: this.renderer.app.screen.height / 2 + 300,
			}
		);

		this.renderer.bounce(playIcon, { amplitude: 20, speed: 0.1 });
		playIcon.on("pointerdown", this.onplayClick.bind(this));
		this.renderer.stage(playBackground, playText, playIcon);

		this.playBackground = playBackground;
		this.playText = playText;
		this.playIcon = playIcon;
	}

	onplayClick() {
		this.soundManager.playSound("buttonClick");
		this.soundManager.setVolume("buttonClick", 0.1);

		this.removePlayScreen(); // Remove the play screen

		this.game.startGameLoop();
		this.soundManager.playSound("backgroundMusic");
		this.soundManager.setVolume("backgroundMusic", 0.1);
	}
	removePlayScreen() {
		if (this.playBackground) {
			this.renderer.remove(this.playBackground);
			this.playBackground = null;
		}
		if (this.playText) {
			this.renderer.remove(this.playText);
			this.playText = null;
		}
		if (this.playIcon) {
			this.playIcon.off("pointerdown", this.onplayClick.bind(this)); // Remove event listener
			this.renderer.remove(this.playIcon);
			this.playIcon = null;
		}
	}

	updateMove(move: number) {
		this.move = move;
		this.moveText.text = `Move : ${move}`;
	}
	updateScore(matches: MATCH[]) {
		const scoreCount = matches.map(match => (match.count - 2) * 60);
		const score = scoreCount.reduce((acc, curr) => acc + curr, 0);
		this.score += score;
		this.scoreText.text = `Score :${this.score}`;
	}
	getMoveCount() {
		return this.move;
	}
}

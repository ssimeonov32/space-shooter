import { Application, Assets, Container, Sprite, Text } from "pixi.js";
import AssetLoader from "./asset-loader/asset-loader";
import Controller from "./controller/controller";
import Level from "./level";
import { Asteroid } from "./asteroid/asteroid";
import { getOffscreenSpawnPosition, isWithinBuffer } from "./helpers/helpers";
import { Bolt } from "./projectiles/bolt/bolt";
import {
  Direction,
  GameConfigEnum,
  KeyboardKey,
  MouseButton,
  SoundEffect,
} from "./constants";
import { AsteroidConfig } from "./types/asteroid";
import { Ship } from "./ship/ship";
import {
  rotatedRectCircleCollision,
  isPointInCircle,
} from "./helpers/collision-detection";
import { EntityManager } from "./entity-manager/entity-manager";
import { AudioManager } from "./audio/audio";
import { isInGameViewport, isOutsideGameViewport } from "./helpers/view";
import { textDict } from "./utils/i18";
import { ConfigManager } from "./config/config-manager";
import { ShipConfig } from "./types/ship";
import { ProjectileConfig } from "./types/projectile";
import { LevelConfig } from "./types/level";
import { HealthBar } from "./healthbar/healthbar";
import { HealthBarConfig } from "./types/health-bar/health-bar";

class SpaceShooterGame {
  private app: Application;

  private assetLoader: AssetLoader = new AssetLoader();

  private controller: Controller = new Controller();

  private boltFactory!: Bolt;

  private entityManager: EntityManager = new EntityManager();

  private audioManager: AudioManager = new AudioManager();

  private STARTING_NUMBER_OF_ASTEROIDS: number = 10;

  private MAX_NUMBER_OF_ASTEROIDS: number = 30;

  private POINTS_FOR_NEW_ASTEROIDS: number = 20;

  private number_of_asteroids: number = this.STARTING_NUMBER_OF_ASTEROIDS;

  private score: number = 0;

  private scoreboard!: Text;

  private gameHasStarted = false;

  private playerHasDied = false;

  private gameJoever = false;

  private lvl!: Container;

  private playerShipContainer!: Container;

  private configManager: ConfigManager = new ConfigManager();

  private healthBar!: HealthBar;
  constructor() {
    this.app = new Application();
  }

  private updateScore(update: number): void {
    this.score += update;
    this.scoreboard.text = `Score: ${this.score}`;
    this.updateMaxNumberOfAsteroids();
  }

  private async initializeAssetsAndConfigs() {
    await this.assetLoader.loadAudioAssets();

    const font = new FontFace("nicoMoji", `url(${import.meta.env.BASE_URL}/assets/fonts/NicoMoji-Regular.ttf)`);
    await font.load();
    document.fonts.add(font);

    const battleCruiserConfig = await this.assetLoader.loadShip("battle-cruiser");
    const asteroidConfig = await this.assetLoader.loadAsteroidAssets();
    const boltConfig = await this.assetLoader.loadProjectile("bolt");
    const planetConfig = await this.assetLoader.loadPlanetAssets();
    const hpConfigs = await this.assetLoader.loadHealthBarAssets();

    if (!hpConfigs) {
      console.error("Health point configurations not loaded.");
      return;
    }
    const healthPointConfig = hpConfigs.healthPointConfig;
    const healthBarConfig = hpConfigs.healthBarConfig;

    if (!battleCruiserConfig) {
      console.error("Battle Cruiser configuration not loaded.");
      return;
    }

    if (!asteroidConfig) {
      console.error("Asteroid configuration not loaded.");
      return;
    }

    if (!asteroidConfig) {
      console.error("Asteroid configuration not loaded.");
      return;
    }

    if (!boltConfig) {
      console.error("Bolt configuration not loaded.");
      return;
    }

    if (!planetConfig) {
      console.error("Planet configuration not loaded.");
      return;
    }

    this.configManager.setConfig(GameConfigEnum.BATTLE_CRUISER, battleCruiserConfig);
    this.configManager.setConfig(GameConfigEnum.ASTEROID, asteroidConfig);
    this.configManager.setConfig(GameConfigEnum.BOLT, boltConfig);
    this.configManager.setConfig(GameConfigEnum.PLANET, planetConfig);
    this.configManager.setConfig(GameConfigEnum.HEALTH_BAR, healthBarConfig);
    this.configManager.setConfig(GameConfigEnum.HEALTH_POINT, healthPointConfig);
  }

  public async initializeGame() {
    document.getElementById("game-container")?.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    await this.app.init({ background: "#000", resizeTo: window });
    document.getElementById("game-container")!.appendChild(this.app.canvas);

    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.sortableChildren = true;

    await this.initializeAssetsAndConfigs();

    this.registerEventListeners();

    const healthBar = new HealthBar(this.configManager);

    this.healthBar = healthBar;
    healthBar.x = this.app.screen.width - healthBar.width / 2;
    healthBar.y = 18; 
    healthBar.updateHealthBarDamage(0);

    this.app.stage.addChild(healthBar);

    this.scoreboard = this.generateScoreText();

    const boltConfig = this.configManager.getConfig<ProjectileConfig>(GameConfigEnum.BOLT);
    this.boltFactory = new Bolt(boltConfig,this.entityManager.addBoltEntity.bind(this.entityManager));

    const planetConfig = this.configManager.getConfig<LevelConfig>(GameConfigEnum.PLANET);

    const asteroidConfig = this.configManager.getConfig<AsteroidConfig>(GameConfigEnum.ASTEROID);

    const level = new Level(planetConfig);
    const lvl = level.generateLevel();
    this.lvl = lvl;
    lvl.anchor.set(0.5);
    lvl.position.set(this.app.screen.width / 2.6, this.app.screen.height / 2.3);
    lvl.scale.set(3);

    this.generatePlayerShip();

    const startGameText = this.generateStartGameText();
    startGameText.anchor = 0.5;
    startGameText.position.set(
      this.app.screen.width / 2,
      this.app.screen.height / 2
    );
    startGameText.eventMode = "static";
    startGameText.cursor = "pointer";
    if (!this.gameHasStarted) {
      startGameText.on("mousedown", () => {
        this.startGame(true);
      });
      this.app.stage.addChild(startGameText);
    }

    this.app.ticker.maxFPS = 60;

    this.app.ticker.add((time) => {
      const playerShip = this.entityManager.getPlayerShipEntity();
      if (!playerShip) return;

      if (!this.gameHasStarted) return;

      if (this.playerHasDied) {
        if (this.gameJoever) return;

        const gameOverContainer = this.generateGameOverContainer();
        gameOverContainer.x = this.app.screen.width / 2;
        gameOverContainer.y = this.app.screen.height / 2;
        this.app.stage.addChild(gameOverContainer);
        this.gameJoever = true;
        Object.values(this.entityManager.getAsteroidEntities()).forEach(
          (asteroid: Asteroid) => {
            this.app.stage.removeChild(asteroid);
          }
        );
        this.entityManager.removeAllAsteroidEntities();
        return;
      }

      this.app.stage.removeChild(startGameText);
      const keys = this.controller.getKeys();

      const mousePosition = this.app.renderer.events.pointer.screen;

      playerShip.followPoint(mousePosition.x, mousePosition.y);

      if (
        isWithinBuffer({ x: playerShip.x, y: playerShip.y }, mousePosition, 10)
      ) {
      } else {
        if (keys[KeyboardKey.A]) {
          playerShip.moveShip(
            this.app.screen.width,
            this.app.screen.height,
            Direction.LEFT,
            time.deltaTime
          );
          playerShip.toggleShipEngines(true);
        }
        if (keys[KeyboardKey.D]) {
          playerShip.moveShip(
            this.app.screen.width,
            this.app.screen.height,
            Direction.RIGHT,
            time.deltaTime
          );
          playerShip.toggleShipEngines(true);
        }
        if (keys[KeyboardKey.W]) {
          playerShip.moveShip(
            this.app.screen.width,
            this.app.screen.height,
            Direction.UP,
            time.deltaTime
          );
          playerShip.toggleShipEngines(true);
        }
        if (keys[KeyboardKey.S]) {
          playerShip.moveShip(
            this.app.screen.width,
            this.app.screen.height,
            Direction.DOWN,
            time.deltaTime
          );
          playerShip.toggleShipEngines(true);
        }
      }

      if (Object.values(keys).every((value) => !value)) {
        playerShip.toggleShipEngines(false);
      }

      if (keys[MouseButton.LEFT]) {
        playerShip.shoot();
      }

      if (keys[MouseButton.RIGHT]) {
        this.audioManager.play(SoundEffect.SHIELD, {
          speed: Math.random() * 0.2 + 0.9,
          loop: true,
        });
        playerShip.toggleShipShield(true);
      } else {
        this.audioManager.stop(SoundEffect.SHIELD);
        playerShip.toggleShipShield(false);
      }

      const numOfAsteroids = Object.values(
        this.entityManager.getAsteroidEntities()
      ).length;
      if (numOfAsteroids < this.number_of_asteroids) {
        for (let i = 0; i < this.number_of_asteroids - numOfAsteroids; i++) {
          this.createAsteroid(this.playerShipContainer);
        }
      }

      Object.values(this.entityManager.getAsteroidEntities()).forEach(
        (asteroid: Asteroid) => {
          asteroid.moveAsteroid(time.deltaTime);
          asteroid.rotateAsteroid(time.deltaTime, Math.random() * 0.02 + 0.01);

          if (
            isInGameViewport(
              asteroid.x,
              asteroid.y,
              this.app.screen.width,
              this.app.screen.height
            )
          ) {
            asteroid.updateVisibility();
          }

          if (
            isOutsideGameViewport(
              asteroid.x,
              asteroid.y,
              this.app.screen.width,
              this.app.screen.height
            )
          ) {
            if (!asteroid.getHasEnteredView()) return;
            this.entityManager.removeAsteroidEntity(asteroid.uid);
            this.app.stage.removeChild(asteroid);
            this.createAsteroid(this.playerShipContainer);
          }

          const asteroidHitBox = asteroid.getHitBox();
          const asteroidHitBoxPosition = asteroidHitBox.getGlobalPosition();
          const playerShipHitBox = playerShip.getHitBox();
          const playerShipHitBoxPosition = playerShipHitBox.getGlobalPosition();

          if (!asteroid.getIsDestroyed()) {
            if (
              rotatedRectCircleCollision(
                asteroidHitBoxPosition.x,
                asteroidHitBoxPosition.y,
                asteroidConfig.hitBoxRadius,
                playerShipHitBoxPosition.x,
                playerShipHitBoxPosition.y,
                playerShipHitBox.width,
                playerShipHitBox.height,
                playerShip.rotation
              )
            ) {
              asteroid.destroyAsteroid(this.app.stage);
              playerShip.updateHealthPoints(-asteroid.getDamage());
            }
          }
        }
      );

      Object.values(this.entityManager.getBoltEntities()).forEach((bolt) => {
        if (!bolt.rendered) {
          bolt.sprite.rotation = this.playerShipContainer.rotation;
          this.app.stage.addChild(bolt.sprite);
          bolt.sprite.zIndex = 1;
          bolt.rendered = true;
          this.audioManager.play(SoundEffect.LASER, {
            volume: 0.05,
            speed: Math.random() * 0.2 + 0.9,
          });
        }
        const angle = bolt.sprite.rotation - Math.PI / 2;
        const deltaX = Math.cos(angle) * boltConfig.speed * time.deltaTime;
        const deltaY = Math.sin(angle) * boltConfig.speed * time.deltaTime;
        bolt.sprite.x += deltaX;
        bolt.sprite.y += deltaY;

        Object.values(this.entityManager.getAsteroidEntities()).forEach(
          (asteroid: Asteroid) => {
            const hitBox = asteroid.getHitBox();
            const hitBoxPosition = hitBox.getGlobalPosition();

            if (
              isPointInCircle(
                bolt.sprite.x,
                bolt.sprite.y,
                hitBoxPosition.x,
                hitBoxPosition.y,
                asteroidConfig.hitBoxRadius
              )
            ) {
              this.app.stage.removeChild(bolt.sprite);
              this.entityManager.removeBoltEntity(bolt.uid);
              asteroid.updateHealthPoints(-boltConfig.damage);
              this.audioManager.play(
                Math.random() * 10 < 5
                  ? SoundEffect.ASTEROID_HIT
                  : SoundEffect.ASTEROID_HIT_TWO,
                {
                  volume: 2,
                  speed: Math.random() * 0.2 + 0.9,
                }
              );
            }
          }
        );

        if (
          isOutsideGameViewport(
            bolt.sprite.x,
            bolt.sprite.y,
            this.app.screen.width,
            this.app.screen.height
          )
        ) {
          this.app.stage.removeChild(bolt.sprite);
          this.entityManager.removeBoltEntity(bolt.uid);
        }
      });
    });
  }

  private updateMaxNumberOfAsteroids(): void {
    if (this.score < this.POINTS_FOR_NEW_ASTEROIDS) return;
    if (this.number_of_asteroids === this.MAX_NUMBER_OF_ASTEROIDS) return;
    this.number_of_asteroids =
      this.STARTING_NUMBER_OF_ASTEROIDS +
      Math.floor(this.score / this.POINTS_FOR_NEW_ASTEROIDS);
  }

  private generatePlayerShip(): void {
    const battleCruiserConfig = this.configManager.getConfig<ShipConfig>(
      GameConfigEnum.BATTLE_CRUISER
    );
    if (!battleCruiserConfig) return;

    const playerShip = new Ship(
      battleCruiserConfig,
      this.audioManager,
      this.healthBar,
      this.boltFactory.createBolt.bind(this.boltFactory),
      this.updatePlayerHasDied.bind(this)
    );
    this.entityManager.setPlayerShipEntity(playerShip);
    const playerShipContainer = playerShip.createShipContainer();
    this.playerShipContainer = playerShipContainer;
    playerShipContainer.x = this.app.screen.width / 2;
    playerShipContainer.y = this.app.screen.height / 2;
    playerShipContainer.zIndex = 2;
  }

  private generateScoreText(): Text {
    return new Text({
      text: `${textDict.SCORE} ${this.score}`,
      style: {
        fontFamily: "NicoMoji",
        fill: 0xffffff,
        fontSize: 24,
        fontWeight: "500",
      },
    });
  }

  private generateRestartText(): Text {
    return new Text({
      text: `${textDict.RESTART}`,
      style: {
        fontFamily: "NicoMoji",
        fill: 0xffffff,
        fontSize: 24,
        fontWeight: "500",
      },
    });
  }

  private generateGameOverText(): Text {
    return new Text({
      text: `${textDict.GAME_OVER}`,
      style: {
        fontFamily: "NicoMoji",
        fill: 0xffffff,
        fontSize: 24,
        fontWeight: "500",
      },
    });
  }

  private generateStartGameText(): Text {
    return new Text({
      text: `${textDict.START_GAME}`,
      style: {
        fontFamily: "NicoMoji",
        fill: 0xffffff,
        fontSize: 24,
        fontWeight: "500",
      },
    });
  }

  private generateGameOverContainer(): Container {
    const gameOverContainer = new Container();
    const gameOverText = this.generateGameOverText();
    const scoreText = this.generateScoreText();
    const restartText = this.generateRestartText();

    gameOverText.anchor.set(0.5);
    gameOverText.y = -70;
    gameOverContainer.addChild(gameOverText);

    scoreText.anchor.set(0.5);
    scoreText.y = -30;
    gameOverContainer.addChild(scoreText);

    restartText.anchor.set(0.5);
    restartText.y = 10;
    restartText.eventMode = "static";
    restartText.cursor = "pointer";
    restartText.on("pointerdown", () => {
      this.restartGame();
    });

    gameOverContainer.addChild(restartText);
    return gameOverContainer;
  }

  private restartGame() {
    this.score = 0;
    this.number_of_asteroids = this.STARTING_NUMBER_OF_ASTEROIDS;
    this.playerHasDied = false;
    this.gameHasStarted = false;
    this.gameJoever = false;
    this.app.stage.removeChildren();
    this.generatePlayerShip();
    this.entityManager.removeAllAsteroidEntities();
    this.startGame(true);
  }

  private updatePlayerHasDied(bool: boolean): void {
    this.playerHasDied = bool;
  }

  private startGame(startGame: boolean) {
    if (!this.gameHasStarted && startGame) {
      this.app.stage.addChild(this.lvl);
      this.app.stage.addChild(this.playerShipContainer);
      this.gameHasStarted = true;
      this.createAsteroids();
      this.scoreboard = this.generateScoreText();
      this.app.stage.addChild(this.scoreboard);
    }
  }

  private createAsteroid(playerShip?: Container): void {
    const asteroidConfig = this.configManager.getConfig<AsteroidConfig>(
      GameConfigEnum.ASTEROID
    );
    if (!asteroidConfig) {
      console.error("Asteroid configuration not loaded.");
      return;
    }
    const asteroid = new Asteroid(
      asteroidConfig,
      this.audioManager,
      this.entityManager,
      this.updateScore.bind(this)
    );

    const { x, y } = getOffscreenSpawnPosition(
      this.app.screen.width,
      this.app.screen.height
    );
    asteroid.x = x;
    asteroid.y = y;

    asteroid.rotation = Math.random() * Math.PI * 2;

    if (playerShip) {
      asteroid.setDirectionToward(playerShip.x, playerShip.y, 2);
    } else {
      asteroid.setDirectionToward(
        Math.random() * this.app.screen.width,
        Math.random() * this.app.screen.height,
        1
      );
    }

    this.app.stage.addChild(asteroid);
    this.entityManager.addAsteroidEntity(asteroid);
  }

  private createAsteroids(playerShip?: Container): void {
    for (let i = 0; i < this.number_of_asteroids; i++) {
      this.createAsteroid(playerShip);
    }
  }

  private registerEventListeners() {
    this.app.stage.on("pointerdown", (event) => {
      if (event.button === 0) {
        this.controller.setKey(MouseButton.LEFT, true);
      }
      if (event.button === 2) {
        this.controller.setKey(MouseButton.RIGHT, true);
      }
    });

    this.app.stage.on("pointerup", (event) => {
      if (event.button === 0) {
        this.controller.setKey(MouseButton.LEFT, false);
      }
      if (event.button === 2) {
        this.controller.setKey(MouseButton.RIGHT, false);
      }
    });
  }
}

(async () => {
  const game = new SpaceShooterGame();
  await game.initializeGame();
})();

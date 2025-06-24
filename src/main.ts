import { Application, Container } from "pixi.js";
import AssetLoader from "./asset-loader/asset-loader";
import Controller from "./controller/controller";
import Level from "./level";
import { Asteroid } from "./asteroid/asteroid";
import { getOffscreenSpawnPosition, isWithinBuffer } from "./helpers/helpers";
import { Bolt } from "./projectiles/bolt/bolt";
import { Directions, KeyboardKeys, MouseButtons, SoundEffects } from "./constants";
import { AsteroidConfig } from "./types/asteroid";
import { Ship } from "./ship/ship";
import { rotatedRectCircleCollision, isPointInCircle } from "./helpers/collision-detection";
import { EntityManager } from "./entity-manager/entity-manager";
import { AudioManager } from "./audio/audio";
import { isInGameViewport, isOutsideGameViewport } from "./helpers/view";

class SpaceShooterGame {
  private app: Application;

  private controller: Controller = new Controller();

  private assetLoader!: AssetLoader;

  private boltFactory!: Bolt;

  private asteroidConfig!: AsteroidConfig;

  private entityManager: EntityManager = new EntityManager();

  private audioManager: AudioManager = new AudioManager();

  private NUMBER_OF_ASTEROIDS: number = 10;

  constructor() {
    this.app = new Application();
  }

  public async initializeGame() {
    document.getElementById("game-container")?.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    await this.app.init({ background: "#000", resizeTo: window, });
    document.getElementById("game-container")!.appendChild(this.app.canvas);

    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.sortableChildren = true;

    await this.loadAssets();

    this.registerEventListeners();

    const battleCruiserConfig = await this.assetLoader.loadShip("battle-cruiser");
    const fighterConfig = await this.assetLoader.loadShip("fighter");
    const asteroidConfig = await this.assetLoader.loadAsteroidAssets();
    const boltConfig = await this.assetLoader.loadProjectile("bolt");
    const planetConfig = await this.assetLoader.loadPlanetAssets();

    if (!battleCruiserConfig) {
      console.error("Battle Cruiser configuration not loaded.");
      return;
    }

    if (!fighterConfig) {
      console.error("Fighter configuration not loaded.");
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

    this.asteroidConfig = asteroidConfig;

    this.boltFactory = new Bolt(boltConfig, this.entityManager.addBoltEntity.bind(this.entityManager));

    // Level generation
    const level = new Level(planetConfig);
    const lvl = level.generateLevel();
    lvl.anchor.set(0.5);
    lvl.position.set(this.app.screen.width / 2.6, this.app.screen.height / 2.3);
    lvl.scale.set(3);
    this.app.stage.addChild(lvl);


    // Player ship creation
    const playerShip = new Ship(battleCruiserConfig, this.audioManager, this.boltFactory.createBolt.bind(this.boltFactory));
    const playerShipContainer = playerShip.createShipContainer();

    playerShipContainer.x = this.app.screen.width / 2;
    playerShipContainer.y = this.app.screen.height / 2;
    playerShipContainer.zIndex = 2;
    
    this.app.stage.addChild(playerShipContainer);

    this.createAsteroids();
    
    this.app.ticker.maxFPS = 60;  
    this.app.ticker.add((time) => {
      const keys = this.controller.getKeys();

      const mousePosition = this.app.renderer.events.pointer.screen;
      playerShip.followPoint(mousePosition.x, mousePosition.y);

      if (isWithinBuffer({ x: playerShip.x, y: playerShip.y }, mousePosition, 10)) {
      } else {
        if (keys[KeyboardKeys.A]) {
          playerShip.moveShip(
            this.app.screen.width,
            this.app.screen.height,
            Directions.LEFT,
            time.deltaTime
          );
          playerShip.toggleShipEngines(true);
        }
        if (keys[KeyboardKeys.D]) {
          playerShip.moveShip(
            this.app.screen.width,
            this.app.screen.height,
            Directions.RIGHT,
            time.deltaTime
          );
          playerShip.toggleShipEngines(true);
        }
        if (keys[KeyboardKeys.W]) {
          playerShip.moveShip(
            this.app.screen.width,
            this.app.screen.height,
            Directions.UP,
            time.deltaTime
          );
          playerShip.toggleShipEngines(true);
        }
        if (keys[KeyboardKeys.S]) {
          playerShip.moveShip(
            this.app.screen.width,
            this.app.screen.height,
            Directions.DOWN,
            time.deltaTime
          );
          playerShip.toggleShipEngines(true);
        }
      }

      if (Object.values(keys).every((value) => !value)) {
        playerShip.toggleShipEngines(false);
      }

      if (keys[MouseButtons.LEFT]) {
        playerShip.shoot();
      }

      if (keys[MouseButtons.RIGHT]) {
        this.audioManager.play(SoundEffects.SHIELD, {
          speed: Math.random() * 0.2 + 0.9,
          loop: true,
        });
        playerShip.toggleShipShield(true);
      } else {
        this.audioManager.stop(SoundEffects.SHIELD);
        playerShip.toggleShipShield(false);
      }

      const numOfAsteroids = Object.values(this.entityManager.getAsteroidEntities()).length;
      if (numOfAsteroids < this.NUMBER_OF_ASTEROIDS) {
        for (let i = 0; i < this.NUMBER_OF_ASTEROIDS - numOfAsteroids; i++) {
          this.createAsteroid(playerShipContainer);
        }
      }

      Object.values(this.entityManager.getAsteroidEntities()).forEach((asteroid: Asteroid) => {
        asteroid.moveAsteroid(time.deltaTime);
        asteroid.rotateAsteroid(time.deltaTime, Math.random() * 0.02 + 0.01);

        if (isInGameViewport(asteroid.x, asteroid.y, this.app.screen.width, this.app.screen.height)) {
          asteroid.updateVisibility();
        }

        if (isOutsideGameViewport(asteroid.x, asteroid.y, this.app.screen.width, this.app.screen.height)) {
          if (!asteroid.getHasEnteredView()) return;
          this.entityManager.removeAsteroidEntity(asteroid.uid);
          this.app.stage.removeChild(asteroid);
          this.createAsteroid(playerShipContainer);
        }

        const asteroidHitBox = asteroid.getHitBox();
        const asteroidHitBoxPosition = asteroidHitBox.getGlobalPosition();
        const playerShipHitBox = playerShip.getHitBox();
        const playerShipHitBoxPosition = playerShipHitBox.getGlobalPosition();

        if (!asteroid.getIsDestroyed()) {
          if (rotatedRectCircleCollision(
            asteroidHitBoxPosition.x,
            asteroidHitBoxPosition.y,
            asteroidConfig.hitBoxRadius,
            playerShipHitBoxPosition.x,
            playerShipHitBoxPosition.y,
            playerShipHitBox.width,
            playerShipHitBox.height,
            playerShip.rotation
          )) {
            asteroid.destroyAsteroid(this.app.stage);
            playerShip.updateHealthPoints(-asteroid.getDamage());
          }
        }
      })

      Object.values(this.entityManager.getBoltEntities()).forEach((bolt) => {
        if (!bolt.rendered) {
          bolt.sprite.rotation = playerShipContainer.rotation;
          this.app.stage.addChild(bolt.sprite);
          bolt.sprite.zIndex = 1;
          bolt.rendered = true;
          this.audioManager.play(SoundEffects.LASER, {
            volume: 0.05,
            speed: Math.random() * 0.2 + 0.9,
          })
        }
        const angle = bolt.sprite.rotation - Math.PI / 2;
        const deltaX = Math.cos(angle) * boltConfig.speed * time.deltaTime;
        const deltaY = Math.sin(angle) * boltConfig.speed * time.deltaTime;
        bolt.sprite.x += deltaX;
        bolt.sprite.y += deltaY;

        Object.values(this.entityManager.getAsteroidEntities()).forEach((asteroid: Asteroid) => {
          const hitBox = asteroid.getHitBox();
          const hitBoxPosition = hitBox.getGlobalPosition();

          if (isPointInCircle(bolt.sprite.x, bolt.sprite.y, hitBoxPosition.x, hitBoxPosition.y, asteroidConfig.hitBoxRadius)) {
            this.app.stage.removeChild(bolt.sprite);
            this.entityManager.removeBoltEntity(bolt.uid);
            asteroid.updateHealthPoints(-boltConfig.damage);
            this.audioManager.play(Math.random() * 10 < 5 ? SoundEffects.ASTEROID_HIT : SoundEffects.ASTEROID_HIT_TWO, {
              volume: 2,
              speed: Math.random() * 0.2 + 0.9,
            });
          }
        })

        if (isOutsideGameViewport(bolt.sprite.x, bolt.sprite.y, this.app.screen.width, this.app.screen.height)) {
          this.app.stage.removeChild(bolt.sprite);
          this.entityManager.removeBoltEntity(bolt.uid);
        }
      })
    })
  }

  private async loadAssets() {
    this.assetLoader = new AssetLoader();
    await this.assetLoader.loadAudioAssets();
  }

  private createAsteroid(playerShip?: Container): void {
    const asteroid = new Asteroid(this.asteroidConfig, this.audioManager, this.entityManager);

    const { x, y } = getOffscreenSpawnPosition(this.app.screen.width, this.app.screen.height);
    asteroid.x = x;
    asteroid.y = y;

    asteroid.rotation = Math.random() * Math.PI * 2;

    if (playerShip) {
      asteroid.setDirectionToward(playerShip.x, playerShip.y, 2);
    } else {
      asteroid.setDirectionToward(Math.random() * this.app.screen.width, Math.random() * this.app.screen.height, 1);
    }

    this.app.stage.addChild(asteroid);
    this.entityManager.addAsteroidEntity(asteroid);
  }

  private createAsteroids(playerShip?: Container): void {
    for (let i = 0; i < this.NUMBER_OF_ASTEROIDS; i++) {
      this.createAsteroid(playerShip);
    }
  }

  private registerEventListeners() {
    this.app.stage.on('pointerdown', (event) => {
      if (event.button === 0) {
        this.controller.setKey(MouseButtons.LEFT, true);
      }
      if (event.button === 2) {
        this.controller.setKey(MouseButtons.RIGHT, true);
      }
    });

    this.app.stage.on('pointerup', (event) => {
      if (event.button === 0) {
        this.controller.setKey(MouseButtons.LEFT, false);
      }
      if (event.button === 2) {
        this.controller.setKey(MouseButtons.RIGHT, false);
      }
    });
  }
}

(async () => {
  const game = new SpaceShooterGame()
  await game.initializeGame();
})()

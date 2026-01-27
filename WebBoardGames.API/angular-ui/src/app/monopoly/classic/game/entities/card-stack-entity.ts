import * as PIXI from 'pixi.js';
import { GameEntity } from 'app/engine';
import { Card } from '../../models/cards';
import { CENTER_SIZE, UI_SCALE } from './constants';
import { Board } from '../../models/board';
import { CardEntity, CardType } from './card-entity';
import { SimpleAnimation } from 'app/engine/animation/simple-animation';
import { BoardEntity } from './board-entity';
import { environment } from 'environments/environment';

export class CardStackEntity extends GameEntity {
  private readonly _cardWidth = 170 * UI_SCALE;
  private readonly _cardHeight = 100 * UI_SCALE;

  private readonly _board: Board = new Board();
  private readonly _stackType: CardType;
  private readonly _originalCards: Card[];

  private _cardsInStack: Card[] = [];
  private _mappedCards: Map<Card, CardEntity> = new Map();
  private _canDrawCard: boolean = false;
  private _waitForDrawCardActivation: boolean = false;

  constructor(board: Board, stackType: CardType, originalCards: Card[]) {
    super();
    this._board = board;
    this._stackType = stackType;
    this._originalCards = originalCards;
    this._shuffleCards();
  }

  get stackType(): CardType {
    return this._stackType;
  }

  override onInitializeOverride(): void {
    (async () => {
      await this._createCardStackGraphics();

      (this.parent as BoardEntity).enqueueModelAnimation(
        this._createSchuffleAnimation(this._stackType, this._originalCards),
      );
    })();
  }

  public drawCard(drawIndex: number = -1, autoCloseCard: boolean = false): Card | null {
    if (this._waitForDrawCardActivation) {
      // TODO: Only for now, actually the correct user must interact with this card to continue
      this._waitForDrawCardActivation = false;
      return null;
    }
    if (!this._canDrawCard) {
      return null;
    }
    if (this._cardsInStack.length === 0) {
      throw new Error('No cards left in the stack - this should not happen!!');
    }
    if (drawIndex >= 0) {
      while (drawIndex < this._cardsInStack.length - 1) {
        this._cardsInStack.pop();
      }
    }
    const drawnCard = this._cardsInStack.pop()!;
    const cardEntity = this._mappedCards.get(drawnCard);
    if (cardEntity) {
      this.removeChild(cardEntity);
      this._mappedCards.delete(drawnCard);
      (this.parent as BoardEntity).enqueueModelAnimation(
        this._createDrawCardAnimation(drawnCard, autoCloseCard),
      );
    }
    if (this._cardsInStack.length === 0) {
      this._shuffleCards();
      (async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await this._createCardStack();
        (this.parent as BoardEntity).enqueueModelAnimation(
          this._createSchuffleAnimation(this._stackType, this._originalCards),
        );
      })();
    }
    return drawnCard;
  }

  private _shuffleCards(): void {
    this._cardsInStack = [...this._originalCards];
    for (let i = this._cardsInStack.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this._cardsInStack[i], this._cardsInStack[j]] = [
        this._cardsInStack[j],
        this._cardsInStack[i],
      ];
    }
  }

  private async _createCardStackGraphics(): Promise<void> {
    this._canDrawCard = false;
    this.rotationDegrees = this.stackType === 'chance' ? -45 : 135;

    const rect = new PIXI.Graphics()
      .rect(0, 0, this._cardWidth, this._cardHeight)
      .fill(this.stackType == 'chance' ? 0xcc6a2e : 0x369dc6)
      .stroke({ width: 2 * UI_SCALE, color: 0x000000, alignment: 1 });
    rect.pivot.x = rect.width / 2;
    rect.pivot.y = rect.height / 2;
    this.container.addChild(rect);

    const tex = await PIXI.Assets.load(`images/monopoly/${this.stackType}.svg`);
    const sprite = new PIXI.Sprite(tex);
    const aspect = sprite.width / sprite.height;
    sprite.height = 80 * UI_SCALE;
    sprite.width = sprite.height * aspect;
    sprite.anchor.set(0.5);
    this.container.addChild(sprite);

    await this._createCardStack();
  }

  private async _createCardStack(): Promise<void> {
    for (let i = 0; i < this._cardsInStack.length; i++) {
      const card = this._cardsInStack[i];
      const offsetX = (Math.random() - 0.5) * 8 * UI_SCALE;
      const offsetY = (Math.random() - 0.5) * 8 * UI_SCALE;
      const offsetRotation = (Math.random() - 0.5) * 8;

      const cardEntity = new CardEntity(this._board, this._stackType, card);
      cardEntity.container.alpha = 0;
      cardEntity.container.scale.set(0.8 + i * 0.007);
      cardEntity.container.x = offsetX;
      cardEntity.container.y = offsetY;
      cardEntity.container.rotation = (offsetRotation * Math.PI) / 180;
      this._mappedCards.set(card, cardEntity);
      this.addChild(cardEntity);
    }
  }

  private _createDrawCardAnimation(drawnCard: Card, autoCloseCard: boolean): SimpleAnimation {
    this._canDrawCard = false;
    const animation = new SimpleAnimation();
    const entity = new CardEntity(this._board, this._stackType, drawnCard);
    const targetScale = 0.8 + this._cardsInStack.length * 0.007;
    entity.container.scale.set(targetScale);
    this.addChild(entity);
    const targetY = -(CENTER_SIZE / 2) + 36 * UI_SCALE;
    const targetRotation = -135;
    animation
      .addSimple((_, delta) => {
        entity.Y -= 10 * UI_SCALE * delta;
        if (entity.Y <= targetY) {
          entity.rotationDegrees = targetRotation;
          entity.Y = targetY;
          return true;
        }
        entity.rotationDegrees = Math.abs(entity.Y / targetY) * targetRotation;
        return false;
      })
      .addSimple((_, delta) => {
        entity.container.scale.x -= 0.2 * delta;
        if (entity.container.scale.x <= 0.01) {
          entity.container.scale.x = 0;
          entity.flip();
          return true;
        }
        return false;
      })
      .addSimple((_, delta) => {
        entity.container.scale.x += 0.2 * delta;
        if (entity.container.scale.x >= targetScale) {
          entity.container.scale.x = targetScale;
          return true;
        }
        return false;
      })
      .addSimple((_, delta) => {
        entity.container.scale.x += 0.1 * delta;
        entity.container.scale.y += 0.1 * delta;
        if (entity.container.scale.x >= 2) {
          entity.container.scale.x = 2;
          entity.container.scale.y = 2;
          this._waitForDrawCardActivation = autoCloseCard ? false : true;
          return true;
        }
        return false;
      })
      .addSimple((ctx, __) => {
        if (autoCloseCard) {
          return ctx.deltaMsForStep >= 2000;
        }
        return !this._waitForDrawCardActivation;
      })
      .addSimple((_, delta) => {
        entity.container.alpha -= 0.2 * delta;
        if (entity.container.alpha <= 0) {
          entity.container.alpha = 0;
          return true;
        }
        return false;
      });
    animation.done(() => {
      this.removeChild(entity);
      this._canDrawCard = true;
    });
    return animation;
  }

  private _createSchuffleAnimation(cardType: CardType, cardStack: Card[]): SimpleAnimation {
    if (!environment.production) {
      return new SimpleAnimation().addSimple(() => {
        for (const card of this._cardsInStack) {
          const cardEntity = this._mappedCards.get(card);
          cardEntity!.container.alpha = 1;
        }
        this._canDrawCard = true;
        return true;
      });
    }
    const randOffsetRotation = 6;

    const tmpCardsContainer = new PIXI.Container();

    tmpCardsContainer.rotation = -this.container.rotation;
    tmpCardsContainer.y = -(CENTER_SIZE / 2) + 36 * UI_SCALE;

    this.container.addChild(tmpCardsContainer);
    const tmpCards: CardEntity[] = [];
    for (const card of cardStack) {
      const tmpCard = new CardEntity(this._board, cardType, card)
        .withPosition(0, 0)
        .withRotationDegrees(-90 + Math.random() * randOffsetRotation - randOffsetRotation / 2);
      tmpCardsContainer.addChild(tmpCard.container);
      tmpCard.onInitialize();
      tmpCards.push(tmpCard);
      tmpCard.container.alpha = 0;
    }

    var shuffleSpeed1 = 10;
    var shuffleSpeed2 = 20;
    const animation = new SimpleAnimation();
    for (let i = 0; i < 2; i++) {
      const range: CardEntity[] = [];
      for (let c = 0; c < tmpCards.length / 2; c++) {
        range.push(tmpCards[(i * (tmpCards.length / 2) + c) % tmpCards.length]);
      }
      animation
        .addSimple((_, delta) => {
          for (const card of tmpCards) {
            card.container.alpha += 0.03 * delta;
            if (card.container.alpha >= 1) {
              card.container.alpha = 1;
            }
          }
          return tmpCards[0].container.alpha === 1;
        })
        .add(
          () => {
            return {
              startPos: range[0].X,
              range: [...range],
            };
          },
          (ctx, delta) => {
            for (const card of ctx.data!.range) {
              card.X -= shuffleSpeed1 * UI_SCALE * delta;
            }
            return Math.abs(ctx.data!.startPos - ctx.data!.range[0].X) >= 120 * UI_SCALE;
          },
        )
        .add(
          (ctx) => {
            var third = Math.ceil(range.length / 3);
            var subRange = ctx.data.range.splice(range.length - third, range.length);
            return { subRange: subRange, range: ctx.data.range };
          },
          (ctx, delta) => {
            for (const card of ctx.data!.subRange) {
              card.container.zIndex = 1 + i * 20;
              card.X += shuffleSpeed2 * UI_SCALE * delta;
              if (card.X >= 0) {
                card.X = 0;
              }
            }
            if (ctx.data!.subRange[0].X == 0) {
              return true;
            }
            return false;
          },
        )
        .add(
          (ctx) => {
            var third = Math.ceil(range.length / 3);
            var subRange = ctx.data.range.splice(
              ctx.data.range.length - third,
              ctx.data.range.length,
            );
            return { subRange: subRange, range: ctx.data.range };
          },
          (ctx, delta) => {
            for (const card of ctx.data!.subRange) {
              card.container.zIndex = 2 + i * 20;
              card.X += shuffleSpeed2 * UI_SCALE * delta;
              if (card.X >= 0) {
                card.X = 0;
              }
            }
            if (ctx.data!.subRange[0].X == 0) {
              return true;
            }
            return false;
          },
        )
        .add(
          (ctx) => {
            return { subRange: ctx.data.range };
          },
          (ctx, delta) => {
            for (const card of ctx.data!.subRange) {
              card.container.zIndex = 3 + i * 20;
              card.X += shuffleSpeed2 * UI_SCALE * delta;
              if (card.X >= 0) {
                card.X = 0;
              }
            }
            if (ctx.data!.subRange[0].X == 0) {
              return true;
            }
            return false;
          },
        );
    }
    animation.addSimple((_, delta) => {
      for (const card of tmpCards) {
        card.container.alpha -= 0.03 * delta;
        if (card.container.alpha <= 0) {
          card.container.alpha = 0;
        }
      }
      return tmpCards[0].container.alpha === 0;
    });
    for (const card of this._cardsInStack) {
      animation.addSimple((_, delta) => {
        const cardEntity = this._mappedCards.get(card);
        cardEntity!.container.alpha += 0.5 * delta;
        if (cardEntity!.container.alpha >= 1) {
          cardEntity!.container.alpha = 1;
        }
        return cardEntity!.container.alpha === 1;
      });
    }
    animation.done(() => {
      this.container.removeChild(tmpCardsContainer);
      tmpCardsContainer.destroy({ children: true });
      this._canDrawCard = true;
    });
    return animation;
  }
}

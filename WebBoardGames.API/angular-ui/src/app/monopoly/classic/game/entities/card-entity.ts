import * as PIXI from 'pixi.js';
import { GameEntity } from 'app/engine';
import { Card } from '../../models/cards';
import { UI_SCALE } from './constants';
import { Board } from '../../models/board';
import { FieldIds } from '../../models/fields';

export type CardType = 'chance' | 'community-chest';

export class CardEntity extends GameEntity {
  private readonly _cardWidth = 170 * UI_SCALE;
  private readonly _cardHeight = 100 * UI_SCALE;

  private readonly _board: Board = new Board();
  private readonly _card: Card;
  private readonly _type: CardType;
  private _cardBackContainer: PIXI.Container | null = null;
  private _cardFrontContainer: PIXI.Container | null = null;

  constructor(board: Board, type: CardType, card: Card) {
    super();
    this._board = board;
    this._type = type;
    this._card = card;
  }

  public get card(): Card {
    return this._card;
  }

  override onInitializeOverride(): void {
    (async () => {
      await this._createCardGraphics(this._card);
    })();
  }

  flip() {
    if (!this._cardBackContainer || !this._cardFrontContainer) {
      return;
    }
    const isBackVisible = this._cardBackContainer.visible;
    this._cardBackContainer.visible = !isBackVisible;
    this._cardFrontContainer.visible = isBackVisible;
  }

  private async _createCardGraphics(card: Card): Promise<void> {
    const tex = await PIXI.Assets.load(`images/monopoly/${this._type}.svg`);

    // Create card back
    const cardBackContainer = new PIXI.Container();
    cardBackContainer.label = 'card-back';
    cardBackContainer.visible = true;
    this.container.addChild(cardBackContainer);
    this._cardBackContainer = cardBackContainer;

    const cardBackRect = new PIXI.Graphics()
      .rect(0, 0, this._cardWidth, this._cardHeight)
      .fill(this._type == 'chance' ? 0xcc6a2e : 0x369dc6)
      .stroke({ width: 5 * UI_SCALE, color: 0xffffff, alignment: 1 });
    cardBackRect.pivot.x = cardBackRect.width / 2;
    cardBackRect.pivot.y = cardBackRect.height / 2;
    cardBackContainer.addChild(cardBackRect);

    const cardBackSprite = new PIXI.Sprite(tex);
    const aspect = cardBackSprite.width / cardBackSprite.height;
    cardBackSprite.height = 60 * UI_SCALE;
    cardBackSprite.width = cardBackSprite.height * aspect;
    cardBackSprite.anchor.set(0.5);
    cardBackContainer.addChild(cardBackSprite);

    // Create card front
    const cardFrontContainer = new PIXI.Container();
    cardFrontContainer.label = 'card-front';
    cardFrontContainer.visible = false;
    this.container.addChild(cardFrontContainer);
    this._cardFrontContainer = cardFrontContainer;

    const cardFrontRect = new PIXI.Graphics()
      .rect(0, 0, this._cardWidth, this._cardHeight)
      .fill(0xffffff)
      .stroke({ width: 2 * UI_SCALE, color: 0x000000, alignment: 1 });
    cardFrontRect.pivot.x = cardFrontRect.width / 2;
    cardFrontRect.pivot.y = cardFrontRect.height / 2;
    cardFrontContainer.addChild(cardFrontRect);

    const cardFrontText = new PIXI.Text({
      text: this._replaceCardTextMakros(card.text, this._board),
      anchor: { x: 0.5, y: 0.5 },
      style: {
        fontSize: 7 * UI_SCALE,
        wordWrap: true,
        wordWrapWidth: this._cardWidth - 10 * UI_SCALE,
        align: 'center',
      },
    });
    cardFrontContainer.addChild(cardFrontText);

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  private _replaceCardTextMakros(text: string, board: Board): PIXI.TextString | undefined {
    let replacedText = text;
    for (const fieldId of FieldIds) {
      if (text.includes(`{field-name.${fieldId}}`)) {
        replacedText = replacedText.replace(
          `{field-name.${fieldId}}`,
          board.skin.fieldNames[fieldId].replace('\r', ' ').replace('-', '').toLocaleUpperCase(),
        );
      }
      if (text.includes(`{field-price.${fieldId}}`)) {
        replacedText = replacedText.replace(
          `{field-price.${fieldId}}`,
          `${board.skin.fieldBasePrices[fieldId]}`,
        );
      }
    }
    return replacedText;
  }
}

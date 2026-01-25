import { GameEntity } from 'app/engine';
import { Board } from '../../models/board';
import * as PIXI from 'pixi.js';
import { BOARD_BASE_COLOR, EDGE_SIZE, FIELD_SIZE, HEADER_HEIGHT, STROKE_NORMAL, UI_SCALE } from './constants';
import { Field } from '../../models/fields';

export class FieldEntity extends GameEntity {
  constructor(
    private readonly board: Board,
    private readonly field: Field,
  ) {
    super();
  }

  get isCorner() {
    return (
      this.field.id === 'go' ||
      this.field.id === 'jail' ||
      this.field.id === 'free-parking' ||
      this.field.id === 'go-to-jail'
    );
  }

  get isProperty() {
    return (
      !this.isCorner &&
      !this.field.id.startsWith('tax-') &&
      !this.field.id.startsWith('utility-') &&
      !this.field.id.startsWith('station-') &&
      !this.field.id.startsWith('chance-') &&
      !this.field.id.startsWith('community-chest-')
    );
  }

  override onInitializeOverride(): void {
    this._createFieldGraphics(this.container);
  }

  override onUpdateOverride(delta: PIXI.Ticker): void {}

  private _createFieldGraphics(container: PIXI.Container<PIXI.ContainerChild>) {
    const base = new PIXI.Graphics()
      .rect(0, 0, this.isCorner ? EDGE_SIZE : FIELD_SIZE, EDGE_SIZE)
      .fill(BOARD_BASE_COLOR)
      .stroke({ width: STROKE_NORMAL, color: 0x000000, alignment: 1 });
    base.pivot.x = base.width / 2;
    base.pivot.y = base.height / 2;
    container.addChild(base);

    if (this.isProperty) {
      const propertyHeader = new PIXI.Graphics()
        .rect(0, -EDGE_SIZE / 2 + HEADER_HEIGHT / 2, FIELD_SIZE, HEADER_HEIGHT)
        .fill(this.getPropertyColor(this.field.id))
        .stroke({ width: STROKE_NORMAL, color: 0x000000, alignment: 1, });
      propertyHeader.pivot.x = propertyHeader.width / 2;
      propertyHeader.pivot.y = propertyHeader.height / 2;
      container.addChild(propertyHeader);
    }

    const text = new PIXI.Text({
      text: this.board.skin.fieldNames[this.field.id].toUpperCase(),
      anchor: { x: 0.5, y: this.isCorner ? 0.5 : 0 },
      style: {
        fontSize: this.isCorner ? (this.field.id === 'go' ? 24 * UI_SCALE : 14 * UI_SCALE) : 10 * UI_SCALE,
        wordWrap: true,
        wordWrapWidth: this.isCorner ? EDGE_SIZE - 20 : FIELD_SIZE - 10,
        breakWords: true,
        align: 'center',
      },
    });
    if (this.isCorner) {
      text.rotation = -45 * (Math.PI / 180);
    }
    if (this.isCorner) {
      text.y = 0;
    } 
    else if (this.isProperty){
      text.y = -EDGE_SIZE / 2 + HEADER_HEIGHT + 15;
    }
    else {
      text.y = -EDGE_SIZE / 2 + 15;
    }
    text.x = 0;
    container.addChild(text);

    const price = this.board.skin.fieldBasePrices[this.field.id];
    if (price) {
      const priceText = new PIXI.Text({
        text: `${(this.field.id.startsWith("tax-")) ? "PAY " : ""}₩ ${price}`,
        anchor: { x: 0.5, y: 1 },
        style: {
          fontSize: 9 * UI_SCALE,
          align: 'center',
        },
      });
      priceText.x = 0;
      priceText.y = EDGE_SIZE / 2 - 15;
      container.addChild(priceText);
    }
  }

  private getPropertyColor(fieldId: string): number {
    if (fieldId.startsWith('brown-')) {
      return 0x984c2c;
    } else if (fieldId.startsWith('light-blue-')) {
      return 0xb7e0f4;
    } else if (fieldId.startsWith('pink-')) {
      return 0xcf2e82;
    } else if (fieldId.startsWith('orange-')) {
      return 0xef920a;
    } else if (fieldId.startsWith('red-')) {
      return 0xdc1213;
    } else if (fieldId.startsWith('yellow-')) {
      return 0xf8e609;
    } else if (fieldId.startsWith('green-')) {
      return 0x07a649;
    } else if (fieldId.startsWith('dark-blue-')) {
      return 0x016ab9;
    } else {
      return 0xffffff;
    }
  }
}

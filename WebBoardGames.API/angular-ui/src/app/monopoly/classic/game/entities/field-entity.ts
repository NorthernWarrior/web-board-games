import { GameEntity } from 'app/engine';
import { Board } from '../../models/board';
import * as PIXI from 'pixi.js';
import {
  BOARD_BASE_COLOR,
  EDGE_SIZE,
  FIELD_SIZE,
  HEADER_HEIGHT,
  STROKE_NORMAL,
  UI_SCALE,
} from './constants';
import { Field } from '../../models/fields';

export class FieldEntity extends GameEntity {
  constructor(
    private readonly _board: Board,
    private readonly _field: Field,
  ) {
    super();
  }

  get field() {
    return this._field;
  }

  get isCorner() {
    return (
      this._field.id === 'go' ||
      this._field.id === 'jail' ||
      this._field.id === 'free-parking' ||
      this._field.id === 'go-to-jail'
    );
  }

  get isProperty() {
    return (
      !this.isCorner &&
      !this._field.id.startsWith('tax-') &&
      !this._field.id.startsWith('utility-') &&
      !this._field.id.startsWith('station-') &&
      !this._field.id.startsWith('chance-') &&
      !this._field.id.startsWith('community-chest-')
    );
  }

  override onInitializeOverride(): void {
    (async () => {
      await this._createFieldGraphics(this.container);
    })();
  }

  override onUpdateOverride(delta: PIXI.Ticker): void {}

  private async _createFieldGraphics(container: PIXI.Container<PIXI.ContainerChild>) {
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
        .fill(this._getPropertyColor(this._field.id))
        .stroke({ width: STROKE_NORMAL, color: 0x000000, alignment: 1 });
      propertyHeader.pivot.x = propertyHeader.width / 2;
      propertyHeader.pivot.y = propertyHeader.height / 2;
      container.addChild(propertyHeader);
    }

    if (this._field.id === 'go') {
      await this._createGoField(container);
    } else if (
      this._field.id.startsWith('community-chest-') ||
      this._field.id.startsWith('chance-')
    ) {
      await this._createCommunityOrChanceField(container);
    } else if (this._field.id === 'free-parking' || this._field.id === 'go-to-jail') {
      await this._createFreeParkingOrGoToJainField(container);
    } else if (this._field.id.startsWith('station-')) {
      await this._createStationField(container);
    } else if (this._field.id.startsWith('utility-')) {
      await this._createUtilityField(container);
    } else if (this._field.id.startsWith('tax-')) {
      await this._createTaxField(container);
    } else if (this._field.id === 'jail') {
      await this._createJailField(container);
    } else {
      this._createPropertyField(container);
    }
  }

  private _createPropertyField(container: PIXI.Container<PIXI.ContainerChild>) {
    const text = new PIXI.Text({
      text: this._board.skin.fieldNames[this._field.id].toUpperCase().replace("-", "\r"),
      anchor: { x: 0.5, y: 0 },
      style: {
        fontSize: 9 * UI_SCALE,
        wordWrap: true,
        wordWrapWidth: FIELD_SIZE - 4 * UI_SCALE,
        breakWords: true,
        align: 'center',
      },
    });

    text.y = -EDGE_SIZE / 2 + HEADER_HEIGHT + 4 * UI_SCALE;

    text.x = 0;
    container.addChild(text);

    const price = this._board.skin.fieldBasePrices[this._field.id];
    if (price) {
      const priceText = new PIXI.Text({
        text: `₩${price}`,
        anchor: { x: 0.5, y: 1 },
        style: {
          fontSize: 9 * UI_SCALE,
          align: 'center',
        },
      });
      priceText.x = 0;
      priceText.y = EDGE_SIZE / 2 - 2.5 * UI_SCALE;
      container.addChild(priceText);
    }
  }

  private async _createFreeParkingOrGoToJainField(container: PIXI.Container<PIXI.ContainerChild>) {
    const isFreeParking = this._field.id === 'free-parking';
    const text = new PIXI.Text({
      text: isFreeParking ? 'FREE\r\r\r\r\rPARKING' : 'GO TO\r\r\r\r\rJAIL',
      anchor: { x: 0.5, y: 0.5 },
      style: {
        fontSize: 12 * UI_SCALE,
        wordWrap: true,
        wordWrapWidth: EDGE_SIZE - 5 * UI_SCALE,
        breakWords: true,
        align: 'center',
      },
    });
    text.rotation = -45 * (Math.PI / 180);
    text.y = 0;
    text.x = 0;
    container.addChild(text);

    const texture = await PIXI.Assets.load(
      isFreeParking ? 'images/monopoly/free-parking.svg' : 'images/monopoly/go-to-jail.svg',
    );
    const icon = new PIXI.Sprite(texture);
    icon.anchor.set(0.5);
    const aspect = icon.width / icon.height;
    icon.width = EDGE_SIZE / 2.5;
    icon.height = icon.width / aspect;
    icon.rotation = -45 * (Math.PI / 180);
    container.addChild(icon);
  }

  private async _createStationField(container: PIXI.Container<PIXI.ContainerChild>) {
    const text = new PIXI.Text({
      text: this._board.skin.fieldNames[this._field.id].toUpperCase().replace("-", "\r"),
      anchor: { x: 0.5, y: 0 },
      style: {
        fontSize: 9 * UI_SCALE,
        wordWrap: true,
        wordWrapWidth: FIELD_SIZE - 2.5 * UI_SCALE,
        breakWords: true,
        align: 'center',
      },
    });
    text.y = -EDGE_SIZE / 2 + 6 * UI_SCALE;
    text.x = 0;
    container.addChild(text);

    const texture = await PIXI.Assets.load('images/monopoly/station.svg');
    const image = new PIXI.Sprite(texture);
    image.anchor.set(0.5);
    const aspect = image.width / image.height;
    image.width = FIELD_SIZE - 20 * UI_SCALE;
    image.height = image.width / aspect;
    image.y = image.height / 6;
    container.addChild(image);

    const price = this._board.skin.fieldBasePrices[this._field.id];
    if (price) {
      const priceText = new PIXI.Text({
        text: `₩${price}`,
        anchor: { x: 0.5, y: 1 },
        style: {
          fontSize: 9 * UI_SCALE,
          align: 'center',
        },
      });
      priceText.x = 0;
      priceText.y = EDGE_SIZE / 2 - 2.5 * UI_SCALE;
      container.addChild(priceText);
    }
  }

  private async _createUtilityField(container: PIXI.Container<PIXI.ContainerChild>) {
    const text = new PIXI.Text({
      text: this._board.skin.fieldNames[this._field.id].toUpperCase().replace("-", "\r"),
      anchor: { x: 0.5, y: 0 },
      style: {
        fontSize: 9 * UI_SCALE,
        wordWrap: true,
        wordWrapWidth: FIELD_SIZE - 2.5 * UI_SCALE,
        breakWords: true,
        align: 'center',
      },
    });
    text.y = -EDGE_SIZE / 2 + 6 * UI_SCALE;
    text.x = 0;
    container.addChild(text);

    const isElectric = this._field.id === 'utility-1';

    const texture = await PIXI.Assets.load(
      isElectric ? 'images/monopoly/utility_electric.svg' : 'images/monopoly/utility_water.svg',
    );
    const image = new PIXI.Sprite(texture);
    image.anchor.set(0.5);
    const aspect = image.height / image.width;
    image.height = EDGE_SIZE - 60 * UI_SCALE;
    image.width = image.height / aspect;
    image.y = 10 * UI_SCALE;
    container.addChild(image);

    const price = this._board.skin.fieldBasePrices[this._field.id];
    if (price) {
      const priceText = new PIXI.Text({
        text: `₩${price}`,
        anchor: { x: 0.5, y: 1 },
        style: {
          fontSize: 9 * UI_SCALE,
          align: 'center',
        },
      });
      priceText.x = 0;
      priceText.y = EDGE_SIZE / 2 - 2.5 * UI_SCALE;
      container.addChild(priceText);
    }
  }

  private async _createTaxField(container: PIXI.Container<PIXI.ContainerChild>) {
    const text = new PIXI.Text({
      text: this._board.skin.fieldNames[this._field.id].toUpperCase().replace("-", "\r"),
      anchor: { x: 0.5, y: 0 },
      style: {
        fontSize: 9 * UI_SCALE,
        wordWrap: true,
        wordWrapWidth: FIELD_SIZE - 2.5 * UI_SCALE,
        breakWords: true,
        align: 'center',
      },
    });
    text.y = -EDGE_SIZE / 2 + 6 * UI_SCALE;
    text.x = 0;
    container.addChild(text);

    const isIncome = this._field.id === 'tax-income';

    const texture = await PIXI.Assets.load(
      isIncome ? 'images/monopoly/tax_income.svg' : 'images/monopoly/tax_luxury.svg',
    );
    const image = new PIXI.Sprite(texture);
    image.anchor.set(0.5);
    const aspect = image.height / image.width;
    if (isIncome) {
      image.height = 10 * UI_SCALE;
    } else {
      image.y = 6 * UI_SCALE;
      image.height = EDGE_SIZE - 60 * UI_SCALE;
    }
    image.width = image.height / aspect;
    container.addChild(image);

    const price = this._board.skin.fieldBasePrices[this._field.id];
    if (price) {
      const priceText = new PIXI.Text({
        text: `PAY ₩${price}`,
        anchor: { x: 0.5, y: 1 },
        style: {
          fontSize: 9 * UI_SCALE,
          align: 'center',
        },
      });
      priceText.x = 0;
      priceText.y = EDGE_SIZE / 2 - 2.5 * UI_SCALE;
      container.addChild(priceText);
    }
  }

  private async _createCommunityOrChanceField(container: PIXI.Container<PIXI.ContainerChild>) {
    const text = new PIXI.Text({
      text: this._board.skin.fieldNames[this._field.id].toUpperCase().replace("-", "\r"),
      anchor: { x: 0.5, y: 0 },
      style: {
        fontSize: 9 * UI_SCALE,
        wordWrap: true,
        wordWrapWidth: FIELD_SIZE - 2.5 * UI_SCALE,
        breakWords: true,
        align: 'center',
      },
    });
    text.y = -EDGE_SIZE / 2 + 6 * UI_SCALE;
    text.x = 0;
    container.addChild(text);

    const isCommunityChest = this._field.id.startsWith('community-chest-');
    const texture = await PIXI.Assets.load(
      `images/monopoly/${isCommunityChest ? 'community-chest' : 'chance'}.svg`,
    );
    const image = new PIXI.Sprite(texture);
    image.anchor.set(0.5);

    if (isCommunityChest) {
      const aspect = image.width / image.height;
      image.width = FIELD_SIZE - 20 * UI_SCALE;
      image.height = image.width / aspect;
      image.y = image.height / 3;
    } else {
      const aspect = image.height / image.width;
      image.height = EDGE_SIZE - 40 * UI_SCALE;
      image.width = image.height / aspect;
      image.y = 10 * UI_SCALE;
      switch (this._field.id) {
        case 'chance-1':
          image.tint = 0xab305f;
          break;
        case 'chance-2':
          image.tint = 0x3389ac;
          break;
        case 'chance-3':
          image.tint = 0xb75a2a;
          break;
      }
    }
    container.addChild(image);
  }

  private async _createGoField(container: PIXI.Container<PIXI.ContainerChild>) {
    const firstText = new PIXI.Text({
      text: 'COLLECT\r₩200 SALARY\rAS YOU PASS',
      anchor: { x: 0.5, y: 0.5 },
      style: {
        fontSize: 9 * UI_SCALE,
        wordWrap: true,
        wordWrapWidth: EDGE_SIZE - 5 * UI_SCALE,
        breakWords: true,
        align: 'center',
      },
    });
    firstText.rotation = -45 * (Math.PI / 180);
    firstText.y = -25 * UI_SCALE;
    firstText.x = -25 * UI_SCALE;
    container.addChild(firstText);

    const texGo = await PIXI.Assets.load('images/monopoly/go.svg');
    const imgGo = new PIXI.Sprite(texGo);
    imgGo.anchor.set(0.5);
    const aspectGo = imgGo.width / imgGo.height;
    imgGo.rotation = -45 * (Math.PI / 180);
    imgGo.width = EDGE_SIZE / 1.8;
    imgGo.height = imgGo.width / aspectGo;
    container.addChild(imgGo);

    const texArrow = await PIXI.Assets.load('images/monopoly/go-arrow.svg');
    const arrow = new PIXI.Sprite(texArrow);
    arrow.anchor.set(0.5);
    const aspect = arrow.width / arrow.height;
    arrow.width = EDGE_SIZE - 20 * UI_SCALE;
    arrow.height = arrow.width / aspect;
    arrow.y = EDGE_SIZE / 2 - arrow.height / 2 - 5 * UI_SCALE;
    container.addChild(arrow);
  }

  private async _createJailField(container: PIXI.Container<PIXI.ContainerChild>) {
    const boxSize = EDGE_SIZE * (2 / 3);
    const orangeBox = new PIXI.Graphics()
      .rect(0 - (EDGE_SIZE - boxSize) / 2, 0 - (EDGE_SIZE - boxSize) / 2, boxSize, boxSize)
      .fill(0xc0692a)
      .stroke({ width: STROKE_NORMAL, color: 0x000000, alignment: 1 });
    orangeBox.pivot.x = boxSize / 2;
    orangeBox.pivot.y = boxSize / 2;
    container.addChild(orangeBox);

    const texture = await PIXI.Assets.load('images/monopoly/jail.svg');
    const img = new PIXI.Sprite(texture);
    img.anchor.set(0.5);
    const aspect = img.width / img.height;
    img.rotation = -45 * (Math.PI / 180);
    img.width = EDGE_SIZE / 2.3;
    img.height = img.width / aspect;
    img.y = -20 * UI_SCALE;
    img.x = -20 * UI_SCALE;
    container.addChild(img);

    const textInJail = new PIXI.Text({
      text: 'IN\r\r\r\r\rJAIL',
      anchor: { x: 0.5, y: 0.5 },
      style: {
        fontSize: 11 * UI_SCALE,
        align: 'center',
      },
    });
    textInJail.rotation = -45 * (Math.PI / 180);
    textInJail.y = -20 * UI_SCALE;
    textInJail.x = -20 * UI_SCALE;
    container.addChild(textInJail);

    const textJust = new PIXI.Text({
      text: 'JUST',
      anchor: { x: 0.5, y: 0.5 },
      style: {
        fontSize: 11 * UI_SCALE,
        align: 'center',
      },
    });
    textJust.y = EDGE_SIZE / 2 - 15 * UI_SCALE;
    textJust.x = -15 * UI_SCALE;
    container.addChild(textJust);

    const textVisiting = new PIXI.Text({
      text: 'VISITING',
      anchor: { x: 0.5, y: 0.5 },
      style: {
        fontSize: 11 * UI_SCALE,
        align: 'center',
      },
    });
    textVisiting.rotation = -90 * (Math.PI / 180);
    textVisiting.x = EDGE_SIZE / 2 - 15 * UI_SCALE;
    textVisiting.y = -15 * UI_SCALE;
    container.addChild(textVisiting);
  }

  private _getPropertyColor(fieldId: string): number {
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

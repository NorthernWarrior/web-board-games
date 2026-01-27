import * as PIXI from 'pixi.js';
import { GameEntity } from "app/engine";
import { FigureType } from "../../models/figurines";
import { UI_SCALE } from './constants';

export class FigureEntity extends GameEntity {
    constructor(private _figureType: FigureType, private _isMyPlayer: boolean = false) {
        super();
    }

    override onInitializeOverride(): void {
        (async ()=> {
            await this._createFigureGraphics();
        })();
    }

    private async _createFigureGraphics() {
        var tex = await PIXI.Assets.load(`images/monopoly/figure-${this._figureType}.svg`);
        const sprite = new PIXI.Sprite(tex);
        sprite.anchor.set(0.5, 0.5);
        const aspectRatio = sprite.width / sprite.height;
        const desiredHeight = 30 * UI_SCALE;
        sprite.height = desiredHeight;
        sprite.width = desiredHeight * aspectRatio;
        if (this._isMyPlayer) {
            sprite.tint = 0x00ff00;
        } 
        this.container.addChild(sprite);
    }
}   
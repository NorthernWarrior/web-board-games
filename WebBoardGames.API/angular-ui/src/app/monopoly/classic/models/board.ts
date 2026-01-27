
import { createSkinBerglern, createSkinDefault, loadSkinCustom } from './board-skins';
import { Card } from './cards';
import { Field, FieldIds } from './fields';
import { FigureType } from './figurines';
import { Player } from './player';
import { Turn } from './turn';
import { EventEmitter } from 'pixi.js';

export class Board {
  public readonly turnsAdded = new EventEmitter<"turns", Turn[]>();

  skin = loadSkinCustom(createSkinBerglern());
  fields: Field[] = [];
  players: Player[] = [];
  private _turns: Turn[] = [];
  readonly cardsChance: Card[] = [];
  readonly cardsCommunityChest: Card[] = [];

  reset() {
    this.fields = [];
    this.players = [];
    this._turns = [];
    for (const id of FieldIds) this.fields.push({ id });
    this.cardsChance.splice(0, this.cardsChance.length, ...this.skin.cardsChance);
    this.cardsCommunityChest.splice(
      0,
      this.cardsCommunityChest.length,
      ...this.skin.cardsCommunityChest,
    );
  }

  public addPlayer(id: string, name: string, figureType: FigureType, startingMoney: number) {
    this.players.push(new Player(id, name, figureType, startingMoney));
  }

  public addTurn(turn: Turn) {
    this._turns.push(turn);
    this.turnsAdded.emit("turns", [turn]);
  }
  public addTurns(turns: Turn[]) {
    this._turns.push(...turns);
    this.turnsAdded.emit("turns", turns);
  }
}

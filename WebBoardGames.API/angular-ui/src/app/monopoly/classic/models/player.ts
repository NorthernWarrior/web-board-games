import { FIELD_COUNT } from '../game/entities/constants';
import { FigureType } from './figurines';

export interface IPlayer {
  id: string;
  name: string;
  figureType: FigureType;
  money: number;
}

export class Player implements IPlayer {
  private _currentFieldIndex: number = 0;

  constructor(
    private _id: string,
    private _name: string,
    private _figureType: FigureType,
    private _money: number,
  ) {}

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get figureType(): FigureType {
    return this._figureType;
  }

  public get money(): number {
    return this._money;
  }

  public get currentFieldIndex(): number {
    return this._currentFieldIndex;
  }

  /** positive to increase money, negative to decrease, returns dept as a positive number if negative and not enough money */
  public transferMoney(amount: number): number {
    this._money += amount;
    if (this._money < 0) {
      const dept = -this._money;
      this._money = 0;
      return dept;
    }
    return 0;
  }

  public move(steps: number): number[] {
    const fieldIndices: number[] = [];
    if (steps > 0){
      for (let i = 0; i < steps; i++) {
        this._currentFieldIndex += 1;
        this._currentFieldIndex = this._currentFieldIndex % FIELD_COUNT;
        fieldIndices.push(this._currentFieldIndex);
      }
    }else {
      for (let i = 0; i < -steps; i++) {
        this._currentFieldIndex -= 1;
        this._currentFieldIndex = (this._currentFieldIndex + FIELD_COUNT) % FIELD_COUNT;
        fieldIndices.push(this._currentFieldIndex);
      }
    }
    return fieldIndices;
  }
}

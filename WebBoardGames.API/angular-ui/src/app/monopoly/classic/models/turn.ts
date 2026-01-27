import { CardType } from '../game/entities/card-entity';
import { Card } from './cards';
import { FieldId } from './fields';

export interface Turn {
  playerID: string;
  phases: TurnPhase[];
}
interface TurnPhaseDataTypeMap {
  trade: TurnPhaseDataTrade;
  'buy-houses': TurnPhaseDataBuyHouses;
  move: TurnPhaseDataMove;
  pay: TurnPhaseDataPay;
  'buy-property': TurnPhaseDataBuyProperty;
  collect: TurnPhaseDataCollect;
  'card-action': TurnPhaseDataCardAction;
}

export type TurnPhase = {
  [K in keyof TurnPhaseDataTypeMap]: { type: K; data: TurnPhaseDataTypeMap[K] };
}[keyof TurnPhaseDataTypeMap];

export type TurnPhaseType =
  | 'trade'
  | 'buy-houses'
  | 'move'
  | 'pay'
  | 'buy-property'
  | 'collect'
  | 'card-action';

export interface TurnPhaseDataTrade {}

export interface TurnPhaseDataBuyHouses {
    houses: { fieldID: FieldId; count: number; }[];
    amount: number;
}

export interface TurnPhaseDataMove {
  steps: number;
}

export interface TurnPhaseDataPay {
  amount: number;
  /** if undefined, then payment to the bank, if the special free parking rule is active, then 'free-parking' is also allowed */
  toPlayerID?: string | undefined | 'free-parking';
}

export interface TurnPhaseDataBuyProperty {
  amount: number;
  fieldID: FieldId;
}

export interface TurnPhaseDataCollect {}

export interface TurnPhaseDataCardAction {
  cardType: CardType;
  cardIndex: number;
}

export const testTurns: Turn[] = [
  {
    playerID: '1',
    phases: [
      {
        type: 'move', // to tax-income
        data: {
          steps: 4,
        },
      },
      {
        type: 'pay',
        data: {
          amount: 200,
        },
      },
    ],
  },
  {
    playerID: '1',
    phases: [
      {
        type: 'move', // to pink-1
        data: {
          steps: 7,
        },
      },
      {
        type: 'buy-property',
        data: {
          amount: 140,
          fieldID: 'pink-1',
        },
      },
    ],
  },
  {
    playerID: '1',
    phases: [
      {
        type: 'move', // to chest-2
        data: {
          steps: 6,
        },
      },
      {
        type: 'card-action', // let's assume "go back three steps"
        data: {
          cardType: 'community-chest',
          cardIndex: 15,
        },
      },
      {
        type: 'move', // to pink-3
        data: {
          steps: -3,
        },
      },
      {
        type: 'buy-property',
        data: {
          amount: 160,
          fieldID: 'pink-3',
        },
      },
    ],
  },
  {
    playerID: '1',
    phases: [
      {
        type: 'move', // to chest-2
        data: {
          steps: 3,
        },
      },
      {
        type: 'card-action', // let's assume "go to GO"
        data: {
          cardType: 'community-chest',
          cardIndex: 15,
        },
      },
      {
        type: 'move', // to GO
        data: {
          steps: 23,
        },
      },
      {
        type: 'collect',
        data: {
          amount: 400,
        },
      },
    ],
  },
  {
    playerID: '1',
    phases: [
      {
        type: 'move', // to light-blue-3
        data: {
          steps: 9,
        },
      },
      //{
      //  type: "start-auction" ?? how to do this?
      //}
    ],
  },
  {
    playerID: '1',
    phases: [
      {
        type: 'move', // to pink-2
        data: {
          steps: 4,
        },
      },
      {
        type: 'buy-property',
        data: {
          amount: 140,
          fieldID: 'pink-2',
        },
      },
    ],
  },
  {
    playerID: '1',
    phases: [
      {
        type: 'buy-houses',
        data: {
            houses: [{ fieldID: 'pink-1', count: 2 }, { fieldID: 'pink-2', count: 2 }, { fieldID: 'pink-3', count: 2 }],
            amount: 600,
        },
      },
    ],
  },
];

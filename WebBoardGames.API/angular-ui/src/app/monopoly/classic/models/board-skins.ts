import { Card } from './cards';
import { FieldId } from './fields';

export class BoardSkin {
  fieldNames: {
    [key in FieldId]: string;
  } = {} as any;

  fieldBasePrices: {
    [key in FieldId]: number;
  } = {} as any;

  useCardsFromDefaultSkin: boolean = true;
  cardsChance: Card[] = [];
  cardsCommunityChest: Card[] = [];
}

export function loadSkinCustom(custom: BoardSkin): BoardSkin {
  var defaultSkin = createSkinDefault();
  for (var key in defaultSkin.fieldNames) {
    if (!custom.fieldNames[key as FieldId]) {
      custom.fieldNames[key as FieldId] = defaultSkin.fieldNames[key as FieldId];
    }
  }
  for (var key in defaultSkin.fieldBasePrices) {
    if (!custom.fieldBasePrices[key as FieldId]) {
      custom.fieldBasePrices[key as FieldId] = defaultSkin.fieldBasePrices[key as FieldId];
    }
  }
  if (custom.useCardsFromDefaultSkin) {
    custom.cardsChance = [...defaultSkin.cardsChance, ...custom.cardsChance];
    custom.cardsCommunityChest = [
      ...defaultSkin.cardsCommunityChest,
      ...custom.cardsCommunityChest,
    ];
  }
  return custom;
}

export function createSkinDefault(): BoardSkin {
  var skin = new BoardSkin();
  skin.fieldNames['go'] = 'Go';
  skin.fieldNames['brown-1'] = 'Old Kent Road';
  skin.fieldNames['community-chest-1'] = 'Community Chest';
  skin.fieldNames['brown-2'] = 'Whitechapel Road';
  skin.fieldNames['tax-income'] = 'Income Tax';
  skin.fieldNames['station-1'] = "King's Cross Station";
  skin.fieldNames['light-blue-1'] = 'The Angel Islington';
  skin.fieldNames['chance-1'] = 'Chance';
  skin.fieldNames['light-blue-2'] = 'Euston Road';
  skin.fieldNames['light-blue-3'] = 'Pentonville Road';
  skin.fieldNames['jail'] = 'In Jail\r\rJust Visiting';
  skin.fieldNames['pink-1'] = 'Pall Mall';
  skin.fieldNames['utility-1'] = 'Electric Company';
  skin.fieldNames['pink-2'] = 'Whitehall';
  skin.fieldNames['pink-3'] = 'Northumberland Avenue';
  skin.fieldNames['station-2'] = 'Marylebone Station';
  skin.fieldNames['orange-1'] = 'Bow Street';
  skin.fieldNames['community-chest-2'] = 'Community Chest';
  skin.fieldNames['orange-2'] = 'Marlborough Street';
  skin.fieldNames['orange-3'] = 'Vine Street';
  skin.fieldNames['free-parking'] = 'Free Parking';
  skin.fieldNames['red-1'] = 'Strand';
  skin.fieldNames['chance-2'] = 'Chance';
  skin.fieldNames['red-2'] = 'Fleet Street';
  skin.fieldNames['red-3'] = 'Trafalgar Square';
  skin.fieldNames['station-3'] = 'Fenchurch St. Station';
  skin.fieldNames['yellow-1'] = 'Leicester Square';
  skin.fieldNames['yellow-2'] = 'Coventry Street';
  skin.fieldNames['utility-2'] = 'Water Works';
  skin.fieldNames['yellow-3'] = 'Piccadilly';
  skin.fieldNames['go-to-jail'] = 'Go To\r\r\r\rJail';
  skin.fieldNames['green-1'] = 'Regent Street';
  skin.fieldNames['green-2'] = 'Oxford Street';
  skin.fieldNames['community-chest-3'] = 'Community Chest';
  skin.fieldNames['green-3'] = 'Bond Street';
  skin.fieldNames['station-4'] = 'Liverpool St. Station';
  skin.fieldNames['chance-3'] = 'Chance';
  skin.fieldNames['dark-blue-1'] = 'Park Lane';
  skin.fieldNames['tax-luxury'] = 'Luxury Tax';
  skin.fieldNames['dark-blue-2'] = 'Mayfair';

  //#region Prices
  skin.fieldBasePrices['go'] = 200;
  skin.fieldBasePrices['brown-1'] = 60;
  skin.fieldBasePrices['brown-2'] = 60;
  skin.fieldBasePrices['tax-income'] = 200;
  skin.fieldBasePrices['station-1'] = 200;
  skin.fieldBasePrices['light-blue-1'] = 100;
  skin.fieldBasePrices['light-blue-2'] = 100;
  skin.fieldBasePrices['light-blue-3'] = 120;
  skin.fieldBasePrices['pink-1'] = 140;
  skin.fieldBasePrices['utility-1'] = 150;
  skin.fieldBasePrices['pink-2'] = 140;
  skin.fieldBasePrices['pink-3'] = 160;
  skin.fieldBasePrices['station-2'] = 200;
  skin.fieldBasePrices['orange-1'] = 180;
  skin.fieldBasePrices['orange-2'] = 180;
  skin.fieldBasePrices['orange-3'] = 200;
  skin.fieldBasePrices['red-1'] = 220;
  skin.fieldBasePrices['red-2'] = 220;
  skin.fieldBasePrices['red-3'] = 240;
  skin.fieldBasePrices['station-3'] = 200;
  skin.fieldBasePrices['yellow-1'] = 260;
  skin.fieldBasePrices['yellow-2'] = 260;
  skin.fieldBasePrices['utility-2'] = 150;
  skin.fieldBasePrices['yellow-3'] = 280;
  skin.fieldBasePrices['green-1'] = 300;
  skin.fieldBasePrices['green-2'] = 300;
  skin.fieldBasePrices['green-3'] = 320;
  skin.fieldBasePrices['station-4'] = 200;
  skin.fieldBasePrices['dark-blue-1'] = 350;
  skin.fieldBasePrices['tax-luxury'] = 100;
  skin.fieldBasePrices['dark-blue-2'] = 400;
  //#endregion

  skin.cardsChance = [
    { text: 'Advance to {field-name.go}.\rCollect ₩{field-price.go}.', moveToFieldId: 'go', }, // No receiveAmount here, because this will be handled in the game when the player lands on GO
    { text: 'Advance to {field-name.red-3}.\rIf you pass {field-name.go}, collect ₩{field-price.go}.', moveToFieldId: 'red-3' }, 
    { text: "Advance to {field-name.dark-blue-2}.", moveToFieldId: 'dark-blue-2' },
    { text: "Advance to {field-name.pink-1}.\rIf you pass {field-name.go}, collect ₩{field-price.go}.", moveToFieldId: 'pink-1' },
    { text: "Advance to the nearest Station.\rIf you pass {field-name.go}, collect ₩{field-price.go}.\rIf unowned, you may buy it from the Bank.\rIf owned, pay the owner twice the rental to which they are otherwise entitled.", moveToNearest: 'station', specialType: 'pay-double-if-owned-by-others',  },
    { text: "Advance to the nearest Station.\rIf you pass {field-name.go}, collect ₩{field-price.go}.\rIf unowned, you may buy it from the Bank.\rIf owned, pay the owner twice the rental to which they are otherwise entitled.", moveToNearest: 'station', specialType: 'pay-double-if-owned-by-others',  },
    { text: "Advance to the nearest Utility.\rIf you pass {field-name.go}, collect ₩{field-price.go}.\rIf unowned, you may buy it from the Bank.\rIf owned, throw dice and pay owner a total ten times amount thrown.", moveToNearest: 'utility', specialType: 'pay-ten-times-amount-rolled',  },
    { text: "Bank pays you dividend of ₩50.", receiveAmount: 50 },
    { text: "Get Out of JAIL Free.\rThis card may be kept until needed, or sold.", getOutOfJail: true },
    { text: "Go Back 3 Spaces.", moveSteps: -3 },
    { text: "Go to JAIL.\rGo directly to JAIL.\rDo not pass {field-name.go}.\rDo not collect ₩{field-price.go}.", moveToFieldId: 'jail', moveReverse: "when-shorter" },
    { text: "Make general repairs on all your properties.\rFor each house pay ₩25.\rFor each hotel pay ₩100.", payPerHouse: 25, payPerHotel: 100 },
    { text: "Speeding fine ₩15.", payAmount: 15 },
    { text: "Take a trip to {field-name.station-3}.\rIf you pass {field-name.go}, collect ₩{field-price.go}.", moveToFieldId: 'station-3' }, 
    { text: "You have been elected Chairman of the Board.\rPay each player ₩50.", allOtherPlayersInvolved: true, payAmount: 50 },
    { text: "Your building loan matures.\rCollect ₩150.", allOtherPlayersInvolved: true, receiveAmount: 150 },
  ];

  skin.cardsCommunityChest = [
    { text: 'Advance to {field-name.go}.\rCollect ₩{field-price.go}.', moveToFieldId: 'go', }, // No receiveAmount here, because this will be handled in the game when the player lands on GO
    { text: 'Bank error in your favor.\rCollect ₩200.', receiveAmount: 200 },
    { text: 'Doctor\'s fees.\rPay ₩50.', payAmount: 50 },
    { text: 'From sale of stock you get ₩50.', receiveAmount: 50 },
    { text: 'Get Out of JAIL Free.\rThis card may be kept until needed, or sold.', getOutOfJail: true },
    { text: 'Go to JAIL.\rGo directly to JAIL.\rDo not pass {field-name.go}.\rDo not collect ₩{field-price.go}.', moveToFieldId: 'jail', moveReverse: "when-shorter" },
    { text: "Holiday fund matures.\rReceive ₩100.", receiveAmount: 100 },
    { text: "Income tax refund.\rCollect ₩20.", receiveAmount: 20 },
    { text: "It is your birthday.\rCollect ₩10 from each player.", allOtherPlayersInvolved: true, receiveAmount: 10 },
    { text: "Life insurance matures.\rCollect ₩100.", receiveAmount: 100 },
    { text: "Pay hospital fees of ₩100.", payAmount: 100 },
    { text: "Pay school fees of ₩50.", payAmount: 50 },
    { text: "Receive ₩25 consultancy fee.", receiveAmount: 25 },
    { text: "You are assessed for street repairs.\r₩40 per house.\r₩115 per hotel.", payPerHouse: 40, payPerHotel: 115 },
    { text: "You have won second prize in a beauty contest.\rCollect ₩10.", receiveAmount: 10 },
    { text: "You inherit ₩100.", receiveAmount: 100 },
  ];
  return skin;
}
export function createSkinBerglern(): BoardSkin {
  var skin = new BoardSkin();
  skin.fieldNames['brown-1'] = 'Bach / Wasserfall';
  skin.fieldNames['brown-2'] = 'Mittlerer Isarkanal';
  skin.fieldNames['station-1'] = 'Mitterlern';
  skin.fieldNames['light-blue-1'] = 'Spielplatz Ridinger-straße';
  skin.fieldNames['light-blue-2'] = 'Spielplatz am Altwasser';
  skin.fieldNames['light-blue-3'] = 'Spielplatz Ringel-straße';
  skin.fieldNames['pink-1'] = 'Döner-laden';
  skin.fieldNames['utility-1'] = 'Weindl Radlader-betrieb';
  skin.fieldNames['pink-2'] = 'Roma Pizza Berglern';
  skin.fieldNames['pink-3'] = 'Bäckerei Grundner';
  skin.fieldNames['station-2'] = 'Niederlern';
  skin.fieldNames['orange-1'] = 'Cafe Foko';
  skin.fieldNames['orange-2'] = 'Praxis Berglern';
  skin.fieldNames['orange-3'] = 'fit+ Niederlern';
  skin.fieldNames['red-1'] = 'Kinderhaus die Strolche';
  skin.fieldNames['red-2'] = 'Zwergerl-haus';
  skin.fieldNames['red-3'] = 'Grund-schule Berglern';
  skin.fieldNames['station-3'] = 'Mooslern';
  skin.fieldNames['yellow-1'] = 'Horst Heiss Stahlbau';
  skin.fieldNames['yellow-2'] = 'Auto-zentrum Erding';
  skin.fieldNames['utility-2'] = 'WZV-Berglern';
  skin.fieldNames['yellow-3'] = 'Stoiber\rHolz';
  skin.fieldNames['green-1'] = 'Sport-gaststätte\rDa Massimo';
  skin.fieldNames['green-2'] = 'Sportplatz';
  skin.fieldNames['green-3'] = 'Feuerwehr Berglern';
  skin.fieldNames['station-4'] = 'Glaslern';
  skin.fieldNames['dark-blue-1'] = 'BEZ\rREWE';
  skin.fieldNames['dark-blue-2'] = 'BEZ\rApotheke';
  return skin;
}

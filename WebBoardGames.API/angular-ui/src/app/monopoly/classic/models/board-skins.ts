import { FieldId } from './fields';

export class BoardSkin {
  fieldNames: {
    [key in FieldId]: string;
  } = {} as any;
}

export function loadSkinCustom(custom: BoardSkin): BoardSkin {
  var defaultSkin = createSkinDefault();
  for (var key in defaultSkin.fieldNames) {
    if (!custom.fieldNames[key as FieldId]) {
      custom.fieldNames[key as FieldId] = defaultSkin.fieldNames[key as FieldId];
    }
  }
  return custom;
}

export function createSkinDefault(): BoardSkin {
  var skin = new BoardSkin();
  skin.fieldNames['go'] = 'Go';
  skin.fieldNames['brown-1'] = 'Old Kent Road';
  skin.fieldNames['community-chest-1'] = 'Community Chest';
  skin.fieldNames['brown-2'] = 'Whitechapel Road';
  skin.fieldNames['income-tax'] = 'Income Tax';
  skin.fieldNames['station-1'] = "King's Cross Station";
  skin.fieldNames['light-blue-1'] = 'The Angel Islington';
  skin.fieldNames['chance-1'] = 'Chance';
  skin.fieldNames['light-blue-2'] = 'Euston Road';
  skin.fieldNames['light-blue-3'] = 'Pentonville Road';
  skin.fieldNames['jail'] = 'In Jail / Just Visiting';
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
  skin.fieldNames['go-to-jail'] = 'Go To Jail';
  skin.fieldNames['green-1'] = 'Regent Street';
  skin.fieldNames['green-2'] = 'Oxford Street';
  skin.fieldNames['community-chest-3'] = 'Community Chest';
  skin.fieldNames['green-3'] = 'Bond Street';
  skin.fieldNames['station-4'] = 'Liverpool St. Station';
  skin.fieldNames['chance-3'] = 'Chance';
  skin.fieldNames['dark-blue-1'] = 'Park Lane';
  skin.fieldNames['luxury-tax'] = 'Luxury Tax';
  skin.fieldNames['dark-blue-2'] = 'Mayfair';
  return skin;
}
export function createSkinBerglern(): BoardSkin {
  var skin = new BoardSkin();
  skin.fieldNames['brown-1'] = 'Bach / Wasserfall';
  skin.fieldNames['brown-2'] = 'Mittlerer Isarkanal';
  skin.fieldNames['station-1'] = 'Mitterlern';
  skin.fieldNames['light-blue-1'] = 'Spielplatz Nikolausweg (Ridinger)';
  skin.fieldNames['light-blue-2'] = 'Spielplatz am Altwasser';
  skin.fieldNames['light-blue-3'] = 'Spielplatz Ringelstraße';
  skin.fieldNames['pink-1'] = 'Dönerladen';
  skin.fieldNames['utility-1'] = 'Weindl Radladerbetrieb';
  skin.fieldNames['pink-2'] = 'Roma Pizza Berglern';
  skin.fieldNames['pink-3'] = 'Bäckerei Grundner';
  skin.fieldNames['station-2'] = 'Niederlern';
  skin.fieldNames['orange-1'] = 'Cafe Foko';
  skin.fieldNames['orange-2'] = 'Praxis Berglern';
  skin.fieldNames['orange-3'] = 'fit+ Niederlern';
  skin.fieldNames['red-1'] = 'Kinderhaus die Strolche';
  skin.fieldNames['red-2'] = 'Zergerlhaus';
  skin.fieldNames['red-3'] = 'Grundschule Berglern';
  skin.fieldNames['station-3'] = 'Mooslern';
  skin.fieldNames['yellow-1'] = 'Horst Heiss Stahlbau';
  skin.fieldNames['yellow-2'] = 'Autozentrum Erding';
  skin.fieldNames['utility-2'] = 'Wasserzweckverband Berglerner Gruppe';
  skin.fieldNames['yellow-3'] = 'Stoiber-Holz';
  skin.fieldNames['green-1'] = 'Sportgaststätte - "da Massimo"';
  skin.fieldNames['green-2'] = 'Sportheim';
  skin.fieldNames['green-3'] = 'Feuerwehr Berglern';
  skin.fieldNames['station-4'] = 'Glaslern';
  skin.fieldNames['dark-blue-1'] = 'BEZ - REWE';
  skin.fieldNames['dark-blue-2'] = 'BEZ - Apotheke';
  return skin;
}

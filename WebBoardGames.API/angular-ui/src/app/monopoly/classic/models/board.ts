import { createSkinBerglern, createSkinDefault, loadSkinCustom } from './board-skins';
import { Field, FieldIds } from './fields';

export class Board {
  skin = loadSkinCustom(createSkinBerglern());
  fields: Field[] = [];

  reset() {
    this.fields = [];
    for (const id of FieldIds) this.fields.push({ id });
  }
}

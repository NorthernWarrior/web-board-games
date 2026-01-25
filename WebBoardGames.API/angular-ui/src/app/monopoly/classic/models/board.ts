import { createSkinBerglern, createSkinDefault, loadSkinCustom } from "./board-skins";


export class Board {
    skin = loadSkinCustom(createSkinBerglern());
}


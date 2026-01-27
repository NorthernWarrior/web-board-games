import { FieldId } from "./fields";

export interface Card {
    text: string;
    getOutOfJail?: boolean;
    payAmount?: number;
    payPerHouse?: number;
    payPerHotel?: number;
    receiveAmount?: number|FieldId; // if FieldId, get the price of that field
    allOtherPlayersInvolved?: boolean;
    moveToFieldId?: FieldId;
    moveToNearest?: 'station' | 'utility';
    moveSteps?: number;
    moveReverse?: boolean | "when-shorter";
    specialType?: "get-out-of-jail" | "pay-double-if-owned-by-others" | "pay-ten-times-amount-rolled";
}
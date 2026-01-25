export const FieldIds = [
  // First quartier
  'go',
  'brown-1',
  'community-chest-1',
  'brown-2',
  'tax-income',
  'station-1',
  'light-blue-1',
  'chance-1',
  'light-blue-2',
  'light-blue-3',
  // Second quartier
  'jail',
  'pink-1',
  'utility-1',
  'pink-2',
  'pink-3',
  'station-2',
  'orange-1',
  'community-chest-2',
  'orange-2',
  'orange-3',
  // Third quartier
  'free-parking',
  'red-1',
  'chance-2',
  'red-2',
  'red-3',
  'station-3',
  'yellow-1',
  'yellow-2',
  'utility-2',
  'yellow-3',
  // Fourth quartier
  'go-to-jail',
  'green-1',
  'green-2',
  'community-chest-3',
  'green-3',
  'station-4',
  'chance-3',
  'dark-blue-1',
  'tax-luxury',
  'dark-blue-2',
] as const;

export type FieldId = typeof FieldIds[number];

export interface Field {
  id: FieldId;
}
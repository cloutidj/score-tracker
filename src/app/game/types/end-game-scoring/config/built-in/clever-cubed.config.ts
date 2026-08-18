import { ScoringConfig } from '@game-types/end-game-scoring/_shared/models/scoring-config';

export const CleverCubedConfig: ScoringConfig = {
  id: 'built-in:clever-cubed',
  name: "Clever Cubed",
  builtIn: true,
  categories: [
    {
      id: 'yellow',
      name: 'Yellow',
      shortName: 'Yellow',
      description: 'Total points from yellow.',
      rule: { kind: 'flat' },
    },
    {
      id: 'teal',
      name: 'Teal',
      shortName: 'Teal',
      description: 'Total points from teal.',
      rule: { kind: 'flat' },
    },
    {
      id: 'purple',
      name: 'Purple',
      shortName: 'Purple',
      description: 'Total points from purple.',
      rule: { kind: 'flat' },
    },
    {
      id: 'brown',
      name: 'Brown',
      shortName: 'Brown',
      description: 'Total points from brown.',
      rule: { kind: 'flat' },
    },
    {
      id: 'pink',
      name: 'Pink',
      shortName: 'Pink',
      description: 'Total points from pink.',
      rule: { kind: 'flat' },
    },
    {
      id: 'foxes',
      name: 'Foxes',
      shortName: 'Foxes',
      description: 'Each fox is worth your lowest color score. Enter how many foxes you collected.',
      rule: {
        kind: 'aggregateMultiply',
        aggregate: 'min',
        categoryIds: ['yellow', 'teal', 'purple', 'brown', 'pink'],
      },
    },
  ],
};
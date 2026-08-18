import { ScoringConfig } from '@game-types/end-game-scoring/_shared/models/scoring-config';

export const twiceAsCleverConfig: ScoringConfig = {
  id: 'built-in:twice-as-clever',
  name: "Twice as Clever",
  builtIn: true,
  categories: [
    {
      id: 'silver',
      name: 'Silver',
      shortName: 'Silver',
      description: 'Total points from silver.',
      rule: { kind: 'flat' },
    },
    {
      id: 'yellow',
      name: 'Yellow',
      shortName: 'Yellow',
      description: 'Total points from yellow.',
      rule: { kind: 'flat' },
    },
    {
      id: 'blue',
      name: 'Blue',
      shortName: 'Blue',
      description: 'Total points from blue.',
      rule: { kind: 'flat' },
    },
    {
      id: 'green',
      name: 'Green',
      shortName: 'Green',
      description: 'Total points from green.',
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
        categoryIds: ['silver', 'yellow', 'blue', 'green', 'pink'],
      },
    },
  ],
};

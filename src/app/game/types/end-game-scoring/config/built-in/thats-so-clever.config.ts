import { ScoringConfig } from '@game-types/end-game-scoring/_shared/models/scoring-config';

export const thatsPrettyCleverConfig: ScoringConfig = {
  id: 'built-in:thats-pretty-clever',
  name: "That's Pretty Clever",
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
      id: 'orange',
      name: 'Orange',
      shortName: 'Orange',
      description: 'Total points from orange.',
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
      id: 'foxes',
      name: 'Foxes',
      shortName: 'Foxes',
      description: 'Each fox is worth your lowest color score. Enter how many foxes you collected.',
      rule: {
        kind: 'aggregateMultiply',
        aggregate: 'min',
        categoryIds: ['yellow', 'blue', 'green', 'orange', 'purple'],
      },
    },
  ],
};

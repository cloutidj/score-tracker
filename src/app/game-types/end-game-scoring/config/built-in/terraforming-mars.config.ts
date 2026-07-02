import { ScoringConfig } from '../../_shared/models/scoring-config';

/**
 * Terraforming Mars — mostly flat tallies plus a couple of per-unit multipliers. Tile/city
 * VP that depend on board adjacency are entered as a hand-counted total (`flat`).
 */
export const terraformingMarsConfig: ScoringConfig = {
  id: 'built-in:terraforming-mars',
  name: 'Terraforming Mars',
  builtIn: true,
  categories: [
    {
      id: 'tr',
      name: 'Terraform Rating',
      shortName: 'TR',
      description: 'Your Terraform Rating at game end. Counts directly as points.',
      rule: { kind: 'flat' },
    },
    {
      id: 'milestones',
      name: 'Milestones',
      shortName: 'Milestones',
      description: 'How many milestones you claimed. Each is worth 5 points.',
      rule: { kind: 'perUnit', pointsPerUnit: 5 },
    },
    {
      id: 'awards',
      name: 'Awards',
      shortName: 'Awards',
      description: 'Total points won from awards. Enter the points themselves.',
      rule: { kind: 'flat' },
    },
    {
      id: 'greeneries',
      name: 'Greenery tiles',
      shortName: 'Greenery',
      description: 'Number of greenery tiles you placed. Each is worth 1 point.',
      rule: { kind: 'perUnit', pointsPerUnit: 1 },
    },
    {
      id: 'cities',
      name: 'City tile points',
      shortName: 'Cities',
      description: 'Points from your city tiles (1 per adjacent greenery). Enter the total.',
      rule: { kind: 'flat' },
    },
    {
      id: 'cards',
      name: 'Card victory points',
      shortName: 'Cards',
      description: 'Victory points printed on your played cards. Enter the total.',
      rule: { kind: 'flat' },
    },
  ],
};

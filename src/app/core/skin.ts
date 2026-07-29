/**
 * The skins the app ships. A skin assigns every design token; its values live in
 * `src/styles/skins/_<name>.scss` and are selected by the `data-skin` attribute
 * {@link SkinService} sets on `<body>`. See docs/SKIN-AUTHORING.md.
 *
 * The list is the source of truth and the union is derived from it, so adding a
 * skin is one edit here plus the stylesheet — there is no second list to keep in
 * step. Order is the cycle order of the dev skin toggle; the first entry is the
 * default, and matches the `data-skin` hardcoded in `index.html`.
 */
export const SKINS = ['classic', 'neon', 'comic', 'neuro', 'pixel', 'fluid'] as const;

export type Skin = (typeof SKINS)[number];

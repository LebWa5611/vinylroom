/**
 * Stylelint config for SCSS sources.
 *
 * Uses the standard SCSS ruleset as a baseline and softens a few rules that
 * clash with the theme's current conventions (empty utility partials, mixed
 * naming for legacy classes). Tighten these once the SCSS is refactored.
 */

export default {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    'no-empty-source': null,
    'selector-class-pattern': null,
    'scss/dollar-variable-pattern': null,
    'scss/at-mixin-pattern': null,
    'scss/at-function-pattern': null,
    'scss/percent-placeholder-pattern': null,
    'scss/comment-no-empty': null,
    'scss/dollar-variable-empty-line-before': null,
    'comment-empty-line-before': null,
    'declaration-empty-line-before': null,
    'no-descending-specificity': null,
    // `clip: rect(...)` is still used in the `sr-only` accessibility mixin
    // for maximum screen-reader compatibility. Keep the rule off until the
    // mixin is refactored to `clip-path` with a legacy fallback.
    'property-no-deprecated': null,
  },
  ignoreFiles: ['dist/**', 'node_modules/**', '.cache/**'],
};

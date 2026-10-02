import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

/**
 * Single CSS pipeline: Autoprefixer + cssnano.
 *
 * Watch and production emit the same shape (`.min.css`), so cssnano
 * runs unconditionally. Vite's built-in `cssMinify` stays off so this
 * is the only place CSS is transformed.
 */
export default {
  plugins: [
    autoprefixer({ cascade: false }),
    cssnano({
      preset: [
        'default',
        {
          discardComments: { removeAll: true },
          normalizeUrl: false,
          mergeRules: true,
          uniqueSelectors: true,
        },
      ],
    }),
  ],
};

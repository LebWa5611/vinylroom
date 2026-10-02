/**
 * Image optimization tuning for the assets pipeline.
 *
 * Everything else about the build is fixed contract: entries are
 * auto-discovered from `src/`, outputs mirror the source tree under
 * `dist/`, JS/SCSS are always minified with external source maps, and
 * unknown source extensions are copied verbatim. This file only exposes
 * the knobs that meaningfully change the output artifact.
 */

export default {
  imageOptimization: {
    // JPEG quality (0-100). Higher = larger, cleaner files.
    jpegQuality: 80,

    // PNG quality (0-100). Sharp uses this to size the palette.
    pngQuality: 80,

    // WebP quality (0-100). Applies to native WebP sources.
    webpQuality: 80,

    // Run SVGO on `.svg` sources. Set to false to copy SVGs unchanged.
    optimizeSvg: true,
  },
};

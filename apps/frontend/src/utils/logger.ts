export const log = {
  info: (...a: unknown[]) => console.log('[kb]', ...a),
  warn: (...a: unknown[]) => console.warn('[kb]', ...a),
  error: (...a: unknown[]) => console.error('[kb]', ...a),
};

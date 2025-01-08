

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.BIyLZcl9.js","_app/immutable/chunks/scheduler.Bvac2VuE.js","_app/immutable/chunks/index.Ji3sbTeO.js","_app/immutable/chunks/entry.S4gBEKo4.js"];
export const stylesheets = [];
export const fonts = [];

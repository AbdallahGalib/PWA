import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.CCNH5Cwb.js","_app/immutable/chunks/scheduler.Bvac2VuE.js","_app/immutable/chunks/index.Ji3sbTeO.js"];
export const stylesheets = ["_app/immutable/assets/app.xTfApS7Q.css"];
export const fonts = [];

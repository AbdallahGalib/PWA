import { init } from '../serverless.js';

export const handler = init((() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","manifest.json","_redirects"]),
	mimeTypes: {".png":"image/png",".json":"application/json"},
	_: {
		client: {"start":"_app/immutable/entry/start.BD2vzLMt.js","app":"_app/immutable/entry/app.BB94S8HR.js","imports":["_app/immutable/entry/start.BD2vzLMt.js","_app/immutable/chunks/entry.S4gBEKo4.js","_app/immutable/chunks/scheduler.Bvac2VuE.js","_app/immutable/entry/app.BB94S8HR.js","_app/immutable/chunks/scheduler.Bvac2VuE.js","_app/immutable/chunks/index.Ji3sbTeO.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('../server/nodes/0.js')),
			__memo(() => import('../server/nodes/1.js'))
		],
		routes: [
			
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})());

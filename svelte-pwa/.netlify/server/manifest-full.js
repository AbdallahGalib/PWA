export const manifest = (() => {
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
		client: {"start":"_app/immutable/entry/start.Cq3_Lj9J.js","app":"_app/immutable/entry/app.BOmKWHzO.js","imports":["_app/immutable/entry/start.Cq3_Lj9J.js","_app/immutable/chunks/entry.cvtnAZzW.js","_app/immutable/chunks/scheduler.Bvac2VuE.js","_app/immutable/entry/app.BOmKWHzO.js","_app/immutable/chunks/scheduler.Bvac2VuE.js","_app/immutable/chunks/index.Ji3sbTeO.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","_redirects"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.DlCpGqiO.js","app":"_app/immutable/entry/app.CRr2YSd3.js","imports":["_app/immutable/entry/start.DlCpGqiO.js","_app/immutable/chunks/entry.BqDCohhD.js","_app/immutable/chunks/scheduler.Bvac2VuE.js","_app/immutable/entry/app.CRr2YSd3.js","_app/immutable/chunks/scheduler.Bvac2VuE.js","_app/immutable/chunks/index.Ji3sbTeO.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		routes: [
			
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

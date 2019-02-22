"use strict";

self.addEventListener( "install", e => {
	e.waitUntil( caches.open( "todomvc" ).then( cache => (
		cache.addAll( [
			"/todomvc-vanilla/",
			"/todomvc-vanilla/index.html",
			"/todomvc-vanilla/favicon.ico",
		] )
	) ) );
} );

self.addEventListener( "fetch", e => {
	console.log( "fetch", e.request.url );
	e.respondWith(
		caches.match( e.request )
			.then( response => response || fetch( e.request ) )
	);
} );

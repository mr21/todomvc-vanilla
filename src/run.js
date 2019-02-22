"use strict";

const todos = localStorage.getItem( "todos" ),
	todomvc = new TodoMVC();

document.body.prepend( todomvc.rootElement );

if ( todos ) {
	Object.entries( JSON.parse( todos ) )
		.sort( ( a, b ) => a[ 1 ].order < b[ 1 ].order ? -1 : a[ 1 ].order > b[ 1 ].order ? 1 : 0 )
		.forEach( ( [ id, obj ] ) => {
			todomvc.data[ id ] = obj;
		} );
}

window.onbeforeunload = () => {
	localStorage.setItem( "todos", JSON.stringify( todomvc.data ) );
};

window.onhashchange = () => {
	todomvc.setFilter( location.hash.split( "/" )[ 1 ] );
};

window.onhashchange();

if( navigator.serviceWorker ) {
	navigator.serviceWorker
		.register( "sw.js" )
		.then( () => console.log( "Service Worker Registered" ) );
}

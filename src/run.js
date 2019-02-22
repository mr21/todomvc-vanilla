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
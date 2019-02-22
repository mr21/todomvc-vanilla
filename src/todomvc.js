"use strict";

class TodoMVC {
	constructor() {
		const root = TodoMVC.template.cloneNode( true ),
			qs = n => root.querySelector( `.todomvc-${ n }` );

		this.rootElement = root;
		this._input = qs( "input" );
		this._checkAll = qs( "checkAll" );
		this._todolist = qs( "todos" );
		this._todosLeft = qs( "todosLeft" );
		this._nlTodo = this._todolist.getElementsByClassName( "todomvc-todo" );
		this._nlTodoDone = this._todolist.getElementsByClassName( "todomvc-done" );
		qs( "form" ).onsubmit = this._onsubmit.bind( this );
		qs( "clear" ).onclick = this._onclickClear.bind( this );
		this._checkAll.onclick = this._onclickCheckAll.bind( this );
		this.data = this._proxyCreate();
		this._onhashchange();
		this._updateTodosLeft();
	}

	clear() {
		Object.keys( this.data ).forEach( todoId => delete this.data[ todoId ] );
	}
	load( data ) {
		this.clear();
		Object.entries( data ).forEach( kv => this.data[ kv[ 0 ] ] = kv[ 1 ] );
	}

	// private:
	_updateTodosLeft() {
		const nDone = this._nlTodoDone.length,
			n = this._nlTodo.length - nDone;

		this.rootElement.classList.toggle( "todomvc-allDone", n === 0 );
		this.rootElement.classList.toggle( "todomvc-nothingDone", nDone === 0 );
		this.rootElement.classList.toggle( "todomvc-somethingToClear", nDone > 0 );
		this._todosLeft.textContent = `${ n } item${ n > 1 ? "s" : "" } left`;
	}

	// events:
	_onhashchange() {
		const [, filter ] = location.hash.split( "/" );

		this.rootElement.dataset.filter = filter || "";
	}
	_onsubmit() {
		const name = this._input.value;

		if ( name ) {
			const todoId = Math.random() + "";

			this._input.value = "";
			this.data[ todoId ] = { name };
		}
		return false;
	}
	_onclickCheckAll( e ) {
		const done = !this.rootElement.classList.contains( "todomvc-allDone" );

		Object.keys( this.data ).forEach( todoId => {
			this.data[ todoId ].done = done;
		} );
	}
	_onclickClear() {
		Object.entries( this.data ).forEach( kv => {
			if ( kv[ 1 ].done ) {
				delete this.data[ kv[ 0 ] ];
			}
		} );
	}

	// todo:
	_getTodo( id ) {
		return this._todolist.querySelector( `.todomvc-todo[data-id="${ id }"]` );
	}
	_addTodo( todoId ) {
		const root = TodoMVC.templateTodo.cloneNode( true ),
			qs = n => root.querySelector( `.todomvc-todo-${ n }` ),
			input = qs( "input" );

		root.dataset.id = todoId;
		input.onblur = this._onsubmitTodo.bind( this, todoId, input );
		input.onkeydown = this._onkeydownTodo.bind( this, todoId );
		input.ondblclick = this._ondblclickTodo.bind( this, todoId );
		qs( "form" ).onsubmit = input.onblur;
		qs( "delete" ).onclick = this._onclickDeleteTodo.bind( this, todoId );
		qs( "checkbox" ).onclick = this._onclickTodoCheck.bind( this, todoId );
		this._todolist.append( root );
	}
	_deleteTodo( todoId ) {
		this._getTodo( todoId ).remove();
	}
	_doTodo( todoId, done ) {
		this._getTodo( todoId ).classList.toggle( "todomvc-done", done );
	}
	_renameTodo( todoId, name ) {
		this._getTodo( todoId ).querySelector( ".todomvc-todo-input" ).value = name;
	}
	_readonlyTodo( todoId, b ) {
		const root = this._getTodo( todoId ),
			input = root.querySelector( ".todomvc-todo-input" );

		if ( b ) {
			this._input.focus();
			this._input.blur();
			input.value = this.data[ todoId ].name;
			input.setAttribute( "readonly", "" );
			root.classList.remove( "todomvc-editing" );
		} else {
			input.removeAttribute( "readonly" );
			root.classList.add( "todomvc-editing" );
		}
	}

	// todo events:
	_onkeydownTodo( todoId, e ) {
		if ( e.key === "Escape" ) {
			this._readonlyTodo( todoId, true );
		}
	}
	_onsubmitTodo( todoId, input ) {
		this.data[ todoId ].name = input.value;
		this._readonlyTodo( todoId, true );
		return false;
	}
	_ondblclickTodo( todoId ) {
		this._readonlyTodo( todoId, false );
	}
	_onclickTodoCheck( todoId ) {
		this.data[ todoId ].done = !this.data[ todoId ].done;
	}
	_onclickDeleteTodo( todoId ) {
		delete this.data[ todoId ];
	}

	// data:
	_proxyCreate() {
		return new Proxy( {}, {
			set: this._proxyAddTodo.bind( this ),
			deleteProperty: this._proxyDeleteTodo.bind( this ),
		} );
	}
	_proxyAddTodo( tar, todoId, obj ) {
		const prox = new Proxy( {}, {
			set: this._proxyUpdateTodo.bind( this, todoId )
		} );

		tar[ todoId ] = prox;
		this._addTodo( todoId );
		prox.name = obj.name || "";
		prox.done = obj.done || false;
		prox.order = obj.order || this._nlTodo.length;
		return true;
	}
	_proxyDeleteTodo( tar, todoId ) {
		delete tar[ todoId ];
		this._deleteTodo( todoId );
		this._updateTodosLeft();
		return true;
	}
	_proxyUpdateTodo( todoId, tar, prop, val ) {
		tar[ prop ] = val;
		switch ( prop ) {
			case "done":
				this._doTodo( todoId, val );
				this._updateTodosLeft();
				break;
			case "name":
				this._renameTodo( todoId, val );
				break;
		}
		return true;
	}
}

TodoMVC.template = document.querySelector( ".todomvc" );
TodoMVC.template.remove();

TodoMVC.templateTodo = document.querySelector( ".todomvc-todo" );
TodoMVC.templateTodo.remove();

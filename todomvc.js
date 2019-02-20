"use strict";

const todomvc = {
	init() {
		const root = document.querySelector( "#todomvc" ),
			todo = document.querySelector( ".todomvc-todo" ),
			todos = document.querySelector( "#todomvc-todos" ),
			form = document.querySelector( "#todomvc-form" ),
			input = document.querySelector( "#todomvc-input" ),
			clear = document.querySelector( "#todomvc-clear" ),
			checkAll = document.querySelector( "#todomvc-checkAll" ),
			todosLeft = document.querySelector( "#todomvc-todos-left" ),
			nlTodo = todos.getElementsByClassName( "todomvc-todo" ),
			nlTodoDone = todos.getElementsByClassName( "todomvc-done" );

		todo.remove();
		this._root = root;
		this._todo = todo;
		this._nlTodo = nlTodo;
		this._todolist = todos;
		this._checkAll = checkAll;
		this._todosLeft = todosLeft;
		this._nlTodoDone = nlTodoDone;
		this._input = input;
		this._todos = {};
		form.onsubmit = this._onsubmit.bind( this );
		clear.onclick = this._onclickClear.bind( this );
		checkAll.onclick = this._onclickCheckAll.bind( this );
		window.onhashchange = this._onhashchange.bind( this );
		this.data = this._proxyCreate();
		this._onhashchange();
		this._updateTodosLeft();
	},

	clear() {
		Object.keys( this.data ).forEach( todoId => delete this.data[ todoId ] );
	},
	load( data ) {
		this.clear();
		Object.entries( data ).forEach( kv => this.data[ kv[ 0 ] ] = kv[ 1 ] );
	},

	// private:
	_updateTodosLeft() {
		const nDone = this._nlTodoDone.length,
			n = this._nlTodo.length - nDone;

		this._root.classList.toggle( "todomvc-allDone", n === 0 );
		this._root.classList.toggle( "todomvc-nothingDone", nDone === 0 );
		this._root.classList.toggle( "todomvc-somethingToClear", nDone > 0 );
		this._todosLeft.textContent = `${ n } item${ n > 1 ? "s" : "" } left`;
	},

	// events:
	_onhashchange() {
		const [, filter ] = location.hash.split( "/" );

		this._root.dataset.filter = filter || "";
	},
	_onsubmit() {
		const name = this._input.value;

		if ( name ) {
			const todoId = Math.random() + "",
				order = this._nlTodo.length;

			this._input.value = "";
			this.data[ todoId ] = { name, order, done: false };
		}
		return false;
	},
	_onclickCheckAll( e ) {
		const done = !this._root.classList.contains( "todomvc-allDone" );

		Object.keys( this.data ).forEach( todoId => {
			this.data[ todoId ].done = done;
		} );
	},
	_onclickClear() {
		Object.entries( this.data ).forEach( kv => {
			if ( kv[ 1 ].done ) {
			delete this.data[ kv[ 0 ] ];
			}
		} );
	},

	// todo:
	_addTodo( todoId ) {
		const root = this._todo.cloneNode( true ),
			check = root.querySelector( ".todomvc-todo-checkbox" ),
			form = root.querySelector( ".todomvc-todo-form" ),
			input = root.querySelector( ".todomvc-todo-input" ),
			del = root.querySelector( ".todomvc-todo-delete" ),
			html = { root, check, input };

		this._todos[ todoId ] = html;
		root.dataset.id = todoId;
		del.onclick = this._onclickDeleteTodo.bind( this, todoId );
		input.onblur =
		form.onsubmit = this._onsubmitTodo.bind( this, todoId, input );
		check.onclick = this._onclickTodoCheck.bind( this, todoId );
		input.onkeydown = this._onkeydownTodo.bind( this, todoId );
		input.ondblclick = this._ondblclickTodo.bind( this, todoId );
		this._todolist.append( root );
	},
	_deleteTodo( todoId ) {
		this._todos[ todoId ].root.remove();
		delete this._todos[ todoId ];
	},
	_updateTodo( todoId, prop, val ) {
		const html = this._todos[ todoId ];

		switch ( prop ) {
			case "name": html.input.value = val; break;
			case "done": html.root.classList.toggle( "todomvc-done", val ); break;
		}
	},
	_readonlyTodo( todoId, b ) {
		const { root, input } = this._todos[ todoId ];

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
	},

	// todo events:
	_onkeydownTodo( todoId, e ) {
		if ( e.key === "Escape" ) {
			this._readonlyTodo( todoId, true );
		}
	},
	_onsubmitTodo( todoId, input ) {
		this.data[ todoId ].name = input.value;
		this._readonlyTodo( todoId, true );
		return false;
	},
	_ondblclickTodo( todoId ) {
		this._readonlyTodo( todoId, false );
	},
	_onclickTodoCheck( todoId ) {
		this.data[ todoId ].done = !this.data[ todoId ].done;
	},
	_onclickDeleteTodo( todoId ) {
		delete this.data[ todoId ];
	},

	// data:
	_proxyCreate() {
		return new Proxy( {}, {
			set: this._proxyAddTodo.bind( this ),
			deleteProperty: this._proxyDeleteTodo.bind( this ),
		} );
	},
	_proxyAddTodo( tar, todoId, obj ) {
		const prox = new Proxy( {}, {
			set: this._proxyUpdateTodo.bind( this, todoId )
		} );

		tar[ todoId ] = prox;
		this._addTodo( todoId );
		prox.name = obj.name;
		prox.done = obj.done;
		prox.order = obj.order;
		return true;
	},
	_proxyDeleteTodo( tar, todoId ) {
		delete tar[ todoId ];
		this._deleteTodo( todoId );
		this._updateTodosLeft();
		return true;
	},
	_proxyUpdateTodo( todoId, tar, prop, val ) {
		tar[ prop ] = val;
		this._updateTodo( todoId, prop, val );
		switch ( prop ) {
			case "done": this._updateTodosLeft(); break;
		}
		return true;
	},
};

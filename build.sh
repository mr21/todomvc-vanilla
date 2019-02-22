#!/bin/bash

declare -a HEADER=(
	'<!DOCTYPE html>'
	'<html lang="en">'
	'<head>'
	'<title>TodoMVC • Simple</title>'
	'<meta charset="UTF-8"/>'
	'<link rel="shortcut icon" href="favicon.ico">'
	'<meta name="viewport" content="width=device-width, user-scalable=no"/>'
	'<meta name="description" content="A simple implementation of the famous TodoMVC"/>'
)

declare -a HEADEREND=(
	'<script>function lg( a ) { return console.log.apply( console, arguments ), a; }</script>'
	'</head>'
	'<body>'
	'<noscript>This app needs JavaScript to run</noscript>'
)

declare -a CSSfiles=(
	"src/body.css"
	"src/footer.css"
	"src/todomvc.css"
)

declare -a HTMLfiles=(
	"src/todomvc.html"
	"src/footer.html"
)

declare -a JSfiles=(
	"src/todomvc.js"
	"src/run.js"
)

buildDev() {
	filename='index-dev.html'
	echo "Build $filename"
	printf '%s\n' "${HEADER[@]}" > $filename;
	printf '<link rel="stylesheet" href="%s"/>\n' "${CSSfiles[@]}" >> $filename;
	printf '%s\n' "${HEADEREND[@]}" >> $filename;
	cat "${HTMLfiles[@]}" >> $filename
	printf '<script src="%s"></script>\n' "${JSfiles[@]}" >> $filename;
	echo '</body>' >> $filename
	echo '</html>' >> $filename
}

buildProd() {
	filename='index.html'
	echo "Build $filename"
	printf '%s\n' "${HEADER[@]}" > $filename;
	echo '<style>' >> $filename
	cat "${CSSfiles[@]}" >> $filename
	echo '</style>' >> $filename
	printf '%s\n' "${HEADEREND[@]}" >> $filename;
	cat "${HTMLfiles[@]}" >> $filename
	echo '<script>' >> $filename
	echo '"use strict";' >> $filename
	cat "${JSfiles[@]}" | grep -v '"use strict";' >> $filename
	echo '</script>' >> $filename
	echo '</body>' >> $filename
	echo '</html>' >> $filename
}

if [ $# = 0 ]
then
	echo "'$0 dev' or '$0 prod'";
elif [ $1 = "prod" ]
then
	buildProd
elif [ $1 = "dev" ]
then
	buildDev
fi

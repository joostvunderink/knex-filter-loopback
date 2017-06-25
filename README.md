# knex-filter-loopback

Declarative filtering for `knex.js` based on the [Loopback Where Filter](https://loopback.io/doc/en/lb3/Where-filter.html). This module has been inspired by and based on [Constantin Titarenko's knex filter module](https://github.com/titarenko/knex-filter).

[![Build Status](https://secure.travis-ci.org/joostvunderink/knex-filter-loopback.png?branch=master)](https://travis-ci.org/joostvunderink/knex-filter-loopback) [![Coverage Status](https://coveralls.io/repos/joostvunderink/knex-filter-loopback/badge.png)](https://coveralls.io/r/joostvunderink/knex-filter-loopback)

[![NPM](https://nodei.co/npm/knex-filter-loopback.png?downloads=true&stars=true)](https://nodei.co/npm/knex-filter-loopback/)

## Installation

```bash
npm i knex-filter-loopback --save
```

## Usage

```js
var whereFilter = require('knex-filter-loopback').whereFilter;

knex('tablename')
	.where(whereFilter({
		a: 'b',
		'c': { '>': 12 },
		'd': { 'in': [1, 2, 3] },
		e: null,
		not: { f: null },
		or: [
			{ k: 1 },
			{ k: 5 },
			{ m: { 'like': '%Bob%' },
		],
	}))
	.then(console.log);
```

## Motivation

Imagine you have page with filterable table, user changes state of your filter controls and presses "apply": you need to pass that filter to backend to obtain filtered set from it. I'm sure you had such case. Was it tedious to walk trough query string and imperatively build your query using `knex.js`? Forget it, you can now provide filter object from your frontend to your backend and apply it with no effort!

## License

MIT

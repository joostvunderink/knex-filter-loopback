var should = require('should');
var knex = require('knex')({ client: 'pg' });
var whereFilter = require('../').whereFilter;

describe('knex-filter-loopback', function () {
  var testData2 = [
    {
      name    : 'query with null value',
      where   : { a: null },
      sql     : 'select * from "t" where ("a" is null)',
      bindings: [],
    },
  ];  
  var testData = [
    {
      name    : 'empty query',
      where   : {},
      sql     : 'select * from "t"',
      bindings: [],
    },
    {
      name    : 'query with key/value in key/value',
      where   : { a: 5 },
      sql     : 'select * from "t" where ("a" = ?)',
      bindings: [5],
    },
    {
      name    : 'query with value using "=" operator',
      where   : { a: { '=': 5 } },
      sql     : 'select * from "t" where ("a" = ?)',
      bindings: [5],
    },
    {
      name    : 'query with value using ">" operator',
      where   : { a: { '>': 5 } },
      sql     : 'select * from "t" where ("a" > ?)',
      bindings: [5],
    },
    {
      name    : 'query with value using "gt" operator',
      where   : { a: { 'gt': 5 } },
      sql     : 'select * from "t" where ("a" > ?)',
      bindings: [5],
    },
    {
      name    : 'query with value using "<" operator',
      where   : { a: { '<': 5 } },
      sql     : 'select * from "t" where ("a" < ?)',
      bindings: [5],
    },
    {
      name    : 'query with value using "lt" operator',
      where   : { a: { 'lt': 5 } },
      sql     : 'select * from "t" where ("a" < ?)',
      bindings: [5],
    },
    {
      name    : 'query with value using ">=" operator',
      where   : { a: { '>=': 5 } },
      sql     : 'select * from "t" where ("a" >= ?)',
      bindings: [5],
    },
    {
      name    : 'query with value using "gte" operator',
      where   : { a: { 'gte': 5 } },
      sql     : 'select * from "t" where ("a" >= ?)',
      bindings: [5],
    },
    {
      name    : 'query with value using "<=" operator',
      where   : { a: { '<=': 5 } },
      sql     : 'select * from "t" where ("a" <= ?)',
      bindings: [5],
    },
    {
      name    : 'query with value using "lte" operator',
      where   : { a: { 'lte': 5 } },
      sql     : 'select * from "t" where ("a" <= ?)',
      bindings: [5],
    },
    {
      name    : 'query with value using "in" operator',
      where   : { a: { 'in': [5, 8, 12] } },
      sql     : 'select * from "t" where ("a" in (?, ?, ?))',
      bindings: [5, 8, 12],
    },
    {
      name    : 'query with value using "between" operator',
      where   : { a: { 'between': [5, 12] } },
      sql     : 'select * from "t" where ("a" between ? and ?)',
      bindings: [5, 12],
    },
    {
      name    : 'query with value using "like" operator',
      where   : { a: { 'like': '%banana%' } },
      sql     : 'select * from "t" where ("a" like ?)',
      bindings: ['%banana%'],
    },
    {
      name    : 'query with value using "ilike" operator',
      where   : { a: { 'ilike': '%banana%' } },
      sql     : 'select * from "t" where ("a" ilike ?)',
      bindings: ['%banana%'],
    },
    {
      name    : 'query with null value',
      where   : { a: null },
      sql     : 'select * from "t" where ("a" is null)',
      bindings: [],
    },
    {
      name    : 'query with null value in "=" operator',
      where   : { a: { '=': null } },
      sql     : 'select * from "t" where ("a" is null)',
      bindings: [],
    },
    {
      name    : 'query with not null value',
      where   : { not: { a: null } },
      sql     : 'select * from "t" where (not ("a" is null))',
      bindings: [],
    },
    {
      name    : 'query with null value in "=" operator',
      where   : { not: { a: { '=': null } } },
      sql     : 'select * from "t" where (not ("a" is null))',
      bindings: [],
    },
    {
      name    : 'query with value using "not" operator',
      where   : { not: { 'a': 5 } },
      sql     : 'select * from "t" where (not ("a" = ?))',
      bindings: [5],
    },
    {
      name    : 'query with value using "!" operator',
      where   : { '!': { 'a': 5 } },
      sql     : 'select * from "t" where (not ("a" = ?))',
      bindings: [5],
    },
    {
      name    : 'query with 2 key/value pairs',
      where   : { a: 5, b: 6 },
      sql     : 'select * from "t" where ("a" = ? and "b" = ?)',
      bindings: [5, 6],
    },
    {
      name    : 'query with "or"',
      where   : { or: [ { a: 5 }, { b: 6} ] },
      sql     : 'select * from "t" where ((("a" = ?) or ("b" = ?)))',
      bindings: [5, 6],
    },
    {
      name    : 'query with "and"',
      where   : { and: [ { a: 5 }, { b: 6} ] },
      sql     : 'select * from "t" where ((("a" = ?) and ("b" = ?)))',
      bindings: [5, 6],
    },
    {
      name    : 'query with "or" with two variables per or',
      where   : { or: [ { a: 5, b: 3 }, { a: 2,  b: 6} ] },
      sql     : 'select * from "t" where ((("a" = ? and "b" = ?) or ("a" = ? and "b" = ?)))',
      bindings: [5, 3, 2, 6],
    },
    {
      name    : 'query with "or" with two operations',
      where   : { or: [ { a: { '>': 5 } }, { b: { '<': 6 } } ] },
      sql     : 'select * from "t" where ((("a" > ?) or ("b" < ?)))',
      bindings: [5, 6],
    },
    {
      name    : 'query with "or" with nested "and"',
      where   : {
        or: [
          { 
            and: [
              { a: { '>': 10 } },
              { b: { '>': 20 } },
            ]
          },
          { 
            and: [
              { a: { '<': 4 } },
              { b: { '<': 6 } },
            ]
          },
        ]
      },
      sql     : 'select * from "t" where ((((("a" > ?) and ("b" > ?))) or ((("a" < ?) and ("b" < ?)))))',
      bindings: [10, 20, 4, 6],
    },
  ];

  describe('whereFilter', function () {
    testData.forEach(function(td) {
      it('should build ' + td.name, function() {
        var s = knex('t').where(whereFilter(td.where)).toSQL();
        s.sql.should.eql(td.sql);
        s.bindings.should.eql(td.bindings);
      });
    })
  });

});

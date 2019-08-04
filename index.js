var _ = require('lodash');

module.exports = {
  registerHandler: registerHandler,
  whereFilter: whereFilter
};

function registerHandler (op, handler, overwrite) {
  if (_.isObject(op)) {
    _.each(op, _.partialRight(registerHandler, overwrite));
    return;
  }
  if (handlers[op] && !overwrite) {
    throw new Error('Handler is already registered: ' + op + '!');
  }
  handlers[op] = handler;
}

var fieldlessCommands = ['and', 'or', 'not', '!', 'related'];

var handlers = {
  '='      : eqHandler,
  '>'      : _.partial(comparisonHandler, '>'),
  '<'      : _.partial(comparisonHandler, '<'),
  '>='     : _.partial(comparisonHandler, '>='),
  '<='     : _.partial(comparisonHandler, '<='),
  'gt'     : _.partial(comparisonHandler, '>'),
  'lt'     : _.partial(comparisonHandler, '<'),
  'gte'    : _.partial(comparisonHandler, '>='),
  'lte'    : _.partial(comparisonHandler, '<='),
  'in'     : _.partial(arrayArgHandler, 'whereIn'),
  'between': _.partial(arrayArgHandler, 'whereBetween'),
  'like'   : _.partial(comparisonHandler, 'like'),
  'ilike'  : _.partial(comparisonHandler, 'ilike'),
  '!'      : notHandler,
  'not'    : notHandler,
  'and'    : _.partial(logicalHandler, 'where'),
  'or'     : _.partial(logicalHandler, 'orWhere'),
  'related' : relationHandler
};

function eqHandler (field, arg) {
  if (arg === null) {
    this.whereNull(field);
  } else {
    this.where(field, arg);
  }
}

function comparisonHandler (op, field, arg) {
  this.where(field, op, arg);
}

function arrayArgHandler (op, field, arg) {
  if (!_.isArray(arg) || _.isEmpty(arg)) {
    return;
  }
  this[op](field, arg);
}

function notHandler (field, arg) {
  this.whereNot(whereFilter(arg));
}

function relationHandler (field, arg) {
  if (typeof this.whereHas === 'undefined') {
    throw new TypeError('whereHas function is not available, you should use bookshelf-eloquent plugin.');
  }
  _.each(arg, function(filter, relation) {
    this.whereHas(relation, function(query) {
      query.where(whereFilter(filter));
    });
  }, this);
}

function logicalHandler (op, field, arg) {
  if (_.isArray(arg)) {
    if (_.isEmpty(arg)) {
      return;
    }
    this.where(function () {
      _.each(arg, function (arg) {
        this[op](whereFilter(arg));
      }.bind(this));
    });
    return;
  }
  if (!_.isObject(arg)) {
    return;
  }
  if (op === 'where') {
    return walkLevel.call(this, arg);
  }
  this.where(function () {
    _.each(arg, function (arg, commandText) {
      var zo = _.zipObject([commandText], [arg]);
      // console.log('zo: %s', JSON.stringify(zo));
      this[op](whereFilter(_.zipObject([commandText], [arg])));
    }.bind(this));
  });
}

function parseCommand(key, value) {
  if (value === null) {
    return {
      field  : key,
      command: '=',
      val    : value,
    };
  }

  if (_.includes(fieldlessCommands, key)) {
    return {
      field  : null,
      command: key,
      val    : value,
    };
  }

  if (typeof value === 'object') {
    var command = Object.keys(value)[0];
    return {
      field  : key,
      command: command,
      val    : value[command],
    }
  }
  return {
    field  : key,
    command: '=',
    val    : value,
  };
}

function walkLevel (level) {
  var builder = this;
  _.each(compactObject(level), function (value, key) {
    var command = parseCommand(key, value);
    handlers[command.command].call(builder, command.field, command.val);
  });
}

function whereFilter (query) {
  return function () {
    walkLevel.call(this, query);
  };
}

function compactObject (o) {
  return _.omit(o, function (v) {
    return v === undefined || (_.isArray(v) || _.isString(v)) && _.isEmpty(v);
  });
}

'use strict';

var options = {
  'count': {
    'total': 12,
    'lower': 1,
    'upper': 1,
    'symbol': 1
  },
  'chars': {
    'lower': 'abcdefghijklmnopqrstuvwxyz',
    'upper': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'digit': '0123456789',
    'symbol': '+-=_@#$%^&;:,.<>/~\\[](){}?!|*'
  }
};

// From: https://github.com/lodash/lodash/blob/master/sample.js
function sample(array) {
  const length = array == null ? 0 : array.length
  return length ? array[Math.floor(Math.random() * length)] : undefined
}

// From: https://github.com/lodash/lodash/blob/master/shuffle.js
function shuffle(array) {
  var length = array == null ? 0 : array.length;
  if (!length) { return []; }

  var index = -1;
  var lastIndex = length - 1;
  var result = array;
  while (++index < length) {
    var rand = index + Math.floor(Math.random() * (lastIndex - index + 1));
    var value = result[rand];
    result[rand] = result[index];
    result[index] = value;
  }
  return result
}

function bindEvents(thisArg, events) {
   Object.keys(events).forEach(function (selector) {
        Object.keys(events[selector]).forEach(function (event) {
            var handler = events[selector][event].bind(thisArg);
            if('document' === selector) {
                document.addEventListener(event, handler, false);
            } else if ('window' === selector) {
                window.addEventListener(event, handler, false);
            } else {
                document.querySelectorAll(selector).forEach(function (dom) {
                    dom.addEventListener(event, handler, false);
                });
            }
        });
    }); // all events bound
}

var app = {
  snackbar: null,
  password: '',

  init: function () {
    bindEvents(this, {
        'document': { 'deviceready': this.render },
        'window': { 'load': this.render },
        'form input': { 'change': this.change },
        '#btn-copy': { 'click': this.copy },
        '#btn-new': { 'click': this.renew }
    });

    this.snackbar = document.querySelector('#toast');
    this.password = this.generate();

    return this;
  },

  generate: function () {
    var result = '';
    var chars = '';

    Object.keys(options.chars).forEach(function (v) {
        for(var i = 0; i < options.count[v]; i++) {
            result += sample(options.chars[v]);
            chars += options.chars[v];
        }
    });//end forEach: added minimum required charachters

    while(result.length < options.count.total) {
        result += sample(chars); // pick more charachters
    }//end while: have the correct length

    return shuffle(result.split('')).join('');
  },

  render: function () {
    Object.keys(options.count).forEach(function (label) {
        document.querySelector('#count_' + label).parentElement
                .MaterialTextfield.change(options.count[label]);
    });

    document.querySelector('#chars_symbol').parentElement
            .MaterialTextfield.change(options.chars.symbol);

    document.querySelector('.password').innerText = this.password;
    return this;
  },

  change: function () {
    var total = 0;
    Object.keys(options.count).forEach(function (label) {
        options.count[label] = document.querySelector('#count_' + label).value;
        if ('total' !== label) { total += parseInt(options.count[label], 10); }
    });
    // if you want more characters than you've specified, bump it up
    options.count.total = Math.max(options.count.total, total);

    options.chars.symbol = document.querySelector('#chars_symbol').value;

    return this.renew();
  },

  copy: function () {
    cordova.plugins.clipboard.copy(this.password);
    this.snackbar.MaterialSnackbar.showSnackbar({message: 'Password copied!'});
    return this;
  },

  renew: function () {
    this.password = this.generate();
    return this.render();
  }
};

app.init();

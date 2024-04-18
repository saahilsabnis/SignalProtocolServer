'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _X25519_ZERO = new Float64Array([0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000]);
var _X25519_ONE = new Float64Array([0x0001, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000]);
var _X25519_NINE = new Uint8Array(32);
var _X25519_121665 = new Float64Array([0xDB41, 0x0001, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000]);

_X25519_NINE[0] = 9;

var X25519 = function () {
  function X25519() {
    _classCallCheck(this, X25519);
  }

  _createClass(X25519, null, [{
    key: 'getPublic',

    value: function getPublic(secret) {
      if (secret.byteLength !== 32) {
        throw new Error('Secret wrong length, should be 32 bytes.');
      }

      var p = new Uint8Array(secret);
      X25519.clamp(p);

      return X25519.scalar_mult(p, _X25519_NINE);
    }


  }, {
    key: 'getSharedKey',
    value: function getSharedKey(secretKey, publicKey) {
      if (secretKey.byteLength !== 32 || publicKey.byteLength !== 32) {
        throw new Error('Secret key or public key wrong length, should be 32 bytes.');
      }

      var p = new Uint8Array(secretKey);
      X25519.clamp(p);

      return X25519.scalar_mult(p, publicKey);
    }


  }, {
    key: 'add_func',
    value: function add_func(result, augent, addend) {
      for (var i = 0; i < 16; i++) {
        result[i] = augent[i] + addend[i] | 0;
      }
    }


  }, {
    key: 'sub_func',
    value: function sub_func(result, minuend, subtrahend) {
      for (var i = 0; i < 16; i++) {
        result[i] = minuend[i] - subtrahend[i] | 0;
      }
    }


  }, {
    key: 'mult_func',
    value: function mult_func(result, multiplier, multiplicand) {
      var i = 0;
      var j = 0;
      var carry = new Float64Array(31);

      for (i = 0; i < 16; i++) {
        for (j = 0; j < 16; j++) {
          carry[i + j] += multiplier[i] * multiplicand[j];
        }
      }

      for (i = 0; i < 15; i++) {
        carry[i] += 38 * carry[i + 16];
      }

      X25519.car25519(carry);
      X25519.car25519(carry);

      X25519.copy_func(result, carry);
    }


  }, {
    key: 'sqr_func',
    value: function sqr_func(result, values) {
      X25519.mult_func(result, values, values);
    }


  }, {
    key: 'scalar_mult',
    value: function scalar_mult(multiplier, multiplicand) {
      var carry = new Float64Array(80);

      var a = new Float64Array(_X25519_ONE);
      var b = new Float64Array(_X25519_ZERO);
      var c = new Float64Array(_X25519_ZERO);
      var d = new Float64Array(_X25519_ONE);
      var e = new Float64Array(_X25519_ZERO);
      var f = new Float64Array(_X25519_ZERO);

      var z = new Uint8Array(multiplier);

      var r = 0;

      X25519.unpack(carry, multiplicand);

      X25519.copy_func(b, carry);

      for (var i = 254; i >= 0; --i) {
        r = z[i >>> 3] >>> (i & 7) & 1;

        X25519.sel25519(a, b, r);
        X25519.sel25519(c, d, r);

        X25519.add_func(e, a, c);
        X25519.sub_func(a, a, c);

        X25519.add_func(c, b, d);
        X25519.sub_func(b, b, d);

        X25519.sqr_func(d, e);
        X25519.sqr_func(f, a);

        X25519.mult_func(a, c, a);
        X25519.mult_func(c, b, e);

        X25519.add_func(e, a, c);
        X25519.sub_func(a, a, c);

        X25519.sqr_func(b, a);
        X25519.sub_func(c, d, f);

        X25519.mult_func(a, c, _X25519_121665);
        X25519.add_func(a, a, d);

        X25519.mult_func(c, c, a);
        X25519.mult_func(a, d, f);
        X25519.mult_func(d, b, carry);

        X25519.sqr_func(b, e);

        X25519.sel25519(a, b, r);
        X25519.sel25519(c, d, r);
      }

      for (var _i = 0; _i < 16; _i++) {
        carry[_i + 16] = a[_i];
        carry[_i + 32] = c[_i];
        carry[_i + 48] = b[_i];
        carry[_i + 64] = d[_i];
      }

      var x32 = carry.subarray(32);
      var x16 = carry.subarray(16);

      X25519.inv15519(x32, x32);
      X25519.mult_func(x16, x16, x32);

      var result = new Uint8Array(32);

      X25519.pack(result, x16);

      return result;
    }


  }, {
    key: 'inv15519',
    value: function inv15519(result, values) {
      var carry = new Float64Array(16);

      X25519.copy_func(carry, values);

      for (var i = 253; i >= 0; i--) {
        X25519.sqr_func(carry, carry);
        if (i !== 2 && i !== 4) {
          X25519.mult_func(carry, carry, values);
        }
      }

      X25519.copy_func(result, carry);
    }


  }, {
    key: 'sel25519',
    value: function sel25519(result, q, b) {
      var tmp = 0;
      var carry = ~(b - 1);

      // compute //
      for (var i = 0; i < 16; i++) {
        tmp = carry & (result[i] ^ q[i]);
        result[i] ^= tmp;
        q[i] ^= tmp;
      }
    }


  }, {
    key: 'car25519',
    value: function car25519(values) {
      var carry = 0;

      for (var i = 0; i < 16; i++) {
        values[i] += 65536;
        carry = Math.floor(values[i] / 65536);
        values[(i + 1) * (i < 15 ? 1 : 0)] += carry - 1 + 37 * (carry - 1) * (i === 15 ? 1 : 0);
        values[i] -= carry * 65536;
      }
    }

  }, {
    key: 'unpack',
    value: function unpack(result, values) {
      for (var i = 0; i < 16; i++) {
        result[i] = values[2 * i] + (values[2 * i + 1] << 8);
      }
    }


  }, {
    key: 'pack',
    value: function pack(result, values) {
      var m = new Float64Array(16);
      var tmp = new Float64Array(16);
      var i = 0;
      var carry = 0;

      
      X25519.copy_func(tmp, values);

      X25519.car25519(tmp);
      X25519.car25519(tmp);
      X25519.car25519(tmp);

      for (var j = 0; j < 2; j++) {
        m[0] = tmp[0] - 0xFFED;

        for (i = 1; i < 15; i++) {
          m[i] = tmp[i] - 0xFFFF - (m[i - 1] >> 16 & 1);
          m[i - 1] &= 0xFFFF;
        }

        m[15] = tmp[15] - 0x7FFF - (m[14] >> 16 & 1);
        carry = m[15] >> 16 & 1;
        m[14] &= 0xFFFF;

        X25519.sel25519(tmp, m, 1 - carry);
      }

      for (i = 0; i < 16; i++) {
        result[2 * i] = tmp[i] & 0xFF;
        result[2 * i + 1] = tmp[i] >> 8;
      }
    }


  }, {
    key: 'copy_func',
    value: function copy_func(destination, source) {
      var len = source.length;
      for (var i = 0; i < len; i++) {
        destination[i] = source[i];
      }
    }

  }, {
    key: 'clamp',
    value: function clamp(bytes) {
      bytes[0] = bytes[0] & 0xF8;
      bytes[31] = bytes[31] & 0x7F | 0x40;
    }
  }]);

  return X25519;
}();

if (typeof module !== 'undefined') {
  module.exports = X25519;
}

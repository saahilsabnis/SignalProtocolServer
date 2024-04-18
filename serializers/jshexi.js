'use strict'

var JSHexi = (function () {
  /** Base 16 Alphabet **/
  var _JENCB16 = '0123456789abcdef'
  var _JDECB16 = [
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, 0, 1,
    2, 3, 4, 5, 6, 7, 8, 9, -1, -1, -1, -1,
    -1, -1, -1, 10, 11, 12, 13, 14, 15, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, 10, 11, 12, 13, 14, 15
  ]

  var _JENCB64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  var _JDECB64 = [
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, 62, -1, 63, 52, 53, 54,
    55, 56, 57, 58, 59, 60, 61, -1, -1, -1, 0, -1, -1, -1, 0, 1, 2, 3, 4,
    5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
    24, 25, -1, -1, -1, -1, 63, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34,
    35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51
  ]

  return {

    fromBase16: function (data) {
      this._checkLength(data.length, 2)

      var result = new Uint8Array(data.length >> 1)

      for (var i = 0; i < result.length; i++) {
        result[i] = _JDECB16[data.charCodeAt(2 * i)] << 4 | _JDECB16[data.charCodeAt(2 * i + 1)]
      }

      return result
    },


    fromBase64: function (data) {
      var dlen = data.length
      var rlen = dlen * 3 / 4

      if (dlen % 2 === 0) {
        if (data[dlen - 1] === '=') {
          dlen--
          rlen--
        }

        if (data[dlen - 1] === '=') {
          dlen--
          rlen--
        }
      }

      var result = new Uint8Array(rlen)
      var dcounter = 0
      var rcounter = 0
      var buff = 0

      while (dlen >= 4) {
        buff = _JDECB64[data.charCodeAt(dcounter++)] << 18 |
          _JDECB64[data.charCodeAt(dcounter++)] << 12 |
          _JDECB64[data.charCodeAt(dcounter++)] << 6 |
          _JDECB64[data.charCodeAt(dcounter++)]

        result[rcounter++] = (buff >> 16) & 0xFF
        result[rcounter++] = (buff >> 8) & 0xFF
        result[rcounter++] = buff & 0xFF

        dlen -= 4
      }

      switch (rlen - rcounter) {
        case 2: {
          buff = _JDECB64[data.charCodeAt(dcounter++)] << 18 |
            _JDECB64[data.charCodeAt(dcounter++)] << 12 |
            _JDECB64[data.charCodeAt(dcounter++)] << 6

          result[rcounter++] = (buff >> 16) & 0xFF
          result[rcounter++] = (buff >> 8) & 0xFF

          break
        }

        case 1 : {
          buff = _JDECB64[data.charCodeAt(dcounter++)] << 18 |
            _JDECB64[data.charCodeAt(dcounter++)] << 12

          result[rcounter++] = (buff >> 16) & 0xFF

          break
        }
      }

      return result
    },

    toBase64: function (data) {
      this._checkForUint8Array(data)

      var dlen = data.length
      var result = ''
      var buff
      var dcounter = 0

      while (dlen >= 3) {
        buff = data[dcounter++] << 16 | data[dcounter++] << 8 | data[dcounter++]

        result += _JENCB64[buff >> 18 & 0x3F]
        result += _JENCB64[buff >> 12 & 0x3F]
        result += _JENCB64[buff >> 6 & 0x3F]
        result += _JENCB64[buff & 0x3F]

        dlen -= 3
      }

      switch (dlen) {
        case 2 : {
          buff = data[dcounter++] << 16 | data[dcounter++] << 8
          result += _JENCB64[buff >> 18 & 0x3F]
          result += _JENCB64[buff >> 12 & 0x3F]
          result += _JENCB64[buff >> 6 & 0x3F]
          result += '='

          break
        }

        case 1 : {
          buff = data[dcounter++] << 16
          result += _JENCB64[buff >> 18 & 0x3F]
          result += _JENCB64[buff >> 12 & 0x3F]
          result += '=='

          break
        }
      }

      return result
    },

    toBase16: function (data) {
      this._checkForUint8Array(data)

      var result = ''

      for (var i = 0; i < data.length; i++) {
        result = result.concat(_JENCB16[data[i] >>> 4], _JENCB16[data[i] & 0x0F])
      }

      return result
    },


    isUnicodeString: function (data) {
      for (var i = 0; i < data.length; i++) {
        if (data.charCodeAt(i) > 0xFF) {
          return true
        }
      }

      return false
    },

    toBytes: function (data, unicode) {
      unicode = typeof unicode === 'undefined' ? true : unicode

      this._checkForUnicode(data, unicode)

      var buffer = new Uint8Array(unicode ? data.length << 1 : data.length)
      var i, code

      for (i = 0; i < data.length; i++) {
        code = data.charCodeAt(i)

        if (unicode) {
          buffer[i * 2] = (code >> 8) & 0xFF
          buffer[i * 2 + 1] = code & 0xFF
        } else {
          buffer[i] = code
        }
      }

      return buffer
    },

    fromBytes: function (data, unicode) {
      unicode = typeof unicode === 'undefined' ? true : unicode

      this._checkForUint8Array(data)

      var udata = (unicode) ? new Uint16Array(data.length / 2) : data

      if (unicode) {
        for (var i = 0; i < udata.length; i++) {
          udata[i] = ((data[2 * i] << 8) | (data[2 * i + 1])) & 0xFFFF
        }
      }

      return udata.reduce(function (carry, charCode) {
          return carry + String.fromCharCode(charCode)
        }, ''
      )
    },

    _checkForUnicode: function (data, unicode) {
      if (!unicode && this.isUnicodeString(data)) {
        throw new Error('Unicode char in data!')
      }
    },

    _checkLength: function (length, mod) {
      if (length % mod !== 0) {
        throw new Error('Data string has wrong length!')
      }
    },

    _checkForUint8Array: function (data) {
      if (!(data instanceof Uint8Array)) {
        throw new Error('Data not byte array!')
      }
    }
  }
})()

module.exports = JSHexi

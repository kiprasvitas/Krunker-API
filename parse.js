var Base64Binary = {
			_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

			/* will return a  Uint8Array type */
			decodeArrayBuffer: function(input) {
				var bytes = Math.ceil((3 * input.length) / 4.0);
				var ab = new ArrayBuffer(bytes);
				this.decode(input, ab);

				return ab;
			},

			decode: function(input, arrayBuffer) {
				//get last chars to see if are valid
				var lkey1 = this._keyStr.indexOf(input.charAt(input.length - 1));
				var lkey2 = this._keyStr.indexOf(input.charAt(input.length - 1));

				var bytes = Math.ceil((3 * input.length) / 4.0);
				if (lkey1 == 64) bytes--; //padding chars, so skip
				if (lkey2 == 64) bytes--; //padding chars, so skip
				var uarray;
				var chr1, chr2, chr3;
				var enc1, enc2, enc3, enc4;
				var i = 0;
				var j = 0;

				if (arrayBuffer) uarray = new Uint8Array(arrayBuffer);
				else uarray = new Uint8Array(bytes);

				input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

				for (i = 0; i < bytes; i += 3) {
					//get the 3 octects in 4 ascii chars
					enc1 = this._keyStr.indexOf(input.charAt(j++));
					enc2 = this._keyStr.indexOf(input.charAt(j++));
					enc3 = this._keyStr.indexOf(input.charAt(j++));
					enc4 = this._keyStr.indexOf(input.charAt(j++));

					chr1 = (enc1 << 2) | (enc2 >> 4);
					chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
					chr3 = ((enc3 & 3) << 6) | enc4;

					uarray[i] = chr1;
					if (enc3 != 64) uarray[i + 1] = chr2;
					if (enc4 != 64) uarray[i + 2] = chr3;
				}

				return uarray;
			}
		}


		// http://jsfromhell.com/geral/utf-8
		function bufToString(buf) {
			var uint8Buff = new Uint8Array(buf);
			var byteCount = uint8Buff.byteLength;
			var output = "";
			var a, b;
			for (var i = 0; i < byteCount; i++) {
				a = uint8Buff[i];
				if (a & 0x80) {
					b = uint8Buff[i + 1];
					if (((a & 0xfc) == 0xc0) && ((b & 0xc0) == 0x80)) {
						output += String.fromCharCode(((a & 0x03) << 6) + (b & 0x3f));
					} else {
						output += String.fromCharCode(128);
						i++;
					}
				} else {
					output += String.fromCharCode(a);
				}
			}
			return output;
		}

		// javascript msgpack parsing taken from
		// https://github.com/creationix/msgpack-js/blob/master/msgpack.js
		// and then heavily tweaked to my needs
		function decode(dataView) {
			var offset = 0;

			function map(length) {
				var value = {};
				for (var i = 0; i < length; i++) {
					var key = parse();
					value[key] = parse();
				}
				return value;
			}

			function raw(length) {
				var value = bufToString(dataView.buffer.slice(offset, offset + length));
				offset += length;
				return value;
			}

			function array(length) {
				var value = new Array(length);
				for (var i = 0; i < length; i++) {
					value[i] = parse();
				}
				return value;
			}

			function parse() {
				var type = dataView.getUint8(offset);
				var value, length;
				switch (type) {
					// nil
				case 0xc0:
					offset++;
					return null;
					// false
				case 0xc2:
					offset++;
					return false;
					// true
				case 0xc3:
					offset++;
					return true;
					// bin 8
				case 0xc4:
					length = dataView.getUint8(offset + 1);
					var startOffset = offset;
					offset += 2;
					var result = raw(length);
					return result;
					// bin 16
				case 0xc5:
					length = dataView.getUint16(offset + 1);
					var startOffset = offset;
					offset += 3;
					var result = raw(length);
					return result;
					// bin 32
				case 0xc6:
					length = dataView.getUint32(offset + 1);
					var startOffset = offset;
					offset += 5;
					var result = raw(length);
					return result;
					// float
				case 0xca:
					value = dataView.getFloat32(offset + 1);
					offset += 5;
					return value;
					// double
				case 0xcb:
					value = dataView.getFloat64(offset + 1);
					offset += 9;
					return value;
					// uint8
				case 0xcc:
					value = dataView.getUint8(offset + 1);
					offset += 2;
					return value;
					// uint 16
				case 0xcd:
					value = dataView.getUint16(offset + 1);
					offset += 3;
					return value;
					// uint 32
				case 0xce:
					value = dataView.getUint32(offset + 1);
					offset += 5;
					return value;
					// uint64
				case 0xcf:
					// value = buffer.readUInt64BE(offset + 1);
					offset += 9;
					return Infinity;
					// int 8
				case 0xd0:
					value = dataView.getInt8(offset + 1);
					offset += 2;
					return value;
					// int 16
				case 0xd1:
					value = dataView.getInt16(offset + 1);
					offset += 3;
					return value;
					// int 32
				case 0xd2:
					value = dataView.getInt32(offset + 1);
					offset += 5;
					return value;
					// int 64
				case 0xd3:
					offset += 9;
					return Infinity;
					// map 16
				case 0xde:
					length = dataView.getUint16(offset + 1);
					var startOffset = offset;
					offset += 3;
					var result = map(length);
					return result;
					// map 32
				case 0xdf:
					length = dataView.getUint32(offset + 1);
					var startOffset = offset;
					offset += 5;
					var result = map(length);
					return result;
					// array 16
				case 0xdc:
					length = dataView.getUint16(offset + 1);
					var startOffset = offset;
					offset += 3;
					var result = array(length);
					return result;
					// array 32
				case 0xdd:
					length = dataView.getUint32(offset + 1);
					var startOffset = offset;
					offset += 5;
					var result = array(length);
					return result;
					// raw 8
				case 0xd9:
					length = dataView.getUint8(offset + 1);
					var startOffset = offset;
					offset += 2;
					var result = raw(length);
					return result;
					// raw 16
				case 0xda:
					length = dataView.getUint16(offset + 1);
					var startOffset = offset;
					offset += 3;
					var result = raw(length);
					return result;
					// raw 32
				case 0xdb:
					length = dataView.getUint32(offset + 1);
					var startOffset = offset;
					offset += 5;
					var result = raw(length);
					return result;
				}
				// FixRaw
				if ((type & 0xe0) === 0xa0) {
					length = type & 0x1f;
					var startOffset = offset;
					offset++;
					var result = raw(length);
					return result;
				}
				// FixMap
				if ((type & 0xf0) === 0x80) {
					length = type & 0x0f;
					var startOffset = offset;
					offset++;
					var result = map(length);
					return result;
				}
				// FixArray
				if ((type & 0xf0) === 0x90) {
					length = type & 0x0f;
					var startOffset = offset;
					offset++;
					var result = array(length);
					return result;
				}
				// Positive FixNum
				if ((type & 0x80) === 0x00) {
					offset++;
					return type;
				}
				// Negative Fixnum
				if ((type & 0xe0) === 0xe0) {
					value = dataView.getInt8(offset);
					offset++;
					return value;
				}
				throw new Error("Unknown type 0x" + type.toString(16));
			}
			var value = parse();
			if (offset !== dataView.byteLength) {
				var overflow = dataView.byteLength - offset;
				var remainBytes = dataView.buffer.slice(offset, overflow);

				// if (remainBytes.byteLength) {
				//     setTimeout(function() {
				//         try {
				//             errlog("attempting to parse trailing chars");
				//             errlog(decode(new DataView(remainBytes)));
				//         } catch (e) {
				//             errlog("Error parsing input: " + e.message);
				//             e.stack && errlog(e.stack);
				//         }
				//     }, 0)
				// }
			}
			return value;
		}

		function parseBase64(input) {
			var buff = null;
			try {
				buff = Base64Binary.decodeArrayBuffer(input);
				var dataView = new DataView(buff);
				return JSON.stringify(decode(dataView), null, 2);
			} catch (e) {
				return "Error parsing input: " + e.message;
			}
		}
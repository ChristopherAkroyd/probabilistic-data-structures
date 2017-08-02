
class BitArray {
  constructor(bits) {
    const bytes = Math.ceil(bits / 8);
    this.buffer = Buffer.alloc(bytes, 0);
    this.length = bits;
  }

  /**
   *
   * @param  {Number} index we want to find the byte in the buffer it is part of.
   * @returns {Number} which byte this index is located in.
   */
  byte(index) {
    // Right shift by 3 places to divide by 8.
    return index >>> 3;
  }

  /**
   *
   * @param  {Number} index we want to find the byte in the buffer it is part of.
   * @returns {Number} A number representing a binary value with a single bit set on that index.
   */
  bit(index) {
    // e.g. index 5 returns 00010000
    return (1 << (index % 8));
  }

  /**
   *
   * @param {Number} index we want to set.
   * @param {Boolean} bitVal whether we want to set it to 1 or 0 (true/false).
   */
  setBit(index, bitVal) {
    const byteIndex = this.byte(index);
    const bit = this.bit(index);
    if (bitVal) {
      this.buffer[byteIndex] |= bit;
    } else {
      this.buffer[byteIndex] &= ~bit;
    }
  }

  /**
   *
   * @param {Number} index we want to get.
   * @return {Boolean} the value at this bit.
   */
  getBit(index) {
    return (this.buffer[this.byte(index)] & this.bit(index)) !== 0;
  }
}

module.exports = BitArray;

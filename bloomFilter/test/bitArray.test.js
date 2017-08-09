const chai = require('chai');

const BitArray = require('../bitArray.js');

chai.should();

const smallBitArraySize = 4;
const medBitArraySize = 16;
const largeBitArraySize = 32;


describe('BitArray', () => {
  describe('constructor', () => {
    it('Should create a bit array with the correct length.', () => {
      const bitArraySmall = new BitArray(smallBitArraySize);
      const bitArrayMed = new BitArray(medBitArraySize);
      const bitArrayLarge = new BitArray(largeBitArraySize);


      bitArraySmall.length.should.equal(smallBitArraySize);
      bitArrayMed.length.should.equal(medBitArraySize);
      bitArrayLarge.length.should.equal(largeBitArraySize);
    });
  });

  describe('.setBit(index, bitVal)', () => {
    it('Should return True for every other bit that has been set.', () => {
      const bitArray = new BitArray(largeBitArraySize);

      for (let i = 0; i < bitArray.length; i += 1) {
        if (i % 2 === 0) {
          bitArray.setBit(i, true);
        }
      }

      for (let i = 0; i < bitArray.length; i += 1) {
        if (i % 2 === 0) {
          bitArray.getBit(i).should.equal(true);
        } else {
          bitArray.getBit(i).should.equal(false);
        }
      }
    });

    it('Should return True for every third bit that has been set.', () => {
      const bitArray = new BitArray(largeBitArraySize);

      for (let i = 0; i < bitArray.length; i += 1) {
        if (i % 3 === 0) {
          bitArray.setBit(i, true);
        }
      }

      for (let i = 0; i < bitArray.length; i += 1) {
        if (i % 3 === 0) {
          bitArray.getBit(i).should.equal(true);
        } else {
          bitArray.getBit(i).should.equal(false);
        }
      }
    });

    it('Should return True for all bits when all bits are set.', () => {
      const bitArray = new BitArray(largeBitArraySize);

      for (let i = 0; i < bitArray.length; i += 1) {
        bitArray.setBit(i, true);
      }

      for (let i = 0; i < bitArray.length; i += 1) {
        bitArray.getBit(i).should.equal(true);
      }
    });

    it('Should handle non-boolean values.', () => {
      const bitArray = new BitArray(largeBitArraySize);

      for (let i = 0; i < bitArray.length; i += 1) {
        if (i % 2 === 0) {
          bitArray.setBit(i, 1);
        } else if (i % 3 === 0) {
          bitArray.setBit(i, {});
        } else {
          bitArray.setBit(i, []);
        }
      }

      for (let i = 0; i < bitArray.length; i += 1) {
        bitArray.getBit(i).should.equal(true);
      }
    });
  });

  describe('.getBit(index)', () => {
    it('Should return False when the bit array has no bits set.', () => {
      const bitArray = new BitArray(largeBitArraySize);

      for (let i = 0; i < bitArray.length; i += 1) {
        bitArray.getBit(i).should.equal(false);
      }
    });

    it('Should return True when all the bits are set.', () => {
      const bitArray = new BitArray(largeBitArraySize);

      for (let i = 0; i < bitArray.length; i += 1) {
        bitArray.setBit(i, true);
      }

      for (let i = 0; i < bitArray.length; i += 1) {
        bitArray.getBit(i).should.equal(true);
      }
    });
  });

  describe('.numberOfBitsSet()', () => {
    it('Should return 0 when the bit array has no bits set.', () => {
      const bitArray = new BitArray(largeBitArraySize);
      bitArray.numberOfBitsSet().should.equal(0);
    });

    it('Should return the the length of the BitArray when all bits are set.', () => {
      const bitArray = new BitArray(largeBitArraySize);

      for (let i = 0; i < bitArray.length; i += 1) {
        bitArray.setBit(i, true);
      }

      bitArray.numberOfBitsSet().should.equal(largeBitArraySize);
    });

    it('Should return the correct number of bits that have been set.', () => {
      const bitArray = new BitArray(largeBitArraySize);
      const bitsToSet = Math.ceil(largeBitArraySize / 3);

      for (let i = 0; i < bitsToSet; i += 1) {
        bitArray.setBit(i, true);
      }

      bitArray.numberOfBitsSet().should.equal(bitsToSet);
    });
  });

  describe('.bit(index)', () => {
    it('Should return the same value for the same index.', () => {
      const bitArray = new BitArray(largeBitArraySize);
      const bitStrings = [];

      for (let i = 0; i < bitArray.length; i += 1) {
        bitStrings.push(bitArray.bit(i).toString(2));
      }

      for (let i = 0; i < bitArray.length; i += 1) {
        bitArray.bit(i).toString(2).should.equal(bitStrings[i]);
      }
    });

    it('Should return a value higher than 0 for an index greater than 0.', () => {
      const bitArray = new BitArray(largeBitArraySize);

      const bit = bitArray.bit(52);

      bit.should.be.above(0);
    });
  });

  describe('.byte(index)', () => {
    it('Should return the same byte index for the given bit index.', () => {
      const bitArray = new BitArray(largeBitArraySize);
      const indices = [];

      for (let i = 0; i < bitArray.length; i += 1) {
        indices.push(bitArray.byte(i));
      }

      for (let i = 0; i < bitArray.length; i += 1) {
        bitArray.byte(i).should.equal(indices[i]);
      }
    });
  });
});

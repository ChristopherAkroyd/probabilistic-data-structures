const chai = require('chai');

const BitArray = require('../bitArray.js');

chai.should();

const smallBitArraySize = 4;
const medBitArraySize = 16;
const largeBitArraySize = 32;


describe('Bucket', () => {
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
        bitArray.setBit(i, false);
      }

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
});

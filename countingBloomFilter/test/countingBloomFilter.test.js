const chai = require('chai');

const BloomFilter = require('../countingBloomFilter.js');

const expect = chai.expect;
chai.should();

const bloomSizeSmall = 32;
const bloomSizeMed = 128;
const bloomSizeLarge = 252;

const numHashSmall = 4;
const numHashMed = 8;
const numHashLarge = 16;

const foo = 'foo';
const bar = 'bar';

describe('CountingBloomFilter', () => {
  describe('constructor', () => {
    it('Should create a BloomFilter with the correct length in bits and number of hash functions.', () => {
      const bloomSmall = new BloomFilter(bloomSizeSmall, numHashSmall);
      const bloomMed = new BloomFilter(bloomSizeMed, numHashMed);
      const bloomLarge = new BloomFilter(bloomSizeLarge, numHashLarge);

      bloomSmall.m.should.equal(bloomSizeSmall);
      bloomSmall.k.should.equal(numHashSmall);

      bloomMed.m.should.equal(bloomSizeMed);
      bloomMed.k.should.equal(numHashMed);


      bloomLarge.m.should.equal(bloomSizeLarge);
      bloomLarge.k.should.equal(numHashLarge);
    });

    it('Should initialise the underlying BitArray to the correct length.', () => {
      const bloomSmall = new BloomFilter(bloomSizeSmall, numHashSmall);
      const bloomMed = new BloomFilter(bloomSizeMed, numHashMed);
      const bloomLarge = new BloomFilter(bloomSizeLarge, numHashLarge);

      bloomSmall.bitArray.length.should.equal(bloomSizeSmall);
      bloomMed.bitArray.length.should.equal(bloomSizeMed);
      bloomLarge.bitArray.length.should.equal(bloomSizeLarge);
    });
  });

  describe('.calculateBitIndices(key)', () => {
    it('Should calculate an array of indices of the correct length.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashMed);

      bloom.calculateBitIndices(foo).length.should.equal(numHashMed);
      bloom.calculateBitIndices(bar).length.should.equal(numHashMed);
    });

    it('Should calculate an array of indices which are within the bounds of the BitArray.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashMed);

      const indicesFoo = bloom.calculateBitIndices(foo);
      const indicesBar = bloom.calculateBitIndices(bar);

      indicesFoo.length.should.below(bloomSizeMed);
      indicesBar.length.should.below(bloomSizeMed);
    });

    it('Should calculate different indices for different elements.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashMed);

      const indicesFoo = bloom.calculateBitIndices(foo);
      const indicesBar = bloom.calculateBitIndices(bar);

      indicesFoo.should.not.deep.equal(indicesBar);
    });

    it('Should calculate the same indices for the same element.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashMed);

      const indicesFoo = bloom.calculateBitIndices(foo);
      const indicesFooTwo = bloom.calculateBitIndices(foo);

      indicesFoo.should.deep.equal(indicesFooTwo);
    });
  });

  describe('.contains(key)', () => {
    it('Should return False when no items have been added to the filter.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashMed);

      bloom.contains(foo).should.equal(false);
      bloom.contains(bar).should.equal(false);
    });

    it('Should return True when an item has been added to the filter.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashMed);

      bloom.add(foo);
      bloom.contains(foo).should.equal(true);
    });

    it('Should return True for all items that have been added to the filter.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashMed);

      bloom.add(foo);
      bloom.contains(foo).should.equal(true);

      bloom.add(bar);
      bloom.contains(bar).should.equal(true);
    });

    it('Should return False when we test for an item not added to the filter.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashMed);

      bloom.add(foo);
      bloom.contains(bar).should.equal(false);
    });
  });

  describe('.add(key)', () => {
    it('Should add the element to the filter and increment the count to match.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(foo);
      const fooBitsSet = bloom.numberOfBitsSet();
      fooBitsSet.should.be.above(0);

      bloom.add(bar);
      const barBitsSet = bloom.numberOfBitsSet();
      barBitsSet.should.be.above(fooBitsSet);

    });

    it('Should be able to handle the addition of numbers to the filter.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(1);
      bloom.numberOfBitsSet().should.be.above(0);
    });

    it('Should increment the count with each successful addition.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(foo);
      bloom.count.should.equal(1);

      bloom.add(bar);
      bloom.count.should.equal(2);
    });

    it('Should not increment the count when an element is already in the filter.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(foo);
      bloom.count.should.equal(1);

      bloom.add(bar);
      bloom.count.should.equal(2);

      bloom.add(foo);
      bloom.count.should.equal(2);
    });

    it('Should set the correct indices in the bit array.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(foo);

      const indices = bloom.calculateBitIndices(foo);

      for (let i = 0; i < indices.length; i += 1) {
        bloom.bitArray[indices[i]].should.at.least(1);
      }
    });
  });

  describe('.falsePositiveRate()', () => {
    it('Should return a value of 0 when no items have been entered into the filter.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.falsePositiveRate().should.equal(0);
    });

    it('Should return a value greater than 0 when an items have been entered into the filter.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(foo);
      bloom.add(bar);
      bloom.falsePositiveRate().should.be.above(0);
    });

    it('Should return a value greater than the previous when more items are added to the filter.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashSmall);

      for (let i = 0; i < bloomSizeMed / 2; i += 1) {
        bloom.add(foo + i);
      }

      const fooPositive = bloom.falsePositiveRate();
      fooPositive.should.be.above(0);
      bloom.add(bar);
      bloom.falsePositiveRate().should.be.above(fooPositive);
    });
  });

  describe('.numberOfBitsSet()', () => {
    it('Should return 0 when the bit array has no bits set.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashSmall);
      bloom.numberOfBitsSet().should.equal(0);
    });

    it('Should return the the length of the BitArray when all bits are set.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashSmall);

      for (let i = 0; i < bloom.bitArray.length; i += 1) {
        bloom.bitArray[i] = 1;
      }

      bloom.numberOfBitsSet().should.equal(bloom.bitArray.length);
    });

    it('Should return the correct number of bits that have been set.', () => {
      const bloom = new BloomFilter(bloomSizeLarge, numHashSmall);
      const bitsToSet = Math.ceil(bloomSizeLarge / 3);

      for (let i = 0; i < bitsToSet; i += 1) {
        bloom.bitArray[i] = 1;
      }

      bloom.numberOfBitsSet().should.equal(bitsToSet);
    });
  });

  describe('.delete(key)', () => {
    it('Should delete an element from the filter.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(foo);
      const fooBitsSet = bloom.numberOfBitsSet();
      fooBitsSet.should.be.above(0);

      bloom.remove(foo);
      const barBitsSet = bloom.numberOfBitsSet();
      barBitsSet.should.be.below(fooBitsSet);
    });

    it('Should not be able to remove an item not added to the filter.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(foo);
      const fooBitsSet = bloom.numberOfBitsSet();
      fooBitsSet.should.be.above(0);

      bloom.remove(bar);
      const barBitsSet = bloom.numberOfBitsSet();
      barBitsSet.should.equal(fooBitsSet);
    });

    it('Should decrement the count with each successful deletion.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(foo);
      bloom.add(bar);
      bloom.count.should.equal(2);

      bloom.remove(foo);
      bloom.count.should.equal(1);

      bloom.remove(bar);
      bloom.count.should.equal(0);
    });

    it('Should not decrement the count if an element is not in the filter.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(foo);
      bloom.remove(bar);

      bloom.count.should.equal(1);
    });

    it('Should decrement the correct cells in the filter.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(foo);

      const indices = bloom.calculateBitIndices(foo);

      for (let i = 0; i < indices.length; i += 1) {
        bloom.bitArray[indices[i]].should.at.least(1);
      }

      bloom.remove(foo);

      for (let i = 0; i < indices.length; i += 1) {
        bloom.bitArray[indices[i]].should.at.least(0);
      }
    });
  });

  describe('.calcAppropriateArray(numCells, maxValue)', () => {
    it('Should return Arrays with a length of 32.', () => {
      const uInt8Array = BloomFilter.calcAppropriateArray(bloomSizeSmall, 0xFF);
      const uInt16Array = BloomFilter.calcAppropriateArray(bloomSizeSmall, 0xFFFF);
      const uInt32Array = BloomFilter.calcAppropriateArray(bloomSizeSmall, 0xFFFFFFFF);

      uInt8Array.length.should.equal(bloomSizeSmall);
      uInt16Array.length.should.equal(bloomSizeSmall);
      uInt32Array.length.should.equal(bloomSizeSmall);
    });

    it('Should return different typed arrays for the max value.', () => {
      const uInt8Array = BloomFilter.calcAppropriateArray(bloomSizeSmall, 0xFF);
      const uInt16Array = BloomFilter.calcAppropriateArray(bloomSizeSmall, 0xFFFF);
      const uInt32Array = BloomFilter.calcAppropriateArray(bloomSizeSmall, 0xFFFFFFFF);

      uInt8Array.should.be.instanceof(Uint8Array);
      uInt16Array.should.be.instanceof(Uint16Array);
      uInt32Array.should.be.instanceof(Uint32Array);
    });

    it('Should return different typed arrays for different max values and with different lengths.', () => {
      const uInt8Array = BloomFilter.calcAppropriateArray(bloomSizeMed, 0xFF);
      const uInt16Array = BloomFilter.calcAppropriateArray(bloomSizeLarge, 0xFFFF);
      const uInt32Array = BloomFilter.calcAppropriateArray(bloomSizeSmall, 0xFFFFFFFF);

      uInt8Array.length.should.equal(bloomSizeMed);
      uInt16Array.length.should.equal(bloomSizeLarge);
      uInt32Array.length.should.equal(bloomSizeSmall);
    });

    it('Should throw an error for invalid values (out of Uint bounds).', () => {
      expect(() => BloomFilter.calcAppropriateArray(bloomSizeSmall, -0xFF)).to.throw();
      expect(() => BloomFilter.calcAppropriateArray(bloomSizeSmall, 0xFFFFFFFFFFFF)).to.throw();
    });
  });
});

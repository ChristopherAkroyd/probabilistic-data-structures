const chai = require('chai');

const BloomFilter = require('../bloomfilter.js');
const BitArray = require('../bitArray.js');

chai.should();

const bloomSizeSmall = 32;
const bloomSizeMed = 128;
const bloomSizeLarge = 252;

const numHashSmall = 4;
const numHashMed = 8;
const numHashLarge = 16;

const foo = 'foo';
const bar = 'bar';

describe('BloomFilter', () => {
  describe('constructor', () => {
    it('Should create a BloomFilter with the correct length in bits and number of hash functions.', () => {
      const bloomSmall = new BloomFilter(bloomSizeSmall, numHashSmall);
      const bloomMed = new BloomFilter(bloomSizeMed, numHashMed);
      const bloomLarge = new BloomFilter(bloomSizeLarge, numHashLarge);

      bloomSmall.size.should.equal(bloomSizeSmall);
      bloomSmall.kHashFunctions.should.equal(numHashSmall);

      bloomMed.size.should.equal(bloomSizeMed);
      bloomMed.kHashFunctions.should.equal(numHashMed);


      bloomLarge.size.should.equal(bloomSizeLarge);
      bloomLarge.kHashFunctions.should.equal(numHashLarge);
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

      console.log(indicesFoo);
      console.log(indicesBar);

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

    it('Should return True when the items have been added to the filter.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashMed);

      bloom.add(foo);
      bloom.count.should.equal(1);
      bloom.contains(foo).should.equal(true);

      bloom.add(bar);
      bloom.contains(bar).should.equal(true);
      bloom.count.should.equal(2);
    });

    it('Should return False when we test for an item not added to the filter.', () => {
      const bloom = new BloomFilter(bloomSizeMed, numHashMed);

      bloom.add(foo);
      bloom.contains(foo).should.equal(true);
      bloom.contains(bar).should.equal(false);
    });
  });

  describe('.add(key)', () => {
    it('Should add the element to the filter and increment the count to match.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(foo);
      bloom.count.should.equal(1);


      bloom.add(bar);
      bloom.count.should.equal(2);
    });

    it('Should be able to handle the addition of numbers to the filter.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(1);
      bloom.count.should.equal(1);
    });

    it('Should contain all the items added.', () => {
      const bloom = new BloomFilter(bloomSizeSmall, numHashSmall);

      bloom.add(foo);
      bloom.contains(foo).should.equal(true);

      bloom.add(bar);
      bloom.contains(bar).should.equal(true);
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
  });
});

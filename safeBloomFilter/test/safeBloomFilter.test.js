const chai = require('chai');

const SafeBloomFilter = require('../safeBloomFilter');

chai.should();
const expect = chai.expect;

const noInserts = 0;

const expectedInsertsSmall = 1000;
const expectedInsertsMed = 15000;
const expectedInsertsLarge = 1000000;

const fpRateLow = 0.01;
const fpRateHigh = 0.2;
const fpRateErrorLow = -4.0;
const fpRateErrorHigh = 2.0;

const foo = 'foo';
const bar = 'bar';

describe('SafeBloomFilter', () => {
  describe('constructor', () => {
    it('Should create a BloomFilter with the correct length.', () => {
      const bloom = new SafeBloomFilter(expectedInsertsLarge, fpRateHigh);

      bloom.size.should.equal(SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateHigh));
    });

    it('Should create a BloomFilter with the correct number of hash functions.', () => {
      const bloom = new SafeBloomFilter(expectedInsertsLarge, fpRateHigh);

      const numBits = SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateHigh);
      bloom.kHashFunctions.should.equal(SafeBloomFilter.optimalNumHashFunctions(expectedInsertsLarge, numBits));
    });

    it('Should initialise the capacity to the correct value.', () => {
      const bloomSmall = new SafeBloomFilter(expectedInsertsMed, fpRateLow);
      const bloomLarge = new SafeBloomFilter(expectedInsertsLarge, fpRateHigh);

      bloomSmall.capacity.should.equal(expectedInsertsMed);
      bloomLarge.capacity.should.equal(expectedInsertsLarge);
    });
  });

  describe('.estimateNumberBits(key)', () => {
    it('Should throw an error for a value greater than 1 and less than 0.', () => {
      // Not following the Should convention due to difficulty getting test to function
      // with the should api.
      expect(() => SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateErrorLow)).to.throw();
      expect(() => SafeBloomFilter.estimateNumberBits(expectedInsertsMed, fpRateErrorHigh)).to.throw();
    });

    it('Should return a value of 0 for a capacity of 0.', () => {
      SafeBloomFilter.estimateNumberBits(noInserts, noInserts).should.equal(noInserts);
    });

    it('Should return a non-negative value.', () => {
      SafeBloomFilter.estimateNumberBits(noInserts, fpRateLow).should.be.above(-1);
      SafeBloomFilter.estimateNumberBits(expectedInsertsMed, fpRateLow).should.be.above(-1);
      SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateHigh).should.be.above(-1);
    });

    it('Should return a positive value greater than 0 for a capacity greater than 0.', () => {
      SafeBloomFilter.estimateNumberBits(expectedInsertsMed, fpRateLow).should.be.above(0);
      SafeBloomFilter.estimateNumberBits(expectedInsertsMed, fpRateHigh).should.be.above(0);
      SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateLow).should.be.above(0);
      SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateHigh).should.be.above(0);
    });

    it('Should return a different value for greatly differing capacities at different fp rates.', () => {
      const smallLowBloom = SafeBloomFilter.estimateNumberBits(expectedInsertsMed, fpRateLow);
      const smallHighBloom = SafeBloomFilter.estimateNumberBits(expectedInsertsMed, fpRateHigh);
      const largeLowBloom = SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateLow);
      const largeHighBloom = SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateHigh);

      smallLowBloom.should.not.be.oneOf([smallHighBloom, largeLowBloom, largeHighBloom]);
      smallHighBloom.should.not.be.oneOf([smallLowBloom, largeLowBloom, largeHighBloom]);
      largeLowBloom.should.not.be.oneOf([smallLowBloom, smallHighBloom, largeHighBloom]);
      largeHighBloom.should.not.be.oneOf([smallLowBloom, smallLowBloom, largeLowBloom]);
    });
  });

  describe('.optimalNumHashFunctions(key)', () => {
    const bitsLow = SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateLow);
    const bitsHigh = SafeBloomFilter.estimateNumberBits(expectedInsertsLarge, fpRateHigh);

    it('Should return a the min value of 1 for a 0 capacity.', () => {
      SafeBloomFilter.optimalNumHashFunctions(0, 0).should.equal(1);
      SafeBloomFilter.optimalNumHashFunctions(-3646, 48).should.equal(1);
    });

    it('Should return a value greater than 1 for different given capacities.', () => {
      SafeBloomFilter.optimalNumHashFunctions(expectedInsertsLarge, bitsLow).should.be.above(1);
      SafeBloomFilter.optimalNumHashFunctions(expectedInsertsLarge, bitsHigh).should.be.above(1);
    });

    it('Should return a different number for vastly different capacities and sizes.', () => {
      const smallCapacity = SafeBloomFilter.optimalNumHashFunctions(expectedInsertsSmall, SafeBloomFilter.estimateNumberBits(expectedInsertsSmall, fpRateHigh));
      SafeBloomFilter.optimalNumHashFunctions(expectedInsertsLarge, bitsHigh).should.not.equal(smallCapacity);
    });

    it('Should return a value greater number for a lower desired false positive rate.', () => {
      const largeNumHashes = SafeBloomFilter.optimalNumHashFunctions(expectedInsertsLarge, bitsLow);
      SafeBloomFilter.optimalNumHashFunctions(expectedInsertsLarge, bitsHigh).should.be.above(largeNumHashes);
    });
  });

  describe('.addSafe(key)', () => {
    it('Should correctly add an item to the bloom filter.', () => {
      const bloom = new SafeBloomFilter(expectedInsertsLarge, fpRateHigh);

      bloom.addSafe(foo).should.equal(true);
      bloom.addSafe(bar).should.equal(true);

      bloom.count.should.equal(2);
      bloom.bitArray.numberOfBitsSet().should.be.above(0);
    });

    it('Should return True when an item was successfully added.', () => {
      const bloom = new SafeBloomFilter(expectedInsertsLarge, fpRateHigh);

      bloom.addSafe(foo).should.equal(true);
      bloom.addSafe(bar).should.equal(true);
    });

    it('Should return False when an item could not be added.', () => {
      const bloom = new SafeBloomFilter(noInserts, noInserts);

      bloom.addSafe(foo).should.equal(false);
    });

    it('Should not add an item to the filter when it is above the capacity.', () => {
      const bloom = new SafeBloomFilter(expectedInsertsSmall, fpRateLow);

      // Fill the filter up to capacity.
      let i = 0;
      while (bloom.count < expectedInsertsSmall) {
        bloom.addSafe(foo + i);
        i += 1;
      }

      bloom.addSafe(foo).should.equal(false);
    });
  });

  describe('.falsePositiveRate()', () => {
    it('Should return a value less than or equal to the desired false probability rate when at the desired capacity.', () => {
      const bloom = new SafeBloomFilter(expectedInsertsSmall, fpRateLow);

      // Fill the filter up to capacity.
      for (let i = 0; i < expectedInsertsSmall; i += 1) {
        bloom.addSafe(foo + i);
      }

      bloom.falsePositiveRate().should.be.below(fpRateLow);
    });
  });
});

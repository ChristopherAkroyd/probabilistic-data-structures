const describe = require('mocha').describe;
const it = require('mocha').it;
const chai = require('chai');

const CuckooFilter = require('../cuckooFilter.js');
const getFingerprint = require('./util.js').getFingerprint;
const getHash = require('./util.js').getHash;

chai.should();

const smallFilterCapacity = 20;
const largeFilterCapacity = 200000;
const smallBucketSize = 1;
const largeBucketSize = 4;
const fingerPrintSize = 8;

const foo = 'foo';
const bar = 'bar';

describe('CuckooFilter', () => {
  describe('Number of buckets in filter.', () => {
    it('Should compute the correct number of buckets for the filter.', () => {
      const cuckooSmall = new CuckooFilter(smallFilterCapacity, fingerPrintSize, largeBucketSize);
      const cuckooLarge = new CuckooFilter(largeFilterCapacity, fingerPrintSize, largeBucketSize);

      const expectedNumBucketsSmall = Math.ceil(smallFilterCapacity / largeBucketSize);
      const expectedNumBucketsLarge = Math.ceil(largeFilterCapacity / largeBucketSize);
      cuckooSmall.capacity.should.equal(expectedNumBucketsSmall);
      cuckooLarge.capacity.should.equal(expectedNumBucketsLarge);
    });
  });

  describe('.fingerprint(key)', () => {
    it('Should compute the correct fingerprint for an item of the correct bit length.', () => {
      const cuckoo = new CuckooFilter(smallFilterCapacity, fingerPrintSize, largeBucketSize);
      const fingerprint = getFingerprint(foo);

      const cuckooFingerprint = cuckoo.fingerprint(foo);
      cuckooFingerprint.should.equal(fingerprint);
      cuckooFingerprint.toString(2).length.should.be.equal(fingerPrintSize);
    });
  });

  describe('.indexHash(key)', () => {
    it('Should compute the correct index for the given key.', () => {
      const cuckoo = new CuckooFilter(smallFilterCapacity, fingerPrintSize, smallBucketSize);

      const fooIndex = getHash(foo) % smallFilterCapacity;
      const barIndex = getHash(bar) % smallFilterCapacity;

      cuckoo.indexOfHash(foo).should.equal(fooIndex);
      cuckoo.indexOfHash(bar).should.equal(barIndex);
    });

    it('Should compute the correct index for a given fingerprint.', () => {
      const cuckoo = new CuckooFilter(smallFilterCapacity, fingerPrintSize, smallBucketSize);

      const fooFingerIndex = getHash(getFingerprint(foo)) % smallFilterCapacity;
      const barFingerIndex = getHash(getFingerprint(bar)) % smallFilterCapacity;

      cuckoo.indexOfHash(getFingerprint(foo)).should.equal(fooFingerIndex);
      cuckoo.indexOfHash(getFingerprint(bar)).should.equal(barFingerIndex);
    });
  });

  describe('.obtainIndexPair(key, fingerprint)', () => {
    it('Should compute the indices for an item.', () => {
      const cuckoo = new CuckooFilter(smallFilterCapacity, fingerPrintSize, largeBucketSize);
      const fingerprint = getFingerprint(foo);
      const firstIndex = getHash(foo) % cuckoo.capacity;
      const secondIndex = Math.abs(firstIndex ^ (getHash(fingerprint) % cuckoo.capacity)) % cuckoo.capacity;

      const indices = cuckoo.obtainIndexPair(foo, fingerprint);

      console.log(firstIndex);
      console.log(secondIndex);
      console.log(indices.firstIndex);
      console.log(indices.secondIndex);

      indices.firstIndex.should.equal(firstIndex);
      indices.secondIndex.should.equal(secondIndex);
    });

    it('Should compute different first and second indexes for an element.', () => {
      const cuckoo = new CuckooFilter(smallFilterCapacity, fingerPrintSize, largeBucketSize);
      const fingerprint = getFingerprint(foo);
      const indices = cuckoo.obtainIndexPair(foo, fingerprint);

      indices.firstIndex.should.not.equal(indices.secondIndex);
    });
  });

  describe('.add(key)', () => {
    it('Should add an element to the filter.', () => {
      const cuckoo = new CuckooFilter(smallFilterCapacity, fingerPrintSize, largeBucketSize);

      cuckoo.add(foo).should.equal(true);
      cuckoo.add(bar).should.equal(true);
      cuckoo.length.should.equal(2);
    });

    it('Should maintain a consistent count of how many elements were added to the filter.', () => {
      const cuckoo = new CuckooFilter(smallFilterCapacity, fingerPrintSize, largeBucketSize);

      let count = 0;
      cuckoo.add(foo);
      cuckoo.add(bar);
      cuckoo.length.should.equal(2);
      cuckoo.table.forEach((bucket) => {
        count += bucket.length;
      });
      count.should.equal(2);
    });

    it('should should store ane element accross two different buckets', () => {
      const cuckoo = new CuckooFilter(smallFilterCapacity, fingerPrintSize, 2);

      let count = 0;
      const fingerprint = getFingerprint(foo);
      const indices = cuckoo.obtainIndexPair(foo, fingerprint);
      // fill up all buckets (needs 4 insertions since bucket size = 2)
      cuckoo.add(foo);
      cuckoo.add(foo);
      cuckoo.add(foo);
      cuckoo.add(foo);
      // assert that buckets are full
      cuckoo.table[indices.firstIndex].isFull().should.equal(true);
      cuckoo.table[indices.secondIndex].isFull().should.equal(true);

      count += cuckoo.table[indices.firstIndex].length + cuckoo.table[indices.secondIndex].length;
      count.should.equal(4);
    });

    it('should perform random kicks when both buckets are full', () => {
      const cuckoo = new CuckooFilter(smallFilterCapacity, fingerPrintSize, smallBucketSize);

      let count = 0;
      const fingerprint = getFingerprint(foo);
      const indices = cuckoo.obtainIndexPair(foo, fingerprint);
      // artificially fills up the two possible buckets with dumb values
      cuckoo.table[indices.firstIndex].add(1);
      cuckoo.table[indices.secondIndex].add(2);
      cuckoo.length += 2;

      cuckoo.add(foo).should.equal(true);

      cuckoo.table.forEach((bucket) => {
        if (bucket.length > 0) {
          bucket.bucket[0].should.be.oneOf([1, 2, fingerprint]);
          count += bucket.length;
        }
      });
      cuckoo.length.should.equal(3);
      count.should.equal(3);
    });

    it('should reject elements that can\'t be inserted when filter is full', () => {
      const filter = new CuckooFilter(smallBucketSize, fingerPrintSize, smallBucketSize);
      filter.add(foo);
      filter.add(foo).should.equal(false);
    });
  });

  describe('.remove(key)', () => {
    it('Should remove an item from the filter.', () => {
      const cuckoo = new CuckooFilter(smallFilterCapacity, fingerPrintSize, largeBucketSize);
      const indices = cuckoo.obtainIndexPair(foo, getHash(foo));

      cuckoo.add(foo);
      cuckoo.remove(foo).should.equal(true);
      cuckoo.table[indices.firstIndex].length.should.equal(0);
    });

    it('Should look inside every possible bucket to determine if an item is in the filter.', () => {
      const cuckoo = new CuckooFilter(smallFilterCapacity, fingerPrintSize, largeBucketSize);
      const indices = cuckoo.obtainIndexPair(foo, getHash(foo));

      cuckoo.add(foo);
      cuckoo.add(foo);
      cuckoo.remove(foo).should.equal(true);
      cuckoo.table[indices.firstIndex].length.should.equal(0);
      cuckoo.remove(foo).should.equal(true);
      cuckoo.table[indices.secondIndex].length.should.equal(0);
    });

    it('Should not be able to remove an item not in the filter.', () => {
      const cuckoo = new CuckooFilter(smallFilterCapacity, fingerPrintSize, largeBucketSize);
      cuckoo.add(foo);
      cuckoo.remove(bar).should.equal(false);
    });
  });

  describe('.contains(key)', () => {
    it('Should return True when an item may be in the filter.', () => {
      const cuckoo = new CuckooFilter(smallFilterCapacity, fingerPrintSize, largeBucketSize);
      cuckoo.add(foo);
      cuckoo.contains(foo).should.equal(true);
    });

    it('Should return False when an item is not in the filter.', () => {
      const cuckoo = new CuckooFilter(smallFilterCapacity, fingerPrintSize, largeBucketSize);
      cuckoo.add(foo);
      cuckoo.contains(bar).should.equal(false);
    });

    it('Should look inside every possible bucket to determine if an item is in the filter.', () => {
      const cuckoo = new CuckooFilter(smallFilterCapacity, fingerPrintSize, largeBucketSize);
      cuckoo.add(foo);
      cuckoo.add(foo);
      cuckoo.remove(foo);
      cuckoo.contains(foo).should.equal(true);
    });
  });
});

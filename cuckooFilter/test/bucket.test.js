const chai = require('chai');

const Bucket = require('../bucket.js');
const getFingerprint = require('./util.js').getFingerprint;

chai.should();

const smallBucketSize = 1;
const largeBucketSize = 8;

const fooPrint = getFingerprint('foo');
const barPrint = getFingerprint('bar');
const mooPrint = getFingerprint('moo');

describe('Bucket', () => {
  describe('.isFull()', () => {
    it('Should return False when the bucket has free space available.', () => {
      const bucket = new Bucket(largeBucketSize);
      // When empty it shouldn't be full.
      bucket.isFull().should.equal(false);
      // With one entry it shouldn't be full.
      bucket.add(fooPrint);
      bucket.isFull().should.equal(false);

      // Leave one slot free in the bucket to test if it counts as full.
      for (let i = 0; i < largeBucketSize - 2; i += 1) {
        bucket.add(`test${i}`);
      }
      bucket.isFull().should.equal(false);
    });

    it('Should return True when the bucket is full', () => {
      const bucket1 = new Bucket(smallBucketSize);
      const bucket2 = new Bucket(largeBucketSize);
      bucket1.add(fooPrint);
      bucket1.isFull().should.equal(true);

      // Fill the whole bucket and test that the bucket reads as full.
      for (let i = 0; i < largeBucketSize; i += 1) {
        bucket2.add(getFingerprint(`test${i}`));
      }
      bucket2.isFull().should.equal(true);
    });
  });

  describe('.add(key)', () => {
    it('Should add an element to the bucket', () => {
      const bucket = new Bucket(largeBucketSize);
      bucket.add(fooPrint);
      bucket.length.should.equal(1);
    });

    it('Should add the element to the bucket.', () => {
      const bucket = new Bucket(largeBucketSize);
      bucket.add(fooPrint);
      bucket.contains(fooPrint).should.equal(true);
      bucket.length.should.equal(1);
    });

    it('Should be able to add multiple elements to the bucket.', () => {
      const bucket = new Bucket(largeBucketSize);
      // Add 3 elements, all of which should succeed.
      bucket.add(fooPrint);
      bucket.contains(fooPrint).should.equal(true);
      bucket.length.should.equal(1);

      bucket.add(barPrint);
      bucket.contains(barPrint).should.equal(true);
      bucket.length.should.equal(2);

      bucket.add(mooPrint);
      bucket.contains(mooPrint).should.equal(true);
      bucket.length.should.equal(3);
    });

    it('Should not add an element when the bucket is full.', () => {
      const bucket = new Bucket(smallBucketSize);
      bucket.add(fooPrint);
      bucket.add(barPrint).should.equal(false);
      // Check that there is one item in the bucket.
      bucket.length.should.equal(1);
      // Test that we do contain 'foo' but not 'bar'.
      bucket.contains(fooPrint).should.equal(true);
      bucket.contains(barPrint).should.equal(false);
    });
  });

  describe('.remove(key)', () => {
    it('Should remove an element from the bucket.', () => {
      const bucket = new Bucket(largeBucketSize);
      bucket.add(fooPrint);
      bucket.contains(fooPrint).should.equal(true);
      bucket.remove(fooPrint).should.equal(true);
      bucket.length.should.equal(0);
      bucket.contains(fooPrint).should.equal(false);
    });

    it('Should remove an element without altering the other elements.', () => {
      const bucket = new Bucket(largeBucketSize);
      bucket.add(fooPrint);
      bucket.add(barPrint);
      bucket.add(mooPrint);
      bucket.remove(barPrint).should.equal(true);
      bucket.contains(fooPrint).should.equal(true);
      bucket.contains(mooPrint).should.equal(true);
      bucket.length.should.equal(2);
    });

    it('Should fail to remove elements that are not in the bucket and not impact other elements in the bucket.', () => {
      const bucket = new Bucket(largeBucketSize);
      bucket.add(fooPrint);
      bucket.remove(barPrint).should.equal(false);
      bucket.contains(fooPrint).should.equal(true);
      bucket.length.should.equal(1);
    });
  });

  describe('.contains()', () => {
    it('Should return True when the element is in the bucket.', () => {
      const bucket = new Bucket(largeBucketSize);
      bucket.add(fooPrint);
      bucket.contains(fooPrint).should.equal(true);
    });

    it('Should return False when the element is not in the bucket.', () => {
      const bucket = new Bucket(largeBucketSize);
      bucket.add(fooPrint);
      bucket.contains(mooPrint).should.equal(false);
    });
  });

  describe('.swap(key)', () => {
    it('Should swap an element in the bucket with the one given.', () => {
      const bucket = new Bucket(largeBucketSize);
      const values = [fooPrint, barPrint, mooPrint];
      values.forEach(value => bucket.add(value));
      const expected = 'boo';
      bucket.swap(expected).should.be.oneOf(values);
      bucket.contains(expected).should.equal(true);
    });
  });

  describe('.randomIndex()', () => {
    it('Should return an index within the bounds of the bucket.', () => {
      const bucketSize = largeBucketSize * 2;
      const bucket = new Bucket(largeBucketSize);
      const bucket2 = new Bucket(bucketSize);

      bucket.randomIndex().should.be.within(0, largeBucketSize);
      bucket2.randomIndex().should.be.within(0, bucketSize);
    });
  });
});

const describe = require('mocha').describe;
const it = require('mocha').it;
const chai = require('chai');

const Bucket = require('../bucket.js');

chai.should();

describe('Bucket', () => {
  describe('.isFull()', () => {
    it('Should return False when the bucket has free space available.', () => {
      const bucketSize = 5;
      const bucket = new Bucket(bucketSize);
      // When empty it shouldn't be full.
      bucket.isFull().should.equal(false);
      // With one entry it shouldn't be full.
      bucket.add('foo');
      bucket.isFull().should.equal(false);

      // Leave one slot free in the bucket to test if it counts as full.
      for (let i = 0; i < bucketSize - 2; i += 1) {
        bucket.add(`test${i}`);
      }
      bucket.isFull().should.equal(false);
    });

    it('Should return True when the bucket is full', () => {
      const smallBucketSize = 1;
      const largeBucketSize = 8;

      const bucket1 = new Bucket(smallBucketSize);
      const bucket2 = new Bucket(largeBucketSize);
      bucket1.add('foo');
      bucket1.isFull().should.equal(true);

      // Fill the whole bucket and test that the bucket reads as full.
      for (let i = 0; i < largeBucketSize; i += 1) {
        bucket2.add(`test${i}`);
      }
      bucket2.isFull().should.equal(true);
    });
  });

  describe('.add(key)', () => {
    it('Should add an element to the bucket.', () => {
      const bucket = new Bucket(5);
      bucket.add('foo');
      bucket.contains('foo').should.equal(true);
      bucket.length.should.equal(1);
    });

    it('Should not add an element when the bucket is full', () => {
      const bucket = new Bucket(1);
      bucket.add('foo');
      bucket.add('bar').should.equal(false);
      bucket.length.should.equal(1);
    });
  });

  describe('.remove(key)', () => {
    it('Should remove an element from the bucket.', () => {
      const bucket = new Bucket(5);
      bucket.add('foo');
      bucket.remove('foo').should.equal(true);
      bucket.length.should.equal(0);
    });

    it('Should remove an element without altering the other elements.', () => {
      const bucket = new Bucket(5);
      bucket.add('foo');
      bucket.add('bar');
      bucket.add('moo');
      bucket.remove('bar').should.equal(true);
      bucket.contains('foo').should.equal(true);
      bucket.contains('moo').should.equal(true);
      bucket.length.should.equal(2);
    });

    it('Should fail to remove elements that are not in the bucket and not impact other elements in the bucket.', () => {
      const bucket = new Bucket(5);
      bucket.add('foo');
      bucket.remove('bar').should.equal(false);
      bucket.contains('foo').should.equal(true);
      bucket.length.should.equal(1);
    });
  });

  describe('.contains()', () => {
    it('Should return True when the element is in the bucket.', () => {
      const bucket = new Bucket(5);
      bucket.add('foo');
      bucket.contains('foo').should.equal(true);
    });

    it('Should return False when the element is not in the bucket.', () => {
      const bucket = new Bucket(5);
      bucket.add('foo');
      bucket.contains('moo').should.equal(false);
    });
  });

  describe('.swap(key)', () => {
    it('Should swap an element in the bucket with the one given.', () => {
      const bucket = new Bucket(5);
      const values = ['foo', 'bar', 'moo'];
      values.forEach(value => bucket.add(value));
      const expected = 'boo';
      bucket.swap(expected).should.be.oneOf(values);
      bucket.contains(expected).should.equal(true);
    });
  });

  // describe('#randomIndex', () => {
  //   it('should return an index within the bounds of the bucket.', () => {
  //     const b1 = new Bucket(5);
  //   });
  // });
});

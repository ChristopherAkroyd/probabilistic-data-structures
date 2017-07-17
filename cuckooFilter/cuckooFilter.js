const MMH3 = require('imurmurhash');
const Bucket = require('./bucket.js');
// const Bucket = require('./bucketTypedArray.js');

// https://www.cs.cmu.edu/~dga/papers/cuckoo-conext2014.pdf

class CuckooFilter {
  /**
   *
   * @param capacity
   * @param fingerprintLength
   * @param bucketSize
   * @param maxNumKicks
   */
  constructor(capacity = 10000000, fingerprintLength = 8, bucketSize = 4, maxNumKicks = 400) {
    this.capacity = capacity;
    this.fingerprintLength = fingerprintLength;
    this.bucketSize = bucketSize;
    this.maxNumKicks = maxNumKicks;

    this.numBuckets = this.capacity / this.bucketSize;

    this.table = this.createBuckets();
  }

  createBuckets() {
    const buckets = [];

    for (let i = 0; i < this.numBuckets; i += 1) {
      // buckets.push(new Bucket(this.bucketSize));
      buckets.push(new Uint8Array(4));
    }

    return buckets;
  }

  /**
   *
   * @param key
   */
  add(key) {
    const fingerprint = this.fingerprint(key);
    const { firstIndex, secondIndex } = this.obtainIndexPair(key, fingerprint);

    // If we can add the fingerprint to the table at either index, add it
    // and return true (result of successful addition).
    if (!this.table[firstIndex].isFull()) {
      return this.table[firstIndex].add(fingerprint);
    } else if (!this.table[secondIndex].isFull()) {
      return this.table[secondIndex].add(fingerprint);
    }

    let index = Math.random() < 0.5 ? firstIndex : secondIndex;
    let currentFingerprint = fingerprint;

    for (let i = 0; i < this.maxNumKicks; i += 1) {
      currentFingerprint = this.table[index].swap(currentFingerprint);
      index = (index ^ this.indexOfHash(fingerprint)) % this.capacity;

      if (!this.table[index].isFull()) {
        return this.table[index].add(currentFingerprint);
      }
    }

    return false;
  }

  /**
   *
   * @param key
   */
  remove(key) {
    const fingerprint = this.fingerprint(key);
    const { firstIndex, secondIndex } = this.obtainIndexPair(key, fingerprint);

    if (this.table[firstIndex].contains(fingerprint)) {
      return this.table[firstIndex].remove(fingerprint);
    } else if (this.table[secondIndex].contains(fingerprint)) {
      return this.table[secondIndex].remove(fingerprint);
    }
    return false;
  }

  /**
   *
   * @param key
   */
  contains(key) {
    const fingerprint = this.fingerprint(key);
    const { firstIndex, secondIndex } = this.obtainIndexPair(key, fingerprint);
    // Test whether the key is already in the table.
    return this.table[firstIndex].contains(fingerprint) || this.table[secondIndex].contains(fingerprint);
  }

  /**
   *
   */
  fingerprint(key) {
    const hashValue = MMH3(key).result();
    console.log(hashValue.toString(2).slice(0, this.fingerprintLength));
    return hashValue.toString(2).slice(0, this.fingerprintLength);
    // return hashValue.toString(2).substring(0, this.fingerprintLength);
  }

  indexOfHash(key) {
    const itemHash = MMH3(key).result();
    return itemHash % this.capacity;
  }

  obtainIndexPair(key, fingerprint) {
    const firstIndex = this.indexOfHash(key);
    const secondIndex = (firstIndex ^ this.indexOfHash(fingerprint)) % this.capacity;

    return {
      firstIndex,
      secondIndex,
    };
  }
}

module.exports = CuckooFilter;

console.log(process.memoryUsage());

const cuckoo = new CuckooFilter();


console.log(process.memoryUsage());

const murmur = require('imurmurhash');
const BitArray = require('./bitArray.js');

class BloomFilter {
  constructor(expectedInserts, falsePositiveRate) {
    this.count = 0;
    this.capacity = expectedInserts;
    this.falsePositives = falsePositiveRate;
    this.size = this.calculateSize(expectedInserts, falsePositiveRate);
    this.kHashFunctions = this.optimalNumHashFunctions(expectedInserts, falsePositiveRate);
    this.bitArray = new BitArray(this.size);
  }

  calculateSize(expectedInserts, falsePositiveRate) {
    const ln2Sq = Math.LN2 ** 2;
    const nLnP = expectedInserts * Math.log(falsePositiveRate);
    return Math.ceil(nLnP / -ln2Sq);
  }

  optimalNumHashFunctions(expectedInserts, size) {
    return (expectedInserts / size) * Math.LN2;
  }

  /**
   * Calculate the indices at which we set the bits to 1 in the bit array.
   * https://willwhim.wordpress.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/
   * @param key
   * @returns {Array}
   */
  calculateBitIndices(key) {
    const hash1 = murmur(key).result();
    const hash2 = murmur(key).result();
    const kHashes = [];
    for (let i = 0; i < this.kHashFunctions; i += 1) {
      kHashes.push(((hash1 + i) * hash2) % this.size);
    }
    return kHashes;
  }

  add(key) {
    const indices = this.calculateBitIndices(key);
    indices.forEach((index) => {
      this.bitArray.setBit(indices[index], true);
    });
  }

  /**
   * Tests whether the given key is already stored in the filter.
   * @param key
   * @returns {boolean}
   */
  contains(key) {
    const indices = this.calculateBitIndices(key);
    // Check all of the bits for the key, if one of them isn't set then
    // this key is not in the filter and we return false.
    for (let i = 0; i < indices.length; i += 1) {
      if (!this.bitArray.getBit(indices[i])) {
        return false;
      }
    }
    // If none of the bits checked are false, we return true as the key is in the filter.
    return true;
  }
}

module.exports = BloomFilter;

const murmur = require('imurmurhash');
const BitArray = require('./bitArray.js');

/**
 * https://bdupras.github.io/filter-tutorial/
 * https://en.wikipedia.org/wiki/Bloom_filter
 */
class BloomFilter {
  constructor(bits, numHashFunctions) {
    this.count = 0;
    this.size = bits;
    this.kHashFunctions = numHashFunctions;
    this.bitArray = new BitArray(this.size);
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
    this.count += 1;
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

  /**
   * Provides an estimate for the false positive rate with the current inserted elements,
   * this will most likely be lower than the expected false positive rate when the filter
   * is not near the its capacity.
   *
   * probFalsePositive = (s / m) ^ k
   * s - Number of Bits Set.
   * m - Number of Bits in the Filter
   * k - Number of Hash Functions used.
   *
   * http://ws680.nist.gov/publication/get_pdf.cfm?pub_id=903775
   * http://cglab.ca/~morin/publications/ds/bloom-submitted.pdf
   * @returns {number}
   */
  falsePositiveRate() {
    return (this.bitArray.numberOfBitsSet() / this.bitArray.length) ** this.kHashFunctions;
  }
}

module.exports = BloomFilter;

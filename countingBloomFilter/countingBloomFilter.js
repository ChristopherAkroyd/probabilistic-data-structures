const MurMur = require('imurmurhash');

// @TODO Remove these hardcoded seed values.
const seedOne = 535345345;
const seedTwo = 312312323;

/**
 * https://bdupras.github.io/filter-tutorial/
 * https://en.wikipedia.org/wiki/Bloom_filter
 */
class CountingBloomFilter {
  constructor(numCells, numHashFunctions) {
    this.count = 0;
    this.size = numCells;
    this.kHashFunctions = numHashFunctions;
    this.bitArray = new Uint32Array(numCells);
    this.murmurOne = new MurMur('', seedOne);
    this.murmurTwo = new MurMur('', seedTwo);
  }

  /**
   * Calculate the indices at which we set the bits to 1 in the bit array.
   * https://willwhim.wordpress.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/
   * @param key
   * @returns {Array}
   */
  calculateBitIndices(key) {
    const hash1 = this.murmurOne.hash(key).result();
    const hash2 = this.murmurTwo.hash(key).result();
    const kHashes = [];
    for (let i = 0; i < this.kHashFunctions; i += 1) {
      kHashes.push((hash1 + (i * hash2)) % this.size);
    }

    this.murmurOne.reset(seedOne);
    this.murmurTwo.reset(seedTwo);

    return kHashes;
  }

  /**
   * Adds the given key to the filter, if all the bits are already set then it doesn't increase the count
   * as it is assumed to be already added to the filter.
   *
   * @param key
   */
  add(key) {
    const indices = this.calculateBitIndices(key);
    let numAlreadySet = 0;

    for (let i = 0; i < indices.length; i += 1) {
      if (this.bitArray[indices[i]] > 0) {
        numAlreadySet += 1;
      }
      this.bitArray[indices[i]] += 1;
    }

    if (numAlreadySet < indices.length) {
      this.count += 1;
    }
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
      if (this.bitArray[indices[i]] === 0) {
        return false;
      }
    }
    // If none of the bits checked are false, we return true as the key is in the filter.
    return true;
  }

  /**
   * Provides an estimate for the false positive rate with the current inserted elements,
   * this will most likely be lower than the expected false positive rate when the filter
   * is not near the its capacity but will trend towards 100% as it fills up.
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
    const rate = (this.numberOfBitsSet() / this.bitArray.length) ** this.kHashFunctions;
    // Allows for a much easier time during testing to fix it to a certain number of digits.
    return +(rate).toFixed(3);
  }

  numberOfBitsSet() {
    let counter = 0;
    for (let i = 0; i < this.bitArray.length; i += 1) {
      counter += this.bitArray[i];
    }
    return counter;
  }
}

module.exports = CountingBloomFilter;

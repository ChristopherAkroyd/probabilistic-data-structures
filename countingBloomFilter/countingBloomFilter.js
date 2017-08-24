const MurMur = require('imurmurhash');

// @TODO Remove these hardcoded seed values.
const seedOne = 535345345;
const seedTwo = 312312323;

// @TODO Needs completion and updating.

/**
 * https://bdupras.github.io/filter-tutorial/
 * https://en.wikipedia.org/wiki/Bloom_filter
 */
class CountingBloomFilter {
  constructor(numCells, numHashFunctions, maxValue = 255) {
    this.count = 0;
    // Number of Cells ( Length of the Bit Array).
    this.m = numCells;
    // Number of Hash functions to use.
    this.k = numHashFunctions;
    // Maximum value our counters go up to.
    this.maxValue = maxValue;
    // The Array in which our Bloom Filter counters are stored.
    this.bitArray = CountingBloomFilter.calcAppropriateArray(numCells, maxValue);
    // Two individual hash functions.
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
    const indices = [];
    for (let i = 0; i < this.k; i += 1) {
      indices.push((hash1 + (i * hash2)) % this.m);
    }

    this.murmurOne.reset(seedOne);
    this.murmurTwo.reset(seedTwo);

    return indices;
  }

  /**
   * Adds the given key to the filter, if all the bits are already set then it doesn't
   * increase the count as it is assumed to be already added to the filter.
   *
   * @param key
   */
  add(key) {
    const indices = this.calculateBitIndices(key);
    let numAlreadySet = 0;

    for (let i = 0; i < indices.length; i += 1) {
      const counterValue = this.bitArray[indices[i]];
      if (counterValue > 0) {
        numAlreadySet += 1;
      }

      // Only increment the counter if we aren't going to overflow the integer.
      if (!(counterValue >= this.maxValue)) {
        this.bitArray[indices[i]] += 1;
      }
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
    const rate = (this.numberOfBitsSet() / this.bitArray.length) ** this.k;
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

  remove(key) {
    const indices = this.calculateBitIndices(key);
    let numAlreadySet = 0;

    for (let i = 0; i < indices.length; i += 1) {
      if (this.bitArray[indices[i]] > 0) {
        numAlreadySet += 1;
      }
    }

    if (numAlreadySet === indices.length) {
      for (let i = 0; i < indices.length; i += 1) {
        this.bitArray[indices[i]] -= 1;
      }
      this.count -= 1;
    }
  }

  static calcAppropriateArray(numCells, maxValue) {
    if (maxValue > 0 && maxValue <= 255) {
      return new Uint8Array(numCells);
    } else if (maxValue > 255 && maxValue <= 65535) {
      return new Uint16Array(numCells);
    } else if (maxValue > 65535 && maxValue <= 4294967295) {
      return new Uint32Array(numCells);
    }

    throw new Error('Invalid MaxValue Provided');
  }
}

module.exports = CountingBloomFilter;

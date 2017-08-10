const BloomFilter = require('../bloomFilter/bloomfilter.js');

class SafeBloomFilter extends BloomFilter {
  constructor(expectedInserts, falsePositiveRate) {
    // @TODO review this with the aim to remove the double static func call.
    super(
      SafeBloomFilter.estimateNumberBits(expectedInserts, falsePositiveRate),
      SafeBloomFilter.optimalNumHashFunctions(expectedInserts,
        SafeBloomFilter.estimateNumberBits(expectedInserts, falsePositiveRate)),
    );
    this.capacity = expectedInserts;
  }

  /**
   * Estimates the number of bits required to store the given number of elements
   * while maintaining the given false positive rate.
   *
   * m = - (n Ln P / (Ln 2)^2)
   *
   * https://en.wikipedia.org/wiki/Bloom_filter
   *
   * @param {number} expectedInserts
   * @param {number} falsePositiveRate
   * @returns {number} - Number of bits this filter requires.
   */
  static estimateNumberBits(expectedInserts, falsePositiveRate) {
    if (expectedInserts <= 0) {
      return 0;
    } else if (falsePositiveRate < 0 || falsePositiveRate > 1) {
      throw new Error('Desired false positive rate is invalid.');
    }

    const ln2Sq = Math.LN2 ** 2;
    const nLnP = expectedInserts * Math.log(falsePositiveRate);
    return Math.ceil(-1 * (nLnP / ln2Sq));
  }

  /**
   * Calculates the optimal number of hash functions to minimise the false probability
   * for the given m (size) and n (expectedInserts).
   *
   * k = (m / n) * ln(2).
   *
   * https://en.wikipedia.org/wiki/Bloom_filter
   *
   * @param {number} expectedInserts
   * @param {number} size
   * @returns {number} - Number of Hash functions this filter requires.
   */
  static optimalNumHashFunctions(expectedInserts, size) {
    const min = 1;
    const optimal = (expectedInserts / size) * Math.LN2;

    if (optimal > 0) {
      return optimal;
    }

    return min;
  }

  /**
   * Only adds an item to the filter if we are below the capacity of the filter,
   * this avoids increasing the actual error rate of the filter above the desired
   * error rate.
   *
   * @param key
   * @return {boolean} whether the key was successfully added or not.
   */
  addSafe(key) {
    if (this.count < this.capacity) {
      this.add(key);
      return true;
    }
    return false;
  }
}

module.exports = SafeBloomFilter;

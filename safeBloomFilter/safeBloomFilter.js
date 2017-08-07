const BloomFilter = require('../bloomFilter/bloomfilter.js');

class SafeBloomFilter extends BloomFilter {
  constructor(expectedInserts, falsePositiveRate) {
    super(
      SafeBloomFilter.calculateSize(expectedInserts, falsePositiveRate),
      SafeBloomFilter.optimalNumHashFunctions(expectedInserts, falsePositiveRate),
    );
    this.capacity = expectedInserts;
  }

  static calculateSize(expectedInserts, falsePositiveRate) {
    const ln2Sq = Math.LN2 ** 2;
    const nLnP = expectedInserts * Math.log(falsePositiveRate);
    return Math.ceil(nLnP / -ln2Sq);
  }

  static optimalNumHashFunctions(expectedInserts, size) {
    return (expectedInserts / size) * Math.LN2;
  }
}

module.exports = SafeBloomFilter;

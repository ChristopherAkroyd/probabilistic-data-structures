/**
 *  Maintains a semi-sorted bucket by order of insertion.
 */
class Bucket {
  constructor(size = 4, fpBits = 8) {
    // Calculate the size of the array buffer in bytes
    const bucketBytes = (size * fpBits) / 8;
    this.bucket = this.getView(bucketBytes, fpBits);

    this.size = size;
    this.length = 0;
  }

  getView(bytes, fpBits) {
    switch (fpBits) {
      default:
        return new Uint8Array(bytes);
      case fpBits > 8 && fpBits <= 16:
        return new Uint16Array(bytes);
      case fpBits > 16 && fpBits <= 32:
        return new Uint32Array(bytes);
    }
  }

  add(fingerprint) {
    if (!this.isFull()) {
      this.bucket.push(fingerprint);
      this.length += 1;
      return true;
    }
    return false;
  }

  remove(fingerprint) {
    const index = this.bucket.indexOf(fingerprint);

    if (index > -1) {
      this.bucket[index] = 0;
      this.length -= 1;
      return true;
    }
    return false;
  }

  isFull() {
    return this.bucket.length >= this.size;
  }

  contains(fingerprint) {
    return this.bucket.indexOf(fingerprint);
  }

  swap(fingerprint) {
    const index = this.randomIndex();
    const storedFingerpint = this.bucket[index];
    this.bucket[index] = fingerprint;
    return storedFingerpint;
  }

  randomIndex() {
    return Math.floor(Math.random() * (this.length));
  }
}

module.exports = Bucket;

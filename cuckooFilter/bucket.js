/**
 *  Maintains a semi-sorted bucket by order of insertion.
 */
class Bucket {
  constructor(size = 4, fpBits = 8) {
    this.size = size;
    this.length = 0;
    this.fpBits = fpBits;
    this.bytes = Math.ceil(fpBits / 8);

    this.bucket = [];
  }

  numToBuffer(fingerprint) {
    const buffer = Buffer.alloc(this.bytes);
    buffer.writeUIntBE(fingerprint, 0, this.bytes);
    return buffer;
  }

  /**
   * Deals with buffer equality which doesn't happen with default indexOf.
   */
  indexOfFingerprint(fingerprint) {
    for (let i = 0; i < this.bucket.length; i += 1) {
      if (this.numToBuffer(fingerprint).equals(this.bucket[i])) {
        return i;
      }
    }
    return -1;
  }

  add(fingerprint) {
    if (!this.isFull()) {
      // If we have space, convert the number to a buffer and add to the bucket.
      const bufferFinger = this.numToBuffer(fingerprint);
      this.length = this.bucket.push(bufferFinger);
      return true;
    }
    return false;
  }

  remove(fingerprint) {
    const index = this.indexOfFingerprint(fingerprint);

    if (index > -1) {
      // If the bucket is an array, we splice to get rid of the item, otherwise we just set it
      // to the default value for typed arrays.
      this.bucket.splice(index, 1);
      this.length -= 1;
      return true;
    }
    return false;
  }

  isFull() {
    return this.bucket.length >= this.size;
  }

  contains(fingerprint) {
    return this.indexOfFingerprint(fingerprint) !== -1;
  }

  swap(fingerprint) {
    const index = this.randomIndex();
    const storedFingerpint = this.bucket[index];
    this.bucket[index] = this.numToBuffer(fingerprint);
    return storedFingerpint.readUIntBE(0, this.bytes);
  }

  get(index) {
    if (index < this.length) {
      return this.bucket[index].readUIntBE(0, this.bytes);
    }
    return -1;
  }

  randomIndex() {
    return Math.floor(Math.random() * (this.length));
  }
}

module.exports = Bucket;

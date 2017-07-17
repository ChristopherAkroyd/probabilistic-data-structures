/**
 *  Maintains a semi-sorted bucket by order of insertion.
 */
class Bucket {
  constructor(size = 4) {
    this.bucket = [];
    this.size = size;
    this.length = 0;

    for (let i = 0; i < size; i += 1) {
      this.bucket[i] = 0;
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
      this.bucket[index] = null;
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

const murmur = require('imurmurhash');

function getFingerprint(key, fingerprintLength = 8) {
  const hashValue = murmur(key).result();
  // Get first x bits of the hash as the fingerprint for testing purposes.
  return Number.parseInt(hashValue.toString(2).slice(0, fingerprintLength), 2);
}

module.exports = {
  getFingerprint,
};

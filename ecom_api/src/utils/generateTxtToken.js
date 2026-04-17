const crypto = require("crypto");

// /**
//  * Generate a DNS TXT verification token.
//  * Format: zyno-verification=<random_hex>
//  *
//  * @param {number} [hexLen=32] Number of hex characters (must be even).
//  * @returns {string}
//  */
// function generateTxtToken(hexLen = 32) {
//   if (!Number.isInteger(hexLen) || hexLen < 16 || hexLen > 128) {
//     throw new Error("hexLen must be an integer between 16 and 128");
//   }
//   if (hexLen % 2 !== 0) {
//     throw new Error("hexLen must be even (2 hex chars per byte)");
//   }

//   const random = crypto.randomBytes(hexLen / 2).toString("hex");
//   return `zyno-verification=${random}`;
// }

function generateTxtToken(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    token += chars[randomIndex];
  }

  return `zyno-verification=${token}`;
}



module.exports = { generateTxtToken };


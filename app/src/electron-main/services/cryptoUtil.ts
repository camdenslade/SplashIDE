//********************************************************************
//
// saveEncryptedToken Function
//
// Saves an encrypted token to disk using AES-256-CBC encryption.
// Uses a machine/user-specific key derived from hostname and username.
// Token is stored in the user's home directory under .splashide-config.json.
//
// Return Value
// ------------
// void
//
// Value Parameters
// ----------------
// token    string    Token to encrypt and save
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// cipher      Cipher      Encryption cipher instance
// encrypted   string      Hex-encoded encrypted token
//
//*******************************************************************

import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";

const ALGO = "aes-256-cbc";
const KEY = crypto.createHash("sha256")
  .update(os.hostname() + os.userInfo().username)
  .digest();
const IV = Buffer.alloc(16, 0);

const CONFIG_PATH = path.join(os.homedir(), ".splashide-config.json");

export function saveEncryptedToken(token: string) {
  const cipher = crypto.createCipheriv(ALGO, KEY, IV);
  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");

  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ token: encrypted }), "utf8");
}

//********************************************************************
//
// loadEncryptedToken Function
//
// Loads and decrypts a token from disk. Reads from .splashide-config.json
// in the user's home directory. Returns null if the file doesn't exist,
// has no token, or decryption fails.
//
// Return Value
// ------------
// string|null    Decrypted token or null if not available
//
// Value Parameters
// ----------------
// None
//
// Reference Parameters
// --------------------
// None
//
// Local Variables
// ---------------
// data      Object      Parsed JSON config file
// decipher  Decipher    Decryption decipher instance
// decrypted string      Decrypted token string
//
//*******************************************************************

export function loadEncryptedToken(): string | null {
  if (!fs.existsSync(CONFIG_PATH)) return null;

  const data = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  if (!data.token) return null;

  try {
    const decipher = crypto.createDecipheriv(ALGO, KEY, IV);
    let decrypted = decipher.update(data.token, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    return null;
  }
}


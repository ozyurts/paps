#!/usr/bin/env python3
"""Encrypt / decrypt the SMTP password for Pegasus Peer Support.

Usage:
  python manage_secrets.py setup          # interactive – generates key & encrypts password
  python manage_secrets.py encrypt TEXT   # encrypt a string and save to smtp_pass.enc
  python manage_secrets.py decrypt        # print decrypted password (for verification)
"""

import getpass
import sys
from pathlib import Path

from cryptography.fernet import Fernet

BASE = Path(__file__).parent
KEY_FILE = BASE / "smtp_secret.key"
ENC_FILE = BASE / "smtp_pass.enc"


def _load_key() -> bytes:
    if not KEY_FILE.exists():
        print(f"ERROR: Key file not found: {KEY_FILE}")
        print("Run 'python manage_secrets.py setup' first.")
        sys.exit(1)
    return KEY_FILE.read_bytes()


def setup():
    """Generate a new Fernet key and encrypt the SMTP password interactively."""
    # Generate key
    key = Fernet.generate_key()
    KEY_FILE.write_bytes(key)
    print(f"Encryption key saved to: {KEY_FILE.name}")

    # Prompt for password
    password = getpass.getpass("Enter SMTP password: ")
    if not password:
        print("ERROR: Password cannot be empty.")
        sys.exit(1)

    # Encrypt & save
    token = Fernet(key).encrypt(password.encode("utf-8"))
    ENC_FILE.write_bytes(token)
    print(f"Encrypted password saved to: {ENC_FILE.name}")
    print()
    print("IMPORTANT: Keep smtp_secret.key safe and never commit it to git.")
    print("Both smtp_secret.key and smtp_pass.enc are in .gitignore.")


def encrypt(plaintext: str):
    """Encrypt a string using the existing key."""
    key = _load_key()
    token = Fernet(key).encrypt(plaintext.encode("utf-8"))
    ENC_FILE.write_bytes(token)
    print(f"Encrypted password saved to: {ENC_FILE.name}")


def decrypt() -> str:
    """Decrypt and return the stored password."""
    key = _load_key()
    if not ENC_FILE.exists():
        print(f"ERROR: Encrypted file not found: {ENC_FILE}")
        sys.exit(1)
    token = ENC_FILE.read_bytes()
    return Fernet(key).decrypt(token).decode("utf-8")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    cmd = sys.argv[1]

    if cmd == "setup":
        setup()
    elif cmd == "encrypt":
        if len(sys.argv) < 3:
            txt = getpass.getpass("Enter text to encrypt: ")
        else:
            txt = sys.argv[2]
        encrypt(txt)
    elif cmd == "decrypt":
        print(decrypt())
    else:
        print(f"Unknown command: {cmd}")
        print(__doc__)
        sys.exit(1)

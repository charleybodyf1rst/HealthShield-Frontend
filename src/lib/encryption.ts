/**
 * End-to-end encryption utilities for team messaging
 * Uses AES-256-GCM for symmetric encryption
 */

// Generate a random encryption key (for new conversations)
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

// Export key to base64 string for storage
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// Import key from base64 string
export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(keyString), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt a message
export async function encryptMessage(
  message: string,
  key: CryptoKey
): Promise<{ encryptedContent: string; iv: string }> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  // Generate a random IV for each message
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    data
  );

  return {
    encryptedContent: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

// Decrypt a message
export async function decryptMessage(
  encryptedContent: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const encryptedData = Uint8Array.from(atob(encryptedContent), (c) => c.charCodeAt(0));
  const ivData = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivData,
    },
    key,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}

// Derive a shared key from a password/passphrase (for conversation keys)
export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Generate a random salt
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

// Convert salt to base64 for storage
export function saltToBase64(salt: Uint8Array): string {
  return btoa(String.fromCharCode(...salt));
}

// Convert base64 to salt
export function base64ToSalt(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

// Key storage in IndexedDB for persistence
const DB_NAME = 'healthshield_crm_encryption';
const STORE_NAME = 'encryption_keys';

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function storeConversationKey(
  conversationId: string,
  key: CryptoKey
): Promise<void> {
  const exportedKey = await exportKey(key);
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(exportedKey, conversationId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getConversationKey(
  conversationId: string
): Promise<CryptoKey | null> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(conversationId);

    request.onerror = () => reject(request.error);
    request.onsuccess = async () => {
      if (request.result) {
        try {
          const key = await importKey(request.result);
          resolve(key);
        } catch {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    };
  });
}

export async function removeConversationKey(
  conversationId: string
): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(conversationId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Clear all stored keys (for logout)
export async function clearAllKeys(): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * HealthShield - Google Drive Integration
 *
 * Connect your platform to Google Drive for:
 * - Document backup and storage
 * - Photo gallery sync
 * - Receipt organization
 * - Shared agent files
 * - Automatic backup
 */

export interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
  scopes: string[];
  discoveryDocs: string[];
}

export const driveConfig: GoogleDriveConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.appdata',
  ],
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
};

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
  thumbnailLink?: string;
  parents?: string[];
}

export interface DriveFolder {
  id: string;
  name: string;
  path: string;
}

// HealthShield folder structure in Google Drive
export const healthShieldFolderStructure = {
  root: 'HealthShield',
  subfolders: [
    {
      name: 'Tax Documents',
      subfolders: ['2024 Receipts', '2024 Invoices', '2023 Archive'],
    },
    {
      name: 'Insurance',
      subfolders: ['Policies', 'Claims', 'Certificates'],
    },
    {
      name: 'Service Records',
      subfolders: [
        'Health Consultation',
        'Plan Enrollment',
        'Claims Review',
        'Wellness Program',
        'Benefits Review',
        'Policy Renewal',
      ],
    },
    {
      name: 'Agent Files',
      subfolders: ['Licenses', 'Certifications', 'Training'],
    },
    {
      name: 'Customer Contracts',
      subfolders: ['Agreements', 'Enrollment Forms', 'Corporate Contracts'],
    },
    {
      name: 'Marketing Assets',
      subfolders: ['Photos', 'Videos', 'Graphics', 'Social Media'],
    },
    {
      name: 'Client Documents',
      subfolders: ['2024', '2023'],
    },
    {
      name: 'Financial Reports',
      subfolders: ['Monthly Reports', 'Annual Reports', 'Tax Returns'],
    },
  ],
};

// Google Drive API wrapper functions
export class GoogleDriveService {
  private accessToken: string | null = null;
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      // Load Google API client
      await this.loadGapiClient();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Drive:', error);
      return false;
    }
  }

  private async loadGapiClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client:auth2', async () => {
          try {
            await window.gapi.client.init({
              apiKey: driveConfig.apiKey,
              clientId: driveConfig.clientId,
              discoveryDocs: driveConfig.discoveryDocs,
              scope: driveConfig.scopes.join(' '),
            });
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  async signIn(): Promise<boolean> {
    if (!this.isInitialized) await this.initialize();

    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      this.accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
      return true;
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    const authInstance = window.gapi.auth2.getAuthInstance();
    await authInstance.signOut();
    this.accessToken = null;
  }

  isSignedIn(): boolean {
    if (!this.isInitialized) return false;
    return window.gapi.auth2.getAuthInstance().isSignedIn.get();
  }

  async createFolder(name: string, parentId?: string): Promise<string | null> {
    try {
      const metadata: any = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
      };

      if (parentId) {
        metadata.parents = [parentId];
      }

      const response = await window.gapi.client.drive.files.create({
        resource: metadata,
        fields: 'id',
      });

      return response.result.id;
    } catch (error) {
      console.error('Failed to create folder:', error);
      return null;
    }
  }

  async setupHealthShieldFolders(): Promise<{ rootId: string; folders: Record<string, string> } | null> {
    try {
      const folders: Record<string, string> = {};

      // Create root folder
      const rootId = await this.createFolder(healthShieldFolderStructure.root);
      if (!rootId) throw new Error('Failed to create root folder');
      folders['root'] = rootId;

      // Create subfolders
      for (const subfolder of healthShieldFolderStructure.subfolders) {
        const folderId = await this.createFolder(subfolder.name, rootId);
        if (folderId) {
          folders[subfolder.name] = folderId;

          // Create nested subfolders
          for (const nested of subfolder.subfolders) {
            const nestedId = await this.createFolder(nested, folderId);
            if (nestedId) {
              folders[`${subfolder.name}/${nested}`] = nestedId;
            }
          }
        }
      }

      return { rootId, folders };
    } catch (error) {
      console.error('Failed to setup folder structure:', error);
      return null;
    }
  }

  async uploadFile(
    file: File,
    folderId: string,
    onProgress?: (percent: number) => void
  ): Promise<DriveFile | null> {
    try {
      const metadata = {
        name: file.name,
        parents: [folderId],
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: form,
        }
      );

      if (!response.ok) throw new Error('Upload failed');

      return await response.json();
    } catch (error) {
      console.error('Failed to upload file:', error);
      return null;
    }
  }

  async listFiles(folderId: string): Promise<DriveFile[]> {
    try {
      const response = await window.gapi.client.drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink)',
        orderBy: 'modifiedTime desc',
      });

      return response.result.files || [];
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      await window.gapi.client.drive.files.delete({
        fileId,
      });
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  async searchFiles(query: string): Promise<DriveFile[]> {
    try {
      const response = await window.gapi.client.drive.files.list({
        q: `name contains '${query}' and trashed = false`,
        fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink)',
        orderBy: 'modifiedTime desc',
      });

      return response.result.files || [];
    } catch (error) {
      console.error('Failed to search files:', error);
      return [];
    }
  }

  async downloadFile(fileId: string): Promise<Blob | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error('Download failed');

      return await response.blob();
    } catch (error) {
      console.error('Failed to download file:', error);
      return null;
    }
  }

  async getStorageQuota(): Promise<{ used: number; total: number } | null> {
    try {
      const response = await window.gapi.client.drive.about.get({
        fields: 'storageQuota',
      });

      const quota = response.result.storageQuota;
      return {
        used: parseInt(quota.usage || '0'),
        total: parseInt(quota.limit || '0'),
      };
    } catch (error) {
      console.error('Failed to get storage quota:', error);
      return null;
    }
  }
}

// Singleton instance
export const googleDrive = new GoogleDriveService();

// Type declaration for gapi
declare global {
  interface Window {
    gapi: any;
  }
}

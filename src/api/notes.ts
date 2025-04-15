import { EditorContent } from '@tiptap/react';

interface NoteFile {
  file_name: string;
  created_at: string;
  last_modified: string;
}

interface NoteFolder {
  folder_name: string;
  created_at: string;
  files: NoteFile[];
  subfolders: NoteFolder[];
}

interface FolderTree {
  files: NoteFile[];
  folders: NoteFolder[];
}

interface NotesResponse {
  success: boolean;
  folder_tree?: FolderTree;
  message?: string;
}

interface CreateFolderResponse {
  success: boolean;
  folder_name: string;
  error?: string;
}

interface RenameFolderResponse {
  success: boolean;
  folder_name: string;
  error?: string;
}

interface CreateFileResponse {
  success: boolean;
  file_name: string;
  error?: string;
}

interface RenameFileResponse {
  success: boolean;
  file_name: string;
  error?: string;
}

interface DeleteResponse {
  success: boolean;
  error?: string;
}

const API_BASE_URL = 'https://backend-ai-cloud-explains.onrender.com';

export const notesAPI = {
  getNoteTree: async (userId: string): Promise<NotesResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/note/get_user_note_tree`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      throw error;
    }
  },

  createFolder: async (userId: string, currentDirectory: string): Promise<CreateFolderResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/note/create_folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          current_directory: currentDirectory
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    }
  },

  renameFolder: async (userId: string, currentDirectory: string, newName: string): Promise<RenameFolderResponse> => {
    try {
      // Split the current directory into path components
      const pathComponents = currentDirectory.split('/');
      const oldName = pathComponents[pathComponents.length - 1];
      const parentPath = pathComponents.slice(0, -1).join('/');

      const response = await fetch(`${API_BASE_URL}/note/rename_folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          current_directory: oldName,
          new_name: newName,
          parent_path: parentPath || '' // Empty string for root level folders
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename folder');
      }

      const data = await response.json();
      return {
        success: data.success ?? true,
        folder_name: data.folder_name || newName,
        error: data.error
      };
    } catch (error) {
      console.error('Failed to rename folder:', error);
      return {
        success: false,
        folder_name: '',
        error: error instanceof Error ? error.message : 'Failed to rename folder'
      };
    }
  },

  createFile: async (userId: string, currentDirectory: string): Promise<CreateFileResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/note/create_file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          current_directory: currentDirectory
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to create file:', error);
      throw error;
    }
  },

  renameFile: async (userId: string, currentFilename: string, newName: string): Promise<RenameFileResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/note/rename_file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          current_filename: currentFilename,
          new_name: newName
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to rename file:', error);
      throw error;
    }
  },

  deleteFolder: async (userId: string, folderName: string): Promise<DeleteResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/note/delete_folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          folder_name: folderName
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete folder');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to delete folder:', error);
      throw error;
    }
  },

  deleteFile: async (userId: string, filename: string): Promise<DeleteResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/note/delete_file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          filename: filename
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  }
};
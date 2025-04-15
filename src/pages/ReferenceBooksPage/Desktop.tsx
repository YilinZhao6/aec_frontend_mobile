import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Upload, AlertCircle, Loader2 } from 'lucide-react';
import MainLayout from '../../components/Layout/MainLayout';
import ParticleBackground from '../../components/ParticleBackground';
import { uploadReferenceBooksAPI } from '../../api/upload_reference_books';
import { useLanguage } from '../../contexts/LanguageContext';
import { REFERENCE_BOOKS_PAGE_STRINGS } from '../../constants/strings';
import './ReferenceBooksPage.css';

interface Book {
  book_id: string;
  author: string;
  title: string;
  original_filename: string;
  file_size_bytes: number;
  num_pages: number;
  vectorized_at: string;
}

interface DeleteConfirmation {
  book: Book;
  isVisible: boolean;
}

interface UploadProgress {
  file: File;
  progress: number;
  isComplete?: boolean;
}

const Desktop = () => {
  const { t } = useLanguage();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const userId = localStorage.getItem('user_id');

  const fetchBooks = async () => {
    if (!userId) {
      setError(t(REFERENCE_BOOKS_PAGE_STRINGS.ERRORS.USER));
      setLoading(false);
      return;
    }

    try {
      const response = await uploadReferenceBooksAPI.getVectorizedBooks(userId);
      if (response.success && response.data) {
        const sortedBooks = response.data.books.sort((a, b) => 
          new Date(b.vectorized_at).getTime() - new Date(a.vectorized_at).getTime()
        );
        setBooks(sortedBooks);
      } else {
        setError(response.message || t(REFERENCE_BOOKS_PAGE_STRINGS.ERRORS.FETCH));
      }
    } catch (error) {
      setError(t(REFERENCE_BOOKS_PAGE_STRINGS.ERRORS.SERVER));
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (book: Book) => {
    if (!userId || isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await uploadReferenceBooksAPI.deleteBook(userId, book.book_id);
      
      if (response.success) {
        setBooks(prevBooks => prevBooks.filter(b => b.book_id !== book.book_id));
        setDeleteConfirmation(null);
      } else {
        setError(response.error || t(REFERENCE_BOOKS_PAGE_STRINGS.ERRORS.SERVER));
      }
    } catch (error) {
      console.error('Failed to delete book:', error);
      setError(t(REFERENCE_BOOKS_PAGE_STRINGS.ERRORS.SERVER));
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && userId) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!userId) return;

    if (file.type !== 'application/pdf') {
      setError(t(REFERENCE_BOOKS_PAGE_STRINGS.ERRORS.FILE_TYPE));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(t(REFERENCE_BOOKS_PAGE_STRINGS.ERRORS.FILE_SIZE));
      return;
    }

    setUploadProgress({ file, progress: 0 });

    try {
      await uploadReferenceBooksAPI.uploadAndVectorize(
        userId, 
        file,
        (progress) => setUploadProgress(prev => prev ? { ...prev, progress } : null)
      );
      
      setUploadProgress(prev => prev ? { ...prev, progress: 100, isComplete: true } : null);
      
      setTimeout(() => {
        setUploadProgress(null);
        fetchBooks();
      }, 3000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(null);
      setError(t(REFERENCE_BOOKS_PAGE_STRINGS.ERRORS.UPLOAD));
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="books-container">
          <div className="loading-state">
            <Loader2 className="animate-spin" size={24} />
            <p>{t(REFERENCE_BOOKS_PAGE_STRINGS.LOADING)}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="books-container">
          <div className="error-state">
            <p>{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="books-container">
        <div className="books-header">
          <h1 className="page-title">{t(REFERENCE_BOOKS_PAGE_STRINGS.PAGE_TITLE)}</h1>
        </div>

        <div className="books-content">
          <ParticleBackground />
          
          <div 
            className={`upload-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-content">
              {uploadProgress ? (
                <div className="upload-progress">
                  <div className="progress-info">
                    <span className="file-name">{uploadProgress.file.name}</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className={`progress-bar ${uploadProgress.isComplete ? 'complete' : ''}`}
                      style={{ width: `${uploadProgress.progress}%` }}
                    />
                  </div>
                  <span className="progress-text">
                    {uploadProgress.isComplete 
                      ? t(REFERENCE_BOOKS_PAGE_STRINGS.UPLOAD_PROGRESS.COMPLETE)
                      : t(REFERENCE_BOOKS_PAGE_STRINGS.UPLOAD_PROGRESS.UPLOADING)}
                  </span>
                </div>
              ) : (
                <>
                  <Upload size={24} />
                  <h3 className="upload-title">{t(REFERENCE_BOOKS_PAGE_STRINGS.UPLOAD_AREA.TITLE)}</h3>
                  <p className="upload-text">{t(REFERENCE_BOOKS_PAGE_STRINGS.UPLOAD_AREA.OR)}</p>
                  <label className="upload-button">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                      }}
                    />
                    {t(REFERENCE_BOOKS_PAGE_STRINGS.UPLOAD_AREA.BUTTON)}
                  </label>
                  <p className="upload-hint">{t(REFERENCE_BOOKS_PAGE_STRINGS.UPLOAD_AREA.HINT)}</p>
                </>
              )}
            </div>
          </div>

          <div className="books-list-header">
            <div className="name-cell">{t(REFERENCE_BOOKS_PAGE_STRINGS.LIST_HEADERS.NAME)}</div>
            <div className="actions-cell">{t(REFERENCE_BOOKS_PAGE_STRINGS.LIST_HEADERS.ACTIONS)}</div>
          </div>

          <div className="books-list">
            {books.length === 0 ? (
              <div className="books-empty">
                {t(REFERENCE_BOOKS_PAGE_STRINGS.EMPTY_STATES.NO_BOOKS)}
              </div>
            ) : (
              books.map(book => (
                <div key={book.book_id} className="book-row">
                  <div className="name-cell">
                    <span className="book-title">{book.title || book.original_filename}</span>
                    <div className="book-meta">
                      <span className="book-date">
                        <Calendar size={12} />
                        {formatDate(book.vectorized_at)}
                      </span>
                      <span className="book-size">{formatFileSize(book.file_size_bytes)}</span>
                    </div>
                  </div>
                  <div className="actions-cell">
                    <button 
                      className="book-action-button"
                      onClick={() => setDeleteConfirmation({ book, isVisible: true })}
                      disabled={isDeleting}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {deleteConfirmation?.isVisible && (
            <div className="delete-confirmation-overlay">
              <div className="delete-confirmation">
                <AlertCircle className="text-red-500" size={24} />
                <p className="confirmation-message">
                  Delete this reference book?
                </p>
                <div className="confirmation-actions">
                  <button 
                    className="cancel-button"
                    onClick={() => setDeleteConfirmation(null)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDelete(deleteConfirmation.book)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        Deleting...
                      </div>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Desktop;
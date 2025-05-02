'use client';

import { useState, useRef } from 'react';
import { FiUpload, FiFile, FiX, FiCheck, FiAlertCircle, FiPaperclip, FiSend } from 'react-icons/fi';
import FileUploadSection from './FileUploadSection';

/**
 * DocumentUploadOptions.tsx
 * 
 * This file contains multiple implementation options for document upload functionality
 * that can be integrated with the existing counsel page interface.
 * 
 * It includes:
 * 1. Inline Document Upload (Minimal)
 * 2. Full-Featured Document Upload (Using FileUploadSection)
 * 3. Integrated with Chat Interface
 * 4. Modal Document Upload
 * 5. Document Processing Indicators
 * 6. OCR/Text Extraction Implementation
 * 7. Document Reference System
 */

// ============================
// Option 1: Inline Document Upload (Minimal)
// ============================
export function MinimalDocumentUpload({ onFileSelected }: { onFileSelected: (files: File[]) => void }) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFileSelected(filesArray);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <label className="text-sm font-medium text-gray-700">Upload Legal Document</label>
        <span className="ml-2 text-xs text-gray-500">(PDF, DOC, DOCX, TXT up to 10MB)</span>
      </div>
      <label className="flex justify-center px-4 py-3 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
        <span className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
        </span>
        <input 
          type="file" 
          className="sr-only" 
          accept=".pdf,.doc,.docx,.txt" 
          multiple 
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}

// ============================
// Option 2: Full-Featured Document Upload (Using FileUploadSection)
// ============================
export function FullFeaturedUpload() {
  const handleFileProcessed = (fileData: { name: string; size: number; tokens: number }) => {
    // Add the document text to the conversation or process it
    console.log(`Processing ${fileData.name} with ${fileData.tokens} tokens`);
    // You might want to add a message to the chat with the document content
  };

  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-900">Document Analysis</h3>
        <p className="text-sm text-gray-500">Upload legal documents for AI analysis</p>
      </div>
      <div className="p-5">
        <FileUploadSection onFileProcessed={handleFileProcessed} />
      </div>
    </div>
  );
}

// ============================
// Option 3: Integrated with Chat Interface
// ============================
export function ChatIntegratedUpload() {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Process the files
      console.log(`${e.target.files.length} files selected`);
      // Here you'd typically:
      // 1. Upload to your server
      // 2. Process for token estimation
      // 3. Update UI to show files are attached
    }
  };

  const handleSend = () => {
    // Handle sending the message and/or attached files
    console.log('Sending message:', message);
    setMessage('');
  };

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="relative">
        {/* File upload button that sits alongside the chat input */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <label htmlFor="chat-file-upload" className="cursor-pointer">
            <FiPaperclip className="w-5 h-5 text-gray-400 hover:text-blue-500" />
            <input 
              id="chat-file-upload" 
              type="file" 
              className="sr-only" 
              multiple 
              accept=".pdf,.doc,.docx,.txt" 
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </label>
        </div>
        
        {/* Chat input */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a legal question or upload a document..."
          className="w-full py-3 pl-10 pr-20 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Send button */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button 
            type="button" 
            onClick={handleSend}
            className="text-blue-500 hover:text-blue-700"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================
// Option 4: Modal Document Upload
// ============================
interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (fileData: { name: string; size: number; tokens: number }) => void;
}

export function DocumentUploadModal({ isOpen, onClose, onUpload }: DocumentUploadModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-medium text-gray-900">Upload Legal Document</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            <FileUploadSection onFileProcessed={onUpload} />
            
            <div className="mt-6 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                Cancel
              </button>
              <button 
                onClick={onClose} 
                className="ml-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Example usage of modal component:
export function DocumentUploadWithModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleFileProcessed = (fileData: { name: string; size: number; tokens: number }) => {
    console.log(`File processed: ${fileData.name}`);
    // Process the file data
  };
  
  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Upload Document
      </button>
      
      <DocumentUploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUpload={handleFileProcessed} 
      />
    </>
  );
}

// ============================
// Option 5: Document Processing Indicators
// ============================
interface ProcessingIndicatorProps {
  status: 'uploading' | 'processing' | 'complete' | 'error';
  filename: string;
  progress?: number;
  errorMessage?: string;
}

export function DocumentProcessingIndicator({ status, filename, progress = 0, errorMessage }: ProcessingIndicatorProps) {
  return (
    <div className="my-2 p-3 bg-gray-50 rounded-md">
      <div className="flex items-center">
        <div className="mr-3">
          {status === 'uploading' && (
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          )}
          {status === 'processing' && (
            <div className="animate-pulse h-5 w-5 bg-yellow-400 rounded-full"></div>
          )}
          {status === 'complete' && (
            <FiCheck className="h-5 w-5 text-green-500" />
          )}
          {status === 'error' && (
            <FiAlertCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900">{filename}</p>
            <p className="text-xs text-gray-500">
              {status === 'uploading' && `${Math.round(progress)}%`}
              {status === 'processing' && 'Processing...'}
              {status === 'complete' && 'Complete'}
              {status === 'error' && 'Error'}
            </p>
          </div>
          
          {status === 'uploading' && (
            <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          
          {status === 'error' && errorMessage && (
            <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================
// Option 6: OCR/Text Extraction Implementation
// ============================

/**
 * NOTE: This is a front-end wrapper for OCR functionality.
 * The actual text extraction would happen on the backend.
 * 
 * Implementation steps:
 * 1. Frontend uploads the document to the server
 * 2. Backend processes with appropriate libraries (e.g., pdf.js, mammoth.js, tesseract.js)
 * 3. Backend returns extracted text
 * 4. Frontend displays the text and allows interaction
 */

export function documentToText(file: File): Promise<string> {
  // This would be a call to your backend API
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('document', file);
    
    fetch('/api/ai/extract-text', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to extract text');
      }
      return response.json();
    })
    .then(data => {
      resolve(data.text);
    })
    .catch(error => {
      reject(error);
    });
  });
}

// Usage example
export function DocumentTextExtractor() {
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      const text = await documentToText(files[0]);
      setExtractedText(text);
    } catch (err) {
      setError('Failed to extract text from document');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <MinimalDocumentUpload onFileSelected={handleFileSelected} />
      
      {isProcessing && (
        <div className="p-4 bg-blue-50 rounded-md">
          <div className="flex items-center">
            <div className="animate-pulse h-4 w-4 bg-blue-500 rounded-full mr-2"></div>
            <p className="text-sm text-blue-700">Extracting text from document...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {extractedText && (
        <div className="p-4 border border-gray-200 rounded-md">
          <h3 className="font-medium mb-2">Extracted Text</h3>
          <div className="max-h-64 overflow-y-auto">
            <p className="text-sm whitespace-pre-wrap">{extractedText}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================
// Option 7: Document Reference System
// ============================
interface UploadedDocument {
  id: string;
  name: string;
  text: string;
  uploadedAt: Date;
}

export function DocumentReferenceSystem() {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    
    // This would normally go to your backend
    try {
      // Simulate text extraction
      const newDocs: UploadedDocument[] = await Promise.all(
        files.map(async (file) => {
          // Mock text extraction - in real app, use your backend API
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return {
            id: `doc-${Date.now()}`,
            name: file.name,
            text: `Mock extracted text for ${file.name}`,
            uploadedAt: new Date()
          };
        })
      );
      
      setUploadedDocuments(prev => [...prev, ...newDocs]);
    } catch (error) {
      console.error('Error processing documents:', error);
    }
  };
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    
    // Process message, check for document references
    // e.g., if message contains "@document-name" format
    setTimeout(() => {
      console.log('Message sent:', message);
      // In a real app, send to your API endpoint
      setMessage('');
      setIsSending(false);
    }, 500);
  };
  
  return (
    <div className="space-y-4">
      {/* Document list */}
      {uploadedDocuments.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Your Documents</h3>
          <div className="bg-gray-50 p-2 rounded-md">
            {uploadedDocuments.map(doc => (
              <div key={doc.id} className="text-xs bg-white p-2 rounded mb-1 flex justify-between">
                <span>{doc.name}</span>
                <span className="text-gray-500">
                  {doc.uploadedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tip: Reference documents by typing @ followed by document name
          </p>
        </div>
      )}
      
      {/* Document upload */}
      <MinimalDocumentUpload onFileSelected={handleFileSelected} />
      
      {/* Message input with document referencing */}
      <div className="relative mt-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about your documents... (try using @ to reference a document)"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
        
        <div className="absolute right-2 bottom-2">
          <button
            onClick={handleSendMessage}
            disabled={isSending || !message.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * NOTE TO FRONTEND TEAM:
 * 
 * The components above provide multiple options for implementing document upload
 * functionality. You can use them as-is or adapt them to fit the existing counsel
 * page interface.
 * 
 * Key integration points:
 * 
 * 1. FILE UPLOAD - Choose from the options above based on your UX requirements
 * 
 * 2. OCR/TEXT EXTRACTION - Implement the backend API at /api/ai/extract-text that:
 *    - Accepts document uploads (PDF, DOC, DOCX, TXT)
 *    - Uses appropriate libraries to extract text:
 *      - PDF.js for PDFs
 *      - Mammoth.js for DOC/DOCX
 *      - Simple text reading for TXT
 *    - Returns the extracted text in a structured format
 * 
 * 3. DOCUMENT PROCESSING INDICATORS - Use the DocumentProcessingIndicator component
 *    to show upload and processing status
 * 
 * 4. DOCUMENT REFERENCING - Implement the DocumentReferenceSystem for advanced
 *    document interaction
 * 
 * All these components are designed to work with your existing token system and
 * AI processing pipeline.
 */

export default {
  MinimalDocumentUpload,
  FullFeaturedUpload,
  ChatIntegratedUpload,
  DocumentUploadModal,
  DocumentProcessingIndicator,
  DocumentTextExtractor,
  DocumentReferenceSystem
}; 
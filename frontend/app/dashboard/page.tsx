'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TokenUsageDisplay from '../components/TokenUsageDisplay';
import FileUploadSection from '../components/FileUploadSection';
import { FiCheckCircle } from 'react-icons/fi';

export default function Dashboard() {
  const [processedFiles, setProcessedFiles] = useState<Array<{name: string, size: number, tokenCount: number}>>([]);
  
  // Mock user ID for demo purposes
  const userId = 'user123';

  // Handle file processed callback from FileUploadSection
  const handleFileProcessed = (fileData: {name: string, size: number, tokens: number}) => {
    const newFile = {
      name: fileData.name,
      size: fileData.size,
      tokenCount: fileData.tokens
    };
    setProcessedFiles(prev => [...prev, newFile]);
    // In a real application, you would send these files to your backend for processing
    // and update the token usage based on the response
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor your token usage and analyze legal documents</p>
          
          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Main content area */}
            <div className="lg:col-span-8 space-y-8">
              {/* Document Upload Section */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-medium text-gray-900 mb-4">Upload Documents</h2>
                <FileUploadSection onFileProcessed={handleFileProcessed} />
              </div>
              
              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-medium text-gray-900 mb-4">Recent Activity</h2>
                
                <div className="flow-root">
                  <ul className="divide-y divide-gray-200">
                    {processedFiles.length > 0 && processedFiles.map((file, index) => (
                      <li key={index} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <FiCheckCircle className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              Analyzed just now • {file.tokenCount.toLocaleString()} tokens used
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                    
                    <li className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <FiCheckCircle className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">Contract_Agreement.pdf</p>
                          <p className="text-sm text-gray-500">Analyzed 2 hours ago • 5,230 tokens used</p>
                        </div>
                      </div>
                    </li>
                    <li className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <FiCheckCircle className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">Terms_of_Service.docx</p>
                          <p className="text-sm text-gray-500">Analyzed 1 day ago • 3,418 tokens used</p>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Token Usage Sidebar */}
            <div className="lg:col-span-4">
              <TokenUsageDisplay userId={userId} />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
} 
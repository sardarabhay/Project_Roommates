import { Plus, Upload, FileText, Edit, Trash2, Download } from 'lucide-react';
import Card from '../common/Card';
import ModuleHeader from '../common/ModuleHeader';
import { mockLandlord, mockIssues } from '../../data/mockData';
import { useState } from 'react';

const LandlordModule = ({ onReportIssue }) => {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Rental Agreement 2025.pdf', uploadedBy: 'Abhay', date: '2025-01-15', size: '2.4 MB' }
  ]);
  
  const [issues, setIssues] = useState(mockIssues);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocument, setNewDocument] = useState({ name: '', file: null });

  const handleUploadDocument = () => {
    if (newDocument.name && newDocument.file) {
      const newDoc = {
        id: documents.length + 1,
        name: newDocument.name,
        uploadedBy: 'Abhay',
        date: new Date().toISOString().split('T')[0],
        size: '1.2 MB'
      };
      setDocuments([...documents, newDoc]);
      setNewDocument({ name: '', file: null });
      setShowUploadModal(false);
    }
  };

  const handleDeleteDocument = (docId) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  };

  const handleUpdateIssueStatus = (issueId, newStatus) => {
    setIssues(issues.map(issue => 
      issue.id === issueId ? { ...issue, status: newStatus } : issue
    ));
  };

  const handleDeleteIssue = (issueId) => {
    setIssues(issues.filter(issue => issue.id !== issueId));
  };

  return (
    <div className="animate-fade-in">
      <ModuleHeader title="Landlord & Property" actionText="Report Issue" onActionClick={onReportIssue} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <h3 className="font-bold text-lg mb-4">Landlord Info</h3>
          <p className="font-semibold text-xl">{mockLandlord.name}</p>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{mockLandlord.phone}</p>
          <p className="text-gray-600 dark:text-gray-300">{mockLandlord.email}</p>
        </Card>
        
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Reported Issues</h3>
            {/* <button 
              onClick={onReportIssue}
              className="flex items-center bg-teal-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Report Issue
            </button> */}
          </div>
          <ul className="divide-y dark:divide-gray-700">
            {issues.map(issue => (
              <li key={issue.id} className="py-3 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold">{issue.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Reported by {issue.reportedBy}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <select 
                    value={issue.status}
                    onChange={(e) => handleUpdateIssueStatus(issue.id, e.target.value)}
                    className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      issue.status === 'Resolved' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200' 
                        : issue.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-200'
                    }`}
                  >
                    <option value="Reported">Reported</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                  <button 
                    onClick={() => handleDeleteIssue(issue.id)}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Documents Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Important Documents</h3>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center bg-teal-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
          >
            <Upload className="w-4 h-4 mr-1" />
            Upload Document
          </button>
        </div>
        
        <div className="space-y-3">
          {documents.map(doc => (
            <div key={doc.id} className="p-3 border dark:border-gray-700 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-teal-600" />
                <div>
                  <p className="font-semibold">{doc.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Uploaded by {doc.uploadedBy} on {doc.date} • {doc.size}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded">
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          
          {documents.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No documents uploaded yet</p>
            </div>
          )}
        </div>
      </Card>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Upload Document</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Document Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Rental Agreement 2025"
                  value={newDocument.name}
                  onChange={(e) => setNewDocument({...newDocument, name: e.target.value})}
                  className="w-full p-2 rounded-lg border bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Upload File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input 
                          id="file-upload" 
                          name="file-upload" 
                          type="file" 
                          className="sr-only" 
                          onChange={(e) => setNewDocument({...newDocument, file: e.target.files[0]})}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PDF, DOC up to 10MB</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUploadDocument}
                  disabled={!newDocument.name || !newDocument.file}
                  className="px-4 py-2 rounded-lg font-semibold bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandlordModule;
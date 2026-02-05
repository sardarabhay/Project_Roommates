import { Plus, Upload, FileText, Edit, Trash2, Download } from 'lucide-react';
import Card from '../common/Card';
import ModuleHeader from '../common/ModuleHeader';
import { useState, useEffect, ChangeEvent } from 'react';
import { landlordApi, issuesApi, documentsApi } from '../../services/api';
import type { Landlord, Issue, Document } from '../../types';

interface LandlordModuleProps {
  onReportIssue: () => void;
}

interface NewDocument {
  name: string;
  file: File | null;
}

const LandlordModule = ({ onReportIssue }: LandlordModuleProps): JSX.Element => {
  const [landlord, setLandlord] = useState<Landlord | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [newDocument, setNewDocument] = useState<NewDocument>({ name: '', file: null });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    try {
      const [landlordData, issuesData, docsData] = await Promise.all([
        landlordApi.get(),
        issuesApi.getAll(),
        documentsApi.getAll()
      ]);
      setLandlord(landlordData);
      setIssues(issuesData);
      setDocuments(docsData);
    } catch (error) {
      console.error('Failed to fetch landlord data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async (): Promise<void> => {
    if (newDocument.name) {
      try {
        await documentsApi.create({
          name: newDocument.name,
          size: '1.2 MB' // Placeholder - real file upload would have actual size
        });
        fetchData(); // Refresh
        setNewDocument({ name: '', file: null });
        setShowUploadModal(false);
      } catch (error) {
        console.error('Failed to upload document:', error);
      }
    }
  };

  const handleDeleteDocument = async (docId: number): Promise<void> => {
    try {
      await documentsApi.delete(docId);
      setDocuments(documents.filter(doc => doc.id !== docId));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handleUpdateIssueStatus = async (issueId: number, newStatus: string): Promise<void> => {
    try {
      await issuesApi.updateStatus(issueId, newStatus);
      setIssues(issues.map(issue => 
        issue.id === issueId ? { ...issue, status: newStatus as Issue['status'] } : issue
      ));
    } catch (error) {
      console.error('Failed to update issue status:', error);
    }
  };

  const handleDeleteIssue = async (issueId: number): Promise<void> => {
    try {
      await issuesApi.delete(issueId);
      setIssues(issues.filter(issue => issue.id !== issueId));
    } catch (error) {
      console.error('Failed to delete issue:', error);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files[0]) {
      setNewDocument({ ...newDocument, file: files[0] });
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <ModuleHeader title="Landlord & Property" actionText="Report Issue" onActionClick={onReportIssue} />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <ModuleHeader title="Landlord & Property" actionText="Report Issue" onActionClick={onReportIssue} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <h3 className="font-bold text-lg mb-4">Landlord Info</h3>
          {landlord ? (
            <>
              <p className="font-semibold text-xl">{landlord.name}</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">{landlord.phone}</p>
              <p className="text-gray-600 dark:text-gray-300">{landlord.email}</p>
            </>
          ) : (
            <p className="text-gray-500">No landlord info available</p>
          )}
        </Card>
        
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Reported Issues</h3>
          </div>
          {issues.length === 0 ? (
            <p className="text-gray-500">No issues reported</p>
          ) : (
            <ul className="divide-y dark:divide-gray-700">
              {issues.map(issue => (
                <li key={issue.id} className="py-3 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{issue.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Reported by {issue.reportedByUser?.name}
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
          )}
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
                    Uploaded by {doc.uploadedByUser?.name} on {new Date(doc.createdAt).toLocaleDateString()} • {doc.size || 'N/A'}
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
                          onChange={handleFileChange}
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
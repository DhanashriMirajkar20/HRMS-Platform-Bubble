import React, { useEffect, useRef, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import axiosInstance from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { FaUpload, FaDownload, FaTrash } from 'react-icons/fa';

const EmployeeDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [rowMessage, setRowMessage] = useState({});
  const reuploadInputs = useRef({});
  const [formData, setFormData] = useState({
    documentName: '',
    documentType: '',
    file: null,
  });

  const employeeId = user?.employeeId;

  const fetchDocuments = async () => {
    if (!employeeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.DOCUMENTS.BY_EMPLOYEE}/${employeeId}`);
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [employeeId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData((prev) => ({ ...prev, file: files?.[0] || null }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!formData.file || !formData.documentName || !formData.documentType) {
      setMessage('Please provide document name, type, and file.');
      return;
    }
    const payload = new FormData();
    payload.append('file', formData.file);
    payload.append('documentName', formData.documentName);
    payload.append('documentType', formData.documentType);
    try {
      await axiosInstance.post(API_ENDPOINTS.DOCUMENTS.UPLOAD, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Document uploaded successfully.');
      setFormData({ documentName: '', documentType: '', file: null });
      await fetchDocuments();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Upload failed.');
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const res = await axiosInstance.get(`${API_ENDPOINTS.DOCUMENTS.DOWNLOAD}/${documentId}/download`);
      const url = res.data;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Download failed.';
      setRowMessage((prev) => ({ ...prev, [documentId]: message }));
    }
  };

  const handleDelete = async (documentId) => {
    if (!documentId) return;
    setRowMessage((prev) => ({ ...prev, [documentId]: '' }));
    try {
      await axiosInstance.delete(`${API_ENDPOINTS.DOCUMENTS.GET}/${documentId}`);
      setRowMessage((prev) => ({ ...prev, [documentId]: 'Document deleted.' }));
      await fetchDocuments();
    } catch (error) {
      setRowMessage((prev) => ({
        ...prev,
        [documentId]:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Delete failed.',
      }));
    }
  };

  const handleReupload = async (documentId, doc, fileOverride) => {
    setRowMessage((prev) => ({ ...prev, [documentId]: '' }));
    const file = fileOverride || null;
    if (!file) {
      setRowMessage((prev) => ({ ...prev, [documentId]: 'Please choose a file to reupload.' }));
      return;
    }
    const payload = new FormData();
    payload.append('file', file);
    payload.append('documentName', doc.documentName || '');
    payload.append('documentType', doc.documentType || '');
    try {
      await axiosInstance.post(
        `${API_ENDPOINTS.DOCUMENTS.REUPLOAD}/${documentId}/reupload`,
        payload,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setRowMessage((prev) => ({ ...prev, [documentId]: 'Document updated and resubmitted.' }));
      await fetchDocuments();
    } catch (error) {
      setRowMessage((prev) => ({
        ...prev,
        [documentId]:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Reupload failed.',
      }));
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="mb-4">
          <h2 className="fw-bold">Documents</h2>
          <p className="text-muted mb-0">Upload and manage your documents</p>
        </div>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Upload Document</h5>
                {message && <div className="alert alert-info">{message}</div>}
                <form onSubmit={handleUpload}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Document Name</label>
                    <input
                      type="text"
                      name="documentName"
                      className="form-control"
                      value={formData.documentName}
                      onChange={handleChange}
                      placeholder="e.g., Offer Letter"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Document Type</label>
                    <input
                      type="text"
                      name="documentType"
                      className="form-control"
                      value={formData.documentType}
                      onChange={handleChange}
                      placeholder="e.g., PDF"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">File</label>
                    <input type="file" name="file" className="form-control" onChange={handleChange} />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Upload
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="fw-bold mb-3">My Documents</h5>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status" />
                  </div>
                ) : documents.length === 0 ? (
                  <p className="text-muted mb-0">No documents uploaded yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc) => {
                          const status = doc.status || '';
                          const isRejected = status === 'REJECTED';
                          const isApproved = status === 'VERIFIED';
                          const docId = doc.documentId || doc.id;
                          const statusNote =
                            doc.rejectionReason ||
                            doc.reason ||
                            doc.comments ||
                            doc.remarks ||
                            doc.statusMessage ||
                            doc.approvalReason ||
                            '';
                          return (
                          <tr key={docId}>
                            <td className="fw-semibold">{doc.documentName || doc.name}</td>
                            <td>{doc.documentType || doc.type || '-'}</td>
                            <td>
                              {isApproved ? (
                                <span className="badge bg-success">Approved</span>
                              ) : isRejected ? (
                                <span className="badge bg-danger">Rejected</span>
                              ) : (
                                <span className="badge bg-warning text-dark">Pending</span>
                              )}
                              {statusNote ? (
                                <div className="small text-muted mt-1">{statusNote}</div>
                                ) : isRejected || isApproved ? (
                                  <div className="small text-muted mt-1">No description provided.</div>
                                ) : null}
                            </td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-2">
                                {isRejected ? (
                                  <>
                                    <input
                                      type="file"
                                      className="d-none"
                                      ref={(el) => {
                                        reuploadInputs.current[docId] = el;
                                      }}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0] || null;
                                        handleReupload(docId, doc, file);
                                        e.target.value = '';
                                      }}
                                    />
                                    <button
                                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                      onClick={() => reuploadInputs.current[docId]?.click()}
                                    >
                                      <FaUpload />
                                      Reupload
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                      onClick={() => handleDownload(docId)}
                                    >
                                      <FaDownload />
                                      View/Download
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                      onClick={() => handleDelete(docId)}
                                    >
                                      <FaTrash />
                                      Delete
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                      onClick={() => handleDownload(docId)}
                                    >
                                      <FaDownload />
                                      View/Download
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                      onClick={() => handleDelete(docId)}
                                    >
                                      <FaTrash />
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                              {rowMessage[docId] && (
                                <div className="text-muted small mt-1">
                                  {rowMessage[docId]}
                                </div>
                              )}
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDocuments;

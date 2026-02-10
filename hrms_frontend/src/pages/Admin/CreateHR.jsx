import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import axiosInstance from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../context/ToastContext';
import { FaEnvelope, FaLock, FaSave, FaTimes } from 'react-icons/fa';

const CreateHR = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    username: '',
    tempPassword: '',
    hrRole: 'ROLE_HR_OPERATIONS',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Email/Username is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
      newErrors.username = 'Invalid email format';
    }
    if (!formData.tempPassword) {
      newErrors.tempPassword = 'Password is required';
    } else if (formData.tempPassword.length < 6) {
      newErrors.tempPassword = 'Password must be at least 6 characters';
    }
    if (!formData.hrRole) newErrors.hrRole = 'HR role is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await axiosInstance.post(API_ENDPOINTS.ADMIN.CREATE_HR, {
        username: formData.username,
        tempPassword: formData.tempPassword,
        hrRole: formData.hrRole,
      });
      showToast({ type: 'success', title: 'HR created', message: 'HR created successfully!' });
      navigate('/admin/manage-hr');
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Failed to create HR';
      showToast({ type: 'error', title: 'Create failed', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="mb-4">
          <h2 className="fw-bold">Create HR Account</h2>
          <p className="text-muted mb-0">Add a new HR user with role-based access</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Email / Username <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaEnvelope size={14} className="text-muted" />
                        </span>
                        <input
                          type="email"
                          className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="hr@bubble.com"
                        />
                      </div>
                      {errors.username && <div className="invalid-feedback d-block">{errors.username}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Password <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaLock size={14} className="text-muted" />
                        </span>
                        <input
                          type="password"
                          className={`form-control ${errors.tempPassword ? 'is-invalid' : ''}`}
                          name="tempPassword"
                          value={formData.tempPassword}
                          onChange={handleChange}
                          placeholder="Enter a temporary password"
                        />
                      </div>
                      {errors.tempPassword && <div className="invalid-feedback d-block">{errors.tempPassword}</div>}
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        HR Role <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${errors.hrRole ? 'is-invalid' : ''}`}
                        name="hrRole"
                        value={formData.hrRole}
                        onChange={handleChange}
                      >
                        <option value="ROLE_HR_OPERATIONS">HR Operations</option>
                        <option value="ROLE_HR_PAYROLL">HR Payroll</option>
                        <option value="ROLE_HR_BP">HR Business Partner</option>
                        <option value="ROLE_TALENT_ACQUISITION">Talent Acquisition</option>
                        <option value="ROLE_HR_MANAGER">HR Manager</option>
                      </select>
                      {errors.hrRole && <div className="invalid-feedback d-block">{errors.hrRole}</div>}
                    </div>

                    <div className="col-12 mt-4 d-flex gap-3">
                      <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={loading}>
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <FaSave /> Create HR Account
                          </>
                        )}
                      </button>
                      <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/admin/dashboard')}>
                        <FaTimes className="me-2" /> Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateHR;

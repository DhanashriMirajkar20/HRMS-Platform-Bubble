import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import axiosInstance from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../context/ToastContext';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBuilding, FaSave, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

const CreateEmployee = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyEmail: '',
    personalEmail: '',
    phone: '',
    department: '',
    designation: '',
    salary: '',
    employeeType: 'FULL_TIME',
    currentBand: 'B1',
    dateOfJoining: new Date().toISOString().split('T')[0],
    temporaryPassword: '',
    confirmPassword: '',
    managerId: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [managers, setManagers] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.HR.GET_ALL_EMPLOYEES);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setManagers(list);
    } catch (error) {
      setManagers([]);
    }
  };

  React.useEffect(() => {
    fetchManagers();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = 'Company email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.companyEmail)) {
      newErrors.companyEmail = 'Invalid email format';
    }
    if (!formData.personalEmail.trim()) {
      newErrors.personalEmail = 'Personal email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personalEmail)) {
      newErrors.personalEmail = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    if (!formData.salary || formData.salary <= 0) newErrors.salary = 'Valid salary is required';
    if (formData.temporaryPassword || formData.confirmPassword) {
      if (formData.temporaryPassword.length < 6) {
        newErrors.temporaryPassword = 'Password must be at least 6 characters';
      } else if (formData.temporaryPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const phoneNum = parseInt(String(formData.phone).replace(/\D/g, ''), 10) || 0;
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyEmail: formData.companyEmail,
        personalEmail: formData.personalEmail,
        designation: formData.designation,
        department: formData.department,
        status: 'ACTIVE',
        dateOfJoining: formData.dateOfJoining || new Date().toISOString().split('T')[0],
        employeeType: formData.employeeType || 'FULL_TIME',
        phoneNumber: phoneNum,
        currentBand: formData.currentBand || 'B1',
        currentExperience: 0,
        ctc: parseInt(formData.salary, 10) || 0,
        managerId: formData.managerId ? Number(formData.managerId) : null,
      };
      if (formData.temporaryPassword?.trim()) {
        payload.tempPassword = formData.temporaryPassword.trim();
      }
      const res = await axiosInstance.post(API_ENDPOINTS.HR.CREATE_EMPLOYEE, payload);
      const creds = res.data;
      const msg = creds?.tempPassword
        ? `Employee created. Login: ${creds.username}. Temporary password: ${creds.tempPassword} (share securely with employee)`
        : 'Employee created successfully!';
      showToast({ type: 'success', title: 'Employee created', message: msg });
      navigate('/hr/manage-employees');
    } catch (error) {
      const data = error.response?.data;
      const msg =
        (typeof data?.message === 'string' && data.message) ||
        (typeof data?.error === 'string' && data.error) ||
        (error.response?.status === 403 && 'You do not have permission to create employees.') ||
        (error.response?.status === 401 && 'Please log in again.') ||
        (error.response?.status === 400 && (data?.message || 'Invalid request. Check the form (e.g. company email may already be in use).')) ||
        'Failed to create employee. Try again or contact support.';
      showToast({ type: 'error', title: 'Create failed', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="mb-4">
          <h2 className="fw-bold">Create Employee</h2>
          <p className="text-muted mb-0">Add a new employee and generate login credentials</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        First Name <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaUser size={14} className="text-muted" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Enter first name"
                        />
                      </div>
                      {errors.firstName && <div className="invalid-feedback d-block">{errors.firstName}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Last Name <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaUser size={14} className="text-muted" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Enter last name"
                        />
                      </div>
                      {errors.lastName && <div className="invalid-feedback d-block">{errors.lastName}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Company Email <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaEnvelope size={14} className="text-muted" />
                        </span>
                        <input
                          type="email"
                          className={`form-control ${errors.companyEmail ? 'is-invalid' : ''}`}
                          name="companyEmail"
                          value={formData.companyEmail}
                          onChange={handleChange}
                          placeholder="employee@bubble.com"
                        />
                      </div>
                      {errors.companyEmail && <div className="invalid-feedback d-block">{errors.companyEmail}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Personal Email <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaEnvelope size={14} className="text-muted" />
                        </span>
                        <input
                          type="email"
                          className={`form-control ${errors.personalEmail ? 'is-invalid' : ''}`}
                          name="personalEmail"
                          value={formData.personalEmail}
                          onChange={handleChange}
                          placeholder="employee@gmail.com"
                        />
                      </div>
                      {errors.personalEmail && <div className="invalid-feedback d-block">{errors.personalEmail}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Temporary password (optional)</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaLock size={14} className="text-muted" />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control ${errors.temporaryPassword ? 'is-invalid' : ''}`}
                          name="temporaryPassword"
                          value={formData.temporaryPassword}
                          onChange={handleChange}
                          placeholder="Leave blank to auto-generate"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword((p) => !p)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </button>
                      </div>
                      {errors.temporaryPassword && <div className="invalid-feedback d-block">{errors.temporaryPassword}</div>}
                      <div className="text-muted small mt-1">
                        Min 6 characters. Employee will use this with company email to sign in.
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Confirm temporary password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaLock size={14} className="text-muted" />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Re-enter if setting password"
                          autoComplete="new-password"
                        />
                      </div>
                      {errors.confirmPassword && <div className="invalid-feedback d-block">{errors.confirmPassword}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Phone <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaPhone size={14} className="text-muted" />
                        </span>
                        <input
                          type="tel"
                          className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 234 567 8900"
                        />
                      </div>
                      {errors.phone && <div className="invalid-feedback d-block">{errors.phone}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Department <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <FaBuilding size={14} className="text-muted" />
                        </span>
                        <input
                          type="text"
                          className={`form-control ${errors.department ? 'is-invalid' : ''}`}
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          placeholder="Engineering"
                        />
                      </div>
                      {errors.department && <div className="invalid-feedback d-block">{errors.department}</div>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Designation <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.designation ? 'is-invalid' : ''}`}
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="Software Engineer"
                      />
                      {errors.designation && <div className="invalid-feedback d-block">{errors.designation}</div>}
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Employee Type</label>
                      <select className="form-select" name="employeeType" value={formData.employeeType} onChange={handleChange}>
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="CONTRACT">Contract</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Band</label>
                      <select className="form-select" name="currentBand" value={formData.currentBand} onChange={handleChange}>
                        <option value="B1">B1</option>
                        <option value="B2">B2</option>
                        <option value="B3">B3</option>
                        <option value="B4">B4</option>
                        <option value="B5">B5</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Date of Joining</label>
                      <input
                        type="date"
                        className="form-control"
                        name="dateOfJoining"
                        value={formData.dateOfJoining}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Manager</label>
                      <select
                        className="form-select"
                        name="managerId"
                        value={formData.managerId}
                        onChange={handleChange}
                      >
                        <option value="">Select manager</option>
                        {managers.map((m) => (
                          <option key={m.employeeId} value={m.employeeId}>
                            {(m.firstName || '') + ' ' + (m.lastName || '')} ({m.companyEmail || m.employeeId})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Salary (CTC) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control ${errors.salary ? 'is-invalid' : ''}`}
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        placeholder="50000"
                      />
                      {errors.salary && <div className="invalid-feedback d-block">{errors.salary}</div>}
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
                            <FaSave /> Create Employee
                          </>
                        )}
                      </button>
                      <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/hr/dashboard')}>
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

export default CreateEmployee;

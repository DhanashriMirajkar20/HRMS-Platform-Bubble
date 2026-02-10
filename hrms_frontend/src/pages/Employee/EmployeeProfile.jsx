
import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import {
  FaEnvelope,
  FaSave,
  FaMapMarkerAlt,
  FaUserTie,
  FaDownload,
  FaPlus,
} from 'react-icons/fa';
import axiosInstance from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAppState } from '../../context/AppStateContext';

const skillOptions = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Java',
  'Spring',
  'Python',
  'SQL',
  'DevOps',
  'QA',
  'UI/UX',
];

const genderOptions = ['Female', 'Male', 'Non-binary', 'Prefer not to say'];
const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const nationalityOptions = ['Indian', 'American', 'British', 'Canadian', 'Australian', 'Other'];
const maritalStatusOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
const relationOptions = ['Father', 'Mother', 'Spouse', 'Sibling', 'Friend', 'Other'];
const employeeTypeOptions = ['Full Time', 'Part Time', 'Contract', 'Intern'];
const officeLocationOptions = ['Bengaluru', 'Pune', 'Hyderabad', 'Mumbai', 'Remote'];
const clientLocationOptions = ['Onsite', 'Offshore', 'Hybrid'];
const bankNameOptions = ['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'Other'];
const bankBranchOptions = ['Main Branch', 'City Center', 'Tech Park', 'Other'];

const pincodeLookup = {
  bengaluru: '560001',
  bangalore: '560001',
  pune: '411001',
  hyderabad: '500001',
  mumbai: '400001',
};

const emptyAddress = {
  addressId: null,
  houseNumber: '',
  landmark: '',
  street: '',
  city: '',
  pincode: '',
  state: '',
  country: '',
  isPermanent: false,
};

const EmployeeProfile = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    profile,
    profileLoading,
    accountInfo,
    personal,
    addresses,
    emergencies,
    education,
    skills,
    experiences,
    jobDetails,
    account,
    bandHistory,
    documents,
    profileDataLoading,
    refreshProfile,
    refreshProfileData,
  } = useAppState();

  const [loading, setLoading] = useState(false);

  const employeeId = accountInfo.employeeId || user?.employeeId;

  const fullName = useMemo(() => {
    if (!profile) return user?.name || '';
    return `${profile.firstName || ''} ${profile.middleName || ''} ${profile.lastName || ''}`.replace(/\s+/g, ' ').trim();
  }, [profile, user]);

  const currentAddress = useMemo(
    () => addresses.find((addr) => addr?.isPermanent === false) || { ...emptyAddress, isPermanent: false },
    [addresses]
  );

  const permanentAddress = useMemo(
    () => addresses.find((addr) => addr?.isPermanent === true) || { ...emptyAddress, isPermanent: true },
    [addresses]
  );

  const [personalForm, setPersonalForm] = useState({
    dob: '',
    gender: '',
    bloodGroup: '',
    nationality: '',
    maritalStatus: '',
    fatherName: '',
    spouseName: '',
    personalMail: '',
    alternatePhoneNumber: '',
  });

  const [currentAddressForm, setCurrentAddressForm] = useState(currentAddress);
  const [permanentAddressForm, setPermanentAddressForm] = useState(permanentAddress);
  const [sameAsCurrent, setSameAsCurrent] = useState(false);

  const [emergencyForm, setEmergencyForm] = useState({
    emergencyId: null,
    contactName: '',
    relation: '',
    phoneNumber: '',
  });

  const [accountForm, setAccountForm] = useState({
    accountId: null,
    accountNumber: '',
    bankName: '',
    branchName: '',
    ifscCode: '',
    accountType: '',
  });

  const [skillsForm, setSkillsForm] = useState([]);
  const [educationForm, setEducationForm] = useState([]);
  const [experienceForm, setExperienceForm] = useState([]);
  const [identityForm, setIdentityForm] = useState({
    aadhaar: '',
    pan: '',
    passport: '',
    drivingLicense: '',
    primaryMobile: '',
  });
  const [visaForm, setVisaForm] = useState({
    visaType: '',
    visaNumber: '',
    validFrom: '',
    validTo: '',
  });
  const [dependentForm, setDependentForm] = useState([
    {
      tempId: `dep-${Date.now()}`,
      firstName: '',
      middleName: '',
      lastName: '',
      relation: '',
      dateOfBirth: '',
      address: '',
      taxFiling: '',
      phone: '',
      nationality: '',
    },
  ]);
  const [disabilityForm, setDisabilityForm] = useState({
    hasDisability: '',
    description: '',
  });
  const [certForm, setCertForm] = useState([
    { tempId: `cert-${Date.now()}`, name: '', issuer: '', year: '' },
  ]);
  const [taxForm, setTaxForm] = useState({
    method: '',
    fixedRate: '',
  });
  const [officeHistoryForm, setOfficeHistoryForm] = useState([
    { tempId: `office-${Date.now()}`, location: '', fromDate: '', toDate: '' },
  ]);

  const handlePlaceholderSave = () => {
    showToast({
      type: 'info',
      title: 'Saved locally',
      message: 'API integration pending for this section.',
    });
  };

  useEffect(() => {
    refreshProfile();
    refreshProfileData();
  }, [refreshProfile, refreshProfileData]);

  useEffect(() => {
    if (personal) {
      setPersonalForm({
        dob: personal.dob || '',
        gender: personal.gender || '',
        bloodGroup: personal.bloodGroup || '',
        nationality: personal.nationality || '',
        maritalStatus: personal.maritalStatus || '',
        fatherName: personal.fatherName || '',
        spouseName: personal.spouseName || '',
        personalMail: personal.personalMail || '',
        alternatePhoneNumber: personal.alternatePhoneNumber || '',
      });
    }
  }, [personal]);

  useEffect(() => {
    setCurrentAddressForm(currentAddress);
  }, [currentAddress]);

  useEffect(() => {
    setPermanentAddressForm(permanentAddress);
  }, [permanentAddress]);

  useEffect(() => {
    const firstEmergency = emergencies[0];
    if (firstEmergency) {
      setEmergencyForm({
        emergencyId: firstEmergency.emergencyId,
        contactName: firstEmergency.contactName || '',
        relation: firstEmergency.relation || '',
        phoneNumber: firstEmergency.phoneNumber || '',
      });
    }
  }, [emergencies]);

  useEffect(() => {
    if (account) {
      setAccountForm({
        accountId: account.accountId || null,
        accountNumber: account.accountNumber || '',
        bankName: account.bankName || '',
        branchName: account.branchName || '',
        ifscCode: account.ifscCode || '',
        accountType: account.accountType || '',
      });
    }
  }, [account]);

  useEffect(() => {
    setSkillsForm(
      skills.map((item) => ({
        ...item,
        tempId: item.employeeSkillId || `${item.skillName}-${Math.random()}`,
      }))
    );
  }, [skills]);

  useEffect(() => {
    setEducationForm(
      education.map((item) => ({
        ...item,
        tempId: item.employeeEducationId || `${item.degree}-${Math.random()}`,
      }))
    );
  }, [education]);

  useEffect(() => {
    setExperienceForm(
      experiences.map((item) => ({
        ...item,
        tempId: item.experienceId || `${item.company}-${Math.random()}`,
      }))
    );
  }, [experiences]);

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const applyPincode = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => {
      const next = { ...prev, [name]: value };
      if ((name === 'city' || name === 'state' || name === 'country') && !next.pincode) {
        const key = (next.city || '').toLowerCase().trim();
        if (pincodeLookup[key]) {
          next.pincode = pincodeLookup[key];
        }
      }
      return next;
    });
  };

  const handleEmergencyChange = (e) => {
    const { name, value } = e.target;
    setEmergencyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountForm((prev) => ({ ...prev, [name]: value }));
  };
  const savePersonal = async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      if (personal?.personalId) {
        await axiosInstance.put(`${API_ENDPOINTS.EMPLOYEE.PERSONAL_UPDATE}/${employeeId}`, personalForm);
      } else {
        await axiosInstance.post(`${API_ENDPOINTS.EMPLOYEE.PERSONAL}/${employeeId}/add-personal`, personalForm);
      }
      showToast({ type: 'success', title: 'Personal updated', message: 'Personal details saved.' });
      refreshProfileData();
    } catch (error) {
      showToast({ type: 'error', title: 'Update failed', message: 'Unable to save personal details.' });
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async (addressForm) => {
    if (!employeeId) return;
    setLoading(true);
    try {
      if (addressForm.addressId) {
        await axiosInstance.patch(
          `${API_ENDPOINTS.EMPLOYEE.ADDRESSES}/${employeeId}/addresses/${addressForm.addressId}`,
          addressForm
        );
      } else {
        await axiosInstance.post(`${API_ENDPOINTS.EMPLOYEE.ADDRESSES}/${employeeId}/addresses`, addressForm);
      }
      showToast({ type: 'success', title: 'Address updated', message: 'Address saved.' });
      refreshProfileData();
    } catch (error) {
      showToast({ type: 'error', title: 'Update failed', message: 'Unable to save address.' });
    } finally {
      setLoading(false);
    }
  };

  const saveEmergency = async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      if (emergencyForm.emergencyId) {
        await axiosInstance.put(
          `${API_ENDPOINTS.EMPLOYEE_EXTRA.EMERGENCIES}/${employeeId}/emergencies/${emergencyForm.emergencyId}`,
          emergencyForm
        );
      } else {
        await axiosInstance.post(`${API_ENDPOINTS.EMPLOYEE_EXTRA.EMERGENCIES}/${employeeId}/emergencies`, emergencyForm);
      }
      showToast({ type: 'success', title: 'Emergency updated', message: 'Emergency details saved.' });
      refreshProfileData();
    } catch (error) {
      showToast({ type: 'error', title: 'Update failed', message: 'Unable to save emergency details.' });
    } finally {
      setLoading(false);
    }
  };

  const saveAccount = async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      if (accountForm.accountId) {
        await axiosInstance.put(
          `${API_ENDPOINTS.EMPLOYEE_EXTRA.ACCOUNT}/${employeeId}/account/${accountForm.accountId}`,
          accountForm
        );
      } else {
        await axiosInstance.post(`${API_ENDPOINTS.EMPLOYEE_EXTRA.ACCOUNT}/${employeeId}/account`, accountForm);
      }
      showToast({ type: 'success', title: 'Bank updated', message: 'Salary payment details saved.' });
      refreshProfileData();
    } catch (error) {
      showToast({ type: 'error', title: 'Update failed', message: 'Unable to save bank details.' });
    } finally {
      setLoading(false);
    }
  };

  const updateSkill = async (skill) => {
    if (!employeeId) return;
    setLoading(true);
    try {
      if (skill.employeeSkillId) {
        await axiosInstance.put(
          `${API_ENDPOINTS.EMPLOYEE_EXTRA.SKILLS}/${employeeId}/skills/${skill.employeeSkillId}`,
          skill
        );
      } else {
        await axiosInstance.post(`${API_ENDPOINTS.EMPLOYEE_EXTRA.SKILLS}/${employeeId}/add-skills`, skill);
      }
      showToast({ type: 'success', title: 'Skills updated', message: 'Skills saved.' });
      refreshProfileData();
    } catch (error) {
      showToast({ type: 'error', title: 'Update failed', message: 'Unable to save skill.' });
    } finally {
      setLoading(false);
    }
  };

  const updateEducation = async (edu) => {
    if (!employeeId) return;
    setLoading(true);
    try {
      if (edu.employeeEducationId) {
        await axiosInstance.patch(
          `${API_ENDPOINTS.EMPLOYEE.EDUCATION}/${employeeId}/education/${edu.employeeEducationId}`,
          edu
        );
      } else {
        await axiosInstance.post(`${API_ENDPOINTS.EMPLOYEE.EDUCATION}/${employeeId}/add-education`, edu);
      }
      showToast({ type: 'success', title: 'Education updated', message: 'Education saved.' });
      refreshProfileData();
    } catch (error) {
      showToast({ type: 'error', title: 'Update failed', message: 'Unable to save education.' });
    } finally {
      setLoading(false);
    }
  };

  const updateExperience = async (exp) => {
    if (!employeeId) return;
    setLoading(true);
    try {
      if (exp.experienceId) {
        await axiosInstance.put(
          `${API_ENDPOINTS.EMPLOYEE_EXTRA.EXPERIENCE}/${employeeId}/experience/${exp.experienceId}`,
          exp
        );
      } else {
        await axiosInstance.post(`${API_ENDPOINTS.EMPLOYEE_EXTRA.EXPERIENCE}/${employeeId}/experience`, exp);
      }
      showToast({ type: 'success', title: 'Experience updated', message: 'Experience saved.' });
      refreshProfileData();
    } catch (error) {
      showToast({ type: 'error', title: 'Update failed', message: 'Unable to save experience.' });
    } finally {
      setLoading(false);
    }
  };

  const addSkillRow = () => {
    setSkillsForm((prev) => [
      ...prev,
      {
        tempId: `new-${Date.now()}`,
        skillName: '',
        skillType: 'Secondary',
        proficiencyLevel: '',
        yearsOfExperience: '',
        lastUsedYear: '',
        isPrimary: false,
      },
    ]);
  };

  const addEducationRow = () => {
    setEducationForm((prev) => [
      ...prev,
      {
        tempId: `new-${Date.now()}`,
        degree: '',
        institution: '',
        year: '',
        grade: '',
        isHighest: false,
      },
    ]);
  };

  const addExperienceRow = () => {
    setExperienceForm((prev) => [
      ...prev,
      {
        tempId: `new-${Date.now()}`,
        company: '',
        designation: '',
        fromDate: '',
        toDate: '',
      },
    ]);
  };

  const displayEmail = profile?.companyEmail || accountInfo.username || user?.email || '-';
  const designation = profile?.designation || 'Role';
  const department = profile?.department || jobDetails?.departmentName || '';
  const headerSubtitle = department && department !== designation ? `${designation} | ${department}` : designation;
  const location =
    jobDetails?.baseLocation ||
    profile?.officeLocation ||
    profile?.location ||
    jobDetails?.clientLocation ||
    '-';
  const roleNames = (roles) =>
    (Array.isArray(roles) ? roles : [])
      .map((r) => (typeof r === 'string' ? r : r?.name || ''))
      .filter(Boolean);
  const displayRole = (() => {
    const roles = roleNames(user?.roles);
    const raw = (user?.role || '').toUpperCase();
    if (roles.includes('ROLE_ADMIN') || raw === 'ADMIN') return 'Admin';
    if (
      roles.some((r) => r.startsWith('ROLE_HR')) ||
      roles.includes('ROLE_TALENT_ACQUISITION') ||
      raw === 'HR'
    ) {
      return 'HR';
    }
    if (roles.length > 0) {
      return roles[0].replace('ROLE_', '').replace(/_/g, ' ');
    }
    return 'Employee';
  })();
  const showRoleBadge =
    displayRole &&
    !(headerSubtitle || '')
      .toLowerCase()
      .includes(displayRole.toLowerCase());

  return (
    <Layout>
      <div className="container-fluid">
        <div className="profile-hero card border-0 shadow-sm mb-4">
          <div className="profile-hero-body">
            <div className="profile-avatar">{fullName ? fullName.charAt(0) : 'E'}</div>
            <div className="profile-hero-content">
              <h3 className="fw-bold mb-1">{fullName || accountInfo.username || 'Employee'}</h3>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <div className="text-muted">{headerSubtitle}</div>
                {showRoleBadge && <span className="badge text-bg-light border">{displayRole}</span>}
              </div>
            </div>
          </div>
          <div className="profile-hero-meta">
            <div className="profile-meta-item">
              <FaEnvelope /> {displayEmail}
            </div>
            <div className="profile-meta-item">
              <FaMapMarkerAlt /> {location}
            </div>
            <div className="profile-meta-item">
              <FaUserTie /> {profile?.managerName || 'Manager'}
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="profile-summary-grid">
              <div>
                <div className="text-muted small">Employee ID</div>
                <div className="fw-semibold">{profile?.employeeId || accountInfo.employeeId || '-'}</div>
              </div>
              <div>
                <div className="text-muted small">Official Email</div>
                <div className="fw-semibold">{profile?.companyEmail || '-'}</div>
              </div>
              <div>
                <div className="text-muted small">Sub Business Unit</div>
                <div className="fw-semibold">{jobDetails?.clientCompany || '-'}</div>
              </div>
              <div>
                <div className="text-muted small">Current Office Location</div>
                <div className="fw-semibold">{jobDetails?.baseLocation || '-'}</div>
              </div>
              <div>
                <div className="text-muted small">Emergency Contact</div>
                <div className="fw-semibold">{emergencyForm.contactName || '-'}</div>
              </div>
              <div>
                <div className="text-muted small">Emergency Number</div>
                <div className="fw-semibold">{emergencyForm.phoneNumber || '-'}</div>
              </div>
              <div>
                <div className="text-muted small">Sub BU Delivery</div>
                <div className="fw-semibold">{jobDetails?.departmentName || profile?.department || '-'}</div>
              </div>
              <div>
                <div className="text-muted small">Band / Level</div>
                <div className="fw-semibold">{bandHistory[0]?.bandLevel || profile?.currentBand || '-'}</div>
              </div>
              <div>
                <div className="text-muted small">Past Experience</div>
                <div className="fw-semibold">{experiences.length} roles</div>
              </div>
              <div>
                <div className="text-muted small">Total Experience</div>
                <div className="fw-semibold">{profile?.currentExperience ?? '-'} years</div>
              </div>
              <div>
                <div className="text-muted small">Manager</div>
                <div className="fw-semibold">{profile?.managerName || '-'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3">Organization Chart</h5>
            <div className="org-chart">
              <div className="org-node">
                <div className="org-avatar">M</div>
                <div className="org-name">{profile?.managerName || 'Manager'}</div>
                <div className="org-title">{jobDetails?.departmentName || 'Department'}</div>
              </div>
              <div className="org-line" />
              <div className="org-node highlight">
                <div className="org-avatar">{fullName ? fullName.charAt(0) : 'E'}</div>
                <div className="org-name">{fullName || 'Employee'}</div>
                <div className="org-title">{profile?.designation || 'Role'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-sections">
          <div className="profile-sections-body">
            {(profileLoading || profileDataLoading) && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status" />
              </div>
            )}
            {!profileLoading && (
              <div className="profile-section">
                <div className="row g-4">
                <div className="col-lg-6 section-card">
                  <h6 className="fw-bold mb-3">Biographical</h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Salutation</label>
                      <input className="form-control" type="text" placeholder="Mr./Ms." disabled />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">First Name</label>
                      <input className="form-control" type="text" value={profile?.firstName || ''} disabled />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Last Name</label>
                      <input className="form-control" type="text" value={profile?.lastName || ''} disabled />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Gender</label>
                      <input className="form-control" type="text" value={personalForm.gender || ''} disabled />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">DOB</label>
                      <input className="form-control" type="date" value={personalForm.dob || ''} disabled />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Nationality</label>
                      <input className="form-control" type="text" value={personalForm.nationality || ''} disabled />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Father Name</label>
                      <input className="form-control" type="text" value={personalForm.fatherName || ''} disabled />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Spouse Name</label>
                      <input className="form-control" type="text" value={personalForm.spouseName || ''} disabled />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 section-card">
                  <h6 className="fw-bold mb-3">Contact Details</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Personal Email</label>
                      <input className="form-control" type="email" value={personalForm.personalMail || ''} disabled />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Alternate Email</label>
                      <input className="form-control" type="email" placeholder="-" disabled />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Country Code</label>
                      <input className="form-control" type="text" placeholder="+91" disabled />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Personal Mobile</label>
                      <input className="form-control" type="text" value={personalForm.alternatePhoneNumber || ''} disabled />
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )}
            {!profileLoading && (
              <div className="profile-section">
                <div className="row g-4">
                <div className="col-12 section-card">
                  <h6 className="fw-bold mb-3">Personal Details</h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Date of Birth</label>
                      <input
                        className="form-control"
                        type="date"
                        name="dob"
                        value={personalForm.dob || ''}
                        onChange={handlePersonalChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Gender</label>
                      <select
                        className="form-select"
                        name="gender"
                        value={personalForm.gender || ''}
                        onChange={handlePersonalChange}
                      >
                        <option value="">Select</option>
                        {genderOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Blood Group</label>
                      <select
                        className="form-select"
                        name="bloodGroup"
                        value={personalForm.bloodGroup || ''}
                        onChange={handlePersonalChange}
                      >
                        <option value="">Select</option>
                        {bloodGroupOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Nationality</label>
                      <select
                        className="form-select"
                        name="nationality"
                        value={personalForm.nationality || ''}
                        onChange={handlePersonalChange}
                      >
                        <option value="">Select</option>
                        {nationalityOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Marital Status</label>
                      <select
                        className="form-select"
                        name="maritalStatus"
                        value={personalForm.maritalStatus || ''}
                        onChange={handlePersonalChange}
                      >
                        <option value="">Select</option>
                        {maritalStatusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Father Name</label>
                      <input
                        className="form-control"
                        type="text"
                        name="fatherName"
                        value={personalForm.fatherName || ''}
                        onChange={handlePersonalChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Spouse Name</label>
                      <input
                        className="form-control"
                        type="text"
                        name="spouseName"
                        value={personalForm.spouseName || ''}
                        onChange={handlePersonalChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Personal Email</label>
                      <input
                        className="form-control"
                        type="email"
                        name="personalMail"
                        value={personalForm.personalMail || ''}
                        onChange={handlePersonalChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Alternate Phone</label>
                      <input
                        className="form-control"
                        type="text"
                        name="alternatePhoneNumber"
                        value={personalForm.alternatePhoneNumber || ''}
                        onChange={handlePersonalChange}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <button className="btn btn-primary" type="button" disabled={loading} onClick={savePersonal}>
                      <FaSave className="me-2" /> Save Personal Details
                    </button>
                  </div>
                </div>

                <div className="col-12 section-card">
                  <h6 className="fw-bold mb-3">Address</h6>
                  <div className="row g-4">
                    <div className="col-lg-6">
                      <div className="border rounded p-3 h-100">
                        <div className="fw-semibold mb-2">Current Address</div>
                        <div className="row g-2">
                          {['houseNumber', 'street', 'landmark', 'city', 'state', 'country', 'pincode'].map((field) => (
                            <div className="col-6" key={field}>
                              <label className="form-label text-capitalize">{field.replace('Number', ' Number')}</label>
                              <input
                                className="form-control"
                                name={field}
                                value={currentAddressForm[field] || ''}
                                onChange={handleAddressChange(setCurrentAddressForm)}
                                onBlur={applyPincode(setCurrentAddressForm)}
                              />
                            </div>
                          ))}
                        </div>
                        <button
                          className="btn btn-outline-primary btn-sm mt-3"
                          type="button"
                          disabled={loading}
                          onClick={() => saveAddress({ ...currentAddressForm, isPermanent: false })}
                        >
                          Save Current Address
                        </button>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="border rounded p-3 h-100">
                        <div className="fw-semibold mb-2">Permanent Address</div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="sameAsCurrent"
                            checked={sameAsCurrent}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSameAsCurrent(checked);
                              if (checked) {
                                setPermanentAddressForm({ ...currentAddressForm, isPermanent: true });
                              }
                            }}
                          />
                          <label className="form-check-label" htmlFor="sameAsCurrent">
                            Current address is permanent address
                          </label>
                        </div>
                        <div className="row g-2">
                          {['houseNumber', 'street', 'landmark', 'city', 'state', 'country', 'pincode'].map((field) => (
                            <div className="col-6" key={field}>
                              <label className="form-label text-capitalize">{field.replace('Number', ' Number')}</label>
                              <input
                                className="form-control"
                                name={field}
                                value={permanentAddressForm[field] || ''}
                                onChange={handleAddressChange(setPermanentAddressForm)}
                                onBlur={applyPincode(setPermanentAddressForm)}
                                disabled={sameAsCurrent}
                              />
                            </div>
                          ))}
                        </div>
                        <button
                          className="btn btn-outline-primary btn-sm mt-3"
                          type="button"
                          disabled={loading}
                          onClick={() => saveAddress({ ...permanentAddressForm, isPermanent: true })}
                        >
                          Save Permanent Address
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 section-card">
                  <h6 className="fw-bold mb-3">Emergency Details</h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Contact Name</label>
                      <input className="form-control" name="contactName" value={emergencyForm.contactName} onChange={handleEmergencyChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Relation</label>
                      <select className="form-select" name="relation" value={emergencyForm.relation} onChange={handleEmergencyChange}>
                        <option value="">Select</option>
                        {relationOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Phone</label>
                      <input className="form-control" name="phoneNumber" value={emergencyForm.phoneNumber} onChange={handleEmergencyChange} />
                    </div>
                  </div>
                  <button className="btn btn-primary mt-3" type="button" disabled={loading} onClick={saveEmergency}>
                    Save Emergency Details
                  </button>
                </div>
                </div>
              </div>
            )}
            {!profileLoading && (
              <div className="profile-section">
                <div className="profile-section-title">Job</div>
                <div className="row g-4">
                <div className="col-12 section-card">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Employee ID</label>
                      <input className="form-control" value={profile?.employeeId || ''} disabled />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Date of Joining</label>
                      <input className="form-control" value={profile?.dateOfJoining || ''} disabled />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Employee Type</label>
                      <select className="form-select" value={profile?.employeeType || ''} disabled>
                        <option value="">{profile?.employeeType || 'Select'}</option>
                        {employeeTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Base Office Location</label>
                      <select className="form-select" value={jobDetails?.baseLocation || ''} disabled>
                        <option value="">{jobDetails?.baseLocation || 'Select'}</option>
                        {officeLocationOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Client Location</label>
                      <select className="form-select" value={jobDetails?.clientLocation || ''} disabled>
                        <option value="">{jobDetails?.clientLocation || 'Select'}</option>
                        {clientLocationOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Group Joining Date</label>
                      <input className="form-control" placeholder="-" disabled />
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )}
            {!profileLoading && (
              <div className="profile-section">
                <div className="profile-section-title">Salary Payment</div>
                <div className="row g-4">
                <div className="col-12 section-card">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Account Number</label>
                      <input className="form-control" name="accountNumber" value={accountForm.accountNumber} onChange={handleAccountChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Bank Name</label>
                      <select className="form-select" name="bankName" value={accountForm.bankName} onChange={handleAccountChange}>
                        <option value="">Select</option>
                        {bankNameOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Bank Branch</label>
                      <select className="form-select" name="branchName" value={accountForm.branchName} onChange={handleAccountChange}>
                        <option value="">Select</option>
                        {bankBranchOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">IFSC Code</label>
                      <input className="form-control" name="ifscCode" value={accountForm.ifscCode} onChange={handleAccountChange} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Account Type</label>
                      <input className="form-control" name="accountType" value={accountForm.accountType} onChange={handleAccountChange} />
                    </div>
                  </div>
                  <button className="btn btn-primary mt-3" type="button" disabled={loading} onClick={saveAccount}>
                    Save Bank Details
                  </button>
                </div>
                </div>
              </div>
            )}
            {!profileLoading && (
              <div className="profile-section">
                <div className="profile-section-title">Skills</div>
                <div className="row g-4">
                <div className="col-12 section-card">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Primary skill + secondary skills</span>
                    <button className="btn btn-outline-primary btn-sm" type="button" onClick={addSkillRow}>
                      <FaPlus className="me-1" /> Add Skill
                    </button>
                  </div>
                  <div className="row g-3">
                    {skillsForm.map((skill) => (
                      <div className="col-lg-6" key={skill.tempId}>
                        <div className="border rounded p-3">
                          <div className="row g-2">
                            <div className="col-6">
                              <label className="form-label">Skill</label>
                              <select
                                className="form-select"
                                value={skill.skillName || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSkillsForm((prev) =>
                                    prev.map((item) =>
                                      item.tempId === skill.tempId ? { ...item, skillName: value } : item
                                    )
                                  );
                                }}
                              >
                                <option value="">Select</option>
                                {skillOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-6">
                              <label className="form-label">Type</label>
                              <select
                                className="form-select"
                                value={skill.skillType || 'Secondary'}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSkillsForm((prev) =>
                                    prev.map((item) =>
                                      item.tempId === skill.tempId ? { ...item, skillType: value } : item
                                    )
                                  );
                                }}
                              >
                                <option value="Primary">Primary</option>
                                <option value="Secondary">Secondary</option>
                              </select>
                            </div>
                            <div className="col-6">
                              <label className="form-label">Proficiency</label>
                              <input
                                className="form-control"
                                value={skill.proficiencyLevel || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSkillsForm((prev) =>
                                    prev.map((item) =>
                                      item.tempId === skill.tempId ? { ...item, proficiencyLevel: value } : item
                                    )
                                  );
                                }}
                              />
                            </div>
                            <div className="col-6">
                              <label className="form-label">Years</label>
                              <input
                                className="form-control"
                                value={skill.yearsOfExperience || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setSkillsForm((prev) =>
                                    prev.map((item) =>
                                      item.tempId === skill.tempId ? { ...item, yearsOfExperience: value } : item
                                    )
                                  );
                                }}
                              />
                            </div>
                          </div>
                          <button className="btn btn-outline-primary btn-sm mt-3" type="button" onClick={() => updateSkill(skill)}>
                            Save Skill
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                </div>
              </div>
            )}
            {!profileLoading && (
              <div className="profile-section">
                <div className="profile-section-title">Education</div>
                <div className="row g-4">
                <div className="col-12 section-card">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Add degree, diploma or certification</span>
                    <button className="btn btn-outline-primary btn-sm" type="button" onClick={addEducationRow}>
                      <FaPlus className="me-1" /> Add Education
                    </button>
                  </div>
                  <div className="row g-3">
                    {educationForm.map((edu) => (
                      <div className="col-lg-6" key={edu.tempId}>
                        <div className="border rounded p-3">
                          <div className="row g-2">
                            <div className="col-6">
                              <label className="form-label">Degree</label>
                              <input
                                className="form-control"
                                value={edu.degree || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setEducationForm((prev) =>
                                    prev.map((item) => (item.tempId === edu.tempId ? { ...item, degree: value } : item))
                                  );
                                }}
                              />
                            </div>
                            <div className="col-6">
                              <label className="form-label">Institution</label>
                              <input
                                className="form-control"
                                value={edu.institution || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setEducationForm((prev) =>
                                    prev.map((item) => (item.tempId === edu.tempId ? { ...item, institution: value } : item))
                                  );
                                }}
                              />
                            </div>
                            <div className="col-6">
                              <label className="form-label">Year</label>
                              <input
                                className="form-control"
                                value={edu.year || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setEducationForm((prev) =>
                                    prev.map((item) => (item.tempId === edu.tempId ? { ...item, year: value } : item))
                                  );
                                }}
                              />
                            </div>
                            <div className="col-6">
                              <label className="form-label">Grade</label>
                              <input
                                className="form-control"
                                value={edu.grade || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setEducationForm((prev) =>
                                    prev.map((item) => (item.tempId === edu.tempId ? { ...item, grade: value } : item))
                                  );
                                }}
                              />
                            </div>
                          </div>
                          <button className="btn btn-outline-primary btn-sm mt-3" type="button" onClick={() => updateEducation(edu)}>
                            Save Education
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                </div>
              </div>
            )}
            {!profileLoading && (
              <div className="profile-section">
                <div className="profile-section-title">Work Experience</div>
                <div className="row g-4">
                <div className="col-12 section-card">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Previous roles and experience</span>
                    <button className="btn btn-outline-primary btn-sm" type="button" onClick={addExperienceRow}>
                      <FaPlus className="me-1" /> Add Experience
                    </button>
                  </div>
                  <div className="row g-3">
                    {experienceForm.map((exp) => (
                      <div className="col-lg-6" key={exp.tempId}>
                        <div className="border rounded p-3">
                          <div className="row g-2">
                            <div className="col-6">
                              <label className="form-label">Company</label>
                              <input
                                className="form-control"
                                value={exp.company || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setExperienceForm((prev) =>
                                    prev.map((item) => (item.tempId === exp.tempId ? { ...item, company: value } : item))
                                  );
                                }}
                              />
                            </div>
                            <div className="col-6">
                              <label className="form-label">Designation</label>
                              <input
                                className="form-control"
                                value={exp.designation || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setExperienceForm((prev) =>
                                    prev.map((item) => (item.tempId === exp.tempId ? { ...item, designation: value } : item))
                                  );
                                }}
                              />
                            </div>
                            <div className="col-6">
                              <label className="form-label">From</label>
                              <input
                                className="form-control"
                                type="date"
                                value={exp.fromDate || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setExperienceForm((prev) =>
                                    prev.map((item) => (item.tempId === exp.tempId ? { ...item, fromDate: value } : item))
                                  );
                                }}
                              />
                            </div>
                            <div className="col-6">
                              <label className="form-label">To</label>
                              <input
                                className="form-control"
                                type="date"
                                value={exp.toDate || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setExperienceForm((prev) =>
                                    prev.map((item) => (item.tempId === exp.tempId ? { ...item, toDate: value } : item))
                                  );
                                }}
                              />
                            </div>
                          </div>
                          <button className="btn btn-outline-primary btn-sm mt-3" type="button" onClick={() => updateExperience(exp)}>
                            Save Experience
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                </div>
              </div>
            )}
            {!profileLoading && (
              <div className="profile-section">
                <div className="profile-section-title">Personal Documents</div>
                <div className="row g-4">
                  <div className="col-12 section-card">
                    {documents.length === 0 ? (
                      <div className="text-muted">No documents uploaded yet.</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>Name</th>
                              <th>Type</th>
                              <th className="text-end">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {documents.map((doc, index) => (
                              <tr key={doc.documentId || doc.id || `doc-${index}`}>
                                <td className="fw-semibold">{doc.documentName || doc.name}</td>
                                <td>{doc.documentType || doc.type || '-'}</td>
                                <td className="text-end">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={async () => {
                                      const res = await axiosInstance.get(
                                        `${API_ENDPOINTS.DOCUMENTS.GET}/${doc.documentId || doc.id}/download`
                                      );
                                      const url = res.data;
                                      if (url) {
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = '';
                                        document.body.appendChild(link);
                                        link.click();
                                        link.remove();
                                      }
                                    }}
                                  >
                                    <FaDownload className="me-1" /> Download
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {!profileLoading && (
              <div className="profile-section">
                <div className="profile-section-title">Personal Identity</div>
                <div className="row g-4">
                <div className="col-12 section-card">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Primary Mobile</label>
                      <input
                        className="form-control"
                        value={identityForm.primaryMobile}
                        onChange={(e) => setIdentityForm((prev) => ({ ...prev, primaryMobile: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Aadhaar</label>
                      <input
                        className="form-control"
                        value={identityForm.aadhaar}
                        onChange={(e) => setIdentityForm((prev) => ({ ...prev, aadhaar: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">PAN</label>
                      <input
                        className="form-control"
                        value={identityForm.pan}
                        onChange={(e) => setIdentityForm((prev) => ({ ...prev, pan: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Driving License</label>
                      <input
                        className="form-control"
                        value={identityForm.drivingLicense}
                        onChange={(e) => setIdentityForm((prev) => ({ ...prev, drivingLicense: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Passport Number</label>
                      <input
                        className="form-control"
                        value={identityForm.passport}
                        onChange={(e) => setIdentityForm((prev) => ({ ...prev, passport: e.target.value }))}
                      />
                    </div>
                  </div>
                  <button className="btn btn-outline-primary btn-sm mt-3" type="button" onClick={handlePlaceholderSave}>
                    Save Identity
                  </button>
                </div>
              </div>
            </div>
            )}
            {!profileLoading && (
              <div className="profile-section">
                <div className="profile-section-title">Visa Details</div>
                <div className="row g-4">
                  <div className="col-12 section-card">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Visa Type</label>
                      <input
                        className="form-control"
                        value={visaForm.visaType}
                        onChange={(e) => setVisaForm((prev) => ({ ...prev, visaType: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Visa Number</label>
                      <input
                        className="form-control"
                        value={visaForm.visaNumber}
                        onChange={(e) => setVisaForm((prev) => ({ ...prev, visaNumber: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Valid From</label>
                      <input
                        className="form-control"
                        type="date"
                        value={visaForm.validFrom}
                        onChange={(e) => setVisaForm((prev) => ({ ...prev, validFrom: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Valid To</label>
                      <input
                        className="form-control"
                        type="date"
                        value={visaForm.validTo}
                        onChange={(e) => setVisaForm((prev) => ({ ...prev, validTo: e.target.value }))}
                      />
                    </div>
                  </div>
                  <button className="btn btn-outline-primary btn-sm mt-3" type="button" onClick={handlePlaceholderSave}>
                    Save Visa Details
                  </button>
                </div>
              </div>
            </div>
            )}
            {!profileLoading && (
              <div className="profile-section">
                <div className="profile-section-title">Dependents</div>
                <div className="row g-4">
                  <div className="col-12 section-card">
                  <div className="row g-3">
                    {dependentForm.map((dep) => (
                      <div className="col-12 border rounded p-3" key={dep.tempId}>
                        <div className="row g-3">
                          {[
                            ['firstName', 'First Name'],
                            ['middleName', 'Middle Name'],
                            ['lastName', 'Last Name'],
                            ['relation', 'Relation'],
                            ['dateOfBirth', 'Date of Birth'],
                            ['nationality', 'Nationality'],
                            ['phone', 'Phone'],
                          ].map(([field, label]) => (
                            <div className="col-md-3" key={field}>
                              <label className="form-label">{label}</label>
                              <input
                                className="form-control"
                                value={dep[field] || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setDependentForm((prev) =>
                                    prev.map((item) => (item.tempId === dep.tempId ? { ...item, [field]: value } : item))
                                  );
                                }}
                              />
                            </div>
                          ))}
                          <div className="col-md-6">
                            <label className="form-label">Address</label>
                            <input
                              className="form-control"
                              value={dep.address || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                setDependentForm((prev) =>
                                  prev.map((item) => (item.tempId === dep.tempId ? { ...item, address: value } : item))
                                );
                              }}
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label">Tax Filing</label>
                            <input
                              className="form-control"
                              value={dep.taxFiling || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                setDependentForm((prev) =>
                                  prev.map((item) => (item.tempId === dep.tempId ? { ...item, taxFiling: value } : item))
                                );
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      type="button"
                      onClick={() =>
                        setDependentForm((prev) => [
                          ...prev,
                          {
                            tempId: `dep-${Date.now()}`,
                            firstName: '',
                            middleName: '',
                            lastName: '',
                            relation: '',
                            dateOfBirth: '',
                            address: '',
                            taxFiling: '',
                            phone: '',
                            nationality: '',
                          },
                        ])
                      }
                    >
                      <FaPlus className="me-1" /> Add Dependent
                    </button>
                    <button className="btn btn-outline-primary btn-sm" type="button" onClick={handlePlaceholderSave}>
                      Save Dependents
                    </button>
                  </div>
                </div>
              </div>
            </div>
            )}
            {!profileLoading && (
              <div className="profile-section">
                <div className="profile-section-title">Disability</div>
                <div className="row g-4">
                  <div className="col-12 section-card">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Disability</label>
                      <input
                        className="form-control"
                        value={disabilityForm.hasDisability}
                        onChange={(e) => setDisabilityForm((prev) => ({ ...prev, hasDisability: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label">Description</label>
                      <input
                        className="form-control"
                        value={disabilityForm.description}
                        onChange={(e) => setDisabilityForm((prev) => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  <button className="btn btn-outline-primary btn-sm mt-3" type="button" onClick={handlePlaceholderSave}>
                    Save Disability
                  </button>
                </div>
              </div>
            </div>
            )}
            {!profileLoading && (
              <div className="profile-section">
                <div className="profile-section-title">Certificates</div>
                <div className="row g-4">
                  <div className="col-12 section-card">
                  <div className="row g-3">
                    {certForm.map((cert) => (
                      <div className="col-lg-6" key={cert.tempId}>
                        <div className="border rounded p-3">
                          <div className="row g-2">
                            <div className="col-6">
                              <label className="form-label">Certificate</label>
                              <input
                                className="form-control"
                                value={cert.name}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setCertForm((prev) =>
                                    prev.map((item) => (item.tempId === cert.tempId ? { ...item, name: value } : item))
                                  );
                                }}
                              />
                            </div>
                            <div className="col-3">
                              <label className="form-label">Issuer</label>
                              <input
                                className="form-control"
                                value={cert.issuer}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setCertForm((prev) =>
                                    prev.map((item) => (item.tempId === cert.tempId ? { ...item, issuer: value } : item))
                                  );
                                }}
                              />
                            </div>
                            <div className="col-3">
                              <label className="form-label">Year</label>
                              <input
                                className="form-control"
                                value={cert.year}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setCertForm((prev) =>
                                    prev.map((item) => (item.tempId === cert.tempId ? { ...item, year: value } : item))
                                  );
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      type="button"
                      onClick={() =>
                        setCertForm((prev) => [
                          ...prev,
                          { tempId: `cert-${Date.now()}`, name: '', issuer: '', year: '' },
                        ])
                      }
                    >
                      <FaPlus className="me-1" /> Add Certificate
                    </button>
                    <button className="btn btn-outline-primary btn-sm" type="button" onClick={handlePlaceholderSave}>
                      Save Certificates
                    </button>
                  </div>
                </div>
              </div>
            </div>
            )}
            {!profileLoading && (
              <div className="profile-section">
                <div className="profile-section-title">Tax & Office History</div>
                <div className="row g-4">
                  <div className="col-12 section-card">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Tax Method</label>
                      <input
                        className="form-control"
                        value={taxForm.method}
                        onChange={(e) => setTaxForm((prev) => ({ ...prev, method: e.target.value }))}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Fixed Tax Rate</label>
                      <input
                        className="form-control"
                        value={taxForm.fixedRate}
                        onChange={(e) => setTaxForm((prev) => ({ ...prev, fixedRate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="row g-3 mt-1">
                    {officeHistoryForm.map((office) => (
                      <div className="col-lg-6" key={office.tempId}>
                        <div className="border rounded p-3">
                          <div className="row g-2">
                            <div className="col-6">
                              <label className="form-label">Location</label>
                              <input
                                className="form-control"
                                value={office.location}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setOfficeHistoryForm((prev) =>
                                    prev.map((item) => (item.tempId === office.tempId ? { ...item, location: value } : item))
                                  );
                                }}
                              />
                            </div>
                            <div className="col-3">
                              <label className="form-label">From</label>
                              <input
                                className="form-control"
                                type="date"
                                value={office.fromDate}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setOfficeHistoryForm((prev) =>
                                    prev.map((item) => (item.tempId === office.tempId ? { ...item, fromDate: value } : item))
                                  );
                                }}
                              />
                            </div>
                            <div className="col-3">
                              <label className="form-label">To</label>
                              <input
                                className="form-control"
                                type="date"
                                value={office.toDate}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setOfficeHistoryForm((prev) =>
                                    prev.map((item) => (item.tempId === office.tempId ? { ...item, toDate: value } : item))
                                  );
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      type="button"
                      onClick={() =>
                        setOfficeHistoryForm((prev) => [
                          ...prev,
                          { tempId: `office-${Date.now()}`, location: '', fromDate: '', toDate: '' },
                        ])
                      }
                    >
                      <FaPlus className="me-1" /> Add Office History
                    </button>
                    <button className="btn btn-outline-primary btn-sm" type="button" onClick={handlePlaceholderSave}>
                      Save Tax & Office
                    </button>
                  </div>
                </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeProfile;

import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout/Layout';
import axiosInstance from '../../utils/axiosConfig';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import './EmployeeTime.css';

const EmployeeTime = () => {
  const { user } = useAuth();
  const employeeId = user?.employeeId;
  const [attendance, setAttendance] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [leaveForm, setLeaveForm] = useState({
    leaveTypeId: '',
    fromDate: '',
    toDate: '',
    totalDays: '',
  });
  const [shifts, setShifts] = useState([]);
  const [message, setMessage] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [activeSection, setActiveSection] = useState('attendance');

  const fetchAttendance = async () => {
    setLoadingAttendance(true);
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.TIME.ATTENDANCE_ME);
      setAttendance(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Attendance error:', error);
      setAttendance([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.TIME.SHIFTS);
      setShifts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setShifts([]);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchShifts();
  }, [employeeId]);

  const handleCheckIn = async () => {
    setAttendanceMessage('');
    try {
      const params = { source: 'WEB' };
      await axiosInstance.post(API_ENDPOINTS.TIME.CHECK_IN_ME, null, { params });
      setAttendanceMessage('Check-in successful.');
      fetchAttendance();
    } catch (error) {
      setAttendanceMessage(error.response?.data?.message || 'Check-in failed.');
    }
  };

  const handleCheckOut = async () => {
    setAttendanceMessage('');
    try {
      const params = { source: 'WEB' };
      await axiosInstance.post(API_ENDPOINTS.TIME.CHECK_OUT_ME, null, { params });
      setAttendanceMessage('Check-out successful.');
      fetchAttendance();
    } catch (error) {
      setAttendanceMessage(error.response?.data?.message || 'Check-out failed.');
    }
  };

  const handleLeaveChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!employeeId) return;
    try {
      await axiosInstance.post(API_ENDPOINTS.TIME.LEAVE_APPLY, {
        employeeId,
        leaveTypeId: Number(leaveForm.leaveTypeId),
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        totalDays: Number(leaveForm.totalDays),
      });
      setMessage('Leave applied successfully.');
      setLeaveForm({ leaveTypeId: '', fromDate: '', toDate: '', totalDays: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Leave apply failed.');
    }
  };

  const todayKey = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find((row) => row.date === todayKey);
  const canCheckIn = !todayRecord || !todayRecord.checkIn;
  const canCheckOut = !!todayRecord && !!todayRecord.checkIn && !todayRecord.checkOut;

  const currentYear = new Date().getFullYear();
  const yearlyHolidays = useMemo(
    () => [
      { date: `${currentYear}-01-01`, name: "New Year's Day" },
      { date: `${currentYear}-01-15`, name: 'Makar Sankranti / Pongal', optional: true },
      { date: `${currentYear}-01-26`, name: 'Republic Day' },
      { date: `${currentYear}-03-04`, name: 'Holi' },
      { date: `${currentYear}-05-01`, name: 'May Day' },
      { date: `${currentYear}-05-28`, name: 'Bakri-ID', optional: true },
      { date: `${currentYear}-09-04`, name: 'Krishna Janmashtami', optional: true },
      { date: `${currentYear}-09-14`, name: 'Ganesh Chaturthi' },
      { date: `${currentYear}-10-02`, name: 'Gandhi Jayanti' },
      { date: `${currentYear}-10-10`, name: 'Vijayadashami / Dussehra' },
      { date: `${currentYear}-11-09`, name: 'Diwali' },
      { date: `${currentYear}-12-25`, name: 'Christmas' },
    ],
    [currentYear]
  );

  const leaveBalances = [
    { id: 1, type: 'Bereavement Leave', available: 3, total: 3, note: 'Total' },
    { id: 2, type: 'Casual Leave', available: 2, total: 12, note: 'Annual allotment' },
    { id: 3, type: 'Earned Leave', available: 1.5, total: null, note: 'Accrued (carry forward)' },
    { id: 4, type: 'Election Leave', available: 1, total: 1, note: 'Per year' },
    { id: 5, type: 'Maternity Leave', available: 18, total: 18, note: 'Weeks' },
    { id: 6, type: 'Unpaid Leave', available: null, total: null, note: 'As per policy' },
  ];

  const selectedLeave = useMemo(() => {
    const id = Number(leaveForm.leaveTypeId);
    return leaveBalances.find((leave) => leave.id === id);
  }, [leaveForm.leaveTypeId, leaveBalances]);

  const holidayByDate = useMemo(() => {
    const map = new Map();
    yearlyHolidays.forEach((h) => {
      if (h.date) map.set(h.date, h);
    });
    return map;
  }, [yearlyHolidays]);

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < startDay; i += 1) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      cells.push(new Date(year, month, d));
    }
    while (cells.length % 7 !== 0) {
      cells.push(null);
    }
    return cells;
  }, [calendarMonth]);

  const goPrevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthLabel = calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const sectionTabs = [
    { key: 'attendance', label: 'Attendance' },
    { key: 'leave', label: 'Leave' },
    { key: 'holidays', label: 'Holidays' },
    { key: 'shifts', label: 'Shifts' },
  ];

  return (
    <Layout>
      <div className="container-fluid time-page">
        <div className="mb-4">
          <h2 className="fw-bold">Time Management</h2>
          <p className="text-muted mb-0">Attendance, leaves, shifts, and holidays</p>
        </div>

        <div className="time-tabs mb-4" role="tablist">
          {sectionTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`time-tab ${activeSection === tab.key ? 'active' : ''}`}
              onClick={() => setActiveSection(tab.key)}
              role="tab"
              aria-selected={activeSection === tab.key}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeSection === 'attendance' && (
          <div className="row g-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm h-100 time-card">
                <div className="card-body">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <div>
                      <h5 className="fw-bold mb-1">Attendance</h5>
                      <div className="text-muted small">Track your daily check-in and check-out</div>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-primary btn-sm" onClick={handleCheckIn} disabled={!canCheckIn}>
                        Check In
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={handleCheckOut} disabled={!canCheckOut}>
                        Check Out
                      </button>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                    <span className="badge text-bg-primary">Web (IP)</span>
                  </div>
                  {attendanceMessage && <div className="alert alert-info py-2">{attendanceMessage}</div>}
                  {loadingAttendance ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status" />
                    </div>
                  ) : attendance.length === 0 ? (
                    <p className="text-muted mb-0">No attendance records yet.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Date</th>
                            <th>Check In</th>
                            <th>Check Out</th>
                            <th>Status</th>
                            <th>Source</th>
                            <th>Location</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendance.map((row, idx) => (
                            <tr key={idx}>
                              <td>{row.date || '-'}</td>
                              <td>{row.checkIn || '-'}</td>
                              <td>{row.checkOut || '-'}</td>
                              <td>{row.status || '-'}</td>
                              <td>{row.source || '-'}</td>
                              <td>
                                {row.latitude && row.longitude
                                  ? `${row.latitude.toFixed(5)}, ${row.longitude.toFixed(5)}`
                                  : row.ipAddress || '-'}
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
          </div>
        )}

        {activeSection === 'leave' && (
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100 time-card">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Leave Balance</h5>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Type</th>
                          <th>Available</th>
                          <th>Total</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaveBalances.map((leave) => (
                          <tr key={leave.type}>
                            <td className="fw-semibold">{leave.type}</td>
                            <td>{leave.available ?? '-'}</td>
                            <td>{leave.total ?? '-'}</td>
                            <td className="text-muted">{leave.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100 time-card">
                <div className="card-body">
                  <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
                    <h5 className="fw-bold mb-0">Apply Leave</h5>
                    {selectedLeave ? (
                      <span className="badge text-bg-light border">
                        {selectedLeave.type}: {selectedLeave.available ?? '-'} available
                      </span>
                    ) : (
                      <span className="badge text-bg-light border">Select a leave type</span>
                    )}
                  </div>
                  {message && <div className="alert alert-info">{message}</div>}
                  <form onSubmit={handleApplyLeave}>
                    <div className="time-subtabs mb-3">
                      {leaveBalances.map((leave) => (
                        <button
                          key={leave.id}
                          type="button"
                          className={`time-subtab ${Number(leaveForm.leaveTypeId) === leave.id ? 'active' : ''}`}
                          onClick={() => setLeaveForm((prev) => ({ ...prev, leaveTypeId: String(leave.id) }))}
                        >
                          <span className="time-subtab-title">{leave.type}</span>
                          <span className="time-subtab-meta">
                            {leave.available ?? '-'} {leave.total ? `/ ${leave.total}` : ''}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Leave Type</label>
                        <input
                          type="text"
                          className="form-control"
                          value={selectedLeave ? selectedLeave.type : ''}
                          readOnly
                          placeholder="Select a leave type above"
                        />
                        <input type="hidden" name="leaveTypeId" value={leaveForm.leaveTypeId} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Total Days</label>
                        <input
                          type="number"
                          name="totalDays"
                          className="form-control"
                          value={leaveForm.totalDays}
                          onChange={handleLeaveChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">From</label>
                        <input
                          type="date"
                          name="fromDate"
                          className="form-control"
                          value={leaveForm.fromDate}
                          onChange={handleLeaveChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">To</label>
                        <input
                          type="date"
                          name="toDate"
                          className="form-control"
                          value={leaveForm.toDate}
                          onChange={handleLeaveChange}
                        />
                      </div>
                      <div className="col-12">
                        <button className="btn btn-primary w-100" type="submit">
                          Submit Leave
                        </button>
                      </div>
                    </div>
                  </form>
                  {selectedLeave && (
                    <div className="mt-3 p-3 border rounded bg-light">
                      <div className="fw-semibold">{selectedLeave.type}</div>
                      <div className="small text-muted">
                        Available: {selectedLeave.available ?? '-'} {selectedLeave.total ? `/ ${selectedLeave.total}` : ''}
                      </div>
                      <div className="small text-muted">Note: {selectedLeave.note}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'holidays' && (
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100 time-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Holiday Calendar</h5>
                    <div className="btn-group btn-group-sm" role="group">
                      <button className="btn btn-outline-secondary" type="button" onClick={goPrevMonth}>
                        Prev
                      </button>
                      <button className="btn btn-outline-secondary" type="button" onClick={goNextMonth}>
                        Next
                      </button>
                    </div>
                  </div>
                  <div className="text-muted small mb-2">{monthLabel}</div>
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm text-center align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <th key={day}>{day}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: calendarDays.length / 7 }).map((_, weekIndex) => (
                          <tr key={`week-${weekIndex}`}>
                            {calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((date, idx) => {
                              if (!date) {
                                return <td key={`empty-${weekIndex}-${idx}`} className="bg-light" />;
                              }
                              const key = date.toISOString().split('T')[0];
                              const holiday = holidayByDate.get(key);
                              const isToday = key === todayKey;
                              return (
                                <td
                                  key={key}
                                  className={`${holiday ? 'table-warning' : ''} ${isToday ? 'table-primary' : ''}`}
                                  title={holiday ? holiday.name : ''}
                                >
                                  <div className="fw-semibold">{date.getDate()}</div>
                                  {holiday && (
                                    <div className="small text-muted">
                                      {holiday.optional ? 'Optional' : 'Holiday'}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100 time-card">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Yearly Holidays ({yearlyHolidays.length})</h5>
                  <div className="table-responsive">
                    <table className="table table-sm align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Occasion</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {yearlyHolidays.map((holiday) => (
                          <tr key={holiday.name}>
                            <td>{holiday.date}</td>
                            <td className="fw-semibold">{holiday.name}</td>
                            <td>{holiday.optional ? 'Optional' : 'Holiday'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'shifts' && (
          <div className="row g-4">
            <div className="col-12">
              <div className="card border-0 shadow-sm time-card">
                <div className="card-body">
                  <h5 className="fw-bold mb-3">Shifts</h5>
                  {shifts.length === 0 ? (
                    <p className="text-muted mb-0">No shifts available.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead className="table-light">
                          <tr>
                            <th>Name</th>
                            <th>Start</th>
                            <th>End</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shifts.map((s) => (
                            <tr key={s.shiftId || s.id}>
                              <td>{s.shiftName || '-'}</td>
                              <td>{s.startTime || '-'}</td>
                              <td>{s.endTime || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EmployeeTime;

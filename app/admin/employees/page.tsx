'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Shield, User, Monitor, Copy, Check, X, Mail } from 'lucide-react';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [inviteUrl, setInviteUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [newEmp, setNewEmp] = useState<any>({
        name: '',
        employeeId: '',
        email: '',
        username: '',
        password: '',
        role: 'employee'
    });

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/employees');
            const data = await res.json();
            if (Array.isArray(data)) setEmployees(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this account?')) return;
        try {
            const res = await fetch(`/api/employees?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchEmployees();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isEditing = !!newEmp._id;
        try {
            const res = await fetch('/api/employees', {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEditing ? { ...newEmp, id: newEmp._id } : newEmp)
            });
            const data = await res.json();

            if (res.ok) {
                if (data.inviteUrl && !isEditing) {
                    setInviteUrl(data.inviteUrl);
                } else {
                    setShowModal(false);
                    setNewEmp({ name: '', employeeId: '', email: '', username: '', password: '', role: 'employee' });
                }
                fetchEmployees();
                if (isEditing) {
                    alert('Employee updated successfully');
                }
            } else {
                alert(data.error || 'Failed to save');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (emp: any) => {
        setNewEmp({ ...emp });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setInviteUrl(null);
        setNewEmp({ name: '', employeeId: '', email: '', username: '', password: '', role: 'employee' });
    };

    const handleResend = async (id: string) => {
        try {
            const res = await fetch('/api/employees/resend-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                alert('Invitation sent to employee');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to resend');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const copyInvite = () => {
        if (inviteUrl) {
            navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="employees-page">
            <header className="page-header">
                <div className="title-area">
                    <h1>Staff & System Access</h1>
                    <p>Manage employees and store kiosk devices</p>
                </div>
                <button className="add-btn" onClick={() => { setNewEmp({ name: '', employeeId: '', email: '', username: '', password: '', role: 'employee' }); setShowModal(true); }}>
                    <Plus size={20} />
                    <span>Create Account</span>
                </button>
            </header>

            <div className="filter-bar glass">
                <div className="search-box">
                    <Search size={20} />
                    <input type="text" placeholder="Search by name, ID or email..." />
                </div>
            </div>

            <div className="table-container glass">
                <table>
                    <thead>
                        <tr>
                            <th>Name / Device</th>
                            <th>ID / PIN</th>
                            <th>Access Identifier</th>
                            <th>Status</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>Loading records...</td></tr>
                        ) : employees.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>No records found. Create your first entry!</td></tr>
                        ) : employees.map((emp) => (
                            <tr key={emp._id}>
                                <td>
                                    <div className="name-cell">
                                        <div className={`avatar ${emp.role === 'kiosk' ? 'kiosk-av' : ''}`}>
                                            {emp.role === 'kiosk' ? <Monitor size={14} /> : emp.name[0]}
                                        </div>
                                        <span>{emp.name}</span>
                                    </div>
                                </td>
                                <td className="mono">{emp.employeeId}</td>
                                <td className="email-cell">{emp.role === 'kiosk' ? `User: ${emp.username}` : emp.email}</td>
                                <td>
                                    <span className={`status-badge ${emp.inviteStatus}`}>
                                        {emp.inviteStatus || 'accepted'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`role-badge ${emp.role}`}>
                                        {emp.role === 'admin' ? <Shield size={14} /> : emp.role === 'kiosk' ? <Monitor size={14} /> : <User size={14} />}
                                        {emp.role}
                                    </span>
                                </td>
                                <td>
                                    <div className="actions">
                                        {emp.inviteStatus === 'pending' && (
                                            <button className="icon-btn resend" title="Resend Invitation Email" onClick={() => handleResend(emp._id)}>
                                                <Mail size={18} />
                                            </button>
                                        )}
                                        <button className="icon-btn edit" onClick={() => handleEdit(emp)}><Edit2 size={18} /></button>
                                        <button className="icon-btn delete" onClick={() => handleDelete(emp._id)}><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        {inviteUrl ? (
                            <div className="invite-success">
                                <div className="success-icon"><Check size={32} /></div>
                                <h2>Account Created!</h2>
                                <p>An invitation email has been sent to the staff member. Staff members must set their own password. You can also manually copy and send this invitation link:</p>

                                <div className="invite-link-box">
                                    <code>{inviteUrl}</code>
                                    <button onClick={copyInvite} className="copy-btn">
                                        {copied ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>

                                <button className="done-btn" onClick={closeModal}>Done</button>
                            </div>
                        ) : (
                            <>
                                <h2>
                                    {newEmp._id ? 'Edit Account' : (newEmp.role === 'kiosk' ? 'Create Kiosk Device' : 'Add New Employee')}
                                </h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label>Display Name / Location</label>
                                        <input
                                            required
                                            type="text"
                                            value={newEmp.name}
                                            onChange={e => setNewEmp({ ...newEmp, name: e.target.value })}
                                            placeholder={newEmp.role === 'kiosk' ? 'e.g. Front Counter Tablet' : 'e.g. John Doe'}
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>{newEmp.role === 'kiosk' ? 'Device ID' : 'Employee PIN'}</label>
                                            <input
                                                required
                                                type="text"
                                                value={newEmp.employeeId}
                                                onChange={e => setNewEmp({ ...newEmp, employeeId: e.target.value })}
                                                placeholder="e.g. 123456"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Role / Access Level</label>
                                            <select value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })}>
                                                <option value="employee">Staff (History Access)</option>
                                                <option value="admin">Store Admin</option>
                                                <option value="kiosk">Kiosk Device (No Email)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {newEmp.role === 'kiosk' ? (
                                        <div className="form-group">
                                            <label>Kiosk Username (For App Login)</label>
                                            <input
                                                required
                                                type="text"
                                                value={newEmp.username}
                                                onChange={e => setNewEmp({ ...newEmp, username: e.target.value })}
                                                placeholder="e.g. store_kiosk_1"
                                            />
                                        </div>
                                    ) : (
                                        <div className="form-group">
                                            <label>Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                value={newEmp.email}
                                                onChange={e => setNewEmp({ ...newEmp, email: e.target.value })}
                                                placeholder="e.g. john@caprinos.co.uk"
                                            />
                                        </div>
                                    )}

                                    {newEmp.role === 'kiosk' && (
                                        <div className="form-group">
                                            <label>Login Password</label>
                                            <input
                                                type="text"
                                                value={newEmp.password}
                                                onChange={e => setNewEmp({ ...newEmp, password: e.target.value })}
                                                placeholder="Required for kiosk"
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className="modal-actions">
                                        <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                                        <button type="submit" className="submit-btn">
                                            {newEmp._id ? 'Update Account' : 'Save & Generate Invite'}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
        .employees-page { padding: 1rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
        .page-header h1 { font-size: 2rem; margin-bottom: 0.25rem; font-weight: 800; color: var(--foreground); }
        .page-header p { color: var(--text-muted); }

        .add-btn { 
          background: var(--primary); color: white; padding: 0.75rem 1.5rem; 
          display: flex; align-items: center; gap: 0.5rem; font-weight: 700;
          border-radius: 1rem; box-shadow: 0 4px 12px rgba(212, 18, 23, 0.15);
        }
        .add-btn:hover { background: var(--primary-hover); transform: translateY(-2px); }

        .filter-bar { padding: 1rem; border-radius: 1.25rem; margin-bottom: 1.5rem; }
        .search-box { display: flex; align-items: center; gap: 1rem; color: var(--text-muted); padding: 0 0.5rem; }
        .search-box input { 
          background: none; border: none; color: var(--foreground); width: 100%; outline: none; font-size: 1rem;
        }

        .table-container { border-radius: 1.5rem; overflow: hidden; background: white; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 1.25rem 1.5rem; color: var(--text-muted); font-weight: 700; font-size: 0.8rem; text-transform: uppercase; border-bottom: 1px solid var(--border); }
        td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); font-size: 0.95rem; }
        
        .name-cell { display: flex; align-items: center; gap: 1rem; font-weight: 600; }
        .avatar { 
          width: 36px; height: 36px; border-radius: 12px; background: rgba(253, 184, 19, 0.15); 
          color: #b48608; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem;
        }
        .avatar.kiosk-av { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .mono { font-family: 'JetBrains Mono', monospace; color: var(--primary); font-weight: 700; }
        .email-cell { color: var(--text-muted); font-size: 0.9rem; }

        .status-badge { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; padding: 0.2rem 0.6rem; border-radius: 8px; }
        .status-badge.pending { background: #fee2e2; color: #ef4444; }
        .status-badge.accepted { background: #dcfce7; color: #16a34a; }

        .role-badge { 
          display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.85rem; 
          border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: capitalize;
        }
        .role-badge.employee { background: #f1f5f9; color: #475569; }
        .role-badge.admin { background: #fef2f2; color: #d41217; }
        .role-badge.kiosk { background: #eff6ff; color: #1d4ed8; }

        .actions { display: flex; gap: 0.5rem; }
        .icon-btn { 
          width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; 
          border-radius: 10px; background: #f8fafc; color: var(--text-muted); border: 1px solid var(--border);
        }
        .icon-btn:hover { color: var(--foreground); background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .icon-btn.resend:hover { border-color: #dcfce7; color: #16a34a; }
        .icon-btn.delete:hover { border-color: #fecaca; color: #ef4444; }

        .modal-overlay { 
          position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); display: flex; 
          align-items: center; justify-content: center; padding: 2rem; z-index: 1000;
        }
        .modal-content { width: 100%; max-width: 650px; padding: 3rem; border-radius: 2.5rem; background: white; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); }
        .modal-content h2 { margin-bottom: 2.25rem; font-weight: 800; font-size: 1.75rem; letter-spacing: -0.5px; }
        .form-group { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.75rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.75rem; }
        label { font-size: 0.85rem; color: var(--text-muted); font-weight: 700; margin-left: 0.25rem; }
        input, select { 
          background: #f8fafc; border: 1px solid var(--border); 
          padding: 1rem; border-radius: 1rem; color: var(--foreground); outline: none; font-family: inherit; font-size: 1rem;
        }
        input:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 4px rgba(212, 18, 23, 0.05); }

        .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem; }
        .cancel-btn { background: #f1f5f9; color: #64748b; padding: 0.75rem 1.5rem; border-radius: 1rem; font-weight: 600; }
        .submit-btn { background: var(--primary); color: white; padding: 0.75rem 2rem; border-radius: 1rem; font-weight: 700; }

        .invite-success { text-align: center; }
        .success-icon { width: 64px; height: 64px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
        .invite-link-box { background: #f1f5f9; padding: 1rem; border-radius: 1rem; display: flex; align-items: center; gap: 1rem; margin: 1.5rem 0; }
        .invite-link-box code { 
          flex: 1; 
          overflow: hidden; 
          text-overflow: ellipsis; 
          white-space: nowrap;
          font-size: 0.85rem; 
          color: #1e293b; 
        }
        .copy-btn { padding: 0.5rem; background: white; border-radius: 0.5rem; color: var(--text-muted); border: 1px solid var(--border); }
        .done-btn { width: 100%; background: #0f172a; color: white; padding: 1rem; border-radius: 1rem; font-weight: 700; }

        @media (max-width: 768px) {
          .page-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
          .add-btn { width: 100%; justify-content: center; }
          .table-container { 
            overflow-x: auto; 
            margin: 0 -1rem; 
            border-radius: 0; 
          }
          th, td { padding: 1rem; white-space: nowrap; }
          .modal-content { padding: 2rem 1.25rem; border-radius: 2rem; }
          .form-row { grid-template-columns: 1fr; gap: 0; }
        }
      `}</style>
        </div>
    );
}

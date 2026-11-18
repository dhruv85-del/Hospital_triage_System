import React, { useState, useEffect } from 'react';
import { mockStore } from '../../services/mockStore';
import { PageContainer } from '../../components/layout/PageContainer';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Stethoscope, Plus, Search, CheckCircle2, UserCheck, ToggleLeft, ToggleRight } from 'lucide-react';

export function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New Doctor Form state
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [room, setRoom] = useState('');
  const [fee, setFee] = useState(600);
  const [experienceYears, setExperienceYears] = useState(10);
  const [qualification, setQualification] = useState('MD, DM');

  useEffect(() => {
    setDoctors(mockStore.getDoctors());
    const depts = mockStore.getDepartments();
    setDepartments(depts);
    if (depts.length > 0) setDepartmentId(depts[0].id);
  }, []);

  const filtered = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStatus = (doctorId) => {
    const doc = mockStore.getDoctorById(doctorId);
    if (doc) {
      doc.status = doc.status === 'ACTIVE' ? 'ON_BREAK' : 'ACTIVE';
      mockStore.save();
      setDoctors([...mockStore.getDoctors()]);
    }
  };

  const handleAddDoctor = (e) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === departmentId);
    const newDoc = {
      id: `doc_${Date.now()}`,
      userId: `user_doc_${Date.now()}`,
      name,
      title: title || 'Consultant Physician',
      departmentId,
      departmentName: dept ? dept.name : 'General Care',
      hospitalId: 'hosp_1',
      room: room || 'Room 105',
      qualification,
      experienceYears: parseInt(experienceYears, 10) || 8,
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=256',
      avgConsultTimeMin: 15,
      fee: parseInt(fee, 10) || 600,
      rating: 4.9,
      reviewsCount: 1,
      status: 'ACTIVE',
      schedule: {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        hours: '09:00 AM – 04:00 PM',
        slotDuration: 15,
      },
      bio: 'Board-certified medical specialist dedicated to patient outcomes.',
    };

    mockStore.data.doctors.push(newDoc);
    mockStore.save();
    setDoctors([...mockStore.getDoctors()]);
    setModalOpen(false);
    setName('');
  };

  return (
    <PageContainer
      eyebrow="Staff Directory"
      title="Physician & Doctor Management"
      subtitle="Manage medical specialist profiles, department assignments, and live duty availability."
      actions={
        <Button variant="primary" size="md" icon={Plus} onClick={() => setModalOpen(true)} trailingIcon>
          Add Physician
        </Button>
      }
    >
      <div className="space-y-6">
        <Input
          placeholder="Filter doctors by name, specialty, or room..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={Search}
          className="max-w-md"
        />

        <div className="space-y-3">
          {filtered.map((doc) => (
            <div key={doc.id} className="double-bezel-outer">
              <div className="double-bezel-inner bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={doc.avatar}
                    alt={doc.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-border shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-ink">{doc.name}</h4>
                      <span className="text-xs text-ink-muted">({doc.qualification})</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          doc.status === 'ACTIVE'
                            ? 'bg-success-light text-success-800'
                            : 'bg-amber-light text-amber-800'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                    <p className="text-xs text-primary font-medium mt-0.5">
                      {doc.departmentName} • Room: {doc.room}
                    </p>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      Fee: ₹{doc.fee} • Slot: ~{doc.avgConsultTimeMin} mins • {doc.experienceYears} yrs exp
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={() => toggleStatus(doc.id)}
                    className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-canvas-subtle transition-colors text-ink"
                  >
                    Toggle Duty: {doc.status === 'ACTIVE' ? 'Set Break' : 'Set Active'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Doctor Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Clinical Physician"
        subtitle="Register doctor profile and assign department room."
      >
        <form onSubmit={handleAddDoctor} className="space-y-4">
          <Input
            label="Doctor Full Name"
            placeholder="Dr. Arvind Patel"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5 font-sans">
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full bg-canvas-pure border border-border rounded-xl py-2.5 px-3.5 text-sm text-ink focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Consultation Room"
              placeholder="Room 210 (Wing B)"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Consultation Fee (₹)"
              type="number"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              required
            />
            <Input
              label="Qualifications"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              required
            />
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full mt-2" trailingIcon>
            Save & Add to Directory
          </Button>
        </form>
      </Modal>
    </PageContainer>
  );
}

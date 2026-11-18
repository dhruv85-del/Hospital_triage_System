import React, { useState, useEffect } from 'react';
import { mockStore } from '../../services/mockStore';
import { PageContainer } from '../../components/layout/PageContainer';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Building, Plus, Search, Clock, Users } from 'lucide-react';

export function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [floor, setFloor] = useState('');
  const [avgWait, setAvgWait] = useState(15);
  const [description, setDescription] = useState('');

  useEffect(() => {
    setDepartments(mockStore.getDepartments());
  }, []);

  const handleAddDept = (e) => {
    e.preventDefault();
    const newDept = {
      id: `dept_${Date.now()}`,
      hospitalId: 'hosp_1',
      name,
      code: code.toUpperCase() || 'SPEC',
      floor: floor || '1st Floor',
      icon: 'Stethoscope',
      headDoctor: 'Chief Specialist',
      avgWaitTimeMin: parseInt(avgWait, 10) || 15,
      activeQueues: 1,
      description: description || 'Specialty outpatient clinical care unit.',
    };

    mockStore.data.departments.push(newDept);
    mockStore.save();
    setDepartments([...mockStore.getDepartments()]);
    setModalOpen(false);
    setName('');
  };

  return (
    <PageContainer
      eyebrow="Clinical Infrastructure"
      title="Department & OPD Unit Directory"
      subtitle="Configure hospital wings, room wings, and target wait time baselines."
      actions={
        <Button variant="primary" size="md" icon={Plus} onClick={() => setModalOpen(true)} trailingIcon>
          Add Department
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="double-bezel-outer">
            <div className="double-bezel-inner bg-surface p-5 space-y-3 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-xl bg-primary-light text-primary">
                    {dept.code}
                  </span>
                  <span className="text-xs text-ink-muted font-mono">{dept.floor}</span>
                </div>
                <h3 className="text-base font-display font-semibold text-ink">{dept.name}</h3>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed line-clamp-2">
                  {dept.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-ink-muted">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>Target: ~{dept.avgWaitTimeMin}m</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  <span>{dept.activeQueues} Active Suites</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Clinical Department"
        subtitle="Provision a new specialty care center and queue track."
      >
        <form onSubmit={handleAddDept} className="space-y-4">
          <Input
            label="Department Name"
            placeholder="E.g. Endocrinology & Metabolism"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Dept Code"
              placeholder="ENDO"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Input
              label="Location / Floor"
              placeholder="2nd Floor, Wing E"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              required
            />
          </div>

          <Input
            label="Avg Target Wait (Mins)"
            type="number"
            value={avgWait}
            onChange={(e) => setAvgWait(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" size="md" className="w-full mt-2" trailingIcon>
            Save Department
          </Button>
        </form>
      </Modal>
    </PageContainer>
  );
}

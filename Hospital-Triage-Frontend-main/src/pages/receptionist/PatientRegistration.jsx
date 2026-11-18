import React, { useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { mockStore } from '../../services/mockStore';
import { UserPlus, Search, AlertCircle, CheckCircle } from 'lucide-react';

export function PatientRegistration() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [registeredPatient, setRegisteredPatient] = useState(null);

  const checkDuplicates = (phoneNumber) => {
    setPhone(phoneNumber);
    if (phoneNumber.length >= 7) {
      const match = mockStore.getPatientByPhoneOrMrn(phoneNumber);
      if (match) {
        setDuplicateWarning(match);
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const newPat = {
      id: `pat_${Date.now()}`,
      userId: `user_pat_${Date.now()}`,
      mrn: `MRN-${Math.floor(100000 + Math.random() * 900000)}`,
      name,
      phone,
      age: parseInt(age, 10) || 30,
      gender,
      bloodGroup,
      registeredDate: new Date().toISOString().split('T')[0],
    };

    mockStore.addPatient(newPat);
    setRegisteredPatient(newPat);
  };

  return (
    <PageContainer
      eyebrow="Triage Intake Desk"
      title="Register Walk-In Patient"
      subtitle="Create new permanent electronic health records with automatic duplicate prevention check."
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {registeredPatient ? (
          <div className="double-bezel-outer">
            <div className="double-bezel-inner bg-surface text-center p-8 space-y-4">
              <CheckCircle className="w-12 h-12 text-success mx-auto" />
              <h3 className="text-xl font-display font-bold text-ink">
                Patient Registered Successfully
              </h3>
              <p className="text-xs text-ink-muted">
                Official MRN has been provisioned for {registeredPatient.name}.
              </p>

              <div className="p-4 rounded-2xl bg-canvas-subtle border border-border inline-block text-left font-mono text-xs space-y-1">
                <div>
                  <span className="text-ink-muted">Assigned MRN:</span>{' '}
                  <span className="font-bold text-ink">{registeredPatient.mrn}</span>
                </div>
                <div>
                  <span className="text-ink-muted">Phone:</span>{' '}
                  <span className="font-bold text-ink">{registeredPatient.phone}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setRegisteredPatient(null);
                    setName('');
                    setPhone('');
                    setAge('');
                  }}
                >
                  Register Another Patient
                </Button>
                <a href="/receptionist/walk-in">
                  <Button variant="secondary" size="md">
                    Issue Consultation Token
                  </Button>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="double-bezel-outer">
            <div className="double-bezel-inner bg-surface space-y-6">
              {duplicateWarning && (
                <div className="p-4 rounded-2xl bg-amber-light border border-amber-border flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <h5 className="font-bold text-amber-900">Existing Patient Record Found!</h5>
                    <p className="text-amber-800 mt-0.5">
                      A patient with this phone ({duplicateWarning.name}, MRN: {duplicateWarning.mrn}) already exists in the registry.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="E.g. Ramesh Joshi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number (Auto Duplicate Check)"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => checkDuplicates(e.target.value)}
                    required
                  />
                  <Input
                    label="Age"
                    type="number"
                    placeholder="42"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5 font-sans">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-canvas-pure border border-border rounded-xl py-2.5 px-3.5 text-sm text-ink focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink-muted uppercase tracking-wider mb-1.5 font-sans">
                      Blood Group
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full bg-canvas-pure border border-border rounded-xl py-2.5 px-3.5 text-sm text-ink focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none"
                    >
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={UserPlus}
                  className="w-full mt-2"
                  trailingIcon
                >
                  Create Medical Record (MRN)
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PageContainer } from '../../components/layout/PageContainer';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { User, ShieldCheck, Heart, Phone, Mail, Save } from 'lucide-react';

export function PatientProfile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'Neha Sharma');
  const [phone, setPhone] = useState(user?.phone || '+91 98201 23456');
  const [email, setEmail] = useState(user?.email || 'neha.sharma@example.com');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('Penicillin, Sulfa drugs');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <PageContainer
      eyebrow="Electronic Health Record"
      title="Medical Profile & Identity"
      subtitle="Manage your personal demographic details and emergency clinical contacts."
    >
      <div className="max-w-2xl mx-auto double-bezel-outer">
        <div className="double-bezel-inner bg-surface space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-border/70">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128'}
              alt={name}
              className="w-16 h-16 rounded-2xl object-cover border border-border shadow-bezel-sm"
            />
            <div>
              <h3 className="text-lg font-display font-bold text-ink">{name}</h3>
              <p className="text-xs font-mono text-primary font-semibold">
                Medical Record: {user?.mrn || 'MRN-849201'}
              </p>
            </div>
          </div>

          {saved && (
            <div className="p-3.5 rounded-2xl bg-success-light border border-success-border text-xs text-success-800 font-semibold">
              Medical profile saved successfully!
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Full Legal Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Blood Group"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              />
              <Input
                label="Known Drug Allergies"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="md" icon={Save} trailingIcon>
                Save Profile Updates
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}

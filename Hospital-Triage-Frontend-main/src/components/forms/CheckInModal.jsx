import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useQueue } from '../../context/QueueContext';
import { mockStore } from '../../services/mockStore';
import { Search, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

export function CheckInModal({ isOpen, onClose, onSuccess }) {
  const { checkIn } = useQueue();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    const today = new Date().toISOString().split('T')[0];
    const allApts = mockStore.getAppointments(null, today);

    const matches = allApts.filter(
      (a) =>
        a.tokenNumber.toLowerCase().includes(query) ||
        a.patientName.toLowerCase().includes(query) ||
        (a.patientPhone && a.patientPhone.replace(/\D/g, '').includes(query.replace(/\D/g, '')))
    );

    setSearchResults(matches);
    setHasSearched(true);
  };

  const handleCheckIn = async (appointmentId) => {
    setLoading(true);
    try {
      const res = await checkIn(appointmentId, { role: 'RECEPTIONIST', name: 'Front Desk' });
      // Update local result list
      setSearchResults((prev) =>
        prev.map((item) => (item.id === appointmentId ? { ...item, status: 'CHECKED_IN' } : item))
      );
      if (onSuccess) onSuccess(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rapid Patient Check-In"
      subtitle="Search by Token Number (e.g. T-103), Patient Name, or Phone Number"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <Input
          placeholder="Search Token (T-104), Name, or Phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={Search}
          className="flex-1"
          autoFocus
        />
        <Button type="submit" variant="primary" size="md" icon={Search}>
          Find
        </Button>
      </form>

      {/* Results List */}
      <div className="space-y-3">
        {searchResults.map((apt) => {
          const doctor = mockStore.getDoctorById(apt.doctorId);
          const isEligible = apt.status === 'WAITING';

          return (
            <div
              key={apt.id}
              className="p-4 rounded-2xl bg-canvas-subtle border border-border flex items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-ink">{apt.tokenNumber}</span>
                  <span className="text-xs font-semibold text-ink">{apt.patientName}</span>
                  <Badge status={apt.status} size="sm" />
                </div>
                <p className="text-xs text-ink-muted mt-1">
                  Dr: <span className="text-ink font-medium">{doctor?.name}</span> ({doctor?.room}) •{' '}
                  <span className="font-mono">{apt.scheduledTime}</span>
                </p>
              </div>

              {isEligible ? (
                <Button
                  size="sm"
                  variant="primary"
                  icon={UserCheck}
                  loading={loading}
                  onClick={() => handleCheckIn(apt.id)}
                >
                  Check In
                </Button>
              ) : (
                <span className="text-xs font-medium text-ink-muted font-mono flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-success" />
                  <span>{apt.status}</span>
                </span>
              )}
            </div>
          );
        })}

        {hasSearched && searchResults.length === 0 && (
          <div className="text-center py-8 text-xs text-ink-muted bg-canvas-pure rounded-2xl border border-dashed border-border">
            No matching appointments found for today with query "{searchQuery}".
          </div>
        )}
      </div>
    </Modal>
  );
}

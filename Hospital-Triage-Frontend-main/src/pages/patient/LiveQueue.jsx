import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockStore } from '../../services/mockStore';
import { realtime } from '../../services/realtime';
import { useQueue } from '../../context/QueueContext';
import { PageContainer } from '../../components/layout/PageContainer';
import { LiveQueueTracker } from '../../components/queue/LiveQueueTracker';
import { TokenStub } from '../../components/queue/TokenStub';
import { estimateWait } from '../../services/queueEngine';
import { playCallChime } from '../../utils/sound';
import { Button } from '../../components/common/Button';
import { QrCode, ArrowLeft, RotateCw } from 'lucide-react';

export function LiveQueue() {
  const { appointmentId } = useParams();
  const { queuesVersion } = useQueue();
  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [waitEstimate, setWaitEstimate] = useState({ aheadCount: 0 });

  const loadData = () => {
    const apt = mockStore.getAppointmentById(appointmentId);
    if (apt) {
      setAppointment(apt);
      const doc = mockStore.getDoctorById(apt.doctorId);
      setDoctor(doc || null);
      const est = estimateWait(apt.doctorId, apt.tokenNumber, apt.date);
      setWaitEstimate(est);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to realtime queue events for this doctor
    const apt = mockStore.getAppointmentById(appointmentId);
    if (apt) {
      const unsub = realtime.subscribe(`queue:${apt.doctorId}`, (event) => {
        loadData();
        if (event.appointment && event.appointment.id === appointmentId && event.appointment.status === 'CALLED') {
          playCallChime();
        }
      });
      return () => unsub();
    }
  }, [appointmentId, queuesVersion]);

  if (!appointment) {
    return (
      <PageContainer title="Queue Record Not Found">
        <Link to="/patient/dashboard">
          <Button variant="secondary">Return to Dashboard</Button>
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      eyebrow="Realtime Queue Monitor"
      title={`Token ${appointment.tokenNumber} • Live Status`}
      subtitle={`Physician: ${doctor?.name || 'Dr. Specialist'} • ${doctor?.room || 'Clinical Room'}`}
      actions={
        <Link to={`/patient/qr/${appointment.id}`}>
          <Button variant="secondary" size="md" icon={QrCode}>
            Privacy QR Code
          </Button>
        </Link>
      }
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <LiveQueueTracker
          appointment={appointment}
          doctor={doctor}
          patientsAhead={waitEstimate.aheadCount}
        />

        {/* Token Details Card */}
        <TokenStub
          appointment={appointment}
          doctor={doctor}
          variant="full"
          patientsAhead={waitEstimate.aheadCount}
        />
      </div>
    </PageContainer>
  );
}

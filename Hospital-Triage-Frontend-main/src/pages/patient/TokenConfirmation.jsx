import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockStore } from '../../services/mockStore';
import { PageContainer } from '../../components/layout/PageContainer';
import { TokenStub } from '../../components/queue/TokenStub';
import { Button } from '../../components/common/Button';
import { QrCode, ArrowRight, Printer, Activity } from 'lucide-react';
import { estimateWait } from '../../services/queueEngine';

export function TokenConfirmation() {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [waitEstimate, setWaitEstimate] = useState({ aheadCount: 0 });

  useEffect(() => {
    const apt = mockStore.getAppointmentById(appointmentId);
    if (apt) {
      setAppointment(apt);
      const doc = mockStore.getDoctorById(apt.doctorId);
      setDoctor(doc || null);
      const est = estimateWait(apt.doctorId, apt.tokenNumber, apt.date);
      setWaitEstimate(est);
    }
  }, [appointmentId]);

  if (!appointment) {
    return (
      <PageContainer title="Token Not Found">
        <Link to="/patient/dashboard">
          <Button variant="secondary">Go to Dashboard</Button>
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      eyebrow="Booking Confirmed"
      title="Your Token is Registered"
      subtitle="Present this digital ticket at the hospital reception or proceed directly to the waiting suite."
    >
      <div className="max-w-xl mx-auto space-y-6">
        <TokenStub
          appointment={appointment}
          doctor={doctor}
          variant="full"
          patientsAhead={waitEstimate.aheadCount}
        />

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link to={`/patient/queue/${appointment.id}`} className="w-full sm:w-auto">
            <Button variant="primary" size="lg" icon={Activity} className="w-full" trailingIcon>
              Monitor Live Queue
            </Button>
          </Link>

          <Link to={`/patient/qr/${appointment.id}`} className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" icon={QrCode} className="w-full">
              View Privacy QR Code
            </Button>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}

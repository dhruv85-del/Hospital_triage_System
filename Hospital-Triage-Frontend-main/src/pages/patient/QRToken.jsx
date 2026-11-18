import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockStore } from '../../services/mockStore';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { generateQrPayload } from '../../utils/qrPayload';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Activity, ArrowLeft, Printer } from 'lucide-react';

export function QRToken() {
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const apt = mockStore.getAppointmentById(appointmentId);
    if (apt) {
      setAppointment(apt);
      const doc = mockStore.getDoctorById(apt.doctorId);
      setDoctor(doc || null);
    }
  }, [appointmentId]);

  if (!appointment) {
    return (
      <PageContainer title="QR Pass Not Found">
        <Link to="/patient/dashboard">
          <Button variant="secondary">Go to Dashboard</Button>
        </Link>
      </PageContainer>
    );
  }

  const qrString = generateQrPayload({
    tokenNumber: appointment.tokenNumber,
    doctorId: appointment.doctorId,
    appointmentId: appointment.id,
    timestamp: appointment.createdAt,
  });

  return (
    <PageContainer
      eyebrow="Zero-PII Privacy Pass"
      title="Scannable Digital Token QR"
      subtitle="Hold this QR code against the automated optical check-in scanner at the clinic entrance."
    >
      <div className="max-w-md mx-auto double-bezel-outer">
        <div className="double-bezel-inner bg-surface text-center p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <span className="text-[11px] font-mono uppercase tracking-widest text-ink-muted">
              Optical Pass
            </span>
            <Badge status={appointment.status} size="sm" />
          </div>

          {/* Token String */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-ink-muted">
              Official Token
            </p>
            <div className="font-mono text-5xl font-bold text-ink mt-1">
              {appointment.tokenNumber}
            </div>
            <p className="text-xs text-ink-muted mt-1">
              {doctor?.name} • {doctor?.room}
            </p>
          </div>

          {/* High-Contrast QR Code */}
          <div className="p-5 rounded-3xl bg-white border-2 border-border/80 inline-block shadow-bezel-sm">
            <QRCodeSVG
              value={qrString}
              size={200}
              level="H"
              includeMargin={false}
              fgColor="#16221E"
              bgColor="#FFFFFF"
            />
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-2xl bg-canvas-subtle border border-border flex items-center justify-center gap-2 text-xs text-ink-muted">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span className="text-[11px]">
              Privacy Verified: Zero PII encoded. Only token ID & clinic routing.
            </span>
          </div>

          {/* Action Links */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <Link to={`/patient/queue/${appointment.id}`} className="flex-1">
              <Button variant="primary" size="md" icon={Activity} className="w-full">
                Live Queue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

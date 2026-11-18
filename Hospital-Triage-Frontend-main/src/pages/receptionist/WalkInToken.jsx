import React, { useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { WalkInForm } from '../../components/forms/WalkInForm';
import { TokenStub } from '../../components/queue/TokenStub';
import { mockStore } from '../../services/mockStore';
import { Button } from '../../components/common/Button';
import { Printer, CheckCircle2, RotateCcw } from 'lucide-react';

export function WalkInToken() {
  const [issuedAppointment, setIssuedAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);

  const handleSuccess = (apt) => {
    setIssuedAppointment(apt);
    const doc = mockStore.getDoctorById(apt.doctorId);
    setDoctor(doc || null);
  };

  return (
    <PageContainer
      eyebrow="Express Token Dispenser"
      title="Issue Walk-In Consultation Token"
      subtitle="Instantly assign sequential queue numbers for unscheduled walk-in clinic patients."
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {issuedAppointment ? (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-success-light border border-success-border text-center text-xs text-success-800 font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span>Token {issuedAppointment.tokenNumber} successfully dispensed!</span>
            </div>

            <TokenStub appointment={issuedAppointment} doctor={doctor} variant="full" />

            <div className="flex justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Slip
              </Button>

              <Button
                variant="secondary"
                size="md"
                icon={RotateCcw}
                onClick={() => setIssuedAppointment(null)}
              >
                Issue Another Token
              </Button>
            </div>
          </div>
        ) : (
          <div className="double-bezel-outer">
            <div className="double-bezel-inner bg-surface p-6 sm:p-8">
              <WalkInForm onSuccess={handleSuccess} />
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

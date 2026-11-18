import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { BookingForm } from '../../components/forms/BookingForm';

export function BookToken() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const handleBookingSuccess = (appointment) => {
    navigate(`/patient/confirmation/${appointment.id}`);
  };

  return (
    <PageContainer
      eyebrow="Direct Reservation"
      title="Book a Consultation Token"
      subtitle="Select your preferred medical specialist, consultation time, and chief complaint."
    >
      <div className="max-w-2xl mx-auto double-bezel-outer">
        <div className="double-bezel-inner bg-surface p-6 sm:p-8">
          <BookingForm initialDoctorId={doctorId} onSuccess={handleBookingSuccess} />
        </div>
      </div>
    </PageContainer>
  );
}

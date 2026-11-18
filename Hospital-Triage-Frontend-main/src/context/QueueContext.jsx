import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as queueApi from '../services/api/queueApi';
import * as appointmentApi from '../services/api/appointmentApi';
import { mockStore } from '../services/mockStore';
import { realtime } from '../services/realtime';
import { useNotifications } from './NotificationContext';
import { playCallChime, playSuccessChime } from '../utils/sound';

const QueueContext = createContext(null);

export function QueueProvider({ children }) {
  const [queuesVersion, setQueuesVersion] = useState(0);
  const [loading, setLoading] = useState(false);
  const { addToast } = useNotifications();

  // Listen to realtime updates and bump queue version to trigger reactive re-renders
  useEffect(() => {
    const unsub = realtime.subscribe('global', () => {
      setQueuesVersion((v) => v + 1);
    });
    return () => unsub();
  }, []);

  const triggerUpdate = useCallback(() => {
    setQueuesVersion((v) => v + 1);
  }, []);

  const callNext = async (doctorId, actor) => {
    setLoading(true);
    try {
      const res = await queueApi.callNextPatient(doctorId, actor);
      if (res.success) {
        playCallChime();
        addToast({
          title: `Called Token ${res.appointment.tokenNumber}`,
          message: `${res.appointment.patientName} has been called into the room.`,
          type: 'success',
        });
        triggerUpdate();
      } else {
        addToast({
          title: 'Queue Notice',
          message: res.message || 'No patients waiting in queue.',
          type: 'info',
        });
      }
      return res;
    } catch (err) {
      addToast({
        title: 'Call Error',
        message: err.message,
        type: 'error',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const skipPatient = async (appointmentId, actor) => {
    try {
      const res = await queueApi.skipPatient(appointmentId, actor);
      addToast({
        title: `Token ${res.tokenNumber} Skipped`,
        message: 'Patient moved to skipped list and can be recalled later.',
        type: 'warning',
      });
      triggerUpdate();
      return res;
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
      throw err;
    }
  };

  const recallPatient = async (appointmentId, actor) => {
    try {
      const res = await queueApi.recallPatient(appointmentId, actor);
      playCallChime();
      addToast({
        title: `Token ${res.tokenNumber} Recalled`,
        message: 'Patient recalled to active consultation.',
        type: 'success',
      });
      triggerUpdate();
      return res;
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
      throw err;
    }
  };

  const checkIn = async (appointmentId, actor) => {
    try {
      const res = await queueApi.checkInPatient(appointmentId, actor);
      playSuccessChime();
      addToast({
        title: `Token ${res.tokenNumber} Checked In`,
        message: `${res.patientName} is now marked present in waiting area.`,
        type: 'success',
      });
      triggerUpdate();
      return res;
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
      throw err;
    }
  };

  const startConsultation = async (appointmentId, actor) => {
    try {
      const res = await appointmentApi.startConsultation(appointmentId, actor);
      addToast({
        title: 'Consultation Started',
        message: `Session timer active for Token ${res.tokenNumber}.`,
        type: 'info',
      });
      triggerUpdate();
      return res;
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
      throw err;
    }
  };

  const completeConsultation = async (appointmentId, notes, actor) => {
    try {
      const res = await appointmentApi.completeConsultation(appointmentId, notes, actor);
      playSuccessChime();
      addToast({
        title: 'Consultation Completed',
        message: `Token ${res.tokenNumber} marked completed successfully.`,
        type: 'success',
      });
      triggerUpdate();
      return res;
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
      throw err;
    }
  };

  const bookToken = async (bookingData) => {
    try {
      const res = await appointmentApi.bookToken(bookingData);
      playSuccessChime();
      addToast({
        title: 'Token Confirmed!',
        message: `Token ${res.appointment.tokenNumber} booked successfully.`,
        type: 'success',
      });
      triggerUpdate();
      return res;
    } catch (err) {
      addToast({ title: 'Booking Error', message: err.message, type: 'error' });
      throw err;
    }
  };

  const bookWalkIn = async (walkInData) => {
    try {
      const res = await appointmentApi.bookWalkIn(walkInData);
      playSuccessChime();
      addToast({
        title: 'Walk-In Token Generated',
        message: `Token ${res.appointment.tokenNumber} dispensed and checked in.`,
        type: 'success',
      });
      triggerUpdate();
      return res;
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
      throw err;
    }
  };

  const cancelAppointment = async (appointmentId, actor) => {
    try {
      const res = await appointmentApi.cancelAppointment(appointmentId, actor);
      addToast({
        title: 'Appointment Cancelled',
        message: `Token ${res.tokenNumber} has been cancelled.`,
        type: 'info',
      });
      triggerUpdate();
      return res;
    } catch (err) {
      addToast({ title: 'Error', message: err.message, type: 'error' });
      throw err;
    }
  };

  const resetDemoData = () => {
    mockStore.resetToDefault();
    triggerUpdate();
    addToast({
      title: 'Demo Data Reset',
      message: 'All queues, tokens, and records restored to default seed state.',
      type: 'info',
    });
  };

  const value = {
    queuesVersion,
    loading,
    callNext,
    skipPatient,
    recallPatient,
    checkIn,
    startConsultation,
    completeConsultation,
    bookToken,
    bookWalkIn,
    cancelAppointment,
    resetDemoData,
    triggerUpdate,
  };

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}

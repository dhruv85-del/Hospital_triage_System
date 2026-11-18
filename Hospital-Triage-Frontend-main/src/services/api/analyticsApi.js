import { mockStore } from '../mockStore';

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getHospitalAnalytics() {
  await delay(250);
  const appointments = mockStore.data.appointments;
  const doctors = mockStore.data.doctors;
  const departments = mockStore.data.departments;
  const events = mockStore.data.queueEvents;

  const totalTokensToday = appointments.length;
  const completedToday = appointments.filter((a) => a.status === 'COMPLETED').length;
  const activeQueued = appointments.filter(
    (a) => a.status === 'CHECKED_IN' || a.status === 'WAITING' || a.status === 'CALLED'
  ).length;
  const skippedOrNoShow = appointments.filter(
    (a) => a.status === 'SKIPPED' || a.status === 'NO_SHOW'
  ).length;

  const avgWaitTimeMinutes = 18.5;

  // Hourly volume distribution for peak hours chart
  const hourlyTraffic = [
    { hour: '08:00', tokens: 8, completed: 6, avgWait: 11 },
    { hour: '09:00', tokens: 18, completed: 14, avgWait: 16 },
    { hour: '10:00', tokens: 26, completed: 21, avgWait: 24 },
    { hour: '11:00', tokens: 32, completed: 25, avgWait: 28 },
    { hour: '12:00', tokens: 20, completed: 18, avgWait: 19 },
    { hour: '13:00', tokens: 12, completed: 10, avgWait: 14 },
    { hour: '14:00', tokens: 22, completed: 19, avgWait: 21 },
    { hour: '15:00', tokens: 19, completed: 16, avgWait: 18 },
    { hour: '16:00', tokens: 11, completed: 10, avgWait: 13 },
  ];

  // Department wait times
  const departmentStats = departments.map((dept) => {
    const deptDocs = doctors.filter((d) => d.departmentId === dept.id);
    const docIds = deptDocs.map((d) => d.id);
    const deptApts = appointments.filter((a) => docIds.includes(a.doctorId));
    return {
      name: dept.name,
      code: dept.code,
      total: deptApts.length,
      waiting: deptApts.filter((a) => a.status === 'CHECKED_IN' || a.status === 'WAITING').length,
      completed: deptApts.filter((a) => a.status === 'COMPLETED').length,
      avgWait: dept.avgWaitTimeMin,
    };
  });

  return {
    success: true,
    kpis: {
      totalTokensToday,
      completedToday,
      activeQueued,
      skippedOrNoShow,
      avgWaitTimeMinutes,
      activeDoctorsCount: doctors.filter((d) => d.status === 'ACTIVE').length,
      emergencyStatus: 'NORMAL',
    },
    hourlyTraffic,
    departmentStats,
    recentEvents: events.slice(0, 15),
  };
}

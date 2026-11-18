/**
 * Privacy-Strict QR Code Payload Generator
 * Explicitly adheres to Rule §9: ZERO PII (No name, phone, email, or MRN)
 */

export function generateQrPayload({ tokenNumber, doctorId, appointmentId, timestamp }) {
  // Only non-PII cryptographic identifier and routing data
  const payload = {
    t: tokenNumber,
    aid: appointmentId,
    d: doctorId,
    ts: timestamp || new Date().toISOString(),
    v: '1.0'
  };
  return JSON.stringify(payload);
}

export function parseQrPayload(payloadString) {
  try {
    return JSON.parse(payloadString);
  } catch (err) {
    return null;
  }
}

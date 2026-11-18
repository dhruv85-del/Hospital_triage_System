/**
 * Realtime Pub-Sub Simulation Bus
 * Shapes events like a future Socket.IO / WebSocket implementation.
 */

class RealtimeBus {
  constructor() {
    this.listeners = new Map(); // eventKey -> Set of callbacks
  }

  /**
   * Subscribe to events for a specific doctor or global queue
   * @param {string} channel - e.g. "queue:doc_1", "hospital:all", "patient:pat_1"
   * @param {function} callback - callback(eventData)
   * @returns {function} unsubscribe function
   */
  subscribe(channel, callback) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel).add(callback);

    return () => {
      this.unsubscribe(channel, callback);
    };
  }

  unsubscribe(channel, callback) {
    if (this.listeners.has(channel)) {
      this.listeners.get(channel).delete(callback);
      if (this.listeners.get(channel).size === 0) {
        this.listeners.delete(channel);
      }
    }
  }

  /**
   * Publish an event to subscribers
   * @param {string} channel
   * @param {object} payload - { type: 'QUEUE_UPDATED' | 'TICKET_CALLED' | 'NOTIFICATION', data: ... }
   */
  publish(channel, payload) {
    const timestamp = new Date().toISOString();
    const event = { ...payload, timestamp, channel };

    // Notify specific channel listeners
    if (this.listeners.has(channel)) {
      this.listeners.get(channel).forEach((cb) => {
        try {
          cb(event);
        } catch (err) {
          console.error(`Error in realtime subscriber for ${channel}:`, err);
        }
      });
    }

    // Also notify wildcard global listeners
    if (channel !== 'global' && this.listeners.has('global')) {
      this.listeners.get('global').forEach((cb) => {
        try {
          cb(event);
        } catch (err) {
          console.error('Error in global subscriber:', err);
        }
      });
    }
  }
}

export const realtime = new RealtimeBus();

/**
 * Event system for simulator to notify leaderboard updates
 */

type SimulatorEventType = 'round-complete' | 'simulation-start' | 'simulation-end';

type SimulatorEventCallback = (data?: any) => void;

class SimulatorEventBus {
  private listeners: Map<SimulatorEventType, Set<SimulatorEventCallback>> = new Map();

  subscribe(event: SimulatorEventType, callback: SimulatorEventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: SimulatorEventType, data?: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  clear() {
    this.listeners.clear();
  }
}

export const simulatorEvents = new SimulatorEventBus();

// Helper to emit leaderboard update
export function notifyLeaderboardUpdate() {
  simulatorEvents.emit('round-complete');
}

// Helper to notify simulation start
export function notifySimulationStart() {
  simulatorEvents.emit('simulation-start');
}

// Helper to notify simulation end
export function notifySimulationEnd() {
  simulatorEvents.emit('simulation-end');
}

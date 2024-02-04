type Listener = (data: any) => void; // Adjust 'any' to match the expected data type

class IpcManager {
  private listeners: Set<Listener>;

  constructor() {
    this.listeners = new Set();
    window.electronAPI.onReadClient((data: string) => { // Adjust 'any' as necessary
      this.notifyListeners(data);
    });
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
  }

  unsubscribe(listener: Listener) {
    this.listeners.delete(listener);
  }

  private notifyListeners(data: any) { // Adjust 'any' to match your data type
    this.listeners.forEach(listener => listener(data));
  }
}

export const ipcManager = new IpcManager();

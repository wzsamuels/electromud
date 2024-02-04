export interface IElectronAPI {
  writeClient: () => Promise<void>,
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
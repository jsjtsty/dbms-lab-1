import { ElectronAPI } from '@electron-toolkit/preload'
import type { CustomAPI, CustomListener } from './index.ts'

declare global {
  interface Window {
    electron: ElectronAPI
    api: CustomAPI
    listener: CustomListener
  }
}

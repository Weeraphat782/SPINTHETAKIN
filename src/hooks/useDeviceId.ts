import { useRef } from 'react'

const STORAGE_KEY = 'spin_device_id'

export function useDeviceId(): string {
  const idRef = useRef<string>('')
  if (!idRef.current) {
    let id = localStorage.getItem(STORAGE_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(STORAGE_KEY, id)
    }
    idRef.current = id
  }
  return idRef.current
}

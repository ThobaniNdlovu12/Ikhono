import { useState, useEffect, useCallback } from 'react'
import { getPublicOpenJobs } from '../services/api'

export default function useArtisans(service = '', location = '') {
  const [artisans, setArtisans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (svc = service, loc = location) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPublicOpenJobs(svc, loc)
      setArtisans(res.data.artisans ?? [])
    } catch (err: any) {
      setError(err?.message ?? 'Unable to load artisans')
    } finally {
      setLoading(false)
    }
  }, [service, location])

  useEffect(() => { fetch(service, location) }, [fetch])

  return { artisans, loading, error, reload: fetch }
}

'use client'

import { useEffect } from 'react'
import { useTripStore } from '@/store/tripStore'

export default function TripHydrator() {
  const loadFromShared = useTripStore((s) => s.loadFromShared)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('trip')
    if (!encoded) return

    loadFromShared(encoded)

    // Clean the URL param without losing the hash or triggering navigation
    const cleanUrl = new URL(window.location.href)
    cleanUrl.searchParams.delete('trip')
    window.history.replaceState(null, '', cleanUrl.toString())
  }, [loadFromShared])

  return null
}

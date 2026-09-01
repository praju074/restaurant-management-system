'use client'

import { Camera, RefreshCw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

type TableQrScannerProps = {
  onScan: (table: string) => void
  onClose: () => void
}

type CameraLens = 'environment' | 'user'

const readerId = 'table-qr-reader'

export default function TableQrScanner({ onScan, onClose }: TableQrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scanningRef = useRef(false)
  const resolvedRef = useRef(false)
  const onScanRef = useRef(onScan)
  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(true)
  const [lens, setLens] = useState<CameraLens>('environment')

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  const stopScanner = async () => {
    const scanner = scannerRef.current
    if (!scanner || !scanningRef.current) return
    try {
      await scanner.stop()
    } catch {
      // The stream may already have been released by the browser.
    } finally {
      scanningRef.current = false
    }
  }

  const startScanner = async (nextLens: CameraLens) => {
    const scanner = scannerRef.current
    if (!scanner) return
    setIsStarting(true)
    setError(null)
    try {
      await scanner.start(
        { facingMode: nextLens },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        async decodedText => {
          if (resolvedRef.current) return
          const table = extractTable(decodedText)
          if (!table) {
            setError('This is not a valid table QR. Please scan the code placed on your desk.')
            return
          }
          resolvedRef.current = true
          await stopScanner()
          onScanRef.current(table)
        },
        () => {
          // QR libraries report every frame miss here; it is not an error.
        }
      )
      scanningRef.current = true
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : ''
      setError(
        message.includes('NotAllowedError') || message.toLowerCase().includes('permission')
          ? 'Camera access is blocked. Allow camera access in your browser settings, then try again.'
          : 'We could not start this camera. Try the other lens or enter your table number manually.'
      )
    } finally {
      setIsStarting(false)
    }
  }

  useEffect(() => {
    const scanner = new Html5Qrcode(readerId)
    scannerRef.current = scanner
    void startScanner('environment')
    return () => {
      resolvedRef.current = true
      void stopScanner().finally(() => {
        scannerRef.current = null
      })
    }
    // The scanner is created once for this modal. Props are kept in refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeLens = async (nextLens: CameraLens) => {
    if (nextLens === lens || isStarting) return
    setLens(nextLens)
    await stopScanner()
    await startScanner(nextLens)
  }

  const retry = async () => {
    resolvedRef.current = false
    await stopScanner()
    await startScanner(lens)
  }

  const close = async () => {
    await stopScanner()
    onClose()
  }

  return (
    <div className="qr-overlay" role="dialog" aria-modal="true" aria-labelledby="table-qr-title">
      <div className="qr-card">
        <div className="qr-card-header">
          <div>
            <span className="eyebrow"><Camera size={14} /> Table QR</span>
            <h3 id="table-qr-title">Scan your desk QR</h3>
          </div>
          <button type="button" className="qr-close-button" onClick={() => void close()} aria-label="Close QR scanner"><X size={20} /></button>
        </div>

        <label className="qr-lens-select">
          <span>Camera lens</span>
          <select value={lens} onChange={event => void changeLens(event.target.value as CameraLens)} disabled={isStarting}>
            <option value="environment">Rear camera (recommended)</option>
            <option value="user">Front camera</option>
          </select>
        </label>

        <div className="qr-reader-wrap" aria-busy={isStarting}>
          <div id={readerId} />
          {isStarting ? <div className="qr-loading">Opening camera...</div> : null}
        </div>

        {error ? <p className="qr-error" role="alert">{error}</p> : null}

        <div className="qr-card-footer">
          <p>Point the camera at the QR code on your desk. Your menu will open as soon as it is detected.</p>
          <button type="button" className="text-button qr-retry-button" onClick={() => void retry()} disabled={isStarting}><RefreshCw size={15} /> Try again</button>
        </div>
      </div>
    </div>
  )
}

function extractTable(text: string): string | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  try {
    const url = new URL(trimmed)
    const table = url.searchParams.get('table') || url.searchParams.get('desk')
    if (table) return normalizeTable(table)
  } catch {
    // A desk QR may contain plain text rather than a link.
  }
  const direct = trimmed.match(/(?:table|desk)\s*[:=#-]?\s*([A-Za-z0-9-]+)/i)
  if (direct?.[1]) return normalizeTable(direct[1])
  if (/^[A-Za-z]{1,3}-?\d{1,4}$/i.test(trimmed)) return normalizeTable(trimmed)
  return null
}

function normalizeTable(value: string): string | null {
  const table = value.trim().toUpperCase().replace(/\s+/g, '')
  return /^[A-Z0-9-]{1,12}$/.test(table) ? table : null
}

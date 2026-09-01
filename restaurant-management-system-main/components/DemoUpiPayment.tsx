'use client'

import { useState } from 'react'
import { CheckCircle2, Copy, CreditCard, Landmark, LoaderCircle, QrCode, ShieldCheck, Smartphone, WalletCards, X } from 'lucide-react'
import type { Bill } from '@/lib/billing'
import BillReceipt from '@/components/BillReceipt'

type DemoUpiPaymentProps = {
  bill: Bill
  onClose: () => void
  onPaymentComplete: (bill: Bill) => void
}

export default function DemoUpiPayment({ bill, onClose, onPaymentComplete }: DemoUpiPaymentProps) {
  const [stage, setStage] = useState<'ready' | 'processing' | 'success'>('ready')
  const [method, setMethod] = useState('UPI app')
  const [completedBill, setCompletedBill] = useState<Bill | null>(null)

  const payNow = () => {
    setStage('processing')
    window.setTimeout(() => {
      const paidBill: Bill = {
        ...bill,
        paymentMethod: 'UPI',
        paymentStatus: 'Paid',
        transactionId: `UPI-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      }
      setCompletedBill(paidBill)
      setStage('success')
      onPaymentComplete(paidBill)
    }, 1800)
  }

  return (
    <div className="payment-modal-backdrop" role="dialog" aria-modal="true" aria-label="Demo UPI payment">
      <div className="payment-modal">
        {stage !== 'success' ? (
          <>
            <button type="button" className="payment-close" onClick={onClose} disabled={stage === 'processing'} aria-label="Close payment"><X size={20} /></button>
            <div className="payment-hero">
              <div className="payment-brand"><ShieldCheck size={20} /> Veranda secure checkout</div>
              <span>Demo UPI payment</span>
              <h2>Pay ₹{bill.grandTotal.toLocaleString('en-IN')}</h2>
              <p>{bill.customerName || 'Walk-in guest'} · Table {bill.tableNumber} · {bill.orderId}</p>
            </div>
            <div className="payment-body">
              <div className="upi-qr-card">
                <div className="qr-placeholder" aria-label="Demo QR code placeholder"><QrCode size={112} strokeWidth={1.3} /></div>
                <div><strong>Scan with any UPI app</strong><span>Demo QR — no real transfer is made</span></div>
              </div>
              <div className="upi-id-row"><div><span>Paying to</span><strong>veranda.demo@upi</strong></div><button type="button" aria-label="Copy demo UPI ID"><Copy size={16} /></button></div>
              <div className="payment-order-summary">
                <div><span>Customer</span><strong>{bill.customerName || 'Walk-in guest'}</strong></div>
                <div><span>Order</span><strong>{bill.orderId}</strong></div>
                <div><span>Items</span><strong>{bill.items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
                <div className="payment-total"><span>Total</span><strong>₹{bill.grandTotal.toLocaleString('en-IN')}</strong></div>
              </div>
              <fieldset className="payment-options" disabled={stage === 'processing'}><legend>Choose payment option</legend>
                {[[Smartphone, 'UPI app'], [WalletCards, 'UPI wallet'], [CreditCard, 'UPI linked card'], [Landmark, 'Bank account']].map(([Icon, label]) => {
                  const PaymentIcon = Icon as typeof Smartphone
                  const option = label as string
                  return <label key={option} className={method === option ? 'selected' : ''}><input type="radio" name="upi-option" checked={method === option} onChange={() => setMethod(option)} /><PaymentIcon size={18} /><span>{option}</span></label>
                })}
              </fieldset>
              <button type="button" className="primary-button payment-pay-button" onClick={payNow} disabled={stage === 'processing'}>
                {stage === 'processing' ? <><LoaderCircle className="payment-spinner" size={18} /> Processing secure payment…</> : <>Pay ₹{bill.grandTotal.toLocaleString('en-IN')} now</>}
              </button>
              <p className="payment-demo-note"><ShieldCheck size={15} /> This is a simulated payment flow for demonstration only.</p>
            </div>
          </>
        ) : (
          <div className="payment-success-view">
            <div className="payment-success-icon"><CheckCircle2 size={58} /></div>
            <span className="eyebrow">Payment successful</span>
            <h2>₹{bill.grandTotal.toLocaleString('en-IN')} paid via UPI</h2>
            <p>Your bill is ready. Transaction details are included below.</p>
            {completedBill ? <BillReceipt bill={completedBill} showActions onPrint={() => window.print()} className="printable-receipt customer-bill" /> : null}
            <button type="button" className="secondary-button" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}

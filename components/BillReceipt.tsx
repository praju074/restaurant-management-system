'use client'

import type { Bill } from '@/lib/billing'

type BillReceiptProps = {
  bill: Bill
  readOnly?: boolean
  className?: string
  showActions?: boolean
  onPrint?: () => void
}

export default function BillReceipt({
  bill,
  readOnly = true,
  className = '',
  showActions = false,
  onPrint,
}: BillReceiptProps) {
  const createdAt = new Date(bill.createdAt)

  return (
    <div className={`receipt-card bill-receipt ${className}`}>
      <div className="receipt-header">
        <div>
          <h2>Veranda Kitchen & Bar</h2>
          <p>Table-wise Consolidated Bill</p>
        </div>

        <div className="receipt-table-badge">
          Table {bill.tableNumber}
        </div>
      </div>

      <div className="receipt-divider" />

      <div className="receipt-info-grid">
        <div>
          <span>Bill ID</span>
          <strong>{bill.billId}</strong>
        </div>

        <div>
          <span>Order ID</span>
          <strong>{bill.orderId}</strong>
        </div>

        <div>
          <span>Table</span>
          <strong>{bill.tableNumber}</strong>
        </div>

        <div>
          <span>Date / Time</span>
          <strong>{createdAt.toLocaleString()}</strong>
        </div>
      </div>

      <div className="receipt-divider" />

      <div className="receipt-info-grid">
        <div>
          <span>Payment Method</span>
          <strong>{bill.paymentMethod}</strong>
        </div>

        <div>
          <span>Payment Status</span>
          <strong
            className={`payment-status-text ${bill.paymentStatus.toLowerCase()}`}
          >
            {bill.paymentStatus}
          </strong>
        </div>

        <div>
          <span>Transaction ID</span>
          <strong>{bill.transactionId}</strong>
        </div>

        <div>
          <span>Bill Status</span>
          <strong>{bill.status}</strong>
        </div>
      </div>

      {bill.instructions ? (
        <>
          <div className="receipt-divider" />

          <div className="receipt-instructions">
            <span>Customer Instructions</span>
            <p>{bill.instructions}</p>
          </div>
        </>
      ) : null}

      <div className="receipt-divider" />

      <div className="receipt-items">
        <div className="receipt-items-header">
          <span>Item</span>
          <span>Qty</span>
          <span>Price</span>
        </div>

        {bill.items.map((item, index) => (
          <div
            key={`${item.id}-${item.name}-${index}`}
            className="receipt-row"
          >
            <div className="receipt-item-name">
              <strong>{item.name}</strong>

              <small>
                ₹{item.unitPrice.toLocaleString('en-IN')} × {item.quantity}
              </small>
            </div>

            <span>{item.quantity}</span>

            <strong>
              ₹{item.lineTotal.toLocaleString('en-IN')}
            </strong>
          </div>
        ))}
      </div>

      <div className="receipt-divider" />

      <div className="receipt-summary">
        <div>
          <span>Subtotal</span>
          <strong>
            ₹{bill.subtotal.toLocaleString('en-IN')}
          </strong>
        </div>

        <div>
          <span>GST (5%)</span>
          <strong>
            ₹{bill.gst.toLocaleString('en-IN')}
          </strong>
        </div>

        <div>
          <span>Service Charge (6%)</span>
          <strong>
            ₹{bill.serviceCharge.toLocaleString('en-IN')}
          </strong>
        </div>

        {bill.discount > 0 ? (
          <div className="receipt-discount">
            <span>Discount</span>
            <strong>
              -₹{bill.discount.toLocaleString('en-IN')}
            </strong>
          </div>
        ) : null}

        <div className="receipt-grand-total">
          <span>Grand Total</span>
          <strong>
            ₹{bill.grandTotal.toLocaleString('en-IN')}
          </strong>
        </div>
      </div>

      {showActions && onPrint ? (
        <div className="receipt-actions">
          <span className="receipt-edit-note">
            {readOnly
              ? 'Customer copy — Read only'
              : 'Admin editable bill'}
          </span>

          <button
            type="button"
            className="primary-button"
            onClick={onPrint}
          >
            Print Bill
          </button>
        </div>
      ) : null}

      <div className="receipt-footer">
        <strong>Thank you for dining with us!</strong>
        <span>This is a computer-generated bill.</span>
      </div>
    </div>
  )
}

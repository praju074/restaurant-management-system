```tsx
export const ORDERS_STORAGE_KEY = 'veranda_orders'
export const BILLS_STORAGE_KEY = 'veranda_bills'

export type BillLineItem = {
  id: number | string
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export type Bill = {
  billId: string
  orderId: string
  tableNumber: string
  createdAt: string
  items: BillLineItem[]
  subtotal: number
  gst: number
  serviceCharge: number
  discount: number
  grandTotal: number
  paymentMethod: string
  paymentStatus: 'Paid' | 'Pending' | 'Cancelled'
  transactionId: string
  status: 'Active' | 'Cancelled'
  source: 'customer' | 'manual' | 'admin-custom'
  instructions?: string
}

export type StoredOrder = {
  id: string
  table: string
  total: number
  status: string
  paymentMethod?: string
  paymentStatus?: string
  prepTime?: string
  customer?: string
  type?: string
  items?: string
  lineItems?: BillLineItem[]
  subtotal?: number
  gst?: number
  service?: number
  transactionId?: string
  billId?: string
  instructions?: string
}

export type BillTotalsInput = {
  items: BillLineItem[]
  discount?: number
}

const GST_RATE = 0.05
const SERVICE_RATE = 0.06

export function calculateBillTotals({
  items,
  discount = 0,
}: BillTotalsInput) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.lineTotal || 0),
    0,
  )

  const gst = Math.round(subtotal * GST_RATE)
  const serviceCharge = Math.round(subtotal * SERVICE_RATE)

  const safeDiscount = Math.max(0, Number(discount || 0))

  const grandTotal = Math.max(
    0,
    subtotal + gst + serviceCharge - safeDiscount,
  )

  return {
    subtotal,
    gst,
    serviceCharge,
    discount: safeDiscount,
    grandTotal,
  }
}

export function createLineItem(
  id: number | string,
  name: string,
  quantity: number,
  unitPrice: number,
): BillLineItem {
  const safeQuantity = Math.max(1, Number(quantity || 1))
  const safeUnitPrice = Math.max(0, Number(unitPrice || 0))

  return {
    id,
    name,
    quantity: safeQuantity,
    unitPrice: safeUnitPrice,
    lineTotal: safeUnitPrice * safeQuantity,
  }
}

export function formatItemsSummary(items: BillLineItem[]) {
  return items
    .map(item => `${item.name} ×${item.quantity}`)
    .join(', ')
}

export function generateOrderId() {
  return `ORD-${Math.floor(1000 + Math.random() * 9000)}`
}

export function generateBillId() {
  return `BILL-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`
}

export function generateTransactionId() {
  return `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`
}

export function isOnlinePaymentMethod(method: string) {
  return [
    'UPI',
    'Credit Card',
    'Debit Card',
    'Net Banking',
    'Wallet',
  ].includes(method)
}

export function createBillFromLineItems(input: {
  orderId: string
  tableNumber: string
  items: BillLineItem[]
  paymentMethod: string
  paidOnline?: boolean
  source: Bill['source']
  instructions?: string
  discount?: number
  transactionId?: string
}): Bill {
  const totals = calculateBillTotals({
    items: input.items,
    discount: input.discount ?? 0,
  })

  const paidOnline =
    input.paidOnline ??
    isOnlinePaymentMethod(input.paymentMethod)

  return {
    billId: generateBillId(),
    orderId: input.orderId,
    tableNumber: input.tableNumber,
    createdAt: new Date().toISOString(),
    items: input.items,

    subtotal: totals.subtotal,
    gst: totals.gst,
    serviceCharge: totals.serviceCharge,
    discount: totals.discount,
    grandTotal: totals.grandTotal,

    paymentMethod: input.paymentMethod,
    paymentStatus: paidOnline ? 'Paid' : 'Pending',

    transactionId:
      input.transactionId ?? generateTransactionId(),

    status: 'Active',
    source: input.source,
    instructions: input.instructions,
  }
}

export function billToStoredOrder(
  bill: Bill,
  status = 'Order received',
): StoredOrder {
  return {
    id: bill.orderId,
    billId: bill.billId,

    table: bill.tableNumber,

    customer:
      bill.source === 'manual'
        ? 'Manual entry'
        : 'Walk-in guest',

    type: 'Walk-in',

    items: formatItemsSummary(bill.items),
    lineItems: bill.items,

    status,

    paymentMethod: bill.paymentMethod,
    paymentStatus: bill.paymentStatus,

    transactionId: bill.transactionId,

    subtotal: bill.subtotal,
    gst: bill.gst,
    service: bill.serviceCharge,

    total: bill.grandTotal,

    prepTime: `${15 + bill.items.length * 2} min`,

    instructions: bill.instructions ?? '',
  }
}

function parseLegacyItems(items?: string): BillLineItem[] {
  if (!items) return []

  return items
    .split(',')
    .map((part, index) => {
      const cleanPart = part.trim()

      // FIXED REGEX
      const match = cleanPart.match(/^(.*)\s×(\d+)$/)

      const name = match
        ? match[1].trim()
        : cleanPart

      const quantity = match
        ? Number(match[2])
        : 1

      return createLineItem(
        `legacy-${index}`,
        name,
        quantity,
        0,
      )
    })
    .filter(item => item.name.length > 0)
}

export function normalizeStoredOrder(
  raw: Record<string, unknown>,
): StoredOrder {
  const order = raw as Partial<StoredOrder>

  const rawLineItems = Array.isArray(order.lineItems)
    ? order.lineItems
    : []

  const lineItems =
    rawLineItems.length > 0
      ? rawLineItems.map((item, index) => {
          const quantity = Math.max(
            1,
            Number(item.quantity ?? 1),
          )

          const unitPrice = Math.max(
            0,
            Number(item.unitPrice ?? 0),
          )

          const lineTotal =
            Number(item.lineTotal) ||
            unitPrice * quantity

          return {
            id: item.id ?? index,
            name: String(item.name ?? 'Item'),
            quantity,
            unitPrice,
            lineTotal,
          }
        })
      : parseLegacyItems(
          typeof order.items === 'string'
            ? order.items
            : undefined,
        )

  const calculatedSubtotal = lineItems.reduce(
    (sum, item) => sum + item.lineTotal,
    0,
  )

  const subtotal = Number(
    order.subtotal ?? calculatedSubtotal,
  )

  const gst = Number(
    order.gst ?? Math.round(subtotal * GST_RATE),
  )

  const service = Number(
    order.service ??
      Math.round(subtotal * SERVICE_RATE),
  )

  const total = Number(
    order.total ??
      subtotal + gst + service,
  )

  return {
    id: String(
      order.id ?? generateOrderId(),
    ),

    table: String(
      order.table ?? 'T01',
    ),

    total,

    status: String(
      order.status ?? 'Order received',
    ),

    paymentMethod: order.paymentMethod
      ? String(order.paymentMethod)
      : 'On-site',

    paymentStatus: order.paymentStatus
      ? String(order.paymentStatus)
      : 'Pending',

    prepTime: order.prepTime
      ? String(order.prepTime)
      : 'TBD',

    customer: order.customer
      ? String(order.customer)
      : 'Walk-in guest',

    type: order.type
      ? String(order.type)
      : 'Walk-in',

    items: order.items
      ? String(order.items)
      : formatItemsSummary(lineItems),

    lineItems,

    subtotal,
    gst,
    service,

    transactionId: order.transactionId
      ? String(order.transactionId)
      : generateTransactionId(),

    billId: order.billId
      ? String(order.billId)
      : undefined,

    instructions: order.instructions
      ? String(order.instructions)
      : '',
  }
}

export function orderToBill(
  order: StoredOrder,
  source: Bill['source'] = 'customer',
): Bill {
  const items =
    order.lineItems &&
    order.lineItems.length > 0
      ? order.lineItems
      : parseLegacyItems(order.items)

  const subtotal =
    order.subtotal ??
    items.reduce(
      (sum, item) => sum + item.lineTotal,
      0,
    )

  const gst =
    order.gst ??
    Math.round(subtotal * GST_RATE)

  const serviceCharge =
    order.service ??
    Math.round(subtotal * SERVICE_RATE)

  const total =
    order.total ??
    subtotal + gst + serviceCharge

  return {
    billId:
      order.billId ?? generateBillId(),

    orderId: order.id,

    tableNumber: order.table,

    createdAt: new Date().toISOString(),

    items,

    subtotal,
    gst,
    serviceCharge,

    discount: 0,

    grandTotal: total,

    paymentMethod:
      order.paymentMethod ?? 'On-site',

    paymentStatus:
      order.paymentStatus === 'Paid'
        ? 'Paid'
        : order.paymentStatus === 'Cancelled'
          ? 'Cancelled'
          : 'Pending',

    transactionId:
      order.transactionId ??
      generateTransactionId(),

    status:
      order.status === 'Cancelled'
        ? 'Cancelled'
        : 'Active',

    source,

    instructions: order.instructions,
  }
}

export function loadOrders(): StoredOrder[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored =
      window.localStorage.getItem(
        ORDERS_STORAGE_KEY,
      )

    if (!stored) return []

    const parsed = JSON.parse(stored)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.map(
      (entry: Record<string, unknown>) =>
        normalizeStoredOrder(entry),
    )
  } catch {
    return []
  }
}

export function saveOrders(
  orders: StoredOrder[],
) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(
    ORDERS_STORAGE_KEY,
    JSON.stringify(orders.slice(0, 50)),
  )
}

export function loadBills(): Bill[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored =
      window.localStorage.getItem(
        BILLS_STORAGE_KEY,
      )

    if (!stored) return []

    const parsed = JSON.parse(stored)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed as Bill[]
  } catch {
    return []
  }
}

export function saveBills(
  bills: Bill[],
) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(
    BILLS_STORAGE_KEY,
    JSON.stringify(bills.slice(0, 100)),
  )
}

export function upsertBill(
  bill: Bill,
) {
  const bills = loadBills()

  const index = bills.findIndex(
    entry =>
      entry.billId === bill.billId,
  )

  if (index === -1) {
    saveBills([
      bill,
      ...bills,
    ])
    return
  }

  const next = [...bills]

  next[index] = bill

  saveBills(next)
}

export function upsertOrder(
  order: StoredOrder,
) {
  const orders = loadOrders()

  const index = orders.findIndex(
    entry => entry.id === order.id,
  )

  if (index === -1) {
    saveOrders([
      order,
      ...orders,
    ])
    return
  }

  const next = [...orders]

  next[index] = order

  saveOrders(next)
}

export function syncBillsFromOrders(
  orders: StoredOrder[],
  bills: Bill[],
) {
  const billMap = new Map(
    bills.map(bill => [
      bill.billId,
      bill,
    ]),
  )

  orders.forEach(order => {
    if (
      order.billId &&
      billMap.has(order.billId)
    ) {
      return
    }

    const existing = bills.find(
      bill =>
        bill.orderId === order.id,
    )

    if (existing) {
      order.billId =
        existing.billId

      return
    }

    const source: Bill['source'] =
      order.customer === 'Manual entry'
        ? 'manual'
        : 'customer'

    const bill =
      orderToBill(
        order,
        source,
      )

    order.billId =
      bill.billId

    billMap.set(
      bill.billId,
      bill,
    )
  })

  return {
    orders,

    bills: Array.from(
      billMap.values(),
    ).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    ),
  }
}

export function persistOrderAndBill(
  order: StoredOrder,
  bill: Bill,
) {
  const linkedOrder = {
    ...order,
    billId: bill.billId,
  }

  upsertOrder(linkedOrder)

  upsertBill(bill)

  return linkedOrder
}
```

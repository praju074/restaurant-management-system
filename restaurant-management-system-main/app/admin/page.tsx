'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import {
  ArrowRight,
  BarChart3,
  Bell,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  Menu as MenuIcon,
  MessageSquare,
  PieChart,
  Plus,
  RefreshCcw,
  ShoppingBag,
  Table2,
  Truck,
  Utensils,
  X,
} from 'lucide-react'
import { normalizeStoredOrder, type StoredOrder } from '@/lib/billing'
import { io, type Socket } from 'socket.io-client'

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'

const initialMenu = [
  {
    id: 1,
    name: 'Smoked Paneer Tikka',
    category: 'Starters',
    price: 320,
    status: 'Available',
    special: true,
  },
  {
    id: 2,
    name: 'Saffron Garden Biryani',
    category: 'Rice & Biryani',
    price: 460,
    status: 'Available',
    special: true,
  },
  {
    id: 3,
    name: 'Rose Cardamom Gulab Jamun',
    category: 'Desserts',
    price: 180,
    status: 'Available',
    special: false,
  },
  {
    id: 4,
    name: 'Wood-fired Margherita Pizza',
    category: 'Pizza',
    price: 390,
    status: 'Available',
    special: false,
  },
  {
    id: 5,
    name: 'Crispy Paneer Burger',
    category: 'Burgers',
    price: 340,
    status: 'Available',
    special: false,
  },
]

const initialOrders = [
  {
    id: '#ORD-2894',
    customer: 'Aarav Mehta',
    type: 'Reservation',
    table: 'T08',
    items: 'Paneer Tikka ×2, Saffron Biryani',
    status: 'Preparing',
    paymentMethod: 'UPI',
    paymentStatus: 'Pending',
    transactionId: 'TXN-9214',
    subtotal: 880,
    gst: 44,
    service: 56,
    total: 980,
    instructions: 'Less spicy',
    prepTime: '14 min',
  },
  {
    id: '#ORD-2895',
    customer: 'Nisha Shah',
    type: 'Walk-in',
    table: 'T03',
    items: 'Crispy Paneer Burger ×1, Fries',
    status: 'Ready to serve',
    paymentMethod: 'Credit Card',
    paymentStatus: 'Paid',
    transactionId: 'TXN-7782',
    subtotal: 370,
    gst: 18,
    service: 32,
    total: 420,
    instructions: 'Extra cheese',
    prepTime: '6 min',
  },
  {
    id: '#ORD-2896',
    customer: 'Walk-in guest',
    type: 'Walk-in',
    table: 'T15',
    items: 'Wok Tossed Hakka Noodles ×2, Garlic Butter Roti',
    status: 'Received',
    paymentMethod: 'Wallet',
    paymentStatus: 'Pending',
    transactionId: 'TXN-0315',
    subtotal: 450,
    gst: 23,
    service: 47,
    total: 520,
    instructions: 'No onions',
    prepTime: '2 min',
  },
]

const initialTables = [
  { id: 'T01', status: 'Available' },
  { id: 'T02', status: 'Occupied' },
  { id: 'T03', status: 'Preparing' },
  { id: 'T08', status: 'Occupied' },
  { id: 'T15', status: 'Available' },
]

const initialFeedback = [
  {
    id: 1,
    guest: 'Aarav',
    rating: 5,
    comment: 'Lovely service and spot-on spice levels.',
  },
  {
    id: 2,
    guest: 'Nisha',
    rating: 4,
    comment: 'Great menu items, would love faster refill on drinks.',
  },
]

const statusSequence = [
  'Received',
  'Accepted',
  'Preparing',
  'Ready to serve',
  'Served',
  'Completed',
]

const orderStatuses = ['All', ...statusSequence, 'Cancelled']

const customerTypes = ['All', 'Reservation', 'Walk-in', 'Repeat']

const tabs = [
  'Orders',
  'Kitchen',
  'Menu',
  'Tables',
  'Manual entry',
  'Billing',
  'Reports',
  'Feedback',
]

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type IncomingOrderItem = {
  id?: number | string
  name?: string
  category?: string
  quantity?: number
  price?: number
  total?: number
  unitPrice?: number
  lineTotal?: number
}

type IncomingOrder = {
  id?: string
  orderId?: string

  customerName?: string
  customer?: string
  name?: string

  table?: string
  tableNumber?: string

  items?: IncomingOrderItem[]

  subtotal?: number
  gst?: number
  service?: number
  total?: number

  paymentMethod?: string
  paymentStatus?: string
  transactionId?: string

  status?: string
  instructions?: string
  createdAt?: string
  source?: string
  paidOnline?: boolean
}

/* -------------------------------------------------------------------------- */
/* METRIC CARD                                                                */
/* -------------------------------------------------------------------------- */

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof LayoutDashboard
  label: string
  value: string
}) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        <Icon size={18} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* ADMIN PAGE                                                                 */
/* -------------------------------------------------------------------------- */

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Orders')

  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const [orders, setOrders] =
    useState<StoredOrder[]>(initialOrders as StoredOrder[])

  const [menu, setMenu] = useState(initialMenu)

  const [tables, setTables] = useState(initialTables)

  const [feedback, setFeedback] = useState(initialFeedback)

  const [selectedOrderId, setSelectedOrderId] = useState(
    initialOrders[0].id,
  )

  const [statusFilter, setStatusFilter] = useState('All')

  const [customerTypeFilter, setCustomerTypeFilter] = useState('All')

  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    price: 0,
  })

  const [newTable, setNewTable] = useState('T16')

  const [manualTable, setManualTable] = useState('T01')

  const [manualDish, setManualDish] = useState(menu[0].id)

  const [manualQuantity, setManualQuantity] = useState(1)

  const [manualLineItems, setManualLineItems] = useState<
    { id: number; quantity: number }[]
  >([])

  const [customItems, setCustomItems] = useState<
    { description: string; price: number; quantity: number }[]
  >([])

  const [discountPercent, setDiscountPercent] = useState(0)

  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | 'unsupported'>('default')

  const [socketConnected, setSocketConnected] = useState(false)

  /*
   * This state controls the custom notification popup.
   *
   * Browser notification alone may not be visible if:
   * - browser permission is denied
   * - browser is not focused
   * - browser blocks notifications
   *
   * Therefore we ALSO show an in-dashboard notification.
   */
  const [newOrderPopup, setNewOrderPopup] = useState<{
    visible: boolean
    orderId: string
    customerName: string
    foodNames: string
    table: string
    total: number
  }>({
    visible: false,
    orderId: '',
    customerName: '',
    foodNames: '',
    table: '',
    total: 0,
  })

  const socketRef = useRef<Socket | null>(null)

  /* ------------------------------------------------------------------------ */
  /* FILTERED ORDERS                                                          */
  /* ------------------------------------------------------------------------ */

  const filteredOrders = useMemo(
    () =>
      orders.filter(
        order =>
          (statusFilter === 'All' || order.status === statusFilter) &&
          (customerTypeFilter === 'All' ||
            order.type === customerTypeFilter),
      ),
    [statusFilter, customerTypeFilter, orders],
  )

  const selectedOrder =
    orders.find(order => order.id === selectedOrderId) || orders[0]

  /* ------------------------------------------------------------------------ */
  /* METRICS                                                                  */
  /* ------------------------------------------------------------------------ */

  const metricValues = useMemo(() => {
    const total = orders.length

    const pending = orders.filter(
      order =>
        order.status !== 'Completed' &&
        order.status !== 'Cancelled',
    ).length

    const completed = orders.filter(
      order => order.status === 'Completed',
    ).length

    const revenue = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    )

    return {
      total,
      pending,
      completed,
      revenue,
    }
  }, [orders])

  const paymentSummary = useMemo(() => {
    const paidOrders = orders.filter(
      order => order.paymentStatus === 'Paid',
    )

    const pendingOrders = orders.filter(
      order => order.paymentStatus !== 'Paid',
    )

    const onlineOrders = orders.filter(order =>
      [
        'UPI',
        'Credit Card',
        'Debit Card',
        'Net Banking',
        'Wallet',
      ].includes(order.paymentMethod),
    )

    return {
      paidTotal: paidOrders.reduce(
        (sum, order) => sum + Number(order.total || 0),
        0,
      ),

      pendingTotal: pendingOrders.reduce(
        (sum, order) => sum + Number(order.total || 0),
        0,
      ),

      paidCount: paidOrders.length,

      pendingCount: pendingOrders.length,

      onlineCount: onlineOrders.length,
    }
  }, [orders])

  const popularDishes = useMemo(() => {
    const counts: Record<string, number> = {}

    orders.forEach(order => {
      order.items.split(',').forEach(item => {
        const name = item
          .trim()
          .replace(/×\d+$/, '')
          .trim()

        counts[name] = (counts[name] || 0) + 1
      })
    })

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => `${name} (${count})`)
  }, [orders])

  /* ------------------------------------------------------------------------ */
  /* ORDER UPDATE                                                             */
  /* ------------------------------------------------------------------------ */

  const updateOrder = (
    id: string,
    patch: Partial<StoredOrder>,
  ) => {
    setOrders(current =>
      current.map(order =>
        order.id === id
          ? {
              ...order,
              ...patch,
            }
          : order,
      ),
    )
  }

  /* ------------------------------------------------------------------------ */
  /* EXTRACT CUSTOMER NAME                                                    */
  /* ------------------------------------------------------------------------ */

  const getCustomerName = (
    order: IncomingOrder,
  ): string => {
    const possibleNames = [
      order.customerName,
      order.customer,
      order.name,
    ]

    for (const name of possibleNames) {
      if (
        typeof name === 'string' &&
        name.trim() &&
        name.trim().toLowerCase() !== 'walk-in guest' &&
        name.trim().toLowerCase() !== 'walkin guest' &&
        name.trim().toLowerCase() !== 'guest'
      ) {
        return name.trim()
      }
    }

    /*
     * Important:
     * If customerName is present in the socket payload,
     * it will ALWAYS win.
     */
    return (
      order.customerName?.trim() ||
      order.customer?.trim() ||
      'Walk-in guest'
    )
  }

  /* ------------------------------------------------------------------------ */
  /* EXTRACT FOOD NAMES                                                       */
  /* ------------------------------------------------------------------------ */

  const getFoodNames = (
    order: IncomingOrder,
  ): string => {
    if (
      Array.isArray(order.items) &&
      order.items.length > 0
    ) {
      return order.items
        .map(item => {
          const name =
            typeof item.name === 'string' &&
            item.name.trim()
              ? item.name.trim()
              : 'Food item'

          const quantity =
            Number(item.quantity) > 0
              ? Number(item.quantity)
              : 1

          return `${name} ×${quantity}`
        })
        .join(', ')
    }

    return 'Food items'
  }

  /* ------------------------------------------------------------------------ */
  /* CONVERT SOCKET ORDER TO STORED ORDER                                     */
  /* ------------------------------------------------------------------------ */

  const convertIncomingOrder = (
    incoming: IncomingOrder,
  ): StoredOrder => {
    const customerName = getCustomerName(incoming)

    const foodNames = getFoodNames(incoming)

    const orderId =
      incoming.orderId ||
      incoming.id ||
      `ORD-${Date.now()}`

    const table =
      incoming.tableNumber ||
      incoming.table ||
      'T01'

    const subtotal = Number(incoming.subtotal || 0)

    const gst = Number(incoming.gst || 0)

    const service = Number(incoming.service || 0)

    const total = Number(
      incoming.total ||
        subtotal + gst + service,
    )

    const lineItems = Array.isArray(incoming.items)
      ? incoming.items.map((item, index) => {
          const quantity =
            Number(item.quantity) > 0
              ? Number(item.quantity)
              : 1

          const unitPrice = Number(
            item.unitPrice ??
              item.price ??
              0,
          )

          const lineTotal = Number(
            item.lineTotal ??
              item.total ??
              unitPrice * quantity,
          )

          return {
            id:
              typeof item.id === 'number'
                ? item.id
                : index + 1,

            name:
              item.name ||
              'Food item',

            quantity,

            unitPrice,

            lineTotal,
          }
        })
      : []

    return normalizeStoredOrder({
      id: orderId,
      orderId,

      customer: customerName,

      customerName,

      type:
        incoming.source === 'customer'
          ? 'Walk-in'
          : 'Walk-in',

      table,

      tableNumber: table,

      items: foodNames,

      lineItems,

      status:
        incoming.status === 'Order received'
          ? 'Received'
          : incoming.status || 'Received',

      paymentMethod:
        incoming.paymentMethod ||
        'Pending',

      paymentStatus:
        incoming.paymentStatus ||
        (incoming.paidOnline ? 'Paid' : 'Pending'),

      transactionId:
        incoming.transactionId ||
        `TXN-${Date.now()}`,

      subtotal,

      gst,

      service,

      total,

      instructions:
        incoming.instructions || '',

      prepTime: 'TBD',

      createdAt:
        incoming.createdAt ||
        new Date().toISOString(),

      source:
        incoming.source ||
        'customer',

      paidOnline:
        incoming.paidOnline || false,
    } as Record<string, unknown>)
  }

  /* ------------------------------------------------------------------------ */
  /* SHOW CUSTOM ADMIN POPUP                                                  */
  /* ------------------------------------------------------------------------ */

  const showOrderPopup = (
    order: IncomingOrder,
  ) => {
    const customerName =
      getCustomerName(order)

    const foodNames =
      getFoodNames(order)

    const orderId =
      order.orderId ||
      order.id ||
      'New Order'

    const table =
      order.tableNumber ||
      order.table ||
      'T01'

    const total =
      Number(order.total || 0)

    /*
     * This popup is independent of browser Notification permission.
     * So even if browser notification is blocked, the admin sees it.
     */
    setNewOrderPopup({
      visible: true,
      orderId,
      customerName,
      foodNames,
      table,
      total,
    })

    /*
     * Automatically hide popup after 12 seconds.
     */
    window.setTimeout(() => {
      setNewOrderPopup(current => ({
        ...current,
        visible: false,
      }))
    }, 12000)
  }

  /* ------------------------------------------------------------------------ */
  /* BROWSER NOTIFICATION                                                     */
  /* ------------------------------------------------------------------------ */

  const showBrowserNotification = (
    order: IncomingOrder,
  ) => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window)
    ) {
      return
    }

    if (
      Notification.permission !==
      'granted'
    ) {
      return
    }

    const customerName =
      getCustomerName(order)

    const foodNames =
      getFoodNames(order)

    const orderId =
      order.orderId ||
      order.id ||
      'New Order'

    const total =
      Number(order.total || 0)

    try {
      const notification =
        new Notification(
          '🔔 New Order Received!',
          {
            body:
              `Customer: ${customerName}\n` +
              `Order: ${orderId}\n` +
              `Food: ${foodNames}\n` +
              `Table: ${order.tableNumber || order.table || 'T01'}\n` +
              `Total: ₹${total}`,
            tag: `new-order-${orderId}`,
            requireInteraction: true,
          },
        )

      notification.onclick = () => {
        window.focus()

        setActiveTab('Orders')

        setNewOrderPopup(current => ({
          ...current,
          visible: false,
        }))
      }
    } catch (error) {
      console.error(
        '[Notification] Failed:',
        error,
      )
    }
  }

  /* ------------------------------------------------------------------------ */
  /* REQUEST NOTIFICATION PERMISSION                                          */
  /* ------------------------------------------------------------------------ */

  const requestNotificationPermission =
    async () => {
      if (typeof window === 'undefined') {
        return
      }

      if (!('Notification' in window)) {
        setNotificationPermission(
          'unsupported',
        )
        return
      }

      if (
        Notification.permission ===
        'granted'
      ) {
        setNotificationPermission(
          'granted',
        )

        return
      }

      if (
        Notification.permission ===
        'denied'
      ) {
        setNotificationPermission(
          'denied',
        )

        return
      }

      try {
        const permission =
          await Notification.requestPermission()

        setNotificationPermission(
          permission,
        )

        if (permission === 'granted') {
          new Notification(
            '🔔 Veranda Notifications Enabled',
            {
              body:
                'You will now receive new order notifications.',
            },
          )
        }
      } catch (error) {
        console.error(
          'Notification permission error:',
          error,
        )
      }
    }

  /* ------------------------------------------------------------------------ */
  /* SOCKET.IO ADMIN CONNECTION                                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    /* Notification status */
    if ('Notification' in window) {
      setNotificationPermission(
        Notification.permission,
      )
    } else {
      setNotificationPermission(
        'unsupported',
      )
    }

    console.log(
      '[Socket.IO] Connecting to:',
      SOCKET_URL,
    )

    const socket = io(SOCKET_URL, {
      transports: [
        'websocket',
        'polling',
      ],

      autoConnect: true,

      reconnection: true,

      reconnectionAttempts: Infinity,

      reconnectionDelay: 1000,

      reconnectionDelayMax: 5000,

      timeout: 10000,
    })

    socketRef.current = socket

    /* ---------------------------------------------------------------------- */
    /* CONNECT                                                                */
    /* ---------------------------------------------------------------------- */

    socket.on('connect', () => {
      console.log(
        '[Socket.IO] Admin connected:',
        socket.id,
      )

      setSocketConnected(true)

      /*
       * VERY IMPORTANT:
       * Admin must join "admins" room.
       */
      socket.emit('join-admin')

      console.log(
        '[Socket.IO] Admin joined notification room',
      )
    })

    /* ---------------------------------------------------------------------- */
    /* DISCONNECT                                                             */
    /* ---------------------------------------------------------------------- */

    socket.on(
      'disconnect',
      reason => {
        console.log(
          '[Socket.IO] Admin disconnected:',
          reason,
        )

        setSocketConnected(false)
      },
    )

    /* ---------------------------------------------------------------------- */
    /* CONNECT ERROR                                                           */
    /* ---------------------------------------------------------------------- */

    socket.on(
      'connect_error',
      error => {
        console.error(
          '[Socket.IO] Connection error:',
          error.message,
        )

        setSocketConnected(false)
      },
    )

    /* ---------------------------------------------------------------------- */
    /* RECONNECT                                                               */
    /* ---------------------------------------------------------------------- */

    socket.io.on(
      'reconnect',
      attempt => {
        console.log(
          '[Socket.IO] Reconnected after attempt:',
          attempt,
        )

        socket.emit('join-admin')

        setSocketConnected(true)
      },
    )

    /* ---------------------------------------------------------------------- */
    /* NEW ORDER NOTIFICATION                                                 */
    /* ---------------------------------------------------------------------- */

    socket.on(
      'order-notification',
      (payload: unknown) => {
        console.log(
          '====================================',
        )

        console.log(
          '[Socket.IO] ORDER NOTIFICATION RECEIVED:',
          payload,
        )

        console.log(
          '====================================',
        )

        if (
          !payload ||
          typeof payload !== 'object'
        ) {
          console.error(
            '[Socket.IO] Invalid order payload',
          )

          return
        }

        try {
          /*
           * Server currently sends:
           *
           * io.to("admins").emit(
           *   "order-notification",
           *   order
           * )
           *
           * But we also support:
           *
           * { order: {...} }
           */

          const raw =
            payload as Record<
              string,
              unknown
            >

          const incoming =
            raw.order &&
            typeof raw.order === 'object'
              ? (raw.order as IncomingOrder)
              : (raw as IncomingOrder)

          console.log(
            '[Socket.IO] Customer:',
            getCustomerName(incoming),
          )

          console.log(
            '[Socket.IO] Food:',
            getFoodNames(incoming),
          )

          /*
           * Convert to dashboard format.
           */
          const newOrder =
            convertIncomingOrder(
              incoming,
            )

          console.log(
            '[Socket.IO] Converted order:',
            newOrder,
          )

          /*
           * Prevent duplicate order.
           */
          setOrders(current => {
            const existingIndex =
              current.findIndex(
                order =>
                  order.id ===
                  newOrder.id,
              )

            if (existingIndex !== -1) {
              /*
               * Update existing order instead
               * of adding duplicate.
               */
              return current.map(
                order =>
                  order.id ===
                  newOrder.id
                    ? {
                        ...order,
                        ...newOrder,
                      }
                    : order,
              )
            }

            /*
             * New order goes at top.
             */
            return [
              newOrder,
              ...current,
            ]
          })

          /*
           * Select new order.
           */
          setSelectedOrderId(
            newOrder.id,
          )

          /*
           * Open Orders tab.
           */
          setActiveTab('Orders')

          /*
           * SHOW IN-DASHBOARD POPUP.
           */
          showOrderPopup(incoming)

          /*
           * SHOW ACTUAL BROWSER NOTIFICATION.
           */
          showBrowserNotification(
            incoming,
          )

          /*
           * Small sound for admin.
           */
          try {
            const audio =
              new Audio(
                '/notification.mp3',
              )

            audio.volume = 0.8

            audio
              .play()
              .catch(() => {
                console.log(
                  '[Notification] Browser blocked autoplay sound',
                )
              })
          } catch {
            // Ignore audio errors.
          }
        } catch (error) {
          console.error(
            '[Socket.IO] Could not process order:',
            error,
          )
        }
      },
    )

    /* ---------------------------------------------------------------------- */
    /* OPTIONAL BACKWARD COMPATIBILITY                                        */
    /* ---------------------------------------------------------------------- */

    /*
     * If another version of your user side emits "new-order"
     * directly to the server, this also supports it.
     */
    socket.on(
      'new-order',
      (payload: unknown) => {
        console.log(
          '[Socket.IO] Legacy new-order received:',
          payload,
        )

        if (
          !payload ||
          typeof payload !== 'object'
        ) {
          return
        }

        try {
          const raw =
            payload as Record<
              string,
              unknown
            >

          const incoming =
            raw.order &&
            typeof raw.order === 'object'
              ? (raw.order as IncomingOrder)
              : (raw as IncomingOrder)

          const newOrder =
            convertIncomingOrder(
              incoming,
            )

          setOrders(current => {
            const exists =
              current.some(
                order =>
                  order.id ===
                  newOrder.id,
              )

            if (exists) {
              return current
            }

            return [
              newOrder,
              ...current,
            ]
          })

          setSelectedOrderId(
            newOrder.id,
          )

          setActiveTab('Orders')

          showOrderPopup(incoming)

          showBrowserNotification(
            incoming,
          )
        } catch (error) {
          console.error(
            '[Socket.IO] Legacy order processing error:',
            error,
          )
        }
      },
    )

    /* ---------------------------------------------------------------------- */
    /* CLEANUP                                                                */
    /* ---------------------------------------------------------------------- */

    return () => {
      console.log(
        '[Socket.IO] Cleaning admin socket',
      )

      socket.removeAllListeners(
        'connect',
      )

      socket.removeAllListeners(
        'disconnect',
      )

      socket.removeAllListeners(
        'connect_error',
      )

      socket.removeAllListeners(
        'order-notification',
      )

      socket.removeAllListeners(
        'new-order',
      )

      socket.disconnect()

      socketRef.current = null
    }
  }, [])

  /* ------------------------------------------------------------------------ */
  /* LOCAL STORAGE                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const stored =
      window.localStorage.getItem(
        'veranda_orders',
      )

    if (!stored) {
      return
    }

    try {
      const parsed =
        JSON.parse(stored)

      if (
        Array.isArray(parsed) &&
        parsed.length > 0
      ) {
        setOrders(
          parsed.map(
            (
              order: Record<
                string,
                unknown
              >,
            ) =>
              normalizeStoredOrder(
                order,
              ),
          ),
        )
      }
    } catch {
      // Ignore invalid localStorage.
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      window.localStorage.setItem(
        'veranda_orders',
        JSON.stringify(orders),
      )
    } catch {
      // Ignore storage errors.
    }
  }, [orders])

  /* ------------------------------------------------------------------------ */
  /* ORDER ACTIONS                                                            */
  /* ------------------------------------------------------------------------ */

  const advanceOrder = (id: string) => {
    setOrders(current =>
      current.map(order => {
        if (order.id !== id) {
          return order
        }

        const index =
          statusSequence.indexOf(
            order.status,
          )

        if (index === -1) {
          return order
        }

        return {
          ...order,
          status:
            statusSequence[
              Math.min(
                index + 1,
                statusSequence.length -
                  1,
              )
            ],
        }
      }),
    )
  }

  const rejectOrder = (id: string) =>
    updateOrder(id, {
      status: 'Cancelled',
    })

  const acceptOrder = (id: string) =>
    updateOrder(id, {
      status: 'Accepted',
    })

  const cancelOrder = (id: string) =>
    updateOrder(id, {
      status: 'Cancelled',
    })

  const markPaid = (id: string) =>
    updateOrder(id, {
      paymentStatus: 'Paid',
    })

  const updatePrepTime = (
    id: string,
    prepTime: string,
  ) =>
    updateOrder(id, {
      prepTime,
    })

  /* ------------------------------------------------------------------------ */
  /* MENU                                                                     */
  /* ------------------------------------------------------------------------ */

  const handleAddMenuItem = () => {
    if (
      !newItem.name ||
      !newItem.category ||
      newItem.price <= 0
    ) {
      return
    }

    setMenu(current => [
      ...current,
      {
        id:
          current.length + 1,
        name: newItem.name,
        category:
          newItem.category,
        price: newItem.price,
        status: 'Available',
        special: false,
      },
    ])

    setNewItem({
      name: '',
      category: '',
      price: 0,
    })
  }

  const toggleAvailability = (
    id: number,
  ) => {
    setMenu(current =>
      current.map(item =>
        item.id === id
          ? {
              ...item,
              status:
                item.status ===
                'Available'
                  ? 'Out of stock'
                  : 'Available',
            }
          : item,
      ),
    )
  }

  const removeMenuItem = (
    id: number,
  ) => {
    setMenu(current =>
      current.filter(
        item => item.id !== id,
      ),
    )
  }

  /* ------------------------------------------------------------------------ */
  /* TABLES                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleAddTable = () => {
    if (!newTable.trim()) {
      return
    }

    setTables(current => [
      ...current,
      {
        id: newTable.toUpperCase(),
        status: 'Available',
      },
    ])

    setNewTable(
      `T${tables.length + 16}`,
    )
  }

  const toggleTableStatus = (
    id: string,
  ) => {
    setTables(current =>
      current.map(table =>
        table.id === id
          ? {
              ...table,
              status:
                table.status ===
                'Available'
                  ? 'Occupied'
                  : 'Available',
            }
          : table,
      ),
    )
  }

  /* ------------------------------------------------------------------------ */
  /* MANUAL ORDER                                                             */
  /* ------------------------------------------------------------------------ */

  const addManualItem = () => {
    setManualLineItems(
      current => {
        const existing =
          current.find(
            entry =>
              entry.id ===
              manualDish,
          )

        if (existing) {
          return current.map(
            entry =>
              entry.id ===
              manualDish
                ? {
                    ...entry,
                    quantity:
                      entry.quantity +
                      manualQuantity,
                  }
                : entry,
          )
        }

        return [
          ...current,
          {
            id: manualDish,
            quantity:
              manualQuantity,
          },
        ]
      },
    )
  }

  const placeManualOrder = () => {
    const items =
      manualLineItems
        .map(entry => {
          const menuItem =
            menu.find(
              item =>
                item.id ===
                entry.id,
            )

          return `${
            menuItem?.name ??
            'Item'
          } ×${entry.quantity}`
        })
        .join(', ')

    if (
      !items ||
      !manualTable
    ) {
      return
    }

    const orderId = `ORD-${Math.floor(
      1000 +
        Math.random() *
          9000,
    )}`

    const lineItems =
      manualLineItems.map(
        entry => {
          const menuItem =
            menu.find(
              item =>
                item.id ===
                entry.id,
            )

          const unitPrice =
            menuItem?.price ??
            0

          return {
            id: entry.id,
            name:
              menuItem?.name ??
              'Item',
            quantity:
              entry.quantity,
            unitPrice,
            lineTotal:
              unitPrice *
              entry.quantity,
          }
        },
      )

    const subtotal =
      lineItems.reduce(
        (sum, item) =>
          sum +
          item.lineTotal,
        0,
      )

    const gst = Math.round(
      subtotal * 0.05,
    )

    const service =
      Math.round(
        subtotal * 0.06,
      )

    setOrders(current => [
      ...current,
      {
        id: orderId,
        customer:
          'Manual entry',
        type: 'Walk-in',
        table:
          manualTable,
        items,
        lineItems,
        status: 'Received',
        paymentMethod:
          'On-site',
        paymentStatus:
          'Pending',
        transactionId: `TXN-${Math.floor(
          1000 +
            Math.random() *
              9000,
        )}`,
        subtotal,
        gst,
        service,
        total:
          subtotal +
          gst +
          service,
        instructions:
          'Admin entry',
        prepTime: 'TBD',
      } as StoredOrder,
    ])

    setManualLineItems([])
  }

  const manualLineItemsWithDetails =
    useMemo(() => {
      return manualLineItems.map(
        entry => {
          const menuItem =
            menu.find(
              item =>
                item.id ===
                entry.id,
            )

          return {
            ...menuItem,
            ...entry,
            lineTotal:
              (menuItem?.price ??
                0) *
              entry.quantity,
          }
        },
      )
    }, [
      manualLineItems,
      menu,
    ])

  const billingSubtotal =
    useMemo(() => {
      const fromManual =
        manualLineItemsWithDetails.reduce(
          (sum, item) =>
            sum +
            item.lineTotal,
          0,
        )

      const fromCustom =
        customItems.reduce(
          (sum, item) =>
            sum +
            item.price *
              item.quantity,
          0,
        )

      return activeTab ===
        'Manual entry'
        ? fromManual
        : fromCustom
    }, [
      customItems,
      manualLineItemsWithDetails,
      activeTab,
    ])

  const billingGst =
    Math.round(
      billingSubtotal * 0.05,
    )

  const billingService =
    Math.round(
      billingSubtotal * 0.06,
    )

  const billingDiscount =
    Math.round(
      (discountPercent / 100) *
        billingSubtotal,
    )

  const billingTotal =
    billingSubtotal +
    billingGst +
    billingService -
    billingDiscount

  const tablesAvailable =
    tables.filter(
      table =>
        table.status ===
        'Available',
    ).length

  const tablesOccupied =
    tables.length -
    tablesAvailable

  /* ------------------------------------------------------------------------ */
  /* TAB CHANGE                                                               */
  /* ------------------------------------------------------------------------ */

  const handleTabChange = (
    tab: string,
  ) => {
    setActiveTab(tab)

    setMobileNavOpen(false)

    if (
      typeof window !==
      'undefined'
    ) {
      try {
        const url =
          new URL(
            window.location.href,
          )

        url.searchParams.set(
          'tab',
          tab,
        )

        window.history.pushState(
          {},
          '',
          url.toString(),
        )
      } catch {
        // Ignore history error.
      }

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  useEffect(() => {
    if (
      typeof window ===
      'undefined'
    ) {
      return
    }

    const params =
      new URLSearchParams(
        window.location.search,
      )

    const tabParam =
      params.get('tab')

    if (
      tabParam &&
      tabs.includes(tabParam)
    ) {
      setActiveTab(tabParam)
    }
  }, [])

  /* ------------------------------------------------------------------------ */
  /* RETURN                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="app-shell restaurant-page admin-shell">

      {/* ================================================================== */}
      {/* NEW ORDER NOTIFICATION POPUP                                      */}
      {/* ================================================================== */}

      {newOrderPopup.visible && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            width: 'min(420px, calc(100vw - 32px))',
            zIndex: 99999,
            background: '#ffffff',
            color: '#111827',
            borderRadius: '20px',
            padding: '20px',
            boxShadow:
              '0 25px 70px rgba(0,0,0,0.25)',
            border:
              '2px solid #c25a34',
            animation:
              'slideInNotification 0.35s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems:
                  'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius:
                    '50%',
                  background:
                    '#c25a34',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                  fontSize:
                    '1.4rem',
                }}
              >
                🔔
              </div>

              <div>
                <div
                  style={{
                    fontSize:
                      '0.75rem',
                    fontWeight: 800,
                    color:
                      '#c25a34',
                    textTransform:
                      'uppercase',
                    letterSpacing:
                      '0.05em',
                  }}
                >
                  New Order
                </div>

                <h3
                  style={{
                    margin:
                      '2px 0 0',
                    fontSize:
                      '1.25rem',
                    fontWeight: 900,
                  }}
                >
                  Order Received!
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setNewOrderPopup(
                  current => ({
                    ...current,
                    visible:
                      false,
                  }),
                )
              }
              style={{
                border: 'none',
                background:
                  'transparent',
                cursor:
                  'pointer',
                fontSize:
                  '1.2rem',
                color:
                  '#6b7280',
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              marginTop:
                '18px',
              display: 'grid',
              gap: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                gap: '12px',
              }}
            >
              <span
                style={{
                  color:
                    '#6b7280',
                }}
              >
                Order
              </span>

              <strong>
                {newOrderPopup.orderId}
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                gap: '12px',
              }}
            >
              <span
                style={{
                  color:
                    '#6b7280',
                }}
              >
                Customer
              </span>

              <strong>
                {
                  newOrderPopup.customerName
                }
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                gap: '12px',
              }}
            >
              <span
                style={{
                  color:
                    '#6b7280',
                }}
              >
                Table
              </span>

              <strong>
                {newOrderPopup.table}
              </strong>
            </div>

            <div
              style={{
                padding:
                  '12px',
                borderRadius:
                  '12px',
                background:
                  '#f9fafb',
              }}
            >
              <div
                style={{
                  fontSize:
                    '0.75rem',
                  color:
                    '#6b7280',
                  marginBottom:
                    '4px',
                }}
              >
                FOOD ORDERED
              </div>

              <strong
                style={{
                  lineHeight:
                    1.5,
                }}
              >
                {
                  newOrderPopup.foodNames
                }
              </strong>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                paddingTop:
                  '8px',
                borderTop:
                  '1px solid #e5e7eb',
              }}
            >
              <strong>
                Total
              </strong>

              <strong
                style={{
                  color:
                    '#c25a34',
                  fontSize:
                    '1.15rem',
                }}
              >
                ₹
                {
                  newOrderPopup.total
                }
              </strong>
            </div>
          </div>

          <button
            type="button"
            className="primary-button"
            style={{
              width: '100%',
              justifyContent:
                'center',
              marginTop:
                '16px',
            }}
            onClick={() => {
              setActiveTab('Orders')

              setNewOrderPopup(
                current => ({
                  ...current,
                  visible:
                    false,
                }),
              )
            }}
          >
            View Order
          </button>
        </div>
      )}

      {/* Notification animation */}
      <style jsx global>{`
        @keyframes slideInNotification {
          from {
            opacity: 0;
            transform: translateX(100px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <header className="site-header admin-header">

        <div className="brand-lockup">
          <div className="brand-mark">
            <Utensils size={20} />
          </div>

          <div>
            <div className="brand-name">
              VERANDA
            </div>

            <div className="brand-sub">
              Operations Dashboard
            </div>
          </div>
        </div>

        <button
          type="button"
          className="admin-nav-toggle"
          aria-expanded={
            mobileNavOpen
          }
          aria-controls="admin-tabs-nav"
          onClick={() =>
            setMobileNavOpen(
              open => !open,
            )
          }
        >
          {mobileNavOpen ? (
            <X size={18} />
          ) : (
            <MenuIcon
              size={18}
            />
          )}

          <span>
            {activeTab}
          </span>

          <ChevronDown
            size={16}
            className={`admin-nav-toggle-caret ${
              mobileNavOpen
                ? 'is-open'
                : ''
            }`}
          />
        </button>

        <nav
          id="admin-tabs-nav"
          className={`site-nav admin-nav admin-tabs-scroll ${
            mobileNavOpen
              ? 'is-open'
              : ''
          }`}
        >
          {tabs.map(tab => (
            <button
              key={tab}
              type="button"
              className={`tab-button ${
                activeTab ===
                tab
                  ? 'active-tab'
                  : ''
              }`}
              onClick={() =>
                handleTabChange(
                  tab,
                )
              }
            >
              {tab}
            </button>
          ))}
        </nav>

        <div
          style={{
            display: 'flex',
            alignItems:
              'center',
            gap: '8px',
            flexWrap:
              'wrap',
          }}
        >

          {/* Notification permission */}
          <button
            type="button"
            className="secondary-button"
            onClick={
              requestNotificationPermission
            }
            title={
              notificationPermission ===
              'granted'
                ? 'Browser notifications are enabled'
                : 'Enable browser notifications'
            }
          >
            {notificationPermission ===
            'granted'
              ? '🔔 Notifications On'
              : notificationPermission ===
                  'denied'
                ? '🔕 Notifications Blocked'
                : '🔔 Enable Notifications'}
          </button>

          {/* Socket status */}
          <span
            style={{
              fontSize:
                '0.75rem',
              fontWeight: 700,
              padding:
                '6px 10px',
              borderRadius:
                '999px',
              background:
                socketConnected
                  ? 'rgba(34,197,94,0.12)'
                  : 'rgba(156,163,175,0.12)',
              color:
                socketConnected
                  ? '#166534'
                  : '#6b7280',
              whiteSpace:
                'nowrap',
            }}
          >
            {socketConnected
              ? '● Live'
              : '○ Offline'}
          </span>

          <a
            href="/"
            className="secondary-button"
          >
            Return home
          </a>
        </div>
      </header>

      <main>

        {/* ================================================================= */}
        {/* ORDERS HERO                                                       */}
        {/* ================================================================= */}

        {activeTab ===
          'Orders' && (
          <>
            <section className="hero admin-hero">

              <div className="hero-copy">
                <span className="eyebrow">
                  Restaurant operations
                </span>

                <h1>
                  Manage live orders,
                  kitchen flow,
                  tables, and
                  billing from one
                  place.
                </h1>

                <p>
                  Accept new orders,
                  update prep time,
                  generate invoices,
                  and track
                  restaurant
                  performance with a
                  single dashboard.
                </p>

                <div className="hero-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      handleTabChange(
                        'Billing',
                      )
                    }
                  >
                    Go to billing
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      handleTabChange(
                        'Reports',
                      )
                    }
                  >
                    See reports
                  </button>
                </div>
              </div>

              <div className="hero-media admin-hero-media">
                <img
                  src="/images/table-setting.png"
                  alt="Admin operations"
                />
              </div>

            </section>

            <section
              className="menu-section admin-stats"
              id="orders"
            >
              <div className="admin-metrics-grid">

                <MetricCard
                  icon={ShoppingBag}
                  label="Total orders"
                  value={`${metricValues.total}`}
                />

                <MetricCard
                  icon={Bell}
                  label="Pending"
                  value={`${metricValues.pending}`}
                />

                <MetricCard
                  icon={LayoutDashboard}
                  label="Completed"
                  value={`${metricValues.completed}`}
                />

                <MetricCard
                  icon={CreditCard}
                  label="Revenue"
                  value={`₹${metricValues.revenue}`}
                />

              </div>
            </section>
          </>
        )}

        {/* ================================================================= */}
        {/* ORDERS                                                            */}
        {/* ================================================================= */}

        {activeTab ===
          'Orders' && (
          <section className="menu-section">

            <div className="menu-header">
              <div>
                <span className="eyebrow">
                  Live orders
                </span>

                <h2>
                  Orders waiting for
                  kitchen or billing
                  action.
                </h2>
              </div>
            </div>

            <div className="filter-row">

              <div className="category-tabs">
                {orderStatuses.map(
                  status => (
                    <button
                      key={status}
                      className={
                        statusFilter ===
                        status
                          ? 'active'
                          : ''
                      }
                      onClick={() =>
                        setStatusFilter(
                          status,
                        )
                      }
                    >
                      {status}
                    </button>
                  ),
                )}
              </div>

              <div className="category-tabs">
                {customerTypes.map(
                  type => (
                    <button
                      key={type}
                      className={
                        customerTypeFilter ===
                        type
                          ? 'active'
                          : ''
                      }
                      onClick={() =>
                        setCustomerTypeFilter(
                          type,
                        )
                      }
                    >
                      {type}
                    </button>
                  ),
                )}
              </div>

            </div>

            <div className="order-management-grid">

              <div className="order-list-panel">

                {filteredOrders.map(
                  order => (
                    <article
                      key={order.id}
                      className={`menu-card order-row ${
                        selectedOrderId ===
                        order.id
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() =>
                        setSelectedOrderId(
                          order.id,
                        )
                      }
                    >
                      <div className="menu-card-body">

                        <div className="menu-card-top">

                          <div>
                            <h3>
                              {order.id}
                            </h3>

                            <span>
                              {order.table}{' '}
                              ·{' '}
                              {order.customer}
                            </span>
                          </div>

                          <strong>
                            {order.status}
                          </strong>

                        </div>

                        <p>
                          {order.items}
                        </p>

                        <div className="menu-card-meta">
                          <span>
                            {order.type}
                          </span>

                          <span>
                            {order.paymentStatus}
                          </span>
                        </div>

                        <div className="order-footer">

                          <span>
                            Instructions:{' '}
                            {order.instructions}
                          </span>

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={e => {
                              e.stopPropagation()

                              advanceOrder(
                                order.id,
                              )
                            }}
                          >
                            Next status
                          </button>

                        </div>

                      </div>
                    </article>
                  ),
                )}

              </div>

              <div className="order-detail-panel">

                {selectedOrder && (
                  <div className="feature-card order-detail-card">

                    <div className="menu-card-body">

                      <div className="menu-card-top">

                        <div>
                          <h3>
                            {
                              selectedOrder.id
                            }
                          </h3>

                          <span>
                            {
                              selectedOrder.customer
                            }{' '}
                            ·{' '}
                            {
                              selectedOrder.table
                            }
                          </span>
                        </div>

                        <span
                          className={`status-pill ${selectedOrder.status
                            .toLowerCase()
                            .replace(
                              / /g,
                              '-',
                            )}`}
                        >
                          {
                            selectedOrder.status
                          }
                        </span>

                      </div>

                      <p>
                        {
                          selectedOrder.items
                        }
                      </p>

                      <div className="menu-card-meta">
                        <span>
                          {
                            selectedOrder.type
                          }
                        </span>

                        <span>
                          {
                            selectedOrder.paymentMethod
                          }
                        </span>
                      </div>

                      <div className="billing-summary">

                        <div>
                          <span>
                            Subtotal
                          </span>

                          <strong>
                            ₹
                            {
                              selectedOrder.subtotal
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            GST
                          </span>

                          <strong>
                            ₹
                            {
                              selectedOrder.gst
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Service
                          </span>

                          <strong>
                            ₹
                            {
                              selectedOrder.service
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            Total
                          </span>

                          <strong>
                            ₹
                            {
                              selectedOrder.total
                            }
                          </strong>
                        </div>

                      </div>

                      <div className="menu-card-meta">

                        <span>
                          Transaction ID:{' '}
                          {
                            selectedOrder.transactionId
                          }
                        </span>

                        <span>
                          Payment:{' '}
                          {
                            selectedOrder.paymentStatus
                          }
                        </span>

                      </div>

                      <label>
                        <span>
                          Prep time
                        </span>

                        <input
                          type="text"
                          defaultValue={
                            selectedOrder.prepTime
                          }
                          onBlur={e =>
                            updatePrepTime(
                              selectedOrder.id,
                              e.target.value,
                            )
                          }
                        />
                      </label>

                      <div className="order-actions">

                        <button
                          type="button"
                          className="primary-button"
                          onClick={() =>
                            acceptOrder(
                              selectedOrder.id,
                            )
                          }
                        >
                          Accept
                        </button>

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            advanceOrder(
                              selectedOrder.id,
                            )
                          }
                        >
                          Advance
                        </button>

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            markPaid(
                              selectedOrder.id,
                            )
                          }
                        >
                          {selectedOrder.paymentStatus ===
                          'Paid'
                            ? 'Paid'
                            : 'Mark paid'}
                        </button>

                        <button
                          type="button"
                          className="secondary-button danger-button"
                          onClick={() =>
                            cancelOrder(
                              selectedOrder.id,
                            )
                          }
                        >
                          Cancel
                        </button>

                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>
          </section>
        )}

        {/* ================================================================= */}
        {/* KITCHEN                                                           */}
        {/* ================================================================= */}

        {activeTab ===
          'Kitchen' && (
          <section className="menu-section">

            <div className="menu-header">
              <div>
                <span className="eyebrow">
                  Kitchen queue
                </span>

                <h2>
                  Orders that the
                  kitchen is currently
                  preparing.
                </h2>
              </div>
            </div>

            <div className="order-management-grid">

              {orders
                .filter(
                  order =>
                    order.status !==
                      'Completed' &&
                    order.status !==
                      'Cancelled',
                )
                .map(order => (
                  <article
                    key={order.id}
                    className="menu-card kitchen-card"
                  >
                    <div className="menu-card-body">

                      <div className="menu-card-top">

                        <div>
                          <h3>
                            {order.id}
                          </h3>

                          <span>
                            {order.table}
                          </span>
                        </div>

                        <strong>
                          {order.status}
                        </strong>

                      </div>

                      <p>
                        {order.items}
                      </p>

                      <div className="menu-card-meta">

                        <span>
                          {
                            order.paymentMethod
                          }
                        </span>

                        <span>
                          {order.prepTime}
                        </span>

                      </div>

                      <div className="order-footer">

                        <span>
                          {
                            order.instructions
                          }
                        </span>

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            advanceOrder(
                              order.id,
                            )
                          }
                        >
                          Update
                        </button>

                      </div>

                    </div>
                  </article>
                ))}

            </div>

          </section>
        )}

        {/* ================================================================= */}
        {/* MENU                                                               */}
        {/* ================================================================= */}

        {activeTab ===
          'Menu' && (
          <section className="menu-section">

            <div className="menu-header">
              <div>
                <span className="eyebrow">
                  Menu management
                </span>

                <h2>
                  Add, update, or
                  remove dishes.
                </h2>
              </div>
            </div>

            <div className="admin-panel">

              <div className="menu-list-panel">

                {menu.map(item => (
                  <article
                    key={item.id}
                    className="menu-card admin-menu-card"
                  >
                    <div className="menu-card-body">

                      <div className="menu-card-top">

                        <div>
                          <h3>
                            {item.name}
                          </h3>

                          <span>
                            {item.category}
                          </span>
                        </div>

                        <strong>
                          ₹{item.price}
                        </strong>

                      </div>

                      <div className="menu-card-meta">

                        <span>
                          {item.status}
                        </span>

                        {item.special && (
                          <span>
                            Special
                          </span>
                        )}

                      </div>

                      <div className="order-actions">

                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            toggleAvailability(
                              item.id,
                            )
                          }
                        >
                          {item.status ===
                          'Available'
                            ? 'Mark unavailable'
                            : 'Mark available'}
                        </button>

                        <button
                          type="button"
                          className="secondary-button danger-button"
                          onClick={() =>
                            removeMenuItem(
                              item.id,
                            )
                          }
                        >
                          Remove
                        </button>

                      </div>

                    </div>
                  </article>
                ))}

              </div>

              <div className="admin-form-panel">

                <div className="feature-card">

                  <div className="feature-icon">
                    <Plus size={18} />
                  </div>

                  <div>
                    <span>
                      Add a new menu item
                    </span>

                    <strong>
                      New dish
                    </strong>
                  </div>

                </div>

                <label>
                  <span>
                    Name
                  </span>

                  <input
                    value={
                      newItem.name
                    }
                    onChange={e =>
                      setNewItem({
                        ...newItem,
                        name: e.target
                          .value,
                      })
                    }
                    placeholder="Dish name"
                  />
                </label>

                <label>
                  <span>
                    Category
                  </span>

                  <input
                    value={
                      newItem.category
                    }
                    onChange={e =>
                      setNewItem({
                        ...newItem,
                        category:
                          e.target.value,
                      })
                    }
                    placeholder="Category"
                  />
                </label>

                <label>
                  <span>
                    Price
                  </span>

                  <input
                    type="number"
                    value={
                      newItem.price
                    }
                    onChange={e =>
                      setNewItem({
                        ...newItem,
                        price: Number(
                          e.target.value,
                        ),
                      })
                    }
                    placeholder="Price"
                  />
                </label>

                <button
                  type="button"
                  className="primary-button"
                  onClick={
                    handleAddMenuItem
                  }
                >
                  Add dish
                </button>

              </div>

            </div>

          </section>
        )}

        {/* ================================================================= */}
        {/* TABLES                                                            */}
        {/* ================================================================= */}

        {activeTab ===
          'Tables' && (
          <section className="menu-section">

            <div className="menu-header">
              <div>
                <span className="eyebrow">
                  Table management
                </span>

                <h2>
                  Track available and
                  occupied tables.
                </h2>
              </div>
            </div>

            <div className="table-grid">

              {tables.map(table => (
                <div
                  key={table.id}
                  className="table-card"
                >

                  <div>
                    <strong>
                      {table.id}
                    </strong>

                    <span>
                      {table.status}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      toggleTableStatus(
                        table.id,
                      )
                    }
                  >
                    {table.status ===
                    'Available'
                      ? 'Occupy'
                      : 'Free'}
                  </button>

                </div>
              ))}

            </div>

            <div className="admin-form-panel">

              <label>
                <span>
                  New table ID
                </span>

                <input
                  value={newTable}
                  onChange={e =>
                    setNewTable(
                      e.target.value,
                    )
                  }
                />
              </label>

              <button
                type="button"
                className="primary-button"
                onClick={
                  handleAddTable
                }
              >
                Add table
              </button>

            </div>

          </section>
        )}

        {/* ================================================================= */}
        {/* MANUAL ENTRY                                                      */}
        {/* ================================================================= */}

        {activeTab ===
          'Manual entry' && (
          <section className="menu-section">

            <div className="menu-header">
              <div>
                <span className="eyebrow">
                  Manual order entry
                </span>

                <h2>
                  Place orders on
                  behalf of guests.
                </h2>
              </div>
            </div>

            <div className="admin-panel">

              <div className="admin-form-panel">

                <label>
                  <span>
                    Table
                  </span>

                  <select
                    value={
                      manualTable
                    }
                    onChange={e =>
                      setManualTable(
                        e.target.value,
                      )
                    }
                  >
                    {tables.map(
                      table => (
                        <option
                          key={
                            table.id
                          }
                          value={
                            table.id
                          }
                        >
                          {table.id}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  <span>
                    Dish
                  </span>

                  <select
                    value={
                      manualDish
                    }
                    onChange={e =>
                      setManualDish(
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                  >
                    {menu.map(
                      item => (
                        <option
                          key={
                            item.id
                          }
                          value={
                            item.id
                          }
                        >
                          {item.name}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  <span>
                    Quantity
                  </span>

                  <input
                    type="number"
                    min={1}
                    value={
                      manualQuantity
                    }
                    onChange={e =>
                      setManualQuantity(
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                  />
                </label>

                <button
                  type="button"
                  className="primary-button"
                  onClick={
                    addManualItem
                  }
                >
                  Add item
                </button>

              </div>

              <div className="menu-list-panel">

                <div className="feature-card">

                  <div className="feature-icon">
                    <ShoppingBag
                      size={18}
                    />
                  </div>

                  <div>
                    <span>
                      Line items
                    </span>

                    <strong>
                      {
                        manualLineItems.length
                      }{' '}
                      items
                    </strong>
                  </div>

                </div>

                {manualLineItems.map(
                  entry => {
                    const menuItem =
                      menu.find(
                        item =>
                          item.id ===
                          entry.id,
                      )

                    return (
                      <div
                        key={
                          entry.id
                        }
                        className="cart-row"
                      >
                        <span>
                          {
                            menuItem?.name
                          }
                        </span>

                        <span>
                          Qty{' '}
                          {
                            entry.quantity
                          }
                        </span>
                      </div>
                    )
                  },
                )}

                <button
                  type="button"
                  className="primary-button"
                  onClick={
                    placeManualOrder
                  }
                >
                  Create order
                </button>

              </div>

            </div>

          </section>
        )}

        {/* ================================================================= */}
        {/* BILLING                                                           */}
        {/* ================================================================= */}

        {activeTab ===
          'Billing' && (
          <section className="menu-section">

            <div className="menu-header">
              <div>

                <span className="eyebrow">
                  Table-Wise POS &
                  Billing Settlement
                </span>

                <h2>
                  Auto-Generated Table
                  Invoices & Payment
                  Status
                </h2>

                <p className="section-note">
                  Select a table to
                  collect its live
                  orders, edit/add
                  line items, check
                  payment status, and
                  print receipts.
                </p>

              </div>
            </div>

            <div
              style={{
                marginBottom:
                  '24px',
              }}
            >
              <span
                style={{
                  fontSize:
                    '0.95rem',
                  fontWeight: 700,
                  display:
                    'block',
                  marginBottom:
                    '10px',
                }}
              >
                Select Active
                Table:
              </span>

              <div
                className="category-tabs admin-tabs-scroll"
                style={{
                  padding:
                    '8px 0',
                }}
              >
                {tables.map(
                  tbl => {
                    const tableOrders =
                      orders.filter(
                        o =>
                          o.table ===
                          tbl.id,
                      )

                    const isPaid =
                      tableOrders.length >
                        0 &&
                      tableOrders.every(
                        o =>
                          o.paymentStatus ===
                          'Paid',
                      )

                    const hasOrders =
                      tableOrders.length >
                      0

                    const isSelected =
                      manualTable ===
                      tbl.id

                    return (
                      <button
                        key={
                          tbl.id
                        }
                        className={
                          isSelected
                            ? 'active'
                            : ''
                        }
                        onClick={() => {
                          setManualTable(
                            tbl.id,
                          )

                          if (
                            hasOrders
                          ) {
                            const parsed =
                              tableOrders.flatMap(
                                order =>
                                  (
                                    order.lineItems ??
                                    []
                                  ).map(
                                    item => ({
                                      description:
                                        item.name,
                                      price:
                                        item.unitPrice,
                                      quantity:
                                        item.quantity,
                                    }),
                                  ),
                              )

                            setCustomItems(
                              parsed,
                            )
                          } else {
                            setCustomItems(
                              [],
                            )
                          }
                        }}
                      >
                        <span>
                          {tbl.id}
                        </span>

                        <span>
                          {hasOrders
                            ? isPaid
                              ? '✓ Paid'
                              : '⚠ Unpaid'
                            : 'Empty'}
                        </span>
                      </button>
                    )
                  },
                )}
              </div>
            </div>

            <div
              className="admin-panel"
              style={{
                display:
                  'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
              }}
            >

              <div
                className="admin-form-panel"
                style={{
                  background:
                    'var(--card)',
                  borderRadius:
                    '24px',
                  padding:
                    '24px',
                  border:
                    '1px solid var(--border)',
                }}
              >

                <h3>
                  Table{' '}
                  {manualTable}{' '}
                  Bill Controls
                </h3>

                <div
                  style={{
                    display:
                      'flex',
                    gap: '8px',
                    marginBottom:
                      '16px',
                  }}
                >

                  <select
                    style={{
                      flex: 1,
                    }}
                    value={
                      manualDish
                    }
                    onChange={e =>
                      setManualDish(
                        Number(
                          e.target.value,
                        ),
                      )
                    }
                  >
                    {menu.map(
                      item => (
                        <option
                          key={
                            item.id
                          }
                          value={
                            item.id
                          }
                        >
                          {
                            item.name
                          }{' '}
                          (₹
                          {
                            item.price
                          })
                        </option>
                      ),
                    )}
                  </select>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => {
                      const menuItem =
                        menu.find(
                          item =>
                            item.id ===
                            manualDish,
                        )

                      if (
                        menuItem
                      ) {
                        setCustomItems(
                          current => {
                            const existing =
                              current.find(
                                row =>
                                  row.description ===
                                  menuItem.name,
                              )

                            if (
                              existing
                            ) {
                              return current.map(
                                row =>
                                  row.description ===
                                  menuItem.name
                                    ? {
                                        ...row,
                                        quantity:
                                          row.quantity +
                                          1,
                                      }
                                    : row,
                              )
                            }

                            return [
                              ...current,
                              {
                                description:
                                  menuItem.name,
                                price:
                                  menuItem.price,
                                quantity: 1,
                              },
                            ]
                          },
                        )
                      }
                    }}
                  >
                    Add Dish
                  </button>

                </div>

                {customItems.map(
                  (
                    item,
                    index,
                  ) => (
                    <div
                      key={
                        index
                      }
                      style={{
                        display:
                          'grid',
                        gridTemplateColumns:
                          '2fr 1fr 1fr auto',
                        gap: '8px',
                        marginBottom:
                          '8px',
                      }}
                    >

                      <input
                        value={
                          item.description
                        }
                        onChange={e =>
                          setCustomItems(
                            current =>
                              current.map(
                                (
                                  row,
                                  idx,
                                ) =>
                                  idx ===
                                  index
                                    ? {
                                        ...row,
                                        description:
                                          e.target.value,
                                      }
                                    : row,
                              ),
                          )
                        }
                      />

                      <input
                        type="number"
                        min={1}
                        value={
                          item.quantity
                        }
                        onChange={e =>
                          setCustomItems(
                            current =>
                              current.map(
                                (
                                  row,
                                  idx,
                                ) =>
                                  idx ===
                                  index
                                    ? {
                                        ...row,
                                        quantity:
                                          Number(
                                            e.target.value,
                                          ),
                                      }
                                    : row,
                              ),
                          )
                        }
                      />

                      <input
                        type="number"
                        min={0}
                        value={
                          item.price
                        }
                        onChange={e =>
                          setCustomItems(
                            current =>
                              current.map(
                                (
                                  row,
                                  idx,
                                ) =>
                                  idx ===
                                  index
                                    ? {
                                        ...row,
                                        price:
                                          Number(
                                            e.target.value,
                                          ),
                                      }
                                    : row,
                              ),
                          )
                        }
                      />

                      <button
                        type="button"
                        className="secondary-button danger-button"
                        onClick={() =>
                          setCustomItems(
                            current =>
                              current.filter(
                                (
                                  _,
                                  idx,
                                ) =>
                                  idx !==
                                  index,
                              ),
                          )
                        }
                      >
                        ✕
                      </button>

                    </div>
                  ),
                )}

                <div
                  style={{
                    marginTop:
                      '16px',
                  }}
                >
                  <label>
                    Discount (%)

                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={
                        discountPercent
                      }
                      onChange={e =>
                        setDiscountPercent(
                          Number(
                            e.target
                              .value,
                          ),
                        )
                      }
                    />
                  </label>
                </div>

              </div>

              <div
                className="menu-list-panel billing-summary-panel printable-receipt"
                style={{
                  background:
                    '#ffffff',
                  color:
                    '#111827',
                  borderRadius:
                    '28px',
                  padding:
                    '28px',
                }}
              >

                <div
                  style={{
                    textAlign:
                      'center',
                    borderBottom:
                      '2px dashed #d1d5db',
                    paddingBottom:
                      '16px',
                  }}
                >
                  <div
                    style={{
                      display:
                        'inline-block',
                      background:
                        '#c25a34',
                      color:
                        '#ffffff',
                      width:
                        '36px',
                      height:
                        '36px',
                      borderRadius:
                        '50%',
                      lineHeight:
                        '36px',
                      fontWeight:
                        'bold',
                    }}
                  >
                    V
                  </div>

                  <h2>
                    VERANDA
                    KITCHEN &
                    BAR
                  </h2>

                  <p>
                    OFFICIAL
                    INVOICE FOR
                    TABLE{' '}
                    {manualTable}
                  </p>
                </div>

                <div
                  style={{
                    margin:
                      '20px 0',
                  }}
                >
                  {customItems.length ===
                  0 ? (
                    <p
                      style={{
                        textAlign:
                          'center',
                        color:
                          '#9ca3af',
                      }}
                    >
                      No items on
                      invoice.
                    </p>
                  ) : (
                    customItems.map(
                      (
                        item,
                        idx,
                      ) => (
                        <div
                          key={
                            idx
                          }
                          style={{
                            display:
                              'flex',
                            justifyContent:
                              'space-between',
                            padding:
                              '8px 0',
                          }}
                        >
                          <span>
                            {
                              item.description
                            }
                          </span>

                          <span>
                            {
                              item.quantity
                            }{' '}
                            × ₹
                            {
                              item.price
                            }
                          </span>

                          <strong>
                            ₹
                            {item.price *
                              item.quantity}
                          </strong>
                        </div>
                      ),
                    )
                  )}
                </div>

                <div
                  style={{
                    borderTop:
                      '2px dashed #e5e7eb',
                    paddingTop:
                      '12px',
                  }}
                >

                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                    }}
                  >
                    <span>
                      Subtotal
                    </span>

                    <span>
                      ₹
                      {
                        billingSubtotal
                      }
                    </span>
                  </div>

                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                    }}
                  >
                    <span>
                      GST (5%)
                    </span>

                    <span>
                      ₹
                      {
                        billingGst
                      }
                    </span>
                  </div>

                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                    }}
                  >
                    <span>
                      Service (6%)
                    </span>

                    <span>
                      ₹
                      {
                        billingService
                      }
                    </span>
                  </div>

                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      fontSize:
                        '1.2rem',
                      fontWeight:
                        900,
                      marginTop:
                        '10px',
                    }}
                  >
                    <span>
                      Grand Total
                    </span>

                    <span
                      style={{
                        color:
                          '#c25a34',
                      }}
                    >
                      ₹
                      {
                        billingTotal
                      }
                    </span>
                  </div>

                </div>

                <button
                  type="button"
                  className="primary-button"
                  style={{
                    width:
                      '100%',
                    justifyContent:
                      'center',
                    marginTop:
                      '24px',
                  }}
                  onClick={() =>
                    window.print()
                  }
                >
                  🖨 Print POS Thermal
                  Receipt
                </button>

              </div>

            </div>

          </section>
        )}

        {/* ================================================================= */}
        {/* REPORTS                                                           */}
        {/* ================================================================= */}

        {activeTab ===
          'Reports' && (
          <section className="menu-section">

            <div className="menu-header">
              <div>
                <span className="eyebrow">
                  Reports
                </span>

                <h2>
                  Sales, payments,
                  and billing
                  performance.
                </h2>
              </div>
            </div>

            <div className="report-grid">

              <MetricCard
                icon={BarChart3}
                label="Daily revenue"
                value={`₹${metricValues.revenue}`}
              />

              <MetricCard
                icon={CreditCard}
                label="Payments collected"
                value={`₹${paymentSummary.paidTotal}`}
              />

              <MetricCard
                icon={Bell}
                label="Pending payments"
                value={`₹${paymentSummary.pendingTotal}`}
              />

              <MetricCard
                icon={Table2}
                label="Online order count"
                value={`${paymentSummary.onlineCount}`}
              />

              <MetricCard
                icon={PieChart}
                label="Popular dishes"
                value={popularDishes.join(
                  ', ',
                )}
              />

            </div>

          </section>
        )}

        {/* ================================================================= */}
        {/* FEEDBACK                                                          */}
        {/* ================================================================= */}

        {activeTab ===
          'Feedback' && (
          <section className="menu-section">

            <div className="menu-header">

              <div>

                <span className="eyebrow">
                  Customer feedback
                </span>

                <h2>
                  Guest ratings,
                  table experience,
                  and payment ease.
                </h2>

              </div>

            </div>

            <div className="feature-grid">

              {feedback.map(
                entry => (
                  <div
                    key={
                      entry.id
                    }
                    className="feedback-card"
                  >

                    <div className="feature-icon">
                      <MessageSquare
                        size={18}
                      />
                    </div>

                    <strong>
                      {
                        entry.guest
                      }
                    </strong>

                    <span>
                      Rating:{' '}
                      {
                        entry.rating
                      }
                      /5
                    </span>

                    <p>
                      {
                        entry.comment
                      }
                    </p>

                  </div>
                ),
              )}

            </div>

          </section>
        )}

      </main>
    </div>
  )
}
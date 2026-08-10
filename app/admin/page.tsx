'use client'

import { useMemo, useState, useEffect } from 'react'
import { ArrowRight, BarChart3, Bell, ChevronDown, CreditCard, LayoutDashboard, Menu as MenuIcon, MessageSquare, PieChart, Plus, RefreshCcw, ShoppingBag, Table2, Truck, Utensils, X } from 'lucide-react'

const initialMenu = [
  { id: 1, name: 'Smoked Paneer Tikka', category: 'Starters', price: 320, status: 'Available', special: true },
  { id: 2, name: 'Saffron Garden Biryani', category: 'Rice & Biryani', price: 460, status: 'Available', special: true },
  { id: 3, name: 'Rose Cardamom Gulab Jamun', category: 'Desserts', price: 180, status: 'Available', special: false },
  { id: 4, name: 'Wood-fired Margherita Pizza', category: 'Pizza', price: 390, status: 'Available', special: false },
  { id: 5, name: 'Crispy Paneer Burger', category: 'Burgers', price: 340, status: 'Available', special: false },
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
  { id: 1, guest: 'Aarav', rating: 5, comment: 'Lovely service and spot-on spice levels.' },
  { id: 2, guest: 'Nisha', rating: 4, comment: 'Great menu items, would love faster refill on drinks.' },
]

const statusSequence = ['Received', 'Accepted', 'Preparing', 'Ready to serve', 'Served', 'Completed']
const orderStatuses = ['All', ...statusSequence, 'Cancelled']
const customerTypes = ['All', 'Reservation', 'Walk-in', 'Repeat']
const tabs = ['Orders', 'Kitchen', 'Menu', 'Tables', 'Manual entry', 'Billing', 'Reports', 'Feedback']

function MetricCard({ icon: Icon, label, value }: { icon: typeof LayoutDashboard; label: string; value: string }) {
  return (
    <div className="feature-card">
      <div className="feature-icon"><Icon size={18} /></div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Orders')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [orders, setOrders] = useState(initialOrders)
  const [menu, setMenu] = useState(initialMenu)
  const [tables, setTables] = useState(initialTables)
  const [feedback, setFeedback] = useState(initialFeedback)
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrders[0].id)
  const [statusFilter, setStatusFilter] = useState('All')
  const [customerTypeFilter, setCustomerTypeFilter] = useState('All')
  const [newItem, setNewItem] = useState({ name: '', category: '', price: 0 })
  const [newTable, setNewTable] = useState('T16')
  const [manualTable, setManualTable] = useState('T01')
  const [manualDish, setManualDish] = useState(menu[0].id)
  const [manualQuantity, setManualQuantity] = useState(1)
  const [manualLineItems, setManualLineItems] = useState<{ id: number; quantity: number }[]>([])
  const [customItems, setCustomItems] = useState<{ description: string; price: number; quantity: number }[]>([])
  const [discountPercent, setDiscountPercent] = useState(0)

  const filteredOrders = useMemo(
    () => orders.filter(order =>
      (statusFilter === 'All' || order.status === statusFilter) &&
      (customerTypeFilter === 'All' || order.type === customerTypeFilter),
    ),
    [statusFilter, customerTypeFilter, orders],
  )

  const selectedOrder = orders.find(order => order.id === selectedOrderId) || orders[0]

  const metricValues = useMemo(() => {
    const total = orders.length
    const pending = orders.filter(order => order.status !== 'Completed').length
    const completed = orders.filter(order => order.status === 'Completed').length
    const revenue = orders.reduce((sum, order) => sum + order.total, 0)
    return { total, pending, completed, revenue }
  }, [orders])

  const paymentSummary = useMemo(() => {
    const paidOrders = orders.filter(order => order.paymentStatus === 'Paid')
    const pendingOrders = orders.filter(order => order.paymentStatus !== 'Paid')
    const onlineOrders = orders.filter(order => ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'].includes(order.paymentMethod))
    return {
      paidTotal: paidOrders.reduce((sum, order) => sum + order.total, 0),
      pendingTotal: pendingOrders.reduce((sum, order) => sum + order.total, 0),
      paidCount: paidOrders.length,
      pendingCount: pendingOrders.length,
      onlineCount: onlineOrders.length,
    }
  }, [orders])

  const popularDishes = useMemo(() => {
    const counts: Record<string, number> = {}
    orders.forEach(order => {
      order.items.split(',').forEach(item => {
        const name = item.trim().replace(/×\d+$/, '').trim()
        counts[name] = (counts[name] || 0) + 1
      })
    })
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => `${name} (${count})`)
  }, [orders])

  const updateOrder = (id: string, patch: Partial<typeof initialOrders[number]>) => {
    setOrders(current => current.map(order => order.id === id ? { ...order, ...patch } : order))
  }

  // Load orders from localStorage (if admin reloads or another tab updated them)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('veranda_orders')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed)
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }, [])

  // Persist orders to localStorage so customer pages can read status updates
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem('veranda_orders', JSON.stringify(orders))
    } catch (e) {
      // ignore storage errors
    }
  }, [orders])

  const advanceOrder = (id: string) => {
    setOrders(current => current.map(order => {
      if (order.id !== id) return order
      const index = statusSequence.indexOf(order.status)
      if (index === -1) return order
      return { ...order, status: statusSequence[Math.min(index + 1, statusSequence.length - 1)] }
    }))
  }

  const rejectOrder = (id: string) => updateOrder(id, { status: 'Cancelled' })
  const acceptOrder = (id: string) => updateOrder(id, { status: 'Accepted' })
  const cancelOrder = (id: string) => updateOrder(id, { status: 'Cancelled' })
  const markPaid = (id: string) => updateOrder(id, { paymentStatus: 'Paid' })
  const updatePrepTime = (id: string, prepTime: string) => updateOrder(id, { prepTime })

  const handleAddMenuItem = () => {
    if (!newItem.name || !newItem.category || newItem.price <= 0) return
    setMenu(current => [...current, { id: current.length + 1, name: newItem.name, category: newItem.category, price: newItem.price, status: 'Available', special: false }])
    setNewItem({ name: '', category: '', price: 0 })
  }

  const toggleAvailability = (id: number) => {
    setMenu(current => current.map(item => item.id === id ? { ...item, status: item.status === 'Available' ? 'Out of stock' : 'Available' } : item))
  }

  const removeMenuItem = (id: number) => {
    setMenu(current => current.filter(item => item.id !== id))
  }

  const handleAddTable = () => {
    if (!newTable.trim()) return
    setTables(current => [...current, { id: newTable.toUpperCase(), status: 'Available' }])
    setNewTable(`T${tables.length + 16}`)
  }

  const toggleTableStatus = (id: string) => {
    setTables(current => current.map(table => table.id === id ? { ...table, status: table.status === 'Available' ? 'Occupied' : 'Available' } : table))
  }

  const addManualItem = () => {
    setManualLineItems(current => {
      const existing = current.find(entry => entry.id === manualDish)
      if (existing) {
        return current.map(entry => entry.id === manualDish ? { ...entry, quantity: entry.quantity + manualQuantity } : entry)
      }
      return [...current, { id: manualDish, quantity: manualQuantity }]
    })
  }

  const placeManualOrder = () => {
    const items = manualLineItems.map(entry => {
      const menuItem = menu.find(item => item.id === entry.id)
      return `${menuItem?.name ?? 'Item'} ×${entry.quantity}`
    }).join(', ')
    if (!items || !manualTable) return
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`
    setOrders(current => [
      ...current,
      {
        id: orderId,
        customer: 'Manual entry',
        type: 'Walk-in',
        table: manualTable,
        items,
        status: 'Received',
        paymentMethod: 'On-site',
        paymentStatus: 'Pending',
        transactionId: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        subtotal: 0,
        gst: 0,
        service: 0,
        total: 0,
        instructions: 'Admin entry',
        prepTime: 'TBD',
      },
    ])
    setManualLineItems([])
  }

  const billingSubtotal = customItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const billingGst = Math.round(billingSubtotal * 0.05)
  const billingService = Math.round(billingSubtotal * 0.06)
  const billingDiscount = Math.round((discountPercent / 100) * billingSubtotal)
  const billingTotal = billingSubtotal + billingGst + billingService - billingDiscount

  const tablesAvailable = tables.filter(table => table.status === 'Available').length
  const tablesOccupied = tables.length - tablesAvailable

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setMobileNavOpen(false)
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href)
        url.searchParams.set('tab', tab)
        window.history.pushState({}, '', url.toString())
      } catch (e) {
        // ignore history error
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Load active tab from URL search query if provided
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    if (tabParam && tabs.includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [])

  return (
    <div className="app-shell restaurant-page admin-shell">
      <header className="site-header admin-header">
        <div className="brand-lockup">
          <div className="brand-mark"><Utensils size={20} /></div>
          <div>
            <div className="brand-name">VERANDA</div>
            <div className="brand-sub">Operations Dashboard</div>
          </div>
        </div>
        <button
          type="button"
          className="admin-nav-toggle"
          aria-expanded={mobileNavOpen}
          aria-controls="admin-tabs-nav"
          onClick={() => setMobileNavOpen(open => !open)}
        >
          {mobileNavOpen ? <X size={18} /> : <MenuIcon size={18} />}
          <span>{activeTab}</span>
          <ChevronDown size={16} className={`admin-nav-toggle-caret ${mobileNavOpen ? 'is-open' : ''}`} />
        </button>
        <nav id="admin-tabs-nav" className={`site-nav admin-nav admin-tabs-scroll ${mobileNavOpen ? 'is-open' : ''}`}>
          {tabs.map(tab => (
            <button key={tab} type="button" className={`tab-button ${activeTab === tab ? 'active-tab' : ''}`} onClick={() => handleTabChange(tab)}>
              {tab}
            </button>
          ))}
        </nav>
        <a href="/" className="secondary-button">Return home</a>
      </header>

      <main>
        {activeTab === 'Orders' && (
          <>
            <section className="hero admin-hero">
              <div className="hero-copy">
                <span className="eyebrow">Restaurant operations</span>
                <h1>Manage live orders, kitchen flow, tables, and billing from one place.</h1>
                <p>Accept new orders, update prep time, generate invoices, and track restaurant performance with a single dashboard.</p>
                <div className="hero-actions">
                  <button type="button" className="primary-button" onClick={() => handleTabChange('Billing')}>Go to billing</button>
                  <button type="button" className="secondary-button" onClick={() => handleTabChange('Reports')}>See reports</button>
                </div>
              </div>
              <div className="hero-media admin-hero-media">
                <img src="/images/table-setting.png" alt="Admin operations" />
              </div>
            </section>

            <section className="menu-section admin-stats" id="orders">
              <div className="admin-metrics-grid">
                <MetricCard icon={ShoppingBag} label="Total orders" value={`${metricValues.total}`} />
                <MetricCard icon={Bell} label="Pending" value={`${metricValues.pending}`} />
                <MetricCard icon={LayoutDashboard} label="Completed" value={`${metricValues.completed}`} />
                <MetricCard icon={CreditCard} label="Revenue" value={`₹${metricValues.revenue}`} />
              </div>
            </section>
          </>
        )}

        {activeTab === 'Orders' && (
          <section className="menu-section">
            <div className="menu-header">
              <div>
                <span className="eyebrow">Live orders</span>
                <h2>Orders waiting for kitchen or billing action.</h2>
              </div>
            </div>
            <div className="filter-row">
              <div className="category-tabs">
                {orderStatuses.map(status => (
                  <button key={status} className={statusFilter === status ? 'active' : ''} onClick={() => setStatusFilter(status)}>{status}</button>
                ))}
              </div>
              <div className="category-tabs">
                {customerTypes.map(type => (
                  <button key={type} className={customerTypeFilter === type ? 'active' : ''} onClick={() => setCustomerTypeFilter(type)}>{type}</button>
                ))}
              </div>
            </div>
            <div className="order-management-grid">
              <div className="order-list-panel">
                {filteredOrders.map(order => (
                  <article key={order.id} className={`menu-card order-row ${selectedOrderId === order.id ? 'selected' : ''}`} onClick={() => setSelectedOrderId(order.id)}>
                    <div className="menu-card-body">
                      <div className="menu-card-top">
                        <div>
                          <h3>{order.id}</h3>
                          <span>{order.table} · {order.customer}</span>
                        </div>
                        <strong>{order.status}</strong>
                      </div>
                      <p>{order.items}</p>
                      <div className="menu-card-meta">
                        <span>{order.type}</span>
                        <span>{order.paymentStatus}</span>
                      </div>
                      <div className="order-footer">
                        <span>Instructions: {order.instructions}</span>
                        <button type="button" className="secondary-button" onClick={e => { e.stopPropagation(); advanceOrder(order.id) }}>
                          Next status
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="order-detail-panel">
                <div className="feature-card order-detail-card">
                  <div className="menu-card-body">
                    <div className="menu-card-top">
                      <div>
                        <h3>{selectedOrder.id}</h3>
                        <span>{selectedOrder.customer} · {selectedOrder.table}</span>
                      </div>
                      <span className={`status-pill ${selectedOrder.status.toLowerCase().replace(/ /g, '-')}`}>{selectedOrder.status}</span>
                    </div>
                    <p>{selectedOrder.items}</p>
                    <div className="menu-card-meta">
                      <span>{selectedOrder.type}</span>
                      <span>{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="billing-summary">
                      <div><span>Subtotal</span><strong>₹{selectedOrder.subtotal}</strong></div>
                      <div><span>GST</span><strong>₹{selectedOrder.gst}</strong></div>
                      <div><span>Service</span><strong>₹{selectedOrder.service}</strong></div>
                      <div><span>Total</span><strong>₹{selectedOrder.total}</strong></div>
                    </div>
                    <div className="menu-card-meta">
                      <span>Transaction ID: {selectedOrder.transactionId}</span>
                      <span>Payment: {selectedOrder.paymentStatus}</span>
                    </div>
                    <label>
                      <span>Prep time</span>
                      <input type="text" defaultValue={selectedOrder.prepTime} onBlur={e => updatePrepTime(selectedOrder.id, e.target.value)} />
                    </label>
                    <div className="order-actions">
                      <button type="button" className="primary-button" onClick={() => acceptOrder(selectedOrder.id)}>Accept</button>
                      <button type="button" className="secondary-button" onClick={() => advanceOrder(selectedOrder.id)}>Advance</button>
                      <button type="button" className="secondary-button" onClick={() => markPaid(selectedOrder.id)}>{selectedOrder.paymentStatus === 'Paid' ? 'Paid' : 'Mark paid'}</button>
                      <button type="button" className="secondary-button danger-button" onClick={() => cancelOrder(selectedOrder.id)}>Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'Kitchen' && (
          <section className="menu-section">
            <div className="menu-header">
              <div>
                <span className="eyebrow">Kitchen queue</span>
                <h2>Orders that the kitchen is currently preparing.</h2>
              </div>
            </div>
            <div className="order-management-grid">
              {orders.filter(order => order.status !== 'Completed' && order.status !== 'Cancelled').map(order => (
                <article key={order.id} className="menu-card kitchen-card">
                  <div className="menu-card-body">
                    <div className="menu-card-top">
                      <div>
                        <h3>{order.id}</h3>
                        <span>{order.table}</span>
                      </div>
                      <strong>{order.status}</strong>
                    </div>
                    <p>{order.items}</p>
                    <div className="menu-card-meta">
                      <span>{order.paymentMethod}</span>
                      <span>{order.prepTime}</span>
                    </div>
                    <div className="order-footer">
                      <span>{order.instructions}</span>
                      <button type="button" className="secondary-button" onClick={() => advanceOrder(order.id)}>Update</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'Menu' && (
          <section className="menu-section">
            <div className="menu-header">
              <div>
                <span className="eyebrow">Menu management</span>
                <h2>Add, update, or remove dishes.</h2>
              </div>
            </div>
            <div className="admin-panel">
              <div className="menu-list-panel">
                {menu.map(item => (
                  <article key={item.id} className="menu-card admin-menu-card">
                    <div className="menu-card-body">
                      <div className="menu-card-top">
                        <div>
                          <h3>{item.name}</h3>
                          <span>{item.category}</span>
                        </div>
                        <strong>₹{item.price}</strong>
                      </div>
                      <div className="menu-card-meta">
                        <span>{item.status}</span>
                        {item.special && <span>Special</span>}
                      </div>
                      <div className="order-actions">
                        <button type="button" className="secondary-button" onClick={() => toggleAvailability(item.id)}>
                          {item.status === 'Available' ? 'Mark unavailable' : 'Mark available'}
                        </button>
                        <button type="button" className="secondary-button danger-button" onClick={() => removeMenuItem(item.id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="admin-form-panel">
                <div className="feature-card">
                  <div className="feature-icon"><Plus size={18} /></div>
                  <div>
                    <span>Add a new menu item</span>
                    <strong>New dish</strong>
                  </div>
                </div>
                <label>
                  <span>Name</span>
                  <input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="Dish name" />
                </label>
                <label>
                  <span>Category</span>
                  <input value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} placeholder="Category" />
                </label>
                <label>
                  <span>Price</span>
                  <input type="number" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })} placeholder="Price" />
                </label>
                <button type="button" className="primary-button" onClick={handleAddMenuItem}>Add dish</button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'Tables' && (
          <section className="menu-section">
            <div className="menu-header">
              <div>
                <span className="eyebrow">Table management</span>
                <h2>Track available and occupied tables.</h2>
              </div>
            </div>
            <div className="table-grid">
              {tables.map(table => (
                <div key={table.id} className="table-card">
                  <div>
                    <strong>{table.id}</strong>
                    <span>{table.status}</span>
                  </div>
                  <button type="button" className="secondary-button" onClick={() => toggleTableStatus(table.id)}>
                    {table.status === 'Available' ? 'Occupy' : 'Free'}
                  </button>
                </div>
              ))}
            </div>
            <div className="admin-form-panel">
              <label>
                <span>New table ID</span>
                <input value={newTable} onChange={e => setNewTable(e.target.value)} />
              </label>
              <button type="button" className="primary-button" onClick={handleAddTable}>Add table</button>
            </div>
          </section>
        )}

        {activeTab === 'Manual entry' && (
          <section className="menu-section">
            <div className="menu-header">
              <div>
                <span className="eyebrow">Manual order entry</span>
                <h2>Place orders on behalf of guests.</h2>
              </div>
            </div>
            <div className="admin-panel">
              <div className="admin-form-panel">
                <label>
                  <span>Table</span>
                  <select value={manualTable} onChange={e => setManualTable(e.target.value)}>
                    {tables.map(table => <option key={table.id} value={table.id}>{table.id}</option>)}
                  </select>
                </label>
                <label>
                  <span>Dish</span>
                  <select value={manualDish} onChange={e => setManualDish(Number(e.target.value))}>
                    {menu.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                </label>
                <label>
                  <span>Quantity</span>
                  <input type="number" min={1} value={manualQuantity} onChange={e => setManualQuantity(Number(e.target.value))} />
                </label>
                <button type="button" className="primary-button" onClick={addManualItem}>Add item</button>
              </div>
              <div className="menu-list-panel">
                <div className="feature-card">
                  <div className="feature-icon"><ShoppingBag size={18} /></div>
                  <div>
                    <span>Line items</span>
                    <strong>{manualLineItems.length} items</strong>
                  </div>
                </div>
                {manualLineItems.map(entry => {
                  const menuItem = menu.find(item => item.id === entry.id)
                  return (
                    <div key={entry.id} className="cart-row">
                      <span>{menuItem?.name}</span>
                      <span>Qty {entry.quantity}</span>
                    </div>
                  )
                })}
                <button type="button" className="primary-button" onClick={placeManualOrder}>Create order</button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'Billing' && (
          <section className="menu-section">
            <div className="menu-header">
              <div>
                <span className="eyebrow">Table-Wise POS & Billing Settlement</span>
                <h2>Auto-Generated Table Invoices & Payment Status</h2>
                <p className="section-note">Select a table to collect its live orders, edit/add line items, check payment status (Paid vs Unpaid), and print thermal receipts.</p>
              </div>
            </div>

            {/* Table Selection Bar */}
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, display: 'block', marginBottom: '10px', color: 'var(--foreground)' }}>
                Select Active Table:
              </span>
              <div className="category-tabs admin-tabs-scroll" style={{ padding: '8px 0' }}>
                {tables.map(tbl => {
                  const tableOrders = orders.filter(o => o.table === tbl.id)
                  const isPaid = tableOrders.length > 0 && tableOrders.every(o => o.paymentStatus === 'Paid')
                  const hasOrders = tableOrders.length > 0
                  const isSelected = manualTable === tbl.id

                  return (
                    <button
                      key={tbl.id}
                      className={isSelected ? 'active' : ''}
                      onClick={() => {
                        setManualTable(tbl.id)
                        if (hasOrders) {
                          const parsed = tableOrders.flatMap(o => o.items.split(',').map(str => {
                            const parts = str.trim().split('×')
                            return { description: parts[0]?.trim() || 'Item', price: 280, quantity: Number(parts[1] || 1) }
                          }))
                          setCustomItems(parsed)
                        } else {
                          setCustomItems([
                            { description: 'Smoked Paneer Tikka', price: 320, quantity: 1 },
                            { description: 'Butter Garlic Naan', price: 110, quantity: 2 },
                          ])
                        }
                      }}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      }}
                    >
                      <span>{tbl.id}</span>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: hasOrders ? (isPaid ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)') : 'rgba(156,163,175,0.15)', color: hasOrders ? (isPaid ? '#166534' : '#991b1b') : '#4b5563' }}>
                        {hasOrders ? (isPaid ? '✓ Paid' : '⚠ Unpaid') : 'Empty'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="admin-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* Left Column: Live Bill Editor & Item Adder */}
              <div className="admin-form-panel" style={{ background: 'var(--card)', borderRadius: '24px', padding: '24px', border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>Table {manualTable} Bill Controls</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Edit quantities, add dishes, or apply discounts</span>
                  </div>
                </div>

                {/* Quick Add Menu Item Dropdown */}
                <div style={{ background: 'var(--muted)', padding: '14px', borderRadius: '16px', marginBottom: '16px', display: 'grid', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>+ Add Item to Table {manualTable} Bill:</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
                      value={manualDish}
                      onChange={e => setManualDish(Number(e.target.value))}
                    >
                      {menu.map(item => <option key={item.id} value={item.id}>{item.name} (₹{item.price})</option>)}
                    </select>
                    <button
                      type="button"
                      className="primary-button"
                      style={{ padding: '8px 14px', borderRadius: '10px' }}
                      onClick={() => {
                        const menuItem = menu.find(item => item.id === manualDish)
                        if (menuItem) {
                          setCustomItems(current => {
                            const existing = current.find(row => row.description === menuItem.name)
                            if (existing) {
                              return current.map(row => row.description === menuItem.name ? { ...row, quantity: row.quantity + 1 } : row)
                            }
                            return [...current, { description: menuItem.name, price: menuItem.price, quantity: 1 }]
                          })
                        }
                      }}
                    >
                      Add Dish
                    </button>
                  </div>
                </div>

                {/* Line Items List */}
                <div style={{ display: 'grid', gap: '10px', marginBottom: '16px' }}>
                  {customItems.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontStyle: 'italic', padding: '16px 0' }}>No items on bill. Select a dish above to add.</p>
                  ) : (
                    customItems.map((item, index) => (
                      <div key={index} className="billing-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', alignItems: 'center', background: 'var(--muted)', padding: '10px 12px', borderRadius: '14px' }}>
                        <input
                          style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
                          value={item.description}
                          onChange={e => setCustomItems(current => current.map((row, idx) => idx === index ? { ...row, description: e.target.value } : row))}
                          placeholder="Item description"
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button type="button" className="secondary-button" style={{ padding: '2px 8px' }} onClick={() => setCustomItems(current => current.map((row, idx) => idx === index ? { ...row, quantity: Math.max(1, row.quantity - 1) } : row))}>-</button>
                          <span style={{ fontWeight: 700 }}>{item.quantity}</span>
                          <button type="button" className="secondary-button" style={{ padding: '2px 8px' }} onClick={() => setCustomItems(current => current.map((row, idx) => idx === index ? { ...row, quantity: row.quantity + 1 } : row))}>+</button>
                        </div>
                        <input
                          type="number"
                          style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
                          value={item.price}
                          min={0}
                          onChange={e => setCustomItems(current => current.map((row, idx) => idx === index ? { ...row, price: Number(e.target.value) } : row))}
                          placeholder="Price"
                        />
                        <button type="button" className="secondary-button danger-button" style={{ padding: '6px 10px', color: '#dc2626' }} onClick={() => setCustomItems(current => current.filter((_, idx) => idx !== index))}>✕</button>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                    <span>Discount (%)</span>
                    <input type="number" style={{ width: '80px', padding: '6px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }} min={0} max={100} value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))} />
                  </label>
                  <button type="button" className="secondary-button" onClick={() => setCustomItems(current => [...current, { description: 'Custom Extra Item', price: 150, quantity: 1 }])}>+ Custom Item</button>
                </div>
              </div>

              {/* Right Column: Luxury POS Bill Receipt Preview & Payment Status Badge */}
              <div className="menu-list-panel billing-summary-panel printable-receipt" style={{ background: '#ffffff', color: '#111827', borderRadius: '28px', padding: '28px', border: '1px solid #e5e7eb', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Bill Top Header */}
                  <div style={{ textAlign: 'center', borderBottom: '2px dashed #d1d5db', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div style={{ display: 'inline-block', background: '#c25a34', color: '#ffffff', width: '36px', height: '36px', borderRadius: '50%', lineHeight: '36px', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '6px' }}>V</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: '#111827', letterSpacing: '0.02em' }}>VERANDA KITCHEN & BAR</h2>
                    <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '4px 0 0', fontWeight: 600 }}>OFFICIAL INVOICE FOR TABLE {manualTable}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7280', marginTop: '10px', padding: '0 8px' }}>
                      <span>Invoice #: ORD-{Math.floor(1000 + Math.random() * 9000)}</span>
                      <span>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Payment Status Stamp/Badge directly on top of Bill */}
                  {(() => {
                    const tableOrders = orders.filter(o => o.table === manualTable)
                    const isPaid = tableOrders.length > 0 && tableOrders.every(o => o.paymentStatus === 'Paid')
                    return (
                      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isPaid ? '#f0fdf4' : '#fffbeb', border: `1.5px solid ${isPaid ? '#bbf7d0' : '#fde68a'}`, padding: '10px 14px', borderRadius: '16px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: isPaid ? '#166534' : '#92400e', fontWeight: 800, display: 'block' }}>Payment Status</span>
                          <strong style={{ fontSize: '1.05rem', color: isPaid ? '#15803d' : '#b45309' }}>
                            {isPaid ? '✓ PAID IN FULL' : '⚠ PAYMENT PENDING'}
                          </strong>
                        </div>
                        <button
                          type="button"
                          className="secondary-button"
                          style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '12px', background: isPaid ? '#166534' : '#c25a34', color: '#ffffff', border: 'none' }}
                          onClick={() => {
                            setOrders(current => current.map(o => o.table === manualTable ? { ...o, paymentStatus: isPaid ? 'Pending' : 'Paid' } : o))
                          }}
                        >
                          Mark as {isPaid ? 'Unpaid' : 'Paid'}
                        </button>
                      </div>
                    )
                  })()}

                  {/* Itemized Line Items */}
                  <div style={{ margin: '16px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.82rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #f3f4f6', paddingBottom: '6px', marginBottom: '8px' }}>
                      <span>Item</span>
                      <span>Qty x Price</span>
                      <span>Total</span>
                    </div>
                    {customItems.length === 0 ? (
                      <p style={{ textAlign: 'center', color: '#9ca3af', fontStyle: 'italic', padding: '16px 0' }}>No items on invoice.</p>
                    ) : (
                      customItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.92rem', borderBottom: '1px dashed #f3f4f6' }}>
                          <span style={{ fontWeight: 600 }}>{item.description || 'Custom Item'}</span>
                          <span style={{ color: '#6b7280' }}>{item.quantity} × ₹{item.price}</span>
                          <strong>₹{item.price * item.quantity}</strong>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Calculation Details */}
                  <div style={{ borderTop: '2px dashed #e5e7eb', paddingTop: '12px', display: 'grid', gap: '6px', fontSize: '0.92rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}><span>Subtotal</span><span>₹{billingSubtotal}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}><span>GST (5%)</span><span>₹{billingGst}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}><span>Service Tax (6%)</span><span>₹{billingService}</span></div>
                    {billingDiscount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', fontWeight: 700 }}><span>Discount ({discountPercent}%)</span><span>-₹{billingDiscount}</span></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 900, borderTop: '2px solid #111827', paddingTop: '10px', marginTop: '8px', color: '#111827' }}>
                      <span>Grand Total</span>
                      <span style={{ color: '#c25a34' }}>₹{billingTotal}</span>
                    </div>
                  </div>
                </div>

                {/* Print Button */}
                <div style={{ marginTop: '24px' }}>
                  <button type="button" className="primary-button" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1.05rem', fontWeight: 800, borderRadius: '16px' }} onClick={() => window.print()}>
                    🖨 Print POS Thermal Receipt
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'Reports' && (
          <section className="menu-section" id="reports">
            <div className="menu-header">
              <div>
                <span className="eyebrow">Reports</span>
                <h2>Sales, payments, and billing performance.</h2>
                <p className="section-note">Billing reports show paid vs pending totals, table turnover, and the online payment share for today's service.</p>
              </div>
            </div>
            <div className="report-grid">
              <div className="feature-card">
                <div className="feature-icon"><BarChart3 size={18} /></div>
                <span>Daily revenue</span>
                <strong>₹{metricValues.revenue}</strong>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><CreditCard size={18} /></div>
                <span>Payments collected</span>
                <strong>₹{paymentSummary.paidTotal}</strong>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><Bell size={18} /></div>
                <span>Pending payments</span>
                <strong>₹{paymentSummary.pendingTotal}</strong>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><Table2 size={18} /></div>
                <span>Online order count</span>
                <strong>{paymentSummary.onlineCount}</strong>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><PieChart size={18} /></div>
                <span>Popular dishes</span>
                <strong>{popularDishes.join(', ')}</strong>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'Feedback' && (
          <section className="menu-section">
            <div className="menu-header">
              <div>
                <span className="eyebrow">Customer feedback</span>
                <h2>Guest ratings, table experience, and payment ease.</h2>
                <p className="section-note">Track how guests respond to service, billing process, and table comfort after their meal.</p>
              </div>
            </div>
            <div className="feature-grid">
              {feedback.map(entry => (
                <div key={entry.id} className="feedback-card">
                  <div className="feature-icon"><MessageSquare size={18} /></div>
                  <strong>{entry.guest}</strong>
                  <span>Rating: {entry.rating}/5</span>
                  <p>{entry.comment}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

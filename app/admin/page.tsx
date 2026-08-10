'use client'

import { useMemo, useState, useEffect } from 'react'
import { ArrowRight, BarChart3, Bell, CreditCard, LayoutDashboard, MessageSquare, PieChart, Plus, RefreshCcw, ShoppingBag, Table2, Truck, Utensils, X } from 'lucide-react'

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
    setNewTable(`T${current.length + 16}`)
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
        <nav className="site-nav admin-nav">
          {tabs.map(tab => (
            <button key={tab} className={`tab-button ${activeTab === tab ? 'active-tab' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </nav>
        <a href="/" className="secondary-button">Return home</a>
      </header>

      <main>
        <section className="hero admin-hero">
          <div className="hero-copy">
            <span className="eyebrow">Restaurant operations</span>
            <h1>Manage live orders, kitchen flow, tables, and billing from one place.</h1>
            <p>Accept new orders, update prep time, generate invoices, and track restaurant performance with a single dashboard.</p>
            <div className="hero-actions">
              <a href="#orders" className="primary-button">Go to orders</a>
              <a href="#reports" className="secondary-button">See reports</a>
            </div>
          </div>
          <div className="hero-media admin-hero-media">
            <img src="/images/table-setting.png" alt="Admin operations" />
          </div>
        </section>

        <section className="menu-section admin-stats" id="orders">
          <div className="feature-grid">
            <MetricCard icon={ShoppingBag} label="Total orders" value={`${metricValues.total}`} />
            <MetricCard icon={Bell} label="Pending" value={`${metricValues.pending}`} />
            <MetricCard icon={LayoutDashboard} label="Completed" value={`${metricValues.completed}`} />
            <MetricCard icon={CreditCard} label="Revenue" value={`₹${metricValues.revenue}`} />
          </div>
        </section>

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
                <span className="eyebrow">Custom billing</span>
                <h2>Build invoices with discounts, GST, and payment capture.</h2>
                <p className="section-note">Use this billing panel to finalize guest orders, capture online settlement, and mark payments as complete.</p>
              </div>
            </div>
            <div className="admin-panel">
              <div className="admin-form-panel">
                {customItems.map((item, index) => (
                  <div key={index} className="billing-row">
                    <input value={item.description} onChange={e => setCustomItems(current => current.map((row, idx) => idx === index ? { ...row, description: e.target.value } : row))} placeholder="Item description" />
                    <input type="number" value={item.quantity} min={1} onChange={e => setCustomItems(current => current.map((row, idx) => idx === index ? { ...row, quantity: Number(e.target.value) } : row))} />
                    <input type="number" value={item.price} min={0} onChange={e => setCustomItems(current => current.map((row, idx) => idx === index ? { ...row, price: Number(e.target.value) } : row))} placeholder="Price" />
                    <button type="button" className="secondary-button danger-button" onClick={() => setCustomItems(current => current.filter((_, idx) => idx !== index))}>Remove</button>
                  </div>
                ))}
                <button type="button" className="secondary-button" onClick={() => setCustomItems(current => [...current, { description: '', price: 0, quantity: 1 }])}>Add custom item</button>
                <label>
                  <span>Discount %</span>
                  <input type="number" min={0} max={100} value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value))} />
                </label>
              </div>
              <div className="menu-list-panel billing-summary-panel">
                <div className="feature-card">
                  <div className="feature-icon"><CreditCard size={18} /></div>
                  <div>
                    <span>Invoice preview</span>
                    <strong>₹{billingTotal}</strong>
                  </div>
                </div>
                <div className="billing-summary">
                  <div><span>Subtotal</span><strong>₹{billingSubtotal}</strong></div>
                  <div><span>GST</span><strong>₹{billingGst}</strong></div>
                  <div><span>Service</span><strong>₹{billingService}</strong></div>
                  <div><span>Discount</span><strong>-₹{billingDiscount}</strong></div>
                  <div className="billing-total"><span>Total</span><strong>₹{billingTotal}</strong></div>
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

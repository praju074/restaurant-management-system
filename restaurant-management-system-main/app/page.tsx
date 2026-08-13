'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, ChevronUp, Clock3, Heart, MapPin, Moon, Phone, Star, Sun, Utensils } from 'lucide-react'

const menuItems = [
  {
    id: 1,
    name: 'Smoked Paneer Tikka',
    category: 'Starters',
    price: 320,
    rating: 4.9,
    time: '18 min',
    image: '/images/paneer-tikka.png',
    description: 'Charred cottage cheese, bell peppers, mint chutney.',
    ingredients: 'Paneer, bell peppers, yogurt, spices',
    veg: true,
    special: true,
    available: true,
    spiceLevel: 'Medium',
    popularity: 96,
  },
  {
    id: 2,
    name: 'Saffron Garden Biryani',
    category: 'Rice & Biryani',
    price: 460,
    rating: 4.8,
    time: '24 min',
    image: '/images/biryani.png',
    description: 'Fragrant basmati rice with seasonal vegetables and cooling raita.',
    ingredients: 'Basmati rice, saffron, vegetables, spices',
    veg: true,
    special: true,
    available: true,
    spiceLevel: 'Mild',
    popularity: 100,
  },
  {
    id: 3,
    name: 'Rose Cardamom Gulab Jamun',
    category: 'Desserts',
    price: 180,
    rating: 4.7,
    time: '8 min',
    image: '/images/gulab-jamun.png',
    description: 'Warm dumplings in rose syrup finished with pistachio.',
    ingredients: 'Milk solids, rose syrup, cardamom, pistachio',
    veg: true,
    special: false,
    available: true,
    spiceLevel: 'None',
    popularity: 84,
  },
  {
    id: 4,
    name: 'Wood-fired Margherita Pizza',
    category: 'Pizza',
    price: 390,
    rating: 4.8,
    time: '16 min',
    image: '/images/pizza.png',
    description: 'Blistered crust with basil, mozzarella, and tomato.',
    ingredients: 'Flour, tomato, mozzarella, basil, olive oil',
    veg: true,
    special: false,
    available: true,
    spiceLevel: 'Mild',
    popularity: 89,
  },
  {
    id: 5,
    name: 'Crispy Paneer Burger',
    category: 'Burgers',
    price: 340,
    rating: 4.7,
    time: '14 min',
    image: '/images/burger.png',
    description: 'Crispy paneer, house slaw, secret sauce, and fries.',
    ingredients: 'Paneer, buns, slaw, sauce',
    veg: true,
    special: false,
    available: true,
    spiceLevel: 'Medium',
    popularity: 91,
  },
  {
    id: 6,
    name: 'Wok Tossed Hakka Noodles',
    category: 'Asian',
    price: 290,
    rating: 4.6,
    time: '12 min',
    image: '/images/noodles.png',
    description: 'Stir-fried noodles with vegetables and vibrant soy glaze.',
    ingredients: 'Noodles, vegetables, soy glaze, sesame',
    veg: true,
    special: false,
    available: true,
    spiceLevel: 'Medium',
    popularity: 85,
  },
  {
    id: 7,
    name: 'Dal Makhani Royale',
    category: 'Dals & Curries',
    price: 310,
    rating: 4.9,
    time: '20 min',
    image: '/images/curry.png',
    description: 'Slow-cooked black lentils finished with cream and butter.',
    ingredients: 'Black lentils, cream, butter, spices',
    veg: true,
    special: true,
    available: true,
    spiceLevel: 'Mild',
    popularity: 95,
  },
  {
    id: 8,
    name: 'Garlic Butter Roti',
    category: 'Breads',
    price: 90,
    rating: 4.8,
    time: '7 min',
    image: '/images/roti.png',
    description: 'Soft roti brushed with garlic butter and fresh herbs.',
    ingredients: 'Wheat flour, garlic butter, herbs',
    veg: true,
    special: false,
    available: true,
    spiceLevel: 'None',
    popularity: 78,
  },
  {
    id: 9,
    name: 'Grilled Veg Club Sandwich',
    category: 'Sandwiches',
    price: 280,
    rating: 4.5,
    time: '11 min',
    image: '/images/sandwich.png',
    description: 'Triple-layer grilled sandwich with cheese and vegetables.',
    ingredients: 'Bread, vegetables, cheese, sauce',
    veg: true,
    special: false,
    available: true,
    spiceLevel: 'Mild',
    popularity: 80,
  },
  {
    id: 10,
    name: 'Kokum Fizz',
    category: 'Drinks',
    price: 160,
    rating: 4.8,
    time: '5 min',
    image: '/images/gulab-jamun.png',
    description: 'Refreshing kokum drink with lime and basil seeds.',
    ingredients: 'Kokum, lime, basil seeds, soda',
    veg: true,
    special: false,
    available: true,
    spiceLevel: 'None',
    popularity: 75,
  },
  {
    id: 11,
    name: 'Mushroom Manchurian',
    category: 'Asian',
    price: 350,
    rating: 4.7,
    time: '16 min',
    image: '/images/manchurian.png',
    description: 'Crispy mushrooms tossed in tangy schezwan sauce.',
    ingredients: 'Mushrooms, bell peppers, soy, spices',
    veg: true,
    special: true,
    available: true,
    spiceLevel: 'Medium',
    popularity: 90,
  },
  {
    id: 12,
    name: 'Butter Garlic Naan',
    category: 'Breads',
    price: 110,
    rating: 4.9,
    time: '8 min',
    image: '/images/roti.png',
    description: 'Soft naan brushed with garlic butter and coriander.',
    ingredients: 'Wheat flour, garlic, butter, herbs',
    veg: true,
    special: false,
    available: true,
    spiceLevel: 'None',
    popularity: 88,
  },
  {
    id: 13,
    name: 'Classic Dal Tadka',
    category: 'Dals & Curries',
    price: 260,
    rating: 4.8,
    time: '18 min',
    image: '/images/dal-tadka.png',
    description: 'Homestyle yellow lentils tempered with cumin and garlic.',
    ingredients: 'Yellow dal, ghee, cumin, garlic, tomatoes',
    veg: true,
    special: false,
    available: true,
    spiceLevel: 'Mild',
    popularity: 92,
  },
  {
    id: 14,
    name: 'Chef’s Special Veg Thali',
    category: 'Rice & Biryani',
    price: 520,
    rating: 4.9,
    time: '22 min',
    image: '/images/vegetable-curry.png',
    description: 'A hearty thali with rice, curry, bread, and seasonal salad.',
    ingredients: 'Rice, vegetable curry, naan, salad, chutney',
    veg: true,
    special: true,
    available: true,
    spiceLevel: 'Medium',
    popularity: 98,
  },
  {
    id: 15,
    name: 'Garden Fresh Salad',
    category: 'Starters',
    price: 220,
    rating: 4.6,
    time: '10 min',
    image: '/images/table-setting.png',
    description: 'Crisp greens with cherry tomatoes, cucumber, and herb dressing.',
    ingredients: 'Lettuce, tomatoes, cucumber, olives, vinaigrette',
    veg: true,
    special: false,
    available: true,
    spiceLevel: 'None',
    popularity: 82,
  },
  {
    id: 16,
    name: 'Spiced Lemonade',
    category: 'Drinks',
    price: 140,
    rating: 4.5,
    time: '5 min',
    image: '/images/restaurant-dining.png',
    description: 'Chilled lemonade with a gentle spice kick and mint notes.',
    ingredients: 'Lemon, mint, black salt, ginger, soda',
    veg: true,
    special: false,
    available: true,
    spiceLevel: 'Mild',
    popularity: 76,
  },
]

const categories = ['All dishes', 'Starters', 'Pizza', 'Burgers', 'Asian', 'Rice & Biryani', 'Dals & Curries', 'Breads', 'Sandwiches', 'Desserts', 'Drinks']
const sortOptions = ['Popularity', 'Price: Low to High', 'Price: High to Low']
const paymentMethods = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet']
const orderTimeline = ['Order received', 'Preparing', 'Ready to serve', 'Served', 'Completed']
const featuredItems = menuItems.filter(item => item.special).slice(0, 3)

function Logo() {
  return (
    <div className="brand-lockup">
      <div className="brand-mark"><Utensils size={20} /></div>
      <div>
        <div className="brand-name">VERANDA</div>
        <div className="brand-sub">Kitchen & Bar</div>
      </div>
    </div>
  )
}

function statusColor(status: string) {
  switch (status) {
    case 'Completed':
      return 'status-pill complete'
    case 'Ready to serve':
      return 'status-pill ready'
    case 'Preparing':
      return 'status-pill preparing'
    case 'Order received':
      return 'status-pill received'
    case 'Served':
      return 'status-pill served'
    default:
      return 'status-pill'
  }
}

export default function Page() {
  const [category, setCategory] = useState('All dishes')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('Popularity')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [tableNumber, setTableNumber] = useState('')
  const [cart, setCart] = useState(Array<{ id: number; quantity: number; instructions: string }>())
  const [favorites, setFavorites] = useState<number[]>([])
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0])
  const [placedOrder, setPlacedOrder] = useState<{ orderId: string; statusIndex: number; eta: string; total: number; paymentMethod: string } | null>(null)
  const [recentOrders, setRecentOrders] = useState<Array<{ orderId: string; table: string; total: number; status: string }>>([])
  const [onlinePaymentStatus, setOnlinePaymentStatus] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(true)
  const [floatingCartOpen, setFloatingCartOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const paramTable = params.get('table')?.toUpperCase() || ''
    if (paramTable) {
      setTableNumber(paramTable)
    }
  }, [])

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? window.localStorage.getItem('theme') : 'light'
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', theme)
    }
  }, [theme])

  useEffect(() => {
    if (!placedOrder) return
    if (placedOrder.statusIndex >= orderTimeline.length - 1) return

    const timer = window.setTimeout(() => {
      setPlacedOrder(current => current ? { ...current, statusIndex: current.statusIndex + 1 } : null)
    }, 9000)

    return () => window.clearTimeout(timer)
  }, [placedOrder])

  // Populate recent orders from shared storage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('veranda_orders')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setRecentOrders(parsed.slice(0, 4).map((o: any) => ({ orderId: o.id, table: o.table, total: o.total, status: o.status })))
        }
      } catch (e) {
        // ignore
      }
    }
  }, [])

  // Listen for cross-tab storage updates so customers see kitchen status changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'veranda_orders') return
      try {
        const orders = JSON.parse(e.newValue || '[]')
        if (!Array.isArray(orders)) return
        if (!placedOrder) return
        const mine = orders.find((o: any) => o.id === placedOrder.orderId)
        if (mine) {
          const idx = orderTimeline.indexOf(mine.status)
          if (idx !== -1) setPlacedOrder(current => current ? { ...current, statusIndex: idx } : current)
          setRecentOrders(current => [{ orderId: mine.id, table: mine.table, total: mine.total, status: mine.status }, ...current.filter(c => c.orderId !== mine.id)].slice(0, 4))
        }
      } catch (e) {
        // ignore
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [placedOrder])

  const filteredMenu = useMemo(() => {
    return menuItems
      .filter(item => (category === 'All dishes' || item.category === category) && item.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'Popularity') return b.popularity - a.popularity
        if (sortBy === 'Price: Low to High') return a.price - b.price
        return b.price - a.price
      })
  }, [category, query, sortBy])

  const cartEntries = cart.map(entry => {
    const item = menuItems.find(menu => menu.id === entry.id)!
    return { ...item, quantity: entry.quantity, instructions: entry.instructions }
  })

  const cartCounts = useMemo(() => Object.fromEntries(cart.map(entry => [entry.id, entry.quantity])), [cart])

  const subtotal = cartEntries.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const gst = Math.round(subtotal * 0.05)
  const service = Math.round(subtotal * 0.06)
  const total = subtotal + gst + service

  const addToCart = (itemId: number) => {
    setCart(current => {
      const existing = current.find(entry => entry.id === itemId)
      if (existing) {
        return current.map(entry => entry.id === itemId ? { ...entry, quantity: entry.quantity + 1 } : entry)
      }
      return [...current, { id: itemId, quantity: 1, instructions: '' }]
    })
  }

  const updateQuantity = (itemId: number, nextQuantity: number) => {
    setCart(current => current
      .map(entry => entry.id === itemId ? { ...entry, quantity: Math.max(1, nextQuantity) } : entry)
      .filter(entry => entry.quantity > 0),
    )
  }

  const removeFromCart = (itemId: number) => {
    setCart(current => current.filter(entry => entry.id !== itemId))
  }

  const toggleFavorite = (itemId: number) => {
    setFavorites(current => current.includes(itemId) ? current.filter(id => id !== itemId) : [...current, itemId])
  }

  const handlePlaceOrder = () => {
    if (!tableNumber) {
      window.alert('Please confirm your table number before placing the order.')
      return
    }
    if (cartEntries.length === 0) {
      window.alert('Add at least one dish to the cart first.')
      return
    }

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`
    setPlacedOrder({
      orderId,
      statusIndex: 0,
      eta: `${15 + cartEntries.length * 2} min`,
      total,
      paymentMethod,
    })
    setRecentOrders(current => [{ orderId, table: tableNumber, total, status: 'Order received' }, ...current].slice(0, 4))
    setCart([])
    setSpecialInstructions('')
    setOnlinePaymentStatus(null)
    setShowMenu(false)
    // persist a lightweight order record so admin/kitchen views can pick it up
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(window.localStorage.getItem('veranda_orders') || '[]')
        stored.unshift({ id: orderId, table: tableNumber, total, status: 'Order received', paymentMethod, paymentStatus: 'Pending', prepTime: `${15 + cartEntries.length * 2} min` })
        window.localStorage.setItem('veranda_orders', JSON.stringify(stored.slice(0, 50)))
      } catch (e) {
        // ignore
      }
    }
  }

  const handlePayOnline = () => {
    if (!tableNumber) {
      window.alert('Please confirm your table number before paying.')
      return
    }
    if (cartEntries.length === 0) {
      window.alert('Add at least one dish to the cart first.')
      return
    }

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`
    setPlacedOrder({
      orderId,
      statusIndex: 0,
      eta: `${12 + cartEntries.length * 2} min`,
      total,
      paymentMethod,
    })
    setRecentOrders(current => [{ orderId, table: tableNumber, total, status: 'Paid online' }, ...current].slice(0, 4))
    setCart([])
    setSpecialInstructions('')
    setOnlinePaymentStatus(`Online payment completed with ${paymentMethod}.`)
    setShowMenu(false)
    // persist order with payment status so admin/kitchen can see it
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(window.localStorage.getItem('veranda_orders') || '[]')
        stored.unshift({ id: orderId, table: tableNumber, total, status: 'Order received', paymentMethod, paymentStatus: 'Paid', prepTime: `${12 + cartEntries.length * 2} min` })
        window.localStorage.setItem('veranda_orders', JSON.stringify(stored.slice(0, 50)))
      } catch (e) {
        // ignore
      }
    }
  }

  const printReceipt = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const activeOrderStatus = placedOrder ? orderTimeline[placedOrder.statusIndex] : null
  const cartItemCount = cart.reduce((sum, entry) => sum + entry.quantity, 0)

  const payFromFloatingCart = () => {
    handlePayOnline()
    setFloatingCartOpen(false)
  }

  const placeFromFloatingCart = () => {
    handlePlaceOrder()
    setFloatingCartOpen(false)
  }

  return (
    <div className="app-shell restaurant-page">
      <header className="site-header">
        <Logo />
        <nav className="site-nav">
          <a href="#welcome">Welcome</a>
          <a href="#menu">Menu</a>
          <a href="#cart">Cart</a>
          <a href="/admin/login">Admin</a>
        </nav>
        <div className="hero-actions">
          <button type="button" className="secondary-button theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />} {theme === 'light' ? 'Dark' : 'Light'} mode
          </button>
        </div>
      </header>

      <main>
        <section className="hero welcome-hero" id="welcome">
          <div className="hero-copy">
            <span className="eyebrow">QR table entry</span>
            <h1>Scan your table QR, start ordering, and track your meal live.</h1>
            <p>Order from your table, customize your plate, and pay securely from your device with a restaurant-ready digital dining experience.</p>
            <div className="hero-actions">
              <button type="button" className="primary-button" onClick={() => { setShowMenu(true); document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' }) }}>
                Start ordering <ArrowRight size={16} />
              </button>
              <a href="#cart" className="secondary-button">View cart</a>
            </div>
            <div className="hero-features-header" style={{ marginTop: '2.5rem', marginBottom: '0.8rem' }}>
              <span className="section-tag" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                <Utensils size={13} /> Platform Capabilities
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-serif)', color: 'var(--foreground)', margin: '6px 0 0' }}>
                Our Features
              </h3>
            </div>
            <div className="hero-stat-grid" style={{ marginTop: '0.8rem' }}>
              <div>
                <strong>QR based</strong>
                <span>Auto-detect table number</span>
              </div>
              <div>
                <strong>Live tracking</strong>
                <span>Order progress in real time</span>
              </div>
              <div>
                <strong>Secure payments</strong>
                <span>UPI, cards, wallets, net banking</span>
              </div>
            </div>
          </div>

          <div className="hero-media">
            <img className="hero-media-image" src="/images/restaurant-dining.png" alt="Restaurant dining experience" />
          </div>
        </section>

        <section className="table-entry-section" id="cart">
          <div className="order-entry-card">
            <div className="order-entry-copy">
              <span className="eyebrow">Table Entry</span>
              <h2>{tableNumber ? `Table ${tableNumber} detected` : 'Scan a table QR to auto-detect.'}</h2>
              <p>You can also correct the table number manually before placing your order.</p>
            </div>
            <div className="order-entry-form">
              <label>
                <span>Table Number</span>
                <input value={tableNumber} onChange={e => setTableNumber(e.target.value.toUpperCase())} placeholder="T01" />
              </label>
              <button type="button" className="primary-button" onClick={() => setShowMenu(true)}>
                Confirm table
              </button>
            </div>
            <div className="order-entry-notes">
              <div>
                <strong>Sample QR link</strong>
                <span>https://your-restaurant.com?table=T08</span>
              </div>
              <div>
                <strong>Need help?</strong>
                <span>Ask staff to refresh your table details.</span>
              </div>
            </div>

            {/* Cart Section - Embedded directly below Table Entry details as pointed in screenshot */}
            <div className="cart-inline-summary" style={{ marginTop: '24px', borderTop: '2px dashed var(--border)', paddingTop: '20px' }}>
              <div className="reserve-copy" style={{ marginBottom: '16px' }}>
                <span className="eyebrow">Shopping Cart & Quick Checkout</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '4px 0' }}>Order Summary {tableNumber ? `for Table ${tableNumber}` : ''}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Review selected items, add cooking instructions, and place your order.</p>
              </div>

              {cartEntries.length === 0 ? (
                <div className="empty-cart" style={{ padding: '20px', textAlign: 'center', background: 'rgba(0,0,0,0.02)', borderRadius: '16px' }}>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>Your cart is empty.</h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>Browse the menu below and tap "Add to cart" on your favorite dishes.</p>
                </div>
              ) : (
                <div className="shopping-cart-card">
                  <div className="cart-items">
                    {cartEntries.map(item => (
                      <div className="cart-row" key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ flex: 1 }}>
                          <strong>{item.name}</strong>
                          <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>{item.category}</div>
                          <div className="quantity-controls" style={{ marginTop: '6px', display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                            <button type="button" className="secondary-button" style={{ padding: '2px 8px' }} onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                            <span>{item.quantity}</span>
                            <button type="button" className="secondary-button" style={{ padding: '2px 8px' }} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ display: 'block' }}>₹{item.price * item.quantity}</strong>
                          <button type="button" className="text-button" style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '4px' }} onClick={() => removeFromCart(item.id)}>✕ Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <label style={{ display: 'grid', gap: '6px', margin: '16px 0' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Cooking instructions</span>
                    <textarea
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--input)' }}
                      value={specialInstructions}
                      onChange={e => setSpecialInstructions(e.target.value)}
                      placeholder="Add any special requests (e.g. less spicy, no onions)..."
                    />
                  </label>
                  <div className="billing-summary" style={{ display: 'grid', gap: '4px', margin: '16px 0', padding: '12px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Subtotal</span>
                      <strong>₹{subtotal}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>GST (5%)</span>
                      <strong>₹{gst}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Service charge (6%)</span>
                      <strong>₹{service}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid var(--border)', fontSize: '1.1rem', marginTop: '4px' }}>
                      <strong>Total Payable</strong>
                      <strong style={{ color: 'var(--primary)' }}>₹{total}</strong>
                    </div>
                  </div>
                  <div className="cart-checkout-actions" style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                    <button type="button" className="primary-button" style={{ flex: 1 }} onClick={handlePlaceOrder}>
                      Place Table Order
                    </button>
                    <button type="button" className="secondary-button" style={{ flex: 1 }} onClick={handlePayOnline}>
                      Pay Online & Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Our Features Section - Prominently Headed as requested by Siddesh Sir */}
        <section className="features-section" id="features">
          <div className="section-header">
            <span className="section-tag"><Utensils size={14} /> Key Highlights</span>
            <h2 className="section-title">Our Features</h2>
            <p className="section-subtitle">Experience seamless digital dining, instant table QR ordering, live kitchen progress, and fresh artisanal meals.</p>
          </div>
          <div className="featured-grid">
            <article className="featured-card">
              <div className="featured-ribbon">Instant QR</div>
              <img src="/images/table-setting.png" alt="Seamless Table QR Ordering" />
              <div className="featured-card-body">
                <strong>Zero Wait Table Ordering</strong>
                <p>Scan your table QR code to view the live menu, place orders directly, and modify items effortlessly.</p>
              </div>
            </article>
            <article className="featured-card">
              <div className="featured-ribbon">Live KDS</div>
              <img src="/images/restaurant-dining.png" alt="Live Order Tracking" />
              <div className="featured-card-body">
                <strong>Real-Time Kitchen Sync</strong>
                <p>Track your food progress step-by-step from chef preparation to hot table delivery.</p>
              </div>
            </article>
            <article className="featured-card">
              <div className="featured-ribbon">Artisanal</div>
              <img src="/images/biryani.png" alt="Fresh Ingredients" />
              <div className="featured-card-body">
                <strong>Fresh Gourmet Crafting</strong>
                <p>Every dish is made fresh with organic ingredients, customizable spice levels, and chef signature recipes.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="featured-section">
          <div className="section-copy">
            <span className="eyebrow">Chef’s picks</span>
            <h2>Today’s most loved dishes</h2>
            <p>Handpicked favourites from our kitchen, styled for a rich dining experience.</p>
          </div>
          <div className="featured-grid">
            {featuredItems.map(item => (
              <article className="featured-card" key={item.id}>
                <div className="featured-ribbon">Top pick</div>
                <img src={item.image} alt={item.name} />
                <div className="featured-card-body">
                  <strong>{item.name}</strong>
                  <p>{item.description}</p>
                  <div className="featured-meta">
                    <span>₹{item.price}</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {showMenu ? (
          <section className="menu-section menu-visible" id="menu">
            <div className="menu-header">
              <div>
                <span className="eyebrow">Digital menu</span>
                <h2>Browse, filter, and add dishes to your order.</h2>
              </div>
            <div className="menu-actions">
              <input
                type="search"
                className="search-input"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search food items"
                aria-label="Search food items"
              />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                {sortOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="category-tabs">
            {categories.map(item => (
              <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>
                {item}
              </button>
            ))}
          </div>

          <div className="menu-grid">
            {filteredMenu.map(item => (
              <article className={`menu-card ${item.special ? 'special-item' : ''}`} key={item.id}>
                <img src={item.image} alt={item.name} />
                <div className="menu-card-body">
                  <div className="menu-card-top">
                    <div>
                      <h3>{item.name}</h3>
                      <span>{item.category}</span>
                    </div>
                    <strong>₹{item.price}</strong>
                  </div>
                  <p>{item.description}</p>
                  <div className="menu-card-meta">
                    <span>{item.veg ? 'Veg' : 'Non-Veg'}</span>
                    <span>{item.spiceLevel}</span>
                    <span>{item.available ? 'Available' : 'Out of stock'}</span>
                  </div>
                  <div className="menu-card-meta">
                    <span><Star size={14} /> {item.rating}</span>
                    <span>{item.time}</span>
                  </div>
                  <div className="menu-card-actions">
                    <button type="button" className={`secondary-button favorite-button ${favorites.includes(item.id) ? 'favorited' : ''}`} onClick={() => toggleFavorite(item.id)}>
                      <Heart className="heart-icon" size={16} /> {favorites.includes(item.id) ? 'Favorited' : 'Favorite'}
                    </button>
                    <button type="button" className="primary-button" disabled={!item.available} onClick={() => addToCart(item.id)}>
                      Add to cart
                    </button>
                  </div>
                  {cartCounts[item.id] ? <div className="cart-quantity-pill">Qty {cartCounts[item.id]}</div> : null}
                </div>
              </article>
            ))}
          </div>
          </section>
        ) : (
          <section className="menu-section menu-hidden" id="menu">
            <div className="menu-header">
              <div>
                <span className="eyebrow">Digital menu</span>
                <h2>Ready to order when you are.</h2>
                <p>Tap the button below to reveal the full menu and begin adding items to your cart.</p>
              </div>
              <div className="menu-actions">
                <button type="button" className="primary-button" onClick={() => setShowMenu(true)}>
                  Show menu <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </section>
        )}



        {placedOrder ? (
          <section className="menu-section order-confirmation-card">
            <div className="menu-header">
              <div>
                <span className="eyebrow">Order confirmed</span>
                <h2>Your meal is on its way.</h2>
              </div>
              <button type="button" className="secondary-button" onClick={printReceipt}>Print receipt</button>
            </div>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon"><Clock3 size={18} /></div>
                <span>Order ID</span>
                <strong>{placedOrder.orderId}</strong>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><MapPin size={18} /></div>
                <span>Table</span>
                <strong>{tableNumber}</strong>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><Star size={18} /></div>
                <span>Estimated time</span>
                <strong>{placedOrder.eta}</strong>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><Heart size={18} /></div>
                <span>Payment</span>
                <strong>{placedOrder.paymentMethod}</strong>
              </div>
            </div>
            <div className="order-tracking">
              {orderTimeline.map((step, index) => (
                <div key={step} className={`track-step ${index <= placedOrder.statusIndex ? 'active' : ''}`}>
                  <span>{step}</span>
                  <div className="step-dot" />
                </div>
              ))}
            </div>
            <div className="receipt-print">
              <div className="receipt-card">
                <h2>Veranda Kitchen & Bar</h2>
                <p>Order receipt</p>
                <div className="receipt-row">
                  <div>
                    <span>Order ID</span>
                    <strong>{placedOrder.orderId}</strong>
                  </div>
                  <div>
                    <span>Date</span>
                    <strong>{new Date().toLocaleString()}</strong>
                  </div>
                </div>
                <div className="receipt-row">
                  <div>
                    <span>Table</span>
                    <strong>{tableNumber}</strong>
                  </div>
                  <div>
                    <span>Payment</span>
                    <strong>{placedOrder.paymentMethod}</strong>
                  </div>
                </div>
                <div className="receipt-table">
                  <div className="receipt-row header">
                    <span>Item</span>
                    <span>Qty</span>
                    <span>Price</span>
                  </div>
                  {cartEntries.map(item => (
                    <div key={item.id} className="receipt-row">
                      <span>{item.name}</span>
                      <span>{item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="receipt-row">
                    <span>Subtotal</span>
                    <span />
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="receipt-row">
                    <span>GST</span>
                    <span />
                    <span>₹{gst}</span>
                  </div>
                  <div className="receipt-row">
                    <span>Service</span>
                    <span />
                    <span>₹{service}</span>
                  </div>
                  <div className="receipt-row total">
                    <span>Grand total</span>
                    <span />
                    <span>₹{total}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="about-section" id="specials">
          <div className="about-grid">
            <div className="section-copy">
              <span className="eyebrow">Recently ordered</span>
              <h2>Fast reorder and favorite dishes.</h2>
              <p>Bring back the dishes you loved or explore trending plates from our kitchen.</p>
            </div>
            <div className="feature-grid">
              {recentOrders.length === 0 ? (
                <div className="feature-card">
                  <span>No recent orders yet. Place an order to see it here.</span>
                </div>
              ) : recentOrders.map(order => (
                <div key={order.orderId} className="feature-card">
                  <div className="feature-icon"><Clock3 size={18} /></div>
                  <b>{order.orderId}</b>
                  <span>Table {order.table} · ₹{order.total}</span>
                  <small>{order.status}</small>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <Logo />
          <p>Veranda Kitchen & Bar delivers modern Indian cuisine with thoughtful service, smooth ordering, and memorable evenings.</p>
        </div>
        <div className="footer-links">
          <a href="#menu">Menu</a>
          <a href="#cart">Cart</a>
          <a href="#specials">Orders</a>
          <a href="/admin" className="secondary-button footer-admin-link">Admin dashboard</a>
        </div>
      </footer>

      {cartEntries.length > 0 && !placedOrder ? (
        <div className="floating-cart-wrap">
          {floatingCartOpen ? (
            <div className="floating-cart-panel">
              <div className="floating-cart-panel-header">
                <strong>Your order</strong>
                <button type="button" className="text-button" onClick={() => setFloatingCartOpen(false)}>Close</button>
              </div>
              <div className="floating-cart-panel-items">
                {cartEntries.map(item => (
                  <div className="floating-cart-panel-row" key={item.id}>
                    <span style={{ flex: 1 }}>{item.name}</span>
                    <div className="quantity-controls" style={{ gap: '8px' }}>
                      <button type="button" className="secondary-button" style={{ padding: '2px 8px' }} onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" className="secondary-button" style={{ padding: '2px 8px' }} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button type="button" className="text-button" style={{ color: '#dc2626', fontSize: '0.9rem', padding: '2px 4px', marginLeft: '8px' }} onClick={() => removeFromCart(item.id)}>
                      ✕ Remove
                    </button>
                    <strong style={{ minWidth: '60px', textAlign: 'right' }}>₹{item.price * item.quantity}</strong>
                  </div>
                ))}
              </div>
              <div className="floating-cart-panel-total">
                <span>Total payable</span>
                <strong>₹{total}</strong>
              </div>
              <label className="floating-cart-payment-select">
                <span>Pay using</span>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </label>
              <div className="floating-cart-panel-actions">
                <button type="button" className="secondary-button" onClick={placeFromFloatingCart}>
                  Place order
                </button>
                <button type="button" className="primary-button floating-cart-proceed" onClick={payFromFloatingCart}>
                  Pay & place order <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : null}
          <button
            type="button"
            className="floating-cart-bar"
            onClick={() => setFloatingCartOpen(open => !open)}
            aria-expanded={floatingCartOpen}
          >
            <span className="floating-cart-info">
              <span className="floating-cart-count">{cartItemCount} item{cartItemCount > 1 ? 's' : ''} added</span>
              <span className="floating-cart-total">₹{total}</span>
            </span>
            <span className="floating-cart-toggle">
              View order
              <ChevronUp size={18} className={`floating-cart-chevron ${floatingCartOpen ? 'is-open' : ''}`} />
            </span>
          </button>
        </div>
      ) : null}
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Clock3, Heart, MapPin, Phone, Star, Utensils } from 'lucide-react'

const menuItems = [
  { id: 1, name: 'Smoked Paneer Tikka', category: 'Starters', price: 320, rating: 4.9, time: '18 min', image: '/images/paneer-tikka.png', description: 'Charred cottage cheese, bell peppers, mint chutney.' },
  { id: 2, name: 'Saffron Garden Biryani', category: 'Rice & Biryani', price: 460, rating: 4.8, time: '24 min', image: '/images/biryani.png', description: 'Fragrant basmati rice with seasonal vegetables and cooling raita.' },
  { id: 3, name: 'Rose Cardamom Gulab Jamun', category: 'Desserts', price: 180, rating: 4.7, time: '8 min', image: '/images/gulab-jamun.png', description: 'Warm dumplings in rose syrup finished with pistachio.' },
  { id: 4, name: 'Wood-fired Margherita Pizza', category: 'Pizza', price: 390, rating: 4.8, time: '16 min', image: '/images/pizza.png', description: 'Blistered crust with basil, mozzarella, and tomato.' },
  { id: 5, name: 'Crispy Paneer Burger', category: 'Burgers', price: 340, rating: 4.7, time: '14 min', image: '/images/burger.png', description: 'Crispy paneer, house slaw, secret sauce, and fries.' },
  { id: 6, name: 'Wok Tossed Hakka Noodles', category: 'Asian', price: 290, rating: 4.6, time: '12 min', image: '/images/noodles.png', description: 'Stir-fried noodles with vegetables and vibrant soy glaze.' },
  { id: 7, name: 'Dal Makhani Royale', category: 'Dals & Curries', price: 310, rating: 4.9, time: '20 min', image: '/images/curry.png', description: 'Slow-cooked black lentils finished with cream and butter.' },
  { id: 8, name: 'Garlic Butter Roti', category: 'Breads', price: 90, rating: 4.8, time: '7 min', image: '/images/roti.png', description: 'Soft roti brushed with garlic butter and fresh herbs.' },
  { id: 9, name: 'Grilled Veg Club Sandwich', category: 'Sandwiches', price: 280, rating: 4.5, time: '11 min', image: '/images/sandwich.png', description: 'Triple-layer grilled sandwich with cheese and vegetables.' },
  { id: 10, name: 'Kokum Fizz', category: 'Drinks', price: 160, rating: 4.8, time: '5 min', image: '/images/gulab-jamun.png', description: 'Refreshing kokum drink with lime and basil seeds.' },
]

const categories = ['All dishes', 'Starters', 'Pizza', 'Burgers', 'Asian', 'Rice & Biryani', 'Dals & Curries', 'Breads', 'Sandwiches', 'Desserts', 'Drinks']

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

export default function Page() {
  const [category, setCategory] = useState('All dishes')
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () =>
      menuItems
        .filter(item => (category === 'All dishes' || item.category === category) && item.name.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => b.rating - a.rating),
    [category, query],
  )

  return (
    <div className="app-shell restaurant-page">
      <header className="site-header">
        <Logo />
        <nav className="site-nav">
          <a href="#menu">Menu</a>
          <a href="#story">About</a>
          <a href="#specials">Specials</a>
          <a href="#contact">Contact</a>
        </nav>
        <a href="#contact" className="primary-button header-cta">Reserve</a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Modern Indian dining</span>
            <h1>Beautiful food, warm service, memorable evenings.</h1>
            <p>Veranda Kitchen & Bar combines seasonal flavors, handcrafted cocktails, and contemporary hospitality in every experience.</p>
            <div className="hero-actions">
              <a href="#menu" className="primary-button">View menu <ArrowRight size={16} /></a>
              <a href="#contact" className="secondary-button">Book a table</a>
            </div>
            <div className="hero-stat-grid">
              <div>
                <strong>12+</strong>
                <span>Years of dining excellence</span>
              </div>
              <div>
                <strong>4.8</strong>
                <span>Guest satisfaction</span>
              </div>
              <div>
                <strong>60+</strong>
                <span>Seasonal flavors</span>
              </div>
            </div>
          </div>

          <div className="hero-media">
            <img src="/images/restaurant-dining.png" alt="Restaurant dining experience" />
          </div>
        </section>

        <section className="about-section" id="story">
          <div className="about-grid">
            <div className="section-copy">
              <span className="eyebrow">Our story</span>
              <h2>Where authentic flavor meets thoughtful design.</h2>
              <p>From hand-rolled bread to smoky tandoor specials, every dish is made to feel special, inviting, and perfectly balanced.</p>
            </div>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon"><Star size={18} /></div>
                <b>Chef-curated dishes</b>
                <span>Seasonal plates created with fresh ingredients and inspired recipes.</span>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><Utensils size={18} /></div>
                <b>Warm hospitality</b>
                <span>Attentive service that makes every meal feel personal.</span>
              </div>
              <div className="feature-card">
                <div className="feature-icon"><Clock3 size={18} /></div>
                <b>Freshly prepared</b>
                <span>Everything is cooked to order so flavors, textures, and aromas stay vivid.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="menu-section" id="menu">
          <div className="menu-header">
            <div>
              <span className="eyebrow">Signature menu</span>
              <h2>Explore our favorite plates.</h2>
            </div>
            <input
              type="search"
              className="search-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search dishes"
              aria-label="Search dishes"
            />
          </div>

          <div className="category-tabs">
            {categories.map(item => (
              <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>
                {item}
              </button>
            ))}
          </div>

          <div className="menu-grid">
            {filtered.map(item => (
              <article className="menu-card" key={item.id}>
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
                    <span><Heart size={14} /> {item.rating}</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="specials-section" id="specials">
          <div className="section-copy">
            <span className="eyebrow">Chef&rsquo;s specials</span>
            <h2>Perfect for sharing.</h2>
            <p>Experience curated plates made to savour with friends, family, and the full table.</p>
          </div>
          <div className="specials-grid">
            <div className="special-card">
              <img src="/images/biryani.png" alt="Biryani" />
              <div>
                <strong>Saffron Garden Biryani</strong>
                <span>Rich rice layered with seasonal vegetables, saffron, and raita.</span>
              </div>
            </div>
            <div className="special-card">
              <img src="/images/paneer-tikka.png" alt="Paneer Tikka" />
              <div>
                <strong>Smoked Paneer Tikka</strong>
                <span>Charred paneer with peppers, herbs, and mint chutney.</span>
              </div>
            </div>
            <div className="special-card">
              <img src="/images/roti.png" alt="Garlic Roti" />
              <div>
                <strong>Garlic Butter Roti</strong>
                <span>Soft tandoor bread brushed with garlic butter and coriander.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="reserve-section" id="contact">
          <div className="reserve-copy">
            <span className="eyebrow">Visit us</span>
            <h2>Reserve your table today.</h2>
            <p>Enjoy elegant dining in a relaxed setting with flavorful plates and warm hospitality.</p>
            <div className="reserve-list">
              <div>
                <b>Location</b>
                <span><MapPin size={16} /> 24 Veranda Lane, Downtown</span>
              </div>
              <div>
                <b>Hours</b>
                <span>Daily 11:00 am – 11:00 pm</span>
              </div>
              <div>
                <b>Contact</b>
                <span><Phone size={16} /> +91 98765 43210</span>
              </div>
            </div>
          </div>
          <div className="reserve-card">
            <div className="reserve-card-header">
              <span>Ready for a great meal?</span>
              <strong>Book your table now.</strong>
            </div>
            <p>Call ahead to secure your preferred seating or ask about private dining options.</p>
            <a href="tel:+919876543210" className="primary-button">Call to reserve</a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <Logo />
          <p>Veranda Kitchen & Bar delivers modern Indian cuisine with thoughtful service and memorable evenings.</p>
        </div>
        <div className="footer-links">
          <a href="#menu">Menu</a>
          <a href="#story">About</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    </div>
  )
}

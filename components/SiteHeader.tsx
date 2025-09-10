// components/SiteHeader.tsx
"use client";

export default function SiteHeader() {
  return (
    <>
      {/* Top bar */}
      <div className="topbar">
        <div className="container row">
          <div className="left">
            <span className="icon">📞</span>
            <a href="tel:+254706289931">+254 706 289931</a>
            <span style={{opacity:.4}}>•</span>
            <span className="icon">✉️</span>
            <a href="mailto:info@buchcollections.com">info@buchcollections.com</a>
          </div>
          <div className="right">
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">👍</a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">📷</a>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <div className="navbar">
        <div className="container row">
          <a className="brand" href="/">
            {/* If you have a real logo file, drop it in /public and update src */}
            <img src="/logo.png" alt="Buch Collection" onError={(e:any)=>{e.currentTarget.style.display='none'}} />
            <span>Buch Collection & Appliances</span>
          </a>

          <nav className="menu">
            <a href="/">Home</a>
            <a href="#grid">Shoes</a>
            <a href="#grid">Appliances</a>
            <a href="#grid">Fitness Items</a>
            {/* You can link to your static pages later */}
            <a href="/about">About Us</a>
            <a href="/contact">Contact</a>
          </nav>

          <a className="cta" href="#grid">Shop Now</a>
        </div>
      </div>
    </>
  );
}

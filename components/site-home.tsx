"use client";
import { useEffect, useState, useRef } from "react";
import { ArrowUpRight, ArrowDown, Menu, X, Volume2, VolumeX } from "lucide-react";
const links = [["About", "about"], ["Services", "services"], ["Gallery", "gallery"], ["News & events", "news"]];
import type { SiteContent } from '@/lib/content-schema';
function WhatsAppIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.835 11.835 0 005.712 1.461h.005c6.554 0 11.89-5.336 11.893-11.894a11.82 11.82 0 00-3.48-8.413Z"/>
    </svg>
  );
}

function getWhatsAppUrl(phone?: string, text?: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  const number = digits.length === 10 ? `91${digits}` : digits;
  const base = `https://wa.me/${number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export default function Home({content}:{content:SiteContent}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [popDismissed, setPopDismissed] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const whatsappUrl = getWhatsAppUrl(content.contact.whatsapp, "Hi UB Entertainment, I would like to inquire about your production services.");

  const toggleSound = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onEscape);
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.06 });
    document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
    return () => { window.removeEventListener("keydown", onEscape); observer.disconnect(); };
  }, []);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <div className="site-header-inner wrap">
        <a className="brand" href="#top" aria-label="UB Entertainment home"><img src="/assets/ub-logo-transparent.png" alt="UB Entertainment" width="92" height="60"/></a>
        <nav className="desktop-nav" aria-label="Main navigation">{links.map(([name,id]) => <a href={`#${id}`} key={id}>{name}</a>)}</nav>
        <a className="pill header-contact" href="#contact">Let’s talk <ArrowUpRight size={17}/></a>
        <button className="menu-toggle" aria-expanded={menuOpen} aria-controls="mobile-nav" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20}/> : <Menu size={20}/>}</button>
      </div>
      {menuOpen && <nav id="mobile-nav" className="mobile-nav" aria-label="Mobile navigation"><div className="mobile-nav-inner wrap">{[...links,["Contact us","contact"]].map(([name,id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{name}<ArrowUpRight size={20}/></a>)}</div></nav>}
    </header>
    <main id="main">
      <section className="hero wrap" id="top" aria-labelledby="hero-title">
        <div className="eyebrow hero-eyebrow"><span>Independent production house</span><span>Kochi, kerala · Est. 2026</span></div>
        <div className="hero-heading"><h1 id="hero-title">{content.hero.line1}<br/>{content.hero.line2} <span>{content.hero.accent}</span></h1><div className="hero-aside"><p className="preserve-lines">{content.hero.subtitle}</p><a className="text-link" href="#gallery">Explore our world <ArrowDown size={18}/></a></div></div>
        <div className="hero-frame">
          <video
            ref={videoRef}
            className="hero-video"
            src="/assets/logo-anime.mp4"
            poster="/assets/logo-anime-poster.jpg"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-label="UB Entertainment intro animation"
          />
          <div className="hero-frame-top">
            <span>UB ENTERTAINMENT</span>
            <div className="hero-frame-actions">
              <button
                type="button"
                className="hero-sound-btn"
                onClick={toggleSound}
                aria-label={isMuted ? "Unmute intro video" : "Mute intro video"}
              >
                {isMuted ? <VolumeX size={14}/> : <Volume2 size={14}/>}
                <span>{isMuted ? "Sound on" : "Sound off"}</span>
              </button>
              <span>STORIES IN MOTION</span>
            </div>
          </div>
          <div className="hero-frame-bottom"><span>From the first idea.<br/>To the final frame.</span><a href="#about" className="round-link" aria-label="Discover UB Entertainment"><ArrowDown/></a></div>
        </div>
        <div className="frame-caption"><span>A new perspective. A new beginning.</span><span>{content.hero.imageNote}</span></div>
      </section>
      <section id="about" className="section wrap about" aria-labelledby="about-title">
        <div className="about-left">
          <p className="eyebrow section-label">01 / About us</p>
          <h2 id="about-title">Every great story<br/>starts with<br/><span className="gold">a little belief.</span></h2>
          <div className="about-founder-card reveal">
            <div className="about-founder-image">
              <img
                src={content.about.image || "/assets/ukbath.jpg"}
                alt={`${content.about.founder || "Ukbath"} — Founder, UB Entertainments`}
                width="600"
                height="750"
                loading="lazy"
              />
            </div>
            <div className="about-founder-caption">
              <div>
                <span className="founder-name">{content.about.founder || "Ukbath"}</span>
                <span className="founder-title">Founder & Visionary</span>
              </div>
              <span className="founder-company">UB ENTERTAINMENTS</span>
            </div>
          </div>
        </div>
        <div className="about-copy">
          <p className="lead">{content.about.lead}</p>
          <p>{content.about.body}</p>
          <div className="about-details">
            <span>BASED IN<strong>Kochi, kerala</strong></span>
            <span>ESTABLISHED<strong>2026</strong></span>
            <span>FOUNDED BY<strong>{content.about.founder || "Ukbath"}</strong></span>
          </div>
        </div>
      </section>
      <section id="services" className="section wrap" aria-labelledby="services-title">
        <p className="eyebrow section-label">02 / Our services</p>
        <div className="section-heading reveal"><h2 id="services-title">Different formats.<br/><span className="gold">The same passion.</span></h2><p>From a world on the big screen to a story in a few minutes. We make every frame count.</p></div>
        <div className="services-grid">{content.services.map((service,index) => <article className="service-card reveal" key={service.id}>
          <div className="service-image"><img src={service.image} alt={service.alt} loading="lazy" width="700" height="500"/><span className="image-number">{String(index+1).padStart(2,"0")}</span></div>
          <div className="service-title"><h3>{service.title}</h3><a className="service-enquire" href={whatsappUrl ? getWhatsAppUrl(content.contact.whatsapp, `Hi UB Entertainment, I would like to inquire about your ${service.title.toLowerCase()} services.`) : "#contact"} target={whatsappUrl ? "_blank" : undefined} rel={whatsappUrl ? "noopener noreferrer" : undefined} aria-label={`Enquire about ${service.title.toLowerCase()}`}><ArrowUpRight size={23}/></a></div>
          <p>{service.description}</p><span className="service-tags">{service.tags}</span>
        </article>)}</div>
      </section>
      <section id="gallery" className="section wrap" aria-labelledby="gallery-title">
        <p className="eyebrow section-label">03 / Gallery</p>
        <div className="section-heading reveal"><h2 id="gallery-title">A world in<br/><span className="gold">every frame.</span></h2><div><p>{content.gallery.description}</p><p className="gallery-note">{content.gallery.note}</p></div></div>
        <div className="gallery-grid">
          {content.gallery.items.map((item,index)=><figure key={item.id} className={index===0 ? "gallery-feature reveal" : "reveal"}><div className="gallery-image"><img src={item.image} alt={item.alt} width="1400" height="1000" loading="lazy"/></div><figcaption><span>{item.title}</span><span>{item.category}</span></figcaption></figure>)}
        </div>{content.gallery.items.length===0 && <p className="gallery-note">Project stills coming soon.</p>}
      </section>
      <section id="news" className="section wrap" aria-labelledby="news-title">
        <p className="eyebrow section-label">04 / News & events</p>
        <div className="section-heading reveal"><h2 id="news-title">The next chapter.</h2><p>Announcements, new projects, and moments from our journey.</p></div>
        {content.news.map(item=><article key={item.id} className="news-feature reveal"><div className="news-brand"><img src={item.image} alt={item.title} width="1536" height="1024" loading="lazy"/></div><div className="news-copy"><div className="eyebrow"><span>{item.category}</span><time dateTime={item.date}>{item.date}</time></div><h3>{item.title}</h3><p className="preserve-lines">{item.body}</p></div></article>)}
        <div className="upcoming"><span className="eyebrow">Coming next</span><p>Project announcements and event updates will appear here.</p><span className="upcoming-label">STAY TUNED</span></div>
      </section>
      <section id="contact" className="contact section wrap" aria-labelledby="contact-title">
        <p className="eyebrow section-label">05 / Contact us</p>
        <div className="contact-heading reveal"><h2 id="contact-title">Have a story<br/>in <span className="gold">mind?</span></h2><ArrowUpRight className="contact-arrow" strokeWidth={1}/></div>
        <div className="contact-bottom"><p>Let’s make something<br/>worth watching.</p><div className="contact-location"><span className="eyebrow">Find us in</span><span>{content.contact.location}<br/>India</span></div><div className="contact-info"><span className="eyebrow">Let’s connect</span>{content.contact.email && <a href={'mailto:'+content.contact.email}>{content.contact.email}</a>}{content.contact.phone && <a href={'tel:'+content.contact.phone.replace(/[^+0-9]/g,'')}>{content.contact.phone}</a>}{whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="whatsapp-contact-link"><WhatsAppIcon size={16}/><span>WhatsApp ↗</span></a>}{content.contact.instagram && <a href={content.contact.instagram} target="_blank" rel="noreferrer">Instagram ↗</a>}{content.contact.youtube && <a href={content.contact.youtube} target="_blank" rel="noreferrer">YouTube ↗</a>}{!content.contact.email && !content.contact.phone && !whatsappUrl && !content.contact.instagram && !content.contact.youtube && <><span>Contact details coming soon.</span><p>Email, phone, and social links<br/>will be added here.</p></>}</div></div>
      </section>
    </main>
    <footer className="wrap footer"><div className="footer-top"><a href="#top" className="footer-wordmark" aria-label="UB Entertainment home">UB ENTERTAINMENT</a><a href="#top" className="back-top">Back to top <ArrowUpRight size={17}/></a></div><div className="footer-bottom"><span>© 2026 UB Entertainment</span><a href="/admin" className="admin-entry-link">Admin</a><span>KOCHI, KERALA · EST. 2026</span><details className="credits"><summary>Image credits</summary><div><p>Representative imagery from Unsplash:</p><a href="https://unsplash.com/photos/a-group-of-people-standing-around-a-camera-iXYP5bkc-Bs" target="_blank" rel="noreferrer">Film crew — Oleg Brovchenko</a><a href="https://unsplash.com/photos/a-winding-road-in-the-middle-of-a-desert-yYjk2bfqgUU" target="_blank" rel="noreferrer">Landscape — Weichao Deng</a><a href="https://unsplash.com/photos/a-man-singing-on-stage-with-yellow-lights-CbnG4eGAtz8" target="_blank" rel="noreferrer">Music — Pravin Shinde</a></div></details></div></footer>
    {whatsappUrl && (
      <aside className="whatsapp-floating-widget" aria-label="WhatsApp quick contact">
        {!popDismissed && (
          <div className="whatsapp-pop-bubble">
            <button
              type="button"
              className="whatsapp-pop-close"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPopDismissed(true); }}
              aria-label="Dismiss chat bubble"
            >
              <X size={13} />
            </button>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="whatsapp-pop-body">
              <span className="whatsapp-pop-badge">● Online</span>
              <span className="whatsapp-pop-title">UB Entertainment</span>
              <span className="whatsapp-pop-msg">Chat with us on WhatsApp 👋</span>
            </a>
          </div>
        )}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-pop-btn"
          aria-label="Chat with UB Entertainment on WhatsApp"
          id="whatsapp-chat-button"
        >
          <span className="whatsapp-pulse-ring" aria-hidden="true" />
          <WhatsAppIcon size={30} />
          <span className="whatsapp-online-dot" aria-hidden="true" />
        </a>
      </aside>
    )}
  </>;
}


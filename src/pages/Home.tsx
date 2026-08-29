import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Award, Palette, ShieldCheck, ChevronDown, Sparkles, Compass, User } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { artworkService } from '../services/artworkService';
import { whatsappService } from '../services/whatsappService';
import { ArtworkCard } from '../components/artwork/ArtworkCard';
import { SEO } from '../components/layout/SEO';

export const Home: React.FC = () => {
  const featuredArtworks = artworkService.getFeaturedArtworks(6);
  const categories = artworkService.getCategories();

  const whatsappNumber = whatsappService.getPhoneNumber();
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Dhruvi, I am exploring your home page and would like to inquire about your original artwork.')}`;

  // 1. Hero scroll transforms (Layer 1 -> Layer 2 Stacking)
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroContainerRef,
    offset: ['start start', 'end start'],
  });
  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.92]);
  const heroOpacity = useTransform(heroProgress, [0, 0.75], [1, 0.4]);
  const heroY = useTransform(heroProgress, [0, 1], ['0%', '15%']);

  // 2. Featured Paintings scroll transforms (Layer 2 -> Layer 3 Stacking)
  const featuredContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: featuredProgress } = useScroll({
    target: featuredContainerRef,
    offset: ['end end', 'end start'],
  });
  const featuredScale = useTransform(featuredProgress, [0, 1], [1, 0.95]);
  const featuredOpacity = useTransform(featuredProgress, [0, 0.85], [1, 0.65]);

  // 3. Collections scroll transforms (Layer 3 -> Layer 4 Stacking)
  const collectionsContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: collectionsProgress } = useScroll({
    target: collectionsContainerRef,
    offset: ['end end', 'end start'],
  });
  const collectionsScale = useTransform(collectionsProgress, [0, 1], [1, 0.95]);
  const collectionsOpacity = useTransform(collectionsProgress, [0, 0.85], [1, 0.65]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "ArtGallery",
    "name": "pencillymask — Dhruvi's Art Studio",
    "description": "Original contemporary fine art paintings, rich textural oils, gold leaf canvases, and 1-of-1 private collection artworks by Dhruvi.",
    "url": "https://dhruvisportfolio.com",
    "image": "https://dhruvisportfolio.com/hero-koi.jpg",
    "telephone": "+919930777598",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    }
  };

  return (
    <div className="relative w-full bg-gallery-bg selection:bg-gallery-gold/30">
      <SEO
        title="Original Paintings & Fine Art Studio"
        description="Explore 100% authentic 1-of-1 contemporary fine art paintings, rich impasto oils, 24K gold leaf canvases, and curated collections by artist Dhruvi."
        schema={homeSchema}
      />

      {/* ========================================================================= */}
      {/* 1. STACK LAYER 1: Full-Screen Luxury Hero Artwork Section                 */}
      {/* ========================================================================= */}
      <div ref={heroContainerRef} className="relative h-[88vh] sm:h-[94vh] w-full bg-[#071526]">
        <motion.section
          style={{
            scale: heroScale,
            opacity: heroOpacity,
            y: heroY,
          }}
          className="sticky top-20 h-[calc(88vh-80px)] sm:h-[calc(94vh-80px)] w-full flex items-center bg-[#071526] text-white overflow-hidden origin-top"
        >
          {/* Background Artwork Image on the Right */}
          <div className="absolute inset-0 z-0 flex justify-end">
            <img
              src="/hero-koi.jpg"
              alt="Original Art by Dhruvi - Koi Fish Painting"
              className="w-full lg:w-[65%] h-full object-cover object-center scale-100 transition-transform duration-1000"
            />
            {/* Gradient Overlay for seamless text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#071526] via-[#071526]/90 to-transparent lg:via-[#071526]/80 lg:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071526] via-transparent to-transparent opacity-80" />
          </div>

          {/* Hero Left Content Container */}
          <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full py-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl space-y-6 text-left"
            >
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="pencillymask logo"
                  className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_4px_16px_rgba(255,255,255,0.2)]"
                />
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-gallery-gold-light text-[11px] font-semibold tracking-widest uppercase shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-gallery-gold" />
                  <span>Dhruvi's Art Studio</span>
                </div>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-wider text-white uppercase leading-[1.1]">
                ORIGINAL ART<br />BY DHRUVI
              </h1>

              <p className="text-base sm:text-xl text-slate-200/90 font-sans max-w-lg leading-relaxed pt-1">
                Expressing emotions, nature and life through colors and textures.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  to="/collection"
                  className="px-8 py-3.5 bg-white text-[#071526] hover:bg-gallery-gold hover:text-white font-semibold text-xs tracking-[0.2em] uppercase rounded-xs transition-all shadow-xl font-sans"
                >
                  EXPLORE COLLECTION
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-xs font-semibold text-xs tracking-[0.15em] uppercase flex items-center gap-2 transition-all backdrop-blur-xs font-sans"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>INQUIRE ON WHATSAPP</span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Scroll Down Prompt */}
          <motion.button
            type="button"
            onClick={() => scrollToSection('featured-section-stack')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-white/70 hover:text-gallery-gold transition-colors group cursor-pointer"
            aria-label="Scroll to featured paintings"
          >
            <span className="text-[10px] uppercase tracking-[0.25em] font-medium group-hover:tracking-[0.3em] transition-all">
              Explore Featured Works
            </span>
            <ChevronDown className="w-4 h-4 animate-bounce text-gallery-gold" />
          </motion.button>
        </motion.section>
      </div>

      {/* ========================================================================= */}
      {/* 2. STACK LAYER 2: Highlights & Featured Masterpieces Showcase              */}
      {/* ========================================================================= */}
      <div ref={featuredContainerRef} className="relative z-20">
        <motion.div
          id="featured-section-stack"
          style={{
            scale: featuredScale,
            opacity: featuredOpacity,
          }}
          className="relative bg-gallery-bg rounded-t-[36px] sm:rounded-t-[52px] shadow-[0_-30px_70px_rgba(0,0,0,0.45)] border-t border-gallery-gold/30 -mt-10 sm:-mt-16 pt-10 sm:pt-14 pb-20 space-y-20 sm:space-y-24 origin-top transition-transform"
        >
          {/* Card Stack Indicator Handle */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 sm:w-20 h-1.5 bg-gallery-border/90 rounded-full" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-gallery-muted/70 font-semibold">
              Featured Gallery
            </span>
          </div>

          {/* Key Highlights / Provenance Banner */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-gallery-card/60 rounded-xl border border-gallery-border/70 text-center shadow-gallery backdrop-blur-xs"
            >
              <div className="space-y-2 p-4">
                <Award className="w-8 h-8 text-gallery-gold mx-auto" />
                <h3 className="font-serif text-lg text-gallery-dark font-medium">100% Original Paintings</h3>
                <p className="text-xs text-gallery-muted">Every piece is an authentic 1-of-1 original work created in studio.</p>
              </div>
              <div className="space-y-2 p-4 border-y md:border-y-0 md:border-x border-gallery-border">
                <Palette className="w-8 h-8 text-gallery-gold mx-auto" />
                <h3 className="font-serif text-lg text-gallery-dark font-medium">Archival Quality Materials</h3>
                <p className="text-xs text-gallery-muted">Belgian linen, lightfast oil pigments, and genuine 24K gold leaf accents.</p>
              </div>
              <div className="space-y-2 p-4">
                <ShieldCheck className="w-8 h-8 text-gallery-gold mx-auto" />
                <h3 className="font-serif text-lg text-gallery-dark font-medium">Insured White-Glove Shipping</h3>
                <p className="text-xs text-gallery-muted">Custom reinforced crating and fully insured door-to-door worldwide delivery.</p>
              </div>
            </motion.div>
          </section>

          {/* Featured Artworks Showcase */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col md:flex-row md:items-end justify-between border-b border-gallery-border pb-4"
            >
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-gallery-gold font-bold">Curated Selection</span>
                <h2 className="font-serif text-3xl sm:text-4xl text-gallery-dark mt-1">Featured Masterpieces</h2>
              </div>
              <Link
                to="/available-art"
                className="mt-4 md:mt-0 text-xs font-semibold uppercase tracking-wider text-gallery-gold-dark hover:underline flex items-center gap-1 group"
              >
                <span>View All Available Art</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <div className="columns-1 sm:columns-2 md:columns-3 gap-6 space-y-6">
              {featuredArtworks.map((artwork, idx) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 40, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    duration: 0.65,
                    delay: (idx % 3) * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="break-inside-avoid"
                >
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                  />
                </motion.div>
              ))}
            </div>
          </section>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* 3. STACK LAYER 3: Fine Art Artwork Collections Overview (Midnight Theme)  */}
      {/* ========================================================================= */}
      <div ref={collectionsContainerRef} className="relative z-30">
        <motion.div
          id="collections-section-stack"
          style={{
            scale: collectionsScale,
            opacity: collectionsOpacity,
          }}
          className="relative bg-[#071526] text-white rounded-t-[36px] sm:rounded-t-[52px] shadow-[0_-35px_80px_rgba(0,0,0,0.65)] border-t border-gallery-gold/40 -mt-12 sm:-mt-16 pt-12 sm:pt-16 pb-24 origin-top transition-transform"
        >
          {/* Card Stack Indicator Handle */}
          <div className="flex flex-col items-center gap-2 mb-10">
            <div className="w-16 sm:w-20 h-1.5 bg-white/20 rounded-full" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-gallery-gold-light/80 font-semibold flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-gallery-gold" />
              <span>Themed Collections</span>
            </span>
          </div>

          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto space-y-3"
            >
              <span className="text-xs uppercase tracking-[0.25em] text-gallery-gold font-bold">Explore Themes</span>
              <h2 className="font-serif text-3xl sm:text-5xl text-white tracking-wide">Artwork Collections</h2>
              <p className="text-sm text-slate-300/80 leading-relaxed">
                Discover curated series grouped by expressive medium, harmonious color palettes, and artistic philosophy.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat, idx) => {
                const catArts = artworkService.getArtworks({ categorySlug: cat.slug, limit: 1 }).artworks;
                const catImage = catArts[0]?.images?.[0]?.storagePath || (idx === 0 ? '/hero-koi.jpg' : null);

                const gradientThemes = [
                  'from-[#0b1e36] via-[#10294a] to-[#1a3d69]',
                  'from-[#192238] via-[#2a233d] to-[#152a42]',
                  'from-[#122b22] via-[#1c3f35] to-[#102d33]',
                  'from-[#301b22] via-[#452731] to-[#251b2c]',
                ];
                const bgGradient = gradientThemes[idx % gradientThemes.length];

                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    <Link
                      to={`/collection?category=${cat.slug}`}
                      className={`group relative h-84 rounded-xl overflow-hidden shadow-xl flex flex-col justify-end p-6 border border-white/10 hover:border-gallery-gold/70 transition-all duration-300 bg-gradient-to-br ${bgGradient}`}
                    >
                      {catImage && (
                        <img
                          src={catImage}
                          alt={cat.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#071526]/95 via-[#071526]/60 to-transparent" />

                      <div className="relative z-10 text-white space-y-1.5">
                        <h3 className="font-serif text-xl sm:text-2xl group-hover:text-gallery-gold-light transition-colors">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-slate-200/80 line-clamp-2">{cat.description}</p>
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-gallery-gold-light pt-2 group-hover:gap-2.5 transition-all">
                          Explore Category <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </section>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* 4. STACK LAYER 4: Artist Biography & Studio Statement                      */}
      {/* ========================================================================= */}
      <div className="relative z-40">
        <div
          id="about-section-stack"
          className="relative bg-gallery-bg text-gallery-dark rounded-t-[36px] sm:rounded-t-[52px] shadow-[0_-35px_80px_rgba(0,0,0,0.45)] border-t border-gallery-gold/30 -mt-12 sm:-mt-16 pt-12 sm:pt-16 pb-28 origin-top"
        >
          {/* Card Stack Indicator Handle */}
          <div className="flex flex-col items-center gap-2 mb-10">
            <div className="w-16 sm:w-20 h-1.5 bg-gallery-border/90 rounded-full" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-gallery-muted/70 font-semibold flex items-center gap-1.5">
              <User className="w-3 h-3 text-gallery-gold" />
              <span>Studio & Provenance</span>
            </span>
          </div>

          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white p-8 lg:p-14 rounded-2xl border border-gallery-border shadow-gallery-lg"
            >
              {/* Artist Portrait */}
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-xl select-none">
                <img
                  src="/artist-dhruvi.jpeg"
                  alt="Artist Dhruvi Portrait"
                  onContextMenu={e => e.preventDefault()}
                  onDragStart={e => e.preventDefault()}
                  className="w-full h-full object-cover object-top select-none pointer-events-none"
                />
                <div className="image-shield" onContextMenu={e => e.preventDefault()} />
                <div className="absolute bottom-4 left-4 right-4 p-4 sm:p-5 bg-gallery-dark/85 backdrop-blur-md text-white rounded-lg text-xs border border-white/15 z-10 shadow-lg">
                  <p className="font-serif italic text-sm leading-snug">"Painting is an act of listening—translating organic rhythm into visual harmony."</p>
                  <span className="block mt-2 uppercase text-[10px] tracking-widest text-gallery-gold-light font-sans font-medium">— Dhruvi</span>
                </div>
              </div>

              {/* Artist Statement */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="pencillymask logo"
                    className="h-10 sm:h-12 w-auto object-contain"
                  />
                  <span className="text-xs uppercase tracking-[0.25em] text-gallery-gold font-bold">Dhruvi's Art Studio</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-gallery-dark leading-tight">
                  pencillymask
                </h2>
                <p className="text-sm sm:text-base text-gallery-muted leading-relaxed">
                  Based in India, Dhruvi is an independent contemporary artist whose work synthesizes tactile impasto textures, luminous gold leaf accents, and minimalist spatial elegance.
                </p>
                <p className="text-sm sm:text-base text-gallery-muted leading-relaxed">
                  With over 200 original creations held in private collections globally, her paintings explore the intersection between quiet mindfulness and dynamic visual resonance.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <Link
                    to="/about"
                    className="px-7 py-3.5 bg-gallery-dark hover:bg-gallery-gold text-white text-xs uppercase tracking-widest rounded transition-colors font-medium shadow-md"
                  >
                    Read Full Biography
                  </Link>
                  <Link
                    to="/contact"
                    className="px-6 py-3.5 text-xs text-gallery-dark hover:text-gallery-gold font-semibold uppercase tracking-wider underline transition-colors"
                  >
                    Inquire Commission
                  </Link>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </div>
    </div>
  );
};



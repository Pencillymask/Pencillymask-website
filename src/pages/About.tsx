import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Sparkles, MapPin, HeartHandshake } from 'lucide-react';
import { SEO } from '../components/layout/SEO';

export const About: React.FC = () => {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Dhruvi",
    "alternateName": "pencillymask",
    "jobTitle": "Contemporary Fine Artist",
    "description": "Contemporary visual artist specializing in textured impasto oils, gold leaf accents, and expressive abstract fine art.",
    "image": "https://dhruvisportfolio.com/artist-dhruvi.jpeg",
    "url": "https://dhruvisportfolio.com/about"
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-fadeIn">
      <SEO
        title="About the Artist — Dhruvi"
        description="Learn about contemporary artist Dhruvi (pencillymask), her creative journey in abstract textural fine art, and studio practice."
        image="/artist-dhruvi.jpeg"
        schema={aboutSchema}
      />

      {/* Header / Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="flex justify-center">
          <img
            src="/logo.png"
            alt="pencillymask logo"
            className="h-16 w-auto object-contain drop-shadow-md"
          />
        </div>
        <span className="text-xs uppercase tracking-[0.25em] text-gallery-gold font-bold">Biography & Philosophy</span>
        <h1 className="font-serif text-4xl sm:text-5xl text-gallery-dark font-normal">
          Dhruvi • pencillymask
        </h1>
        <p className="font-serif italic text-lg text-gallery-muted">
          "Capturing nature's silent poetry in layers of texture and light."
        </p>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        {/* Left: Portrait & Studio Image (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border border-gallery-border select-none">
            <img
              src="/artist-dhruvi.jpeg"
              alt="Artist Dhruvi"
              onContextMenu={e => e.preventDefault()}
              onDragStart={e => e.preventDefault()}
              className="w-full h-full object-cover object-top pointer-events-none select-none"
            />
            <div className="image-shield" onContextMenu={e => e.preventDefault()} />
          </div>
          <div className="p-4 bg-gallery-card/60 rounded-lg border border-gallery-border text-xs text-gallery-muted flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gallery-gold shrink-0" />
            <span>Studio based in India • International private collector shipping</span>
          </div>
        </div>

        {/* Right: Artist Journey & Philosophy (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-4">
            <h2 className="font-serif text-3xl text-gallery-dark font-medium">Creative Journey</h2>
            <p className="text-sm text-gallery-muted leading-relaxed font-sans">
              Every painting begins with a feeling, an idea, or a moment of inspiration. I’m Dhruvi Gogari, and through abstract and texture art, I transform those emotions into layers of colour, form, and depth.
            </p>
            <p className="text-sm text-gallery-muted leading-relaxed font-sans">
              My creative process is guided by curiosity and intuition. I enjoy experimenting with textures, shapes, and colours to create artworks that feel expressive, contemporary, and unique. No two paintings are exactly alike, because each one carries its own journey.
            </p>
            <p className="text-sm text-gallery-muted leading-relaxed font-sans">
              I believe a beautiful artwork should do more than decorate a space—it should create an atmosphere, evoke emotion, and become something you connect with over time.
            </p>
          </div>

          {/* Mediums & Specialization */}
          <div className="pt-4">
            <div className="p-4 bg-white rounded-lg border border-gallery-border space-y-1">
              <Sparkles className="w-5 h-5 text-gallery-gold" />
              <h3 className="font-serif text-base text-gallery-dark font-medium">Abstract Expression</h3>
              <p className="text-xs text-gallery-muted leading-relaxed">
                Exploring colour, form, and emotion through expressive abstract compositions that invite every viewer to find their own meaning.
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center space-x-4">
            <Link
              to="/collection"
              className="px-6 py-3 bg-gallery-dark hover:bg-gallery-gold text-white text-xs uppercase tracking-widest rounded transition-colors font-medium"
            >
              Browse Gallery
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 border border-gallery-border text-gallery-dark hover:bg-gallery-card text-xs uppercase tracking-widest rounded transition-colors font-medium"
            >
              Inquire Commission
            </Link>
          </div>
        </div>
      </div>

      {/* Solo & Group Exhibition Timeline */}
      <div className="space-y-6 pt-12 border-t border-gallery-border">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <Award className="w-8 h-8 text-gallery-gold mx-auto" />
          <h2 className="font-serif text-3xl text-gallery-dark">Selected Exhibitions</h2>
          <p className="text-xs text-gallery-muted">Solo shows and curated group fine art exhibitions.</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {[
            { year: '2026', title: 'Lumina: Reflections in Texture & Gold', location: 'Jahangir Art Gallery, Mumbai' },
            { year: '2025', title: 'Earth & Atmosphere Contemporary Showcase', location: 'Fine Arts Guild, New Delhi' },
            { year: '2024', title: 'Silence & Solitude: Oil Impasto Series', location: 'India Art Fair Contemporary Wing' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gallery-border rounded-lg shadow-xs">
              <div>
                <span className="text-xs font-mono text-gallery-gold font-bold uppercase tracking-wider">{item.year}</span>
                <h4 className="font-serif text-base text-gallery-dark font-medium">{item.title}</h4>
                <p className="text-xs text-gallery-muted">{item.location}</p>
              </div>
              <HeartHandshake className="w-5 h-5 text-gallery-muted/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

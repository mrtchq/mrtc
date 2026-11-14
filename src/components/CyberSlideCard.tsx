import React from 'react';
import { formatSectorLabel } from '../utils/cognitiveEngine';

interface CyberSlideCardProps {
  slideIndex: number;
  totalSlides: number;
  sectionLabel: string;
}

const TRACKER_CELLS = Array.from({ length: 25 }, (_, i) => i + 1);
const CYBER_LINE_INDICES = [0, 1, 2, 3];
const PARTICLE_INDICES = [0, 1, 2, 3, 4, 5];
const CORNER_INDICES = [0, 1, 2, 3];

export function CyberSlideCard({ slideIndex, totalSlides, sectionLabel }: CyberSlideCardProps) {
  const paddedNumber = String(slideIndex + 1).padStart(2, '0');
  const sectorText = formatSectorLabel(slideIndex, totalSlides);

  return (
    <div
      className="cyber-card-container noselect"
      data-testid={`cyber-card-${slideIndex + 1}`}
      aria-label={`Slide ${paddedNumber} of ${String(totalSlides).padStart(2, '0')} — ${sectionLabel}`}
    >
      <div className="cyber-canvas">
        {TRACKER_CELLS.map((num) => (
          <div key={num} className={`tracker tr-${num}`} />
        ))}

        <div className="cyber-card">
          <div className="cyber-card-content">
            <div className="card-glare" />

            <div className="cyber-lines" aria-hidden="true">
              {CYBER_LINE_INDICES.map((i) => (
                <span key={i} />
              ))}
            </div>

            <div className="cyber-slide-badge" aria-hidden="true">
              {sectorText} · {sectionLabel.toUpperCase()}
            </div>

            <div className="cyber-title">
              <span className="cyber-title-kicker">SLIDE</span>
              <span className="cyber-title-number" data-testid={`slide-number-${slideIndex + 1}`}>
                {paddedNumber}
              </span>
            </div>

            <div className="glowing-elements" aria-hidden="true">
              <div className="glow-1" />
              <div className="glow-2" />
              <div className="glow-3" />
            </div>

            <div className="cyber-subtitle">
              <span>INTERACTIVE</span>
              <span className="highlight">3D EFFECT</span>
            </div>

            <div className="card-particles" aria-hidden="true">
              {PARTICLE_INDICES.map((i) => (
                <span key={i} />
              ))}
            </div>

            <div className="corner-elements" aria-hidden="true">
              {CORNER_INDICES.map((i) => (
                <span key={i} />
              ))}
            </div>

            <div className="scan-line" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Announcement marquee items for slide 1 of mrtc.me.
// Edit this one list to change what scrolls across the top of the hero.
// First item (2026-11-14, TC): live stream Mon Nov 16, 2026, 9:00 PM EST.
// Keep the wording generic -- TC has not named the stream topic.
// href is optional: items without one render as plain text.
export interface MarqueeItem {
  text: string;
  href?: string;
}

export const MARQUEE_ITEMS: MarqueeItem[] = [
  { text: 'Something big is coming this weekend — Launch Day Saturday · Live Sunday 9 PM ET' },
];

import { TOTAL_SLIDES } from './cognitiveEngine';

export interface SiteRouteSpec {
  route: string;
  slideIndex: number;
  slideNumber: string;
  sectionId: string;
  label: string;
  summary: string;
  aliases: string[];
}

export interface SitePanelSpec {
  id: 'welcome-guide' | 'account-menu';
  label: string;
  summary: string;
  aliases: string[];
}

export const SITE_ROUTES: SiteRouteSpec[] = [
  {
    route: '/',
    slideIndex: 0,
    slideNumber: '01',
    sectionId: 'hero',
    label: 'Overview',
    summary: 'Overview slide with the interactive Voice Orb, Test the Modes button, and Join the Waitlist button.',
    aliases: [
      '/',
      '/overview',
      '/hero',
      'overview',
      'home',
      'hero',
      'start',
      'orb',
      'voice orb',
      'main',
      'slide 1',
      'slide 01',
      'first slide',
      '1',
    ],
  },
  {
    route: '/system',
    slideIndex: 1,
    slideNumber: '02',
    sectionId: 'dual-hemisphere',
    label: 'System',
    summary: 'Slide 02 (System sector) showcasing the dual-hemisphere cognitive architecture card.',
    aliases: [
      '/system',
      '/dual-hemisphere',
      'system',
      'dual-hemisphere',
      'dual hemisphere',
      'hemisphere',
      'architecture',
      'slide 2',
      'slide 02',
      'second slide',
      '2',
    ],
  },
  {
    route: '/modes',
    slideIndex: 2,
    slideNumber: '03',
    sectionId: 'copilot-modes',
    label: 'Modes',
    summary: 'Slide 03 (Modes sector) showcasing the cognitive co-pilot modes card.',
    aliases: [
      '/modes',
      '/copilot-modes',
      'modes',
      'copilot-modes',
      'copilot modes',
      'co-pilot modes',
      'test the modes',
      'task anchor',
      'kaleidoscope',
      'dopamine pacer',
      'slide 3',
      'slide 03',
      'third slide',
      '3',
    ],
  },
  {
    route: '/matrix',
    slideIndex: 3,
    slideNumber: '04',
    sectionId: 'biometric-matrix',
    label: 'Matrix',
    summary: 'Slide 04 (Matrix sector) showcasing the biometric synapse matrix card.',
    aliases: [
      '/matrix',
      '/biometric-matrix',
      'matrix',
      'biometric-matrix',
      'biometric matrix',
      'telemetry',
      'synapse',
      'nodes',
      'slide 4',
      'slide 04',
      'fourth slide',
      '4',
    ],
  },
  {
    route: '/access',
    slideIndex: 4,
    slideNumber: '05',
    sectionId: 'waitlist',
    label: 'Access',
    summary: 'Slide 05 (Access sector) for early access and waitlist registration.',
    aliases: [
      '/access',
      '/waitlist',
      'access',
      'waitlist',
      'join the waitlist',
      'early access',
      'signup',
      'sign up',
      'register',
      'slide 5',
      'slide 05',
      'fifth slide',
      'last slide',
      '5',
    ],
  },
];

export const SITE_PANELS: SitePanelSpec[] = [
  {
    id: 'welcome-guide',
    label: 'Interface Guide',
    summary: 'The glass-morphic welcome modal explaining the Voice Orb, five-sector navigation, and Google sign-in.',
    aliases: [
      'welcome-guide',
      'welcome guide',
      'welcome',
      'welcome modal',
      'interface guide',
      'guide',
      'help',
      'tutorial',
      'onboarding',
      'how it works',
    ],
  },
  {
    id: 'account-menu',
    label: 'Google Account Menu',
    summary: 'The top-right Google account menu with user profile details and sign-out controls.',
    aliases: [
      'account-menu',
      'account menu',
      'account',
      'profile',
      'profile menu',
      'google account',
      'sign in menu',
      'user menu',
    ],
  },
];

export const ALLOWED_EXTERNAL_HOSTS: readonly string[] = [];

export interface CurrentLocationSnapshot {
  route: string;
  hash: string;
  slideIndex: number;
  slideNumber: string;
  totalSlides: number;
  sectionId: string;
  label: string;
  summary: string;
  openPanels: string[];
  historyDepth: number;
  canGoBack: boolean;
}

export interface ClosestMatchOffer {
  kind: 'route' | 'panel';
  target: string;
  label: string;
  summary: string;
}

export interface NavigationToolResult {
  ok: boolean;
  found: boolean;
  reason?: 'external_url_blocked' | 'not_found' | 'no_history' | 'panel_requires_signin' | 'panel_not_open' | 'bridge_error';
  message: string;
  currentLocation: CurrentLocationSnapshot;
  closestMatch?: ClosestMatchOffer;
  availableRoutes?: Array<{ route: string; sectionId: string; label: string }>;
  availablePanels?: Array<{ id: string; label: string }>;
}

export interface NavigationBridgeBindings {
  getActiveSlideIndex: () => number;
  goToSlide: (slideIndex: number) => void;
  getOpenPanels: () => string[];
  openPanelById: (panelId: SitePanelSpec['id']) => { ok: boolean; reason?: 'panel_requires_signin'; message?: string };
  closePanelById: (panelId?: SitePanelSpec['id'] | 'all') => { ok: boolean; closed: string[] };
  scrollElementIntoView?: (sectionId: string) => boolean;
}

function normalizeQuery(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^#/, '')
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ');
}

export interface ParsedSameSiteTarget {
  ok: boolean;
  blockedExternal: boolean;
  pathname: string;
  hash: string;
  normalized: string;
}

export function parseSameSiteTarget(rawTarget: string, currentOrigin?: string): ParsedSameSiteTarget {
  const trimmed = (rawTarget ?? '').trim();
  if (!trimmed) {
    return { ok: false, blockedExternal: false, pathname: '', hash: '', normalized: '' };
  }

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) {
    return { ok: false, blockedExternal: true, pathname: '', hash: '', normalized: '' };
  }

  if (trimmed.startsWith('//')) {
    return { ok: false, blockedExternal: true, pathname: '', hash: '', normalized: '' };
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const origin = currentOrigin ?? (typeof window !== 'undefined' ? window.location.origin : '');
      const isSameOrigin = origin && parsed.origin === origin;
      const isAllowlisted = ALLOWED_EXTERNAL_HOSTS.includes(parsed.hostname.toLowerCase());
      if (!isSameOrigin && !isAllowlisted) {
        return { ok: false, blockedExternal: true, pathname: '', hash: '', normalized: '' };
      }
      return {
        ok: true,
        blockedExternal: false,
        pathname: parsed.pathname,
        hash: parsed.hash.replace(/^#/, ''),
        normalized: normalizeQuery(parsed.hash ? parsed.hash : parsed.pathname),
      };
    } catch {
      return { ok: false, blockedExternal: true, pathname: '', hash: '', normalized: '' };
    }
  }

  if (trimmed.startsWith('/')) {
    const [pathPart, hashPart = ''] = trimmed.split('#');
    const cleanPath = pathPart === '/' ? '/' : pathPart.replace(/\/+$/, '');
    return {
      ok: true,
      blockedExternal: false,
      pathname: cleanPath || '/',
      hash: hashPart,
      normalized: normalizeQuery(hashPart || cleanPath || '/'),
    };
  }

  if (trimmed.startsWith('#')) {
    const hash = trimmed.slice(1);
    return {
      ok: true,
      blockedExternal: false,
      pathname: '',
      hash,
      normalized: normalizeQuery(hash),
    };
  }

  return {
    ok: true,
    blockedExternal: false,
    pathname: '',
    hash: '',
    normalized: normalizeQuery(trimmed),
  };
}

export function resolveRouteFromTarget(rawTarget: string, currentOrigin?: string): SiteRouteSpec | null {
  const parsed = parseSameSiteTarget(rawTarget, currentOrigin);
  if (!parsed.ok) return null;

  const candidates = [
    parsed.pathname.toLowerCase(),
    parsed.hash.toLowerCase(),
    parsed.normalized,
  ].filter(Boolean);

  for (const candidate of candidates) {
    const exact = SITE_ROUTES.find(
      (r) =>
        r.route === candidate ||
        r.sectionId === candidate ||
        r.label.toLowerCase() === candidate ||
        r.aliases.some((alias) => alias === candidate)
    );
    if (exact) return exact;
  }

  // Strip common filler words like "the", "page", "section", "tab"
  const stripped = parsed.normalized
    .replace(/\b(the|a|an|page|slide|section|sector|screen|view|tab|to|me)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (stripped) {
    const fuzzyAlias = SITE_ROUTES.find(
      (r) =>
        r.label.toLowerCase() === stripped ||
        r.sectionId === stripped ||
        r.aliases.some((alias) => alias === stripped)
    );
    if (fuzzyAlias) return fuzzyAlias;
  }

  return null;
}

export function resolvePanelFromTarget(rawName: string): SitePanelSpec | null {
  const normalized = normalizeQuery(rawName)
    .replace(/\b(the|a|an|panel|modal|dialog|drawer|window|popup)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const rawNorm = normalizeQuery(rawName);
  for (const candidate of [rawNorm, normalized]) {
    if (!candidate) continue;
    const match = SITE_PANELS.find(
      (p) =>
        p.id === candidate ||
        p.label.toLowerCase() === candidate ||
        p.aliases.some((alias) => alias === candidate)
    );
    if (match) return match;
  }
  return null;
}

function scoreTokenSimilarity(query: string, keywords: string[]): number {
  const qTokens = normalizeQuery(query)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2);
  if (qTokens.length === 0) return 0;

  let score = 0;
  for (const token of qTokens) {
    for (const kw of keywords) {
      const kwNorm = kw.toLowerCase();
      if (kwNorm === token) {
        score += 5;
      } else if (kwNorm.includes(token) || token.includes(kwNorm)) {
        score += 3;
      }
    }
  }
  return score;
}

export function findClosestMatch(rawQuery: string): ClosestMatchOffer {
  const q = normalizeQuery(rawQuery);
  let bestOffer: ClosestMatchOffer = {
    kind: 'route',
    target: '/modes',
    label: 'Modes',
    summary: 'Slide 03 (Modes sector) showcasing the cognitive co-pilot modes card.',
  };
  let bestScore = -1;

  // Domain-aware closest match heuristics for common user queries that do not exist
  if (/\b(guide|help|tutorial|learn|manual|docs|documentation|how)\b/.test(q)) {
    const guide = SITE_PANELS[0];
    return {
      kind: 'panel',
      target: guide.id,
      label: guide.label,
      summary: guide.summary,
    };
  }
  if (/\b(shop|store|buy|price|pricing|tier|plan|subscribe|checkout|cart)\b/.test(q)) {
    const access = SITE_ROUTES[4];
    return {
      kind: 'route',
      target: access.route,
      label: access.label,
      summary: access.summary,
    };
  }

  for (const panel of SITE_PANELS) {
    const score = scoreTokenSimilarity(q, [panel.id, panel.label, ...panel.aliases]);
    if (score > bestScore) {
      bestScore = score;
      bestOffer = {
        kind: 'panel',
        target: panel.id,
        label: panel.label,
        summary: panel.summary,
      };
    }
  }

  for (const route of SITE_ROUTES) {
    const score = scoreTokenSimilarity(q, [route.route, route.sectionId, route.label, ...route.aliases]);
    if (score > bestScore) {
      bestScore = score;
      bestOffer = {
        kind: 'route',
        target: route.route,
        label: route.label,
        summary: route.summary,
      };
    }
  }

  return bestOffer;
}

export function getInitialSlideIndexFromPath(pathname?: string, hash?: string): number {
  const path = pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const hashVal = hash ?? (typeof window !== 'undefined' ? window.location.hash : '');

  if (hashVal) {
    const byHash = resolveRouteFromTarget(hashVal);
    if (byHash) return byHash.slideIndex;
  }
  if (path && path !== '/') {
    const byPath = resolveRouteFromTarget(path);
    if (byPath) return byPath.slideIndex;
  }
  return 0;
}

export class NavigationBridge {
  private bindings: NavigationBridgeBindings | null = null;
  private historyStack: number[] = [0];

  public bind(bindings: NavigationBridgeBindings): void {
    this.bindings = bindings;
    const current = bindings.getActiveSlideIndex();
    if (this.historyStack.length === 0) {
      this.historyStack = [current];
    } else {
      this.historyStack[this.historyStack.length - 1] = current;
    }
  }

  public unbind(): void {
    this.bindings = null;
  }

  public recordSlideChange(nextSlideIndex: number, syncBrowserUrl = true): void {
    const spec = SITE_ROUTES[nextSlideIndex] ?? SITE_ROUTES[0];
    const last = this.historyStack[this.historyStack.length - 1];
    if (last !== spec.slideIndex) {
      this.historyStack.push(spec.slideIndex);
      if (this.historyStack.length > 30) {
        this.historyStack = this.historyStack.slice(-30);
      }
    }
    if (syncBrowserUrl && typeof window !== 'undefined') {
      const targetUrl = spec.route;
      if (window.location.pathname !== targetUrl) {
        window.history.pushState({ slideIndex: spec.slideIndex }, '', targetUrl);
      }
      window.dispatchEvent(
        new CustomEvent('mrtc:navigated', {
          detail: this.getCurrentLocation(),
        })
      );
    }
  }

  public syncFromPopState(slideIndex: number): void {
    const spec = SITE_ROUTES[slideIndex] ?? SITE_ROUTES[0];
    if (this.historyStack[this.historyStack.length - 1] !== spec.slideIndex) {
      this.historyStack.push(spec.slideIndex);
    }
  }

  public getCurrentLocation(): CurrentLocationSnapshot {
    const activeIndex = this.bindings ? this.bindings.getActiveSlideIndex() : this.historyStack[this.historyStack.length - 1] ?? 0;
    const spec = SITE_ROUTES[activeIndex] ?? SITE_ROUTES[0];
    const openPanels = this.bindings ? this.bindings.getOpenPanels() : [];
    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    return {
      route: spec.route,
      hash,
      slideIndex: spec.slideIndex,
      slideNumber: spec.slideNumber,
      totalSlides: TOTAL_SLIDES,
      sectionId: spec.sectionId,
      label: spec.label,
      summary: spec.summary,
      openPanels,
      historyDepth: this.historyStack.length,
      canGoBack: this.historyStack.length > 1,
    };
  }

  public navigateTo(target: string): NavigationToolResult {
    if (!this.bindings) {
      return {
        ok: false,
        found: false,
        reason: 'bridge_error',
        message: 'The page navigation bridge is not ready right now.',
        currentLocation: this.getCurrentLocation(),
      };
    }

    const parsed = parseSameSiteTarget(target);
    if (parsed.blockedExternal) {
      return {
        ok: false,
        found: false,
        reason: 'external_url_blocked',
        message: 'I can only navigate within the MRTC Builds website and cannot open external URLs.',
        currentLocation: this.getCurrentLocation(),
        availableRoutes: SITE_ROUTES.map(({ route, sectionId, label }) => ({ route, sectionId, label })),
      };
    }

    const matchedRoute = resolveRouteFromTarget(target);
    if (matchedRoute) {
      this.bindings.goToSlide(matchedRoute.slideIndex);
      if (typeof window !== 'undefined') {
        const nextUrl = matchedRoute.route;
        if (window.location.pathname !== nextUrl || window.location.hash) {
          window.history.pushState({ slideIndex: matchedRoute.slideIndex }, '', nextUrl);
        }
      }
      const snapshot = this.getCurrentLocation();
      return {
        ok: true,
        found: true,
        message: `Navigated to ${matchedRoute.label} (${matchedRoute.route}, Slide ${matchedRoute.slideNumber} of ${String(TOTAL_SLIDES).padStart(2, '0')}).`,
        currentLocation: snapshot,
      };
    }

    // If user asked for a panel via navigate_to (e.g., "welcome guide"), check panel list cleanly
    const matchedPanel = resolvePanelFromTarget(target);
    if (matchedPanel) {
      return this.openPanel(matchedPanel.id);
    }

    const closestMatch = findClosestMatch(target);
    return {
      ok: false,
      found: false,
      reason: 'not_found',
      message: `I can't find "${target}" on this site. The closest match is ${closestMatch.label} (${closestMatch.target}).`,
      closestMatch,
      currentLocation: this.getCurrentLocation(),
      availableRoutes: SITE_ROUTES.map(({ route, sectionId, label }) => ({ route, sectionId, label })),
      availablePanels: SITE_PANELS.map(({ id, label }) => ({ id, label })),
    };
  }

  public scrollToSection(sectionId: string): NavigationToolResult {
    if (!this.bindings) {
      return {
        ok: false,
        found: false,
        reason: 'bridge_error',
        message: 'The page navigation bridge is not ready right now.',
        currentLocation: this.getCurrentLocation(),
      };
    }

    const matchedRoute = resolveRouteFromTarget(sectionId);
    if (!matchedRoute) {
      const matchedPanel = resolvePanelFromTarget(sectionId);
      if (matchedPanel) {
        return this.openPanel(matchedPanel.id);
      }
      const closestMatch = findClosestMatch(sectionId);
      return {
        ok: false,
        found: false,
        reason: 'not_found',
        message: `I can't find a "${sectionId}" section on this site. The closest match is ${closestMatch.label} (${closestMatch.target}).`,
        closestMatch,
        currentLocation: this.getCurrentLocation(),
        availableRoutes: SITE_ROUTES.map(({ route, sectionId: id, label }) => ({ route, sectionId: id, label })),
      };
    }

    this.bindings.goToSlide(matchedRoute.slideIndex);
    this.bindings.scrollElementIntoView?.(matchedRoute.sectionId);
    if (typeof window !== 'undefined') {
      const nextUrl = `${matchedRoute.route}#${matchedRoute.sectionId}`;
      window.history.pushState({ slideIndex: matchedRoute.slideIndex }, '', nextUrl);
    }

    const snapshot = this.getCurrentLocation();
    return {
      ok: true,
      found: true,
      message: `Scrolled to the ${matchedRoute.label} section (#${matchedRoute.sectionId}, Slide ${matchedRoute.slideNumber}).`,
      currentLocation: snapshot,
    };
  }

  public openPanel(panelName: string): NavigationToolResult {
    if (!this.bindings) {
      return {
        ok: false,
        found: false,
        reason: 'bridge_error',
        message: 'The page navigation bridge is not ready right now.',
        currentLocation: this.getCurrentLocation(),
      };
    }

    const matchedPanel = resolvePanelFromTarget(panelName);
    if (!matchedPanel) {
      const matchedRoute = resolveRouteFromTarget(panelName);
      if (matchedRoute) {
        return this.navigateTo(matchedRoute.route);
      }
      const closestMatch = findClosestMatch(panelName);
      return {
        ok: false,
        found: false,
        reason: 'not_found',
        message: `I can't find a "${panelName}" panel or modal on this site. The closest match is ${closestMatch.label}.`,
        closestMatch,
        currentLocation: this.getCurrentLocation(),
        availablePanels: SITE_PANELS.map(({ id, label }) => ({ id, label })),
      };
    }

    const outcome = this.bindings.openPanelById(matchedPanel.id);
    if (!outcome.ok) {
      return {
        ok: false,
        found: true,
        reason: outcome.reason ?? 'bridge_error',
        message: outcome.message ?? `Could not open ${matchedPanel.label}.`,
        currentLocation: this.getCurrentLocation(),
      };
    }

    return {
      ok: true,
      found: true,
      message: `Opened ${matchedPanel.label}.`,
      currentLocation: this.getCurrentLocation(),
    };
  }

  public closePanel(panelName?: string): NavigationToolResult {
    if (!this.bindings) {
      return {
        ok: false,
        found: false,
        reason: 'bridge_error',
        message: 'The page navigation bridge is not ready right now.',
        currentLocation: this.getCurrentLocation(),
      };
    }

    const raw = (panelName ?? '').trim();
    if (!raw || raw.toLowerCase() === 'all' || raw.toLowerCase() === 'current') {
      const res = this.bindings.closePanelById('all');
      if (res.closed.length === 0) {
        return {
          ok: false,
          found: true,
          reason: 'panel_not_open',
          message: 'No panel or modal is currently open.',
          currentLocation: this.getCurrentLocation(),
        };
      }
      return {
        ok: true,
        found: true,
        message: `Closed ${res.closed.join(' and ')}.`,
        currentLocation: this.getCurrentLocation(),
      };
    }

    const matchedPanel = resolvePanelFromTarget(raw);
    if (!matchedPanel) {
      const closestMatch = findClosestMatch(raw);
      return {
        ok: false,
        found: false,
        reason: 'not_found',
        message: `I can't find a "${raw}" panel to close.`,
        closestMatch,
        currentLocation: this.getCurrentLocation(),
      };
    }

    const res = this.bindings.closePanelById(matchedPanel.id);
    if (res.closed.length === 0) {
      return {
        ok: false,
        found: true,
        reason: 'panel_not_open',
        message: `${matchedPanel.label} is already closed.`,
        currentLocation: this.getCurrentLocation(),
      };
    }

    return {
      ok: true,
      found: true,
      message: `Closed ${matchedPanel.label}.`,
      currentLocation: this.getCurrentLocation(),
    };
  }

  public goBack(): NavigationToolResult {
    if (!this.bindings) {
      return {
        ok: false,
        found: false,
        reason: 'bridge_error',
        message: 'The page navigation bridge is not ready right now.',
        currentLocation: this.getCurrentLocation(),
      };
    }

    if (this.historyStack.length <= 1) {
      return {
        ok: false,
        found: false,
        reason: 'no_history',
        message: "You're already on the first page of your current session, so there isn't a previous page to go back to.",
        currentLocation: this.getCurrentLocation(),
      };
    }

    this.historyStack.pop();
    const prevSlideIndex = this.historyStack[this.historyStack.length - 1] ?? 0;
    const spec = SITE_ROUTES[prevSlideIndex] ?? SITE_ROUTES[0];
    this.bindings.goToSlide(prevSlideIndex);
    if (typeof window !== 'undefined') {
      window.history.replaceState({ slideIndex: prevSlideIndex }, '', spec.route);
    }

    return {
      ok: true,
      found: true,
      message: `Returned to ${spec.label} (${spec.route}, Slide ${spec.slideNumber}).`,
      currentLocation: this.getCurrentLocation(),
    };
  }

  public executeToolCall(
    name: string,
    args: Record<string, unknown> = {}
  ): NavigationToolResult {
    switch (name) {
      case 'navigate_to':
        return this.navigateTo(String(args.target ?? args.route ?? args.url ?? ''));
      case 'scroll_to_section':
        return this.scrollToSection(String(args.section_id ?? args.sectionId ?? args.section ?? ''));
      case 'open_panel':
        return this.openPanel(String(args.panel_name ?? args.panelName ?? args.panel ?? ''));
      case 'close_panel':
        return this.closePanel(
          args.panel_name !== undefined
            ? String(args.panel_name)
            : args.panelName !== undefined
              ? String(args.panelName)
              : undefined
        );
      case 'go_back':
        return this.goBack();
      case 'get_current_location': {
        const currentLocation = this.getCurrentLocation();
        return {
          ok: true,
          found: true,
          message: `You are currently on ${currentLocation.label} (${currentLocation.route}, Slide ${currentLocation.slideNumber} of ${String(currentLocation.totalSlides).padStart(2, '0')}).`,
          currentLocation,
        };
      }
      default:
        return {
          ok: false,
          found: false,
          reason: 'not_found',
          message: `Unknown navigation tool "${name}".`,
          currentLocation: this.getCurrentLocation(),
        };
    }
  }
}

export const navigationBridge = new NavigationBridge();

declare global {
  interface Window {
    __MRTC_NAV_BRIDGE__?: NavigationBridge;
  }
}

if (typeof window !== 'undefined') {
  window.__MRTC_NAV_BRIDGE__ = navigationBridge;
}

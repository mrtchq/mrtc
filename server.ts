import 'dotenv/config';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { WebSocketServer, type WebSocket } from 'ws';
import {
  GoogleGenAI,
  Modality,
  Type,
  type FunctionDeclaration,
  type LiveServerMessage,
} from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

const VOICE_NAVIGATION_TOOLS: FunctionDeclaration[] = [
  {
    name: 'navigate_to',
    description:
      'Navigates the user softly within the MRTC Builds website to a known slide route or named panel. Same-site navigation only. Never invent pages. If the tool returns found: false, tell the user plainly you cannot find that place and offer the closestMatch returned.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        target: {
          type: Type.STRING,
          description:
            'The target route, slide name, or panel name requested by the user (e.g. "/", "/system", "/modes", "/matrix", "/access", "Overview", "System", "Modes", "Matrix", "Access", "welcome-guide").',
        },
      },
      required: ['target'],
    },
  },
  {
    name: 'scroll_to_section',
    description:
      'Scrolls or focuses the viewport on a named section ID within the MRTC Builds site (#hero, #dual-hemisphere, #copilot-modes, #biometric-matrix, #waitlist).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        section_id: {
          type: Type.STRING,
          description: 'The section ID or alias to scroll to (e.g. "hero", "dual-hemisphere", "copilot-modes", "biometric-matrix", "waitlist").',
        },
      },
      required: ['section_id'],
    },
  },
  {
    name: 'open_panel',
    description:
      'Opens a named overlay modal or panel on the site, such as "welcome-guide" (Interface Guide) or "account-menu" (Google Account Menu).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        panel_name: {
          type: Type.STRING,
          description: 'The panel or modal name to open ("welcome-guide" or "account-menu").',
        },
      },
      required: ['panel_name'],
    },
  },
  {
    name: 'close_panel',
    description:
      'Closes an open modal or panel on the site ("welcome-guide", "account-menu", or "all").',
    parameters: {
      type: Type.OBJECT,
      properties: {
        panel_name: {
          type: Type.STRING,
          description: 'Optional panel name to close ("welcome-guide", "account-menu", or "all").',
        },
      },
    },
  },
  {
    name: 'go_back',
    description:
      'Returns the user softly to the previous slide or route in their in-app navigation history.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'get_current_location',
    description:
      'Inspects the live current route, slide number, section ID, open panels, and history state so the assistant always knows where the user is.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
];

const SYSTEM_INSTRUCTION = `You are the Voice Co-Pilot on the MRTC Builds ("AI FOR ADHD") website.
Speak warmly, concisely, and naturally. Your responses should be brief and direct — typically 1 to 2 short sentences.

EXACT SITE STRUCTURE (never invent routes, pages, or features that are not listed here):
- Slide 01 / Overview ("/", section "#hero"): Main hero overview with the interactive Voice Orb, "Test the Modes" button, and "Join the Waitlist" button.
- Slide 02 / System ("/system", section "#dual-hemisphere"): Slide 02 showcasing the Dual-Hemisphere System card.
- Slide 03 / Modes ("/modes", section "#copilot-modes"): Slide 03 showcasing the Cognitive Co-Pilot Modes card.
- Slide 04 / Matrix ("/matrix", section "#biometric-matrix"): Slide 04 showcasing the Biometric Matrix card.
- Slide 05 / Access ("/access", section "#waitlist"): Slide 05 showcasing the Early Access / Waitlist card.
- Panel "welcome-guide": The glass-morphic Interface Guide welcome modal.
- Panel "account-menu": The top-right Google Account Menu (requires the user to be signed in).

MID-CONVERSATION NAVIGATION RULES:
1. Whenever the user asks to go somewhere, scroll to a section, open or close a modal/panel, go back, or asks where they currently are, immediately call the matching tool (navigate_to, scroll_to_section, open_panel, close_panel, go_back, or get_current_location).
2. After a successful navigation or panel action, confirm in ONE short spoken sentence telling the user exactly where they are now (for example: "You're on the Modes slide now, Slide 03 of 05.").
3. If a tool returns found: false (for example if the user asks for a shop, pricing page, budgeting guide, or anything that does not exist on this site), say clearly in one sentence that you can't find that page on this site and offer the closestMatch returned by the tool without navigating.
4. If a tool fails (for instance account_menu requires signing in, or go_back has no history), tell the user plainly in one sentence and stay in the conversation without retrying in a loop.
5. Same-site navigation only. Never direct or navigate the user to external websites.`;

const rejectedLiveKeys = new Set<string>();

function getOrderedGeminiApiKeys(): string[] {
  const candidates = [process.env.GOOGLE_API_KEY?.trim(), process.env.GEMINI_API_KEY?.trim()].filter(
    (k): k is string => Boolean(k)
  );
  const unique = Array.from(new Set(candidates));
  const usable = unique.filter((k) => !rejectedLiveKeys.has(k));
  return usable.length > 0 ? usable : unique;
}

function getGeminiApiKey(): string | undefined {
  return getOrderedGeminiApiKeys()[0];
}

function createGeminiClient(apiKey: string, apiVersion: 'v1beta' | 'v1alpha' = 'v1beta'): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      apiVersion,
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractLiveErrorMessage(err: unknown): string {
  if (!err) return 'Live session error occurred.';
  if (err instanceof Error) return err.message;
  if (typeof err === 'object') {
    const obj = err as { message?: unknown; error?: { message?: unknown } };
    if (obj.error?.message && typeof obj.error.message === 'string') {
      return obj.error.message;
    }
    if (typeof obj.message === 'string' && obj.message) {
      return obj.message;
    }
  }
  return String(err);
}

function sendJson(ws: WebSocket, payload: Record<string, unknown>): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    const activeKey = getGeminiApiKey();
    const keySource = !activeKey
      ? 'none'
      : activeKey === process.env.GOOGLE_API_KEY?.trim()
        ? 'GOOGLE_API_KEY'
        : 'GEMINI_API_KEY';
    res.json({
      ok: true,
      liveModel: 'gemini-3.8-live',
      liveApiConfigured: Boolean(activeKey),
      keySource,
    });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = (request.url || '/').split('?')[0];
    if (pathname === '/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (clientWs) => {
    const orderedKeys = getOrderedGeminiApiKeys();
    if (orderedKeys.length === 0) {
      sendJson(clientWs, {
        type: 'error',
        code: 'MISSING_API_KEY',
        message: 'Gemini Live API key is not configured on the server.',
      });
      clientWs.close(1011, 'Missing GOOGLE_API_KEY / GEMINI_API_KEY');
      return;
    }

    let closed = false;
    let sessionReadySent = false;
    let liveSession: Awaited<ReturnType<GoogleGenAI['live']['connect']>> | null = null;
    const pendingMessages: string[] = [];

    const closeCurrentLiveSession = () => {
      const active = liveSession;
      liveSession = null;
      if (!active) return;
      try {
        active.close();
      } catch {
        // Ignore close errors
      }
    };

    const closeAll = () => {
      if (closed) return;
      closed = true;
      pendingMessages.length = 0;
      closeCurrentLiveSession();
    };

    const dispatchClientPayload = (rawStr: string) => {
      if (!liveSession || closed) return;
      try {
        const msg = JSON.parse(rawStr) as {
          type?: string;
          data?: string;
          audio?: string;
          text?: string;
          functionResponses?: Array<{
            id: string;
            name: string;
            response: Record<string, unknown>;
          }>;
        };

        if (msg.type === 'audio' || typeof msg.audio === 'string') {
          const base64Audio = msg.data ?? msg.audio;
          if (base64Audio) {
            liveSession.sendRealtimeInput({
              audio: {
                data: base64Audio,
                mimeType: 'audio/pcm;rate=16000',
              },
            });
          }
          return;
        }

        if (msg.type === 'text' && typeof msg.text === 'string' && msg.text.trim()) {
          liveSession.sendClientContent({
            turns: [{ role: 'user', parts: [{ text: msg.text.trim() }] }],
            turnComplete: true,
          });
          return;
        }

        if (msg.type === 'tool_response' && Array.isArray(msg.functionResponses)) {
          liveSession.sendToolResponse({
            functionResponses: msg.functionResponses,
          });
        }
      } catch (err) {
        const message = extractLiveErrorMessage(err);
        sendJson(clientWs, {
          type: 'error',
          code: 'BAD_MESSAGE',
          message,
        });
      }
    };

    clientWs.on('message', (raw) => {
      if (closed) return;
      const rawStr = raw.toString();
      if (!liveSession || !sessionReadySent) {
        if (pendingMessages.length < 32) {
          pendingMessages.push(rawStr);
        }
        return;
      }
      dispatchClientPayload(rawStr);
    });

    clientWs.on('close', closeAll);
    clientWs.on('error', closeAll);

    const openLiveWithKey = async (apiKey: string, hasFallback: boolean): Promise<boolean> => {
      let attemptSettled = false;
      let attemptRejected = false;
      let readyTimer: ReturnType<typeof setTimeout> | null = null;
      let resolveAttempt!: (ok: boolean) => void;
      const attemptPromise = new Promise<boolean>((resolve) => {
        resolveAttempt = resolve;
      });

      const finishAttempt = (ok: boolean) => {
        if (attemptSettled) return;
        attemptSettled = true;
        if (readyTimer) {
          clearTimeout(readyTimer);
          readyTimer = null;
        }
        resolveAttempt(ok);
      };

      const connectVersion = async (apiVersion: 'v1beta' | 'v1alpha') => {
        const ai = createGeminiClient(apiKey, apiVersion);
        return ai.live.connect({
          model: 'gemini-3.8-live',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Zephyr',
                },
              },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            tools: [{ functionDeclarations: VOICE_NAVIGATION_TOOLS }],
            systemInstruction: SYSTEM_INSTRUCTION,
          },
          callbacks: {
            onopen: () => {
              if (!hasFallback) {
                if (!sessionReadySent) {
                  sessionReadySent = true;
                  sendJson(clientWs, { type: 'session_ready' });
                }
                finishAttempt(true);
              } else {
                // Brief verification window so immediate 1008 permission errors trigger fallback silently
                readyTimer = setTimeout(() => {
                  if (!closed && !attemptRejected) {
                    if (!sessionReadySent) {
                      sessionReadySent = true;
                      sendJson(clientWs, { type: 'session_ready' });
                    }
                    finishAttempt(true);
                  }
                }, 350);
              }
            },
            onmessage: (message: LiveServerMessage) => {
              if (!sessionReadySent && !closed) {
                sessionReadySent = true;
                sendJson(clientWs, { type: 'session_ready' });
                finishAttempt(true);
              }
              const content = message.serverContent;

              if (content?.inputTranscription?.text) {
                sendJson(clientWs, {
                  type: 'input_transcript',
                  text: content.inputTranscription.text,
                });
              }

              if (content?.outputTranscription?.text) {
                sendJson(clientWs, {
                  type: 'output_transcript',
                  text: content.outputTranscription.text,
                });
              }

              for (const part of content?.modelTurn?.parts ?? []) {
                if (part.inlineData?.data) {
                  sendJson(clientWs, {
                    type: 'audio',
                    data: part.inlineData.data,
                  });
                }
              }

              if (content?.interrupted) {
                sendJson(clientWs, { type: 'interrupted' });
              }

              if (content?.turnComplete) {
                sendJson(clientWs, { type: 'turn_complete' });
              }

              if (message.toolCall?.functionCalls?.length) {
                sendJson(clientWs, {
                  type: 'tool_call',
                  functionCalls: message.toolCall.functionCalls.map((call) => ({
                    id: call.id ?? '',
                    name: call.name ?? '',
                    args: call.args ?? {},
                  })),
                });
              }
            },
            onerror: (err) => {
              const message = extractLiveErrorMessage(err);
              if (hasFallback && !sessionReadySent) {
                attemptRejected = true;
                rejectedLiveKeys.add(apiKey);
                finishAttempt(false);
                return;
              }
              console.error('[Live API onerror]', message);
              sendJson(clientWs, {
                type: 'error',
                code: 'LIVE_SESSION_ERROR',
                message,
              });
            },
            onclose: (event) => {
              const closeDetail = event as { code?: number; reason?: string } | undefined;
              const isPermissionClose =
                closeDetail?.code === 1008 ||
                (closeDetail?.reason ?? '').toLowerCase().includes('permission denied');
              if (isPermissionClose) {
                rejectedLiveKeys.add(apiKey);
              }
              if (hasFallback && !sessionReadySent && isPermissionClose) {
                attemptRejected = true;
                finishAttempt(false);
                return;
              }
              if (closeDetail?.code && closeDetail.code !== 1000) {
                console.warn('[Live API onclose]', closeDetail.code, closeDetail.reason || '');
              }
              if (!closed && clientWs.readyState === clientWs.OPEN) {
                if (isPermissionClose && !hasFallback && closeDetail?.reason) {
                  sendJson(clientWs, {
                    type: 'error',
                    code: 'LIVE_SESSION_ERROR',
                    message: closeDetail.reason,
                  });
                }
                sendJson(clientWs, {
                  type: 'session_closed',
                  code: closeDetail?.code,
                  reason: closeDetail?.reason,
                });
                clientWs.close(1000, 'Upstream Live session closed');
              }
            },
          },
        });
      };

      try {
        try {
          liveSession = await connectVersion('v1beta');
        } catch (firstErr) {
          const msg = extractLiveErrorMessage(firstErr);
          if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
            liveSession = await connectVersion('v1alpha');
          } else {
            throw firstErr;
          }
        }
        return await attemptPromise;
      } catch (err) {
        if (hasFallback && !sessionReadySent) {
          attemptRejected = true;
          rejectedLiveKeys.add(apiKey);
          finishAttempt(false);
          return false;
        }
        throw err;
      }
    };

    try {
      let connected = false;
      for (let i = 0; i < orderedKeys.length; i++) {
        if (closed) return;
        const apiKey = orderedKeys[i];
        const hasFallback = i < orderedKeys.length - 1;
        connected = await openLiveWithKey(apiKey, hasFallback);
        if (connected) break;
        closeCurrentLiveSession();
      }

      if (!connected) {
        throw new Error('All configured Gemini Live API keys were rejected.');
      }

      if (closed) {
        closeCurrentLiveSession();
        return;
      }

      for (const queued of pendingMessages) {
        dispatchClientPayload(queued);
      }
      pendingMessages.length = 0;
    } catch (err) {
      const message = extractLiveErrorMessage(err);
      console.error('[Live API connect error]', message);
      sendJson(clientWs, {
        type: 'error',
        code: 'CONNECT_FAILED',
        message,
      });
      clientWs.close(1011, 'Gemini Live connect failed');
    }
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

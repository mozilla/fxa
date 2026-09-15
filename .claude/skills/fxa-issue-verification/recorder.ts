/* Continuous frame recorder for a Marionette-driven Firefox.
 *
 * Copy to packages/functional-tests/tests/_verify/recorder.ts and import it
 * from the throwaway spec. Marionette has no video API and a single TCP
 * connection, so every command is serialized through one lock and a frame is
 * grabbed between the spec's own commands. About 5 frames per second on a
 * 1280x1040 window. Popups (panels, menus) are separate native windows and do
 * not appear in the frames.
 *
 * Encode with:
 *   ffmpeg -y -framerate 5 -i '<dir>/frame-%05d.png' \
 *     -vf 'scale=trunc(iw/2)*2:trunc(ih/2)*2' -c:v libvpx-vp9 -b:v 1M -pix_fmt yuv420p out.webm
 */
import * as fs from 'fs';
import path from 'path';
import type { MarionetteClient } from '../../lib/marionette';

// Continuous recording. Every Marionette command goes through one lock, so
// the recorder can grab a frame between the test's own commands without the
// two racing on the single TCP connection or the current context.
export class Recorder {
  private chain: Promise<unknown> = Promise.resolve();
  private context: 'chrome' | 'content' = 'content';
  private timer: NodeJS.Timeout | null = null;
  private running = false;
  private raw: (name: string, params?: Record<string, unknown>) => Promise<unknown>;
  frames = 0;

  constructor(private client: MarionetteClient, private dir: string) {
    fs.mkdirSync(dir, { recursive: true });
    const c = client as any;
    // sendCommandWithRetry calls sendCommand, so only the base send is locked.
    this.raw = c.sendCommand.bind(client);
    c.sendCommand = (name: string, params?: Record<string, unknown>) =>
      this.lock(() => this.tracked(this.raw, name, params));
  }

  private tracked(send: typeof this.raw, name: string, params?: Record<string, unknown>) {
    if (name === 'Marionette:SetContext') this.context = (params as any).value;
    return send(name, params);
  }

  private lock<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.chain.then(fn, fn);
    this.chain = next.catch(() => undefined);
    return next;
  }

  start(intervalMs = 150) {
    // Self-scheduling, not setInterval: a screenshot takes about 200 ms, longer
    // than any sane interval, so a timer would queue frames faster than the
    // single Marionette connection drains them and starve the spec's own
    // commands. The next frame is only scheduled once this one has settled.
    this.running = true;
    const tick = async () => {
      if (!this.running) return;
      await this.frame().catch(() => undefined);
      if (this.running) this.timer = setTimeout(tick, intervalMs);
    };
    this.timer = setTimeout(tick, intervalMs);
  }

  async stop() {
    this.running = false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    await this.chain;
  }

  private frame() {
    return this.lock(async () => {
      const restore = this.context;
      await this.raw('Marionette:SetContext', { value: 'chrome' });
      try {
        const found = (await this.raw('WebDriver:FindElement', { using: 'css selector', value: ':root' })) as any;
        const id = found.value['element-6066-11e4-a52e-4f735466cecf'];
        const png = (await this.raw('WebDriver:TakeScreenshot', { id })) as any;
        const n = String(++this.frames).padStart(5, '0');
        fs.writeFileSync(path.join(this.dir, `frame-${n}.png`), Buffer.from(png.value, 'base64'));
      } finally {
        // start() swallows a rejected frame, so without this the client would be
        // left in chrome context and the spec's next command would run there.
        await this.raw('Marionette:SetContext', { value: restore });
      }
    });
  }
}

# README slides and demo video

This package captures the running app and uses [Remotion](https://www.remotion.dev) to render the README slides, social preview, landing-page video, and README preview. It is separate from the application and is not part of the Docker image.

```bash
# Repository root: build the app, seed the fictional showcase workspace, and serve it
pnpm run build
php artisan db:seed --class=ShowcaseSeeder
php artisan serve

# In another terminal
cd video
pnpm install
pnpm exec playwright install chromium
pnpm capture   # CAPTURE_URL overrides http://localhost:8000
pnpm build     # or: pnpm slides / pnpm video / pnpm studio
```

- `pnpm capture` drives a real block drag, form submission, deal drag, and dry run, so it changes the showcase workspace. Reseed before each run. It fails on page errors, failed requests, or horizontal overflow.
- `ShowcaseSeeder` runs only in local and testing environments and replaces only the `showcase@example.com` account.
- The video step needs `ffmpeg` on your `PATH`. Set `REMOTION_BROWSER` to reuse an installed Chrome Headless Shell.
- Captures are ignored by Git. Outputs go to `public/ss`, `public/video`, and `docs/social-preview.jpg`.

## Audio

- **Narration:** `pnpm voiceover` reads the script in `src/timeline.json`, generates changed lines with ElevenLabs into `assets/voice`, checks that each fits its scene, and writes the captions. It reads `ELEVENLABS_API_KEY` from the environment or the root `.env` and spends account credits. Set `ELEVENLABS_VOICE_ID` to change the voice. Check your ElevenLabs plan's commercial-use and attribution terms before publishing.
- **Music:** `assets/music.mp3` is "Frozen Ripples", dedicated to the public domain under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) ([source](https://freesound.org/s/572447/)). No credit is required.
- `pnpm mux` remixes the audio onto the last rendered video without rendering again.

## Editing

Slides live in `src/Slides.tsx`, the video in `src/Demo.tsx`, and shared frames in `src/ui.tsx`.

Remotion has its own [license](https://www.remotion.dev/license): free for individuals and small teams, paid for larger companies. It is used only to produce these assets and is not distributed with OpenFunnels.

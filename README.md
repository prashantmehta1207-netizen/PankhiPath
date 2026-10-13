# PankhiPath 🐦

**Listen. Discover. Explore.** An outdoor-first bird sound companion with an English/Gujarati interface, local sightings notebook, and a local open-source AI backend.

This project is designed so that the screen is the shortest part of the experience: record a short bird call, learn about a possible match, save the sighting if you choose, and get back to observing nature.

## What's included

- Responsive React + Vite website with desktop and mobile layouts.
- English / Gujarati interface toggle.
- Browser microphone recording (up to 15 seconds) and audio file upload.
- Bird guide for common bird examples, with local search.
- Local-only sightings notebook powered by browser `localStorage`.
- Nearby parks, gardens, playgrounds and nature areas discovered from OpenStreetMap data after the user explicitly grants location permission.
- Nature Passport dashboard with real saved-sighting metrics, seven-day activity chart, streak calculation and milestone badges.
- Smart Nature Walk Planner with configurable duration, selectable nature missions, generated mini-itinerary and Phone-Down Mode countdown (pause/resume/finish). Walk sessions are saved locally.
- Experimental local bird-photo shortlist using open-weight OpenAI CLIP ViT-B/32; ranks 24 common species candidates and explains that scores are relative, not calibrated probabilities.
- Personal field notes and an optional, approximate location tag on sightings (location permission is requested only when the user opts in and saves).
- Downloadable field journal exports in CSV or JSON.
- Bird-guide filters for all, garden and city birds.
- PWA manifest and app-install prompt support in browsers that expose the install prompt.
- Walking directions, radius/category filters, locally saved favourite places and a daily screen-free nature challenge.
- FastAPI endpoint that runs BirdNET locally; it does not call a hosted AI API.
- Installable PWA manifest, app icons and service worker to cache the web app shell and local image assets after the first successful visit.
- Explicit demo result when the AI backend is not reachable. Demo output is labelled and must not be described as a real prediction.

## Requirements

- Node.js 20+ and npm.
- Python 3.11–3.13 recommended for a straightforward setup (BirdNET's available model backends vary by Python version).
- Optional photo AI uses PyTorch + Transformers and downloads roughly 600 MB of CLIP model weights the first time it runs.
- FFmpeg for browser-recorded WebM / MP4 audio conversion. On macOS: `brew install ffmpeg`.
- Internet for the first package/model download. After the required packages and BirdNET weights are available locally, inference can run without an internet connection. The backend and frontend still need to be running on your laptop.

## Start it on macOS

For a one-command start after Node.js, Python 3.12 and Homebrew are installed, run:

```bash
./start-mac.sh
```

The script installs the project dependencies, the optional photo-AI dependencies by default, starts the local API, and runs Vite. Keep the terminal open while using the app. Photo model weights are downloaded on the first photo identification. To skip the optional PyTorch/Transformers install and use sound ID only, run `PANKHIPATH_INSTALL_PHOTO_AI=0 ./start-mac.sh`.

### 1. Install frontend dependencies

Open Terminal in the `pankhipath` folder:

```bash
npm install
```

### 2. Create and install the Python environment

In a second Terminal window, from the same `pankhipath` folder:

```bash
brew install python@3.12 ffmpeg
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
# Optional: required for local photo identification
pip install -r requirements-photo.txt
```

### 3. Start the local AI backend

With `.venv` activated:

```bash
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

The first sound identification may download BirdNET assets. The first photo identification downloads the CLIP ViT-B/32 model (roughly 600 MB) from Hugging Face. Once both model assets are cached, inference can run locally without internet.

### 4. Start the website

In another Terminal window, from the project folder:

```bash
npm run dev
```

Open the local URL Vite prints, normally `http://localhost:5173`.

The app asks for microphone permission only when you press **Start recording**. You can also upload a recording instead. If the Python backend is not running, the site remains usable in demo mode and explicitly labels its sample result.

## Useful commands

Build the production website:

```bash
npm run build
```

Preview a production build:

```bash
npm run preview
```

Check backend health in a browser:

```text
http://127.0.0.1:8000/api/health
```

The photo identification endpoint is `POST /api/identify-image` and accepts a multipart form field named `image`. It keeps the image in the local service and only ranks a fixed list of common candidate species.

## Nearby places and location privacy

- The app does not request location automatically. The visitor must tap **Use my location** and approve the browser permission prompt.
- After consent, coordinates are sent to the OpenStreetMap Overpass service to retrieve nearby mapped parks and gardens. A clearly labelled Ahmedabad demo area is available without granting location permission. Browser geolocation works on `localhost` or a secure HTTPS deployment.
- Coordinates used for nearby-place search remain in page memory and are not saved. Separately, a visitor can opt in to attach rounded coordinates to a bird sighting; that tag is saved locally with the journal entry. Favourites and daily challenge completion are also stored locally in the browser.
- Nearby search and the embedded map require internet access. Place coverage and opening hours depend on OpenStreetMap community data and may be incomplete; directions open in Google Maps.
- OpenStreetMap attribution is shown in the Nearby view. Review the service policies before a public launch; production deployments with meaningful traffic should consider a suitable hosted/self-hosted geodata provider and request caching.

## Privacy and offline behaviour

- The included backend runs on `127.0.0.1:8000`; audio is processed on the local machine by BirdNET.
- Sightings, personal notes, language preference, saved places and challenge progress are kept in `localStorage` for this browser profile. Clearing browser data removes them.
- Optional location tags are stored only with an explicit user choice and use rounded coordinates; no location is collected automatically. Exports include the fields present in the saved journal.
- This app does not send recordings to a third-party cloud AI API. The optional Nearby feature is different: when users request a local search, coordinates are sent to OpenStreetMap. Avoid exposing the local backend publicly without adding authentication and other security controls.
- A first-time package/model download requires internet. The production web shell can be cached by the service worker. A live local backend is still required for real audio or photo inference.
- Photo AI uses `openai/clip-vit-base-patch32`, a general vision-language model. Its model card documents fine-grained classification limitations and says it is not developed for general deployment. This prototype ranks a fixed 24-species shortlist only; scores are relative over that list and are not calibrated probabilities. Treat photo matches as educational suggestions and verify them using a field guide or sound. Model card: https://huggingface.co/openai/clip-vit-base-patch32
- Browser microphone access requires localhost or HTTPS.

## Open-source AI and attribution

The original project source code is released under the MIT License in `LICENSE`. Third-party model weights, generated/third-party imagery, and dependency packages are not covered by that code license; their own terms remain in effect.


BirdNET is an open-source bird sound identification project. See the upstream package and its up-to-date model/code license terms before redistribution or commercial use:

- BirdNET Python library: https://github.com/birdnet-team/birdnet
- BirdNET documentation: https://birdnet-team.github.io/birdnet/
- BirdNET-Analyzer documentation: https://birdnet-team.github.io/BirdNET-Analyzer/stable/

This project uses BirdNET's predictions as *possible matches*, not a guarantee that a species has been identified correctly. The Gujarati names and short educational facts in this prototype are a small hand-written starter set and should be reviewed by knowledgeable local birders before public launch.

## Before publishing

1. Test the app with genuine outdoor recordings from your area.
2. Test the backend offline after all dependencies and model assets have been downloaded.
3. Verify the species results and attribution for every model or data asset you ship.
4. Add a proper privacy notice and authentication before hosting a backend on the public internet.
5. Replace generated bird-image crops with properly licensed, credited photographs if you want a production-grade field guide.

## Stack

React · Vite · Lucide · FastAPI · BirdNET · OpenAI CLIP ViT-B/32 · PyTorch · Transformers · ONNX · localStorage · Service Worker

## Nature Passport and field journal

- Open **Passport** from the navigation to see counts derived from saved observations, activity for the last seven days, current observation streak and badge milestones.
- On the Identify result screen, add an optional field note before saving. The location checkbox is off by default; switching it on requests browser location permission when you save, then attaches coordinates rounded to three decimal places.
- In **My sightings**, export your journal as CSV or JSON. Export files are downloaded directly by the browser; they are not uploaded to a server.
- Passport progress is calculated from locally stored records and daily challenges. It does not track movement or claim outdoor activity that has not been recorded.

## Installing PankhiPath

The app includes a PWA manifest, icons and a service worker. On supported Chromium browsers, use **Install app** when the browser makes the install prompt available. On iPhone/iPad Safari, use **Share → Add to Home Screen**. Install/offline behaviour should be tested again after deploying the production build over HTTPS.

## Smart Nature Walk Planner and photo identification

- Open **Walk plan** to choose 15–60 minutes and select missions such as listening for calls, scanning trees, noticing natural colours, and remembering a discovery. Build the itinerary, then start Phone-Down Mode. The timer supports pause, resume, and finish; completing a session stores a local history entry. It does not lock the phone or independently verify that the walk happened.
- Open **Photo ID** from the home shortcuts or the sound identification page. It sends the selected image to the local FastAPI service at `localhost`, not to a hosted inference API. The first run needs internet to download the CLIP weights; after they are cached, prediction runs locally.
- CLIP is a general image/text model, not a specialist bird taxonomy model. The feature compares an image against 24 starter species labels and returns relative scores. Similar-looking species, non-bird images, crops, and regional species outside this shortlist may produce misleading suggestions. Do not treat the top result as a confirmed identification.








by 
Mehta Prashant 



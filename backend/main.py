"""Local FastAPI bridge for the open-source BirdNET acoustic model.

The model runs on the machine where this service is started. This backend does
not call a hosted AI API or intentionally upload recordings to a third party.
"""
from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
import io
import importlib.util
from pathlib import Path
from typing import Any

import birdnet
import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

APP_DIR = Path(__file__).resolve().parent
MAX_UPLOAD_BYTES = 25 * 1024 * 1024
MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".aac", ".ogg", ".webm", ".flac"}
MODEL_VERSION = os.getenv("BIRDNET_VERSION", "3.0")
MODEL_BACKEND = os.getenv("BIRDNET_BACKEND", "onnx")
MODEL_PRECISION = os.getenv("BIRDNET_PRECISION", "fp16")

app = FastAPI(
    title="PankhiPath local bird identification API",
    description="Local-first FastAPI wrapper around the open-source BirdNET model.",
    version="1.0.0",
)
# Set FRONTEND_ORIGINS to a comma-separated list of trusted origins in hosting,
# for example: https://pankhipath.vercel.app,http://localhost:5173
_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
FRONTEND_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in os.getenv("FRONTEND_ORIGINS", _default_origins).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"]
)

_MODEL: Any | None = None
_CLIP_MODEL: Any | None = None
_CLIP_PROCESSOR: Any | None = None
_CLIP_DEVICE: str | None = None

# A transparent starter shortlist, not an exhaustive species detector. The CLIP
# scores below are relative similarity scores over this exact candidate list.
PHOTO_BIRD_CANDIDATES = [
    {"common_name": "Red-vented Bulbul", "scientific_name": "Pycnonotus cafer", "gujarati_name": "લાલપૂંછ બુલબુલ"},
    {"common_name": "House Sparrow", "scientific_name": "Passer domesticus", "gujarati_name": "ઘર ચકલી"},
    {"common_name": "Common Myna", "scientific_name": "Acridotheres tristis", "gujarati_name": "દેશી મેના"},
    {"common_name": "Rock Pigeon", "scientific_name": "Columba livia", "gujarati_name": "કબૂતર"},
    {"common_name": "Rose-ringed Parakeet", "scientific_name": "Psittacula krameri", "gujarati_name": "રીંગણવાળો પોપટ"},
    {"common_name": "Asian Koel", "scientific_name": "Eudynamys scolopaceus", "gujarati_name": "કોયલ"},
    {"common_name": "House Crow", "scientific_name": "Corvus splendens", "gujarati_name": "ઘર કાગડો"},
    {"common_name": "Black Kite", "scientific_name": "Milvus migrans", "gujarati_name": "ચીલ"},
    {"common_name": "White-throated Kingfisher", "scientific_name": "Halcyon smyrnensis", "gujarati_name": "સફેદ ગળાવાળો કિંગફિશર"},
    {"common_name": "Indian Peafowl", "scientific_name": "Pavo cristatus", "gujarati_name": "મોર"},
    {"common_name": "Spotted Dove", "scientific_name": "Spilopelia chinensis", "gujarati_name": "ચિત્તી કબૂતર"},
    {"common_name": "Indian Robin", "scientific_name": "Copsychus fulicatus", "gujarati_name": "દેશી દૈયડ"},
    {"common_name": "Purple Sunbird", "scientific_name": "Cinnyris asiaticus", "gujarati_name": "જાંબલી સૂર્યપંખી"},
    {"common_name": "Red-whiskered Bulbul", "scientific_name": "Pycnonotus jocosus", "gujarati_name": "લાલ મૂછવાળી બુલબુલ"},
    {"common_name": "Cattle Egret", "scientific_name": "Bubulcus ibis", "gujarati_name": "ઢોર બગલો"},
    {"common_name": "Indian Pond Heron", "scientific_name": "Ardeola grayii", "gujarati_name": "તળાવ બગલો"},
    {"common_name": "Green Bee-eater", "scientific_name": "Merops orientalis", "gujarati_name": "લીલો પતરંગો"},
    {"common_name": "Oriental Magpie-Robin", "scientific_name": "Copsychus saularis", "gujarati_name": "દૈયડ"},
    {"common_name": "Black Drongo", "scientific_name": "Dicrurus macrocercus", "gujarati_name": "કોતવાલ"},
    {"common_name": "Barn Owl", "scientific_name": "Tyto alba", "gujarati_name": "ઘુવડ"},
    {"common_name": "Common Tailorbird", "scientific_name": "Orthotomus sutorius", "gujarati_name": "દરજીડો"},
    {"common_name": "Great Egret", "scientific_name": "Ardea alba", "gujarati_name": "મોટો સફેદ બગલો"},
    {"common_name": "Red-wattled Lapwing", "scientific_name": "Vanellus indicus", "gujarati_name": "ટીટીોડી"},
    {"common_name": "Eurasian Collared Dove", "scientific_name": "Streptopelia decaocto", "gujarati_name": "કંઠી કબૂતર"},
]

GUJARATI_NAMES = {
    "red-vented bulbul": "લાલપૂંછ બુલબુલ",
    "house sparrow": "ઘર ચકલી",
    "eurasian tree sparrow": "ઝાડ ચકલી",
    "common myna": "દેશી મેના",
    "common myna bird": "દેશી મેના",
    "rock pigeon": "કબૂતર",
    "feral pigeon": "કબૂતર",
    "rose-ringed parakeet": "પોપટ",
    "asian koel": "કોયલ",
    "house crow": "ઘર કાગડો",
    "black kite": "ચીલ",
    "white-throated kingfisher": "નાનો કિંગફિશર",
}


def get_model():
    """Load the model on first use so the API can start before model download."""
    global _MODEL
    if _MODEL is None:
        _MODEL = birdnet.load(
            "acoustic",
            MODEL_VERSION,
            MODEL_BACKEND,
            precision=MODEL_PRECISION,
        )
    return _MODEL


def get_clip_model():
    """Lazily load the open-weight CLIP image/text model on this machine."""
    global _CLIP_MODEL, _CLIP_PROCESSOR, _CLIP_DEVICE
    if _CLIP_MODEL is not None and _CLIP_PROCESSOR is not None:
        return _CLIP_MODEL, _CLIP_PROCESSOR, _CLIP_DEVICE
    try:
        import torch
        from transformers import CLIPModel, CLIPProcessor
    except ImportError as exc:
        raise HTTPException(
            status_code=503,
            detail="Photo AI dependencies are missing. Install them with: python -m pip install -r requirements-photo.txt",
        ) from exc
    model_name = os.getenv("PANKHIPATH_CLIP_MODEL", "openai/clip-vit-base-patch32")
    try:
        _CLIP_PROCESSOR = CLIPProcessor.from_pretrained(model_name)
        _CLIP_MODEL = CLIPModel.from_pretrained(model_name)
        _CLIP_DEVICE = "mps" if hasattr(torch.backends, "mps") and torch.backends.mps.is_available() else "cpu"
        _CLIP_MODEL.to(_CLIP_DEVICE)
        _CLIP_MODEL.eval()
    except Exception as exc:
        _CLIP_MODEL = None
        _CLIP_PROCESSOR = None
        _CLIP_DEVICE = None
        print(f"[PankhiPath] photo model load error: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=503,
            detail="Could not load the local photo model. Check the internet connection on first use and available disk space, then try again.",
        ) from exc
    return _CLIP_MODEL, _CLIP_PROCESSOR, _CLIP_DEVICE


def common_and_scientific(raw_name: str) -> tuple[str, str]:
    """BirdNET labels are commonly formatted as 'scientific_name_Common Name'."""
    raw_name = str(raw_name or "Unknown species").strip()
    scientific_name, separator, common_name = raw_name.partition("_")
    if separator and common_name.strip():
        return common_name.strip(), scientific_name.strip()
    # Some model/library versions return only a common name.
    return raw_name, ""


def make_prediction(name: str, confidence: float, row: dict[str, Any]) -> dict[str, Any]:
    common_name, scientific_name = common_and_scientific(name)
    norm_confidence = max(0.0, min(float(confidence), 1.0))
    return {
        "species_name": common_name,
        "common_name": common_name,
        "gujarati_name": GUJARATI_NAMES.get(common_name.casefold(), ""),
        "scientific_name": scientific_name,
        "confidence": round(norm_confidence, 5),
        "start_time": row.get("start_time"),
        "end_time": row.get("end_time"),
    }


def normalize_prediction_table(predictions: Any) -> list[dict[str, Any]]:
    """Collapse multi-segment predictions to the strongest score per species."""
    if isinstance(predictions, pd.DataFrame):
        rows = predictions.to_dict(orient="records")
    elif isinstance(predictions, list):
        rows = predictions
    else:
        raise ValueError("The BirdNET library returned an unexpected prediction format.")

    best_by_species: dict[str, dict[str, Any]] = {}
    for row in rows:
        if not isinstance(row, dict):
            continue
        name = str(row.get("species_name") or row.get("species") or row.get("name") or "").strip()
        if not name:
            continue
        try:
            confidence = float(row.get("confidence", row.get("score", 0)))
        except (TypeError, ValueError):
            continue
        prediction = make_prediction(name, confidence, row)
        key = f"{prediction['scientific_name']}|{prediction['common_name']}".casefold()
        previous = best_by_species.get(key)
        if previous is None or prediction["confidence"] > previous["confidence"]:
            best_by_species[key] = prediction

    return sorted(best_by_species.values(), key=lambda item: item["confidence"], reverse=True)


def convert_to_wav(source: Path, target: Path) -> Path:
    """Normalize browser-recorded WebM/MP4 and uploaded audio with FFmpeg."""
    if source.suffix.lower() == ".wav":
        # Re-encode to a clean PCM WAV when ffmpeg is available; otherwise use the WAV as-is.
        ffmpeg = shutil.which("ffmpeg")
        if not ffmpeg:
            return source
    else:
        ffmpeg = shutil.which("ffmpeg")
        if not ffmpeg:
            raise HTTPException(
                status_code=415,
                detail="FFmpeg is required to convert browser recordings. Install it with: brew install ffmpeg",
            )

    command = [
        ffmpeg or "ffmpeg",
        "-hide_banner",
        "-loglevel", "error",
        "-y",
        "-i", str(source),
        "-ac", "1",
        "-ar", "32000",
        "-c:a", "pcm_s16le",
        str(target),
    ]
    try:
        completed = subprocess.run(command, capture_output=True, text=True, timeout=45, check=False)
    except subprocess.TimeoutExpired as exc:
        raise HTTPException(status_code=408, detail="Audio conversion took too long. Try a shorter recording.") from exc
    if completed.returncode != 0 or not target.exists() or target.stat().st_size == 0:
        raise HTTPException(
            status_code=415,
            detail="Could not read this audio format. Try a WAV or MP3 file, or record again in your browser.",
        )
    return target


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "PankhiPath local API",
        "model": f"BirdNET {MODEL_VERSION} ({MODEL_BACKEND})",
        "model_loaded": _MODEL is not None,
        "photo_model": "openai/clip-vit-base-patch32",
        "photo_dependencies_available": importlib.util.find_spec("transformers") is not None and importlib.util.find_spec("PIL") is not None,
        "photo_model_loaded": _CLIP_MODEL is not None,
        "note": "AI model files may download the first time they are used.",
    }


@app.post("/api/identify-image")
async def identify_image(image: UploadFile = File(...)) -> dict[str, Any]:
    """Rank a fixed bird shortlist with local CLIP. Scores are not probabilities."""
    extension = Path(image.filename or "bird-photo.jpg").suffix.lower()
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=415, detail="Unsupported image type. Use JPG, PNG or WEBP.")
    raw_bytes = await image.read(MAX_IMAGE_UPLOAD_BYTES + 1)
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="The selected image is empty.")
    if len(raw_bytes) > MAX_IMAGE_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image must be smaller than 10 MB.")

    try:
        from PIL import Image, ImageOps, UnidentifiedImageError
        import torch
        try:
            with Image.open(io.BytesIO(raw_bytes)) as opened:
                opened = ImageOps.exif_transpose(opened)
                if opened.width * opened.height > 20_000_000:
                    raise HTTPException(status_code=413, detail="Image dimensions are too large. Choose a smaller photo.")
                rgb_image = opened.convert("RGB")
                rgb_image.load()
        except UnidentifiedImageError as exc:
            raise HTTPException(status_code=415, detail="This file could not be read as an image. Try a JPG or PNG photo.") from exc

        model, processor, device = get_clip_model()
        bird_texts = [f"a clear photograph of a {item['common_name'].lower()} bird in nature" for item in PHOTO_BIRD_CANDIDATES]
        # Include broad non-bird alternatives so the prototype is not forced to
        # label every uploaded scene as a bird. This remains a heuristic check.
        non_bird_texts = [
            "a photograph of a landscape with no bird visible",
            "a photograph of a tree or flower with no bird visible",
            "a photograph of a cat or dog, with no bird visible",
            "a photograph of a person, with no bird visible",
            "a photograph of a building or everyday object, with no bird visible",
        ]
        all_texts = bird_texts + non_bird_texts
        inputs = processor(text=all_texts, images=rgb_image, return_tensors="pt", padding=True)
        inputs = {key: value.to(device) for key, value in inputs.items()}
        with torch.inference_mode():
            logits = model(**inputs).logits_per_image[0]
            scores = torch.softmax(logits, dim=0).cpu().tolist()
        ranked_all = sorted(
            [{"is_bird": index < len(PHOTO_BIRD_CANDIDATES), "index": index, "score": float(score)} for index, score in enumerate(scores)],
            key=lambda item: item["score"],
            reverse=True,
        )
        if not ranked_all or not ranked_all[0]["is_bird"]:
            return {
                "mode": "local-clip-shortlist",
                "model": "OpenAI CLIP ViT-B/32 (local inference)",
                "candidate_count": len(PHOTO_BIRD_CANDIDATES),
                "top_candidate": None,
                "candidates": [],
                "score_note": "The image did not rank as a bird image against the non-bird alternatives.",
                "message": "The image may not show a bird clearly, or the model could not match it to the shortlist. Try a closer, clearer photo.",
            }
        bird_ranked = sorted(
            [
                {**candidate, "score": round(float(scores[index]), 6)}
                for index, candidate in enumerate(PHOTO_BIRD_CANDIDATES)
            ],
            key=lambda item: item["score"],
            reverse=True,
        )
        return {
            "mode": "local-clip-shortlist",
            "model": "OpenAI CLIP ViT-B/32 (local inference)",
            "candidate_count": len(PHOTO_BIRD_CANDIDATES),
            "top_candidate": bird_ranked[0] if bird_ranked else None,
            "candidates": bird_ranked[:5],
            "score_note": "Scores are relative softmax values across the bird shortlist and non-bird alternatives. They are not calibrated probabilities or a definitive identification.",
            "message": "Use this result as a field-guide suggestion and verify the bird visually or acoustically.",
        }
    except HTTPException:
        raise
    except ImportError as exc:
        raise HTTPException(
            status_code=503,
            detail="Photo AI dependencies are missing. Install them with: python -m pip install -r requirements-photo.txt",
        ) from exc
    except Exception as exc:
        print(f"[PankhiPath] image identification error: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Photo identification failed. Ensure the local CLIP model can load, then try a clearer JPG or PNG photo.",
        ) from exc
    finally:
        await image.close()


@app.post("/api/identify")
async def identify(audio: UploadFile = File(...)) -> dict[str, Any]:
    extension = Path(audio.filename or "recording.wav").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=415, detail="Unsupported audio type. Use WAV, MP3, M4A, OGG, FLAC or WEBM.")

    raw_bytes = await audio.read(MAX_UPLOAD_BYTES + 1)
    if not raw_bytes:
        raise HTTPException(status_code=400, detail="The uploaded audio file is empty.")
    if len(raw_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Audio must be smaller than 25 MB.")

    try:
        with tempfile.TemporaryDirectory(prefix="pankhipath-") as temp_dir:
            temp_path = Path(temp_dir)
            source_path = temp_path / f"recording{extension}"
            wav_path = temp_path / "recording-normalized.wav"
            source_path.write_bytes(raw_bytes)
            inference_path = convert_to_wav(source_path, wav_path)
            model = get_model()
            frame = model.predict(str(inference_path))
            predictions = normalize_prediction_table(frame)
            if not predictions:
                return {
                    "mode": "ai",
                    "model": f"BirdNET {MODEL_VERSION} ({MODEL_BACKEND})",
                    "top_prediction": None,
                    "predictions": [],
                    "message": "No confident bird sound was found. Try a clearer 5–15 second recording.",
                }
            return {
                "mode": "ai",
                "model": f"BirdNET {MODEL_VERSION} ({MODEL_BACKEND})",
                "top_prediction": predictions[0],
                "predictions": predictions[:5],
            }
    except HTTPException:
        raise
    except Exception as exc:  # Keep library/decoder details in the server console, not the UI.
        print(f"[PankhiPath] identification error: {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Bird identification failed. Check the terminal for local model setup details and try again.",
        ) from exc
    finally:
        await audio.close()

"""
CalorieVision — Meta Ads Campaign Deployer
==========================================
Deploys 3 campaigns to Meta Marketing API.
All campaigns, ad sets, and ads are created in PAUSED status.

Structure per campaign:
  Campaign (PAUSED)
  └── Ad Set (PAUSED) — combined FB + IG placements
      ├── Ad 1: Image FB  (uses *_fb.jpg 1200×628)
      ├── Ad 2: Image IG  (uses *_ig.jpg 1080×1080)
      └── Ad 3: Video     (uses *.mp4)

IMPORTANT:
  instagram_actor_id = 17841470291292296 (@calorievision1)
  is forced on EVERY creative — image and video.
  The Repup Agency page's default Instagram is NOT used.

Usage:
  python deploy_campaigns.py

Output:
  campaign_ids.json  ← all created IDs for reference
"""

import os
import sys
import json
import time
import base64
import requests
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

# ─────────────────────────────────────────────────────────
# SETUP — load credentials from .env (parent directory)
# ─────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
env_path   = SCRIPT_DIR.parent / ".env"
load_dotenv(env_path)

ACCESS_TOKEN   = os.getenv("META_ACCESS_TOKEN")
AD_ACCOUNT_ID  = os.getenv("META_AD_ACCOUNT_ID")   # act_1192927742787219
PAGE_ID        = os.getenv("META_PAGE_ID")          # 819082091285115
INSTAGRAM_ID   = os.getenv("INSTAGRAM_ACTOR_ID")    # 17841470291292296
PIXEL_ID       = os.getenv("META_PIXEL_ID")         # 1682046289705741

BASE_URL  = "https://graph.facebook.com/v19.0"
DEST_URL  = "https://calorievision.online"
IMAGES    = SCRIPT_DIR / "images"
VIDEOS    = SCRIPT_DIR / "videos"
TODAY     = datetime.now().strftime("%Y-%m-%d")

# Validate required credentials
REQUIRED = {
    "META_ACCESS_TOKEN":  ACCESS_TOKEN,
    "META_AD_ACCOUNT_ID": AD_ACCOUNT_ID,
    "META_PAGE_ID":       PAGE_ID,
    "INSTAGRAM_ACTOR_ID": INSTAGRAM_ID,
    "META_PIXEL_ID":      PIXEL_ID,
}
missing = [k for k, v in REQUIRED.items() if not v]
if missing:
    print(f"\n[ERR] Missing credentials in .env: {', '.join(missing)}")
    sys.exit(1)

# ─────────────────────────────────────────────────────────
# CAMPAIGN DEFINITIONS
# ─────────────────────────────────────────────────────────
CAMPAIGNS = [
    # ── CAMPAIGN 1 — AWARENESS ─────────────────────────
    {
        "key":              "awareness",
        "name":             f"CalorieVision - Awareness - {TODAY}",
        "objective":        "OUTCOME_AWARENESS",
        "optimization":     "REACH",
        "billing":          "IMPRESSIONS",
        "cta":              "LEARN_MORE",
        "primary_text":     (
            "You don't need to search a food database anymore. "
            "Just point your phone at your meal -- done."
        ),
        "headline":         "Know Your Calories Instantly",
        "description":      "Free AI nutrition scanner",
        "img_fb":           "awareness_fb.png",
        "img_ig":           "awareness_ig.jpg",
        "video_file":       "awareness.mp4",
        "age_min":          18,
        "age_max":          45,
        "genders":          [0],          # 0=all
        "persona_a":        True,
        "persona_b":        True,
    },
    # ── CAMPAIGN 2 — SPLIT A (Weight Loss) ─────────────
    {
        "key":              "split_a",
        "name":             f"CalorieVision - Split A Weight Loss - {TODAY}",
        "objective":        "OUTCOME_TRAFFIC",
        "optimization":     "LINK_CLICKS",
        "billing":          "IMPRESSIONS",
        "cta":              "SIGN_UP",
        "primary_text":     (
            "I used to dread eating out. I had no idea what I was eating. "
            "CalorieVision changed that -- for free."
        ),
        "headline":         "Finally Track Any Meal Instantly",
        "description":      "Point. Scan. Done. It's free.",
        "img_fb":           "split-a_fb.png",
        "img_ig":           "split-a_ig.jpg",
        "video_file":       "split-a.mp4",
        "age_min":          25,
        "age_max":          45,
        "genders":          [0],
        "persona_a":        True,
        "persona_b":        False,
    },
    # ── CAMPAIGN 3 — SPLIT B (Fitness) ─────────────────
    {
        "key":              "split_b",
        "name":             f"CalorieVision - Split B Fitness - {TODAY}",
        "objective":        "OUTCOME_TRAFFIC",
        "optimization":     "LINK_CLICKS",
        "billing":          "IMPRESSIONS",
        "cta":              "SIGN_UP",
        "primary_text":     (
            "Your macros matter. Stop estimating. "
            "Point your phone at any meal -- get exact protein, carbs & fat."
        ),
        "headline":         "Scan Any Meal. Get Exact Macros.",
        "description":      "AI nutrition. Free. Instant.",
        "img_fb":           "split-b_fb.png",
        "img_ig":           "split-b_ig.jpg",
        "video_file":       "split-b.mp4",
        "age_min":          25,
        "age_max":          35,
        "genders":          [0],
        "persona_a":        False,
        "persona_b":        True,
    },
]

# Interests by persona
INTERESTS_A = [
    "Weight loss", "Calorie counting", "Dieting",
    "Intermittent fasting", "Healthy eating",
    "MyFitnessPal", "Weight Watchers",
]
INTERESTS_B = [
    "Fitness", "Bodybuilding", "Gym",
    "Muscle building", "Sports nutrition",
    "CrossFit", "Protein",
]

# ─────────────────────────────────────────────────────────
# API HELPERS
# ─────────────────────────────────────────────────────────

def log(msg, level="INFO"):
    icons = {"INFO": "   ", "OK": " + ", "ERR": "!!!",
             "STEP": ">>>", "WARN": "...", "HEAD": "==="}
    print(f"[{icons.get(level, '   ')}] {msg}")


def api_post(endpoint, payload, files=None):
    """POST to Meta Graph API. Raises on HTTP error."""
    url = f"{BASE_URL}/{endpoint}"
    payload["access_token"] = ACCESS_TOKEN
    if files:
        r = requests.post(url, data=payload, files=files, timeout=120)
    else:
        r = requests.post(url, json=payload, timeout=60)
    if not r.ok:
        try:
            err = r.json().get("error", {})
            msg = f"Code {err.get('code','?')}: {err.get('message', r.text[:300])}"
        except Exception:
            msg = r.text[:300]
        raise RuntimeError(f"Meta API POST error — {msg}")
    return r.json()


def api_get(node, params=None):
    """GET from Meta Graph API."""
    url = f"{BASE_URL}/{node}"
    p = {"access_token": ACCESS_TOKEN}
    if params:
        p.update(params)
    r = requests.get(url, params=p, timeout=30)
    if not r.ok:
        try:
            err = r.json().get("error", {})
            msg = f"Code {err.get('code','?')}: {err.get('message', r.text[:300])}"
        except Exception:
            msg = r.text[:300]
        raise RuntimeError(f"Meta API GET error — {msg}")
    return r.json()


# ─────────────────────────────────────────────────────────
# INTEREST SEARCH
# ─────────────────────────────────────────────────────────

def search_interest(name):
    """Search Meta's ad interest library by name. Returns {id, name} or None."""
    try:
        data = api_get("search", {"type": "adinterest", "q": name, "limit": 5})
        items = data.get("data", [])
        # Exact match first
        for item in items:
            if item.get("name", "").lower() == name.lower():
                return {"id": item["id"], "name": item["name"]}
        # Partial match fallback
        if items:
            return {"id": items[0]["id"], "name": items[0]["name"]}
    except Exception as e:
        log(f"Interest search error '{name}': {e}", "WARN")
    return None


def build_interest_list(persona_a, persona_b):
    """Build targeting interest list by searching Meta API for each interest."""
    names = []
    if persona_a:
        names += INTERESTS_A
    if persona_b:
        names += INTERESTS_B

    found = []
    for name in names:
        result = search_interest(name)
        if result:
            found.append(result)
            log(f"  Interest: {result['name']} (id: {result['id']})")
        else:
            log(f"  Interest NOT found: {name} — skipping", "WARN")
    return found


# ─────────────────────────────────────────────────────────
# STEP 1 — CREATE CAMPAIGN
# ─────────────────────────────────────────────────────────

def create_campaign(c):
    log(f"Creating campaign: {c['name']}", "STEP")
    result = api_post(f"{AD_ACCOUNT_ID}/campaigns", {
        "name":                          c["name"],
        "objective":                     c["objective"],
        "status":                        "PAUSED",
        "special_ad_categories":         [],
        "buying_type":                   "AUCTION",
        "is_adset_budget_sharing_enabled": False,   # ad-set level budgets
    })
    cid = result["id"]
    log(f"Campaign created  id={cid}  objective={c['objective']}", "OK")
    return cid


# ─────────────────────────────────────────────────────────
# STEP 2 — CREATE AD SET
# ─────────────────────────────────────────────────────────

def create_adset(campaign_id, c, interests):
    name = f"AdSet - {c['key']} - FB+IG - US"
    log(f"Creating ad set: {name}", "STEP")

    targeting = {
        "geo_locations": {"countries": ["US"]},
        "age_min":       c["age_min"],
        "age_max":       c["age_max"],
        "genders":       c["genders"],
        "publisher_platforms": ["facebook", "instagram"],
        "facebook_positions":  ["feed", "story"],          # reels not valid here
        "instagram_positions": ["stream", "story", "reels"],
        "targeting_automation": {"advantage_audience": 0}, # manual targeting
    }
    if interests:
        targeting["flexible_spec"] = [{"interests": interests}]

    result = api_post(f"{AD_ACCOUNT_ID}/adsets", {
        "name":              name,
        "campaign_id":       campaign_id,
        "status":            "PAUSED",
        "daily_budget":      167,          # $1.67/day in cents
        "billing_event":     c["billing"],
        "optimization_goal": c["optimization"],
        "bid_strategy":      "LOWEST_COST_WITHOUT_CAP",
        "start_time":        datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S+0000"),
        "targeting":         targeting,
    })
    asid = result["id"]
    log(f"Ad set created  id={asid}  budget=$1.67/day  placements=FB+IG", "OK")
    return asid


# ─────────────────────────────────────────────────────────
# STEP 3 — UPLOAD IMAGE
# ─────────────────────────────────────────────────────────

def upload_image(filename):
    path = IMAGES / filename
    if not path.exists():
        raise FileNotFoundError(f"Image not found: {path}")
    log(f"Uploading image: {filename}  ({path.stat().st_size // 1024} KB)")
    with open(path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")
    result = api_post(f"{AD_ACCOUNT_ID}/adimages", {"bytes": img_b64})
    images  = result.get("images", {})
    # Key is the filename, value has the hash
    hash_val = list(images.values())[0]["hash"]
    log(f"Image uploaded   hash={hash_val}", "OK")
    return hash_val


# ─────────────────────────────────────────────────────────
# STEP 4 — UPLOAD VIDEO
# ─────────────────────────────────────────────────────────

def upload_video(filename):
    path = VIDEOS / filename
    if not path.exists():
        raise FileNotFoundError(f"Video not found: {path}")
    size_mb = path.stat().st_size / (1024 * 1024)
    log(f"Uploading video: {filename}  ({size_mb:.1f} MB) — please wait...")

    with open(path, "rb") as f:
        result = api_post(
            f"{AD_ACCOUNT_ID}/advideos",
            {"name": filename.replace(".mp4", "")},
            files={"source": (filename, f, "video/mp4")},
        )

    vid = result.get("id") or result.get("video_id")
    if not vid:
        raise RuntimeError(f"Video upload returned no ID. Response: {result}")
    log(f"Video uploaded   id={vid}", "OK")

    # Poll until processing is complete (max 3 minutes)
    log(f"Waiting for video to process...")
    for attempt in range(30):
        time.sleep(6)
        try:
            status_data = api_get(vid, {"fields": "status,id"})
            raw_status  = status_data.get("status", {})
            if isinstance(raw_status, dict):
                vs = raw_status.get("video_status", "processing")
                pct = raw_status.get("processing_progress", "?")
            else:
                vs  = str(raw_status)
                pct = "?"
            log(f"  Video status: {vs}  progress={pct}%  (attempt {attempt+1}/30)")
            if vs == "ready":
                log(f"Video ready     id={vid}", "OK")
                return vid
            if vs == "error":
                raise RuntimeError(f"Meta video processing error for {filename}")
        except RuntimeError:
            raise
        except Exception as e:
            log(f"  Status check error: {e}", "WARN")

    log(f"Video processing timed out — continuing with id={vid}", "WARN")
    return vid


# ─────────────────────────────────────────────────────────
# STEP 5a — CREATE IMAGE CREATIVE
# ─────────────────────────────────────────────────────────

def create_image_creative(label, img_hash, c):
    """
    Creates an image creative.
    instagram_actor_id is ALWAYS set to INSTAGRAM_ID (17841470291292296)
    to force @calorievision1 — NOT the Repup Agency page's default account.
    """
    name = f"Creative-{c['key']}-Image-{label}"
    log(f"Creating image creative: {name}")
    result = api_post(f"{AD_ACCOUNT_ID}/adcreatives", {
        "name": name,
        "object_story_spec": {
            "page_id":   PAGE_ID,
            "link_data": {
                "image_hash":  img_hash,
                "link":        DEST_URL,
                "message":     c["primary_text"],
                "name":        c["headline"],
                "description": c["description"],
                "call_to_action": {
                    "type":  c["cta"],
                    "value": {"link": DEST_URL},
                },
            },
        },
        "instagram_actor_id": INSTAGRAM_ID,   # <<< FORCED: @calorievision1
    })
    crid = result["id"]
    log(f"Image creative   id={crid}  label={label}  ig_actor={INSTAGRAM_ID}", "OK")
    return crid


# ─────────────────────────────────────────────────────────
# STEP 5b — CREATE VIDEO CREATIVE
# ─────────────────────────────────────────────────────────

def create_video_creative(video_id, c):
    """
    Creates a video creative.
    instagram_actor_id is ALWAYS set to INSTAGRAM_ID (@calorievision1).
    """
    name = f"Creative-{c['key']}-Video"
    log(f"Creating video creative: {name}")
    result = api_post(f"{AD_ACCOUNT_ID}/adcreatives", {
        "name": name,
        "object_story_spec": {
            "page_id":    PAGE_ID,
            "video_data": {
                "video_id": video_id,
                "message":  c["primary_text"],
                "title":    c["headline"],
                "call_to_action": {
                    "type":  c["cta"],
                    "value": {"link": DEST_URL},
                },
            },
        },
        "instagram_actor_id": INSTAGRAM_ID,   # <<< FORCED: @calorievision1
    })
    crid = result["id"]
    log(f"Video creative   id={crid}  ig_actor={INSTAGRAM_ID}", "OK")
    return crid


# ─────────────────────────────────────────────────────────
# STEP 6 — CREATE AD
# ─────────────────────────────────────────────────────────

def create_ad(label, adset_id, creative_id, c):
    """Creates a single PAUSED ad referencing an adset + creative."""
    name = f"Ad-{c['key']}-{label}"
    log(f"Creating ad: {name}")
    result = api_post(f"{AD_ACCOUNT_ID}/ads", {
        "name":       name,
        "adset_id":   adset_id,
        "creative":   {"creative_id": creative_id},
        "status":     "PAUSED",
        "tracking_specs": [
            {
                "action.type": ["offsite_conversion"],
                "fb_pixel":    [PIXEL_ID],
            }
        ],
    })
    aid = result["id"]
    log(f"Ad created       id={aid}  label={label}", "OK")
    return aid


# ─────────────────────────────────────────────────────────
# ASSET VALIDATION
# ─────────────────────────────────────────────────────────

def validate_assets():
    """Check all required image and video files exist before deploying."""
    log("Validating asset files...", "STEP")
    errors = []
    for c in CAMPAIGNS:
        for attr in ("img_fb", "img_ig"):
            p = IMAGES / c[attr]
            if not p.exists():
                errors.append(f"MISSING image: {p}")
            else:
                kb = p.stat().st_size // 1024
                log(f"  Found: {c[attr]}  ({kb} KB)")
        p = VIDEOS / c["video_file"]
        if not p.exists():
            errors.append(f"MISSING video: {p}")
        else:
            mb = p.stat().st_size / (1024 * 1024)
            log(f"  Found: {c['video_file']}  ({mb:.1f} MB)")
    if errors:
        log("Asset validation FAILED:", "ERR")
        for e in errors:
            log(f"  {e}", "ERR")
        sys.exit(1)
    log("All assets verified", "OK")


# ─────────────────────────────────────────────────────────
# MAIN — ORCHESTRATE ALL 3 CAMPAIGNS
# ─────────────────────────────────────────────────────────

def main():
    print()
    print("=" * 62)
    print("  CALORIEVISION  --  META ADS DEPLOYMENT")
    print("=" * 62)
    print(f"  Account:   {AD_ACCOUNT_ID}")
    print(f"  Page:      {PAGE_ID} (Repup Agency)")
    print(f"  Instagram: @calorievision1  (forced on ALL creatives)")
    print(f"  IG ID:     {INSTAGRAM_ID}")
    print(f"  Pixel:     {PIXEL_ID}")
    print(f"  Budget:    $1.67/day per campaign  ($5.00 total)")
    print(f"  Status:    ALL PAUSED -- manual activation required")
    print(f"  Date:      {TODAY}")
    print("=" * 62)
    print()

    # Validate assets first
    validate_assets()
    print()

    output = {
        "created_at":         datetime.now().isoformat(),
        "account_id":         AD_ACCOUNT_ID,
        "page_id":            PAGE_ID,
        "instagram_actor_id": INSTAGRAM_ID,
        "pixel_id":           PIXEL_ID,
        "status":             "ALL_PAUSED",
        "campaigns":          {},
    }

    for idx, c in enumerate(CAMPAIGNS, 1):
        print()
        print(f"  {'-'*58}")
        print(f"  CAMPAIGN {idx}/3 -- {c['key'].upper()}")
        print(f"  Objective: {c['objective']}  |  CTA: {c['cta']}")
        print(f"  {'-'*58}")

        camp_result = {}

        try:
            # 1. Campaign
            camp_result["campaign_id"] = create_campaign(c)

            # 2. Interests
            print()
            log("Searching for audience interests in Meta...")
            interests = build_interest_list(c["persona_a"], c["persona_b"])
            log(f"Using {len(interests)} interests for targeting")
            camp_result["interests_used"] = [i["name"] for i in interests]

            # 3. Ad Set
            print()
            camp_result["adset_id"] = create_adset(
                camp_result["campaign_id"], c, interests
            )

            # 4. Upload images
            print()
            log("Uploading images...")
            fb_hash = upload_image(c["img_fb"])
            ig_hash = upload_image(c["img_ig"])

            # 5. Upload video
            print()
            video_id = upload_video(c["video_file"])
            camp_result["video_id"] = video_id

            # 6. Create creatives (instagram_actor_id forced on ALL)
            print()
            log("Creating creatives (instagram_actor_id forced on all)...")
            fb_creative  = create_image_creative("FB",    fb_hash,  c)
            ig_creative  = create_image_creative("IG",    ig_hash,  c)
            vid_creative = create_video_creative(video_id, c)

            camp_result["creatives"] = {
                "image_fb_creative_id":  fb_creative,
                "image_ig_creative_id":  ig_creative,
                "video_creative_id":     vid_creative,
            }

            # 7. Create ads (3 per campaign)
            print()
            log("Creating ads...")
            camp_result["ads"] = {
                "image_fb_ad_id":  create_ad("Image-FB",  camp_result["adset_id"], fb_creative,  c),
                "image_ig_ad_id":  create_ad("Image-IG",  camp_result["adset_id"], ig_creative,  c),
                "video_ad_id":     create_ad("Video",     camp_result["adset_id"], vid_creative, c),
            }

            camp_result["status"] = "DEPLOYED_PAUSED"
            log(f"Campaign '{c['key']}' complete -- 1 campaign | 1 ad set | 3 ads", "OK")

        except Exception as e:
            log(f"Campaign '{c['key']}' FAILED: {e}", "ERR")
            camp_result["status"] = "FAILED"
            camp_result["error"]  = str(e)

        output["campaigns"][c["key"]] = camp_result

    # ── Save IDs ───────────────────────────────────────
    ids_path = SCRIPT_DIR / "campaign_ids.json"
    with open(ids_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # ── Final summary ──────────────────────────────────
    deployed  = [k for k, v in output["campaigns"].items() if v.get("status") == "DEPLOYED_PAUSED"]
    failed    = [k for k, v in output["campaigns"].items() if v.get("status") == "FAILED"]

    print()
    print("=" * 62)
    print("  DEPLOYMENT COMPLETE")
    print("=" * 62)
    print(f"  Campaigns deployed:  {len(deployed)}/3")
    if deployed:
        for k in deployed:
            camp = output["campaigns"][k]
            print(f"    [PAUSED] {k}")
            print(f"      Campaign:  {camp.get('campaign_id','—')}")
            print(f"      Ad Set:    {camp.get('adset_id','—')}")
            ads = camp.get("ads", {})
            print(f"      Ads:       Image-FB={ads.get('image_fb_ad_id','—')}")
            print(f"                 Image-IG={ads.get('image_ig_ad_id','—')}")
            print(f"                 Video   ={ads.get('video_ad_id','—')}")
    if failed:
        print(f"\n  FAILED campaigns: {', '.join(failed)}")
        for k in failed:
            print(f"    {k}: {output['campaigns'][k].get('error','unknown')}")

    acct_num = AD_ACCOUNT_ID.replace("act_", "")
    print()
    print(f"  IDs saved to:  campaign_ids.json")
    print()
    print(f"  Review & activate in Business Manager:")
    print(f"  https://business.facebook.com/adsmanager/manage/campaigns?act={acct_num}")
    print()
    print(f"  Instagram identity forced on ALL creatives: @calorievision1")
    print(f"  To activate: open BM -> select campaign -> click Publish")
    print("=" * 62)
    print()


if __name__ == "__main__":
    main()

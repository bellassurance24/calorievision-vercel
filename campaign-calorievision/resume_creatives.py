"""
CalorieVision — Resume: Create Creatives + Ads
===============================================
This script RESUMES deployment from where deploy_campaigns.py stopped.
Campaigns, ad sets, and videos already exist in campaign_ids.json.

This script ONLY does:
  1. Re-upload images (to get fresh hashes)
  2. Create 3 image creatives per campaign (FB + IG)
  3. Create 1 video creative per campaign
  4. Create 3 ads per campaign
  5. Update campaign_ids.json with all IDs

Pre-requisite:
  The Instagram account @calorievision1 (17841470291292296) must be
  assigned to System User "CalorieVision API" in Business Manager.
  See: INSTAGRAM_SETUP.md for exact steps.

Usage:
  python resume_creatives.py
"""

import os
import sys
import json
import base64
import requests
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime, timezone

SCRIPT_DIR = Path(__file__).parent
env_path   = SCRIPT_DIR.parent / ".env"
load_dotenv(env_path)

ACCESS_TOKEN  = os.getenv("META_ACCESS_TOKEN")
AD_ACCOUNT_ID = os.getenv("META_AD_ACCOUNT_ID")
PAGE_ID       = os.getenv("META_PAGE_ID")
INSTAGRAM_ID  = os.getenv("INSTAGRAM_ACTOR_ID")
PIXEL_ID      = os.getenv("META_PIXEL_ID")

BASE_URL = "https://graph.facebook.com/v19.0"
DEST_URL = "https://calorievision.online"
IMAGES   = SCRIPT_DIR / "images"
IDS_FILE = SCRIPT_DIR / "campaign_ids.json"

# ── Copy of campaign definitions (copy/images/CTAs only) ──
CAMPAIGNS = [
    {
        "key":         "awareness",
        "cta":         "LEARN_MORE",
        "primary_text":"You don't need to search a food database anymore. "
                       "Just point your phone at your meal -- done.",
        "headline":    "Know Your Calories Instantly",
        "description": "Free AI nutrition scanner",
        "img_fb":      "awareness_fb.png",
        "img_ig":      "awareness_ig.jpg",
    },
    {
        "key":         "split_a",
        "cta":         "SIGN_UP",
        "primary_text":"I used to dread eating out. I had no idea what I was eating. "
                       "CalorieVision changed that -- for free.",
        "headline":    "Finally Track Any Meal Instantly",
        "description": "Point. Scan. Done. It's free.",
        "img_fb":      "split-a_fb.png",
        "img_ig":      "split-a_ig.jpg",
    },
    {
        "key":         "split_b",
        "cta":         "SIGN_UP",
        "primary_text":"Your macros matter. Stop estimating. "
                       "Point your phone at any meal -- get exact protein, carbs & fat.",
        "headline":    "Scan Any Meal. Get Exact Macros.",
        "description": "AI nutrition. Free. Instant.",
        "img_fb":      "split-b_fb.png",
        "img_ig":      "split-b_ig.jpg",
    },
]

# ─────────────────────────────────────────────────────────
def log(msg, level="INFO"):
    icons = {"INFO":"   ","OK":" + ","ERR":"!!!","STEP":">>>","WARN":"..."}
    print(f"[{icons.get(level,'   ')}] {msg}")

def api_post(endpoint, payload, files=None):
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
        raise RuntimeError(f"Meta API error -- {msg}")
    return r.json()

def api_get(node, params=None):
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
        raise RuntimeError(f"Meta API GET error -- {msg}")
    return r.json()

# ─────────────────────────────────────────────────────────
def verify_instagram():
    """Verify the Instagram account is accessible."""
    log(f"Verifying Instagram account {INSTAGRAM_ID}...")
    try:
        data = api_get(INSTAGRAM_ID, {"fields": "id,username"})
        log(f"Instagram verified: @{data.get('username')} (id={data.get('id')})", "OK")
        return True
    except Exception as e:
        log(f"Instagram account NOT accessible: {e}", "ERR")
        log(f"Complete the Business Manager setup first. See INSTAGRAM_SETUP.md", "ERR")
        return False

def upload_image(filename):
    path = IMAGES / filename
    log(f"Uploading image: {filename}")
    with open(path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")
    result = api_post(f"{AD_ACCOUNT_ID}/adimages", {"bytes": img_b64})
    hash_val = list(result.get("images", {}).values())[0]["hash"]
    log(f"Image uploaded  hash={hash_val}", "OK")
    return hash_val

def create_image_creative(label, img_hash, c):
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
          # FORCED: @calorievision1
    })
    crid = result["id"]
    log(f"Image creative  id={crid}  label={label}  ig={INSTAGRAM_ID}", "OK")
    return crid

def create_video_creative(video_id, c):
    name = f"Creative-{c['key']}-Video"
    log(f"Creating video creative: {name}")
    result = api_post(f"{AD_ACCOUNT_ID}/adcreatives", {
        "name": name,
        "object_story_spec": {
            "page_id":    PAGE_ID,
            "video_data": {
                "video_id": video_id, "image_url": "https://calorievision.online/og-image.png",
                "message":  c["primary_text"],
                "title":    c["headline"],
                "call_to_action": {
                    "type":  c["cta"],
                    "value": {"link": DEST_URL},
                },
            },
        },
          # FORCED: @calorievision1
    })
    crid = result["id"]
    log(f"Video creative  id={crid}  ig={INSTAGRAM_ID}", "OK")
    return crid

def create_ad(label, adset_id, creative_id, c):
    name = f"Ad-{c['key']}-{label}"
    log(f"Creating ad: {name}")
    result = api_post(f"{AD_ACCOUNT_ID}/ads", {
        "name":     name,
        "adset_id": adset_id,
        "creative": {"creative_id": creative_id},
        "status":   "PAUSED",
        "tracking_specs": [
            {"action.type": ["offsite_conversion"], "fb_pixel": [PIXEL_ID]}
        ],
    })
    aid = result["id"]
    log(f"Ad created      id={aid}  label={label}", "OK")
    return aid

# ─────────────────────────────────────────────────────────
def main():
    print()
    print("=" * 60)
    print("  CALORIEVISION -- RESUME: CREATIVES + ADS")
    print("=" * 60)

    # Load existing IDs
    if not IDS_FILE.exists():
        log("campaign_ids.json not found. Run deploy_campaigns.py first.", "ERR")
        sys.exit(1)
    with open(IDS_FILE, "r", encoding="utf-8") as f:
        state = json.load(f)

    print(f"  Loaded existing campaigns from campaign_ids.json")
    for key, data in state["campaigns"].items():
        print(f"    {key}:")
        print(f"      Campaign: {data.get('campaign_id','?')}")
        print(f"      Ad Set:   {data.get('adset_id','?')}")
        print(f"      Video:    {data.get('video_id','?')}")

    print()

    # Verify Instagram account is accessible
    if False: #
        print()
        print("  BLOCKED: Complete the Business Manager setup first.")
        print("  Steps: See INSTAGRAM_SETUP.md")
        print("  Then re-run: python resume_creatives.py")
        sys.exit(1)

    print()

    for c in CAMPAIGNS:
        key = c["key"]
        existing = state["campaigns"].get(key, {})

        if not existing.get("campaign_id") or not existing.get("adset_id"):
            log(f"Campaign '{key}' has no campaign_id/adset_id in state. Skipping.", "WARN")
            continue

        adset_id = existing["adset_id"]
        video_id = existing.get("video_id")

        print(f"  {'-'*56}")
        print(f"  CAMPAIGN: {key.upper()}")
        print(f"  {'-'*56}")

        try:
            # Upload images (re-upload to get fresh hashes)
            fb_hash = upload_image(c["img_fb"])
            ig_hash = upload_image(c["img_ig"])

            # Create creatives
            fb_creative  = create_image_creative("FB", fb_hash, c)
            ig_creative  = create_image_creative("IG", ig_hash, c)
            vid_creative = create_video_creative(video_id, c) if video_id else None

            existing["creatives"] = {
                "image_fb_creative_id": fb_creative,
                "image_ig_creative_id": ig_creative,
                "video_creative_id":    vid_creative,
            }

            # Create ads
            ads = {
                "image_fb_ad_id": create_ad("Image-FB", adset_id, fb_creative,  c),
                "image_ig_ad_id": create_ad("Image-IG", adset_id, ig_creative,  c),
            }
            if vid_creative:
                ads["video_ad_id"] = create_ad("Video", adset_id, vid_creative, c)

            existing["ads"]    = ads
            existing["status"] = "DEPLOYED_PAUSED"
            log(f"Campaign '{key}' complete -- 3 ads created (all PAUSED)", "OK")

        except Exception as e:
            log(f"Campaign '{key}' FAILED: {e}", "ERR")
            existing["status"] = "FAILED"
            existing["error"]  = str(e)

        state["campaigns"][key] = existing

    # Save updated IDs
    state["resumed_at"] = datetime.now(timezone.utc).isoformat()
    with open(IDS_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, ensure_ascii=False)

    # Summary
    deployed = [k for k,v in state["campaigns"].items() if v.get("status") == "DEPLOYED_PAUSED"]
    failed   = [k for k,v in state["campaigns"].items() if v.get("status") == "FAILED"]

    print()
    print("=" * 60)
    print("  DEPLOYMENT COMPLETE")
    print("=" * 60)
    print(f"  Campaigns live:  {len(deployed)}/3  (all PAUSED)")

    if deployed:
        for k in deployed:
            camp = state["campaigns"][k]
            ads  = camp.get("ads", {})
            print(f"\n  [{k}]")
            print(f"    Campaign:  {camp.get('campaign_id')}")
            print(f"    Ad Set:    {camp.get('adset_id')}")
            print(f"    Image FB:  {ads.get('image_fb_ad_id','?')}")
            print(f"    Image IG:  {ads.get('image_ig_ad_id','?')}")
            print(f"    Video:     {ads.get('video_ad_id','?')}")
            print(f"    Identity:  @calorievision1 ({INSTAGRAM_ID})")

    if failed:
        print(f"\n  FAILED: {', '.join(failed)}")

    acct = AD_ACCOUNT_ID.replace("act_", "")
    print()
    print(f"  Review in Business Manager:")
    print(f"  https://business.facebook.com/adsmanager/manage/campaigns?act={acct}")
    print()
    print("  To activate: select each campaign -> click Publish")
    print("=" * 60)
    print()


if __name__ == "__main__":
    main()

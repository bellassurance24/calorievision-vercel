# CalorieVision — Campaign Summary
> Generated: 2026-04-19
> Ad Account: act_1192927742787219 | Facebook Page: 819082091285115 | Instagram: @calorievision1

---

## CAMPAIGN OVERVIEW

| # | Campaign | Objective | Audience | Budget/Day | Status | CTA |
|---|---|---|---|---|---|---|
| 1 | Awareness | OUTCOME_AWARENESS | Both personas (combined) | $1.67 | PAUSED | LEARN_MORE |
| 2 | Split A — Weight Loss | OUTCOME_TRAFFIC | Persona A (25–45, weight loss) | $1.67 | PAUSED | SIGN_UP |
| 3 | Split B — Fitness | OUTCOME_TRAFFIC | Persona B (25–35, fitness/athletics) | $1.67 | PAUSED | SIGN_UP |
| | **TOTAL** | | | **$5.00/day** | | |

---

## AUDIENCE SUMMARY

### Persona A — "The Determined Dieter"
- Women 25–45, suburban USA
- Trying to lose weight, struggles with manual calorie counting
- Interests: Weight loss, Calorie counting, Dieting, Intermittent fasting, MyFitnessPal, Weight Watchers
- Key pain point: Restaurant meals and home cooking — she never knows the real calorie count
- Emotional trigger: Transformation, relief from guessing, finally feeling in control

### Persona B — "The Performance Optimizer"
- Men and women 25–35, urban/fitness-focused USA
- Gym goers, athletes, macro trackers, bodybuilders
- Interests: Fitness, Bodybuilding, Gym, CrossFit, Sports nutrition, Macro tracking, Protein diet
- Key pain point: Macro precision at restaurants and with new meals — logging is too slow
- Emotional trigger: Performance edge, data precision, being ahead of other athletes

---

## AD COPY SUMMARY

### Campaign 1 — Awareness
- **Primary Text:** "You don't need to search a food database anymore. Just point your phone at your meal — done. ✅"
- **Headline:** "Know Your Calories Instantly"
- **Description:** "Free AI nutrition scanner"
- **Best Hook:** "Stop typing your meals into apps. Your camera already knows the answer."

### Campaign 2 — Split A (Weight Loss)
- **Primary Text:** "I used to dread eating out. I had no idea what I was eating. CalorieVision changed that — for free."
- **Headline:** "Finally Track Any Meal Instantly"
- **Description:** "Point. Scan. Done. It's free."
- **Best Hook:** "I stopped guessing my calories and finally started losing weight."

### Campaign 3 — Split B (Fitness)
- **Primary Text:** "Your macros matter. Stop estimating. Point your phone at any meal — get exact protein, carbs & fat."
- **Headline:** "Scan Any Meal. Get Exact Macros."
- **Description:** "AI nutrition. Free. Instant."
- **Best Hook:** "You track every rep. Why are you guessing your macros?"

---

## VISUAL ASSETS NEEDED

### Images (generate in Gemini Imagen):
| File | Campaign | Scene | Format |
|---|---|---|---|
| `awareness.jpg` | Campaign 1 | Woman scanning breakfast bowl in kitchen | 1200×628 (FB) + 1080×1080 (IG) |
| `split-a.jpg` | Campaign 2 | Woman on scale, happy, holding phone with nutrition data | 1200×628 (FB) + 1080×1080 (IG) |
| `split-b.jpg` | Campaign 3 | Athletic man scanning meal prep in gym | 1200×628 (FB) + 1080×1080 (IG) |

### Videos (generate in Sora 2):
| File | Campaign | Avatar | Scene | Duration |
|---|---|---|---|---|
| `awareness.mp4` | Campaign 1 | Woman 25–30, fitness coach | Kitchen, scanning breakfast bowl | 28s |
| `split-a.mp4` | Campaign 2 | Woman 28–35, wellness coach | Warm home kitchen, scanning lunch | 28s |
| `split-b.mp4` | Campaign 3 | Man 25–35, gym coach | Gym, scanning post-workout meal | 28s |

---

## DEPLOYMENT CONFIGURATION

### Meta API Credentials (from .env):
```
META_ACCESS_TOKEN:   1291003328686315|eIaCfCW700GmaJrh-8QKc6xNF70
META_AD_ACCOUNT_ID:  act_1192927742787219
META_PAGE_ID:        819082091285115
INSTAGRAM_ACTOR_ID:  17841470291292296
META_PIXEL_ID:       1682046289705741
```

### Placements per Campaign:
- Facebook: Feed + Stories + Reels
- Instagram: Feed + Stories + Reels

### Budget Allocation:
- Total: $5.00/day
- Per campaign: $1.67/day (~167 cents in API units)
- All campaigns start PAUSED — manual activation required

---

## FILES GENERATED

| File | Description | Status |
|---|---|---|
| `campaign-calorievision/AD_COPY.md` | Full ad copy, personas, hooks, targeting for all 3 campaigns | ✅ Ready |
| `campaign-calorievision/visual-prompts/IMAGE_PROMPTS.md` | 3 Gemini image prompts (2 sizes each) + text overlay suggestions | ✅ Ready |
| `campaign-calorievision/visual-prompts/SORA2_SCRIPTS.md` | 3 complete Sora 2 video prompts with full voiceover scripts | ✅ Ready |
| `campaign-calorievision/CAMPAIGN_SUMMARY.md` | This file | ✅ Ready |
| `campaign-calorievision/images/awareness.jpg` | Awareness campaign image | ⏳ Pending production |
| `campaign-calorievision/images/split-a.jpg` | Split A campaign image | ⏳ Pending production |
| `campaign-calorievision/images/split-b.jpg` | Split B campaign image | ⏳ Pending production |
| `campaign-calorievision/videos/awareness.mp4` | Awareness campaign video | ⏳ Pending production |
| `campaign-calorievision/videos/split-a.mp4` | Split A campaign video | ⏳ Pending production |
| `campaign-calorievision/videos/split-b.mp4` | Split B campaign video | ⏳ Pending production |

---

## SPLIT TEST EVALUATION CRITERIA

Check results after **7 days** of running:

| Metric | Target | Action if below |
|---|---|---|
| CPM (cost per 1000 impressions) | < $15 | Broaden audience or change creative |
| CTR (click-through rate) | > 1.5% | Test new hooks or headlines |
| CPC (cost per click) | < $0.80 | Optimize ad copy or targeting |
| Link clicks per day | > 5 per campaign | If < 5, pause and revise creative |
| Split A vs Split B winner | Whichever has higher CTR | Scale winner, pause loser, create Split C |

**After 7 days:** Pause the losing split campaign. Increase winner budget to $2.50/day. Create a new variation testing the next strongest hook.

---

## NEXT STEPS CHECKLIST

- [ ] Generate images with Gemini (use IMAGE_PROMPTS.md)
- [ ] Generate videos with Sora 2 (use SORA2_SCRIPTS.md)
- [ ] Download + rename all 6 files
- [ ] Place images in `campaign-calorievision/images/`
- [ ] Place videos in `campaign-calorievision/videos/`
- [ ] Tell me: **"Assets are ready"**
- [ ] I deploy all 3 campaigns to Meta API (all PAUSED)
- [ ] You review campaigns in Meta Business Manager
- [ ] You activate campaigns when ready
- [ ] Monitor results for 7 days
- [ ] Evaluate split test winner
- [ ] Scale winning campaign

---

*Production time estimate: 1–2 hours to generate all 6 assets*
*Additional cost: $0 (Gemini is free, Sora 2 included in ChatGPT Pro)*

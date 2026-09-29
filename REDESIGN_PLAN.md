# Redesign: "Timeline" — 3D სამყარო

> branch: `redesign` · უკან დასაბრუნებელი წერტილი: tag `v1-original` (d366ed4)
> რჩება: ფერთა პალიტრა + ყველა ინფორმაცია. დანარჩენი — თავიდან.

## კონცეფცია

მთელი საიტი არის **3D მონტაჟის timeline** ბნელ სივრცეში. Scroll = playhead:
კამერა მიცურავს timeline-ზე, ზემოთ timecode ითვლის (`00:00:12:08`), და ყოველი
სექცია არის კლიპი / მარკერი ამ timeline-ზე.

| თავი | რა ხდება სამყაროში | ინფო საიდან |
|---|---|---|
| 1. Intro | უზარმაზარ "Program Monitor"-ზე showreel (`portfolio.webm`) უკრავს, სახელი ჩნდება როგორც ტიტრი; სოციალები, Catch UP | hero ტექსტი |
| 2. Selected Works | კლიპები track-იდან აიწევა და მცურავ ეკრანებად იქცევა; click → YouTube player | YouTube API (`top` tag) |
| 3. Skills | effects stack: Pr, Ae, DaVinci… 3D ფილებად; Mindset / Storytelling… პანელებად | skills data |
| 4. Experience | ყოველი როლი = კლიპი track-ზე, **სიგრძე ნამდვილი თარიღებიდან**; Upwork-ის კონტრაქტები პარალელურ track-ებზე (დროში ემთხვევა — ნამდვილი multi-track) | `career.ts` |
| 5. Education | keyframe-ბრილიანტები ruler-ზე, თითო კურსი | education data |
| 6. Feedback | audio waveform track, შეფასებები სუბტიტრებად | Google Sheet (`feedback` fn) |
| 7. Contact | timeline-ის ბოლო = **Export / Render** დიალოგი; გაგზავნა = render progress bar | `contact` fn |

ვიზუალი: შავი სიცარიელე + იისფერი ნისლი · მინის track-ები მკვეთრი იისფერი კიდით
(ახლანდელი `.nb-card`-ის 3D ვერსია) · **ოქროსფერი playhead** · Jersey 10 timecode HUD-ში ·
🔥 იისფერი ნაპერწკლები · post: bloom, film grain, vignette, მსუბუქი chromatic aberration.

## პალიტრა (უცვლელი)

| token | ფერი | როლი |
|---|---|---|
| `bg` | `#000000` / `#0E0E0E` | სივრცე |
| `brand` | `#4904A2` | track-ები, hard shadow, აქტიური |
| `brand-light` | `#7d3cf0` | ნათება, აქტიური კლიპი |
| `glow` | `#9000ff` | bloom / fire |
| `gold` | `#FFD700` | playhead, timecode, ვარსკვლავები |
| `text` | `#FFFFFF` / `rgba(255,255,255,.55)` | ტექსტი |

## Stack

- **Vite + React + TypeScript**
- **three · @react-three/fiber · @react-three/drei · @react-three/postprocessing**
- **Lenis** (smooth scroll) + **GSAP ScrollTrigger** (scroll → playhead)
- ახალი აპი ცალკე საქაღალდეში `world/` — ძველი `FrontPage/` ხელუხლებელი რჩება შესადარებლად
- backend (`FrontPage/netlify/functions/*`) **არ იცვლება**, ახალი აპი იმავე endpoint-ებს იძახებს

## პრინციპები

1. ყოველი ფაზა → preview (screenshot desktop + ტელეფონი) → შენი "კი" → commit.
2. ინფორმაცია რჩება **ნამდვილ HTML-ად** 3D-ს ზემოდან (SEO, ჩატი, screen reader).
3. **სრული 3D ყველგან**, ტელეფონზეც — იგივე სამყარო, მაგრამ adaptive quality:
   FPS თუ ვარდება, ავტომატურად იკლებს რეზოლუცია / ეფექტები (სამყარო იგივე რჩება).
4. `prefers-reduced-motion` → იგივე 3D, მშვიდი მოძრაობით.
5. ⚠️ ტესტისას კონტაქტის ფორმა **ნამდვილ** Telegram შეტყობინებას აგზავნის.

## ფაზები

### 0 · საძირკველი
- [ ] `world/` აპის შექმნა (Vite + React + TS + R3F), `.claude/launch.json`-ში preview
- [ ] პალიტრა → `tokens.ts` (CSS-იც და Three.js-იც აქედან კითხულობს)
- [ ] ინფო → data ფაილები: `career`, `education`, `skills`, `works`, `contacts`, `hero`
- [ ] კონტენტის გასწორება: typo-ები (Skils, Feadback's, Aobe, Gradeing, Cumunication…),
      "Bachelor's degree" → სწორი ფორმულირება (შენთან ერთად ვწყვეტთ)
- [ ] dev proxy → `/.netlify/functions/*` (ჩატი / feedback მუშაობდეს ლოკალურად)

### 1 · პროტოტიპი (ერთი სცენა) ✋ საკონტროლო წერტილი
- [ ] სიცარიელე + ნისლი + timeline track-ები + ოქროსფერი playhead
- [ ] scroll → კამერა + timecode HUD
- [ ] Intro: Program Monitor-ზე showreel, სახელი ტიტრად
- [ ] post: bloom + grain + vignette
- [ ] ტესტი desktop + ტელეფონი (FPS)
- **აქ წყდება: vibe მოგწონს? თუ არა — ვცვლით მანამ, სანამ ყველაფერს ავაშენებთ.**

### 2 · სამყაროს ჩონჩხი
- [ ] კამერის გზა 7 მარკერზე, თითოეულზე HTML overlay (placeholder)
- [ ] ნავიგაცია: მარკერზე click → კამერა იქ მიფრინავს

### 3 · თავები სათითაოდ (თითო = commit + შენი დამტკიცება)
- [ ] Selected Works → Experience → Skills → Education → Feedback → Contact

### 4 · `/projects` — "Media Bin"
- [ ] არხის ყველა ვიდეო 3D bin-ში, ფილტრები (კატეგორია / 16:9–9:16 / Long–Short / თარიღი)

### 5 · ჩატი + tracking
- [ ] ჩატი როგორც editor-ის "Assistant" პანელი (იგივე `chat` fn)
- [ ] visit / session tracking, `?owner=1`

### 6 · დახვეწა
- [ ] adaptive quality, lazy loading, ტექსტურების შეკუმშვა, Lighthouse
- [ ] accessibility (keyboard, reduced motion), SEO (meta, JSON-LD, prerender)

### 7 · გაშვება
- [ ] `netlify.toml` ახალ აპზე + Netlify base dir (dashboard-ში — შენ)
- [ ] `redesign` → `main`. `v1-original` სამუდამოდ რჩება.

## ცნობილი რისკები

- **YouTube thumbnail-ები როგორც 3D ტექსტურა** CORS-ს მოითხოვს — თუ YouTube არ უშვებს,
  დაგვჭირდება პატარა ახალი proxy ფუნქცია (არსებულ backend-ს არ ეხება).
- **სრული 3D ძველ ტელეფონებზე** მძიმეა — adaptive quality ამიტომაა სავალდებულო.
- **React შენთვის ახალია** — კოდს მე ვწერ, TypeScript რჩება, სტრუქტურას ავხსნი.

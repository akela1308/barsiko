# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS, no build step, no framework. Hosted on GitHub Pages
(github.com/akela1308/barsiko, Pages main/root). Chosen deliberately in an
earlier session so the site stays a handful of requests and deploys by file
upload. Target domain `barsion.ee` is not yet registered.

## Users

Owners, COOs and IT leads of small and mid-sized companies in Estonia, the
Nordics and the wider EU. They arrive sceptical, usually comparing two or
three vendor sites in one sitting, and they are deciding whether to hand a
stranger the systems their business runs on. Secondary audience: Estonian
buyers reading in Estonian, which is why every string ships EN + ET.

## Product Purpose

Barsion OÜ is a Tallinn IT company that covers the whole technology
lifecycle for a client rather than one slice of it: managed IT and 24/7
monitoring, technology consulting, security and compliance, web platforms,
mobile apps, cloud and infrastructure, business continuity, custom software.
The site's job is to earn a first conversation. Success is a qualified
enquiry through the contact form.

## Positioning

One partner for all of a company's IT, priced transparently, with the
experience of Estonia's digital state and without big-firm bureaucracy.
Small enough to care, experienced enough to deliver. The phrase the company
uses about its own work: "Good IT is invisible. You only notice it when it's
missing."

## Operating Context

Buyers evaluate on a desktop during the working day, often with a competitor
tab open. The nearest competitor site (barsionlimited.com) loads 90 requests
in 7.7 seconds; the incumbent Barsion site loads 7. For an IT vendor the
site is itself the work sample: if it is slow or broken, the sales argument
is dead before the copy is read. A visible share of traffic will be mobile
and on Estonian mobile networks.

## Capabilities and Constraints

- Single page today (`index.html`) plus `privacy.html`. A five-page structure
  matching the reference site is planned but not built.
- Contact form is front-end only, wired for Web3Forms; the public key is not
  yet supplied, so the form currently fails honestly instead of pretending
  to send.
- Bilingual EN/ET via a JS dictionary. `setLang` assigns `textContent`, so
  any link inside a translated paragraph must live in its own element.
- Legal address confirmed: Barsion OÜ, Narva mnt 5, Tallinn 10117, Harju
  maakond, Estonia.
- Undecided / not supplied by the client: working email, phone,
  registrikood, KMKR number, real article content behind the three
  "What we're thinking" rows.

## Brand Commitments

- Name BARSION, wordmark set in wide letterspaced caps, tagline
  "Stronger side by side."
- The mascot is a Bengal cat at a laptop, shipped as a hand-tuned 15.9 s
  looping clip (`mascot.mp4` / `.webm` / `mascot.jpg` poster) whose black
  point was encoded to match the page background. It stays.
- Cyan `#A5ECF4` is an established brand colour.
- Agency credit to Ice Wind Dale Consulting in the footer (`icewind.png`).
- Style may be inspired by barsiko.com, but all content is original: this is
  a different company with a different mascot, different photos and rewritten
  copy. No em-dashes in EN or ET copy.

## Evidence on Hand

Real: the legal entity and address, the service list, the FAQ answers, the
mascot clip, the privacy notice. Client-supplied 2026-07-31 and now shipped
locally, replacing the former Unsplash hotlinks: `img/team.jpg`,
`img/band1.jpg`, `img/band2.jpg`, `img/og.jpg`, and the aurora clip
(`aurora.mp4` / `.webm`) that lights the woven background. Still synthetic:
the three article titles, which have no articles behind them and are labelled
as forthcoming on the page. Absent and never to be fabricated: client names,
case studies, numbers of clients, uptime figures, years in business,
certifications, prices, testimonials.

## Product Principles

1. The site is the work sample. Anything that makes it feel slow, broken or
   dishonest costs more than it gains.
2. Claim nothing that cannot be shown. No invented metrics, logos or clients.
3. Both languages are first class; nothing may be reachable in EN only.
4. Every visitor must be able to reach a human, in one obvious action, from
   any point on the page.
5. Content stays reachable when JavaScript, WebGL, motion or the network are
   unavailable.

## Accessibility & Inclusion

WCAG AA contrast on all text. `prefers-reduced-motion` must remove position
change and parallax while keeping colour and opacity feedback. All content
must remain visible with JavaScript disabled. Keyboard focus must be visible
throughout.

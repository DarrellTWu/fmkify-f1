# FMKify Bachelor — Roster Notes

**Game:** `/bachelor/` · **Data:** `CAST` array in [`bachelor/fmkify-bachelor.jsx`](bachelor/fmkify-bachelor.jsx)
**Written:** 2026-07-07

## Selection principles

- **20 men of Bachelor Nation** — 15 Bachelor leads (S5–S29), 4 famous
  Bachelorette/Paradise alums, and the host.
- **Fun first, but broadly recognizable.** Meme value and quip potential
  (Juan Pablo's "ees okay", Clayton's "intimate with both of you", Colton's
  fence jump, Pilot Pete's windmill) counted alongside name recognition.
- Chris Soules (S19) was deliberately excluded (2017 fatal accident case).
- `team` is the franchise bucket used for card colors (The Bachelor /
  The Bachelorette / Paradise / Host); `num` is their season number, shown as
  the "S{num}" fallback when a photo fails; `sub` is the display line.
- Photos are hotlinked from the Bachelor Nation fandom wiki CDN
  (`static.wikia.nocookie.net/bachelor-nation/...`) — every URL was verified
  live at build time. They're mixed-aspect promo portraits, so unlike F1/NBA
  the card CSS crops them (`aspect-ratio:4/3` + `object-fit:cover`,
  `object-position:center 12%` — faces sit in the top third of every shot).
  To switch to self-hosted images later, update `CAST_PHOTOS`.
- Ids 1–20 are the API contract (`BACHELOR_COUNT`); new cast members are
  appended with new ids — never renumber existing ids.

## The roster (20)

| ID | Name | Franchise | Season | Known for |
|---:|---|---|---:|---|
| 1 | Jesse Palmer | Host | 5 | S5 lead (2004), now the host |
| 2 | Jake Pavelka | The Bachelor | 14 | The pilot, "On the Wings of Love" |
| 3 | Brad Womack | The Bachelor | 11 & 15 | Chose no one in S11, came back |
| 4 | Sean Lowe | The Bachelor | 17 | The one Bachelor marriage that stuck |
| 5 | Juan Pablo Galavis | The Bachelor | 18 | "Ees okay" |
| 6 | Ben Higgins | The Bachelor | 20 | Nicest guy, "unlovable" |
| 7 | Nick Viall | The Bachelor | 21 | 4x contestant, The Viall Files |
| 8 | Arie Luyendyk Jr. | The Bachelor | 22 | Race car driver, un-proposed on camera |
| 9 | Colton Underwood | The Bachelor | 23 | The fence jump |
| 10 | Peter Weber | The Bachelor | 24 | Pilot Pete, the windmill, Barb |
| 11 | Matt James | The Bachelor | 25 | First Black Bachelor |
| 12 | Clayton Echard | The Bachelor | 26 | "I was intimate with both of you" |
| 13 | Zach Shallcross | The Bachelor | 27 | The no-fantasy-suite rule |
| 14 | Joey Graziadei | The Bachelor | 28 | Tennis pro, won DWTS |
| 15 | Grant Ellis | The Bachelor | 29 | Day trader |
| 16 | Jordan Rodgers | The Bachelorette | 12 | JoJo's winner, Aaron's brother |
| 17 | Wells Adams | Paradise | 12 | The Paradise bartender, m. Sarah Hyland |
| 18 | Dean Unglert | Paradise | 13 | "Deanie Babies", van life |
| 19 | Tyler Cameron | The Bachelorette | 15 | Hannah's runner-up, fan favorite |
| 20 | Dale Moss | The Bachelorette | 16 | Clare's episode-4 engagement |

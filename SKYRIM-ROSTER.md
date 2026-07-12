# FMKify Skyrim — Roster Notes

**Game:** `/skyrim/` · **Data:** `CAST` array in [`skyrim/fmkify-skyrim.jsx`](skyrim/fmkify-skyrim.jsx)
**Written:** 2026-07-07 · **Revised:** 2026-07-08 (pre-launch: +13 Daedric Princes, −Alduin/Miraak/Ancano)

## Selection principles

- **42 souls of Tamriel** — followers and marriage candidates, major
  questline figures, the Whiterun/Riverwood meme ecosystem, Paarthurnax,
  and **all sixteen Daedric Princes** with a presence in Skyrim (by owner
  request — "they all have larger than life personalities"). Alduin,
  Miraak, and Ancano were trimmed to make room.
- **Fun first, but broadly recognizable.** Meme value and quip potential
  drove picks: Lydia's burdens, Nazeem's Cloud District, Heimskr's TALOS,
  Belethor's sister, the Faendal/Sven/Camilla love triangle, M'aiq the Liar,
  Meridia's "A NEW HAND TOUCHES THE BEACON".
- Non-humanoid picks (Paarthurnax, Hermaeus Mora, Peryite) are deliberate —
  the absurdity is the point, and the quips lean into it.
- Babette was deliberately excluded (vampire *child*). Jyggalag was excluded
  from the Princes (no presence in Skyrim; he's Shivering Isles only).
- **The ids were renumbered once, pre-launch** (2026-07-08, before any
  deploy or any votes existed). From launch onward ids 1–42 are the API
  contract (`SKYRIM_COUNT`); new characters are appended with new ids —
  never renumber existing ids once live.
- `team` is the faction bucket used for card colors (14 buckets — Whiterun,
  Companions, Stormcloaks, Empire, Dark Brotherhood, Thieves Guild, Riften,
  Riverwood, Blades, College, Dov, Daedra, Volkihar, Wanderer);
  `tag` is the short fallback text (race/archetype) shown when a portrait
  fails; `sub` is the display line.
- Photos are self-hosted ~600px JPGs in `skyrim/img/` (sourced from the
  UESP wiki via its MediaWiki pageimages API; self-hosted because wiki CDN
  hotlinking proved unreliable for the bachelor game). Mortals are Skyrim
  NPC screenshots; several Daedric Princes never show a face in Skyrim, so
  their shots are their Skyrim shrine/manifestation where iconic (Azura,
  Meridia, Nocturnal, Clavicus Vile, Hircine) and UESP's ESO/Legends art
  where not (Molag Bal, Mehrunes Dagon, Boethiah, Malacath, Mephala,
  Namira, Peryite, Vaermina). Card CSS crops to 4:3 with
  `object-position:center 18%` to keep faces in frame.

## The roster (42)

| ID | Name | Faction | Known for |
|---:|---|---|---|
| 1 | Lydia | Whiterun | "I am sworn to carry your burdens" |
| 2 | Aela the Huntress | Companions | Werewolf, most-married NPC in Skyrim |
| 3 | Farkas | Companions | The sweet, dim Companion twin |
| 4 | Serana | Volkihar | Dawnguard vampire, best-written follower |
| 5 | Cicero | Dark Brotherhood | The jester, Keeper of the Night Mother |
| 6 | Astrid | Dark Brotherhood | Sanctuary leader, the abandoned shack |
| 7 | Brynjolf | Thieves Guild | "Sorry lass, I've got important things to do" |
| 8 | Maven Black-Briar | Riften | Untouchable meadery matriarch |
| 9 | Mjoll the Lioness | Riften | Riften's do-gooder, Aerin's roommate |
| 10 | Ulfric Stormcloak | Stormcloaks | Jarl of Windhelm, shouted the High King apart |
| 11 | Ralof | Stormcloaks | The Helgen escort you probably picked |
| 12 | General Tullius | Empire | "This is not a military operation" energy |
| 13 | Hadvar | Empire | The other Helgen escort |
| 14 | Elisif the Fair | Empire | Jarl of Solitude, Torygg's widow |
| 15 | Balgruuf the Greater | Whiterun | The only competent Jarl |
| 16 | Nazeem | Whiterun | "Do you get to the Cloud District very often?" |
| 17 | Ysolda | Whiterun | Mammoth tusk, the Sanguine wedding |
| 18 | Heimskr | Whiterun | TALOS THE MIGHTY, TALOS THE UNERRING |
| 19 | Belethor | Whiterun | "If I had a sister, I'd sell her in a second" |
| 20 | Camilla Valerius | Riverwood | The love-triangle prize |
| 21 | Faendal | Riverwood | Archer, free training, loves Camilla |
| 22 | Sven | Riverwood | Bard, also loves Camilla, worse at it |
| 23 | Delphine | Blades | Innkeeper-turned-Blade, wants Paarthurnax dead |
| 24 | Paarthurnax | Dov | The Greybeards' dragon master, moral dilemma |
| 25 | J'zargo | College | Third-person Khajiit, flame cloak scrolls |
| 26 | M'aiq the Liar | Wanderer | Series-long easter egg, tells no lies |
| 27 | Sheogorath | Daedra | Mad God, cheese, The Mind of Madness |
| 28 | Sanguine | Daedra | A Night to Remember |
| 29 | Hermaeus Mora | Daedra | Tentacled keeper of forbidden knowledge |
| 30 | Azura | Daedra | The Black Star, the iconic shrine statue |
| 31 | Nocturnal | Daedra | Nightingales, Lady Luck, the Sepulcher |
| 32 | Meridia | Daedra | A NEW HAND TOUCHES THE BEACON |
| 33 | Molag Bal | Daedra | The House of Horrors, the Mace |
| 34 | Mehrunes Dagon | Daedra | Pieces of the Past, the Razor, four arms |
| 35 | Boethiah | Daedra | Boethiah's Calling, sacrifice at the shrine |
| 36 | Clavicus Vile | Daedra | A Daedra's Best Friend, Barbas the dog |
| 37 | Hircine | Daedra | Ill Met by Moonlight, the Great Hunt |
| 38 | Malacath | Daedra | The Cursed Tribe, patron of the Orcs |
| 39 | Mephala | Daedra | The Whispering Door, the Ebony Blade |
| 40 | Namira | Daedra | The Taste of Death, the cannibal dinner |
| 41 | Peryite | Daedra | The Only Cure, inhale the fumes |
| 42 | Vaermina | Daedra | Waking Nightmare, Nightcaller Temple |

# FMKify NBA — Roster Notes

**Game:** `/nba/` · **Data:** `PLAYERS` array in [`nba/fmkify-nba.jsx`](nba/fmkify-nba.jsx)
**Written:** 2026-07-01

## Selection principles

- **52 players** (50 at launch, +2 by owner request), minimum 1 per team —
  all 30 NBA teams are represented.
- **Fun first, but broadly recognizable.** Meme value, personality, and
  quip potential (Westbrook, Draymond, Kyrie) counted alongside star power.
- Star-dense teams get extra slots (Mavs ×4; Warriors, 76ers ×3);
  thinner rosters get their most recognizable name.
- Every player's official NBA CDN headshot
  (`cdn.nba.com/headshots/nba/latest/1040x760/{id}.png`) was verified live at
  build time. Ids in the table are in-game ids (the API contract, 1–50).

## The roster (52)

| ID | Player | Team | # |
|---:|---|---|---:|
| 1 | LeBron James | 76ers | 23 |
| 2 | Luka Dončić | Lakers | 77 |
| 3 | Austin Reaves | Lakers | 15 |
| 4 | Stephen Curry | Warriors | 30 |
| 5 | Jimmy Butler | Warriors | 10 |
| 6 | Draymond Green | Warriors | 23 |
| 7 | Kevin Durant | Rockets | 7 |
| 8 | Alperen Şengün | Rockets | 28 |
| 9 | Nikola Jokić | Nuggets | 15 |
| 10 | Jamal Murray | Nuggets | 27 |
| 11 | Shai Gilgeous-Alexander | Thunder | 2 |
| 12 | Chet Holmgren | Thunder | 7 |
| 13 | Victor Wembanyama | Spurs | 1 |
| 14 | De'Aaron Fox | Spurs | 4 |
| 15 | Anthony Edwards | Timberwolves | 5 |
| 16 | Rudy Gobert | Timberwolves | 27 |
| 17 | Ja Morant | Grizzlies | 12 |
| 18 | Jaren Jackson Jr. | Grizzlies | 13 |
| 19 | Devin Booker | Suns | 1 |
| 20 | Anthony Davis | Mavericks | 3 |
| 21 | Kyrie Irving | Mavericks | 11 |
| 22 | Klay Thompson | Mavericks | 31 |
| 23 | Cooper Flagg | Mavericks | 32 |
| 24 | Kawhi Leonard | Clippers | 2 |
| 25 | James Harden | Clippers | 1 |
| 26 | Damian Lillard | Trail Blazers | 0 |
| 27 | Zion Williamson | Pelicans | 1 |
| 28 | Jordan Poole | Pelicans | 3 |
| 29 | Russell Westbrook | Kings | 4 |
| 30 | Jayson Tatum | Celtics | 0 |
| 31 | Jaylen Brown | Celtics | 7 |
| 32 | Jalen Brunson | Knicks | 11 |
| 33 | Karl-Anthony Towns | Knicks | 32 |
| 34 | Joel Embiid | 76ers | 21 |
| 35 | Josh Giddey | Bulls | 3 |
| 36 | Paul George | 76ers | 8 |
| 37 | Giannis Antetokounmpo | Bucks | 34 |
| 38 | Donovan Mitchell | Cavaliers | 45 |
| 39 | Cade Cunningham | Pistons | 2 |
| 40 | Tyrese Haliburton | Pacers | 0 |
| 41 | Paolo Banchero | Magic | 5 |
| 42 | Bam Adebayo | Heat | 13 |
| 43 | Tyler Herro | Heat | 14 |
| 44 | Trae Young | Hawks | 11 |
| 45 | LaMelo Ball | Hornets | 1 |
| 46 | Scottie Barnes | Raptors | 4 |
| 47 | Lauri Markkanen | Jazz | 23 |
| 48 | CJ McCollum | Wizards | 3 |
| 49 | Michael Porter Jr. | Nets | 1 |
| 50 | Coby White | Bulls | 0 |
| 51 | Kristaps Porziņģis | Hawks | 8 |
| 52 | DeMar DeRozan | Kings | 10 |

**Team coverage:** Mavericks 4 · Lakers, Warriors, 76ers 3 · Rockets, Nuggets,
Thunder, Spurs, Timberwolves, Grizzlies, Clippers, Pelicans, Celtics, Knicks,
Heat, Hawks, Kings 2 · the other 13 teams 1 each.

## The shortlist that didn't quite make it

Players who were seriously considered and cut in the final trim from ~59 to 50.
Almost all fell to the same constraint: their team already had a representative
and something had to give. (Two of the original cuts — Porziņģis and DeRozan —
were reinstated by owner request on 2026-07-01 as ids 51–52.)

| Player | Team | Why they missed the cut |
|---|---|---|
| Jalen Williams | Thunder | Legit star, but OKC already had SGA + Chet, and his casual-fan name recognition lags his game. |
| Amen Thompson | Rockets | Rising star; lost the second Rockets slot to Şengün's superior quip material. |
| Jalen Green | Suns | Fun (the streamer-adjacent aura is real), but Booker covers Phoenix. |
| Bradley Beal | Clippers | The no-trade-clause memes were tempting; Kawhi + Harden already own the LAC slots. |
| Scoot Henderson | Trail Blazers | Dame's return made him redundant for Portland's slot. |
| ~~DeMar DeRozan~~ | Kings | Initially cut for Westbrook — **reinstated as id 52.** |
| Darius Garland | Cavaliers | Mitchell is the bigger name in Cleveland. |
| Desmond Bane | Magic | Paolo covers Orlando. |
| ~~Kristaps Porziņģis~~ | Hawks | Initially cut behind Trae — **reinstated as id 51.** |
| Evan Mobley | Cavaliers | Same squeeze as Garland. |
| Franz Wagner | Magic | Same squeeze as Bane. |
| Draymond Green | Warriors | Kidding — he made it. Nobody cuts Draymond and lives to podcast about it. |

**Deliberate omissions (not space-related):**

- **Chris Paul** — announced retirement after the 2025–26 season; roster is
  active players only.
- **Josh Giddey** — Chicago's biggest name, but not a fit for the lighthearted
  tone of this game; the Bulls slot went to Coby White instead.

**Bubble survivors** (last players in): Klay Thompson (boat-era recognition won
out), Rudy Gobert (comedic value), Austin Reaves (the people's champ), Coby
White (someone has to represent the Bulls, and the hair is a plus).

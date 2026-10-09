"""Build site/data.json for the interactive dashboard from the season CSVs.

Players: pl_20-21.csv (862 players, 2020/21 season).
Clubs (top 10 by wins): WinsGoals.csv, WinsShots.csv, Winstouches.csv,
WinsTackles.csv, passes_wins.csv.

    python build_site_data.py
"""
import json
import os

import pandas as pd

BASE = os.path.dirname(os.path.abspath(__file__))
read = lambda f: pd.read_csv(os.path.join(BASE, f), encoding="utf-8")

COLUMNS = {
    "Name": "name", "Position": "pos", "Appearances": "apps", "Goals": "goals", "Assists": "assists",
    "Shots": "shots", "Shots on target": "sot", "Big Chances Created": "bcc", "Big chances missed": "bcm",
    "Passes": "passes", "Tackles": "tackles", "Interceptions": "interceptions", "Clearances": "clearances",
    "Recoveries": "recoveries", "Duels won": "duels_won", "Clean sheets": "clean_sheets", "Saves": "saves",
    "Goals Conceded": "conceded", "Yellow cards": "yellow", "Red cards": "red", "Fouls": "fouls",
    "Headed goals": "headers", "Penalties scored": "pens", "Crosses": "crosses", "Through balls": "through_balls",
    "Shooting accuracy %": "shot_acc", "Tackle success %": "tackle_success",
    "High Claims": "high_claims", "Catches": "catches", "Punches": "punches",
}

players = read("pl_20-21.csv")[list(COLUMNS)].rename(columns=COLUMNS)
players["name"] = players["name"].str.strip()
for col in ("shot_acc", "tackle_success"):
    players[col] = pd.to_numeric(players[col].astype(str).str.rstrip("%"), errors="coerce")
players = players[players["apps"] > 0].copy()
numeric = [c for c in players.columns if c not in ("name", "pos")]
# Large counts are stored with thousands separators ("2,112").
players[numeric] = players[numeric].apply(lambda c: pd.to_numeric(c.astype(str).str.replace(",", ""), errors="coerce"))
players["ga"] = players["goals"].fillna(0) + players["assists"].fillna(0)

def num(v):
    return None if pd.isna(v) else (int(v) if float(v).is_integer() else round(float(v), 2))

clubs = read("WinsGoals.csv")[["Club", "Goals", "Shots"]]
for f, col in (("WinsShots.csv", "Wins"), ("Winstouches.csv", "Touches"), ("WinsTackles.csv", "Tackles")):
    clubs = clubs.merge(read(f)[["Club", col]], on="Club")
clubs = clubs.merge(read("passes_wins.csv")[["Club", "Passes"]], on="Club")
clubs["Touches"] = clubs["Touches"].astype(str).str.replace(",", "").astype(int)

data = {
    "season": "2020/21",
    "players": [{k: (v if k in ("name", "pos") else num(v)) for k, v in row.items()} for row in players.to_dict("records")],
    "clubs": [{k.lower(): (v if k == "Club" else int(v)) for k, v in row.items()} for row in clubs.to_dict("records")],
}
with open(os.path.join(BASE, "site", "data.json"), "w") as f:
    json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
print(f"Wrote site/data.json: {len(data['players'])} players, {len(data['clubs'])} clubs")

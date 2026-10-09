# EPL 2020/21 Analysis

Exploratory analysis of the 2020/21 English Premier League season: how goals,
shots, touches, passes, assists, fouls and cards relate to wins, at both player
and club level. The results are published as an interactive web dashboard (leaderboards,
finishing efficiency, what drives wins, player percentile profiles), alongside
the original R [flexdashboards](https://pkgs.rstudio.com/flexdashboard/).

**Live site:** <https://biggyatz.github.io/EPL-2020-2021-analysis/>

| Dashboard | Source | Rendered |
| --- | --- | --- |
| **Season in numbers** (interactive web dashboard) | `site/`, data from `build_site_data.py` | `site/index.html` → site root |
| ZERO1 — season overview (goals, shots, touches, passes, assists, fouls, cards) | `project.Rmd` | `project.html` |
| Discipline — yellow/red cards, regression, Pearson correlation | `big.Rmd` | `big.html` |

## Repository layout

| Path | What it is |
| --- | --- |
| `*.Rmd` | R Markdown dashboards (`project.Rmd`, `big.Rmd`, and the earlier draft `dash6.Rmd`) |
| `project.html`, `big.html` | Self-contained rendered dashboards (open directly in a browser) |
| `rprog.R`, `r code for zero1.txt` | Supporting R scripts |
| `*.csv` | Season data: `pl_20-21.csv` plus per-stat extracts (goals, shots, touches, passes, assists, fouls/cards, wins vs. each stat) |
| `site/` | The web dashboard: `index.html`, `style.css`, `app.js` (plain SVG charts, no libraries) and `data.json` |
| `build_site_data.py` | Cleans `pl_20-21.csv` and the club files into `site/data.json` |
| `practise.ipynb`, `temp.py`, `dashboard.py` | Python experiments. `dashboard.py` is an **unfinished** Dash port and does not run as-is |

## Re-rendering the dashboards

```r
install.packages(c("rmarkdown", "flexdashboard", "DT", "shiny"))
rmarkdown::render("project.Rmd")
rmarkdown::render("big.Rmd")
```

## Updating the web dashboard

```bash
python build_site_data.py      # regenerate site/data.json (needs pandas)
python -m http.server -d site  # preview at http://localhost:8000
```

Data notes: `fouls_cards.csv` and `assists_wins.csv` contain implausible
values (e.g. 7 yellow cards for a whole season, more assists than goals), so
the web dashboard does not use them. Club panels cover the top 10 clubs by wins,
the only clubs present in the club files.

## Deployment (GitHub Pages)

`.github/workflows/pages.yml` publishes `site/` to the root of the `gh-pages`
branch and the original R dashboards to `r/`, on every push to `main`. GitHub
Pages serves that branch at <https://biggyatz.github.io/EPL-2020-2021-analysis/>.

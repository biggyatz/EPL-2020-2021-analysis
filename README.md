# EPL 2020/21 Analysis

Exploratory analysis of the 2020/21 English Premier League season: how goals,
shots, touches, passes, assists, fouls and cards relate to wins, at both player
and club level. The results are published as interactive R
[flexdashboards](https://pkgs.rstudio.com/flexdashboard/).

**Live site:** <https://biggyatz.github.io/EPL-2020-2021-analysis/>
(after the one-time GitHub Pages setup below)

| Dashboard | Source | Rendered |
| --- | --- | --- |
| ZERO1 — season overview (goals, shots, touches, passes, assists, fouls, cards) | `project.Rmd` | `project.html` |
| Discipline — yellow/red cards, regression, Pearson correlation | `big.Rmd` | `big.html` |

## Repository layout

| Path | What it is |
| --- | --- |
| `*.Rmd` | R Markdown dashboards (`project.Rmd`, `big.Rmd`, and the earlier draft `dash6.Rmd`) |
| `project.html`, `big.html` | Self-contained rendered dashboards (open directly in a browser) |
| `rprog.R`, `r code for zero1.txt` | Supporting R scripts |
| `*.csv` | Season data: `pl_20-21.csv` plus per-stat extracts (goals, shots, touches, passes, assists, fouls/cards, wins vs. each stat) |
| `index.html` | Landing page for the GitHub Pages site |
| `practise.ipynb`, `temp.py`, `dashboard.py` | Python experiments. `dashboard.py` is an **unfinished** Dash port and does not run as-is |

## Re-rendering the dashboards

```r
install.packages(c("rmarkdown", "flexdashboard", "DT", "shiny"))
rmarkdown::render("project.Rmd")
rmarkdown::render("big.Rmd")
```

## Deployment (GitHub Pages)

`.github/workflows/pages.yml` publishes `index.html`, `project.html` and
`big.html` on every push to `main`. One-time setup:
**Settings → Pages → Build and deployment → Source: GitHub Actions**, then
re-run the workflow from the **Actions** tab.

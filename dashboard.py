import dash
from dash import html, dcc
from dash.dependencies import Input, Output
import pandas as pd


# Initialize the Dash app
app = dash.Dash(__name__)

# Load data
premier_league_goals = pd.read_csv("premierleaguegoals.csv")
club_goals = pd.read_csv("clubgoals.csv")
pl_20_21 = pd.read_csv("pl_20-21.csv")
premier_league_shots = pd.read_csv("premierleagueshots.csv")
club_shots = pd.read_csv("clubshots.csv")
premier_league_touches = pd.read_csv("premierleaguetouches.csv")
club_touches = pd.read_csv("clubtouches.csv")
football_data = pd.read_csv("football.csv")
wins_shots = pd.read_csv("WinsShots.csv")
wins_touches = pd.read_csv("Winstouches.csv")
wins_tackles = pd.read_csv("WinsTackles.csv")

# Define the layout
app.layout = html.Div([
    dcc.Tabs([
        dcc.Tab(label='Goals', children=[
            html.Div([
                html.Div([
                    html.H3('Number of goals by Player'),
                    dcc.DataTable(
                        id='goals-by-player',
                        columns=[{"name": i, "id": i} for i in premier_league_goals.columns],
                        data=premier_league_goals.to_dict('records'),
                    ),
                ], className="six columns"),
                html.Div([
                    html.H3('Number of goals by Club'),
                    dcc.DataTable(
                        id='goals-by-club',
                        columns=[{"name": i, "id": i} for i in club_goals.columns],
                        data=club_goals.to_dict('records'),
                    ),
                ], className="six columns"),
            ], className="row"),
            html.Div([
                html.H3('Goals Conceded'),
                dcc.Graph(id='goals-conceded'),
            ]),
        ]),
        dcc.Tab(label='Shots', children=[
            html.Div([
                html.Div([
                    html.H3('Number of Shots by Player'),
                    dcc.DataTable(
                        id='shots-by-player',
                        columns=[{"name": i, "id": i} for i in premier_league_shots.columns],
                        data=premier_league_shots.to_dict('records'),
                    ),
                ], className="six columns"),
                html.Div([
                    html.H3('Number of Shots by Club'),
                    dcc.DataTable(
                        id='shots-by-club',
                        columns=[{"name": i, "id": i} for i in club_shots.columns],
                        data=club_shots.to_dict('records'),
                    ),
                ], className="six columns"),
            ], className="row"),
            html.Div([
                html.H3('Goals correlation to Shots'),
                dcc.Graph(id='goals-shots-correlation'),
            ]),
        ]),
        dcc.Tab(label='Touches and Player Statistics', children=[
            html.Div([
                html.Div([
                    html.H3('Number of Touches by Player'),
                    dcc.DataTable(
                        id='touches-by-player',
                        columns=[{"name": i, "id": i} for i in premier_league_touches.columns],
                        data=premier_league_touches.to_dict('records'),
                    ),
                ], className="six columns"),
                html.Div([
                    html.H3('Number of Touches by Club'),
                    dcc.DataTable(
                        id='touches-by-club',
                        columns=[{"name": i, "id": i} for i in club_touches.columns],
                        data=club_touches.to_dict('records'),
                    ),
                ], className="six columns"),
            ], className="row"),
            html.Div([
                html.H3('Player Statistics'),
                dcc.Graph(id='player-statistics'),
            ]),
        ]),
        dcc.Tab(label='Correlation with Wins', children=[
            html.Div([
                html.Div([
                    html.H3('Shots'),
                    dcc.Graph(id='shots-correlation'),
                ], className="six columns"),
                html.Div([
                    html.H3('Touches'),
                    dcc.Graph(id='touches-correlation'),
                ], className="six columns"),
            ], className="row"),
            html.Div([
                html.H3('Tackles'),
                dcc.Graph(id='tackles-correlation'),
            ]),
        ]),
    ])
])

# Define callback for Goals Conceded graph
@app.callback(
    Output('goals-conceded', 'figure'),
    Input('goals-by-club', 'data')
)
def update_goals_conceded(data):
    df = pd.DataFrame(data)
    # Your plotting logic here
    # This is where you would generate the plot based on the data provided
    return fig

# Define callback for Goals correlation to Shots graph
@app.callback(
    Output('goals-shots-correlation', 'figure'),
    Input('goals-by-club', 'data'),
    Input('shots-by-club', 'data')
)
def update_goals_shots_correlation(goals_data, shots_data):
    goals_df = pd.DataFrame(goals_data)
    shots_df = pd.DataFrame(shots_data)
    # Your plotting logic here
    # This is where you would generate the plot based on the data provided
    return fig

# Define callback for Player Statistics graph
@app.callback(
    Output('player-statistics', 'figure'),
    Input('touches-by-player', 'data')
)
def update_player_statistics(data):
    df = pd.DataFrame(data)
    # Your plotting logic here
    # This is where you would generate the plot based on the data provided
    return fig

# Define callback for Shots correlation graph
@app.callback(
    Output('shots-correlation', 'figure'),
    Input('shots-by-club', 'data'),
    Input('wins-shots', 'data')
)
def update_shots_correlation(shots_data, wins_data):
    shots_df = pd.DataFrame(shots_data)
    wins_df = pd.DataFrame(wins_data)
    # Your plotting logic here
    # This is where you would generate the plot based on the data provided
    return fig

# Define callback for Touches correlation graph
@app.callback(
    Output('touches-correlation', 'figure'),
    Input('touches-by-club', 'data'),
    Input('wins-touches', 'data')
)
def update_touches_correlation(touches_data, wins_data):
    touches_df = pd.DataFrame(touches_data)
    wins_df = pd.DataFrame(wins_data)
    # Your plotting logic here
    # This is where you would generate the plot based on the data provided
    return fig

# Define callback for Tackles correlation graph
@app.callback(
    Output('tackles-correlation', 'figure'),
    Input('tackles-by-club', 'data'),
    Input('wins-tackles', 'data')
)
def update_tackles_correlation(tackles_data, wins_data):
    tackles_df = pd.DataFrame(tackles_data)
    wins_df = pd.DataFrame(wins_data)
    # Your plotting logic here
    # This is where you would generate the plot based on the data provided
    return fig

# Define callback for Shots correlation graph
@app.callback(
    Output('shots-correlation', 'figure'),
    Input('shots-by-club', 'data'),
    Input('wins-shots', 'data')
)
def update_shots_correlation(shots_data, wins_data):
    shots_df = pd.DataFrame(shots_data)
    wins_df = pd.DataFrame(wins_data)
    # Your plotting logic here
    # This is where you would generate the plot based on the data provided
    return fig

# Define callback for Touches correlation graph
@app.callback(
    Output('touches-correlation', 'figure'),
    Input('touches-by-club', 'data'),
    Input('wins-touches', 'data')
)
def update_touches_correlation(touches_data, wins_data):
    touches_df = pd.DataFrame(touches_data)
    wins_df = pd.DataFrame(wins_data)
    # Your plotting logic here
    # This is where you would generate the plot based on the data provided
    return fig

# Define callback for Tackles correlation graph
@app.callback(
    Output('tackles-correlation', 'figure'),
    Input('tackles-by-club', 'data'),
    Input('wins-tackles', 'data')
)
def update_tackles_correlation(tackles_data, wins_data):
    tackles_df = pd.DataFrame(tackles_data)
    wins_df = pd.DataFrame(wins_data)
    # Your plotting logic here
    # This is where you would generate the plot based on the data provided
    return fig

if __name__ == '__main__':
    app.run_server(debug=True)


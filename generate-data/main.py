import re
from bs4 import BeautifulSoup
from utils import (ball_num_to_overs, extract_number, format_comm_text, format_date, get_json_content, sleep, get_param_from_url, get_html_content, slugify)
from utils.file import (get_file_data, set_file_data)

BASE_URL = 'https://www.cricbuzz.com'

EXTRAS_KEYS_MAP = {
    'b': 'byes',
    'lb': 'legByes',
    'nb': 'nos',
    'w': 'wides',
    'p': 'penalties',
}

INNINGS_ID_MAP = {
    1: 'first', 
    2: 'second', 
    3: 'third', 
    4: 'fourth', 
}

def get_series_venues(series_id):
    try:
        venues_file_path = 'venues/index.json'
        existing_venues = get_file_data(file_path=venues_file_path)
        html_content = get_html_content(url=BASE_URL + f'/cricket-series/{series_id}/series-slug/venues') 
        soup = BeautifulSoup(html_content, 'html.parser')
        venues_list = soup.find('div', class_='cb-list-group')

        for venue in venues_list.contents:
            if not venue.name:
                continue
            
            a_tag = venue.find('a')
            venue_url = BASE_URL + a_tag.attrs['href']
            id = get_param_from_url(venue_url, 5)
            venue_data = get_venue(id=id)

            if venue_data:
                existing_venues[venue_data['id']] = venue_data
                
            sleep(1.5)
        set_file_data(file_path=venues_file_path, data=existing_venues)
    except Exception as e:
        print("ERROR in get_series_venues ==> ", e.args)

def get_venue(id):
    try:
        url = BASE_URL + f'/cricket-venues/{id}/venue-slug'
        print(f'Fetching venue data for {id=} and {url=}')
        data = {
            'id': id,
            'name': '',
            'city': '',
            'country': '',
        }
        html_content = get_html_content(url=url)
        soup = BeautifulSoup(html_content, 'html.parser')
        venue_card = soup.find('div', class_='cb-left cb-col-67 cb-col')
        data['name'] = next(venue_card.find('h1').stripped_strings)
        details_table = venue_card.css.select('table tr')
        for row in details_table:
            tds = row.find_all('td')
            if tds[0].string == 'Location':
                location = tds[1].string.split(',')
                data['city'] = location[0].strip().lower()
                data['country'] = location[1].strip().lower()

        return data
    except Exception as e:
        print("ERROR in get_venue ", e.args)

def get_player(id):
    try: 
        ROLES_MAP = {
            'batsman': 'batter',
            'bowler': 'bowler',
            'wk-batsman': 'wk-batter',
            'batting allrounder': 'bat-allrounder',
            'bowling allrounder': 'bowl-allrounder'
        }

        url = BASE_URL + f'/profiles/{id}/player-slug'
        print(f'Fetching player data for {id=} and {url=}')
        data = {
            'id': id,
            'name': '',
            'shortName': '',
            'team': '',
            'roleInfo': {
                'role': '',
                'batStyle': "",
                'bowlStyle': ""
            },
            'personalInfo': {
                'birthDate': '',
                'birthPlace': '',
            }
        }

        html_content = get_html_content(url=url)
        soup = BeautifulSoup(html_content, 'html.parser')
        name_el = soup.find('h1')
        team_el = soup.find('h3')
        data['name'] = name_el.string.strip()
        data['shortName'] = data['name']
        data['team'] = team_el.string.strip().lower()

        personal_info_container = soup.find('div', class_="cb-col cb-col-33 text-black")
        personal_info_els = personal_info_container.select('.cb-col.text-bold')

        for el in personal_info_els:
            if not el.name:
                return
            
            key = el.string.strip().lower()
            val = el.find_next_sibling('div', 'cb-col').string.strip()

            if key == 'born':
                data['personalInfo']['birthDate'] = format_date(val)
            elif key == 'birth place':
                data['personalInfo']['birthPlace'] = val
            elif key == 'role':
                data['roleInfo']['role'] = ROLES_MAP[val.lower()]
            elif key == 'batting style':
                data['roleInfo']['batStyle'] = slugify(val)
            elif key == 'bowling style':
                data['roleInfo']['bowlStyle'] = slugify(val)

        return data
    except Exception as e:
        print("ERROR in get_player ", e.args)

def get_team_players(team_ids):
    try:
        data_file_path = 'players/index.json'
        existing_data = get_file_data(file_path=data_file_path)
        for team_id in team_ids:
            html_content = get_html_content(url=BASE_URL + f'/cricket-team/team-slug/{team_id}/players') 
            soup = BeautifulSoup(html_content, 'html.parser')
            container = soup.find('div', class_='cb-col-67 cb-col cb-left cb-top-zero')

            for item in container.find_all('a', class_='cb-col cb-col-50'):
                if not item.name:
                    continue
                
                url = BASE_URL + item.attrs['href']
                id = get_param_from_url(url=url, pos=2)
                data = get_player(id=id)

                if data:
                    existing_data[data['id']] = data

                sleep(2)
            sleep(5)
        
        set_file_data(file_path=data_file_path, data=existing_data)
    except Exception as e:
        print("ERROR in main ==> ", e.args)

def get_team_squad_players(team_player_els, attrs, team_type='homeTeam'):
    try: 
        players = []
        for player in team_player_els.find_all('a'):
            if not player.name:
                continue
             
            player_url = player.attrs['href']
            player_data = {
                'playerId': get_param_from_url(url=player_url, pos=2),
            } 

            class_ = 'cb-player-name-left' if team_type == 'homeTeam' else 'cb-player-name-right'
            player_name = next(player.select_one(f'.{class_} div').stripped_strings).strip().lower()
            match_in_el = player.select_one('.cb-plus-match-change-icon.cb-bg-min')
            match_out_el = player.select_one('.cb-plus-match-change-icon.cb-bg-mout')
            overseas_player_el = player.select_one('.cb-plus-flight-icon.cb-overseas-player')
 
            _player_name = player_name
            if '(c' in player_name:
                player_data['isCaptain'] = True
                _player_name = _player_name.replace(' (c)', '').replace(' (c & wk)', '')
            if player_name.endswith('wk)'):
                player_data['isKeeper'] = True
                _player_name = _player_name.replace(' (wk)', '').replace(' (c & wk)', '')
            
            player_data['name'] = _player_name 

            for attrKey in attrs:
                player_data[attrKey] = attrs[attrKey]
            
            if match_in_el:
                player_data['isSubstitute'] = True
            elif match_out_el:
                player_data['isSubstituted'] = True

            if overseas_player_el:
                player_data['isForeignPlayer'] = True

            players.append(player_data)
            
        return players
        
    except Exception as e:
        print("ERROR in get_team_squad_players ==> ", e.args)

def get_match_squads(match_id):
    try:
        match_info = get_match_info(match_id)

        url = f"https://www.cricbuzz.com/cricket-match-squads/{match_id}/match-slug"
        html_content = get_html_content(url=url)
        soup = BeautifulSoup(html_content, 'html.parser')
        header_els = soup.css.select('.cb-col.cb-col-100.cb-pl11-hdr.text-bold.text-center.cb-font-16')
        
        home_team_players = []
        away_team_players = []
        for header_el in header_els:
            if not header_el.name:
                continue

            section_title = header_el.string.strip().lower()

            attrs = {}
            if section_title == 'playing xi':
                attrs['isPlaying'] = True
            elif section_title == 'substitutes':
                attrs['isInSubs'] = True
            elif section_title == 'support staff':
                continue

            home_team_player_els = header_el.find_next_sibling('div', class_=['cb-play11-lft-col'])
            away_team_player_els = header_el.find_next_sibling('div', class_=['cb-play11-rt-col'])

            _home_team_players = get_team_squad_players(home_team_player_els, attrs=attrs, team_type='homeTeam')
            _away_team_players = get_team_squad_players(away_team_player_els, attrs=attrs, team_type='awayTeam')

            home_team_players.extend(_home_team_players)
            away_team_players.extend(_away_team_players)

        squads = {
            'homeTeam': {
                'teamId': match_info['homeTeam'],
                'players': home_team_players
            },
            'awayTeam': {
                'teamId': match_info['awayTeam'],
                'players': away_team_players
            }
        }

        set_file_data(file_path=f"series/{match_info['series']}/matches/{match_id}/squads.json", data=squads)

        return squads
        
    except Exception as e:
        print("ERROR in get_match_squads ==> ", e.args)

def get_match_info(match_id):
    try:
        TOSS_DECISION_MAP = {
            'batting': 'bat',
            'bowling': 'bowl',
        }

        url = f"https://www.cricbuzz.com/api/cricket-match/{match_id}/full-commentary/0"
        json_content = get_json_content(url=url)

        if json_content:
            match_details = json_content['matchDetails']['matchHeader']
            match_score_details = json_content['matchDetails']['miniscore']['matchScoreDetails']

            match_info = {
                'id': match_id,
            }
        
            match_info['description'] = match_details['matchDescription']
            match_info['matchFormat'] = match_details['matchFormat'].lower()
            match_info['matchType'] = match_details['matchType']
            match_info['matchNumber'] = extract_number(match_details['matchDescription'])
            match_info['homeTeam'] = match_details['team1']['id']
            match_info['awayTeam'] = match_details['team2']['id']
            match_info['series'] = match_details['seriesId']
            match_info['venue'] = match_details['venue']['id']
            match_info['startTime'] = match_details['matchStartTimestamp']
            match_info['completeTime'] = match_details['matchCompleteTimestamp']
            match_info['tossResults'] = {
                'tossWinnerId': match_details['tossResults']['tossWinnerId'],
                'decision': TOSS_DECISION_MAP[match_details['tossResults']['decision'].lower()],
            }
            match_info['results'] = {
                'winByInnings':  match_details['result']['winByInnings'],
                'winByRuns':  match_details['result']['winByRuns'],
                'resultType':  slugify(match_details['result']['resultType']),
                'winningMargin':  match_details['result']['winningMargin'],
                'winningTeamId': match_details['result']['winningteamId']
            }
 
            match_info['inningsScoreList'] = sorted(match_score_details['inningsScoreList'], key=lambda a: a['inningsId'])
            match_info['state'] = match_details['state']

            set_file_data(file_path=f"series/{match_info['series']}/matches/{match_id}/info.json", data=match_info)

        return match_info
    except Exception as e:
        print("ERROR in get_match_info ==> ", e.args)

def get_match_scorecard(match_id):
    try:
        url = f"https://www.cricbuzz.com/live-cricket-scorecard/{match_id}/match-slug"
        html_content = get_html_content(url=url)
        soup = BeautifulSoup(html_content, 'html.parser')

        match_info = get_match_info(match_id)
        innings_score_list = match_info['inningsScoreList']
        innings_data = {}

        for current_innings in innings_score_list:
            inningsId = current_innings['inningsId']
            batTeamId = current_innings['batTeamId']
            bowlTeamId = match_info['awayTeam'] if batTeamId == match_info['homeTeam'] else match_info['homeTeam']
            
            innings_el = soup.find('div', id=f"innings_{inningsId}")
            innings_items = innings_el.find_all('div', class_='cb-col', recursive=False)

            batters_el = innings_items[0]
            batters_el = batters_el.select('.cb-col.cb-col-100.cb-scrd-itms')

            fall_of_wickets_el = innings_items[2]
            fall_of_wickets_map = {}
            for item in fall_of_wickets_el.find_all('span'): 
                id = get_param_from_url(item.a.attrs['href'], 2)
                text = item.text.strip().strip(',')
                text_data = text.split(' ', 1)
                score, wickets = text_data[0].split('-')
                overs = text_data[1].split(',')[-1].strip().strip(')')

                fall_of_wickets_map[id] = {
                    'overs': float(overs),
                    'teamScore': int(score),
                    'teamWickets': int(wickets),
                }
 
            batters_el.pop() # did not bat
            batters_el.pop() # total
            extras_el = batters_el.pop()

            extras_data =   { 
                'nos': 0,
                'wides': 0,
                'legByes': 0,
                'byes': 0,
                'penalties': 0,
            }

            extras_text = extras_el.find_all('div', class_='cb-col')[-1].string.strip().strip('(').strip(')')

            for extra in extras_text.split(','):
                extra_data = extra.strip().split(' ')
                ball = extra_data[0]
                runs = extra_data[1] 

                extras_data[EXTRAS_KEYS_MAP[ball]] = int(runs)
            
            squads = get_file_data(file_path=f'squads/{match_id}.json')

            lookup_data = squads['homeTeam']['players']
            if bowlTeamId == squads['awayTeam']['teamId']:
                lookup_data = squads['awayTeam']['players'] 
            
            batters_data = []
            
            for batter_el in batters_el:
                player_el_items = batter_el.select('.cb-col')
                batter_name_el = player_el_items[0]
                batter_name_el = batter_name_el.find('a')
                batter_id = get_param_from_url(url=batter_name_el.attrs['href'], pos=2)
                
                runs_el = player_el_items[2]
                runs = runs_el.string.strip()

                balls_el = player_el_items[3]
                balls = balls_el.string.strip()

                fours_el = player_el_items[4]
                fours = fours_el.string.strip()

                sixes_el = player_el_items[5] 
                sixes = sixes_el.string.strip()


                data = {
                    'id': int(batter_id),
                    'batRuns': int(runs),
                    'ballsPlayed': int(balls),
                    'batFours': int(fours),
                    'batSixes': int(sixes)
                }


                fall_of_wickets_data = fall_of_wickets_map.get(batter_id)
                if fall_of_wickets_data:
                    fall_of_wicket_el = player_el_items[1]
                    fall_of_wicket = next(fall_of_wicket_el.stripped_strings) 
                    dismissal_data = get_dismissal_data(fall_of_wicket)

                    fall_of_wickets_data['dismissalType'] = dismissal_data['dismissalType']
                    
                    bowler_name = dismissal_data.get('bowler')
                    if bowler_name:
                        fall_of_wickets_data['bowlerId'] = get_player_id_by_name(bowler_name, lookup_data)

                    helpers = dismissal_data.get('helpers', []) 
                    fall_of_wickets_data['helpers'] = list(map(lambda helper: get_player_id_by_name(helper, lookup_data), helpers))
    
                    data['fallOfWicket'] = fall_of_wickets_data

                batters_data.append(data)

            bowlers_el = innings_items[3]
            bowlers_el = bowlers_el.select('.cb-col.cb-col-100.cb-scrd-itms')

            bowlers_data = []
            for bowler_el in bowlers_el:
                player_el_items = bowler_el.select('.cb-col')
                player_name_el = player_el_items[0]
                player_name_el = player_name_el.find('a')
                bowler_id = get_param_from_url(url=player_name_el.attrs['href'], pos=2)

                overs_el = player_el_items[1]
                overs = overs_el.string.strip()

                maidens_el = player_el_items[2]
                maidens = maidens_el.string.strip()

                runs_el = player_el_items[3]
                runs = runs_el.string.strip()

                wickets_el = player_el_items[4]
                wickets = wickets_el.string.strip()

                no_balls_el = player_el_items[5]
                no_balls = no_balls_el.string.strip()

                wides_el = player_el_items[6]
                wides = wides_el.string.strip()

                data = {
                    'id': int(bowler_id),
                    'bowlOvers': float(overs),
                    'bowlMaidens': int(maidens),
                    'bowlRuns': int(runs),
                    'bowlWickets': int(wickets),
                    'bowlNoBalls': int(no_balls),
                    'bowlWides': int(wides),
                }

                bowlers_data.append(data)

            innings_data[INNINGS_ID_MAP[inningsId]] = {
                'teamId': batTeamId,
                'oversBowled': current_innings['overs'],
                'overs': 0,
                'score': current_innings['score'],
                'wickets': current_innings['wickets'],
                'isDeclared': current_innings['isDeclared'],
                'isFollowOn': current_innings['isFollowOn'],
                'batters': batters_data,
                'bowlers': bowlers_data,
                'extras': extras_data
            }
        
        scorecard_data = {
            'matchId': match_info['id'],
            'innings': innings_data
        }

        set_file_data(file_path=f"series/{match_info['series']}/matches/{match_id}/scorecard.json", data=scorecard_data)

    except Exception as e:
        print("ERROR in get_match_scorecard ==> ", e.args)

def get_player_id_by_name(name, lookup_data):
    try:
        _name = name.lower()
        for item in lookup_data:
            if _name in item['name']:
                return int(item['playerId'])
    except Exception as e:
        print("ERROR in get_player_id_by_name", e.args)

    return None

def get_dismissal_data(dismissal_string):
    # Patterns for different types of dismissals
    patterns = {
        'caught_and_bowled': r'c & b (?P<bowler>.+)',
        'caught': r'c (?P<catcher>.+) b (?P<bowler>.+)',
        'bowled': r'b (?P<bowler>.+)',
        'run_out_dual': r'run out \((?P<player1>.+)/(?P<player2>.+)\)',
        'run_out_single': r'run out \((?P<player>.+?)\)',
        'stumped': r'st (?P<keeper>.+) b (?P<bowler>.+)',
        'lbw': r'lbw b (?P<bowler>.+)',
        'hit_wicket': r'hit wicket b (?P<bowler>.+)',
        'timed_out': r'timed out',
        'obstructed': r'obs',
        'retired_out': r'retired out',
        'retired_hurt': r'retired hurt',
        'handled': r'handled'
    }
    
    for key, pattern in patterns.items():
        match = re.match(pattern, dismissal_string)
        if match:
            if key == 'caught_and_bowled':
                bowler = match.group('bowler')
                return {
                    'dismissalType': 'caught',
                    'bowler': bowler
                } 
            elif key == 'caught':
                catcher = match.group('catcher')
                bowler = match.group('bowler')
                return {
                    'dismissalType': 'caught',
                    'bowler': bowler,
                    'helpers': [catcher],
                } 
            elif key == 'bowled':
                bowler = match.group('bowler')
                return {
                    'dismissalType': 'bowled',
                    'bowler': bowler,
                } 
            elif key == 'run_out_single':
                player = match.group('player').replace("(sub)", "").strip()
                return {
                    'dismissalType': 'run-out',
                    'helpers': [player],
                } 
            elif key == 'run_out_dual':
                player1 = match.group('player1').replace("(sub)", "").strip()
                player2 = match.group('player2').replace("(sub)", "").strip()
                return {
                    'dismissalType': 'run-out',
                    'helpers': [player1, player2],
                } 
            elif key == 'stumped':
                keeper = match.group('keeper')
                bowler = match.group('bowler')
                return {
                    'dismissalType': 'stumped',
                    'bowler':bowler,
                    'helpers': [keeper],
                }         
            elif key == 'lbw':
                bowler = match.group('bowler')
                return {
                    'dismissalType': 'lbw',
                    'bowler':bowler,
                } 
            elif key == 'hit_wicket':
                bowler = match.group('bowler')
                return {
                    'dismissalType': 'hit-wicket',
                    'bowler':bowler,
                } 
            elif key == 'timed_out':
                return {
                    'dismissalType': 'timed-out',
                } 
            elif key == 'obstructed':
                return { 
                    'dismissalType': 'obstruct-field',
                } 
            elif key == 'retired_out':
                return { 
                    'dismissalType': 'retired',
                } 
            elif key == 'retired_hurt':
                return { 
                    'dismissalType': 'retired',
                } 
            elif key == 'handled':
                return { 
                    'dismissalType': 'handled-ball',
                } 
    
    return None

def get_commentary(match_id, innings_id):
    try:
        json_content = get_json_content(url=f"https://www.cricbuzz.com/api/cricket-match/{match_id}/full-commentary/{innings_id}")

        if not json_content:
            raise Exception("Commentary not found!")

        series_id = json_content['matchDetails']['matchHeader']['seriesId']
        commentary_list = json_content['commentary']
        
        if len(commentary_list) == 0:
            raise Exception("Commentary not found!")

        commentary_list = commentary_list[0]['commentaryList']

        commentary_data = []
        for commentary in commentary_list:
            batsman_striker = {
                'id': commentary['batsmanStriker']['batId'],
                'batRuns': commentary['batsmanStriker']['batRuns'],
                'ballsPlayed': commentary['batsmanStriker']['batBalls'],
                'dotBalls': commentary['batsmanStriker'].get('batDots', 0),
                'batFours': commentary['batsmanStriker']['batFours'],
                'batSixes': commentary['batsmanStriker']['batSixes'],
            } 
            bowler_striker = {
                'id': commentary['bowlerStriker']['bowlId'],
                'bowlOvers': commentary['bowlerStriker']['bowlOvs'],
                'bowlMaidens': commentary['bowlerStriker']['bowlMaidens'],
                'bowlRuns': commentary['bowlerStriker']['bowlRuns'],
                'bowlWickets': commentary['bowlerStriker']['bowlWkts'],
                'bowlWides': commentary['bowlerStriker']['bowlWides'],
                'bowlNoBalls': commentary['bowlerStriker']['bowlNoballs'],
            }
            events = commentary['event'].replace('NONE', '').strip()
            if events:
                events = events.split(",")
            else:
                events = []

            commentary_item = {}
            commentary_item['timestamp'] = commentary['timestamp']
            commentary_item['commText'] = format_comm_text(commentary['commText'], formats=commentary['commentaryFormats'])
            commentary_item['overs'] = ball_num_to_overs(commentary['ballNbr'])
            commentary_item['events'] = events
            commentary_item['batsmanStriker'] = batsman_striker
            commentary_item['bowlerStriker'] = bowler_striker

            commentary_data.append(commentary_item)

        set_file_data(file_path=f"series/{series_id}/matches/{match_id}/commentary/{innings_id}.json", data=commentary_data)
        
        return commentary_data
    except Exception as e:
        print("ERROR in get_commentary ==> ", e.args)


def main():
    try:
        match_id = 89654
        get_match_squads(match_id)
    except Exception as e:
        print("ERROR in main ==> ", e.args)

if __name__ == "__main__":
    main()
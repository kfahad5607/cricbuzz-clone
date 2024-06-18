from bs4 import BeautifulSoup
from utils import (extract_number, format_date, get_json_content, sleep, get_param_from_url, get_html_content)
from utils.file import (get_file_data, set_file_data)

BASE_URL = 'https://www.cricbuzz.com'

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
                data['roleInfo']['role'] = val.lower()
            elif key == 'batting style':
                data['roleInfo']['batStyle'] = val.lower()
            elif key == 'bowling style':
                data['roleInfo']['bowlStyle'] = val.lower()

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

                sleep(1)
        
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

            if '(c' in player_name:
                player_data['isCaptain'] = True
            if player_name.endswith('wk)'):
                player_data['isKeeper'] = True

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

        set_file_data(file_path=f'squads/{match_id}.json', data=squads)
        
    except Exception as e:
        print("ERROR in get_match_squads ==> ", e.args)

def get_match_info(match_id):
    try:
        url = f"https://www.cricbuzz.com/api/cricket-match/{match_id}/full-commentary/0"
        json_content = get_json_content(url=url)

        if json_content:
            match_details = json_content['matchDetails']['matchHeader']

            match_info = {
                'id': match_id,
            }
        
            match_info['description'] = match_details['matchDescription']
            match_info['matchFormat'] = match_details['matchFormat']
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
                'decision': match_details['tossResults']['decision'],
            }
            match_info['results'] = {
                'winByInnings':  match_details['result']['winByInnings'],
                'winByRuns':  match_details['result']['winByRuns'],
                'resultType':  match_details['result']['resultType'],
                'winningMargin':  match_details['result']['winningMargin'],
                'winningTeamId': match_details['result']['winningteamId']
            }
            match_info['state'] = match_details['state']

        return match_info
    except Exception as e:
        print("ERROR in get_match_info ==> ", e.args)

def main():
    try:
        match_id = 89654
        get_match_squads(match_id=match_id)

    except Exception as e:
        print("ERROR in main ==> ", e.args)

if __name__ == "__main__":
    main()
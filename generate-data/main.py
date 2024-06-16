from datetime import datetime
import json
import time
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup

BASE_URL = 'https://www.cricbuzz.com'
BASE_DATA_PATH = 'data/'


def format_date(str_date):
    input_format = "%b %d, %Y"
    output_format = "%d-%m-%Y"

    date_str = str_date.strip().split(" (")[0]
    date_obj = datetime.strptime(date_str, input_format)

    return date_obj.strftime(output_format)

def sleep(duration):
    print(f"Sleeping for {duration} seconds...")
    time.sleep(duration)

def get_param_from_url(url, pos):
    parsed_url = urlparse(url) 
    path_segments = parsed_url.path.split('/') 

    return path_segments[pos]

def get_html_content(url):
    try:
        response = requests.get(url=url)

        if response.status_code == 200:
            return response.content
        
    except Exception as e:
        print("ERROR in get_html_content ==> ", e.args)

    return None

def set_file_data(file_path, data):
    try:
        with open(BASE_DATA_PATH + file_path, 'w') as fd:
            json.dump(data, fd, indent=2)

    except Exception as e:
        print("ERROR in set_file_data ==> ", e.args)

def get_file_data(file_path, default_data = {}):
    try:
        data = default_data
        with open(BASE_DATA_PATH + file_path, 'r') as fd:
            data = json.load(fd)

    except Exception as e:
        print("ERROR in get_file_data ==> ", e.args)

    return data

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
            print("id ", id, venue_url)
            venue_data = get_venue(id=id)

            if venue_data:
                existing_venues[venue_data['id']] = venue_data
                
            sleep(1)
        set_file_data(file_path=venues_file_path, data=existing_venues)
    except Exception as e:
        print("ERROR in get_series_venues ==> ", e.args)

def get_venue(id):
    try:
        url = BASE_URL + f'/cricket-venues/{id}/venue-slug'
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


def main():
    try:
        pass
    except Exception as e:
        print("ERROR in main ==> ", e.args)

if __name__ == "__main__":
    main()
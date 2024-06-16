import json
import time
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup

BASE_URL = 'https://www.cricbuzz.com'
BASE_DATA_PATH = 'data/'

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
        # print(" ")
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

def main():
    try:
        pass
    except Exception as e:
        print("ERROR in main ==> ", e.args)

if __name__ == "__main__":
    main()
import time
from urllib.parse import urlparse
import requests
from datetime import datetime

BASE_URL = 'https://www.cricbuzz.com'
BASE_DATA_PATH = 'data/'

def format_date(str_date):
    input_format = "%b %d, %Y"
    output_format = "%d-%m-%Y"

    date_str = str_date.strip().split(" (")[0]
    date_obj = datetime.strptime(date_str, input_format)

    return date_obj.strftime(output_format)

def get_param_from_url(url, pos):
    parsed_url = urlparse(url) 
    path_segments = parsed_url.path.split('/') 

    return path_segments[pos]


def sleep(duration):
    print(f"Sleeping for {duration} seconds...")
    time.sleep(duration)


def get_html_content(url):
    try:
        response = requests.get(url=url)

        if response.status_code == 200:
            return response.content
        
    except Exception as e:
        print("ERROR in get_html_content ==> ", e.args)

    return None

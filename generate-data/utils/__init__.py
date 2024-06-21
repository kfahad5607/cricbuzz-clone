import re
import unicodedata
import time
from urllib.parse import urlparse
import requests
from datetime import datetime

BASE_URL = 'https://www.cricbuzz.com'
BASE_DATA_PATH = 'data/'
BALLS_IN_OVER = 6

def format_date(str_date):
    input_format = "%b %d, %Y"
    output_format = "%Y-%m-%d"

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

def extract_number(s):
    match = re.search(r'\d+', s)
    if match:
        return int(match.group())
    return None

def get_html_content(url):
    try:
        response = requests.get(url=url)

        if response.status_code == 200:
            return response.content
        
    except Exception as e:
        print("ERROR in get_html_content ==> ", e.args)

    return None

def get_json_content(url):
    try:
        response = requests.get(url=url)

        if response.status_code == 200:
            return response.json()
        
    except Exception as e:
        print("ERROR in get_html_content ==> ", e.args)

    return None

def ball_num_to_overs(ball_num):
    rem = ball_num % BALLS_IN_OVER
    
    if rem == 0:
        return int(ball_num / BALLS_IN_OVER)
    
    overs = (ball_num - rem) / BALLS_IN_OVER 
    balls = (rem / 10)
    
    return overs + balls

def format_comm_text(comm_text, formats):
    for format_type in formats:
        _format = formats[format_type]
        if format_type == 'bold':
            format_ids = _format['formatId']
            format_values = _format['formatValue']
            for i in range(len(format_ids)):
                comm_text = comm_text.replace(format_ids[i], f"<b>{format_values[i]}</b>")

    return f"<p>{comm_text}</p>"

def slugify(text):
    # Normalize unicode characters
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    
    text = text.lower()
    
    # Replace spaces and underscores with hyphens
    text = re.sub(r'[\s_]+', '-', text)
    
    # Remove all characters that are not alphanumeric or hyphens
    text = re.sub(r'[^a-z0-9-]', '', text)
    
    # Remove leading and trailing hyphens
    text = text.strip('-')
    
    return text
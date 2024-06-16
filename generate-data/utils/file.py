import json

BASE_DATA_PATH = 'data/'

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

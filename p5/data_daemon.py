import requests
import time
import json

def data_daemon():

    r = requests.get('http://ec2-54-183-187-18.us-west-1.compute.amazonaws.com:5000/response')
    
    with open('data.json', 'w') as f:
        f.write(json.dumps(r.json()))

if __name__ == '__main__':
    while(1):
        data_daemon()
        time.sleep(10) 

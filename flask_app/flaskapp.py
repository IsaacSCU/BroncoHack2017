from flask import Flask, request
from elasticsearch import Elasticsearch
from watson_developer_cloud import ToneAnalyzerV3

import os
import json

app = Flask(__name__)

HOST = 'localhost'
PORT = 9200
OPTIONS = {}

app.cache_dict = {
    'alexa': {
        'timestamp': '3',
        'username': 'Julian Callin',
        'alexa_text': 'Today I had a good day, but it was slightly difficult and boring. I was mildly hungover'
    },
    'eeg': {
        'mellow': .4,
        'focused': .9,
    },
    'watson_response': {
        'mood': 3,
        'tone': 7,
    }
}


@app.route("/eeg", methods=['GET', 'POST'])
def eeg():
    """
    IMPORTANT: SEND EEG DATA BEFORE SENDING ALEXA DATA
    """
    # Extract the EEG data
    eeg = request.get_json().get('Body', None)

    # Save EEG data to common dictionary
    if eeg:
        app.cache_dict['eeg'] = eeg

    return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}


@app.route("/alexa", methods=['GET', 'POST'])
def alexa():
    """
    IMPORTANT: SEND ALEXA AFTER SENDING EEG DATA
    :return:
    """
    # Replace  authkeys.json with your authkeys json file name
    # An example json file for storing authkeys is shown in the repository
    # This json object is loaded into our application driver and sent as
    # a parameter to functions so they do not have to reload it

    # Extract Alexa text and connect to Watson
    alexa_text = request.get_json().get('Body')
    if alexa_text:
        app.cache_dict['alexa'] = alexa_text

    watson_response = get_watson_response(alexa_text['alexa_text'])
    app.cache_dict['watson_response'] = watson_response

    # Save to the DB
    save_to_elasticsearch()

    # Clear the cache dict for the next 2 inputs
    app.cache_dict = {}

    return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}


def get_watson_response(alexa_text):
    creds = ''
    with open('api_credentials.txt') as f:
        creds = json.loads(f.read())

    tone_analyzer = ToneAnalyzerV3(
        username=creds['username'],
        password=creds['password'],
        version='2016-02-11')

    watson_response = tone_analyzer.tone(text=alexa_text)

    #print(watson_response)
    return watson_response


@app.route("/response", methods=['GET'])
def response():
    connection = Elasticsearch(hosts='{}:{}'.format(HOST, PORT))
    res = connection.search(index="bronco-hack-2017",
                            doc_type="therapy_session",
                            body={"query": {"match_all": {}}})
    return json.dumps(res), 200, {'ContentType': 'application/json'}


def create_therapy_session_object():
    """
    Create a therapy session object from the Alexa response and EEG data for upload to elasticsearch
    :return:
    """
    cache_dict = app.cache_dict
    alexa_response = cache_dict['alexa']
    eeg = cache_dict['eeg']

    timestamp = alexa_response['timestamp']
    session_id = hash(timestamp)
    username = alexa_response['username']
    alexa_text = alexa_response['alexa_text']

    watson_response = cache_dict['watson_response']

    therapy_session = {
        'session_id': session_id,
        'username': username,
        'timestamp': timestamp,
        'alexa_text': alexa_text,
        'watson_response': watson_response,
        'eeg_averages': {
            'mellow': eeg['mellow'],
            'focused': eeg['focused']
        }
    }

    # print(therapy_session)
    return therapy_session


def save_to_elasticsearch():
    connection = Elasticsearch(hosts='{}:{}'.format(HOST, PORT))

    therapy_session_object = create_therapy_session_object()

    # Write database
    connection.index(index='bronco-hack-2017',
                     doc_type='therapy_session',
                     body=therapy_session_object,
                     id=therapy_session_object['session_id']
                     )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)

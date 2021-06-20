import os
from flask import Flask, request, jsonify
from rq import Queue
from worker import conn
from utils import scrapeUser
import json
from time import sleep

app = Flask(__name__)
q = Queue(connection=conn)

def get_status(job):
    return 'Your API request failed for some reason :(' if job.is_failed else 'your API is pending, please wait around 30 seconds for final result XD' if job.result == None else job.result

@app.route("/")
def handle_job():
    query_name = request.args.get('name')
    query_id = request.args.get('job')
    if query_name:
        job = q.enqueue(scrapeUser, query_name)
        while job.result == None:
            sleep(5)
        else:
            output = get_status(job)
    elif query_id:
        found_job = q.fetch_job(query_id)
        if found_job:
            output = get_status(found_job)
        else:
            output = 'No job exists with the id number ' + query_id
    else:
        return "Please include a username :)"
    return output

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
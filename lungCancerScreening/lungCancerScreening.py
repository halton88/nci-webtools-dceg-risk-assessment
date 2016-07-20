from flask import Flask, request
from rpy2.robjects import r

# Initialize the Flask application
app = Flask(__name__)
r.source('LCWrapper.R')

# This route will return a list in JSON format
#
# Inputs:   A json object containing calculation parameters
#
# Outputs:  A json array in the following format:
#             1) Risk of dying from lung cancer within 5 years in the absence of screening
#             2) Risk reduction due to lung cancer screening 
#             3) The chance of lung cancer diagnosis within 5 years in the absence of screening
#             4) The chance of lung cancer diagnosis within 5 years with screening is result4
#             5) The chance of having a false positive result after 3 screens
#             6) The chance of false-positive CT lung screen
#             7) The path to the generated results file
@app.route('/calculate/', methods=['POST'])
def calculate():
    return r.getResults(request.stream.read())[0]

from flask import make_response
import os
import re
import time
import json
import StringIO
import pdfkit
import tempfile
import random
import base64

# This route will return the contents of the request as a pdf file
@app.route('/exportPDF/', methods=['POST', 'GET'])
def exportPDF():

    # temp_file = tempfile.NamedTemporaryFile(mode="w+b+r",delete=True)
    # options = {'page-size': 'Letter', 'page-width': '900pt', 'margin-top': '0.50in', 'no-outline': None, 'margin-right': '0.75in', 'page-height': '595pt', 'margin-left': '0.75in', 'encoding': 'UTF-8', 'margin-bottom': '0.75in'}
    # pdfkit.from_string(request.data, temp_file.name, options=options)
    # response = make_response(base64.b64encode(temp_file.read()))
    # temp_file.close()
    # response.headers["Content-type"] = "application/pdf"
    # response.headers['Content-Transfer-Encoding'] = 'binary'
    # return response

    if request.method=='GET':
        f = open(request.args['dir'], 'rb')
        data = f.read()
        f.close()
        os.remove(f.name)
        response = make_response(data)
        response.headers["Content-Disposition"] = "attachment; filename=results.pdf"
        response.headers["Content-type"] = "application/pdf"
    else:
        temp_file = tempfile.NamedTemporaryFile(mode="w+b",delete=False)
        response = make_response(temp_file.name)
        options = {'page-size': 'Letter', 'page-width': '900pt', 'margin-top': '0.75in', 'no-outline': None, 'margin-right': '0.75in', 'page-height': '595pt', 'margin-left': '0.75in', 'encoding': 'UTF-8', 'margin-bottom': '0.75in'}
        pdfkit.from_string(request.data, temp_file.name, options=options)
        temp_file.close()
    return response

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response

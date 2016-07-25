# We need to import the jsonify object, it will let us
# output json, and it will take care of the right string
# data conversion, the headers for the response, etc
import os
import re
import time
import json
import StringIO
from flask import Flask, send_file, render_template, request, jsonify, make_response
from rpy2.robjects.packages import SignatureTranslatedAnonymousPackage
from rpy2.robjects.vectors import IntVector, FloatVector
from socket import gethostname
import pdfkit,tempfile, os
import random
import os, base64

with open ('LCWrapper.R') as fh:
        rcode = os.linesep.join(fh.readlines())
        wrapper = SignatureTranslatedAnonymousPackage(rcode,"wrapper")

# Initialize the Flask application
app = Flask(__name__)

@app.route('/')
def index():
    # Render template
    return render_template('index.html')

# This route will return a list in JSON format
@app.route('/lungCancerRest/', methods=['POST'])
def lungCancerRest():
        # Get the parsed contents of the form data

        data = request.json            
        age = data["age"];
        bmi = data["bmi"];
        cpd = data["cpd"];
        emp = data["emp"];
        famlungtrend = data["fam.lung.trend"];
        gender = data["gender"];
        qtyears = data["qtyears"];
        smkyears = data["smkyears"];
        race = data["race"];
        if race==4: # set other to white #
            race = 0 
        edu6 = data["edu6"];
        pkyrcat = data["pkyr.cat"];

        # Create results file and link to results file
        apache_tmp_dir = "tmp"

        # Ensure apache tmp directory exists
        if not os.path.exists(apache_tmp_dir):
                os.makedirs(apache_tmp_dir)

        resultFile = 'results_' + time.strftime("%Y%m%d-%H%M%S") + '.txt'
        resultContent = 'Form Summary\n'
        resultNames = ['Risk of dying from lung cancer within 5 years in the absence of screening',
                       'Risk reduction due to lung cancer screening',
                       'The chance of lung cancer diagnosis within 5 years in the absence of screening',
                       'The chance of lung cancer diagnosis within 5 years with screening',
                       'The chance of having a false positive result after 3 screens',
                       'Chance of false-positive CT lung screen'
                      ]

        fromR = (wrapper.getJSONData(age,bmi,cpd,emp,famlungtrend,gender,qtyears,smkyears,race,edu6,pkyrcat))
        fromRstr = ''.join(fromR)
        string = json.loads(fromRstr)

        for i in data:
                resultContent = resultContent + i + ': %s\n' % data[i]

        resultContent = resultContent + '\n\nResults\n'

        for index, value in enumerate(string):
                resultContent = resultContent + '%s: '% resultNames[index] + str(value)  + '\n'

        f = open(apache_tmp_dir + '/' + resultFile, 'w')
        f.write(resultContent)
        f.close()

        linkToFile = request.url_root + 'lungCancerScreening/tmp/' + resultFile
        string.append(linkToFile)

        return json.dumps(string)

# This route will return a list in JSON format
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

import argparse
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("-p", dest="port_number", default="9982", help="Sets the Port")
    # Default port is production value; prod,stage,dev = 9982, sandbox=9983
    args = parser.parse_args()
    port_num = int(args.port_number);

    hostname = gethostname()
    app.run(host='0.0.0.0', port=port_num, debug = True)

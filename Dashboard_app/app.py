from flask import Flask, render_template, jsonify, request
import requests
import pandas as pd
import numpy as np
import io

app = Flask(__name__)

@app.route("/")
def home():
    r = requests.get('https://opendata.ecdc.europa.eu/covid19/casedistribution/csv')
    r.encoding = 'utf-8'
    with io.open('data.csv', 'w', encoding='utf-8') as f:
        f.write(r.text)

    return render_template("dashboard.html")

@app.route("/api/covid")
def covid():
    country = request.args.get('country', '')
    data = pd.read_csv('data.csv', sep = ',')
    data = data[data["countriesAndTerritories"]==country]
    
    mvaverage2 = data.reindex(index=data.index[::-1])
    mvaverage2 = np.flip(mvaverage2.iloc[:,4].rolling(window=7).mean())
    data = pd.concat([data,pd.DataFrame(mvaverage2.values, index = data.index, columns = ["mvavrg"])], axis=1)
    
    return data.to_json(orient='split')

@app.route("/api/countries")
def countries():
    data = pd.read_csv('data.csv', sep = ',')
    countryList = data["countriesAndTerritories"].unique()
    allCountries = {}
    i=0
    for country in countryList:
        allCountries[i]=country
        i = i+1
    return jsonify(allCountries)
    

if __name__ == "__main__":
    app.run(debug=True)
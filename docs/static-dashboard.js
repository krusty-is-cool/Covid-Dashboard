//STATIC VERSION OF THE DASHBOARD. NO HTTP REQUESTS TO THE SERVER

//FORM AND TEXT
const proxyurl = "https://cors-anywhere.herokuapp.com/";
const url = "https://opendata.ecdc.europa.eu/covid19/casedistribution/json"; // site that doesn’t send Access-Control-*
let responseData;

$.ajax({
    async: false,
    url: proxyurl + url,
    dataType: "json",
    success: getCountries
});

function getCountries(result){
    responseData = result;
    let countries = [];
    for (let i in responseData["records"]){
        countries.push(responseData["records"][i]["countriesAndTerritories"]);
    };
    const distinctCountries = [...new Set(countries)];

    let elt = document.getElementById("countryList");
    for (let i in distinctCountries){
        let newElt = document.createElement('option');
        newElt.setAttribute("value", distinctCountries[i]);
        newElt.innerHTML = distinctCountries[i];
        elt.appendChild(newElt);
    };
};

//GRAPHS

const casesButton = $('#cases-button');
const deathsButton = $('#deaths-button');
let choiceButton = casesButton.attr('id');

const country = document.getElementById('country');
let selectedCountry = country.value;

const reportGraph = document.getElementById('report');
const cumulativegraph = document.getElementById('cumulative');

plotGraph();

country.addEventListener('input', function(){
    selectedCountry = country.value;
    if (selectedCountry == "United_Kingdom"){
        let alert = document.createElement("div")
        document.getElementById('settings').appendChild(alert)
        alert.setAttribute("class", "alert alert-warning alert-dismissible fade show mt-2");
        alert.setAttribute("role", "alert");
        alert.setAttribute("data-dismiss", "alert");
        alert.innerHTML = "<strong>Note: </strong> On 3 July the UK announced an ongoing revision of historical data that lead to a negative number of new cases and an overall decrease in cases for the UK."
        $('.alert').alert();
    }
    plotGraph();
});

casesButton.on('click', function(){
    choiceButton = casesButton.attr('id');
    plotGraph();

});

deathsButton.on('click', function(){
    choiceButton = deathsButton.attr('id');
    plotGraph();
});

function extractCoutryData(){
    let covidData = [];
    for (let i in responseData["records"]){
        if (responseData["records"][i]["countriesAndTerritories"] == selectedCountry){
            covidData.push(responseData["records"][i]);
        };
    };
    return covidData;
};

function dataToArray(data){
    let x = [];
    let yCases = [];
    let yCasesAvrg = [];
    let yCasesCumulative = [];
    let yDeaths = [];
    let yDeathsAvrg = [];
    let yDeathsCumulative = [];

    for(let i in data){
        x.push(String(data[i]["year"])+"-"+String(data[i]["month"])+"-"+String(data[i]["day"]));

        yCases.push(data[i]["cases"]);

        if (i < data.length - 6){
            yCasesAvrg.push(computeAverage(data, i, 7, 'cases'))
        } else {
            yCasesAvrg.push(NaN);
        }

        yDeaths.push(data[i]["deaths"]);

        if (i < data.length - 6){
            yDeathsAvrg.push(computeAverage(data, i, 7, 'deaths'));
        } else {
            yDeathsAvrg.push(NaN);
        }   
    };

    var i = 0;
    yCases.slice().reverse().forEach((c) => {
        yCasesCumulative.push(i + c);
        i += c;
    });

    i = 0;
    yDeaths.slice().reverse().forEach((d) => {
        yDeathsCumulative.push(i + d);
        i += d
    })

    return [x, yCases, yCasesAvrg, yDeaths, yDeathsAvrg, yCasesCumulative.reverse(), yDeathsCumulative.reverse()];
};


function computeAverage(x, index, range, type) {
    return x.slice(
        parseInt(index), parseInt(index) + range - 1
    )
    .map(x => x[type])
    .reduce((acc, val) => acc + val)
    / range
}

function accumulate(a, b) {
    return a.reduce((acc, val) => acc + val) + b
}

function plotGraph(){
    let covidData = extractCoutryData();
    let mydata = dataToArray(covidData);
    console.log(mydata);
    
    if (choiceButton == casesButton.attr('id')) {
        var trace1 = {
            type: "bar",
            name: "raw data",
            x: mydata[0],
            y: mydata[1]
        };

        var trace2 = {
            type: 'scatter',
            mode: 'lines',
            name: "7 days moving average",
            x: mydata[0],
            y: mydata[2]
        };

        var trace3 = {
            type: 'scatter',
            mode: 'lines',
            name: 'Cumulative',
            x: mydata[0],
            y: mydata[5]
        }

        var trace4 = {
            type: 'scatter',
            mode: 'lines',
            name: 'Cumulative (log)',
            yaxis: 'y2',
            x: mydata[0],
            y: mydata[5].map(x => Math.log(x))
        }

        var layout1 = {
            title: 'Daily New Cases'
        };

        var layout2 = {
            title: 'Cumulative Cases',
            yaxis: {title: 'Number of cases'},
            yaxis2: {
                title: 'Number of cases (log scale)',
                overlaying: 'y',
                side: 'right'
            }
        };

    } else if (choiceButton == deathsButton.attr('id')) {
        var trace1 = {
            type: "bar",
            name: "raw data",
            x: mydata[0],
            y: mydata[3]
        };

        var trace2 = {
            type: 'scatter',
            mode: 'lines',
            name: "7 days moving average",
            x: mydata[0],
            y: mydata[4]
        };

        var trace3 = {
            type: 'scatter',
            mode: 'lines',
            name: 'Cumulative',
            x: mydata[0],
            y: mydata[6]
        }

        var trace4 = {
            type: 'scatter',
            mode: 'lines',
            name: 'Cumulative (log)',
            yaxis: 'y2',
            x: mydata[0],
            y: mydata[6].map(x => Math.log(x))
        }

        var layout1 = {
            title: 'Daily New Deaths',
        };

        var layout2 = {
            title: 'Cumulative Deaths',
            yaxis: {title: 'Number of deaths'},
            yaxis2: {
                title: 'Number of deaths (log scale)',
                overlaying: 'y',
                side: 'right'
            }
        };

    } else {
        alert("Sorry, we are not able to plot any graph.");
    }

    var reportData = [trace1, trace2];
    var cumulativeData = [trace3, trace4];
    var config = { responsive: true }

    console.log(reportData, cumulativeData);
    Plotly.newPlot(reportGraph, reportData, layout1, config);
    Plotly.newPlot(cumulativegraph, cumulativeData, layout2, config);
};


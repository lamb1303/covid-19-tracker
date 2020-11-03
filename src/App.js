import { FormControl, Select, MenuItem, Card, CardContent } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import InfoBox from './components/InfoBox/InfoBox.jsx';
import Map from './components/Map/Map.jsx';
import Table from './components/Table/Table.jsx';
import { sortData, prettyPrintStat } from './utils/util.js';
import LineGraph from './components/LineGraph/LineGraph.jsx';
import "leaflet/dist/leaflet.css";
import './App.css';


function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapZoom, setMapZoom] = useState(2)
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapCounties, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data);
      })
  }, [])
  useEffect(() => {
    // Async -> send a request, wait for it, do something whit the info
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => (
            {
              name: country.country,
              value: country.countryInfo.iso2
            }
          ));
          const sorderdData = sortData(data)
          setCountries(countries);
          setMapCountries(data)
          setTableData(sorderdData);
        })
    };
    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);
    const url = countryCode === "worldwide" ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`
    await fetch(url)
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data);
        setCountry(countryCode);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long])
        setMapZoom(4)
      })
  }
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>Covid-19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select
              varient='outlined'
              value={country}
              onChange={onCountryChange}
            >
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {
                countries.map((country, id) => (
                  <MenuItem key={id} value={country.value}>{country.name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>
        </div>
        <div className="app__stats">
          <InfoBox
            active={casesType === 'cases'}
            isRed
            onClick={e => setCasesType('cases')}
            title="Coronavirus Cases"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={countryInfo.cases} />
          <InfoBox
            active={casesType === 'recovered'}
            onClick={e => setCasesType('recovered')}
            title="Recovered"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={countryInfo.recovered} />
          <InfoBox
            active={casesType === 'deaths'}
            isRed
            onClick={e => setCasesType('deaths')}
            title="Deaths"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={countryInfo.deaths} />
        </div>
        <Map casesType={casesType} countries={mapCounties} center={mapCenter} zoom={mapZoom} />
      </div>
      <div className="app__right">
        <Card>
          <CardContent>
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3>Worldwide New {casesType}</h3>
          </CardContent>
        </Card>
        <LineGraph className="app__graph" casesType={casesType} />
      </div>
    </div>
  );
}

export default App;

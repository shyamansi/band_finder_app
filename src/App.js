import React, { useState,useEffect} from 'react';
import BandList from './BandList';

const App = () => {
  const [city, setCity]=useState('');
  const [loading, setLoading] =useState(false);
  const [bands ,setBands] = useState([]);

  useEffect(() => {
    getUserLocation();
  },[]);
 const cityCheck=()=>{
  if (city.length === 0){
  alert("Enter City Name"); 
  }
 }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => reverseGeocode(pos.coords.latitude, pos.coords.longitude),
        () => getCityFromIP()
      );
    } else {
      getCityFromIP(); 
    }
  };

  const reverseGeocode = (lat, lon) => {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
      .then(res => res.json())
      .then(data => {
        if (data.address && data.address.city) {
          setCity(data.address.city);
          fetchBands(data.address.city);
        }
      });
  };

  const getCityFromIP = () => {
    fetch('https://get.geojs.io/v1/ip/geo.json')
      .then(res => res.json())
      .then(data => {
        setCity(data.city);
        fetchBands(data.city);
      });
  };

  const fetchBands = (cityName) => {
    setLoading(true);
    fetch(`https://corsproxy.io/?https://musicbrainz.org/ws/2/area/?query=${cityName}&fmt=json`)
      .then(res => res.json())
      .then(data => {
        const area = data.areas && data.areas[0];
        if (!area) throw new Error("City not found in MusicBrainz");

        const areaId = area.id;

        return fetch(`https://corsproxy.io/?https://musicbrainz.org/ws/2/artist?area=${areaId}&fmt=json&limit=100`);
      })
      .then(res => res.json())
      .then(data => {
        const tenYearsAgo = new Date().getFullYear() - 10;

        const recentBands = data.artists
          .filter(artist =>
            artist['life-span'] &&
            artist['life-span'].begin &&
            parseInt(artist['life-span'].begin.split('-')[0]) >= tenYearsAgo
          )
          .slice(0, 50); 

        setBands(recentBands);
      })
      .catch(err => {
        console.error(err);
        alert("Could not find bands for this city.");
      })
      .finally(() => setLoading(false));
  };

  const bandSearch=(e)=>{
    e.preventDefault();
    if (city){
      fetchBands(city);
    }

  };
 
  return (
    <div className="container" style={{background: 'antiquewhite'}}>
      <h1> Band Finder App</h1>
      <form onSubmit={bandSearch}>
        <input type='text' value={city} onChange={(e)=>setCity(e.target.value)} placeholder='Enter City'/>
        <button type="submit" className="btn btn-primary btn-sm" style={{position: 'fixed'}} onClick={cityCheck}>Find Band</button>

      </form>
      {loading ? <p>Loading bands...</p>:<BandList bands={bands}/>}
    </div>
  );
};

export default App

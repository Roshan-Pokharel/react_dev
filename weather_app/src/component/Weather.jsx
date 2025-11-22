import {useEffect , useState, useRef } from 'react';
import axios from 'axios';
import './weather.css';

function Weather() {
  

  const [weatherData, setWeatherData]=useState(null);

  const inputRef = useRef(null);

  const apiKey = import.meta.env.VITE_API_KEY;
  
   
  async function GetData(place){
   
    const linkValue = `https://api.openweathermap.org/data/2.5/weather?q=${place}&limit=5&appid=${apiKey}`;

    try{
      const {data} = await axios.get(linkValue);

      setWeatherData(data);
      console.log(data);
    }
    catch(error){
      console.error(error);

    }

  }

  useEffect(()=>{
    if(apiKey){
     GetData("butwal");
    }
    else {
      console.log("no api key found")
    }
   
  }, []);

 
  return (
    <div>
    <div className = "Head-part">
       <input type="text" className="InputValue" placeholder='search' ref={inputRef}></input>
        <img src="searchIcon.png" alt='searchLogo Image' onClick={()=>{GetData(inputRef.current.value)}}></img>
    </div>
    <div className="body-part">
        {weatherData ?(
          <>
          <div>
          Sky:{weatherData.weather[0].main}
          </div>
          <div className="sub-section">
        
        <div className="wind-section">Wind Speed:{weatherData.wind.speed}</div>
        <div className="temp-section">Temperature:{weatherData.main.temp}</div>
      </div>
      </>
          ):(
          <>
          <p>Loading weather info....</p>
          </>
        )
      }
      
    </div>
    </div>
  )
}

export default Weather

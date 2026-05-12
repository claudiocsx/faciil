import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Substitua pelo seu ID

const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    ReactGA.initialize(GA_MEASUREMENT_ID);
  }, []);

  useEffect(() => {
    ReactGA.send({ 
      hitType: 'pageview', 
      page: location.pathname + location.search 
    });
  }, [location]);

  return null;
};

export default Analytics;
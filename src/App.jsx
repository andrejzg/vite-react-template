import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, CircularProgress, Card, Typography, Chip, LinearProgress } from '@mui/material';
import './App.css';

function InsightCard({ insight }) {
  const { title, description, impact_score, tags, grid_coordinates } = insight;

  return (
    <Card style={{ margin: '10px', padding: '15px' }}>
      <Typography variant="h5" style={{ fontWeight: 'bold' }}>{title}</Typography>
      <Typography variant="body1" style={{ marginTop: '10px' }}>{description}</Typography>
      <div style={{ display: 'flex', marginTop: '10px', flexWrap: 'wrap' }}>
        {tags.map(tag => (
          <Chip key={tag} label={tag} style={{ marginRight: '5px', marginBottom: '5px' }} />
        ))}
      </div>
      <LinearProgress variant="determinate" value={impact_score * 10} style={{ marginTop: '10px' }} />
      <Typography variant="caption">
        Grid: {grid_coordinates.from.column}{grid_coordinates.from.row} to {grid_coordinates.to.column}{grid_coordinates.to.row}
      </Typography>
    </Card>
  );
}

function InsightsDisplay({ insights }) {
  return (
    <div>
      {insights.map(insight => (
        <InsightCard key={insight.sequence_number} insight={insight} />
      ))}
    </div>
  );
}

function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const handleInputChange = (event) => {
    setUrl(event.target.value);
  };

  const postPricingInsights = async () => {
    try {
      const response = await axios.post('https://pricegpt-production-4ec0.up.railway.app/v1/api/pricing_insights', {
        pricing_page_url: url
      });
      return response.data;
    } catch (error) {
      console.error('Error posting pricing insights:', error);
      setIsLoading(false);
    }
  };

  const getPricingInsights = async (uuid) => {
    try {
      const response = await axios.get('https://pricegpt-production-4ec0.up.railway.app/v1/api/pricing_insights', {
        params: { uuid }
      });
      console.log("API Response: ", response.data); // Log the entire API response
      const insightsData = JSON.parse(response.data.insights_json); // Parse the JSON string into an object
      console.log("Insights Data: ", insightsData.insights); // Log the insights data

      if (response?.data?.status === 'FINISHED') {
        setInsights(insightsData.insights); // Set the insights after parsing
        setIsLoading(false);
      } else {
        setTimeout(() => getPricingInsights(uuid), 2000);
      }
    } catch (error) {
      console.error('Error getting pricing insights:', error);
      setIsLoading(false);
    }
  };

  const handleButtonClick = async () => {
    setIsLoading(true);
    const postResponse = await postPricingInsights();
    if (postResponse) {
      await getPricingInsights(postResponse.request_uuid);
    }
  };

  return (
    <>
      <div>
        <h1>PriceGPT Demo</h1>
        <div className="card">
          <p>Enter a pricing page url and wait for the generated insights!</p>
        </div>
      </div>
      <div style={{ margin: '20px' }}>
        <TextField
          label="Enter URL"
          variant="outlined"
          value={url}
          onChange={handleInputChange}
          style={{ marginRight: '10px' }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleButtonClick}
        >
          Generate Report
        </Button>
        {isLoading && <CircularProgress style={{ marginLeft: '10px' }} />}
      </div>
      {insights && <InsightsDisplay insights={insights} />}
    </>
  );
}

export default App;

const axios = require('axios');

class GraniteLLMService {
  constructor() {
    this.apiKey = process.env.WATSONX_API_KEY;
    this.projectId = process.env.WATSONX_PROJECT_ID;
    this.watsonxUrl = process.env.WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';
    this.modelId = process.env.GRANITE_MODEL_ID || 'ibm/granite-4-8b-instruct';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  shouldUseMock() {
    return !this.apiKey || this.apiKey === 'your_watsonx_api_key_here';
  }

  async getAccessToken() {
    if (this.shouldUseMock()) {
      return null;
    }

    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        'https://iam.cloud.ibm.com/identity/token',
        new URLSearchParams({
          grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
          apikey: this.apiKey,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
      return this.accessToken;
    } catch (error) {
      console.error('Failed to get IBM IAM access token:', error.message);
      throw new Error('Authentication failed with IBM Watsonx.AI');
    }
  }

  generateMockText(systemPrompt, userPrompt) {
    if (userPrompt.toLowerCase().includes('flood risk')) {
      return `Overall risk level: HIGH\nAffected zones: Maninagar, Vatva, Juhapura\nExpected water accumulation: 40-60 cm in low-lying areas\nTime to peak: 3-5 hours\nRecommendation: Activate evacuation advisory for vulnerable residential neighborhoods, deploy pumps to low-lying wards, and monitor local storm drains.`;
    }

    if (userPrompt.toLowerCase().includes('drainage maintenance')) {
      return `Priority 1: Desilting of Sabarmati riverside drains (5 days)\nPriority 2: Pump station maintenance (3 days)\nPriority 3: Drain cover inspection in commercial zones (4 days)\nCrew assignment: Team A - east zone, Team B - west zone, Team C - critical choke points\nEquipment: JCB excavators, high-pressure jetters, CCTV inspection units\nCost estimate: ₹20 Lakhs total\nRisk mitigation: Deploy temporary bypass channels where critical drains are blocked.`;
    }

    if (userPrompt.toLowerCase().includes('emergency flood response')) {
      return `IMMEDIATE ACTIONS: 1) Deploy rescue teams to the highest-risk zones; 2) Activate relief camp at AMC Community Hall; 3) Send SMS alerts to residents in affected wards; 4) Close major flood-prone roads; 5) Coordinate with NDRF and fire brigade for boat rescue.\nRESOURCE DEPLOYMENT: 8 rescue teams, 15 boats, 2 medical squads.\nEVACUATION PLAN: Use riverfront and open ground shelters.\nCOMMUNICATION: Broadcast warnings on radio, SMS, and social media.\nESCALATION: Increase to Level 3 if water levels rise above 1.5m in low-lying sectors.`;
    }

    if (userPrompt.toLowerCase().includes('citizen flood report')) {
      return `SEVERITY LEVEL: Medium\nImmediate safety instructions: Move to higher ground, avoid walking through floodwater, call emergency services if water levels rise.\nEmergency dispatch needed: Yes, if water reaches waist level or people are stranded.\nAdditional information needed: Nearest landmark and contact details.\nEstimated response time: 30-90 minutes.\nPublic safety message: Avoid the reported area until rescue teams arrive.`;
    }

    if (userPrompt.toLowerCase().includes('urban resilience dashboard report')) {
      return `Executive summary: Current conditions show elevated flood risk in Ahmedabad and Surat due to sustained heavy rainfall and partial drainage blockages. Real-time indicators are yellow to orange, with the highest concern in low-lying wards. Priority actions: accelerate drain clearance, mobilize pumps, and prepare evacuation centers. Forecast: continued showers for the next 6-12 hours, with localized flooding likely in vulnerable areas.`;
    }

    if (userPrompt.toLowerCase().includes('post-flood damage assessment')) {
      return `Damage summary: Residential and commercial infrastructure has sustained moderate to severe damage driven by 24-hour inundation and peak water depths over 60 cm. Immediate relief: shelter 250 families, provide potable water and medical aid, and deploy restoration crews for critical drainage and road repairs. Reconstruction priorities: restore transport corridors, repair flood-defense embankments, and upgrade stormwater drain capacity.`;
    }

    return 'Mock response: Unable to generate full AI output without IBM Watsonx credentials. Please configure WATSONX_API_KEY in .env for live Granite LLM responses.';
  }

  async generateText(systemPrompt, userPrompt, options = {}) {
    if (this.shouldUseMock()) {
      console.warn('GraniteLLMService: Missing WATSONX_API_KEY. Returning mock AI response.');
      return this.generateMockText(systemPrompt, userPrompt);
    }

    const token = await this.getAccessToken();

    const payload = {
      model_id: this.modelId,
      project_id: this.projectId,
      input: `<|system|>\n${systemPrompt}\n<|user|>\n${userPrompt}\n<|assistant|>\n`,
      parameters: {
        decoding_method: options.decoding_method || 'greedy',
        max_new_tokens: options.max_new_tokens || 1024,
        min_new_tokens: options.min_new_tokens || 50,
        stop_sequences: options.stop_sequences || ['<|user|>', '<|system|>'],
        repetition_penalty: options.repetition_penalty || 1.1,
        temperature: options.temperature || 0.7,
      },
    };

    try {
      const response = await axios.post(
        `${this.watsonxUrl}/ml/v1/text/generation?version=2023-05-29`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      const result = response.data.results?.[0]?.generated_text || '';
      return result.trim();
    } catch (error) {
      console.error('Granite LLM generation error:', error.response?.data || error.message);
      throw new Error(`LLM generation failed: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }
}

module.exports = new GraniteLLMService();

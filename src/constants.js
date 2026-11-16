export const DEFAULT_ENVIRONMENTS = {
  local: {
    name: 'Local Sandbox',
    variables: {
      baseUrl: 'http://localhost:5001/api',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0.MOCK_DEV_TOKEN',
      userId: '1'
    }
  },
  staging: {
    name: 'Staging Cloud',
    variables: {
      baseUrl: 'https://jsonplaceholder.typicode.com',
      token: 'staging_test_token_882910',
      userId: '1'
    }
  },
  production: {
    name: 'Production',
    variables: {
      baseUrl: 'https://dummyjson.com',
      token: 'prod_live_token_991823',
      userId: '1'
    }
  }
};

export const DEFAULT_COLLECTIONS = [
  {
    id: 'col-my-apis',
    name: 'My APIs',
    description: 'Your tested APIs and endpoints',
    requests: [
      {
        id: 'req-contact-health',
        name: 'Contact API - Health',
        method: 'GET',
        url: 'http://localhost:5001/api/health',
        headers: [],
        params: [],
        body: '',
        auth: { type: 'none' },
        assertions: []
      }
    ]
  }
];

export const DEMO_COLLECTIONS = DEFAULT_COLLECTIONS;

export const HTTP_METHODS = [
  { name: 'GET', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { name: 'POST', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { name: 'PUT', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { name: 'DELETE', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { name: 'PATCH', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { name: 'OPTIONS', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { name: 'HEAD', color: 'text-gray-400 bg-gray-500/10 border-gray-500/30' }
];

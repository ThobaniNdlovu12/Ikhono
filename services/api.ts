import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://ikhono.africa/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export const loginUser = (email: string, password: string, remember = false) =>
  api.post('/login.php', { email, password, remember });

export const signupClient = (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  location: string;
  idNumber?: string;
}) => api.post('/signup.php', { ...data, type: 'find' });

export const signupProfessional = (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  location: string;
  service: string;
  experience: string;
  bio: string;
  plan?: 'free' | 'pro' | 'elite';
}) => api.post('/signup.php', { ...data, type: 'join' });

export const signupProfessionalWithDocs = (formData: FormData) =>
  api.post('/verify.php', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const requestPasswordReset = (email: string) =>
  api.post('/request_password_reset.php', { email });

export const getDashboard = () => api.get('/dashboard.php');
export const getProfessionalStats = (professionalId: string | number) =>
  api.get('/dashboard.php', { params: { action: 'professional_stats', professional_id: professionalId } })

export const getProfessionalJobs = (professionalId: string | number) =>
  api.get('/dashboard.php', { params: { action: 'professional_jobs', professional_id: professionalId } })

export const getProfessionalPortfolio = (professionalId: string | number) =>
  api.get('/dashboard.php', { params: { action: 'professional_portfolio', professional_id: professionalId } })

const SERVICE_LABELS: Record<string, string> = {
  'plumbing': 'Plumbing',
  'electrical': 'Electrical',
  'painting': 'Painting',
  'carpentry': 'Carpentry',
  'tiling': 'Tiling',
  'waterproofing': 'Waterproofing',
  'roof-gutters': 'Roof & Gutters',
  'general-maintenance': 'General Maintenance',
  'ceilings': 'Ceilings',
  'drywalling': 'Drywalling',
  'glazing-aluminum': 'Glazing / Aluminum Work',
  'welding-steelwork': 'Welding & Steelwork',
  'bricklaying-plastering': 'Bricklaying & Plastering',
  'flooring': 'Flooring',
  'landscaping-garden': 'Landscaping & Garden',
  'paving': 'Paving',
  'built-in-cupboards': 'Built-in Cupboards',
  'hvac': 'Air Conditioning (HVAC)',
  'cctv-security': 'CCTV & Security Systems',
  'high-pressure-cleaning': 'High-Pressure Cleaning',
  'swimming-pool': 'Swimming Pool Installation & Repairs',
  'pool-cleaning': 'Pool cleaning services',
};

const LOCATION_LABELS: Record<string, string> = {
  'johannesburg': 'johannesburg',
  'cape-town': 'cape-town',
  'durban': 'kwazulu-natal',
  'kwazulu-natal': 'kwazulu-natal',
  'pretoria': 'gauteng',
  'gauteng': 'gauteng',
  'free-state': 'free-state',
  'north-west': 'north-west',
  'western-cape': 'western-cape',
};

export const getPublicOpenJobs = (service = '', location = '') =>
  api.get('/dashboard.php', {
    params: {
      action: 'public_open_jobs',
      service: SERVICE_LABELS[service] ?? service,
      location: LOCATION_LABELS[location] ?? location,
    },
  })

export const getPublicProfessionals = (service = '', location = '') => {
  const mappedService = SERVICE_LABELS[service] ?? service
  const mappedLocation = LOCATION_LABELS[location] ?? location
  return api.get('/dashboard.php', {
    params: {
      action: 'get_professionals',
      service: mappedService,
      location: mappedLocation,
    },
  })
}

export const getJobs = () => api.get('/jobs.php', { params: { action: 'my_jobs' } });

export const getBids = () => api.get('/bids.php');

export const getJobDetails = (id: number, clientId?: string | number) =>
  api.get('/jobs.php', { params: { action: 'job_details', id, client_id: clientId } })

export const getJobBids = (id: number) =>
  api.get('/bids.php', { params: { action: 'job_bids', job_id: id } })

export const acceptBid = (data: { job_id: number; bid_id: number }) =>
  api.post('/bids.php', { action: 'accept_bid', ...data })

export const uploadDocument = (formData: FormData) =>
  api.post('/client_documents.php', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const attachJobDocs = (data: { job_id: number; doc_ids: number[] }) =>
  api.post('/jobs.php', { action: 'attach_docs', ...data })

export const updateJob = (data: { job_id: number; description: string }) =>
  api.post('/jobs.php', { action: 'update_job', ...data });

export const placeBid = (data: {
  job_id: number;
  amount: number;
  notes: string;
}) => api.post('/bids.php', data);

export const sendOtp = (email: string) =>
  api.post('/send-otp.php', { email });

export const verifyOtp = (email: string, code: string) =>
  api.post('/verify-otp.php', { email, code });

export const processPayment = (data: {
  plan: 'pro' | 'elite';
  amount: number;
  cardNumber: string;
  cardName: string;
  fullName: string;
  email: string;
  user_id?: string;
}) => api.post('/process_payment.php', {
  plan: data.plan,
  amount: data.amount,
  cardNumber: data.cardNumber,
  cardName: data.cardName,
  fullName: data.fullName,
  email: data.email,
  user_id: data.user_id,
  card_number: data.cardNumber,
  cardholder_name: data.cardName,
  full_name: data.fullName,
  last_4_digits: data.cardNumber.slice(-4),
  payment_method: 'card',
});

export const changePlan = (user_id: string | number, plan: 'free' | 'pro' | 'elite') =>
  api.post('/change_plan.php', { user_id, plan });

export const postJob = (data: {
  title: string;
  description: string;
  service_type: string;
  location: string;
  budget_min: number;
  budget_max: number;
  deadline?: string | null;
}) => api.post('/jobs.php', { action: 'create_job', ...data });


export default api;
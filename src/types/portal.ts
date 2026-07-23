export interface SchoolInfo {
  id: number;
  name: string;
  address: string;
  phone: string;
  ugel: string;
  email: string;
  mission: string;
  vision: string;
  objectives: string;
  values: string;
  logo: string;
  banner: string;
}

export interface PortalPublication {
  id: number;
  title: string;
  event_date: string | null;
  location: string | null;
  background_color: string;
  description: string;
  target_audience: string | null;
  section: string;
  image: string | null;
  is_virtual: boolean;
  event_url: string | null;
  status: string;
}

export interface PortalPublicationsResponse {
  items: PortalPublication[];
  pagination: {
    current_page: number;
    limit: number;
    total: number;
  };
}
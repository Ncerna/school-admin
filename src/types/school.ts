export interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  ugel: string;
  email: string;
  mission: string;
  vision: string;
  objectives: string;
  values: string;
  logo?: File | string;
  banner?: File | string;
}

export type SchoolPayload = Omit<School, "id"> & {
  logoRemove?: boolean;
  bannerRemove?: boolean;
};
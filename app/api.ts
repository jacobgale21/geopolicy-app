const API_BASE_URL = "http://localhost:8001";
export interface Legislator {
  id: number;
  name: string;
  state: string;
  party: string;
  gender: string;
  url: string;
  address: string;
  phone: string;
  Role: string;
}
export interface LegislatorResponse {
  legislators: Legislator[];
}
class ApiService {
  private baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  async getLegislators(address: string): Promise<Legislator[]> {
    const url = `${this.baseUrl}/legislators/${encodeURIComponent(address)}`;
    console.log(url);
    const response = await fetch(url, {
      method: "GET",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch legislators");
    }
    const data: LegislatorResponse = await response.json();
    return data.legislators;
  }
}

export const apiService = new ApiService(API_BASE_URL);

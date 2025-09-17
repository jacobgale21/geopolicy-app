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

export interface SpendingData {
  name: string;
  amount: number;
  percent_budget: number;
}

export interface GovernmentSpendingData {
  agency_data: SpendingData[];
  budget_functions_data: SpendingData[];
}
class ApiService {
  private baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  async getLegislators(address: string, token: string): Promise<Legislator[]> {
    const url = `${this.baseUrl}/legislators/${encodeURIComponent(address)}`;
    console.log(url);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch legislators");
    }
    const data: LegislatorResponse = await response.json();
    return data.legislators;
  }
  async getCrimeData(
    state: string,
    crime_type: string,
    token: string
  ): Promise<any> {
    const url = `${this.baseUrl}/get_crime_data/${state}/${crime_type}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch crime data");
    }
    const data: any = await response.json();
    return data;
  }
  async getAllStateCrime(state: string, token: string): Promise<any> {
    const url = `${this.baseUrl}/get_all_state_crime/${state}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch crime data");
    }
    const data: any = await response.json();
    return data;
  }
  async getCensusData(state: string, token: string): Promise<any> {
    const url = `${this.baseUrl}/get_census_data/${state}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch census data");
    }
    const data: any = await response.json();
    return data;
  }
  async getAgencySpending(token: string): Promise<any> {
    const url = `${this.baseUrl}/get_agency_spending`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch agency spending");
    }
    const data: any = await response.json();
    return data;
  }
  async getHealthData(
    state: string,
    name: string,
    token: string
  ): Promise<any> {
    const url = `${this.baseUrl}/get_health_data/${state}/${name}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch health data");
    }
    const data: any = await response.json();
    return data;
  }
}

export const apiService = new ApiService(API_BASE_URL);

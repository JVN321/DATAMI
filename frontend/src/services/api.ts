import axios from 'axios';
import {
  Metadata,
  Station,
  CrimeSummary,
  YearlyTrend,
  CrimeCategory,
  RiskPredictionResponse,
  ModelEvaluation,
  WorkloadStation,
  StationDetail
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

export const api = {
  getMetadata: async (): Promise<Metadata> => {
    const res = await client.get<Metadata>('/metadata');
    return res.data;
  },

  getStations: async (district?: string, division?: string): Promise<Station[]> => {
    const res = await client.get<Station[]>('/stations', {
      params: { district, division },
    });
    return res.data;
  },

  getCrimeSummary: async (params?: {
    year?: number | string;
    district?: string;
    station_id?: string;
    crime_category?: string;
  }): Promise<CrimeSummary> => {
    const res = await client.get<CrimeSummary>('/crimes/summary', { params });
    return res.data;
  },

  getCrimeTrends: async (params?: {
    district?: string;
    station_id?: string;
  }): Promise<YearlyTrend[]> => {
    const res = await client.get<YearlyTrend[]>('/crimes/trends', { params });
    return res.data;
  },

  getCrimeCategories: async (params?: {
    year?: number | string;
    district?: string;
    station_id?: string;
    category_type?: 'IPC' | 'SLL';
  }): Promise<CrimeCategory[]> => {
    const res = await client.get<CrimeCategory[]>('/crimes/categories', { params });
    return res.data;
  },

  getStationDetail: async (stationId: string): Promise<StationDetail> => {
    const res = await client.get<StationDetail>(`/crimes/station/${stationId}`);
    return res.data;
  },

  getRiskPredictions: async (stationId?: string): Promise<RiskPredictionResponse> => {
    const res = await client.get<RiskPredictionResponse>('/predictions/risk', {
      params: { station_id: stationId },
    });
    return res.data;
  },

  getModelEvaluation: async (): Promise<ModelEvaluation> => {
    const res = await client.get<ModelEvaluation>('/model/evaluation');
    return res.data;
  },

  retrainModel: async (params?: { split_year?: number; max_depth?: number; criterion?: string }): Promise<ModelEvaluation> => {
    const res = await client.post<ModelEvaluation>('/model/retrain', null, { params });
    return res.data;
  },

  getWorkload: async (district?: string): Promise<WorkloadStation[]> => {
    const res = await client.get<WorkloadStation[]>('/workload', {
      params: { district },
    });
    return res.data;
  },

  getReadiness: async (
    district?: string, 
    surgePct: number = 50,
    threshold: number = 25.0
  ): Promise<import('../types').ReadinessResponse> => {
    const res = await client.get<import('../types').ReadinessResponse>('/readiness', {
      params: { district, surge_pct: surgePct, threshold },
    });
    return res.data;
  },

  getTablePreview: async (
    tableName: string, 
    params?: {
      limit?: number;
      offset?: number;
      station_id?: string;
      year?: number;
      crime_category?: string;
      min_cases?: number;
      search?: string;
    }
  ): Promise<import('../types').TablePreview> => {
    const res = await client.get<import('../types').TablePreview>(`/data/preview/${tableName}`, {
      params: {
        limit: params?.limit ?? 50,
        offset: params?.offset ?? 0,
        station_id: params?.station_id,
        year: params?.year,
        crime_category: params?.crime_category,
        min_cases: params?.min_cases,
        search: params?.search,
      },
    });
    return res.data;
  },

  getOlapRollup: async (year?: number, district?: string): Promise<import('../types').OlapRollupResponse> => {
    const res = await client.get<import('../types').OlapRollupResponse>('/data/olap/rollup', {
      params: { year, district },
    });
    return res.data;
  },

  getOlapPivot: async (district?: string): Promise<import('../types').OlapPivotResponse> => {
    const res = await client.get<import('../types').OlapPivotResponse>('/data/olap/pivot', {
      params: { district },
    });
    return res.data;
  },

  getCsvExportUrl: (tableName: string): string => {
    return `${API_BASE}/data/export/csv/${tableName}`;
  },

  getPipelineSummary: async (): Promise<import('../types').PipelineSummary> => {
    const res = await client.get<import('../types').PipelineSummary>('/pipeline/summary');
    return res.data;
  },
};


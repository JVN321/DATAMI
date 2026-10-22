export interface Station {
  id: string;
  name: string;
  district: string;
  division: string | null;
  latitude: number | null;
  longitude: number | null;
  address: string;
  jurisdiction: string;
  sho_name: string;
  sho_phone: string;
  sanctioned_staff: number;
  existing_staff: number;
  vacancy_staff: number;
  source_url: string;
  last_retrieved: string;
  min_year?: number;
  max_year?: number;
  total_cases_recorded?: number;
}

export interface CrimeSummary {
  selected_filters: {
    year: string | number;
    district: string;
    station_id: string;
    crime_category: string;
  };
  total_registered_cases: number;
  ipc_cases: number;
  sll_cases: number;
  stations_represented: number;
  most_recent_year: number | null;
  highest_station: {
    station_id: string;
    station_name: string;
    recorded_cases: number;
    caveat: string;
  } | null;
  lowest_station: {
    station_id: string;
    station_name: string;
    recorded_cases: number;
    caveat: string;
  } | null;
  data_notice: string;
}

export interface YearlyTrend {
  year: number;
  total_cases: number;
  ipc_cases: number;
  sll_cases: number;
  stations_reporting: number;
}

export interface CrimeCategory {
  crime_head: string;
  case_count: number;
  percentage: number;
}

export interface RiskPrediction {
  station_id: string;
  station_name: string;
  district: string;
  division: string | null;
  latitude: number | null;
  longitude: number | null;
  target_period?: string;
  last_reporting_year?: number;
  risk_label: string;
  risk_tier: 'higher' | 'lower' | 'insufficient_data';
  risk_probability?: number;
  confidence?: number | null;
  features_used?: {
    lag1_cases: number;
    lag2_cases: number;
    rolling_avg: number;
    trend_rate_pct: number;
    sll_ratio_pct: number;
  };
  decision_rationale?: string;
  status?: string;
  explanation?: string;
}

export interface RiskPredictionResponse {
  prediction_period: string;
  model_used: string;
  syllabus_concept: string;
  total_stations: number;
  higher_risk_count: number;
  lower_risk_count: number;
  predictions: RiskPrediction[];
}

export interface ModelEvaluation {
  status: string;
  algorithm: string;
  syllabus_mapping: string;
  hyperparameters: {
    criterion: string;
    max_depth: number;
    min_samples_split: number;
    split_year: number;
  };
  target_definition: string;
  dataset_summary: {
    total_samples: number;
    train_samples: number;
    train_years: string;
    test_samples: number;
    test_years: string;
  };
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    confusion_matrix: number[][];
    confusion_matrix_labels: string[][];
  };
  baselines: {
    zero_r_majority: {
      name: string;
      accuracy: number;
    };
    persistence_lag1: {
      name: string;
      accuracy: number;
      f1_score: number;
    };
  };
  feature_importances: Record<string, number>;
  decision_rules: string;
  trained_at: string;
  limitations: string[];
}

export interface WorkloadStation {
  station_id: string;
  station_name: string;
  district: string;
  division: string | null;
  sanctioned_staff: number;
  existing_staff: number;
  vacancy_count: number;
  vacancy_percentage: number;
  latest_reporting_year: number | null;
  latest_annual_cases: number;
  cases_per_active_officer: number;
  indicator_label: string;
  disclaimer: string;
}

export interface Metadata {
  project_name: string;
  acronym_meaning: string;
  syllabus_alignment: string;
  geographic_focus: string;
  total_police_stations: number;
  kochi_stations_count: number;
  total_real_records: number;
  reporting_period: string;
  filter_options: {
    districts: string[];
    divisions: string[];
    years: number[];
    crime_categories: string[];
    ipc_crime_heads: string[];
    sll_crime_heads: string[];
  };
  provenance_statement: string;
  legal_context: string;
}

export interface StationDetail {
  metadata: Station & { staff_breakdown?: Array<{ rank: string; sanctioned: number; existing: number; vacancy: number }> };
  yearly_history: Array<{ year: number; total_cases: number; ipc_cases: number; sll_cases: number }>;
  top_ipc_crime_heads: Array<{ crime_head: string; total_count: number }>;
  top_sll_crime_heads: Array<{ crime_head: string; total_count: number }>;
  risk_prediction: RiskPrediction | null;
  analytical_notes: string[];
}

export interface ReadinessStation {
  station_id: string;
  station_name: string;
  district: string;
  division: string | null;
  latitude: number | null;
  longitude: number | null;
  sanctioned_staff: number;
  existing_staff: number;
  vacancy_count: number;
  vacancy_percentage: number;
  baseline_annual_cases: number;
  latest_reporting_year: number | null;
  baseline_cases_per_officer: number;
  spree_surge_percentage: number;
  spree_projected_cases: number;
  spree_cases_per_officer: number;
  cases_per_officer_if_vacancies_filled: number;
  readiness_tier: 'vulnerable' | 'moderate' | 'ready';
  readiness_label: string;
  recommendation: string;
}

export interface ReadinessResponse {
  surge_percentage_simulated: number;
  total_stations_assessed: number;
  vulnerable_understaffed_count: number;
  moderate_capacity_count: number;
  ready_resilient_count: number;
  stations: ReadinessStation[];
}

export interface TablePreview {
  table_name: string;
  total_rows: number;
  limit: number;
  offset: number;
  columns: string[];
  rows: Record<string, any>[];
}

export interface PipelineStep {
  step: number;
  title: string;
  status: string;
  description: string;
  details: string;
}

export interface PipelineSummary {
  pipeline_name: string;
  steps: PipelineStep[];
}


export interface DiagnosisKey {
    key_data: string;
    rolling_start_number: number;
    transmission_risk_level: number;
}

export interface Root {
    diagnosis_keys: DiagnosisKey[];
    public_health_authority_permission_number: string;
}
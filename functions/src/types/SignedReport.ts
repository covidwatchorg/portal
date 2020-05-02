export interface Welcome {
    temporary_contact_key_bytes:          string;
    memo_data:                            string;
    memo_type:                            number;
    start_index:                          number;
    end_index:                            number;
    signature_bytes:                      string;
    report_verification_public_key_bytes: string;
}

-- ==============================================================================
-- BARANGAY TIBAY COMMUNITY E-SERVICES & GOVERNANCE PORTAL SCHEMA
-- ==============================================================================

-- 1. Document Requests Table
CREATE TABLE IF NOT EXISTS public.document_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    document_type VARCHAR(100) NOT NULL, -- 'Barangay Indigency', 'Barangay Clearance', 'Certificate of Residency', etc.
    full_name VARCHAR(255) NOT NULL,
    birthdate DATE NOT NULL,
    civil_status VARCHAR(50) DEFAULT 'Single',
    purok_zone VARCHAR(100) NOT NULL, -- 'Purok 1 Bayanihan', 'Purok 2 Pag-asa', etc.
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    purpose VARCHAR(255) NOT NULL, -- 'Scholarship Application', 'Medical Assistance', 'Employment', etc.
    valid_id_type VARCHAR(100) NOT NULL, -- 'Philippine National ID', 'Voter ID', 'Driver License', 'Student ID', etc.
    valid_id_number VARCHAR(100),
    fee_amount NUMERIC(10, 2) DEFAULT 0.00,
    is_free BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'under_review', 'approved', 'ready_for_pickup', 'released', 'rejected'
    admin_notes TEXT,
    issued_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Community Blotter & Incident Reports Table
CREATE TABLE IF NOT EXISTS public.barangay_blotters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    complainant_name VARCHAR(255) NOT NULL,
    complainant_contact VARCHAR(20) NOT NULL,
    respondent_name VARCHAR(255),
    incident_type VARCHAR(100) NOT NULL, -- 'Noise Disturbance', 'Boundary Dispute', 'Neighborhood Conflict', etc.
    incident_location VARCHAR(255) NOT NULL,
    incident_date DATE NOT NULL,
    narrative TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'filed', -- 'filed', 'mediation_scheduled', 'resolved', 'referred_to_police'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Barangay Announcements Table
CREATE TABLE IF NOT EXISTS public.barangay_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Health & Vaccination', 'Ayuda / Assistance', 'Clean-Up Drive', 'General Advisory'
    content TEXT NOT NULL,
    is_urgent BOOLEAN DEFAULT FALSE,
    published_by VARCHAR(100) DEFAULT 'Barangay Secretary',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and public access for demo
ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangay_blotters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangay_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read document_requests" ON public.document_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert document_requests" ON public.document_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update document_requests" ON public.document_requests FOR UPDATE USING (true);

CREATE POLICY "Allow public read barangay_blotters" ON public.barangay_blotters FOR SELECT USING (true);
CREATE POLICY "Allow public insert barangay_blotters" ON public.barangay_blotters FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read barangay_announcements" ON public.barangay_announcements FOR SELECT USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.barangay_blotters;
ALTER PUBLICATION supabase_realtime ADD TABLE public.barangay_announcements;

NOTIFY pgrst, 'reload schema';

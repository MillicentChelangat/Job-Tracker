**User**
id
first_name
last_name
email
password
created_at
updated_at

**CandidateProfile**  [NEW]
- id
- user_id (FK → User, one-to-one)
- document_id (FK → Document)   ← which resume this was parsed from
- skills (JSON)
- education (JSON)
- experience (JSON)
- projects (JSON)
- raw_extracted_text
- parsed_at
- created_at / updated_at
→ Feature 1 (CV Intelligence) writes here, parsed from Document

**Company**
id
name
website
location
email
phone
industry
notes
created_at
updated_at

**Application**
id
user_id
company_id
position
status
employment_type
work_mode
date_applied
deadline
follow_up_date
job_url 
salary
notes
- add: job_description (text)   ← needed for Job Intelligence to have something to parse
- add: job_requirements (JSON)  ← Feature 2 output: skills, responsibilities, experience/education required
- add: jd_parsed_at
created_at
updated_at

**Interview**
id
application_id
interview_date
nterview_time
interview_type
location
interviewer
notes
results
created_at

**Document**
id
application_id
file_name
file_type
file_path
uploaded_at
- add: document_type (resume | cover_letter) ← you may already distinguish this by file_type, but explicit is safer
- add: parse_status (pending | parsed | failed)
- add: parsed_at

**MatchResult**  [NEW]
- id
- application_id (FK → Application)
- candidate_profile_id (FK → CandidateProfile)
- match_score
- strengths (JSON)
- missing_skills (JSON)
- career_gaps (JSON)
- recommendations (text)
- created_at
→ Feature 3 output. One row per application, so scores are historical, not overwritten each time.

**InterviewPrep**  [NEW]
- id
- application_id (FK → Application)
- questions (JSON: technical / behavioral / cv_based / job_specific, each with answer_guidance)
- created_at
→ Feature 4 output. Sits alongside Interview (the real scheduled ones), doesn't replace it.

**MockInterviewSession**  [NEW]
- id
- application_id (FK → Application)
- started_at / ended_at
- transcript (JSON: question, answer, follow_up, evaluation per turn)
- performance_report (JSON)
- created_at
→ Feature 5 output. This is the one with real state — a session needs to track turn-by-turn Q&A, not just a final result.

**Relationships**
User
└── has many Applications
Company 
└── has many Applications 
Application
├── belongs to one User
├── belongs to one Company
├── has many Interviews 
└── has many Documents
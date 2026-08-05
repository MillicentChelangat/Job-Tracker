**User**
id
first_name
last_name
email
password
created_at
updated_at

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
job_url 
salary
notes
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
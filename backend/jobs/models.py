from django.db import models
from django.contrib.auth.models import User


class Company(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='companies')
    name = models.CharField(max_length=200)
    website = models.URLField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    industry = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'Companies'

    def __str__(self):
        return self.name


class Application(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('interview', 'Interview'),
        ('offer', 'Offer'),
        ('rejected', 'Rejected'),
    ]

    EMPLOYMENT_TYPE_CHOICES = [
        ('full_time', 'Full-time'),
        ('part_time', 'Part-time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
    ]

    WORK_MODE_CHOICES = [
        ('remote', 'Remote'),
        ('onsite', 'On-site'),
        ('hybrid', 'Hybrid'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='applications')
    position = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    employment_type = models.CharField(max_length=20, choices=EMPLOYMENT_TYPE_CHOICES, blank=True)
    work_mode = models.CharField(max_length=20, choices=WORK_MODE_CHOICES, blank=True)
    date_applied = models.DateField()
    deadline = models.DateField(null=True, blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    job_url = models.URLField(blank=True)
    job_description = models.TextField(blank=True)
    salary = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.position} @ {self.company.name}"

class Document(models.Model):
    DOCUMENT_TYPE_CHOICES = [
        ('resume', 'Resume'),
        ('cover_letter', 'Cover Letter'),
    ]
    PARSE_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('parsed', 'Parsed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    application = models.ForeignKey(
        Application, on_delete=models.CASCADE, related_name='documents',
        null=True, blank=True,
    )
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES)
    file = models.FileField(upload_to='documents/%Y/%m/')
    file_name = models.CharField(max_length=255)
    parse_status = models.CharField(max_length=20, choices=PARSE_STATUS_CHOICES, default='pending')
    parsed_at = models.DateTimeField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.file_name} ({self.get_document_type_display()})"

class Interview(models.Model):
    INTERVIEW_TYPE_CHOICES = [
        ('phone', 'Phone Screen'),
        ('technical', 'Technical'),
        ('behavioral', 'Behavioral'),
        ('panel', 'Panel'),
        ('final', 'Final Round'),
        ('other', 'Other'),
    ]
    RESULT_CHOICES = [
        ('pending', 'Pending'),
        ('passed', 'Passed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interviews')
    interview_date = models.DateField()
    interview_time = models.TimeField(null=True, blank=True)
    interview_type = models.CharField(max_length=20, choices=INTERVIEW_TYPE_CHOICES, default='other')
    location = models.CharField(max_length=255, blank=True)
    interviewer = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    result = models.CharField(max_length=20, choices=RESULT_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['interview_date', 'interview_time']

    def __str__(self):
        return f"{self.get_interview_type_display()} — {self.application}"        
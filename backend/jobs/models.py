from django.db import models

class Job(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('interview', 'Interview'),
        ('offer', 'Offer'),
        ('rejected', 'Rejected'),
    ]

    company = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    applied_date = models.DateField()
    follow_up_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    job_url = models.URLField(blank=True)
    salary = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.role} @ {self.company}"
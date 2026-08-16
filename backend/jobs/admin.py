from django.contrib import admin
from .models import Company, Application, Document, Interview


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'industry', 'location', 'user']
    search_fields = ['name', 'industry']


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['position', 'company', 'status', 'date_applied', 'user']
    list_filter = ['status', 'employment_type', 'work_mode']
    search_fields = ['position', 'company__name']

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'document_type', 'user', 'application', 'parse_status', 'uploaded_at']
    list_filter = ['document_type', 'parse_status']
    search_fields = ['file_name']

@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ['application', 'interview_type', 'interview_date', 'result']
    list_filter = ['interview_type', 'result']
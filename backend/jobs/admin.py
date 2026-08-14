from django.contrib import admin
from .models import Company, Application


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'industry', 'location', 'user']
    search_fields = ['name', 'industry']


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['position', 'company', 'status', 'date_applied', 'user']
    list_filter = ['status', 'employment_type', 'work_mode']
    search_fields = ['position', 'company__name']
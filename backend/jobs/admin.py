from django.contrib import admin
from .models import Job

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['company', 'role', 'status', 'applied_date']
    list_filter = ['status']
    search_fields = ['company', 'role']

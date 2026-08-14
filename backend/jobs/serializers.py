from rest_framework import serializers
from .models import Company, Application
from django.contrib.auth.models import User


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'website', 'location', 'email', 'phone', 'industry', 'notes', 'created_at', 'updated_at']
        # 'user' is deliberately left out — it's set automatically from the logged-in user, not sent by the frontend


class ApplicationSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'company', 'company_name', 'position', 'status', 'employment_type',
            'work_mode', 'date_applied', 'deadline', 'follow_up_date', 'job_url',
            'job_description', 'salary', 'notes', 'created_at', 'updated_at',
        ]
        # 'user' left out for the same reason — set automatically, never trusted from the request


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
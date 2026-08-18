from rest_framework import serializers
from .models import Company, Application, Document, Interview, Profile, CandidateProfile
from django.contrib.auth.models import User
from django.utils import timezone


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'website', 'location', 'email', 'phone', 'industry', 'notes', 'created_at', 'updated_at']
        # 'user' is deliberately left out — it's set automatically from the logged-in user, not sent by the frontend


class ApplicationSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    interview_count = serializers.SerializerMethodField()
    next_interview_date = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id', 'company', 'company_name', 'position', 'status', 'employment_type',
            'work_mode', 'date_applied', 'deadline', 'follow_up_date', 'job_url',
            'job_description', 'salary', 'notes', 'created_at', 'updated_at',
            'interview_count', 'next_interview_date',
        ]

    def get_interview_count(self, obj):
        return obj.interviews.count()

    def get_next_interview_date(self, obj):
        upcoming = obj.interviews.filter(
            interview_date__gte=timezone.now().date()
        ).order_by('interview_date', 'interview_time').first()
        if not upcoming:
            return None
        return {
            'date': upcoming.interview_date,
            'time': upcoming.interview_time,
        }


class CandidateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateProfile
        fields = ['id', 'document', 'skills', 'education', 'experience', 'created_at']
        # 'user' and 'raw_extracted_text' left out — ownership is automatic,
        # and the raw text is only needed internally, not by the frontend


class DocumentSerializer(serializers.ModelSerializer):
    candidate_profile = CandidateProfileSerializer(read_only=True)

    class Meta:
        model = Document
        fields = [
            'id', 'application', 'document_type', 'file', 'file_name',
            'parse_status', 'parsed_at', 'uploaded_at', 'candidate_profile',
        ]
        read_only_fields = ['file_name', 'parse_status', 'parsed_at', 'uploaded_at']
        # 'user' is left out — set automatically from the logged-in user, same pattern as Company/Application


class InterviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interview
        fields = [
            'id', 'application', 'interview_date', 'interview_time', 'interview_type',
            'location', 'interviewer', 'notes', 'result', 'created_at',
        ]


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


class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'location', 'bio', 'created_at', 'updated_at']
from rest_framework import viewsets, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Count
from .models import Company, Application, Document, Interview
from .serializers import CompanySerializer, ApplicationSerializer, DocumentSerializer, InterviewSerializer, RegisterSerializer
from rest_framework.parsers import MultiPartParser, FormParser

class CompanyViewSet(viewsets.ModelViewSet):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'industry', 'location']

    def get_queryset(self):
        # Only ever return companies belonging to the logged-in user
        return Company.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Force the company to be owned by whoever is logged in — never trust a user field from the request
        serializer.save(user=self.request.user)


class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['position', 'company__name', 'notes']
    ordering_fields = ['date_applied', 'created_at', 'status', 'deadline']

    def get_queryset(self):
        return Application.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = Application.objects.filter(user=request.user)
        status_counts = qs.values('status').annotate(count=Count('status'))
        total = qs.count()
        upcoming_followups = qs.filter(
            follow_up_date__isnull=False
        ).order_by('follow_up_date')[:5]

        return Response({
            'total': total,
            'by_status': {item['status']: item['count'] for item in status_counts},
            'upcoming_followups': ApplicationSerializer(upcoming_followups, many=True).data,
        })




class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # required to accept actual file uploads, not just JSON

    def get_queryset(self):
        qs = Document.objects.filter(user=self.request.user)
        application_id = self.request.query_params.get('application')
        if application_id:
            qs = qs.filter(application_id=application_id)
        return qs

    def perform_create(self, serializer):
        uploaded_file = self.request.FILES.get('file')
        serializer.save(
            user=self.request.user,
            file_name=uploaded_file.name if uploaded_file else '',
        )


class InterviewViewSet(viewsets.ModelViewSet):
    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Ownership flows through application.user, since Interview has no direct user field
        qs = Interview.objects.filter(application__user=self.request.user)
        application_id = self.request.query_params.get('application')
        if application_id:
            qs = qs.filter(application_id=application_id)
        return qs

    def perform_create(self, serializer):
        application = serializer.validated_data['application']
        if application.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You don't own this application.")
        serializer.save()

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email and password are required.'}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already in use.'}, status=400)

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password
    )
    return Response({'email': user.email}, status=201)
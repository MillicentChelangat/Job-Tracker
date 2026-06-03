from rest_framework import viewsets, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Count
from .models import Job
from .serializers import JobSerializer

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['company', 'role', 'location']
    ordering_fields = ['applied_date', 'created_at', 'status']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        status_counts = Job.objects.values('status').annotate(count=Count('status'))
        total = Job.objects.count()
        upcoming_followups = Job.objects.filter(
            follow_up_date__isnull=False
        ).order_by('follow_up_date')[:5]

        return Response({
            'total': total,
            'by_status': {item['status']: item['count'] for item in status_counts},
            'upcoming_followups': JobSerializer(upcoming_followups, many=True).data,
        })

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
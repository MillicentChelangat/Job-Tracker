
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, ApplicationViewSet, DocumentViewSet, InterviewViewSet, ProfileView, register

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'interviews', InterviewViewSet, basename='interview')



urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register),
    path('profile/', ProfileView.as_view()),

]
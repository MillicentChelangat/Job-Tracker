
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, ApplicationViewSet, register

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register),
]
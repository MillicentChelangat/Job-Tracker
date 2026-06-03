
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobViewSet, register  

router = DefaultRouter()
router.register(r'jobs', JobViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register),  
]
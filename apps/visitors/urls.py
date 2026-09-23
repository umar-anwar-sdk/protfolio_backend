from django.urls import path

from .views import VisitorTrackingCreateAPIView

urlpatterns = [
    path('track/', VisitorTrackingCreateAPIView.as_view(), name='visitor-track'),
]

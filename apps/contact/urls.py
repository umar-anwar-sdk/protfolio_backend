from django.urls import path

from .views import ContactAPIView, ContactInfoAPIView, ContactMessageCreateAPIView

urlpatterns = [
    path('contact/', ContactAPIView.as_view(), name='contact'),
    path('contact/messages/', ContactMessageCreateAPIView.as_view(), name='contact-message-create'),

    path('v1/contact/', ContactAPIView.as_view(), name='contact-v1'),
    path('v1/contact/messages/', ContactMessageCreateAPIView.as_view(), name='contact-message-create-v1'),
    path('v1/contact-info/', ContactAPIView.as_view(), name='contact-info-legacy'),
]

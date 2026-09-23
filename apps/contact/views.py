import os

from django.conf import settings
from django.core.mail import EmailMessage
from django.http import Http404
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import ContactInfo, ContactMessage
from .serializers import ContactInfoSerializer, ContactMessageSerializer


def get_active_contact_info():
    return ContactInfo.objects.filter(is_active=True).first()


def build_contact_email_body(message):
    submitted_at = message.created_at.strftime('%Y-%m-%d %H:%M:%S %Z')
    return (
        f"Sender Name: {message.name}\n"
        f"Sender Email: {message.email}\n"
        f"Subject: {message.subject}\n"
        f"Submission Time: {submitted_at}\n\n"
        f"Message:\n{message.message}"
    )


def send_contact_email(message):
    owner_email = os.getenv('PORTFOLIO_OWNER_EMAIL') or getattr(settings, 'DEFAULT_FROM_EMAIL', '') or 'admin@example.com'
    email = EmailMessage(
        subject=f'Portfolio inquiry: {message.subject}',
        body=build_contact_email_body(message),
        from_email=os.getenv('EMAIL_HOST_USER') or settings.DEFAULT_FROM_EMAIL,
        to=[owner_email],
        reply_to=[message.email],
    )
    email.send(fail_silently=False)


class PublicPortfolioAPIViewMixin:
    permission_classes = [permissions.AllowAny]


class ContactAPIView(PublicPortfolioAPIViewMixin, generics.GenericAPIView):
    queryset = ContactInfo.objects.filter(is_active=True)
    serializer_class = ContactInfoSerializer

    def get(self, request, *args, **kwargs):
        obj = get_active_contact_info()
        if not obj:
            raise Http404('No active contact information available.')
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        serializer = ContactMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()

        try:
            send_contact_email(message)
        except Exception as exc:
            return Response(
                {
                    'detail': 'Message saved successfully, but the email notification could not be sent.',
                    'error': str(exc),
                    'message_id': message.id,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                'detail': 'Message sent successfully.',
                'message_id': message.id,
            },
            status=status.HTTP_201_CREATED,
        )


class ContactInfoAPIView(PublicPortfolioAPIViewMixin, generics.RetrieveAPIView):
    queryset = ContactInfo.objects.filter(is_active=True)
    serializer_class = ContactInfoSerializer

    def get_object(self):
        obj = self.queryset.first()
        if not obj:
            raise Http404('No active contact information available.')
        return obj


class ContactMessageCreateAPIView(PublicPortfolioAPIViewMixin, generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def perform_create(self, serializer):
        message = serializer.save()
        try:
            send_contact_email(message)
        except Exception as exc:
            return {
                'message': message,
                'email_error': str(exc),
            }
        return {'message': message}

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = self.perform_create(serializer)
        message = result['message']
        if 'email_error' in result:
            return Response(
                {
                    'detail': 'Message saved successfully, but the email notification could not be sent.',
                    'error': result['email_error'],
                    'message_id': message.id,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {'detail': 'Message sent successfully.', 'message_id': message.id},
            status=status.HTTP_201_CREATED,
        )

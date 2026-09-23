from django.http import FileResponse, Http404
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import AboutHighlight, CVDownloadLog, Education, Experience, Profile, Skill, SocialLink, Testimonial
from .serializers import (
    AboutHighlightSerializer,
    AboutSerializer,
    EducationSerializer,
    ExperienceSerializer,
    HeroSerializer,
    ProfileSerializer,
    SkillSerializer,
    SocialLinkSerializer,
    TestimonialSerializer,
)


def get_first_published_profile():
    return Profile.objects.filter(is_published=True).first()


def get_profile_for_view(serializer_class, error_message):
    profile = get_first_published_profile()
    if not profile:
        raise Http404(error_message)
    return profile


def create_cv_download_log(request):
    ip_address = request.META.get('REMOTE_ADDR') or request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
    referrer = request.META.get('HTTP_REFERER') or None

    return CVDownloadLog.objects.create(
        ip_address=ip_address,
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        referrer=referrer,
    )


def build_cv_download_response(profile):
    filename = profile.cv_file.name.split('/')[-1]
    response = FileResponse(
        profile.cv_file.open('rb'),
        as_attachment=True,
        filename=filename,
    )
    response['X-Download-Tracked'] = 'true'
    return response


class PublicPortfolioAPIViewMixin:
    permission_classes = [permissions.AllowAny]


class ProfileAPIView(PublicPortfolioAPIViewMixin, generics.RetrieveAPIView):
    queryset = Profile.objects.filter(is_published=True)
    serializer_class = ProfileSerializer

    def get_object(self):
        return get_profile_for_view(ProfileSerializer, 'No published profile available.')


class HeroAPIView(PublicPortfolioAPIViewMixin, generics.RetrieveAPIView):
    queryset = Profile.objects.filter(is_published=True)
    serializer_class = HeroSerializer

    def get_object(self):
        return get_profile_for_view(HeroSerializer, 'No published hero content available.')


class AboutAPIView(PublicPortfolioAPIViewMixin, generics.RetrieveAPIView):
    queryset = Profile.objects.filter(is_published=True)
    serializer_class = AboutSerializer

    def get_object(self):
        return get_profile_for_view(AboutSerializer, 'No published about content available.')


class SkillListAPIView(PublicPortfolioAPIViewMixin, generics.ListAPIView):
    queryset = Skill.objects.filter(is_active=True)
    serializer_class = SkillSerializer


class SocialLinkListAPIView(PublicPortfolioAPIViewMixin, generics.ListAPIView):
    queryset = SocialLink.objects.filter(is_active=True)
    serializer_class = SocialLinkSerializer


class AboutHighlightListAPIView(PublicPortfolioAPIViewMixin, generics.ListAPIView):
    queryset = AboutHighlight.objects.all()
    serializer_class = AboutHighlightSerializer


class ExperienceListAPIView(PublicPortfolioAPIViewMixin, generics.ListAPIView):
    queryset = Experience.objects.filter(is_active=True)
    serializer_class = ExperienceSerializer


class EducationListAPIView(PublicPortfolioAPIViewMixin, generics.ListAPIView):
    queryset = Education.objects.filter(is_active=True)
    serializer_class = EducationSerializer


class TestimonialListAPIView(PublicPortfolioAPIViewMixin, generics.ListAPIView):
    queryset = Testimonial.objects.filter(is_active=True)
    serializer_class = TestimonialSerializer


class CVDownloadAPIView(PublicPortfolioAPIViewMixin, generics.GenericAPIView):
    queryset = Profile.objects.filter(is_published=True)

    def get(self, request, *args, **kwargs):
        profile = self.get_queryset().first()
        if not profile or not profile.cv_file:
            raise Http404('CV file not available.')

        create_cv_download_log(request)
        return build_cv_download_response(profile)

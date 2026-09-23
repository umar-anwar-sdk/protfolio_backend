from django.urls import path

from .views import (
    AboutAPIView,
    AboutHighlightListAPIView,
    CVDownloadAPIView,
    EducationListAPIView,
    ExperienceListAPIView,
    HeroAPIView,
    ProfileAPIView,
    SkillListAPIView,
    SocialLinkListAPIView,
    TestimonialListAPIView,
)

urlpatterns = [
    path('profile/', ProfileAPIView.as_view(), name='profile'),
    path('hero/', HeroAPIView.as_view(), name='hero'),
    path('about/', AboutAPIView.as_view(), name='about'),
    path('skills/', SkillListAPIView.as_view(), name='skills'),
    path('social-links/', SocialLinkListAPIView.as_view(), name='social-links'),
    path('highlights/', AboutHighlightListAPIView.as_view(), name='highlights'),
    path('experience/', ExperienceListAPIView.as_view(), name='experience'),
    path('education/', EducationListAPIView.as_view(), name='education'),
    path('testimonials/', TestimonialListAPIView.as_view(), name='testimonials'),
    path('cv/download/', CVDownloadAPIView.as_view(), name='cv-download'),

    path('v1/profile/', ProfileAPIView.as_view(), name='profile-v1'),
    path('v1/hero/', HeroAPIView.as_view(), name='hero-v1'),
    path('v1/about/', AboutAPIView.as_view(), name='about-v1'),
    path('v1/skills/', SkillListAPIView.as_view(), name='skills-v1'),
    path('v1/social-links/', SocialLinkListAPIView.as_view(), name='social-links-v1'),
    path('v1/highlights/', AboutHighlightListAPIView.as_view(), name='highlights-v1'),
    path('v1/experience/', ExperienceListAPIView.as_view(), name='experience-v1'),
    path('v1/education/', EducationListAPIView.as_view(), name='education-v1'),
    path('v1/testimonials/', TestimonialListAPIView.as_view(), name='testimonials-v1'),
    path('v1/cv/download/', CVDownloadAPIView.as_view(), name='cv-download-v1'),
]

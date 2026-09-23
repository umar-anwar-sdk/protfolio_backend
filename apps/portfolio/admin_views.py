from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from apps.accounts.permissions import IsAdminAuthenticated
from apps.contact.models import ContactInfo, ContactMessage
from apps.contact.serializers import AdminContactMessageSerializer, ContactInfoSerializer
from apps.portfolio.models import AboutHighlight, CVDownloadLog, Education, Experience, Profile, Skill, SocialLink, Testimonial
from apps.portfolio.serializers import AboutHighlightSerializer, EducationSerializer, ExperienceSerializer, ProfileSerializer, SkillSerializer, SocialLinkSerializer, TestimonialSerializer
from apps.projects.models import Project, ProjectImage, ProjectSection, Technology
from apps.projects.serializers import ProjectImageSerializer, ProjectSectionSerializer, ProjectSerializer, TechnologySerializer
from apps.visitors.models import VisitorTracker


class AdminDashboardOverviewAPIView(generics.GenericAPIView):
    permission_classes = [IsAdminAuthenticated]

    def get(self, request, *args, **kwargs):
        today = timezone.localdate()
        today_start = timezone.datetime.combine(today, timezone.datetime.min.time()).replace(tzinfo=timezone.get_current_timezone())
        today_end = timezone.datetime.combine(today, timezone.datetime.max.time()).replace(tzinfo=timezone.get_current_timezone())

        overview = {
            'total_projects': Project.objects.filter(is_published=True).count(),
            'total_visitors': VisitorTracker.objects.count(),
            'today_visitors': VisitorTracker.objects.filter(created_at__range=(today_start, today_end)).count(),
            'total_messages': ContactMessage.objects.count(),
            'unread_messages': ContactMessage.objects.filter(status='new').count(),
            'cv_downloads': CVDownloadLog.objects.count(),
        }
        return Response(overview)


class AdminProfileAPIView(generics.ListCreateAPIView):
    queryset = Profile.objects.all().order_by('-updated_at')
    serializer_class = ProfileSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminProfileDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Profile.objects.all().order_by('-updated_at')
    serializer_class = ProfileSerializer
    permission_classes = [IsAdminAuthenticated]


# AdminHeroAPIView removed — Hero is managed via Profile


class AdminAboutAPIView(generics.ListCreateAPIView):
    queryset = Profile.objects.all().order_by('-updated_at')
    serializer_class = ProfileSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminSkillAPIView(generics.ListCreateAPIView):
    queryset = Skill.objects.all().order_by('sort_order', 'name')
    serializer_class = SkillSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminSkillDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Skill.objects.all().order_by('sort_order', 'name')
    serializer_class = SkillSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminSocialLinkAPIView(generics.ListCreateAPIView):
    queryset = SocialLink.objects.all().order_by('sort_order', 'platform')
    serializer_class = SocialLinkSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminSocialLinkDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SocialLink.objects.all().order_by('sort_order', 'platform')
    serializer_class = SocialLinkSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminAboutHighlightAPIView(generics.ListCreateAPIView):
    queryset = AboutHighlight.objects.all().order_by('sort_order', 'title')
    serializer_class = AboutHighlightSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminAboutHighlightDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AboutHighlight.objects.all().order_by('sort_order', 'title')
    serializer_class = AboutHighlightSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminExperienceAPIView(generics.ListCreateAPIView):
    queryset = Experience.objects.all().order_by('sort_order', '-current', 'company')
    serializer_class = ExperienceSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminExperienceDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Experience.objects.all().order_by('sort_order', '-current', 'company')
    serializer_class = ExperienceSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminEducationAPIView(generics.ListCreateAPIView):
    queryset = Education.objects.all().order_by('sort_order', '-end_date', 'institution')
    serializer_class = EducationSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminEducationDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Education.objects.all().order_by('sort_order', '-end_date', 'institution')
    serializer_class = EducationSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminTestimonialAPIView(generics.ListCreateAPIView):
    queryset = Testimonial.objects.all().order_by('sort_order', 'author')
    serializer_class = TestimonialSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminTestimonialDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Testimonial.objects.all().order_by('sort_order', 'author')
    serializer_class = TestimonialSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminProjectAPIView(generics.ListCreateAPIView):
    queryset = Project.objects.all().order_by('-featured', '-created_at')
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminProjectDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all().order_by('-created_at')
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminAuthenticated]
    lookup_field = 'slug'


class AdminTechnologyAPIView(generics.ListCreateAPIView):
    queryset = Technology.objects.all().order_by('sort_order', 'name')
    serializer_class = TechnologySerializer
    permission_classes = [IsAdminAuthenticated]


class AdminTechnologyDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Technology.objects.all().order_by('sort_order', 'name')
    serializer_class = TechnologySerializer
    permission_classes = [IsAdminAuthenticated]


class AdminProjectImageAPIView(generics.ListCreateAPIView):
    queryset = ProjectImage.objects.all().order_by('project', 'order', 'id')
    serializer_class = ProjectImageSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminProjectImageDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProjectImage.objects.all().order_by('project', 'order', 'id')
    serializer_class = ProjectImageSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminProjectSectionAPIView(generics.ListCreateAPIView):
    queryset = ProjectSection.objects.all().order_by('project', 'order', 'id')
    serializer_class = ProjectSectionSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminProjectSectionDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ProjectSection.objects.all().order_by('project', 'order', 'id')
    serializer_class = ProjectSectionSerializer
    permission_classes = [IsAdminAuthenticated]


class AdminVisitorAPIView(generics.ListAPIView):
    queryset = VisitorTracker.objects.all().order_by('-created_at')
    serializer_class = None
    permission_classes = [IsAdminAuthenticated]

    def get(self, request, *args, **kwargs):
        visitors = list(
            VisitorTracker.objects.all().order_by('-created_at').values(
                'id',
                'visitor_id',
                'ip_address',
                'user_agent',
                'path',
                'referrer',
                'gps_permission_status',
                'gps_location',
                'approx_ip_location',
                'created_at',
            )
        )
        return Response(visitors)


class AdminContactInfoAPIView(generics.GenericAPIView):
    """Manage the single set of contact details displayed on the portfolio."""

    serializer_class = ContactInfoSerializer
    permission_classes = [IsAdminAuthenticated]

    def get_object(self):
        return ContactInfo.objects.order_by('-updated_at', '-id').first()

    def get(self, request, *args, **kwargs):
        contact_info = self.get_object()
        if not contact_info:
            return Response({'detail': 'No contact information has been created yet.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(self.get_serializer(contact_info).data)

    def post(self, request, *args, **kwargs):
        if self.get_object():
            return Response({'detail': 'Contact information already exists. Update the existing record instead.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def patch(self, request, *args, **kwargs):
        contact_info = self.get_object()
        if not contact_info:
            return Response({'detail': 'No contact information has been created yet.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(contact_info, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AdminMessageAPIView(generics.ListAPIView):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    permission_classes = [IsAdminAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = AdminContactMessageSerializer(self.get_queryset(), many=True)
        return Response(serializer.data)


class AdminMessageDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = AdminContactMessageSerializer
    permission_classes = [IsAdminAuthenticated]

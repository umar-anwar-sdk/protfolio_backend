from rest_framework import generics

from .models import Project
from .serializers import ProjectSerializer


class ProjectListAPIView(generics.ListAPIView):
    queryset = Project.objects.filter(is_published=True)
    serializer_class = ProjectSerializer


class ProjectDetailAPIView(generics.RetrieveAPIView):
    queryset = Project.objects.filter(is_published=True)
    serializer_class = ProjectSerializer
    lookup_field = 'slug'


from django.contrib import admin
from .models import Profile, SocialLink, Skill, AboutHighlight, Experience, Education, Testimonial
from apps.projects.models import Project, ProjectImage, Technology, ProjectSection



admin.site.register(Profile)
admin.site.register(SocialLink)
admin.site.register(Skill)
admin.site.register(AboutHighlight)
admin.site.register(Experience)
admin.site.register(Education)
admin.site.register(Testimonial)
admin.site.register(Project)
admin.site.register(ProjectImage)
admin.site.register(Technology)
admin.site.register(ProjectSection)
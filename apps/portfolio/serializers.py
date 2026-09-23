import os

from rest_framework import serializers

from .models import AboutHighlight, Education, Experience, Profile, Skill, SocialLink, Testimonial


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'id',
            'full_name',
            'role',
            'headline',
            'intro',
            # 'about' is managed separately via AboutHighlight; Profile model has no 'about' field
            'mission_quote',
            'profile_image',
            'background_image',
            'cv_file',
            'years_experience',
            'availability_text',
            'is_available',
            'is_published',
            'updated_at',
        ]

    def validate_profile_image(self, image):
        if image and image.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('Profile image must be 5MB or smaller.')
        return image

    def validate_background_image(self, image):
        if image and image.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('Background image must be 5MB or smaller.')
        return image

    def validate_cv_file(self, file):
        if file:
            valid_extensions = {'.pdf'}
            ext = os.path.splitext(file.name)[1].lower()
            if ext not in valid_extensions:
                raise serializers.ValidationError('Only PDF files are allowed for the CV.')
            if file.size > 10 * 1024 * 1024:
                raise serializers.ValidationError('CV file must be 10MB or smaller.')
        return file


class HeroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'full_name', 'role', 'headline', 'intro', 'profile_image', 'background_image', 'years_experience', 'availability_text', 'is_available']


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ['id', 'platform', 'url', 'is_active', 'sort_order']


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'sort_order', 'is_active']


class AboutHighlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutHighlight
        fields = ['id', 'about', 'title', 'description', 'icon_name', 'sort_order', 'is_active']


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id', 'period', 'role', 'company', 'description', 'current', 'sort_order', 'is_active']


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['id', 'institution', 'degree', 'description', 'start_date', 'end_date', 'sort_order', 'is_active']


class AboutSerializer(serializers.ModelSerializer):
    highlights = serializers.SerializerMethodField()

    class Meta:
        # About content is composed from highlights and profile mission quote
        model = Profile
        fields = ['id', 'mission_quote', 'highlights']

    def get_highlights(self, obj):
        return AboutHighlightSerializer(AboutHighlight.objects.all(), many=True).data


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['id', 'quote', 'author', 'role', 'avatar', 'is_active', 'sort_order']

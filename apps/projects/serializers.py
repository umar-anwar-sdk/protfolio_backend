import os

from rest_framework import serializers

from .models import Project, ProjectImage, ProjectSection, Technology


class TechnologySerializer(serializers.ModelSerializer):
    class Meta:
        model = Technology
        fields = ['id', 'name', 'slug', 'icon', 'description']


class ProjectImageSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(), write_only=True, required=False)

    class Meta:
        model = ProjectImage
        fields = ['id', 'project', 'image', 'title', 'description', 'order']

    def validate_image(self, image):
        if not image:
            raise serializers.ValidationError('Image is required.')

        valid_extensions = {'.jpg', '.jpeg', '.png', '.webp'}
        ext = os.path.splitext(image.name)[1].lower()
        if ext not in valid_extensions:
            raise serializers.ValidationError('Only JPG, JPEG, PNG, and WEBP files are allowed.')

        if image.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('Image file size must be 5MB or smaller.')
        return image


class ProjectSectionSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(queryset=Project.objects.all(), write_only=True, required=False)

    class Meta:
        model = ProjectSection
        fields = ['id', 'project', 'heading', 'content', 'image', 'order']

    def validate_image(self, image):
        if image and image.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('Section image must be 5MB or smaller.')
        return image


class ProjectSerializer(serializers.ModelSerializer):
    technologies = TechnologySerializer(many=True, read_only=True)
    images = ProjectImageSerializer(many=True, read_only=True)
    sections = ProjectSectionSerializer(many=True, read_only=True)
    # Accept technology IDs when creating/updating a project
    technology_ids = serializers.PrimaryKeyRelatedField(queryset=Technology.objects.all(), many=True, write_only=True, source='technologies', required=False)

    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'slug',
            'short_description',
            'overview',
            'description',
            'features',
            'development_details',
            'thumbnail_image',
            'project_url',
            'github_url',
            'featured',
            'is_published',
            'created_at',
            'updated_at',
            'technologies',
            'technology_ids',
            'images',
            'sections',
        ]

    def validate_thumbnail_image(self, image):
        if image and image.size > 5 * 1024 * 1024:
            raise serializers.ValidationError('Thumbnail image must be 5MB or smaller.')
        return image

    def create(self, validated_data):
        technologies = validated_data.pop('technologies', None)
        project = Project.objects.create(**validated_data)
        if technologies is not None:
            project.technologies.set(technologies)
        return project

    def update(self, instance, validated_data):
        technologies = validated_data.pop('technologies', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if technologies is not None:
            instance.technologies.set(technologies)
        return instance


from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Project, ProjectHighlight, ProjectImage, ProjectSection, Technology


class ProjectAPITests(APITestCase):
    def make_image_file(self, name):
        image_bytes = BytesIO()
        Image.new('RGB', (1, 1), 'blue').save(image_bytes, format='PNG')
        return SimpleUploadedFile(name, image_bytes.getvalue(), content_type='image/png')

    def setUp(self):
        self.tech = Technology.objects.create(name='React', slug='react', description='Frontend library')
        self.project = Project.objects.create(
            title='Portfolio Redesign',
            slug='portfolio-redesign',
            short_description='A polished portfolio site for a software engineer.',
            description='A modern portfolio for showcasing product work and experience.',
            overview='Overview text',
            features='Fast and responsive',
            development_details='Built with Django and React.',
            project_url='https://example.com',
            github_url='https://github.com/example/project',
            featured=True,
            is_published=True,
        )
        self.project.technologies.add(self.tech)
        ProjectImage.objects.create(
            project=self.project,
            image=SimpleUploadedFile('img.jpg', b'file-content', content_type='image/jpeg'),
            title='Dashboard',
            order=1,
        )
        ProjectSection.objects.create(
            project=self.project,
            heading='Challenges',
            content='We needed a clean design language and a fast system.',
            order=1,
        )

    def test_list_returns_published_projects(self):
        response = self.client.get('/api/projects/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['slug'], 'portfolio-redesign')

    def test_detail_returns_project_by_slug(self):
        response = self.client.get('/api/projects/portfolio-redesign/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Portfolio Redesign')
        self.assertEqual(response.data['technologies'][0]['slug'], 'react')
        self.assertTrue(response.data['images'])
        self.assertTrue(response.data['sections'])

    def test_detail_returns_404_for_missing_slug(self):
        response = self.client.get('/api/projects/does-not-exist/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_list_rejects_non_get_requests(self):
        response = self.client.post('/api/projects/')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_admin_updates_the_project_selected_by_slug(self):
        other_project = Project.objects.create(
            title='Separate Project',
            slug='separate-project',
            short_description='A distinct project.',
            description='This project must remain unchanged.',
        )
        admin = get_user_model().objects.create_user(
            username='admin-user',
            password='safe-password',
            is_staff=True,
        )
        self.client.force_authenticate(admin)

        response = self.client.patch(
            '/api/admin/projects/portfolio-redesign/',
            {'title': 'Updated Portfolio Redesign'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        other_project.refresh_from_db()
        self.assertEqual(self.project.title, 'Updated Portfolio Redesign')
        self.assertEqual(other_project.title, 'Separate Project')

    def test_admin_project_detail_does_not_accept_a_database_id_as_a_slug(self):
        admin = get_user_model().objects.create_user(
            username='admin-user',
            password='safe-password',
            is_staff=True,
        )
        self.client.force_authenticate(admin)

        response = self.client.patch(
            f'/api/admin/projects/{self.project.id}/',
            {'title': 'Should Not Update'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.project.refresh_from_db()
        self.assertEqual(self.project.title, 'Portfolio Redesign')

    def test_admin_updates_a_main_image_and_related_project_data_separately(self):
        project_id = self.project.id
        admin = get_user_model().objects.create_user(
            username='admin-user',
            password='safe-password',
            is_staff=True,
        )
        self.client.force_authenticate(admin)

        update_response = self.client.patch(
            '/api/admin/projects/portfolio-redesign/',
            {
                'title': 'Portfolio Redesign with New Image',
                'technology_ids': [self.tech.id],
                'thumbnail_image': self.make_image_file('new-thumbnail.png'),
            },
            format='multipart',
        )
        gallery_response = self.client.post(
            '/api/admin/project-images/',
            {
                'project': self.project.id,
                'image': self.make_image_file('gallery.png'),
            },
            format='multipart',
        )
        section_response = self.client.post(
            '/api/admin/project-sections/',
            {
                'project': self.project.id,
                'heading': 'Updated section',
                'content': 'Related data is managed by its own endpoint.',
                'order': 2,
            },
            format='json',
        )

        self.assertEqual(update_response.status_code, status.HTTP_200_OK, update_response.data)
        self.assertEqual(gallery_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(section_response.status_code, status.HTTP_201_CREATED)
        self.project.refresh_from_db()
        self.assertEqual(self.project.id, project_id)
        self.assertEqual(self.project.title, 'Portfolio Redesign with New Image')
        self.assertIn('new-thumbnail', self.project.thumbnail_image.name)
        self.assertTrue(self.project.thumbnail_image.name.endswith('.png'))
        self.assertEqual(self.project.images.count(), 2)
        self.assertEqual(self.project.sections.count(), 2)

    def test_admin_saves_project_sections_incrementally_without_duplicates(self):
        admin = get_user_model().objects.create_user(
            username='admin-user',
            password='safe-password',
            is_staff=True,
        )
        self.client.force_authenticate(admin)

        create_response = self.client.post(
            '/api/admin/projects/',
            {
                'title': 'Incremental Project',
                'slug': 'incremental-project',
                'short_description': 'Created with basic information only.',
                'overview': 'The overview can be saved before related sections.',
                'description': 'Main project description.',
                'thumbnail_image': self.make_image_file('incremental-main.png'),
            },
            format='multipart',
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED, create_response.data)
        project_id = create_response.data['id']
        self.assertEqual(create_response.data['features'], '')
        self.assertEqual(create_response.data['highlights'], [])
        self.assertEqual(create_response.data['images'], [])
        self.assertEqual(create_response.data['sections'], [])

        update_response = self.client.patch(
            '/api/admin/projects/incremental-project/',
            {
                'technology_ids': [self.tech.id],
                'features': 'Responsive layout\nAccessible controls',
                'project_url': 'https://incremental.example.com',
                'github_url': 'https://github.com/example/incremental',
                'featured': True,
                'is_published': True,
            },
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK, update_response.data)

        highlight_responses = [
            self.client.post(
                '/api/admin/project-highlights/',
                {'project': project_id, 'icon': 'clock', 'value': '24/7', 'title': title, 'description': 'Project metric.', 'order': order},
                format='json',
            )
            for order, title in enumerate(('Availability', 'Support'))
        ]
        gallery_responses = [
            self.client.post(
                '/api/admin/project-images/',
                {'project': project_id, 'image': self.make_image_file(f'gallery-{order}.png'), 'order': order},
                format='multipart',
            )
            for order in range(2)
        ]
        section_responses = [
            self.client.post(
                '/api/admin/project-sections/',
                {
                    'project': project_id,
                    'heading': f'Section {order}',
                    'subtitle': f'Label {order}',
                    'content': f'Content {order}',
                    'layout_type': 'image_text_right',
                    'order': order,
                },
                format='json',
            )
            for order in range(3)
        ]

        self.assertTrue(all(response.status_code == status.HTTP_201_CREATED for response in highlight_responses))
        self.assertTrue(all(response.status_code == status.HTTP_201_CREATED for response in gallery_responses))
        self.assertTrue(all(response.status_code == status.HTTP_201_CREATED for response in section_responses))

        section_id = section_responses[1].data['id']
        section_update = self.client.patch(
            f'/api/admin/project-sections/{section_id}/',
            {'heading': 'Updated Section 1', 'content': 'Updated only this section.'},
            format='json',
        )
        self.assertEqual(section_update.status_code, status.HTTP_200_OK, section_update.data)

        detail_response = self.client.get('/api/projects/incremental-project/')
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual([item['heading'] for item in detail_response.data['sections']], ['Section 0', 'Updated Section 1', 'Section 2'])
        self.assertEqual([item['title'] for item in detail_response.data['highlights']], ['Availability', 'Support'])
        self.assertEqual(len(detail_response.data['images']), 2)
        self.assertEqual(detail_response.data['features'], 'Responsive layout\nAccessible controls')
        self.assertEqual(detail_response.data['technologies'][0]['id'], self.tech.id)

        self.client.delete(f"/api/admin/project-highlights/{highlight_responses[0].data['id']}/")
        self.client.delete(f"/api/admin/project-images/{gallery_responses[0].data['id']}/")
        self.client.delete(f'/api/admin/project-sections/{section_id}/')

        project = Project.objects.get(pk=project_id)
        self.assertEqual(project.highlights.count(), 1)
        self.assertEqual(project.images.count(), 1)
        self.assertEqual(project.sections.count(), 2)
        self.assertIn('incremental-main', project.thumbnail_image.name)
        self.assertTrue(project.thumbnail_image.name.endswith('.png'))
        self.assertEqual(Project.objects.filter(slug='incremental-project').count(), 1)

    def test_project_detail_exposes_section_layout_and_highlights(self):
        ProjectHighlight.objects.create(
            project=self.project,
            value='80h',
            title='Standby Time',
            description='Long battery life.',
            order=1,
        )
        ProjectSection.objects.create(
            project=self.project,
            heading='Immersive Sound',
            subtitle='Audio',
            content='Experience clarity and depth.',
            layout_type='image_text_right',
            order=2,
        )

        response = self.client.get('/api/projects/portfolio-redesign/')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['highlights'][0]['title'], 'Standby Time')
        self.assertEqual(response.data['sections'][1]['layout_type'], 'image_text_right')
        self.assertEqual(response.data['sections'][1]['subtitle'], 'Audio')

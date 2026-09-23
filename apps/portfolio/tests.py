from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from .models import AboutHighlight, Education, Experience, Profile, Skill, SocialLink, Testimonial
from .serializers import ProfileSerializer


class PortfolioAPITests(APITestCase):
    def setUp(self):
        self.profile = Profile.objects.create(
            full_name='Ada Lovelace',
            role='Senior Full-Stack Developer',
            headline='Building useful digital experiences.',
            intro='I design and build software that feels fast and intuitive.',
            mission_quote='Code should make life easier.',
            years_experience=7,
            availability_text='Available for select projects',
            is_available=True,
            is_published=True,
        )
        self.profile.cv_file = SimpleUploadedFile('resume.pdf', b'pdf-content', content_type='application/pdf')
        self.profile.save(update_fields=['cv_file'])

        Skill.objects.create(name='Django', sort_order=1, is_active=True)
        Skill.objects.create(name='React', sort_order=2, is_active=True)
        SocialLink.objects.create(platform='github', url='https://github.com/example', sort_order=1, is_active=True)
        AboutHighlight.objects.create(title='Product Mindset', description='I focus on shipping useful things.', icon_name='sparkles', sort_order=1)
        Experience.objects.create(
            period='2022 - Present',
            role='Senior Engineer',
            company='Northstar Labs',
            description='Leading API and frontend work for product teams.',
            current=True,
            sort_order=1,
            is_active=True,
        )
        Education.objects.create(
            institution='University of Technology',
            degree='BSc Computer Science',
            description='Focused on software engineering.',
            start_date='2014-09-01',
            end_date='2018-06-01',
            sort_order=1,
            is_active=True,
        )
        Testimonial.objects.create(
            quote='Ada brings clarity and momentum to every project.',
            author='Maya Chen',
            role='Product Lead',
            sort_order=1,
            is_active=True,
        )

    def test_profile_endpoint_returns_public_data(self):
        response = self.client.get('/api/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'Ada Lovelace')
        self.assertEqual(response.data['role'], 'Senior Full-Stack Developer')

    def test_about_endpoint_returns_highlights(self):
        response = self.client.get('/api/about/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('highlights', response.data)
        self.assertTrue(response.data['highlights'])

    def test_skills_endpoint_returns_active_skills(self):
        response = self.client.get('/api/skills/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_experience_and_education_endpoints(self):
        response = self.client.get('/api/experience/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

        response = self.client.get('/api/education/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_cv_download_returns_file(self):
        response = self.client.get('/api/cv/download/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Content-Disposition', response.headers)
        self.assertIn('attachment', response.headers['Content-Disposition'])

    def test_testimonials_endpoint(self):
        response = self.client.get('/api/testimonials/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_profile_serializer_rejects_non_pdf_cv(self):
        payload = {
            'full_name': 'Ada Lovelace',
            'role': 'Senior Full-Stack Developer',
            'headline': 'Building useful digital experiences.',
            'intro': 'I design and build software that feels fast and intuitive.',
            'years_experience': 7,
            'availability_text': 'Available for select projects',
            'is_available': True,
            'is_published': True,
            'cv_file': SimpleUploadedFile('resume.docx', b'not a pdf', content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
        }

        serializer = ProfileSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn('cv_file', serializer.errors)

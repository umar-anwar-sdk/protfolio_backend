import os
from io import BytesIO

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.contact.models import ContactInfo, ContactMessage
from apps.portfolio.models import AboutHighlight, Education, Experience, Profile, Skill, SocialLink, Testimonial
from apps.projects.models import Project, ProjectImage, ProjectSection, Technology
from apps.visitors.models import VisitorTracker


class Command(BaseCommand):
    help = 'Create realistic sample data for the portfolio.'

    def handle(self, *args, **options):
        self.clear_existing_data()
        self.seed_profile()
        self.seed_skills()
        self.seed_social_links()
        self.seed_about_highlights()
        self.seed_experience()
        self.seed_education()
        self.seed_testimonials()
        self.seed_contact_info()
        self.seed_contact_messages()
        self.seed_visitors()
        self.seed_technologies()
        self.seed_projects()
        self.stdout.write(self.style.SUCCESS('Sample portfolio data created successfully.'))

    def clear_existing_data(self):
        VisitorTracker.objects.all().delete()
        ContactMessage.objects.all().delete()
        ContactInfo.objects.all().delete()
        Testimonial.objects.all().delete()
        Education.objects.all().delete()
        Experience.objects.all().delete()
        AboutHighlight.objects.all().delete()
        SocialLink.objects.all().delete()
        Skill.objects.all().delete()
        ProjectSection.objects.all().delete()
        ProjectImage.objects.all().delete()
        Project.objects.all().delete()
        Technology.objects.all().delete()
        Profile.objects.all().delete()

    def create_fake_pdf(self, filename):
        content = b'%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF'
        return ContentFile(content, name=filename)

    def create_dummy_image(self, filename, color):
        try:
            from PIL import Image, ImageDraw
        except ImportError:
            return ContentFile(b'placeholder', name=filename)

        image = Image.new('RGB', (1200, 900), color)
        draw = ImageDraw.Draw(image)
        draw.rectangle((80, 80, 1120, 820), outline=(255, 255, 255), width=10)
        draw.text((150, 420), filename.replace('.jpg', '').replace('.png', ''), fill=(255, 255, 255))
        buffer = BytesIO()
        image.save(buffer, format='JPEG')
        return ContentFile(buffer.getvalue(), name=filename)

    def seed_profile(self):
        profile = Profile.objects.create(
            full_name='Umar Hussain',
            role='Full-Stack Developer',
            headline='I build scalable web products with a strong frontend mindset.',
            intro='I am a full-stack developer focused on building clean, maintainable digital products for people and businesses.',
            about='I design and deliver modern web experiences with a balance of usability, performance, and maintainability. My work spans frontend interfaces, backend APIs, and cloud-ready product delivery.',
            mission_quote='Good software makes work easier, clearer, and more human.',
            years_experience=4,
            availability_text='Available for product and web development work',
            is_available=True,
            is_published=True,
            cv_file=self.create_fake_pdf('umar-hussain-cv.pdf'),
        )
        profile.profile_image = self.create_dummy_image('profile.jpg', '#1f2937')
        profile.background_image = self.create_dummy_image('hero-bg.jpg', '#0f172a')
        profile.save()
        self.stdout.write('Profile created.')

    def seed_skills(self):
        skills = [
            'Python', 'Django', 'Django REST Framework', 'React', 'JavaScript', 'TypeScript', 'FastAPI',
            'Tailwind CSS', 'PostgreSQL', 'Docker', 'Git', 'REST APIs', 'Machine Learning',
            'OpenCV', 'YOLO', 'SQL', 'UI/UX', 'AWS', 'Testing'
        ]
        for index, name in enumerate(skills, start=1):
            Skill.objects.create(name=name, sort_order=index, is_active=True)

    def seed_social_links(self):
        links = [
            ('github', 'https://github.com/umarhussain', 1),
            ('linkedin', 'https://www.linkedin.com/in/umarhussain', 2),
            ('twitter', 'https://twitter.com/umarhussain', 3),
            ('facebook', 'https://facebook.com/umarhussain.dev', 4),
            ('instagram', 'https://instagram.com/umarhussain.dev', 5),
        ]
        for platform, url, order in links:
            SocialLink.objects.create(platform=platform, url=url, sort_order=order, is_active=True)

    def seed_about_highlights(self):
        highlights = [
            ('Product Thinking', 'I translate business goals into clear product features and user-focused experiences.', 'sparkles', 1),
            ('Clean Architecture', 'I build backend and frontend systems that are easy to maintain and extend over time.', 'layers', 2),
            ('Focused Execution', 'I manage the full delivery cycle from planning, implementation, and testing to deployment.', 'rocket', 3),
        ]
        for title, description, icon_name, order in highlights:
            AboutHighlight.objects.create(title=title, description=description, icon_name=icon_name, sort_order=order)

    def seed_experience(self):
        Experience.objects.create(
            period='2023 - Present',
            role='Full-Stack Developer',
            company='Freelance / Remote',
            description='Building client-facing web apps, internal dashboards, and portfolio systems using Django, React, and cloud-friendly deployment workflows.',
            current=True,
            sort_order=1,
            is_active=True,
        )
        Experience.objects.create(
            period='2021 - 2023',
            role='Frontend Developer',
            company='Startup Studio',
            description='Worked with product teams to build responsive interfaces, improve UX polish, and connect frontend flows to backend APIs.',
            current=False,
            sort_order=2,
            is_active=True,
        )
        Experience.objects.create(
            period='2019 - 2021',
            role='Python Developer',
            company='Digital Product House',
            description='Built internal automation, backend APIs, and data-driven tools for business teams with a focus on clean and maintainable code.',
            current=False,
            sort_order=3,
            is_active=True,
        )

    def seed_education(self):
        Education.objects.create(
            institution='University of Engineering and Technology',
            degree='BSc Computer Science',
            description='Focused on software engineering, database systems, and human-centered product design.',
            start_date='2016-09-01',
            end_date='2020-06-30',
            sort_order=1,
            is_active=True,
        )
        Education.objects.create(
            institution='Government College University',
            degree='Intermediate in Computer Science',
            description='Built a strong foundation in mathematics, computing fundamentals, and analytical problem solving.',
            start_date='2014-08-01',
            end_date='2016-06-30',
            sort_order=2,
            is_active=True,
        )

    def seed_testimonials(self):
        Testimonial.objects.create(
            quote='Umar combines strong technical execution with thoughtful product sense. The result is software that looks polished and feels easy to use.',
            author='Ayesha Khan',
            role='Product Manager',
            sort_order=1,
            is_active=True,
        )
        Testimonial.objects.create(
            quote='He is quick to understand the problem, communicate clearly, and ship quality work without unnecessary complexity.',
            author='Saad Ahmed',
            role='Startup Founder',
            sort_order=2,
            is_active=True,
        )
        Testimonial.objects.create(
            quote='Reliable, collaborative, and very thoughtful about the engineering decisions behind the product. His work consistently feels production-ready.',
            author='Hina Farooq',
            role='Engineering Lead',
            sort_order=3,
            is_active=True,
        )

    def seed_contact_info(self):
        ContactInfo.objects.create(
            email='hello@umarhussain.dev',
            phone='+92 300 1234567',
            location='Lahore, Pakistan',
            availability_text='Open to freelance, contract, and product engineering opportunities.',
            is_active=True,
        )

    def seed_contact_messages(self):
        ContactMessage.objects.create(
            name='Maryam Ali',
            email='maryam@example.com',
            subject='Website redesign',
            message='We need a new portfolio and admin dashboard for our team. Please share a timeline and estimate.',
            status='new',
            is_read=False,
        )
        ContactMessage.objects.create(
            name='Hamza Siddiqui',
            email='hamza@example.com',
            subject='Product feature work',
            message='We are planning a customer portal and need help with the dashboard, API, and deployment.',
            status='replied',
            is_read=True,
            admin_notes='Shared proposal and next steps.',
        )
        ContactMessage.objects.create(
            name='Zara Ahmed',
            email='zara@example.com',
            subject='AI automation project',
            message='We are exploring an AI workflow solution for customer support and need guidance on the architecture and timeline.',
            status='new',
            is_read=False,
        )
        ContactMessage.objects.create(
            name='Bilal Khan',
            email='bilal@example.com',
            subject='Freelance backend support',
            message='Our current service is growing quickly and we need someone to review and improve our Django API foundation.',
            status='replied',
            is_read=True,
            admin_notes='Follow-up call scheduled for next week.',
        )
        ContactMessage.objects.create(
            name='Sana Malik',
            email='sana@example.com',
            subject='Collaboration inquiry',
            message='We are building a new product team and would like to discuss potential collaboration on the frontend and backend stack.',
            status='new',
            is_read=False,
        )

    def seed_visitors(self):
        visitor_rows = [
            ('192.168.1.10', '/', 'https://example.com', 'unknown', {'city': 'Lahore', 'country': 'Pakistan'}),
            ('203.0.113.22', '/projects', 'https://linkedin.com', 'denied', {'city': 'Karachi', 'country': 'Pakistan'}),
            ('198.51.100.15', '/projects/e-commerce-admin-console/', 'https://google.com', 'granted', {'city': 'Islamabad', 'country': 'Pakistan'}),
            ('10.0.0.2', '/', 'https://github.com', 'unknown', {'city': 'Rawalpindi', 'country': 'Pakistan'}),
            ('172.16.0.5', '/about', 'https://facebook.com', 'denied', {'city': 'Peshawar', 'country': 'Pakistan'}),
            ('203.0.113.77', '/contact', 'https://example.org', 'prompt', {'city': 'Multan', 'country': 'Pakistan'}),
            ('198.51.100.90', '/', 'https://medium.com', 'granted', {'city': 'Faisalabad', 'country': 'Pakistan'}),
            ('192.0.2.18', '/projects/learning-platform/', 'https://behance.net', 'unknown', {'city': 'Quetta', 'country': 'Pakistan'}),
            ('203.0.113.152', '/projects', 'https://dribbble.com', 'denied', {'city': 'Sialkot', 'country': 'Pakistan'}),
            ('198.51.100.201', '/contact', 'https://upwork.com', 'unknown', {'city': 'Lahore', 'country': 'Pakistan'}),
            ('203.0.113.220', '/', 'https://twitter.com', 'granted', {'city': 'Karachi', 'country': 'Pakistan'}),
            ('192.0.2.55', '/projects/client-portal/', 'https://linkedin.com', 'prompt', {'city': 'Hyderabad', 'country': 'Pakistan'}),
        ]

        for index, (ip_address, path, referrer, permission, location) in enumerate(visitor_rows, start=1):
            VisitorTracker.objects.create(
                ip_address=ip_address,
                user_agent='Mozilla/5.0',
                path=path,
                referrer=referrer,
                gps_permission_status=permission,
                approx_ip_location=location,
            )

    def seed_technologies(self):
        tech_names = [
            'Python', 'Django', 'Django REST Framework', 'React', 'JavaScript', 'TypeScript', 'Tailwind CSS',
            'PostgreSQL', 'MySQL', 'Docker', 'Git', 'GitHub', 'OpenCV', 'YOLO', 'TensorFlow', 'PyTorch',
            'FastAPI', 'LangChain', 'Firebase', 'SQL', 'REST API'
        ]
        for name in tech_names:
            Technology.objects.create(name=name, slug=slugify(name), description=f'{name} used in the project stack.')

    def seed_projects(self):
        project_data = [
            {
                'title': 'E-Commerce Admin Console',
                'slug': 'e-commerce-admin-console',
                'short_description': 'A business dashboard for managing product inventory, small-batch orders, and campaigns.',
                'overview': 'This project helped a retail team bring product operations into one place with faster reporting and cleaner task flows.',
                'description': 'The platform brings product uploads, order tracking, and sales reporting under one interface. It helps the team manage updates without switching between disconnected tools.',
                'features': 'Inventory management\nOrder tracking\nPerformance dashboards\nRole-based access',
                'development_details': 'Built with Django and React\nREST API for product and orders\nResponsive data tables',
                'project_url': 'https://example.com/admin-console',
                'github_url': 'https://github.com/example/ecommerce-admin-console',
                'featured': True,
                'technologies': ['React', 'Django', 'PostgreSQL'],
                'sections': [
                    ('Overview', 'The team had no single source of truth for products, orders, and communication. We consolidated those tasks into one dashboard and helped them move faster.'),
                    ('Solution', 'The system uses a flexible product model, a clean order flow, and a dashboard designed around the real operational tasks of the team.'),
                    ('Results', 'The team cut repeated manual work, improved product visibility, and updated order operations from a single place.'),
                ],
            },
            {
                'title': 'Learning Platform',
                'slug': 'learning-platform',
                'short_description': 'A course platform for learners to browse lessons, track progress, and continue learning from any device.',
                'overview': 'The project focused on making ongoing learning feel structured, motivating, and easy to navigate.',
                'description': 'This learning platform provides a simple system for course access, learner progress tracking, and content organization. It is designed for both students and instructors.',
                'features': 'Course library\nProgress tracking\nLesson checkpoints\nResponsive design',
                'development_details': 'Built for mobile-first learning\nImproved content organization\nDashboard analytics for enrollment flow',
                'project_url': 'https://example.com/learning-platform',
                'github_url': 'https://github.com/example/learning-platform',
                'featured': True,
                'technologies': ['React', 'Django', 'Tailwind CSS'],
                'sections': [
                    ('Challenge', 'Learners needed a clean place that felt motivating and easy to use on mobile devices.'),
                    ('Implementation', 'A structured course catalog, progress state, and mobile-friendly layout made the experience easier to follow.'),
                    ('Outcome', 'The platform made it easier for students to continue learning and for admins to manage course material.'),
                ],
            },
            {
                'title': 'Client Portal',
                'slug': 'client-portal',
                'short_description': 'A secure portal for clients to track projects, documents, and updates in one collaborative space.',
                'overview': 'The portal gave clients a clear view of work in progress while reducing back-and-forth communication.',
                'description': 'This client portal supports project progress updates, file access, and communication history. It reduced the need for long email threads and made updates easier to follow.',
                'features': 'Project overview\nFile center\nStatus updates\nClient messaging',
                'development_details': 'Dashboard design for clarity\nSeamless communication flow\nImproved internal visibility',
                'project_url': 'https://example.com/client-portal',
                'github_url': 'https://github.com/example/client-portal',
                'featured': False,
                'technologies': ['Django', 'REST API', 'PostgreSQL'],
                'sections': [
                    ('Problem', 'The client team had no consistent place to track project updates or shared documents.'),
                    ('Solution', 'We created a portal with up-to-date progress blocks, shared files, and a simple communication timeline.'),
                    ('Impact', 'Working agreements become clearer and client communication improved because updates were centralized.'),
                ],
            },
            {
                'title': 'Analytics Dashboard',
                'slug': 'analytics-dashboard',
                'short_description': 'A reporting dashboard for tracking product metrics, funnel performance, and business KPIs.',
                'overview': 'The dashboard helped the product team understand performance trends quickly and take action sooner.',
                'description': 'The analytics dashboard consolidates metrics from multiple sources into a business-friendly view with clean charts and filters. It makes quick decisions easier for the team.',
                'features': 'KPI overview\nCustom filters\nTrend reporting\nData exports',
                'development_details': 'Designed with business stakeholders in mind\nClear charts and summaries\nClean reporting layout',
                'project_url': 'https://example.com/analytics-dashboard',
                'github_url': 'https://github.com/example/analytics-dashboard',
                'featured': False,
                'technologies': ['React', 'Python', 'SQL'],
                'sections': [
                    ('Challenge', 'The product team was using several disconnected tools and had limited visibility into trends.'),
                    ('Implementation', 'We consolidated key metrics into a single dashboard with filterable reporting and simpler summary views.'),
                    ('Outcome', 'The team saved time on reporting and made more confident decisions based on consistent data.'),
                ],
            },
        ]

        for item in project_data:
            project = Project.objects.create(
                title=item['title'],
                slug=item['slug'],
                short_description=item['short_description'],
                overview=item['overview'],
                description=item['description'],
                features=item['features'],
                development_details=item['development_details'],
                project_url=item['project_url'],
                github_url=item['github_url'],
                featured=item['featured'],
                is_published=True,
                thumbnail_image=self.create_dummy_image(f'{item["slug"]}-thumb.jpg', '#1d4ed8'),
            )

            for tech_name in item['technologies']:
                tech = Technology.objects.filter(name=tech_name).first()
                if tech:
                    project.technologies.add(tech)

            for order, image_name in enumerate([f'{item["slug"]}-1.jpg', f'{item["slug"]}-2.jpg', f'{item["slug"]}-3.jpg', f'{item["slug"]}-4.jpg'], start=1):
                ProjectImage.objects.create(
                    project=project,
                    image=self.create_dummy_image(image_name, '#334155' if order % 2 == 0 else '#0f172a'),
                    title=f'{item["title"]} screenshot {order}',
                    description=f'{item["title"]} detail view {order}. This shows the completed interface and the key task the product supports.',
                    order=order,
                )

            for index, (heading, content) in enumerate(item['sections'], start=1):
                ProjectSection.objects.create(
                    project=project,
                    heading=heading,
                    content=content,
                    image=self.create_dummy_image(f'{item["slug"]}-{index}.jpg', '#0ea5e9' if index % 2 == 0 else '#1f2937'),
                    order=index,
                )

            self.stdout.write(f'Created project: {project.title}')

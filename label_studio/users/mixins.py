from organizations.models import OrganizationMember


class UserMixin:
    @property
    def is_annotator(self):
        return False

    def _project_role(self, project):
        from projects.models import ProjectMember

        member = ProjectMember.objects.filter(project=project, user=self, enabled=True).first()
        return member.role if member else None

    def is_project_annotator(self, project):
        # project creator can always annotate; annotator, reviewer and manager can all annotate
        if getattr(project, 'created_by_id', None) == self.pk:
            return True
        return self._project_role(project) is not None

    def is_project_reviewer(self, project):
        from projects.models import ProjectMember

        if getattr(project, 'created_by_id', None) == self.pk:
            return True
        return self._project_role(project) in {ProjectMember.ROLE_REVIEWER, ProjectMember.ROLE_MANAGER}

    def is_project_manager(self, project):
        from projects.models import ProjectMember

        if getattr(project, 'created_by_id', None) == self.pk:
            return True
        return self._project_role(project) == ProjectMember.ROLE_MANAGER

    def can_annotate(self, project):
        # Backward-compatible: a project with no explicit members stays open to every
        # organization member. Once members are configured, only annotator/reviewer/
        # manager members may annotate.
        from projects.models import ProjectMember

        if not ProjectMember.objects.filter(project=project).exists():
            return True
        return self.is_project_annotator(project)

    def can_review(self, project):
        from projects.models import ProjectMember

        if not ProjectMember.objects.filter(project=project).exists():
            return True
        return self.is_project_reviewer(project)

    @property
    def is_view_only(self):
        return False

    def has_permission(self, user):
        return OrganizationMember.objects.filter(
            user=user, organization=user.active_organization, deleted_at__isnull=True
        ).exists()

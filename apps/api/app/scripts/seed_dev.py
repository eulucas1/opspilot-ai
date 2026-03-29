from uuid import UUID

from app.db.session import SessionLocal
from app.models.organization import Organization
from app.models.user import User

DEMO_ORG_ID = UUID("11111111-1111-1111-1111-111111111111")
DEMO_USER_ID = UUID("22222222-2222-2222-2222-222222222222")

DEMO_ORG_NAME = "OpsPilot Demo Org"
DEMO_ORG_SLUG = "opspilot-demo-org"
DEMO_USER_NAME = "Lucas Demo"
DEMO_USER_EMAIL = "lucas@example.com"
DEMO_USER_ROLE = "admin"


def seed_development_data() -> tuple[bool, bool]:
    with SessionLocal() as session:
        organization = session.get(Organization, DEMO_ORG_ID)
        created_organization = organization is None

        if organization is None:
            organization = Organization(id=DEMO_ORG_ID)
            session.add(organization)

        organization.name = DEMO_ORG_NAME
        organization.slug = DEMO_ORG_SLUG

        user = session.get(User, DEMO_USER_ID)
        created_user = user is None

        if user is None:
            user = User(id=DEMO_USER_ID)
            session.add(user)

        user.organization_id = DEMO_ORG_ID
        user.name = DEMO_USER_NAME
        user.email = DEMO_USER_EMAIL
        user.role = DEMO_USER_ROLE
        user.is_active = True

        session.commit()

    return created_organization, created_user


def main() -> int:
    created_organization, created_user = seed_development_data()

    organization_status = "created" if created_organization else "already existed"
    user_status = "created" if created_user else "already existed"

    print(f"Organization {organization_status}: {DEMO_ORG_ID} ({DEMO_ORG_SLUG})")
    print(f"User {user_status}: {DEMO_USER_ID} ({DEMO_USER_EMAIL})")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

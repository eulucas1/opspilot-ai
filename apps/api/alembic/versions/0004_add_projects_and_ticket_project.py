"""Add projects and ticket project relation.

Revision ID: 0004_add_projects_ticket
Revises: 0003_add_ticket_assignee
Create Date: 2026-04-13 00:00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0004_add_projects_ticket"
down_revision: Union[str, None] = "0003_add_ticket_assignee"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("organization_id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("key", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("organization_id", "slug", name="uq_projects_organization_slug"),
        sa.UniqueConstraint("organization_id", "key", name="uq_projects_organization_key"),
    )
    op.create_index(op.f("ix_projects_organization_id"), "projects", ["organization_id"], unique=False)

    op.add_column("tickets", sa.Column("project_id", sa.UUID(), nullable=True))
    op.create_foreign_key(
        op.f("fk_tickets_project_id_projects"),
        "tickets",
        "projects",
        ["project_id"],
        ["id"],
    )
    op.create_index(op.f("ix_tickets_project_id"), "tickets", ["project_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_tickets_project_id"), table_name="tickets")
    op.drop_constraint(op.f("fk_tickets_project_id_projects"), "tickets", type_="foreignkey")
    op.drop_column("tickets", "project_id")

    op.drop_index(op.f("ix_projects_organization_id"), table_name="projects")
    op.drop_table("projects")

"""Add assignee_user_id to tickets.

Revision ID: 0003_add_ticket_assignee
Revises: 0002_add_comments
Create Date: 2026-03-28 00:00:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0003_add_ticket_assignee"
down_revision: Union[str, None] = "0002_add_comments"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("tickets", sa.Column("assignee_user_id", sa.UUID(), nullable=True))
    op.create_foreign_key(
        op.f("fk_tickets_assignee_user_id_users"),
        "tickets",
        "users",
        ["assignee_user_id"],
        ["id"],
    )
    op.create_index(op.f("ix_tickets_assignee_user_id"), "tickets", ["assignee_user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_tickets_assignee_user_id"), table_name="tickets")
    op.drop_constraint(op.f("fk_tickets_assignee_user_id_users"), "tickets", type_="foreignkey")
    op.drop_column("tickets", "assignee_user_id")

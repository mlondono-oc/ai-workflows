from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from backend.auth.deps import get_bearer_token
from backend.projects.schemas import ProjectCreate, ProjectOut, ProjectUpdate
from backend.supabase_client import get_auth_client, get_db_client

router = APIRouter()


@router.get("", response_model=list[ProjectOut])
def list_projects(token: Annotated[str, Depends(get_bearer_token)]) -> list[ProjectOut]:
    db = get_db_client(token)
    res = db.table("projects").select("*").execute()
    rows = res.data or []
    return [ProjectOut.model_validate(r) for r in rows]


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    body: ProjectCreate,
    token: Annotated[str, Depends(get_bearer_token)],
) -> ProjectOut:
    supabase = get_auth_client()
    user_res = supabase.auth.get_user(token)
    if user_res is None or user_res.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    owner_id = str(user_res.user.id)
    db = get_db_client(token)
    row = {
        "owner_id": owner_id,
        "name": body.name,
        "description": body.description,
    }
    res = db.table("projects").insert(row).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create project",
        )
    return ProjectOut.model_validate(res.data[0])


@router.patch("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: UUID,
    body: ProjectUpdate,
    token: Annotated[str, Depends(get_bearer_token)],
) -> ProjectOut:
    updates = body.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No fields to update",
        )
    db = get_db_client(token)
    res = db.table("projects").update(updates).eq("id", str(project_id)).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        )
    return ProjectOut.model_validate(res.data[0])


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: UUID,
    token: Annotated[str, Depends(get_bearer_token)],
) -> None:
    db = get_db_client(token)
    res = db.table("projects").delete().eq("id", str(project_id)).execute()
    if not res.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden",
        )

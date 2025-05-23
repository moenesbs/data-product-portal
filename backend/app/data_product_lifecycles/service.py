from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.data_product_lifecycles.model import (
    DataProductLifecycle as DataProductLifeCycleModel,
)
from app.data_product_lifecycles.schema_request import (
    DataProductLifeCycleCreate,
    DataProductLifeCycleUpdate,
)
from app.data_product_lifecycles.schema_response import DataProductLifeCyclesGet


class DataProductLifeCycleService:
    def get_data_product_lifecycles(
        self, db: Session
    ) -> list[DataProductLifeCyclesGet]:
        return db.scalars(
            select(DataProductLifeCycleModel).order_by(DataProductLifeCycleModel.name)
        ).all()

    def create_data_product_lifecycle(
        self, data_product_lifecycle: DataProductLifeCycleCreate, db: Session
    ) -> dict[str, UUID]:
        data_product_lifecycle = DataProductLifeCycleModel(
            **data_product_lifecycle.parse_pydantic_schema()
        )
        db.add(data_product_lifecycle)
        db.commit()
        return {"id": data_product_lifecycle.id}

    def update_data_product_lifecycle(
        self, id: UUID, data_product_lifecycle: DataProductLifeCycleUpdate, db: Session
    ) -> dict[str, UUID]:
        lifecycle = db.get(DataProductLifeCycleModel, id)
        lifecycle.color = data_product_lifecycle.color
        lifecycle.is_default = data_product_lifecycle.is_default
        lifecycle.name = data_product_lifecycle.name
        lifecycle.value = data_product_lifecycle.value
        db.commit()
        return {"id": id}

    def delete_data_product_lifecycle(self, lifecycle_id: UUID, db: Session) -> None:
        lifecycle = db.get(DataProductLifeCycleModel, lifecycle_id)
        db.delete(lifecycle)
        db.commit()
        return

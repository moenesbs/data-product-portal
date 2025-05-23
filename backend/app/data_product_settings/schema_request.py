from typing import Optional
from uuid import UUID

from app.data_product_settings.enums import (
    DataProductSettingScope,
    DataProductSettingType,
)
from app.data_product_settings.model import (
    DataProductSetting as DataProductSettingModel,
)
from app.data_product_settings.model import (
    DataProductSettingValue as DataProductSettingValueModel,
)
from app.shared.schema import ORMModel


class DataProductSettingCreate(ORMModel):
    category: str
    type: DataProductSettingType
    tooltip: str
    namespace: str
    name: str
    default: str
    order: int = 100
    scope: DataProductSettingScope

    class Meta:
        orm_model = DataProductSettingModel


class DataProductSettingUpdate(DataProductSettingCreate):
    pass


class DataProductSettingValueCreate(ORMModel):
    data_product_id: Optional[UUID] = None
    dataset_id: Optional[UUID] = None
    data_product_setting_id: UUID
    value: str

    class Meta:
        orm_model = DataProductSettingValueModel

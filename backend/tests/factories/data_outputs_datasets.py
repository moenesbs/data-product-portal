import factory
from tests.factories.data_output import DataOutputFactory

from app.data_outputs_datasets.model import DataOutputDatasetAssociation
from app.role_assignments.enums import DecisionStatus

from .dataset import DatasetFactory
from .user import UserFactory


class DataOutputDatasetAssociationFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = DataOutputDatasetAssociation

    id = factory.Faker("uuid4")
    status = DecisionStatus.APPROVED
    data_output = factory.SubFactory(DataOutputFactory)
    dataset = factory.SubFactory(DatasetFactory)
    requested_by = factory.SubFactory(UserFactory)

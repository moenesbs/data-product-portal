import { Flex, Table, type TableColumnsType, type TableProps } from 'antd';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { TABLE_SUBSECTION_PAGINATION } from '@/constants/table.constants';
import { useTablePagination } from '@/hooks/use-table-pagination';
import { getDataProductUsersTableColumns } from '@/pages/data-product/components/data-product-tabs/team-tab/components/team-table/team-table-columns.tsx';
import { useCheckAccessQuery } from '@/store/features/authorization/authorization-api-slice';
import { useGetDataProductByIdQuery } from '@/store/features/data-products/data-products-api-slice.ts';
import { dispatchMessage } from '@/store/features/feedback/utils/dispatch-feedback.ts';
import {
    useDeleteRoleAssignmentMutation,
    useUpdateRoleAssignmentMutation,
} from '@/store/features/role-assignments/data-product-roles-api-slice';
import { AuthorizationAction } from '@/types/authorization/rbac-actions';
import type { RoleContract } from '@/types/roles';
import type { RoleAssignmentContract } from '@/types/roles/role.contract';
import { usePendingActionHandlers } from '@/utils/pending-request.helper';

import styles from './team-table.module.scss';

type Props = {
    dataProductId: string;
    dataProductUsers: RoleAssignmentContract[];
};
export function TeamTable({ dataProductId, dataProductUsers }: Props) {
    const { t } = useTranslation();
    const { data: dataProduct, isLoading: isLoadingDataProduct } = useGetDataProductByIdQuery(dataProductId);
    const [deleteRoleAssignment, { isLoading: isRemovingUserFromDataProduct }] = useDeleteRoleAssignmentMutation();
    const [updateRoleAssignment] = useUpdateRoleAssignmentMutation();

    const { handleGrantAccessToDataProduct, handleDenyAccessToDataProduct } = usePendingActionHandlers();

    const { data: edit_access } = useCheckAccessQuery(
        {
            resource: dataProductId,
            action: AuthorizationAction.DATA_PRODUCT__UPDATE_USER,
        },
        { skip: !dataProductId },
    );
    const { data: approve_access } = useCheckAccessQuery(
        {
            resource: dataProductId,
            action: AuthorizationAction.DATA_PRODUCT__APPROVE_USER_REQUEST,
        },
        { skip: !dataProductId },
    );
    const { data: remove_access } = useCheckAccessQuery(
        {
            resource: dataProductId,
            action: AuthorizationAction.DATA_PRODUCT__DELETE_USER,
        },
        { skip: !dataProductId },
    );

    const canApproveUser = approve_access?.allowed || false;
    const canEditUser = edit_access?.allowed || false;
    const canRemoveUser = remove_access?.allowed || false;

    const { pagination, handlePaginationChange, resetPagination } = useTablePagination({
        initialPagination: TABLE_SUBSECTION_PAGINATION,
    });

    const onChange: TableProps<RoleAssignmentContract>['onChange'] = (pagination) => {
        handlePaginationChange(pagination);
    };

    useEffect(() => {
        resetPagination();
    }, [dataProductUsers, resetPagination]);

    const handleRemoveUserAccess = useCallback(
        async (id: string) => {
            try {
                if (!dataProduct) return;

                console.log('Going to run the deletion');
                console.log('ID object:', id);
                await deleteRoleAssignment({ role_assignment_id: id, data_product_id: dataProduct.id }).unwrap();
                console.log('Deletion done');
                dispatchMessage({ content: t('User access to data product has been removed'), type: 'success' });
            } catch (_error) {
                dispatchMessage({ content: t('Failed to remove user access'), type: 'error' });
            }
        },
        [dataProduct, deleteRoleAssignment, t],
    );

    const handleRoleChange = useCallback(
        async (role: RoleContract, assignmentId: string) => {
            if (!dataProduct) return;
            try {
                await updateRoleAssignment({
                    role_assignment_id: assignmentId,
                    role_id: role.id,
                    data_product_id: dataProduct.id,
                }).unwrap();
                dispatchMessage({ content: t('User role has been updated'), type: 'success' });
            } catch (_error) {
                console.log(_error);
                dispatchMessage({ content: t('Failed to update user role'), type: 'error' });
            }
        },
        [dataProduct, t, updateRoleAssignment],
    );

    const handleRejectMembership = useCallback(
        async (id: string) => {
            if (!dataProduct) return;
            await handleDenyAccessToDataProduct({ assignment_id: id, data_product_id: dataProduct.id });
        },
        [dataProduct, handleDenyAccessToDataProduct],
    );

    const handleAcceptMembership = useCallback(
        async (id: string) => {
            if (!dataProduct) return;
            await handleGrantAccessToDataProduct({ assignment_id: id, data_product_id: dataProduct.id });
        },
        [dataProduct, handleGrantAccessToDataProduct],
    );

    const columns: TableColumnsType<RoleAssignmentContract> = useMemo(() => {
        return getDataProductUsersTableColumns({
            t,
            dataProductUsers: dataProductUsers,
            onRemoveUserAccess: handleRemoveUserAccess,
            onRejectAccessRequest: handleRejectMembership,
            onAcceptAccessRequest: handleAcceptMembership,
            onRoleChange: handleRoleChange,
            isRemovingUser: isRemovingUserFromDataProduct,
            isLoading: isLoadingDataProduct,
            canEdit: canEditUser,
            canRemove: canRemoveUser,
            canApprove: canApproveUser,
        });
    }, [
        t,
        handleRemoveUserAccess,
        handleRoleChange,
        isRemovingUserFromDataProduct,
        dataProductUsers,
        isLoadingDataProduct,
        canEditUser,
        canRemoveUser,
        canApproveUser,
        handleAcceptMembership,
        handleRejectMembership,
    ]);

    if (!dataProduct) return null;

    return (
        <Flex className={styles.teamListContainer}>
            <Table<RoleAssignmentContract>
                loading={isLoadingDataProduct}
                className={styles.teamListTable}
                columns={columns}
                dataSource={dataProductUsers}
                rowKey={({ user }) => user.id}
                onChange={onChange}
                pagination={{
                    ...pagination,
                    position: ['topRight'],
                    size: 'small',
                    showTotal: (total, range) =>
                        t('Showing {{range0}}-{{range1}} of {{total}} team members', {
                            range0: range[0],
                            range1: range[1],
                            total: total,
                        }),
                    className: styles.pagination,
                }}
                rowClassName={styles.tableRow}
                size={'small'}
            />
        </Flex>
    );
}

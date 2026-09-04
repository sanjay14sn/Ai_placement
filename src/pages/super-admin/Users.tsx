import React from 'react';
import { PageWrapper } from '../../layouts';
import { Card } from '../../components/ui';
export const SuperAdminUsersPage: React.FC = () => (
  <PageWrapper title="Users" breadcrumbs={[{label:'Super Admin'},{label:'Users'}]}>
    <Card><div className="p-8 text-center text-slate-500">Super Admin Users content</div></Card>
  </PageWrapper>
);

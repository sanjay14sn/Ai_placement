import React from 'react';
import { PageWrapper } from '../../layouts';
import { Card } from '../../components/ui';
export const CollegeReportsPage: React.FC = () => (
  <PageWrapper title="Reports" breadcrumbs={[{label:'College'},{label:'Reports'}]}>
    <Card><div className="p-8 text-center text-slate-500">College Reports content</div></Card>
  </PageWrapper>
);

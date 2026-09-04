import React from 'react';
import { PageWrapper } from '../../layouts';
import { Card } from '../../components/ui';
export const CollegeSettingsPage: React.FC = () => (
  <PageWrapper title="Settings" breadcrumbs={[{label:'College'},{label:'Settings'}]}>
    <Card><div className="p-8 text-center text-slate-500">College Settings content</div></Card>
  </PageWrapper>
);

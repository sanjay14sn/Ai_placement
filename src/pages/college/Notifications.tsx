import React from 'react';
import { PageWrapper } from '../../layouts';
import { Card } from '../../components/ui';
export const CollegeNotificationsPage: React.FC = () => (
  <PageWrapper title="Notifications" breadcrumbs={[{label:'College'},{label:'Notifications'}]}>
    <Card><div className="p-8 text-center text-slate-500">College Notifications content</div></Card>
  </PageWrapper>
);

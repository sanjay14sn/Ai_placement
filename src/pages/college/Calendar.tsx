import React from 'react';
import { PageWrapper } from '../../layouts';
import { Card } from '../../components/ui';
export const CollegeCalendarPage: React.FC = () => (
  <PageWrapper title="Calendar" breadcrumbs={[{label:'College'},{label:'Calendar'}]}>
    <Card><div className="p-8 text-center text-slate-500">College Calendar content</div></Card>
  </PageWrapper>
);

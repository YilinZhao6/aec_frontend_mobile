import React from 'react';
import MainLayout from '../../components/Layout/MainLayout';
import './ReportBugPage.css';

const ReportBugPage = () => {
  return (
    <MainLayout>
      <div className="report-bug-container">
        <div className="report-bug-content">
          <iframe
            src="https://tally.so/embed/mVxlYE"
            width="100%"
            height="100%"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="Report a Bug"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportBugPage;
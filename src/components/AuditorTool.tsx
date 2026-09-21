import React from 'react';
import { TrackingAuditor, TrackingAuditorProps } from './TrackingAuditor';

export interface AuditorToolProps extends TrackingAuditorProps {}

export const AuditorTool: React.FC<AuditorToolProps> = (props) => {
  return <TrackingAuditor {...props} />;
};

export default AuditorTool;
